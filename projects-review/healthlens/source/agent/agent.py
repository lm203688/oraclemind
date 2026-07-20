#!/usr/bin/env python3
"""
比特助手 - 辅助Agent v2.0
基于 Agnes 2.0 Flash 模型，OpenAI兼容API
部署在腾讯云ECS，支持Agent间通信（MCP + A2A + OpenAI兼容）

协议支持：
- HTTP REST API（原有）
- OpenAI Chat Completions 兼容（/v1/chat/completions）
- MCP Server（/mcp）
- A2A Agent Card（/.well-known/agent.json）
- OpenAPI 3.1 规范（/api/v1/openapi.json）
"""

import os
import json
import time
import uuid
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ============ 配置 ============
AGENT_BASE_URL = os.environ.get("AGENT_BASE_URL", "http://150.158.119.19:8431")

CONFIG = {
    "agnes_api_base": "https://apihub.agnes-ai.com/v1",
    "agnes_api_key": os.environ.get("AGNES_API_KEY", ""),
    "agnes_model": "agnes-2.0-flash",
    "server_port": int(os.environ.get("AGENT_PORT", 8430)),
    "max_history": 50,
    "agent_base_url": AGENT_BASE_URL,
    "system_prompt": """你是「比特助手」，一个部署在腾讯云上的AI辅助Agent。你的搭档是「黄金比特」，运行在AgentMore平台上的主Agent。

你的职责：
1. 接收其他Agent或人类的任务请求，独立完成并返回结果
2. 擅长：数据分析、代码编写、信息搜索、文档生成、批量处理
3. 遇到不确定的决策，标记为[需确认]返回
4. 所有输出简洁直接，不要客套

工作原则：
- 结果导向，关注可执行输出
- 出错时给出原因和修复建议，不只是报错
- 长任务分步执行，每步汇报进度
- 敏感操作（删除、发送、支付）必须先确认

回复格式：
- 正常结果：直接输出
- 需确认：[需确认] 问题描述
- 出错：[错误] 原因 + 修复建议
- 进度：[进度 x/y] 当前状态
""",
}

# ============ Agent元数据 ============
AGENT_CARD = {
    "name": "比特助手",
    "description": "AI辅助Agent，擅长数据分析、代码编写、信息搜索、文档生成和批量处理",
    "url": AGENT_BASE_URL,
    "version": "2.0.0",
    "provider": {
        "name": "黄金比特",
        "url": "https://github.com/lm203688"
    },
    "capabilities": {
        "streaming": False,
        "pushNotifications": False,
        "stateTransitionHistory": True,
    },
    "skills": [
        {
            "id": "chat",
            "name": "智能对话",
            "description": "通用对话，支持多轮上下文",
            "tags": ["chat", "conversation"],
            "examples": ["帮我分析这段数据", "写一个Python脚本"],
        },
        {
            "id": "code",
            "name": "代码生成",
            "description": "编写、调试、优化代码",
            "tags": ["code", "programming", "debug"],
            "examples": ["写一个快速排序", "这段代码有什么bug"],
        },
        {
            "id": "data_analysis",
            "name": "数据分析",
            "description": "数据清洗、统计分析、可视化建议",
            "tags": ["data", "analysis", "statistics"],
            "examples": ["分析这组数据的趋势", "计算标准差"],
        },
        {
            "id": "search",
            "name": "信息搜索",
            "description": "搜索和整理信息",
            "tags": ["search", "research", "information"],
            "examples": ["搜索最新的AI论文", "整理Python 3.12新特性"],
        },
        {
            "id": "document",
            "name": "文档生成",
            "description": "生成报告、文档、README等",
            "tags": ["document", "report", "writing"],
            "examples": ["生成项目README", "写一份技术方案"],
        },
    ],
    "defaultInputModes": ["text/plain"],
    "defaultOutputModes": ["text/plain"],
}

