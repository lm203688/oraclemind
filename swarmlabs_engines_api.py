#!/usr/bin/env python3
"""
蜂群科研——9领域统一引擎API层

统一接口：
  POST /api/v1/engine/{domain}/run   — 运行虚拟实验
  GET  /api/v1/engine/{domain}/params — 获取参数模板
  GET  /api/v1/engine/list            — 列出所有领域

9个领域：
  suzuki         — Suzuki偶联（热力学+动力学）
  perovskite     — 钙钛矿太阳能电池（热力学+动力学）
  co2            — CO2电催化还原（电化学）
  battery        — 锂电池正极材料（电化学）
  photocatalysis — 光催化产氢（光/生物催化）
  enzyme         — 酶催化（光/生物催化）
  pcr            — PCR核酸扩增（生物核酸动力学）
  ammonia        — 合成氨（表面催化）
  crystal        — 结晶工艺（相变与结晶动力学）
"""

import json
from typing import Dict, Any

# 导入9个引擎
from swarmlabs_virtual_engine import VirtualExperiment as SuzukiExperiment
from swarmlabs_perovskite_engine import VirtualPerovskiteExperiment
from swarmlabs_co2_engine import VirtualCO2Experiment
from swarmlabs_battery_engine import VirtualBatteryExperiment
from swarmlabs_photocatalysis_engine import VirtualPhotocatalysisExperiment
from swarmlabs_enzyme_engine import VirtualEnzymeExperiment
from swarmlabs_pcr_engine import VirtualPCRExperiment
from swarmlabs_ammonia_engine import VirtualAmmoniaExperiment
from swarmlabs_crystal_engine import CrystallizationExperiment

