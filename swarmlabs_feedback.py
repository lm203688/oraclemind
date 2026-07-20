#!/usr/bin/env python3
"""
蜂群科研——实验数据回流接口

功能：
1. 用户上传真实实验结果
2. 系统对比预测值vs真实值
3. 记录校准数据
4. 动态更新引擎可靠性评分
5. 生成校准报告

API端点：
  POST /api/v1/feedback/submit  → 提交实验结果
  GET  /api/v1/feedback/history → 查看校准历史
  GET  /api/v1/feedback/report  → 生成校准报告
"""

import json, os, time
from typing import Dict, List
from datetime import datetime

FEEDBACK_FILE = '/home/z/my-project/swarmlabs_feedback_data.json'

class FeedbackManager:
    """实验数据回流管理器"""
    
    @staticmethod
    def submit_feedback(engine_id: str, conditions: Dict, 
                        predicted: Dict, actual: Dict,
                        user_id: str = 'anonymous') -> Dict:
        """提交实验反馈
        
        Args:
            engine_id: 引擎ID
            conditions: 实验条件
            predicted: 引擎预测结果
            actual: 用户真实实验结果
            user_id: 用户ID
            
        Returns:
            校准结果
        """
        # 加载历史数据
        data = FeedbackManager._load_data()
        
        # 计算预测误差
        errors = {}
        for key in actual:
            if key in predicted and isinstance(actual[key], (int, float)) and isinstance(predicted[key], (int, float)):
                if actual[key] != 0:
                    err_pct = abs(predicted[key] - actual[key]) / abs(actual[key]) * 100
                    errors[key] = round(err_pct, 1)
        
        # 记录
        record = {
            'id': f"FB-{int(time.time())}",
            'timestamp': datetime.now().isoformat(),
            'engine_id': engine_id,
            'user_id': user_id,
            'conditions': conditions,
            'predicted': predicted,
            'actual': actual,
            'errors': errors,
            'mean_error': round(sum(errors.values()) / len(errors), 1) if errors else 0,
        }
        
        data['records'].append(record)
        
        # 更新引擎校准统计
        if engine_id not in data['engine_stats']:
            data['engine_stats'][engine_id] = {
                'total_feedbacks': 0,
                'total_error_sum': 0,
                'calibration_history': [],
            }
        
        stats = data['engine_stats'][engine_id]
        stats['total_feedbacks'] += 1
        stats['total_error_sum'] += record['mean_error']
        stats['avg_error'] = round(stats['total_error_sum'] / stats['total_feedbacks'], 1)
        stats['last_updated'] = record['timestamp']
        
        # 保存
        FeedbackManager._save_data(data)
        
        # 生成反馈
        if record['mean_error'] < 15:
            feedback_msg = "✅ 预测精度良好（误差<15%），模型可靠"
        elif record['mean_error'] < 25:
            feedback_msg = "⚠️ 预测精度中等（误差15-25%），可用但需谨慎"
        else:
            feedback_msg = "❌ 预测偏差较大（误差>25%），模型需校准"
        
        return {
            'record_id': record['id'],
            'errors': errors,
            'mean_error': record['mean_error'],
            'feedback': feedback_msg,
            'engine_reliability': 1 - stats['avg_error'] / 100,
            'total_calibrations': stats['total_feedbacks'],
        }
    
    @staticmethod
    def get_history(engine_id: str = None) -> Dict:
        """获取校准历史"""
        data = FeedbackManager._load_data()
        
        if engine_id:
            records = [r for r in data['records'] if r['engine_id'] == engine_id]
            stats = data['engine_stats'].get(engine_id, {})
        else:
            records = data['records']
            stats = data['engine_stats']
        
        return {
            'total_records': len(records),
            'records': records[-20:],  # 最近20条
            'engine_stats': stats,
        }
    
    @staticmethod
    def get_report() -> Dict:
        """生成全局校准报告"""
        data = FeedbackManager._load_data()
        
        engines = []
        for eid, stats in data['engine_stats'].items():
            engines.append({
                'engine_id': eid,
                'feedbacks': stats['total_feedbacks'],
                'avg_error': stats.get('avg_error', 0),
                'reliability': round(1 - stats.get('avg_error', 0) / 100, 3),
            })
        
        engines.sort(key=lambda x: x['avg_error'])
        
        return {
            'total_feedbacks': len(data['records']),
            'engines_calibrated': len(data['engine_stats']),
            'engine_rankings': engines,
            'generated_at': datetime.now().isoformat(),
        }
    
    @staticmethod
    def _load_data() -> Dict:
        if os.path.exists(FEEDBACK_FILE):
            with open(FEEDBACK_FILE) as f:
                return json.load(f)
        return {'records': [], 'engine_stats': {}}
    
    @staticmethod
    def _save_data(data: Dict):
        with open(FEEDBACK_FILE, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    # 测试
    print("=== 实验数据回流测试 ===\n")
    
    # 模拟用户提交
    result = FeedbackManager.submit_feedback(
        engine_id='corrosion',
        conditions={'material': 'carbon_steel', 'temperature_C': 25},
        predicted={'corrosion_rate_mm_year': 0.174, 'i_corr_uA_cm2': 15.0},
        actual={'corrosion_rate_mm_year': 0.150, 'i_corr_uA_cm2': 14.0},
        user_id='researcher_001'
    )
    print("提交结果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 查看历史
    history = FeedbackManager.get_history('corrosion')
    print(f"\n校准历史: {history['total_records']}条")
    
    # 生成报告
    report = FeedbackManager.get_report()
    print(f"\n校准报告: {report['total_feedbacks']}条反馈，{report['engines_calibrated']}个引擎已校准")
