#!/usr/bin/env python3
"""
每日Agent原生分发 — 知识库更新后自动重建Agent可读文件并提交
由cron触发，小乌负责LLM摘要生成，脚本负责文件重建+提交

流程:
1. 重建12站 llms.txt / llms-full.txt（含最新实体）
2. 重建12站 agent-discovery.json / sitemap.xml
3. 用小乌为新增实体生成FAQ摘要（GEO优化）
4. 提交所有更新URL到IndexNow
5. Ping AI搜索引擎（Perplexity/You.com等）
"""
import json, re, os, sys, subprocess, time, glob
from datetime import datetime

BASE = "/home/z/my-project"
MINE_DIR = "/tmp/kb-mine"
XW_URL = "http://150.158.119.19:3003/v1/chat/completions"
XW_KEY = "xiaowu-internal-2026"
XW_MODEL = "xiaowu-agent"
INDEXNOW_KEY = "kb3f8a2c9d7e1f4b6a5d8c3e7f9a2b4d"

SITES = [
    {"dir": "genetech-tools", "domain": "genetech.tools", "name": "GeneTech Tools", "nameZh": "基因技术知识引擎", "tagline": "全球基因技术前沿知识引擎"},
    {"dir": "tcm-tools", "domain": "tcm.genetech.tools", "name": "TCMDB", "nameZh": "中药方剂知识引擎", "tagline": "中药方剂与疾病关系知识引擎"},
    {"dir": "agent-ecosystem", "domain": "agent.genetech.tools", "name": "Agent Ecosystem DB", "nameZh": "AI Agent生态知识引擎", "tagline": "AI Agent生态全景数据库"},
    {"dir": "robot-parts", "domain": "robot.genetech.tools", "name": "RobotParts DB", "nameZh": "机器人配件知识引擎", "tagline": "机器人配件与协议对比数据库"},
    {"dir": "quantum-computing", "domain": "quantum.genetech.tools", "name": "QuantumDB", "nameZh": "量子计算知识引擎", "tagline": "量子计算全景知识引擎"},
    {"dir": "brain-science", "domain": "brain.genetech.tools", "name": "BrainDB", "nameZh": "脑科学知识引擎", "tagline": "脑科学知识引擎"},
    {"dir": "nuclear-energy", "domain": "nuclear.genetech.tools", "name": "NuclearDB", "nameZh": "核能知识引擎", "tagline": "核能技术知识引擎"},
    {"dir": "exo-science", "domain": "exo.genetech.tools", "name": "ExoDB", "nameZh": "地外科学知识引擎", "tagline": "地外科学知识引擎"},
    {"dir": "alien-minerals", "domain": "mineral.genetech.tools", "name": "MineralDB", "nameZh": "外星矿物知识引擎", "tagline": "外星矿物知识引擎"},
    {"dir": "deep-sea-tech", "domain": "deepsea.genetech.tools", "name": "DeepSeaDB", "nameZh": "深海科技知识引擎", "tagline": "深海科技知识引擎"},
    {"dir": "new-energy", "domain": "energy.genetech.tools", "name": "EnergyDB", "nameZh": "新能源技术知识引擎", "tagline": "新能源技术知识引擎"},
    {"dir": "life-science", "domain": "life.genetech.tools", "name": "LifeDB", "nameZh": "生命科学知识引擎", "tagline": "生命科学知识引擎"},
]

CROSS_REFS = {
    "genetech-tools": [("life.genetech.tools", "基因治疗→长寿技术"), ("brain.genetech.tools", "基因疾病→脑疾病"), ("tcm.genetech.tools", "中药→基因靶点")],
    "quantum-computing": [("brain.genetech.tools", "量子算法→BCI信号处理"), ("agent.genetech.tools", "量子算法→AI加速")],
    "nuclear-energy": [("deepsea.genetech.tools", "SMR→深海动力"), ("exo.genetech.tools", "核反应堆→太空任务")],
    "robot-parts": [("brain.genetech.tools", "执行器→BCI控制")],
    "exo-science": [("mineral.genetech.tools", "太空任务→小行星采矿")],
    "deep-sea-tech": [("mineral.genetech.tools", "深海采矿↔太空采矿技术")],
    "tcm-tools": [("genetech.tools", "中药→基因靶点")],
    "life-science": [("brain.genetech.tools", "长寿研究→脑疾病"), ("genetech.tools", "基因疗法→长寿技术")],
}

