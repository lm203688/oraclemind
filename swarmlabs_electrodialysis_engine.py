#!/usr/bin/env python3
"""
蜂群科研——电渗析虚拟实验引擎（第30领域）
物理体系：电驱动膜分离（第27类）
核心：极限电流密度/脱盐率/能耗/浓差极化
验证体系：海水淡化/苦咸水脱盐
"""
import json, math
from typing import Dict

MEMBRANES = {
    'CMX': {'name': '阳膜CMX', 'type': 'cation', 'resistance_Ohm_cm2': 3.0, 'permselectivity': 0.98, 'thickness_um': 170},
    'AMX': {'name': '阴膜AMX', 'type': 'anion', 'resistance_Ohm_cm2': 2.5, 'permselectivity': 0.97, 'thickness_um': 140},
    'CMV': {'name': '阳膜CMV', 'type': 'cation', 'resistance_Ohm_cm2': 4.0, 'permselectivity': 0.95, 'thickness_um': 130},
    'AMV': {'name': '阴膜AMV', 'type': 'anion', 'resistance_Ohm_cm2': 3.5, 'permselectivity': 0.94, 'thickness_um': 120},
}

class ElectrodialysisPhysics:
    @staticmethod
    def limiting_current(C_dilute_mol_L: float, T_C: float, v_cm_s: float = 5.0) -> float:
        """极限电流密度——经验公式
        i_lim = a * C * v^b"""
        T_K = T_C + 273.15
        # 温度修正
        T_factor = 1 + 0.02 * (T_C - 25)
        # 极限电流密度 A/m²
        a = 25  # 经验常数
        b = 0.5
        i_lim = a * C_dilute_mol_L * 1000 * (v_cm_s ** b) * T_factor
        return i_lim
    
    @staticmethod
    def actual_current(i_applied: float, i_lim: float) -> float:
        """实际工作电流——受极限电流限制"""
        if i_applied > i_lim:
            return i_lim * 0.8  # 超过极限时部分极化
        return i_applied
    
    @staticmethod
    def desalination_rate(i: float, t_min: float, C0_mol_L: float, 
                          n_cells: int = 10, A_m2: float = 0.01) -> Dict:
        """脱盐率——法拉第定律"""
        F = 96485  # C/mol
        # 理论脱盐量
        mol_removed = i * A_m2 * t_min * 60 * 0.3 / (F * n_cells)  # 0.3=电流效率
        C0_total = C0_mol_L * 0.1  # mol (100mL流道)
        removal = mol_removed / max(C0_total, 1e-8)
        removal = min(0.99, max(0, removal))
        
        C_final = C0_mol_L * (1 - removal)
        return {
            'removal_pct': round(removal * 100, 1),
            'C_final_mol_L': round(C_final, 5),
            'mol_removed': round(mol_removed, 6),
        }
    
    @staticmethod
    def energy_consumption(i: float, V_cell: float, t_min: float, 
                           n_cells: int, water_volume_L: float) -> float:
        """能耗 kWh/m³"""
        P = i * 0.01 * V_cell * n_cells / 1000  # kW (i是A/m², A=0.01m²)
        t_h = t_min / 60
        E = P * t_h / (water_volume_L / 1000)  # kWh/m³
        return round(E, 2)
    
    @staticmethod
    def run_experiment(C0_mol_L: float, i_applied: float, T_C: float,
                       t_min: float, v_cm_s: float, n_cells: int = 10) -> Dict:
        """完整电渗析实验——经验模型"""
        # 极限电流
        T_factor = 1 + 0.02 * (T_C - 25)
        v_factor = (v_cm_s / 5.0) ** 0.3
        i_lim = 25 * C0_mol_L * 1000 * v_factor * T_factor
        i_actual = min(i_applied, i_lim * 0.9)
        
        # 脱盐率——经验模型
        k = 0.0008 * (0.05 / max(C0_mol_L, 0.01)) * T_factor * (n_cells / 10)
        removal = min(0.99, 1 - math.exp(-k * i_actual * t_min))
        
        # 能耗
        V_cell = i_actual * 3.0 / 10000 + 0.3
        P_kW = i_actual * 0.01 * V_cell * n_cells / 1000
        energy = P_kW * (t_min / 60) / 0.001
        
        # 电流效率
        eta = min(0.95, 0.85 + 0.001 * (i_lim - i_actual))
        
        return {
            'desalination_pct': round(removal * 100, 1),
            'C_final_mol_L': round(C0_mol_L * (1 - removal), 5),
            'i_applied': round(i_applied, 1),
            'i_limit': round(i_lim, 1),
            'i_actual': round(i_actual, 1),
            'V_cell': round(V_cell, 2),
            'energy_kWh_m3': round(energy, 2),
            'current_efficiency': round(eta * 100, 1),
            'over_limit': i_applied > i_lim,
        }

class VirtualElectrodialysisExperiment:
    def __init__(self, conditions: Dict):
        self.C0 = conditions.get('C0_mol_L', 0.05)
        self.i_applied = conditions.get('i_applied_A_m2', 50)
        self.T_C = conditions.get('temperature_C', 25)
        self.t_min = conditions.get('time_min', 30)
        self.v = conditions.get('v_cm_s', 5.0)
        self.n_cells = conditions.get('n_cells', 10)
    
    def run(self) -> Dict:
        result = ElectrodialysisPhysics.run_experiment(
            self.C0, self.i_applied, self.T_C, self.t_min, self.v, self.n_cells)
        result['C0_mol_L'] = self.C0
        result['temperature_C'] = self.T_C
        return result

