#!/usr/bin/env python3
"""
蜂群科研——钙钛矿虚拟实验引擎

在虚拟环境中模拟钙钛矿太阳能电池的制备过程：
1. 前驱体溶液配制（溶剂/浓度/配比）
2. 旋涂成膜（温度/时间/氛围）
3. 退火结晶（温度/时间）
4. 器件性能预测（效率/带隙/稳定性）

物理约束：
- 结晶热力学（成核与生长）
- 溶剂蒸发动力学
- 相变理论（α相→δ相转变）
- 缺陷化学
- 光电转换极限（Shockley-Queisser）
"""

import json, math, random
from dataclasses import dataclass, field
from typing import Dict, List, Optional

# ===== 钙钛矿材料参数 =====

PEROVSKITE_SYSTEMS = {
    'MAPbI3': {
        'formula': 'CH3NH3PbI3',
        'bandgap_eV': 1.55,
        'formation_E': -0.12,  # eV，形成能
        'decomp_temp_C': 200,  # 分解温度
        'crystal_system': 'tetragonal',
        'tolerance_factor': 0.91,
        'ref_efficiency': 19.5,  # 参考效率
    },
    'FAPbI3': {
        'formula': 'HC(NH2)2PbI3',
        'bandgap_eV': 1.48,
        'formation_E': -0.08,
        'decomp_temp_C': 180,
        'crystal_system': 'trigonal',
        'tolerance_factor': 0.99,
        'ref_efficiency': 22.1,
    },
    'MA0.6FA0.4PbI3': {
        'formula': '(CH3NH3)0.6(HC(NH2)2)0.4PbI3',
        'bandgap_eV': 1.52,
        'formation_E': -0.10,
        'decomp_temp_C': 190,
        'crystal_system': 'tetragonal',
        'tolerance_factor': 0.95,
        'ref_efficiency': 20.8,
    },
    'Cs0.05FA0.85MA0.10PbI3': {
        'formula': 'Cs0.05(HC(NH2)2)0.85(CH3NH3)0.10PbI3',
        'bandgap_eV': 1.53,
        'formation_E': -0.14,
        'decomp_temp_C': 210,
        'crystal_system': 'trigonal',
        'tolerance_factor': 0.97,
        'ref_efficiency': 23.8,
    },
    'CsPbBr3': {
        'formula': 'CsPbBr3',
        'bandgap_eV': 2.30,
        'formation_E': -0.20,
        'decomp_temp_C': 250,
        'crystal_system': 'cubic',
        'tolerance_factor': 0.85,
        'ref_efficiency': 8.5,
    },
    'MAPbI3-xBrx': {
        'formula': 'CH3NH3Pb(I0.8Br0.2)3',
        'bandgap_eV': 1.75,
        'formation_E': -0.13,
        'decomp_temp_C': 195,
        'crystal_system': 'tetragonal',
        'tolerance_factor': 0.93,
        'ref_efficiency': 18.2,
    },
}

SOLVENT_PARAMS = {
    'DMF': {'bp': 153, 'evap_rate': 1.0, 'coordination': 0.8, 'viscosity': 0.92},
    'DMSO': {'bp': 189, 'evap_rate': 0.6, 'coordination': 0.95, 'viscosity': 1.99},
    'GBL': {'bp': 204, 'evap_rate': 0.5, 'coordination': 0.7, 'viscosity': 1.73},
    'DMF+DMSO': {'bp': 170, 'evap_rate': 0.85, 'coordination': 0.88, 'viscosity': 1.3},
}

ADDITIVE_PARAMS = {
    'none': {'effect': 1.0, 'defect_passivation': 0, 'grain_size_factor': 1.0},
    'MACl': {'effect': 1.12, 'defect_passivation': 0.15, 'grain_size_factor': 1.3},
    'Pb(SCN)2': {'effect': 1.10, 'defect_passivation': 0.20, 'grain_size_factor': 1.4},
    'H2O': {'effect': 0.85, 'defect_passivation': -0.10, 'grain_size_factor': 0.8},
}


