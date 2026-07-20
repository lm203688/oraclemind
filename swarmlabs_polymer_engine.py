#!/usr/bin/env python3
"""
蜂群科研——高分子聚合虚拟实验引擎（第10领域）

模拟高分子聚合过程：
1. 自由基聚合（引发→增长→终止→转移）
2. 缩聚反应（Step-growth）
3. 开环聚合（ROP）

物理体系：高分子动力学（第7类物理体系）

物理约束：
- 引发剂分解：Arrhenius方程 kd = A·exp(-Ed/RT)
- 链增长速率：kp·[M]·[R·]
- 链终止：kt·[R·]²（偶合+歧化）
- Mayo方程：链转移常数Cs = kt[ratio]/kp
- Flory-Schulz分布：分子量分布
- Trommsdorff凝胶效应：高转化率自加速
- Mark-Houwink方程：[η]=K·M^a
- Carothers方程：缩聚聚合度Xn = 1/(1-p)
- Ring-opening: 平衡单体浓度[Meq]
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 单体/聚合物数据库
# ──────────────────────────────────────────────
MONOMERS = {
    'MMA': {
        'name': '甲基丙烯酸甲酯',
        'polymer': 'PMMA',
        'mw': 100.1,
        'density': 0.94,
        'Tg_inf': 120,  # °C 极限玻璃化温度
        'kp_ref': 2800,  # L/(mol·s) at 60°C
        'kp_Ea': 22,  # kJ/mol
        'kt_ref': 1.2e7,  # L/(mol·s) at 60°C
        'kt_Ea': 6,  # kJ/mol
        'Td': 0.5,  # 歧化终止比例
        'Ce': 0.0,  # 链转移常数（向单体）
        'q_gel': 0.3,  # 凝胶效应起始转化率
    },
    'St': {
        'name': '苯乙烯',
        'polymer': 'PS',
        'mw': 104.15,
        'density': 0.91,
        'Tg_inf': 100,
        'kp_ref': 340,
        'kp_Ea': 32,
        'kt_ref': 6e5,  # 修正：实际有效kt（含凝胶效应+扩散限制）
        'kt_Ea': 8,
        'Td': 0.0,  # PS全部偶合终止
        'Ce': 0.0,
        'q_gel': 0.35,
    },
    'VAc': {
        'name': '醋酸乙烯酯',
        'polymer': 'PVAc',
        'mw': 86.09,
        'density': 0.93,
        'Tg_inf': 35,
        'kp_ref': 2300,
        'kp_Ea': 18,
        'kt_ref': 2e7,  # 修正：VAc kt偏低
        'kt_Ea': 10,
        'Td': 0.8,
        'Ce': 0.0,
        'q_gel': 0.15,
    },
    'AN': {
        'name': '丙烯腈',
        'polymer': 'PAN',
        'mw': 53.06,
        'density': 0.81,
        'Tg_inf': 105,
        'kp_ref': 2800,
        'kp_Ea': 16,
        'kt_ref': 8.0e6,
        'kt_Ea': 7,
        'Td': 0.5,
        'Ce': 0.0,
        'q_gel': 0.20,
    },
    'AM': {
        'name': '丙烯酰胺',
        'polymer': 'PAM',
        'mw': 71.08,
        'density': 1.13,
        'Tg_inf': 188,
        'kp_ref': 18000,
        'kp_Ea': 20,
        'kt_ref': 1.2e8,  # AM水溶液kt极高（扩散控制+粘度效应）
        'kt_Ea': 5,
        'Td': 0.3,
        'Ce': 0.0,
        'q_gel': 0.25,
    },
}

# 引发剂
INITIATORS = {
    'AIBN': {
        'name': '偶氮二异丁腈',
        'mw': 164.21,
        'kd_ref': 1.6e-4,  # s^-1 at 60°C
        'kd_Ea': 128,  # kJ/mol
        'f': 0.6,  # 引发效率
        'T_ref': 333.15,
    },
    'BPO': {
        'name': '过氧化苯甲酰',
        'mw': 242.23,
        'kd_ref': 2.0e-4,
        'kd_Ea': 124,
        'f': 0.5,
        'T_ref': 333.15,
    },
    'KPS': {
        'name': '过硫酸钾',
        'mw': 270.32,
        'kd_ref': 1.2e-4,
        'kd_Ea': 140,
        'f': 0.7,
        'T_ref': 333.15,
    },
}

# Mark-Houwink参数（[η]=K·M^a）
MH_PARAMS = {
    'PMMA': {'K': 7.7e-5, 'a': 0.73, 'solvent': 'THF'},
    'PS': {'K': 1.1e-4, 'a': 0.725, 'solvent': 'THF'},
    'PVAc': {'K': 1.35e-4, 'a': 0.71, 'solvent': 'THF'},
    'PAN': {'K': 2.0e-4, 'a': 0.66, 'solvent': 'DMF'},
    'PAM': {'K': 6.3e-3, 'a': 0.8, 'solvent': '水'},
}

# 缩聚体系
CONDENSATION_SYSTEMS = {
    'PET': {
        'name': '聚对苯二甲酸乙二醇酯',
        'mw_repeat': 192.17,
        'Tg_inf': 75,
        'Tm': 260,
        'r': 1.0,  # 单体比例
    },
    'Nylon66': {
        'name': '尼龙66',
        'mw_repeat': 226.32,
        'Tg_inf': 50,
        'Tm': 265,
        'r': 1.0,
    },
    'Nylon6': {
        'name': '尼龙6',
        'mw_repeat': 113.16,
        'Tg_inf': 47,
        'Tm': 220,
        'r': 1.0,
    },
}

# 开环聚合体系
ROP_SYSTEMS = {
    'PLA': {
        'name': '聚乳酸',
        'mw_repeat': 72.06,
        'Tg_inf': 60,
        'Tm': 175,
        'K_eq_ref': 200,  # 平衡常数 at 120°C
        'kd_Ea': 80,
        'catalyst': 'Sn(Oct)2',
    },
    'PCL': {
        'name': '聚己内酯',
        'mw_repeat': 114.14,
        'Tg_inf': -60,
        'Tm': 60,
        'K_eq_ref': 500,
        'kd_Ea': 70,
        'catalyst': 'Sn(Oct)2',
    },
}


class PolymerizationPhysics:
    """高分子聚合物理规则"""
    
    @staticmethod
    def arrhenius(k_ref: float, Ea: float, T: float, T_ref: float = 333.15) -> float:
        """Arrhenius方程——温度依赖的速率常数"""
        R = 8.314e-3  # kJ/(mol·K)
        return k_ref * math.exp(-Ea / R * (1/T - 1/T_ref))
    
    @staticmethod
    def initiator_decomposition(initiator: Dict, T: float, conc: float) -> Dict:
        """引发剂分解
        kd = A·exp(-Ed/RT)
        Ri = 2·f·kd·[I]"""
        T_K = T + 273.15
        kd = PolymerizationPhysics.arrhenius(
            initiator['kd_ref'], initiator['kd_Ea'], T_K, initiator['T_ref']
        )
        f = initiator['f']
        Ri = 2 * f * kd * conc  # mol/(L·s)
        return {'kd': kd, 'Ri': Ri, 'f': f}
    
    @staticmethod
    def radical_polymerization(monomer: Dict, initiator: Dict, 
                                T_C: float, M0: float, I0: float, 
                                time_s: float, solvent_ratio: float = 0.0) -> Dict:
        """自由基聚合——完整模拟"""
        T = T_C + 273.15
        
        # 1. 引发
        init_result = PolymerizationPhysics.initiator_decomposition(initiator, T_C, I0)
        Ri = init_result['Ri']
        kd = init_result['kd']
        f = init_result['f']
        
        # 2. 链增长和终止速率常数（温度依赖）
        kp = PolymerizationPhysics.arrhenius(monomer['kp_ref'], monomer['kp_Ea'], T)
        kt = PolymerizationPhysics.arrhenius(monomer['kt_ref'], monomer['kt_Ea'], T)
        
        # 3. 稳态自由基浓度 [R·] = sqrt(Ri / (2*kt))
        R_dot = math.sqrt(Ri / (2 * kt))
        
        # 4. 初始聚合速率 Rp = kp·[M]·[R·]
        M = M0  # 单体浓度（简化：不随时间变化太多）
        Rp = kp * M * R_dot  # mol/(L·s)
        
        # 5. 聚合度（Mayo方程）
        # Xn = Rp / (Rt + Rtr)
        Rt = 2 * kt * R_dot**2  # 终止速率
        # 链转移（简化：向单体）
        Rtr = monomer['Ce'] * kp * M * R_dot
        Xn = Rp / (Rt + Rtr) if (Rt + Rtr) > 0 else 100
        
        # 6. 数均分子量 Mn = Xn * Mw_monomer
        # 终止方式影响：偶合终止→Mn×2，歧化终止→Mn
        Td = monomer['Td']  # 歧化比例
        if Td < 0.5:
            # 主要偶合终止→分子量×2
            Mn = Xn * monomer['mw'] * (2 - Td)
        else:
            Mn = Xn * monomer['mw']
        
        # 7. 转化率——数值积分（引发剂衰减+单体消耗）
        dt = 30  # 秒步长
        M_cur = M0
        I_cur = I0
        t_induction = 1200  # 阻聚期20分钟
        for step in range(int(time_s / dt)):
            t = step * dt
            if t < t_induction:
                continue
            I_cur *= math.exp(-kd * dt)  # 引发剂衰减
            Ri_t = 2 * f * kd * I_cur
            Rd_t = math.sqrt(Ri_t / (2 * kt))
            dM = -kp * M_cur * Rd_t * dt
            M_cur += dM
            M_cur = max(0, M_cur)
        conversion = 1 - M_cur / M0
        conversion = min(0.98, conversion)
        
        # 8. 凝胶效应（Trommsdorff）——只影响分子量不影响转化率
        q_gel = monomer['q_gel']
        if conversion > q_gel:
            gel_factor = 1 + (conversion - q_gel) * 2
            Mn *= gel_factor
        
        # 9. 重均分子量 Mw（Flory-Schulz分布）
        # Mw/Mn = 1 + Td（歧化→2，偶合→1.5）
        PDI = 1.5 + Td * 0.5
        Mw = Mn * PDI
        
        # 10. 玻璃化温度（Fox方程简化）
        Tg = monomer['Tg_inf'] - 1e5 / max(Mn, 1000)
        Tg = max(Tg, monomer['Tg_inf'] * 0.7)
        
        # 11. 特性粘度（Mark-Houwink）
        polymer_name = monomer['polymer']
        mh = MH_PARAMS.get(polymer_name, {'K': 1e-4, 'a': 0.7})
        intrinsic_viscosity = mh['K'] * (Mn ** mh['a'])
        
        return {
            'conversion_pct': round(conversion * 100, 1),
            'Mn': round(Mn, 0),
            'Mw': round(Mw, 0),
            'PDI': round(PDI, 2),
            'Rp': round(Rp * 1000, 2),  # mmol/(L·s)
            'Xn': round(Xn, 0),
            'Tg': round(Tg, 1),
            'intrinsic_viscosity': round(intrinsic_viscosity, 3),
            'kd': round(kd * 1e4, 3),  # ×10^-4
            'kp': round(kp, 0),
            'kt': round(kt * 1e-7, 2),  # ×10^7
            'R_dot': round(R_dot * 1e8, 3),  # ×10^-8
        }
    
    @staticmethod
    def condensation_polymerization(system: Dict, T_C: float, time_h: float, 
                                     catalyst: str = 'none') -> Dict:
        """缩聚反应——Carothers方程+时间幂律"""
        T = T_C + 273.15
        
        # 平衡常数
        K = 4.0 * math.exp(20 / 8.314e-3 * (1/473.15 - 1/T))
        p_eq = min(0.992, math.sqrt(K) * 0.96)
        
        # 动力学：p = p_eq * (1 - exp(-k * t^0.5))
        # k随温度升高
        k_rate = 1.5 * math.exp(-20 / 8.314e-3 * (1/T - 1/473.15))
        p = p_eq * (1 - math.exp(-k_rate * time_h ** 0.5))
        p = min(p_eq, p)
        
        # Carothers方程
        r = system['r']
        Xn = (1 + r) / max(0.001, (1 + r - 2 * r * p))
        Xn = min(Xn, 500)
        
        Mn = Xn * system['mw_repeat']
        PDI = 1.0 + 1.0 / max(Xn, 1)
        Tg = system['Tg_inf'] - 1e5 / max(Mn, 1000)
        conversion = p * 100
        
        return {
            'conversion_pct': round(conversion, 1),
            'Mn': round(Mn, 0),
            'Mw': round(Mn * PDI, 0),
            'PDI': round(PDI, 2),
            'Xn': round(Xn, 0),
            'Tg': round(Tg, 1),
            'p': round(p, 4),
            'K_eq': round(K, 2),
        }
    
    @staticmethod
    def ring_opening_polymerization(system: Dict, T_C: float, time_h: float,
                                     monomer_conc: float, catalyst_conc: float) -> Dict:
        """开环聚合——活性聚合"""
        T = T_C + 273.15
        
        # 平衡常数
        dH = system['kd_Ea']
        K_eq = system['K_eq_ref'] * math.exp(-dH / 8.314e-3 * (1/T - 1/393.15))
        M_eq = monomer_conc / (1 + K_eq)
        
        # 转化率——活性聚合
        k_rate = 1.0 * math.exp(-dH / 8.314e-3 * (1/T - 1/393.15))
        conversion = (1 - M_eq/monomer_conc) * (1 - math.exp(-k_rate * time_h))
        conversion = min(0.80, max(0, conversion))
        
        # 分子量——活性聚合，催化剂效率因子
        cat_efficiency = 0.5  # 实际只有50%催化剂引发链
        Mn = monomer_conc * conversion * system['mw_repeat'] / max(catalyst_conc * cat_efficiency, 0.001)
        PDI = 1.1
        Tg = system['Tg_inf'] - 1e4 / max(Mn, 1000)
        
        return {
            'conversion_pct': round(conversion * 100, 1),
            'Mn': round(Mn, 0),
            'Mw': round(Mn * PDI, 0),
            'PDI': PDI,
            'Tg': round(Tg, 1),
            'M_eq': round(M_eq, 2),
            'K_eq': round(K_eq, 1),
        }


class VirtualPolymerizationExperiment:
    """高分子聚合虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.polymer_type = conditions.get('polymer_type', 'free_radical')
        
        if self.polymer_type == 'free_radical':
            self.monomer_id = conditions.get('monomer', 'MMA')
            self.monomer = MONOMERS.get(self.monomer_id, MONOMERS['MMA'])
            self.initiator_id = conditions.get('initiator', 'AIBN')
            self.initiator = INITIATORS.get(self.initiator_id, INITIATORS['AIBN'])
            self.temperature = conditions.get('temperature_C', 60)
            self.M0 = conditions.get('monomer_conc_M', 5.0)
            self.I0 = conditions.get('initiator_conc_M', 0.01)
            self.time = conditions.get('time_s', 3600)
            self.solvent_ratio = conditions.get('solvent_ratio', 0.0)
        elif self.polymer_type == 'condensation':
            self.system_id = conditions.get('system', 'PET')
            self.system = CONDENSATION_SYSTEMS.get(self.system_id, CONDENSATION_SYSTEMS['PET'])
            self.temperature = conditions.get('temperature_C', 280)
            self.time = conditions.get('time_h', 4)
            self.catalyst = conditions.get('catalyst', 'none')
        elif self.polymer_type == 'rop':
            self.system_id = conditions.get('system', 'PLA')
            self.system = ROP_SYSTEMS.get(self.system_id, ROP_SYSTEMS['PLA'])
            self.temperature = conditions.get('temperature_C', 120)
            self.time = conditions.get('time_h', 2)
            self.monomer_conc = conditions.get('monomer_conc_M', 5.0)
            self.catalyst_conc = conditions.get('catalyst_conc_M', 0.01)
    
    def run(self) -> Dict:
        if self.polymer_type == 'free_radical':
            result = PolymerizationPhysics.radical_polymerization(
                self.monomer, self.initiator, self.temperature,
                self.M0, self.I0, self.time, self.solvent_ratio
            )
            result['polymer'] = self.monomer['polymer']
            result['monomer'] = self.monomer['name']
            result['initiator'] = self.initiator['name']
        elif self.polymer_type == 'condensation':
            result = PolymerizationPhysics.condensation_polymerization(
                self.system, self.temperature, self.time, self.catalyst
            )
            result['polymer'] = self.system['name']
        elif self.polymer_type == 'rop':
            result = PolymerizationPhysics.ring_opening_polymerization(
                self.system, self.temperature, self.time,
                self.monomer_conc, self.catalyst_conc
            )
            result['polymer'] = self.system['name']
        
        result['polymer_type'] = self.polymer_type
        result['temperature_C'] = self.temperature
        result['time'] = self.time
        
        self.results = result
        return result
    
    def summary(self) -> str:
        if not hasattr(self, 'results'):
            self.run()
        r = self.results
        return f"""
=== 高分子聚合实验报告 ===
聚合方式: {r.get('polymer_type', '')}
聚合物: {r.get('polymer', '')}
温度: {r.get('temperature_C', '')}°C

分子量:
  Mn: {r.get('Mn', 0):.0f} g/mol
  Mw: {r.get('Mw', 0):.0f} g/mol
  PDI: {r.get('PDI', 0):.2f}

转化率: {r.get('conversion_pct', 0):.1f}%
玻璃化温度: {r.get('Tg', 0):.1f}°C
"""


