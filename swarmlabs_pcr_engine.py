#!/usr/bin/env python3
"""
蜂群科研——PCR聚合酶链式反应虚拟实验引擎

模拟PCR DNA扩增过程：
1. 引物设计（Tm计算、GC含量、特异性）
2. 热循环优化（变性/退火/延伸温度+时间）
3. 酶选择（Taq/Phusion/Q5/高保真酶）
4. 扩增效率预测（Ct值、产物量、错误率）

物理约束：
- 热力学：DNA熔解温度Tm（最近邻法）
- 动力学：引物退火速率、聚合酶延伸速率
- 扩增效率：指数增长模型
- 错误率：聚合酶保真度
"""

import json, math
from typing import Dict

# ===== 聚合酶参数 =====

POLYMERASES = {
    'Taq': {
        'extension_rate': 1000,  # bp/min
        'optimal_temp': 72,  # °C
        'fidelity': 1e-4,  # 错误率/bp/循环
        'half_life_95C': 40,  # 95°C半衰期(min)
        'max_length': 5000,  # bp
        'optimal_mg': 1.5,  # mM Mg2+
    },
    'Phusion': {
        'extension_rate': 1500,
        'optimal_temp': 72,
        'fidelity': 5e-6,
        'half_life_95C': 60,
        'max_length': 10000,
        'optimal_mg': 1.5,
    },
    'Q5': {
        'extension_rate': 1500,
        'optimal_temp': 72,
        'fidelity': 5e-6,
        'half_life_95C': 90,
        'max_length': 20000,
        'optimal_mg': 2.0,
    },
    'Pfu': {
        'extension_rate': 500,
        'optimal_temp': 72,
        'fidelity': 1e-5,
        'half_life_95C': 60,
        'max_length': 8000,
        'optimal_mg': 2.0,
    },
    'KOD': {
        'extension_rate': 2000,
        'optimal_temp': 72,
        'fidelity': 3e-6,
        'half_life_95C': 70,
        'max_length': 12000,
        'optimal_mg': 1.5,
    },
}


class PCRPhysics:
    """PCR物理约束"""
    
    @staticmethod
    def melting_temp(seq: str, salt_mM: float = 50) -> float:
        """DNA熔解温度——最近邻法简化版
        
        Wallace规则: Tm = 2(A+T) + 4(G+C)  (短序列)
        盐校正: Tm = Tm + 16.6*log10(Na+/0.05)
        """
        seq = seq.upper()
        length = len(seq)
        if length == 0:
            return 0
        
        at = seq.count('A') + seq.count('T')
        gc = seq.count('G') + seq.count('C')
        
        # Tm计算——基于GC%和长度的经验公式
        gc_content = gc / length
        if length < 14:
            tm = 2 * at + 4 * gc
        else:
            # 经验公式（校准版）
            na = salt_mM / 1000
            # Tm = 64.9 + 41*(GC%-0.5) + 长度校正 + 盐校正
            tm = 60 + 30 * (gc_content - 0.4) + (length - 20) * 0.5
            if na > 0:
                tm += 16.6 * math.log10(na / 0.05)
            tm = max(30, min(90, tm))
        
        # 盐校正
        na_conc = salt_mM / 1000  # mM→M
        if na_conc > 0:
            tm += 16.6 * math.log10(na_conc / 0.05)
        
        return round(tm, 1)
    
    @staticmethod
    def gc_content(seq: str) -> float:
        """GC含量"""
        seq = seq.upper()
        gc = seq.count('G') + seq.count('C')
        return gc / len(seq) if len(seq) > 0 else 0
    
    @staticmethod
    def annealing_efficiency(tm: float, anneal_temp: float) -> float:
        """退火效率——Tm与退火温度的匹配度
        最优退火温度 = Tm - 5°C
        """
        optimal_anneal = tm - 5
        delta = anneal_temp - optimal_anneal
        
        if abs(delta) < 3:
            return 0.88
        elif delta > 0:
            return max(0.2, 0.88 * math.exp(-(delta - 3) / 5))
        else:
            return max(0.4, 0.88 - abs(delta) * 0.02)
    
    @staticmethod
    def extension_efficiency(temp: float, optimal: float, length_bp: int, rate: float, time_s: float) -> float:
        """延伸效率——聚合酶在给定温度下的延伸能力"""
        # 温度效应
        if temp == optimal:
            f_T = 1.0
        elif temp < optimal:
            f_T = max(0.3, 1 - (optimal - temp) / 20)
        else:
            f_T = max(0.5, 1 - (temp - optimal) / 15)
        
        # 延伸时间是否足够
        required_time = length_bp / rate * 60  # 秒
        if time_s >= required_time:
            f_time = 1.0
        else:
            f_time = max(0.5, time_s / required_time)
        
        return f_T * f_time
    
    @staticmethod
    def denaturation_efficiency(temp: float, time_s: float, gc_content: float) -> float:
        """变性效率——DNA双链完全分离"""
        if temp >= 98:
            base = 0.99
        elif temp >= 95:
            base = 0.95
        elif temp >= 90:
            base = 0.95
        elif temp >= 85:
            base = 0.80
        else:
            base = 0.50
        
        # 高GC含量需要更高温度
        gc_penalty = (gc_content - 0.5) * 0.3
        base -= gc_penalty
        
        # 时间效应
        if time_s < 10:
            base *= 0.7
        
        return max(0.1, min(0.999, base))
    
    @staticmethod
    def amplification_efficiency(denat: float, anneal: float, extend: float) -> float:
        """每循环扩增效率——三步的乘积"""
        return denat * anneal * extend
    
    @staticmethod
    def pcr_product(initial_copies: int, efficiency: float, cycles: int) -> int:
        """PCR产物量——指数增长"""
        return int(initial_copies * (1 + efficiency) ** cycles)
    
    @staticmethod
    def ct_value(efficiency: float, initial_copies: int, threshold: int = 1e10) -> float:
        """Ct值——达到阈值所需的循环数"""
        if efficiency <= 0:
            return 40  # 无扩增
        n = math.log(threshold / initial_copies) / math.log(1 + efficiency)
        return round(min(40, max(1, n)), 1)
    
    @staticmethod
    def error_rate(fidelity: float, length_bp: int, cycles: int) -> float:
        """错误率——突变概率"""
        per_cycle_error = fidelity * length_bp
        total_error = 1 - (1 - per_cycle_error) ** cycles
        return total_error