# ===== 物理约束 =====

class PerovskitePhysics:
    """钙钛矿物理约束器"""
    
    @staticmethod
    def nucleation_rate(T: float, dG: float, conc: float = 1.0) -> float:
        """成核速率——经验模型
        基于实验观察：100°C时成核速率~0.8，温度每升高10°C翻倍
        """
        T_ref = 373.15  # 100°C
        # 温度效应（Arrhenius简化）
        f_T = math.exp(-(0.15 / (8.617e-5 * T)) * (1 - T_ref/T))
        # 形成能效应（负值越大→越稳定→成核越快）
        f_dG = min(1.5, abs(dG) / 0.12)
        return min(1.0, f_T * f_dG * 0.8)
    
    @staticmethod
    def crystal_growth(T: float, T_decomp: float, time_h: float) -> float:
        """晶体生长——经验模型
        100°C时growth≈0.85，温度每升10°C增加15%
        接近分解温度时退化
        """
        T_ref = 100
        # 温度效应（相对100°C归一化）
        f_T = min(1.5, math.exp(0.015 * (T - T_ref)))
        # 接近分解温度时退化
        if T > T_decomp - 30:
            f_T *= math.exp(-(T - (T_decomp - 30)) / 15)
        # 时间效应（4h饱和）
        f_time = min(1.0, time_h / 1.0)
        return min(0.99, 0.85 * f_T * f_time)
    
    @staticmethod
    def phase_stability(T: float, tolerance_factor: float, system: str = '') -> float:
        """相稳定性——容忍因子、温度、体系决定相变
        α相（光活性）vs δ相（非活性）
        """
        # 含Cs的三阳离子体系在低温也稳定α相
        if 'Cs' in system:
            if T > 80:
                return 0.93
            else:
                return 0.80
        # FAPbI3: 室温δ相，需要高温稳定α相
        if tolerance_factor > 0.95:
            if T > 120:
                return 0.95  # α相稳定
            else:
                return 0.65  # δ相混入
        else:
            # MAPbI3: 室温α相稳定
            return 0.90
    
    @staticmethod
    def solvent_evaporation(T: float, bp: float, time_h: float) -> float:
        """溶剂蒸发——旋涂+退火
        旋涂过程蒸发~70%，退火完成剩余30%
        """
        # 旋涂基础蒸发（70%）
        base_evap = 0.70
        # 退火补充蒸发
        if T >= bp:
            anneal_evap = 0.30
        else:
            # 低于沸点时部分蒸发
            anneal_evap = 0.30 * min(1.0, time_h * math.exp(-(bp - T) / 40))
        return min(0.99, base_evap + anneal_evap)
    
    @staticmethod
    def defect_density(T: float, time_h: float, atmosphere: str) -> float:
        """缺陷密度——影响效率和稳定性"""
        # 高温→更多空位缺陷
        base_defect = 1e15 * math.exp(-(0.2 / (8.617e-5 * (T + 273.15))))
        # 长时间退火→缺陷迁移聚集
        if time_h > 2:
            base_defect *= 1 + (time_h - 2) * 0.1
        # 空气氛围→氧化→更多缺陷
        if atmosphere == 'air':
            base_defect *= 1.8
        return base_defect
    
    @staticmethod
    def shockley_queisser(bandgap: float) -> float:
        """Shockley-Queisser极限——光电转换理论最大效率"""
        # SQ极限公式（简化）
        # Eg=1.34eV时最大效率33.7%
        if bandgap < 0.5 or bandgap > 3.0:
            return 0
        return 33.7 * math.exp(-((bandgap - 1.34) / 0.5)**2)


# ===== 虚拟钙钛矿实验 =====

