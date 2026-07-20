#!/usr/bin/env python3
"""
蜂群科研——燃烧虚拟实验引擎（第15领域）

模拟燃烧过程：
1. 预混火焰传播
2. 绝热火焰温度
3. 燃烧产物分布
4. 层流燃烧速度

物理体系：燃烧动力学（第12类物理体系）

物理约束：
- 化学当量比 φ = (F/A) / (F/A)_stoch
- 绝热火焰温度（热力学平衡）
- Zel'dovich-Frank-Kamenetskii近似
- 层流火焰速度 SL ∝ sqrt(α*ω)
- Metghalchi-Keck经验公式
- 完全燃烧产物（CO2/H2O/N2）
- 不完全燃烧（CO/soot）
- NOx生成（Zel'dovich热力型）
- 淬熄距离
- 最小点火能
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 燃料数据库
# ──────────────────────────────────────────────
FUELS = {
    'CH4': {
        'name': '甲烷',
        'mw': 16.04,
        'LHV_kJ_mol': 802,  # 低位热值
        'HHV_kJ_mol': 890,
        'stoch_O2': 2.0,  # CH4 + 2O2 → CO2 + 2H2O
        'stoch_air': 9.52,  # 2*4.76
        'T_ad_stoch_K': 2220,  # 绝热火焰温度（化学当量比）
        'SL_ref': 0.38,  # 层流火焰速度 m/s at 298K, 1atm
        'T_ref': 298,
        'P_ref': 1.0,
        'alpha_exp': 2.0,  # 温度指数
        'beta_exp': -0.5,  # 压力指数
        'Ea_kJ_mol': 150,  # 活化能
        'Ta_K': 16000,  # ZFK活化温度
        'quench_distance_mm': 2.5,
        'MIE_mJ': 0.47,  # 最小点火能
        'LFL_pct': 5.0,  # 爆炸下限
        'UFL_pct': 15.0,  # 爆炸上限
    },
    'H2': {
        'name': '氢气',
        'mw': 2.016,
        'LHV_kJ_mol': 242,
        'HHV_kJ_mol': 286,
        'stoch_O2': 0.5,
        'stoch_air': 2.38,
        'T_ad_stoch_K': 2380,
        'SL_ref': 2.1,
        'T_ref': 298,
        'P_ref': 1.0,
        'alpha_exp': 1.75,
        'beta_exp': -0.25,
        'Ea_kJ_mol': 75,
        'Ta_K': 9000,
        'quench_distance_mm': 0.6,
        'MIE_mJ': 0.017,
        'LFL_pct': 4.0,
        'UFL_pct': 75.0,
    },
    'C8H18': {
        'name': '异辛烷',
        'mw': 114.23,
        'LHV_kJ_mol': 5074,
        'HHV_kJ_mol': 5470,
        'stoch_O2': 12.5,
        'stoch_air': 59.5,
        'T_ad_stoch_K': 2270,
        'SL_ref': 0.38,
        'T_ref': 298,
        'P_ref': 1.0,
        'alpha_exp': 1.5,
        'beta_exp': -0.5,
        'Ea_kJ_mol': 165,
        'Ta_K': 20000,
        'quench_distance_mm': 2.0,
        'MIE_mJ': 1.35,
        'LFL_pct': 1.0,
        'UFL_pct': 8.0,
    },
    'C2H4': {
        'name': '乙烯',
        'mw': 28.05,
        'LHV_kJ_mol': 1323,
        'HHV_kJ_mol': 1411,
        'stoch_O2': 3.0,
        'stoch_air': 14.28,
        'T_ad_stoch_K': 2370,
        'SL_ref': 0.68,
        'T_ref': 298,
        'P_ref': 1.0,
        'alpha_exp': 1.75,
        'beta_exp': -0.25,
        'Ea_kJ_mol': 110,
        'Ta_K': 13000,
        'quench_distance_mm': 1.5,
        'MIE_mJ': 0.08,
        'LFL_pct': 2.7,
        'UFL_pct': 36.0,
    },
    'CO': {
        'name': '一氧化碳',
        'mw': 28.01,
        'LHV_kJ_mol': 283,
        'HHV_kJ_mol': 283,
        'stoch_O2': 0.5,
        'stoch_air': 2.38,
        'T_ad_stoch_K': 2370,
        'SL_ref': 0.18,
        'T_ref': 298,
        'P_ref': 1.0,
        'alpha_exp': 2.0,
        'beta_exp': -0.5,
        'Ea_kJ_mol': 100,
        'Ta_K': 12000,
        'quench_distance_mm': 3.0,
        'MIE_mJ': 8.7,
        'LFL_pct': 12.5,
        'UFL_pct': 74.0,
    },
}


class CombustionPhysics:
    """燃烧物理规则"""

    @staticmethod
    def equivalence_ratio(fuel: str, fuel_air_ratio: float) -> float:
        """化学当量比 φ = (F/A) / (F/A)_stoch"""
        stoch_far = 1.0 / FUELS[fuel]['stoch_air']  # 化学当量比下的燃空比
        return fuel_air_ratio / stoch_far

    @staticmethod
    def adiabatic_flame_temp(fuel: str, phi: float, T_in_K: float = 298,
                              P_atm: float = 1.0) -> float:
        """绝热火焰温度——简化模型
        T_ad = T_ad_stoch * f(phi) * (T_in/T_ref)^0.1"""
        f = FUELS[fuel]
        T_ad_stoch = f['T_ad_stoch_K']

        # 当量比修正
        if phi < 1:  # 贫燃
            phi_factor = 1 - 0.5 * (1 - phi)
        elif phi > 1:  # 富燃
            phi_factor = 1 - 0.2 * (phi - 1)
        else:
            phi_factor = 1.0

        # 进口温度修正
        T_factor = (T_in_K / 298) ** 0.1

        return T_ad_stoch * phi_factor * T_factor

    @staticmethod
    def laminar_flame_speed(fuel: str, phi: float, T_K: float = 298,
                             P_atm: float = 1.0) -> float:
        """层流火焰速度——Metghalchi-Keck
        SL = SL_ref * (T/T_ref)^alpha * (P/P_ref)^beta * f(phi)"""
        f = FUELS[fuel]
        SL_ref = f['SL_ref']
        alpha = f['alpha_exp']
        beta = f['beta_exp']

        # 当量比修正
        if phi < 1:
            phi_factor = 1 - 2.06 * (phi - 1)**2
        else:
            phi_factor = 1 - 1.5 * (phi - 1)**2
        phi_factor = max(0.1, phi_factor)

        SL = SL_ref * (T_K / 298)**alpha * (P_atm / 1.0)**beta * phi_factor
        return max(0.001, SL)

    @staticmethod
    def combustion_products(fuel: str, phi: float) -> Dict:
        """燃烧产物分布"""
        f = FUELS[fuel]
        mw = f['mw']
        stoch_O2 = f['stoch_O2']

        if phi <= 1:  # 贫燃——完全燃烧
            # 产物: CO2, H2O, N2, O2(过量)
            n_CO2 = 1  # 假设燃料分子含1个C
            n_H2O = mw / 18 - n_CO2  # 简化
            n_N2 = stoch_O2 * 3.76 * phi
            n_O2_excess = stoch_O2 * (1 - phi) / 2
            n_CO = 0
            n_soot = 0
        else:  # 富燃——不完全燃烧
            n_CO2 = 1 - (phi - 1) * 0.5
            n_CO = (phi - 1) * 0.5
            n_H2O = mw / 18 - n_CO2
            n_N2 = stoch_O2 * 3.76
            n_O2_excess = 0
            n_soot = max(0, (phi - 1.2) * 0.3)

        total = n_CO2 + n_H2O + n_N2 + n_O2_excess + n_CO + n_soot
        return {
            'CO2': round(n_CO2 / total * 100, 2),
            'H2O': round(n_H2O / total * 100, 2),
            'N2': round(n_N2 / total * 100, 2),
            'O2': round(n_O2_excess / total * 100, 2),
            'CO': round(n_CO / total * 100, 2),
            'soot': round(n_soot / total * 100, 2),
        }

    @staticmethod
    def NOx_formation(fuel: str, T_ad: float, phi: float,
                      residence_time_ms: float = 10) -> float:
        """热力型NOx生成——Zel'dovich机理
        [NO] ∝ exp(-38000/T) * sqrt(t)"""
        if T_ad < 1800:
            return 0
        Ea_NO = 38000  # K
        A_NO = 1e-3
        NO = A_NO * math.exp(-Ea_NO / T_ad) * math.sqrt(residence_time_ms / 10)
        # 富燃抑制NOx
        if phi > 1:
            NO *= max(0.1, 1 - (phi - 1) * 0.5)
        return round(NO * 1000, 1)  # ppm

    @staticmethod
    def quench_distance(fuel: str, P_atm: float = 1.0, phi: float = 1.0) -> float:
        """淬熄距离"""
        d_ref = FUELS[fuel]['quench_distance_mm']
        return d_ref / max(P_atm, 0.1)

    @staticmethod
    def min_ignition_energy(fuel: str, phi: float = 1.0,
                             P_atm: float = 1.0) -> float:
        """最小点火能"""
        MIE_ref = FUELS[fuel]['MIE_mJ']
        # 当量比修正
        if phi < 1:
            phi_factor = 1 / (1 - 0.5 * (phi - 1))
        else:
            phi_factor = 1 + (phi - 1)**2 * 2
        return MIE_ref * phi_factor / max(P_atm, 0.1)

    @staticmethod
    def flammability_limit(fuel: str, phi: float) -> bool:
        """是否在可燃范围内"""
        f = FUELS[fuel]
        # φ to vol%
        stoch_vol = 100 / (f['stoch_air'] + 1)
        actual_vol = phi * stoch_vol
        return f['LFL_pct'] <= actual_vol <= f['UFL_pct']


# ──────────────────────────────────────────────
# 燃烧实验模拟器
# ──────────────────────────────────────────────
class VirtualCombustionExperiment:
    """燃烧虚拟实验"""

    def __init__(self, conditions: Dict):
        self.fuel = conditions.get('fuel', 'CH4')
        self.phi = conditions.get('equivalence_ratio', 1.0)
        self.T_in_K = conditions.get('T_in_K', 298)
        self.P_atm = conditions.get('P_atm', 1.0)
        self.residence_time_ms = conditions.get('residence_time_ms', 10)

    def run(self) -> Dict:
        fuel = self.fuel
        phi = self.phi
        f = FUELS[fuel]

        # 1. 绝热火焰温度
        T_ad = CombustionPhysics.adiabatic_flame_temp(fuel, phi, self.T_in_K, self.P_atm)

        # 2. 层流火焰速度
        SL = CombustionPhysics.laminar_flame_speed(fuel, phi, self.T_in_K, self.P_atm)

        # 3. 燃烧产物
        products = CombustionPhysics.combustion_products(fuel, phi)

        # 4. NOx
        NOx = CombustionPhysics.NOx_formation(fuel, T_ad, phi, self.residence_time_ms)

        # 5. 淬熄距离
        d_quench = CombustionPhysics.quench_distance(fuel, self.P_atm, phi)

        # 6. 最小点火能
        MIE = CombustionPhysics.min_ignition_energy(fuel, phi, self.P_atm)

        # 7. 可燃性
        flammable = CombustionPhysics.flammability_limit(fuel, phi)

        # 8. 热释放
        LHV = f['LHV_kJ_mol']
        heat_release = LHV * (1 - max(0, (phi - 1) * 0.1))  # 富燃热效率降低

        return {
            'fuel': f['name'],
            'equivalence_ratio': phi,
            'T_ad_K': round(T_ad, 0),
            'T_ad_C': round(T_ad - 273.15, 0),
            'SL_m_s': round(SL, 3),
            'products': products,
            'NOx_ppm': NOx,
            'quench_mm': round(d_quench, 2),
            'MIE_mJ': round(MIE, 3),
            'flammable': flammable,
            'heat_release_kJ_mol': round(heat_release, 0),
            'pressure_atm': self.P_atm,
            'T_in_K': self.T_in_K,
        }


# ──────────────────────────────────────────────
# 验证数据集（20组）
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # CH4-空气
    {'id': 'CB-001', 'fuel': 'CH4', 'equivalence_ratio': 0.8, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 1980, 'real_SL': 0.25},
    {'id': 'CB-002', 'fuel': 'CH4', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2220, 'real_SL': 0.38},
    {'id': 'CB-003', 'fuel': 'CH4', 'equivalence_ratio': 1.2, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2100, 'real_SL': 0.30},
    {'id': 'CB-004', 'fuel': 'CH4', 'equivalence_ratio': 1.0, 'T_in_K': 400, 'P_atm': 1.0, 'real_T_ad': 2300, 'real_SL': 0.55},
    {'id': 'CB-005', 'fuel': 'CH4', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 5.0, 'real_T_ad': 2250, 'real_SL': 0.17},
    # H2-空气
    {'id': 'CB-006', 'fuel': 'H2', 'equivalence_ratio': 0.5, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 1650, 'real_SL': 0.80},
    {'id': 'CB-007', 'fuel': 'H2', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2380, 'real_SL': 2.10},
    {'id': 'CB-008', 'fuel': 'H2', 'equivalence_ratio': 1.5, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2200, 'real_SL': 1.50},
    {'id': 'CB-009', 'fuel': 'H2', 'equivalence_ratio': 1.0, 'T_in_K': 500, 'P_atm': 1.0, 'real_T_ad': 2500, 'real_SL': 4.00},
    {'id': 'CB-010', 'fuel': 'H2', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 10.0, 'real_T_ad': 2420, 'real_SL': 1.20},
    # C8H18-空气（汽油）
    {'id': 'CB-011', 'fuel': 'C8H18', 'equivalence_ratio': 0.9, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2200, 'real_SL': 0.32},
    {'id': 'CB-012', 'fuel': 'C8H18', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2270, 'real_SL': 0.38},
    {'id': 'CB-013', 'fuel': 'C8H18', 'equivalence_ratio': 1.1, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2250, 'real_SL': 0.35},
    {'id': 'CB-014', 'fuel': 'C8H18', 'equivalence_ratio': 1.0, 'T_in_K': 500, 'P_atm': 1.0, 'real_T_ad': 2400, 'real_SL': 0.60},
    {'id': 'CB-015', 'fuel': 'C8H18', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 10.0, 'real_T_ad': 2300, 'real_SL': 0.17},
    # C2H4-空气
    {'id': 'CB-016', 'fuel': 'C2H4', 'equivalence_ratio': 0.8, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2150, 'real_SL': 0.50},
    {'id': 'CB-017', 'fuel': 'C2H4', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2370, 'real_SL': 0.68},
    {'id': 'CB-018', 'fuel': 'C2H4', 'equivalence_ratio': 1.3, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2250, 'real_SL': 0.55},
    # CO-空气
    {'id': 'CB-019', 'fuel': 'CO', 'equivalence_ratio': 1.0, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 2370, 'real_SL': 0.18},
    {'id': 'CB-020', 'fuel': 'CO', 'equivalence_ratio': 0.7, 'T_in_K': 298, 'P_atm': 1.0, 'real_T_ad': 1900, 'real_SL': 0.10},
]


def validate():
    """论文验证"""
    results = []

    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if k not in ['real_T_ad', 'real_SL']}
        engine = VirtualCombustionExperiment(conditions)
        r = engine.run()

        pred_T_ad = r['T_ad_K']
        pred_SL = r['SL_m_s']
        real_T_ad = exp['real_T_ad']
        real_SL = exp['real_SL']

        T_err = abs(pred_T_ad - real_T_ad) / real_T_ad * 100
        SL_err = abs(pred_SL - real_SL) / real_SL * 100 if real_SL > 0 else 0

        results.append({
            'id': exp['id'],
            'fuel': FUELS[exp['fuel']]['name'],
            'conditions': f"φ={exp['equivalence_ratio']} T={exp['T_in_K']}K P={exp['P_atm']}atm",
            'real_T_ad': real_T_ad,
            'pred_T_ad': pred_T_ad,
            'T_err': round(T_err, 1),
            'real_SL': real_SL,
            'pred_SL': pred_SL,
            'SL_err': round(SL_err, 1),
        })

    T_errors = [r['T_err'] for r in results]
    SL_errors = [r['SL_err'] for r in results]

    mean_T_err = sum(T_errors) / len(T_errors)
    mean_SL_err = sum(SL_errors) / len(SL_errors)

    T_within_5 = sum(1 for e in T_errors if e < 5)
    T_within_10 = sum(1 for e in T_errors if e < 10)
    T_within_20 = sum(1 for e in T_errors if e < 20)

    SL_within_10 = sum(1 for e in SL_errors if e < 10)
    SL_within_20 = sum(1 for e in SL_errors if e < 20)
    SL_within_30 = sum(1 for e in SL_errors if e < 30)

    output = {
        'total': len(results),
        'mean_T_ad_error': round(mean_T_err, 1),
        'mean_SL_error': round(mean_SL_err, 1),
        'T_within_5': T_within_5,
        'T_within_10': T_within_10,
        'T_within_20': T_within_20,
        'SL_within_10': SL_within_10,
        'SL_within_20': SL_within_20,
        'SL_within_30': SL_within_30,
        'results': results,
    }

    with open('/home/z/my-project/swarmlabs_combustion_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: 绝热温度{mean_T_err:.1f}% / 火焰速度{mean_SL_err:.1f}%")
    print(f"温度误差<5%: {T_within_5}组")
    print(f"温度误差<10%: {T_within_10}组")
    print(f"温度误差<20%: {T_within_20}组")
    print(f"速度误差<10%: {SL_within_10}组")
    print(f"速度误差<20%: {SL_within_20}组")
    print(f"速度误差<30%: {SL_within_30}组")

    print(f"\n{'ID':<8} {'燃料':<8} {'条件':<35} {'Tad真实':>6} {'Tad预测':>6} {'误差':>6} {'SL真实':>6} {'SL预测':>6} {'误差':>6}")
    print("-" * 100)
    for r in results:
        print(f"{r['id']:<8} {r['fuel']:<8} {r['conditions']:<35} {r['real_T_ad']:>6.0f} {r['pred_T_ad']:>6.0f} {r['T_err']:>5.1f}% {r['real_SL']:>6.2f} {r['pred_SL']:>6.3f} {r['SL_err']:>5.1f}%")

    print(f"\n结果已保存: swarmlabs_combustion_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——燃烧虚拟实验引擎（第15领域）")
    print("物理体系：燃烧动力学")
    print("=" * 60)

    # 示例
    print("\n--- 示例实验：CH4-空气化学当量燃烧 ---")
    exp = VirtualCombustionExperiment({
        'fuel': 'CH4',
        'equivalence_ratio': 1.0,
        'T_in_K': 298,
        'P_atm': 1.0,
    })
    r = exp.run()
    print(json.dumps(r, indent=2, ensure_ascii=False))

    # 验证
    print("\n--- 论文验证 ---")
    validate()
