#!/usr/bin/env python3
"""
蜂群科研——气固反应虚拟实验引擎（第23领域）
物理体系：气固反应动力学（第20类）
核心：收缩核模型/未反应核模型/气固反应速率/转化率
验证体系：氧化还原/焙烧/气化/还原反应
"""
import json, math
from typing import Dict

REACTIONS = {
    'hematite_reduction': {
        'name': '赤铁矿还原', 'formula': 'Fe2O3+3CO→2Fe+3CO2',
        'Mw_solid': 159.7, 'rho_solid': 5.24,  # g/cm³
        'n_gas': 3, 'Ea': 75,  # kJ/mol
        'k0': 0.005, 'T_ref': 800, 'real_conversion_ref': 0.85,
        'd_particle_mm': 2.0, 'porosity': 0.3,
    },
    'calcination': {
        'name': '石灰石煅烧', 'formula': 'CaCO3→CaO+CO2',
        'Mw_solid': 100.1, 'rho_solid': 2.71,
        'n_gas': 1, 'Ea': 200, 'k0': 1e10, 'T_ref': 900, 'real_conversion_ref': 0.90,
        'd_particle_mm': 5.0, 'porosity': 0.1,
    },
    'roasting_zn': {
        'name': '闪锌矿焙烧', 'formula': 'ZnS+1.5O2→ZnO+SO2',
        'Mw_solid': 97.46, 'rho_solid': 4.0,
        'n_gas': 1.5, 'Ea': 120, 'k0': 1e7, 'T_ref': 850, 'real_conversion_ref': 0.92,
        'd_particle_mm': 1.0, 'porosity': 0.2,
    },
    'gasification_carbon': {
        'name': '碳气化', 'formula': 'C+CO2→2CO',
        'Mw_solid': 12.0, 'rho_solid': 1.5,
        'n_gas': 1, 'Ea': 250, 'k0': 0.01, 'T_ref': 1000, 'real_conversion_ref': 0.80,
        'd_particle_mm': 3.0, 'porosity': 0.5,
    },
    'oxidation_zn': {
        'name': '锌氧化', 'formula': 'Zn+0.5O2→ZnO',
        'Mw_solid': 65.38, 'rho_solid': 7.14,
        'n_gas': 0.5, 'Ea': 80, 'k0': 1e6, 'T_ref': 600, 'real_conversion_ref': 0.88,
        'd_particle_mm': 1.5, 'porosity': 0.15,
    },
}

class GasSolidPhysics:
    @staticmethod
    def rate_constant(rxn: Dict, T_K: float) -> float:
        """Arrhenius速率常数"""
        Ea = rxn['Ea']
        k0 = rxn['k0']
        R = 8.314e-3
        T_ref_K = rxn['T_ref'] + 273.15
        k = k0 * math.exp(-Ea / R * (1/T_K - 1/T_ref_K))
        return k
    
    @staticmethod
    def shrinking_core_model(rxn: Dict, T_C: float, time_min: float, gas_conc: float = 1.0) -> float:
        """收缩核模型——转化率
        X = 1 - (1 - k*t/d²)^3"""
        T_K = T_C + 273.15
        k = GasSolidPhysics.rate_constant(rxn, T_K)
        d = rxn['d_particle_mm']
        # 简化SCM：X = 1 - (1 - k*C*t/(rho*d²))^3
        tau = rxn['rho_solid'] * d**2 / (k * gas_conc * 60)  # 完全转化时间(min)
        ratio = time_min / max(tau, 0.1)
        if ratio >= 1:
            return 0.99
        X = 1 - (1 - ratio)**3
        return min(0.99, max(0, X))
    
    @staticmethod
    def conversion_with_limits(rxn: Dict, T_C: float, time_min: float, gas_conc: float = 1.0) -> Dict:
        """转化率——含温度/浓度限制"""
        X_scm = GasSolidPhysics.shrinking_core_model(rxn, T_C, time_min, gas_conc)
        
        # 热力学平衡限制
        T_K = T_C + 273.15
        T_ref_K = rxn['T_ref'] + 273.15
        thermo_factor = min(1.0, math.exp(-500 / 8.314e-3 * (1/T_K - 1/T_ref_K)))
        
        # 孔隙扩散限制
        porosity_factor = 1 - math.exp(-3 * rxn['porosity'])
        
        X = X_scm * (0.7 + 0.3 * thermo_factor) * (0.8 + 0.2 * porosity_factor)
        X = min(0.99, max(0.01, X))
        
        k = GasSolidPhysics.rate_constant(rxn, T_K)
        
        return {
            'conversion': round(X, 3),
            'rate_constant': round(k, 4),
            'Ea_kJ_mol': rxn['Ea'],
            'time_min': time_min,
        }

