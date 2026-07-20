#!/usr/bin/env python3
"""
蜂群科研——合成氨虚拟实验引擎（Haber-Bosch过程）

模拟N2+3H2→2NH3催化合成：
1. 催化剂筛选（Fe/Ru/Co-Mo）
2. 反应条件优化（温度/压力/H2/N2比）
3. 氨产率+转化率预测

物理约束：
- Langmuir-Hinshelwood吸附动力学
- Le Chatelier平衡（高压有利）
- Arrhenius温度效应
- 反应平衡极限（热力学）
- 催化剂失活
"""

import json, math
from typing import Dict

CATALYSTS = {
    'Fe (promoted)': {
        'activation_energy': 230,  # kJ/mol
        'pre_exponential': 1e15,
        'optimal_temp': 450,
        'optimal_pressure': 200,  # bar
        'surface_area': 20,  # m²/g
        'lifetime_h': 2000,
    },
    'Ru/C (Ba-promoted)': {
        'activation_energy': 170,
        'pre_exponential': 5e13,
        'optimal_temp': 400,
        'optimal_pressure': 150,
        'surface_area': 80,
        'lifetime_h': 5000,
    },
    'Co3Mo3N': {
        'activation_energy': 180,
        'pre_exponential': 8e13,
        'optimal_temp': 420,
        'optimal_pressure': 100,
        'surface_area': 50,
        'lifetime_h': 3000,
    },
    'Fe-Ru bimetallic': {
        'activation_energy': 200,
        'pre_exponential': 2e14,
        'optimal_temp': 430,
        'optimal_pressure': 180,
        'surface_area': 40,
        'lifetime_h': 4000,
    },
}


class AmmoniaPhysics:
    """合成氨物理约束"""
    
    @staticmethod
    def equilibrium_constant(T: float) -> float:
        """平衡常数Kp——经验校准
        450°C: Kp≈0.006 (bar⁻¹)
        放热反应：低温Kp大
        log10(Kp) = 4.2 - 4000/T_K
        """
        T_K = T + 273.15
        log_kp = -8.2 + 5000/T_K
        return 10**log_kp
    
    @staticmethod
    def equilibrium_conversion(T: float, P: float, ratio_H2_N2: float = 3.0) -> float:
        """平衡转化率——Le Chatelier原理
        N2+3H2→2NH3, Δn=-2, 高压有利
        """
        Kp = AmmoniaPhysics.equilibrium_constant(T)
        # x_eq ≈ Kp*P / (1 + Kp*P) （简化）
        # 但需要校正压力因子——Δn=-2
        f_P = (P / 100) ** 2  # Δn=-2
        x_eq = Kp * f_P / (1 + Kp * f_P)
        return min(0.45, max(0.01, x_eq))
    
    @staticmethod
    def arrhenius_rate(Ea: float, A: float, T: float) -> float:
        """Arrhenius反应速率"""
        R = 8.314  # J/(mol·K)
        T_K = T + 273.15
        return A * math.exp(-Ea*1000 / (R * T_K))
    
    @staticmethod
    def langmuir_adsorption(P: float, K_ads: float = 0.01) -> float:
        """Langmuir吸附——覆盖率"""
        return K_ads * P / (1 + K_ads * P)
    
    @staticmethod
    def catalyst_deactivation(time_h: float, lifetime: float) -> float:
        """催化剂失活"""
        if time_h < lifetime * 0.5:
            return 1.0
        return max(0.3, 1.0 - (time_h - lifetime*0.5) / (lifetime*0.5) * 0.7)


