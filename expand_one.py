#!/usr/bin/env python3
"""Expand single site/file - uses $$count $$prefix $$num as placeholders."""
import json, os, time, requests, sys, re

API_URL = "http://150.158.119.19:3003/v1/chat/completions"
API_KEY = "xiaowu-internal-2026"
BASE = "/home/z/my-project"

def call_api(prompt, max_tokens=2000, retries=3):
    for attempt in range(retries):
        try:
            resp = requests.post(API_URL, json={
                "model": "xiaowu-agent",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.7
            }, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=45)
            return resp.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"  retry {attempt+1}: {e}", flush=True)
            time.sleep(3)
    return None

def parse_json(content):
    if not content: return []
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
    m = re.search(r'\[[\s\S]*\]', content)
    if m:
        try: return json.loads(m.group())
        except:
            try: return json.loads(m.group().replace(',]',']').replace(',}','}'))
            except: return []
    return []

if __name__ == "__main__":
    site_dir = sys.argv[1]
    filename = sys.argv[2]
    count = int(sys.argv[3])
    prefix = sys.argv[4]
    start = int(sys.argv[5])
    prompt_tpl = sys.argv[6]  # uses $$count $$prefix $$num
    
    edir = f"{BASE}/{site_dir}/knowledge-base/entities"
    if not os.path.isdir(edir):
        edir = f"{BASE}/{site_dir}/entities"
    fpath = os.path.join(edir, filename)
    
    existing = []
    is_dict = False
    raw_dict = None
    if os.path.exists(fpath):
        raw = json.load(open(fpath))
        if isinstance(raw, list):
            existing = raw
        elif isinstance(raw, dict):
            is_dict = True
            raw_dict = raw
            existing = raw.get('entities', raw.get('data', []))
    
    old = len(existing)
    print(f"File: {fpath} | Existing: {old} | Target: +{count}", flush=True)
    
    new_ents = []
    bs = 15
    batches = (count + bs - 1) // bs
    for b in range(batches):
        bc = min(bs, count - b*bs)
        bst = start + b*bs
        p = prompt_tpl.replace('$$count', str(bc)).replace('$$prefix', prefix).replace('$$num', str(bst))
        c = call_api(p)
        ents = parse_json(c)
        new_ents.extend(ents)
        print(f"  batch {b+1}/{batches}: +{len(ents)}", flush=True)
        time.sleep(2)
    
    all_e = existing + new_ents
    if is_dict and raw_dict:
        raw_dict['entities'] = all_e
        if 'last_updated' in raw_dict:
            raw_dict['last_updated'] = '2026-06-28'
        json.dump(raw_dict, open(fpath,'w'), ensure_ascii=False, indent=2)
    else:
        json.dump(all_e, open(fpath,'w'), ensure_ascii=False, indent=2)
    
    print(f"Done: {old} -> {len(all_e)} (+{len(new_ents)})", flush=True)
