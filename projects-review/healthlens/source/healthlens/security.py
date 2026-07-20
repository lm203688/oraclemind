#!/usr/bin/env python3
"""
安全模块
bcrypt密码哈希 + 速率限制 + 审计日志
"""

import os
import json
import time
import hashlib
import sqlite3
from datetime import datetime
from functools import wraps
from collections import defaultdict
from threading import Lock

import bcrypt
from flask import request, jsonify, session


# ============ bcrypt密码哈希 ============

def hash_password_bcrypt(password: str) -> str:
    """使用bcrypt哈希密码"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password_bcrypt(password: str, hashed: str) -> bool:
    """验证bcrypt密码"""
    if not hashed:
        return False
    # 兼容旧的SHA256哈希（以64位hex结尾且无$分隔符）
    if len(hashed) == 64 and '$' not in hashed:
        # 旧SHA256哈希，用SECRET_KEY验证
        secret = os.environ.get('SECRET_KEY', 'healthlens-secret-key-change-in-production')
        old_hash = hashlib.sha256(f"{password}{secret}".encode()).hexdigest()
        if old_hash == hashed:
            return True
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def needs_rehash(hashed: str) -> bool:
    """检查密码哈希是否需要升级（从SHA256升级到bcrypt）"""
    return len(hashed) == 64 and '$' not in hashed


# ============ 速率限制 ============

class RateLimiter:
    """内存滑动窗口速率限制器"""
    
    def __init__(self):
        self._requests = defaultdict(list)  # key -> [timestamps]
        self._lock = Lock()
    
    def check(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """
        检查是否允许请求
        返回 True=允许, False=被限流
        """
        now = time.time()
        cutoff = now - window_seconds
        
        with self._lock:
            # 清理过期记录
            self._requests[key] = [t for t in self._requests[key] if t > cutoff]
            
            if len(self._requests[key]) >= max_requests:
                return False
            
            self._requests[key].append(now)
            return True
    
    def remaining(self, key: str, max_requests: int, window_seconds: int) -> int:
        """返回剩余可用请求数"""
        now = time.time()
        cutoff = now - window_seconds
        
        with self._lock:
            self._requests[key] = [t for t in self._requests[key] if t > cutoff]
            return max(0, max_requests - len(self._requests[key]))


rate_limiter = RateLimiter()

# 速率限制配置
RATE_LIMITS = {
    'login': {'max': 10, 'window': 60},        # 登录: 10次/分钟
    'register': {'max': 5, 'window': 60},       # 注册: 5次/分钟
    'upload': {'max': 20, 'window': 60},        # 上传: 20次/分钟
    'api': {'max': 100, 'window': 60},          # 普通API: 100次/分钟
    'webhook': {'max': 60, 'window': 60},       # Webhook: 60次/分钟
}


def rate_limit(category: str = 'api'):
    """速率限制装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            config = RATE_LIMITS.get(category, RATE_LIMITS['api'])
            
            # 按IP+用户ID限流
            ip = request.remote_addr or 'unknown'
            user_id = session.get('user_id', 'anonymous')
            key = f"{category}:{ip}:{user_id}"
            
            if not rate_limiter.check(key, config['max'], config['window']):
                remaining = rate_limiter.remaining(key, config['max'], config['window'])
                return jsonify({
                    "success": False,
                    "error": "请求过于频繁，请稍后再试",
                    "rate_limit": {
                        "limit": config['max'],
                        "window": config['window'],
                        "remaining": remaining
                    }
                }), 429
            
            return f(*args, **kwargs)
        return decorated
    return decorator


# ============ 审计日志 ============

def init_audit_table(db_path: str):
    """初始化审计日志表"""
    db = sqlite3.connect(db_path)
    try:
        db.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                ip_address TEXT,
                user_agent TEXT,
                details TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)")
        db.commit()
    finally:
        db.close()


def log_audit(user_id: str, action: str, resource_type: str = None, 
              resource_id: str = None, details: dict = None, db_path: str = None):
    """记录审计日志"""
    if db_path is None:
        db_path = os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
    
    db = sqlite3.connect(db_path)
    try:
        db.execute("""
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            action,
            resource_type,
            resource_id,
            request.remote_addr if request else None,
            request.headers.get('User-Agent', '')[:200] if request else None,
            json.dumps(details, ensure_ascii=False) if details else None
        ))
        db.commit()
    except Exception as e:
        print(f"Audit log error: {e}")
    finally:
        db.close()


def audit_log(action: str, resource_type: str = None):
    """审计日志装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_id = session.get('user_id', 'anonymous')
            result = f(*args, **kwargs)
            # 记录审计日志
            resource_id = kwargs.get('user_id', kwargs.get('report_id', ''))
            log_audit(user_id, action, resource_type, resource_id)
            return result
        return decorated
    return decorator
