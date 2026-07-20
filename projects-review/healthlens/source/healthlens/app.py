#!/usr/bin/env python3
"""
HealthLens v0.3.0 - 跨生态健康数据聚合器
新增：数据连接器框架 + Withings OAuth2 + Webhook接收器 + 自动分析 + API Key管理
"""

import os
import json
import uuid
import hashlib
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from ocr_engine import MedicalReportParser
from apple_health import AppleHealthParser
from health_analyzer import HealthAnalyzer
from data_connectors import (
    WithingsConnector, WebhookReceiver, AutoAnalyzer,
    get_connector, list_available_connectors
)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'healthlens-secret-key-change-in-production')

# AI引擎地址
BIT_ASSISTANT_URL = os.environ.get("BIT_ASSISTANT_URL", "http://150.158.119.19:8431")

# 初始化组件
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
    os.makedirs(os.path.dirname(app.config['DATABASE']), exist_ok=True)
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE,
            nickname TEXT,
            avatar TEXT,
            password_hash TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            last_login TEXT
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            filename TEXT,
            report_type TEXT DEFAULT 'medical_checkup',
            source TEXT DEFAULT 'upload',
            report_date TEXT,
            raw_text TEXT,
            metrics_json TEXT,
            ai_summary TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS health_records (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            source TEXT,
            metric_type TEXT,
            metric_name TEXT,
            value REAL,
            unit TEXT,
            recorded_at TEXT,
            metadata_json TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS insights (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            insight_type TEXT,
            severity TEXT DEFAULT 'info',
            title TEXT,
            content TEXT,
            sources_json TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS data_connections (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            source_type TEXT,
            status TEXT DEFAULT 'active',
            access_token TEXT,
            refresh_token TEXT,
            token_expires TEXT,
            auth_data TEXT,
            metadata TEXT,
            last_sync TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            key_hash TEXT UNIQUE,
            key_prefix TEXT,
            name TEXT,
            permissions TEXT DEFAULT 'read',
            last_used TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS webhook_events (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            source TEXT,
            event_type TEXT,
            payload TEXT,
            processed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_records_user_type ON health_records(user_id, metric_type);
        CREATE INDEX IF NOT EXISTS idx_records_user_date ON health_records(user_id, recorded_at);
        CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_connections_user ON data_connections(user_id);
    """)
    db.commit()
    db.close()


# ============ 认证工具 ============
def hash_password(password):
    """密码哈希"""
    return hashlib.sha256(f"{password}{app.config['SECRET_KEY']}".encode()).hexdigest()


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


def optional_login(f):
    """可选登录装饰器 - 有登录用登录，没有用default"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            kwargs['current_user_id'] = 'default'
        else:
            kwargs['current_user_id'] = user['id']
        return f(*args, **kwargs)
    return decorated


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


# ============ 认证API ============
@app.route('/api/auth/register', methods=['POST'])
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

    db = get_db()
    try:
        # 检查手机号是否已注册
        existing = db.execute("SELECT id FROM users WHERE phone = ?", (phone,)).fetchone()
        if existing:
            return jsonify({"success": False, "error": "该手机号已注册"}), 400

        db.execute(
            "INSERT INTO users (id, phone, nickname, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, phone, nickname, hash_password(password))
        )
        db.commit()

        # 自动登录
        session['user_id'] = user_id
        session['nickname'] = nickname

        return jsonify({
            "success": True,
            "user_id": user_id,
            "nickname": nickname
        })
    finally:
        db.close()


@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json or {}
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    if not phone or not password:
        return jsonify({"success": False, "error": "手机号和密码不能为空"}), 400

    db = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
        if not user or user['password_hash'] != hash_password(password):
            return jsonify({"success": False, "error": "手机号或密码错误"}), 401

        # 更新最后登录时间
        db.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?", (user['id'],))
        db.commit()

        session['user_id'] = user['id']
        session['nickname'] = user['nickname']

        return jsonify({
            "success": True,
            "user_id": user['id'],
            "nickname": user['nickname']
        })
    finally:
        db.close()


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """退出登录"""
    session.clear()
    return jsonify({"success": True})


@app.route('/api/auth/me')
def auth_me():
    """获取当前用户信息"""
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


@app.route('/api/auth/guest', methods=['POST'])
def guest_login():
    """游客模式 - 快速体验"""
    user_id = str(uuid.uuid4())[:8]
    nickname = f'游客{user_id}'

    db = get_db()
    try:
        db.execute(
            "INSERT OR IGNORE INTO users (id, nickname) VALUES (?, ?)",
            (user_id, nickname)
        )
        db.commit()

        session['user_id'] = user_id
        session['nickname'] = nickname

        return jsonify({
            "success": True,
            "user_id": user_id,
            "nickname": nickname
        })
    finally:
        db.close()


# ============ 用户API ============
@app.route('/api/user', methods=['POST'])
def create_user():
    """创建用户（兼容旧API）"""
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


@app.route('/api/user/profile', methods=['PUT'])
@login_required
def update_profile():
    """更新用户资料"""
    user = get_current_user()
    data = request.json or {}
    nickname = data.get('nickname', '').strip()

    if not nickname:
        return jsonify({"success": False, "error": "昵称不能为空"}), 400

    db = get_db()
    try:
        db.execute("UPDATE users SET nickname = ? WHERE id = ?", (nickname, user['id']))
        db.commit()
        session['nickname'] = nickname
        return jsonify({"success": True, "nickname": nickname})
    finally:
        db.close()


# ============ Dashboard API ============
@app.route('/api/dashboard/<user_id>')
def dashboard_api(user_id):
    """Dashboard数据接口"""
    db = get_db()
    try:
        # 数据源统计
        sources = db.execute(
            "SELECT source, COUNT(*) as cnt FROM health_records WHERE user_id = ? GROUP BY source",
            (user_id,)
        ).fetchall()

        # 全部指标
        metrics = db.execute(
            "SELECT metric_type, metric_name, value, unit, recorded_at, source, metadata_json FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 200",
            (user_id,)
        ).fetchall()

        # 异常指标
        abnormal_count = 0
        for m in metrics:
            meta = json.loads(m['metadata_json']) if m['metadata_json'] else {}
            if meta.get('status') in ('high', 'low', 'abnormal'):
                abnormal_count += 1

        # 洞察
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            (user_id,)
        ).fetchall()

        # 数据连接
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


# ============ 上传API ============
@app.route('/api/upload/report', methods=['POST'])
def upload_report():
    """上传体检报告"""
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有文件"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id', session.get('user_id', 'default'))

    if not file.filename:
        return jsonify({"success": False, "error": "文件名为空"}), 400

    # 保存文件
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.pdf', '.jpg', '.jpeg', '.png', '.bmp'):
        return jsonify({"success": False, "error": f"不支持的格式: {ext}"}), 400

    report_id = str(uuid.uuid4())[:8]
    filename = f"{report_id}{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # OCR解析
    try:
        result = ocr_parser.parse(filepath)
        raw_text = result.get('raw_text', '')
        metrics = result.get('metrics', [])
        ai_summary = result.get('ai_summary', '')
        report_date = result.get('report_date', datetime.now().strftime('%Y-%m-%d'))
    except Exception as e:
        return jsonify({"success": False, "error": f"解析失败: {str(e)}"}), 500

    # 存入数据库
    db = get_db()
    try:
        db.execute(
            "INSERT INTO reports (id, user_id, filename, report_date, raw_text, metrics_json, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (report_id, user_id, filename, report_date, raw_text, json.dumps(metrics, ensure_ascii=False), ai_summary)
        )
        # 存入指标记录
        for m in metrics:
            record_id = str(uuid.uuid4())[:8]
            db.execute(
                "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (record_id, user_id, '体检报告', m.get('category', '其他'), m.get('name', ''),
                 m.get('value_num'), m.get('unit', ''), report_date,
                 json.dumps({'reference': m.get('reference', ''), 'status': m.get('status', ''), 'report_id': report_id}, ensure_ascii=False))
            )
        db.commit()
    finally:
        db.close()

    # 触发关联分析
    try:
        analyzer.trigger_analysis(user_id)
    except:
        pass  # 异步分析，不阻塞

    return jsonify({
        "success": True,
        "report_id": report_id,
        "metrics_count": len(metrics),
        "ai_summary": ai_summary,
        "metrics": metrics[:20]  # 前端预览
    })


@app.route('/api/upload/apple-health', methods=['POST'])
def upload_apple_health():
    """上传Apple Health导出数据"""
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有文件"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id', session.get('user_id', 'default'))

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.xml', '.zip'):
        return jsonify({"success": False, "error": "Apple Health数据需要XML或ZIP格式"}), 400

    # 保存并解析
    file_id = str(uuid.uuid4())[:8]
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"apple_health_{file_id}{ext}")
    file.save(filepath)

    try:
        records = apple_parser.parse(filepath, user_id)
    except Exception as e:
        return jsonify({"success": False, "error": f"解析失败: {str(e)}"}), 500

    # 存入数据库
    db = get_db()
    try:
        for r in records:
            db.execute(
                "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4())[:8], user_id, 'Apple Health', r['metric_type'], r['metric_name'],
                 r['value'], r['unit'], r['recorded_at'], json.dumps(r.get('metadata', {}), ensure_ascii=False))
            )
        db.commit()
    finally:
        db.close()

    # 触发关联分析
    try:
        analyzer.trigger_analysis(user_id)
    except:
        pass

    return jsonify({
        "success": True,
        "records_count": len(records),
        "metric_types": list(set(r['metric_type'] for r in records))
    })


