#!/usr/bin/env python3
"""Webhook & API Key Blueprint"""

import os
import json
import hashlib
import uuid
from flask import Blueprint, request, jsonify, session
from security import rate_limit, log_audit
from logging_config import logger

bp = Blueprint('webhooks', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/webhook/<user_id>', methods=['POST'])
@rate_limit('webhook')
def receive_webhook(user_id):
    """接收Webhook数据推送"""
    from app import webhook_receiver, auto_analyzer, get_current_user

    # 验证API Key
    api_key = request.headers.get('X-API-Key')
    if api_key:
        db = _get_db()
        try:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            key_record = db.execute(
                "SELECT * FROM api_keys WHERE key_hash = ? AND user_id = ?",
                (key_hash, user_id)
            ).fetchone()
            if not key_record:
                return jsonify({"success": False, "error": "无效的API Key"}), 401
            db.execute("UPDATE api_keys SET last_used = datetime('now') WHERE id = ?", (key_record['id'],))
            db.commit()
        finally:
            db.close()
    else:
        current = get_current_user()
        if not current or current['id'] != user_id:
            return jsonify({"success": False, "error": "需要API Key或登录"}), 401

    data = request.json or {}
    source = data.get('source', 'webhook')
    data_format = data.get('format', 'healthlens')

    # 记录webhook事件
    db = _get_db()
    try:
        event_id = str(uuid.uuid4())[:8]
        db.execute(
            "INSERT INTO webhook_events (id, user_id, source, event_type, payload) VALUES (?, ?, ?, ?, ?)",
            (event_id, user_id, source, 'data_push', json.dumps(data, ensure_ascii=False)[:5000])
        )
        db.commit()
    finally:
        db.close()

    # LOINC标准化
    if data_format == 'healthlens' and 'records' in data:
        from loinc_mapper import get_loinc
        for r in data['records']:
            metric_name = r.get('metric_name', '')
            mapping = get_loinc(metric_name)
            if mapping:
                r['loinc_code'] = mapping['loinc']
                r['standard_category'] = mapping['category']

    try:
        saved = webhook_receiver.receive(user_id, data, source, data_format)
        alerts = []
        if saved > 0:
            alerts = auto_analyzer.analyze_latest(user_id)

        logger.info(f"Webhook接收: user={user_id}, source={source}, saved={saved}")
        return jsonify({
            "success": True,
            "records_saved": saved,
            "alerts": alerts
        })
    except Exception as e:
        logger.error(f"Webhook处理失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ============ API Key管理 ============

@bp.route('/api/keys', methods=['GET'])
def list_api_keys():
    """列出用户的API Keys"""
    from app import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    db = _get_db()
    try:
        keys = db.execute(
            "SELECT id, key_prefix, name, permissions, last_used, created_at FROM api_keys WHERE user_id = ?",
            (user['id'],)
        ).fetchall()
        return jsonify({"success": True, "keys": [dict(k) for k in keys]})
    finally:
        db.close()


@bp.route('/api/keys', methods=['POST'])
@rate_limit('api')
def create_api_key():
    """创建API Key"""
    from app import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    data = request.json or {}
    name = data.get('name', '默认Key')
    permissions = data.get('permissions', 'read')

    raw_key = f"hl_live_{os.urandom(24).hex()}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:12]

    key_id = str(uuid.uuid4())[:8]
    db = _get_db()
    try:
        db.execute(
            "INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, permissions) VALUES (?, ?, ?, ?, ?, ?)",
            (key_id, user['id'], key_hash, key_prefix, name, permissions)
        )
        db.commit()
    finally:
        db.close()

    log_audit(user['id'], 'create_api_key', {'name': name})
    return jsonify({
        "success": True,
        "key_id": key_id,
        "api_key": raw_key,
        "key_prefix": key_prefix,
        "name": name,
        "permissions": permissions
    })


@bp.route('/api/keys/<key_id>', methods=['DELETE'])
def delete_api_key(key_id):
    """删除API Key"""
    from app import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    db = _get_db()
    try:
        db.execute("DELETE FROM api_keys WHERE id = ? AND user_id = ?", (key_id, user['id']))
        db.commit()
        log_audit(user['id'], 'delete_api_key', {'key_id': key_id})
        return jsonify({"success": True})
    finally:
        db.close()
