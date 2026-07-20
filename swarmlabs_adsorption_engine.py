#!/usr/bin/env python3
"""
蜂群科研——吸附虚拟实验引擎（第12领域）

模拟吸附过程：
1. 液相吸附（活性炭/沸石/MOF）
2. 气相吸附（变压吸附PSA/变温吸附TSA）
3. 吸附动力学（伪一阶/伪二阶）

物理体系：表面吸附动力学（第9类物理体系）

物理约束：
- Langmuir等温线：q = qmax*b*C/(1+b*C)
- Freundlich等温线：q = K*C^(1/n)
- BET多分子层吸附
- 伪一阶动力学：dq/dt = k1*(qe-q)
- 伪二阶动力学：dq/dt = k2*(qe-q)^2
- 颗粒内扩散模型（IPD）
- van't Hoff温度依赖：b = b0*exp(-ΔH/RT)
- 竞争吸附（多组分Langmuir）
- 吸附热效应
"""

import json, math
from typing import Dict

# ──────────────────────────────────────────────
# 吸附剂数据库
# ──────────────────────────────────────────────
ADSORBENTS = {
    'activated_carbon': {
        'name': '活性炭',
        'type': 'carbon',
        'surface_area_m2_g': 1200,  # BET比表面积
        'pore_volume_cm3_g': 0.6,
        'avg_pore_nm': 2.0,
        'q_max_mg_g': 500,
        'b_L_mg_L': 10,  # Langmuir常数 L/mg
        'n_F': 2.5,  # Freundlich常数
        'K_F': 50,  # Freundlich容量常数
        'delta_H_kJ_mol': -80,
        'k1_1_min': 0.05,  # 伪一阶速率常数 1/min
        'k2_g_mg_min': 0.002,  # 伪二阶速率常数 g/(mg·min)
        'regeneration_C': 150,
    },
    'zeolite_13X': {
        'name': '沸石13X',
        'type': 'zeolite',
        'surface_area_m2_g': 700,
        'pore_volume_cm3_g': 0.3,
        'avg_pore_nm': 1.3,
        'q_max_mg_g': 300,
        'b_L_mg_L': 10,
        'n_F': 3.0,
        'K_F': 80,
        'delta_H_kJ_mol': -100,
        'k1_1_min': 0.08,
        'k2_g_mg_min': 0.005,
        'regeneration_C': 250,
    },
    'MOF_ZIF8': {
        'name': 'ZIF-8金属有机框架',
        'type': 'MOF',
        'surface_area_m2_g': 1800,
        'pore_volume_cm3_g': 0.8,
        'avg_pore_nm': 1.1,
        'q_max_mg_g': 800,
        'b_L_mg_L': 1.5,
        'n_F': 2.8,
        'K_F': 120,
        'delta_H_kJ_mol': -20,
        'k1_1_min': 0.12,
        'k2_g_mg_min': 0.008,
        'regeneration_C': 200,
    },
    'Fe2O3': {
        'name': '氧化铁',
        'type': 'metal_oxide',
        'surface_area_m2_g': 150,
        'pore_volume_cm3_g': 0.3,
        'avg_pore_nm': 10,
        'q_max_mg_g': 200,
        'b_L_mg_L': 8.0,
        'k2_g_mg_min': 0.003,
        'delta_H_kJ_mol': 25,
        'affinity_factor': 0.7,
        'K_F': 30,
        'n_F': 2.2,
    },
    'Al2O3': {
        'name': '氧化铝',
        'type': 'metal_oxide',
        'surface_area_m2_g': 200,
        'pore_volume_cm3_g': 0.4,
        'avg_pore_nm': 8,
        'q_max_mg_g': 180,
        'b_L_mg_L': 6.0,
        'k2_g_mg_min': 0.004,
        'delta_H_kJ_mol': 22,
        'affinity_factor': 0.65,
        'K_F': 25,
        'n_F': 2.0,
    },
    'zeolite_4A': {
        'name': '沸石4A',
        'type': 'zeolite',
        'surface_area_m2_g': 400,
        'pore_volume_cm3_g': 0.3,
        'avg_pore_nm': 0.38,
        'q_max_mg_g': 250,
        'b_L_mg_L': 12.0,
        'k2_g_mg_min': 0.006,
        'delta_H_kJ_mol': 30,
        'affinity_factor': 0.8,
        'K_F': 40,
        'n_F': 2.8,
    },
    'MOF_808': {
        'name': 'MOF-808',
        'type': 'MOF',
        'surface_area_m2_g': 1000,
        'pore_volume_cm3_g': 0.6,
        'avg_pore_nm': 1.8,
        'q_max_mg_g': 600,
        'b_L_mg_L': 15.0,
        'k2_g_mg_min': 0.007,
        'delta_H_kJ_mol': 35,
        'affinity_factor': 0.9,
        'K_F': 60,
        'n_F': 3.0,
    },
    'UiO_66': {
        'name': 'UiO-66',
        'type': 'MOF',
        'surface_area_m2_g': 1100,
        'pore_volume_cm3_g': 0.5,
        'avg_pore_nm': 0.6,
        'q_max_mg_g': 400,
        'b_L_mg_L': 10.0,
        'k2_g_mg_min': 0.005,
        'delta_H_kJ_mol': 28,
        'affinity_factor': 0.85,
        'K_F': 45,
        'n_F': 2.5,
    },
    'MIL_101': {
        'name': 'MIL-101',
        'type': 'MOF',
        'surface_area_m2_g': 3000,
        'pore_volume_cm3_g': 2.0,
        'avg_pore_nm': 3.4,
        'q_max_mg_g': 700,
        'b_L_mg_L': 18.0,
        'k2_g_mg_min': 0.008,
        'delta_H_kJ_mol': 40,
        'affinity_factor': 0.95,
        'K_F': 70,
        'n_F': 3.2,
    },
    'montmorillonite': {
        'name': '蒙脱土',
        'type': 'clay',
        'surface_area_m2_g': 250,
        'pore_volume_cm3_g': 0.2,
        'avg_pore_nm': 1.5,
        'q_max_mg_g': 150,
        'b_L_mg_L': 5.0,
        'k2_g_mg_min': 0.003,
        'delta_H_kJ_mol': 20,
        'affinity_factor': 0.6,
        'K_F': 20,
        'n_F': 1.8,
    },
    'kaolin': {
        'name': '高岭土',
        'type': 'clay',
        'surface_area_m2_g': 100,
        'pore_volume_cm3_g': 0.15,
        'avg_pore_nm': 1.0,
        'q_max_mg_g': 80,
        'b_L_mg_L': 3.0,
        'k2_g_mg_min': 0.002,
        'delta_H_kJ_mol': 18,
        'affinity_factor': 0.5,
        'K_F': 15,
        'n_F': 1.5,
    },
    'CNT': {
        'name': '碳纳米管',
        'type': 'carbon',
        'surface_area_m2_g': 400,
        'pore_volume_cm3_g': 0.5,
        'avg_pore_nm': 3.0,
        'q_max_mg_g': 300,
        'b_L_mg_L': 14.0,
        'k2_g_mg_min': 0.006,
        'delta_H_kJ_mol': 30,
        'affinity_factor': 0.85,
        'K_F': 55,
        'n_F': 2.7,
    },
    'graphene_oxide': {
        'name': '氧化石墨烯',
        'type': 'carbon',
        'surface_area_m2_g': 800,
        'pore_volume_cm3_g': 0.8,
        'avg_pore_nm': 2.0,
        'q_max_mg_g': 500,
        'b_L_mg_L': 16.0,
        'k2_g_mg_min': 0.007,
        'delta_H_kJ_mol': 32,
        'affinity_factor': 0.9,
        'K_F': 65,
        'n_F': 3.0,
    },
    'chitosan': {
        'name': '壳聚糖',
        'type': 'polymer',
        'surface_area_m2_g': 50,
        'pore_volume_cm3_g': 0.1,
        'avg_pore_nm': 5.0,
        'q_max_mg_g': 120,
        'b_L_mg_L': 4.0,
        'k2_g_mg_min': 0.002,
        'delta_H_kJ_mol': 15,
        'affinity_factor': 0.55,
        'K_F': 18,
        'n_F': 1.6,
    },
    'biochar': {
        'name': '生物炭',
        'type': 'carbon',
        'surface_area_m2_g': 300,
        'pore_volume_cm3_g': 0.3,
        'avg_pore_nm': 2.5,
        'q_max_mg_g': 200,
        'b_L_mg_L': 8.0,
        'k2_g_mg_min': 0.004,
        'delta_H_kJ_mol': 22,
        'affinity_factor': 0.7,
        'K_F': 35,
        'n_F': 2.2,
    },
    'TiO2': {
        'name': '二氧化钛',
        'type': 'metal_oxide',
        'surface_area_m2_g': 180,
        'pore_volume_cm3_g': 0.3,
        'avg_pore_nm': 5.0,
        'q_max_mg_g': 160,
        'b_L_mg_L': 7.0,
        'k2_g_mg_min': 0.003,
        'delta_H_kJ_mol': 24,
        'affinity_factor': 0.62,
        'K_F': 22,
        'n_F': 1.9,
    },
    'GO': {
        'name': '氧化石墨烯',
        'type': 'carbon',
        'surface_area_m2_g': 850,
        'pore_volume_cm3_g': 0.9,
        'avg_pore_nm': 2.0,
        'q_max_mg_g': 520,
        'b_L_mg_L': 17.0,
        'k2_g_mg_min': 0.007,
        'delta_H_kJ_mol': 33,
        'affinity_factor': 0.92,
        'K_F': 68,
        'n_F': 3.1,
    },
    'attapulgite': {
        'name': '凹凸棒石',
        'type': 'clay',
        'surface_area_m2_g': 200,
        'pore_volume_cm3_g': 0.25,
        'avg_pore_nm': 1.0,
        'q_max_mg_g': 130,
        'b_L_mg_L': 4.5,
        'k2_g_mg_min': 0.003,
        'delta_H_kJ_mol': 19,
        'affinity_factor': 0.58,
        'K_F': 20,
        'n_F': 1.7,
    },
    'sepiolite': {
        'name': '海泡石',
        'type': 'clay',
        'surface_area_m2_g': 320,
        'pore_volume_cm3_g': 0.4,
        'avg_pore_nm': 0.5,
        'q_max_mg_g': 170,
        'b_L_mg_L': 6.0,
        'k2_g_mg_min': 0.004,
        'delta_H_kJ_mol': 21,
        'affinity_factor': 0.65,
        'K_F': 25,
        'n_F': 2.0,
    },
    'Fe3O4': {
        'name': '磁性Fe3O4',
        'type': 'metal_oxide',
        'surface_area_m2_g': 120,
        'pore_volume_cm3_g': 0.2,
        'avg_pore_nm': 8.0,
        'q_max_mg_g': 140,
        'b_L_mg_L': 5.5,
        'k2_g_mg_min': 0.003,
        'delta_H_kJ_mol': 20,
        'affinity_factor': 0.6,
        'K_F': 22,
        'n_F': 1.8,
    },
    'coconut_carbon': {
        'name': '椰壳活性炭',
        'type': 'carbon',
        'surface_area_m2_g': 1500,
        'pore_volume_cm3_g': 0.8,
        'avg_pore_nm': 2.0,
        'q_max_mg_g': 600,
        'b_L_mg_L': 20.0,
        'k2_g_mg_min': 0.009,
        'delta_H_kJ_mol': 35,
        'affinity_factor': 1.0,
        'K_F': 75,
        'n_F': 3.5,
    },
    'mesoporous_SiO2': {
        'name': '介孔二氧化硅SBA-15',
        'type': 'mesoporous',
        'surface_area_m2_g': 900,
        'pore_volume_cm3_g': 1.0,
        'avg_pore_nm': 6.0,
        'q_max_mg_g': 250,
        'b_L_mg_L': 5,
        'n_F': 2.0,
        'K_F': 20,
        'delta_H_kJ_mol': -15,
        'k1_1_min': 0.03,
        'k2_g_mg_min': 0.001,
        'affinity_factor': 0.3,
    },
}

