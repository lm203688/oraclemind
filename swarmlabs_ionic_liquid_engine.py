#!/usr/bin/env python3
"""
蜂群科研——离子液体虚拟实验引擎（第28领域）
物理体系：离子液体物理化学（第25类）
核心：密度/粘度/电导率/溶解度/CO2吸收
验证体系：[BMIM][PF6]/[BMIM][BF4]/[EMIM][TFSI]
"""
import json, math
from typing import Dict

IONIC_LIQUIDS = {
    'BMIM_PF6': {'name': '[BMIM][PF6]', 'Mw': 284.18, 'Tm': 10, 'Tg': -80, 'cation': 'BMIM', 'anion': 'PF6'},
    'BMIM_BF4': {'name': '[BMIM][BF4]', 'Mw': 226.03, 'Tm': -81, 'Tg': -85, 'cation': 'BMIM', 'anion': 'BF4'},
    'EMIM_TFSI': {'name': '[EMIM][TFSI]', 'Mw': 391.31, 'Tm': -16, 'Tg': -87, 'cation': 'EMIM', 'anion': 'TFSI'},
    'BMIM_DCA': {'name': '[BMIM][DCA]', 'Mw': 205.26, 'Tm': -11, 'Tg': -89, 'cation': 'BMIM', 'anion': 'DCA'},
    'BMIM_Cl': {'name': '[BMIM][Cl]', 'Mw': 174.67, 'Tm': 65, 'Tg': -78, 'cation': 'BMIM', 'anion': 'Cl'},
}

class IonicLiquidPhysics:
    @staticmethod
    def density(il: Dict, T_C: float) -> float:
        """密度——温度依赖
        ρ = ρ_ref * (1 - α*(T-T_ref))"""
        T_K = T_C + 273.15
        T_ref = 298.15
        # 阴离子影响基准密度
        anion = il['anion']
        if anion == 'PF6': rho_ref = 1.36
        elif anion == 'BF4': rho_ref = 1.18
        elif anion == 'TFSI': rho_ref = 1.52
        elif anion == 'DCA': rho_ref = 1.06
        else: rho_ref = 1.10
        
        alpha = 8e-4  # 热膨胀系数
        rho = rho_ref * (1 - alpha * (T_K - T_ref))
        return round(rho, 4)
    
    @staticmethod
    def viscosity(il: Dict, T_C: float) -> float:
        """粘度——经验温度依赖
        η = η_ref * exp(-k*(T-T_ref))"""
        anion = il['anion']
        if anion == 'PF6': eta_ref = 312; k = 0.055
        elif anion == 'BF4': eta_ref = 112; k = 0.050
        elif anion == 'TFSI': eta_ref = 34; k = 0.045
        elif anion == 'DCA': eta_ref = 33; k = 0.045
        else: eta_ref = 100; k = 0.050
        
        eta = eta_ref * math.exp(-k * (T_C - 25))
        return round(eta, 2)
    
    @staticmethod
    def conductivity(il: Dict, T_C: float) -> float:
        """电导率——Vogel-Fulcher-Tammann
        σ = σ0 * exp(-B/(T-T0))"""
        T_K = T_C + 273.15
        T0 = il['Tg'] + 273.15 + 50  # T0 ≈ Tg + 50
        
        anion = il['anion']
        if anion == 'PF6': sigma0 = 4.3; B = 50
        elif anion == 'BF4': sigma0 = 3.5; B = 45
        elif anion == 'TFSI': sigma0 = 8.8; B = 35
        elif anion == 'DCA': sigma0 = 12.0; B = 30
        else: sigma0 = 2.0; B = 60
        
        sigma = sigma0 * math.exp(-B / (T_K - T0))
        return round(sigma, 3)  # mS/cm
    
    @staticmethod
    def CO2_solubility(il: Dict, T_C: float, P_bar: float) -> float:
        """CO2溶解度——Henry定律修正
        x_CO2 = P / KH * f(T)"""
        T_K = T_C + 273.15
        anion = il['anion']
        # Henry常数 (bar)
        if anion == 'PF6': KH = 53.4; dH = -8
        elif anion == 'BF4': KH = 56.5; dH = -6
        elif anion == 'TFSI': KH = 45.0; dH = -10
        elif anion == 'DCA': KH = 62.0; dH = -5
        else: KH = 80.0; dH = -4
        
        # 温度修正
        KH_T = KH * math.exp(-dH / 8.314e-3 * (1/T_K - 1/298.15))
        x_CO2 = P_bar / KH_T
        return round(min(0.8, x_CO2), 4)
    
    @staticmethod
    def solubility_parameter(il: Dict, T_C: float) -> Dict:
        """综合物性参数"""
        return {
            'density_g_cm3': IonicLiquidPhysics.density(il, T_C),
            'viscosity_cP': IonicLiquidPhysics.viscosity(il, T_C),
            'conductivity_mS_cm': IonicLiquidPhysics.conductivity(il, T_C),
            'CO2_solubility_mol_frac': IonicLiquidPhysics.CO2_solubility(il, T_C, 10),
        }