# ============ 健康数据API ============
@app.route('/api/health/summary/<user_id>')
def health_summary(user_id):
    """获取用户健康概览"""
    db = get_db()
    try:
        # 最新体检指标
        latest_report = db.execute(
            "SELECT * FROM reports WHERE user_id = ? ORDER BY report_date DESC LIMIT 1", (user_id,)
        ).fetchone()

        # 指标趋势
        metrics = db.execute(
            "SELECT metric_type, metric_name, value, unit, recorded_at, source FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100",
            (user_id,)
        ).fetchall()

        # 洞察
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,)
        ).fetchall()

        # 数据源统计
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


@app.route('/api/health/trends/<user_id>')
def health_trends(user_id):
    """获取指标趋势"""
    metric_type = request.args.get('type', '')
    days = int(request.args.get('days', 90))

    db = get_db()
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


@app.route('/api/insights/<user_id>')
def get_insights(user_id):
    """获取AI洞察"""
    db = get_db()
    try:
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,)
        ).fetchall()
        return jsonify({"success": True, "insights": [dict(i) for i in insights]})
    finally:
        db.close()


@app.route('/api/ask', methods=['POST'])
def ask_ai():
    """向AI提问健康问题"""
    data = request.json
    user_id = data.get('user_id', session.get('user_id', 'default'))
    question = data.get('question', '')

    if not question:
        return jsonify({"success": False, "error": "请输入问题"}), 400

    # 获取用户健康上下文
    db = get_db()
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

    # 构建上下文
    context = "用户健康数据摘要：\n"
    for m in metrics[:20]:
        context += f"- {m['metric_name']}: {m['value']} {m['unit']} ({m['recorded_at']}, 来源:{m['source']})\n"
    if insights:
        context += "\n已有洞察：\n"
        for i in insights:
            context += f"- {i['title']}: {i['content']}\n"

    # 调用比特助手
    try:
        answer = analyzer.ask_health_question(context, question)
        return jsonify({"success": True, "answer": answer})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============ 数据连接API ============
