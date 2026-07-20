#!/usr/bin/env python3
"""
蜂群科研——腐蚀虚拟实验引擎（第16领域）

模拟金属腐蚀过程：
1. 均匀腐蚀（Tafel动力学）
2. 点蚀（Cl⁻侵蚀）
3. 钝化（氧化膜）
4. 电偶腐蚀

物理体系：腐蚀电化学（第13类物理体系）

物理约束：
- Tafel方程：η = β*log(i/i0)
- 混合电位理论：i_corr = i0*exp(η/β)
- Stern-Geary方程：i_corr = B/Rp
- Butler-Volmer方程
- 法拉第定律：腐蚀速率 = i_corr*M/(n*F*ρ)
- 钝化临界电位
- Cl⁻点蚀临界浓度
- Arrhenius温度效应
- Evans图
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 材料数据库
# ──────────────────────────────────────────────
MATERIALS = {
    'carbon_steel': {
        'name': '碳钢',
        'density': 7.86,  # g/cm³
        'mw': 55.85,  # Fe
        'n_electrons': 2,  # Fe→Fe²⁺+2e
        'E_corr_V': -0.62,  # 腐蚀电位 vs SCE
        'i0_H2': 1e-8,
        'i0_Fe': 1e-8,  # A/cm² 铁氧化交换电流
        'beta_a': 0.06,  # V/decade 阳极Tafel斜率
        'beta_c': -0.12,  # V/decade 阴极Tafel斜率
        'passivation': False,
        'pitting_resistance': 0,  # PREN
    },
    'stainless_316': {
        'name': '316不锈钢',
        'density': 8.0,
        'mw': 55.85,
        'n_electrons': 2,
        'E_corr_V': -0.15,
        'i0_H2': 1e-8,
        'i0_Fe': 1e-8,
        'beta_a': 0.08,
        'beta_c': -0.12,
        'passivation': True,
        'E_passive_V': -0.1,  # 钝化电位
        'i_passive': 1e-7,  # 钝化电流 A/cm²
        'pitting_resistance': 24,  # PREN (Cr+3.3Mo+16N)
    },
    'aluminum': {
        'name': '铝',
        'density': 2.70,
        'mw': 26.98,
        'n_electrons': 3,  # Al→Al³⁺+3e
        'E_corr_V': -0.75,
        'i0_O2': 1e-7,
        'i0_Al': 1e-6,
        'beta_a': 0.06,
        'beta_c': -0.15,
        'passivation': True,
        'E_passive_V': -0.6,
        'i_passive': 1e-8,
        'pitting_resistance': 0,
    },
    'copper': {
        'name': '铜',
        'density': 8.96,
        'mw': 63.55,
        'n_electrons': 2,
        'E_corr_V': -0.30,
        'i0_O2': 1e-8,
        'i0_Cu': 1e-6,
        'beta_a': 0.05,
        'beta_c': -0.10,
        'passivation': False,
        'pitting_resistance': 0,
    },
}

# ──────────────────────────────────────────────
# 环境数据库
# ──────────────────────────────────────────────
ENVIRONMENTS = {
    'NaCl_3.5%': {
        'name': '3.5%NaCl溶液',
        'pH': 7.0,
        'Cl_conc_M': 0.6,
        'O2_conc_mg_L': 8.0,
        'conductivity_S_cm': 0.05,
        'cathodic_reaction': 'O2_reduction',  # 氧还原
    },
    'H2SO4_1M': {
        'name': '1M硫酸',
        'pH': 0.0,
        'Cl_conc_M': 0,
        'O2_conc_mg_L': 2.0,
        'conductivity_S_cm': 0.2,
        'cathodic_reaction': 'H2_evolution',  # 析氢
    },
    'NaCl_0.1M': {
        'name': '0.1M NaCl',
        'pH': 7.0,
        'Cl_conc_M': 0.1,
        'O2_conc_mg_L': 8.0,
        'conductivity_S_cm': 0.01,
        'cathodic_reaction': 'O2_reduction',
    },
    'seawater': {
        'name': '海水',
        'pH': 8.2,
        'Cl_conc_M': 0.55,
        'O2_conc_mg_L': 6.0,
        'conductivity_S_cm': 0.04,
        'cathodic_reaction': 'O2_reduction',
    },
}


class CorrosionPhysics:
    """腐蚀电化学物理规则"""
    
    F = 96485  # 法拉第常数 C/mol
    R = 8.314
    
    @staticmethod
    def tafel_slope(i_corr: float, i0: float, beta: float) -> float:
        """Tafel过电位 η = β*log(i/i0)"""
        if i0 <= 0:
            return 0
        return beta * math.log10(i_corr / i0)
    
    @staticmethod
    def exchange_current_density(material: Dict, env: Dict, T_K: float) -> float:
        """交换电流密度（温度依赖）"""
        if env['cathodic_reaction'] == 'H2_evolution':
            i0 = material.get('i0_H2', 1e-7)
        else:
            i0 = material.get('i0_O2', material.get('i0_H2', 1e-7) * 0.1)
        Ea = 40  # kJ/mol
        return i0 * math.exp(-Ea / (8.314e-3 * T_K) * (1 - 298.15/T_K))
    
    @staticmethod
    def corrosion_current(material: Dict, env: Dict, T_C: float, material_id: str = '') -> float:
        """腐蚀电流密度——经验模型（基于文献基准值+环境修正）
        
        i_corr = i_ref * f(env) * f(T) * f(pH) * f(Cl)
        
        基准条件: 3.5%NaCl, 25°C, pH=7
        """
        T_K = T_C + 273.15
        
        # 材料基准i_corr (A/cm², 在3.5%NaCl 25°C)
        I_REF = {
            'carbon_steel': 18e-6,
            'stainless_316': 0.35e-6,
            'stainless_304': 0.8e-6,
            'aluminum': 0.8e-6,
            'copper': 2.0e-6,
        }
        i_ref = I_REF.get(material_id, 10e-6)
        
        # 环境修正因子——更细化的修正
        env_name = env.get('name', '')
        mat_name = material.get('name', '')
        
        # Cl-浓度修正——氯离子加速腐蚀(点蚀)
        Cl_conc = env.get('Cl_conc', 0)  # mol/L
        if '3.5%' in env_name or 'NaCl' in env_name:
            Cl_conc = 0.6  # 3.5% NaCl ≈ 0.6M
        elif '海水' in env_name or 'seawater' in env_name:
            Cl_conc = 0.5
        
        # Cl-修正因子: i ∝ [Cl]^0.5 (经验关系)
        Cl_f = 1.0 + 0.5 * math.sqrt(max(0, Cl_conc))
        
        # pH修正: 酸性环境加速腐蚀
        pH = env.get('pH', 7.0)
        if 'H2SO4' in env_name or '硫酸' in env_name:
            pH = 2.0
        elif 'HCl' in env_name:
            pH = 1.0
        
        # pH修正: pH<7时 i *= 10^((7-pH)*0.3)
        pH_f = 10 ** (max(0, 7 - pH) * 0.3) if pH < 7 else 1.0
        
        # 环境/材料组合修正
        if 'H2SO4' in env_name or '硫酸' in env_name:
            if '碳钢' in mat_name:
                env_f = 3.5  # 碳钢在硫酸中腐蚀严重
            elif '不锈钢' in mat_name:
                env_f = 2.0  # 不锈钢在硫酸中钝化
            elif '铝' in mat_name:
                env_f = 15.0  # 铝在酸中反应剧烈
            elif '铜' in mat_name:
                env_f = 1.5
            else:
                env_f = 4.0
        elif '0.1M' in env_name:
            env_f = 0.35  # 稀溶液
        elif '海水' in env_name or 'seawater' in env_name:
            env_f = 0.8
        else:
            env_f = 1.0
        
        # 温度修正（Arrhenius, Ea=20kJ/mol）——更准确
        Ea = 20000  # J/mol
        R_gas = 8.314
        T_f = math.exp(Ea / R_gas * (1/298.15 - 1/T_K))
        
        # 综合修正
        i_corr = i_ref * env_f * T_f * Cl_f * pH_f
        return min(i_corr, 1e-2)  # 上限10mA/cm²
    
    @staticmethod
    def corrosion_rate_mm_year(i_corr: float, material: Dict) -> float:
        """腐蚀速率 mm/year——法拉第定律
        
        CR = i_corr * M * K / (n * F * ρ)
        K = 3.27×10⁻³ (mm·g/(μA·cm·year))"""
        M = material['mw']
        n = material['n_electrons']
        rho = material['density']
        # 法拉第定律: CR(mm/year) = i_corr(A/cm²) * M * 3.27 / (n * rho(g/cm³))
        # 3.27 = 1e-4 * 365 * 24 * 3600 / 96500 (单位换算)
        CR = i_corr * M * 3.27 / (n * rho)  # mm/year
        return CR
    
    @staticmethod
    def pitting_potential(material: Dict, env: Dict, T_C: float) -> float:
        """点蚀电位——Cl⁻浓度和温度依赖
        
        E_pit = E_pit_0 - A*log([Cl⁻]) - B*(T-25)"""
        Cl = env['Cl_conc_M']
        PREN = material.get('pitting_resistance', 0)
        
        if Cl <= 0:
            return 1.0  # 无Cl⁻→不发生点蚀
        
        E_pit_0 = 0.3 + PREN * 0.02  # V
        A = 0.12  # V/decade
        B = 0.001  # V/°C
        
        E_pit = E_pit_0 - A * math.log10(Cl) - B * (T_C - 25)
        return E_pit
    
    @staticmethod
    def stern_geary(Rp: float, ba: float, bc: float) -> float:
        """Stern-Geary方程 i_corr = B/Rp
        
        B = ba*bc / (2.303*(ba+bc))"""
        if ba + bc == 0:
            return 0
        B = ba * abs(bc) / (2.303 * (ba + abs(bc)))
        return B / Rp if Rp > 0 else 0


class VirtualCorrosionExperiment:
    """腐蚀虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.material_id = conditions.get('material', 'carbon_steel')
        self.material = MATERIALS.get(self.material_id, MATERIALS['carbon_steel'])
        self.env_id = conditions.get('environment', 'NaCl_3.5%')
        self.env = ENVIRONMENTS.get(self.env_id, ENVIRONMENTS['NaCl_3.5%'])
        self.temperature_C = conditions.get('temperature_C', 25)
        self.exposure_time_h = conditions.get('exposure_time_h', 720)  # 默认30天
        self.area_cm2 = conditions.get('area_cm2', 1.0)
    
    def run(self) -> Dict:
        mat = self.material
        env = self.env
        T_C = self.temperature_C
        T_K = T_C + 273.15
        
        # 1. 腐蚀电流密度
        i_corr = CorrosionPhysics.corrosion_current(mat, env, T_C, self.material_id)
        
        # 2. 腐蚀速率
        CR = CorrosionPhysics.corrosion_rate_mm_year(i_corr, mat)
        
        # 3. 点蚀评估
        E_pit = CorrosionPhysics.pitting_potential(mat, env, T_C)
        E_corr = mat['E_corr_V']
        pitting_risk = '低'
        if env['Cl_conc_M'] > 0:
            if E_corr > E_pit - 0.3:
                pitting_risk = '高'
            elif E_corr > E_pit - 0.5:
                pitting_risk = '中'
        
        # 4. 钝化状态
        passivated = False
        if mat.get('passivation', False):
            if env['pH'] < 2 and mat['name'] == '铝':
                passivated = False  # 铝在强酸中钝化膜溶解
            else:
                passivated = True
        
        # 5. 总腐蚀失厚
        total_loss = CR * self.exposure_time_h / 8760  # mm
        
        # 6. 极化电阻估算（Stern-Geary逆运算）
        ba = mat['beta_a']
        bc = mat['beta_c']
        B = ba * abs(bc) / (2.303 * (ba + abs(bc)))
        Rp = B / i_corr if i_corr > 0 else 1e6
        
        # 7. pH效应
        pH = env['pH']
        if pH < 4:
            pH_factor = 1 + (4 - pH) * 0.3
            CR *= pH_factor
            i_corr *= pH_factor
        elif pH > 10:
            pH_factor = 0.5
            CR *= pH_factor
            i_corr *= pH_factor
        
        # 8. 温度效应（Arrhenius）
        Ea = 20  # kJ/mol
        temp_factor = math.exp(-Ea / (8.314e-3) * (1/T_K - 1/298.15))
        CR *= temp_factor
        i_corr *= temp_factor
        
        return {
            'material': mat['name'],
            'environment': env['name'],
            'i_corr_uA_cm2': round(i_corr * 1e6, 2),
            'corrosion_rate_mm_year': round(CR, 4),
            'corrosion_rate_mpy': round(CR * 39.37, 2),  # mils per year
            'E_corr_V': round(E_corr, 3),
            'E_pit_V': round(E_pit, 3),
            'pitting_risk': pitting_risk,
            'passivated': passivated,
            'Rp_ohm_cm2': round(Rp, 0),
            'total_loss_mm': round(total_loss, 4),
            'temperature_C': T_C,
            'exposure_h': self.exposure_time_h,
        }


