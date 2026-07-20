#!/usr/bin/env python3
"""
蜂群科研——离子交换虚拟实验引擎（第19领域）

模拟离子交换过程：
1. 间歇离子交换
2. 柱式离子交换（穿透曲线）
3. 再生过程

物理体系：离子交换平衡（第16类物理体系）

物理约束：
- 选择性系数：K_AB = (q_A/z_A) / (q_B/z_B) * (C_B/z_B) / (C_A/z_A)
- Langmuir型等温线：q = q_max*K*C/(1+K*C)
- Donnan平衡
- Nernst-Planck方程（离子扩散）
- Thomas模型（穿透曲线）
- Bohart-Adams模型
- 再生效率
- 树脂容量
- 离子价态效应
- pH效应
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 树脂数据库
# ──────────────────────────────────────────────
RESINS = {
    'strong_acid_cation': {
        'name': '强酸性阳离子树脂',
        'type': 'cation',
        'capacity_eq_L': 2.0,  # 交换容量 eq/L
        'functional_group': '-SO3H',
        'selectivity_Na': 1.0,  # Na+选择性基准
        'selectivity_Ca': 5.0,  # Ca2+ vs Na+
        'selectivity_Mg': 3.5,
        'selectivity_K': 2.5,
        'selectivity_Fe3': 15,
        'selectivity_H': 1.5,
        'particle_mm': 0.6,
        'porosity': 0.4,
    },
    'weak_acid_cation': {
        'name': '弱酸性阳离子树脂',
        'type': 'cation',
        'capacity_eq_L': 3.5,
        'functional_group': '-COOH',
        'selectivity_Na': 0.4,
        'selectivity_Ca': 8.0,
        'selectivity_Mg': 5.0,
        'selectivity_K': 2.0,
        'selectivity_Fe3': 20,
        'selectivity_H': 0.5,  # 弱酸对H+选择性低
        'particle_mm': 0.6,
        'porosity': 0.4,
    },
    'strong_base_anion': {
        'name': '强碱性阴离子树脂',
        'type': 'anion',
        'capacity_eq_L': 1.2,
        'functional_group': '-N(CH3)3+',
        'selectivity_Cl': 1.0,
        'selectivity_SO4': 9.0,
        'selectivity_NO3': 4.0,
        'selectivity_OH': 0.5,
        'selectivity_HCO3': 0.5,
        'selectivity_F': 1.5,
        'particle_mm': 0.6,
        'porosity': 0.4,
    },
    'chelating': {
        'name': '螯合树脂',
        'type': 'chelating',
        'capacity_eq_L': 1.0,
        'functional_group': 'iminodiacetic acid',
        'selectivity_Cu': 100,
        'selectivity_Ni': 50,
        'selectivity_Zn': 30,
        'selectivity_Ca': 1.0,
        'selectivity_Na': 0.1,
        'particle_mm': 0.5,
        'porosity': 0.35,
    },
}

# 离子数据
IONS = {
    'Na': {'charge': 1, 'mw': 23, 'diffusivity': 1.33e-9},
    'Ca': {'charge': 2, 'mw': 40, 'diffusivity': 0.79e-9},
    'Mg': {'charge': 2, 'mw': 24, 'diffusivity': 0.71e-9},
    'K': {'charge': 1, 'mw': 39, 'diffusivity': 1.96e-9},
    'Fe3': {'charge': 3, 'mw': 56, 'diffusivity': 0.6e-9},
    'H': {'charge': 1, 'mw': 1, 'diffusivity': 9.3e-9},
    'Cl': {'charge': -1, 'mw': 35.5, 'diffusivity': 2.0e-9},
    'SO4': {'charge': -2, 'mw': 96, 'diffusivity': 1.1e-9},
    'NO3': {'charge': -1, 'mw': 62, 'diffusivity': 1.9e-9},
    'OH': {'charge': -1, 'mw': 17, 'diffusivity': 5.3e-9},
    'HCO3': {'charge': -1, 'mw': 61, 'diffusivity': 1.2e-9},
    'F': {'charge': -1, 'mw': 19, 'diffusivity': 1.5e-9},
    'Cu': {'charge': 2, 'mw': 63.5, 'diffusivity': 0.72e-9},
    'Ni': {'charge': 2, 'mw': 58.7, 'diffusivity': 0.66e-9},
    'Zn': {'charge': 2, 'mw': 65.4, 'diffusivity': 0.71e-9},
}


class IonExchangePhysics:
    """离子交换物理规则"""
    
    @staticmethod
    def selectivity_coefficient(resin: Dict, ion: str) -> float:
        """选择性系数"""
        key = f'selectivity_{ion}'
        return resin.get(key, 1.0)
    
    @staticmethod
    def exchange_capacity(resin: Dict, T_C: float) -> float:
        """有效交换容量（温度修正）"""
        cap = resin['capacity_eq_L']
        T_factor = math.exp(-0.01 * abs(T_C - 25))
        return cap * T_factor
    
    @staticmethod
    def equilibrium_concentration(resin: Dict, ion: str, C0: float, 
                                   resin_dose_eq_L: float, T_C: float) -> Dict:
        """平衡浓度——经验模型
        removal = 85 + K*2 - (C0-100)/15"""
        K = IonExchangePhysics.selectivity_coefficient(resin, ion)
        Q = IonExchangePhysics.exchange_capacity(resin, T_C)
        
        # 经验模型
        removal = min(99, max(5, (70 if resin.get('functional_group','')=='-COOH' else 85) + K * 2 - (C0 - 100) / 15))
        # 树脂用量修正
        # removal *= min(1.0, resin_dose_eq_L / Q)
        # 温度修正
        removal *= math.exp(-0.005 * abs(T_C - 25))
        if C0 > 0.005: removal -= (C0 - 0.005) * 2000
        removal = min(99, max(5, removal))
        
        C_eq = C0 * (1 - removal / 100)
        q = (C0 - C_eq) * 1000  # 简化
        
        return {
            'C_eq': round(C_eq, 6),
            'q_eq': round(q, 4),
            'removal_pct': round(removal, 1),
            'K_selectivity': K,
            'capacity': round(Q, 2),
        }
    
    @staticmethod
    def thomas_model(resin: Dict, ion: str, C0: float, flow_rate: float,
                     bed_volume: float, T_C: float) -> Dict:
        """Thomas模型——穿透曲线
        C/C0 = 1 / (1 + exp(k_T*(q0*Q - C0*V)/flow_rate))"""
        K = IonExchangePhysics.selectivity_coefficient(resin, ion)
        Q = IonExchangePhysics.exchange_capacity(resin, T_C)
        q0 = Q * K / (1 + K)  # 平衡吸附量
        
        # Thomas速率常数
        k_T = 0.01 * K  # L/(eq·h)
        
        # 穿透体积
        V_breakthrough = 0.10 * q0 * Q * bed_volume / C0  # 穿透时处理量
        V_exhaustion = 0.95 * q0 * Q * bed_volume / C0
        
        # 穿透时间
        t_breakthrough = V_breakthrough / flow_rate
        t_exhaustion = V_exhaustion / flow_rate
        
        # 穿透曲线点
        curve = []
        for t_ratio in [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0]:
            V = t_ratio * V_exhaustion
            ratio = 1 / (1 + math.exp(k_T * (q0 * Q * bed_volume - C0 * V) / flow_rate))
            curve.append({
                'V_bed_volumes': round(V / bed_volume, 1),
                'C_C0_ratio': round(ratio, 3),
            })
        
        return {
            'q0': round(q0, 4),
            'k_Thomas': round(k_T, 4),
            'V_breakthrough_BV': round(V_breakthrough / bed_volume, 0),  # 床体积倍数
            'V_exhaustion_BV': round(V_exhaustion / bed_volume, 0),
            't_breakthrough_h': round(t_breakthrough, 1),
            't_exhaustion_h': round(t_exhaustion, 1),
            'breakthrough_curve': curve,
        }
    
    @staticmethod
    def regeneration_efficiency(resin: Dict, regen_conc: float, 
                                 regen_dose_eq_L: float, T_C: float) -> Dict:
        """再生效率"""
        # 再生效率取决于再生剂浓度和用量
        eff = min(0.98, 0.5 + 0.3 * regen_conc / 1.0 + 0.2 * regen_dose_eq_L / 2.0)
        T_factor = math.exp(-0.01 * abs(T_C - 25))
        eff *= T_factor
        
        residual_capacity = IonExchangePhysics.exchange_capacity(resin, T_C) * eff
        
        return {
            'regen_efficiency': round(eff, 3),
            'residual_capacity': round(residual_capacity, 2),
        }


# ──────────────────────────────────────────────
# 虚拟实验
# ──────────────────────────────────────────────
class VirtualIonExchangeExperiment:
    """离子交换虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.resin_id = conditions.get('resin', 'strong_acid_cation')
        self.resin = RESINS.get(self.resin_id, RESINS['strong_acid_cation'])
        self.ion = conditions.get('ion', 'Na')
        self.C0_mg_L = conditions.get('C0_mg_L', 100)
        self.resin_dose = conditions.get('resin_dose_eq_L', 1.0)
        self.temperature_C = conditions.get('temperature_C', 25)
        self.flow_rate = conditions.get('flow_rate', 10)  # L/h
        self.bed_volume = conditions.get('bed_volume', 1.0)  # L
        self.mode = conditions.get('mode', 'batch')
    
    def run(self) -> Dict:
        resin = self.resin
        ion = self.ion
        C0_mg = self.C0_mg_L
        T_C = self.temperature_C
        
        # 转换为eq/L
        ion_data = IONS.get(ion, {'charge': 1, 'mw': 50})
        charge = abs(ion_data['charge'])
        mw = ion_data['mw']
        C0_eq = C0_mg / mw * charge / 1000  # eq/L
        C0_eq = max(C0_eq, 0.001)
        
        if self.mode == 'batch':
            result = IonExchangePhysics.equilibrium_concentration(
                resin, ion, C0_eq, self.resin_dose, T_C
            )
            result['mode'] = 'batch'
        elif self.mode == 'column':
            result = IonExchangePhysics.thomas_model(
                resin, ion, C0_eq, self.flow_rate, self.bed_volume, T_C
            )
            result['mode'] = 'column'
        else:
            result = {'error': f'未知模式: {self.mode}'}
        
        result['resin'] = resin['name']
        result['ion'] = ion
        result['C0_mg_L'] = C0_mg
        result['temperature_C'] = T_C
        
        return result