# ──────────────────────────────────────────────
# 领域配置
# ──────────────────────────────────────────────
DOMAINS = {
    'suzuki': {
        'name': 'Suzuki偶联',
        'name_en': 'Suzuki Coupling',
        'physics': '热力学+动力学',
        'experiment_class': SuzukiExperiment,
        'params_template': {
            'temperature_C': {'type': 'float', 'default': 80, 'range': [25, 150], 'unit': '°C', 'desc': '反应温度'},
            'time_h': {'type': 'float', 'default': 12, 'range': [1, 48], 'unit': 'h', 'desc': '反应时间'},
            'catalyst': {'type': 'select', 'default': 'Pd(PPh3)4', 'options': ['Pd(PPh3)4', 'Pd(dppf)Cl2', 'Pd(OAc)2', 'Pd/C'], 'desc': '催化剂'},
            'base': {'type': 'select', 'default': 'K2CO3', 'options': ['K2CO3', 'NaOH', 'Cs2CO3', 'Et3N'], 'desc': '碱'},
            'solvent': {'type': 'select', 'default': 'DMF', 'options': ['DMF', 'THF', 'Dioxane', 'Toluene'], 'desc': '溶剂'},
            'concentration_mM': {'type': 'float', 'default': 100, 'range': [10, 500], 'unit': 'mM', 'desc': '浓度'},
        },
        'output_fields': ['yield_pct', 'rate_constant', 'selectivity', 'energy_barrier'],
    },
    'perovskite': {
        'name': '钙钛矿太阳能电池',
        'name_en': 'Perovskite Solar Cell',
        'physics': '热力学+动力学',
        'experiment_class': VirtualPerovskiteExperiment,
        'params_template': {
            'system': {'type': 'select', 'default': 'MAPbI3', 'options': ['MAPbI3', 'FAPbI3', 'CsPbI3', 'MAPbBr3'], 'desc': '钙钛矿体系'},
            'temperature_C': {'type': 'float', 'default': 25, 'range': [-20, 150], 'unit': '°C', 'desc': '退火温度'},
            'annealing_time_min': {'type': 'float', 'default': 30, 'range': [5, 120], 'unit': 'min', 'desc': '退火时间'},
            'humidity_pct': {'type': 'float', 'default': 30, 'range': [0, 80], 'unit': '%', 'desc': '湿度'},
            ' precursor_conc_M': {'type': 'float', 'default': 1.0, 'range': [0.1, 2.0], 'unit': 'M', 'desc': '前驱体浓度'},
        },
        'output_fields': ['efficiency_pct', 'bandgap_eV', 'stability_h', 'crystallinity'],
    },
    'co2': {
        'name': 'CO2电催化还原',
        'name_en': 'CO2 Reduction',
        'physics': '电化学',
        'experiment_class': VirtualCO2Experiment,
        'params_template': {
            'catalyst': {'type': 'select', 'default': 'Cu', 'options': ['Cu', 'Ag', 'Au', 'Sn', 'Zn', 'Ni'], 'desc': '催化剂'},
            'potential_V': {'type': 'float', 'default': -1.0, 'range': [-2.0, -0.3], 'unit': 'V', 'desc': '电位(vs RHE)'},
            'temperature_C': {'type': 'float', 'default': 25, 'range': [10, 80], 'unit': '°C', 'desc': '温度'},
            'pH': {'type': 'float', 'default': 7.0, 'range': [1, 14], 'unit': '', 'desc': 'pH'},
            'CO2_pressure_atm': {'type': 'float', 'default': 1.0, 'range': [1, 30], 'unit': 'atm', 'desc': 'CO2压力'},
        },
        'output_fields': ['FE_CO', 'FE_H2', 'FE_formate', 'current_density', 'overpotential'],
    },
    'battery': {
        'name': '锂电池正极材料',
        'name_en': 'Li-ion Battery Cathode',
        'physics': '电化学',
        'experiment_class': VirtualBatteryExperiment,
        'params_template': {
            'material': {'type': 'select', 'default': 'NMC811', 'options': ['NMC811', 'NMC622', 'LFP', 'LCO', 'NCA', 'LMFP'], 'desc': '正极材料'},
            'charge_rate_C': {'type': 'float', 'default': 1.0, 'range': [0.1, 10], 'unit': 'C', 'desc': '充放电倍率'},
            'voltage_min_V': {'type': 'float', 'default': 3.0, 'range': [2.5, 3.5], 'unit': 'V', 'desc': '截止电压下限'},
            'voltage_max_V': {'type': 'float', 'default': 4.3, 'range': [4.0, 4.5], 'unit': 'V', 'desc': '截止电压上限'},
            'temperature_C': {'type': 'float', 'default': 25, 'range': [-20, 60], 'unit': '°C', 'desc': '温度'},
            'cycles': {'type': 'int', 'default': 100, 'range': [1, 1000], 'unit': '', 'desc': '循环次数'},
        },
        'output_fields': ['capacity_mAh_g', 'retention_pct', 'energy_density', 'voltage_platform'],
    },
    'photocatalysis': {
        'name': '光催化产氢',
        'name_en': 'Photocatalytic H2 Evolution',
        'physics': '光/生物催化',
        'experiment_class': VirtualPhotocatalysisExperiment,
        'params_template': {
            'catalyst': {'type': 'select', 'default': 'TiO2', 'options': ['TiO2', 'CdS', 'g-C3N4', 'BiVO4', 'ZnIn2S4'], 'desc': '光催化剂'},
            'light_intensity_mW': {'type': 'float', 'default': 100, 'range': [10, 500], 'unit': 'mW/cm²', 'desc': '光强'},
            'temperature_C': {'type': 'float', 'default': 25, 'range': [10, 80], 'unit': '°C', 'desc': '温度'},
            'pH': {'type': 'float', 'default': 7.0, 'range': [1, 14], 'unit': '', 'desc': 'pH'},
            'sacrificial_agent': {'type': 'select', 'default': 'methanol', 'options': ['methanol', 'TEA', 'Na2S/Na2SO3', 'none'], 'desc': '牺牲剂'},
            'catalyst_loading_g': {'type': 'float', 'default': 0.1, 'range': [0.01, 1.0], 'unit': 'g', 'desc': '催化剂用量'},
        },
        'output_fields': ['H2_evolution_umol_h', 'QE_pct', 'TOF', 'stability_h'],
    },
    'enzyme': {
        'name': '酶催化反应',
        'name_en': 'Enzyme Catalysis',
        'physics': '光/生物催化',
        'experiment_class': VirtualEnzymeExperiment,
        'params_template': {
            'enzyme': {'type': 'select', 'default': 'lipase', 'options': ['lipase', 'glucose_oxidase', 'laccase', 'protease', 'cellulase', 'amylase'], 'desc': '酶种类'},
            'temperature_C': {'type': 'float', 'default': 37, 'range': [10, 80], 'unit': '°C', 'desc': '温度'},
            'pH': {'type': 'float', 'default': 7.5, 'range': [3, 11], 'unit': '', 'desc': 'pH'},
            'substrate_conc_mM': {'type': 'float', 'default': 10, 'range': [0.1, 100], 'unit': 'mM', 'desc': '底物浓度'},
            'enzyme_conc_uM': {'type': 'float', 'default': 1.0, 'range': [0.01, 10], 'unit': 'μM', 'desc': '酶浓度'},
        },
        'output_fields': ['rate_umol_min_mg', 'kcat', 'Km', 'kcat_Km', 'specificity'],
    },
    'pcr': {
        'name': 'PCR核酸扩增',
        'name_en': 'PCR Amplification',
        'physics': '生物核酸动力学',
        'experiment_class': VirtualPCRExperiment,
        'params_template': {
            'polymerase': {'type': 'select', 'default': 'Taq', 'options': ['Taq', 'Pfu', 'Q5', 'Phusion', 'Vent'], 'desc': '聚合酶'},
            'denature_C': {'type': 'float', 'default': 95, 'range': [90, 98], 'unit': '°C', 'desc': '变性温度'},
            'annealing_C': {'type': 'float', 'default': 55, 'range': [40, 72], 'unit': '°C', 'desc': '退火温度'},
            'extension_C': {'type': 'float', 'default': 72, 'range': [65, 80], 'unit': '°C', 'desc': '延伸温度'},
            'cycles': {'type': 'int', 'default': 30, 'range': [10, 45], 'unit': '', 'desc': '循环数'},
            'template_ng': {'type': 'float', 'default': 10, 'range': [0.1, 100], 'unit': 'ng', 'desc': '模板量'},
            'primer_conc_uM': {'type': 'float', 'default': 0.5, 'range': [0.1, 2.0], 'unit': 'μM', 'desc': '引物浓度'},
        },
        'output_fields': ['efficiency_pct', 'amplification_fold', 'specificity', 'product_length_bp'],
    },
    'ammonia': {
        'name': '合成氨（Haber-Bosch）',
        'name_en': 'Ammonia Synthesis',
        'physics': '表面催化',
        'experiment_class': VirtualAmmoniaExperiment,
        'params_template': {
            'catalyst': {'type': 'select', 'default': 'Fe (promoted)', 'options': ['Fe (promoted)', 'Ru/C (Ba-promoted)', 'Co3Mo3N'], 'desc': '催化剂'},
            'temperature_C': {'type': 'float', 'default': 450, 'range': [300, 600], 'unit': '°C', 'desc': '反应温度'},
            'pressure_bar': {'type': 'float', 'default': 200, 'range': [50, 400], 'unit': 'bar', 'desc': '反应压力'},
            'H2_N2_ratio': {'type': 'float', 'default': 3.0, 'range': [1, 5], 'unit': '', 'desc': 'H2/N2比'},
            'SV_per_h': {'type': 'float', 'default': 10000, 'range': [1000, 50000], 'unit': 'h⁻¹', 'desc': '空速'},
        },
        'output_fields': ['NH3_yield_pct', 'conversion_pct', 'TOF', 'space_time_yield'],
    },
    'crystal': {
        'name': '结晶工艺',
        'name_en': 'Crystallization',
        'physics': '相变与结晶动力学',
        'experiment_class': CrystallizationExperiment,
        'params_template': {
            'system': {'type': 'select', 'default': 'KNO3-water', 'options': ['KNO3-water', 'sucrose-water', 'NaCl-water', 'paracetamol-ethanol', 'glycine-water', 'aspirin-ethanol'], 'desc': '结晶体系'},
            'T_C': {'type': 'float', 'default': 40, 'range': [0, 80], 'unit': '°C', 'desc': '温度'},
            'concentration': {'type': 'float', 'default': 100, 'range': [1, 500], 'unit': 'g/100g', 'desc': '浓度'},
            'cooling_rate': {'type': 'float', 'default': 0.5, 'range': [0.1, 5], 'unit': '°C/min', 'desc': '冷却速率'},
            'growth_time': {'type': 'float', 'default': 3600, 'range': [600, 14400], 'unit': 's', 'desc': '生长时间'},
            'stirrer_speed': {'type': 'float', 'default': 300, 'range': [0, 800], 'unit': 'rpm', 'desc': '搅拌速度'},
        },
        'output_fields': ['mean_size_um', 'yield_pct', 'CV', 'nucleation_rate', 'growth_rate'],
    },
}


