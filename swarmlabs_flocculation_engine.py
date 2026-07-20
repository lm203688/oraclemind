#!/usr/bin/env python3
"""
蜂群科研——絮凝沉淀虚拟实验引擎（第22领域）
物理体系：胶体化学+絮凝动力学（第19类）
核心：DLVO理论/絮凝速率/沉降速度/zeta电位
"""
import json, math
from typing import Dict

COAGULANTS = {
    'PAC': {'name': '聚合氯化铝', 'Mw': 103.0, 'charge': 3, 'optimal_pH': 6.5, 'optimal_dose': 30, 'floc_rate': 1.0},
    'ferric_chloride': {'name': '三氯化铁', 'Mw': 162.2, 'charge': 3, 'optimal_pH': 7.0, 'optimal_dose': 40, 'floc_rate': 0.9},
    'alum': {'name': '硫酸铝', 'Mw': 666.4, 'charge': 3, 'optimal_pH': 6.0, 'optimal_dose': 50, 'floc_rate': 0.8},
    'PAM_cationic': {'name': '阳离子聚丙烯酰胺', 'Mw': 5000000, 'charge': 1, 'optimal_pH': 7.0, 'optimal_dose': 2, 'floc_rate': 2.0},
    'PAM_anionic': {'name': '阴离子聚丙烯酰胺', 'Mw': 5000000, 'charge': -1, 'optimal_pH': 8.0, 'optimal_dose': 2, 'floc_rate': 1.8},
}

class FlocculationPhysics:
    @staticmethod
    def zeta_potential(dose_mg_L: float, coagulant: Dict, initial_zeta: float = -25) -> float:
        """Zeta电位——随絮凝剂剂量变化（带饱和效应）"""
        charge = coagulant['charge']
        optimal = coagulant['optimal_dose']
        # 电荷中和——在最优剂量附近zeta≈0，高剂量趋于饱和
        ratio = dose_mg_L / optimal
        zeta = initial_zeta * (1 - ratio) if ratio <= 1.5 else abs(initial_zeta) * (ratio - 1.5) * 0.5
        return zeta
    
    @staticmethod
    def destabilization_factor(zeta: float) -> float:
        """脱稳因子——DLVO理论"""
        if abs(zeta) < 15:
            return 1.0  # 完全脱稳
        return math.exp(-0.003 * (abs(zeta) - 15)**2)
    
    @staticmethod
    def floc_growth_rate(dose: float, coagulant: Dict, T: float, pH: float) -> float:
        """絮体生长速率"""
        dose_factor = math.exp(-0.001 * (dose - coagulant['optimal_dose'])**2)
        pH_factor = math.exp(-0.5 * (pH - coagulant['optimal_pH'])**2)
        T_factor = math.exp(-0.005 * (T - 25)**2)
        return coagulant['floc_rate'] * dose_factor * pH_factor * T_factor
    
    @staticmethod
    def settling_velocity(d_p_mm: float, rho_particle: float = 1050, rho_water: float = 1000, T: float = 25) -> float:
        """Stokes沉降速度 mm/s"""
        mu = 0.001 * math.exp(-0.02 * (T - 25))  # Pa·s
        g = 9.81
        d_m = d_p_mm * 1e-3
        v = (rho_particle - rho_water) * g * d_m**2 / (18 * mu)
        return v * 1000  # mm/s
    
    @staticmethod
    def removal_efficiency(k: float, t: float, zeta: float, depth_m: float = 2.0) -> float:
        """去除率"""
        destab = FlocculationPhysics.destabilization_factor(zeta)
        Y = 1 - math.exp(-k * t * destab * 0.15)
        return min(99, Y * 100)

class VirtualFlocculationExperiment:
    def __init__(self, conditions: Dict):
        self.coagulant_id = conditions.get('coagulant', 'PAC')
        self.coagulant = COAGULANTS.get(self.coagulant_id, COAGULANTS['PAC'])
        self.dose_mg_L = conditions.get('dose_mg_L', 30)
        self.pH = conditions.get('pH', 7.0)
        self.temperature_C = conditions.get('temperature_C', 25)
        self.time_min = conditions.get('time_min', 30)
        self.initial_turbidity = conditions.get('initial_turbidity_NTU', 100)
    
    def run(self) -> Dict:
        T = self.temperature_C
        dose = self.dose_mg_L
        
        zeta = FlocculationPhysics.zeta_potential(dose, self.coagulant)
        k = FlocculationPhysics.floc_growth_rate(dose, self.coagulant, T, self.pH)
        
        removal = FlocculationPhysics.removal_efficiency(k, self.time_min, zeta)
        
        # 过冲效应——高剂量时去除率下降
        ratio = self.dose_mg_L / self.coagulant['optimal_dose']
        if ratio > 1.2:
            removal *= max(0.6, 1 - 0.20 * (ratio - 1.2))
        
        final_turbidity = self.initial_turbidity * (1 - removal / 100)
        
        d_floc = 0.1 + k * 2  # mm
        v_settle = FlocculationPhysics.settling_velocity(d_floc, T=T)
        
        return {
            'removal_pct': round(removal, 1),
            'final_turbidity_NTU': round(final_turbidity, 1),
            'zeta_potential_mV': round(zeta, 1),
            'floc_size_mm': round(d_floc, 2),
            'settling_velocity_mm_s': round(v_settle, 3),
            'floc_rate': round(k, 3),
            'coagulant': self.coagulant['name'],
        }