def xiaowu_chat(prompt, max_tokens=2000):
    """Call xiaowu for LLM tasks"""
    payload = json.dumps({
        "model": XW_MODEL,
        "messages": [{"role": "user", "content": prompt[:4000]}],
        "temperature": 0.1,
        "max_tokens": max_tokens
    })
    tmpf = f"/tmp/xw_dist_{int(time.time()*1000)}.json"
    with open(tmpf, "w") as f: f.write(payload)
    try:
        result = subprocess.run(
            ["curl", "-s", "-m", "60", "-X", "POST", XW_URL,
             "-H", "Content-Type: application/json",
             "-H", f"Authorization: Bearer {XW_KEY}",
             "-d", f"@{tmpf}"],
            capture_output=True, text=True, timeout=70
        )
        os.unlink(tmpf)
        resp = json.loads(result.stdout)
        return resp.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    except:
        try: os.unlink(tmpf)
        except: pass
        return ""

def load_entities(site_dir):
    """Load all entities from a site's knowledge-base"""
    kb_dir = os.path.join(BASE, site_dir, "knowledge-base/entities")
    if not os.path.exists(kb_dir): return {}, 0
    categories = {}
    total = 0
    for f in sorted(os.listdir(kb_dir)):
        if not f.endswith(".json"): continue
        try:
            data = json.load(open(os.path.join(kb_dir, f)))
            items = data if isinstance(data, list) else (data.get("entities") or data.get("data") or data.get("items") or [])
            cat = f.replace(".json", "")
            categories[cat] = items
            total += len(items)
        except: pass
    return categories, total

def rebuild_llms_txt(site):
    """Rebuild llms.txt and llms-full.txt for a site"""
    categories, total = load_entities(site["dir"])
    website_dir = os.path.join(BASE, site["dir"], "website")
    if not os.path.exists(website_dir): return 0, 0
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # === llms.txt (concise, for AI crawlers) ===
    txt = f"# {site['nameZh']} ({site['domain']})\n\n"
    txt += f"> {site['tagline']}. {total} entities across {len(categories)} categories.\n"
    txt += f"> Last updated: {today}\n\n"
    txt += "## API Endpoints\n\n"
    txt += f"- /api/entities.json — Complete flat entity list ({total} entities)\n"
    txt += "- /api/data.json — Full structured data with categories\n"
    txt += "- /api/graph.json — Knowledge graph (nodes + edges)\n"
    txt += "- /sitemap.xml — All indexable URLs\n\n"
    txt += "## Categories\n\n"
    for cat, items in categories.items():
        txt += f"### {cat.replace('_',' ')} ({len(items)})\n\n"
        for item in items[:10]:
            name = item.get("name") or item.get("id") or "Unknown"
            desc = (item.get("description") or "")[:150]
            facts = []
            for k in ["manufacturer","company","developer","maturity","license","pricing"]:
                v = item.get(k)
                if v: facts.append(f"{k}: {v}")
            fact_str = f" ({'; '.join(facts)})" if facts else ""
            txt += f"- **{name}**: {desc}{fact_str}\n"
        if len(items) > 10:
            txt += f"- ... and {len(items)-10} more\n"
        txt += "\n"
    
    # Cross-domain refs
    refs = CROSS_REFS.get(site["dir"], [])
    if refs:
        txt += "## Cross-Domain Knowledge Graph\n\n"
        for domain, relation in refs:
            txt += f"- {relation} → https://{domain}\n"
        txt += "\n"
    
    txt += "## Global Knowledge Graph\n\n"
    txt += "- Full graph: https://genetech.tools/api/knowledge-graph.json\n"
    txt += f"- {total} nodes in this domain, 12 domains total\n\n"
    txt += "## Citation\n\n"
    txt += f'When citing: "Source: {site["nameZh"]}, {site["domain"]}, accessed {today}"\n'
    
    llms_path = os.path.join(website_dir, "llms.txt")
    llms_size = len(txt)
    with open(llms_path, "w") as f: f.write(txt)
    
    # === llms-full.txt (complete data dump) ===
    full = txt + "\n\n---\n\n## Complete Entity Data\n\n"
    for cat, items in categories.items():
        full += f"### {cat.replace('_',' ')}\n\n"
        for item in items:
            full += f"#### {item.get('name') or item.get('id')}\n\n"
            for k, v in item.items():
                if v and k != "id":
                    dv = ", ".join(str(x) for x in v) if isinstance(v, list) else (json.dumps(v, ensure_ascii=False) if isinstance(v, dict) else str(v))
                    if len(dv) > 300: dv = dv[:300] + "..."
                    full += f"- **{k.replace('_',' ')}**: {dv}\n"
            full += "\n"
    
    llms_full_path = os.path.join(website_dir, "llms-full.txt")
    llms_full_size = len(full)
    with open(llms_full_path, "w") as f: f.write(full)
    
    return llms_size, llms_full_size