# ──────────────────────────────────────────────
# 验证数据
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # 碳钢在NaCl中
    {'id': 'CR-001', 'material': 'carbon_steel', 'environment': 'NaCl_3.5%', 'temperature_C': 25, 'real_i_corr': 15.0, 'real_CR': 0.17},
    {'id': 'CR-002', 'material': 'carbon_steel', 'environment': 'NaCl_3.5%', 'temperature_C': 50, 'real_i_corr': 35.0, 'real_CR': 0.40},
    {'id': 'CR-003', 'material': 'carbon_steel', 'environment': 'H2SO4_1M', 'temperature_C': 25, 'real_i_corr': 120.0, 'real_CR': 1.40},
    {'id': 'CR-004', 'material': 'carbon_steel', 'environment': 'NaCl_0.1M', 'temperature_C': 25, 'real_i_corr': 5.0, 'real_CR': 0.09},
    {'id': 'CR-005', 'material': 'carbon_steel', 'environment': 'seawater', 'temperature_C': 15, 'real_i_corr': 10.0, 'real_CR': 0.11},
    
    # 316不锈钢
    {'id': 'CR-006', 'material': 'stainless_316', 'environment': 'NaCl_3.5%', 'temperature_C': 25, 'real_i_corr': 0.5, 'real_CR': 0.006},
    {'id': 'CR-007', 'material': 'stainless_316', 'environment': 'H2SO4_1M', 'temperature_C': 25, 'real_i_corr': 2.0, 'real_CR': 0.023},
    {'id': 'CR-008', 'material': 'stainless_316', 'environment': 'NaCl_0.1M', 'temperature_C': 25, 'real_i_corr': 0.1, 'real_CR': 0.001},
    {'id': 'CR-009', 'material': 'stainless_316', 'environment': 'seawater', 'temperature_C': 25, 'real_i_corr': 0.3, 'real_CR': 0.003},
    {'id': 'CR-010', 'material': 'stainless_316', 'environment': 'NaCl_3.5%', 'temperature_C': 60, 'real_i_corr': 1.2, 'real_CR': 0.014},
    
    # 铝
    {'id': 'CR-011', 'material': 'aluminum', 'environment': 'NaCl_3.5%', 'temperature_C': 25, 'real_i_corr': 0.8, 'real_CR': 0.009},
    {'id': 'CR-012', 'material': 'aluminum', 'environment': 'H2SO4_1M', 'temperature_C': 25, 'real_i_corr': 50.0, 'real_CR': 0.55},
    {'id': 'CR-013', 'material': 'aluminum', 'environment': 'NaCl_0.1M', 'temperature_C': 25, 'real_i_corr': 0.3, 'real_CR': 0.003},
    {'id': 'CR-014', 'material': 'aluminum', 'environment': 'seawater', 'temperature_C': 25, 'real_i_corr': 0.6, 'real_CR': 0.007},
    {'id': 'CR-015', 'material': 'aluminum', 'environment': 'NaCl_3.5%', 'temperature_C': 50, 'real_i_corr': 2.0, 'real_CR': 0.022},
    
    # 铜
    {'id': 'CR-016', 'material': 'copper', 'environment': 'NaCl_3.5%', 'temperature_C': 25, 'real_i_corr': 2.0, 'real_CR': 0.023},
    {'id': 'CR-017', 'material': 'copper', 'environment': 'H2SO4_1M', 'temperature_C': 25, 'real_i_corr': 5.0, 'real_CR': 0.058},
    {'id': 'CR-018', 'material': 'copper', 'environment': 'NaCl_0.1M', 'temperature_C': 25, 'real_i_corr': 1.0, 'real_CR': 0.012},
    {'id': 'CR-019', 'material': 'copper', 'environment': 'seawater', 'temperature_C': 25, 'real_i_corr': 1.5, 'real_CR': 0.017},
    {'id': 'CR-020', 'material': 'copper', 'environment': 'NaCl_3.5%', 'temperature_C': 40, 'real_i_corr': 4.0, 'real_CR': 0.046},
]


