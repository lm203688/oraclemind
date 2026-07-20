#!/usr/bin/env python3
"""Run a single mining task - args: task_name"""
import json, re, os, sys, subprocess, time

BASE = "/home/z/my-project"
MINE_DIR = "/tmp/kb-mine"
XW_URL = "http://150.158.119.19:3003/v1/chat/completions"
XW_KEY = "xiaowu-internal-2026"
XW_MODEL = "xiaowu-agent"

TASKS = {
    "solar": {"files": ["solar1.json","solar2.json"], "domain": "solar photovoltaic technology",
        "fields": "name, type, efficiency, developer, status, description (3-5 sentences)",
        "file": f"{BASE}/new-energy/knowledge-base/entities/solar.json", "prefix": "SE", "start": 127, "is_array": False},
    "storage": {"files": ["storage1.json","storage2.json"], "domain": "energy storage technology",
        "fields": "name, type, capacity, technology, developer, status, description (3-5 sentences)",
        "file": f"{BASE}/new-energy/knowledge-base/entities/storage.json", "prefix": "ST", "start": 96, "is_array": False},
    "hydrogen": {"files": ["hydrogen1.json","hydrogen2.json"], "domain": "hydrogen energy technology",
        "fields": "name, type, technology, efficiency, developer, status, description (3-5 sentences)",
        "file": f"{BASE}/new-energy/knowledge-base/entities/hydrogen_energy.json", "prefix": "HYD", "start": 79, "is_array": False},
    "wind": {"files": ["wind1.json","wind2.json"], "domain": "wind energy technology",
        "fields": "name, type, capacity, technology, developer, status, description (3-5 sentences)",
        "file": f"{BASE}/new-energy/knowledge-base/entities/wind_energy.json", "prefix": "WIND", "start": 63, "is_array": False},
    "grid": {"files": ["grid1.json","grid2.json"], "domain": "grid technology",
        "fields": "name, type, technology, capacity, developer, status, description (3-5 sentences)",
        "file": f"{BASE}/new-energy/knowledge-base/entities/grid_tech.json", "prefix": "GRID", "start": 68, "is_array": False},
    "synbio": {"files": ["synbio1.json","synbio2.json"], "domain": "synthetic biology",
        "fields": "name, type, applications array, companies array, maturity, description (3-5 sentences), trend",
        "file": f"{BASE}/life-science/knowledge-base/entities/synbio.json", "prefix": "SB", "start": 79, "is_array": False},
    "cell": {"files": ["cell1.json","cell2.json"], "domain": "cell therapy and regenerative medicine",
        "fields": "name, type, target, technology, status, description (3-5 sentences)",
        "file": f"{BASE}/life-science/knowledge-base/entities/cell_therapy.json", "prefix": "CT", "start": 79, "is_array": False},
    "longevity": {"files": ["long1.json","long2.json"], "domain": "longevity and anti-aging technology",
        "fields": "name, type, mechanism, target, status, description (3-5 sentences)",
        "file": f"{BASE}/life-science/knowledge-base/entities/longevity.json", "prefix": "LG", "start": 109, "is_array": False},
    "bioinf": {"files": ["bioinf1.json","bioinf2.json"], "domain": "bioinformatics and computational biology",
        "fields": "name, type, technology, application, status, description (3-5 sentences)",
        "file": f"{BASE}/life-science/knowledge-base/entities/bioinformatics.json", "prefix": "BINF", "start": 71, "is_array": False},
    "biomanuf": {"files": ["biomanuf1.json","biomanuf2.json"], "domain": "biomanufacturing and bioprocess",
        "fields": "name, type, technology, application, status, description (3-5 sentences)",
        "file": f"{BASE}/life-science/knowledge-base/entities/biomanufacturing.json", "prefix": "BM", "start": 79, "is_array": False},
    "mcp": {"files": ["mcp1.json","mcp2.json"], "domain": "MCP model context protocol servers",
        "fields": "name, full_name, category, description, protocol_version, auth, hosts array, features array, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/mcp_servers.json", "prefix": "MCP", "start": 164, "is_array": False},
    "sdk": {"files": ["sdk1.json","sdk2.json"], "domain": "AI agent SDK and framework",
        "fields": "name, type, language, features array, description, status, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/sdks.json", "prefix": "SDK", "start": 33, "is_array": False},
    "proto": {"files": ["proto1.json","proto2.json"], "domain": "AI agent communication protocol",
        "fields": "name, type, description, status, features array, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/protocols.json", "prefix": "PROTO", "start": 67, "is_array": False},
    "vdb": {"files": ["vdb1.json","vdb2.json"], "domain": "vector database technology",
        "fields": "name, type, description, features array, status, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/vector_dbs.json", "prefix": "VDB", "start": 36, "is_array": False},
    "mem": {"files": ["mem1.json","mem2.json"], "domain": "AI agent memory system",
        "fields": "name, type, description, features array, status, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/memory_systems.json", "prefix": "MEM", "start": 24, "is_array": False},
    "bench": {"files": ["bench1.json","bench2.json"], "domain": "AI agent benchmark and evaluation",
        "fields": "name, type, description, metrics array, status, sources array",
        "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/benchmarks.json", "prefix": "BENCH", "start": 9, "is_array": False},
}

