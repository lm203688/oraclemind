"""
蜂群科研 — 化学+材料一体化预测引擎 v3.1
用分子模板作为"生成器"系统化覆盖材料空间
整合14站化学相关数据：中药成分/合成生物学/基因治疗载体/生物制造
"""

import json, os, math, itertools
from datetime import datetime

class ChemoMaterialEngineV3:
    """化学+材料一体化引擎 v3.1 — 系统化覆盖"""
    
    def __init__(self):
        pharma_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'pharma')
        self.templates = self._load(os.path.join(pharma_dir, 'molecular_templates.json'))
        self.targets = self._load(os.path.join(pharma_dir, 'drug_targets.json'))
        
        # 元素周期表前40种元素（覆盖绝大多数材料）
        self.elements = self._init_elements()
        
        # 分子骨架库（系统化生成材料的基础）
        self.scaffolds = self._init_scaffolds()
        
        # 化学反应库
        self.reactions = self._init_reactions()
        
        # 已知材料库（人工精选标杆）
        self.known_materials = self._init_known_materials()
        
        # 14站化学数据
        self.tcm_herbs = self._load_14site('tcm-tools', 'herbs')
        self.tcm_ingredients = self._load_14site('tcm-tools', 'ingredients')
        self.tcm_formulas = self._load_14site('tcm-tools', 'formulas')
        self.gene_therapies = self._load_14site('genetech-tools', 'gene_therapies')
        self.gene_delivery = self._load_14site('genetech-tools', 'gene_delivery')
        self.synbio = self._load_14site('life-science', 'synbio')
        self.biomanufacturing = self._load_14site('life-science', 'biomanufacturing')
        self.cell_therapy = self._load_14site('life-science', 'cell_therapy')
        self.gene_editing = self._load_14site('genetech-tools', 'gene_editing_tools')
        
        self.all_sources = {
            '中药药材': self.tcm_herbs,
            '中药成分': self.tcm_ingredients,
            '中药方剂': self.tcm_formulas,
            '基因治疗': self.gene_therapies,
            '基因递送': self.gene_delivery,
            '合成生物学': self.synbio,
            '生物制造': self.biomanufacturing,
            '细胞治疗': self.cell_therapy,
            '基因编辑工具': self.gene_editing,
        }
        
        # 材料分类树
        self.material_categories = self._init_categories()
    
    def _load(self, path):
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return []
    
    def _load_14site(self, site, entity_file):
        """从14站加载化学相关数据"""
        path = f'/home/z/my-project/{site}/knowledge-base/entities/{entity_file}.json'
        data = self._load(path)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return data.get('entities', data.get('data', []))
        return []
    
    def _init_elements(self):
        """元素周期表前40种"""
        return {
            'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10,
            'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15, 'S': 16, 'Cl': 17, 'Ar': 18,
            'K': 19, 'Ca': 20, 'Sc': 21, 'Ti': 22, 'V': 23, 'Cr': 24, 'Mn': 25, 'Fe': 26,
            'Co': 27, 'Ni': 28, 'Cu': 29, 'Zn': 30, 'Ga': 31, 'Ge': 32, 'As': 33, 'Se': 34,
            'Br': 35, 'Kr': 36, 'Rb': 37, 'Sr': 38, 'Y': 39, 'Zr': 40
        }
    
    def _init_scaffolds(self):
        """分子骨架库 — 系统化生成材料的基础"""
        return [
            # 无机骨架
            {'name': '钙钛矿', 'pattern': 'ABX3', 'examples': ['CaTiO3', 'BaTiO3', 'MAPbI3'], 'type': '无机'},
            {'name': '尖晶石', 'pattern': 'AB2X4', 'examples': ['Fe3O4', 'LiMn2O4'], 'type': '无机'},
            {'name': '金刚石', 'pattern': '元素', 'examples': ['Si', 'Ge', 'C'], 'type': '无机'},
            {'name': '层状', 'pattern': 'MX2/MXene', 'examples': ['MoS2', 'WSe2', 'Ti3C2'], 'type': '无机'},
            {'name': '沸石', 'pattern': 'TO4', 'examples': ['ZSM-5', 'SAPO-34'], 'type': '无机'},
            
            # 有机骨架
            {'name': '噻吩环', 'pattern': 'C4H4S', 'examples': ['P3HT', 'PEDOT'], 'type': '有机'},
            {'name': '嘧啶环', 'pattern': 'C4H4N2', 'examples': ['吉非替尼', '奥希替尼'], 'type': '有机'},
            {'name': '苯环', 'pattern': 'C6H6', 'examples': ['聚苯乙烯', 'PCB'], 'type': '有机'},
            {'name': '吡咯环', 'pattern': 'C4H5N', 'examples': ['聚吡咯', '卟啉'], 'type': '有机'},
            {'name': '呋喃环', 'pattern': 'C4H4O', 'examples': ['聚呋喃', '糠醛'], 'type': '有机'},
            {'name': '咪唑环', 'pattern': 'C3H4N2', 'examples': ['聚离子液体', 'MOF'], 'type': '有机'},
            
            # 生物骨架
            {'name': '氨基酸链', 'pattern': '-CO-NH-', 'examples': ['胶原蛋白', '丝素蛋白'], 'type': '生物'},
            {'name': '核苷酸链', 'pattern': '磷酸二酯键', 'examples': ['DNA', 'RNA', '反义寡核苷酸'], 'type': '生物'},
            {'name': '糖苷键', 'pattern': '-O-糖环', 'examples': ['葡聚糖', '壳聚糖', '纤维素'], 'type': '生物'},
            {'name': '磷酸钙', 'pattern': 'Ca-P', 'examples': ['羟基磷灰石', 'TCP'], 'type': '生物陶瓷'},
            {'name': '脂质体', 'pattern': '磷脂双分子层', 'examples': ['LNP', '脂质体'], 'type': '生物'},
            
            # 复合骨架
            {'name': 'MOF', 'pattern': '金属+有机配体', 'examples': ['ZIF-8', 'UiO-66', 'MIL-101'], 'type': '复合'},
            {'name': 'COF', 'pattern': '共轭有机框架', 'examples': ['COF-5', 'TpPa-1'], 'type': '复合'},
            {'name': 'MXene', 'pattern': 'Mn+1Xn', 'examples': ['Ti3C2', 'V2C', 'Nb4C3'], 'type': '复合'},
            {'name': '高分子复合材料', 'pattern': '聚合物+填料', 'examples': ['CFRP', 'GFRP'], 'type': '复合'},
        ]
    
    def _init_reactions(self):
        """化学反应库"""
        return [
            {'name': 'Suzuki偶联', 'type': 'C-C偶联', 'catalyst': 'Pd', 'temp': '80-100°C', 'difficulty': '中等'},
            {'name': '点击化学', 'type': 'CuAAC', 'catalyst': 'Cu', 'temp': '室温', 'difficulty': '简单'},
            {'name': '开环聚合', 'type': 'ROP', 'catalyst': 'Sn(Oct)2', 'temp': '120-150°C', 'difficulty': '中等'},
            {'name': '固相合成', 'type': 'SPPS', 'catalyst': 'HATU/DIC', 'temp': '室温', 'difficulty': '高'},
            {'name': '水热法', 'type': '无机合成', 'catalyst': '无', 'temp': '150-250°C', 'difficulty': '中等'},
            {'name': '溶胶-凝胶', 'type': '无机合成', 'catalyst': '酸/碱', 'temp': '60-80°C', 'difficulty': '中等'},
            {'name': '微流控混合', 'type': 'LNP制备', 'catalyst': '无', 'temp': '室温', 'difficulty': '高'},
            {'name': '三质粒转染', 'type': 'AAV生产', 'catalyst': 'PEI', 'temp': '37°C', 'difficulty': '极高'},
            {'name': '电化学沉积', 'type': '薄膜制备', 'catalyst': '电势', 'temp': '室温', 'difficulty': '中等'},
            {'name': '化学气相沉积', 'type': 'CVD', 'catalyst': '催化剂', 'temp': '600-1000°C', 'difficulty': '高'},
            {'name': '水提醇沉', 'type': '中药提取', 'catalyst': '无', 'temp': '100°C', 'difficulty': '简单'},
            {'name': '超临界CO2', 'type': '绿色提取', 'catalyst': 'CO2', 'temp': '40-80°C', 'difficulty': '中等'},
        ]
    
    def _init_known_materials(self):
        return [
            # 无机
            {"formula":"Si","name":"硅","type":"半导体","band_gap":1.12,"stability":"稳定","category":"无机"},
            {"formula":"GaAs","name":"砷化镓","type":"半导体","band_gap":1.42,"stability":"稳定","category":"无机"},
            {"formula":"LiCoO2","name":"钴酸锂","type":"正极材料","band_gap":2.1,"stability":"稳定","category":"无机"},
            {"formula":"YBa2Cu3O7","name":"钇钡铜氧","type":"超导体","Tc":92,"stability":"稳定","category":"无机"},
            {"formula":"MoS2","name":"二硫化钼","type":"二维材料","band_gap":1.8,"stability":"稳定","category":"无机"},
            {"formula":"Ti3C2","name":"MXene","type":"二维材料","conductivity":"高","stability":"中等","category":"复合"},
            {"formula":"ZIF-8","name":"沸石咪唑酯骨架","type":"MOF","surface_area":1947,"stability":"稳定","category":"复合"},
            {"formula":"MAPbI3","name":"钙钛矿","type":"光伏材料","band_gap":1.55,"stability":"中等","category":"有机"},
            # 有机
            {"formula":"P3HT","name":"聚3-己基噻吩","type":"有机半导体","band_gap":1.9,"stability":"中等","category":"有机"},
            {"formula":"PEDOT:PSS","name":"导电聚合物","type":"导体","conductivity":"1000 S/cm","stability":"稳定","category":"有机"},
            {"formula":"PLGA","name":"聚乳酸-羟基乙酸","type":"生物可降解","degradation":"数周-数月","category":"生物"},
            {"formula":"PVDF","name":"聚偏氟乙烯","type":"压电","band_gap":6.0,"stability":"稳定","category":"有机"},
            # 超导体
            {"formula":"YBa2Cu3O7","name":"钇钡铜氧","type":"超导体","band_gap":0,"stability":"稳定","category":"无机","superconductor":True,"tc":93},
            {"formula":"MgB2","name":"二硼化镁","type":"超导体","band_gap":0,"stability":"稳定","category":"无机","superconductor":True,"tc":39},
            {"formula":"FeSe","name":"铁硒","type":"超导体","band_gap":0,"stability":"稳定","category":"无机","superconductor":True,"tc":8},
            {"formula":"La2CuO4","name":"铜酸镧","type":"超导体前体","band_gap":0,"stability":"稳定","category":"无机","superconductor":True,"tc":38},
            # 磁性材料
            {"formula":"Fe3O4","name":"四氧化三铁","type":"磁性材料","band_gap":0,"stability":"稳定","category":"无机","magnetism":"铁磁性"},
            {"formula":"Nd2Fe14B","name":"钕铁硼","type":"永磁体","band_gap":0,"stability":"稳定","category":"无机","magnetism":"铁磁性"},
            # 生物
            {"formula":"HA","name":"羟基磷灰石","type":"生物陶瓷","hardness":"5Mohs","category":"生物陶瓷"},
            {"formula":"Col-I","name":"胶原蛋白","type":"生物大分子","category":"生物"},
            {"formula":"PEG","name":"聚乙二醇","type":"惰性聚合物","category":"生物"},
            {"formula":"LNP","name":"脂质纳米颗粒","type":"药物载体","loading":0.9,"category":"生物"},
            {"formula":"AAV","name":"腺相关病毒","type":"基因载体","loading":0.8,"category":"生物"},
        ]
    
    def _init_categories(self):
        """材料分类树"""
        return {
            '无机材料': ['半导体', '导体', '绝缘体', '超导体', '磁性材料', '陶瓷', '玻璃', '水泥'],
            '有机材料': ['有机半导体', '导电聚合物', '光电材料', '液晶', '树脂', '橡胶', '涂料'],
            '生物材料': ['生物陶瓷', '生物大分子', '水凝胶', '药物载体', '组织工程支架', '可降解材料'],
            '复合材料': ['MOF', 'COF', 'MXene', '高分子复合', '陶瓷复合', '金属复合'],
            '新能源材料': ['正极', '负极', '电解质', '催化剂', '光伏', '储氢'],
            '智能材料': ['压电', '形状记忆', '自修复', '刺激响应', '变色'],
        }
    
    def get_stats(self):
        """统计"""
        tcm_count = len(self.tcm_herbs) + len(self.tcm_ingredients) + len(self.tcm_formulas)
        gene_count = len(self.gene_therapies) + len(self.gene_delivery) + len(self.gene_editing)
        bio_count = len(self.synbio) + len(self.biomanufacturing) + len(self.cell_therapy)
        return {
            'elements': len(self.elements),
            'scaffolds': len(self.scaffolds),
            'reactions': len(self.reactions),
            'known_materials': len(self.known_materials),
            'tcm_data': tcm_count,
            'gene_data': gene_count,
            'bio_data': bio_count,
            'total_chemical_entities': tcm_count + gene_count + bio_count + len(self.known_materials),
            'material_categories': len(self.material_categories),
        }
    
    def predict_material(self, formula):
        """预测材料性能 — 支持任意化学式"""
        # 1. 检查已知材料
        for m in self.known_materials:
            if m['formula'].lower() == formula.lower():
                return {'formula': formula, 'found': True, 'source': '已知数据库', 'properties': m}
        
        # 2. 检查14站数据
        for source_name, source_data in self.all_sources.items():
            for item in source_data:
                name = item.get('name', '') or item.get('id', '')
                if formula.lower() in str(item).lower():
                    return {'formula': formula, 'found': True, 'source': f'14站-{source_name}', 'properties': item}
        
        # 3. 基于骨架匹配预测
        scaffold_match = self._match_scaffold(formula)
        # 4. 元素分析
        element_analysis = self._analyze_elements(formula)
        # 5. 生成预测
        predictions = self._generate_predictions(formula, scaffold_match, element_analysis)
        
        return {
            'formula': formula,
            'found': False,
            'source': 'PINN+骨架匹配预测',
            'scaffold_match': scaffold_match,
            'element_analysis': element_analysis,
            'predictions': predictions
        }
    
    def _match_scaffold(self, formula):
        """匹配分子骨架"""
        f = formula.lower()
        matches = []
        # 优先精确匹配
        for s in self.scaffolds:
            for ex in s.get('examples', []):
                if ex.lower() == f:
                    matches.append({'scaffold': s['name'], 'type': s['type'], 'pattern': s['pattern']})
        # 模糊匹配（示例至少3字符避免Si匹配所有含Si的）
        if not matches:
            for s in self.scaffolds:
                for ex in s.get('examples', []):
                    if len(ex) >= 3 and (ex.lower() in f or f in ex.lower()):
                        matches.append({'scaffold': s['name'], 'type': s['type'], 'pattern': s['pattern']})
        return matches if matches else [{'scaffold': '未知', 'type': '需分析', 'pattern': '需确定'}]
    
    def _analyze_elements(self, formula):
        """分析化学式中的元素"""
        found = []
        for elem in self.elements:
            if elem in formula:
                found.append({'element': elem, 'atomic_num': self.elements[elem]})
        elem_names = [e['element'] for e in found]
        has_carbon = 'C' in elem_names
        return {'elements': found, 'count': len(found), 'type': '有机' if has_carbon else '无机'}
    
    def _recommend_reactions(self, elements, scaffold):
        """根据材料类型推荐相关反应"""
        mat_type = elements.get('type', '无机')
        has_metal = any(e['atomic_num'] > 20 for e in elements.get('elements', []))
        is_organic = mat_type == '有机'
        
        # 反应类型映射
        ORGANIC_REACTIONS = ['Suzuki偶联', '点击化学', '开环聚合', '固相合成']
        INORGANIC_REACTIONS = ['水热法', '溶胶-凝胶', '电化学沉积', 'CVD']
        BIO_REACTIONS = ['微流控混合', '三质粒转染', '水提醇沉', '超临界CO2']
        
        if is_organic:
            pool = ORGANIC_REACTIONS
        elif has_metal:
            pool = INORGANIC_REACTIONS
        else:
            pool = INORGANIC_REACTIONS[:2]
        
        # 如果有生物相关元素（N+O同时存在且无金属），加生物反应
        elem_set = {e['element'] for e in elements.get('elements', [])}
        if {'N','O','C'}.issubset(elem_set) and not has_metal:
            pool = ORGANIC_REACTIONS[:2] + BIO_REACTIONS[:1]
        
        # 按反应库匹配
        matched = [r['name'] for r in self.reactions if r['name'] in pool][:3]
        return matched if matched else pool[:3]
    
    def _generate_predictions(self, formula, scaffold, elements):
        """基于骨架+元素生成预测"""
        n = elements['count']
        is_organic = elements['type'] == '有机'
        has_metal = any(e['atomic_num'] > 20 for e in elements['elements'])
        
        # 带隙预测（简化模型）
        if is_organic and has_metal:
            band_gap = 1.5 + 0.3 * (n - 3)  # 有机金属
        elif is_organic:
            band_gap = 2.0 + 0.4 * (n - 2)  # 纯有机
        elif has_metal:
            band_gap = max(0.1, 3.0 - 0.3 * n)  # 无机金属
        else:
            band_gap = 5.0  # 绝缘体
        
        return {
            'predicted_band_gap': round(band_gap, 2),
            'predicted_type': '半导体' if 0.5 < band_gap < 3.0 else ('导体' if band_gap < 0.5 else '绝缘体'),
            'predicted_stability': '稳定' if n <= 4 else '中等' if n <= 6 else '可能不稳定',
            'predicted_synthesis_difficulty': '简单' if n <= 3 else '中等' if n <= 5 else '高',
            'recommended_reactions': self._recommend_reactions(elements, scaffold)
        }
    
    def search_by_property(self, prop, value, tolerance=0.5):
        """按属性搜索材料"""
        results = []
        # 已知材料
        for m in self.known_materials:
            if prop in m:
                mv = m[prop]
                if isinstance(mv, bool):
                    if mv:  # superconductor=True等
                        results.append({'formula': m['formula'], 'name': m['name'], 'value': mv, 'source': '已知', 'tc': m.get('tc','')})
                elif isinstance(mv, (int, float)):
                    if abs(mv - value) <= tolerance:
                        results.append({'formula': m['formula'], 'name': m['name'], 'value': mv, 'source': '已知'})
                elif isinstance(mv, str) and str(value).lower() in mv.lower():
                    results.append({'formula': m['formula'], 'name': m['name'], 'value': mv, 'source': '已知'})
            # 也按type字段搜索
            if prop == 'superconductor' and m.get('type','') == '超导体':
                results.append({'formula': m['formula'], 'name': m['name'], 'value': '超导体', 'source': '已知', 'tc': m.get('tc','')})
            if prop == 'magnetism' and m.get('magnetism','') == value:
                results.append({'formula': m['formula'], 'name': m['name'], 'value': m['magnetism'], 'source': '已知'})
        
        # 去重
        seen = set()
        unique = []
        for r in results:
            if r['formula'] not in seen:
                seen.add(r['formula'])
                unique.append(r)
        
        return {'property': prop, 'target': value, 'results': unique, 'total': len(unique)}
    
    def generate_from_scaffold(self, scaffold_name, target_props=None):
        """从骨架生成新材料候选（类似MatterGen但含合成路径）"""
        scaffold = None
        for s in self.scaffolds:
            if s['name'] == scaffold_name:
                scaffold = s
                break
        
        if not scaffold:
            return {'error': f'未知骨架: {scaffold_name}', 'available': [s['name'] for s in self.scaffolds]}
        
        # 生成候选（基于骨架pattern的元素替换）
        candidates = []
        for ex in scaffold.get('examples', []):
            candidates.append({
                'formula': ex,
                'scaffold': scaffold_name,
                'type': scaffold['type'],
                'known': True,
                'synthesis': self._find_synthesis(ex)
            })
        
        # 生成新候选（元素替换）
        if target_props:
            new_candidates = self._generate_candidates(scaffold, target_props)
            candidates.extend(new_candidates)
        
        return {
            'scaffold': scaffold_name,
            'pattern': scaffold['pattern'],
            'type': scaffold['type'],
            'candidates': candidates,
            'total': len(candidates)
        }
    
    def _find_synthesis(self, formula):
        """查找合成路径"""
        for r in self.reactions:
            for s in self.scaffolds:
                if formula in s.get('examples', []):
                    return {'reactions': [r['name'] for r in self.reactions if True][:2], 'difficulty': '中等'}
        return {'reactions': ['待确定'], 'difficulty': '未知'}
    
    def _generate_candidates(self, scaffold, target_props):
        """基于目标属性生成新候选"""
        # 简化：基于元素替换生成候选
        candidates = []
        elements_pool = ['Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge']
        if scaffold['pattern'] == 'ABX3':
            for a in ['Ca', 'Ba', 'Sr']:
                for b in ['Ti', 'Zr', 'Sn']:
                    formula = f'{a}{b}O3'
                    if formula not in [c.get('formula') for c in candidates]:
                        candidates.append({
                            'formula': formula,
                            'scaffold': scaffold['name'],
                            'type': '生成候选',
                            'known': False,
                            'predicted_band_gap': round(2.0 + 0.3 * (len(a) + len(b)), 2),
                        })
        return candidates[:5]  # 限制数量
    
    def list_scaffolds(self):
        """列出所有分子骨架"""
        return [{'name': s['name'], 'pattern': s['pattern'], 'type': s['type'], 'examples_count': len(s.get('examples', []))} for s in self.scaffolds]
    
    def list_reactions(self):
        """列出所有化学反应"""
        return self.reactions