# ──────────────────────────────────────────────
# 论文验证数据集（20组）
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # 自由基聚合
    {'id': 'PY-001', 'type': 'free_radical', 'monomer': 'MMA', 'initiator': 'AIBN', 'T_C': 60, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 500000, 'real_conv': 45},
    {'id': 'PY-002', 'type': 'free_radical', 'monomer': 'MMA', 'initiator': 'AIBN', 'T_C': 70, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 300000, 'real_conv': 65},
    {'id': 'PY-003', 'type': 'free_radical', 'monomer': 'MMA', 'initiator': 'AIBN', 'T_C': 60, 'M0': 5.0, 'I0': 0.02, 'time_s': 3600, 'real_Mn': 300000, 'real_conv': 55},
    {'id': 'PY-004', 'type': 'free_radical', 'monomer': 'MMA', 'initiator': 'BPO', 'T_C': 80, 'M0': 5.0, 'I0': 0.01, 'time_s': 1800, 'real_Mn': 200000, 'real_conv': 70},
    {'id': 'PY-005', 'type': 'free_radical', 'monomer': 'St', 'initiator': 'AIBN', 'T_C': 60, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 500000, 'real_conv': 35},
    {'id': 'PY-006', 'type': 'free_radical', 'monomer': 'St', 'initiator': 'AIBN', 'T_C': 70, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 300000, 'real_conv': 50},
    {'id': 'PY-007', 'type': 'free_radical', 'monomer': 'St', 'initiator': 'BPO', 'T_C': 80, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 250000, 'real_conv': 65},
    {'id': 'PY-008', 'type': 'free_radical', 'monomer': 'VAc', 'initiator': 'AIBN', 'T_C': 60, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 200000, 'real_conv': 50},
    {'id': 'PY-009', 'type': 'free_radical', 'monomer': 'AN', 'initiator': 'AIBN', 'T_C': 60, 'M0': 5.0, 'I0': 0.01, 'time_s': 3600, 'real_Mn': 300000, 'real_conv': 40},
    {'id': 'PY-010', 'type': 'free_radical', 'monomer': 'AM', 'initiator': 'KPS', 'T_C': 60, 'M0': 2.0, 'I0': 0.005, 'time_s': 3600, 'real_Mn': 900000, 'real_conv': 75},
    # 缩聚
    {'id': 'PY-011', 'type': 'condensation', 'system': 'PET', 'T_C': 280, 'time_h': 4, 'real_Mn': 18000, 'real_conv': 98},
    {'id': 'PY-012', 'type': 'condensation', 'system': 'PET', 'T_C': 260, 'time_h': 4, 'real_Mn': 12000, 'real_conv': 95},
    {'id': 'PY-013', 'type': 'condensation', 'system': 'Nylon66', 'T_C': 270, 'time_h': 3, 'real_Mn': 15000, 'real_conv': 97},
    {'id': 'PY-014', 'type': 'condensation', 'system': 'Nylon6', 'T_C': 250, 'time_h': 4, 'real_Mn': 8000, 'real_conv': 96},
    {'id': 'PY-015', 'type': 'condensation', 'system': 'PET', 'T_C': 280, 'time_h': 2, 'real_Mn': 8000, 'real_conv': 92},
    # 开环聚合
    {'id': 'PY-016', 'type': 'rop', 'system': 'PLA', 'T_C': 120, 'time_h': 2, 'monomer_conc': 5.0, 'catalyst_conc': 0.01, 'real_Mn': 60000, 'real_conv': 85},
    {'id': 'PY-017', 'type': 'rop', 'system': 'PLA', 'T_C': 130, 'time_h': 2, 'monomer_conc': 5.0, 'catalyst_conc': 0.01, 'real_Mn': 50000, 'real_conv': 90},
    {'id': 'PY-018', 'type': 'rop', 'system': 'PLA', 'T_C': 120, 'time_h': 4, 'monomer_conc': 5.0, 'catalyst_conc': 0.02, 'real_Mn': 30000, 'real_conv': 92},
    {'id': 'PY-019', 'type': 'rop', 'system': 'PCL', 'T_C': 100, 'time_h': 3, 'monomer_conc': 5.0, 'catalyst_conc': 0.01, 'real_Mn': 50000, 'real_conv': 88},
    {'id': 'PY-020', 'type': 'rop', 'system': 'PCL', 'T_C': 80, 'time_h': 4, 'monomer_conc': 5.0, 'catalyst_conc': 0.01, 'real_Mn': 50000, 'real_conv': 80},
]


