"""
蜂群科研 — 主入口
从"模拟世界"到"加速实验"的完整系统
"""

import os, sys, json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from physics.physics_engine import PhysicsEngine
from physics.chemo_material_engine import ChemoMaterialEngine
from physics.chemo_material_engine_v3 import ChemoMaterialEngineV3
from physics.material_predictor import MaterialPredictor
from core.acceleration_loop import AccelerationLoop
from bees.colony import SwarmColony
from dashboard.dashboard import Dashboard

class SwarmResearch:
    """蜂群科研·实验加速系统"""
    
    def __init__(self):
        self.engine = PhysicsEngine()
        self.chemo_material = ChemoMaterialEngine()
        self.chemo_material_v3 = ChemoMaterialEngineV3()
        self.material_predictor = MaterialPredictor()
        self.loop = AccelerationLoop()
        self.colony = SwarmColony()
        self.dashboard = Dashboard()
    
    def accelerate_experiment(self, experiment):
        """加速一个实验 — 核心接口"""
        return self.colony.accelerate_experiment(experiment)
    
    def predict_only(self, experiment):
        """仅预测，不执行实验"""
        return self.engine.predict_experiment(experiment)
    
    def rank_pathways(self, pathways):
        """合成路径排序"""
        return self.engine.accelerate_pathway(pathways)
    
    def predict_material(self, formula):
        """材料性能预测（化学+材料一体化）"""
        return self.chemo_material.predict_material(formula)
    
    def design_carrier(self, drug_type, target_organ):
        """材料-药物载体协同设计"""
        return self.chemo_material.design_carrier(drug_type, target_organ)
    
    def discover_materials(self, target_prop, target_val):
        """跨领域材料发现"""
        return self.chemo_material.discover_cross_domain(target_prop, target_val)
    
    def show_dashboard(self):
        """显示仪表盘"""
        self.dashboard.render_text()
    
    def get_status(self):
        """系统状态"""
        return {
            'name': '蜂群科研·实验加速系统',
            'version': '2.0.0',
            'paradigm': '从模拟世界→加速实验',
            'modules': {
                'physics_engine': '热力学+量子+动力学+药效团4规则',
                'acceleration_loop': '预测→验证→反馈→修正闭环',
                'bees': '8种AI蜂（含物理规则+ROI能力）',
                'dashboard': '加速比+准确率+成本节省'
            },
            'stats': self.loop.get_stats()
        }


if __name__ == '__main__':
    sr = SwarmResearch()
    
    # 1. 系统状态
    print("=== 蜂群科研 v2.0 ===")
    status = sr.get_status()
    print(f"定位: {status['paradigm']}")
    print(f"模块: {len(status['modules'])}个")
    for name, desc in status['modules'].items():
        print(f"  - {name}: {desc}")
    
    # 2. 物理规则引擎测试
    print("\n=== 物理规则引擎测试 ===")
    reaction = {
        'name': 'EGFR抑制剂合成-路径A',
        'delta_g': -35,
        'activation_energy': 80,
        'temperature': 350,
        'applicable_rules': ['thermodynamics', 'kinetics']
    }
    pred = sr.predict_only(reaction)
    print(f"反应: {reaction['name']}")
    print(f"  综合评分: {pred['overall_score']:.2f}")
    print(f"  预测成功率: {pred['estimated_success_rate']:.0%}")
    print(f"  建议: {pred['recommendation']}")
    
    # 3. 合成路径排序
    print("\n=== 合成路径加速排序 ===")
    pathways = [
        {'name': '路径A-Suzuki偶联', 'delta_g': -35, 'activation_energy': 80, 'temperature': 350, 'applicable_rules': ['thermodynamics', 'kinetics']},
        {'name': '路径B-直接缩合', 'delta_g': -20, 'activation_energy': 120, 'temperature': 298, 'applicable_rules': ['thermodynamics', 'kinetics']},
        {'name': '路径C-光催化', 'delta_g': -50, 'activation_energy': 40, 'temperature': 300, 'applicable_rules': ['thermodynamics', 'kinetics']},
    ]
    ranked = sr.rank_pathways(pathways)
    for i, p in enumerate(ranked):
        print(f"  Top{i+1}: {p['pathway']} | 评分{p['score']:.2f} | 成功率{p['success_rate']:.0%} | {p['recommendation']}")
    
    # 4. 完整加速闭环
    print("\n=== 完整实验加速闭环 ===")
    result = sr.accelerate_experiment(reaction)
    for bee, data in result.items():
        if isinstance(data, dict):
            summary = str(data.get('recommendation', data.get('status', data.get('approval', data.get('analysis', str(data)[:60])))))[:60]
            print(f"  [{bee}] {summary}")
    
    # 5. 仪表盘
    sr.show_dashboard()