class VirtualGasSolidExperiment:
    def __init__(self, conditions: Dict):
        self.reaction_id = conditions.get('reaction', 'hematite_reduction')
        self.reaction = REACTIONS.get(self.reaction_id, REACTIONS['hematite_reduction'])
        self.temperature_C = conditions.get('temperature_C', 800)
        self.time_min = conditions.get('time_min', 60)
        self.gas_conc = conditions.get('gas_conc', 1.0)
    
    def run(self) -> Dict:
        result = GasSolidPhysics.conversion_with_limits(
            self.reaction, self.temperature_C, self.time_min, self.gas_conc)
        result['reaction'] = self.reaction['name']
        result['temperature_C'] = self.temperature_C
        return result

VALIDATION_DATA = [
    {'id': 'GS-001', 'reaction': 'hematite_reduction', 'temperature_C': 800, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.85},
    {'id': 'GS-002', 'reaction': 'hematite_reduction', 'temperature_C': 700, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.60},
    {'id': 'GS-003', 'reaction': 'hematite_reduction', 'temperature_C': 900, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.95},
    {'id': 'GS-004', 'reaction': 'hematite_reduction', 'temperature_C': 800, 'time_min': 30, 'gas_conc': 1.0, 'real_conversion': 0.60},
    {'id': 'GS-005', 'reaction': 'hematite_reduction', 'temperature_C': 800, 'time_min': 120, 'gas_conc': 1.0, 'real_conversion': 0.95},
    {'id': 'GS-006', 'reaction': 'calcination', 'temperature_C': 900, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.90},
    {'id': 'GS-007', 'reaction': 'calcination', 'temperature_C': 800, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.50},
    {'id': 'GS-008', 'reaction': 'calcination', 'temperature_C': 1000, 'time_min': 30, 'gas_conc': 1.0, 'real_conversion': 0.85},
    {'id': 'GS-009', 'reaction': 'calcination', 'temperature_C': 900, 'time_min': 120, 'gas_conc': 1.0, 'real_conversion': 0.98},
    {'id': 'GS-010', 'reaction': 'roasting_zn', 'temperature_C': 850, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.92},
    {'id': 'GS-011', 'reaction': 'roasting_zn', 'temperature_C': 750, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.65},
    {'id': 'GS-012', 'reaction': 'roasting_zn', 'temperature_C': 950, 'time_min': 30, 'gas_conc': 1.0, 'real_conversion': 0.90},
    {'id': 'GS-013', 'reaction': 'gasification_carbon', 'temperature_C': 1000, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.80},
    {'id': 'GS-014', 'reaction': 'gasification_carbon', 'temperature_C': 900, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.45},
    {'id': 'GS-015', 'reaction': 'gasification_carbon', 'temperature_C': 1100, 'time_min': 30, 'gas_conc': 1.0, 'real_conversion': 0.75},
    {'id': 'GS-016', 'reaction': 'oxidation_zn', 'temperature_C': 600, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.88},
    {'id': 'GS-017', 'reaction': 'oxidation_zn', 'temperature_C': 500, 'time_min': 60, 'gas_conc': 1.0, 'real_conversion': 0.55},
    {'id': 'GS-018', 'reaction': 'oxidation_zn', 'temperature_C': 700, 'time_min': 30, 'gas_conc': 1.0, 'real_conversion': 0.85},
    {'id': 'GS-019', 'reaction': 'hematite_reduction', 'temperature_C': 800, 'time_min': 60, 'gas_conc': 0.5, 'real_conversion': 0.70},
    {'id': 'GS-020', 'reaction': 'calcination', 'temperature_C': 900, 'time_min': 60, 'gas_conc': 0.5, 'real_conversion': 0.80},
]

def validate():
    results = []
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if k not in ['id', 'real_conversion']}
        engine = VirtualGasSolidExperiment(conditions)
        r = engine.run()
        pred_X = r['conversion']
        real_X = exp['real_conversion']
        err = abs(pred_X - real_X) / real_X * 100
        results.append({
            'id': exp['id'], 'reaction': r['reaction'],
            'conditions': f"{exp['temperature_C']}°C {exp['time_min']}min",
            'real_conversion': round(real_X * 100, 1),
            'pred_conversion': round(pred_X * 100, 1),
            'err': round(err, 1),
        })
    
    errors = [r['err'] for r in results]
    mean_err = sum(errors) / len(errors)
    within_15 = sum(1 for e in errors if e < 15)
    within_25 = sum(1 for e in errors if e < 25)
    
    output = {
        'domain': '气固反应', 'physics': '气固反应动力学',
        'total': len(results), 'mean_error': round(mean_err, 1),
        'within_15': within_15, 'within_25': within_25, 'results': results,
    }
    with open('/home/z/my-project/swarmlabs_gassolid_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"验证: {len(results)}组实验")
    print(f"平均误差: 转化率{mean_err:.1f}%")
    print(f"误差<15%: {within_15}组")
    print(f"误差<25%: {within_25}组")
    print()
    for r in results:
        print(f"{r['id']:<8} {r['reaction']:<12} {r['conditions']:<20} {r['real_conversion']:>5.1f}% {r['pred_conversion']:>5.1f}% {r['err']:>5.1f}%")
    return output

if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——气固反应虚拟实验引擎（第23领域）")
    print("=" * 60)
    validate()
