#!/usr/bin/env python3
"""
HealthLens 单元测试
覆盖：安全模块、PII脱敏、LOINC映射、FHIR导出、MCP Server
"""

import os
import sys
import json
import tempfile
import sqlite3
import unittest

# 确保能导入项目模块
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestSecurity(unittest.TestCase):
    """安全模块测试"""
    
    def test_bcrypt_hash_and_verify(self):
        from security import hash_password_bcrypt, verify_password_bcrypt
        password = "test123456"
        hashed = hash_password_bcrypt(password)
        self.assertNotEqual(password, hashed)
        self.assertTrue(verify_password_bcrypt(password, hashed))
    
    def test_bcrypt_wrong_password(self):
        from security import hash_password_bcrypt, verify_password_bcrypt
        hashed = hash_password_bcrypt("correct")
        self.assertFalse(verify_password_bcrypt("wrong", hashed))
    
    def test_legacy_sha256_compat(self):
        """测试旧SHA256哈希兼容"""
        import hashlib
        from security import verify_password_bcrypt
        # 使用与security.py相同的默认SECRET_KEY
        secret = 'healthlens-secret-key-change-in-production'
        old_hash = hashlib.sha256(f"password{secret}".encode()).hexdigest()
        # 旧哈希应该能被识别并验证
        self.assertTrue(verify_password_bcrypt("password", old_hash))
    
    def test_needs_rehash(self):
        from security import needs_rehash, hash_password_bcrypt
        import hashlib
        old_hash = hashlib.sha256(b"test").hexdigest()
        self.assertTrue(needs_rehash(old_hash))
        new_hash = hash_password_bcrypt("test")
        self.assertFalse(needs_rehash(new_hash))
    
    def test_rate_limiter(self):
        from security import rate_limiter
        key = "test_key"
        # 前3次允许
        for i in range(3):
            self.assertTrue(rate_limiter.check(key, 3, 60))
        # 第4次被拒
        self.assertFalse(rate_limiter.check(key, 3, 60))


class TestPIISanitizer(unittest.TestCase):
    """PII脱敏测试"""
    
    def test_sanitize_phone(self):
        from pii_sanitizer import sanitize_text
        text = "联系电话：13812345678"
        sanitized = sanitize_text(text)
        self.assertNotIn("13812345678", sanitized)
        self.assertIn("1**********", sanitized)
    
    def test_sanitize_id_card(self):
        from pii_sanitizer import sanitize_text
        text = "身份证号：110101199001011234"
        sanitized = sanitize_text(text)
        self.assertNotIn("110101199001011234", sanitized)
    
    def test_sanitize_email(self):
        from pii_sanitizer import sanitize_text
        text = "邮箱：zhangsan@example.com"
        sanitized = sanitize_text(text)
        self.assertNotIn("zhangsan@example.com", sanitized)
    
    def test_sanitize_name(self):
        from pii_sanitizer import sanitize_text
        text = "姓名：张三丰 性别：男"
        sanitized = sanitize_text(text)
        self.assertNotIn("张三丰", sanitized)
    
    def test_extract_pii(self):
        from pii_sanitizer import extract_pii
        text = "手机13812345678 邮箱test@test.com 身份证110101199001011234"
        pii = extract_pii(text)
        self.assertIn("手机号", pii)
        self.assertIn("邮箱", pii)
        self.assertIn("身份证号", pii)
    
    def test_sanitize_preserves_medical_data(self):
        """脱敏不应影响医学指标数据"""
        from pii_sanitizer import sanitize_text
        text = "姓名：张三 空腹血糖：5.6 mmol/L 收缩压：120 mmHg"
        sanitized = sanitize_text(text)
        self.assertIn("5.6", sanitized)
        self.assertIn("120", sanitized)
        self.assertIn("mmol/L", sanitized)
        self.assertIn("mmHg", sanitized)


