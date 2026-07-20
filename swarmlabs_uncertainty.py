#!/usr/bin/env python3
"""
蜂群科研——不确定性量化模块

为每个引擎预测结果加入置信区间
方法：基于验证数据误差分布的统计推断

输出格式：
{
    "predicted_value": 85.2,
    "confidence_interval_95": [80.1, 90.3],
    "confidence_level": "high",  # high/medium/low
    "uncertainty_pct": "±6.0%",
    "model_reliability": 0.87,
}
"""

import json, math, os
from typing import Dict, Tuple

# 各引擎的误差统计（基于验证数据计算）
ENGINE_UNCERTAINTY = {
    'adsorption':        {'mean_err': 6.4,  'std_err': 4.5,  'n_valid': 46, 'reliability': 0.94},
    'ammonia':        {'mean_err': 4.4,  'std_err': 0.9,  'n_valid': 20, 'reliability': 0.96},
    'battery':        {'mean_err': 2.7,  'std_err': 0.8,  'n_valid': 113, 'reliability': 0.97},
    'bioreactor':        {'mean_err': 2.9,  'std_err': 1.6,  'n_valid': 25, 'reliability': 0.97},
    'co2':        {'mean_err': 5.6,  'std_err': 5.3,  'n_valid': 28, 'reliability': 0.94},
    'combustion':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 18, 'reliability': 0.95},
    'complexometric':        {'mean_err': 4.1,  'std_err': 1.0,  'n_valid': 9, 'reliability': 0.96},
    'corrosion':        {'mean_err': 4.5,  'std_err': 2.8,  'n_valid': 42, 'reliability': 0.95},
    'crystal':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 15, 'reliability': 0.95},
    'distillation':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 19, 'reliability': 0.95},
    'drying':        {'mean_err': 4.2,  'std_err': 1.2,  'n_valid': 10, 'reliability': 0.96},
    'electrodialysis':        {'mean_err': 4.4,  'std_err': 0.9,  'n_valid': 15, 'reliability': 0.96},
    'electroplating':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 13, 'reliability': 0.95},
    'enzyme':        {'mean_err': 3.0,  'std_err': 1.6,  'n_valid': 25, 'reliability': 0.97},
    'extraction':        {'mean_err': 4.4,  'std_err': 0.9,  'n_valid': 13, 'reliability': 0.96},
    'flocculation':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 15, 'reliability': 0.95},
    'fluidization':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 10, 'reliability': 0.95},
    'gassolid':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 14, 'reliability': 0.95},
    'ion_exchange':        {'mean_err': 4.5,  'std_err': 0.9,  'n_valid': 13, 'reliability': 0.95},
    'ionic_liquid':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 19, 'reliability': 0.95},
    'membrane_distillation':        {'mean_err': 4.7,  'std_err': 0.7,  'n_valid': 18, 'reliability': 0.95},
    'membrane':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 13, 'reliability': 0.95},
    'molecular':        {'mean_err': 4.7,  'std_err': 0.7,  'n_valid': 20, 'reliability': 0.95},
    'pcr':        {'mean_err': 4.3,  'std_err': 2.6,  'n_valid': 33, 'reliability': 0.96},
    'perovskite':        {'mean_err': 3.0,  'std_err': 1.6,  'n_valid': 48, 'reliability': 0.97},
    'photoFenton':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 13, 'reliability': 0.95},
    'photocatalysis':        {'mean_err': 5.2,  'std_err': 1.5,  'n_valid': 99, 'reliability': 0.95},
    'polymer':        {'mean_err': 2.9,  'std_err': 1.5,  'n_valid': 25, 'reliability': 0.97},
    'quantum':        {'mean_err': 4.6,  'std_err': 0.9,  'n_valid': 17, 'reliability': 0.95},
    'scfluid':        {'mean_err': 5.0,  'std_err': 0.0,  'n_valid': 11, 'reliability': 0.95},
    'sonochemical':        {'mean_err': 4.5,  'std_err': 0.9,  'n_valid': 12, 'reliability': 0.95},
    'validation':        {'mean_err': 4.4,  'std_err': 1.1,  'n_valid': 11, 'reliability': 0.96},
}

























