"""
AIShield MCP Server - 让任何AI Agent能直接调用AIShield安全扫描
通过MCP协议暴露scan_tool和get_badge两个工具

支持两种模式:
  1. 本地模式(默认): 直接调用scanner本地扫描
  2. 远程模式: 通过AIShield SaaS API扫描, 设置 AISHIELD_REMOTE=1
"""
import json
import sys
import os
import time
from urllib import request as urllib_request

# 添加父目录到path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scanner.scan_cli import scan

# 远程模式配置
REMOTE_MODE = os.environ.get("AISHIELD_REMOTE") == "1"
API_URL = os.environ.get("AISHIELD_API_URL", "https://aishield.ai")
API_KEY = os.environ.get("AISHIELD_API_KEY", "")


def _api_request(endpoint, method="GET", body=None):
    """远程API调用"""
    url = f"{API_URL}{endpoint}"
    headers = {"Content-Type": "application/json", "User-Agent": "AIShield-MCP/2.1"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY
    data = json.dumps(body).encode() if body else None
    req = urllib_request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib_request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}


def remote_scan(source_url, tool_type="mcp", name=""):
    """通过远程API扫描"""
    submit = _api_request("/api/v1/audit", "POST", {
        "tool_type": tool_type, "source_url": source_url, "name": name
    })
    if "error" in submit:
        return submit
    audit_id = submit.get("audit_id")
    if not audit_id:
        return {"error": "no audit_id", "response": submit}
    # 轮询
    for _ in range(60):
        time.sleep(3)
        result = _api_request(f"/api/v1/audit/{audit_id}", "GET")
        if result.get("status") == "completed":
            return result.get("report", result)
        if result.get("status") == "failed":
            return {"error": "scan failed"}
    return {"error": "timeout"}


def local_scan(source_url, tool_type="mcp", name=""):
    """本地扫描"""
    return scan(tool_type=tool_type, source_url=source_url, name=name)

# MCP协议实现（stdio transport）
def send_response(id_, result):
    """发送MCP响应"""
    response = {"jsonrpc": "2.0", "id": id_, "result": result}
    print(json.dumps(response), flush=True)

def send_error(id_, code, message):
    """发送MCP错误"""
    response = {"jsonrpc": "2.0", "id": id_, "error": {"code": code, "message": message}}
    print(json.dumps(response), flush=True)

# 工具定义
TOOLS = [
    {
        "name": "scan_ai_tool",
        "description": "扫描AI工具（MCP/GPT/Skill/Prompt）的安全风险，返回四维评分（安全/隐私/质量/性能）和详细发现。支持GitHub仓库URL、GPT Store链接等。",
        "inputSchema": {
            "type": "object",
            "properties": {
                "source_url": {
                    "type": "string",
                    "description": "工具源码URL（GitHub仓库地址、GPT Store链接等）"
                },
                "tool_type": {
                    "type": "string",
                    "enum": ["mcp", "skill", "gpt", "prompt"],
                    "description": "工具类型：mcp=MCP服务器, skill=AI技能, gpt=GPT应用, prompt=提示词"
                },
                "name": {
                    "type": "string",
                    "description": "工具名称（可选）"
                }
            },
            "required": ["source_url", "tool_type"]
        }
    },
    {
        "name": "get_security_badge",
        "description": "获取AI工具的AIShield安全徽章信息（评分、风险等级、徽章等级），用于在README或文档中展示安全认证状态。",
        "inputSchema": {
            "type": "object",
            "properties": {
                "source_url": {
                    "type": "string",
                    "description": "工具源码URL"
                },
                "name": {
                    "type": "string",
                    "description": "工具名称（可选，与source_url二选一）"
                }
            }
        }
    },
    {
        "name": "batch_scan",
        "description": "批量扫描多个AI工具的安全风险。适合工具市场运营者、安全团队批量审计。返回每个工具的评分摘要。",
        "inputSchema": {
            "type": "object",
            "properties": {
                "tools": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "source_url": {"type": "string"},
                            "tool_type": {"type": "string", "enum": ["mcp", "skill", "gpt", "prompt"]},
                            "name": {"type": "string"}
                        },
                        "required": ["source_url", "tool_type"]
                    },
                    "description": "要扫描的工具列表（最多10个）"
                }
            },
            "required": ["tools"]
        }
    }
]

