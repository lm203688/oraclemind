#!/usr/bin/env python3
"""
纵向趋势报告引擎
1. 同一指标历史趋势追踪
2. 自动识别趋势恶化/改善
3. 周报/月报/年报生成
4. 多指标综合健康走势
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from logging_config import logger

class TrendReporter:
    """纵向趋势报告器"""

    def __init__(self, db_path=None, bit_assistant_url=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
        self.bit_assistant_url = bit_assistant_url or os.environ.get('BIT_ASSISTANT_URL', 'http://150.158.119.19:8431')

    def generate_report(self, user_id, period='monthly'):
        """
        生成周期性健康趋势报告

        Args:
            user_id: 用户ID
            period: 'weekly' | 'monthly' | 'yearly'

        Returns:
            报告字典
        """
        now = datetime.now()

        if period == 'weekly':
            start = now - timedelta(days=7)
            prev_start = now - timedelta(days=14)
            prev_end = now - timedelta(days=7)
            period_label = '周报'
        elif period == 'yearly':
            start = now - timedelta(days=365)
            prev_start = now - timedelta(days=730)
            prev_end = now - timedelta(days=365)
            period_label = '年报'
        else:  # monthly
            start = now - timedelta(days=30)
            prev_start = now - timedelta(days=60)
            prev_end = now - timedelta(days=30)
            period_label = '月报'

        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row

        try:
            # 本期数据
            current_records = db.execute(
                """SELECT * FROM health_records
                   WHERE user_id = ? AND recorded_at >= ?
                   ORDER BY recorded_at""",
                (user_id, start.strftime('%Y-%m-%d'))
            ).fetchall()

            # 上期数据（用于对比）
            prev_records = db.execute(
                """SELECT * FROM health_records
                   WHERE user_id = ? AND recorded_at >= ? AND recorded_at < ?
                   ORDER BY recorded_at""",
                (user_id, prev_start.strftime('%Y-%m-%d'), prev_end.strftime('%Y-%m-%d'))
            ).fetchall()

            # 所有历史数据（用于长期趋势）
            all_records = db.execute(
                """SELECT metric_name, value, unit, recorded_at, source, metric_type
                   FROM health_records
                   WHERE user_id = ?
                   ORDER BY recorded_at""",
                (user_id,)
            ).fetchall()

            # 生成报告
            report = self._build_report(
                user_id, period, period_label,
                current_records, prev_records, all_records,
                start, now
            )

            # 保存报告到数据库
            self._save_report(db, user_id, report)

            return report
        finally:
            db.close()

    def _build_report(self, user_id, period, period_label,
                      current_records, prev_records, all_records,
                      start, end):
        """构建报告"""

        # 1. 数据概览
        overview = self._build_overview(current_records, start, end)

        # 2. 指标趋势分析
        metric_trends = self._analyze_metric_trends(current_records, prev_records, all_records)

        # 3. 健康改善/恶化项
        improvements, deteriorations = self._classify_changes(metric_trends)

        # 4. 多指标综合走势
        composite_score = self._calculate_composite_score(current_records, prev_records)

        # 5. AI总结
        ai_summary = self._generate_ai_summary(
            overview, metric_trends, improvements, deteriorations, composite_score
        )

        return {
            'report_id': str(uuid.uuid4())[:8],
            'user_id': user_id,
            'period': period,
            'period_label': period_label,
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'generated_at': datetime.now().isoformat(),
            'overview': overview,
            'metric_trends': metric_trends[:20],  # Top 20
            'improvements': improvements,
            'deteriorations': deteriorations,
            'composite_score': composite_score,
            'ai_summary': ai_summary,
            'disclaimer': '本报告由HealthLens自动生成，仅供参考，不能替代医疗诊断。',
        }

    def _build_overview(self, records, start, end):
        """数据概览"""
        sources = set(r['source'] for r in records)
        metric_types = set(r['metric_type'] for r in records)
        abnormal_count = sum(1 for r in records if r['is_abnormal'])

        return {
            'total_records': len(records),
            'data_sources': list(sources),
            'metric_categories': list(metric_types),
            'abnormal_count': abnormal_count,
            'normal_count': len(records) - abnormal_count,
            'abnormal_rate': round(abnormal_count / max(len(records), 1) * 100, 1),
            'period_days': (end - start).days,
        }

    def _analyze_metric_trends(self, current, prev, all_history):
        """指标趋势分析"""
        trends = []

        # 按指标名分组
        def group_by_name(records):
            grouped = {}
            for r in records:
                name = r['metric_name']
                if name not in grouped:
                    grouped[name] = []
                try:
                    val = float(r['value'])
                except (ValueError, TypeError):
                    continue
                grouped[name].append({
                    'value': val,
                    'unit': r['unit'],
                    'date': r['recorded_at'],
                    'source': r['source'],
                })
            return grouped

        current_grouped = group_by_name(current)
        prev_grouped = group_by_name(prev)

        # 对比每个指标
        all_names = set(current_grouped.keys()) | set(prev_grouped.keys())

        for name in all_names:
            curr_data = current_grouped.get(name, [])
            prev_data = prev_grouped.get(name, [])

            if not curr_data:
                continue

            curr_avg = sum(d['value'] for d in curr_data) / len(curr_data)
            curr_latest = max(curr_data, key=lambda x: x['date'])

            trend = {
                'metric_name': name,
                'unit': curr_latest['unit'],
                'current_avg': round(curr_avg, 2),
                'current_latest': curr_latest['value'],
                'current_latest_date': curr_latest['date'],
                'source': curr_latest['source'],
                'data_points': len(curr_data),
            }

            # 与上期对比
            if prev_data:
                prev_avg = sum(d['value'] for d in prev_data) / len(prev_data)
                if prev_avg != 0:
                    change_pct = (curr_avg - prev_avg) / abs(prev_avg) * 100
                    trend['prev_avg'] = round(prev_avg, 2)
                    trend['change_pct'] = round(change_pct, 1)
                    trend['direction'] = 'up' if change_pct > 0 else 'down' if change_pct < 0 else 'stable'
                else:
                    trend['direction'] = 'new'
            else:
                trend['direction'] = 'new'

            # 长期趋势（至少3个时间点）
            history_data = group_by_name(all_history).get(name, [])
            if len(history_data) >= 3:
                sorted_history = sorted(history_data, key=lambda x: x['date'])
                vals = [d['value'] for d in sorted_history]

                # 简单线性回归判断趋势方向
                n = len(vals)
                if n >= 3:
                    x_mean = (n - 1) / 2
                    y_mean = sum(vals) / n
                    numerator = sum((i - x_mean) * (vals[i] - y_mean) for i in range(n))
                    denominator = sum((i - x_mean) ** 2 for i in range(n))

                    if denominator != 0:
                        slope = numerator / denominator
                        if slope > 0:
                            trend['long_term_trend'] = 'rising'
                        elif slope < 0:
                            trend['long_term_trend'] = 'falling'
                        else:
                            trend['long_term_trend'] = 'stable'

                        # 趋势强度
                        trend['trend_strength'] = round(abs(slope) / max(abs(y_mean), 0.001) * 100, 2)

            # 判断好坏
            trend['assessment'] = self._assess_trend(name, trend)

            trends.append(trend)

        # 按变化幅度排序
        trends.sort(key=lambda x: abs(x.get('change_pct', 0)), reverse=True)

        return trends

    def _assess_trend(self, metric_name, trend):
        """评估趋势好坏"""
        direction = trend.get('direction', 'stable')

        # 下降为好的指标
        good_when_down = ['体重', 'BMI', '体脂率', '脂肪率', '收缩压', '舒张压',
                          '空腹血糖', '餐后血糖', '糖化血红蛋白', '总胆固醇',
                          '低密度脂蛋白', '甘油三酯', 'ALT', 'AST', '尿酸',
                          '肌酐', '白细胞', 'D-二聚体', '超敏C反应蛋白']

        # 上升为好的指标
        good_when_up = ['高密度脂蛋白', '步数', '睡眠时长', '深睡时长', '血红蛋白']

        if direction == 'new':
            return 'new_data'
        if direction == 'stable':
            return 'stable'

        if metric_name in good_when_down:
            return 'improving' if direction == 'down' else 'worsening'
        elif metric_name in good_when_up:
            return 'improving' if direction == 'up' else 'worsening'
        else:
            return 'neutral'

    def _classify_changes(self, trends):
        """分类改善和恶化"""
        improvements = []
        deteriorations = []

        for t in trends:
            if t['assessment'] == 'improving':
                improvements.append({
                    'metric': t['metric_name'],
                    'change': f"{t.get('prev_avg', '?')} → {t['current_avg']} {t['unit']}",
                    'change_pct': t.get('change_pct', 0),
                })
            elif t['assessment'] == 'worsening':
                deteriorations.append({
                    'metric': t['metric_name'],
                    'change': f"{t.get('prev_avg', '?')} → {t['current_avg']} {t['unit']}",
                    'change_pct': t.get('change_pct', 0),
                })

        return improvements, deteriorations

    def _calculate_composite_score(self, current, prev):
        """计算综合健康走势评分"""
        # 基于关键指标的改善/恶化计算
        score = 0
        max_score = 100

        # 关键指标及权重
        key_metrics = {
            '收缩压': {'weight': 15, 'good_direction': 'down', 'threshold': 130},
            '舒张压': {'weight': 10, 'good_direction': 'down', 'threshold': 85},
            '空腹血糖': {'weight': 15, 'good_direction': 'down', 'threshold': 6.1},
            '总胆固醇': {'weight': 10, 'good_direction': 'down', 'threshold': 5.2},
            '低密度脂蛋白': {'weight': 10, 'good_direction': 'down', 'threshold': 3.4},
            'BMI': {'weight': 10, 'good_direction': 'down', 'threshold': 24},
            'ALT': {'weight': 10, 'good_direction': 'down', 'threshold': 40},
            '尿酸': {'weight': 10, 'good_direction': 'down', 'threshold': 420},
            '高密度脂蛋白': {'weight': 10, 'good_direction': 'up', 'threshold': 1.0},
        }

        current_grouped = {}
        for r in current:
            name = r['metric_name']
            if name in key_metrics:
                try:
                    val = float(r['value'])
                except (ValueError, TypeError):
                    continue
                if name not in current_grouped:
                    current_grouped[name] = val

        prev_grouped = {}
        for r in prev:
            name = r['metric_name']
            if name in key_metrics:
                try:
                    val = float(r['value'])
                except (ValueError, TypeError):
                    continue
                if name not in prev_grouped:
                    prev_grouped[name] = val

        earned = 0
        total_weight = 0

        for name, config in key_metrics.items():
            total_weight += config['weight']

            if name in current_grouped:
                curr_val = current_grouped[name]
                threshold = config['threshold']
                good_dir = config['good_direction']

                # 当前值是否在正常范围
                if good_dir == 'down':
                    if curr_val < threshold:
                        earned += config['weight']
                    elif curr_val < threshold * 1.1:
                        earned += config['weight'] * 0.5
                else:  # good when up
                    if curr_val >= threshold:
                        earned += config['weight']
                    elif curr_val >= threshold * 0.9:
                        earned += config['weight'] * 0.5

                # 趋势加分
                if name in prev_grouped:
                    prev_val = prev_grouped[name]
                    if good_dir == 'down' and curr_val < prev_val:
                        earned += config['weight'] * 0.2
                    elif good_dir == 'up' and curr_val > prev_val:
                        earned += config['weight'] * 0.2

        score = round(earned / max(total_weight, 1) * 100, 1) if total_weight > 0 else 0

        # 评级
        if score >= 80:
            grade = 'A'
        elif score >= 60:
            grade = 'B'
        elif score >= 40:
            grade = 'C'
        elif score >= 20:
            grade = 'D'
        else:
            grade = 'E'

        return {
            'score': score,
            'grade': grade,
            'metrics_evaluated': list(current_grouped.keys()),
            'metrics_total': len(key_metrics),
        }

    def _generate_ai_summary(self, overview, trends, improvements, deteriorations, composite_score):
        """AI生成报告总结"""
        # 构建摘要
        parts = []
        parts.append(f"本期共记录{overview['total_records']}条健康数据，来自{len(overview['data_sources'])}个数据源。")
        parts.append(f"异常指标{overview['abnormal_count']}条，异常率{overview['abnormal_rate']}%。")
        parts.append(f"综合健康评分：{composite_score['score']}分（{composite_score['grade']}级）。")

        if improvements:
            imp_text = ', '.join(f"{i['metric']}({i['change_pct']:+.0f}%)" for i in improvements[:5])
            parts.append(f"改善指标：{imp_text}。")

        if deteriorations:
            det_text = ', '.join(f"{d['metric']}({d['change_pct']:+.0f}%)" for d in deteriorations[:5])
            parts.append(f"需关注：{det_text}。")

        # 调用AI生成更深入的分析
        prompt = f"""基于以下健康趋势数据，用100字以内给出总结和建议：

