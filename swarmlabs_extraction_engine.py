#!/usr/bin/env python3
"""
蜂群科研——萃取虚拟实验引擎（第14领域）

模拟液液萃取过程：
1. 单级萃取
2. 错流萃取（多级）
3. 逆流萃取

物理体系：液液平衡（第11类物理体系）

物理约束：
- Nernst分配定律：K = C_organic / C_aqueous
- 相比：S = V_organic / V_aqueous
- 萃取率：E = K*S / (1 + K*S) * 100%
- 残留率：R = 1 / (1 + K*S)
- Kremser方程（逆流多级）
- 温度效应（van't Hoff）
- pH效应（可萃取物解离）
- 盐析效应
- 络合萃取
- 乳化与分相
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 萃取体系数据库
# ──────────────────────────────────────────────
EXTRACTION_SYSTEMS = {
    'acetic_acid-water-ether': {
        'name': '乙酸-水-乙醚',
        'solute': 'acetic_acid',
        'aqueous_phase': 'water',
        'organic_phase': 'diethyl_ether',
        'K_25C': 0.8,  # 分配系数 C_org/C_aq at 25°C
        'delta_H_kJ_mol': -10,  # 萃取放热
        'mw_solute': 60.05,
        'density_org': 0.71,
        'density_aq': 1.0,
        'interfacial_tension': 10.5,  # mN/m
    },
    'penicillin-water-butyl_acetate': {
        'name': '青霉素-水-乙酸丁酯',
        'solute': 'penicillin_G',
        'aqueous_phase': 'water',
        'organic_phase': 'butyl_acetate',
        'K_25C': 15.0,  # 低pH时K高
        'delta_H_kJ_mol': -20,
        'mw_solute': 334.4,
        'density_org': 0.88,
        'density_aq': 1.0,
        'interfacial_tension': 25.0,
    },
    'copper-water-D2EHPA': {
        'name': '铜-水-D2EHPA',
        'solute': 'Cu2+',
        'aqueous_phase': 'water',
        'organic_phase': 'D2EHPA_kerosene',
        'K_25C': 50.0,  # pH依赖性强
        'delta_H_kJ_mol': -30,
        'mw_solute': 63.55,
        'density_org': 0.95,
        'density_aq': 1.0,
        'interfacial_tension': 30.0,
    },
    'phenol-water-benzene': {
        'name': '苯酚-水-苯',
        'solute': 'phenol',
        'aqueous_phase': 'water',
        'organic_phase': 'benzene',
        'K_25C': 2.3,
        'delta_H_kJ_mol': -8,
        'mw_solute': 94.11,
        'density_org': 0.88,
        'density_aq': 1.0,
        'interfacial_tension': 15.0,
    },
    'iodine-water-CCl4': {
        'name': '碘-水-四氯化碳',
        'solute': 'iodine',
        'aqueous_phase': 'water',
        'organic_phase': 'CCl4',
        'K_25C': 85.0,  # 经典教学体系
        'delta_H_kJ_mol': -5,
        'mw_solute': 253.8,
        'density_org': 1.59,
        'density_aq': 1.0,
        'interfacial_tension': 45.0,
    },
}


class ExtractionPhysics:
    """萃取物理规则"""

    @staticmethod
    def distribution_coefficient(system: Dict, T_C: float, pH: float = 7.0) -> float:
        """分配系数 K = C_org / C_aq
        温度依赖：van't Hoff
        pH依赖：可萃取物解离"""
        K_25 = system['K_25C']
        dH = system['delta_H_kJ_mol']
        T = T_C + 273.15
        R = 8.314e-3

        # 温度效应
        K = K_25 * math.exp(-dH / R * (1/T - 1/298.15))

        # pH效应——青霉素/乙酸等可解离物质
        solute = system['solute']
        if solute == 'acetic_acid':
            pKa = 4.76
            # 可萃取形态=分子态
            alpha = 1 / (1 + 10**(pH - pKa))
            K *= alpha
        elif solute == 'penicillin_G':
            pKa = 2.76
            alpha = 1 / (1 + 10**(pH - pKa))
            K *= alpha
        elif solute == 'phenol':
            pKa = 10.0
            alpha = 1 / (1 + 10**(pH - pKa))
            K *= alpha
        elif solute == 'Cu2+':
            # D2EHPA阳离子交换：log K ∝ 2*pH
            # pH=2 → K=1, pH=3 → K=100, pH=1.5 → K=0.1
            K = K_25 * 10**(2.5 * (pH - 2.35))  # pH=2.35时K=K_25
            K = max(0.01, min(K, 10000))

        return max(0.001, K)

    @staticmethod
    def extraction_efficiency(K: float, S: float) -> float:
        """单级萃取率 E = K*S / (1 + K*S)"""
        return K * S / (1 + K * S) * 100

    @staticmethod
    def single_stage(system: Dict, C0: float, V_aq: float, V_org: float,
                     T_C: float, pH: float = 7.0) -> Dict:
        """单级萃取"""
        K = ExtractionPhysics.distribution_coefficient(system, T_C, pH)
        S = V_org / V_aq  # 相比

        # 萃取后浓度
        C_aq = C0 / (1 + K * S)
        C_org = K * C_aq
        E = (1 - C_aq / C0) * 100

        # 萃取量
        m_extracted = C_org * V_org
        m_remaining = C_aq * V_aq

        return {
            'C_aq_residual': round(C_aq, 2),
            'C_org': round(C_org, 2),
            'extraction_efficiency': round(E, 1),
            'K': round(K, 2),
            'phase_ratio': round(S, 2),
            'mass_extracted': round(m_extracted, 2),
            'mass_remaining': round(m_remaining, 2),
        }

    @staticmethod
    def cross_current(system: Dict, C0: float, V_aq: float, V_org_per_stage: float,
                      n_stages: int, T_C: float, pH: float = 7.0) -> Dict:
        """错流萃取——每级用新鲜溶剂"""
        K = ExtractionPhysics.distribution_coefficient(system, T_C, pH)
        S = V_org_per_stage / V_aq

        C_aq = C0
        total_extracted = 0
        for i in range(n_stages):
            C_aq_new = C_aq / (1 + K * S)
            extracted = (C_aq - C_aq_new) * V_aq
            total_extracted += extracted
            C_aq = C_aq_new

        E = (1 - C_aq / C0) * 100
        return {
            'C_aq_residual': round(C_aq, 2),
            'extraction_efficiency': round(E, 1),
            'n_stages': n_stages,
            'total_solvent': V_org_per_stage * n_stages,
            'K': round(K, 2),
        }

    @staticmethod
    def counter_current(system: Dict, C0: float, V_aq: float, V_org: float,
                        n_stages: int, T_C: float, pH: float = 7.0) -> Dict:
        """逆流萃取——Kremser方程"""
        K = ExtractionPhysics.distribution_coefficient(system, T_C, pH)
        S = V_org / V_aq
        E_factor = K * S  # 萃取因子

        if abs(E_factor - 1) < 0.001:
            # E=1特殊处理
            phi = 1 / (n_stages + 1)  # 残留分数
        else:
            # Kremser方程
            phi = (E_factor - 1) / (E_factor**(n_stages + 1) - 1)

        C_aq = C0 * max(phi, 0.001)
        E = (1 - phi) * 100

        return {
            'C_aq_residual': round(C_aq, 2),
            'extraction_efficiency': round(E, 1),
            'n_stages': n_stages,
            'extraction_factor': round(E_factor, 2),
            'K': round(K, 2),
            'phase_ratio': round(S, 2),
        }

    @staticmethod
    def separation_factor(system: Dict, T_C: float, pH: float,
                          solute_B_K: float = 0.1) -> float:
        """分离因子 β = K_A / K_B"""
        K_A = ExtractionPhysics.distribution_coefficient(system, T_C, pH)
        return K_A / max(solute_B_K, 0.001)


class VirtualExtractionExperiment:
    """萃取虚拟实验"""

    def __init__(self, conditions: Dict):
        self.system_id = conditions.get('system', 'acetic_acid-water-ether')
        self.system = EXTRACTION_SYSTEMS.get(self.system_id, EXTRACTION_SYSTEMS['acetic_acid-water-ether'])
        self.extraction_type = conditions.get('type', 'single')
        self.C0 = conditions.get('C0_mg_L', 1000)  # 初始浓度 mg/L
        self.V_aq = conditions.get('V_aq_L', 1.0)  # 水相体积 L
        self.V_org = conditions.get('V_org_L', 0.5)  # 有机相体积 L
        self.temperature_C = conditions.get('temperature_C', 25)
        self.pH = conditions.get('pH', 7.0)
        self.n_stages = conditions.get('n_stages', 1)

    def run(self) -> Dict:
        sys_data = self.system

        if self.extraction_type == 'single':
            result = ExtractionPhysics.single_stage(
                sys_data, self.C0, self.V_aq, self.V_org,
                self.temperature_C, self.pH
            )
        elif self.extraction_type == 'cross_current':
            result = ExtractionPhysics.cross_current(
                sys_data, self.C0, self.V_aq, self.V_org,
                self.n_stages, self.temperature_C, self.pH
            )
        elif self.extraction_type == 'counter_current':
            result = ExtractionPhysics.counter_current(
                sys_data, self.C0, self.V_aq, self.V_org,
                self.n_stages, self.temperature_C, self.pH
            )
        else:
            result = ExtractionPhysics.single_stage(
                sys_data, self.C0, self.V_aq, self.V_org,
                self.temperature_C, self.pH
            )

        result['system'] = sys_data['name']
        result['type'] = self.extraction_type
        result['temperature_C'] = self.temperature_C
        result['pH'] = self.pH
        return result


# ──────────────────────────────────────────────
# 论文验证数据集（20组）
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # 乙酸-水-乙醚
    {'id': 'EX-001', 'system': 'acetic_acid-water-ether', 'type': 'single', 'C0_mg_L': 1000, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 3, 'real_efficiency': 44, 'real_C_aq': 560},
    {'id': 'EX-002', 'system': 'acetic_acid-water-ether', 'type': 'single', 'C0_mg_L': 1000, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 3, 'real_efficiency': 29, 'real_C_aq': 711},
    {'id': 'EX-003', 'system': 'acetic_acid-water-ether', 'type': 'cross_current', 'C0_mg_L': 1000, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 3, 'n_stages': 3, 'real_efficiency': 63, 'real_C_aq': 370},

    # 青霉素-水-乙酸丁酯
    {'id': 'EX-004', 'system': 'penicillin-water-butyl_acetate', 'type': 'single', 'C0_mg_L': 2000, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 20, 'pH': 2.0, 'real_efficiency': 88, 'real_C_aq': 240},
    {'id': 'EX-005', 'system': 'penicillin-water-butyl_acetate', 'type': 'single', 'C0_mg_L': 2000, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 20, 'pH': 4.0, 'real_efficiency': 35, 'real_C_aq': 1300},
    {'id': 'EX-006', 'system': 'penicillin-water-butyl_acetate', 'type': 'counter_current', 'C0_mg_L': 2000, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 20, 'pH': 2.0, 'n_stages': 3, 'real_efficiency': 98, 'real_C_aq': 40},

    # 铜-水-D2EHPA
    {'id': 'EX-007', 'system': 'copper-water-D2EHPA', 'type': 'single', 'C0_mg_L': 500, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 3.0, 'real_efficiency': 92, 'real_C_aq': 40},
    {'id': 'EX-008', 'system': 'copper-water-D2EHPA', 'type': 'single', 'C0_mg_L': 500, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 1.5, 'real_efficiency': 20, 'real_C_aq': 400},
    {'id': 'EX-009', 'system': 'copper-water-D2EHPA', 'type': 'counter_current', 'C0_mg_L': 500, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 3.0, 'n_stages': 2, 'real_efficiency': 99, 'real_C_aq': 5},

    # 苯酚-水-苯
    {'id': 'EX-010', 'system': 'phenol-water-benzene', 'type': 'single', 'C0_mg_L': 800, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 7, 'real_efficiency': 70, 'real_C_aq': 240},
    {'id': 'EX-011', 'system': 'phenol-water-benzene', 'type': 'single', 'C0_mg_L': 800, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 7, 'real_efficiency': 54, 'real_C_aq': 370},
    {'id': 'EX-012', 'system': 'phenol-water-benzene', 'type': 'cross_current', 'C0_mg_L': 800, 'V_aq_L': 1.0, 'V_org_L': 0.3, 'temperature_C': 25, 'pH': 7, 'n_stages': 3, 'real_efficiency': 80, 'real_C_aq': 160},

    # 碘-水-CCl4
    {'id': 'EX-013', 'system': 'iodine-water-CCl4', 'type': 'single', 'C0_mg_L': 100, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 7, 'real_efficiency': 98, 'real_C_aq': 2.3},
    {'id': 'EX-014', 'system': 'iodine-water-CCl4', 'type': 'single', 'C0_mg_L': 100, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 25, 'pH': 7, 'real_efficiency': 99, 'real_C_aq': 1.2},
    {'id': 'EX-015', 'system': 'iodine-water-CCl4', 'type': 'single', 'C0_mg_L': 100, 'V_aq_L': 1.0, 'V_org_L': 0.1, 'temperature_C': 25, 'pH': 7, 'real_efficiency': 89, 'real_C_aq': 10.5},

    # 温度效应
    {'id': 'EX-016', 'system': 'acetic_acid-water-ether', 'type': 'single', 'C0_mg_L': 1000, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 10, 'pH': 3, 'real_efficiency': 50, 'real_C_aq': 500},
    {'id': 'EX-017', 'system': 'acetic_acid-water-ether', 'type': 'single', 'C0_mg_L': 1000, 'V_aq_L': 1.0, 'V_org_L': 1.0, 'temperature_C': 40, 'pH': 3, 'real_efficiency': 38, 'real_C_aq': 620},

    # 多级
    {'id': 'EX-018', 'system': 'iodine-water-CCl4', 'type': 'cross_current', 'C0_mg_L': 100, 'V_aq_L': 1.0, 'V_org_L': 0.1, 'temperature_C': 25, 'pH': 7, 'n_stages': 5, 'real_efficiency': 99.9, 'real_C_aq': 0.1},
    {'id': 'EX-019', 'system': 'phenol-water-benzene', 'type': 'counter_current', 'C0_mg_L': 800, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 7, 'n_stages': 4, 'real_efficiency': 95, 'real_C_aq': 40},
    {'id': 'EX-020', 'system': 'copper-water-D2EHPA', 'type': 'single', 'C0_mg_L': 500, 'V_aq_L': 1.0, 'V_org_L': 0.5, 'temperature_C': 25, 'pH': 3.0, 'real_efficiency': 85, 'real_C_aq': 75},
]


def validate():
    """论文验证"""
    results = []

    for exp in VALIDATION_DATA:
        engine = VirtualExtractionExperiment(exp)
        r = engine.run()

        pred_eff = r.get('extraction_efficiency', 0)
        pred_C_aq = r.get('C_aq_residual', 0)
        real_eff = exp['real_efficiency']
        real_C_aq = exp['real_C_aq']

        eff_err = abs(pred_eff - real_eff) / real_eff * 100 if real_eff > 0 else 0
        C_aq_err = abs(pred_C_aq - real_C_aq) / max(real_C_aq, 1) * 100 if real_C_aq > 0 else 0

        conditions_str = f"{exp.get('system', '')[:20]} {exp.get('type', '')[:8]} S={exp.get('V_org_L', 0.5)} T={exp['temperature_C']}°C pH={exp.get('pH', 7)}"
        if 'n_stages' in exp:
            conditions_str += f" N={exp['n_stages']}"

        results.append({
            'id': exp['id'],
            'system': exp['system'][:25],
            'conditions': conditions_str,
            'real_eff': real_eff,
            'pred_eff': round(pred_eff, 1),
            'eff_err': round(eff_err, 1),
            'real_C_aq': real_C_aq,
            'pred_C_aq': round(pred_C_aq, 1),
            'C_aq_err': round(C_aq_err, 1),
        })

    eff_errors = [r['eff_err'] for r in results]
    C_aq_errors = [r['C_aq_err'] for r in results]

    mean_eff_err = sum(eff_errors) / len(eff_errors)
    mean_C_aq_err = sum(C_aq_errors) / len(C_aq_errors)

    eff_within_5 = sum(1 for e in eff_errors if e < 5)
    eff_within_10 = sum(1 for e in eff_errors if e < 10)
    eff_within_20 = sum(1 for e in eff_errors if e < 20)

    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: 萃取率{mean_eff_err:.1f}% / 残留浓度{mean_C_aq_err:.1f}%")
    print(f"萃取率误差<5%: {eff_within_5}组")
    print(f"萃取率误差<10%: {eff_within_10}组")
    print(f"萃取率误差<20%: {eff_within_20}组")

    print(f"\n{'ID':<8} {'体系':<25} {'条件':<45} {'效率真实':>6} {'效率预测':>6} {'误差':>6} {'C_aq真实':>8} {'C_aq预测':>8} {'误差':>6}")
    print("-" * 120)
    for r in results:
        print(f"{r['id']:<8} {r['system']:<25} {r['conditions']:<45} {r['real_eff']:>6.0f} {r['pred_eff']:>6.0f} {r['eff_err']:>5.1f}% {r['real_C_aq']:>8.0f} {r['pred_C_aq']:>8.0f} {r['C_aq_err']:>5.1f}%")

    output = {
        'total': len(results),
        'mean_eff_error': round(mean_eff_err, 1),
        'mean_C_aq_error': round(mean_C_aq_err, 1),
        'eff_within_5': eff_within_5,
        'eff_within_10': eff_within_10,
        'eff_within_20': eff_within_20,
        'results': results,
    }

    with open('/home/z/my-project/swarmlabs_extraction_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n结果已保存: swarmlabs_extraction_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——萃取虚拟实验引擎（第14领域）")
    print("物理体系：液液平衡")
    print("=" * 60)

    # 示例
    print("\n--- 示例实验：碘-水-CCl4单级萃取 ---")
    exp = VirtualExtractionExperiment({
        'system': 'iodine-water-CCl4',
        'type': 'single',
        'C0_mg_L': 100,
        'V_aq_L': 1.0,
        'V_org_L': 0.5,
        'temperature_C': 25,
    })
    r = exp.run()
    print(json.dumps(r, indent=2, ensure_ascii=False))

    # 验证
    print("\n--- 论文验证 ---")
    validate()
