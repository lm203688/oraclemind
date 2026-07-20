#!/usr/bin/env python3
"""
MCP (Model Context Protocol) Server 模块
让AI通过标准化工具调用分析HealthLens健康数据

参考：github.com/queelius/chartfold 的MCP架构
"""

import json
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List


class HealthLensMCPServer:
    """
    MCP Server for HealthLens
    提供标准化工具接口，让LLM能查询和分析健康数据
    """
    
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
        self.tools = self._register_tools()
    
    def _register_tools(self) -> List[Dict]:
        """注册所有可用工具"""
        return [
            {
                "name": "get_health_summary",
                "description": "获取用户健康数据摘要，包括数据源、指标数量、异常数",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "用户ID"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "query_metrics",
                "description": "查询用户的健康指标记录，支持按类型、时间范围过滤",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "metric_name": {"type": "string", "description": "指标名称（可选）"},
                        "metric_type": {"type": "string", "description": "指标类型（可选）"},
                        "days": {"type": "integer", "description": "最近N天", "default": 90},
                        "limit": {"type": "integer", "default": 100}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_trends",
                "description": "获取指标趋势分析，返回上升/下降趋势及变化率",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "metric_name": {"type": "string", "description": "要分析趋势的指标名"},
                        "days": {"type": "integer", "default": 90}
                    },
                    "required": ["user_id", "metric_name"]
                }
            },
            {
                "name": "get_abnormal_metrics",
                "description": "获取所有异常指标，基于LOINC参考范围",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "days": {"type": "integer", "default": 365}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_insights",
                "description": "获取AI生成的健康洞察",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "limit": {"type": "integer", "default": 20}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_cross_source_analysis",
                "description": "获取跨数据源关联分析结果",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_data_sources",
                "description": "获取用户所有数据源及其统计信息",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "compare_periods",
                "description": "对比两个时间段的健康指标变化",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "metric_name": {"type": "string"},
                        "period1_start": {"type": "string", "description": "YYYY-MM-DD"},
                        "period1_end": {"type": "string"},
                        "period2_start": {"type": "string"},
                        "period2_end": {"type": "string"}
                    },
                    "required": ["user_id", "metric_name"]
                }
            },
            {
                "name": "get_loinc_mapping",
                "description": "获取指标的LOINC标准编码和参考范围",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "metric_name": {"type": "string"}
                    },
                    "required": ["metric_name"]
                }
            },
            {
                "name": "export_fhir",
                "description": "将用户健康数据导出为FHIR R4格式",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "days": {"type": "integer", "default": 365}
                    },
                    "required": ["user_id"]
                }
            },
        ]
    
    def get_tools(self) -> List[Dict]:
        """返回所有可用工具（供MCP客户端发现）"""
        return self.tools
    
    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """调用工具"""
        handler = getattr(self, f"_tool_{tool_name}", None)
        if not handler:
            return {"error": f"Unknown tool: {tool_name}"}
        
        try:
            return handler(**arguments)
        except Exception as e:
            return {"error": str(e)}
    
    def _get_db(self):
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        return db
    
    # ============ 工具实现 ============
    
    def _tool_get_health_summary(self, user_id: str) -> Dict:
        """获取健康数据摘要"""
        db = self._get_db()
        try:
            # 数据源统计
            sources = db.execute(
                "SELECT source, COUNT(*) as cnt FROM health_records WHERE user_id = ? GROUP BY source",
                (user_id,)
            ).fetchall()
            
            # 总记录数
            total = db.execute(
                "SELECT COUNT(*) FROM health_records WHERE user_id = ?", (user_id,)
            ).fetchone()[0]
            
            # 异常数
            abnormal = db.execute(
                "SELECT COUNT(*) FROM health_records WHERE user_id = ? AND is_abnormal = 1",
                (user_id,)
            ).fetchone()[0]
            
            # 洞察数
            insights_count = db.execute(
                "SELECT COUNT(*) FROM insights WHERE user_id = ?", (user_id,)
            ).fetchone()[0]
            
            # 最新数据时间
            latest = db.execute(
                "SELECT MAX(recorded_at) FROM health_records WHERE user_id = ?", (user_id,)
            ).fetchone()[0]
            
            # 指标类型分布
            type_dist = db.execute(
                "SELECT metric_type, COUNT(*) as cnt FROM health_records WHERE user_id = ? GROUP BY metric_type",
                (user_id,)
            ).fetchall()
            
            return {
                "user_id": user_id,
                "total_records": total,
                "abnormal_count": abnormal,
                "insights_count": insights_count,
                "latest_record": latest,
                "sources": [dict(s) for s in sources],
                "type_distribution": [dict(t) for t in type_dist]
            }
        finally:
            db.close()
    
    def _tool_query_metrics(self, user_id: str, metric_name: str = None, 
                            metric_type: str = None, days: int = 90, limit: int = 100) -> List[Dict]:
        """查询指标记录"""
        db = self._get_db()
        try:
            since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            query = "SELECT * FROM health_records WHERE user_id = ? AND recorded_at >= ?"
            params = [user_id, since]
            
            if metric_name:
                query += " AND metric_name = ?"
                params.append(metric_name)
            if metric_type:
                query += " AND metric_type = ?"
                params.append(metric_type)
            
            query += " ORDER BY recorded_at DESC LIMIT ?"
            params.append(limit)
            
            rows = db.execute(query, params).fetchall()
            return [dict(r) for r in rows]
        finally:
            db.close()
    
    def _tool_get_trends(self, user_id: str, metric_name: str, days: int = 90) -> Dict:
        """获取指标趋势"""
        db = self._get_db()
        try:
            since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            rows = db.execute(
                """SELECT value, unit, recorded_at, source FROM health_records 
                   WHERE user_id = ? AND metric_name = ? AND recorded_at >= ?
                   ORDER BY recorded_at ASC""",
                (user_id, metric_name, since)
            ).fetchall()
            
            if len(rows) < 2:
                return {"metric_name": metric_name, "trend": "insufficient_data", "data_points": len(rows)}
            
            values = [float(r['value']) for r in rows]
            first_val = values[0]
            last_val = values[-1]
            change_pct = ((last_val - first_val) / max(abs(first_val), 0.001)) * 100
            
            # 检测方向
            if last_val > first_val:
                trend = "increasing" if change_pct > 5 else "stable"
            elif last_val < first_val:
                trend = "decreasing" if change_pct < -5 else "stable"
            else:
                trend = "stable"
            
            # 计算统计量
            avg_val = sum(values) / len(values)
            min_val = min(values)
            max_val = max(values)
            
            return {
                "metric_name": metric_name,
                "unit": rows[0]['unit'],
                "trend": trend,
                "change_pct": round(change_pct, 2),
                "first_value": first_val,
                "last_value": last_val,
                "avg_value": round(avg_val, 2),
                "min_value": min_val,
                "max_value": max_val,
                "data_points": len(values),
                "sources": list(set(r['source'] for r in rows)),
                "period": f"{rows[0]['recorded_at']} to {rows[-1]['recorded_at']}"
            }
        finally:
            db.close()
    
    def _tool_get_abnormal_metrics(self, user_id: str, days: int = 365) -> List[Dict]:
        """获取异常指标"""
        db = self._get_db()
        try:
            since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            rows = db.execute(
                """SELECT * FROM health_records 
                   WHERE user_id = ? AND recorded_at >= ? AND is_abnormal = 1
                   ORDER BY recorded_at DESC""",
                (user_id, since)
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            db.close()
    
    def _tool_get_insights(self, user_id: str, limit: int = 20) -> List[Dict]:
        """获取洞察"""
        db = self._get_db()
        try:
            rows = db.execute(
                "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            db.close()
    
    def _tool_get_cross_source_analysis(self, user_id: str) -> Dict:
        """跨数据源分析"""
        db = self._get_db()
        try:
            # 获取所有数据源
            sources = db.execute(
                "SELECT DISTINCT source FROM health_records WHERE user_id = ?", (user_id,)
            ).fetchall()
            source_names = [s['source'] for s in sources]
            
            if len(source_names) < 2:
                return {"analysis": "单数据源，无法做跨源分析", "sources": source_names}
            
            # 找出每个数据源独有的指标
            source_metrics = {}
            for s in source_names:
                metrics = db.execute(
                    "SELECT DISTINCT metric_name FROM health_records WHERE user_id = ? AND source = ?",
                    (user_id, s)
                ).fetchall()
                source_metrics[s] = [m['metric_name'] for m in metrics]
            
            # 找重叠指标
            all_sets = [set(v) for v in source_metrics.values()]
            overlap = set.intersection(*all_sets) if all_sets else set()
            
            return {
                "sources": source_names,
                "source_metrics": source_metrics,
                "overlapping_metrics": list(overlap),
                "cross_source_opportunities": len(overlap)
            }
        finally:
            db.close()
    
    def _tool_get_data_sources(self, user_id: str) -> List[Dict]:
        """获取数据源统计"""
        db = self._get_db()
        try:
            rows = db.execute(
                """SELECT source, 
                          COUNT(*) as record_count,
                          COUNT(DISTINCT metric_name) as metric_types,
                          MIN(recorded_at) as earliest,
                          MAX(recorded_at) as latest
                   FROM health_records WHERE user_id = ?
                   GROUP BY source""",
                (user_id,)
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            db.close()
    
    def _tool_compare_periods(self, user_id: str, metric_name: str,
                               period1_start: str, period1_end: str = None,
                               period2_start: str = None, period2_end: str = None) -> Dict:
        """对比两个时间段的指标"""
        db = self._get_db()
        try:
            def get_avg(start, end):
                rows = db.execute(
                    """SELECT AVG(value) as avg, MIN(value) as min, MAX(value) as max, COUNT(*) as cnt
                       FROM health_records 
                       WHERE user_id = ? AND metric_name = ? AND recorded_at >= ? AND recorded_at <= ?""",
                    (user_id, metric_name, start, end)
                ).fetchone()
                return dict(rows) if rows else None
            
            p1 = get_avg(period1_start, period1_end)
            p2 = get_avg(period2_start, period2_end) if period2_start else None
            
            result = {"metric_name": metric_name, "period1": p1, "period2": p2}
            
            if p1 and p2 and p1['avg'] and p2['avg']:
                change_pct = ((p2['avg'] - p1['avg']) / max(abs(p1['avg']), 0.001)) * 100
                result["change_pct"] = round(change_pct, 2)
                result["direction"] = "up" if change_pct > 0 else "down"
            
            return result
        finally:
            db.close()
    
    def _tool_get_loinc_mapping(self, metric_name: str) -> Dict:
        """获取LOINC映射"""
        from loinc_mapper import get_loinc
        mapping = get_loinc(metric_name)
        if mapping:
            return {"metric_name": metric_name, **mapping}
        return {"metric_name": metric_name, "loinc": None, "message": "未找到LOINC映射"}
    
    def _tool_export_fhir(self, user_id: str, days: int = 365) -> Dict:
        """导出FHIR"""
        from fhir_exporter import export_bundle
        from loinc_mapper import get_loinc
        
        db = self._get_db()
        try:
            user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return {"error": "User not found"}
            
            since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            records = db.execute(
                "SELECT * FROM health_records WHERE user_id = ? AND recorded_at >= ? ORDER BY recorded_at",
                (user_id, since)
            ).fetchall()
            insights = db.execute(
                "SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
                (user_id,)
            ).fetchall()
            
            bundle = export_bundle(
                dict(user), 
                [dict(r) for r in records],
                [dict(i) for i in insights],
                loinc_map=None  # export_bundle会自动查
            )
            return bundle
        finally:
            db.close()
    
    def handle_mcp_request(self, request_data: Dict) -> Dict:
        """
        处理MCP协议请求
        
        支持的请求类型：
        - {"method": "tools/list"} → 返回工具列表
        - {"method": "tools/call", "params": {"name": "...", "arguments": {...}}}
        """
        method = request_data.get("method", "")
        
        if method == "tools/list":
            return {"tools": self.get_tools()}
        
        elif method == "tools/call":
            params = request_data.get("params", {})
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            result = self.call_tool(tool_name, arguments)
            return {"result": result}
        
        return {"error": f"Unknown method: {method}"}
