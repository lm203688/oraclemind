#!/usr/bin/env python3
"""健康数据Blueprint - 概览/趋势/洞察/问答"""

import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session
from security import rate_limit
from logging_config import logger

bp = Blueprint('health', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/dashboard/<user_id>')
@rate_limit('api')
def dashboard_api(user_id):
    """Dashboard数据接口"""
    db = _get_db()
    try:
        sources = db.execute(
            "SELECT source, COUNT(*) as cnt FROM health_records WHERE user_id = ? GROUP BY source",
            (user_id,)
        ).fetchall()

        metrics = db.execute(
            "SELECT metric_type, metric_name, value, unit, recorded_at, source, metadata_json, loinc_code FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 200",
            (user_id,)
        ).fetchall()

        abnormal_count = db.execute(
            "SELECT COUNT(*) FROM health_records WHERE user_id = ? AND is_abnormal = 1",
            (user_id,)
        ).fetchone()[0]

        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            (user_id,)
        ).fetchall()

        connections = db.execute(
            "SELECT * FROM data_connections WHERE user_id = ?",
            (user_id,)
        ).fetchall()

        return jsonify({
            "success": True,
            "user_id": user_id,
            "sources": [dict(s) for s in sources],
            "metrics": [dict(m) for m in metrics],
            "abnormal_count": abnormal_count,
            "insights": [dict(i) for i in insights],
            "connections": [dict(c) for c in connections]
        })
    finally:
        db.close()


@bp.route('/api/health/summary/<user_id>')
@rate_limit('api')
def health_summary(user_id):
    """获取用户健康概览"""
    db = _get_db()
    try:
        latest_report = db.execute(
            "SELECT * FROM reports WHERE user_id = ? ORDER BY report_date DESC LIMIT 1", (user_id,)
        ).fetchone()

        metrics = db.execute(
            "SELECT metric_type, metric_name, value, unit, recorded_at, source, loinc_code FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100",
            (user_id,)
        ).fetchall()

        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,)
        ).fetchall()

        sources = db.execute(
            "SELECT source, COUNT(*) as cnt FROM health_records WHERE user_id = ? GROUP BY source", (user_id,)
        ).fetchall()

        return jsonify({
            "success": True,
            "user_id": user_id,
            "latest_report": dict(latest_report) if latest_report else None,
            "metrics_count": len(metrics),
            "sources": [dict(s) for s in sources],
            "insights": [dict(i) for i in insights],
            "recent_metrics": [dict(m) for m in metrics[:30]]
        })
    finally:
        db.close()


@bp.route('/api/health/trends/<user_id>')
@rate_limit('api')
def health_trends(user_id):
    """获取指标趋势"""
    metric_type = request.args.get('type', '')
    days = int(request.args.get('days', 90))

    db = _get_db()
    try:
        since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

        if metric_type:
            records = db.execute(
                "SELECT metric_name, value, unit, recorded_at, source FROM health_records WHERE user_id = ? AND metric_type = ? AND recorded_at >= ? ORDER BY recorded_at",
                (user_id, metric_type, since)
            ).fetchall()
        else:
            records = db.execute(
                "SELECT metric_type, metric_name, value, unit, recorded_at, source FROM health_records WHERE user_id = ? AND recorded_at >= ? ORDER BY recorded_at",
                (user_id, since)
            ).fetchall()

        return jsonify({
            "success": True,
            "period_days": days,
            "records": [dict(r) for r in records]
        })
    finally:
        db.close()


@bp.route('/api/insights/<user_id>')
@rate_limit('api')
def get_insights(user_id):
    """获取AI洞察"""
    db = _get_db()
    try:
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,)
        ).fetchall()
        return jsonify({"success": True, "insights": [dict(i) for i in insights]})
    finally:
        db.close()


@bp.route('/api/ask', methods=['POST'])
@rate_limit('api')
def ask_ai():
    """向AI提问健康问题"""
    from app import analyzer

    data = request.json
    user_id = data.get('user_id', session.get('user_id', 'default'))
    question = data.get('question', '')

    if not question:
        return jsonify({"success": False, "error": "请输入问题"}), 400

    db = _get_db()
    try:
        metrics = db.execute(
            "SELECT metric_type, metric_name, value, unit, recorded_at, source FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 50",
            (user_id,)
        ).fetchall()
        insights = db.execute(
            "SELECT title, content FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", (user_id,)
        ).fetchall()
    finally:
        db.close()

    context = "用户健康数据摘要：\n"
    for m in metrics[:20]:
        context += f"- {m['metric_name']}: {m['value']} {m['unit']} ({m['recorded_at']}, 来源:{m['source']})\n"
    if insights:
        context += "\n已有洞察：\n"
        for i in insights:
            context += f"- {i['title']}: {i['content']}\n"

    try:
        answer = analyzer.ask_health_question(context, question)
        return jsonify({"success": True, "answer": answer})
    except Exception as e:
        logger.error(f"AI问答失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
