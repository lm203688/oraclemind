#!/usr/bin/env python3
"""
蜂群科研——虚拟加速实验器

核心能力：
1. 批量筛选 — 一次提交N个条件，返回排名Top-K
2. 时间加速 — 模拟数月/数年老化实验
3. 配方搜索 — 在材料空间中自动搜索最优配比
4. 候选排名 — 从N个候选中选出最有前途的

使用场景：
  - 从100种催化剂中筛选Top 3
  - 模拟材料在5年自然环境中的老化
  - 搜索最优外加剂配比
  - 批量评估不同反应器条件
"""

import json, os, sys, math, random, time
from typing import List, Dict, Any, Tuple
from itertools import product

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)


class VirtualAccelerator:
    """虚拟加速实验器"""
    
    def __init__(self):
        self.engines = self._load_engines()
    
    def _load_engines(self) -> Dict:
        """加载可用引擎"""
        engines = {}
        try:
            from swarmlabs_api_unified import ENGINES
            engines = ENGINES
        except:
            pass
        return engines
    
    def _run_engine(self, engine_name: str, conditions: Dict) -> Dict:
        """运行单个引擎"""
        try:
            from swarmlabs_api_unified import ENGINES
            import importlib.util
            
            engine_info = ENGINES.get(engine_name)
            if not engine_info:
                return {'error': f'Engine {engine_name} not found'}
            
            engine_file = os.path.join(BASE_DIR, engine_info['file'])
            if not os.path.exists(engine_file):
                return {'error': f'Engine file not found'}
            
            spec = importlib.util.spec_from_file_location(engine_name, engine_file)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            
            cls = getattr(mod, engine_info['class'], None)
            if cls is None:
                return {'error': f'Class not found'}
            
            exp = cls(conditions)
            result = exp.run()
            
            # 添加不确定性
            try:
                from swarmlabs_uncertainty import UncertaintyQuantifier
                result = UncertaintyQuantifier.annotate_result(engine_name, result)
            except:
                pass
            
            return result
        except Exception as e:
            return {'error': str(e)}
    
    # ============================================================
    # 能力1: 批量筛选
    # ============================================================
    
    def batch_screening(self, engine_name: str, candidates: List[Dict], 
                        top_k: int = 5, metric: str = None) -> Dict:
        """
        批量筛选——从N个候选条件中选出Top-K
        
        Args:
            engine_name: 引擎名
            candidates: 候选条件列表 [{conditions: {...}, label: "..."}]
            top_k: 返回前K个
            metric: 排序指标（默认取主指标）
        
        Returns:
            {
                'total': N,
                'screened': N,
                'top_k': [...],
                'all_results': [...],
                'recommendation': "..."
            }
        """
        results = []
        
        for i, candidate in enumerate(candidates):
            conditions = candidate.get('conditions', candidate)
            label = candidate.get('label', f'候选{i+1}')
            
            result = self._run_engine(engine_name, conditions)
            
            # 提取主指标
            primary_value = None
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm)
            elif metric and metric in result:
                primary_value = result[metric]
            else:
                # 取第一个数值
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            
            unc = result.get('_uncertainty', {})
            
            results.append({
                'rank': 0,
                'label': label,
                'conditions': conditions,
                'primary_metric': result.get('_primary_metric', metric or ''),
                'primary_value': primary_value,
                'uncertainty': unc.get('uncertainty_pct', ''),
                'reliability': unc.get('confidence_level_cn', ''),
                'full_result': result,
            })
        
        # 排序——降序（值越大越好，如去除率/产率/容量）
        results.sort(key=lambda x: x['primary_value'] or 0, reverse=True)
        
        # 分配排名
        for i, r in enumerate(results):
            r['rank'] = i + 1
        
        # 取Top-K
        top = results[:top_k]
        
        # 生成推荐
        recommendation = self._generate_recommendation(top, engine_name)
        
        return {
            'engine': engine_name,
            'total_candidates': len(candidates),
            'screened': len(results),
            'top_k': top,
            'recommendation': recommendation,
            'screening_time_s': round(time.time() - time.time(), 2),  # 占位
        }
    
    def _generate_recommendation(self, top: List[Dict], engine: str) -> str:
        """生成筛选推荐文本"""
        if not top:
            return "无有效结果"
        
        best = top[0]
        text = f"从{len(top)}个候选中推荐Top {len(top)}：\n"
        for r in top:
            text += f"  #{r['rank']} {r['label']}: {r['primary_metric']}={r['primary_value']:.2f} (±{r['uncertainty']})\n"
        
        text += f"\n建议优先验证 #{best['rank']} {best['label']}，"
        text += f"预测{best['primary_metric']}={best['primary_value']:.2f}，"
        text += f"不确定性{best['uncertainty']}，可靠性{best['reliability']}。"
        
        return text
    
    # ============================================================
    # 能力2: 时间加速——老化模拟
    # ============================================================
    
    def accelerated_aging(self, engine_name: str, conditions: Dict,
                          duration_years: float = 1.0,
                          environment: str = 'standard',
                          checkpoints: int = 10) -> Dict:
        """
        加速老化模拟——在虚拟环境中模拟数月/数年的材料老化
        
        Args:
            engine_name: 引擎名
            conditions: 初始条件
            duration_years: 模拟时长（年）
            environment: 环境类型
                - standard: 标准条件
                - outdoor: 户外风吹日晒
                - humid: 高湿
                - uv: 紫外线照射
                - thermal_cycle: 温度循环
                - corrosive: 腐蚀环境
            checkpoints: 检查点数（输出多少个时间点的结果）
        
        Returns:
            {
                'duration_years': 5,
                'environment': 'outdoor',
                'aging_curve': [...],
                'final_state': {...},
                'degradation_rate': ...,
                'lifetime_estimate': ...,
            }
        """
        # 初始实验
        initial_result = self._run_engine(engine_name, conditions)
        
        # 环境因子——决定老化速率
        ENV_FACTORS = {
            'standard':     {'temp_factor': 1.0, 'humidity': 0.5, 'uv': 0.3, 'corrosion': 0.1},
            'outdoor':      {'temp_factor': 1.5, 'humidity': 0.7, 'uv': 1.0, 'corrosion': 0.3},
            'humid':        {'temp_factor': 1.0, 'humidity': 1.0, 'uv': 0.2, 'corrosion': 0.5},
            'uv':           {'temp_factor': 1.2, 'humidity': 0.3, 'uv': 1.0, 'corrosion': 0.2},
            'thermal_cycle': {'temp_factor': 2.0, 'humidity': 0.5, 'uv': 0.5, 'corrosion': 0.4},
            'corrosive':    {'temp_factor': 1.3, 'humidity': 0.8, 'uv': 0.3, 'corrosion': 1.0},
        }
        
        env = ENV_FACTORS.get(environment, ENV_FACTORS['standard'])
        
        # 提取初始性能值
        primary_key = initial_result.get('_primary_metric', '')
        if not primary_key:
            for k, v in initial_result.items():
                if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                    primary_key = k
                    break
        
        initial_value = initial_result.get(primary_key, 1.0)
        
        # 老化模型——基于环境因子的年衰减率
        # P(t) = P0 * exp(-k_year * t)
        # 不同环境有不同基础衰减率
        ENV_RATES = {
            'standard': 0.01,     # 1%/年（实验室条件）
            'outdoor': 0.03,      # 3%/年（户外风吹日晒）
            'humid': 0.04,        # 4%/年（高湿环境）
            'uv': 0.05,           # 5%/年（强紫外照射）
            'thermal_cycle': 0.06, # 6%/年（温度循环）
            'corrosive': 0.08,    # 8%/年（腐蚀环境）
        }
        
        k_year = ENV_RATES.get(environment, 0.02)
        
        # 材料特性老化系数——不同材料不同老化机理
        conditions_str = str(conditions).lower()
        
        # 材料老化系数库（值越大老化越快）
        MATERIAL_AGING = {
            # 贵金属——极稳定
            'pt': 0.2, 'au': 0.2, 'pd': 0.3, 'rh': 0.3, 'ru': 0.3,
            # 碳材料——稳定
            'activated_carbon': 0.4, 'graphene': 0.4, 'cnt': 0.4, 'go': 0.5, 'rgo': 0.5, 'carbon': 0.4,
            # 钛基——较稳定
            'tio2': 0.3, 'srtio3': 0.3, 'batio3': 0.3, 'lto': 0.3,
            # 硅基——稳定
            'sio2': 0.3, 'mesoporous_sio2': 0.3, 'mcm41': 0.4, 'sba15': 0.4,
            # 氧化物——中等
            'zno': 0.6, 'fe2o3': 0.7, 'wo3': 0.6, 'bivo4': 0.6, 'cuo': 0.8, 'moo3': 0.7,
            # 硫化物——较不稳定
            'cds': 1.2, 'cdse': 1.5, 'zns': 1.0, 'pbS': 1.8, 'ins3': 1.2,
            # 钙钛矿——不稳定
            'mapbi3': 2.5, 'fapbi3': 2.0, 'cspbi3': 1.5, 'mapbbr3': 3.0,
            # 金属——易腐蚀
            'fe': 2.0, 'steel': 2.0, 'carbon_steel': 2.5, 'cu': 1.5, 'zn': 2.0, 'al': 1.0,
            # MOF——中等
            'mof': 0.8, 'zif8': 0.7, 'uio66': 0.6, 'mil101': 0.7, 'mof_808': 0.8,
            # 聚合物——一般
            'pmma': 1.0, 'ps': 1.2, 'pan': 1.3, 'paa': 1.5, 'pam': 1.2, 'pvdf': 0.8,
            # 生物质——不稳定
            'chitosan': 1.5, 'cellulose': 1.8, 'lignin': 1.3, 'biochar': 0.8,
            # 粘土——稳定
            'kaolin': 0.5, 'montmorillonite': 0.5, 'bentonite': 0.5, 'attapulgite': 0.5,
        }
        
        material_factor = 1.0
        for mat_key, factor in MATERIAL_AGING.items():
            if mat_key in conditions_str:
                material_factor = factor
                break
        
        k_year *= material_factor
        
        # 转换为秒速率用于计算
        k = k_year / (365 * 24 * 3600)
        
        # 生成老化曲线
        aging_curve = []
        for i in range(checkpoints + 1):
            t_years = duration_years * i / checkpoints
            retention = math.exp(-k * t_years * 365 * 24 * 3600)  # 转换为秒
            current_value = initial_value * retention
            
            # 不确定性随时间增加
            base_unc = initial_result.get('_uncertainty', {}).get('uncertainty_pct', '±5%')
            try:
                base_unc_val = float(base_unc.replace('±', '').replace('%', ''))
            except:
                base_unc_val = 5.0
            time_unc = base_unc_val * (1 + t_years / duration_years * 0.5)
            
            aging_curve.append({
                'time_years': round(t_years, 2),
                'time_human': self._format_time(t_years),
                'performance_retention': round(retention * 100, 1),
                'current_value': round(current_value, 4),
                'uncertainty': f"±{time_unc:.1f}%",
            })
        
        # 估算寿命——性能降到初始值80%的时间
        lifetime = -1 / k_year * math.log(0.8) if k_year > 0 else 999
        
        # 最终状态
        final = aging_curve[-1]
        
        return {
            'engine': engine_name,
            'conditions': conditions,
            'duration_years': duration_years,
            'duration_human': self._format_time(duration_years),
            'environment': environment,
            'initial_value': initial_value,
            'primary_metric': primary_key,
            'aging_curve': aging_curve,
            'final_retention': final['performance_retention'],
            'final_value': final['current_value'],
            'degradation_rate_per_year': round((1 - final['performance_retention'] / 100) / duration_years * 100, 2),
            'lifetime_estimate_years': round(lifetime, 1),
            'lifetime_human': self._format_time(lifetime),
            'virtual_time_s': 0.1,  # 虚拟耗时
            'real_time_equivalent': self._format_time(duration_years),
        }
    
    def _format_time(self, years: float) -> str:
        """格式化时间"""
        if years < 1/365:
            hours = years * 365 * 24
            return f"{hours:.1f}小时"
        elif years < 1:
            days = years * 365
            return f"{days:.0f}天"
        elif years < 10:
            return f"{years:.1f}年"
        else:
            return f"{years:.0f}年"
    
    # ============================================================
    # 能力3: 配方空间搜索
    # ============================================================
    
    def formulation_search(self, engine_name: str,
                           param_ranges: Dict[str, Tuple[float, float, float]],
                           objective: str = 'maximize',
                           max_evaluations: int = 100,
                           target_metric: str = None) -> Dict:
        """
        配方空间搜索——在参数空间中搜索最优配比
        
        Args:
            engine_name: 引擎名
            param_ranges: 参数范围 {param: (min, max, step)}
                例如: {'temperature': (20, 80, 10), 'pH': (3, 9, 1)}
            objective: 'maximize' 或 'minimize'
            max_evaluations: 最大评估次数
            target_metric: 优化目标指标
        
        Returns:
            {
                'optimal_conditions': {...},
                'optimal_value': ...,
                'search_space_size': N,
                'evaluated': N,
                'top_5': [...],
                'sensitivity': {...},
            }
        """
        # 生成参数组合
        param_names = list(param_ranges.keys())
        param_values = []
        for name in param_names:
            lo, hi, step = param_ranges[name]
            vals = []
            v = lo
            while v <= hi + 0.001:
                vals.append(round(v, 4))
                v += step
            param_values.append(vals)
        
        # 计算搜索空间大小
        space_size = 1
        for vals in param_values:
            space_size *= len(vals)
        
        # 如果空间太大，随机采样
        all_combinations = list(product(*param_values))
        if len(all_combinations) > max_evaluations:
            random.seed(42)
            combinations = random.sample(all_combinations, max_evaluations)
        else:
            combinations = all_combinations
        
        # 批量评估
        results = []
        for combo in combinations:
            conditions = dict(zip(param_names, combo))
            result = self._run_engine(engine_name, conditions)
            
            # 提取目标值
            if target_metric and target_metric in result:
                value = result[target_metric]
            elif '_primary_metric' in result:
                pm = result['_primary_metric']
                value = result.get(pm, 0)
            else:
                value = 0
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        value = v
                        break
            
            unc = result.get('_uncertainty', {})
            
            results.append({
                'conditions': conditions,
                'value': value if isinstance(value, (int, float)) else 0,
                'uncertainty': unc.get('uncertainty_pct', ''),
                'result': result,
            })
        
        # 排序
        reverse = (objective == 'maximize')
        results.sort(key=lambda x: x['value'], reverse=reverse)
        
        # 最优解
        optimal = results[0] if results else None
        
        # 敏感性分析——每个参数的影响
        sensitivity = self._sensitivity_analysis(results, param_names)
        
        return {
            'engine': engine_name,
            'search_space_size': space_size,
            'evaluated': len(results),
            'param_ranges': {k: {'min': v[0], 'max': v[1], 'step': v[2]} for k, v in param_ranges.items()},
            'objective': objective,
            'target_metric': target_metric or (results[0]['result'].get('_primary_metric', '') if results else ''),
            'optimal_conditions': optimal['conditions'] if optimal else {},
            'optimal_value': optimal['value'] if optimal else None,
            'optimal_uncertainty': optimal['uncertainty'] if optimal else '',
            'top_5': results[:5],
            'sensitivity': sensitivity,
            'full_search': space_size <= max_evaluations,
        }
    
    def _sensitivity_analysis(self, results: List[Dict], param_names: List[str]) -> Dict:
        """敏感性分析——每个参数对结果的影响"""
        sensitivity = {}
        
        for param in param_names:
            # 按该参数值分组
            groups = {}
            for r in results:
                val = r['conditions'].get(param)
                if val is not None:
                    if val not in groups:
                        groups[val] = []
                    groups[val].append(r['value'])
            
            # 计算每组平均值
            avg_by_param = {val: sum(vals) / len(vals) for val, vals in groups.items()}
            
            # 计算影响度——值的范围
            if avg_by_param:
                vals = list(avg_by_param.values())
                impact = max(vals) - min(vals) if vals else 0
                sensitivity[param] = {
                    'impact': round(impact, 4),
                    'avg_by_value': {str(k): round(v, 4) for k, v in sorted(avg_by_param.items())},
                }
        
        return sensitivity
    
    # ============================================================
    # 能力4: 多材料对比
    # ============================================================
    
    def material_comparison(self, engine_name: str,
                            materials: List[Dict],
                            fixed_conditions: Dict = None) -> Dict:
        """
        多材料对比——相同条件下对比不同材料的性能
        
        Args:
            engine_name: 引擎名
            materials: 材料列表 [{name: "材料A", properties: {...}}, ...]
            fixed_conditions: 固定条件
        
        Returns:
            {
                'comparison_table': [...],
                'best_material': "...",
                'ranking': [...],
            }
        """
        fixed_conditions = fixed_conditions or {}
        results = []
        
        for mat in materials:
            conditions = {**fixed_conditions, **mat.get('properties', {})}
            if 'name' in mat:
                conditions.setdefault('material', mat['name'])
            
            result = self._run_engine(engine_name, conditions)
            
            primary_value = None
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm)
            else:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            
            unc = result.get('_uncertainty', {})
            
            results.append({
                'material': mat.get('name', 'unknown'),
                'conditions': conditions,
                'primary_value': primary_value,
                'uncertainty': unc.get('uncertainty_pct', ''),
                'reliability': unc.get('confidence_level_cn', ''),
                'full_result': result,
            })
        
        # 排序
        results.sort(key=lambda x: x['primary_value'] or 0, reverse=True)
        
        return {
            'engine': engine_name,
            'materials_tested': len(materials),
            'fixed_conditions': fixed_conditions,
            'comparison_table': results,
            'best_material': results[0]['material'] if results else None,
            'ranking': [r['material'] for r in results],
        }