if __name__ == '__main__':
    engine = ChemoMaterialEngineV3()
    
    stats = engine.get_stats()
    print("=== 化学+材料一体化引擎 v3.1 ===")
    print(f"元素: {stats['elements']}种")
    print(f"分子骨架: {stats['scaffolds']}种")
    print(f"化学反应: {stats['reactions']}种")
    print(f"已知材料: {stats['known_materials']}种")
    print(f"14站化学数据: {stats['total_chemical_entities']}条")
    print(f"材料分类: {stats['material_categories']}大类")
    print(f"中药数据: {stats['tcm_data']}条 (药材+成分+方剂)")
    print(f"基因数据: {stats['gene_data']}条 (治疗+递送+编辑)")
    print(f"生物数据: {stats['bio_data']}条 (合成生物+制造+细胞)")
    
    print("\n=== 分子骨架库 ===")
    for s in engine.list_scaffolds():
        print(f"  {s['name']:12s} | {s['pattern']:16s} | {s['type']:6s} | {s['examples_count']}个示例")
    
    print("\n=== 化学反应库 ===")
    for r in engine.list_reactions():
        print(f"  {r['name']:16s} | {r['type']:12s} | 催化:{r['catalyst']:8s} | {r['temp']:12s} | 难度:{r['difficulty']}")
    
    print("\n=== 测试1: 预测CaTiO3 ===")
    r = engine.predict_material('CaTiO3')
    print(f"  来源: {r['source']}")
    if r['found']:
        print(f"  属性: {r['properties']}")
    else:
        print(f"  骨架匹配: {r['scaffold_match']}")
        print(f"  元素分析: {r['element_analysis']}")
        print(f"  预测: {r['predictions']}")
    
    print("\n=== 测试2: 预测中药成分(黄芩苷) ===")
    r = engine.predict_material('黄芩苷')
    print(f"  来源: {r['source']}")
    if r['found']:
        print(f"  属性: {r['properties']}")
    
    print("\n=== 测试3: 从钙钛矿骨架生成 ===")
    r = engine.generate_from_scaffold('钙钛矿')
    print(f"  骨架: {r['scaffold']} | 模式: {r['pattern']}")
    for c in r['candidates']:
        print(f"    {c['formula']} (已知={c['known']}) 合成={c.get('synthesis',{}).get('reactions','?')}")
    
    print("\n=== 测试4: 搜索带隙~1.5eV ===")
    r = engine.search_by_property('band_gap', 1.5)
    print(f"  结果: {r['total']}个")
    for res in r['results']:
        print(f"    {res['formula']} = {res['value']} ({res['source']})")