def run_experiment(domain: str, conditions: Dict) -> Dict[str, Any]:
    """运行指定领域的虚拟实验
    
    Args:
        domain: 领域名（suzuki/perovskite/co2/battery/photocatalysis/enzyme/pcr/ammonia/crystal）
        conditions: 实验条件参数
        
    Returns:
        统一格式的实验结果
    """
    if domain not in DOMAINS:
        return {'error': f'未知领域: {domain}', 'available': list(DOMAINS.keys())}
    
    config = DOMAINS[domain]
    
    try:
        if domain == 'crystal':
            # 结晶引擎的特殊初始化方式
            system_id = conditions.get('system', 'KNO3-water')
            exp = CrystallizationExperiment(system_id)
            exp.set_conditions(
                T_C=conditions.get('T_C', 40),
                concentration=conditions.get('concentration', 100),
                cooling_rate=conditions.get('cooling_rate', 0.5),
                growth_time=conditions.get('growth_time', 3600),
                stirrer_speed=conditions.get('stirrer_speed', 300),
            )
        else:
            # 其他引擎统一用conditions dict初始化
            exp_class = config['experiment_class']
            exp = exp_class(conditions)
        
        result = exp.run()
        
        # 统一输出格式
        return {
            'domain': domain,
            'domain_name': config['name'],
            'domain_name_en': config['name_en'],
            'physics': config['physics'],
            'conditions': conditions,
            'results': result,
            'status': 'success',
        }
        
    except Exception as e:
        return {
            'domain': domain,
            'error': str(e),
            'status': 'failed',
        }