class VirtualIonicLiquidExperiment:
    def __init__(self, conditions: Dict):
        self.il_id = conditions.get('ionic_liquid', 'BMIM_PF6')
        self.il = IONIC_LIQUIDS.get(self.il_id, IONIC_LIQUIDS['BMIM_PF6'])
        self.T_C = conditions.get('temperature_C', 25)
        self.P_bar = conditions.get('pressure_bar', 10)
    
    def run(self) -> Dict:
        props = IonicLiquidPhysics.solubility_parameter(self.il, self.T_C)
        props['ionic_liquid'] = self.il['name']
        props['temperature_C'] = self.T_C
        props['CO2_at_P'] = IonicLiquidPhysics.CO2_solubility(self.il, self.T_C, self.P_bar)
        return props

VALIDATION_DATA = [
    {'id': 'IL-001', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 25, 'pressure_bar': 10, 'real_density': 1.36, 'real_viscosity': 312, 'real_cond': 1.46, 'real_CO2': 0.19},
    {'id': 'IL-002', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 50, 'pressure_bar': 10, 'real_density': 1.33, 'real_viscosity': 75, 'real_cond': 3.50, 'real_CO2': 0.15},
    {'id': 'IL-003', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 25, 'pressure_bar': 20, 'real_density': 1.36, 'real_viscosity': 312, 'real_cond': 1.46, 'real_CO2': 0.32},
    {'id': 'IL-004', 'ionic_liquid': 'BMIM_BF4', 'temperature_C': 25, 'pressure_bar': 10, 'real_density': 1.18, 'real_viscosity': 112, 'real_cond': 3.5, 'real_CO2': 0.17},
    {'id': 'IL-005', 'ionic_liquid': 'BMIM_BF4', 'temperature_C': 50, 'pressure_bar': 10, 'real_density': 1.16, 'real_viscosity': 35, 'real_cond': 7.8, 'real_CO2': 0.14},
    {'id': 'IL-006', 'ionic_liquid': 'BMIM_BF4', 'temperature_C': 25, 'pressure_bar': 5, 'real_density': 1.18, 'real_viscosity': 112, 'real_cond': 3.5, 'real_CO2': 0.09},
    {'id': 'IL-007', 'ionic_liquid': 'EMIM_TFSI', 'temperature_C': 25, 'pressure_bar': 10, 'real_density': 1.52, 'real_viscosity': 34, 'real_cond': 8.8, 'real_CO2': 0.22},
    {'id': 'IL-008', 'ionic_liquid': 'EMIM_TFSI', 'temperature_C': 60, 'pressure_bar': 10, 'real_density': 1.48, 'real_viscosity': 12, 'real_cond': 18.0, 'real_CO2': 0.18},
    {'id': 'IL-009', 'ionic_liquid': 'EMIM_TFSI', 'temperature_C': 25, 'pressure_bar': 15, 'real_density': 1.52, 'real_viscosity': 34, 'real_cond': 8.8, 'real_CO2': 0.30},
    {'id': 'IL-010', 'ionic_liquid': 'BMIM_DCA', 'temperature_C': 25, 'pressure_bar': 10, 'real_density': 1.06, 'real_viscosity': 33, 'real_cond': 12.0, 'real_CO2': 0.15},
    {'id': 'IL-011', 'ionic_liquid': 'BMIM_DCA', 'temperature_C': 40, 'pressure_bar': 10, 'real_density': 1.05, 'real_viscosity': 18, 'real_cond': 18.0, 'real_CO2': 0.13},
    {'id': 'IL-012', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 40, 'pressure_bar': 10, 'real_density': 1.35, 'real_viscosity': 140, 'real_cond': 2.20, 'real_CO2': 0.17},
    {'id': 'IL-013', 'ionic_liquid': 'BMIM_BF4', 'temperature_C': 40, 'pressure_bar': 10, 'real_density': 1.17, 'real_viscosity': 60, 'real_cond': 5.5, 'real_CO2': 0.15},
    {'id': 'IL-014', 'ionic_liquid': 'EMIM_TFSI', 'temperature_C': 40, 'pressure_bar': 10, 'real_density': 1.50, 'real_viscosity': 20, 'real_cond': 12.5, 'real_CO2': 0.20},
    {'id': 'IL-015', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 25, 'pressure_bar': 1, 'real_density': 1.36, 'real_viscosity': 312, 'real_cond': 1.46, 'real_CO2': 0.02},
    {'id': 'IL-016', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 70, 'pressure_bar': 10, 'real_density': 1.31, 'real_viscosity': 30, 'real_cond': 5.5, 'real_CO2': 0.12},
    {'id': 'IL-017', 'ionic_liquid': 'BMIM_BF4', 'temperature_C': 70, 'pressure_bar': 10, 'real_density': 1.14, 'real_viscosity': 14, 'real_cond': 12.0, 'real_CO2': 0.12},
    {'id': 'IL-018', 'ionic_liquid': 'EMIM_TFSI', 'temperature_C': 80, 'pressure_bar': 10, 'real_density': 1.46, 'real_viscosity': 8, 'real_cond': 22.0, 'real_CO2': 0.16},
    {'id': 'IL-019', 'ionic_liquid': 'BMIM_DCA', 'temperature_C': 60, 'pressure_bar': 10, 'real_density': 1.04, 'real_viscosity': 10, 'real_cond': 25.0, 'real_CO2': 0.11},
    {'id': 'IL-020', 'ionic_liquid': 'BMIM_PF6', 'temperature_C': 25, 'pressure_bar': 30, 'real_density': 1.36, 'real_viscosity': 312, 'real_cond': 1.46, 'real_CO2': 0.45},
]

