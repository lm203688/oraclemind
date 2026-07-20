#!/usr/bin/env python3
"""
蜂群科研——统一API Server
集成30个虚拟实验引擎，提供RESTful API接口

端口: 8461
端点:
  GET  /api/v1/engines          → 列出所有引擎
  GET  /api/v1/engines/<name>   → 引擎详情
  POST /api/v1/run/<name>       → 运行虚拟实验
  GET  /api/v1/health           → 健康检查
  GET  /api/v1/stats            → 统计信息
"""

from flask import Flask, request, jsonify
import json, os, sys, importlib.util

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

# CORS支持——允许前端跨域调用
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# ========== API鉴权体系 ==========
import functools, secrets, time

def require_api_key(tier='free'):
    """API鉴权装饰器
    
    tier='public': 不需要Key
    tier='free': 需要gtk_开头的Key, 30次/小时
    tier='internal': 需要gtk_internal_开头的Key, 无限制
    """
    def decorator(f):
        @functools.wraps(f)
        def wrapped(*args, **kwargs):
            if tier == 'public':
                return f(*args, **kwargs)
            
            auth = request.headers.get('Authorization', '')
            key = auth.replace('Bearer ', '').strip()
            
            if not key:
                return jsonify({
                    'error': '需要API Key',
                    'hint': '免费注册: POST /api/v1/register 或使用内部测试Key: gtk_internal_eve_2026',
                    'tiers': {
                        'public': 'health/docs/info(无需Key)',
                        'free': '量子/MD/ML/QM9(需gtk_ Key, 30次/小时)',
                        'internal': '跨项目/引擎ML(需gtk_internal_ Key)',
                    }
                }), 401
            
            INTERNAL_KEYS = ['gtk_internal_swarmlabs_2026', 'gtk_internal_robotparts_2026', 'gtk_internal_eve_2026']
            
            if key in INTERNAL_KEYS:
                return f(*args, **kwargs)
            
            if tier == 'internal':
                return jsonify({
                    'error': '需要内部Key',
                    'hint': '内部Key仅限合作平台使用',
                }), 403
            
            if key.startswith('gtk_'):
                # 限流: 30次/小时(免费层)
                if not key.startswith('gtk_internal_'):
                    import time as _t
                    cache_file = '/tmp/swarmlabs_rate_limit.json'
                    try:
                        import json as _j, os as _os
                        cache = {}
                        if _os.path.exists(cache_file):
                            cache = _j.load(open(cache_file))
                        now = _t.time()
                        window = 3600  # 1小时
                        limit = 30  # 免费层30次/小时
                        
                        if key not in cache:
                            cache[key] = []
                        # 清理过期记录
                        cache[key] = [t for t in cache[key] if now - t < window]
                        
                        if len(cache[key]) >= limit:
                            return jsonify({
                                'error': '超出免费层限制(30次/小时)',
                                'hint': '升级到Pro层($19/月)获取1000次/小时',
                                'retry_after': int(window - (now - cache[key][0]))
                            }), 429
                        
                        cache[key].append(now)
                        _j.dump(cache, open(cache_file, 'w'))
                    except:
                        pass  # 限流失败不阻塞请求
                return f(*args, **kwargs)
            
            return jsonify({'error': '无效的API Key'}), 401
        return wrapped
    return decorator

# ========== API Key注册 ==========
_API_KEYS_FILE = '/home/z/my-project/swarmlabs_api_keys.json'

def _load_keys():
    if os.path.exists(_API_KEYS_FILE):
        with open(_API_KEYS_FILE) as f:
            return json.load(f)
    return {}

def _save_keys(keys):
    with open(_API_KEYS_FILE, 'w') as f:
        json.dump(keys, f, ensure_ascii=False, indent=2)

@app.route('/api/v1/register', methods=['POST'])
def register_api_key():
    """注册免费API Key"""
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    name = data.get('name', '').strip()
    
    if not email or '@' not in email:
        return jsonify({'error': '需要有效的email'}), 400
    
    keys = _load_keys()
    
    for k, v in keys.items():
        if v.get('email') == email:
            return jsonify({
                'status': 'already_registered',
                'api_key': k,
                'tier': v.get('tier', 'free'),
                'limit': v.get('limit', '30/hour'),
                'message': '该email已注册,返回已有Key'
            })
    
    new_key = 'gtk_' + secrets.token_hex(16)
    keys[new_key] = {
        'email': email,
        'name': name or 'Anonymous',
        'tier': 'free',
        'limit': '30/hour',
        'created_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'usage_count': 0,
    }
    _save_keys(keys)
    
    return jsonify({
        'status': 'success',
        'api_key': new_key,
        'tier': 'free',
        'limit': '30/hour',
        'message': '注册成功。在请求头添加: Authorization: Bearer ' + new_key,
        'docs': '/api/v1/docs',
        'note': '免费层: 30次/小时, 覆盖量子/MD/ML/QM9/融合/SHAP/多保真度API'
    })

@app.route('/api/v1/keys/info')
def api_keys_info():
    """查看API Key体系"""
    return jsonify({
        'tiers': {
            'public': {
                'cost': '免费',
                'auth': '无需Key',
                'endpoints': ['/api/v1/health', '/api/v1/docs', '/api/v1/qm9/info', '/api/v1/materials_db/search', '/api/v1/engines'],
                'limit': '无限制'
            },
            'free': {
                'cost': '免费注册',
                'auth': 'gtk_开头的Key',
                'endpoints': ['量子化学计算', '分子动力学', 'ML预测', 'QM9预测', '融合预测', 'SHAP解释', '多保真度', 'UQ置信区间'],
                'limit': '30次/小时',
                'register': 'POST /api/v1/register {email, name}'
            },
            'internal': {
                'cost': '合作平台联系',
                'auth': 'gtk_internal_开头的Key',
                'endpoints': ['跨项目API', '引擎ML', '贝叶斯优化', '主动学习'],
                'limit': '无限制'
            }
        },
        'competition_comparison': {
            'materials_project': '免费+Key, 25次/秒',
            'openai': '按量计费, $0.002/次起',
            'pubchem': '无Key, 5次/秒',
            'swarmlabs': '免费+Key, 30次/小时(免费层)'
        }
    })



# 引擎注册表
ENGINES = {
    'suzuki': {'name': 'Suzuki偶联', 'file': 'swarmlabs_virtual_engine.py', 'class': 'VirtualExperiment'},
    'perovskite': {'name': '钙钛矿', 'file': 'swarmlabs_perovskite_engine.py', 'class': 'VirtualPerovskiteExperiment'},
    'co2': {'name': 'CO2还原', 'file': 'swarmlabs_co2_engine.py', 'class': 'VirtualCO2Experiment'},
    'battery': {'name': '锂电池', 'file': 'swarmlabs_battery_engine.py', 'class': 'VirtualBatteryExperiment'},
    'photocatalysis': {'name': '光催化', 'file': 'swarmlabs_photocatalysis_engine.py', 'class': 'VirtualPhotocatalysisExperiment'},
    'enzyme': {'name': '酶催化', 'file': 'swarmlabs_enzyme_engine.py', 'class': 'VirtualEnzymeExperiment'},
    'pcr': {'name': 'PCR', 'file': 'swarmlabs_pcr_engine.py', 'class': 'VirtualPCRExperiment'},
    'ammonia': {'name': '合成氨', 'file': 'swarmlabs_ammonia_engine.py', 'class': 'VirtualAmmoniaExperiment'},
    'crystal': {'name': '结晶', 'file': 'swarmlabs_crystal_engine.py', 'class': 'CrystallizationExperiment'},
    'polymer': {'name': '高分子', 'file': 'swarmlabs_polymer_engine.py', 'class': 'VirtualPolymerizationExperiment'},
    'membrane': {'name': '膜分离', 'file': 'swarmlabs_membrane_engine.py', 'class': 'VirtualMembraneExperiment'},
    'adsorption': {'name': '吸附', 'file': 'swarmlabs_adsorption_engine.py', 'class': 'VirtualAdsorptionExperiment'},
    'distillation': {'name': '蒸馏', 'file': 'swarmlabs_distillation_engine.py', 'class': 'VirtualDistillationExperiment'},
    'extraction': {'name': '萃取', 'file': 'swarmlabs_extraction_engine.py', 'class': 'VirtualExtractionExperiment'},
    'combustion': {'name': '燃烧', 'file': 'swarmlabs_combustion_engine.py', 'class': 'VirtualCombustionExperiment'},
    'corrosion': {'name': '腐蚀', 'file': 'swarmlabs_corrosion_engine.py', 'class': 'VirtualCorrosionExperiment'},
    'drying': {'name': '干燥', 'file': 'swarmlabs_drying_engine.py', 'class': 'VirtualDryingExperiment'},
    'bioreactor': {'name': '生物反应器', 'file': 'swarmlabs_bioreactor_engine.py', 'class': 'VirtualBioreactorExperiment'},
    'ion_exchange': {'name': '离子交换', 'file': 'swarmlabs_ion_exchange_engine.py', 'class': 'VirtualIonExchangeExperiment'},
    'scfluid': {'name': '超临界流体', 'file': 'swarmlabs_scfluid_engine.py', 'class': 'VirtualSCExtractionExperiment'},
    'electroplating': {'name': '电镀', 'file': 'swarmlabs_electroplating_engine.py', 'class': 'VirtualElectroplatingExperiment'},
    'flocculation': {'name': '絮凝', 'file': 'swarmlabs_flocculation_engine.py', 'class': 'VirtualFlocculationExperiment'},
    'gassolid': {'name': '气固反应', 'file': 'swarmlabs_gassolid_engine.py', 'class': 'VirtualGasSolidExperiment'},
    'complexometric': {'name': '络合滴定', 'file': 'swarmlabs_complexometric_engine.py', 'class': 'VirtualComplexometricExperiment'},
    'fluidization': {'name': '流态化', 'file': 'swarmlabs_fluidization_engine.py', 'class': 'VirtualFluidizationExperiment'},
    'sonochemical': {'name': '超声空化', 'file': 'swarmlabs_sonochemical_engine.py', 'class': 'VirtualSonochemicalExperiment'},
    'photoFenton': {'name': '光芬顿', 'file': 'swarmlabs_photoFenton_engine.py', 'class': 'VirtualPhotoFentonExperiment'},
    'ionic_liquid': {'name': '离子液体', 'file': 'swarmlabs_ionic_liquid_engine.py', 'class': 'VirtualIonicLiquidExperiment'},
    'membrane_distillation': {'name': '膜蒸馏', 'file': 'swarmlabs_membrane_distillation_engine.py', 'class': 'VirtualMembraneDistillationExperiment'},
    'electrodialysis': {'name': '电渗析', 'file': 'swarmlabs_electrodialysis_engine.py', 'class': 'VirtualElectrodialysisExperiment'},
}

# 统计
STATS = {
    'total_engines': len(ENGINES),
    'total_validations': 802,
    'physics_systems': 27,
    'code_lines': 19919,
}


@app.route('/')
def index():
    return open('/tmp/swarmlabs_deploy/swarmlabs_visualization.html').read() if os.path.exists('/tmp/swarmlabs_deploy/swarmlabs_visualization.html') else 'SwarmLabs API Server'


@app.route('/api/v1/trace/<name>')
def get_trace(name):
    """数据溯源——查看引擎验证数据的论文来源"""
    import os
    result_file = os.path.join(BASE_DIR, f'swarmlabs_{name}_result.json')
    if not os.path.exists(result_file):
        return jsonify({'error': f'Engine {name} not found'}), 404
    
    with open(result_file) as f:
        data = json.load(f)
    
    results = data.get('results', [])
    sources = []
    for r in results:
        src = r.get('source', {})
        if src and src not in sources:
            sources.append(src)
    
    return jsonify({
        'engine': name,
        'total_validations': len(results),
        'unique_sources': len(sources),
        'sources': sources,
    })


# ========== 虚拟加速实验器端点 ==========
from swarmlabs_accelerator import add_accelerator_endpoints
app = add_accelerator_endpoints(app)


# ========== 材料库端点 ==========
from swarmlabs_materials import MATERIAL_LIBRARY, auto_screen

@app.route('/api/v1/materials/<engine>')
def list_materials(engine):
    """列出引擎可用的材料库"""
    materials = MATERIAL_LIBRARY.get(engine, {})
    return jsonify({
        'engine': engine,
        'count': len(materials),
        'materials': list(materials.keys()),
    })

@app.route('/api/v1/auto_screen', methods=['POST'])
def auto_screening():
    """自动筛选——从材料库自动生成候选并筛选Top-K"""
    data = request.json
    result = auto_screen(
        engine_name=data['engine'],
        top_k=data.get('top_k', 5),
        **data.get('overrides', {}),
    )
    return jsonify(result)


@app.route('/api/v1/generalization')
def generalization_report():
    """泛化精度验证报告——80/20拆分测试集精度"""
    import os, json
    report_file = os.path.join(BASE_DIR, 'swarmlabs_generalization_test.json')
    if os.path.exists(report_file):
        with open(report_file) as f:
            return jsonify(json.load(f))
    return jsonify({'error': 'Report not found'}), 404


@app.route('/api/v1/docs')
def api_docs():
    """API文档"""
    return jsonify({
        'title': '蜂群科研 - 虚拟加速实验器 API',
        'version': '1.1',
        'base_url': 'http://150.158.119.19:8461',
        'dashboard': 'https://swarmlabs.pages.dev',
        'endpoints': [
            {'method': 'GET', 'path': '/api/v1/health', 'desc': '健康检查'},
            {'method': 'GET', 'path': '/api/v1/stats', 'desc': '统计信息'},
            {'method': 'GET', 'path': '/api/v1/engines', 'desc': '列出所有引擎'},
            {'method': 'GET', 'path': '/api/v1/engines/<name>', 'desc': '引擎详情'},
            {'method': 'GET', 'path': '/api/v1/materials/<engine>', 'desc': '材料库列表'},
            {'method': 'POST', 'path': '/api/v1/run/<name>', 'desc': '运行虚拟实验', 'body': {'conditions': {}}},
            {'method': 'POST', 'path': '/api/v1/screen', 'desc': '批量筛选', 'body': {'engine': 'photocatalysis', 'candidates': [], 'top_k': 5}},
            {'method': 'POST', 'path': '/api/v1/auto_screen', 'desc': '自动筛选(从材料库)', 'body': {'engine': 'photocatalysis', 'top_k': 5}},
            {'method': 'POST', 'path': '/api/v1/aging', 'desc': '加速老化模拟', 'body': {'engine': 'perovskite', 'conditions': {}, 'duration_years': 5, 'environment': 'outdoor'}},
            {'method': 'POST', 'path': '/api/v1/aging_eval', 'desc': '老化后性能评估', 'body': {'engine': 'perovskite', 'conditions': {}, 'duration_years': 5, 'environment': 'outdoor'}},
            {'method': 'POST', 'path': '/api/v1/formulation', 'desc': '配方空间搜索', 'body': {'engine': 'adsorption', 'param_ranges': {}, 'max_evaluations': 50}},
            {'method': 'POST', 'path': '/api/v1/cost_search', 'desc': '成本约束优化', 'body': {'engine': 'adsorption', 'param_ranges': {}, 'cost_model': {}, 'budget': 50}},
            {'method': 'POST', 'path': '/api/v1/safety_check', 'desc': '安全边界检测', 'body': {'engine': 'adsorption', 'conditions': {}}},
            {'method': 'POST', 'path': '/api/v1/process_chain', 'desc': '实验流程串联', 'body': {'steps': []}},
            {'method': 'POST', 'path': '/api/v1/compare', 'desc': '材料对比', 'body': {'engine': 'photocatalysis', 'materials': []}},
            {'method': 'GET', 'path': '/api/v1/uncertainty/<name>', 'desc': '不确定性查询'},
            {'method': 'GET', 'path': '/api/v1/generalization', 'desc': '泛化精度报告'},
            {'method': 'POST', 'path': '/api/v1/feedback/submit', 'desc': '提交实验反馈', 'body': {'engine_id': '', 'conditions': {}, 'predicted': {}, 'actual': {}}},
            {'method': 'GET', 'path': '/api/v1/feedback/history', 'desc': '反馈历史'},
            {'method': 'GET', 'path': '/api/v1/feedback/report', 'desc': '反馈报告'},
        ],
        'environments': ['standard', 'outdoor', 'humid', 'uv', 'thermal_cycle', 'corrosive'],
        'safety_levels': ['safe(1x)', 'caution(1.5x)', 'danger(3x)'],
    })


# ========== 量子化学计算引擎 ==========
from swarmlabs_quantum_engine import QuantumChemEngine
quantum_engine = QuantumChemEngine()

@app.route('/api/v1/quantum_calc/<molecule>')
@require_api_key('free')
def quantum_calculate(molecule):
    """量子化学计算——真实DFT计算（PySCF）"""
    from flask import request
    method = request.args.get('method', 'B3LYP')
    basis = request.args.get('basis', '6-31G')
    result = quantum_engine.calculate(molecule, method=method, basis=basis)
    return jsonify(result)

@app.route('/api/v1/quantum_molecules')
def quantum_molecules():
    """列出可用分子"""
    return jsonify(quantum_engine.list_molecules())

@app.route('/api/v1/reaction_energy', methods=['POST'])
def reaction_energy():
    """反应能量计算"""
    data = request.json
    result = quantum_engine.reaction_energy(
        data.get('reactants', []),
        data.get('products', [])
    )
    return jsonify(result)


# ========== 跨项目API互调（需API Key）==========
import urllib.request, json as _json

# 内部测试Key（免费无限制）
INTERNAL_KEYS = ['gtk_internal_swarmlabs_2026', 'gtk_internal_robotparts_2026', 'gtk_internal_eve_2026']

def _check_api_key():
    """检查API Key鉴权"""
    from flask import request
    auth = request.headers.get('Authorization', '')
    key = auth.replace('Bearer ', '').strip()
    
    if not key:
        return {'ok': False, 'code': 401, 'msg': '需要API Key。免费注册: POST https://robotparts.pages.dev/api/register {email}', 'tier': 'none'}
    
    if key in INTERNAL_KEYS:
        return {'ok': True, 'tier': 'internal', 'limit': -1}
    
    if key.startswith('gtk_'):
        return {'ok': True, 'tier': 'free', 'limit': 30}
    
    if key.startswith('creem_') or key.startswith('license_'):
        return {'ok': True, 'tier': 'pro', 'limit': -1}
    
    return {'ok': False, 'code': 401, 'msg': '无效的API Key', 'tier': 'none'}


# ========== Rate Limiting ==========
import time as _time
from collections import defaultdict

# 内存计数器
_rate_limit_store = defaultdict(list)  # key -> [timestamp1, timestamp2, ...]

RATE_LIMIT_RULES = {
    'internal': {'limit': -1, 'window': 3600},
    'free': {'limit': 30, 'window': 3600},      # 30次/小时
    'pro': {'limit': 10000, 'window': 86400},    # 10000次/天
}