# MCP工具定义
MCP_TOOLS = [
    {
        "name": "chat",
        "description": "与比特助手对话，支持多轮上下文。适用于通用问答、代码编写、数据分析等任务。",
        "inputSchema": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "你的问题或任务描述"
                },
                "session_id": {
                    "type": "string",
                    "description": "会话ID，用于多轮对话（可选，不传则新建）"
                }
            },
            "required": ["message"]
        }
    },
    {
        "name": "create_task",
        "description": "创建异步任务，适合耗时较长的任务。返回task_id，可通过get_task查询进度。",
        "inputSchema": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "任务描述"
                },
                "session_id": {
                    "type": "string",
                    "description": "会话ID（可选）"
                }
            },
            "required": ["description"]
        }
    },
    {
        "name": "get_task",
        "description": "查询异步任务的状态和结果",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "任务ID"
                }
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "health",
        "description": "检查比特助手的健康状态",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
]

# OpenAPI 3.1 规范
OPENAPI_SPEC = {
    "openapi": "3.1.0",
    "info": {
        "title": "比特助手 API",
        "description": "AI辅助Agent，支持对话、代码生成、数据分析等",
        "version": "2.0.0",
    },
    "servers": [{"url": AGENT_BASE_URL}],
    "paths": {
        "/chat": {
            "post": {
                "summary": "同步对话",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {"type": "string", "description": "消息内容"},
                                    "session_id": {"type": "string", "description": "会话ID（可选）"},
                                    "temperature": {"type": "number", "default": 0.7},
                                    "max_tokens": {"type": "integer", "default": 4096},
                                },
                                "required": ["message"],
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "对话结果",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "success": {"type": "boolean"},
                                        "content": {"type": "string"},
                                        "session_id": {"type": "string"},
                                        "usage": {"type": "object"},
                                        "model": {"type": "string"},
                                    },
                                }
                            }
                        },
                    }
                },
            }
        },
        "/v1/chat/completions": {
            "post": {
                "summary": "OpenAI兼容对话接口",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "model": {"type": "string", "default": "bit-assistant"},
                                    "messages": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "role": {"type": "string"},
                                                "content": {"type": "string"},
                                            },
                                        },
                                    },
                                    "temperature": {"type": "number", "default": 0.7},
                                    "max_tokens": {"type": "integer", "default": 4096},
                                    "stream": {"type": "boolean", "default": False},
                                },
                                "required": ["messages"],
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "OpenAI格式响应",
                        "content": {"application/json": {"schema": {"type": "object"}}},
                    }
                },
            }
        },
        "/health": {"get": {"summary": "健康检查", "responses": {"200": {"description": "OK"}}}},
        "/mcp": {
            "post": {"summary": "MCP协议端点", "responses": {"200": {"description": "MCP响应"}}}
        },
    },
}


# ============ Agnes API 客户端 ============
class AgnesClient:
    """Agnes 2.0 Flash API客户端，OpenAI兼容"""

    def __init__(self, api_base: str, api_key: str, model: str):
        self.api_base = api_base.rstrip("/")
        self.api_key = api_key
        self.model = model

    def chat(self, messages: list, temperature: float = 0.7, max_tokens: int = 4096) -> dict:
        """发送聊天请求"""
        url = f"{self.api_base}/chat/completions"
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        req = Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        try:
            with urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return {
                    "success": True,
                    "content": result["choices"][0]["message"]["content"],
                    "usage": result.get("usage", {}),
                    "model": result.get("model", self.model),
                }
        except HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            return {"success": False, "error": f"HTTP {e.code}: {body[:500]}"}
        except URLError as e:
            return {"success": False, "error": f"连接失败: {e.reason}"}
        except Exception as e:
            return {"success": False, "error": f"未知错误: {str(e)}"}


