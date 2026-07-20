#!/usr/bin/env python3
"""趋势报告Blueprint - 周报/月报/年报 + 纵向趋势"""

import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session
from security import rate_limit
from logging_config import logger

bp = Blueprint('trends', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/trends/report/<user_id>', methods=['POST'])
@rate_limit('api')
def generate_report(user_id):
    """生成趋势报告（周报/月报/年报）"""
    from trend_reporter import TrendReporter

    data = request.get_json(force=True, silent=True) or {}
    period = data.get('period', 'monthly')

    if period not in ('weekly', 'monthly', 'yearly'):
        return jsonify({"success": False, "error": "period只支持weekly/monthly/yearly"}), 400

    try:
        reporter = TrendReporter()
        report = reporter.generate_report(user_id, period)
        return jsonify({"success": True, "report": report})
    except Exception as e:
        logger.error(f"趋势报告生成失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route('/api/trends/reports/<user_id>')
@rate_limit('api')
def list_reports(user_id):
    """获取历史报告列表"""
    from trend_reporter import TrendReporter

    try:
        reporter = TrendReporter()
        reports = reporter.get_reports(user_id, limit=20)
        return jsonify({"success": True, "reports": reports})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route('/api/trends/report-detail/<report_id>')
@rate_limit('api')
def get_report_detail(report_id):
    """获取报告详情"""
    from trend_reporter import TrendReporter

    try:
        reporter = TrendReporter()
        report = reporter.get_report(report_id)
        if report:
            return jsonify({"success": True, "report": report})
        return jsonify({"success": False, "error": "报告不存在"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route('/api/trends/metrics/<user_id>')
@rate_limit('api')
def get_metric_trends(user_id):
    """获取所有指标的历史趋势数据"""
    metric_name = request.args.get('metric', '')
    days = int(request.args.get('days', 180))

    db = _get_db()
    try:
        since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

        if metric_name:
            records = db.execute(
                """SELECT metric_name, value, unit, recorded_at, source
                   FROM health_records
                   WHERE user_id = ? AND metric_name = ? AND recorded_at >= ?
                   ORDER BY recorded_at""",
                (user_id, metric_name, since)
            ).fetchall()
        else:
            # 返回所有有历史数据的指标列表
            records = db.execute(
                """SELECT metric_name, COUNT(*) as cnt, MIN(recorded_at) as earliest,
                          MAX(recorded_at) as latest, AVG(value) as avg_val
                   FROM health_records
                   WHERE user_id = ? AND recorded_at >= ?
                   GROUP BY metric_name
                   HAVING cnt > 1
                   ORDER BY cnt DESC""",
                (user_id, since)
            ).fetchall()
            return jsonify({
                "success": True,
                "metrics": [dict(r) for r in records]
            })

        return jsonify({
            "success": True,
            "metric": metric_name,
            "data_points": [dict(r) for r in records]
        })
    finally:
        db.close()


@bp.route('/api/cross-source/analyze/<user_id>', methods=['POST'])
@rate_limit('api')
def cross_source_analyze(user_id):
    """触发跨源关联分析"""
    from cross_source_analyzer import CrossSourceAnalyzer

    try:
        analyzer = CrossSourceAnalyzer()
        insights = analyzer.analyze(user_id)
        return jsonify({
            "success": True,
            "insights": insights,
            "insight_count": len(insights)
        })
    except Exception as e:
        logger.error(f"跨源分析失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