class VirtualAmmoniaExperiment:
    """合成氨虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.catalyst = conditions.get('catalyst', 'Fe (promoted)')
        self.params = CATALYSTS.get(self.catalyst, CATALYSTS['Fe (promoted)'])
        self.temp = conditions.get('temp_C', 450)
        self.pressure = conditions.get('pressure_bar', 200)
        self.ratio = conditions.get('ratio_H2_N2', 3.0)
        self.space_velocity = conditions.get('space_velocity_h', 10000)  # h⁻¹
        self.time_h = conditions.get('time_h', 100)
        
    def run(self) -> Dict:
        # 1. 平衡转化率
        x_eq = AmmoniaPhysics.equilibrium_conversion(
            self.temp, self.pressure, self.ratio
        )
        
        # 2. 反应速率
        k = AmmoniaPhysics.arrhenius_rate(
            self.params['activation_energy'],
            self.params['pre_exponential'],
            self.temp
        )
        
        # 3. 吸附效应
        coverage = AmmoniaPhysics.langmuir_adsorption(self.pressure)
        
        # 4. 温度效应——偏离最适温度
        T_opt = self.params['optimal_temp']
        if self.temp <= T_opt:
            # 低温→速率低但平衡高
            f_T_rate = k / AmmoniaPhysics.arrhenius_rate(
                self.params['activation_energy'],
                self.params['pre_exponential'],
                T_opt
            )
        else:
            # 高温→速率高但平衡低+催化剂失活
            f_T_rate = 1.0
        
        # 5. 压力效应
        P_opt = self.params['optimal_pressure']
        f_P = min(2.0, self.pressure / P_opt)
        
        # 6. 空速效应——高空速→低转化
        f_SV = min(1.0, 10000 / self.space_velocity)
        
        # 7. 催化剂失活
        f_deact = AmmoniaPhysics.catalyst_deactivation(
            self.time_h, self.params['lifetime_h']
        )
        
        # 8. 实际转化率 = min(动力学转化率, 平衡转化率)
        kinetic_x = f_T_rate * f_P * f_SV * coverage * 0.8
        actual_x = min(kinetic_x, x_eq) * f_deact
        actual_x = max(0.01, min(0.45, actual_x))
        
        # 9. 氨产率
        nh3_yield = actual_x * 2 * 17 / (28 + 3*2) * 100  # 简化质量产率
        
        # 10. 出口NH3浓度
        nh3_conc = actual_x / (1 + actual_x) * 100
        
        return {
            'catalyst': self.catalyst,
            'conditions': f"{self.temp}°C/{self.pressure}bar/SV{self.space_velocity}",
            'equilibrium_conversion': round(x_eq * 100, 1),
            'actual_conversion': round(actual_x * 100, 1),
            'nh3_yield': round(nh3_yield, 1),
            'nh3_concentration': round(nh3_conc, 1),
            'rate_constant': round(k, 2),
            'catalyst_activity': round(f_deact * 100, 1),
        }


class AmmoniaValidation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        for paper in self.papers:
            exp = VirtualAmmoniaExperiment(paper)
            pred = exp.run()
            
            real_conv = paper.get('conversion_pct', 0)
            pred_conv = pred['actual_conversion']
            error = abs(pred_conv - real_conv)
            
            real_yield = paper.get('nh3_yield_pct', 0)
            pred_yield = pred['nh3_yield']
            yield_error = abs(pred_yield - real_yield)
            
            results.append({
                'id': paper['id'],
                'catalyst': paper['catalyst'],
                'conditions': f"{paper.get('temp_C',450)}°C/{paper.get('pressure_bar',200)}bar",
                'real_conv': real_conv,
                'pred_conv': pred_conv,
                'conv_error': round(error, 1),
                'real_yield': real_yield,
                'pred_yield': pred_yield,
                'yield_error': round(yield_error, 1),
            })
        
        conv_errors = [r['conv_error'] for r in results]
        
        return {
            'total': len(results),
            'conv_mean_error': round(sum(conv_errors)/len(conv_errors), 1),
            'conv_within_2': sum(1 for e in conv_errors if e < 2),
            'conv_within_5': sum(1 for e in conv_errors if e < 5),
            'conv_within_10': sum(1 for e in conv_errors if e < 10),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——合成氨虚拟实验引擎 ===\n")
    
    v = AmmoniaValidation('/home/z/my-project/swarmlabs_ammonia_validation.json')
    result = v.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"转化率平均误差: {result['conv_mean_error']}%")
    print(f"误差<2%: {result['conv_within_2']}组 ({result['conv_within_2']/result['total']*100:.0f}%)")
    print(f"误差<5%: {result['conv_within_5']}组 ({result['conv_within_5']/result['total']*100:.0f}%)")
    print(f"误差<10%: {result['conv_within_10']}组 ({result['conv_within_10']/result['total']*100:.0f}%)")
    
    print(f"\n{'ID':<8} {'催化剂':<18} {'条件':<15} {'真实转化':>6} {'预测转化':>6} {'误差':>5}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['catalyst']:<18} {r['conditions']:<15} {r['real_conv']:>5.1f}% {r['pred_conv']:>5.1f}% {r['conv_error']:>4.1f}%")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_ammonia_result.json', 'w'), ensure_ascii=False, indent=2)