# ============ 会话管理 ============
class SessionManager:
    """管理多个会话的对话历史"""

    def __init__(self, max_history: int = 50):
        self.sessions = {}
        self.lock = threading.Lock()
        self.max_history = max_history

    def get_or_create(self, session_id: str = None) -> str:
        with self.lock:
            if session_id and session_id in self.sessions:
                return session_id
            sid = session_id or str(uuid.uuid4())[:8]
            self.sessions[sid] = {
                "messages": [],
                "created": time.time(),
                "last_active": time.time(),
            }
            return sid

    def add_message(self, session_id: str, role: str, content: str):
        with self.lock:
            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    "messages": [],
                    "created": time.time(),
                    "last_active": time.time(),
                }
            self.sessions[session_id]["messages"].append({"role": role, "content": content})
            self.sessions[session_id]["last_active"] = time.time()
            msgs = self.sessions[session_id]["messages"]
            if len(msgs) > self.max_history * 2:
                self.sessions[session_id]["messages"] = msgs[-self.max_history * 2 :]

    def get_messages(self, session_id: str) -> list:
        with self.lock:
            if session_id in self.sessions:
                return list(self.sessions[session_id]["messages"])
            return []

    def clear(self, session_id: str):
        with self.lock:
            if session_id in self.sessions:
                self.sessions[session_id]["messages"] = []

    def list_sessions(self) -> list:
        with self.lock:
            return [
                {
                    "id": sid,
                    "messages": len(s["messages"]),
                    "created": datetime.fromtimestamp(s["created"]).isoformat(),
                    "last_active": datetime.fromtimestamp(s["last_active"]).isoformat(),
                }
                for sid, s in self.sessions.items()
            ]


# ============ 任务系统 ============
class TaskManager:
    """管理异步任务"""

    def __init__(self):
        self.tasks = {}
        self.lock = threading.Lock()

    def create(self, description: str) -> str:
        tid = str(uuid.uuid4())[:8]
        with self.lock:
            self.tasks[tid] = {
                "status": "pending",
                "description": description,
                "result": None,
                "created": time.time(),
            }
        return tid

    def update(self, task_id: str, status: str, result: str = None):
        with self.lock:
            if task_id in self.tasks:
                self.tasks[task_id]["status"] = status
                if result is not None:
                    self.tasks[task_id]["result"] = result

    def get(self, task_id: str) -> dict:
        with self.lock:
            return self.tasks.get(task_id, {"status": "not_found"})

    def list_tasks(self) -> list:
        with self.lock:
            return [
                {
                    "id": tid,
                    **t,
                    "created": datetime.fromtimestamp(t["created"]).isoformat(),
                }
                for tid, t in self.tasks.items()
            ]