# API端点

    # ============================================================
    # 能力5: 老化后性能评估——老化→再运行→看还能不能用
    # ============================================================
    
    def aging_performance_eval(self, engine_name: str, conditions: Dict,
                                duration_years: float = 1.0,
                                environment: str = 'outdoor') -> Dict:
        """
        老化后性能评估——模拟老化后材料还能不能用
        
        流程：
        1. 初始实验→获得初始性能
        2. 模拟N年老化→获得老化后性能
        3. 用老化后参数重新运行实验→获得老化后实验结果
        4. 对比初始vs老化后→判断是否仍可用
        
        Returns:
            {
                'initial_performance': {...},
                'aged_performance': {...},
                'retention_pct': ...,
                'still_usable': True/False,
                'recommendation': "...",
            }
        """
        # 1. 初始实验
        initial_result = self._run_engine(engine_name, conditions)
        primary_key = initial_result.get('_primary_metric', '')
        if not primary_key:
            for k, v in initial_result.items():
                if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                    primary_key = k
                    break
        initial_value = initial_result.get(primary_key, 1.0)
        
        # 2. 老化模拟
        aging_result = self.accelerated_aging(
            engine_name, conditions, duration_years, environment, checkpoints=5
        )
        
        retention = aging_result['final_retention'] / 100
        aged_value = initial_value * retention
        
        # 3. 用老化后参数重新运行（降低性能参数模拟老化）
        aged_conditions = dict(conditions)
        # 根据老化程度调整关键参数
        for key in list(aged_conditions.keys()):
            if 'temperature' in key.lower() or 'T' == key:
                pass  # 温度不变
            elif any(k in key.lower() for k in ['catalyst', 'adsorbent', 'cathode', 'material']):
                pass  # 材料类型不变
        
        aged_result = self._run_engine(engine_name, aged_conditions)
        # 按保持率降低老化后结果
        for k in list(aged_result.keys()):
            if k not in ('conditions', '_uncertainty', '_primary_metric') and isinstance(aged_result[k], (int, float)) and aged_result[k] > 0:
                aged_result[k] = round(aged_result[k] * retention, 4)
        
        # 4. 判断是否仍可用
        # 标准：保持率>80%可用，>60%勉强可用，<60%建议更换
        if retention > 0.8:
            usable = 'good'
            recommendation = f"材料在{duration_years}年{environment}环境后保持率{retention*100:.1f}%，性能良好，可继续使用。"
        elif retention > 0.6:
            usable = 'acceptable'
            recommendation = f"材料在{duration_years}年{environment}环境后保持率{retention*100:.1f}%，性能下降明显，勉强可用，建议监控。"
        else:
            usable = 'replace'
            recommendation = f"材料在{duration_years}年{environment}环境后保持率仅{retention*100:.1f}%，性能严重下降，建议更换。"
        
        return {
            'engine': engine_name,
            'conditions': conditions,
            'environment': environment,
            'duration_years': duration_years,
            'initial_performance': {
                'primary_metric': primary_key,
                'value': initial_value,
                'full_result': {k: v for k, v in initial_result.items() if k not in ('_uncertainty',)},
            },
            'aged_performance': {
                'primary_metric': primary_key,
                'value': round(aged_value, 4),
                'retention_pct': aging_result['final_retention'],
                'full_result': {k: v for k, v in aged_result.items() if k not in ('_uncertainty',)},
            },
            'retention_pct': aging_result['final_retention'],
            'degradation_rate': aging_result['degradation_rate_per_year'],
            'lifetime_estimate': aging_result['lifetime_human'],
            'usable': usable,
            'recommendation': recommendation,
            'aging_curve': aging_result['aging_curve'],
        }

    # ============================================================
    # 能力6: 成本约束优化——在预算内搜索最优配比
    # ============================================================
    

    # ============================================================
    # 能力7: 安全边界检测——极端条件下可靠性降级
    # ============================================================

    def cost_constrained_search(self, engine_name: str,
                                 param_ranges: Dict[str, Tuple[float, float, float]],
                                 cost_model: Dict[str, float],
                                 budget: float = 1000,
                                 max_evaluations: int = 100,
                                 objective: str = 'maximize') -> Dict:
        """
        成本约束优化——在预算内搜索最优配比
        
        Args:
            engine_name: 引擎名
            param_ranges: 参数范围 {param: (min, max, step)}
            cost_model: 成本模型 {param: unit_cost}
                例如: {'temperature_C': 0.5, 'pH': 10, 'adsorbent_dose_g_L': 20}
                表示温度每度0.5元，pH调节10元，吸附剂20元/g
            budget: 总预算（元）
            max_evaluations: 最大评估次数
            objective: 'maximize' 或 'minimize'
        
        Returns:
            {
                'optimal_in_budget': {...},
                'optimal_no_budget': {...},
                'cost_efficiency': ...,
                'budget_used': ...,
                'feasible_count': N,
            }
        """
        from itertools import product as iproduct
        import random
        
        # 生成参数组合
        param_names = list(param_ranges.keys())
        param_values = []
        for name in param_names:
            lo, hi, step = param_ranges[name]
            vals = []
            v = lo
            while v <= hi + 0.001:
                vals.append(round(v, 4))
                v += step
            param_values.append(vals)
        
        all_combinations = list(iproduct(*param_values))
        if len(all_combinations) > max_evaluations:
            random.seed(42)
            combinations = random.sample(all_combinations, max_evaluations)
        else:
            combinations = all_combinations
        
        # 批量评估+成本计算
        results = []
        for combo in combinations:
            conditions = dict(zip(param_names, combo))
            
            # 计算成本
            cost = 0
            for param, unit_cost in cost_model.items():
                if param in conditions:
                    # 成本=参数值×单价
                    cost += conditions[param] * unit_cost
            
            # 超预算跳过
            if cost > budget:
                continue
            
            # 运行实验
            result = self._run_engine(engine_name, conditions)
            
            # 提取目标值
            primary_value = 0
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm, 0)
            else:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            
            unc = result.get('_uncertainty', {})
            
            # 成本效益=性能/成本
            cost_efficiency = primary_value / max(cost, 0.01)
            
            results.append({
                'conditions': conditions,
                'value': primary_value if isinstance(primary_value, (int, float)) else 0,
                'cost': round(cost, 2),
                'cost_efficiency': round(cost_efficiency, 4),
                'uncertainty': unc.get('uncertainty_pct', ''),
                'result': result,
            })
        
        if not results:
            return {
                'error': f'预算{budget}元内无可行方案',
                'budget': budget,
                'min_cost_needed': '请增加预算或放宽参数范围',
            }
        
        # 按性能排序
        reverse = (objective == 'maximize')
        results.sort(key=lambda x: x['value'], reverse=reverse)
        
        # 预算内最优（性能最高）
        optimal_in_budget = results[0]
        
        # 无预算约束最优（用于对比）
        all_results = []
        for combo in combinations:
            conditions = dict(zip(param_names, combo))
            cost = sum(conditions.get(p, 0) * c for p, c in cost_model.items())
            result = self._run_engine(engine_name, conditions)
            primary_value = 0
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm, 0)
            else:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            all_results.append({
                'conditions': conditions,
                'value': primary_value if isinstance(primary_value, (int, float)) else 0,
                'cost': round(cost, 2),
            })
        all_results.sort(key=lambda x: x['value'], reverse=reverse)
        optimal_no_budget = all_results[0] if all_results else None
        
        # 性能损失百分比
        perf_loss = 0
        if optimal_no_budget and optimal_no_budget['value'] > 0:
            perf_loss = (1 - optimal_in_budget['value'] / optimal_no_budget['value']) * 100
        
        # 按成本效益排序（性价比最高）
        results_by_efficiency = sorted(results, key=lambda x: x['cost_efficiency'], reverse=True)
        best_efficiency = results_by_efficiency[0]
        
        return {
            'engine': engine_name,
            'budget': budget,
            'cost_model': cost_model,
            'param_ranges': {k: {'min': v[0], 'max': v[1], 'step': v[2]} for k, v in param_ranges.items()},
            'feasible_count': len(results),
            'total_evaluated': len(combinations),
            'optimal_in_budget': {
                'conditions': optimal_in_budget['conditions'],
                'value': optimal_in_budget['value'],
                'cost': optimal_in_budget['cost'],
                'uncertainty': optimal_in_budget['uncertainty'],
                'cost_efficiency': optimal_in_budget['cost_efficiency'],
            },
            'best_cost_efficiency': {
                'conditions': best_efficiency['conditions'],
                'value': best_efficiency['value'],
                'cost': best_efficiency['cost'],
                'cost_efficiency': best_efficiency['cost_efficiency'],
            },
            'optimal_no_budget': {
                'conditions': optimal_no_budget['conditions'],
                'value': optimal_no_budget['value'],
                'cost': optimal_no_budget['cost'],
            },
            'performance_loss_pct': round(perf_loss, 1),
            'top_5_in_budget': results[:5],
        }
    
    def safety_boundary_check(self, engine_name: str, conditions: Dict) -> Dict:
        """
        安全边界检测——判断条件是否在可靠范围内
        
        检查：
        1. 温度是否超出安全范围
        2. 压力是否超出安全范围
        3. pH是否在极端值
        4. 浓度是否过高/过低
        5. 模型在此条件下的可靠性是否降级
        
        Returns:
            {
                'safety_level': 'safe'/'caution'/'danger',
                'warnings': [...],
                'reliability_downgrade': True/False,
                'estimated_error': ...,
                'recommendation': "...",
            }
        """
        warnings = []
        safety_level = 'safe'
        
        # 温度检查
        T = conditions.get('temperature', conditions.get('temperature_C', conditions.get('T', 25)))
        if isinstance(T, (int, float)):
            if T < -50 or T > 1000:
                warnings.append(f'温度{T}°C超出常规范围(-50~1000°C)，模型可靠性降低')
                safety_level = 'danger' if T < -100 or T > 1500 else 'caution'
            elif T > 500:
                warnings.append(f'高温{T}°C，需注意材料热稳定性')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
            elif T < 0:
                warnings.append(f'低温{T}°C，需注意溶剂冻结')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 压力检查
        P = conditions.get('pressure', conditions.get('P', conditions.get('P_Pa', 101325)))
        if isinstance(P, (int, float)):
            if P > 1e7:  # >10MPa
                warnings.append(f'高压{P/1e6:.1f}MPa，需注意设备安全')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
            if P > 1e8:  # >100MPa
                warnings.append(f'超高压{P/1e6:.1f}MPa，模型可能不适用')
                safety_level = 'danger'
        
        # pH检查
        pH = conditions.get('pH', 7)
        if isinstance(pH, (int, float)):
            if pH < 1 or pH > 14:
                warnings.append(f'极端pH={pH}，超出常规范围(1-14)')
                safety_level = 'danger'
            elif pH < 2 or pH > 13:
                warnings.append(f'强酸/强碱pH={pH}，需注意腐蚀')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 浓度检查
        C0 = conditions.get('C0', conditions.get('C0_mg_L', conditions.get('C0_mol_L', 0)))
        if isinstance(C0, (int, float)) and C0 > 0:
            if C0 > 10000:
                warnings.append(f'高浓度{C0}，可能超出模型适用范围')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 运行实验获取不确定性
        result = self._run_engine(engine_name, conditions)
        unc = result.get('_uncertainty', {})
        reliability = unc.get('confidence_level', 'high')
        
        # 如果不确定性>15%，可靠性降级
        unc_str = unc.get('uncertainty_pct', '±5%')
        try:
            unc_val = float(unc_str.replace('±', '').replace('%', ''))
        except:
            unc_val = 5.0
        
        if unc_val > 15:
            warnings.append(f'模型不确定性{unc_str}偏高(>15%)，预测仅供参考')
            safety_level = 'caution' if safety_level == 'safe' else safety_level
        elif unc_val > 10:
            warnings.append(f'模型不确定性{unc_str}中等，建议结合实验验证')
        
        # 估算极端条件下的误差倍增
        error_multiplier = 1.0
        if safety_level == 'caution':
            error_multiplier = 1.5
        elif safety_level == 'danger':
            error_multiplier = 3.0
        
        estimated_error = unc_val * error_multiplier
        
        # 生成推荐
        if safety_level == 'safe':
            recommendation = '条件在安全范围内，模型预测可靠。'
        elif safety_level == 'caution':
            recommendation = f'条件接近边界，预测误差可能增大{error_multiplier}倍。建议先做小规模验证实验。'
        else:
            recommendation = f'条件超出安全范围，模型预测不可靠(误差可能增大{error_multiplier}倍)。强烈建议先做实验验证，不要仅依赖虚拟预测。'
        
        return {
            'engine': engine_name,
            'conditions': conditions,
            'safety_level': safety_level,
            'safety_level_cn': {'safe': '安全', 'caution': '警告', 'danger': '危险'}[safety_level],
            'warnings': warnings,
            'model_uncertainty': unc_str,
            'model_reliability': reliability,
            'reliability_downgrade': safety_level != 'safe',
            'error_multiplier': error_multiplier,
            'estimated_error': f'±{estimated_error:.1f}%',
            'recommendation': recommendation,
        }


    # ============================================================
    # 能力8: 实验流程串联——多引擎串联模拟完整工艺链
    # ============================================================
    
    def process_chain(self, steps: List[Dict]) -> Dict:
        """
        实验流程串联——多个引擎串联模拟完整工艺链
        
        Args:
            steps: 流程步骤列表
                [
                    {
                        'engine': 'photocatalysis',
                        'conditions': {...},
                        'output_mapping': {'h2_rate': 'input_H2'}  # 输出映射到下一步
                    },
                    {
                        'engine': 'membrane',
                        'conditions': {...},  # 可以引用上一步映射的变量
                    },
                ]
        
        Returns:
            {
                'total_steps': N,
                'steps': [...],
                'final_output': {...},
                'uncertainty_propagation': ...,
            }
        """
        results = []
        accumulated_uncertainty = 0
        current_vars = {}
        
        for i, step in enumerate(steps):
            engine = step['engine']
            conditions = dict(step.get('conditions', {}))
            
            # 用上一步的输出替换变量
            for key, val in conditions.items():
                if isinstance(val, str) and val.startswith('$'):
                    var_name = val[1:]
                    if var_name in current_vars:
                        conditions[key] = current_vars[var_name]
            
            # 运行引擎
            result = self._run_engine(engine, conditions)
            
            # 提取主指标
            primary_key = result.get('_primary_metric', '')
            if not primary_key:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_key = k
                        break
            primary_value = result.get(primary_key, 0)
            
            # 不确定性传播
            unc = result.get('_uncertainty', {})
            unc_str = unc.get('uncertainty_pct', '±5%')
            try:
                unc_val = float(unc_str.replace('±', '').replace('%', ''))
            except:
                unc_val = 5.0
            
            # 累积不确定性——每步不确定性叠加（RSS法）
            accumulated_uncertainty = (accumulated_uncertainty**2 + unc_val**2) ** 0.5
            
            # 输出映射
            output_mapping = step.get('output_mapping', {})
            for src_key, dst_var in output_mapping.items():
                if src_key in result:
                    current_vars[dst_var] = result[src_key]
            
            # 保存主指标到变量
            current_vars[f'step{i+1}_output'] = primary_value
            current_vars[f'step{i+1}_metric'] = primary_key
            
            results.append({
                'step': i + 1,
                'engine': engine,
                'conditions': conditions,
                'primary_metric': primary_key,
                'primary_value': primary_value,
                'uncertainty': unc_str,
                'reliability': unc.get('confidence_level_cn', ''),
                'full_result': {k: v for k, v in result.items() if not k.startswith('_')},
            })
        
        # 最终输出
        final = results[-1] if results else {}
        
        return {
            'total_steps': len(steps),
            'steps': results,
            'final_output': {
                'engine': final.get('engine', ''),
                'primary_metric': final.get('primary_metric', ''),
                'primary_value': final.get('primary_value', 0),
            },
            'uncertainty_propagation': f'±{accumulated_uncertainty:.1f}%',
            'accumulated_uncertainty_pct': round(accumulated_uncertainty, 1),
            'process_summary': self._generate_process_summary(results, accumulated_uncertainty),
        }
    
    def _generate_process_summary(self, results: List[Dict], unc: float) -> str:
        """生成流程总结"""
        if not results:
            return "无结果"
        
        text = f"流程共{len(results)}步：\n"
        for r in results:
            text += f"  Step{r['step']}: {r['engine']} → {r['primary_metric']}={r['primary_value']:.4f} (±{r['uncertainty']})\n"
        
        final = results[-1]
        text += f"\n最终输出: {final['primary_metric']}={final['primary_value']:.4f}\n"
        text += f"累积不确定性: ±{unc:.1f}%\n"
        
        if unc < 10:
            text += "流程预测可靠，可作为定量参考。"
        elif unc < 20:
            text += "流程预测中等可靠，建议关键步骤实验验证。"
        else:
            text += "流程预测不确定性较高，建议每步都做实验验证。"
        
        return text


    



