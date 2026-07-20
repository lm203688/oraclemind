#!/usr/bin/env python3
"""分析&导出Blueprint - 自动分析/导出/报告"""

import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from security import rate_limit
from logging_config import logger

bp = Blueprint('analysis', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/analyze/<user_id>', methods=['POST'])
@rate_limit('api')
def trigger_analysis(user_id):
    """手动触发自动分析"""
    from app import auto_analyzer
    alerts = auto_analyzer.analyze_latest(user_id)
    return jsonify({
        "success": True,
        "alerts": alerts,
        "alert_count": len(alerts)
    })


@bp.route('/api/analyze/scheduled', methods=['POST'])
def scheduled_analysis():
    """定时分析（内部调用）"""
    from app import auto_analyzer
    results = auto_analyzer.run_scheduled_analysis()
    total_alerts = sum(len(v) for v in results.values())
    return jsonify({
        "success": True,
        "users_analyzed": len(results),
        "total_alerts": total_alerts,
        "results": {k: v for k, v in results.items()}
    })


@bp.route('/api/export/<user_id>')
@rate_limit('api')
def export_data(user_id):
    """导出用户健康数据"""
    format_type = request.args.get('format', 'json')

    db = _get_db()
    try:
        user = db.execute("SELECT id, nickname, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
        records = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? ORDER BY recorded_at",
            (user_id,)
        ).fetchall()
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at",
            (user_id,)
        ).fetchall()
        reports = db.execute(
            "SELECT id, filename, report_type, report_date, ai_summary, created_at FROM reports WHERE user_id = ? ORDER BY report_date",
            (user_id,)
        ).fetchall()

        if format_type == 'json':
            return jsonify({
                "success": True,
                "export_time": datetime.now().isoformat(),
                "user": dict(user) if user else None,
                "records": [dict(r) for r in records],
                "insights": [dict(i) for i in insights],
                "reports": [dict(r) for r in reports]
            })
        elif format_type == 'csv':
            lines = ["日期,指标类型,指标名,值,单位,来源,LOINC,异常"]
            for r in records:
                lines.append(f"{r['recorded_at']},{r['metric_type']},{r['metric_name']},{r['value']},{r['unit']},{r['source']},{r.get('loinc_code','')},{r.get('is_abnormal',0)}")
            csv_content = "\n".join(lines)
            return csv_content, 200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': f'attachment; filename=healthlens_export_{user_id}.csv'
            }
        elif format_type == 'fhir':
            # FHIR R4导出
            from fhir_exporter import export_bundle
            from loinc_mapper import get_loinc
            
            bundle = export_bundle(
                dict(user) if user else {"id": user_id},
                [dict(r) for r in records],
                [dict(i) for i in insights]
            )
            return jsonify(bundle)
        else:
            return jsonify({"success": False, "error": "不支持的导出格式"}), 400
    finally:
        db.close()


@bp.route('/api/report/<user_id>')
@rate_limit('api')
def health_report(user_id):
    """生成可分享的健康报告摘要"""
    db = _get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        since = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        records = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? AND recorded_at >= ? ORDER BY recorded_at DESC",
            (user_id, since)
        ).fetchall()
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
            (user_id,)
        ).fetchall()
        sources = db.execute(
            "SELECT DISTINCT source FROM health_records WHERE user_id = ?",
            (user_id,)
        ).fetchall()

        type_stats = {}
        for r in records:
            mt = r['metric_type']
            if mt not in type_stats:
                type_stats[mt] = {'count': 0, 'latest': None, 'latest_value': None}
            type_stats[mt]['count'] += 1
            if not type_stats[mt]['latest']:
                type_stats[mt]['latest'] = r['recorded_at']
                type_stats[mt]['latest_value'] = f"{r['value']} {r['unit']}"
                type_stats[mt]['metric_name'] = r['metric_name']

        abnormal = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? AND is_abnormal = 1 ORDER BY recorded_at DESC LIMIT 10",
            (user_id,)
        ).fetchall()

        return jsonify({
            "success": True,
            "generated_at": datetime.now().isoformat(),
            "user": dict(user) if user else None,
            "period": "最近30天",
            "total_records": len(records),
            "sources": [s['source'] for s in sources],
            "type_summary": type_stats,
            "abnormal_count": len(abnormal),
            "abnormal_items": [dict(a) for a in abnormal],
            "insights": [dict(i) for i in insights],
            "disclaimer": "本报告由HealthLens生成，仅供参考，不能替代医疗诊断。如有异常请及时就医。"
        })
    finally:
        db.close()


@bp.route('/api/mcp', methods=['POST'])
def mcp_endpoint():
    """MCP Server端点 - 供AI工具调用"""
    from mcp_server import HealthLensMCPServer
    mcp = HealthLensMCPServer()
    request_data = request.json or {}
    result = mcp.handle_mcp_request(request_data)
    return jsonify(result)