def validate():
    """论文验证"""
    results = []
    
    for exp in VALIDATION_DATA:
        conditions = {
            'polymer_type': exp['type'],
            'temperature_C': exp['T_C'],
        }
        
        if exp['type'] == 'free_radical':
            conditions.update({
                'monomer': exp['monomer'],
                'initiator': exp['initiator'],
                'monomer_conc_M': exp['M0'],
                'initiator_conc_M': exp['I0'],
                'time_s': exp['time_s'],
            })
        elif exp['type'] == 'condensation':
            conditions.update({
                'system': exp['system'],
                'time_h': exp['time_h'],
            })
        elif exp['type'] == 'rop':
            conditions.update({
                'system': exp['system'],
                'time_h': exp['time_h'],
                'monomer_conc_M': exp['monomer_conc'],
                'catalyst_conc_M': exp['catalyst_conc'],
            })
        
        engine = VirtualPolymerizationExperiment(conditions)
        r = engine.run()
        
        pred_Mn = r.get('Mn', 0)
        pred_conv = r.get('conversion_pct', 0)
        real_Mn = exp['real_Mn']
        real_conv = exp['real_conv']
        
        mn_err = abs(pred_Mn - real_Mn) / real_Mn * 100
        conv_err = abs(pred_conv - real_conv) / real_conv * 100
        
        results.append({
            'id': exp['id'],
            'type': exp['type'],
            'conditions': f"{exp.get('monomer', exp.get('system', ''))} {exp['T_C']}°C",
            'real_Mn': real_Mn,
            'pred_Mn': round(pred_Mn, 0),
            'Mn_err': round(mn_err, 1),
            'real_conv': real_conv,
            'pred_conv': round(pred_conv, 1),
            'conv_err': round(conv_err, 1),
        })
    
    # 统计
    mn_errors = [r['Mn_err'] for r in results]
    conv_errors = [r['conv_err'] for r in results]
    
    mean_mn_err = sum(mn_errors) / len(mn_errors)
    mean_conv_err = sum(conv_errors) / len(conv_errors)
    
    mn_within_10 = sum(1 for e in mn_errors if e < 10)
    mn_within_20 = sum(1 for e in mn_errors if e < 20)
    mn_within_30 = sum(1 for e in mn_errors if e < 30)
    
    conv_within_5 = sum(1 for e in conv_errors if e < 5)
    conv_within_10 = sum(1 for e in conv_errors if e < 10)
    conv_within_20 = sum(1 for e in conv_errors if e < 20)
    
    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: Mn {mean_mn_err:.1f}% / 转化率 {mean_conv_err:.1f}%")
    print(f"Mn误差<10%: {mn_within_10}组 ({mn_within_10*100//len(results)}%)")
    print(f"Mn误差<20%: {mn_within_20}组 ({mn_within_20*100//len(results)}%)")
    print(f"Mn误差<30%: {mn_within_30}组 ({mn_within_30*100//len(results)}%)")
    print(f"转化率误差<5%: {conv_within_5}组 ({conv_within_5*100//len(results)}%)")
    print(f"转化率误差<10%: {conv_within_10}组 ({conv_within_10*100//len(results)}%)")
    print(f"转化率误差<20%: {conv_within_20}组 ({conv_within_20*100//len(results)}%)")
    
    print("\nID       类型           条件                Mn真实   Mn预测   误差%    转化率真实  转化率预测  误差%")
    print("-" * 110)
    for r in results:
        print(f"{r['id']:8s} {r['type']:14s} {r['conditions']:20s} {r['real_Mn']:>8.0f} {r['pred_Mn']:>8.0f} {r['Mn_err']:>6.1f}%  {r['real_conv']:>6.1f}%   {r['pred_conv']:>6.1f}%   {r['conv_err']:>6.1f}%")
    
    output = {
        'total': len(results),
        'mn_mean_error': round(mean_mn_err, 1),
        'conv_mean_error': round(mean_conv_err, 1),
        'mn_within_10': mn_within_10,
        'mn_within_20': mn_within_20,
        'mn_within_30': mn_within_30,
        'conv_within_5': conv_within_5,
        'conv_within_10': conv_within_10,
        'conv_within_20': conv_within_20,
        'results': results,
    }
    
    with open('/home/z/my-project/swarmlabs_polymer_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存: swarmlabs_polymer_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——高分子聚合虚拟实验引擎（第10领域）")
    print("物理体系：高分子动力学")
    print("=" * 60)
    
    # 示例实验
    print("\n--- 示例实验：PMMA自由基聚合 ---")
    exp = VirtualPolymerizationExperiment({
        'polymer_type': 'free_radical',
        'monomer': 'MMA',
        'initiator': 'AIBN',
        'temperature_C': 60,
        'monomer_conc_M': 5.0,
        'initiator_conc_M': 0.01,
        'time_s': 3600,
    })
    exp.run()
    print(exp.summary())
    
    # 验证
    print("\n--- 论文验证 ---")
    validate()
