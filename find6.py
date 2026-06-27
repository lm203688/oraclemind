import json, requests
cmd = "grep -rn '_llms_txt\|llms.txt' /home/ubuntu/atex/ --include='*.py' 2>/dev/null | head -5"
payload = {
    "model": "xiaowu-agent",
    "messages": [{"role":"user","content":f"执行: {cmd}"}],
    "temperature": 0
}
r = requests.post("http://150.158.119.19:3003/v1/chat/completions",
    headers={"Authorization":"Bearer xiaowu-internal-2026","Content-Type":"application/json"},
    json=payload, timeout=50)
d = r.json()
print(d['choices'][0]['message']['content'])
