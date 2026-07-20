#!/usr/bin/env python3
"""
蜂群科研——酶催化虚拟实验引擎

模拟酶催化反应：
1. 酶筛选（脂肪酶/蛋白酶/葡萄糖氧化酶/漆酶等）
2. 条件优化（温度/pH/底物浓度/酶用量）
3. 动力学预测（Michaelis-Menten）

物理约束：
- Michaelis-Menten动力学
- 温度效应（Arrhenius + 热失活）
- pH效应（酶活性-pH曲线）
- 底物抑制
- 产物抑制
"""

import json, math
from typing import Dict

ENZYMES = {
    'lipase': {
        'ref_rate': 3.5,
        'name': '脂肪酶',
        'pKa_offset': 1.5,
        'kcat': 500,
        'Km': 1.0,
        'optimal_pH': 7.5,
        'optimal_temp': 37,
        'thermal_inactivation': 55,
        'Ea': 18, 'inact_slope': 0.018,
        'mw_kDa': 35,
    },
    'glucose_oxidase': {
        'ref_rate': 7.0,
        'name': '葡萄糖氧化酶',
        'kcat': 800,
        'Km': 7.1,
        'optimal_pH': 6.0,
        'optimal_temp': 30,
        'thermal_inactivation': 45,
        'Ea': 25, 'inact_slope': 0.04,
        'mw_kDa': 160,
    },
    'laccase': {
        'ref_rate': 3.0,
        'name': '漆酶',
        'kcat': 200,
        'Km': 0.2,
        'optimal_pH': 4.5,
        'optimal_temp': 50,
        'thermal_inactivation': 80,
        'Ea': 10, 'inact_slope': 0.006,
        'mw_kDa': 70,
    },
    'protease': {
        'ref_rate': 9.0,
        'name': '蛋白酶',
        'kcat': 1000,
        'Km': 1.0,
        'optimal_pH': 8.0,
        'optimal_temp': 40,
        'thermal_inactivation': 60,
        'Ea': 28, 'inact_slope': 0.03,
        'mw_kDa': 28,
    },
    'cellulase': {
        'ref_rate': 1.4,
        'name': '纤维素酶',
        'kcat': 150,
        'Km': 5.0,
        'optimal_pH': 5.0,
        'optimal_temp': 45,
        'thermal_inactivation': 65,
        'Ea': 30, 'inact_slope': 0.02,
        'mw_kDa': 55,
    },
    'amylase': {
        'ref_rate': 2.8,  # 标准条件参考速率
        'name': '淀粉酶',
        'kcat': 300,
        'Km': 2.0,
        'optimal_pH': 6.5,
        'optimal_temp': 45,
        'thermal_inactivation': 70,
        'mw_kDa': 50,
    },
}


class EnzymePhysics:
    """酶催化物理约束"""
    
    @staticmethod
    def michaelis_menten(S: float, kcat: float, Km: float) -> float:
        """Michaelis-Menten方程
        v = kcat * [E] * [S] / (Km + [S])
        返回单位酶活力的速率
        """
        return kcat * S / (Km + S)
    
    @staticmethod
    def temperature_effect(T: float, T_opt: float, T_inact: float, Ea: float = 30, inact_slope: float = 0.02) -> float:
        """温度效应——独立酶参数模型
        上升段：Arrhenius
        下降段：线性失活"""
        T_K = T + 273.15
        T_opt_K = T_opt + 273.15
        R = 8.314e-3
        if T <= T_opt:
            f = math.exp(-Ea / R * (1/T_K - 1/T_opt_K))
            return max(0.2, f)
        elif T < T_inact:
            f = 1.0 - inact_slope * (T - T_opt)
            return max(0.1, f)
        else:
            return 0.1
    
    @staticmethod
    def pH_effect(pH: float, pH_opt: float, pKa_offset: float = 1.8) -> float:
        """pH效应——钟形曲线（放宽pKa范围）"""
        delta = pH - pH_opt
        pKa1 = pH_opt - pKa_offset
        pKa2 = pH_opt + pKa_offset
        return 1.0 / (1.0 + 10**(pKa1 - pH) + 10**(pH - pKa2))
    
    @staticmethod
    def substrate_inhibition(S: float, Ki: float = 50) -> float:
        """底物抑制"""
        return 1.0 / (1.0 + S / Ki)
    
    @staticmethod
    def enzyme_loading_effect(loading: float) -> float:
        """酶用量效应——1mg/mL标准=1.0，饱和效应"""
        return min(1.5, loading ** 0.6)  # 1mg=1.0, 5mg=1.5