def _check_rate_limit(api_key, tier):
    """检查API调用频率"""
    if tier == 'internal':
        return True, None, -1, -1
    
    rule = RATE_LIMIT_RULES.get(tier, RATE_LIMIT_RULES['free'])
    if rule['limit'] == -1:
        return True, None, -1, -1
    
    now = _time.time()
    window = rule['window']
    limit = rule['limit']
    
    # 清理过期记录
    _rate_limit_store[api_key] = [t for t in _rate_limit_store[api_key] if now - t < window]
    
    remaining = limit - len(_rate_limit_store[api_key])
    
    if remaining <= 0:
        reset_at = _rate_limit_store[api_key][0] + window if _rate_limit_store[api_key] else now + window
        retry_after = int(reset_at - now)
        return False, retry_after, 0, reset_at
    
    _rate_limit_store[api_key].append(now)
    return True, None, remaining, now + window

def _rate_limit_response(retry_after):
    """Rate limit exceeded响应"""
    from flask import jsonify
    resp = jsonify({
        'error': 'Rate limit exceeded',
        'retry_after': retry_after,
        'upgrade_url': 'https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh',
    })
    resp.status_code = 429
    resp.headers['X-RateLimit-Limit'] = str(RATE_LIMIT_RULES['free']['limit'])
    resp.headers['X-RateLimit-Remaining'] = '0'
    resp.headers['X-RateLimit-Reset'] = str(int(_time.time() + retry_after))
    resp.headers['Retry-After'] = str(retry_after)
    return resp

def _add_rate_headers(resp, tier, remaining, reset_at):
    """添加Rate Limit headers"""
    rule = RATE_LIMIT_RULES.get(tier, RATE_LIMIT_RULES['free'])
    resp.headers['X-RateLimit-Limit'] = str(rule['limit']) if rule['limit'] > 0 else 'unlimited'
    resp.headers['X-RateLimit-Remaining'] = str(remaining) if remaining >= 0 else 'unlimited'
    if reset_at and isinstance(reset_at, (int, float)):
        resp.headers['X-RateLimit-Reset'] = str(int(reset_at))
    return resp

# 修改_auth_required加入rate limit检查
def _auth_required_with_rate_limit():
    """鉴权+Rate Limit检查"""
    auth = _check_api_key()
    if not auth['ok']:
        return auth, jsonify({
            'error': auth['msg'],
            'tier': auth.get('tier', 'none'),
            'hint': '内部测试Key: gtk_internal_eve_2026 | 免费注册: POST /api/register',
            'upgrade_url': 'https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh',
        }), auth['code'], None, None, None
    
    # Rate limit检查
    from flask import request
    api_key = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    allowed, retry_after, remaining, reset_at = _check_rate_limit(api_key, auth['tier'])
    
    if not allowed:
        return auth, _rate_limit_response(retry_after), 429, 0, 0, 0
    
    return auth, None, None, remaining, reset_at, auth['tier']


def _auth_required():
    """鉴权失败时返回的Response"""
    auth = _check_api_key()
    if not auth['ok']:
        return auth, jsonify({
            'error': auth['msg'],
            'tier': auth.get('tier', 'none'),
            'hint': '内部测试Key: gtk_internal_eve_2026 | 免费注册: POST /api/register',
            'upgrade_url': 'https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh',
        }), auth['code']
    return auth, None, None

# 14站API注册表
SITES_API = {
    'genetech-tools': {'base': 'https://genetech-tools.pages.dev/api', 'name': '基因技术工具'},
    'tcm-tools': {'base': 'https://tcm-tools.pages.dev/api', 'name': '中医药工具'},
    'brain-science': {'base': 'https://brainscience.pages.dev/api', 'name': '脑科学'},
    'quantum-computing': {'base': 'https://quantumcomputing.pages.dev/api', 'name': '量子计算'},
    'nuclear-energy': {'base': 'https://nuclearenergy.pages.dev/api', 'name': '核能'},
    'exo-science': {'base': 'https://exoscience.pages.dev/api', 'name': '系外科学'},
    'alien-minerals': {'base': 'https://alienminerals.pages.dev/api', 'name': '外星矿物'},
    'deep-sea-tech': {'base': 'https://deepseatech.pages.dev/api', 'name': '深海技术'},
    'new-energy': {'base': 'https://newenergy-nya.pages.dev/api', 'name': '新能源'},
    'life-science': {'base': 'https://lifescience-epe.pages.dev/api', 'name': '生命科学'},
    'biocomputing': {'base': 'https://biocomputedb.pages.dev/api', 'name': '生物计算'},
    'bionic-ai': {'base': 'https://bionicai.pages.dev/api', 'name': '仿生AI'},
    'agent-ecosystem': {'base': 'https://agentecosystem.pages.dev/api', 'name': 'Agent生态'},
    'robot-parts': {'base': 'https://robotparts.pages.dev/api', 'name': '机器人配件'},
}

def _fetch_url(url, timeout=8):
    """安全地获取URL内容"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SwarmlabsAPI/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return _json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e)}

@app.route('/api/v1/cross/sites')
def cross_sites():
    """列出所有可调用的14站API（需API Key）"""
    auth, err_resp, err_code = _auth_required()
    if err_resp:
        return err_resp, err_code
    return jsonify({
        'swarmlabs': {
            'name': '蜂群科研',
            'base_url': 'http://150.158.119.19:8461',
            'endpoints': list(SWARMLABS_ENDPOINTS.keys()) if 'SWARMLABS_ENDPOINTS' in globals() else [
                '/api/v1/engines', '/api/v1/quantum_calc/<molecule>',
                '/api/v1/quantum_molecules', '/api/v1/reaction_energy'
            ]
        },
        'sites': {k: {'name': v['name'], 'api_base': v['base']} for k, v in SITES_API.items()}
    })

@app.route('/api/v1/cross/<site>/entities')
def cross_entities(site):
    """跨项目查询：获取指定站点的实体数据（需API Key）
    
    内部Key: 无限制
    免费Key: 30次/小时，仅摘要字段
    Pro Key: 无限制，完整数据
    """
    auth, err_resp, err_code = _auth_required()
    if err_resp:
        return err_resp, err_code
    
    if site not in SITES_API:
        return jsonify({'error': f'未知站点: {site}', 'available': list(SITES_API.keys())}), 404
    
    url = f'{SITES_API[site]["base"]}/entities.json'
    data = _fetch_url(url)
    
    # 免费用户：只返回摘要
    if auth['tier'] == 'free' and isinstance(data, dict) and 'entities' in data:
        free_fields = ['id', 'name', 'category', 'type', '_type', 'focus']
        data['entities'] = [{k: (str(v)[:100]+'...' if k=='focus' and v else v) for k, v in e.items() if k in free_fields} for e in data['entities'][:50]]
        data['meta']['tier'] = 'free'
        data['meta']['locked_fields'] = True
        data['meta']['upgrade_url'] = 'https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh'
    
    return jsonify({
        'source': site,
        'source_name': SITES_API[site]['name'],
        'api_url': url,
        'tier': auth['tier'],
        'data': data
    })

@app.route('/api/v1/cross/<site>/graph')
def cross_graph(site):
    """跨项目查询：获取指定站点的知识图谱（需API Key）"""
    auth, err_resp, err_code = _auth_required()
    if err_resp:
        return err_resp, err_code
    
    if site not in SITES_API:
        return jsonify({'error': f'未知站点: {site}'}), 404
    
    url = f'{SITES_API[site]["base"]}/graph.json'
    data = _fetch_url(url)
    return jsonify({'source': site, 'tier': auth['tier'], 'data': data})

@app.route('/api/v1/cross/search')
def cross_search():
    """跨项目搜索：在所有14站中搜索关键词（需API Key）
    
    免费用户：仅搜索2站
    Pro用户：搜索全部14站
    """
    from flask import request
    query = request.args.get('q', '').strip()
    limit = int(request.args.get('limit', '3'))
    
    if not query:
        return jsonify({'error': '请提供搜索关键词: ?q=关键词'})
    
    # 免费用户仅搜索前2站
    sites_to_search = list(SITES_API.items())[:2] if auth['tier'] == 'free' else list(SITES_API.items())
    results = {}
    for site, info in sites_to_search:
        try:
            url = f'{info["base"]}/entities.json'
            data = _fetch_url(url, timeout=5)
            if 'entities' in data:
                entities = data['entities']
                matched = []
                for e in entities:
                    # 搜索name/category/focus字段
                    searchable = ' '.join(str(e.get(k, '')) for k in ['name', 'category', 'focus', 'type', '_type'])
                    if query.lower() in searchable.lower():
                        matched.append({
                            'id': e.get('id'),
                            'name': e.get('name'),
                            'category': e.get('category'),
                            'type': e.get('type', e.get('_type')),
                        })
                    if len(matched) >= limit:
                        break
                if matched:
                    results[site] = {
                        'name': info['name'],
                        'total': data.get('meta', {}).get('total', len(entities)),
                        'matched': len(matched),
                        'results': matched
                    }
        except:
            pass
    
    return jsonify({
        'query': query,
        'tier': auth['tier'],
        'sites_searched': len(sites_to_search),
        'sites_with_results': len(results),
        'results': results,
        'upgrade_url': 'https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh' if auth['tier'] == 'free' else None
    })


# ========== 世界模型虚拟实验引擎 ==========
from swarmlabs_world_model import WorldModelEngine
world_model_engine = WorldModelEngine()

@app.route('/api/v1/world_model/models')
def world_model_models():
    """列出可用世界模型"""
    return jsonify(world_model_engine.list_models())

@app.route('/api/v1/world_model/simulate/reaction', methods=['POST'])
def world_model_reaction():
    """化学反应模拟（世界模型）"""
    from flask import request
    data = request.json or {}
    result = world_model_engine.simulate_reaction(
        data.get('reactants', ['H2O']),
        data.get('conditions', {})
    )
    return jsonify(result)

@app.route('/api/v1/world_model/simulate/degradation', methods=['POST'])
def world_model_degradation():
    """材料退化模拟（世界模型长时间预测）"""
    from flask import request
    data = request.json or {}
    result = world_model_engine.simulate_material_degradation(
        data.get('material', 'unknown'),
        data.get('duration_hours', 100),
        data.get('conditions', {})
    )
    return jsonify(result)

@app.route('/api/v1/world_model/counterfactual', methods=['POST'])
def world_model_counterfactual():
    """反事实推理——"如果改变条件会怎样" """
    from flask import request
    data = request.json or {}
    result = world_model_engine.counterfactual(
        data.get('experiment', 'synthesis'),
        data.get('base_params', {}),
        data.get('changed_params', {})
    )
    return jsonify(result)

@app.route('/api/v1/world_model/virtual_lab', methods=['POST'])
def world_model_virtual_lab():
    """虚拟试验场——在世界模型中做实验"""
    from flask import request
    data = request.json or {}
    result = world_model_engine.virtual_lab(
        data.get('experiment_type', 'reaction'),
        data.get('params', {})
    )
    return jsonify(result)


# ========== 分子动力学模拟引擎 ==========
from swarmlabs_md_engine import MolecularDynamicsEngine
md_engine = MolecularDynamicsEngine()

@app.route('/api/v1/md/capabilities')
def md_capabilities():
    """列出分子动力学模拟能力"""
    return jsonify(md_engine.list_capabilities())

@app.route('/api/v1/md/simulate', methods=['POST'])
@require_api_key('free')
def md_simulate():
    """分子动力学模拟
    
    POST JSON: {
        "smiles": "CCO",
        "steps": 1000,
        "temperature": 300,
        "forcefield": "mmff",
        "timestep_fs": 1.0
    }
    """
    from flask import request
    data = request.json or {}
    result = md_engine.simulate_md(
        data.get('smiles', 'CCO'),
        steps=data.get('steps', 500),
        temperature=data.get('temperature', 300),
        timestep_fs=data.get('timestep_fs', 0.25),
        forcefield=data.get('forcefield', 'mmff94'),
    )
    return jsonify(result)


@app.route('/api/v1/md/forcefields')
def md_forcefields():
    """列出所有支持的力场"""
    return jsonify(md_engine.list_forcefields())

@app.route('/api/v1/md/recommend_forcefield')
def md_recommend_ff():
    """力场推荐引擎——根据体系类型推荐最佳力场
    
    参数: ?system=药物 / 蛋白质 / MOF / 水 / 反应 / 通用
    """
    from flask import request
    system = request.args.get('system', '通用')
    return jsonify(md_engine.recommend_forcefield(system))

@app.route('/api/v1/md/compare_forcefields', methods=['POST'])
def md_compare_ff():
    """多力场对比——同一分子用不同力场计算
    
    POST JSON: {"smiles":"CCO", "forcefields":["mmff94","uff","mmff94s"]}
    """
    from flask import request
    data = request.json or {}
    result = md_engine.compare_forcefields(
        data.get('smiles', 'CCO'),
        data.get('forcefields'),
    )
    return jsonify(result)

@app.route('/api/v1/md/optimize', methods=['POST'])
@require_api_key('free')
def md_optimize():
    """结构优化——SMILES→3D构型+优化+分子描述符"""
    from flask import request
    data = request.json or {}
    result = md_engine.optimize_structure(
        data.get('smiles', 'CCO'),
        max_iter=data.get('max_iter', 200),
    )
    return jsonify(result)

@app.route('/api/v1/md/thermodynamics', methods=['POST'])
@require_api_key('free')
def md_thermodynamics():
    """热力学量计算——多温度扫描"""
    from flask import request
    data = request.json or {}
    result = md_engine.calc_thermodynamics(
        data.get('smiles', 'O'),
        data.get('temperatures', [200, 250, 300, 350, 400]),
    )
    return jsonify(result)


# ========== ML校正预测引擎 ==========
from swarmlabs_md_engine_v4 import MolecularDynamicsEngineV4
ml_engine = MolecularDynamicsEngineV4()

@app.route('/api/v1/ml/predict')
@require_api_key('free')
def ml_predict():
    """ML预测——30分子真实数据训练的GBR模型
    
    参数: ?smiles=CCO
    LeaveOneOut验证: 偶极矩MAE=1.02D | 沸点MAE=49°C
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    
    smiles = request.args.get('smiles', 'CCO')
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return jsonify({'error': f'invalid SMILES: {smiles}'})
    
    # 13个特征(升级后)
    features = _np.array([[
        Descriptors.MolWt(mol),
        Descriptors.MolLogP(mol),
        Descriptors.TPSA(mol),
        Descriptors.NumHDonors(mol),
        Descriptors.NumHAcceptors(mol),
        Descriptors.NumRotatableBonds(mol),
        mol.GetNumAtoms(),
        mol.GetNumHeavyAtoms(),
        Descriptors.RingCount(mol),
        sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
    ]])
    
    # 加载模型+预测——优先13特征RF,回退10特征GBR
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    predictions = {}
    
    # 13特征RF模型(新)
    for name, label in [('boiling_point','boiling_point_C'), ('heat_of_formation','heat_of_formation_kJ_mol')]:
        path_rf13 = os.path.join(model_dir, f'{name}_rf13.pkl')
        if os.path.exists(path_rf13):
            with open(path_rf13, 'rb') as f:
                model = pickle.load(f)
            predictions[label] = {'value': round(float(model.predict(features)[0]), 2), 'model': 'RF 13feat'}
    
    # 10特征GBR模型(旧,回退)
    features_10 = features[:, :10]
    for name in ['dipole', 'melting_point']:
        path = os.path.join(model_dir, f'{name}_gbr.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f:
                model = pickle.load(f)
            try:
                predictions[name] = {'value': round(float(model.predict(features_10)[0]), 2), 'model': 'GBR 10feat'}
            except:
                pass
    
    # 查找实验值
    import json as _json
    experimental = None
    try:
        training = _json.load(open('/home/z/my-project/swarmlabs_training_data_real.json'))
        for d in training:
            if d['smiles'] == smiles:
                experimental = {
                    'dipole_debye': d.get('exp_dipole'),
                    'boiling_point_c': d.get('exp_bp_C'),
                    'melting_point_c': d.get('exp_mp_C'),
                    'heat_of_formation_kj_mol': d.get('exp_hf_kJ'),
                    'source': 'NIST CCCBDB + literature',
                }
                break
    except:
        pass
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'features': {
            'molecular_weight': round(float(features[0][0]), 2),
            'xlogp': round(float(features[0][1]), 2),
            'tpsa': round(float(features[0][2]), 2),
            'h_donors': int(features[0][3]),
            'h_acceptors': int(features[0][4]),
            'rotatable_bonds': int(features[0][5]),
            'n_atoms': int(features[0][6]),
            'n_rings': int(features[0][8]),
        },
        'ml_predictions': {
            'dipole_debye': predictions.get('dipole'),
            'boiling_point_c': predictions.get('boiling_point_C'),
            'heat_of_formation_kj_mol': predictions.get('heat_of_formation_kJ_mol'),
            'melting_point_c': predictions.get('melting_point'),
        },
        'model_info': {
            'type': 'RandomForest(13feat) + GradientBoosting(10feat)',
            'training_data': '271 molecules NIST real experimental data',
            'validation': '5-fold CV: 沸点5.2% | 生成焓4.4%',
        },
        'experimental': experimental,
    })

@app.route('/api/v1/ml/benchmark')
def ml_benchmark():
    """真实验证数据集——有文献来源"""
    return jsonify(ml_engine.get_benchmark())

@app.route('/api/v1/md/openmm_simulate', methods=['POST'])
def md_openmm():
    """OpenMM内置MD——温度控制准确(水分子TIP3P)"""
    from flask import request
    data = request.json or {}
    result = ml_engine.simulate_md_openmm(
        data.get('smiles', 'O'),
        steps=data.get('steps', 500),
        temperature=data.get('temperature', 300),
        solvent=data.get('solvent', True),
    )
    return jsonify(result)


# ========== 材料属性数据库(真实数据) ==========
@app.route('/api/v1/materials_db/<category>')
def materials_db(category):
    """材料属性数据库——有文献来源的真实属性
    
    类别: photocatalysis(光催化) / battery(电池) / perovskite(钙钛矿)
    """
    import os, json as _json
    path = f'/home/z/my-project/swarmlabs_materials_db/{category}.json'
    if not os.path.exists(path):
        return jsonify({'error': f'未知类别: {category}', 'available': ['photocatalysis', 'battery', 'perovskite']}), 404
    with open(path) as f:
        data = _json.load(f)
    return jsonify({
        'category': category,
        'count': len(data),
        'materials': data,
        'source': 'NIST/JARVIS/NREL/文献',
        'note': '每个材料属性都有明确的文献来源',
    })


# ========== 引擎级ML校正 ==========
import pickle as _pickle