def read_search_results(files):
    results = []
    for f in files:
        fpath = os.path.join(MINE_DIR, f)
        if not os.path.exists(fpath): continue
        raw = open(fpath).read()
        m = re.search(r'\[[\s\S]*\]', raw)
        if m:
            try: results.extend(json.loads(m.group()))
            except: pass
    return results

def xiaowu_extract(snippets, domain, fields):
    prompt = f"From these search results about {domain}, extract 5 real entities as JSON array. Each needs: {fields}. Return ONLY JSON array.\n\n{snippets[:3500]}"
    payload = json.dumps({
        "model": XW_MODEL,
        "messages": [{"role": "user", "content": prompt[:4000]}],
        "temperature": 0.1,
        "max_tokens": 3000
    })
    tmpf = f"/tmp/xw_{int(time.time()*1000)}.json"
    with open(tmpf, "w") as f: f.write(payload)
    try:
        result = subprocess.run(
            ["curl", "-s", "-m", "120", "-X", "POST", XW_URL,
             "-H", "Content-Type: application/json",
             "-H", f"Authorization: Bearer {XW_KEY}",
             "-d", f"@{tmpf}"],
            capture_output=True, text=True, timeout=130
        )
        os.unlink(tmpf)
        resp = json.loads(result.stdout)
        content = resp.get("choices", [{}])[0].get("message", {}).get("content", "")
        content = content.replace("```json", "").replace("```", "").strip()
        m = re.search(r'\[[\s\S]*\]', content)
        if m:
            try: return json.loads(m.group())
            except:
                fixed = m.group().replace(",}", "}").replace(",]", "]")
                try: return json.loads(fixed)
                except: return []
        return []
    except Exception as e:
        print(f"  小乌API error: {str(e)[:100]}")
        try: os.unlink(tmpf)
        except: pass
        return []

def save_entities(fpath, entities, prefix, start_num, is_array):
    raw = json.load(open(fpath))
    if is_array:
        existing = raw
        wrapper = None
    else:
        existing = raw.get("entities", [])
        wrapper = raw
    next_id = start_num
    for e in existing:
        eid = e.get("id", "")
        if eid.startswith(prefix + "-"):
            try:
                n = int(eid.replace(prefix + "-", ""))
                if n >= next_id: next_id = n + 1
            except: pass
    existing_names = [e.get("name", "").lower() for e in existing]
    added = 0
    for e in entities:
        if e.get("name") and e["name"].lower() not in existing_names:
            e["id"] = f"{prefix}-{next_id:03d}"
            existing.append(e)
            existing_names.append(e["name"].lower())
            next_id += 1
            added += 1
    if added > 0:
        if wrapper:
            wrapper["entities"] = existing
            wrapper["last_updated"] = "2026-06-20T08:00:00Z"
            json.dump(wrapper, open(fpath, "w"), indent=2, ensure_ascii=False)
        else:
            json.dump(existing, open(fpath, "w"), indent=2, ensure_ascii=False)
    return added

def main():
    task_name = sys.argv[1]
    task = TASKS.get(task_name)
    if not task:
        print(f"Unknown task: {task_name}")
        sys.exit(1)
    
    print(f"[{task_name}]", flush=True)
    results = read_search_results(task["files"])
    print(f"  Results: {len(results)}", flush=True)
    if not results:
        print("  0 results, skipping", flush=True)
        return
    
    snippets = "\n".join(
        f'[{i+1}] {(r.get("name") or "")[:80]} | {(r.get("snippet") or "")[:200]} | {r.get("url","")}'
        for i, r in enumerate(results[:10])
    )
    
    print(f"  Asking 小乌...", flush=True)
    entities = xiaowu_extract(snippets, task["domain"], task["fields"])
    print(f"  Extracted: {len(entities)}", flush=True)
    
    if entities:
        added = save_entities(task["file"], entities, task["prefix"], task["start"], task["is_array"])
        print(f"  ✅ +{added} new", flush=True)
    else:
        print(f"  ⚠️ 0 new", flush=True)

if __name__ == "__main__":
    main()
