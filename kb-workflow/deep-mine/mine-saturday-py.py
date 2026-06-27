#!/usr/bin/env python3
"""
周六深挖批处理 - Python版，调用小乌API
小乌负责LLM提取，Python负责搜索结果处理+入库
"""
import json, re, os, sys, time, subprocess, urllib.request

BASE = "/home/z/my-project"
MINE_DIR = "/tmp/kb-mine"
XW_URL = "http://150.158.119.19:3003/v1/chat/completions"
XW_KEY = "xiaowu-internal-2026"
XW_MODEL = "xiaowu-agent"

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
    
    tmpf = f"/tmp/xw_payload_{int(time.time()*1000)}.json"
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
    
    # Find max ID number
    next_id = start_num
    for e in existing:
        eid = e.get("id", "")
        m = re.search(r'(\d+)$', eid)
        if m:
            n = int(m.group(1))
            if n >= next_id: next_id = n + 1
    
    existing_names = [e.get("name", "").lower() for e in existing]
    added = 0
    for e in entities:
        if e and e.get("name") and e["name"].lower() not in existing_names:
            e["id"] = f"{prefix}-{next_id:03d}"
            existing.append(e)
            existing_names.append(e["name"].lower())
            next_id += 1
            added += 1
    
    if added > 0:
        if wrapper:
            wrapper["entities"] = existing
            wrapper["last_updated"] = "2026-06-20T07:30:00Z"
            json.dump(wrapper, open(fpath, "w"), indent=2, ensure_ascii=False)
        else:
            json.dump(existing, open(fpath, "w"), indent=2, ensure_ascii=False)
    return added