@app.route('/api/connections', methods=['GET'])
@login_required
def get_connections():
    """获取用户数据连接"""
    user = get_current_user()
    db = get_db()
    try:
        connections = db.execute(
            "SELECT * FROM data_connections WHERE user_id = ?",
            (user['id'],)
        ).fetchall()
        return jsonify({"success": True, "connections": [dict(c) for c in connections]})
    finally:
        db.close()


@app.route('/api/connections', methods=['POST'])
@login_required
def add_connection():
    """添加数据连接"""
    user = get_current_user()
    data = request.json or {}
    source_type = data.get('source_type', '')

    if source_type not in ('apple_health', 'xiaomi', 'huawei', 'fitbit', 'garmin', 'wechat_sports'):
        return jsonify({"success": False, "error": "不支持的数据源"}), 400

    conn_id = str(uuid.uuid4())[:8]
    db = get_db()
    try:
        db.execute(
            "INSERT INTO data_connections (id, user_id, source_type, auth_data) VALUES (?, ?, ?, ?)",
            (conn_id, user['id'], source_type, json.dumps(data.get('auth_data', {}), ensure_ascii=False))
        )
        db.commit()
        return jsonify({"success": True, "connection_id": conn_id})
    finally:
        db.close()


# ============ 数据导出API ============
@app.route('/api/export/<user_id>')
def export_data(user_id):
    """导出用户健康数据"""
    format_type = request.args.get('format', 'json')

    db = get_db()
    try:
        # 用户信息
        user = db.execute("SELECT id, nickname, created_at FROM users WHERE id = ?", (user_id,)).fetchone()

        # 健康记录
        records = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? ORDER BY recorded_at",
            (user_id,)
        ).fetchall()

        # 洞察
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at",
            (user_id,)
        ).fetchall()

        # 报告
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
            # 简单CSV导出
            lines = ["日期,指标类型,指标名,值,单位,来源"]
            for r in records:
                lines.append(f"{r['recorded_at']},{r['metric_type']},{r['metric_name']},{r['value']},{r['unit']},{r['source']}")
            csv_content = "\n".join(lines)
            return csv_content, 200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': f'attachment; filename=healthlens_export_{user_id}.csv'
            }
        else:
            return jsonify({"success": False, "error": "不支持的导出格式"}), 400
    finally:
        db.close()