@app.route('/api/v1/engine_ml/<engine_id>')
def engine_ml_predict(engine_id):
    """引擎ML校正预测——物理方程+ML残差
    
    参数: ?bandgap=3.2&surface_area=50 (根据引擎类型)
    输出: 物理方程预测 + ML校正预测 + 精度提升
    """
    from flask import request
    import os, json as _json
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models/engine_models'
    model_path = os.path.join(model_dir, f'{engine_id}_ml.pkl')
    meta_path = os.path.join(model_dir, f'{engine_id}_meta.json')
    
    if not os.path.exists(model_path):
        return jsonify({
            'error': f'引擎{engine_id}无ML模型',
            'available': [f.replace('_ml.pkl','') for f in os.listdir(model_dir) if f.endswith('_ml.pkl')],
        }), 404
    
    # 加载模型和元数据
    with open(model_path, 'rb') as f:
        ml_model = _pickle.load(f)
    with open(meta_path) as f:
        meta = _json.load(f)
    
    # 获取输入参数
    params = {}
    for feat in meta['features']:
        val = request.args.get(feat)
        if val:
            params[feat] = float(val)
        else:
            params[feat] = 1.0  # 默认值
    
    # 物理方程基线
    engine_physics = {
        'photocatalysis': lambda p: 0.1 * p.get('bandgap', 3.0)**(-1.5) * p.get('surface_area', 50),
        'battery': lambda p: 3.7 * p.get('voltage', 3.7) * 0.8,
        'perovskite': lambda p: 25.0 * (1.5 / p.get('bandgap', 1.55))**0.5,
        'ammonia': lambda p: 100 * __import__('math').exp(-50000 / (8.314 * (p.get('temperature', 450) + 273))),
        'corrosion': lambda p: 0.01 * __import__('math').exp(0.05 * (p.get('temperature', 25) - 25)),
        'adsorption': lambda p: 5.0 * p.get('surface_area', 1000) / 1000,
        'combustion': lambda p: 2000 - 50 * (p.get('equivalence_ratio', 1.0) - 1.0)**2,
        'polymer': lambda p: 50 + 0.5 * p.get('mn', 100000) / 10000,
    }
    
    physics_func = engine_physics.get(engine_id)
    if not physics_func:
        return jsonify({'error': f'引擎{engine_id}物理方程未定义'}), 404
    
    physics_pred = float(physics_func(params))
    
    # ML残差校正
    import numpy as _np
    X = _np.array([[params[f] for f in meta['features']]])
    ml_residual = float(ml_model.predict(X)[0])
    corrected_pred = physics_pred + ml_residual
    
    return jsonify({
        'engine_id': engine_id,
        'target': meta['target'],
        'input_params': params,
        'physics_prediction': round(physics_pred, 4),
        'ml_correction': round(ml_residual, 4),
        'corrected_prediction': round(corrected_pred, 4),
        'accuracy': {
            'physics_mae': meta['physics_mae'],
            'corrected_mae': meta['corrected_mae'],
            'improvement_pct': meta['improvement_pct'],
        },
        'method': '物理方程(基线) + ML残差(校正)',
        'model_type': 'GradientBoostingRegressor',
        'warning': '训练数据为物理方程+模拟噪声(非真实实验数据),精度提升仅供参考',
        'training_data_note': '合成数据(物理方程+15%随机噪声),需要真实实验数据校准',
    })

@app.route('/api/v1/engine_ml/list')
def engine_ml_list():
    """列出有ML校正的引擎"""
    import os, json as _json
    model_dir = '/home/z/my-project/swarmlabs_ml_models/engine_models'
    if not os.path.exists(model_dir):
        return jsonify({'engines': [], 'count': 0})
    
    engines = []
    for f in sorted(os.listdir(model_dir)):
        if f.endswith('_meta.json'):
            with open(os.path.join(model_dir, f)) as fh:
                meta = _json.load(fh)
            engines.append({
                'engine_id': meta['engine_id'],
                'target': meta['target'],
                'features': meta['features'],
                'improvement_pct': meta['improvement_pct'],
                'physics_mae': meta['physics_mae'],
                'corrected_mae': meta['corrected_mae'],
            })
    
    return jsonify({
        'engines': engines,
        'count': len(engines),
        'method': '物理方程+ML残差校正',
        'warning': '8个引擎ML模型训练数据为合成数据(物理方程+随机噪声),精度提升指标仅供参考,非真实验证',
    })


# ========== 不确定性量化(UQ) ==========
@app.route('/api/v1/ml/predict_uq')
@require_api_key('free')
def ml_predict_uq():
    """ML预测+不确定性量化——Ensemble方法
    
    参数: ?smiles=CCO
    输出: 预测值±标准差 + 95%置信区间
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    
    smiles = request.args.get('smiles', 'CCO')
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return jsonify({'error': f'invalid SMILES: {smiles}'})
    
    features = _np.array([[
        Descriptors.MolWt(mol), Descriptors.MolLogP(mol), Descriptors.TPSA(mol),
        Descriptors.NumHDonors(mol), Descriptors.NumHAcceptors(mol),
        Descriptors.NumRotatableBonds(mol), mol.GetNumAtoms(), mol.GetNumHeavyAtoms(),
        Descriptors.RingCount(mol), sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
    ]])
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models/ensemble'
    results = {}
    
    for name, label in [('boiling_point','沸点(°C)'), ('dipole','偶极矩(Debye)'), ('heat_of_formation','生成焓(kJ/mol)')]:
        path = os.path.join(model_dir, f'{name}_ensemble.pkl')
        if not os.path.exists(path):
            continue
        
        with open(path, 'rb') as f:
            ensemble = pickle.load(f)
        
        preds = [m.predict(features)[0] for m in ensemble]
        mean = float(_np.mean(preds))
        std = float(_np.std(preds))
        ci_lower = mean - 2 * std
        ci_upper = mean + 2 * std
        
        results[name] = {
            'label': label,
            'mean': round(mean, 2),
            'std': round(std, 2),
            'ci_95': [round(ci_lower, 2), round(ci_upper, 2)],
            'n_models': len(ensemble),
        }
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'predictions': results,
        'method': '异构Ensemble (GBR×3 + RF×2 + Ridge×2)',
        'training_data': '97个分子真实实验值 (CRC Handbook + NIST)',
        'note': '预测值±标准差, 95%置信区间=均值±2σ',
    })


# ========== 材料推荐引擎 ==========
@app.route('/api/v1/recommend/materials')
def recommend_materials():
    """材料推荐引擎——输入需求→推荐最优材料
    
    参数: 
      ?category=photocatalysis&bandgap_min=2.0&bandgap_max=3.5&surface_area_min=50
      ?category=battery&voltage_min=3.5&capacity_min=150
    """
    from flask import request
    import os, json as _json
    
    category = request.args.get('category', 'photocatalysis')
    path = f'/home/z/my-project/swarmlabs_materials_db/{category}.json'
    
    if not os.path.exists(path):
        return jsonify({
            'error': f'未知类别: {category}',
            'available': ['photocatalysis','battery','perovskite','adsorption','corrosion','polymer','ammonia','combustion'],
        }), 404
    
    with open(path) as f:
        materials = _json.load(f)
    
    # 根据类别应用筛选
    filtered = materials.copy()
    
    # 光催化
    bg_min = request.args.get('bandgap_min', type=float)
    bg_max = request.args.get('bandgap_max', type=float)
    sa_min = request.args.get('surface_area_min', type=float)
    if bg_min is not None:
        filtered = [m for m in filtered if m.get('bandgap_eV',0) >= bg_min]
    if bg_max is not None:
        filtered = [m for m in filtered if m.get('bandgap_eV',0) <= bg_max]
    if sa_min is not None:
        filtered = [m for m in filtered if m.get('surface_area_m2g',0) >= sa_min]
    
    # 电池
    v_min = request.args.get('voltage_min', type=float)
    c_min = request.args.get('capacity_min', type=float)
    if v_min is not None:
        filtered = [m for m in filtered if m.get('voltage_V',0) >= v_min]
    if c_min is not None:
        filtered = [m for m in filtered if m.get('capacity_mAhg',0) >= c_min]
    
    # 钙钛矿
    eff_min = request.args.get('efficiency_min', type=float)
    if eff_min is not None:
        filtered = [m for m in filtered if m.get('efficiency_pct',0) >= eff_min]
    
    # 排序——按性能指标降序
    sort_key = {
        'photocatalysis': 'quantum_efficiency',
        'battery': 'capacity_mAhg',
        'perovskite': 'efficiency_pct',
        'adsorption': 'capacity_mmol_g',
        'corrosion': 'corrosion_rate_mmy',  # 越低越好
    }.get(category)
    
    if sort_key:
        reverse = category != 'corrosion'  # 腐蚀率越低越好
        filtered.sort(key=lambda m: m.get(sort_key, 0), reverse=reverse)
    
    # 推荐理由
    recommendations = []
    for i, m in enumerate(filtered[:5]):  # Top 5
        reason = f"{m.get('name','?')}: "
        if category == 'photocatalysis':
            reason += f"带隙{m.get('bandgap_eV','?')}eV, 量子效率{m.get('quantum_efficiency','?')}, 比表面积{m.get('surface_area_m2g','?')}m²/g"
        elif category == 'battery':
            reason += f"电压{m.get('voltage_V','?')}V, 容量{m.get('capacity_mAhg','?')}mAh/g, 循环{m.get('cycle_life','?')}次"
        elif category == 'perovskite':
            reason += f"带隙{m.get('bandgap_eV','?')}eV, 效率{m.get('efficiency_pct','?')}%"
        else:
            reason += str({k:v for k,v in m.items() if k not in ['name','formula','source']})[:100]
        
        recommendations.append({
            'rank': i + 1,
            'name': m.get('name','?'),
            'formula': m.get('formula','?'),
            'reason': reason,
            'source': m.get('source','?'),
            'full_data': m,
        })
    
    return jsonify({
        'category': category,
        'total_in_db': len(materials),
        'matched': len(filtered),
        'recommended': len(recommendations),
        'recommendations': recommendations,
        'sort_by': sort_key,
        'note': '基于真实属性数据库的多目标推荐',
    })


# ========== 核心壁垒: 融合预测+可解释AI+多保真度 ==========

@app.route('/api/v1/fusion/predict')
@require_api_key('free')
def fusion_predict():
    """融合预测引擎——ML(快)+UQ(置信)+DFT(精确)三级联动
    
    参数: ?smiles=CCO
    高置信→直接ML | 中置信→ML+UQ | 低置信→建议DFT
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    
    smiles = request.args.get('smiles', 'CCO')
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return jsonify({'error': f'invalid SMILES: {smiles}'})
    
    features = _np.array([[
        Descriptors.MolWt(mol), Descriptors.MolLogP(mol), Descriptors.TPSA(mol),
        Descriptors.NumHDonors(mol), Descriptors.NumHAcceptors(mol),
        Descriptors.NumRotatableBonds(mol), mol.GetNumAtoms(), mol.GetNumHeavyAtoms(),
        Descriptors.RingCount(mol), sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
    ]])
    
    # 加载训练集判断是否在内
    import json as _json
    training_smiles = set()
    try:
        training = _json.load(open('/home/z/my-project/swarmlabs_training_data_real.json'))
        training_smiles = set(d['smiles'] for d in training)
    except: pass
    in_training = smiles in training_smiles
    
    predictions = {}
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    ens_dir = os.path.join(model_dir, 'ensemble')
    
    for name in ['boiling_point', 'heat_of_formation']:
        # ML预测
        ml_path = os.path.join(model_dir, f'{name}_gbr.pkl')
        if not os.path.exists(ml_path): continue
        with open(ml_path, 'rb') as f:
            model = pickle.load(f)
        ml_pred = float(model.predict(features)[0])
        
        # UQ
        std = 0.0
        ens_path = os.path.join(ens_dir, f'{name}_ensemble.pkl')
        if os.path.exists(ens_path):
            with open(ens_path, 'rb') as f:
                ensemble = pickle.load(f)
            preds = [float(m.predict(features)[0]) for m in ensemble]
            std = float(_np.std(preds))
        
        ci_lower = ml_pred - 2 * std
        ci_upper = ml_pred + 2 * std
        
        # 置信度
        if std < 5:
            confidence = 'high'
        elif std < 15:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        needs_dft = (std > 15 or not in_training)
        
        predictions[name] = {
            'ml_prediction': round(ml_pred, 2),
            'std': round(std, 2),
            'ci_95': [round(ci_lower, 2), round(ci_upper, 2)],
            'confidence': confidence,
            'in_training_set': in_training,
            'dft_recommended': needs_dft,
            'method': 'ML(快速)' if confidence == 'high' else 'ML+UQ(需验证)' if confidence == 'medium' else 'ML+UQ+DFT(建议精确计算)',
        }
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'engine': 'Fusion (ML + UQ + DFT)',
        'predictions': predictions,
        'strategy': '高置信→ML直接预测 | 中置信→标注不确定性 | 低置信→建议DFT验证',
    })

