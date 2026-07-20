#!/usr/bin/env python3
"""认证Blueprint - 注册/登录/登出/用户信息"""

import os
import uuid
from flask import Blueprint, request, jsonify, session
from security import (
    hash_password_bcrypt, verify_password_bcrypt, needs_rehash,
    rate_limit, log_audit
)
from logging_config import logger

bp = Blueprint('auth', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/auth/register', methods=['POST'])
@rate_limit('register')
def register():
    """用户注册"""
    data = request.json or {}
    phone = data.get('phone', '').strip()
    nickname = data.get('nickname', '').strip()
    password = data.get('password', '')

    if not phone or not password:
        return jsonify({"success": False, "error": "手机号和密码不能为空"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "密码至少6位"}), 400

    user_id = str(uuid.uuid4())[:8]
    nickname = nickname or f'用户{user_id}'

    db = _get_db()
    try:
        existing = db.execute("SELECT id FROM users WHERE phone = ?", (phone,)).fetchone()
        if existing:
            return jsonify({"success": False, "error": "该手机号已注册"}), 400

        db.execute(
            "INSERT INTO users (id, phone, nickname, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, phone, nickname, hash_password_bcrypt(password))
        )
        db.commit()

        session['user_id'] = user_id
        session['nickname'] = nickname

        log_audit(user_id, 'register', {'phone': phone})
        logger.info(f"新用户注册: {user_id} ({phone})")

        return jsonify({
            "success": True,
            "user_id": user_id,
            "nickname": nickname
        })
    finally:
        db.close()


@bp.route('/api/auth/login', methods=['POST'])
@rate_limit('login')
def login():
    """用户登录"""
    data = request.json or {}
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    if not phone or not password:
        return jsonify({"success": False, "error": "手机号和密码不能为空"}), 400

    db = _get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
        if not user or not verify_password_bcrypt(password, user['password_hash']):
            log_audit('unknown', 'login_failed', {'phone': phone})
            return jsonify({"success": False, "error": "手机号或密码错误"}), 401

        # 如果是旧哈希，升级到bcrypt
        if needs_rehash(user['password_hash']):
            new_hash = hash_password_bcrypt(password)
            db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user['id']))

        db.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?", (user['id'],))
        db.commit()

        session['user_id'] = user['id']
        session['nickname'] = user['nickname']

        log_audit(user['id'], 'login')
        logger.info(f"用户登录: {user['id']} ({phone})")

        return jsonify({
            "success": True,
            "user_id": user['id'],
            "nickname": user['nickname']
        })
    finally:
        db.close()


@bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """退出登录"""
    user_id = session.get('user_id')
    session.clear()
    if user_id:
        log_audit(user_id, 'logout')
    return jsonify({"success": True})


@bp.route('/api/auth/me')
def auth_me():
    """获取当前用户信息"""
    from app import get_current_user
    user = get_current_user()
    if user:
        return jsonify({
            "success": True,
            "user": {
                "id": user['id'],
                "phone": user['phone'],
                "nickname": user['nickname'],
                "avatar": user.get('avatar'),
                "created_at": user['created_at'],
                "last_login": user.get('last_login')
            }
        })
    return jsonify({"success": False, "user": None})


@bp.route('/api/auth/guest', methods=['POST'])
@rate_limit('register')
def guest_login():
    """游客模式"""
    user_id = str(uuid.uuid4())[:8]
    nickname = f'游客{user_id}'

    db = _get_db()
    try:
        db.execute(
            "INSERT OR IGNORE INTO users (id, nickname) VALUES (?, ?)",
            (user_id, nickname)
        )
        db.commit()

        session['user_id'] = user_id
        session['nickname'] = nickname

        log_audit(user_id, 'guest_login')
        return jsonify({
            "success": True,
            "user_id": user_id,
            "nickname": nickname
        })
    finally:
        db.close()


@bp.route('/api/user/profile', methods=['PUT'])
def update_profile():
    """更新用户资料"""
    from app import get_current_user, login_required
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "请先登录"}), 401

    data = request.json or {}
    nickname = data.get('nickname', '').strip()

    if not nickname:
        return jsonify({"success": False, "error": "昵称不能为空"}), 400

    db = _get_db()
    try:
        db.execute("UPDATE users SET nickname = ? WHERE id = ?", (nickname, user['id']))
        db.commit()
        session['nickname'] = nickname
        log_audit(user['id'], 'update_profile', {'nickname': nickname})
        return jsonify({"success": True, "nickname": nickname})
    finally:
        db.close()
