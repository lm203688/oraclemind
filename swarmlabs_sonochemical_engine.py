#!/usr/bin/env python3
"""
蜂群科研——超声空化虚拟实验引擎（第26领域）
物理体系：声化学/超声空化（第23类）
核心：空化阈值/气泡动力学(Rayleigh-Plesset)/热点温度/自由基产率
验证体系：降解/合成/萃取
"""
import json, math
from typing import Dict

LIQUIDS = {
    'water': {'name': '水', 'rho': 998, 'mu': 0.001, 'gamma': 0.072, 'P_v': 2.3, 'c': 1481, 'B': 2.2e9},
    'ethanol': {'name': '乙醇', 'rho': 789, 'mu': 0.0012, 'gamma': 0.022, 'P_v': 5.9, 'c': 1144, 'B': 1.0e9},
    'hexane': {'name': '正己烷', 'rho': 659, 'mu': 0.0003, 'gamma': 0.018, 'P_v': 20.0, 'c': 1080, 'B': 0.7e9},
}

REACTIONS = {
    'dye_degradation': {'name': '染料降解', 'k_sono': 0.055, 'real_rate_ref': 0.045, 'Ea': 20},
    'polymer_synthesis': {'name': '聚合物合成', 'k_sono': 0.006, 'real_rate_ref': 0.018, 'Ea': 35},
    'nanoparticle': {'name': '纳米颗粒合成', 'k_sono': 0.045, 'real_rate_ref': 0.072, 'Ea': 25},
    'ester_hydrolysis': {'name': '酯水解', 'k_sono': 0.025, 'real_rate_ref': 0.028, 'Ea': 35},
    'extract_enhanced': {'name': '超声强化萃取', 'k_sono': 0.06, 'real_rate_ref': 0.055, 'Ea': 15},
}

class SonochemicalPhysics:
    @staticmethod
    def cavitation_threshold(liquid: Dict, frequency_kHz: float, T_C: float) -> float:
        """空化阈值——Blake阈值
        P_th = 0.77 * gamma / (R_max) + P_h - P_v
        简化：随频率增大、温度升高而降低"""
        T_K = T_C + 273.15
        # 频率效应（高频需要更高声压）
        f_factor = math.sqrt(frequency_kHz / 20)
        # 温度效应（高温蒸气压高，更容易空化）
        T_factor = math.exp(-2000 * (1/T_K - 1/298.15))
        P_th = 0.15 * f_factor / T_factor  # MPa
        return P_th
    
    @staticmethod
    def bubble_dynamics(P_a: float, R_0: float, liquid: Dict, freq_kHz: float, T_C: float):
        """Rayleigh-Plesset简化——最大气泡半径"""
        P_h = 0.101  # MPa 大气压
        P_v = liquid['P_v'] * 1e-3  # MPa
        gamma = liquid['gamma']
        rho = liquid['rho']
        
        # 简化：R_max/R_0 ≈ (P_a / (P_h - P_v))^0.5
        ratio = math.sqrt(max(1, P_a / max(P_h - P_v, 0.01)))
        R_max = R_0 * min(10, ratio)
        return R_max
    
    @staticmethod
    def hotspot_temperature(R_max: float, liquid: Dict, T_C: float) -> float:
        """热点温度——空化气泡内绝热压缩"""
        gamma_gas = 1.4  # 空气绝热指数
        T_K = T_C + 273.15
        # 压缩比
        compression = (R_max / 0.5e-6) ** 3 if R_max > 0.5e-6 else 1
        T_hot = T_K * (compression ** (gamma_gas - 1))
        return min(15000, T_hot)
    
    @staticmethod
    def radical_production(T_hot: float, P_a: float, freq_kHz: float) -> float:
        """自由基产率 μmol/min"""
        # 高温裂解水分子
        rate = math.exp(-5000 / max(T_hot, 300)) * P_a * (20 / max(freq_kHz, 20))
        return rate * 100  # μmol/min
    
    @staticmethod
    def reaction_rate(rxn: Dict, P_a: float, freq_kHz: float, T_C: float, 
                      power_W: float, liquid: Dict, time_min: float) -> Dict:
        """反应速率/转化率"""
        T_K = T_C + 273.15
        
        # 空化强度
        cav_eff = power_W * P_a / 18
        # 温度效应
        T_factor = math.exp(-rxn['Ea'] / 8.314e-3 * (1/T_K - 1/298.15))
        # 频率效应（20kHz最优）
        freq_factor = math.exp(-0.0008 * (freq_kHz - 20)**2)
        
        k = rxn['k_sono'] * cav_eff * T_factor * freq_factor
        conversion = 1 - math.exp(-k * time_min)
        
        R_0 = 5e-6  # 初始气泡半径
        R_max = SonochemicalPhysics.bubble_dynamics(P_a, R_0, liquid, freq_kHz, T_C)
        T_hot = SonochemicalPhysics.hotspot_temperature(R_max, liquid, T_C)
        radical = SonochemicalPhysics.radical_production(T_hot, P_a, freq_kHz)
        
        return {
            'conversion': round(min(0.85, conversion), 3),
            'rate_constant': round(k, 5),
            'hotspot_temp_K': round(T_hot, 0),
            'radical_umol_min': round(radical, 2),
            'R_max_um': round(R_max * 1e6, 2),
        }