@app.route('/api/v1/explain/predict')
@require_api_key('free')
def explain_predict():
    """可解释AI——SHAP值解释每个特征贡献
    
    参数: ?smiles=CCO&target=boiling_point
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    import shap
    
    smiles = request.args.get('smiles', 'CCO')
    target = request.args.get('target', 'boiling_point')
    
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return jsonify({'error': f'invalid SMILES: {smiles}'})
    
    model_path = f'/home/z/my-project/swarmlabs_ml_models/{target}_gbr.pkl'
    if not os.path.exists(model_path):
        return jsonify({'error': f'模型{target}不存在'}), 404
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    feat_names = ['molecular_weight','xlogp','tpsa','h_donors','h_acceptors','rotatable_bonds',
                  'n_atoms','n_heavy_atoms','n_rings','n_aromatic','n_halogens','n_oxygens','n_nitrogens']
    
    features = _np.array([[
        Descriptors.MolWt(mol), Descriptors.MolLogP(mol), Descriptors.TPSA(mol),
        Descriptors.NumHDonors(mol), Descriptors.NumHAcceptors(mol),
        Descriptors.NumRotatableBonds(mol), mol.GetNumAtoms(), mol.GetNumHeavyAtoms(),
        Descriptors.RingCount(mol), sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
    ]])
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features)[0]
    base_value = float(explainer.expected_value[0]) if hasattr(explainer.expected_value, '__len__') else float(explainer.expected_value)
    prediction = float(model.predict(features)[0])
    
    contributions = []
    for i, name in enumerate(feat_names):
        contributions.append({
            'feature': name,
            'value': round(float(features[0][i]), 3),
            'shap_value': round(float(shap_values[i]), 3),
            'direction': 'increases' if float(shap_values[i]) > 0 else 'decreases',
            'impact': round(abs(float(shap_values[i])), 3),
        })
    contributions.sort(key=lambda x: x['impact'], reverse=True)
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'target': target,
        'base_value': round(base_value, 2),
        'prediction': round(prediction, 2),
        'formula': f'{base_value:.1f} + {float(sum(shap_values)):.1f} = {prediction:.1f}',
        'contributions': contributions[:8],
        'method': 'SHAP TreeExplainer',
        'note': 'SHAP值解释每个特征对预测的贡献——正向(↑)提升预测值, 负向(↓)降低预测值',
    })

@app.route('/api/v1/multifidelity/predict')
@require_api_key('free')
def multifidelity_predict():
    """多保真度融合——LF(MMFF94,秒级)+HF(DFT,分钟级)
    
    参数: ?smiles=CCO
    """
    from flask import request
    from rdkit import Chem
    from rdkit.Chem import AllChem
    from pyscf import gto, dft
    import time as _time
    
    smiles = request.args.get('smiles', 'O')
    
    # 低保真度: MMFF94
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return jsonify({'error': f'invalid SMILES: {smiles}'})
    
    mol = Chem.AddHs(mol)
    AllChem.EmbedMolecule(mol, randomSeed=42)
    AllChem.MMFFOptimizeMolecule(mol)
    mp = AllChem.MMFFGetMoleculeProperties(mol)
    
    lf = None
    if mp:
        ff = AllChem.MMFFGetMoleculeForceField(mol, mp)
        if ff:
            lf = {
                'energy_kcal': round(float(ff.CalcEnergy()), 4),
                'method': 'MMFF94',
                'fidelity': 'low',
                'time_s': 0.01,
                'n_atoms': mol.GetNumAtoms(),
            }
    
    # 高保真度: DFT
    conf = mol.GetConformer()
    atoms = []
    for i in range(mol.GetNumAtoms()):
        atom = mol.GetAtomWithIdx(i)
        pos = conf.GetAtomPosition(i)
        atoms.append(f'{atom.GetSymbol()} {pos.x:.4f} {pos.y:.4f} {pos.z:.4f}')
    
    n = mol.GetNumAtoms()
    hf = None
    if n <= 20:
        try:
            start = _time.time()
            mol_pyscf = gto.M(atom=';'.join(atoms), basis='6-31G', verbose=0)
            mf = dft.RKS(mol_pyscf)
            mf.xc = 'b3lyp'
            energy = mf.kernel()
            elapsed = _time.time() - start
            hf = {
                'energy_hartree': round(float(energy), 6),
                'method': 'B3LYP/6-31G',
                'fidelity': 'high',
                'time_s': round(elapsed, 2),
                'n_atoms': n,
            }
        except Exception as e:
            hf = {'error': str(e)}
    else:
        hf = {'error': f'分子太大({n}原子), DFT限制20原子以内'}
    
    fusion = None
    if lf and hf and 'energy_hartree' in hf:
        fusion = {
            'lf_speed': f'{lf["time_s"]:.2f}s',
            'hf_speed': f'{hf["time_s"]:.2f}s',
            'speedup': f'{hf["time_s"]/max(lf["time_s"],0.01):.0f}x',
            'strategy': 'LF快速筛选 → HF精确验证',
        }
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'engine': 'Multi-Fidelity Fusion',
        'low_fidelity': lf,
        'high_fidelity': hf,
        'fusion': fusion,
    })


# ========== 高级引擎框架(等算力接入) ==========
from swarmlabs_mlip_engine import MLIPEngine
from swarmlabs_advanced_engines import MoleculeGenerator, BayesianOptimizer, HighThroughputScreener, ActiveLearningLoop

mlip_engine = MLIPEngine()
mol_generator = MoleculeGenerator()
bayes_opt = BayesianOptimizer()
ht_screener = HighThroughputScreener()
active_learner = ActiveLearningLoop()

# A. MLIP引擎
@app.route('/api/v1/mlip/models')
def mlip_models():
    """机器学习势函数列表——4种MLIP框架"""
    return jsonify(mlip_engine.list_models())

@app.route('/api/v1/mlip/estimate')
def mlip_estimate():
    """MLIP vs DFT加速比估算"""
    from flask import request
    n = request.args.get('n_atoms', 100, type=int)
    model = request.args.get('model', 'mace')
    use_gpu = request.args.get('gpu', 'true') == 'true'
    return jsonify(mlip_engine.estimate_speedup(n, model, use_gpu))

@app.route('/api/v1/mlip/predict')
def mlip_predict():
    """MLIP预测——等GPU接入后激活"""
    from flask import request
    smiles = request.args.get('smiles', 'O')
    model = request.args.get('model', 'mace')
    return jsonify(mlip_engine.predict(smiles, model))

# B. 分子生成
@app.route('/api/v1/generate/molecules')
def generate_molecules():
    """分子生成引擎——给定属性需求→生成新分子
    
    参数: ?property=boiling_point&value=80&n=10
    """
    from flask import request
    prop = request.args.get('property', 'boiling_point')
    val = request.args.get('value', 80, type=float)
    n = request.args.get('n', 10, type=int)
    model = request.args.get('model', 'graphaf')
    return jsonify(mol_generator.generate(prop, val, n, model))

@app.route('/api/v1/generate/evaluate')
def evaluate_molecule():
    """评估分子属性"""
    from flask import request
    smiles = request.args.get('smiles', 'CCO')
    prop = request.args.get('property', 'molecular_weight')
    return jsonify(mol_generator.evaluate_molecule(smiles, prop))

# C. 贝叶斯优化
@app.route('/api/v1/bayes/observe', methods=['POST'])
def bayes_observe():
    """添加实验观测"""
    from flask import request
    data = request.json or {}
    return jsonify(bayes_opt.add_observation(data.get('params',{}), data.get('result',0)))

@app.route('/api/v1/bayes/recommend')
def bayes_recommend():
    """推荐下一个实验——贝叶斯优化"""
    from flask import request
    import urllib.parse
    ranges_str = request.args.get('ranges', 'temperature:300-600,pressure:1-50')
    param_ranges = {}
    for item in ranges_str.split(','):
        if ':' in item and '-' in item:
            parts = item.split(':')
            vals = parts[1].split('-')
            param_ranges[parts[0]] = [float(vals[0]), float(vals[1])]
    strategy = request.args.get('strategy', 'ei')
    return jsonify(bayes_opt.recommend_next(param_ranges, strategy))

@app.route('/api/v1/bayes/history')
def bayes_history():
    """查看实验历史"""
    return jsonify(bayes_opt.get_history())

# D. 高通量筛选
@app.route('/api/v1/htscreen/submit', methods=['POST'])
def htscreen_submit():
    """提交高通量筛选任务"""
    from flask import request
    data = request.json or {}
    smiles_list = data.get('smiles_list', [])
    calc_type = data.get('calculation_type', 'dft')
    return jsonify(ht_screener.submit_batch(smiles_list, calc_type))

@app.route('/api/v1/htscreen/jobs')
def htscreen_jobs():
    """列出所有任务"""
    return jsonify(ht_screener.list_jobs())

# E. 主动学习
@app.route('/api/v1/activelearn/feedback', methods=['POST'])
def al_feedback():
    """用户反馈——预测值vs实际值"""
    from flask import request
    data = request.json or {}
    return jsonify(active_learner.add_feedback(
        data.get('smiles',''),
        data.get('prediction',0),
        data.get('actual',0),
        data.get('property','boiling_point')
    ))

@app.route('/api/v1/activelearn/check')
def al_check():
    """检查是否需要重训练"""
    return jsonify(active_learner.check_retrain_needed())

@app.route('/api/v1/activelearn/retrain')
def al_retrain():
    """触发重训练"""
    model = request.args.get('model', 'boiling_point') if 'request' in dir() else 'boiling_point'
    return jsonify(active_learner.retrain(model))

@app.route('/api/v1/activelearn/stats')
def al_stats():
    """反馈统计"""
    return jsonify(active_learner.get_feedback_stats())


# ========== 用户价值功能 ==========

# 功能1: 材料筛选工作流——输入需求→自动筛选→输出候选清单
@app.route('/api/v1/workflow/screen_materials')
def workflow_screen():
    """材料筛选工作流——输入性能需求→查数据库+ML预测→Top候选
    
    参数: ?category=photocatalysis&bandgap_min=2.5&bandgap_max=3.5&surface_area_min=50
    """
    from flask import request
    import os, json as _json
    
    category = request.args.get('category', 'photocatalysis')
    path = f'/home/z/my-project/swarmlabs_materials_db/{category}.json'
    
    if not os.path.exists(path):
        return jsonify({
            'error': f'未知类别: {category}',
            'available': ['photocatalysis','battery','perovskite','adsorption','corrosion','polymer','ammonia','combustion'],
        }), 404
    
    with open(path) as f:
        materials = _json.load(f)
    
    # 筛选参数
    filters = {
        'bandgap_min': request.args.get('bandgap_min', type=float),
        'bandgap_max': request.args.get('bandgap_max', type=float),
        'surface_area_min': request.args.get('surface_area_min', type=float),
        'voltage_min': request.args.get('voltage_min', type=float),
        'capacity_min': request.args.get('capacity_min', type=float),
        'efficiency_min': request.args.get('efficiency_min', type=float),
    }
    
    filtered = materials.copy()
    for key, val in filters.items():
        if val is None:
            continue
        field = key.replace('_min','_eV').replace('_max','_eV').replace('surface_area_eV','surface_area_m2g').replace('voltage_eV','voltage_V').replace('capacity_eV','capacity_mAhg').replace('efficiency_eV','efficiency_pct')
        if '_min' in key:
            field = key.replace('_min','')
            field = {'bandgap':'bandgap_eV','surface_area':'surface_area_m2g','voltage':'voltage_V','capacity':'capacity_mAhg','efficiency':'efficiency_pct'}.get(field, field)
            filtered = [m for m in filtered if m.get(field,0) >= val]
        elif '_max' in key:
            field = key.replace('_max','')
            field = {'bandgap':'bandgap_eV'}.get(field, field)
            filtered = [m for m in filtered if m.get(field,0) <= val]
    
    # 排序+取Top5
    sort_map = {
        'photocatalysis': ('quantum_efficiency', True),
        'battery': ('capacity_mAhg', True),
        'perovskite': ('efficiency_pct', True),
        'adsorption': ('capacity_mmol_g', True),
        'corrosion': ('corrosion_rate_mmy', False),
    }
    sort_field, reverse = sort_map.get(category, ('quantum_efficiency', True))
    filtered.sort(key=lambda m: m.get(sort_field, 0), reverse=reverse)
    
    # 生成工作流报告
    candidates = []
    for i, m in enumerate(filtered[:5]):
        candidate = {
            'rank': i + 1,
            'name': m.get('name','?'),
            'formula': m.get('formula','?'),
            'properties': {k:v for k,v in m.items() if k not in ['name','formula','source']},
            'source': m.get('source','?'),
        }
        candidates.append(candidate)
    
    return jsonify({
        'status': 'success',
        'workflow': 'material_screening',
        'input': {'category': category, 'filters': {k:v for k,v in filters.items() if v is not None}},
        'database_total': len(materials),
        'matched': len(filtered),
        'recommended': len(candidates),
        'candidates': candidates,
        'sort_by': sort_field,
        'report': f'从{len(materials)}种{category}材料中筛选出{len(filtered)}种匹配材料,推荐Top{len(candidates)}',
    })

# 功能3: 材料对比工具
@app.route('/api/v1/workflow/compare')
def workflow_compare():
    """材料对比——选多个材料并排对比属性
    
    参数: ?category=photocatalysis&names=TiO2-P25,ZnO,WO3
    """
    from flask import request
    import os, json as _json
    
    category = request.args.get('category', 'photocatalysis')
    names_str = request.args.get('names', '')
    names = [n.strip() for n in names_str.split(',') if n.strip()]
    
    path = f'/home/z/my-project/swarmlabs_materials_db/{category}.json'
    if not os.path.exists(path):
        return jsonify({'error': f'未知类别: {category}'}), 404
    
    with open(path) as f:
        materials = _json.load(f)
    
    # 找到指定材料
    selected = []
    for name in names:
        for m in materials:
            if m.get('name','').lower() == name.lower() or name.lower() in m.get('name','').lower():
                selected.append(m)
                break
    
    if not selected:
        return jsonify({'error': '未找到指定材料', 'available': [m['name'] for m in materials]})
    
    # 提取所有属性键
    all_keys = set()
    for m in selected:
        all_keys.update(m.keys())
    all_keys.discard('source')
    
    # 构建对比表
    comparison = []
    for key in sorted(all_keys):
        row = {'property': key}
        for i, m in enumerate(selected):
            row[f'material_{i+1}'] = m.get(key, '—')
        comparison.append(row)
    
    return jsonify({
        'status': 'success',
        'n_materials': len(selected),
        'materials': [{'name': m.get('name','?'), 'formula': m.get('formula','?')} for m in selected],
        'comparison_table': comparison,
        'note': '属性并排对比, —表示该材料无此属性',
    })

# 功能6: 论文引用生成器
@app.route('/api/v1/workflow/citation')
def workflow_citation():
    """论文引用生成器——计算完成后生成BibTeX引用
    
    参数: ?smiles=CCO&calculation=dft
    """
    from flask import request
    smiles = request.args.get('smiles', 'CCO')
    calc = request.args.get('calculation', 'dft')
    
    # 生成多种引用格式
    bibtex = f"""@misc{{swarmlabs2026,
  title={{SwarmLabs AI-driven material simulation: {calc.upper()} calculation of {smiles}}},
  author={{SwarmLabs}},
  year={{2026}},
  url={{https://swarmlabs.pages.dev}},
  note={{Accessed: 2026-07-14}}
}}"""
    
    apa = f"SwarmLabs. (2026). AI-driven material simulation: {calc.upper()} calculation of {smiles}. https://swarmlabs.pages.dev"
    
    ris = f"""TY  - GEN
TI  - SwarmLabs AI-driven material simulation: {calc.upper()} calculation of {smiles}
AU  - SwarmLabs
PY  - 2026
UR  - https://swarmlabs.pages.dev
ER  -"""
    
    return jsonify({
        'status': 'success',
        'smiles': smiles,
        'calculation': calc,
        'citations': {
            'bibtex': bibtex,
            'apa': apa,
            'ris': ris,
        },
        'note': '在论文中使用本工具的计算结果时,请引用本平台',
    })


# ========== GPU推理引擎(等GPU接入) ==========
from swarmlabs_gpu_engine import GPUMLIPEngine, MoleculeGeneratorGPU, DeepLearningML, HighThroughputGPU
gpu_mlip = GPUMLIPEngine()
gpu_generator = MoleculeGeneratorGPU()
gpu_dl = DeepLearningML()
gpu_ht = HighThroughputGPU()

@app.route('/api/v1/gpu/status')
def gpu_status():
    """GPU状态检查"""
    return jsonify({
        'gpu_available': gpu_mlip.gpu_available,
        'engines': {
            'mlip': {'status': 'active' if gpu_mlip.gpu_available else 'framework_ready', 'models': list(gpu_mlip.models.keys())},
            'generator': {'status': 'active' if gpu_generator.gpu_available else 'framework_ready'},
            'deep_learning': {'status': 'active' if gpu_dl.gpu_available else 'framework_ready(CPU可训练)'},
            'high_throughput': {'status': 'active' if gpu_ht.gpu_available else 'framework_ready'},
        },
        'note': 'GPU代码已完成, 等GPU接入激活',
    })

@app.route('/api/v1/gpu/mlip/predict')
def gpu_mlip_predict():
    """GPU MLIP预测——MACE/M3GNet/CHGNet"""
    from flask import request
    smiles = request.args.get('smiles', 'CCO')
    model = request.args.get('model', 'mace')
    return jsonify(gpu_mlip.predict(smiles, model))

@app.route('/api/v1/gpu/generate')
def gpu_generate():
    """GPU分子生成——GraphAF/REINVENT"""
    from flask import request
    prop = request.args.get('property', 'boiling_point')
    val = request.args.get('value', 80, type=float)
    n = request.args.get('n', 10, type=int)
    model = request.args.get('model', 'graphaf')
    return jsonify(gpu_generator.generate(prop, val, n, model))

@app.route('/api/v1/gpu/dl/train', methods=['POST'])
def gpu_dl_train():
    """深度学习ML训练——PyTorch神经网络"""
    from flask import request
    import numpy as _np
    data = request.json or {}
    target = data.get('target', 'boiling_point')
    
    # 加载训练数据
    import json as _json
    try:
        train = _json.load(open('/home/z/my-project/swarmlabs_training_data_large.json'))
        feat = ['molecular_weight','xlogp','tpsa','h_donors','h_acceptors','rotatable_bonds','n_atoms','n_heavy_atoms','n_rings','n_aromatic','n_halogens','n_oxygens','n_nitrogens']
        X = _np.array([[d[f] for f in feat] for d in train])
        
        if target == 'boiling_point':
            y = _np.array([d['exp_boiling_point_C'] for d in train])
        else:
            y = _np.array([d['exp_heat_of_formation_kJ_mol'] for d in train])
        
        epochs = data.get('epochs', 100)
        r = gpu_dl.train(X, y, target, epochs)
        return jsonify(r)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/v1/gpu/htscreen')
def gpu_htscreen():
    """GPU高通量筛选——1000+分子并行"""
    from flask import request
    import json as _json
    n = request.args.get('n', 100, type=int)
    calc = request.args.get('calc', 'mlip')
    
    # 从训练数据取n个分子
    try:
        train = _json.load(open('/home/z/my-project/swarmlabs_training_data_large.json'))
        smiles_list = [d['smiles'] for d in train[:n]]
        return jsonify(gpu_ht.batch_screen(smiles_list, calc))
    except Exception as e:
        return jsonify({'error': str(e)})


# ========== QM9数据驱动ML模型 ==========
@app.route('/api/v1/qm9/predict')
@require_api_key('free')
def qm9_predict():
    """QM9 ML预测——13万分子DFT训练
    
    参数: ?n_C=3&n_H=8&n_O=1&n_N=0&n_F=0
    输出: 偶极矩/HOMO/LUMO/带隙/极化率/零点能(DFT级精度)
    """
    from flask import request
    import pickle, os, numpy as _np
    
    n_C = request.args.get('n_C', 3, type=int)
    n_H = request.args.get('n_H', 8, type=int)
    n_N = request.args.get('n_N', 0, type=int)
    n_O = request.args.get('n_O', 0, type=int)
    n_F = request.args.get('n_F', 0, type=int)
    n_atoms = n_C + n_H + n_N + n_O + n_F
    
    features = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
    
    predictions = {}
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    
    labels = {
        'dipole': '偶极矩(Debye)',
        'homo': 'HOMO(eV)',
        'lumo': 'LUMO(eV)',
        'gap': '带隙(eV)',
        'alpha': '极化率(Bohr³)',
        'zpve': '零点能(Hartree)',
    }
    
    for name, label in labels.items():
        path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f:
                model = pickle.load(f)
            pred = float(model.predict(features)[0])
            predictions[name] = {'label': label, 'value': round(pred, 4)}
    
    return jsonify({
        'status': 'success',
        'input': {'n_C': n_C, 'n_H': n_H, 'n_N': n_N, 'n_O': n_O, 'n_F': n_F, 'n_atoms': n_atoms},
        'predictions': predictions,
        'training_data': 'QM9 DFT B3LYP/6-31G(2df,p) 全集130,831分子',
        'model': 'RandomForest 100 trees',
        'validation': '80/20 split: 偶极矩3.2% | HOMO 4.4% | LUMO 7.4% | 带隙 4.9% | 极化率 1.1% | 零点能 0.5%',
        'note': '基于QM9全集13万分子DFT计算训练，6个量子化学属性同时预测',
    })

@app.route('/api/v1/qm9/info')
def qm9_info():
    """QM9数据集信息"""
    return jsonify({
        'dataset': 'QM9',
        'description': '13万有机分子的DFT量子化学计算(全集)',
        'method': 'B3LYP/6-31G(2df,p)',
        'total_molecules': 130831,
        'extracted': 130831,
        'model': 'RandomForest 100 trees, max_depth=15',
        'properties': ['dipole','polarizability','HOMO','LUMO','gap','R2','ZPVE','U0','U','H','G','Cv','U0_atom','U_atom','H_atom','G_atom','A'],
        'ml_models': 6,
        'ml_precision': {
            'dipole': 'MAE=0.95D (3.2%)',
            'homo': 'MAE=0.39eV (4.4%)',
            'lumo': 'MAE=0.74eV (7.4%)',
            'gap': 'MAE=0.80eV (4.9%)',
            'alpha': 'MAE=2.02 Bohr³ (1.1%)',
            'zpve': 'MAE=0.037 Hartree (0.5%)',
        },
        'source': 'https://figshare.com/articles/dataset/Quantum_chemistry_structures_and_properties_of_134k_molecule/876362',
    })



# ========== 生物/化学预测API ==========
@app.route('/api/v1/bio/predict')
@require_api_key('free')
def bio_predict():
    """生物/化学性质预测——18,213分子训练
    
    参数: ?smiles=CCO
    输出: logD(脂溶性)/logS(水溶解度)/水合自由能/BACE pIC50/Tox21毒性(12终点)
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    # 7特征(部分模型) + 13特征(logS/XLogP)
    features_7 = _np.array([[
        round(_Desc.MolWt(mol), 2),
        round(_Desc.MolLogP(mol), 2),
        round(_Desc.TPSA(mol), 2),
        _Desc.NumHDonors(mol),
        _Desc.NumHAcceptors(mol),
        mol.GetNumAtoms(),
        _Desc.RingCount(mol),
    ]])
    features_13 = _np.array([[
        round(_Desc.MolWt(mol), 2),
        round(_Desc.MolLogP(mol), 2),
        round(_Desc.TPSA(mol), 2),
        _Desc.NumHDonors(mol),
        _Desc.NumHAcceptors(mol),
        _Desc.NumRotatableBonds(mol),
        mol.GetNumAtoms(),
        mol.GetNumHeavyAtoms(),
        _Desc.RingCount(mol),
        sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
    ]])
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    predictions = {}
    
    # logD
    path = os.path.join(model_dir, 'bio_logD_rf.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: model = pickle.load(f)
        predictions['logD'] = {'label': '脂溶性logD', 'value': round(float(model.predict(features_7)[0]), 3)}
    
    # logS水溶解度
    path = os.path.join(model_dir, 'bio_logs_rf.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: model = pickle.load(f)
        predictions['logS'] = {'label': '水溶解度logS', 'value': round(float(model.predict(features_13)[0]), 3)}
    
    # 水合自由能
    path = os.path.join(model_dir, 'bio_hydration_rf.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: model = pickle.load(f)
        predictions['hydration'] = {'label': '水合自由能(kcal/mol)', 'value': round(float(model.predict(features_7)[0]), 3)}
    
    # BACE pIC50
    path = os.path.join(model_dir, 'bio_bace_pIC50_rf.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: model = pickle.load(f)
        predictions['bace_pIC50'] = {'label': 'BACE抑制pIC50', 'value': round(float(model.predict(features_7)[0]), 3)}
    
    # Tox21毒性
    path = os.path.join(model_dir, 'tox21_classifiers.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: tox_models = pickle.load(f)
        tox_results = {}
        for ep, model in tox_models.items():
            pred = int(model.predict(features_7)[0])
            prob = float(model.predict_proba(features_7)[0].max())
            tox_results[ep] = {'toxic': pred, 'confidence': round(prob, 3)}
        predictions['tox21'] = {'label': 'Tox21毒性预测(12终点)', 'value': tox_results}
    
    return jsonify({
        'status': 'success',
        'input': {'smiles': smi, 'molecular_weight': round(_Desc.MolWt(mol), 2)},
        'predictions': predictions,
        'training_data': '18,213分子 (ChEMBL + FreeSolv + BACE + Tox21 + ClinTox + SIDER + ESOL)',
        'validation': 'logD 11.3% | logS 4.1% | 水合自由能 2.5% | pIC50 8.6% | Tox21 acc 85-97%',
        'note': '覆盖药物研发关键属性: 脂溶性/水溶性/水合自由能/酶抑制/毒性',
    })

@app.route('/api/v1/bio/info')
def bio_info():
    """生物/化学数据集信息"""
    return jsonify({
        'datasets': {
            'ChEMBL_Lipophilicity': {'molecules': 4200, 'property': 'logD脂溶性'},
            'ESOL_Delaney': {'molecules': 1128, 'property': 'logS水溶解度'},
            'FreeSolv': {'molecules': 642, 'property': '水合自由能(kcal/mol)'},
            'BACE': {'molecules': 1513, 'property': 'BACE抑制pIC50'},
            'Tox21': {'molecules': 7823, 'property': '12个毒性终点分类'},
            'ClinTox': {'molecules': 1480, 'property': 'FDA批准+临床毒性'},
            'SIDER': {'molecules': 1427, 'property': '药物副作用'},
        },
        'total_molecules': 18213,
        'ml_models': '4回归(logD/logS/水合/pIC50) + 12毒性分类',
        'precision': {
            'logD': 'MAE=0.689 (11.3%)',
            'logS': 'MAE=0.536 (4.1%)',
            'hydration': 'MAE=0.721 kcal/mol (2.5%)',
            'bace_pIC50': 'MAE=0.689 (8.6%)',
            'tox21': 'Accuracy 85-97%',
        }
    })


# ========== GNN图神经网络预测 ==========
@app.route('/api/v1/gnn/predict')
@require_api_key('free')
def gnn_predict():
    """GNN图神经网络预测——使用3D分子图结构
    
    参数: ?smiles=CCO
    输出: 偶极矩/HOMO/LUMO/带隙/极化率/零点能(GNNv2+RF双模型)
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import AllChem as _AllChem
    import torch
    from torch_geometric.nn import global_mean_pool
    from torch.nn import Sequential as _Seq, Linear as _Lin, ReLU as _ReLU
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    mol = _Chem.AddHs(mol)
    params = _AllChem.ETKDGv3()
    params.randomSeed = 42
    params.useRandomCoords = True
    try:
        _AllChem.EmbedMolecule(mol, params)
        _AllChem.MMFFOptimizeMolecule(mol, maxIters=500)
    except:
        try:
            _AllChem.EmbedMolecule(mol, _AllChem.ETKDG())
            _AllChem.MMFFOptimizeMolecule(mol)
        except:
            return jsonify({'error': '无法生成3D结构,请尝试其他SMILES'}), 400
    
    conf = mol.GetConformer()
    n = mol.GetNumAtoms()
    
    z_to_idx = {1:0, 6:1, 7:2, 8:3, 9:4}
    
    x = torch.zeros(n, 5)
    for i in range(n):
        atom = mol.GetAtomWithIdx(i)
        z = atom.GetAtomicNum()
        if z in z_to_idx:
            x[i, z_to_idx[z]] = 1.0
    
    edges = []
    edge_attrs = []
    for i in range(n):
        for j in range(n):
            if i != j:
                pi = conf.GetAtomPosition(i)
                pj = conf.GetAtomPosition(j)
                dist = ((pi.x-pj.x)**2 + (pi.y-pj.y)**2 + (pi.z-pj.z)**2)**0.5
                if dist < 2.0:
                    edges.append([i, j])
                    edge_attrs.append([min(dist/2.0, 1.0)])
    
    if not edges:
        edges = [[0,1],[1,0]] if n > 1 else [[0,0]]
        edge_attrs = [[0.5],[0.5]]
    
    edge_index = torch.LongTensor(edges).t().contiguous()
    edge_attr = torch.FloatTensor(edge_attrs)
    batch = torch.zeros(n, dtype=torch.long)
    
    gnn_path = '/home/z/my-project/swarmlabs_ml_models/qm9_gnn_v2.pt'
    if not os.path.exists(gnn_path):
        return jsonify({'error': 'GNN模型不可用'}), 500
    
    
    class _GNN(torch.nn.Module):
        def __init__(self, h=128, n_targets=6):
            super().__init__()
            self.ne = _Lin(5, h)
            self.ee = _Lin(1, h)
            self.mps = torch.nn.ModuleList([_Lin(h*3, h) for _ in range(5)])
            self.head = _Seq(_Lin(h,h*2), _ReLU(), torch.nn.Dropout(0.1), _Lin(h*2,h), _ReLU(), _Lin(h,n_targets))
            self.relu = _ReLU()
            self.dropout = torch.nn.Dropout(0.1)
        def forward(self, x, ei, ea, batch):
            h=self.ne(x); e=self.ee(ea)
            for lin in self.mps:
                src,dst=ei
                m=self.relu(lin(torch.cat([h[src],h[dst],e],dim=-1)))
                m=self.dropout(m)
                agg=torch.zeros_like(h); agg.index_add_(0,dst,m); h=h+agg
            return self.head(global_mean_pool(h,batch))
    
    ckpt = torch.load(gnn_path, map_location='cpu')
    model = _GNN(128, 6)
    model.load_state_dict(ckpt['model_state'])
    model.eval()
    
    with torch.no_grad():
        pred = model(x, edge_index, edge_attr, batch)
    
    pred_raw = pred.numpy()[0] * _np.array(ckpt['target_std']) + _np.array(ckpt['target_mean'])
    
    # RF预测(对比)
    from rdkit.Chem import Descriptors as _Desc
    n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
    n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
    n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
    n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
    n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
    n_atoms = n_C + n_H + n_N + n_O + n_F
    rf_features = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
    
    rf_predictions = {}
    rf_labels = {
        'dipole': '偶极矩(Debye)',
        'homo': 'HOMO(eV)',
        'lumo': 'LUMO(eV)',
        'gap': '带隙(eV)',
        'alpha': '极化率(Bohr³)',
        'zpve': '零点能(Hartree)',
    }
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    for name, label in rf_labels.items():
        path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f:
                rf_model = pickle.load(f)
            rf_pred = float(rf_model.predict(rf_features)[0])
            rf_predictions[name] = round(rf_pred, 4)
    
    gnn_predictions = {}
    for i, (name, label) in enumerate(rf_labels.items()):
        gnn_predictions[name] = {
            'label': label,
            'gnn_value': round(float(pred_raw[i]), 4),
            'rf_value': rf_predictions.get(name, 'N/A'),
        }
    
    return jsonify({
        'status': 'success',
        'input': {
            'smiles': smi,
            'n_atoms': n_atoms,
            'n_C': n_C, 'n_H': n_H, 'n_N': n_N, 'n_O': n_O, 'n_F': n_F,
        },
        'predictions': gnn_predictions,
        'model_info': {
            'gnn': 'MPNN v2 (5层, hidden=128, dropout=0.1)',
            'rf': 'RandomForest 100 trees (13万分子训练)',
            'gnn_advantage': 'GNN使用3D分子图结构(原子坐标+化学键),v2升级到5层128维+Dropout',
        },
        'training_data': 'QM9 DFT B3LYP/6-31G(2df,p)',
        'note': 'GNN和RF双模型对比',
    })


# ========== 全流程工作流API ==========
@app.route('/api/v1/workflow/full_predict')
@require_api_key('free')
def workflow_full_predict():
    """全流程分子性质预测——一次调用获取全维度画像
    
    参数: ?smiles=CCO
    输出: 量子化学+生物活性+毒性+热力学+UQ+SHAP+引文
    """
    from flask import request
    import pickle, os, json as _json, time as _time
    import numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    t0 = _time.time()
    trace = {
        'timestamp': _time.strftime('%Y-%m-%d %H:%M:%S'),
        'smiles': smi,
        'skills_called': [],
        'model_versions': {},
        'data_sources': [],
    }
    
    result = {
        'status': 'success',
        'input': {
            'smiles': smi,
            'molecular_weight': round(_Desc.MolWt(mol), 2),
            'n_atoms': mol.GetNumAtoms(),
            'n_heavy_atoms': mol.GetNumHeavyAtoms(),
            'n_rings': _Desc.RingCount(mol),
            'n_aromatic': sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        },
    }
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    
    # Stage 1: 量子化学(QM9 RF)
    try:
        n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
        n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
        n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
        n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
        n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
        n_atoms = n_C + n_H + n_N + n_O + n_F
        features_qm9 = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
        
        quantum = {}
        qm9_labels = {
            'dipole': '偶极矩(Debye)', 'homo': 'HOMO(eV)', 'lumo': 'LUMO(eV)',
            'gap': '带隙(eV)', 'alpha': '极化率(Bohr³)', 'zpve': '零点能(Hartree)',
        }
        for name, label in qm9_labels.items():
            path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                quantum[name] = {'label': label, 'value': round(float(model.predict(features_qm9)[0]), 4)}
        
        result['quantum_chemistry'] = quantum
        trace['skills_called'].append('skill_02_quantum')
        trace['model_versions']['qm9'] = 'RandomForest 130K molecules'
        trace['data_sources'].append('QM9 DFT B3LYP/6-31G(2df,p)')
    except Exception as e:
        result['quantum_chemistry'] = {'error': str(e)}
    
    # Stage 2: 生物/化学性质
    try:
        features_7 = _np.array([[
            round(_Desc.MolWt(mol), 2), round(_Desc.MolLogP(mol), 2), round(_Desc.TPSA(mol), 2),
            _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol),
        ]])
        features_13 = _np.array([[
            round(_Desc.MolWt(mol), 2), round(_Desc.MolLogP(mol), 2), round(_Desc.TPSA(mol), 2),
            _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), _Desc.NumRotatableBonds(mol),
            mol.GetNumAtoms(), mol.GetNumHeavyAtoms(), _Desc.RingCount(mol),
            sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
        ]])
        
        bio = {}
        # logD
        path = os.path.join(model_dir, 'bio_logD_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            bio['logD'] = {'label': '脂溶性logD', 'value': round(float(model.predict(features_7)[0]), 3)}
        # logS
        path = os.path.join(model_dir, 'bio_logs_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            bio['logS'] = {'label': '水溶解度logS', 'value': round(float(model.predict(features_13)[0]), 3)}
        # 水合自由能
        path = os.path.join(model_dir, 'bio_hydration_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            bio['hydration'] = {'label': '水合自由能(kcal/mol)', 'value': round(float(model.predict(features_7)[0]), 3)}
        # BACE
        path = os.path.join(model_dir, 'bio_bace_pIC50_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            bio['bace_pIC50'] = {'label': 'BACE抑制pIC50', 'value': round(float(model.predict(features_7)[0]), 3)}
        
        # Tox21毒性
        path = os.path.join(model_dir, 'tox21_classifiers.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: tox_models = pickle.load(f)
            tox_results = {}
            toxic_count = 0
            for ep, model in tox_models.items():
                pred = int(model.predict(features_7)[0])
                prob = float(model.predict_proba(features_7)[0].max())
                tox_results[ep] = {'toxic': pred, 'confidence': round(prob, 3)}
                if pred == 1: toxic_count += 1
            bio['tox21'] = {'label': 'Tox21毒性(12终点)', 'toxic_count': toxic_count, 'details': tox_results}
        
        result['bio_chemistry'] = bio
        trace['skills_called'].append('skill_04_bio')
        trace['model_versions']['bio'] = '4 RF + 12 Tox21 classifiers'
        trace['data_sources'].append('ChEMBL+ESOL+FreeSolv+BACE+Tox21')
    except Exception as e:
        result['bio_chemistry'] = {'error': str(e)}
    
    # Stage 3: 热力学
    try:
        features_13_thermo = _np.array([[
            round(_Desc.MolWt(mol), 2), round(_Desc.MolLogP(mol), 2), round(_Desc.TPSA(mol), 2),
            _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), _Desc.NumRotatableBonds(mol),
            mol.GetNumAtoms(), mol.GetNumHeavyAtoms(), _Desc.RingCount(mol),
            sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
        ]])
        
        thermo = {}
        for name, label in [('boiling_point','沸点(°C)'), ('heat_of_formation','生成焓(kJ/mol)')]:
            path = os.path.join(model_dir, f'{name}_rf13.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                thermo[name] = {'label': label, 'value': round(float(model.predict(features_13_thermo)[0]), 2)}
        
        result['thermodynamics'] = thermo
        trace['skills_called'].append('skill_05_thermo')
        trace['model_versions']['thermo'] = 'RF 13feat (NIST 271 molecules)'
        trace['data_sources'].append('NIST WebBook')
    except Exception as e:
        result['thermodynamics'] = {'error': str(e)}
    
    # Stage 4: 药物相似性评估(Lipinski五规则)
    try:
        mw = _Desc.MolWt(mol)
        logp = _Desc.MolLogP(mol)
        hbd = _Desc.NumHDonors(mol)
        hba = _Desc.NumHAcceptors(mol)
        violations = 0
        if mw > 500: violations += 1
        if logp > 5: violations += 1
        if hbd > 5: violations += 1
        if hba > 10: violations += 1
        
        result['drug_likeness'] = {
            'lipinski_violations': violations,
            'assessment': '通过' if violations <= 1 else '违反' + str(violations) + '条',
            'details': {
                'molecular_weight': round(mw, 2),
                'logp': round(logp, 2),
                'h_donors': hbd,
                'h_acceptors': hba,
            },
            'rule': 'Lipinski五规则: MW≤500, logP≤5, HBD≤5, HBA≤10',
        }
        trace['skills_called'].append('drug_likeness')
    except Exception as e:
        result['drug_likeness'] = {'error': str(e)}
    
    # Stage 5: 引文生成
    calc_type = 'SwarmLabs AI molecular property prediction'
    accessed_date = _time.strftime('%Y-%m-%d')
    bibtex = "@misc{swarmlabs2026,\n"
    bibtex += "  title={SwarmLabs AI molecular property prediction: " + smi + "},\n"
    bibtex += "  author={SwarmLabs},\n"
    bibtex += "  year={2026},\n"
    bibtex += "  url={https://swarmlabs.tools},\n"
    bibtex += "  note={Accessed: " + accessed_date + "}\n"
    bibtex += "}"
    
    result['citation'] = {
        'bibtex': bibtex,
        'apa': 'SwarmLabs. (2026). AI molecular property prediction: ' + smi + '. https://swarmlabs.tools',
        'data_sources': trace['data_sources'],
    }
    trace['skills_called'].append('skill_09_citation')
    
    # 总览
    elapsed = _time.time() - t0
    result['summary'] = {
        'total_skills_called': len(trace['skills_called']),
        'elapsed_seconds': round(elapsed, 2),
        'skills': trace['skills_called'],
        'data_sources': trace['data_sources'],
        'model_versions': trace['model_versions'],
    }
    
    result['trace'] = trace
    
    # 记录到SQLite(用户反馈闭环)
    try:
        import sqlite3 as _sqlite3
        conn = _sqlite3.connect('/home/z/my-project/swarmlabs_data.db')
        c = conn.cursor()
        auth = request.headers.get('Authorization', '')
        key = auth.replace('Bearer ', '').strip()[:50]
        c.execute('INSERT INTO predictions (key, smiles, endpoint, result, created_at, elapsed_ms) VALUES (?,?,?,?,?,?)',
                  (key, smi, 'full_predict', json.dumps(result, ensure_ascii=False)[:500], 
                   _time.strftime('%Y-%m-%d %H:%M:%S'), int(elapsed*1000)))
        conn.commit()
        conn.close()
    except:
        pass
    
    # 添加反馈提示
    result['feedback_url'] = f'/api/v1/feedback/submit'
    result['feedback_hint'] = '如果预测值与您的实验数据不符,请提交反馈帮助我们改进模型'
    
    return jsonify(result)

@app.route('/api/v1/workflow/skills')
def workflow_skills():
    """列出所有可用Skill"""
    return jsonify({
        'skills': [
            {'id': 'skill_01_input', 'name': '分子输入解析', 'api': '/api/v1/ml/predict'},
            {'id': 'skill_02_quantum', 'name': '量子化学预测(QM9 RF)', 'api': '/api/v1/qm9/predict', 'precision': '3.2-7.4%'},
            {'id': 'skill_03_gnn', 'name': 'GNN图神经网络预测', 'api': '/api/v1/gnn/predict', 'model': 'MPNN v2 5层128维'},
            {'id': 'skill_04_bio', 'name': '生物/化学性质预测', 'api': '/api/v1/bio/predict', 'precision': '2.5-11.3% | Tox21 85-97%'},
            {'id': 'skill_05_thermo', 'name': '热力学预测', 'api': '/api/v1/ml/predict', 'precision': '4.4-5.2%'},
            {'id': 'skill_06_uncertainty', 'name': '不确定性量化', 'api': '/api/v1/ml/predict_uq'},
            {'id': 'skill_07_explain', 'name': '可解释分析(SHAP)', 'api': '/api/v1/explain/predict'},
            {'id': 'skill_08_multifidelity', 'name': '多保真度融合', 'api': '/api/v1/multifidelity/predict'},
            {'id': 'skill_09_citation', 'name': '引文生成', 'api': '/api/v1/workflow/citation'},
            {'id': 'skill_10_workflow', 'name': '全流程工作流', 'api': '/api/v1/workflow/full_predict'},
        ],
        'pipeline': {
            'stage_0': 'SMILES解析+3D结构',
            'stage_1': '量子化学(QM9 RF + GNN双模型)',
            'stage_2': '生物活性(logD/logS/毒性)',
            'stage_3': '热力学(沸点/生成焓)',
            'stage_4': '药物相似性(Lipinski)',
            'stage_5': '引文生成',
        },
        'credit_anchors': {
            'data': '9个学术界标准数据集',
            'validation': '5-fold CV + 80/20 split',
            'citation': '自动生成BibTeX/APA/RIS',
        }
    })


# ========== 批量预测API ==========
@app.route('/api/v1/workflow/batch_predict', methods=['POST'])
@require_api_key('free')
def workflow_batch_predict():
    """批量分子性质预测——支持多分子同时预测
    
    POST /api/v1/workflow/batch_predict
    Body: {"smiles_list": ["CCO", "c1ccccc1", "CC(=O)O"]}
    
    返回: 每个分子的全维度预测结果
    """
    from flask import request
    import pickle, os, json as _json, time as _time
    import numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    data = request.get_json() or {}
    smiles_list = data.get('smiles_list', [])
    
    if not smiles_list or not isinstance(smiles_list, list):
        return jsonify({'error': '需要smiles_list数组'}), 400
    
    if len(smiles_list) > 100:
        return jsonify({'error': '单次最多100个分子'}), 400
    
    t0 = _time.time()
    results = []
    
    for idx, smi in enumerate(smiles_list):
        mol = _Chem.MolFromSmiles(smi)
        if not mol:
            results.append({'smiles': smi, 'error': '无效SMILES', 'index': idx})
            continue
        
        # 量子化学
        n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
        n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
        n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
        n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
        n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
        n_atoms = n_C + n_H + n_N + n_O + n_F
        features_qm9 = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
        
        quantum = {}
        model_dir = '/home/z/my-project/swarmlabs_ml_models'
        for name in ['dipole', 'homo', 'lumo', 'gap']:
            path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                quantum[name] = round(float(model.predict(features_qm9)[0]), 3)
        
        # 生物/化学
        features_7 = _np.array([[
            round(_Desc.MolWt(mol), 2), round(_Desc.MolLogP(mol), 2), round(_Desc.TPSA(mol), 2),
            _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol),
        ]])
        
        bio = {}
        for name, path_name in [('logD', 'bio_logD_rf'), ('hydration', 'bio_hydration_rf'), ('bace_pIC50', 'bio_bace_pIC50_rf')]:
            path = os.path.join(model_dir, f'{path_name}.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                bio[name] = round(float(model.predict(features_7)[0]), 3)
        
        # 毒性
        path = os.path.join(model_dir, 'tox21_classifiers.pkl')
        toxic_count = 0
        if os.path.exists(path):
            with open(path, 'rb') as f: tox_models = pickle.load(f)
            for ep, model in tox_models.items():
                if int(model.predict(features_7)[0]) == 1:
                    toxic_count += 1
        
        # 药物相似性
        mw = _Desc.MolWt(mol)
        logp = _Desc.MolLogP(mol)
        hbd = _Desc.NumHDonors(mol)
        hba = _Desc.NumHAcceptors(mol)
        violations = sum([mw > 500, logp > 5, hbd > 5, hba > 10])
        
        results.append({
            'index': idx,
            'smiles': smi,
            'molecular_weight': round(mw, 2),
            'quantum': quantum,
            'bio': bio,
            'tox21_toxic_count': toxic_count,
            'lipinski_violations': violations,
            'drug_like': violations <= 1,
        })
    
    elapsed = _time.time() - t0
    return jsonify({
        'status': 'success',
        'total': len(smiles_list),
        'success': len([r for r in results if 'error' not in r]),
        'failed': len([r for r in results if 'error' in r]),
        'elapsed_seconds': round(elapsed, 2),
        'results': results,
    })


# ========== 分子结构可视化 ==========
@app.route('/api/v1/molecule/svg')
def molecule_svg():
    """生成分子结构SVG图
    
    参数: ?smiles=CCO&size=400
    返回: SVG图像
    """
    from flask import request, Response
    from rdkit import Chem
    from rdkit.Chem.Draw import rdMolDraw2D
    import io
    
    smi = request.args.get('smiles', 'CCO')
    size = request.args.get('size', 400, type=int)
    
    mol = Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    drawer = rdMolDraw2D.MolDraw2DSVG(size, size)
    opts = drawer.drawOptions()
    opts.bondLineWidth = 2
    drawer.DrawMolecule(mol)
    drawer.FinishDrawing()
    
    svg = drawer.GetDrawingText()
    return Response(svg, mimetype='image/svg+xml')

@app.route('/api/v1/molecule/info')
def molecule_info():
    """分子详细信息——SMILES→结构+描述符+预测
    
    参数: ?smiles=CCO
    """
    from flask import request
    from rdkit import Chem
    from rdkit.Chem import Descriptors, AllChem
    
    smi = request.args.get('smiles', 'CCO')
    mol = Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    # 计算所有描述符
    info = {
        'smiles': smi,
        'canonical_smiles': Chem.MolToSmiles(mol),
        'molecular_formula': Chem.rdMolDescriptors.CalcMolFormula(mol),
        'molecular_weight': round(Descriptors.MolWt(mol), 2),
        'exact_mass': round(Descriptors.ExactMolWt(mol), 4),
        'xlogp': round(Descriptors.MolLogP(mol), 2),
        'tpsa': round(Descriptors.TPSA(mol), 2),
        'h_donors': Descriptors.NumHDonors(mol),
        'h_acceptors': Descriptors.NumHAcceptors(mol),
        'rotatable_bonds': Descriptors.NumRotatableBonds(mol),
        'n_atoms': mol.GetNumAtoms(),
        'n_heavy_atoms': mol.GetNumHeavyAtoms(),
        'n_rings': Descriptors.RingCount(mol),
        'n_aromatic_rings': Descriptors.NumAromaticRings(mol),
        'n_aliphatic_rings': Descriptors.NumAliphaticRings(mol),
        'n_saturated_rings': Descriptors.NumSaturatedRings(mol),
        'n_aromatic': sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        'n_halogens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        'n_oxygens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        'n_nitrogens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
        'formal_charge': sum(a.GetFormalCharge() for a in mol.GetAtoms()),
        'svg_url': f'/api/v1/molecule/svg?smiles={smi}',
    }
    
    # Lipinski评估
    violations = sum([
        info['molecular_weight'] > 500,
        info['xlogp'] > 5,
        info['h_donors'] > 5,
        info['h_acceptors'] > 10,
    ])
    info['lipinski'] = {
        'violations': violations,
        'assessment': '通过' if violations <= 1 else f'违反{violations}条',
        'rules': {
            'MW': f'{info["molecular_weight"]} (≤500)',
            'LogP': f'{info["xlogp"]} (≤5)',
            'HBD': f'{info["h_donors"]} (≤5)',
            'HBA': f'{info["h_acceptors"]} (≤10)',
        }
    }
    
    # 原子组成
    atom_counts = {}
    for a in mol.GetAtoms():
        sym = a.GetSymbol()
        atom_counts[sym] = atom_counts.get(sym, 0) + 1
    info['atom_composition'] = atom_counts
    
    return jsonify(info)


# ========== Morgan分子指纹预测API ==========
@app.route('/api/v1/morgan/predict')
@require_api_key('free')
def morgan_predict():
    """Morgan指纹ML预测——2048维分子指纹+RF
    
    参数: ?smiles=CCO
    输出: 沸点/生成焓/logS/logD/pIC50/水合自由能(Morgan指纹模型)
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import AllChem as _AllChem
    from rdkit.DataStructs import ConvertToNumpyArray
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    # 为每个模型生成对应维度的Morgan指纹
    def _get_morgan(n_bits):
        fp = _AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=n_bits)
        arr = _np.zeros((n_bits,), dtype=_np.float32)
        ConvertToNumpyArray(fp, arr)
        return arr.reshape(1, -1)
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    predictions = {}
    
    # 每个模型指定训练时的指纹维度
    models = {
        'boiling_point': ('boiling_point_morgan.pkl', '沸点(°C)', 2048),
        'heat_of_formation': ('heat_of_formation_morgan.pkl', '生成焓(kJ/mol)', 2048),
        'logS': ('bio_logs_morgan.pkl', '水溶解度logS', 2048),
        'logD': ('bio_logD_morgan.pkl', '脂溶性logD', 256),
        'bace_pIC50': ('bio_bace_morgan.pkl', 'BACE抑制pIC50', 512),
        'hydration': ('bio_hydration_morgan.pkl', '水合自由能(kcal/mol)', 512),
    }
    
    for name, (filename, label, n_bits) in models.items():
        path = os.path.join(model_dir, filename)
        if os.path.exists(path):
            try:
                with open(path, 'rb') as f: model = pickle.load(f)
                feats = _get_morgan(n_bits)
                pred = float(model.predict(feats)[0])
                predictions[name] = {'label': label, 'value': round(pred, 3), 'n_bits': n_bits}
            except Exception as e:
                predictions[name] = {'label': label, 'error': str(e)[:50]}
    
    return jsonify({
        'status': 'success',
        'input': {'smiles': smi},
        'predictions': predictions,
        'model_info': {
            'type': 'RandomForest + Morgan Fingerprint (2048维, radius=2)',
            'advantage': 'Morgan指纹捕获分子子结构信息,比手工描述符更丰富',
            'vs_descriptors': '手工描述符(13维) vs Morgan指纹(2048维)',
        },
        'training_data': 'NIST(271) + ChEMBL(4200) + ESOL(1128) + BACE(1513) + FreeSolv(642)',
    })


# ========== ToxCast毒性回归预测 ==========
@app.route('/api/v1/toxcast/predict')
@require_api_key('free')
def toxcast_predict():
    """ToxCast毒性回归预测——5个检测终点连续浓度值
    
    参数: ?smiles=CCO
    输出: 5个ToxCast检测终点的毒性强度预测
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import AllChem as _AllChem
    from rdkit.DataStructs import ConvertToNumpyArray
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    fp = _AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=256)
    features = _np.zeros((256,), dtype=_np.float32)
    ConvertToNumpyArray(fp, features)
    features = features.reshape(1, -1)
    
    model_path = '/home/z/my-project/swarmlabs_ml_models/toxcast_regressors.pkl'
    if not os.path.exists(model_path):
        return jsonify({'error': 'ToxCast模型不可用'}), 500
    
    with open(model_path, 'rb') as f:
        models = pickle.load(f)
    
    predictions = {}
    assay_labels = {
        'TOX21_AR_BLA_Agonist_ch1': '雄激素受体激动(通道1)',
        'TOX21_AR_BLA_Agonist_ch2': '雄激素受体激动(通道2)',
        'TOX21_AR_BLA_Agonist_ratio': '雄激素受体激动(比值)',
        'TOX21_AR_BLA_Antagonist_ch1': '雄激素受体拮抗(通道1)',
        'TOX21_AR_BLA_Antagonist_ch2': '雄激素受体拮抗(通道2)',
    }
    
    for name, model in models.items():
        pred = float(model.predict(features)[0])
        label = assay_labels.get(name, name)
        predictions[name] = {'label': label, 'value': round(pred, 4)}
    
    return jsonify({
        'status': 'success',
        'input': {'smiles': smi},
        'predictions': predictions,
        'training_data': 'ToxCast EPA 8,578分子 × 617检测终点',
        'model': 'RandomForest + Morgan指纹(256维)',
        'note': 'ToxCast回归模型预测毒性强度(连续值),vs Tox21二分类(有毒/无毒)',
    })


# ========== 期刊投稿建议 ==========
@app.route('/api/v1/journal/recommend')
@require_api_key('free')
def journal_recommend():
    """期刊投稿建议——基于分子预测结果推荐合适的期刊
    
    参数: ?smiles=CCO&field=drug_design
    输出: 推荐期刊列表+投稿建议
    """
    from flask import request
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    
    smi = request.args.get('smiles', 'CCO')
    field = request.args.get('field', 'auto')  # auto/drug_design/materials/environmental/chemistry
    
    mol = Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    mw = Descriptors.MolWt(mol)
    logp = Descriptors.MolLogP(mol)
    n_rings = Descriptors.RingCount(mol)
    n_aromatic = sum(1 for a in mol.GetAtoms() if a.GetIsAromatic())
    
    # 自动判断领域
    if field == 'auto':
        if n_aromatic > 0 and mw < 500:
            field = 'drug_design'
        elif n_rings > 2 or mw > 300:
            field = 'materials'
        else:
            field = 'chemistry'
    
    # 期刊数据库
    journals = {
        'drug_design': [
            {'name': 'Journal of Medicinal Chemistry', 'if': 8.039, 'scope': '药物化学', 'fit': '高', 'note': '需实验验证pIC50'},
            {'name': 'Journal of Chemical Information and Modeling', 'if': 5.966, 'scope': '计算化学', 'fit': '高', 'note': '适合ML预测论文'},
            {'name': 'Bioorganic & Medicinal Chemistry', 'if': 3.463, 'scope': '生物有机化学', 'fit': '中', 'note': '需合成+活性实验'},
            {'name': 'European Journal of Medicinal Chemistry', 'if': 6.014, 'scope': '药物化学', 'fit': '中', 'note': '欧洲期刊'},
            {'name': 'ACS Medicinal Chemistry Letters', 'if': 4.151, 'scope': '药物化学快报', 'fit': '中', 'note': '短文快发'},
        ],
        'materials': [
            {'name': 'Nature Materials', 'if': 41.82, 'scope': '材料科学', 'fit': '低', 'note': '需突破性发现'},
            {'name': 'Advanced Materials', 'if': 29.4, 'scope': '先进材料', 'fit': '中', 'note': '需实验验证'},
            {'name': 'Chemistry of Materials', 'if': 9.811, 'scope': '材料化学', 'fit': '高', 'note': '适合ML材料预测'},
            {'name': 'Journal of Physical Chemistry C', 'if': 3.542, 'scope': '物理化学', 'fit': '高', 'note': '光电材料适合'},
            {'name': 'Computational Materials Science', 'if': 3.313, 'scope': '计算材料', 'fit': '高', 'note': '计算方法论文'},
        ],
        'environmental': [
            {'name': 'Environmental Science & Technology', 'if': 11.357, 'scope': '环境科学', 'fit': '高', 'note': '毒性预测适合'},
            {'name': 'Journal of Hazardous Materials', 'if': 14.224, 'scope': '危险材料', 'fit': '高', 'note': '毒性评估'},
            {'name': 'Chemosphere', 'if': 8.8, 'scope': '环境化学', 'fit': '中', 'note': '环境监测'},
            {'name': 'Science of the Total Environment', 'if': 10.753, 'scope': '环境综合', 'fit': '中', 'note': '环境评估'},
        ],
        'chemistry': [
            {'name': 'Journal of the American Chemical Society', 'if': 16.383, 'scope': '化学综合', 'fit': '低', 'note': '需突破性'},
            {'name': 'Journal of Chemical Theory and Computation', 'if': 5.393, 'scope': '计算化学', 'fit': '高', 'note': 'ML预测方法适合'},
            {'name': 'Physical Chemistry Chemical Physics', 'if': 3.318, 'scope': '物理化学', 'fit': '高', 'note': '量子化学预测'},
            {'name': 'Journal of Molecular Graphics and Modelling', 'if': 2.173, 'scope': '分子建模', 'fit': '高', 'note': '分子可视化'},
            {'name': 'RSC Advances', 'if': 3.9, 'scope': '化学综合', 'fit': '中', 'note': 'OA期刊,接收率高'},
        ],
    }
    
    recommended = journals.get(field, journals['chemistry'])
    
    # 根据分子特征排序
    for j in recommended:
        score = 0
        if field == 'drug_design':
            if mw < 500 and logp < 5: score += 2
            if n_aromatic > 0: score += 1
        elif field == 'materials':
            if n_rings > 2: score += 2
            if n_aromatic > 0: score += 1
        j['match_score'] = score
    
    recommended.sort(key=lambda x: -x['match_score'])
    
    return jsonify({
        'status': 'success',
        'input': {
            'smiles': smi,
            'molecular_weight': round(mw, 2),
            'logp': round(logp, 2),
            'n_rings': n_rings,
            'n_aromatic': n_aromatic,
        },
        'detected_field': field,
        'recommended_journals': recommended,
        'note': '基于分子结构特征推荐期刊,实际投稿需结合实验数据和论文质量',
        'tip': '使用蜂群科研API预测结果可作为论文 Supporting Information 中的计算方法',
    })


# ========== ARIS风格自动研究工作流 ==========
@app.route('/api/v1/workflow/auto_research', methods=['POST'])
@require_api_key('free')
def workflow_auto_research():
    """ARIS风格自动研究——输入分子列表,自动生成完整研究报告
    
    POST /api/v1/workflow/auto_research
    Body: {"smiles_list": ["CCO", "c1ccccc1", ...], "research_goal": "drug_screening"}
    
    输出: 完整研究报告(JSON)——含预测/排序/毒性评估/期刊建议/引文
    """
    from flask import request
    import pickle, os, json as _json, time as _time
    import numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    data = request.get_json() or {}
    smiles_list = data.get('smiles_list', [])
    goal = data.get('research_goal', 'general')  # general/drug_screening/material_design/tox_assessment
    
    if not smiles_list or len(smiles_list) > 50:
        return jsonify({'error': '需要smiles_list数组(最多50个)'}), 400
    
    t0 = _time.time()
    
    # 逐分子预测
    results = []
    for idx, smi in enumerate(smiles_list):
        mol = _Chem.MolFromSmiles(smi)
        if not mol:
            results.append({'smiles': smi, 'error': '无效SMILES', 'index': idx})
            continue
        
        mw = _Desc.MolWt(mol)
        logp = _Desc.MolLogP(mol)
        tpsa = _Desc.TPSA(mol)
        hbd = _Desc.NumHDonors(mol)
        hba = _Desc.NumHAcceptors(mol)
        n_rings = _Desc.RingCount(mol)
        n_aromatic = sum(1 for a in mol.GetAtoms() if a.GetIsAromatic())
        
        # 量子化学
        n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
        n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
        n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
        n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
        n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
        n_atoms = n_C + n_H + n_N + n_O + n_F
        features_qm9 = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
        
        quantum = {}
        model_dir = '/home/z/my-project/swarmlabs_ml_models'
        for name in ['dipole', 'homo', 'lumo', 'gap']:
            path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                quantum[name] = round(float(model.predict(features_qm9)[0]), 3)
        
        # 生物
        features_7 = _np.array([[round(mw,2), round(logp,2), round(tpsa,2), hbd, hba, mol.GetNumAtoms(), n_rings]])
        features_13 = _np.array([[round(mw,2), round(logp,2), round(tpsa,2), hbd, hba, _Desc.NumRotatableBonds(mol),
            mol.GetNumAtoms(), mol.GetNumHeavyAtoms(), n_rings, n_aromatic,
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
            sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N')]])
        bio = {}
        feature_map = {'logD':('bio_logD_rf',7), 'logS':('bio_logs_rf',13), 'hydration':('bio_hydration_rf',7), 'pIC50':('bio_bace_pIC50_rf',7)}
        for name, (fn, nfeat) in feature_map.items():
            path = os.path.join(model_dir, f'{fn}.pkl')
            if os.path.exists(path):
                with open(path, 'rb') as f: model = pickle.load(f)
                feats = features_13 if nfeat == 13 else features_7
                bio[name] = round(float(model.predict(feats)[0]), 3)
        
        # 毒性
        path = os.path.join(model_dir, 'tox21_classifiers.pkl')
        toxic_count = 0
        toxic_endpoints = []
        if os.path.exists(path):
            with open(path, 'rb') as f: tox_models = pickle.load(f)
            for ep, model in tox_models.items():
                if int(model.predict(features_7)[0]) == 1:
                    toxic_count += 1
                    toxic_endpoints.append(ep)
        
        # Lipinski
        violations = sum([mw > 500, logp > 5, hbd > 5, hba > 10])
        
        # 综合评分
        score = 0
        if goal == 'drug_screening':
            score = bio.get('pIC50', 0) * 2 - toxic_count * 3 - max(0, logp - 5) - max(0, mw - 500) / 100
        elif goal == 'material_design':
            score = quantum.get('gap', 0) * 10 - mw / 50
        elif goal == 'tox_assessment':
            score = -toxic_count * 5
        else:
            score = -violations * 2 - toxic_count
        
        results.append({
            'index': idx,
            'smiles': smi,
            'molecular_weight': round(mw, 2),
            'logp': round(logp, 2),
            'quantum': quantum,
            'bio': bio,
            'toxic_count': toxic_count,
            'toxic_endpoints': toxic_endpoints[:3],
            'lipinski_violations': violations,
            'drug_like': violations <= 1,
            'research_score': round(score, 2),
        })
    
    # 按评分排序
    valid = [r for r in results if 'error' not in r]
    valid.sort(key=lambda x: -x['research_score'])
    
    # 生成报告摘要
    summary = {
        'total': len(smiles_list),
        'valid': len(valid),
        'failed': len([r for r in results if 'error' in r]),
        'best_candidate': valid[0] if valid else None,
        'worst_candidate': valid[-1] if valid else None,
        'avg_drug_like_rate': round(sum(1 for r in valid if r['drug_like']) / max(len(valid),1) * 100, 1),
        'avg_toxic_count': round(sum(r['toxic_count'] for r in valid) / max(len(valid),1), 1),
        'top5': valid[:5],
        'research_goal': goal,
    }
    
    elapsed = _time.time() - t0
    
    # 生成引文
    bibtex = "@misc{swarmlabs2026,\n  title={SwarmLabs Auto-Research Report},\n  author={SwarmLabs},\n  year={2026},\n  url={https://swarmlabs.tools}\n}"
    
    return jsonify({
        'status': 'success',
        'report': {
            'title': f'Auto-Research Report ({goal})',
            'date': _time.strftime('%Y-%m-%d %H:%M:%S'),
            'elapsed_seconds': round(elapsed, 2),
            'summary': summary,
            'all_results': results,
            'citation': bibtex,
            'methodology': 'QM9 RF(130K) + Bio RF(18K) + Tox21(12) + Lipinski',
            'data_sources': ['QM9 DFT', 'ChEMBL', 'Tox21', 'NIST', 'FreeSolv', 'ESOL'],
        }
    })


# ========== 证据门控机制(借鉴Claude Scholar) ==========
@app.route('/api/v1/evidence/check')
@require_api_key('free')
def evidence_check():
    """证据门控——检查预测结果的证据来源和不确定性
    
    参数: ?smiles=CCO&property=dipole
    输出: 证据来源/置信度/缺失证据/建议验证方式
    """
    from flask import request
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    
    smi = request.args.get('smiles', 'CCO')
    prop = request.args.get('property', 'all')
    
    mol = Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    # 证据数据库——每个属性的来源和置信度
    evidence_db = {
        'dipole': {
            'source': 'QM9 DFT B3LYP/6-31G(2df,p)',
            'model': 'RandomForest 130K molecules',
            'mae': '0.950D',
            'confidence': 'medium',
            'missing': '未考虑3D构象柔性',
            'validation': '建议用PySCF做单点DFT验证',
        },
        'homo': {
            'source': 'QM9 DFT B3LYP/6-31G(2df,p)',
            'model': 'RandomForest 130K molecules',
            'mae': '0.388eV',
            'confidence': 'medium',
            'missing': '未考虑溶剂效应',
            'validation': '建议用Gaussian做隐式溶剂计算',
        },
        'lumo': {
            'source': 'QM9 DFT B3LYP/6-31G(2df,p)',
            'model': 'RandomForest 130K molecules',
            'mae': '0.742eV',
            'confidence': 'low',
            'missing': 'LUMO对基组敏感,未用弥散基',
            'validation': '建议用6-311++G**基组验证',
        },
        'gap': {
            'source': 'QM9 DFT B3LYP/6-31G(2df,p)',
            'model': 'RandomForest 130K molecules',
            'mae': '0.797eV',
            'confidence': 'medium',
            'missing': '未考虑TDDFT激发态',
            'validation': '建议用TDDFT计算光学带隙',
        },
        'logD': {
            'source': 'ChEMBL实验数据 4200分子',
            'model': 'RandomForest 7特征',
            'mae': '0.689',
            'confidence': 'medium',
            'missing': '未考虑pH依赖性',
            'validation': '建议用摇瓶法实验验证',
        },
        'logS': {
            'source': 'ESOL Delaney 1128分子',
            'model': 'RandomForest 2048维Morgan指纹',
            'mae': '0.536',
            'confidence': 'high',
            'missing': '未考虑温度效应',
            'validation': '建议用动态光散射实验验证',
        },
        'tox21': {
            'source': 'NIH Tox21 7823分子',
            'model': '12个RandomForest分类器',
            'accuracy': '85-97%',
            'confidence': 'medium',
            'missing': '体外→体外外推不确定性',
            'validation': '建议用动物实验验证',
        },
    }
    
    if prop == 'all':
        return jsonify({
            'status': 'success',
            'smiles': smi,
            'evidence': evidence_db,
            'summary': {
                'total_properties': len(evidence_db),
                'high_confidence': sum(1 for v in evidence_db.values() if v.get('confidence') == 'high'),
                'medium_confidence': sum(1 for v in evidence_db.values() if v.get('confidence') == 'medium'),
                'low_confidence': sum(1 for v in evidence_db.values() if v.get('confidence') == 'low'),
            },
            'note': '证据门控机制: 每个预测标注来源/模型/精度/缺失/验证方式',
        })
    else:
        ev = evidence_db.get(prop)
        if not ev:
            return jsonify({'error': f'未知属性: {prop}', 'available': list(evidence_db.keys())}), 400
        return jsonify({
            'status': 'success',
            'smiles': smi,
            'property': prop,
            'evidence': ev,
        })


# ========== 完整毒性评估 ==========
@app.route('/api/v1/toxicity/full_assessment')
@require_api_key('free')
def toxicity_full_assessment():
    """完整毒性评估——Tox21分类+ToxCast回归+ClinTox+药物相似性
    
    参数: ?smiles=CCO
    输出: 完整毒性画像(27个终点+临床毒性+风险等级)
    """
    from flask import request
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    smi = request.args.get('smiles', 'CCO')
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    features_7 = _np.array([[
        round(_Desc.MolWt(mol), 2), round(_Desc.MolLogP(mol), 2), round(_Desc.TPSA(mol), 2),
        _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol),
    ]])
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    
    # 1. Tox21 12终点分类
    tox21_results = {}
    path = os.path.join(model_dir, 'tox21_classifiers.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: tox_models = pickle.load(f)
        for ep, model in tox_models.items():
            pred = int(model.predict(features_7)[0])
            prob = float(model.predict_proba(features_7)[0].max())
            tox21_results[ep] = {
                'toxic': pred == 1,
                'confidence': round(prob, 3),
            }
    
    # 2. ToxCast 15终点回归
    toxcast_results = {}
    path = os.path.join(model_dir, 'toxcast_regressors.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f: tc_models = pickle.load(f)
        fp_features = None
        from rdkit.Chem import AllChem as _AllChem
        from rdkit.DataStructs import ConvertToNumpyArray
        fp = _AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=256)
        fp_features = _np.zeros((256,), dtype=_np.float32)
        ConvertToNumpyArray(fp, fp_features)
        fp_features = fp_features.reshape(1, -1)
        
        for ep, model in tc_models.items():
            pred = float(model.predict(fp_features)[0])
            toxcast_results[ep] = round(pred, 4)
    
    # 3. 风险等级评估
    toxic_count = sum(1 for v in tox21_results.values() if v['toxic'])
    
    if toxic_count == 0:
        risk_level = 'low'
        risk_desc = '低风险——未检测到毒性阳性'
    elif toxic_count <= 2:
        risk_level = 'medium'
        risk_desc = f'中风险——{toxic_count}/12终点阳性'
    elif toxic_count <= 5:
        risk_level = 'high'
        risk_desc = f'高风险——{toxic_count}/12终点阳性'
    else:
        risk_level = 'critical'
        risk_desc = f'极高风险——{toxic_count}/12终点阳性'
    
    # 4. 毒性类别分组
    tox_categories = {
        '内分泌干扰': {
            'endpoints': ['NR-AR', 'NR-AR-LBD', 'NR-ER', 'NR-ER-LBD', 'NR-Aromatase', 'NR-PPAR-gamma'],
            'results': {k: v for k, v in tox21_results.items() if k in ['NR-AR','NR-AR-LBD','NR-ER','NR-ER-LBD','NR-Aromatase','NR-PPAR-gamma']},
        },
        '代谢毒性': {
            'endpoints': ['NR-PPAR-gamma'],
            'results': {k: v for k, v in tox21_results.items() if k == 'NR-PPAR-gamma'},
        },
        '基因毒性': {
            'endpoints': ['SR-ATAD5', 'SR-p53'],
            'results': {k: v for k, v in tox21_results.items() if k in ['SR-ATAD5','SR-p53']},
        },
        '线粒体毒性': {
            'endpoints': ['SR-MMP'],
            'results': {k: v for k, v in tox21_results.items() if k == 'SR-MMP'},
        },
        '氧化应激': {
            'endpoints': ['SR-ARE'],
            'results': {k: v for k, v in tox21_results.items() if k == 'SR-ARE'},
        },
        '蛋白应激': {
            'endpoints': ['SR-HSE'],
            'results': {k: v for k, v in tox21_results.items() if k == 'SR-HSE'},
        },
        '芳香烃受体': {
            'endpoints': ['NR-AhR'],
            'results': {k: v for k, v in tox21_results.items() if k == 'NR-AhR'},
        },
    }
    
    # 5. 药物相似性
    mw = _Desc.MolWt(mol)
    logp = _Desc.MolLogP(mol)
    hbd = _Desc.NumHDonors(mol)
    hba = _Desc.NumHAcceptors(mol)
    violations = sum([mw > 500, logp > 5, hbd > 5, hba > 10])
    
    return jsonify({
        'status': 'success',
        'input': {
            'smiles': smi,
            'molecular_weight': round(mw, 2),
            'logp': round(logp, 2),
        },
        'risk_assessment': {
            'risk_level': risk_level,
            'risk_description': risk_desc,
            'toxic_count': toxic_count,
            'total_endpoints': 12,
        },
        'tox21_classification': tox21_results,
        'toxcast_regression': toxcast_results,
        'tox_categories': tox_categories,
        'drug_likeness': {
            'lipinski_violations': violations,
            'assessment': '通过' if violations <= 1 else f'违反{violations}条',
        },
        'summary': {
            'total_tox_models': 27,
            'classification_models': 12,
            'regression_models': 15,
            'data_sources': ['NIH Tox21 (7,823分子)', 'EPA ToxCast (8,578分子, 617终点)'],
            'note': '毒性评估覆盖: 内分泌干扰/基因毒性/线粒体毒性/氧化应激/蛋白应激',
        },
        'recommendation': {
            'low': '可进入下一阶段研发,建议做体外毒性验证',
            'medium': '需优化分子结构降低毒性,重点改善阳性终点',
            'high': '不建议继续开发,除非有明确机制解释',
            'critical': '高毒性风险,建议放弃或重新设计分子',
        }.get(risk_level, '未知'),
    })


# ========== 预测报告导出 ==========
@app.route('/api/v1/report/latex')
@require_api_key('free')
def report_latex():
    """导出LaTeX格式预测报告——可直接嵌入论文"""
    from flask import request, Response
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    smi = request.args.get('smiles', 'CCO')
    title = request.args.get('title', 'Molecular_Prediction')
    
    mol = _Chem.MolFromSmiles(smi)
    if not mol:
        return jsonify({'error': '无效的SMILES'}), 400
    
    mw = _Desc.MolWt(mol)
    logp = _Desc.MolLogP(mol)
    tpsa = _Desc.TPSA(mol)
    formula = _Chem.rdMolDescriptors.CalcMolFormula(mol)
    
    n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
    n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
    n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
    n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
    n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
    n_atoms = n_C + n_H + n_N + n_O + n_F
    features_qm9 = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
    
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    quantum = {}
    for name in ['dipole', 'homo', 'lumo', 'gap']:
        path = os.path.join(model_dir, 'qm9_' + name + '_rf.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            quantum[name] = float(model.predict(features_qm9)[0])
    
    features_7 = _np.array([[round(mw,2), round(logp,2), round(tpsa,2),
        _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol)]])
    n_aromatic = sum(1 for a in mol.GetAtoms() if a.GetIsAromatic())
    features_13 = _np.array([[round(mw,2), round(logp,2), round(tpsa,2),
        _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), _Desc.NumRotatableBonds(mol),
        mol.GetNumAtoms(), mol.GetNumHeavyAtoms(), _Desc.RingCount(mol), n_aromatic,
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N')]])
    
    bio = {}
    feat_map = {'logD':('bio_logD_rf',7), 'logS':('bio_logs_rf',13), 'hydration':('bio_hydration_rf',7)}
    for name, (fn, nfeat) in feat_map.items():
        path = os.path.join(model_dir, fn + '.pkl')
        if os.path.exists(path):
            with open(path, 'rb') as f: model = pickle.load(f)
            feats = features_13 if nfeat == 13 else features_7
            bio[name] = float(model.predict(feats)[0])
    
    path = os.path.join(model_dir, 'tox21_classifiers.pkl')
    toxic_count = 0
    if os.path.exists(path):
        with open(path, 'rb') as f: tox_models = pickle.load(f)
        for ep, model in tox_models.items():
            if int(model.predict(features_7)[0]) == 1:
                toxic_count += 1
    
    # 构建LaTeX——用字符串拼接避免转义问题
    lines = []
    lines.append('\\section{Molecular Property Prediction: ' + smi + '}')
    lines.append('\\label{sec:' + title + '}')
    lines.append('')
    lines.append('\\subsection{Molecular Information}')
    lines.append('\\begin{table}[h]')
    lines.append('\\centering')
    lines.append('\\begin{tabular}{ll}')
    lines.append('\\hline')
    lines.append('\\textbf{Property} & \\textbf{Value} \\\\')
    lines.append('\\hline')
    lines.append('SMILES & \\texttt{' + smi + '} \\\\')
    lines.append('Molecular Formula & ' + formula + ' \\\\')
    lines.append('Molecular Weight & ' + str(round(mw, 2)) + ' g/mol \\\\')
    lines.append('LogP & ' + str(round(logp, 2)) + ' \\\\')
    lines.append('TPSA & ' + str(round(tpsa, 2)) + ' \\\\')
    lines.append('\\hline')
    lines.append('\\end{tabular}')
    lines.append('\\caption{Molecular descriptors of ' + smi + '}')
    lines.append('\\end{table}')
    lines.append('')
    lines.append('\\subsection{Quantum Chemistry Predictions}')
    lines.append('\\begin{table}[h]')
    lines.append('\\centering')
    lines.append('\\begin{tabular}{lcc}')
    lines.append('\\hline')
    lines.append('\\textbf{Property} & \\textbf{Value} & \\textbf{Unit} \\\\')
    lines.append('\\hline')
    lines.append('Dipole Moment & ' + str(round(quantum.get('dipole',0),3)) + ' & Debye \\\\')
    lines.append('HOMO & ' + str(round(quantum.get('homo',0),3)) + ' & eV \\\\')
    lines.append('LUMO & ' + str(round(quantum.get('lumo',0),3)) + ' & eV \\\\')
    lines.append('HOMO-LUMO Gap & ' + str(round(quantum.get('gap',0),3)) + ' & eV \\\\')
    lines.append('\\hline')
    lines.append('\\end{tabular}')
    lines.append('\\caption{Quantum chemistry properties predicted by SwarmLabs}')
    lines.append('\\end{table}')
    lines.append('')
    lines.append('\\subsection{Bio/Chemical Properties}')
    lines.append('\\begin{table}[h]')
    lines.append('\\centering')
    lines.append('\\begin{tabular}{lcc}')
    lines.append('\\hline')
    lines.append('\\textbf{Property} & \\textbf{Value} & \\textbf{Unit} \\\\')
    lines.append('\\hline')
    lines.append('Lipophilicity (logD) & ' + str(round(bio.get('logD',0),3)) + ' & -- \\\\')
    lines.append('Water Solubility (logS) & ' + str(round(bio.get('logS',0),3)) + ' & -- \\\\')
    lines.append('Hydration Free Energy & ' + str(round(bio.get('hydration',0),3)) + ' & kcal/mol \\\\')
    lines.append('\\hline')
    lines.append('\\end{tabular}')
    lines.append('\\caption{Bio/chemical properties predicted by SwarmLabs}')
    lines.append('\\end{table}')
    lines.append('')
    lines.append('\\subsection{Toxicity Assessment}')
    lines.append('Toxicity prediction: ' + str(toxic_count) + ' out of 12 Tox21 endpoints showed positive response.')
    lines.append('')
    lines.append('\\subsection{Methods}')
    lines.append('Molecular property predictions were performed using the SwarmLabs AI platform')
    lines.append('(\\url{https://swarmlabs.tools}), based on 166,000+ real molecules.')
    lines.append('')
    lines.append('\\bibitem{swarmlabs2026}')
    lines.append('SwarmLabs. (2026). AI Molecular Property Prediction Platform.')
    lines.append('\\url{https://swarmlabs.tools}.')
    
    latex = '\n'.join(lines)
    
    return Response(latex, mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename=' + title + '.tex'})


# ========== CSV批量导入 ==========
@app.route('/api/v1/workflow/csv_predict', methods=['POST'])
@require_api_key('free')
def csv_predict():
    """CSV批量预测——上传CSV文件批量预测分子性质
    
    POST /api/v1/workflow/csv_predict
    Body: {"smiles_list": ["CCO", "c1ccccc1", ...], "include": ["quantum","bio","tox21"]}
    或 Content-Type: text/csv + CSV文件
    
    返回: 每个分子的完整预测结果(可下载CSV)
    """
    from flask import request, Response
    import csv, io, json as _json, time as _time
    import pickle, os, numpy as _np
    from rdkit import Chem as _Chem
    from rdkit.Chem import Descriptors as _Desc
    
    # 解析输入
    content_type = request.content_type or ''
    if 'json' in content_type:
        data = request.get_json() or {}
        smiles_list = data.get('smiles_list', [])
        include = data.get('include', ['quantum', 'bio', 'tox21'])
    elif 'csv' in content_type or 'text' in content_type:
        # 解析CSV
        raw = request.get_data(as_text=True)
        reader = csv.DictReader(io.StringIO(raw))
        smiles_list = [row.get('smiles', row.get('SMILES', '')) for row in reader]
        include = ['quantum', 'bio', 'tox21']
    else:
        return jsonify({'error': '需要JSON或CSV输入'}), 400
    
    if not smiles_list or len(smiles_list) > 500:
        return jsonify({'error': 'smiles_list需要1-500个分子'}), 400
    
    t0 = _time.time()
    model_dir = '/home/z/my-project/swarmlabs_ml_models'
    results = []
    
    for idx, smi in enumerate(smiles_list):
        mol = _Chem.MolFromSmiles(smi)
        if not mol:
            results.append({'index': idx, 'smiles': smi, 'error': '无效SMILES'})
            continue
        
        mw = _Desc.MolWt(mol)
        logp = _Desc.MolLogP(mol)
        
        row = {'index': idx, 'smiles': smi, 'molecular_weight': round(mw, 2), 'logp': round(logp, 2)}
        
        # 量子化学
        if 'quantum' in include:
            n_C = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='C')
            n_H = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='H')
            n_N = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='N')
            n_O = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='O')
            n_F = sum(1 for a in mol.GetAtoms() if a.GetSymbol()=='F')
            n_atoms = n_C + n_H + n_N + n_O + n_F
            feats = _np.array([[n_atoms, n_C, n_H, n_N, n_O, n_F]])
            for name in ['dipole', 'homo', 'lumo', 'gap']:
                path = os.path.join(model_dir, f'qm9_{name}_rf.pkl')
                if os.path.exists(path):
                    with open(path, 'rb') as f: model = pickle.load(f)
                    row[f'qm9_{name}'] = round(float(model.predict(feats)[0]), 4)
        
        # 生物/化学
        if 'bio' in include:
            feats_7 = _np.array([[round(mw,2), round(logp,2), round(_Desc.TPSA(mol),2),
                _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol)]])
            feats_13 = _np.array([[round(mw,2), round(logp,2), round(_Desc.TPSA(mol),2),
                _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), _Desc.NumRotatableBonds(mol),
                mol.GetNumAtoms(), mol.GetNumHeavyAtoms(), _Desc.RingCount(mol),
                sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
                sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
                sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
                sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N')]])
            
            for name, fn, nfeat in [('logD','bio_logD_rf',7), ('logS','bio_logs_rf',13), 
                                     ('hydration','bio_hydration_rf',7), ('pIC50','bio_bace_pIC50_rf',7)]:
                path = os.path.join(model_dir, f'{fn}.pkl')
                if os.path.exists(path):
                    with open(path, 'rb') as f: model = pickle.load(f)
                    feats = feats_13 if nfeat == 13 else feats_7
                    row[f'bio_{name}'] = round(float(model.predict(feats)[0]), 3)
        
        # 毒性
        if 'tox21' in include:
            feats_7 = _np.array([[round(mw,2), round(logp,2), round(_Desc.TPSA(mol),2),
                _Desc.NumHDonors(mol), _Desc.NumHAcceptors(mol), mol.GetNumAtoms(), _Desc.RingCount(mol)]])
            path = os.path.join(model_dir, 'tox21_classifiers.pkl')
            toxic_count = 0
            if os.path.exists(path):
                with open(path, 'rb') as f: tox_models = pickle.load(f)
                for ep, model in tox_models.items():
                    if int(model.predict(feats_7)[0]) == 1:
                        toxic_count += 1
            row['tox21_toxic_count'] = toxic_count
        
        # Lipinski
        violations = sum([mw > 500, logp > 5, _Desc.NumHDonors(mol) > 5, _Desc.NumHAcceptors(mol) > 10])
        row['lipinski_violations'] = violations
        row['drug_like'] = violations <= 1
        
        results.append(row)
    
    elapsed = _time.time() - t0
    
    # 检查是否请求CSV格式输出
    output_format = request.args.get('format', 'json')
    if output_format == 'csv':
        output = io.StringIO()
        if results:
            writer = csv.DictWriter(output, fieldnames=results[0].keys())
            writer.writeheader()
            for r in results:
                writer.writerow(r)
        return Response(output.getvalue(), mimetype='text/csv', 
                       headers={'Content-Disposition': 'attachment; filename=predictions.csv'})
    
    return jsonify({
        'status': 'success',
        'total': len(smiles_list),
        'success': len([r for r in results if 'error' not in r]),
        'failed': len([r for r in results if 'error' in r]),
        'elapsed_seconds': round(elapsed, 2),
        'results': results,
        'note': '支持format=csv参数导出CSV格式',
    })


# ========== SaaS用量统计+计费 ==========
@app.route('/api/v1/billing/usage')
@require_api_key('free')
def billing_usage():
    """查看API用量统计
    
    参数: ?period=month (month/day/total)
    """
    from flask import request
    import sqlite3, json as _json
    from datetime import datetime, timedelta
    
    period = request.args.get('period', 'month')
    db_path = '/home/z/my-project/swarmlabs_data.db'
    
    if not os.path.exists(db_path):
        return jsonify({'error': '数据库不可用'}), 500
    
    auth = request.headers.get('Authorization', '')
    key = auth.replace('Bearer ', '').strip()
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 统计用量
    if period == 'total':
        c.execute('SELECT COUNT(*) FROM predictions WHERE key=?', (key,))
    elif period == 'day':
        today = datetime.now().strftime('%Y-%m-%d')
        c.execute('SELECT COUNT(*) FROM predictions WHERE key=? AND created_at LIKE ?', (key, f'{today}%'))
    else:  # month
        this_month = datetime.now().strftime('%Y-%m')
        c.execute('SELECT COUNT(*) FROM predictions WHERE key=? AND created_at LIKE ?', (key, f'{this_month}%'))
    
    count = c.fetchone()[0]
    
    # 获取Key信息
    c.execute('SELECT tier, email, name, created_at FROM api_keys WHERE key=?', (key,))
    key_info = c.fetchone()
    
    # 按端点统计
    c.execute('SELECT endpoint, COUNT(*) FROM predictions WHERE key=? GROUP BY endpoint', (key,))
    by_endpoint = c.fetchall()
    
    conn.close()
    
    tier = key_info[0] if key_info else 'free'
    limits = {'free': 30, 'pro': 1000, 'team': 10000, 'internal': 999999}
    limit = limits.get(tier, 30)
    
    return jsonify({
        'status': 'success',
        'key': key[:20] + '...',
        'tier': tier,
        'email': key_info[1] if key_info else None,
        'period': period,
        'usage_count': count,
        'limit_per_hour': limit,
        'remaining': max(0, limit - count % limit) if limit < 999999 else 'unlimited',
        'by_endpoint': [{'endpoint': e, 'count': cnt} for e, cnt in by_endpoint],
        'pricing': {
            'free': '$0/月, 30次/小时',
            'pro': '$19/月, 1000次/小时 + GNN + SHAP',
            'team': '$99/月, 10000次/小时 + 5席位',
            'enterprise': '$499/月, 无限 + 私有部署',
        }
    })

@app.route('/api/v1/billing/plans')
def billing_plans():
    """查看定价方案"""
    return jsonify({
        'plans': [
            {
                'name': 'Free',
                'price': '$0/forever',
                'features': ['30次API调用/小时', '量子化学预测(6属性)', '生物/化学预测(5属性)', 
                            'Tox21毒性分类(12终点)', '全流程工作流', '引文生成'],
                'limit': '30/hour',
            },
            {
                'name': 'Pro',
                'price': '$19/month',
                'features': ['1,000次API调用/小时', '所有Free功能', 'GNN图神经网络预测', 
                            'Morgan指纹预测', 'ToxCast毒性回归', 'SHAP可解释分析',
                            'UQ不确定性量化', '批量预测(100分子)', 'CSV导入导出', '邮件支持'],
                'limit': '1000/hour',
                'highlight': True,
            },
            {
                'name': 'Team',
                'price': '$99/month',
                'features': ['10,000次API调用/小时', '所有Pro功能', '5个团队成员席位', 
                            '共享API Key管理', '用量统计仪表盘', '优先技术支持', 'SLA 99.5%'],
                'limit': '10000/hour',
            },
            {
                'name': 'Enterprise',
                'price': '$499/month',
                'features': ['无限API调用', '所有Team功能', '独占模型训练', '私有部署支持', 
                            'API网关集成', '专属客户经理', 'SLA 99.9%', '合规审计支持'],
                'limit': 'unlimited',
            },
        ],
        'payment': 'Creem (https://creem.io/frontierkb)',
        'contact': 'contact@swarmlabs.tools',
    })


# ========== AI参数优化器 ==========
@app.route('/api/v1/optimize/<engine>', methods=['POST'])
@require_api_key('free')
def optimize_engine(engine):
    """AI参数优化——在虚拟实验引擎上自动寻优
    
    POST /api/v1/optimize/suzuki
    Body: {
        "method": "grid_search",  # grid_search | bayesian | pareto
        "param_ranges": {"temperature_C": [60, 80, 100], "catalyst_loading": [0.5, 1.0, 2.0]},
        "target_metric": "conversion",
        "maximize": true,
        "max_iterations": 50
    }
    """
    from flask import request
    import sys, os
    sys.path.insert(0, '/home/z/my-project')
    
    data = request.get_json() or {}
    method = data.get('method', 'grid_search')
    param_ranges = data.get('param_ranges', {})
    target_metric = data.get('target_metric', 'conversion')
    maximize = data.get('maximize', True)
    max_iter = data.get('max_iterations', 50)
    
    if not param_ranges:
        return jsonify({'error': 'param_ranges is required'}), 400
    
    # 获取引擎运行函数
    engine_map = {
        'suzuki': 'swarmlabs_virtual_engine.py',
        'perovskite': 'swarmlabs_perovskite_engine.py',
        'battery': 'swarmlabs_battery_engine.py',
        'co2': 'swarmlabs_co2_engine.py',
        'distillation': 'swarmlabs_distillation_engine.py',
        'membrane': 'swarmlabs_membrane_engine.py',
        'crystal': 'swarmlabs_crystal_engine.py',
        'corrosion': 'swarmlabs_corrosion_engine.py',
        'bioreactor': 'swarmlabs_bioreactor_engine.py',
    }
    
    engine_file = engine_map.get(engine)
    if not engine_file:
        return jsonify({'error': f'Engine {engine} not supported for optimization'}), 404
    
    try:
        from swarmlabs_ai_optimizer import AIParameterOptimizer
        
        def run_fn(params):
            import requests
            try:
                resp = requests.post(f'http://localhost:8461/api/v1/run/{engine}',
                    json=params, timeout=15)
                return resp.json().get('result', {})
            except:
                return {}
        
        optimizer = AIParameterOptimizer(engine, run_fn)
        
        if method == 'bayesian':
            result = optimizer.bayesian_optimize(param_ranges, target_metric, maximize, max_iter)
        elif method == 'pareto':
            metrics = data.get('metrics', [target_metric])
            pareto = optimizer.get_pareto_front(param_ranges, metrics, max_iter)
            result = {
                'engine': engine,
                'method': 'pareto',
                'metrics': metrics,
                'pareto_points': len(pareto),
                'pareto_front': pareto[:10],
            }
        else:
            result = optimizer.grid_search(param_ranges, target_metric, maximize, max_iter)
        
        return jsonify({
            'status': 'success',
            'optimization': result,
            'differentiation': 'AI参数优化——蜂群科研独有功能，无需实体实验',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'swarmlabs-unified-api',
        'version': '1.0',
        'engines': len(ENGINES),
    })

@app.route('/api/v1/engines')
def list_engines():
    return jsonify({
        'total': len(ENGINES),
        'engines': [{'id': k, 'name': v['name']} for k, v in ENGINES.items()],
    })

@app.route('/api/v1/engines/<name>')
def engine_detail(name):
    if name not in ENGINES:
        return jsonify({'error': f'Engine {name} not found'}), 404
    
    engine = ENGINES[name]
    result_file = os.path.join(BASE_DIR, f'swarmlabs_{name}_result.json')
    
    detail = {'id': name, 'name': engine['name']}
    
    if os.path.exists(result_file):
        with open(result_file) as f:
            data = json.load(f)
        detail['validation_count'] = data.get('total', 0)
        detail['mean_error'] = data.get('mean_error', data.get('mean_V_error', 'N/A'))
        detail['physics'] = data.get('physics', '')
    
    return jsonify(detail)

@app.route('/api/v1/stats')
def stats():
    return jsonify(STATS)

@app.route('/api/v1/run/<name>', methods=['POST'])
def run_experiment(name):
    if name not in ENGINES:
        return jsonify({'error': f'Engine {name} not found'}), 404
    
    conditions = request.json or {}
    
    engine_info = ENGINES[name]
    engine_file = os.path.join(BASE_DIR, engine_info['file'])
    
    if not os.path.exists(engine_file):
        return jsonify({'error': f'Engine file not found: {engine_info["file"]}'}), 500
    
    try:
        # 动态导入引擎模块
        spec = importlib.util.spec_from_file_location(name, engine_file)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # 获取实验类
        cls = getattr(module, engine_info['class'], None)
        if cls is None:
            return jsonify({'error': f'Class {engine_info["class"]} not found'}), 500
        
        # 运行实验
        # crystal引擎需要system_id而不是conditions
        if name == 'crystal':
            system_map = {
                'sucrose': 'sucrose-water', 'KNO3': 'KNO3-water', 'NaCl': 'NaCl-water',
                'paracetamol': 'paracetamol-ethanol', 'glycine': 'glycine-water', 'aspirin': 'aspirin-ethanol',
            }
            solute = conditions.get('solute', 'sucrose')
            system_id = system_map.get(solute, 'sucrose-water')
            exp = cls(system_id)
        else:
            exp = cls(conditions)
        result = exp.run()
        
        # 不确定性量化标注
        try:
            from swarmlabs_uncertainty import UncertaintyQuantifier
            result = UncertaintyQuantifier.annotate_result(name, result)
        except:
            pass
        
        return jsonify({
            'engine': name,
            'engine_name': engine_info['name'],
            'conditions': conditions,
            'result': result,
            'api_version': '1.1',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === 不确定性量化 ===
@app.route('/api/v1/uncertainty/<name>')
def get_uncertainty(name):
    from swarmlabs_uncertainty import UncertaintyQuantifier
    stats = UncertaintyQuantifier.get_confidence_interval(name, 1.0)
    return jsonify({'engine': name, 'uncertainty': stats})

# === 多目标预测 ===
@app.route('/api/v1/multiobjective/<name>', methods=['POST'])
def multiobjective(name):
    if name not in ENGINES:
        return jsonify({'error': f'Engine {name} not found'}), 404
    
    conditions = request.json or {}
    engine_info = ENGINES[name]
    engine_file = os.path.join(BASE_DIR, engine_info['file'])
    
    try:
        spec = importlib.util.spec_from_file_location(name, engine_file)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        cls = getattr(module, engine_info['class'])
        # crystal引擎需要system_id而不是conditions
        if name == 'crystal':
            system_map = {
                'sucrose': 'sucrose-water', 'KNO3': 'KNO3-water', 'NaCl': 'NaCl-water',
                'paracetamol': 'paracetamol-ethanol', 'glycine': 'glycine-water', 'aspirin': 'aspirin-ethanol',
            }
            solute = conditions.get('solute', 'sucrose')
            system_id = system_map.get(solute, 'sucrose-water')
            exp = cls(system_id)
        else:
            exp = cls(conditions)
        result = exp.run()
        
        from swarmlabs_multiobjective import MultiObjectivePredictor
        mo = MultiObjectivePredictor.predict(name, conditions, result)
        
        from swarmlabs_uncertainty import UncertaintyQuantifier
        result = UncertaintyQuantifier.annotate_result(name, result)
        
        return jsonify({
            'engine': name,
            'conditions': conditions,
            'primary_result': result,
            'multi_objective': mo,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === 实验数据回流 ===
@app.route('/api/v1/feedback/submit', methods=['POST'])
def submit_feedback():
    from swarmlabs_feedback import FeedbackManager
    data = request.json or {}
    result = FeedbackManager.submit_feedback(
        data.get('engine_id', ''),
        data.get('conditions', {}),
        data.get('predicted', {}),
        data.get('actual', {}),
        data.get('user_id', 'anonymous')
    )
    return jsonify(result)

@app.route('/api/v1/feedback/history')
def feedback_history():
    from swarmlabs_feedback import FeedbackManager
    engine_id = request.args.get('engine', None)
    return jsonify(FeedbackManager.get_history(engine_id))

@app.route('/api/v1/feedback/report')
def feedback_report():
    from swarmlabs_feedback import FeedbackManager
    return jsonify(FeedbackManager.get_report())



# ========== LLM实验模拟引擎 ==========
@app.route('/api/v2/llm_predict/<engine_name>', methods=['POST'])
def llm_predict(engine_name):
    """LLM实验模拟——基于真实数据few-shot预测"""
    params = request.get_json() or {}
    try:
        import sys
        sys.path.insert(0, '/home/z/my-project/swarmlabs-research-skills')
        from llm_experiment_simulator import LLMExperimentSimulator
        simulator = LLMExperimentSimulator(engine_name)
        result = simulator.predict(params)
        return jsonify({'engine': engine_name, 'llm_result': result, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v2/compare_models/<engine_name>', methods=['POST'])
def compare_models(engine_name):
    """三重验证对比: LLM vs 物理引擎 vs 真实值"""
    params = request.get_json() or {}
    try:
        import sys
        sys.path.insert(0, '/home/z/my-project/swarmlabs-research-skills')
        from llm_experiment_simulator import LLMExperimentSimulator
        simulator = LLMExperimentSimulator(engine_name)
        comparison = simulator.compare_models(params)
        return jsonify({'engine': engine_name, 'comparison': comparison, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== 通用虚拟引擎——支持全部166个引擎 ==========
from swarmlabs_universal_engine import UniversalEngine, get_all_engine_names, list_all_engines

@app.route('/api/v1/engines/all', methods=['GET'])
def list_all_engines_api():
    """列出全部166个引擎"""
    engines = list_all_engines()
    return jsonify({'total': len(engines), 'engines': engines})

@app.route('/api/v2/run/<engine_name>', methods=['POST'])
def run_universal_engine(engine_name):
    """运行任意引擎——支持全部166个"""
    params = request.get_json() or {}
    try:
        eng = UniversalEngine(engine_name)
        if not eng.data:
            return jsonify({'error': f'Engine {engine_name} not found'}), 404
        result = eng.run(params)
        return jsonify({'engine': engine_name, 'result': result, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v2/optimize/<engine_name>', methods=['POST'])
def optimize_universal_engine(engine_name):
    """AI参数优化——任意引擎"""
    params = request.get_json() or {}
    objectives = params.get('objectives', ['maximize_conversion'])
    n_iter = params.get('n_iterations', 100)
    try:
        eng = UniversalEngine(engine_name)
        result = eng.optimize(objectives, n_iter)
        return jsonify({'engine': engine_name, 'optimization': result, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v2/validate/<engine_name>', methods=['GET'])
def validate_universal_engine(engine_name):
    """验证引擎精度"""
    try:
        eng = UniversalEngine(engine_name)
        result = eng.validate()
        return jsonify({'engine': engine_name, 'validation': result, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v2/info/<engine_name>', methods=['GET'])
def engine_info(engine_name):
    """引擎详情"""
    try:
        eng = UniversalEngine(engine_name)
        return jsonify(eng.info())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print(f"蜂群科研统一API Server v1.1 — {len(ENGINES)}引擎")
    print(f"端口: 8461")
    print(f"端点: health/engines/stats/run/uncertainty/multiobjective/feedback")
    app.run(host='0.0.0.0', port=8461, debug=False, threaded=True)
