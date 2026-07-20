#!/usr/bin/env python3
"""连接器Blueprint - Withings OAuth/同步/连接管理"""

import json
from flask import Blueprint, request, jsonify, session, redirect
from security import rate_limit
from logging_config import logger

bp = Blueprint('connectors', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/connectors')
def get_connectors():
    """获取可用数据连接器列表"""
    from data_connectors import list_available_connectors
    connectors = list_available_connectors()
    return jsonify({"success": True, "connectors": connectors})


@bp.route('/api/connections', methods=['GET'])
def get_connections():
    """获取用户数据连接"""
    from app import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    db = _get_db()
    try:
        connections = db.execute(
            "SELECT id, user_id, source_type, status, last_sync, created_at FROM data_connections WHERE user_id = ?",
            (user['id'],)
        ).fetchall()
        return jsonify({"success": True, "connections": [dict(c) for c in connections]})
    finally:
        db.close()


@bp.route('/api/connections', methods=['POST'])
def add_connection():
    """添加数据连接"""
    from app import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    data = request.json or {}
    source_type = data.get('source_type', '')

    if source_type not in ('apple_health', 'xiaomi', 'huawei', 'fitbit', 'garmin', 'wechat_sports'):
        return jsonify({"success": False, "error": "不支持的数据源"}), 400

    import uuid
    conn_id = str(uuid.uuid4())[:8]
    db = _get_db()
    try:
        db.execute(
            "INSERT INTO data_connections (id, user_id, source_type, auth_data) VALUES (?, ?, ?, ?)",
            (conn_id, user['id'], source_type, json.dumps(data.get('auth_data', {}), ensure_ascii=False))
        )
        db.commit()
        return jsonify({"success": True, "connection_id": conn_id})
    finally:
        db.close()


@bp.route('/api/connect/withings/auth')
def withings_auth():
    """发起Withings OAuth授权"""
    from app import get_current_user, withings
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    redirect_uri = request.args.get('redirect_uri',
        'http://150.158.119.19:8432/api/connect/withings/callback')
    auth_url = withings.get_auth_url(user['id'], redirect_uri)
    if auth_url:
        return jsonify({"success": True, "auth_url": auth_url})
    return jsonify({"success": False, "error": "Withings未配置"}), 400


@bp.route('/api/connect/withings/callback')
def withings_callback():
    """Withings OAuth回调"""
    from app import withings, auto_analyzer

    code = request.args.get('code')
    state = request.args.get('state', '')
    error = request.args.get('error')

    if error:
        return redirect(f'/profile?error=withings_{error}')
    if not code:
        return redirect('/profile?error=withings_no_code')

    redirect_uri = 'http://150.158.119.19:8432/api/connect/withings/callback'
    result = withings.handle_callback(code, redirect_uri)

    if result:
        user_id = state
        conn_id = withings.save_connection(
            user_id, result['access_token'],
            result.get('refresh_token'),
            result.get('expires_in'),
            {'withings_userid': result.get('userid', '')}
        )
        try:
            withings.sync_data(user_id, conn_id)
        except Exception as e:
            logger.warning(f"Withings首次同步失败: {e}")
        return redirect('/profile?connected=withings')

    return redirect('/profile?error=withings_auth_failed')


@bp.route('/api/connect/<source_type>/sync', methods=['POST'])
def sync_connector(source_type):
    """手动触发数据同步"""
    from app import get_current_user, withings, auto_analyzer

    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    if source_type == 'withings':
        try:
            count = withings.sync_data(user['id'])
            alerts = auto_analyzer.analyze_latest(user['id'])
            logger.info(f"Withings同步: {count}条新记录, {len(alerts)}条告警")
            return jsonify({
                "success": True,
                "new_records": count,
                "alerts": alerts
            })
        except Exception as e:
            logger.error(f"Withings同步失败: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": False, "error": f"不支持的数据源: {source_type}"}), 400