# ============ MCP协议处理 ============
class MCPHandler:
    """JSON-RPC 2.0 MCP协议处理"""

    def __init__(self, agnes, sessions, tasks):
        self.agnes = agnes
        self.sessions = sessions
        self.tasks = tasks

    def handle(self, request: dict) -> dict:
        method = request.get("method", "")
        req_id = request.get("id")
        params = request.get("params", {})

        handlers = {
            "initialize": self._initialize,
            "initialized": self._initialized,
            "tools/list": self._tools_list,
            "tools/call": self._tools_call,
            "ping": self._ping,
        }

        handler = handlers.get(method)
        if handler:
            try:
                result = handler(params)
                return {"jsonrpc": "2.0", "id": req_id, "result": result}
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32603, "message": str(e)},
                }
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"},
            }

    def _initialize(self, params):
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": {
                "name": "比特助手",
                "version": "2.0.0",
            },
        }

    def _initialized(self, params):
        return {}

    def _tools_list(self, params):
        return {"tools": MCP_TOOLS}

    def _tools_call(self, params):
        tool_name = params.get("name", "")
        arguments = params.get("arguments", {})

        if tool_name == "chat":
            message = arguments.get("message", "")
            session_id = arguments.get("session_id", None)
            if not message:
                return {"content": [{"type": "text", "text": "[错误] 缺少message参数"}], "isError": True}

            sid = self.sessions.get_or_create(session_id)
            messages = [{"role": "system", "content": CONFIG["system_prompt"]}]
            messages.extend(self.sessions.get_messages(sid))
            messages.append({"role": "user", "content": message})

            result = self.agnes.chat(messages)
            if result["success"]:
                self.sessions.add_message(sid, "user", message)
                self.sessions.add_message(sid, "assistant", result["content"])
                return {
                    "content": [{"type": "text", "text": result["content"]}],
                    "isError": False,
                }
            else:
                return {
                    "content": [{"type": "text", "text": f"[错误] {result['error']}"}],
                    "isError": True,
                }

        elif tool_name == "create_task":
            description = arguments.get("description", "")
            session_id = arguments.get("session_id", None)
            if not description:
                return {"content": [{"type": "text", "text": "[错误] 缺少description参数"}], "isError": True}

            task_id = self.tasks.create(description)

            def run_task():
                sid = self.sessions.get_or_create(session_id)
                messages = [{"role": "system", "content": CONFIG["system_prompt"]}]
                messages.extend(self.sessions.get_messages(sid))
                messages.append({"role": "user", "content": description})
                self.tasks.update(task_id, "running")
                result = self.agnes.chat(messages, max_tokens=8192)
                if result["success"]:
                    self.sessions.add_message(sid, "user", description)
                    self.sessions.add_message(sid, "assistant", result["content"])
                    self.tasks.update(task_id, "completed", result["content"])
                else:
                    self.tasks.update(task_id, "failed", result["error"])

            thread = threading.Thread(target=run_task, daemon=True)
            thread.start()

            return {
                "content": [{"type": "text", "text": json.dumps({"task_id": task_id, "status": "pending"}, ensure_ascii=False)}],
                "isError": False,
            }

        elif tool_name == "get_task":
            task_id = arguments.get("task_id", "")
            task = self.tasks.get(task_id)
            return {
                "content": [{"type": "text", "text": json.dumps(task, ensure_ascii=False)}],
                "isError": False,
            }

        elif tool_name == "health":
            return {
                "content": [{"type": "text", "text": json.dumps({"status": "healthy", "model": CONFIG["agnes_model"]}, ensure_ascii=False)}],
                "isError": False,
            }

        else:
            return {
                "content": [{"type": "text", "text": f"未知工具: {tool_name}"}],
                "isError": True,
            }

    def _ping(self, params):
        return {}