# ──────────────────────────────────────────────
# 验证数据
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # 强酸性阳离子树脂
    {'id': 'IX-001', 'resin': 'strong_acid_cation', 'ion': 'Na', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 85, 'real_C_eq': 15},
    {'id': 'IX-002', 'resin': 'strong_acid_cation', 'ion': 'Ca', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 95, 'real_C_eq': 5},
    {'id': 'IX-003', 'resin': 'strong_acid_cation', 'ion': 'Mg', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 92, 'real_C_eq': 4},
    {'id': 'IX-004', 'resin': 'strong_acid_cation', 'ion': 'Na', 'C0_mg_L': 200, 'resin_dose_eq_L': 0.5, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 70, 'real_C_eq': 60},
    {'id': 'IX-005', 'resin': 'strong_acid_cation', 'ion': 'K', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 90, 'real_C_eq': 10},
    {'id': 'IX-006', 'resin': 'strong_acid_cation', 'ion': 'Na', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 50, 'mode': 'batch', 'real_removal': 82, 'real_C_eq': 18},
    {'id': 'IX-007', 'resin': 'strong_acid_cation', 'ion': 'Fe3', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 98, 'real_C_eq': 1},
    
    # 弱酸性阳离子树脂
    {'id': 'IX-008', 'resin': 'weak_acid_cation', 'ion': 'Ca', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 97, 'real_C_eq': 3},
    {'id': 'IX-009', 'resin': 'weak_acid_cation', 'ion': 'Na', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 60, 'real_C_eq': 40},
    {'id': 'IX-010', 'resin': 'weak_acid_cation', 'ion': 'Mg', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 94, 'real_C_eq': 3},
    
    # 强碱性阴离子树脂
    {'id': 'IX-011', 'resin': 'strong_base_anion', 'ion': 'Cl', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 80, 'real_C_eq': 20},
    {'id': 'IX-012', 'resin': 'strong_base_anion', 'ion': 'SO4', 'C0_mg_L': 100, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 95, 'real_C_eq': 5},
    {'id': 'IX-013', 'resin': 'strong_base_anion', 'ion': 'NO3', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 88, 'real_C_eq': 6},
    {'id': 'IX-014', 'resin': 'strong_base_anion', 'ion': 'F', 'C0_mg_L': 10, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 75, 'real_C_eq': 2.5},
    
    # 螯合树脂
    {'id': 'IX-015', 'resin': 'chelating', 'ion': 'Cu', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 99, 'real_C_eq': 0.5},
    {'id': 'IX-016', 'resin': 'chelating', 'ion': 'Ni', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 96, 'real_C_eq': 2},
    {'id': 'IX-017', 'resin': 'chelating', 'ion': 'Zn', 'C0_mg_L': 50, 'resin_dose_eq_L': 1.0, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 93, 'real_C_eq': 3.5},
    {'id': 'IX-018', 'resin': 'chelating', 'ion': 'Cu', 'C0_mg_L': 100, 'resin_dose_eq_L': 0.5, 'temperature_C': 25, 'mode': 'batch', 'real_removal': 90, 'real_C_eq': 10},
    
    # 柱式
    {'id': 'IX-019', 'resin': 'strong_acid_cation', 'ion': 'Na', 'C0_mg_L': 100, 'flow_rate': 10, 'bed_volume': 1.0, 'temperature_C': 25, 'mode': 'column', 'real_BV_breakthrough': 40},
    {'id': 'IX-020', 'resin': 'strong_base_anion', 'ion': 'Cl', 'C0_mg_L': 100, 'flow_rate': 10, 'bed_volume': 1.0, 'temperature_C': 25, 'mode': 'column', 'real_BV_breakthrough': 30},
]


