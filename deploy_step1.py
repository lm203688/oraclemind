import json, requests

# 用base64传输修改后的文件到ECS
import base64

# 读取修改后的server.py
with open('/home/z/my-project/aishield/server/api/server.py', 'rb') as f:
    content = f.read()

b64 = base64.b64encode(content).decode()

# 通过deploy API的write_config写入
cmd = f"echo '{b64}' | base64 -d > /tmp/server_new.py && wc -l /tmp/server_new.py && echo FILE_READY"
payload = {
    "model": "xiaowu-agent",
    "messages": [{"role":"user","content":f"执行: {cmd}"}],
    "temperature": 0
}
r = requests.post("http://150.158.119.19:3003/v1/chat/completions",
    headers={"Authorization":"Bearer xiaowu-internal-2026","Content-Type":"application/json"},
    json=payload, timeout=50)
d = r.json()
print("STEP1:", d['choices'][0]['message']['content'])