VALIDATION_DATA = [
    {'id': 'ED-001', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.75, 'real_energy': 0.8},
    {'id': 'ED-002', 'C0_mol_L': 0.05, 'i_applied_A_m2': 100, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.90, 'real_energy': 1.5},
    {'id': 'ED-003', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 60, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.92, 'real_energy': 1.6},
    {'id': 'ED-004', 'C0_mol_L': 0.1, 'i_applied_A_m2': 100, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.65, 'real_energy': 1.4},
    {'id': 'ED-005', 'C0_mol_L': 0.1, 'i_applied_A_m2': 150, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.85, 'real_energy': 2.1},
    {'id': 'ED-006', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 35, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.80, 'real_energy': 0.7},
    {'id': 'ED-007', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 10.0, 'n_cells': 10, 'real_desalination': 0.78, 'real_energy': 0.8},
    {'id': 'ED-008', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 2.0, 'n_cells': 10, 'real_desalination': 0.65, 'real_energy': 0.9},
    {'id': 'ED-009', 'C0_mol_L': 0.02, 'i_applied_A_m2': 30, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.80, 'real_energy': 0.5},
    {'id': 'ED-010', 'C0_mol_L': 0.5, 'i_applied_A_m2': 200, 'temperature_C': 25, 'time_min': 60, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.50, 'real_energy': 3.5},
    {'id': 'ED-011', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 20, 'real_desalination': 0.88, 'real_energy': 1.6},
    {'id': 'ED-012', 'C0_mol_L': 0.05, 'i_applied_A_m2': 80, 'temperature_C': 30, 'time_min': 45, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.88, 'real_energy': 1.2},
    {'id': 'ED-013', 'C0_mol_L': 0.03, 'i_applied_A_m2': 40, 'temperature_C': 25, 'time_min': 20, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.70, 'real_energy': 0.6},
    {'id': 'ED-014', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 15, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.55, 'real_energy': 0.4},
    {'id': 'ED-015', 'C0_mol_L': 0.1, 'i_applied_A_m2': 100, 'temperature_C': 35, 'time_min': 45, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.85, 'real_energy': 1.8},
    {'id': 'ED-016', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 5, 'real_desalination': 0.50, 'real_energy': 0.4},
    {'id': 'ED-017', 'C0_mol_L': 0.05, 'i_applied_A_m2': 120, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.95, 'real_energy': 1.8},
    {'id': 'ED-018', 'C0_mol_L': 0.08, 'i_applied_A_m2': 80, 'temperature_C': 25, 'time_min': 40, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.80, 'real_energy': 1.3},
    {'id': 'ED-019', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 40, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 10, 'real_desalination': 0.85, 'real_energy': 0.7},
    {'id': 'ED-020', 'C0_mol_L': 0.05, 'i_applied_A_m2': 50, 'temperature_C': 25, 'time_min': 30, 'v_cm_s': 5.0, 'n_cells': 15, 'real_desalination': 0.82, 'real_energy': 1.2},
]

def validate():
    results = []
    for exp in VALIDATION_DATA:
        conditions = {k:v for k,v in exp.items() if k not in ['id','real_desalination','real_energy']}
        engine = VirtualElectrodialysisExperiment(conditions)
        r = engine.run()
        pred_d = r['desalination_pct'] / 100
        real_d = exp['real_desalination']
        d_err = abs(pred_d - real_d) / real_d * 100
        pred_e = r['energy_kWh_m3']
        real_e = exp['real_energy']
        e_err = abs(pred_e - real_e) / real_e * 100
        avg_err = (d_err + e_err) / 2
        results.append({
            'id': exp['id'],
            'conditions': f"C0={exp['C0_mol_L']} i={exp['i_applied_A_m2']} t={exp['time_min']}min",
            'real_d': round(real_d*100,1), 'pred_d': round(pred_d*100,1), 'd_err': round(d_err,1),
            'real_e': real_e, 'pred_e': pred_e, 'e_err': round(e_err,1),
            'avg_err': round(avg_err,1),
        })
    avg_errors = [r['avg_err'] for r in results]
    mean_err = sum(avg_errors)/len(avg_errors)
    w15 = sum(1 for e in avg_errors if e<15)
    w25 = sum(1 for e in avg_errors if e<25)
    output = {'domain':'电渗析','physics':'电驱动膜分离','total':len(results),'mean_error':round(mean_err,1),'within_15':w15,'within_25':w25,'results':results}
    with open('/home/z/my-project/swarmlabs_electrodialysis_result.json','w') as f: json.dump(output,f,ensure_ascii=False,indent=2)
    print(f"验证: {len(results)}组实验")
    print(f"平均误差: 综合{mean_err:.1f}%")
    print(f"误差<15%: {w15}组 / 误差<25%: {w25}组")
    for r in results: print(f"{r['id']:<8} {r['conditions']:<35} 脱盐:{r['real_d']:>4.0f}/{r['pred_d']:>4.0f}({r['d_err']:>4.1f}%) 能耗:{r['real_e']:>3.1f}/{r['pred_e']:>3.1f}({r['e_err']:>4.1f}%)")
    return output

if __name__ == '__main__':
    print("="*60)
    print("蜂群科研——电渗析虚拟实验引擎（第30领域）")
    print("="*60)
    validate()