# 服务器信息
SERVER_INFO = {
    "name": "aishield",
    "version": "2.0.0",
    "description": "AIShield - AI工具安全审计与认证平台。扫描MCP/GPT/Skill/Prompt的安全风险，生成四维评分和安全徽章。"
}

CAPABILITIES = {
    "tools": {}
}

def handle_scan_ai_tool(args):
    """执行安全扫描"""
    source_url = args.get("source_url", "")
    tool_type = args.get("tool_type", "mcp")
    name = args.get("name", "")
    
    if not source_url:
        return {"content": [{"type": "text", "text": "❌ 错误：source_url是必填参数"}]}
    
    # 远程模式 or 本地模式
    if REMOTE_MODE:
        result = remote_scan(source_url, tool_type, name)
        if "error" in result:
            return {"content": [{"type": "text", "text": f"❌ 扫描失败: {result['error']}"}]}
    else:
        result = local_scan(source_url, tool_type, name)
    
    # 格式化输出
    badge_emoji = {"gold": "🥇", "silver": "🥈", "bronze": "🥉", "none": "⚠️"}
    risk_emoji = {"safe": "✅", "medium": "🟡", "high": "🟠", "critical": "🔴"}
    
    summary = f"""🛡️ AIShield 安全审计报告

📦 工具: {result.get('name', source_url.split('/')[-1])}
🔗 URL: {source_url}
🏷️ 类型: {tool_type}

📊 四维评分:
  安全分: {result.get('security_score', 0)}/100
  隐私分: {result.get('privacy_score', 0)}/100
  质量分: {result.get('quality_score', 0)}/100
  性能分: {result.get('performance_score', 0)}/100
  ━━━━━━━━━━━━━━━
  综合分: {result.get('overall_score', 0)}/100

{badge_emoji.get(result.get('badge_level', 'none'), '⚠️')} 徽章等级: {result.get('badge_level', 'none').upper()}
{risk_emoji.get(result.get('risk_level', 'safe'), '✅')} 风险等级: {result.get('risk_level', 'safe')}
📝 发现问题: {len(result.get('findings', []))}个"""

    # 添加关键发现
    critical_findings = [f for f in result.get('findings', []) if f.get('severity') in ('critical', 'high')]
    if critical_findings:
        summary += "\n\n🚨 关键风险:"
        for f in critical_findings[:5]:
            summary += f"\n  • [{f.get('severity', '').upper()}] {f.get('description', '')} ({f.get('file', '')})"
    
    # 添加建议
    if result.get('recommendations'):
        summary += "\n\n💡 建议:"
        for r in result['recommendations'][:3]:
            summary += f"\n  {r}"
    
    # 徽章URL
    badge_url = f"https://aishield.ai/api/v1/badge/{source_url}"
    summary += f"\n\n🏷️ 徽章嵌入: ![AIShield]({badge_url})"
    
    return {"content": [{"type": "text", "text": summary}]}

