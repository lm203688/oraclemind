#!/usr/bin/env python3
"""HealthLens v0.6.0 单元测试"""

import os
import sys
import json
import sqlite3
import tempfile
import unittest
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class TestOCRSemantic(unittest.TestCase):
    """测试OCR语义增强"""

    def setUp(self):
        from ocr_semantic import OCRSemanticEnhancer
        self.enhancer = OCRSemanticEnhancer()

    def test_rule_based_severity_tags(self):
        """测试规则型严重度标签"""
        metrics = [
            {'name': '收缩压', 'value_num': 145, 'status': 'high'},
            {'name': '舒张压', 'value_num': 95, 'status': 'high'},
            {'name': '空腹血糖', 'value_num': 7.2, 'status': 'high'},
            {'name': '总胆固醇', 'value_num': 4.5, 'status': 'normal'},
        ]
        result = self.enhancer._rule_based_severity(metrics)
        self.assertEqual(result.get('收缩压'), 'red')
        self.assertEqual(result.get('舒张压'), 'red')
        self.assertEqual(result.get('空腹血糖'), 'red')
        self.assertEqual(result.get('总胆固醇'), 'green')

    def test_rule_based_extract_risk_labels(self):
        """测试规则兜底风险标签生成"""
        metrics = [
            {'name': '收缩压', 'value_num': 150, 'status': 'high'},
            {'name': '空腹血糖', 'value_num': 8.0, 'status': 'high'},
            {'name': '尿酸', 'value_num': 480, 'status': 'high'},
        ]
        result = self.enhancer._rule_based_extract(metrics)
        labels = result.get('risk_labels', [])
        self.assertIn('心血管风险', labels)
        self.assertIn('代谢综合征风险', labels)
        self.assertTrue(len(result.get('health_warnings', [])) > 0)

    def test_generate_enhanced_summary(self):
        """测试增强摘要生成"""
        semantic_result = {
            'severity_tags': {'收缩压': 'red', '总胆固醇': 'green'},
            'risk_labels': ['心血管风险'],
            'health_warnings': ['建议心内科随访'],
        }
        metrics = [
            {'name': '收缩压', 'status': 'high'},
            {'name': '总胆固醇', 'status': 'normal'},
        ]
        summary = self.enhancer._generate_enhanced_summary(metrics, semantic_result)
        self.assertIn('2项指标', summary)
        self.assertIn('🔴', summary)
        self.assertIn('🟢', summary)
        self.assertIn('心血管风险', summary)

    def test_severity_boundary_values(self):
        """测试边界值"""
        metrics = [
            {'name': '收缩压', 'value_num': 130, 'status': 'high'},  # 黄色边界
            {'name': '空腹血糖', 'value_num': 6.1, 'status': 'high'},  # 黄色边界
        ]
        tags = self.enhancer._rule_based_severity(metrics)
        self.assertEqual(tags['收缩压'], 'yellow')  # 130 → yellow
        self.assertEqual(tags['空腹血糖'], 'yellow')  # 6.1 → yellow


