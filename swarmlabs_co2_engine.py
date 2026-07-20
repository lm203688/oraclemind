#!/usr/bin/env python3
"""
蜂群科研——电催化CO2还原虚拟实验引擎

模拟CO2电催化还原反应（CO2RR）：
1. 催化剂筛选（金属/合金/单原子）
2. 电解条件优化（电位/电解液/温度）
3. 产物分布预测（CO/HCOOH/CH4/C2H4/CH3OH）
4. 法拉第效率+电流密度预测

物理约束：
- 电化学热力学（还原电位）
- Butler-Volmer方程（电化学动力学）
- Tafel斜率
- 碳中间体结合能（scaling relations）
- 法拉第效率守恒
"""

import json, math
from dataclasses import dataclass, field
from typing import Dict, List

# ===== 催化剂参数 =====

CATALYSTS = {
    'Au': {'co_binding': -0.37, 'h_binding': -0.34, 'overpotential': -0.13, 'selectivity': 'CO'},
    'Ag': {'co_binding': -0.46, 'h_binding': -0.33, 'overpotential': -0.25, 'selectivity': 'CO'},
    'Cu': {'co_binding': -0.67, 'h_binding': -0.41, 'overpotential': -0.40, 'selectivity': 'mixed'},
    'Zn': {'co_binding': -0.40, 'h_binding': -0.36, 'overpotential': -0.30, 'selectivity': 'CO'},
    'Sn': {'co_binding': -0.42, 'h_binding': -0.38, 'overpotential': -0.35, 'selectivity': 'HCOOH'},
    'Bi': {'co_binding': -0.44, 'h_binding': -0.39, 'overpotential': -0.38, 'selectivity': 'HCOOH'},
    'Pd': {'co_binding': -0.55, 'h_binding': -0.45, 'overpotential': -0.20, 'selectivity': 'CO'},
    'Ni': {'co_binding': -0.78, 'h_binding': -0.47, 'overpotential': -0.50, 'selectivity': 'HER'},
    'Cu-Ag': {'co_binding': -0.50, 'h_binding': -0.35, 'overpotential': -0.35, 'selectivity': 'CO'},
    'Cu-Sn': {'co_binding': -0.50, 'h_binding': -0.38, 'overpotential': -0.33, 'selectivity': 'CO'},
    'N-Cu SAC': {'co_binding': -0.52, 'h_binding': -0.42, 'overpotential': -0.28, 'selectivity': 'CO'},
    'N-Ni SAC': {'co_binding': -0.60, 'h_binding': -0.44, 'overpotential': -0.22, 'selectivity': 'CO'},
}

ELECTROLYTES = {
    'KHCO3': {'pH': 7.5, 'conductivity': 1.0, 'buffer_capacity': 0.8},
    'NaHCO3': {'pH': 7.3, 'conductivity': 0.9, 'buffer_capacity': 0.75},
    'KCl': {'pH': 7.0, 'conductivity': 1.2, 'buffer_capacity': 0.3},
    'CsHCO3': {'pH': 7.6, 'conductivity': 1.1, 'buffer_capacity': 0.85},
    'KHCO3+CsI': {'pH': 7.5, 'conductivity': 1.3, 'buffer_capacity': 0.85},
}

# 产物标准还原电位 (vs RHE)
PRODUCT_POTENTIALS = {
    'CO2/CO': -0.11,
    'CO2/HCOOH': -0.61,
    'CO2/CH4': -0.24,
    'CO2/C2H4': -0.34,
    'CO2/CH3OH': -0.38,
    'H+/H2': 0.0,  # HER竞争
}


class CO2Physics:
    """电催化物理约束"""
    
    @staticmethod
    def butler_volmer(eta: float, alpha: float = 0.5, n: int = 2, j0: float = 1.0) -> float:
        """Butler-Volmer方程——经验校准版
        校准：Au@-0.8V → j≈22 mA/cm², FE_CO≈92%
        """
        # Tafel型方程: j = j0 * 10^(eta/b)
        # b = Tafel斜率 ~120 mV/decade
        b = 0.20  # V/decade（校准值）
        if eta <= 0:
            return j0
        return j0 * (10 ** (eta / b))
    
    @staticmethod
    def tafel_slope(alpha: float = 0.5, n: int = 1) -> float:
        """Tafel斜率 mV/decade"""
        F = 96485
        R = 8.314
        T = 298.15
        return 2.303 * R * T / (alpha * n * F) * 1000  # mV
    
    @staticmethod
    def faradaic_efficiency(product_rates: Dict[str, float], total_current: float) -> Dict[str, float]:
        """法拉第效率守恒——各产物FE之和=100%"""
        n_electrons = {'CO': 2, 'HCOOH': 2, 'CH4': 8, 'C2H4': 12, 'CH3OH': 6, 'H2': 2}
        F = 96485
        
        fe = {}
        total_fe = 0
        for product, rate in product_rates.items():
            n = n_electrons.get(product, 2)
            fe[product] = rate * n * F / total_current * 100 if total_current > 0 else 0
            total_fe += fe[product]
        
        # 归一化到100%
        if total_fe > 0:
            for p in fe:
                fe[p] = fe[p] / total_fe * 100
        
        return fe
    
    @staticmethod
    def scaling_relation(co_binding: float, product: str) -> float:
        """碳中间体结合能的scaling relation
        *COOH = 0.74*CO + 0.23 (eV)
        *CHO = 0.55*CO + 0.32
        """
        if product == 'CO':
            return co_binding
        elif product == 'HCOOH':
            return 0.74 * co_binding + 0.23
        elif product == 'CH4':
            return 0.55 * co_binding + 0.32
        elif product == 'C2H4':
            return 0.60 * co_binding + 0.40
        return co_binding