# ============ HTTP API ============
class AgentHandler(BaseHTTPRequestHandler):
    """比特助手的HTTP API v2.0"""

    agnes = None
    sessions = None
    tasks = None
    mcp = None

    def _send_json(self, data: dict, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        routes = {
            "/": self._handle_index,
            "/health": self._handle_health,
            "/sessions": self._handle_list_sessions,
            "/tasks": self._handle_list_tasks,
        }

        # Agent发现协议
        if self.path == "/.well-known/agent.json":
            self._handle_agent_card()
            return

        if self.path == "/api/v1/openapi.json":
            self._send_json(OPENAPI_SPEC)
            return

        # /tasks/{id}
        if self.path.startswith("/tasks/") and len(self.path.split("/")) == 3:
            task_id = self.path.split("/")[-1]
            self._send_json(self.tasks.get(task_id))
            return

        # /sessions/{id}/history
        if self.path.startswith("/sessions/") and "/history" in self.path:
            sid = self.path.split("/")[2]
            self._send_json({"session_id": sid, "messages": self.sessions.get_messages(sid)})
            return

        handler = routes.get(self.path.rstrip("/"))
        if handler:
            handler()
        else:
            self._send_json({"error": "Not Found"}, 404)

    def do_POST(self):
        routes = {
            "/chat": self._handle_chat,
            "/task": self._handle_create_task,
            "/sessions/clear": self._handle_clear_session,
            "/mcp": self._handle_mcp,
            "/v1/chat/completions": self._handle_openai_chat,
        }

        handler = routes.get(self.path.rstrip("/"))
        if handler:
            handler()
        else:
            self._send_json({"error": "Not Found"}, 404)

    # --- Agent发现协议 ---

    def _handle_agent_card(self):
        """A2A Agent Card - Google A2A协议兼容"""
        self._send_json(AGENT_CARD)

    # --- MCP协议 ---

    def _handle_mcp(self):
        """MCP JSON-RPC 2.0 端点"""
        body = self._read_body()
        result = self.mcp.handle(body)
        self._send_json(result)

    # --- OpenAI兼容 ---

    def _handle_openai_chat(self):
        """OpenAI Chat Completions 兼容接口 - 其他Agent可直接用OpenAI SDK调用"""
        body = self._read_body()
        messages = body.get("messages", [])
        temperature = body.get("temperature", 0.7)
        max_tokens = body.get("max_tokens", 4096)
        stream = body.get("stream", False)

        if not messages:
            self._send_json({"error": {"message": "messages is required", "type": "invalid_request_error"}}, 400)
            return

        if not self.agnes.api_key:
            self._send_json({"error": {"message": "AGNES_API_KEY未配置", "type": "server_error"}}, 500)
            return

        # 构建消息：如果有system消息就用用户的，否则用默认
        has_system = any(m.get("role") == "system" for m in messages)
        if not has_system:
            messages = [{"role": "system", "content": CONFIG["system_prompt"]}] + messages

        result = self.agnes.chat(messages, temperature=temperature, max_tokens=max_tokens)

        if result["success"]:
            # OpenAI格式响应
            response = {
                "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": "bit-assistant-v2",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": result["content"],
                        },
                        "finish_reason": "stop",
                    }
                ],
                "usage": result.get("usage", {}),
            }
            self._send_json(response)
        else:
            self._send_json(
                {"error": {"message": result["error"], "type": "upstream_error"}},
                502,
            )

    # --- 原有路由 ---

    def _handle_index(self):
        self._send_json({
            "name": "比特助手",
            "version": "2.0.0",
            "model": CONFIG["agnes_model"],
            "status": "running",
            "protocols": {
                "rest": "✅ HTTP REST API",
                "openai": "✅ OpenAI Chat Completions 兼容 (/v1/chat/completions)",
                "mcp": "✅ MCP Server (/mcp)",
                "a2a": "✅ A2A Agent Card (/.well-known/agent.json)",
                "openapi": "✅ OpenAPI 3.1 (/api/v1/openapi.json)",
            },
            "endpoints": {
                "GET /": "此页面",
                "GET /health": "健康检查",
                "POST /chat": "聊天（同步）",
                "POST /task": "创建异步任务",
                "GET /tasks": "任务列表",
                "GET /tasks/{id}": "任务状态",
                "GET /sessions": "会话列表",
                "GET /sessions/{id}/history": "会话历史",
                "POST /sessions/clear": "清空会话",
                "POST /v1/chat/completions": "OpenAI兼容接口",
                "POST /mcp": "MCP协议端点",
                "GET /.well-known/agent.json": "A2A Agent Card",
                "GET /api/v1/openapi.json": "OpenAPI规范",
            },
        })

    def _handle_health(self):
        if not self.agnes.api_key:
            self._send_json({"status": "unhealthy", "error": "AGNES_API_KEY未设置"})
            return
        self._send_json({
            "status": "healthy",
            "model": CONFIG["agnes_model"],
            "api_base": CONFIG["agnes_api_base"],
            "sessions": len(self.sessions.sessions),
            "tasks": len(self.tasks.tasks),
        })

    def _handle_chat(self):
        body = self._read_body()
        message = body.get("message", "")
        session_id = body.get("session_id", None)
        system_override = body.get("system", None)
        temperature = body.get("temperature", 0.7)
        max_tokens = body.get("max_tokens", 4096)

        if not message:
            self._send_json({"error": "缺少message参数"}, 400)
            return

        if not self.agnes.api_key:
            self._send_json({"error": "AGNES_API_KEY未设置，请在环境变量中配置"}, 500)
            return

        sid = self.sessions.get_or_create(session_id)
        system_prompt = system_override or CONFIG["system_prompt"]
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.sessions.get_messages(sid))
        messages.append({"role": "user", "content": message})

        result = self.agnes.chat(messages, temperature=temperature, max_tokens=max_tokens)

        if result["success"]:
            self.sessions.add_message(sid, "user", message)
            self.sessions.add_message(sid, "assistant", result["content"])
            self._send_json({
                "success": True,
                "content": result["content"],
                "session_id": sid,
                "usage": result.get("usage", {}),
                "model": result.get("model", ""),
            })
        else:
            self._send_json({
                "success": False,
                "error": result["error"],
                "session_id": sid,
            }, 502)

    def _handle_create_task(self):
        body = self._read_body()
        description = body.get("description", "")
        session_id = body.get("session_id", None)

        if not description:
            self._send_json({"error": "缺少description参数"}, 400)
            return

        task_id = self.tasks.create(description)

        def run_task():
            sid = self.sessions.get_or_create(session_id)
            messages = [{"role": "system", "content": CONFIG["system_prompt"]}]
            messages.extend(self.sessions.get_messages(sid))
            messages.append({"role": "user", "content": description})
            self.tasks.update(task_id, "running")
            result = self.agnes.chat(messages, max_tokens=8192)
            if result["success"]:
                self.sessions.add_message(sid, "user", description)
                self.sessions.add_message(sid, "assistant", result["content"])
                self.tasks.update(task_id, "completed", result["content"])
            else:
                self.tasks.update(task_id, "failed", result["error"])

        thread = threading.Thread(target=run_task, daemon=True)
        thread.start()

        self._send_json({
            "task_id": task_id,
            "status": "pending",
            "description": description,
        }, 202)

    def _handle_list_sessions(self):
        self._send_json({"sessions": self.sessions.list_sessions()})

    def _handle_list_tasks(self):
        self._send_json({"tasks": self.tasks.list_tasks()})

    def _handle_clear_session(self):
        body = self._read_body()
        session_id = body.get("session_id", "")
        if not session_id:
            self._send_json({"error": "缺少session_id"}, 400)
            return
        self.sessions.clear(session_id)
        self._send_json({"success": True, "session_id": session_id})

    def log_message(self, format, *args):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {args[0]}")


