#!/usr/bin/env python3
"""
蜂群科研 v4.0 — 统一API桥接
8460端口提供前端+用户系统+支付
8461端口提供30引擎计算服务
"""
import http.server, json, urllib.request, urllib.error, os, sys

PORT = 8460
API_NEW = 'http://127.0.0.1:8461'  # 新版引擎API

# 读取融合版前端
FRONTEND_FILE = '/tmp/swarmlabs_fused.html'
if not os.path.exists(FRONTEND_FILE):
    FRONTEND_FILE = '/home/z/my-project/swarmlabs_fused.html'

class BridgeHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            # 返回融合版前端
            try:
                with open(FRONTEND_FILE, 'r') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(content.encode())
            except:
                self.send_response(404)
                self.end_headers()
            return
        
        # 新版API端点——代理到8461
        new_api_paths = ['/api/v1/run/', '/api/v1/auto_screen', '/api/v1/screen',
                        '/api/v1/aging', '/api/v1/aging_eval', '/api/v1/cost_search',
                        '/api/v1/safety_check', '/api/v1/formulation', '/api/v1/process_chain',
                        '/api/v1/materials', '/api/v1/engines', '/api/v1/uncertainty',
                        '/api/v1/generalization', '/api/v1/stats', '/api/v1/health',
                        '/api/v1/docs', '/api/v1/compare']
        
        for api_path in new_api_paths:
            if self.path.startswith(api_path):
                self._proxy_to_new()
                return
        
        # 旧版API端点——返回简化响应
        if self.path == '/api/v1/health':
            self._json({'status': 'ok', 'version': '4.0.0', 'service': 'swarmlabs'})
            return
        
        # 其他旧版API——返回开发中
        self._json({'error': '功能升级中，请使用新版API', 'docs': '/api/v1/docs'})
    
    def do_POST(self):
        # 新版API端点——代理到8461
        new_api_paths = ['/api/v1/run/', '/api/v1/auto_screen', '/api/v1/screen',
                        '/api/v1/aging', '/api/v1/aging_eval', '/api/v1/cost_search',
                        '/api/v1/safety_check', '/api/v1/formulation', '/api/v1/process_chain',
                        '/api/v1/compare', '/api/v1/feedback/submit']
        
        for api_path in new_api_paths:
            if self.path.startswith(api_path):
                self._proxy_to_new()
                return
        
        self._json({'error': '功能升级中'})
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        self.end_headers()
    
    def _proxy_to_new(self):
        try:
            url = API_NEW + self.path
            data = None
            if self.command == 'POST':
                length = int(self.headers.get('Content-Length', 0))
                data = self.rfile.read(length) if length > 0 else None
            
            req = urllib.request.Request(url, data=data, method=self.command)
            req.add_header('Content-Type', 'application/json')
            
            with urllib.request.urlopen(req, timeout=30) as resp:
                content = resp.read()
                self.send_response(resp.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
        except Exception as e:
            self._json({'error': str(e)})
    
    def _json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

if __name__ == '__main__':
    server = http.server.HTTPServer(('0.0.0.0', PORT), BridgeHandler)
    print(f"蜂群科研 v4.0 桥接服务 → port {PORT}")
    print(f"前端: 融合版Dashboard")
    print(f"后端: 代理到8461新版API")
    server.serve_forever()