def add_accelerator_endpoints(app):
    """为Flask app添加加速器端点"""
    
    from flask import request, jsonify
    accelerator = VirtualAccelerator()
    
    @app.route('/api/v1/screen', methods=['POST'])
    def batch_screening():
        """批量筛选——从N个候选中选出Top-K"""
        data = request.json
        result = accelerator.batch_screening(
            engine_name=data['engine'],
            candidates=data['candidates'],
            top_k=data.get('top_k', 5),
            metric=data.get('metric'),
        )
        return jsonify(result)
    
    @app.route('/api/v1/aging', methods=['POST'])
    def accelerated_aging():
        """加速老化模拟"""
        data = request.json
        result = accelerator.accelerated_aging(
            engine_name=data['engine'],
            conditions=data.get('conditions', {}),
            duration_years=data.get('duration_years', 1.0),
            environment=data.get('environment', 'standard'),
            checkpoints=data.get('checkpoints', 10),
        )
        return jsonify(result)
    
    @app.route('/api/v1/formulation', methods=['POST'])
    def formulation_search():
        """配方空间搜索"""
        data = request.json
        result = accelerator.formulation_search(
            engine_name=data['engine'],
            param_ranges={k: tuple(v) for k, v in data['param_ranges'].items()},
            objective=data.get('objective', 'maximize'),
            max_evaluations=data.get('max_evaluations', 100),
            target_metric=data.get('target_metric'),
        )
        return jsonify(result)
    
    @app.route('/api/v1/compare', methods=['POST'])
    def material_comparison():
        """多材料对比"""
        data = request.json
        result = accelerator.material_comparison(
            engine_name=data['engine'],
            materials=data['materials'],
            fixed_conditions=data.get('fixed_conditions', {}),
        )
        return jsonify(result)
    
    @app.route('/api/v1/aging_eval', methods=['POST'])
    def aging_performance_eval():
        """老化后性能评估——老化→再运行→看材料还能不能用"""
        data = request.json
        result = accelerator.aging_performance_eval(
            engine_name=data['engine'],
            conditions=data.get('conditions', {}),
            duration_years=data.get('duration_years', 1.0),
            environment=data.get('environment', 'outdoor'),
        )
        return jsonify(result)
    
    @app.route('/api/v1/cost_search', methods=['POST'])
    def cost_constrained_search():
        """成本约束优化——在预算内搜索最优配比"""
        data = request.json
        result = accelerator.cost_constrained_search(
            engine_name=data['engine'],
            param_ranges={k: tuple(v) for k, v in data['param_ranges'].items()},
            cost_model=data['cost_model'],
            budget=data.get('budget', 1000),
            max_evaluations=data.get('max_evaluations', 100),
            objective=data.get('objective', 'maximize'),
        )
        return jsonify(result)
    
    @app.route('/api/v1/safety_check', methods=['POST'])
    def safety_boundary_check():
        """安全边界检测——极端条件下可靠性降级"""
        data = request.json
        result = accelerator.safety_boundary_check(
            engine_name=data['engine'],
            conditions=data.get('conditions', {}),
        )
        return jsonify(result)
    
    @app.route('/api/v1/process_chain', methods=['POST'])
    def process_chain():
        """实验流程串联——多引擎串联模拟完整工艺链"""
        data = request.json
        result = accelerator.process_chain(data.get('steps', []))
        return jsonify(result)
    
    return app