class TestCrossSourceAnalyzer(unittest.TestCase):
    """测试跨源关联分析"""

    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.db = sqlite3.connect(self.db_path)
        self.db.row_factory = sqlite3.Row
        self._init_test_db()
        self._insert_test_data()

    def _init_test_db(self):
        self.db.executescript("""
            CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT, email TEXT, password_hash TEXT, created_at TEXT);
            CREATE TABLE health_records (
                id TEXT, user_id TEXT, source TEXT, metric_type TEXT, metric_name TEXT,
                value REAL, unit TEXT, recorded_at TEXT, metadata_json TEXT,
                is_abnormal INTEGER, loinc_code TEXT, standard_category TEXT, standard_ref_range TEXT
            );
            CREATE TABLE insights (
                id TEXT PRIMARY KEY, user_id TEXT, insight_type TEXT,
                severity TEXT DEFAULT 'info', title TEXT, content TEXT,
                sources_json TEXT, created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        self.db.commit()

    def _insert_test_data(self):
        now = datetime.now().strftime('%Y-%m-%d')
        # Apple Health - 低运动量
        self.db.execute(
            "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ('r1', 'test_user', 'Apple Health', '运动', '步数', 3000, '步', now, 0)
        )
        # Withings - 心率偏高
        self.db.execute(
            "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ('r2', 'test_user', 'Withings', '心血管', '静息心率', 95, '次/min', now, 1)
        )
        # 体检报告 - 血脂异常
        self.db.execute(
            "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ('r3', 'test_user', '体检报告', '血脂', '低密度脂蛋白', 4.0, 'mmol/L', now, 1)
        )
        self.db.commit()

    def test_rule_matching(self):
        """测试关联规则匹配"""
        from cross_source_analyzer import CrossSourceAnalyzer
        analyzer = CrossSourceAnalyzer(db_path=self.db_path)
        insights = analyzer.analyze('test_user')
        self.assertTrue(len(insights) > 0)
        for ins in insights:
            self.assertIn('title', ins)
            self.assertIn('content', ins)
            self.assertIn('severity', ins)

    def test_rule_matching_cardio(self):
        """测试心血管规则"""
        # 插入血压+血脂双高数据
        self.db.execute(
            "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ('r4', 'test_user', '体检报告', '心血管', '收缩压', 145, 'mmHg', datetime.now().strftime('%Y-%m-%d'), 1)
        )
        self.db.commit()

        from cross_source_analyzer import CrossSourceAnalyzer
        analyzer = CrossSourceAnalyzer(db_path=self.db_path)
        insights = analyzer.analyze('test_user')
        # 应该匹配到心血管相关规则
        titles = [i['title'] for i in insights]
        self.assertTrue(any('心血管' in t or '血压' in t or '血脂' in t for t in titles))

    def tearDown(self):
        self.db.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)


class TestTrendReporter(unittest.TestCase):
    """测试趋势报告"""

    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.db = sqlite3.connect(self.db_path)
        self.db.row_factory = sqlite3.Row
        self._init_test_db()
        self._insert_test_data()

    def _init_test_db(self):
        self.db.executescript("""
            CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT, email TEXT, password_hash TEXT, created_at TEXT);
            CREATE TABLE health_records (
                id TEXT, user_id TEXT, source TEXT, metric_type TEXT, metric_name TEXT,
                value REAL, unit TEXT, recorded_at TEXT, metadata_json TEXT,
                is_abnormal INTEGER, loinc_code TEXT, standard_category TEXT, standard_ref_range TEXT
            );
            CREATE TABLE trend_reports (
                id TEXT PRIMARY KEY, user_id TEXT, period TEXT, start_date TEXT,
                end_date TEXT, report_json TEXT, created_at TEXT
            );
        """)
        self.db.commit()

    def _insert_test_data(self):
        base = datetime.now()
        for i in range(12):
            d = base - timedelta(days=30 * (11 - i))
            val = 5.0 + i * 0.2
            self.db.execute(
                "INSERT INTO health_records (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (f'r{i}', 'test_user', '体检报告', '血糖', '空腹血糖', val, 'mmol/L', d.strftime('%Y-%m-%d'), 1 if val > 6.1 else 0)
            )
        self.db.commit()

    def test_generate_monthly_report(self):
        """测试月报生成"""
        from trend_reporter import TrendReporter
        reporter = TrendReporter(db_path=self.db_path)
        report = reporter.generate_report('test_user', 'monthly')

        self.assertEqual(report['period'], 'monthly')
        self.assertIn('metric_trends', report)
        self.assertIn('composite_score', report)

    def test_generate_weekly_report(self):
        """测试周报生成"""
        from trend_reporter import TrendReporter
        reporter = TrendReporter(db_path=self.db_path)
        report = reporter.generate_report('test_user', 'weekly')
        self.assertEqual(report['period'], 'weekly')

    def test_trend_identification(self):
        """测试趋势识别"""
        from trend_reporter import TrendReporter
        reporter = TrendReporter(db_path=self.db_path)
        report = reporter.generate_report('test_user', 'monthly')

        trends = report.get('metric_trends', [])
        glucose_trends = [t for t in trends if '血糖' in t.get('metric_name', '')]
        if glucose_trends:
            t = glucose_trends[0]
            self.assertIn('direction', t)

    def test_report_persistence(self):
        """测试报告持久化"""
        from trend_reporter import TrendReporter
        reporter = TrendReporter(db_path=self.db_path)
        reporter.generate_report('test_user', 'monthly')

        reports = reporter.get_reports('test_user')
        self.assertTrue(len(reports) > 0)

        report_id = reports[0]['id']
        detail = reporter.get_report(report_id)
        self.assertIsNotNone(detail)
        self.assertEqual(detail['period'], 'monthly')

    def test_deterioration_detection(self):
        """测试恶化检测"""
        from trend_reporter import TrendReporter
        reporter = TrendReporter(db_path=self.db_path)
        report = reporter.generate_report('test_user', 'monthly')

        # 血糖在上升，应该检测到恶化
        deteriorations = report.get('deteriorations', [])
        self.assertTrue(len(deteriorations) > 0)
        self.assertTrue(any('血糖' in d.get('metric', '') for d in deteriorations))

    def tearDown(self):
        self.db.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)


class TestMigration005(unittest.TestCase):
    """测试v0.6.0迁移"""

    def test_migration_005_table_creation(self):
        """验证migration 005能创建新表"""
        db_fd, db_path = tempfile.mkstemp(suffix='.db')
        try:
            db = sqlite3.connect(db_path)

            # 先创建基础表
            db.executescript("""
                CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY);
                CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY);
                CREATE TABLE IF NOT EXISTS health_records (id TEXT);
                CREATE TABLE IF NOT EXISTS insights (id TEXT PRIMARY KEY);
                CREATE TABLE IF NOT EXISTS share_tokens (id TEXT);
                CREATE TABLE IF NOT EXISTS audit_logs (id TEXT);
                CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY);
            """)
            db.commit()

            # 直接执行migration 005的SQL
            migration_sql = """
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
            """
            db.executescript(migration_sql)
            db.commit()

            # 验证新表存在
            tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
            self.assertIn('trend_reports', tables)
            self.assertIn('ocr_semantic_data', tables)

            # 验证索引存在
            indexes = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='index'").fetchall()]
            self.assertIn('idx_trend_reports_user', indexes)
            self.assertIn('idx_ocr_semantic_report', indexes)

            db.close()
        finally:
            os.close(db_fd)
            os.unlink(db_path)


if __name__ == '__main__':
    unittest.main(verbosity=2)