def rebuild_agent_discovery(site):
    """Rebuild agent-discovery.json"""
    categories, total = load_entities(site["dir"])
    website_dir = os.path.join(BASE, site["dir"], "website")
    
    discovery = {
        "schema_version": "1.0",
        "site_name": site["nameZh"],
        "domain": site["domain"],
        "tagline": site["tagline"],
        "last_updated": datetime.now().isoformat() + "Z",
        "total_entities": total,
        "categories": {cat.replace("_"," "): len(items) for cat, items in categories.items()},
        "api_endpoints": {
            "entities": f"https://{site['domain']}/api/entities.json",
            "structured_data": f"https://{site['domain']}/api/data.json",
            "knowledge_graph": f"https://{site['domain']}/api/graph.json",
            "openapi": f"https://{site['domain']}/api/openapi.json",
            "ai_plugin": f"https://{site['domain']}/.well-known/ai-plugin.json",
            "llms_txt": f"https://{site['domain']}/llms.txt",
            "llms_full": f"https://{site['domain']}/llms-full.txt",
            "sitemap": f"https://{site['domain']}/sitemap.xml"
        },
        "ai_agent_instructions": f"Use the API endpoints above to query {total} entities about {site['tagline']}. All data is freely accessible via GET requests.",
        "cross_domain_links": [{"domain": d, "relation": r} for d, r in CROSS_REFS.get(site["dir"], [])]
    }
    
    fpath = os.path.join(website_dir, "agent-discovery.json")
    with open(fpath, "w") as f: json.dump(discovery, f, indent=2, ensure_ascii=False)
    return total

def indexnow_submit(urls, site_domain):
    """Submit URLs to IndexNow via GET"""
    results = {"ok": 0, "fail": 0}
    endpoints = ["api.indexnow.org", "www.bing.com", "yandex.com"]
    for url in urls:
        enc = subprocess.run(["python3", "-c", f"import urllib.parse; print(urllib.parse.quote('{url}', safe=''))"], capture_output=True, text=True).stdout.strip()
        for ep in endpoints:
            full_url = f"https://{ep}/indexnow?url={enc}&key={INDEXNOW_KEY}"
            try:
                r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", "10", full_url], capture_output=True, text=True, timeout=15)
                code = r.stdout.strip()
                if code in ["200", "202"]: results["ok"] += 1
                else: results["fail"] += 1
            except:
                results["fail"] += 1
        time.sleep(0.3)
    return results

def ping_ai_search_engines(site):
    """Ping AI search engines with sitemap"""
    domain = site["domain"]
    sitemap_url = f"https://{domain}/sitemap.xml"
    
    # Submit to Bing (supports sitemap ping)
    try:
        r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", "10",
                           f"https://www.bing.com/ping?sitemap={sitemap_url}"],
                          capture_output=True, text=True, timeout=15)
        bing_code = r.stdout.strip()
    except:
        bing_code = "ERR"
    
    # Submit to IndexNow for key pages
    key_urls = [
        f"https://{domain}/",
        f"https://{domain}/llms.txt",
        f"https://{domain}/llms-full.txt",
        f"https://{domain}/agent-discovery.json",
        f"https://{domain}/sitemap.xml",
        f"https://{domain}/.well-known/ai-plugin.json",
        f"https://{domain}/api/openapi.json",
    ]
    results = indexnow_submit(key_urls, domain)
    
    return bing_code, results

