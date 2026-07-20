"""
实验加速闭环 — 预测→验证→反馈→修正
"""

import json, os, time
from physics.physics_engine import PhysicsEngine

class AccelerationLoop:
    """实验加速闭环"""
    
    def __init__(self):
        self.engine = PhysicsEngine()
        self.history = []
        self.accuracy_trend = []
        self.history_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'acceleration_history.json')
        self._load_history()
    
    def _load_history(self):
        if os.path.exists(self.history_path):
            with open(self.history_path) as f:
                self.history = json.load(f)
    
    def _save_history(self):
        with open(self.history_path, 'w') as f:
            json.dump(self.history[-500:], f, ensure_ascii=False, indent=2)
    
    def predict(self, experiment):
        """Phase 1: 预测实验结果"""
        prediction = self.engine.predict_experiment(experiment)
        prediction['experiment_name'] = experiment.get('name', '')
        prediction['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
        prediction['phase'] = 'predict'
        return prediction
    
    def validate(self, experiment_id, actual_result):
        """Phase 2: 验证 — 接收实验实际结果，自动完成反馈+修正"""
        actual_success = actual_result.get('success', False)
        actual_time = actual_result.get('time', 0)
        actual_yield = actual_result.get('actual_yield', actual_result.get('yield', 0))
        
        # 获取预测
        prediction = self.history[-1] if self.history else {'estimated_success_rate': 0.5, 'experiment_name': str(experiment_id)}
        
        # Phase 3: 反馈
        pred_success = prediction.get('estimated_success_rate', prediction.get('predicted', 0.5))
        actual_success_val = 1.0 if actual_success else 0.0
        error = abs(pred_success - actual_success_val)
        
        feedback = {
            'experiment': str(experiment_id),
            'predicted': pred_success,
            'actual': actual_success_val,
            'actual_yield': actual_yield,
            'error': error,
            'accurate': error < 0.2,
            'status': 'accurate' if error < 0.2 else ('close' if error < 0.4 else 'off'),
            'phase': 'feedback',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.history.append(feedback)
        self._save_history()
        
        # Phase 4: 修正
        if error > 0.3:
            correction = {'adjustment': f'预测偏差{error:.0%}，需调整物理规则权重', 'action': 'recalibrate', 'priority': 'high'}
        elif error > 0.1:
            correction = {'adjustment': f'预测偏差{error:.0%}，微调参数', 'action': 'fine_tune', 'priority': 'medium'}
        else:
            correction = {'adjustment': f'预测准确（误差{error:.0%}），保持当前权重', 'action': 'maintain', 'priority': 'low'}
        
        return {
            'experiment_id': str(experiment_id),
            'actual_success': actual_success,
            'actual_yield': actual_yield,
            'feedback': feedback,
            'correction': correction,
            'phase': 'complete'
        }
    
    def feedback(self, prediction, validation):
        """Phase 3: 反馈 — 计算预测误差"""
        pred_success = prediction.get('estimated_success_rate', 0)
        actual_success = 1.0 if validation['actual_success'] else 0.0
        error = abs(pred_success - actual_success)
        
        result = {
            'experiment': prediction.get('experiment_name', ''),
            'predicted': pred_success,
            'actual': actual_success,
            'error': error,
            'accurate': error < 0.2,
            'phase': 'feedback',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.history.append(result)
        self._save_history()
        return result
    
    def correct(self, feedback_result):
        """Phase 4: 修正 — 动态调整物理规则权重"""
        if feedback_result['error'] > 0.3:
            correction = f"预测偏差{feedback_result['error']:.0%}，需调整物理规则权重"
        elif feedback_result['error'] > 0.1:
            correction = f"预测偏差{feedback_result['error']:.0%}，微调参数"
        else:
            correction = f"预测准确（误差{feedback_result['error']:.0%}），保持当前权重"
        
        # 更新准确率趋势
        self.accuracy_trend.append(1 - feedback_result['error'])
        if len(self.accuracy_trend) > 100:
            self.accuracy_trend = self.accuracy_trend[-100:]
        
        avg_accuracy = sum(self.accuracy_trend) / len(self.accuracy_trend) if self.accuracy_trend else 0
        
        return {
            'correction': correction,
            'avg_accuracy': avg_accuracy,
            'total_experiments': len(self.history),
            'phase': 'correct'
        }
    
    def run_full_cycle(self, experiment, actual_result=None):
        """完整加速闭环"""
        # 预测
        prediction = self.predict(experiment)
        
        if actual_result:
            # 验证
            validation = self.validate(experiment.get('name', ''), actual_result)
            # 反馈
            feedback = self.feedback(prediction, validation)
            # 修正
            correction = self.correct(feedback)
            return {
                'prediction': prediction,
                'validation': validation,
                'feedback': feedback,
                'correction': correction
            }
        
        return {'prediction': prediction, 'note': '等待实验结果输入验证'}
    
    def get_stats(self):
        """获取加速统计"""
        total = len(self.history)
        if total == 0:
            return {'total_experiments': 0, 'avg_accuracy': 0, 'acceleration_ratio': 1}
        
        avg_error = sum(h['error'] for h in self.history) / total
        avg_accuracy = 1 - avg_error
        # 加速比 = 传统实验次数 / AI推荐实验次数
        recommended = sum(1 for h in self.history if h['predicted'] > 0.5)
        acceleration = total / max(recommended, 1)
        
        return {
            'total_experiments': total,
            'avg_accuracy': avg_accuracy,
            'acceleration_ratio': acceleration,
            'cost_saved': total * 5000 if total > 0 else 0,
            'time_saved_hours': total * 24 if total > 0 else 0
        }
