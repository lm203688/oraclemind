"""
实验加速仪表盘 — 可视化加速效果
"""

import json, os
from core.acceleration_loop import AccelerationLoop

class Dashboard:
    """实验加速仪表盘"""
    
    def __init__(self):
        self.loop = AccelerationLoop()
    
    def render(self):
        """渲染仪表盘数据"""
        stats = self.loop.get_stats()
        
        return {
            'title': '蜂群科研·实验加速仪表盘',
            'metrics': {
                'total_experiments': {
                    'label': '累计加速实验',
                    'value': stats['total_experiments'],
                    'unit': '次',
                    'trend': 'up'
                },
                'acceleration_ratio': {
                    'label': '加速比',
                    'value': f"{stats['acceleration_ratio']:.1f}x",
                    'unit': '',
                    'trend': 'up'
                },
                'accuracy': {
                    'label': '预测准确率',
                    'value': f"{stats['avg_accuracy']:.0%}",
                    'unit': '',
                    'trend': 'up' if stats['avg_accuracy'] > 0.7 else 'flat'
                },
                'cost_saved': {
                    'label': '节省实验成本',
                    'value': f"¥{stats['cost_saved']:,}",
                    'unit': '',
                    'trend': 'up'
                },
                'time_saved': {
                    'label': '节省实验时间',
                    'value': f"{stats['time_saved_hours']:,}",
                    'unit': '小时',
                    'trend': 'up'
                }
            },
            'summary': self._generate_summary(stats),
            'recommendations': self._generate_recommendations(stats)
        }
    
    def _generate_summary(self, stats):
        if stats['total_experiments'] == 0:
            return '暂无实验数据，开始第一个实验加速'
        
        return (f"已加速{stats['total_experiments']}次实验，"
                f"预测准确率{stats['avg_accuracy']:.0%}，"
                f"加速比{stats['acceleration_ratio']:.1f}x，"
                f"节省成本¥{stats['cost_saved']:,}，"
                f"节省时间{stats['time_saved_hours']}小时")
    
    def _generate_recommendations(self, stats):
        recs = []
        total = stats['total_experiments']
        acc = stats['avg_accuracy']
        
        if acc < 0.7 and total > 5:
            recs.append(f'预测准确率{acc:.0%}偏低（目标>70%），建议：1)检查热力学参数输入准确性 2)增加活化能<60kJ/mol的实验样本 3)调整PINN物理规则权重')
        elif acc < 0.8 and total > 10:
            recs.append(f'准确率{acc:.0%}接近目标，建议：增加温度300-400K区间的实验数据，提升该区间预测精度')
        
        if total < 10:
            recs.append(f'实验样本{total}条（建议≥10条），当前加速比{stats["acceleration_ratio"]:.1f}x仅供参考。再积累{10-total}条可发布初步加速比')
        elif total < 50:
            recs.append(f'实验样本{total}条，建议达到50条后发布"已验证加速比{stats["acceleration_ratio"]:.1f}x"')
        else:
            recs.append(f'样本充足（{total}条），当前加速比{stats["acceleration_ratio"]:.1f}x可作为正式指标')
        
        if stats['acceleration_ratio'] > 5 and total >= 10:
            recs.append(f'加速效果显著（{stats["acceleration_ratio"]:.1f}x），建议：1)扩展到更多实验类型 2)联系3家药企做灯塔项目验证 3)准备发布学术论文')
        
        if not recs:
            recs.append('运行良好，继续积累实验数据')
        return recs
    
    def render_text(self):
        """纯文本渲染（终端用）"""
        data = self.render()
        print(f"\n{'='*50}")
        print(f"  {data['title']}")
        print(f"{'='*50}")
        for key, m in data['metrics'].items():
            print(f"  {m['label']}: {m['value']}{m['unit']}")
        print(f"\n  📊 {data['summary']}")
        print(f"\n  💡 建议:")
        for r in data['recommendations']:
            print(f"    - {r}")
        print(f"{'='*50}")
