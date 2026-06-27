import json, requests
# ECS上server.py在 /home/ubuntu/atex/server.py 而不是 /home/ubuntu/atex/server/server.py
cmd = "head -5 /home/ubuntu/atex/server.py && echo '---' && grep -n 'def _llms_txt' /home/ubuntu/atex/server.py"
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
