#!/usr/bin/env python3
"""
HealthLens v0.6.0 - 跨生态健康数据聚合器

v0.6.0 核心升级：
- OCR语义增强：异常指标红黄绿三级分级 + 诊断结论提取 + 风险标签
- 跨源关联分析v2：20+关联规则 + 纵向趋势关联 + AI辅助因果推断
- 纵向趋势报告：周报/月报/年报 + 综合健康评分 + 改善/恶化追踪

v0.5.0 基础架构：
- Blueprint模块化架构
- bcrypt密码 + 速率限制 + 审计日志
- PII自动脱敏 + LOINC标准编码 + FHIR R4导出
- MCP Server (AI工具接口)
- 结构化日志 (loguru) + 数据库迁移管理
"""

import os
import json
import sqlite3
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, session

# 初始化日志（最先执行）
from logging_config import init_logger, logger
init_logger()

from ocr_engine import MedicalReportParser
from apple_health import AppleHealthParser
from health_analyzer import HealthAnalyzer
from data_connectors import (
    WithingsConnector, WebhookReceiver, AutoAnalyzer,
    get_connector, list_available_connectors
)
from security import init_audit_table
from migrations import run_migrations

# ============ App配置 ============
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(32).hex())

BIT_ASSISTANT_URL = os.environ.get("BIT_ASSISTANT_URL", "http://150.158.119.19:8431")

# ============ 组件初始化 ============
ocr_parser = MedicalReportParser(bit_assistant_url=BIT_ASSISTANT_URL)
apple_parser = AppleHealthParser()
analyzer = HealthAnalyzer(bit_assistant_url=BIT_ASSISTANT_URL)
webhook_receiver = WebhookReceiver()
auto_analyzer = AutoAnalyzer(bit_assistant_url=BIT_ASSISTANT_URL)
withings = WithingsConnector()

# ============ 数据库 ============
def get_db():
    db = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db


def init_db():
    """初始化数据库（执行迁移）"""
    os.makedirs(os.path.dirname(app.config['DATABASE']), exist_ok=True)
    logger.info("执行数据库迁移...")
    count = run_migrations()
    logger.info(f"数据库迁移完成，{count}个迁移已执行")
    # 初始化审计表
    init_audit_table(app.config['DATABASE'])


def get_current_user():
    """获取当前登录用户"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    db = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(user) if user else None
    finally:
        db.close()


def login_required(f):
    """登录验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"success": False, "error": "请先登录"}), 401
        return f(*args, **kwargs)
    return decorated


# ============ 注册Blueprint ============
from blueprints.auth import bp as auth_bp
from blueprints.upload import bp as upload_bp
from blueprints.health import bp as health_bp
from blueprints.connectors import bp as connectors_bp
from blueprints.webhooks import bp as webhooks_bp
from blueprints.analysis import bp as analysis_bp
from blueprints.trends import bp as trends_bp

app.register_blueprint(auth_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(health_bp)
app.register_blueprint(connectors_bp)
app.register_blueprint(webhooks_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(trends_bp)


# ============ 页面路由 ============
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/profile')
def profile_page():
    return render_template('profile.html')


# ============ 用户API（兼容旧API） ============
@app.route('/api/user', methods=['POST'])
def create_user():
    """创建用户（兼容旧API）"""
    import uuid
    data = request.json or {}
    user_id = data.get('user_id', str(uuid.uuid4())[:8])
    nickname = data.get('nickname', f'用户{user_id}')
    db = get_db()
    try:
        db.execute("INSERT OR IGNORE INTO users (id, nickname) VALUES (?, ?)", (user_id, nickname))
        db.commit()
        return jsonify({"success": True, "user_id": user_id})
    finally:
        db.close()


# ============ 健康检查 ============
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "HealthLens",
        "version": "0.6.0",
        "features": [
            "bcrypt_auth", "rate_limiting", "audit_log", "pii_sanitizer",
            "loinc_mapping", "fhir_export", "mcp_server", "structured_logging"
        ]
    })


# ============ OpenAPI文档 ============
@app.route('/api/docs')
def api_docs():
    """API文档入口"""
    return jsonify({
        "name": "HealthLens API",
        "version": "0.6.0",
        "description": "跨生态健康数据聚合平台 API",
        "openapi_url": "/api/openapi.json",
        "endpoints": {
            "auth": ["/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/me", "/api/auth/guest"],
            "upload": ["/api/upload/report", "/api/upload/apple-health"],
            "health": ["/api/dashboard/<user_id>", "/api/health/summary/<user_id>", "/api/health/trends/<user_id>", "/api/insights/<user_id>", "/api/ask"],
            "connectors": ["/api/connectors", "/api/connections", "/api/connect/withings/auth", "/api/connect/withings/callback", "/api/connect/<source>/sync"],
            "webhooks": ["/api/webhook/<user_id>", "/api/keys"],
            "analysis": ["/api/analyze/<user_id>", "/api/analyze/scheduled", "/api/export/<user_id>?format=json|csv|fhir", "/api/report/<user_id>"],
            "mcp": ["/api/mcp"]
        }
    })