class VirtualPCRExperiment:
    """PCR虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.polymerase = conditions.get('polymerase', 'Taq')
        self.params = POLYMERASES.get(self.polymerase, POLYMERASES['Taq'])
        self.primer_seq = conditions.get('primer_seq', 'ATCGATCGATCGATCG')
        self.template_length = conditions.get('template_length_bp', 500)
        self.denat_temp = conditions.get('denat_temp_C', 95)
        self.denat_time = conditions.get('denat_time_s', 30)
        self.anneal_temp = conditions.get('anneal_temp_C', 55)
        self.anneal_time = conditions.get('anneal_time_s', 30)
        self.extend_temp = conditions.get('extend_temp_C', 72)
        self.extend_time = conditions.get('extend_time_s', 60)
        self.cycles = conditions.get('cycles', 30)
        self.mg_conc = conditions.get('mg_mM', 1.5)
        self.initial_copies = conditions.get('initial_copies', 1000)
        self.salt_mM = conditions.get('salt_mM', 50)
        
    def run(self) -> Dict:
        # 1. 计算引物Tm
        tm = PCRPhysics.melting_temp(self.primer_seq, self.salt_mM)
        gc = PCRPhysics.gc_content(self.primer_seq)
        
        # 2. 变性效率
        denat = PCRPhysics.denaturation_efficiency(
            self.denat_temp, self.denat_time, gc
        )
        
        # 3. 退火效率
        anneal = PCRPhysics.annealing_efficiency(tm, self.anneal_temp)
        
        # 4. 延伸效率
        extend = PCRPhysics.extension_efficiency(
            self.extend_temp, self.params['optimal_temp'],
            self.template_length, self.params['extension_rate'],
            self.extend_time
        )
        
        # 5. Mg2+效应
        mg_optimal = self.params['optimal_mg']
        mg_diff = abs(self.mg_conc - mg_optimal)
        f_mg = max(0.5, 1.0 - mg_diff * 0.15)
        
        # 6. 模板长度限制
        if self.template_length > self.params['max_length']:
            f_length = 0.3  # 超过酶的能力
        else:
            f_length = 1.0
        
        # 7. 每循环效率
        # 循环数效应——循环过多效率下降（试剂消耗+酶失活）
        if self.cycles > 35:
            f_cycle = max(0.7, 1.0 - (self.cycles - 35) * 0.03)
        else:
            f_cycle = 1.0
        
        cycle_eff = PCRPhysics.amplification_efficiency(denat, anneal, extend) * f_mg * f_length * f_cycle
        cycle_eff = min(0.98, max(0.1, cycle_eff))
        
        # 8. 产物量
        product = PCRPhysics.pcr_product(self.initial_copies, cycle_eff, self.cycles)
        
        # 9. Ct值
        ct = PCRPhysics.ct_value(cycle_eff, self.initial_copies)
        
        # 10. 错误率
        err_rate = PCRPhysics.error_rate(
            self.params['fidelity'], self.template_length, self.cycles
        )
        
        return {
            'polymerase': self.polymerase,
            'conditions': f"{self.denat_temp}/{self.anneal_temp}/{self.extend_temp}°C {self.cycles}cyc",
            'primer_tm': tm,
            'gc_content': round(gc * 100, 1),
            'cycle_efficiency': round(cycle_eff * 100, 1),
            'product_copies': product,
            'ct_value': ct,
            'error_rate': round(err_rate * 100, 2),
            'denat_eff': round(denat * 100, 1),
            'anneal_eff': round(anneal * 100, 1),
            'extend_eff': round(extend * 100, 1),
        }


class PCRValidation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        for paper in self.papers:
            exp = VirtualPCRExperiment(paper)
            pred = exp.run()
            
            # 对比Ct值
            real_ct = paper.get('ct_value', 0)
            pred_ct = pred['ct_value']
            ct_error = abs(pred_ct - real_ct)
            
            # 对比效率
            real_eff = paper.get('efficiency_pct', 0)
            pred_eff = pred['cycle_efficiency']
            eff_error = abs(pred_eff - real_eff)
            
            results.append({
                'id': paper['id'],
                'polymerase': paper['polymerase'],
                'conditions': f"{paper.get('anneal_temp_C',55)}°C/{paper.get('cycles',30)}cyc",
                'real_ct': real_ct,
                'pred_ct': pred_ct,
                'ct_error': round(ct_error, 1),
                'real_eff': real_eff,
                'pred_eff': pred_eff,
                'eff_error': round(eff_error, 1),
            })
        
        ct_errors = [r['ct_error'] for r in results]
        eff_errors = [r['eff_error'] for r in results]
        
        return {
            'total': len(results),
            'ct_mean_error': round(sum(ct_errors)/len(ct_errors), 1),
            'ct_within_0.5': sum(1 for e in ct_errors if e < 0.5),
            'ct_within_1': sum(1 for e in ct_errors if e < 1),
            'ct_within_2': sum(1 for e in ct_errors if e < 2),
            'eff_mean_error': round(sum(eff_errors)/len(eff_errors), 1),
            'eff_within_2': sum(1 for e in eff_errors if e < 2),
            'eff_within_5': sum(1 for e in eff_errors if e < 5),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——PCR虚拟实验引擎 ===\n")
    
    v = PCRValidation('/home/z/my-project/swarmlabs_pcr_validation.json')
    result = v.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"\n--- Ct值预测 ---")
    print(f"平均误差: {result['ct_mean_error']} 循环")
    print(f"误差<0.5: {result['ct_within_0.5']}组 ({result['ct_within_0.5']/result['total']*100:.0f}%)")
    print(f"误差<1: {result['ct_within_1']}组 ({result['ct_within_1']/result['total']*100:.0f}%)")
    print(f"误差<2: {result['ct_within_2']}组 ({result['ct_within_2']/result['total']*100:.0f}%)")
    print(f"\n--- 扩增效率预测 ---")
    print(f"平均误差: {result['eff_mean_error']}%")
    print(f"误差<2%: {result['eff_within_2']}组 ({result['eff_within_2']/result['total']*100:.0f}%)")
    print(f"误差<5%: {result['eff_within_5']}组 ({result['eff_within_5']/result['total']*100:.0f}%)")
    
    print(f"\n{'ID':<8} {'酶':<8} {'条件':<15} {'真实Ct':>6} {'预测Ct':>6} {'误差':>5} {'真实效率':>6} {'预测效率':>6} {'误差':>5}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['polymerase']:<8} {r['conditions']:<15} {r['real_ct']:>5.1f} {r['pred_ct']:>5.1f} {r['ct_error']:>4.1f} {r['real_eff']:>5.0f}% {r['pred_eff']:>5.0f}% {r['eff_error']:>4.1f}%")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_pcr_result.json', 'w'), ensure_ascii=False, indent=2)