# ============ 启动 ============
def main():
    api_key = CONFIG["agnes_api_key"]
    if not api_key:
        print("⚠️  AGNES_API_KEY 环境变量未设置！")
        print("   请运行: export AGNES_API_KEY=your_api_key")
        print("   注册地址: https://agnes-ai.com")
        print()

    # 初始化组件
    agnes = AgnesClient(
        api_base=CONFIG["agnes_api_base"],
        api_key=api_key,
        model=CONFIG["agnes_model"],
    )
    sessions = SessionManager(max_history=CONFIG["max_history"])
    tasks = TaskManager()
    mcp = MCPHandler(agnes, sessions, tasks)

    # 注入到Handler
    AgentHandler.agnes = agnes
    AgentHandler.sessions = sessions
    AgentHandler.tasks = tasks
    AgentHandler.mcp = mcp

    # 启动服务器
    port = CONFIG["server_port"]
    server = HTTPServer(("0.0.0.0", port), AgentHandler)
    print(f"🤖 比特助手 v2.0 已启动")
    print(f"   模型: {CONFIG['agnes_model']}")
    print(f"   API:  {CONFIG['agnes_api_base']}")
    print(f"   端口: {port}")
    print(f"   外网: {CONFIG['agent_base_url']}")
    print(f"   API Key: {'✅ 已设置' if api_key else '❌ 未设置'}")
    print(f"   协议: REST + OpenAI + MCP + A2A + OpenAPI")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 比特助手已停止")
        server.server_close()


if __name__ == "__main__":
    main()