# 吸附质数据
ADSORBATES = {
    'methylene_blue': {'mw': 319.85, 'size_nm': 1.4, 'charge': 1, 'hydrophobicity': 0.6, 'q_max_factor': 0.3},
    'phenol': {'mw': 94.11, 'size_nm': 0.5, 'charge': 0, 'hydrophobicity': 0.8, 'q_max_factor': 0.12},
    'Cu2_plus': {'mw': 63.55, 'size_nm': 0.15, 'charge': 2, 'hydrophobicity': 0, 'q_max_factor': 0.25},
    'Pb2_plus': {'mw': 207.2, 'size_nm': 0.24, 'charge': 2, 'hydrophobicity': 0, 'q_max_factor': 0.28},
    'CO2': {'mw': 44.01, 'size_nm': 0.33, 'charge': 0, 'hydrophobicity': 0, 'q_max_factor': 0.8},
    'N2': {'mw': 28.01, 'size_nm': 0.36, 'charge': 0, 'hydrophobicity': 0, 'q_max_factor': 0.5},
    'CH4': {'mw': 16.04, 'size_nm': 0.38, 'charge': 0, 'hydrophobicity': 0, 'q_max_factor': 0.3},
    'water_vapor': {'mw': 18.02, 'size_nm': 0.27, 'charge': 0, 'hydrophobicity': 0},
}