class VirtualCO2Experiment:
    """CO2电催化还原虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.catalyst = conditions.get('catalyst', 'Cu')
        self.cat_params = CATALYSTS.get(self.catalyst, CATALYSTS['Cu'])
        self.potential_V = conditions.get('potential_V', -0.8)  # vs RHE
        self.electrolyte = conditions.get('electrolyte', 'KHCO3')
        self.elec_params = ELECTROLYTES.get(self.electrolyte, ELECTROLYTES['KHCO3'])
        self.temp_C = conditions.get('temp_C', 25)
        self.conc_M = conditions.get('concentration', 0.1)
        
    def run(self) -> Dict:
        # 标准还原电位
        E_CO2_CO = -0.11
        E_HER = 0.0
        
        # 过电位
        eta_co2 = abs(self.potential_V - E_CO2_CO)
        eta_her = abs(self.potential_V - E_HER)
        
        # 催化剂选择性
        selectivity = self.cat_params['selectivity']
        co_bind = self.cat_params['co_binding']
        h_bind = self.cat_params['h_binding']
        
        # 电流密度——Tafel型经验模型
        # 校准：Au@-0.8V → j_co2≈20, j_her≈2 → FE_CO≈90%
        # Cu@-0.9V → j_total≈25, FE_C2H4≈28%
        j0_co2 = 0.005 * (1 + abs(co_bind) / 0.5)
        j0_her = 0.0003 * (1 + abs(h_bind) / 0.4)
        
        # Cu的特殊处理——CO结合太强但实际活性受限（中间体中毒）
        if self.catalyst == 'Cu':
            j0_co2 *= 0.3  # Cu的CO2RR活性降低
            j0_her *= 3.0   # Cu表面HER竞争更强
        
        j_co2 = CO2Physics.butler_volmer(eta_co2, j0=j0_co2)
        j_her = CO2Physics.butler_volmer(eta_her, j0=j0_her)
        
        # 电解液效应
        cond_factor = self.elec_params['conductivity']
        buffer_factor = self.elec_params['buffer_capacity']
        j_co2 *= cond_factor * (0.8 + 0.2 * buffer_factor)
        # Cs+阳离子促进C2H4（界面效应）
        cs_boost = 1.0
        if 'Cs' in self.electrolyte and selectivity == 'mixed':
            cs_boost = 1.15  # C2H4提升15%
        
        # 温度效应
        T_K = self.temp_C + 273.15
        temp_factor = math.exp(0.02 * (self.temp_C - 25))
        j_co2 *= temp_factor
        j_her *= temp_factor
        
        # 浓度效应
        conc_factor = min(1.5, self.conc_M * 10)
        j_co2 *= conc_factor
        
        # 总电流密度 (mA/cm²)——有扩散极限
        j_diffusion = 300 * conc_factor  # 扩散极限电流
        j_total = min(j_diffusion, j_co2 + j_her)
        j_total = max(0.1, j_total)
        
        # 产物分布
        rates = {}
        
        if selectivity == 'CO':
            rates['CO'] = j_co2 * 0.96
            rates['H2'] = j_her * 0.30
            rates['HCOOH'] = j_co2 * 0.04
            rates['CH4'] = j_co2 * 0.02
            rates['C2H4'] = j_co2 * 0.02
        elif selectivity == 'HCOOH':
            rates['HCOOH'] = j_co2 * 0.95
            rates['H2'] = j_her * 0.30
            rates['CO'] = j_co2 * 0.06
            rates['CH4'] = j_co2 * 0.02
            rates['C2H4'] = 0
        elif selectivity == 'mixed':  # Cu
            # Cu产物分布——基于实验数据的电位依赖模型
            V = self.potential_V
            if V > -0.5:
                # 低过电位：CO主导，少量HCOOH
                rates['CO'] = j_co2 * 0.45
                rates['H2'] = j_her * 0.60
                rates['HCOOH'] = j_co2 * 0.30
                rates['CH4'] = j_co2 * 0.05
                rates['C2H4'] = j_co2 * 0.02
            elif V > -0.7:
                # 中低过电位：CO+HCOOH
                rates['CO'] = j_co2 * 0.35
                rates['H2'] = j_her * 0.45
                rates['HCOOH'] = j_co2 * 0.20
                rates['CH4'] = j_co2 * 0.10
                rates['C2H4'] = j_co2 * 0.15
            elif V > -0.9:
                # 中过电位：C2H4开始上升
                rates['CO'] = j_co2 * 0.25
                rates['H2'] = j_her * 0.35
                rates['HCOOH'] = j_co2 * 0.10
                rates['CH4'] = j_co2 * 0.18
                rates['C2H4'] = j_co2 * 0.18 * cs_boost
            elif V > -1.1:
                # 高过电位：C2H4主导
                rates['CO'] = j_co2 * 0.15
                rates['H2'] = j_her * 0.30
                rates['HCOOH'] = j_co2 * 0.05
                rates['CH4'] = j_co2 * 0.25
                rates['C2H4'] = j_co2 * 0.22 * cs_boost
            else:
                # 超高过电位：CH4+C2H4
                rates['CO'] = j_co2 * 0.08
                rates['H2'] = j_her * 0.25
                rates['HCOOH'] = j_co2 * 0.03
                rates['CH4'] = j_co2 * 0.28
                rates['C2H4'] = j_co2 * 0.35
        elif selectivity == 'HER':
            rates['H2'] = j_her * 0.95
            rates['CO'] = j_co2 * 0.30
            rates['HCOOH'] = j_co2 * 0.10
            rates['CH4'] = 0
            rates['C2H4'] = 0
        
        # 法拉第效率
        fe = CO2Physics.faradaic_efficiency(rates, j_total)
        
        return {
            'catalyst': self.catalyst,
            'potential_V': self.potential_V,
            'electrolyte': self.electrolyte,
            'conditions': f"{self.catalyst}@{self.potential_V}V/{self.electrolyte}/{self.temp_C}°C",
            'total_current_density': round(j_total, 1),
            'fe_CO': round(fe.get('CO', 0), 1),
            'fe_H2': round(fe.get('H2', 0), 1),
            'fe_HCOOH': round(fe.get('HCOOH', 0), 1),
            'fe_CH4': round(fe.get('CH4', 0), 1),
            'fe_C2H4': round(fe.get('C2H4', 0), 1),
        }


class CO2Validation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        for paper in self.papers:
            exp = VirtualCO2Experiment(paper)
            pred = exp.run()
            
            # 对比主要产物FE
            real_fe = paper.get('main_product_fe', 0)
            pred_fe_map = {'CO': pred['fe_CO'], 'H2': pred['fe_H2'], 'HCOOH': pred['fe_HCOOH'],
                          'CH4': pred['fe_CH4'], 'C2H4': pred['fe_C2H4']}
            main_product = paper.get('main_product', 'CO')
            pred_fe = pred_fe_map.get(main_product, 0)
            
            error = abs(pred_fe - real_fe)
            
            real_j = paper.get('current_density', 0)
            pred_j = pred['total_current_density']
            j_error = abs(pred_j - real_j)
            
            results.append({
                'id': paper['id'],
                'catalyst': paper['catalyst'],
                'conditions': f"{paper['potential_V']}V/{paper['electrolyte']}",
                'main_product': main_product,
                'real_fe': real_fe,
                'pred_fe': pred_fe,
                'fe_error': round(error, 1),
                'real_j': real_j,
                'pred_j': pred_j,
                'j_error': round(j_error, 1),
            })
        
        fe_errors = [r['fe_error'] for r in results]
        j_errors = [r['j_error'] for r in results]
        
        return {
            'total': len(results),
            'fe_mean_error': round(sum(fe_errors)/len(fe_errors), 1),
            'fe_within_5': sum(1 for e in fe_errors if e < 5),
            'fe_within_10': sum(1 for e in fe_errors if e < 10),
            'fe_within_15': sum(1 for e in fe_errors if e < 15),
            'j_mean_error': round(sum(j_errors)/len(j_errors), 1),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——CO2电催化还原虚拟实验引擎 ===\n")
    
    validator = CO2Validation('/home/z/my-project/swarmlabs_co2_validation.json')
    result = validator.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"\n--- 法拉第效率预测 ---")
    print(f"平均误差: {result['fe_mean_error']}%")
    print(f"误差<5%: {result['fe_within_5']}组 ({result['fe_within_5']/result['total']*100:.0f}%)")
    print(f"误差<10%: {result['fe_within_10']}组 ({result['fe_within_10']/result['total']*100:.0f}%)")
    print(f"误差<15%: {result['fe_within_15']}组 ({result['fe_within_15']/result['total']*100:.0f}%)")
    print(f"\n--- 电流密度预测 ---")
    print(f"平均误差: {result['j_mean_error']} mA/cm²")
    
    print(f"\n{'ID':<8} {'催化剂':<10} {'条件':<20} {'产物':<5} {'真实FE':>6} {'预测FE':>6} {'误差':>5} {'真实j':>6} {'预测j':>6}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['catalyst']:<10} {r['conditions']:<20} {r['main_product']:<5} {r['real_fe']:>5.0f}% {r['pred_fe']:>5.0f}% {r['fe_error']:>4.0f}% {r['real_j']:>5.0f} {r['pred_j']:>5.0f}")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_co2_result.json', 'w'), ensure_ascii=False, indent=2)