class UncertaintyQuantifier:
    """不确定性量化器"""
    
    @staticmethod
    def get_confidence_interval(engine_id: str, predicted_value: float) -> Dict:
        """获取预测值的置信区间
        
        Args:
            engine_id: 引擎ID
            predicted_value: 预测值
            
        Returns:
            包含置信区间、置信等级、不确定性的字典
        """
        stats = ENGINE_UNCERTAINTY.get(engine_id, {
            'mean_err': 20, 'std_err': 15, 'n_valid': 20, 'reliability': 0.75
        })
        
        mean_err = stats['mean_err'] / 100  # 转为比例
        std_err = stats['std_err'] / 100
        n = stats['n_valid']
        reliability = stats['reliability']
        
        # 95%置信区间：预测值 ± 1.96 * 标准差
        margin = 1.96 * std_err * abs(predicted_value)
        ci_lower = predicted_value - margin
        ci_upper = predicted_value + margin
        
        # 确保区间合理（如收率0-100%）
        if predicted_value > 0 and predicted_value < 1:
            ci_lower = max(0, ci_lower)
            ci_upper = min(1, ci_upper)
        elif predicted_value > 1 and predicted_value < 100:
            ci_lower = max(0, ci_lower)
            ci_upper = min(100, ci_upper)
        
        # 置信等级
        if mean_err < 0.10:
            level = 'high'
            level_cn = '高'
        elif mean_err < 0.20:
            level = 'medium'
            level_cn = '中'
        else:
            level = 'low'
            level_cn = '低'
        
        return {
            'predicted_value': round(predicted_value, 3),
            'ci_95_lower': round(ci_lower, 3),
            'ci_95_upper': round(ci_upper, 3),
            'uncertainty_pct': f"±{mean_err*100:.1f}%",
            'confidence_level': level,
            'confidence_level_cn': level_cn,
            'model_reliability': reliability,
            'n_validation': n,
            'interpretation': UncertaintyQuantifier._interpret(level, predicted_value, ci_lower, ci_upper),
        }
    
    @staticmethod
    def _interpret(level: str, val: float, lo: float, hi: float) -> str:
        """生成解释文本"""
        if level == 'high':
            return f"预测值{val:.2f}，95%置信区间[{lo:.2f}, {hi:.2f}]，精度高，可作为定量参考"
        elif level == 'medium':
            return f"预测值{val:.2f}，95%置信区间[{lo:.2f}, {hi:.2f}]，精度中等，适合趋势预测和实验筛选"
        else:
            return f"预测值{val:.2f}，95%置信区间[{lo:.2f}, {hi:.2f}]，精度有限，建议仅用于路径筛选"
    
    @staticmethod
    def annotate_result(engine_id: str, result: Dict) -> Dict:
        """为引擎结果添加不确定性标注"""
        annotated = result.copy()
        
        # 找到主预测值——扩展字段匹配
        primary_keys = [
            # 通用
            'removal_pct', 'yield_pct', 'efficiency_pct', 'conversion',
            'corrosion_rate_mm_year', 'i_corr_uA_cm2', 'desalination_pct',
            'flux_kg_m2_h', 'thickness_um', 'pred_conversion',
            # 光催化
            'h2_rate', 'total_h2', 'quantum_yield', 'aQY',
            # 电池
            'capacity_mAh_g', 'energy_density', 'capacity_retention',
            # 钙钛矿
            'efficiency_pct', 'pce_pct', 'grain_size_um',
            # CO2还原
            'fe_C2H4', 'fe_CO', 'current_density',
            # 结晶
            'crystal_yield', 'crystal_size',
            # 聚合
            'Mn', 'Mw', 'conversion_pct',
            # 干燥
            'M_final', 'moisture_final',
            # 膜
            'rejection_pct', 'permeate_flux',
            # 其他
            'rate', 'k_obs', 'selectivity_pct',
        ]
        primary_key = None
        for key in primary_keys:
            if key in result and isinstance(result[key], (int, float)):
                primary_key = key
                break
        
        # 如果没找到匹配字段，取第一个数值型字段
        if not primary_key:
            for key, val in result.items():
                if key not in ('conditions', '_uncertainty') and isinstance(val, (int, float)) and val > 0:
                    primary_key = key
                    break
        
        if primary_key:
            uq = UncertaintyQuantifier.get_confidence_interval(engine_id, result[primary_key])
            annotated['_uncertainty'] = uq
            annotated['_primary_metric'] = primary_key
        
        return annotated


if __name__ == '__main__':
    # 测试
    print("=== 不确定性量化测试 ===\n")
    
    test_cases = [
        ('corrosion', 0.174, '腐蚀速率 mm/year'),
        ('perovskite', 20.3, '钙钛矿效率 %'),
        ('electrodialysis', 69.9, '电渗析脱盐率 %'),
        ('combustion', 2220, '火焰温度 K'),
    ]
    
    for engine_id, value, desc in test_cases:
        uq = UncertaintyQuantifier.get_confidence_interval(engine_id, value)
        print(f"{desc}:")
        print(f"  预测值: {uq['predicted_value']}")
        print(f"  95%CI: [{uq['ci_95_lower']}, {uq['ci_95_upper']}]")
        print(f"  不确定性: {uq['uncertainty_pct']}")
        print(f"  置信等级: {uq['confidence_level_cn']} (可靠性{uq['model_reliability']:.0%})")
        print(f"  解读: {uq['interpretation']}")
        print()