# ============ 数据连接器API ============
@app.route('/api/connectors')
def get_connectors():
    """获取可用数据连接器列表"""
    connectors = list_available_connectors()
    return jsonify({"success": True, "connectors": connectors})


@app.route('/api/connect/withings/auth')
@login_required
def withings_auth():
    """发起Withings OAuth授权"""
    user = get_current_user()
    redirect_uri = request.args.get('redirect_uri', 
        'http://150.158.119.19:8432/api/connect/withings/callback')
    auth_url = withings.get_auth_url(user['id'], redirect_uri)
    if auth_url:
        return jsonify({"success": True, "auth_url": auth_url})
    return jsonify({"success": False, "error": "Withings未配置，请设置WITHINGS_CLIENT_ID"}), 400


@app.route('/api/connect/withings/callback')
def withings_callback():
    """Withings OAuth回调"""
    code = request.args.get('code')
    state = request.args.get('state', '')  # user_id
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
            user_id, 
            result['access_token'],
            result.get('refresh_token'),
            result.get('expires_in'),
            {'withings_userid': result.get('userid', '')}
        )
        # 首次同步
        try:
            withings.sync_data(user_id, conn_id)
        except:
            pass
        return redirect('/profile?connected=withings')
    
    return redirect('/profile?error=withings_auth_failed')