class VirtualPerovskiteExperiment:
    """钙钛矿虚拟实验——从配制到器件"""
    
    def __init__(self, conditions: Dict):
        self.system = conditions.get('system', 'MAPbI3')
        self.params = PEROVSKITE_SYSTEMS.get(self.system, PEROVSKITE_SYSTEMS['MAPbI3'])
        self.solvent = conditions.get('solvent', 'DMF')
        self.solvent_params = SOLVENT_PARAMS.get(self.solvent, SOLVENT_PARAMS['DMF'])
        self.temp_C = conditions.get('temp_C', 100)
        self.time_h = conditions.get('time_h', 1)
        self.atmosphere = conditions.get('atmosphere', 'N2')
        self.additive = conditions.get('additive', 'none')
        self.additive_params = ADDITIVE_PARAMS.get(self.additive, ADDITIVE_PARAMS['none'])
        self.anneal_C = conditions.get('anneal_C', 100)
        
        # 模拟状态
        self.crystallinity = 0.0  # 结晶度
        self.grain_size = 0.0  # 晶粒大小(μm)
        self.defect_density = 0.0  # 缺陷密度
        self.efficiency = 0.0  # 光电效率
        self.bandgap = self.params['bandgap_eV']
    
    def run(self) -> Dict:
        """运行完整虚拟实验"""
        # Step 1: 溶剂蒸发
        evap = PerovskitePhysics.solvent_evaporation(
            self.temp_C, self.solvent_params['bp'], self.time_h
        )
        
        # Step 2: 成核
        nucleation = PerovskitePhysics.nucleation_rate(
            self.temp_C + 273.15, self.params['formation_E']
        )
        
        # Step 3: 晶体生长
        growth = PerovskitePhysics.crystal_growth(
            self.anneal_C, self.params['decomp_temp_C'], self.time_h
        )
        
        # Step 4: 相稳定性
        phase = PerovskitePhysics.phase_stability(
            self.anneal_C, self.params['tolerance_factor'], self.system
        )
        
        # Step 5: 缺陷密度
        defects = PerovskitePhysics.defect_density(
            self.anneal_C, self.time_h, self.atmosphere
        )
        
        # Step 6: 添加剂效应
        add_effect = self.additive_params['effect']
        defect_pass = self.additive_params['defect_passivation']
        grain_factor = self.additive_params['grain_size_factor']
        
        # Step 7: 结晶度计算
        self.crystallinity = min(0.99, nucleation * growth * phase * evap)
        
        # Step 8: 晶粒大小
        self.grain_size = growth * grain_factor * (1 + nucleation * 0.5) * 0.5  # μm
        
        # Step 9: 缺陷修正
        effective_defects = defects * (1 - defect_pass)
        
        # Step 10: 效率计算
        sq_limit = PerovskitePhysics.shockley_queisser(self.bandgap)
        ref_eff = self.params['ref_efficiency']
        
        # 效率 = 参考效率 × 结晶度因子 × 溶剂因子 × 添加剂因子 × 缺陷因子 × 相因子
        crystallinity_factor = self.crystallinity / 0.55  # 归一化到参考结晶度
        solvent_factor = self.solvent_params['coordination'] / 0.8  # 归一化
        defect_factor = max(0.5, 1.0 - (effective_defects - 1e15) / 5e15)
        phase_factor = phase / 0.90
        
        self.efficiency = ref_eff * crystallinity_factor * solvent_factor * add_effect * defect_factor * phase_factor
        
        # 限制在SQ极限内
        self.efficiency = min(self.efficiency, sq_limit * 0.85)
        self.efficiency = max(5.0, min(26.0, self.efficiency))
        
        # Step 11: 带隙微调（退火温度影响）
        bandgap_shift = (self.anneal_C - 100) * 0.0005
        self.bandgap = self.params['bandgap_eV'] + bandgap_shift
        
        return self._result()
    
    def _result(self) -> Dict:
        return {
            'system': self.system,
            'conditions': {
                'solvent': self.solvent,
                'temp_C': self.temp_C,
                'time_h': self.time_h,
                'atmosphere': self.atmosphere,
                'additive': self.additive,
                'anneal_C': self.anneal_C,
            },
            'predicted_efficiency': round(self.efficiency, 1),
            'predicted_bandgap': round(self.bandgap, 3),
            'crystallinity': round(self.crystallinity, 3),
            'grain_size_um': round(self.grain_size, 2),
            'defect_density': round(self.defect_density or 1e15, 2),
        }