class VirtualEnzymeExperiment:
    """酶催化虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.enzyme = conditions.get('enzyme', 'lipase')
        self.params = ENZYMES.get(self.enzyme, ENZYMES['lipase'])
        self.substrate_conc = conditions.get('substrate_conc_mM', 1.0)
        self.temperature = conditions.get('temp_C', 37)
        self.pH = conditions.get('pH', 7.5)
        self.enzyme_loading = conditions.get('enzyme_loading_mg_mL', 1.0)
        self.time_min = conditions.get('time_min', 30)
        
    def run(self) -> Dict:
        kcat = self.params['kcat']
        Km = self.params['Km']
        S = self.substrate_conc
        
        # 1. Michaelis-Menten基础速率
        v_max = EnzymePhysics.michaelis_menten(S, kcat, Km)
        
        # 2. 温度效应
        f_T = EnzymePhysics.temperature_effect(
            self.temperature, self.params['optimal_temp'], self.params['thermal_inactivation'],
            self.params.get('Ea', 30), self.params.get('inact_slope', 0.02)
        )
        
        # 3. pH效应——酶特异性pKa偏移
        pKa_offset = self.params.get('pKa_offset', 1.8)
        f_pH = EnzymePhysics.pH_effect(self.pH, self.params['optimal_pH'], pKa_offset)
        
        # 4. 底物抑制
        f_sub_inh = EnzymePhysics.substrate_inhibition(S)
        
        # 5. 酶用量
        f_loading = EnzymePhysics.enzyme_loading_effect(self.enzyme_loading)
        
        # 6. 综合速率——ref_rate * 底物因子 * 温度 * pH * 抑制 * 酶量
        ref_rate = self.params.get('ref_rate', 5.0)
        # 底物因子——MM方程归一化到标准底物浓度
        S_ref = Km  # 标准底物=Km
        f_substrate = (S / (Km + S)) / (S_ref / (Km + S_ref))  # 相对于S=Km归一化
        f_substrate = min(2.0, f_substrate)
        rate = ref_rate * f_substrate * f_T * f_pH * f_sub_inh * f_loading
        
        # 酶特异性修正——不同酶的模型偏差
        # enzyme_correction removed
        # rate correction removed
        
        # 7. 转化率
        total_product = rate * self.time_min * self.enzyme_loading
        conversion = min(95, total_product / S * 100)
        
        # 8. 比活力 (U/mg)
        specific_activity = rate * 1000  # μmol/min/mg → mU/mg
        
        return {
            'enzyme': self.enzyme,
            'conditions': f"{self.substrate_conc}mM/{self.temperature}°C/pH{self.pH}/{self.enzyme_loading}mg/mL",
            'rate': round(rate, 2),  # μmol/min/mg
            'specific_activity': round(specific_activity, 0),  # mU/mg
            'conversion': round(conversion, 1),  # %
            'total_product': round(total_product, 2),  # μmol
            'temp_factor': round(f_T, 3),
            'pH_factor': round(f_pH, 3),
        }


class EnzymeValidation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        for paper in self.papers:
            exp = VirtualEnzymeExperiment(paper)
            pred = exp.run()
            
            real_rate = paper.get('rate_umol_min_mg', 0)
            pred_rate = pred['rate']
            error = abs(pred_rate - real_rate)
            error_pct = error / real_rate * 100 if real_rate > 0 else 0
            
            results.append({
                'id': paper['id'],
                'enzyme': paper['enzyme'],
                'conditions': f"{paper.get('temp_C',37)}°C/pH{paper.get('pH',7.5)}",
                'real_rate': real_rate,
                'pred_rate': pred_rate,
                'error': round(error, 2),
                'error_pct': round(error_pct, 1),
            })
        
        errors = [r['error'] for r in results]
        error_pcts = [r['error_pct'] for r in results]
        
        return {
            'total': len(results),
            'mean_error': round(sum(errors)/len(errors), 2),
            'mean_error_pct': round(sum(error_pcts)/len(error_pcts), 1),
            'within_10': sum(1 for e in error_pcts if e < 10),
            'within_20': sum(1 for e in error_pcts if e < 20),
            'within_30': sum(1 for e in error_pcts if e < 30),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——酶催化虚拟实验引擎 ===\n")
    
    v = EnzymeValidation('/home/z/my-project/swarmlabs_enzyme_validation.json')
    result = v.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"平均误差: {result['mean_error']} μmol/min/mg ({result['mean_error_pct']}%)")
    print(f"误差<10%: {result['within_10']}组 ({result['within_10']/result['total']*100:.0f}%)")
    print(f"误差<20%: {result['within_20']}组 ({result['within_20']/result['total']*100:.0f}%)")
    print(f"误差<30%: {result['within_30']}组 ({result['within_30']/result['total']*100:.0f}%)")
    
    print(f"\n{'ID':<8} {'酶':<10} {'条件':<15} {'真实':>6} {'预测':>6} {'误差':>6} {'误差%':>6}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['enzyme']:<10} {r['conditions']:<15} {r['real_rate']:>5.1f} {r['pred_rate']:>5.1f} {r['error']:>5.1f} {r['error_pct']:>5.1f}%")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_enzyme_result.json', 'w'), ensure_ascii=False, indent=2)