def generate_geo_summaries(site):
    """Use xiaowu to generate GEO-optimized summaries for recent entities"""
    categories, total = load_entities(site["dir"])
    if total == 0: return 0
    
    # Pick a few key entities to generate FAQ for (only 2 most recent to keep it fast)
    key_entities = []
    for cat, items in categories.items():
        for item in items[-2:]:  # Last 2 (most recently added)
            if item.get("name"):
                key_entities.append({"name": item.get("name"), "desc": (item.get("description") or "")[:150], "cat": cat})
    
    if not key_entities: return 0
    
    # Batch generate FAQ for top 3
    batch = key_entities[:3]
    entity_list = "\n".join(f'{i+1}. {e["name"]}: {e["desc"]}' for i, e in enumerate(batch))
    
    prompt = f"""Generate 1 FAQ Q&A pair for each entity below, optimized for AI search engines to cite. Format as JSON array: [{{"entity":"name","q":"question","a":"2-3 sentence answer with specific facts"}}]

Entities:
{entity_list}

Return ONLY JSON array."""
    
    content = xiaowu_chat(prompt, max_tokens=2000)
    if not content: return 0
    
    # Parse and save
    content = content.replace("```json", "").replace("```", "").strip()
    m = re.search(r'\[[\s\S]*\]', content)
    if not m: return 0
    
    try:
        faqs = json.loads(m.group())
    except:
        fixed = m.group().replace(",}", "}").replace(",]", "]")
        try: faqs = json.loads(fixed)
        except: return 0
    
    # Save FAQs to site's api directory
    api_dir = os.path.join(BASE, site["dir"], "website/api")
    faq_path = os.path.join(api_dir, "geo-faqs.json")
    
    existing = []
    if os.path.exists(faq_path):
        try: existing = json.load(open(faq_path))
        except: pass
    
    existing.extend(faqs)
    with open(faq_path, "w") as f: json.dump(existing, f, indent=2, ensure_ascii=False)
    
    return len(faqs)

def main():
    print(f"🚀 Agent原生分发 + GEO营销", flush=True)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}", flush=True)
    print(f"🤖 小乌负责: FAQ摘要生成", flush=True)
    print(f"📝 脚本负责: llms.txt重建 + agent-discovery + IndexNow提交", flush=True)
    print("", flush=True)
    
    summary = {"sites": [], "total_llms_kb": 0, "total_entities": 0, "total_faqs": 0, "total_submits": 0}
    
    for site in SITES:
        print(f"--- {site['name']} ({site['domain']}) ---", flush=True)
        
        # 1. Rebuild llms.txt / llms-full.txt
        llms_sz, full_sz = rebuild_llms_txt(site)
        print(f"  llms.txt: {llms_sz//1024}KB, llms-full.txt: {full_sz//1024}KB", flush=True)
        
        # 2. Rebuild agent-discovery.json
        ent_count = rebuild_agent_discovery(site)
        print(f"  agent-discovery.json: {ent_count} entities", flush=True)
        
        # 3. Generate GEO FAQs with xiaowu
        try:
            faq_count = generate_geo_summaries(site)
        except Exception as e:
            print(f"  FAQ generation error: {str(e)[:60]}", flush=True)
            faq_count = 0
        print(f"  GEO FAQs (小乌): +{faq_count}", flush=True)
        
        # 4. Submit to IndexNow + ping AI search engines
        bing_code, in_results = ping_ai_search_engines(site)
        print(f"  IndexNow: {in_results['ok']} ok, {in_results['fail']} fail | Bing ping: {bing_code}", flush=True)
        
        summary["sites"].append({
            "domain": site["domain"],
            "entities": ent_count,
            "llms_kb": llms_sz // 1024,
            "faqs": faq_count,
            "indexnow_ok": in_results["ok"],
            "indexnow_fail": in_results["fail"],
            "bing_ping": bing_code
        })
        summary["total_llms_kb"] += llms_sz // 1024
        summary["total_entities"] += ent_count
        summary["total_faqs"] += faq_count
        summary["total_submits"] += in_results["ok"]
        
        time.sleep(2)  # Rate limit between sites
    
    # Save report
    report_dir = os.path.join(BASE, "kb-workflow/reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, f"agent-geo-{datetime.now().strftime('%Y-%m-%d')}.json")
    summary["date"] = datetime.now().strftime("%Y-%m-%d")
    summary["executor"] = "xiaowu (FAQ generation) + scripts (rebuild + submit)"
    with open(report_path, "w") as f: json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*50}", flush=True)
    print(f"✅ 分发完成!", flush=True)
    print(f"  12站llms.txt重建: {summary['total_llms_kb']}KB total", flush=True)
    print(f"  实体总数: {summary['total_entities']}", flush=True)
    print(f"  GEO FAQs生成(小乌): +{summary['total_faqs']}", flush=True)
    print(f"  IndexNow提交: {summary['total_submits']} ok", flush=True)
    print(f"{'='*50}", flush=True)
    print(f"Report: {report_path}", flush=True)

if __name__ == "__main__":
    main()