def validate():
    results = []
    for exp in VALIDATION_DATA:
        conditions = {k:v for k,v in exp.items() if k not in ['id','real_density','real_viscosity','real_cond','real_CO2']}
        engine = VirtualIonicLiquidExperiment(conditions)
        r = engine.run()
        d_err = abs(r['density_g_cm3'] - exp['real_density'])/exp['real_density']*100
        v_err = abs(r['viscosity_cP'] - exp['real_viscosity'])/exp['real_viscosity']*100
        c_err = abs(r['conductivity_mS_cm'] - exp['real_cond'])/exp['real_cond']*100
        co2_err = abs(r['CO2_at_P'] - exp['real_CO2'])/exp['real_CO2']*100
        avg_err = (d_err + v_err + c_err + co2_err) / 4
        results.append({
            'id': exp['id'], 'il': r['ionic_liquid'],
            'conditions': f"{exp['temperature_C']}°C {exp['pressure_bar']}bar",
            'd_err': round(d_err,1), 'v_err': round(v_err,1),
            'c_err': round(c_err,1), 'co2_err': round(co2_err,1),
            'avg_err': round(avg_err,1),
        })
    avg_errors = [r['avg_err'] for r in results]
    mean_err = sum(avg_errors)/len(avg_errors)
    w15 = sum(1 for e in avg_errors if e<15)
    w25 = sum(1 for e in avg_errors if e<25)
    output = {'domain':'离子液体','physics':'离子液体物理化学','total':len(results),'mean_error':round(mean_err,1),'within_15':w15,'within_25':w25,'results':results}
    with open('/home/z/my-project/swarmlabs_ionic_liquid_result.json','w') as f: json.dump(output,f,ensure_ascii=False,indent=2)
    print(f"验证: {len(results)}组实验")
    print(f"平均误差: 综合物性{mean_err:.1f}%")
    print(f"误差<15%: {w15}组 / 误差<25%: {w25}组")
    for r in results: print(f"{r['id']:<8} {r['il']:<14} {r['conditions']:<15} ρ:{r['d_err']:>4.1f}% η:{r['v_err']:>5.1f}% σ:{r['c_err']:>5.1f}% CO2:{r['co2_err']:>5.1f}% avg:{r['avg_err']:>4.1f}%")
    return output

if __name__ == '__main__':
    print("="*60)
    print("蜂群科研——离子液体虚拟实验引擎（第28领域）")
    print("="*60)
    validate()
