#!/usr/bin/env python3
"""
数据库迁移管理
轻量级迁移框架，替代Alembic（ECS上不装额外依赖）
"""

import os
import sqlite3
from datetime import datetime


MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), 'migrations')


def get_db_path():
    return os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')


def ensure_migrations_table(db):
    """确保迁移记录表存在"""
    db.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            applied_at TEXT DEFAULT (datetime('now'))
        )
    """)
    db.commit()


def get_applied_migrations(db):
    """获取已执行的迁移"""
    ensure_migrations_table(db)
    rows = db.execute("SELECT id FROM schema_migrations").fetchall()
    return {row[0] for row in rows}


def run_migrations():
    """执行所有待执行的迁移"""
    db_path = get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    db = sqlite3.connect(db_path)
    
    applied = get_applied_migrations(db)
    
    # 内联迁移定义（避免文件系统依赖）
    migrations = [
        Migration("001_initial", """
            -- 用户表
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                phone TEXT UNIQUE,
                nickname TEXT,
                avatar TEXT,
                password_hash TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                last_login TEXT
            );
            -- 会话表
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                expires_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            -- 报告表
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
            -- 健康记录表
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
                is_abnormal INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_records_user_type ON health_records(user_id, metric_type);
            CREATE INDEX IF NOT EXISTS idx_records_user_date ON health_records(user_id, recorded_at);
            -- 洞察表
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
            CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);
            -- 数据连接表
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
            CREATE INDEX IF NOT EXISTS idx_connections_user ON data_connections(user_id);
            -- API Keys表
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
            -- Webhook事件表
            CREATE TABLE IF NOT EXISTS webhook_events (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                source TEXT,
                event_type TEXT,
                payload TEXT,
                processed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """),
        
        Migration("002_add_loinc_columns", """
            -- 为健康记录添加LOINC标准编码
            ALTER TABLE health_records ADD COLUMN loinc_code TEXT;
            ALTER TABLE health_records ADD COLUMN standard_category TEXT;
            ALTER TABLE health_records ADD COLUMN standard_ref_range TEXT;
        """),
        
        Migration("003_add_audit_logs", """
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
            );
            CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
            CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
        """),
        
        Migration("004_add_sharing_tokens", """
            CREATE TABLE IF NOT EXISTS share_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                token TEXT UNIQUE,
                expires_at TEXT,
                view_count INTEGER DEFAULT 0,
                max_views INTEGER DEFAULT 10,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_share_token ON share_tokens(token);
        """),
        
        Migration("005_add_trend_reports", """
            -- 纵向趋势报告表
            CREATE TABLE IF NOT EXISTS trend_reports (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                period TEXT,
                start_date TEXT,
                end_date TEXT,
                report_json TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_trend_reports_user ON trend_reports(user_id);
            CREATE INDEX IF NOT EXISTS idx_trend_reports_period ON trend_reports(user_id, period);
            
            -- OCR语义增强数据表
            CREATE TABLE IF NOT EXISTS ocr_semantic_data (
                id TEXT PRIMARY KEY,
                report_id TEXT,
                user_id TEXT,
                severity_tags TEXT,
                diagnostic_conclusions TEXT,
                medication_suggestions TEXT,
                risk_labels TEXT,
                health_warnings TEXT,
                enhanced_summary TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (report_id) REFERENCES reports(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_ocr_semantic_report ON ocr_semantic_data(report_id);
            CREATE INDEX IF NOT EXISTS idx_ocr_semantic_user ON ocr_semantic_data(user_id);
        """),
    ]
    
    applied_count = 0
    for migration in migrations:
        if migration.id not in applied:
            try:
                db.executescript(migration.sql)
                db.execute("INSERT INTO schema_migrations (id) VALUES (?)", (migration.id,))
                db.commit()
                print(f"  ✅ Migration {migration.id} applied")
                applied_count += 1
            except Exception as e:
                print(f"  ❌ Migration {migration.id} failed: {e}")
                db.rollback()
                # 如果是"duplicate column"错误，标记为已执行
                if "duplicate column" in str(e).lower():
                    db.execute("INSERT OR IGNORE INTO schema_migrations (id) VALUES (?)", (migration.id,))
                    db.commit()
    
    db.close()
    return applied_count


class Migration:
    """单个迁移定义"""
    def __init__(self, id, sql):
        self.id = id
        self.sql = sql


if __name__ == '__main__':
    print("Running migrations...")
    count = run_migrations()
    print(f"Done. {count} migrations applied.")