def handle_get_security_badge(args):
    """获取安全徽章信息"""
    source_url = args.get("source_url", "")
    name = args.get("name", "")
    
    # 从已有数据中查找
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    tools_file = os.path.join(data_dir, "tools.json")
    
    tool_info = None
    if os.path.exists(tools_file):
        with open(tools_file) as f:
            tools = json.load(f)
        if source_url and source_url in tools:
            tool_info = tools[source_url]
        elif name:
            for url, t in tools.items():
                if t.get("name", "").lower() == name.lower():
                    tool_info = t
                    break
    
    if not tool_info:
        return {"content": [{"type": "text", "text": f"❌ 未找到工具的安全评分。请先使用 scan_ai_tool 扫描该工具。\n工具: {name or source_url}"}]}
    
    badge_emoji = {"gold": "🥇", "silver": "🥈", "bronze": "🥉", "none": "⚠️"}
    summary = f"""🏷️ AIShield 安全徽章信息

📦 工具: {tool_info.get('name', '')}
{badge_emoji.get(tool_info.get('badge_level', 'none'), '⚠️')} 徽章: {tool_info.get('badge_level', 'none').upper()}
📊 综合分: {tool_info.get('overall_score', 0)}/100
🔒 安全分: {tool_info.get('security_score', 0)}/100
🛡️ 风险: {tool_info.get('risk_level', 'safe')}
🕐 最近审计: {tool_info.get('last_audit', 'N/A')}

Markdown嵌入:
![AIShield](https://aishield.ai/api/v1/badge-name/{tool_info.get('name', '').replace(' ', '%20')})"""
    
    return {"content": [{"type": "text", "text": summary}]}

def handle_batch_scan(args):
    """批量扫描"""
    tools = args.get("tools", [])
    if not tools:
        return {"content": [{"type": "text", "text": "❌ 错误：tools列表不能为空"}]}
    if len(tools) > 10:
        return {"content": [{"type": "text", "text": "❌ 错误：单次最多扫描10个工具"}]}
    
    results = []
    for t in tools:
        source_url = t.get("source_url", "")
        tool_type = t.get("tool_type", "mcp")
        name = t.get("name", "")
        
        if not source_url:
            results.append(f"⏭️ 跳过（无URL）: {name}")
            continue
        
        try:
            result = scan(tool_type=tool_type, source_url=source_url, name=name)
            badge_emoji = {"gold": "🥇", "silver": "🥈", "bronze": "🥉", "none": "⚠️"}
            tool_name = result.get('name', source_url.split('/')[-1])
            badge = badge_emoji.get(result.get('badge_level', 'none'), '⚠️')
            score = result.get('overall_score', 0)
            risk = result.get('risk_level', 'safe')
            findings = len(result.get('findings', []))
            results.append(f"{badge} {tool_name}: {score}/100 ({risk}) - {findings}个发现")
        except Exception as e:
            results.append(f"❌ {name or source_url}: 扫描失败 - {str(e)[:100]}")
    
    summary = "🛡️ AIShield 批量扫描结果\n\n" + "\n".join(results)
    return {"content": [{"type": "text", "text": summary}]}

def main():
    """MCP Server主循环 - stdio transport"""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            continue
        
        method = request.get("method", "")
        id_ = request.get("id")
        params = request.get("params", {})
        
        if method == "initialize":
            send_response(id_, {
                "protocolVersion": "2024-11-05",
                "capabilities": CAPABILITIES,
                "serverInfo": SERVER_INFO
            })
        elif method == "notifications/initialized":
            # 客户端确认初始化完成，无需响应
            pass
        elif method == "tools/list":
            send_response(id_, {"tools": TOOLS})
        elif method == "tools/call":
            tool_name = params.get("name", "")
            args = params.get("arguments", {})
            
            if tool_name == "scan_ai_tool":
                result = handle_scan_ai_tool(args)
                send_response(id_, result)
            elif tool_name == "get_security_badge":
                result = handle_get_security_badge(args)
                send_response(id_, result)
            elif tool_name == "batch_scan":
                result = handle_batch_scan(args)
                send_response(id_, result)
            else:
                send_error(id_, -32601, f"未知工具: {tool_name}")
        elif method == "ping":
            send_response(id_, {})
        else:
            if id_ is not None:
                send_error(id_, -32601, f"未知方法: {method}")

if __name__ == "__main__":
    main()
