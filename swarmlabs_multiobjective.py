#!/usr/bin/env python3
"""
蜂群科研——多目标预测模块

为虚拟实验结果增加多维度评估：
1. 主指标（收率/转化率/效率）
2. 副指标（选择性/纯度/副产物）
3. 经济指标（成本估算/时间成本）
4. 环保指标（E因子/原子经济性/毒性）
5. 可行性指标（设备要求/操作难度/安全风险）

输出统一的MultiObjective格式
"""

import math
from typing import Dict

class MultiObjectivePredictor:
    """多目标预测器"""
    
    @staticmethod
    def predict(engine_id: str, conditions: Dict, primary_result: Dict) -> Dict:
        """生成多目标评估
        
        Args:
            engine_id: 引擎ID
            conditions: 实验条件
            primary_result: 主引擎的预测结果
            
        Returns:
            多目标评估字典
        """
        mo = {
            'primary': MultiObjectivePredictor._primary_metric(engine_id, primary_result),
            'secondary': MultiObjectivePredictor._secondary_metrics(engine_id, conditions, primary_result),
            'economic': MultiObjectivePredictor._economic_metrics(engine_id, conditions),
            'environmental': MultiObjectivePredictor._environmental_metrics(engine_id, conditions),
            'feasibility': MultiObjectivePredictor._feasibility_metrics(engine_id, conditions),
        }
        
        # 综合评分
        scores = []
        if mo['primary'].get('normalized') is not None:
            scores.append(mo['primary']['normalized'])
        if mo['secondary'].get('selectivity_score') is not None:
            scores.append(mo['secondary']['selectivity_score'])
        if mo['economic'].get('cost_score') is not None:
            scores.append(mo['economic']['cost_score'])
        if mo['environmental'].get('green_score') is not None:
            scores.append(mo['environmental']['green_score'])
        if mo['feasibility'].get('feasibility_score') is not None:
            scores.append(mo['feasibility']['feasibility_score'])
        
        mo['overall_score'] = round(sum(scores) / len(scores), 2) if scores else 0
        mo['recommendation'] = MultiObjectivePredictor._recommend(mo['overall_score'])
        
        return mo
    
    @staticmethod
    def _primary_metric(engine_id: str, result: Dict) -> Dict:
        """主指标"""
        # 找到主预测值
        value = None
        unit = ''
        name = ''
        
        for key, label, u in [
            ('yield_pct', '收率', '%'),
            ('removal_pct', '去除率', '%'),
            ('efficiency_pct', '效率', '%'),
            ('conversion', '转化率', '%'),
            ('desalination_pct', '脱盐率', '%'),
            ('corrosion_rate_mm_year', '腐蚀速率', 'mm/year'),
            ('flux_kg_m2_h', '通量', 'kg/m²/h'),
            ('thickness_um', '镀层厚度', 'μm'),
        ]:
            if key in result:
                value = result[key]
                name = label
                unit = u
                break
        
        if value is None:
            return {'name': 'N/A', 'value': None, 'normalized': 0.5}
        
        # 归一化到0-1
        if unit == '%':
            normalized = min(1.0, value / 100)
        elif unit == 'mm/year':
            normalized = max(0, 1 - value / 1.0)  # 腐蚀越低越好
        elif unit == 'kg/m²/h':
            normalized = min(1.0, value / 30)
        elif unit == 'μm':
            normalized = min(1.0, value / 50)
        else:
            normalized = 0.5
        
        return {
            'name': name,
            'value': value,
            'unit': unit,
            'normalized': round(normalized, 3),
        }
    
    @staticmethod
    def _secondary_metrics(engine_id: str, conditions: Dict, result: Dict) -> Dict:
        """副指标——选择性/纯度/副产物"""
        T = conditions.get('temperature_C', 25)
        time_min = conditions.get('time_min', conditions.get('time_h', 1) * 60)
        
        # 选择性——温度越低选择性越高（简化）
        T_factor = max(0.3, 1 - (T - 25) / 200)
        # 时间越短选择性越高
        t_factor = max(0.3, 1 - math.log(max(time_min, 1)) / 10)
        
        selectivity = T_factor * t_factor * 0.9  # 基准0.9
        
        # 纯度——与转化率相关
        primary_val = 0.8
        for key in ['conversion', 'yield_pct', 'removal_pct', 'efficiency_pct']:
            if key in result:
                primary_val = result[key] / 100 if result[key] > 1 else result[key]
                break
        
        purity = min(0.99, 0.7 + 0.3 * primary_val)
        
        # 副产物比例
        byproduct = max(0.01, 1 - selectivity) * 0.3
        
        return {
            'selectivity_pct': round(selectivity * 100, 1),
            'purity_pct': round(purity * 100, 1),
            'byproduct_ratio': round(byproduct, 3),
            'selectivity_score': round(selectivity, 3),
        }
    
    @staticmethod
    def _economic_metrics(engine_id: str, conditions: Dict) -> Dict:
        """经济指标"""
        T = conditions.get('temperature_C', 25)
        time_min = conditions.get('time_min', 60)
        time_h = time_min / 60
        
        # 能耗成本（简化：温度×时间）
        energy_cost = T * time_h * 0.05  # ¥
        
        # 时间成本
        time_cost = time_h * 50  # ¥/h 人工+设备
        
        # 试剂成本（简化）
        reagent_cost = 20  # ¥ 基准
        
        total_cost = energy_cost + time_cost + reagent_cost
        
        # 成本评分（越低越好，归一化到0-1）
        cost_score = max(0.1, 1 - total_cost / 500)
        
        return {
            'energy_cost_CNY': round(energy_cost, 1),
            'time_cost_CNY': round(time_cost, 1),
            'reagent_cost_CNY': reagent_cost,
            'total_cost_CNY': round(total_cost, 1),
            'cost_score': round(cost_score, 3),
        }
    
    @staticmethod
    def _environmental_metrics(engine_id: str, conditions: Dict) -> Dict:
        """环保指标"""
        # E因子（废物/产品比）——简化
        e_factor = 2.5  # 化工平均
        
        # 原子经济性——简化
        atom_economy = 0.75
        
        # 毒性评分
        T = conditions.get('temperature_C', 25)
        P = conditions.get('pressure_bar', conditions.get('pressure_MPa', 1) * 10)
        tox_score = max(0.3, 1 - T / 500 - P / 200)
        
        # 绿色评分
        green_score = (1 / e_factor) * 0.4 + atom_economy * 0.3 + tox_score * 0.3
        
        return {
            'e_factor': e_factor,
            'atom_economy_pct': round(atom_economy * 100, 1),
            'toxicity_score': round(tox_score, 3),
            'green_score': round(green_score, 3),
        }
    
    @staticmethod
    def _feasibility_metrics(engine_id: str, conditions: Dict) -> Dict:
        """可行性指标"""
        T = conditions.get('temperature_C', 25)
        P = conditions.get('pressure_bar', conditions.get('pressure_MPa', 1) * 10)
        time_min = conditions.get('time_min', 60)
        
        # 设备要求
        if T > 500 or P > 100:
            equipment = '高（耐高温高压设备）'
            eq_score = 0.3
        elif T > 200 or P > 10:
            equipment = '中（常规工业设备）'
            eq_score = 0.6
        else:
            equipment = '低（常规实验室设备）'
            eq_score = 0.9
        
        # 操作难度
        difficulty = max(0.3, 1 - time_min / 480)
        
        # 安全风险
        if T > 300 or P > 50:
            safety = '高风险'
            safety_score = 0.3
        elif T > 100 or P > 5:
            safety = '中风险'
            safety_score = 0.6
        else:
            safety = '低风险'
            safety_score = 0.9
        
        feasibility_score = (eq_score + difficulty + safety_score) / 3
        
        return {
            'equipment_requirement': equipment,
            'operation_difficulty': round(difficulty, 3),
            'safety_risk': safety,
            'feasibility_score': round(feasibility_score, 3),
        }
    
    @staticmethod
    def _recommend(score: float) -> str:
        """生成推荐建议"""
        if score >= 0.75:
            return "⭐ 强烈推荐——多目标综合表现优秀，建议优先实验"
        elif score >= 0.60:
            return "✅ 推荐——综合表现良好，可纳入实验计划"
        elif score >= 0.45:
            return "⚠️ 一般——存在短板，建议优化条件后再实验"
        else:
            return "❌ 不推荐——多项指标偏低，建议调整方案"


if __name__ == '__main__':
    # 测试
    print("=== 多目标预测测试 ===\n")
    
    # 模拟腐蚀实验结果
    result = {'corrosion_rate_mm_year': 0.174, 'i_corr_uA_cm2': 15.0}
    conditions = {'temperature_C': 25, 'time_min': 720}
    mo = MultiObjectivePredictor.predict('corrosion', conditions, result)
    
    import json
    print(json.dumps(mo, indent=2, ensure_ascii=False))
