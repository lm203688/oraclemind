import json, requests
# 小乌：从payment_config.json读取b64，解码并替换server.py，然后重启服务
cmd = "python3 -c \"import base64,zlib,json; d=json.load(open('/home/ubuntu/atex/data/payment_config.json')); b64=d.get('content',''); data=zlib.decompress(base64.b64decode(b64)); open('/home/ubuntu/atex/api/server.py','wb').write(data); print('DECODED',len(data),'bytes')\""
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