@app.route('/api/connect/<source_type>/sync', methods=['POST'])
@login_required
def sync_connector(source_type):
    """手动触发数据同步"""
    user = get_current_user()
    
    if source_type == 'withings':
        try:
            count = withings.sync_data(user['id'])
            # 同步后自动分析
            alerts = auto_analyzer.analyze_latest(user['id'])
            return jsonify({
                "success": True, 
                "new_records": count,
                "alerts": alerts
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    return jsonify({"success": False, "error": f"不支持的数据源: {source_type}"}), 400


# ============ Webhook API ============
@app.route('/api/webhook/<user_id>', methods=['POST'])
def receive_webhook(user_id):
    """接收Webhook数据推送
    
    支持两种认证方式：
    1. API Key: Header X-API-Key
    2. 签名验证: Header X-Webhook-Signature
    
    请求体格式：
    {
        "source": "my_app",
        "format": "healthlens",  // healthlens | custom
        "records": [
            {"metric_type": "心血管", "metric_name": "心率", "value": 72, "unit": "bpm", "recorded_at": "2026-06-09"}
        ]
    }
    或自定义格式：
    {
        "source": "my_device",
        "format": "custom",
        "heart_rate": 72,
        "blood_pressure_systolic": 120,
        "blood_pressure_diastolic": 80
    }
    """
    # 验证API Key
    api_key = request.headers.get('X-API-Key')
    if api_key:
        db = get_db()
        try:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            key_record = db.execute(
                "SELECT * FROM api_keys WHERE key_hash = ? AND user_id = ?",
                (key_hash, user_id)
            ).fetchone()
            if not key_record:
                return jsonify({"success": False, "error": "无效的API Key"}), 401
            # 更新最后使用时间
            db.execute("UPDATE api_keys SET last_used = datetime('now') WHERE id = ?", (key_record['id'],))
            db.commit()
        finally:
            db.close()
    else:
        # 无API Key时只允许已登录用户
        current = get_current_user()
        if not current or current['id'] != user_id:
            return jsonify({"success": False, "error": "需要API Key或登录"}), 401
    
    data = request.json or {}
    source = data.get('source', 'webhook')
    data_format = data.get('format', 'healthlens')
    
    # 记录webhook事件
    db = get_db()
    try:
        event_id = str(uuid.uuid4())[:8]
        db.execute(
            "INSERT INTO webhook_events (id, user_id, source, event_type, payload) VALUES (?, ?, ?, ?, ?)",
            (event_id, user_id, source, 'data_push', json.dumps(data, ensure_ascii=False)[:5000])
        )
        db.commit()
    finally:
        db.close()
    
    # 处理数据
    try:
        saved = webhook_receiver.receive(user_id, data, source, data_format)
        
        # 自动分析
        alerts = []
        if saved > 0:
            alerts = auto_analyzer.analyze_latest(user_id)
        
        return jsonify({
            "success": True,
            "records_saved": saved,
            "alerts": alerts
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============ API Key管理 ============
@app.route('/api/keys', methods=['GET'])
@login_required
def list_api_keys():
    """列出用户的API Keys"""
    user = get_current_user()
    db = get_db()
    try:
        keys = db.execute(
            "SELECT id, key_prefix, name, permissions, last_used, created_at FROM api_keys WHERE user_id = ?",
            (user['id'],)
        ).fetchall()
        return jsonify({"success": True, "keys": [dict(k) for k in keys]})
    finally:
        db.close()


@app.route('/api/keys', methods=['POST'])
@login_required
def create_api_key():
    """创建API Key"""
    user = get_current_user()
    data = request.json or {}
    name = data.get('name', '默认Key')
    permissions = data.get('permissions', 'read')
    
    # 生成API Key: hl_live_xxxxxxxxxxxxx
    raw_key = f"hl_live_{os.urandom(24).hex()}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:12]  # hl_live_xxxx for display
    
    key_id = str(uuid.uuid4())[:8]
    db = get_db()
    try:
        db.execute(
            "INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, permissions) VALUES (?, ?, ?, ?, ?, ?)",
            (key_id, user['id'], key_hash, key_prefix, name, permissions)
        )
        db.commit()
    finally:
        db.close()
    
    # 只在创建时返回完整key
    return jsonify({
        "success": True,
        "key_id": key_id,
        "api_key": raw_key,  # 只显示一次！
        "key_prefix": key_prefix,
        "name": name,
        "permissions": permissions
    })


@app.route('/api/keys/<key_id>', methods=['DELETE'])
@login_required
def delete_api_key(key_id):
    """删除API Key"""
    user = get_current_user()
    db = get_db()
    try:
        db.execute("DELETE FROM api_keys WHERE id = ? AND user_id = ?", (key_id, user['id']))
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()


# ============ 自动分析API ============
@app.route('/api/analyze/<user_id>', methods=['POST'])
def trigger_analysis(user_id):
    """手动触发自动分析"""
    alerts = auto_analyzer.analyze_latest(user_id)
    return jsonify({
        "success": True,
        "alerts": alerts,
        "alert_count": len(alerts)
    })


@app.route('/api/analyze/scheduled', methods=['POST'])
def scheduled_analysis():
    """定时分析（内部调用）"""
    results = auto_analyzer.run_scheduled_analysis()
    total_alerts = sum(len(v) for v in results.values())
    return jsonify({
        "success": True,
        "users_analyzed": len(results),
        "total_alerts": total_alerts,
        "results": {k: v for k, v in results.items()}
    })


# ============ 健康报告分享 ============
@app.route('/api/report/<user_id>')
def health_report(user_id):
    """生成可分享的健康报告摘要"""
    db = get_db()
    try:
        db.row_factory = sqlite3.Row
        
        # 基本信息
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        
        # 最近30天数据
        since = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        records = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? AND recorded_at >= ? ORDER BY recorded_at DESC",
            (user_id, since)
        ).fetchall()
        
        # 洞察
        insights = db.execute(
            "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
            (user_id,)
        ).fetchall()
        
        # 数据源
        sources = db.execute(
            "SELECT DISTINCT source FROM health_records WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        
        # 按类型分组统计
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
        
        # 异常指标
        abnormal = db.execute(
            "SELECT * FROM health_records WHERE user_id = ? AND is_abnormal = 1 ORDER BY recorded_at DESC LIMIT 10",
            (user_id,)
        ).fetchall()
        
        report = {
            "success": True,
            "generated_at": datetime.now().isoformat(),
            "user": dict(user) if user else None,
            "period": f"最近30天",
            "total_records": len(records),
            "sources": [s['source'] for s in sources],
            "type_summary": type_stats,
            "abnormal_count": len(abnormal),
            "abnormal_items": [dict(a) for a in abnormal],
            "insights": [dict(i) for i in insights],
            "disclaimer": "本报告由HealthLens生成，仅供参考，不能替代医疗诊断。如有异常请及时就医。"
        }
        
        return jsonify(report)
    finally:
        db.close()


# ============ 健康检查 ============
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "HealthLens", "version": "0.4.0"})


if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8432))
    app.run(host='0.0.0.0', port=port, debug=False)