# Task definitions
TASKS = [
    # New Energy
    {"name": "solar", "files": ["solar1.json", "solar2.json"],
     "domain": "solar photovoltaic technology",
     "fields": "name, type, efficiency, developer, status, description (3-5 sentences)",
     "file": f"{BASE}/new-energy/knowledge-base/entities/solar.json", "prefix": "SE", "start": 115, "is_array": False},
    {"name": "storage", "files": ["storage1.json", "storage2.json"],
     "domain": "energy storage technology",
     "fields": "name, type, capacity, technology, developer, status, description (3-5 sentences)",
     "file": f"{BASE}/new-energy/knowledge-base/entities/storage.json", "prefix": "ST", "start": 96, "is_array": False},
    {"name": "hydrogen", "files": ["hydrogen1.json", "hydrogen2.json"],
     "domain": "hydrogen energy technology",
     "fields": "name, type, technology, efficiency, developer, status, description (3-5 sentences)",
     "file": f"{BASE}/new-energy/knowledge-base/entities/hydrogen_energy.json", "prefix": "HYD", "start": 79, "is_array": False},
    {"name": "wind", "files": ["wind1.json", "wind2.json"],
     "domain": "wind energy technology",
     "fields": "name, type, capacity, technology, developer, status, description (3-5 sentences)",
     "file": f"{BASE}/new-energy/knowledge-base/entities/wind_energy.json", "prefix": "WIND", "start": 63, "is_array": False},
    {"name": "grid", "files": ["grid1.json", "grid2.json"],
     "domain": "grid technology",
     "fields": "name, type, technology, capacity, developer, status, description (3-5 sentences)",
     "file": f"{BASE}/new-energy/knowledge-base/entities/grid_tech.json", "prefix": "GRID", "start": 68, "is_array": False},
    # Life Science
    {"name": "synbio", "files": ["synbio1.json", "synbio2.json"],
     "domain": "synthetic biology",
     "fields": "name, type, applications array, companies array, maturity, description (3-5 sentences), trend",
     "file": f"{BASE}/life-science/knowledge-base/entities/synbio.json", "prefix": "SB", "start": 79, "is_array": False},
    {"name": "cell_therapy", "files": ["cell1.json", "cell2.json"],
     "domain": "cell therapy and regenerative medicine",
     "fields": "name, type, target, companies array, status, description (3-5 sentences)",
     "file": f"{BASE}/life-science/knowledge-base/entities/cell_therapy.json", "prefix": "CT", "start": 79, "is_array": False},
    {"name": "longevity", "files": ["long1.json", "long2.json"],
     "domain": "longevity and anti-aging technology",
     "fields": "name, type, mechanism, companies array, status, description (3-5 sentences)",
     "file": f"{BASE}/life-science/knowledge-base/entities/longevity.json", "prefix": "LG", "start": 109, "is_array": False},
    {"name": "bioinf", "files": ["bioinf1.json", "bioinf2.json"],
     "domain": "bioinformatics and computational biology",
     "fields": "name, type, technology, application, description (3-5 sentences)",
     "file": f"{BASE}/life-science/knowledge-base/entities/bioinformatics.json", "prefix": "BINF", "start": 71, "is_array": False},
    {"name": "biomanuf", "files": ["biomanuf1.json", "biomanuf2.json"],
     "domain": "biomanufacturing and precision fermentation",
     "fields": "name, type, technology, application, description (3-5 sentences)",
     "file": f"{BASE}/life-science/knowledge-base/entities/biomanufacturing.json", "prefix": "BM", "start": 79, "is_array": False},
    # Agent Ecosystem
    {"name": "mcp", "files": ["mcp1.json", "mcp2.json"],
     "domain": "MCP (Model Context Protocol) servers",
     "fields": "name, full_name, category, description, protocol_version, hosts array, maintainer, status, language, features array",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/mcp_servers.json", "prefix": "MCP", "start": 200, "is_array": False},
    {"name": "sdk", "files": ["sdk1.json", "sdk2.json"],
     "domain": "AI agent SDK and frameworks",
     "fields": "name, type, language, features array, description (3-5 sentences), status",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/sdks.json", "prefix": "SDK", "start": 33, "is_array": False},
    {"name": "proto", "files": ["proto1.json", "proto2.json"],
     "domain": "AI agent communication protocols",
     "fields": "name, type, description, status, features array",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/protocols.json", "prefix": "PROTO", "start": 67, "is_array": False},
    {"name": "vdb", "files": ["vdb1.json", "vdb2.json"],
     "domain": "vector databases",
     "fields": "name, type, description, features array, status",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/vector_dbs.json", "prefix": "VDB", "start": 36, "is_array": False},
    {"name": "mem", "files": ["mem1.json", "mem2.json"],
     "domain": "AI agent memory systems",
     "fields": "name, type, description, features array, status",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/memory_systems.json", "prefix": "MEM", "start": 24, "is_array": False},
    {"name": "bench", "files": ["bench1.json", "bench2.json"],
     "domain": "AI agent benchmarks and evaluation",
     "fields": "name, type, description, metrics array, status",
     "file": f"{BASE}/agent-ecosystem/knowledge-base/entities/benchmarks.json", "prefix": "BENCH", "start": 9, "is_array": False},
]

def main():
    print("🚀 周六深挖 (小乌LLM + Python)")
    print("📅 2026-06-20")
    
    summary = {}
    grand_total = 0
    
    # Group by domain
    domains = [
        ("新能源", ["solar", "storage", "hydrogen", "wind", "grid"]),
        ("生命科学", ["synbio", "cell_therapy", "longevity", "bioinf", "biomanuf"]),
        ("Agent生态", ["mcp", "sdk", "proto", "vdb", "mem", "bench"]),
    ]
    
    for domain_label, task_names in domains:
        print(f"\n=== {domain_label} ===")
        domain_total = 0
        for task_name in task_names:
            task = next(t for t in TASKS if t["name"] == task_name)
            print(f"\n[{task_name}]")
            
            results = read_search_results(task["files"])
            print(f"  Results: {len(results)}")
            if not results:
                print("  ⚠️ No results, skipping")
                summary[task_name] = 0
                continue
            
            # Build snippets
            snippets = "\n".join(
                f"[{i+1}] {(r.get('name') or r.get('title') or '')[:80]} | {(r.get('snippet') or '')[:200]} | {r.get('url', '')}"
                for i, r in enumerate(results[:10])
            )
            
            print(f"  Asking 小乌 to extract...")
            entities = xiaowu_extract(snippets, task["domain"], task["fields"])
            print(f"  Extracted: {len(entities)} entities")
            
            if entities:
                added = save_entities(task["file"], entities, task["prefix"], task["start"], task["is_array"])
                print(f"  ✅ +{added} new")
                summary[task_name] = added
                domain_total += added
            else:
                print(f"  ⚠️ 0 extracted")
                summary[task_name] = 0
            
            time.sleep(2)  # Rate limit
        
        print(f"\n📊 {domain_label}: +{domain_total}")
    
    # Totals
    ne_total = sum(summary.get(t, 0) for t in ["solar", "storage", "hydrogen", "wind", "grid"])
    ls_total = sum(summary.get(t, 0) for t in ["synbio", "cell_therapy", "longevity", "bioinf", "biomanuf"])
    ae_total = sum(summary.get(t, 0) for t in ["mcp", "sdk", "proto", "vdb", "mem", "bench"])
    grand_total = ne_total + ls_total + ae_total
    
    print("\n" + "=" * 50)
    print("🎉 深挖完成! (小乌提取)")
    print(f"  新能源: +{ne_total}")
    print(f"  生命科学: +{ls_total}")
    print(f"  Agent生态: +{ae_total}")
    print(f"  总计新增: +{grand_total}")
    print("=" * 50)
    
    # Save report
    report = {
        "date": "2026-06-20",
        "day": "Saturday",
        "executor": "xiaowu-agent (LLM) + Python",
        "domains": ["new-energy", "life-science", "agent-ecosystem"],
        "new_entities": summary,
        "totals": {"new_energy": ne_total, "life_science": ls_total, "agent_ecosystem": ae_total},
        "total_new": grand_total
    }
    os.makedirs(f"{BASE}/kb-workflow/reports", exist_ok=True)
    json.dump(report, open(f"{BASE}/kb-workflow/reports/deep-mine-2026-06-20.json", "w"), indent=2, ensure_ascii=False)
    print("Report saved.")

if __name__ == "__main__":
    main()
