#!/usr/bin/env python3
"""
健康数据分析引擎
跨数据源关联分析 + AI洞察生成
"""

import os
import json
import uuid
import sqlite3
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError


class HealthAnalyzer:
    def __init__(self, bit_assistant_url="http://150.158.119.19:8431", db_path=None):
        self.bit_assistant_url = bit_assistant_url
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
    
    def trigger_analysis(self, user_id):
        """触发全量分析"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        
        try:
            # 获取用户所有数据
            metrics = db.execute(
                "SELECT metric_type, metric_name, value, unit, recorded_at, source, metadata_json FROM health_records WHERE user_id = ? ORDER BY recorded_at",
                (user_id,)
            ).fetchall()
            
            if not metrics:
                return
            
            # 清除旧洞察
            db.execute("DELETE FROM insights WHERE user_id = ?", (user_id,))
            
            # 1. 异常指标检测
            abnormal_insights = self._detect_abnormal(metrics)
            
            # 2. 趋势分析
            trend_insights = self._detect_trends(metrics)
            
            # 3. 跨源关联分析
            cross_insights = self._cross_source_analysis(metrics)
            
            # 4. AI深度分析
            ai_insights = self._ai_deep_analysis(metrics)
            
            # 保存所有洞察
            all_insights = abnormal_insights + trend_insights + cross_insights + ai_insights
            for insight in all_insights:
                db.execute(
                    "INSERT INTO insights (id, user_id, insight_type, severity, title, content, sources_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (str(uuid.uuid4())[:8], user_id, insight['type'], insight['severity'],
                     insight['title'], insight['content'], json.dumps(insight.get('sources', []), ensure_ascii=False))
                )
            
            db.commit()
        finally:
            db.close()
    
    def _detect_abnormal(self, metrics):
        """检测异常指标"""
        insights = []
        for m in metrics:
            meta = json.loads(m['metadata_json']) if m['metadata_json'] else {}
            status = meta.get('status', '')
            if status in ('high', 'low', 'abnormal'):
                direction = '偏高' if status == 'high' else '偏低' if status == 'low' else '异常'
                insights.append({
                    'type': 'abnormal',
                    'severity': 'warning',
                    'title': f"{m['metric_name']}{direction}",
                    'content': f"{m['metric_name']} {m['value']} {m['unit']}（{direction}），参考范围见体检报告。来源：{m['source']}，日期：{m['recorded_at']}",
                    'sources': [m['source']]
                })
        return insights[:10]  # 最多10条
    
    def _detect_trends(self, metrics):
        """检测指标趋势"""
        insights = []
        
        # 按指标名分组
        by_name = {}
        for m in metrics:
            key = m['metric_name']
            if key not in by_name:
                by_name[key] = []
            by_name[key].append({
                'value': m['value'],
                'date': m['recorded_at'],
                'source': m['source']
            })
        
        # 检测持续上升/下降
        for name, records in by_name.items():
            if len(records) < 2:
                continue
            
            # 按日期排序
            records.sort(key=lambda r: r['date'])
            
            # 检查最近3个数据点是否持续上升或下降
            recent = records[-3:] if len(records) >= 3 else records
            if len(recent) < 2:
                continue
            
            rising = all(recent[i]['value'] < recent[i+1]['value'] for i in range(len(recent)-1))
            falling = all(recent[i]['value'] > recent[i+1]['value'] for i in range(len(recent)-1))
            
            if rising:
                change_pct = (recent[-1]['value'] - recent[0]['value']) / max(recent[0]['value'], 0.001) * 100
                if change_pct > 10:  # 变化超过10%才提醒
                    insights.append({
                        'type': 'trend',
                        'severity': 'warning',
                        'title': f"{name}持续上升",
                        'content': f"{name}从{recent[0]['date']}的{recent[0]['value']}上升到{recent[-1]['date']}的{recent[-1]['value']}，升幅{change_pct:.1f}%。来源：{', '.join(set(r['source'] for r in recent))}",
                        'sources': list(set(r['source'] for r in recent))
                    })
            elif falling:
                change_pct = (recent[0]['value'] - recent[-1]['value']) / max(recent[0]['value'], 0.001) * 100
                if change_pct > 10:
                    insights.append({
                        'type': 'trend',
                        'severity': 'info',
                        'title': f"{name}持续下降",
                        'content': f"{name}从{recent[0]['date']}的{recent[0]['value']}下降到{recent[-1]['date']}的{recent[-1]['value']}，降幅{change_pct:.1f}%。来源：{', '.join(set(r['source'] for r in recent))}",
                        'sources': list(set(r['source'] for r in recent))
                    })
        
        return insights
    
    def _cross_source_analysis(self, metrics):
        """跨数据源关联分析"""
        insights = []
        
        # 按来源分组
        sources = set(m['source'] for m in metrics)
        if len(sources) < 2:
            return insights
        
        # 预定义关联规则
        correlations = [
            {
                'conditions': [
                    {'metric_name': '静息心率', 'direction': 'up'},
                    {'metric_name': '睡眠', 'direction': 'down'},
                ],
                'insight': '静息心率上升+睡眠质量下降，可能与压力或甲状腺功能有关，建议检查甲功五项。'
            },
            {
                'conditions': [
                    {'metric_name': '空腹血糖', 'direction': 'up'},
                    {'metric_name': 'BMI', 'direction': 'up'},
                ],
                'insight': '血糖上升+BMI上升，代谢综合征风险增加，建议关注腰围和血脂。'
            },
            {
                'conditions': [
                    {'metric_name': '步数', 'direction': 'down'},
                    {'metric_name': '体重', 'direction': 'up'},
                ],
                'insight': '活动量下降+体重上升，建议增加日常运动。'
            },
        ]
        
        # 检查每个关联规则
        by_name = {}
        for m in metrics:
            key = m['metric_name']
            if key not in by_name:
                by_name[key] = []
            by_name[key].append(m)
        
        for corr in correlations:
            matched = True
            matched_sources = set()
            for cond in corr['conditions']:
                name = cond['metric_name']
                if name not in by_name:
                    matched = False
                    break
                records = by_name[name]
                if len(records) < 2:
                    matched = False
                    break
                # 检查趋势方向
                recent = sorted(records, key=lambda r: r['recorded_at'])[-2:]
                if cond['direction'] == 'up' and recent[-1]['value'] <= recent[0]['value']:
                    matched = False
                    break
                if cond['direction'] == 'down' and recent[-1]['value'] >= recent[0]['value']:
                    matched = False
                    break
                matched_sources.update(r['source'] for r in recent)
            
            if matched and len(matched_sources) >= 2:
                insights.append({
                    'type': 'cross_source',
                    'severity': 'warning',
                    'title': '跨数据源关联发现',
                    'content': corr['insight'] + f"（数据来源：{', '.join(matched_sources)}）",
                    'sources': list(matched_sources)
                })
        
        return insights
    
    def _ai_deep_analysis(self, metrics):
        """AI深度分析"""
        # 构建数据摘要
        summary = "用户健康数据：\n"
        by_type = {}
        for m in metrics:
            t = m['metric_type']
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(f"{m['metric_name']}={m['value']}{m['unit']}({m['recorded_at']},{m['source']})")
        
        for t, items in by_type.items():
            summary += f"\n【{t}】\n"
            summary += '\n'.join(items[:10]) + '\n'
        
        prompt = f"""基于以下跨数据源健康数据，请生成3-5条健康洞察。每条洞察包含：