class AdsorptionPhysics:
    """吸附物理规则"""
    
    @staticmethod
    def langmuir_isotherm(C: float, q_max: float, b: float) -> float:
        """Langmuir等温线：q = qmax*b*C/(1+b*C)"""
        if C < 0:
            return 0
        return q_max * b * C / (1 + b * C)
    
    @staticmethod
    def freundlich_isotherm(C: float, K_F: float, n: float) -> float:
        """Freundlich等温线：q = K*C^(1/n)"""
        if C < 0:
            return 0
        return K_F * C ** (1.0 / n)
    
    @staticmethod
    def bet_isotherm(P: float, P0: float, c: float, qm: float) -> float:
        """BET多分子层吸附
        q = qm*c*(P/P0) / ((1-P/P0)*(1+(c-1)*P/P0))"""
        x = P / P0
        if x <= 0 or x >= 1:
            return 0
        return qm * c * x / ((1 - x) * (1 + (c - 1) * x))
    
    @staticmethod
    def langmuir_temp_correction(b_ref: float, T_ref: float, T: float, dH: float) -> float:
        """Langmuir常数的温度修正（van't Hoff）
        b(T) = b_ref * exp(-dH/R * (1/T - 1/T_ref))"""
        R = 8.314e-3  # kJ/(mol·K)
        return b_ref * math.exp(-dH / R * (1/T - 1/T_ref))
    
    @staticmethod
    def pseudo_first_order_kinetics(q_e: float, k1: float, t: float) -> float:
        """伪一阶动力学：q(t) = qe*(1-exp(-k1*t))"""
        return q_e * (1 - math.exp(-k1 * t))
    
    @staticmethod
    def pseudo_second_order_kinetics(q_e: float, k2: float, t: float) -> float:
        """伪二阶动力学：q(t) = k2*qe²*t / (1+k2*qe*t)"""
        return k2 * q_e**2 * t / (1 + k2 * q_e * t)
    
    @staticmethod
    def intraparticle_diffusion(k_id: float, t: float, C_ipd: float = 0) -> float:
        """颗粒内扩散模型：q(t) = k_id*t^0.5 + C"""
        return k_id * t**0.5 + C_ipd
    
    @staticmethod
    def competitive_langmuir(C_i: float, q_max: float, b_i: float, 
                              sum_bC: float) -> float:
        """竞争吸附（多组分Langmuir）
        q_i = qmax*b_i*C_i / (1 + sum(b_j*C_j))"""
        return q_max * b_i * C_i / (1 + sum_bC)
    
    @staticmethod
    def breakthrough_time(q_e: float, m_ads: float, C0: float, 
                          flow_rate: float, bed_volume: float) -> float:
        """穿透时间（Bohart-Adams简化）
        tb = q_e*m / (C0*Q)"""
        if C0 * flow_rate == 0:
            return 0
        return q_e * m_ads / (C0 * flow_rate)
    
    @staticmethod
    def adsorption_efficiency(C0: float, C_eq: float) -> float:
        """吸附效率 = (C0-Ceq)/C0 × 100%"""
        if C0 == 0:
            return 0
        return (C0 - C_eq) / C0 * 100


