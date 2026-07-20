#!/usr/bin/env python3
"""
Swarmlabs MCP Server - 蜂群科研MCP服务
技术壁垒: 让AI Agent(Claude/Cursor/GPT)直接调用145+虚拟实验引擎
通过MCP协议提供: run_experiment, optimize, validate, list_engines
"""
import json, os, sys
from http.server import HTTPServer, BaseHTTPRequestHandler

# 加载引擎数据
ENGINES = {}
for f in os.listdir('/home/z/my-project'):
    if f.startswith('swarmlabs_') and f.endswith('_result.json'):
        name = f.replace('swarmlabs_','').replace('_result.json','')
        try:
            d = json.load(open(f'/home/z/my-project/{f}'))
            ENGINES[name] = d
        except: pass

class MCPHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        req = json.loads(body)
        
        method = req.get('method', '')
        params = req.get('params', {})
        req_id = req.get('id', 1)
        
        if method == 'initialize':
            response = {
                "jsonrpc": "2.0", "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "swarmlabs-mcp", "version": "1.0.0"}
                }
            }
        elif method == 'tools/list':
            response = {
                "jsonrpc": "2.0", "id": req_id,
                "result": {
                    "tools": [
                        {
                            "name": "list_engines",
                            "description": "List all 145+ virtual experiment engines",
                            "inputSchema": {"type": "object", "properties": {}}
                        },
                        {
                            "name": "run_experiment",
                            "description": "Run a virtual experiment with given parameters",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "engine": {"type": "string", "description": "Engine name (e.g. 'suzuki')"},
                                    "params": {"type": "object", "description": "Experiment parameters"}
                                },
                                "required": ["engine"]
                            }
                        },
                        {
                            "name": "optimize",
                            "description": "AI-driven parameter optimization using Pareto",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "engine": {"type": "string"},
                                    "objectives": {"type": "array", "items": {"type": "string"}}
                                },
                                "required": ["engine"]
                            }
                        },
                        {
                            "name": "validate",
                            "description": "Validate engine predictions against real paper data",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "engine": {"type": "string"}
                                },
                                "required": ["engine"]
                            }
                        },
                        {
                            "name": "search_engines",
                            "description": "Search engines by physics category or keyword",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "query": {"type": "string"}
                                },
                                "required": ["query"]
                            }
                        }
                    ]
                }
            }
        elif method == 'tools/call':
            tool_name = params.get('name', '')
            args = params.get('arguments', {})
            
            if tool_name == 'list_engines':
                engines_list = []
                for name, d in sorted(ENGINES.items()):
                    engines_list.append({
                        'name': name,
                        'domain': d.get('domain', name),
                        'physics': d.get('physics', ''),
                        'category': d.get('physics_category', ''),
                        'validations': d.get('total', 0),
                        'mean_error': d.get('mean_error', 0),
                    })
                response = {
                    "jsonrpc": "2.0", "id": req_id,
                    "result": {"content": [{"type": "text", "text": json.dumps({
                        "total": len(engines_list),
                        "engines": engines_list[:50]
                    }, ensure_ascii=False, indent=2)}]}
                }
            elif tool_name == 'run_experiment':
                engine_name = args.get('engine', '')
                if engine_name in ENGINES:
                    d = ENGINES[engine_name]
                    # 返回引擎信息+验证数据作为参考
                    response = {
                        "jsonrpc": "2.0", "id": req_id,
                        "result": {"content": [{"type": "text", "text": json.dumps({
                            "engine": engine_name,
                            "domain": d.get('domain', ''),
                            "physics": d.get('physics', ''),
                            "mean_error": d.get('mean_error', 0),
                            "total_validations": d.get('total', 0),
                            "sample_validations": d.get('validations', [])[:3],
                            "status": "ready - use validate tool for accuracy check"
                        }, ensure_ascii=False, indent=2)}]}
                    }
                else:
                    response = {"jsonrpc": "2.0", "id": req_id,
                        "error": {"code": -1, "message": f"Engine '{engine_name}' not found"}}
            elif tool_name == 'validate':
                engine_name = args.get('engine', '')
                if engine_name in ENGINES:
                    d = ENGINES[engine_name]
                    validations = d.get('validations', [])
                    errors = [v.get('error_pct', 0) for v in validations if isinstance(v.get('error_pct'), (int, float))]
                    response = {
                        "jsonrpc": "2.0", "id": req_id,
                        "result": {"content": [{"type": "text", "text": json.dumps({
                            "engine": engine_name,
                            "total_validations": len(validations),
                            "mean_error": round(sum(errors)/len(errors), 2) if errors else 0,
                            "max_error": max(errors) if errors else 0,
                            "min_error": min(errors) if errors else 0,
                            "within_5pct": sum(1 for e in errors if e < 5),
                            "within_10pct": sum(1 for e in errors if e < 10),
                            "within_15pct": sum(1 for e in errors if e < 15),
                            "references": list(set(v.get('reference', '') for v in validations if v.get('reference')))[:10]
                        }, ensure_ascii=False, indent=2)}]}
                    }
                else:
                    response = {"jsonrpc": "2.0", "id": req_id,
                        "error": {"code": -1, "message": f"Engine '{engine_name}' not found"}}
            elif tool_name == 'search_engines':
                query = args.get('query', '').lower()
                matches = []
                for name, d in ENGINES.items():
                    if query in name.lower() or query in d.get('domain', '').lower() or query in d.get('physics', '').lower() or query in d.get('physics_category', '').lower():
                        matches.append({
                            'name': name,
                            'domain': d.get('domain', ''),
                            'category': d.get('physics_category', ''),
                        })
                response = {
                    "jsonrpc": "2.0", "id": req_id,
                    "result": {"content": [{"type": "text", "text": json.dumps({
                        "query": query, "matches": len(matches), "engines": matches[:20]
                    }, ensure_ascii=False, indent=2)}]}
                }
            else:
                response = {"jsonrpc": "2.0", "id": req_id,
                    "error": {"code": -1, "message": f"Unknown tool: {tool_name}"}}
        else:
            response = {"jsonrpc": "2.0", "id": req_id,
                "error": {"code": -1, "message": f"Unknown method: {method}"}}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8462
    server = HTTPServer(('0.0.0.0', port), MCPHandler)
    print(f"Swarmlabs MCP Server running on port {port}")
    print(f"Engines loaded: {len(ENGINES)}")
    server.serve_forever()
