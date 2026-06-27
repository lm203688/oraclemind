import json, requests
# 不是git仓库。需要直接传输文件
# 用base64分块传输server.py（180KB → 分成小块）
# 或者用更简单的方法：通过HTTP直接上传到ECS

# 先检查ECS上运行的进程
cmd = "ps aux | grep server.py | grep -v grep | head -5"
payload = {
    "model": "xiaowu-agent",
    "messages": [{"role":"user","content":f"执行: {cmd}"}],
    "temperature": 0
}
r = requests.post("http://150.158.119.19:3003/v1/chat/completions",
    headers={"Authorization":"Bearer xiaowu-internal-2026","Content-Type":"application/json"},
    json=payload, timeout=30)
d = r.json()
print(d['choices'][0]['message']['content'])