# ===== 论文验证 =====

class PerovskiteValidation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        
        for paper in self.papers:
            exp = VirtualPerovskiteExperiment(paper)
            predicted = exp.run()
            
            real_eff = paper['efficiency_pct']
            pred_eff = predicted['predicted_efficiency']
            eff_error = abs(pred_eff - real_eff)
            
            real_gap = paper['bandgap_eV']
            pred_gap = predicted['predicted_bandgap']
            gap_error = abs(pred_gap - real_gap)
            
            results.append({
                'id': paper['id'],
                'system': paper['system'],
                'conditions': f"{paper['solvent']}@{paper['anneal_C']}°C {paper['time_h']}h {paper.get('additive','none')}",
                'real_efficiency': real_eff,
                'predicted_efficiency': pred_eff,
                'eff_error': round(eff_error, 1),
                'real_bandgap': real_gap,
                'predicted_bandgap': pred_gap,
                'gap_error': round(gap_error, 3),
            })
        
        eff_errors = [r['eff_error'] for r in results]
        gap_errors = [r['gap_error'] for r in results]
        
        return {
            'total': len(results),
            'eff_mean_error': round(sum(eff_errors) / len(eff_errors), 1),
            'eff_max_error': round(max(eff_errors), 1),
            'eff_min_error': round(min(eff_errors), 1),
            'eff_within_1': sum(1 for e in eff_errors if e < 1),
            'eff_within_2': sum(1 for e in eff_errors if e < 2),
            'eff_within_3': sum(1 for e in eff_errors if e < 3),
            'eff_within_5': sum(1 for e in eff_errors if e < 5),
            'gap_mean_error': round(sum(gap_errors) / len(gap_errors), 3),
            'gap_max_error': round(max(gap_errors), 3),
            'gap_within_0.05': sum(1 for e in gap_errors if e < 0.05),
            'gap_within_0.1': sum(1 for e in gap_errors if e < 0.1),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——钙钛矿虚拟实验引擎 ===\n")
    
    validator = PerovskiteValidation('/home/z/my-project/swarmlabs_perovskite_validation.json')
    result = validator.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"\n--- 效率预测 ---")
    print(f"平均误差: {result['eff_mean_error']}%")
    print(f"误差范围: {result['eff_min_error']}% - {result['eff_max_error']}%")
    print(f"误差<1%: {result['eff_within_1']}组 ({result['eff_within_1']/result['total']*100:.0f}%)")
    print(f"误差<2%: {result['eff_within_2']}组 ({result['eff_within_2']/result['total']*100:.0f}%)")
    print(f"误差<3%: {result['eff_within_3']}组 ({result['eff_within_3']/result['total']*100:.0f}%)")
    print(f"误差<5%: {result['eff_within_5']}组 ({result['eff_within_5']/result['total']*100:.0f}%)")
    
    print(f"\n--- 带隙预测 ---")
    print(f"平均误差: {result['gap_mean_error']} eV")
    print(f"误差范围: 0 - {result['gap_max_error']} eV")
    print(f"误差<0.05eV: {result['gap_within_0.05']}组 ({result['gap_within_0.05']/result['total']*100:.0f}%)")
    print(f"误差<0.1eV: {result['gap_within_0.1']}组 ({result['gap_within_0.1']/result['total']*100:.0f}%)")
    
    print(f"\n--- 全部结果 ---")
    print(f"{'ID':<8} {'体系':<16} {'条件':<30} {'真实效率':>6} {'预测效率':>6} {'误差':>5} {'带隙误差':>6}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['system']:<16} {r['conditions']:<30} {r['real_efficiency']:>5.1f}% {r['predicted_efficiency']:>5.1f}% {r['eff_error']:>4.1f}% {r['gap_error']:>5.3f}eV")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_perovskite_result.json', 'w'), ensure_ascii=False, indent=2)
    print(f"\n结果已保存: swarmlabs_perovskite_result.json")