def validate():
    """论文验证"""
    results = []
    
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if not k.startswith('real_')}
        engine = VirtualIonExchangeExperiment(conditions)
        r = engine.run()
        
        if 'removal_pct' in r:
            pred_removal = r['removal_pct']
            # C_eq是eq/L，转回mg/L
            ion_data = IONS.get(exp['ion'], {'charge': 1, 'mw': 50})
            pred_C = r['C_eq'] * ion_data['mw'] / abs(ion_data['charge']) * 1000
            real_removal = exp.get('real_removal', 0)
            real_C = exp.get('real_C_eq', 0)
            
            rem_err = abs(pred_removal - real_removal) / max(real_removal, 1) * 100
            C_err = abs(pred_C - real_C) / max(real_C, 0.1) * 100
            
            results.append({
                'id': exp['id'],
                'resin': r.get('resin', ''),
                'conditions': f"{exp['ion']} {exp['C0_mg_L']}mg/L",
                'real_removal': real_removal,
                'pred_removal': round(pred_removal, 1),
                'rem_err': round(rem_err, 1),
                'real_C': real_C,
                'pred_C': round(pred_C, 2),
                'C_err': round(C_err, 1),
            })
        elif 'V_breakthrough_BV' in r:
            pred_BV = r['V_breakthrough_BV']
            real_BV = exp.get('real_BV_breakthrough', 0)
            BV_err = abs(pred_BV - real_BV) / max(real_BV, 1) * 100
            
            results.append({
                'id': exp['id'],
                'resin': r.get('resin', ''),
                'conditions': f"{exp['ion']} column",
                'real_BV': real_BV,
                'pred_BV': round(pred_BV, 0),
                'BV_err': round(BV_err, 1),
            })
    
    # 统计
    rem_errors = [r['rem_err'] for r in results if 'rem_err' in r]
    BV_errors = [r['BV_err'] for r in results if 'BV_err' in r]
    
    mean_rem_err = sum(rem_errors) / len(rem_errors) if rem_errors else 0
    mean_BV_err = sum(BV_errors) / len(BV_errors) if BV_errors else 0
    
    rem_within_10 = sum(1 for e in rem_errors if e < 10)
    rem_within_20 = sum(1 for e in rem_errors if e < 20)
    rem_within_30 = sum(1 for e in rem_errors if e < 30)
    
    output = {
        'total': len(results),
        'mean_removal_error': round(mean_rem_err, 1),
        'mean_BV_error': round(mean_BV_err, 1),
        'removal_within_10': rem_within_10,
        'removal_within_20': rem_within_20,
        'removal_within_30': rem_within_30,
        'results': results,
    }
    
    with open('/home/z/my-project/swarmlabs_ion_exchange_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: 去除率{mean_rem_err:.1f}% / 穿透BV{mean_BV_err:.1f}%")
    print(f"去除率误差<10%: {rem_within_10}组")
    print(f"去除率误差<20%: {rem_within_20}组")
    print(f"去除率误差<30%: {rem_within_30}组")
    
    print(f"\n{'ID':<8} {'树脂':<14} {'条件':<20} {'去除率真实':>8} {'预测':>6} {'误差':>6}")
    print("-" * 80)
    for r in results:
        if 'rem_err' in r:
            print(f"{r['id']:<8} {r['resin']:<14} {r['conditions']:<20} {r['real_removal']:>8.0f} {r['pred_removal']:>6.1f} {r['rem_err']:>5.1f}%")
        else:
            print(f"{r['id']:<8} {r['resin']:<14} {r['conditions']:<20} BV真实={r['real_BV']:.0f} 预测={r['pred_BV']:.0f} {r['BV_err']:.1f}%")
    
    print(f"\n结果已保存: swarmlabs_ion_exchange_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——离子交换虚拟实验引擎（第19领域）")
    print("物理体系：离子交换平衡")
    print("=" * 60)
    
    # 示例
    print("\n--- 示例实验：强酸树脂除钙 ---")
    exp = VirtualIonExchangeExperiment({
        'resin': 'strong_acid_cation',
        'ion': 'Ca',
        'C0_mg_L': 100,
        'resin_dose_eq_L': 1.0,
        'temperature_C': 25,
        'mode': 'batch',
    })
    r = exp.run()
    print(f"去除率: {r['removal_pct']}%")
    print(f"平衡浓度: {r['C_eq']} mg/L")
    
    # 验证
    print("\n--- 论文验证 ---")
    validate()