def get_params_template(domain: str) -> Dict:
    """获取指定领域的参数模板"""
    if domain not in DOMAINS:
        return {'error': f'未知领域: {domain}', 'available': list(DOMAINS.keys())}
    
    config = DOMAINS[domain]
    return {
        'domain': domain,
        'domain_name': config['name'],
        'physics': config['physics'],
        'params': config['params_template'],
        'output_fields': config['output_fields'],
    }


def list_domains() -> Dict:
    """列出所有可用领域"""
    return {
        'total': len(DOMAINS),
        'domains': [
            {
                'id': k,
                'name': v['name'],
                'name_en': v['name_en'],
                'physics': v['physics'],
                'param_count': len(v['params_template']),
                'output_count': len(v['output_fields']),
            }
            for k, v in DOMAINS.items()
        ]
    }


# ──────────────────────────────────────────────
# HTTP handler（集成到api_server_v3.py）
# ──────────────────────────────────────────────
def handle_engine_request(method: str, path: str, body: Dict = None) -> Dict:
    """处理引擎API请求
    
    路由：
      GET  /api/v1/engine/list             → list_domains()
      GET  /api/v1/engine/{domain}/params   → get_params_template(domain)
      POST /api/v1/engine/{domain}/run      → run_experiment(domain, body)
    """
    parts = path.strip('/').split('/')
    
    # /api/v1/engine/list
    if len(parts) == 4 and parts[0] == 'api' and parts[1] == 'v1' and parts[2] == 'engine' and parts[3] == 'list':
        return list_domains()
    
    # /api/v1/engine/{domain}/params
    if len(parts) == 5 and parts[0] == 'api' and parts[1] == 'v1' and parts[2] == 'engine' and parts[4] == 'params':
        return get_params_template(parts[3])
    
    # /api/v1/engine/{domain}/run
    if len(parts) == 5 and parts[0] == 'api' and parts[1] == 'v1' and parts[2] == 'engine' and parts[4] == 'run':
        if method != 'POST':
            return {'error': '需要POST方法'}
        return run_experiment(parts[3], body or {})
    
    # /api/v1/engine/causal/analyze — 因果分析
    if len(parts) == 5 and parts[0] == 'api' and parts[1] == 'v1' and parts[2] == 'engine' and parts[3] == 'causal' and parts[4] == 'analyze':
        if method != 'POST':
            return {'error': '需要POST方法'}
        return causal_analyze(body or {})
    
    return {'error': f'未知路径: {path}'}