if __name__ == '__main__':
    acc = VirtualAccelerator()
    
    # 测试1: 批量筛选
    print("=== 测试1: 批量筛选光催化催化剂 ===")
    candidates = [
        {'label': 'TiO2-P25', 'conditions': {'catalyst': 'TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25}},
        {'label': 'CdS', 'conditions': {'catalyst': 'CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25}},
        {'label': 'ZnO', 'conditions': {'catalyst': 'ZnO', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25}},
        {'label': 'g-C3N4', 'conditions': {'catalyst': 'g-C3N4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25}},
        {'label': 'BiVO4', 'conditions': {'catalyst': 'BiVO4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25}},
    ]
    result = acc.batch_screening('photocatalysis', candidates, top_k=3)
    print(result['recommendation'])
    
    print("\n=== 测试2: 加速老化模拟 ===")
    result = acc.accelerated_aging(
        'perovskite',
        {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
        duration_years=5,
        environment='outdoor',
    )
    print(f"模拟时长: {result['duration_human']}")
    print(f"初始性能: {result['initial_value']}")
    print(f"5年后保持率: {result['final_retention']}%")
    print(f"预计寿命: {result['lifetime_human']}")
    print(f"年衰减率: {result['degradation_rate_per_year']}%/年")
    
    print("\n=== 测试3: 配方搜索 ===")
    result = acc.formulation_search(
        'adsorption',
        {'temperature_C': (20, 60, 10), 'pH': (3, 9, 2), 'adsorbent_dose_g_L': (0.5, 2.0, 0.5)},
        max_evaluations=50,
    )
    print(f"搜索空间: {result['search_space_size']}")
    print(f"评估数: {result['evaluated']}")
    print(f"最优条件: {result['optimal_conditions']}")
    print(f"最优值: {result['optimal_value']}")


    def cost_constrained_search(self, engine_name: str,
                                 param_ranges: Dict[str, Tuple[float, float, float]],
                                 cost_model: Dict[str, float],
                                 budget: float = 1000,
                                 max_evaluations: int = 100,
                                 objective: str = 'maximize') -> Dict:
        """
        成本约束优化——在预算内搜索最优配比
        
        Args:
            engine_name: 引擎名
            param_ranges: 参数范围 {param: (min, max, step)}
            cost_model: 成本模型 {param: unit_cost}
                例如: {'temperature_C': 0.5, 'pH': 10, 'adsorbent_dose_g_L': 20}
                表示温度每度0.5元，pH调节10元，吸附剂20元/g
            budget: 总预算（元）
            max_evaluations: 最大评估次数
            objective: 'maximize' 或 'minimize'
        
        Returns:
            {
                'optimal_in_budget': {...},
                'optimal_no_budget': {...},
                'cost_efficiency': ...,
                'budget_used': ...,
                'feasible_count': N,
            }
        """
        from itertools import product as iproduct
        import random
        
        # 生成参数组合
        param_names = list(param_ranges.keys())
        param_values = []
        for name in param_names:
            lo, hi, step = param_ranges[name]
            vals = []
            v = lo
            while v <= hi + 0.001:
                vals.append(round(v, 4))
                v += step
            param_values.append(vals)
        
        all_combinations = list(iproduct(*param_values))
        if len(all_combinations) > max_evaluations:
            random.seed(42)
            combinations = random.sample(all_combinations, max_evaluations)
        else:
            combinations = all_combinations
        
        # 批量评估+成本计算
        results = []
        for combo in combinations:
            conditions = dict(zip(param_names, combo))
            
            # 计算成本
            cost = 0
            for param, unit_cost in cost_model.items():
                if param in conditions:
                    # 成本=参数值×单价
                    cost += conditions[param] * unit_cost
            
            # 超预算跳过
            if cost > budget:
                continue
            
            # 运行实验
            result = self._run_engine(engine_name, conditions)
            
            # 提取目标值
            primary_value = 0
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm, 0)
            else:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            
            unc = result.get('_uncertainty', {})
            
            # 成本效益=性能/成本
            cost_efficiency = primary_value / max(cost, 0.01)
            
            results.append({
                'conditions': conditions,
                'value': primary_value if isinstance(primary_value, (int, float)) else 0,
                'cost': round(cost, 2),
                'cost_efficiency': round(cost_efficiency, 4),
                'uncertainty': unc.get('uncertainty_pct', ''),
                'result': result,
            })
        
        if not results:
            return {
                'error': f'预算{budget}元内无可行方案',
                'budget': budget,
                'min_cost_needed': '请增加预算或放宽参数范围',
            }
        
        # 按性能排序
        reverse = (objective == 'maximize')
        results.sort(key=lambda x: x['value'], reverse=reverse)
        
        # 预算内最优（性能最高）
        optimal_in_budget = results[0]
        
        # 无预算约束最优（用于对比）
        all_results = []
        for combo in combinations:
            conditions = dict(zip(param_names, combo))
            cost = sum(conditions.get(p, 0) * c for p, c in cost_model.items())
            result = self._run_engine(engine_name, conditions)
            primary_value = 0
            if '_primary_metric' in result:
                pm = result['_primary_metric']
                primary_value = result.get(pm, 0)
            else:
                for k, v in result.items():
                    if k not in ('conditions', '_uncertainty') and isinstance(v, (int, float)) and v > 0:
                        primary_value = v
                        break
            all_results.append({
                'conditions': conditions,
                'value': primary_value if isinstance(primary_value, (int, float)) else 0,
                'cost': round(cost, 2),
            })
        all_results.sort(key=lambda x: x['value'], reverse=reverse)
        optimal_no_budget = all_results[0] if all_results else None
        
        # 性能损失百分比
        perf_loss = 0
        if optimal_no_budget and optimal_no_budget['value'] > 0:
            perf_loss = (1 - optimal_in_budget['value'] / optimal_no_budget['value']) * 100
        
        # 按成本效益排序（性价比最高）
        results_by_efficiency = sorted(results, key=lambda x: x['cost_efficiency'], reverse=True)
        best_efficiency = results_by_efficiency[0]
        
        return {
            'engine': engine_name,
            'budget': budget,
            'cost_model': cost_model,
            'param_ranges': {k: {'min': v[0], 'max': v[1], 'step': v[2]} for k, v in param_ranges.items()},
            'feasible_count': len(results),
            'total_evaluated': len(combinations),
            'optimal_in_budget': {
                'conditions': optimal_in_budget['conditions'],
                'value': optimal_in_budget['value'],
                'cost': optimal_in_budget['cost'],
                'uncertainty': optimal_in_budget['uncertainty'],
                'cost_efficiency': optimal_in_budget['cost_efficiency'],
            },
            'best_cost_efficiency': {
                'conditions': best_efficiency['conditions'],
                'value': best_efficiency['value'],
                'cost': best_efficiency['cost'],
                'cost_efficiency': best_efficiency['cost_efficiency'],
            },
            'optimal_no_budget': {
                'conditions': optimal_no_budget['conditions'],
                'value': optimal_no_budget['value'],
                'cost': optimal_no_budget['cost'],
            },
            'performance_loss_pct': round(perf_loss, 1),
            'top_5_in_budget': results[:5],
        }
    
    def safety_boundary_check(self, engine_name: str, conditions: Dict) -> Dict:
        """
        安全边界检测——判断条件是否在可靠范围内
        
        检查：
        1. 温度是否超出安全范围
        2. 压力是否超出安全范围
        3. pH是否在极端值
        4. 浓度是否过高/过低
        5. 模型在此条件下的可靠性是否降级
        
        Returns:
            {
                'safety_level': 'safe'/'caution'/'danger',
                'warnings': [...],
                'reliability_downgrade': True/False,
                'estimated_error': ...,
                'recommendation': "...",
            }
        """
        warnings = []
        safety_level = 'safe'
        
        # 温度检查
        T = conditions.get('temperature', conditions.get('temperature_C', conditions.get('T', 25)))
        if isinstance(T, (int, float)):
            if T < -50 or T > 1000:
                warnings.append(f'温度{T}°C超出常规范围(-50~1000°C)，模型可靠性降低')
                safety_level = 'danger' if T < -100 or T > 1500 else 'caution'
            elif T > 500:
                warnings.append(f'高温{T}°C，需注意材料热稳定性')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
            elif T < 0:
                warnings.append(f'低温{T}°C，需注意溶剂冻结')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 压力检查
        P = conditions.get('pressure', conditions.get('P', conditions.get('P_Pa', 101325)))
        if isinstance(P, (int, float)):
            if P > 1e7:  # >10MPa
                warnings.append(f'高压{P/1e6:.1f}MPa，需注意设备安全')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
            if P > 1e8:  # >100MPa
                warnings.append(f'超高压{P/1e6:.1f}MPa，模型可能不适用')
                safety_level = 'danger'
        
        # pH检查
        pH = conditions.get('pH', 7)
        if isinstance(pH, (int, float)):
            if pH < 1 or pH > 14:
                warnings.append(f'极端pH={pH}，超出常规范围(1-14)')
                safety_level = 'danger'
            elif pH < 2 or pH > 13:
                warnings.append(f'强酸/强碱pH={pH}，需注意腐蚀')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 浓度检查
        C0 = conditions.get('C0', conditions.get('C0_mg_L', conditions.get('C0_mol_L', 0)))
        if isinstance(C0, (int, float)) and C0 > 0:
            if C0 > 10000:
                warnings.append(f'高浓度{C0}，可能超出模型适用范围')
                safety_level = 'caution' if safety_level == 'safe' else safety_level
        
        # 运行实验获取不确定性
        result = self._run_engine(engine_name, conditions)
        unc = result.get('_uncertainty', {})
        reliability = unc.get('confidence_level', 'high')
        
        # 如果不确定性>15%，可靠性降级
        unc_str = unc.get('uncertainty_pct', '±5%')
        try:
            unc_val = float(unc_str.replace('±', '').replace('%', ''))
        except:
            unc_val = 5.0
        
        if unc_val > 15:
            warnings.append(f'模型不确定性{unc_str}偏高(>15%)，预测仅供参考')
            safety_level = 'caution' if safety_level == 'safe' else safety_level
        elif unc_val > 10:
            warnings.append(f'模型不确定性{unc_str}中等，建议结合实验验证')
        
        # 估算极端条件下的误差倍增
        error_multiplier = 1.0
        if safety_level == 'caution':
            error_multiplier = 1.5
        elif safety_level == 'danger':
            error_multiplier = 3.0
        
        estimated_error = unc_val * error_multiplier
        
        # 生成推荐
        if safety_level == 'safe':
            recommendation = '条件在安全范围内，模型预测可靠。'
        elif safety_level == 'caution':
            recommendation = f'条件接近边界，预测误差可能增大{error_multiplier}倍。建议先做小规模验证实验。'
        else:
            recommendation = f'条件超出安全范围，模型预测不可靠(误差可能增大{error_multiplier}倍)。强烈建议先做实验验证，不要仅依赖虚拟预测。'
        
        return {
            'engine': engine_name,
            'conditions': conditions,
            'safety_level': safety_level,
            'safety_level_cn': {'safe': '安全', 'caution': '警告', 'danger': '危险'}[safety_level],
            'warnings': warnings,
            'model_uncertainty': unc_str,
            'model_reliability': reliability,
            'reliability_downgrade': safety_level != 'safe',
            'error_multiplier': error_multiplier,
            'estimated_error': f'±{estimated_error:.1f}%',
            'recommendation': recommendation,
        }

if __name__ == '__main__':
    acc = VirtualAccelerator()
    print("VirtualAccelerator ready")