{chr(10).join(parts)}

数据源：{', '.join(overview['data_sources'])}
改善项：{len(improvements)}个
恶化项：{len(deteriorations)}个
综合评分：{composite_score['score']}/{100}

请给出简洁的健康总结和1-2条核心建议。不要做诊断。"""

        data = json.dumps({
            "model": "Agnes-2.0-Flash",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 500
        }).encode()

        req = Request(
            f"{self.bit_assistant_url}/v1/chat/completions",
            data=data,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                ai_text = result['choices'][0]['message']['content']
                return ai_text.strip()
        except Exception as e:
            logger.warning(f"AI总结生成失败: {e}")
            return '。'.join(parts)

    def _save_report(self, db, user_id, report):
        """保存报告到数据库"""
        report_id = report['report_id']
        db.execute(
            """INSERT OR REPLACE INTO trend_reports
               (id, user_id, period, start_date, end_date, report_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (report_id, user_id, report['period'],
             report['start_date'], report['end_date'],
             json.dumps(report, ensure_ascii=False),
             datetime.now().isoformat())
        )
        db.commit()

    def get_reports(self, user_id, limit=10):
        """获取用户历史报告"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        try:
            reports = db.execute(
                """SELECT id, period, start_date, end_date, created_at
                   FROM trend_reports
                   WHERE user_id = ?
                   ORDER BY created_at DESC
                   LIMIT ?""",
                (user_id, limit)
            ).fetchall()
            return [dict(r) for r in reports]
        finally:
            db.close()

    def get_report(self, report_id):
        """获取单份报告详情"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        try:
            row = db.execute(
                "SELECT * FROM trend_reports WHERE id = ?",
                (report_id,)
            ).fetchone()
            if row:
                return json.loads(row['report_json'])
            return None
        finally:
            db.close()