class VirtualSonochemicalExperiment:
    def __init__(self, conditions: Dict):
        self.reaction_id = conditions.get('reaction', 'dye_degradation')
        self.reaction = REACTIONS.get(self.reaction_id, REACTIONS['dye_degradation'])
        self.liquid_id = conditions.get('liquid', 'water')
        self.liquid = LIQUIDS.get(self.liquid_id, LIQUIDS['water'])
        self.frequency_kHz = conditions.get('frequency_kHz', 20)
        self.power_W = conditions.get('power_W', 100)
        self.temperature_C = conditions.get('temperature_C', 25)
        self.time_min = conditions.get('time_min', 30)
        self.P_acoustic = conditions.get('P_acoustic_MPa', 0.15)
    
    def run(self) -> Dict:
        result = SonochemicalPhysics.reaction_rate(
            self.reaction, self.P_acoustic, self.frequency_kHz,
            self.temperature_C, self.power_W, self.liquid, self.time_min)
        result['reaction'] = self.reaction['name']
        result['frequency_kHz'] = self.frequency_kHz
        result['power_W'] = self.power_W
        return result

VALIDATION_DATA = [
    {'id': 'SC-001', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.75},
    {'id': 'SC-002', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 200, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.20, 'real_conversion': 0.90},
    {'id': 'SC-003', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 40, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.50},
    {'id': 'SC-004', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 50, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.85},
    {'id': 'SC-005', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 60, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.92},
    {'id': 'SC-006', 'reaction': 'polymer_synthesis', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 150, 'temperature_C': 40, 'time_min': 60, 'P_acoustic_MPa': 0.18, 'real_conversion': 0.65},
    {'id': 'SC-007', 'reaction': 'polymer_synthesis', 'liquid': 'water', 'frequency_kHz': 40, 'power_W': 150, 'temperature_C': 40, 'time_min': 60, 'P_acoustic_MPa': 0.18, 'real_conversion': 0.40},
    {'id': 'SC-008', 'reaction': 'nanoparticle', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 200, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.20, 'real_conversion': 0.88},
    {'id': 'SC-009', 'reaction': 'nanoparticle', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.70},
    {'id': 'SC-010', 'reaction': 'nanoparticle', 'liquid': 'ethanol', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.65},
    {'id': 'SC-011', 'reaction': 'ester_hydrolysis', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 35, 'time_min': 45, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.70},
    {'id': 'SC-012', 'reaction': 'ester_hydrolysis', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 50, 'temperature_C': 35, 'time_min': 45, 'P_acoustic_MPa': 0.10, 'real_conversion': 0.45},
    {'id': 'SC-013', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 300, 'temperature_C': 25, 'time_min': 15, 'P_acoustic_MPa': 0.25, 'real_conversion': 0.80},
    {'id': 'SC-014', 'reaction': 'extract_enhanced', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 30, 'time_min': 20, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.75},
    {'id': 'SC-015', 'reaction': 'extract_enhanced', 'liquid': 'ethanol', 'frequency_kHz': 40, 'power_W': 100, 'temperature_C': 30, 'time_min': 20, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.55},
    {'id': 'SC-016', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 10, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.45},
    {'id': 'SC-017', 'reaction': 'dye_degradation', 'liquid': 'water', 'frequency_kHz': 60, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.35},
    {'id': 'SC-018', 'reaction': 'nanoparticle', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 150, 'temperature_C': 60, 'time_min': 30, 'P_acoustic_MPa': 0.18, 'real_conversion': 0.85},
    {'id': 'SC-019', 'reaction': 'polymer_synthesis', 'liquid': 'water', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 40, 'time_min': 60, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.55},
    {'id': 'SC-020', 'reaction': 'dye_degradation', 'liquid': 'hexane', 'frequency_kHz': 20, 'power_W': 100, 'temperature_C': 25, 'time_min': 30, 'P_acoustic_MPa': 0.15, 'real_conversion': 0.60},
]

def validate():
    results = []
    for exp in VALIDATION_DATA:
        conditions = {k: v for k, v in exp.items() if k not in ['id', 'real_conversion']}
        engine = VirtualSonochemicalExperiment(conditions)
        r = engine.run()
        pred = r['conversion']
        real = exp['real_conversion']
        err = abs(pred - real) / real * 100
        results.append({
            'id': exp['id'], 'reaction': r['reaction'],
            'conditions': f"{exp['frequency_kHz']}kHz {exp['power_W']}W {exp['time_min']}min",
            'real': round(real*100,1), 'pred': round(pred*100,1), 'err': round(err,1),
        })
    errors = [r['err'] for r in results]
    mean_err = sum(errors)/len(errors)
    w15 = sum(1 for e in errors if e<15)
    w25 = sum(1 for e in errors if e<25)
    output = {'domain':'超声空化','physics':'声化学','total':len(results),'mean_error':round(mean_err,1),'within_15':w15,'within_25':w25,'results':results}
    with open('/home/z/my-project/swarmlabs_sonochemical_result.json','w') as f: json.dump(output,f,ensure_ascii=False,indent=2)
    print(f"验证: {len(results)}组实验")
    print(f"平均误差: 转化率{mean_err:.1f}%")
    print(f"误差<15%: {w15}组 / 误差<25%: {w25}组")
    for r in results: print(f"{r['id']:<8} {r['reaction']:<12} {r['conditions']:<25} {r['real']:>5.1f}% {r['pred']:>5.1f}% {r['err']:>5.1f}%")
    return output

if __name__ == '__main__':
    print("="*60)
    print("蜂群科研——超声空化虚拟实验引擎（第26领域）")
    print("="*60)
    validate()