@app.route('/api/openapi.json')
def openapi_spec():
    """OpenAPI 3.0 spec"""
    return jsonify(_get_openapi_spec())


def _get_openapi_spec():
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "HealthLens API",
            "version": "0.6.0",
            "description": "跨生态健康数据聚合平台 - 健康领域的Plaid"
        },
        "servers": [
            {"url": "http://150.158.119.19:8432", "description": "Production"}
        ],
        "paths": {
            "/api/auth/register": {
                "post": {"summary": "用户注册", "tags": ["Auth"]},
            },
            "/api/auth/login": {
                "post": {"summary": "用户登录", "tags": ["Auth"]},
            },
            "/api/auth/logout": {
                "post": {"summary": "退出登录", "tags": ["Auth"]},
            },
            "/api/auth/me": {
                "get": {"summary": "获取当前用户", "tags": ["Auth"]},
            },
            "/api/upload/report": {
                "post": {"summary": "上传体检报告", "tags": ["Upload"]},
            },
            "/api/upload/apple-health": {
                "post": {"summary": "上传Apple Health数据", "tags": ["Upload"]},
            },
            "/api/dashboard/{user_id}": {
                "get": {"summary": "Dashboard数据", "tags": ["Health"]},
            },
            "/api/health/summary/{user_id}": {
                "get": {"summary": "健康概览", "tags": ["Health"]},
            },
            "/api/health/trends/{user_id}": {
                "get": {"summary": "指标趋势", "tags": ["Health"]},
            },
            "/api/insights/{user_id}": {
                "get": {"summary": "AI洞察", "tags": ["Health"]},
            },
            "/api/ask": {
                "post": {"summary": "AI健康问答", "tags": ["Health"]},
            },
            "/api/connectors": {
                "get": {"summary": "可用连接器", "tags": ["Connectors"]},
            },
            "/api/connections": {
                "get": {"summary": "用户数据连接", "tags": ["Connectors"]},
                "post": {"summary": "添加数据连接", "tags": ["Connectors"]},
            },
            "/api/connect/withings/auth": {
                "get": {"summary": "Withings OAuth授权", "tags": ["Connectors"]},
            },
            "/api/connect/{source_type}/sync": {
                "post": {"summary": "手动同步数据", "tags": ["Connectors"]},
            },
            "/api/webhook/{user_id}": {
                "post": {"summary": "接收Webhook数据", "tags": ["Webhook"]},
            },
            "/api/keys": {
                "get": {"summary": "列出API Keys", "tags": ["Webhook"]},
                "post": {"summary": "创建API Key", "tags": ["Webhook"]},
            },
            "/api/keys/{key_id}": {
                "delete": {"summary": "删除API Key", "tags": ["Webhook"]},
            },
            "/api/analyze/{user_id}": {
                "post": {"summary": "手动触发分析", "tags": ["Analysis"]},
            },
            "/api/analyze/scheduled": {
                "post": {"summary": "定时分析（内部）", "tags": ["Analysis"]},
            },
            "/api/export/{user_id}": {
                "get": {"summary": "导出数据(json/csv/fhir)", "tags": ["Analysis"]},
            },
            "/api/report/{user_id}": {
                "get": {"summary": "可分享健康报告", "tags": ["Analysis"]},
            },
            "/api/mcp": {
                "post": {"summary": "MCP Server端点", "tags": ["MCP"]},
            },
            "/health": {
                "get": {"summary": "健康检查", "tags": ["System"]},
            },
        },
        "components": {
            "securitySchemes": {
                "ApiKeyAuth": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "X-API-Key"
                },
                "SessionAuth": {
                    "type": "apiKey",
                    "in": "cookie",
                    "name": "session"
                }
            }
        }
    }


# ============ 错误处理 ============
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "资源不存在"}), 404

@app.errorhandler(429)
def rate_limited(e):
    return jsonify({"success": False, "error": "请求过于频繁，请稍后再试"}), 429

@app.errorhandler(500)
def server_error(e):
    logger.error(f"服务器错误: {e}")
    return jsonify({"success": False, "error": "服务器内部错误"}), 500


# ============ 启动 ============
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8432))
    logger.info(f"HealthLens v0.6.0 启动于端口 {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