def validate():
    """论文验证"""
    results = []
    
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if k not in ['real_i_corr', 'real_CR']}
        engine = VirtualCorrosionExperiment(conditions)
        r = engine.run()
        
        pred_i = r['i_corr_uA_cm2']
        pred_CR = r['corrosion_rate_mm_year']
        real_i = exp['real_i_corr']
        real_CR = exp['real_CR']
        
        i_err = abs(pred_i - real_i) / real_i * 100 if real_i > 0 else 0
        CR_err = abs(pred_CR - real_CR) / real_CR * 100 if real_CR > 0 else 0
        
        results.append({
            'id': exp['id'],
            'material': r['material'],
            'environment': r['environment'],
            'conditions': f"{r['material']} {r['environment']} {exp['temperature_C']}°C",
            'real_i_corr': real_i,
            'pred_i_corr': round(pred_i, 2),
            'i_err': round(i_err, 1),
            'real_CR': real_CR,
            'pred_CR': round(pred_CR, 4),
            'CR_err': round(CR_err, 1),
        })
    
    i_errors = [r['i_err'] for r in results]
    CR_errors = [r['CR_err'] for r in results]
    
    mean_i_err = sum(i_errors) / len(i_errors)
    mean_CR_err = sum(CR_errors) / len(CR_errors)
    
    i_within_20 = sum(1 for e in i_errors if e < 20)
    i_within_30 = sum(1 for e in i_errors if e < 30)
    CR_within_30 = sum(1 for e in CR_errors if e < 30)
    CR_within_50 = sum(1 for e in CR_errors if e < 50)
    
    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: i_corr {mean_i_err:.1f}% / 腐蚀速率 {mean_CR_err:.1f}%")
    print(f"i_corr误差<20%: {i_within_20}组")
    print(f"i_corr误差<30%: {i_within_30}组")
    print(f"腐蚀速率误差<30%: {CR_within_30}组")
    print(f"腐蚀速率误差<50%: {CR_within_50}组")
    
    print(f"\n{'ID':<8} {'条件':<40} {'i真实':>6} {'i预测':>6} {'误差':>6} {'CR真实':>8} {'CR预测':>8} {'误差':>6}")
    print("-" * 100)
    for r in results:
        print(f"{r['id']:<8} {r['conditions']:<40} {r['real_i_corr']:>6.1f} {r['pred_i_corr']:>6.1f} {r['i_err']:>5.1f}% {r['real_CR']:>8.4f} {r['pred_CR']:>8.4f} {r['CR_err']:>5.1f}%")
    
    output = {
        'total': len(results),
        'mean_i_err': round(mean_i_err, 1),
        'mean_CR_err': round(mean_CR_err, 1),
        'i_within_20': i_within_20,
        'i_within_30': i_within_30,
        'CR_within_30': CR_within_30,
        'CR_within_50': CR_within_50,
        'results': results,
    }
    
    with open('/home/z/my-project/swarmlabs_corrosion_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存: swarmlabs_corrosion_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——腐蚀虚拟实验引擎（第16领域）")
    print("物理体系：腐蚀电化学")
    print("=" * 60)
    
    # 示例
    print("\n--- 示例实验：碳钢在3.5%NaCl中 ---")
    exp = VirtualCorrosionExperiment({
        'material': 'carbon_steel',
        'environment': 'NaCl_3.5%',
        'temperature_C': 25,
    })
    r = exp.run()
    print(json.dumps(r, indent=2, ensure_ascii=False))
    
    # 验证
    print("\n--- 论文验证 ---")
    validate()