class VirtualAdsorptionExperiment:
    """吸附虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.adsorbent_id = conditions.get('adsorbent', 'activated_carbon')
        self.adsorbent = ADSORBENTS.get(self.adsorbent_id, ADSORBENTS['activated_carbon'])
        self.adsorbate = conditions.get('adsorbate', 'methylene_blue')
        self.initial_conc_mg_L = conditions.get('C0_mg_L', 100)
        self.temperature_C = conditions.get('temperature_C', 25)
        self.contact_time_min = conditions.get('time_min', 60)
        self.adsorbent_dose_g_L = conditions.get('dose_g_L', 1.0)
        self.pH = conditions.get('pH', 7.0)
        self.particle_size_um = conditions.get('particle_size_um', 100)
    
    def run(self) -> Dict:
        ads = self.adsorbent
        T = self.temperature_C + 273.15
        T_ref = 298.15
        C0 = self.initial_conc_mg_L
        
        # 1. 平衡吸附量（Langmuir + 温度修正）
        b = AdsorptionPhysics.langmuir_temp_correction(
            ads['b_L_mg_L'], T_ref, T, ads['delta_H_kJ_mol']
        )
        q_e_langmuir_0 = AdsorptionPhysics.langmuir_isotherm(C0, ads['q_max_mg_g'], b)
        
        # 2. Freundlich平衡
        q_e_freundlich = AdsorptionPhysics.freundlich_isotherm(
            C0, ads['K_F'], ads['n_F']
        )
        
        # 3. 选择主要模型——用q_max_factor修正
        adsorbate = ADSORBATES.get(self.adsorbate, {})
        q_factor = adsorbate.get('q_max_factor', 0.3)
        q_max_eff = ads['q_max_mg_g'] * q_factor * ads.get('affinity_factor', 1.0)
        q_e_langmuir = AdsorptionPhysics.langmuir_isotherm(C0, q_max_eff, b)
        
        if C0 < q_max_eff / b:
            q_e = q_e_langmuir
        else:
            q_e = (q_e_langmuir + q_e_freundlich) / 2
        
        # 4. pH效应
        if adsorbate.get('charge', 0) != 0:
            # 离子型吸附质受pH影响
            pH_opt = 6.0 if adsorbate['charge'] > 0 else 4.0
            pH_factor = math.exp(-0.1 * (self.pH - pH_opt)**2)
            q_e *= max(0.3, pH_factor)
        
        # 5. 平衡求解——联立Langmuir+质量守恒
        # q = qmax*b*C_eq/(1+b*C_eq)
        # C_eq = C0 - q*dose
        dose = self.adsorbent_dose_g_L
        q_max_eff = ads['q_max_mg_g'] * adsorbate.get('q_max_factor', 0.3) * ads.get('affinity_factor', 1.0)
        q_max_eff *= math.exp(0.03 * (25 - self.temperature_C))
        
        # 迭代求解
        q_e = min(q_max_eff * b * C0 / (1 + b * C0), C0 / dose * 0.85)
        for _ in range(100):
            C_eq = C0 - q_e * dose
            if C_eq < 0:
                q_e = C0 / dose * 0.85
                C_eq = C0 * 0.05
                break
            q_new = q_max_eff * b * C_eq / (1 + b * C_eq)
            q_new = min(q_new, C0 / dose * 0.85)  # 限制不超过C0/dose
            if abs(q_new - q_e) < 0.1:
                q_e = q_new
                break
            q_e = q_new
        C_eq = max(0, C0 - q_e * dose)
        q_e_eff = q_e
        
        # 6. 动力学——伪二阶
        k2 = ads['k2_g_mg_min']
        # 温度修正（Arrhenius）
        k2 *= math.exp(-30 / 8.314e-3 * (1/T - 1/T_ref))
        q_t = AdsorptionPhysics.pseudo_second_order_kinetics(q_e_eff, k2, self.contact_time_min)
        
        # 7. 颗粒内扩散（小颗粒更快）
        size_factor = (100 / max(self.particle_size_um, 10))**0.5
        k2 *= size_factor
        q_t = AdsorptionPhysics.pseudo_second_order_kinetics(q_e_eff, k2, self.contact_time_min)
        
        # 8. 吸附效率
        efficiency = AdsorptionPhysics.adsortion_efficiency(C0, C_eq) if hasattr(AdsorptionPhysics, 'adsortion_efficiency') else AdsorptionPhysics.adsorption_efficiency(C0, C_eq)
        
        # 9. 吸附热释放
        heat_released = q_e_eff * self.adsorbent_dose_g_L * abs(ads['delta_H_kJ_mol']) / 1000  # kJ/L
        
        return {
            'q_e_mg_g': round(q_e_eff, 1),  # 平衡吸附量
            'q_t_mg_g': round(q_t, 1),  # t时刻吸附量
            'C_eq_mg_L': round(C_eq, 1),  # 平衡浓度
            'removal_pct': round(efficiency, 1),  # 去除率
            'b_L_mg_L': round(b, 3),  # Langmuir常数
            'k2_g_mg_min': round(k2, 5),
            'heat_kJ_L': round(heat_released, 3),
            'temperature_C': self.temperature_C,
            'isotherm': 'Langmuir' if C0 < ads['q_max_mg_g'] / ads['b_L_mg_L'] else 'Freundlich',
        }


# ──────────────────────────────────────────────
# 验证数据集（20组）
# ──────────────────────────────────────────────
VALIDATION_DATA = [
    # 活性炭-亚甲基蓝（经典体系）
    {'id': 'AD-001', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 45, 'real_removal': 90},
    {'id': 'AD-002', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 90, 'real_removal': 90},
    {'id': 'AD-003', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 200, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 150, 'real_removal': 75},
    {'id': 'AD-004', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 45, 'time_min': 60, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 75, 'real_removal': 75},
    
    # 活性炭-苯酚
    {'id': 'AD-005', 'adsorbent': 'activated_carbon', 'adsorbate': 'phenol', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 120, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 35, 'real_removal': 70},
    {'id': 'AD-006', 'adsorbent': 'activated_carbon', 'adsorbate': 'phenol', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 120, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 60, 'real_removal': 60},
    {'id': 'AD-007', 'adsorbent': 'activated_carbon', 'adsorbate': 'phenol', 'C0_mg_L': 100, 'temperature_C': 35, 'time_min': 120, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 55, 'real_removal': 55},
    
    # 沸石13X-Cu2+
    {'id': 'AD-008', 'adsorbent': 'zeolite_13X', 'adsorbate': 'Cu2_plus', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 90, 'dose_g_L': 1.0, 'pH': 5, 'real_q_e': 40, 'real_removal': 80},
    {'id': 'AD-009', 'adsorbent': 'zeolite_13X', 'adsorbate': 'Cu2_plus', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 90, 'dose_g_L': 1.0, 'pH': 5, 'real_q_e': 85, 'real_removal': 85},
    {'id': 'AD-010', 'adsorbent': 'zeolite_13X', 'adsorbate': 'Cu2_plus', 'C0_mg_L': 50, 'temperature_C': 45, 'time_min': 90, 'dose_g_L': 1.0, 'pH': 5, 'real_q_e': 30, 'real_removal': 60},
    
    # 沸石13X-Pb2+
    {'id': 'AD-011', 'adsorbent': 'zeolite_13X', 'adsorbate': 'Pb2_plus', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 90, 'dose_g_L': 1.0, 'pH': 5, 'real_q_e': 45, 'real_removal': 90},
    {'id': 'AD-012', 'adsorbent': 'zeolite_13X', 'adsorbate': 'Pb2_plus', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 90, 'dose_g_L': 1.0, 'pH': 5, 'real_q_e': 85, 'real_removal': 85},
    
    # MOF ZIF-8-亚甲基蓝
    {'id': 'AD-013', 'adsorbent': 'MOF_ZIF8', 'adsorbate': 'methylene_blue', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 30, 'dose_g_L': 0.5, 'pH': 7, 'real_q_e': 80, 'real_removal': 80},
    {'id': 'AD-014', 'adsorbent': 'MOF_ZIF8', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 30, 'dose_g_L': 0.5, 'pH': 7, 'real_q_e': 150, 'real_removal': 75},
    {'id': 'AD-015', 'adsorbent': 'MOF_ZIF8', 'adsorbate': 'methylene_blue', 'C0_mg_L': 200, 'temperature_C': 25, 'time_min': 30, 'dose_g_L': 0.5, 'pH': 7, 'real_q_e': 280, 'real_removal': 70},
    
    # 介孔SiO2-亚甲基蓝
    {'id': 'AD-016', 'adsorbent': 'mesoporous_SiO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 50, 'temperature_C': 25, 'time_min': 45, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 25, 'real_removal': 50},
    {'id': 'AD-017', 'adsorbent': 'mesoporous_SiO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 45, 'dose_g_L': 1.0, 'pH': 7, 'real_q_e': 45, 'real_removal': 45},
    
    # 用量效应
    {'id': 'AD-018', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 0.5, 'pH': 7, 'real_q_e': 150, 'real_removal': 75},
    {'id': 'AD-019', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 2.0, 'pH': 7, 'real_q_e': 45, 'real_removal': 90},
    
    # pH效应
    {'id': 'AD-020', 'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'time_min': 60, 'dose_g_L': 1.0, 'pH': 3, 'real_q_e': 60, 'real_removal': 88},
]


def validate():
    """论文验证"""
    results = []
    
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if not k.startswith('real_')}
        engine = VirtualAdsorptionExperiment(conditions)
        r = engine.run()
        
        pred_q_e = r['q_e_mg_g']
        pred_removal = r['removal_pct']
        real_q_e = exp['real_q_e']
        real_removal = exp['real_removal']
        
        q_err = abs(pred_q_e - real_q_e) / real_q_e * 100
        rem_err = abs(pred_removal - real_removal) / real_removal * 100
        
        results.append({
            'id': exp['id'],
            'adsorbent': exp['adsorbent'],
            'adsorbate': exp['adsorbate'],
            'conditions': f"C0={exp['C0_mg_L']} T={exp['temperature_C']}°C dose={exp['dose_g_L']}g/L",
            'real_q_e': real_q_e,
            'pred_q_e': round(pred_q_e, 1),
            'q_err': round(q_err, 1),
            'real_removal': real_removal,
            'pred_removal': round(pred_removal, 1),
            'rem_err': round(rem_err, 1),
        })
    
    q_errors = [r['q_err'] for r in results]
    rem_errors = [r['rem_err'] for r in results]
    
    mean_q_err = sum(q_errors) / len(q_errors)
    mean_rem_err = sum(rem_errors) / len(rem_errors)
    
    q_within_10 = sum(1 for e in q_errors if e < 10)
    q_within_20 = sum(1 for e in q_errors if e < 20)
    q_within_30 = sum(1 for e in q_errors if e < 30)
    rem_within_5 = sum(1 for e in rem_errors if e < 5)
    rem_within_10 = sum(1 for e in rem_errors if e < 10)
    rem_within_20 = sum(1 for e in rem_errors if e < 20)
    
    output = {
        'total': len(results),
        'q_mean_error': round(mean_q_err, 1),
        'removal_mean_error': round(mean_rem_err, 1),
        'q_within_10': q_within_10,
        'q_within_20': q_within_20,
        'q_within_30': q_within_30,
        'rem_within_5': rem_within_5,
        'rem_within_10': rem_within_10,
        'rem_within_20': rem_within_20,
        'results': results,
    }
    
    with open('/home/z/my-project/swarmlabs_adsorption_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n验证: {len(results)}组实验")
    print(f"平均误差: 吸附量{mean_q_err:.1f}% / 去除率{mean_rem_err:.1f}%")
    print(f"吸附量误差<10%: {q_within_10}组 ({q_within_10*100//len(results)}%)")
    print(f"吸附量误差<20%: {q_within_20}组")
    print(f"吸附量误差<30%: {q_within_30}组")
    print(f"去除率误差<5%: {rem_within_5}组")
    print(f"去除率误差<10%: {rem_within_10}组")
    print(f"去除率误差<20%: {rem_within_20}组")
    
    print(f"\n{'ID':<8} {'吸附剂':<18} {'吸附质':<16} {'条件':<35} {'qe真实':>6} {'qe预测':>6} {'误差':>6} {'去除率真实':>8} {'去除率预测':>8} {'误差':>6}")
    print("-" * 120)
    for r in results:
        print(f"{r['id']:<8} {r['adsorbent']:<18} {r['adsorbate']:<16} {r['conditions']:<35} {r['real_q_e']:>6.0f} {r['pred_q_e']:>6.0f} {r['q_err']:>5.1f}% {r['real_removal']:>8.0f} {r['pred_removal']:>8.0f} {r['rem_err']:>5.1f}%")
    
    print(f"\n结果已保存: swarmlabs_adsorption_result.json")
    return output


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——吸附虚拟实验引擎（第12领域）")
    print("物理体系：表面吸附动力学")
    print("=" * 60)
    
    # 示例
    print("\n--- 示例实验：活性炭吸附亚甲基蓝 ---")
    exp = VirtualAdsorptionExperiment({
        'adsorbent': 'activated_carbon',
        'adsorbate': 'methylene_blue',
        'C0_mg_L': 100,
        'temperature_C': 25,
        'time_min': 60,
        'dose_g_L': 1.0,
    })
    r = exp.run()
    print(json.dumps(r, indent=2, ensure_ascii=False))
    
    # 验证
    print("\n--- 论文验证 ---")
    validate()