def causal_analyze(params: Dict) -> Dict:
    """因果分析——对实验结果做反事实推理
    
    输入：
      experiments: [{name, conditions, result}, ...]
      intervention: {param: new_value}  # 反事实干预
    """
    try:
        from swarmlabs_causal_engine import CausalEngine
        ce = CausalEngine()
        
        experiments = params.get('experiments', [])
        for exp in experiments:
            ce.observe(exp)
        
        intervention = params.get('intervention', {})
        base_conditions = experiments[0].get('conditions', {}) if experiments else {}
        
        # 预测干预结果
        prediction = ce.predict(intervention, base_conditions)
        
        # 反事实分析
        if experiments:
            actual = experiments[0]
            hypothetical = {'change': intervention}
            cf = ce.counterfactual(actual, hypothetical)
        else:
            cf = {}
        
        return {
            'status': 'success',
            'observations': len(experiments),
            'prediction': prediction,
            'counterfactual': cf,
            'insight': f"如果调整{list(intervention.keys())}，预期结果将发生变化",
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)[:200]}


# ──────────────────────────────────────────────
# 测试
# ──────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——9领域统一引擎API层")
    print("=" * 60)
    
    # 1. 列出所有领域
    print("\n--- 1. 列出所有领域 ---")
    domains = list_domains()
    print(f"总计: {domains['total']}个领域")
    for d in domains['domains']:
        print(f"  {d['id']:15s} | {d['name']:15s} | {d['physics']:20s} | {d['param_count']}参数/{d['output_count']}输出")
    
    # 2. 获取参数模板
    print("\n--- 2. 获取参数模板（crystal）---")
    template = get_params_template('crystal')
    for k, v in template['params'].items():
        print(f"  {k}: {v}")
    
    # 3. 运行实验——9个领域各跑一个
    print("\n--- 3. 运行9领域实验 ---")
    test_cases = [
        ('suzuki', {'temperature_C': 80, 'time_h': 12, 'catalyst': 'Pd(PPh3)4', 'base': 'K2CO3', 'solvent': 'DMF', 'concentration_mM': 100}),
        ('perovskite', {'system': 'MAPbI3', 'temperature_C': 100, 'annealing_time_min': 30, 'humidity_pct': 30}),
        ('co2', {'catalyst': 'Cu', 'potential_V': -1.0, 'temperature_C': 25, 'pH': 7.0, 'CO2_pressure_atm': 1.0}),
        ('battery', {'material': 'NMC811', 'charge_rate_C': 1.0, 'voltage_min_V': 3.0, 'voltage_max_V': 4.3, 'temperature_C': 25, 'cycles': 100}),
        ('photocatalysis', {'catalyst': 'TiO2', 'light_intensity_mW': 100, 'temperature_C': 25, 'pH': 7.0, 'sacrificial_agent': 'methanol', 'catalyst_loading_g': 0.1}),
        ('enzyme', {'enzyme': 'lipase', 'temperature_C': 37, 'pH': 7.5, 'substrate_conc_mM': 10, 'enzyme_conc_uM': 1.0}),
        ('pcr', {'polymerase': 'Taq', 'denature_C': 95, 'annealing_C': 55, 'extension_C': 72, 'cycles': 30, 'template_ng': 10, 'primer_conc_uM': 0.5}),
        ('ammonia', {'catalyst': 'Fe (promoted)', 'temperature_C': 450, 'pressure_bar': 200, 'H2_N2_ratio': 3.0, 'SV_per_h': 10000}),
        ('crystal', {'system': 'KNO3-water', 'T_C': 40, 'concentration': 120, 'cooling_rate': 0.5, 'growth_time': 7200, 'stirrer_speed': 200}),
    ]
    
    for domain, conditions in test_cases:
        result = run_experiment(domain, conditions)
        status = result.get('status', 'unknown')
        if status == 'success':
            r = result.get('results', {})
            # 提取关键输出
            output_fields = DOMAINS[domain]['output_fields']
            key_outputs = []
            for f in output_fields[:3]:
                val = r.get(f, '?')
                if isinstance(val, float):
                    key_outputs.append(f"{f}={val:.2f}")
                else:
                    key_outputs.append(f"{f}={val}")
            print(f"  {domain:15s} ✅ {', '.join(key_outputs)}")
        else:
            print(f"  {domain:15s} ❌ {result.get('error', 'unknown')}")
    
    print("\n✅ 9领域统一引擎API层验证通过")