- 发现了什么
- 可能的原因
- 建议的下一步行动

注意：
1. 重点关注跨数据源的关联发现（如可穿戴数据+体检数据的关联）
2. 不要做诊断，只做健康提示
3. 如果数据不足以得出结论，明确说明
4. 200字以内

{summary[:4000]}"""
        
        data = json.dumps({"message": prompt, "session_id": "deep_analysis"}).encode()
        req = Request(
            f"{self.bit_assistant_url}/chat",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                content = result.get('content', '')
                if content:
                    return [{
                        'type': 'ai_analysis',
                        'severity': 'info',
                        'title': 'AI健康洞察',
                        'content': content,
                        'sources': list(set(m['source'] for m in metrics))
                    }]
        except Exception as e:
            print(f"AI深度分析失败: {e}")
        
        return []
    
    def ask_health_question(self, context, question):
        """回答健康问题"""
        prompt = f"""你是一个专业的健康AI助手。基于用户的健康数据，回答他的问题。
注意：你只能提供健康建议，不能做医疗诊断。如果问题超出健康建议范围，请建议用户就医。

{context}

用户问题：{question}"""
        
        data = json.dumps({"message": prompt, "session_id": "health_qa"}).encode()
        req = Request(
            f"{self.bit_assistant_url}/chat",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        with urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return result.get('content', '抱歉，暂时无法回答')