class TestLOINCMapper(unittest.TestCase):
    """LOINC映射测试"""
    
    def test_get_loinc_known_metric(self):
        from loinc_mapper import get_loinc
        mapping = get_loinc("空腹血糖")
        self.assertIsNotNone(mapping)
        self.assertEqual(mapping["loinc"], "1558-6")
        self.assertEqual(mapping["unit"], "mmol/L")
    
    def test_get_loinc_unknown_metric(self):
        from loinc_mapper import get_loinc
        mapping = get_loinc("不存在的指标")
        self.assertIsNone(mapping)
    
    def test_check_abnormal_high(self):
        from loinc_mapper import check_abnormal
        # 空腹血糖正常范围 3.9-6.1，7.5是高
        result = check_abnormal("空腹血糖", 7.5)
        self.assertEqual(result, "high")
    
    def test_check_abnormal_low(self):
        from loinc_mapper import check_abnormal
        # 空腹血糖3.0是低
        result = check_abnormal("空腹血糖", 3.0)
        self.assertEqual(result, "low")
    
    def test_check_abnormal_normal(self):
        from loinc_mapper import check_abnormal
        result = check_abnormal("空腹血糖", 5.0)
        self.assertEqual(result, "normal")
    
    def test_check_abnormal_less_than(self):
        from loinc_mapper import check_abnormal
        # 总胆固醇 <5.2 是正常，6.0是高
        result = check_abnormal("总胆固醇", 6.0)
        self.assertEqual(result, "high")
    
    def test_check_abnormal_unknown_metric(self):
        from loinc_mapper import check_abnormal
        result = check_abnormal("神秘指标", 100)
        self.assertEqual(result, "unknown")
    
    def test_loinc_map_coverage(self):
        """验证LOINC_MAP覆盖了关键指标类别"""
        from loinc_mapper import LOINC_MAP
        categories = set(v["category"] for v in LOINC_MAP.values())
        required = {"心血管", "代谢", "血常规", "体成分", "甲状腺", "肿瘤标志物", "微量元素", "凝血", "尿常规"}
        self.assertTrue(required.issubset(categories))
    
    def test_add_loinc_to_metrics(self):
        from loinc_mapper import add_loinc_to_metrics
        metrics = [
            {"metric_name": "空腹血糖", "value": 5.5},
            {"metric_name": "未知指标", "value": 100},
        ]
        result = add_loinc_to_metrics(metrics)
        self.assertEqual(result[0]["loinc_code"], "1558-6")
        self.assertEqual(result[0]["status"], "normal")
        self.assertIsNone(result[1]["loinc_code"])


class TestFHRExporter(unittest.TestCase):
    """FHIR导出测试"""
    
    def test_export_patient(self):
        from fhir_exporter import export_patient
        user = {"id": "test123", "nickname": "测试用户", "phone": "13800138000"}
        patient = export_patient(user)
        self.assertEqual(patient["resourceType"], "Patient")
        self.assertEqual(patient["id"], "test123")
        self.assertEqual(patient["telecom"][0]["value"], "13800138000")
    
    def test_export_observation(self):
        from fhir_exporter import export_observation
        record = {
            "id": "rec1",
            "user_id": "user1",
            "metric_name": "空腹血糖",
            "value": 5.5,
            "unit": "mmol/L",
            "recorded_at": "2026-06-18",
            "source": "体检报告",
            "metadata_json": '{"status": "normal"}'
        }
        loinc_mapping = {"loinc": "1558-6", "unit": "mmol/L", "ref_range": "3.9-6.1"}
        obs = export_observation(record, loinc_mapping)
        self.assertEqual(obs["resourceType"], "Observation")
        self.assertEqual(obs["status"], "final")
        self.assertEqual(obs["code"]["coding"][0]["code"], "1558-6")
        self.assertEqual(obs["valueQuantity"]["value"], 5.5)
        self.assertIn("referenceRange", obs)
    
    def test_export_observation_abnormal(self):
        from fhir_exporter import export_observation
        record = {
            "id": "rec2",
            "user_id": "user1",
            "metric_name": "空腹血糖",
            "value": 8.0,
            "unit": "mmol/L",
            "recorded_at": "2026-06-18",
            "source": "体检报告",
            "metadata_json": '{"status": "high"}'
        }
        obs = export_observation(record, {"loinc": "1558-6", "unit": "mmol/L", "ref_range": "3.9-6.1"})
        self.assertIn("interpretation", obs)
        self.assertEqual(obs["interpretation"][0]["coding"][0]["code"], "H")
    
    def test_export_bundle(self):
        from fhir_exporter import export_bundle
        user = {"id": "u1", "nickname": "测试"}
        records = [
            {"id": "r1", "user_id": "u1", "metric_name": "空腹血糖", "value": 5.5, "unit": "mmol/L", "recorded_at": "2026-06-18", "source": "体检"},
        ]
        insights = [
            {"id": "i1", "title": "测试洞察", "content": "一切正常", "severity": "info"}
        ]
        bundle = export_bundle(user, records, insights)
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertEqual(bundle["total"], 3)  # 1 patient + 1 observation + 1 impression
        self.assertEqual(len(bundle["entry"]), 3)