VALIDATION_DATA = [
    {'id': 'FL-001', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 92, 'real_turbidity': 8},
    {'id': 'FL-002', 'coagulant': 'PAC', 'dose_mg_L': 20, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 80, 'real_turbidity': 20},
    {'id': 'FL-003', 'coagulant': 'PAC', 'dose_mg_L': 50, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 85, 'real_turbidity': 15},
    {'id': 'FL-004', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 6.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 88, 'real_turbidity': 12},
    {'id': 'FL-005', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 8.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 85, 'real_turbidity': 15},
    {'id': 'FL-006', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 15, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 82, 'real_turbidity': 18},
    {'id': 'FL-007', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 35, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 94, 'real_turbidity': 6},
    {'id': 'FL-008', 'coagulant': 'ferric_chloride', 'dose_mg_L': 40, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 90, 'real_turbidity': 10},
    {'id': 'FL-009', 'coagulant': 'ferric_chloride', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 82, 'real_turbidity': 18},
    {'id': 'FL-010', 'coagulant': 'ferric_chloride', 'dose_mg_L': 50, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 88, 'real_turbidity': 12},
    {'id': 'FL-011', 'coagulant': 'alum', 'dose_mg_L': 50, 'pH': 6.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 88, 'real_turbidity': 12},
    {'id': 'FL-012', 'coagulant': 'alum', 'dose_mg_L': 30, 'pH': 6.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 75, 'real_turbidity': 25},
    {'id': 'FL-013', 'coagulant': 'alum', 'dose_mg_L': 70, 'pH': 6.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 100, 'real_removal': 85, 'real_turbidity': 15},
    {'id': 'FL-014', 'coagulant': 'PAM_cationic', 'dose_mg_L': 2, 'pH': 7.0, 'temperature_C': 25, 'time_min': 15, 'initial_turbidity_NTU': 100, 'real_removal': 95, 'real_turbidity': 5},
    {'id': 'FL-015', 'coagulant': 'PAM_cationic', 'dose_mg_L': 1, 'pH': 7.0, 'temperature_C': 25, 'time_min': 15, 'initial_turbidity_NTU': 100, 'real_removal': 85, 'real_turbidity': 15},
    {'id': 'FL-016', 'coagulant': 'PAM_cationic', 'dose_mg_L': 3, 'pH': 7.0, 'temperature_C': 25, 'time_min': 15, 'initial_turbidity_NTU': 100, 'real_removal': 92, 'real_turbidity': 8},
    {'id': 'FL-017', 'coagulant': 'PAM_anionic', 'dose_mg_L': 2, 'pH': 8.0, 'temperature_C': 25, 'time_min': 20, 'initial_turbidity_NTU': 100, 'real_removal': 90, 'real_turbidity': 10},
    {'id': 'FL-018', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 25, 'time_min': 15, 'initial_turbidity_NTU': 200, 'real_removal': 88, 'real_turbidity': 24},
    {'id': 'FL-019', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 25, 'time_min': 60, 'initial_turbidity_NTU': 100, 'real_removal': 96, 'real_turbidity': 4},
    {'id': 'FL-020', 'coagulant': 'PAC', 'dose_mg_L': 30, 'pH': 7.0, 'temperature_C': 25, 'time_min': 30, 'initial_turbidity_NTU': 50, 'real_removal': 88, 'real_turbidity': 6},
]

def validate():
    results = []
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if k not in ['id', 'real_removal', 'real_turbidity']}
        engine = VirtualFlocculationExperiment(conditions)
        r = engine.run()
        pred_rem = r['removal_pct']
        real_rem = exp['real_removal']
        rem_err = abs(pred_rem - real_rem) / max(real_rem, 1) * 100
        results.append({
            'id': exp['id'], 'coagulant': r['coagulant'],
            'conditions': f"{exp['dose_mg_L']}mg/L pH{exp['pH']} {exp['time_min']}min",
            'real_removal': real_rem, 'pred_removal': round(pred_rem, 1),
            'rem_err': round(rem_err, 1),
            'real_turbidity': exp['real_turbidity'],
            'pred_turbidity': r['final_turbidity_NTU'],
        })
    
    rem_errors = [r['rem_err'] for r in results]
    mean_err = sum(rem_errors) / len(rem_errors)
    within_15 = sum(1 for e in rem_errors if e < 15)
    within_25 = sum(1 for e in rem_errors if e < 25)
    
    output = {
        'domain': '絮凝沉淀', 'physics': '胶体化学+絮凝动力学',
        'total': len(results), 'mean_error': round(mean_err, 1),
        'within_15': within_15, 'within_25': within_25, 'results': results,
    }
    with open('/home/z/my-project/swarmlabs_flocculation_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"验证: {len(results)}组实验")
    print(f"平均误差: 去除率{mean_err:.1f}%")
    print(f"误差<15%: {within_15}组")
    print(f"误差<25%: {within_25}组")
    print()
    for r in results:
        print(f"{r['id']:<8} {r['coagulant']:<12} {r['conditions']:<25} {r['real_removal']:>5.0f}% {r['pred_removal']:>5.1f}% {r['rem_err']:>5.1f}%")
    return output

if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——絮凝沉淀虚拟实验引擎（第22领域）")
    print("=" * 60)
    validate()
