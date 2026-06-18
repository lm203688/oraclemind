#!/usr/bin/env python3
"""
AIShield AI原生分发脚本
自动在MCP生态中分发AIShield：
1. 扫描Smithery/mcp.so上的热门MCP工具（免费引流）
2. 为每个工具生成安全报告+徽章
3. 在GitHub issue/PR中自动评论安全评分
4. 生成SEO内容
"""
import json
import os
import sys
import time
import hashlib

# 添加父目录
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scanner.scan_cli import scan

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
TOOLS_FILE = os.path.join(DATA_DIR, "tools.json")
AUDITS_FILE = os.path.join(DATA_DIR, "audits.json")

# 热门MCP工具列表（从Smithery/mcp.so/GitHub收集）
POPULAR_MCP_TOOLS = [
    # 官方MCP服务器
    {"source_url": "https://github.com/modelcontextprotocol/servers", "tool_type": "mcp", "name": "MCP Official Servers"},
    {"source_url": "https://github.com/modelcontextprotocol/python-sdk", "tool_type": "mcp", "name": "MCP Python SDK"},
    {"source_url": "https://github.com/modelcontextprotocol/typescript-sdk", "tool_type": "mcp", "name": "MCP TypeScript SDK"},
    # 热门第三方MCP
    {"source_url": "https://github.com/anthropics/claude-code", "tool_type": "mcp", "name": "Claude Code MCP"},
    {"source_url": "https://github.com/github/github-mcp-server", "tool_type": "mcp", "name": "GitHub MCP Server"},
    {"source_url": "https://github.com/punkpeye/awesome-mcp-servers", "tool_type": "mcp", "name": "Awesome MCP Servers"},
    # 文件/数据库类
    {"source_url": "https://github.com/ModelContextProtocol/server-filesystem", "tool_type": "mcp", "name": "Filesystem MCP"},
    {"source_url": "https://github.com/ModelContextProtocol/server-postgres", "tool_type": "mcp", "name": "PostgreSQL MCP"},
    {"source_url": "https://github.com/ModelContextProtocol/server-sqlite", "tool_type": "mcp", "name": "SQLite MCP"},
    # 搜索/浏览器类
    {"source_url": "https://github.com/ModelContextProtocol/server-brave-search", "tool_type": "mcp", "name": "Brave Search MCP"},
    {"source_url": "https://github.com/ModelContextProtocol/server-puppeteer", "tool_type": "mcp", "name": "Puppeteer MCP"},
    # 通讯类
    {"source_url": "https://github.com/ModelContextProtocol/server-slack", "tool_type": "mcp", "name": "Slack MCP"},
    {"source_url": "https://github.com/ModelContextProtocol/server-github", "tool_type": "mcp", "name": "GitHub Official MCP"},
]

def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except:
        return {}

def save_json(path, data):
    tmp_fd, tmp_path = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    except:
        try: os.unlink(tmp_path)
        except: pass

import tempfile

def scan_popular_tools():
    """扫描热门MCP工具，生成安全报告"""
    print(f"🛡️ AIShield 热门MCP工具批量扫描")
    print(f"=" * 50)
    
    results = []
    for i, tool in enumerate(POPULAR_MCP_TOOLS):
        name = tool["name"]
        url = tool["source_url"]
        print(f"\n[{i+1}/{len(POPULAR_MCP_TOOLS)}] 扫描 {name}...")
        
        try:
            result = scan(
                tool_type=tool["tool_type"],
                source_url=url,
                name=name
            )
            
            score = result.get("overall_score", 0)
            badge = result.get("badge_level", "none")
            risk = result.get("risk_level", "safe")
            findings = len(result.get("findings", []))
            
            badge_emoji = {"gold": "🥇", "silver": "🥈", "bronze": "🥉", "none": "⚠️"}
            emoji = badge_emoji.get(badge, "⚠️")
            
            print(f"  {emoji} {badge.upper()} | {score}/100 | {risk} | {findings}个发现")
            
            results.append({
                "name": name,
                "url": url,
                "score": score,
                "badge": badge,
                "risk": risk,
                "findings": findings,
            })
            
            # 间隔3秒避免GitHub API限流
            time.sleep(3)
            
        except Exception as e:
            print(f"  ❌ 扫描失败: {str(e)[:100]}")
            results.append({
                "name": name,
                "url": url,
                "score": 0,
                "badge": "none",
                "risk": "error",
                "findings": 0,
                "error": str(e)[:100],
            })
    
    # 生成汇总报告
    print(f"\n{'=' * 50}")
    print(f"📊 扫描汇总")
    print(f"{'=' * 50}")
    
    gold = sum(1 for r in results if r["badge"] == "gold")
    silver = sum(1 for r in results if r["badge"] == "silver")
    bronze = sum(1 for r in results if r["badge"] == "bronze")
    none = sum(1 for r in results if r["badge"] == "none")
    
    print(f"🥇 Gold: {gold} | 🥈 Silver: {silver} | 🥉 Bronze: {bronze} | ⚠️ None: {none}")
    print(f"平均分: {sum(r['score'] for r in results) / len(results):.1f}/100")
    
    # 生成Markdown报告
    report = generate_markdown_report(results)
    report_path = os.path.join(DATA_DIR, "popular_mcp_security_report.md")
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"\n📄 报告已保存: {report_path}")
    
    return results

def generate_markdown_report(results):
    """生成Markdown格式的安全报告"""
    report = """# 🛡️ 热门MCP工具安全报告

> 由 [AIShield](https://aishield.ai) 自动生成 | AI工具安全审计与认证平台

## 概览

| 工具 | 评分 | 徽章 | 风险 | 发现 |
|------|------|------|------|------|
"""
    badge_emoji = {"gold": "🥇", "silver": "🥈", "bronze": "🥉", "none": "⚠️"}
    for r in sorted(results, key=lambda x: x["score"], reverse=True):
        emoji = badge_emoji.get(r["badge"], "⚠️")
        report += f"| [{r['name']}]({r['url']}) | {r['score']}/100 | {emoji} {r['badge'].upper()} | {r['risk']} | {r['findings']} |\n"
    
    report += f"""
## 统计

- 🥇 Gold: {sum(1 for r in results if r['badge'] == 'gold')}个
- 🥈 Silver: {sum(1 for r in results if r['badge'] == 'silver')}个
- 🥉 Bronze: {sum(1 for r in results if r['badge'] == 'bronze')}个
- ⚠️ None: {sum(1 for r in results if r['badge'] == 'none')}个
- 平均分: {sum(r['score'] for r in results) / len(results):.1f}/100

## 你的MCP工具安全吗？

[免费扫描 →](https://aishield.ai) | [申请API Key](https://aishield.ai/pricing)

---

*由 AIShield v2.0 自动生成 — 让AI工具值得信任 🌐*
"""
    return report

if __name__ == "__main__":
    scan_popular_tools()