class TestMCPServer(unittest.TestCase):
    """MCP Server测试"""
    
    def setUp(self):
        """创建临时数据库"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self._create_test_db()
    
    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def _create_test_db(self):
        from migrations import run_migrations
        # 临时替换db路径
        import mcp_server
        original_path = mcp_server.HealthLensMCPServer.__init__
        
        db = sqlite3.connect(self.db_path)
        db.executescript("""
            CREATE TABLE users (id TEXT PRIMARY KEY, nickname TEXT);
            CREATE TABLE health_records (
                id TEXT PRIMARY KEY, user_id TEXT, source TEXT,
                metric_type TEXT, metric_name TEXT, value REAL, unit TEXT,
                recorded_at TEXT, metadata_json TEXT, is_abnormal INTEGER DEFAULT 0,
                loinc_code TEXT, standard_category TEXT, standard_ref_range TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE insights (
                id TEXT PRIMARY KEY, user_id TEXT, insight_type TEXT,
                severity TEXT, title TEXT, content TEXT, sources_json TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        db.execute("INSERT INTO users (id, nickname) VALUES (?, ?)", ("test_user", "测试"))
        db.execute("""INSERT INTO health_records 
            (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, metadata_json, is_abnormal, loinc_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("r1", "test_user", "体检报告", "代谢", "空腹血糖", 5.5, "mmol/L", "2026-06-18", "{}", 0, "1558-6"))
        db.execute("""INSERT INTO health_records 
            (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, metadata_json, is_abnormal, loinc_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("r2", "test_user", "Apple Health", "心血管", "心率", 72, "次/min", "2026-06-18", "{}", 0, "8867-4"))
        db.commit()
        db.close()
    
    def test_get_tools(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        tools = mcp.get_tools()
        self.assertGreater(len(tools), 5)
        tool_names = [t["name"] for t in tools]
        self.assertIn("get_health_summary", tool_names)
        self.assertIn("query_metrics", tool_names)
        self.assertIn("export_fhir", tool_names)
    
    def test_call_tool_health_summary(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.call_tool("get_health_summary", {"user_id": "test_user"})
        self.assertEqual(result["user_id"], "test_user")
        self.assertEqual(result["total_records"], 2)
        self.assertIn("sources", result)
    
    def test_call_tool_query_metrics(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.call_tool("query_metrics", {"user_id": "test_user", "days": 365})
        self.assertEqual(len(result), 2)
    
    def test_call_tool_get_trends(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.call_tool("get_trends", {"user_id": "test_user", "metric_name": "空腹血糖"})
        self.assertIn("metric_name", result)
        self.assertEqual(result["metric_name"], "空腹血糖")
    
    def test_call_tool_get_loinc_mapping(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.call_tool("get_loinc_mapping", {"metric_name": "空腹血糖"})
        self.assertEqual(result["loinc"], "1558-6")
    
    def test_call_unknown_tool(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.call_tool("nonexistent_tool", {})
        self.assertIn("error", result)
    
    def test_handle_mcp_request_tools_list(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.handle_mcp_request({"method": "tools/list"})
        self.assertIn("tools", result)
    
    def test_handle_mcp_request_tools_call(self):
        from mcp_server import HealthLensMCPServer
        mcp = HealthLensMCPServer(db_path=self.db_path)
        result = mcp.handle_mcp_request({
            "method": "tools/call",
            "params": {"name": "get_data_sources", "arguments": {"user_id": "test_user"}}
        })
        self.assertIn("result", result)


class TestMigrations(unittest.TestCase):
    """迁移测试"""
    
    def test_migration_class(self):
        from migrations import Migration
        m = Migration("test", "SELECT 1;")
        self.assertEqual(m.id, "test")
        self.assertEqual(m.sql, "SELECT 1;")
    
    def test_run_migrations_creates_tables(self):
        """测试迁移能创建表"""
        import tempfile
        fd, path = tempfile.mkstemp(suffix='.db')
        os.close(fd)
        
        import migrations
        original_get_db_path = migrations.get_db_path
        migrations.get_db_path = lambda: path
        
        try:
            count = migrations.run_migrations()
            self.assertGreater(count, 0)
            
            # 验证表已创建
            db = sqlite3.connect(path)
            tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            table_names = [t[0] for t in tables]
            self.assertIn("users", table_names)
            self.assertIn("health_records", table_names)
            self.assertIn("audit_logs", table_names)
            self.assertIn("schema_migrations", table_names)
            db.close()
        finally:
            migrations.get_db_path = original_get_db_path
            os.unlink(path)


class TestAppleHealthParser(unittest.TestCase):
    """Apple Health解析器测试"""
    
    def test_health_type_map_exists(self):
        from apple_health import HEALTH_TYPE_MAP
        self.assertIn("HKQuantityTypeIdentifierStepCount", HEALTH_TYPE_MAP)
        self.assertIn("HKQuantityTypeIdentifierHeartRate", HEALTH_TYPE_MAP)
        self.assertIn("HKQuantityTypeIdentifierBloodPressureSystolic", HEALTH_TYPE_MAP)
    
    def test_parse_apple_date(self):
        from apple_health import AppleHealthParser
        parser = AppleHealthParser()
        result = parser._parse_apple_date("2026-01-15 08:30:00 +0800")
        self.assertEqual(result, "2026-01-15")
    
    def test_parse_apple_date_none(self):
        from apple_health import AppleHealthParser
        parser = AppleHealthParser()
        self.assertIsNone(parser._parse_apple_date(None))
        self.assertIsNone(parser._parse_apple_date(""))


if __name__ == '__main__':
    unittest.main(verbosity=2)
