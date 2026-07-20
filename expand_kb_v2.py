#!/usr/bin/env python3
"""Batch expand 13 KB sites using Xiaowu API - v2 with better logging."""
import json, os, time, requests, sys, re

API_URL = "http://150.158.119.19:3003/v1/chat/completions"
API_KEY = "xiaowu-internal-2026"
BASE = "/home/z/my-project"

def log(msg):
    print(msg, flush=True)

def call_xiaowu(prompt, max_tokens=2000):
    try:
        resp = requests.post(API_URL, json={
            "model": "xiaowu-agent",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=60)
        data = resp.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        log(f"  ❌ API error: {e}")
        return None

def parse_json_array(content):
    if not content:
        return []
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
    match = re.search(r'\[[\s\S]*\]', content)
    if match:
        try:
            return json.loads(match.group())
        except:
            fixed = match.group().replace(',]', ']').replace(',}', '}')
            try:
                return json.loads(fixed)
            except:
                return []
    return []

# 站点定义 - 每站每个文件生成30个实体(1个batch)
SITES = [
    {"name":"biocomputing","dir":"biocomputing","files":[
        {"file":"biocomputing.json","count":60,"id_prefix":"BIOC","start":28,
         "prompt":"Generate {count} biocomputing technology entities (DNA computing, organoid intelligence, molecular computing, protein computing, bio-neural networks, synthetic biology computing, wetware computing). IDs start at {prefix}-{num}. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"description\":\"2-3 sentence description\",\"maturity\":\"Research/Prototype/Experimental/Commercial\"}}. Return ONLY JSON array."},
        {"file":"platforms.json","count":30,"id_prefix":"PLAT","start":18,
         "prompt":"Generate {count} biocomputing research platforms/companies. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"description\":\"...\",\"founded\":\"YYYY\"}}. Real organizations. Return ONLY JSON array."}
    ]},
    {"name":"tcm-tools","dir":"tcm-tools","files":[
        {"file":"herbs.json","count":60,"id_prefix":"HERB","start":28,
         "prompt":"Generate {count} Traditional Chinese Medicine herbs (中药材). Mix Chinese and English names. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"herb name\",\"category\":\"category\",\"description\":\"properties and uses\"}}. Return ONLY JSON array."},
        {"file":"formulas.json","count":45,"id_prefix":"FORM","start":6,
         "prompt":"Generate {count} TCM formulas (方剂). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name_cn\":\"中文名\",\"name_en\":\"English\",\"composition\":\"herbs list\",\"indication\":\"uses\"}}. Real formulas. Return ONLY JSON array."},
        {"file":"diseases.json","count":45,"id_prefix":"DIS","start":40,
         "prompt":"Generate {count} diseases treatable by TCM. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"category\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"agent-ecosystem","dir":"agent-ecosystem","files":[
        {"file":"mcp_servers.json","count":60,"id_prefix":"MCP","start":179,
         "prompt":"Generate {count} MCP (Model Context Protocol) server entities (database connectors, API tools, file systems, cloud services, dev tools). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"full_name\":\"...\",\"category\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."},
        {"file":"agent_sdks.json","count":45,"id_prefix":"SDK","start":104,
         "prompt":"Generate {count} AI Agent SDK entities (LangChain, CrewAI, AutoGen, LlamaIndex, etc). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"vendor\":\"...\",\"language\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
        {"file":"protocols.json","count":30,"id_prefix":"PROTO","start":73,
         "prompt":"Generate {count} AI/Agent protocol entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"vendor\":\"...\",\"version\":\"...\",\"layer\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"robot-parts","dir":"robot-parts","files":[
        {"file":"actuators.json","count":45,"id_prefix":"ACT","start":118,
         "prompt":"Generate {count} robot actuator entities (servos, motors, hydraulics, pneumatics, SMA, piezo). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"category\":\"...\",\"manufacturer\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
        {"file":"chips.json","count":45,"id_prefix":"CHIP","start":66,
         "prompt":"Generate {count} robot/AI chip entities (NVIDIA Jetson, Intel, Qualcomm, etc). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"category\":\"...\",\"manufacturer\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
        {"file":"sensors.json","count":45,"id_prefix":"SENS","start":13,
         "prompt":"Generate {count} robot sensor entities (LiDAR, IMU, cameras, tactile, ultrasonic). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"range\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"quantum-computing","dir":"quantum-computing","files":[
        {"file":"processors.json","count":45,"id_prefix":"QPU","start":102,
         "prompt":"Generate {count} quantum processor entities (IBM, Google, IonQ, Quantinuum). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"manufacturer\":\"...\",\"qubits\":N,\"technology\":\"...\"}}. Return ONLY JSON array."},
        {"file":"algorithms.json","count":45,"id_prefix":"ALG","start":94,
         "prompt":"Generate {count} quantum algorithm entities (Shor, Grover, VQE, QAOA). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"complexity\":\"...\",\"application\":\"...\"}}. Return ONLY JSON array."},
        {"file":"quantum_software.json","count":45,"id_prefix":"QSW","start":57,
         "prompt":"Generate {count} quantum software frameworks (Qiskit, Cirq, PennyLane). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"language\":\"...\",\"features\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"brain-science","dir":"brain-science","files":[
        {"file":"bci.json","count":45,"id_prefix":"BCI","start":85,
         "prompt":"Generate {count} Brain-Computer Interface tech entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"company\":\"...\",\"type\":\"...\",\"channels\":N}}. Return ONLY JSON array."},
        {"file":"brain_disorders.json","count":45,"id_prefix":"BD","start":51,
         "prompt":"Generate {count} brain disorder entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"prevalence\":\"...\",\"brain_regions\":\"...\"}}. Return ONLY JSON array."},
        {"file":"neural_implants.json","count":45,"id_prefix":"NI","start":52,
         "prompt":"Generate {count} neural implant entities (Neuralink, Utah Array, DBS). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"company\":\"...\",\"type\":\"...\",\"material\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"nuclear-energy","dir":"nuclear-energy","files":[
        {"file":"reactors.json","count":45,"id_prefix":"REA","start":96,
         "prompt":"Generate {count} nuclear reactor entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"status\":\"...\",\"capacity\":\"...\"}}. Return ONLY JSON array."},
        {"file":"fusion.json","count":45,"id_prefix":"FUS","start":75,
         "prompt":"Generate {count} fusion technology entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"approach\":\"...\",\"organization\":\"...\",\"status\":\"...\"}}. Return ONLY JSON array."},
        {"file":"smr.json","count":45,"id_prefix":"SMR","start":53,
         "prompt":"Generate {count} Small Modular Reactor entities (NuScale, Terrapower). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"capacity\":\"...\",\"status\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"exo-science","dir":"exo-science","files":[
        {"file":"exoplanets.json","count":60,"id_prefix":"EXO","start":112,
         "prompt":"Generate {count} exoplanet entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"distance\":\"...\",\"mass\":\"...\"}}. Return ONLY JSON array."},
        {"file":"space_missions.json","count":45,"id_prefix":"MIS","start":77,
         "prompt":"Generate {count} space mission entities (NASA, ESA, JAXA, CNSA). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"agency\":\"...\",\"type\":\"...\",\"target\":\"...\"}}. Return ONLY JSON array."},
        {"file":"space_telescopes.json","count":30,"id_prefix":"TEL","start":34,
         "prompt":"Generate {count} space telescope entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"wavelength\":\"...\",\"launch_year\":\"YYYY\"}}. Return ONLY JSON array."}
    ]},
    {"name":"alien-minerals","dir":"alien-minerals","files":[
        {"file":"minerals.json","count":60,"id_prefix":"MIN","start":74,
         "prompt":"Generate {count} mineral entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"formula\":\"...\",\"crystal_system\":\"...\",\"hardness\":N}}. Return ONLY JSON array."},
        {"file":"asteroids.json","count":45,"id_prefix":"AST","start":54,
         "prompt":"Generate {count} asteroid entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"designation\":\"...\",\"type\":\"...\",\"diameter_km\":N}}. Return ONLY JSON array."},
        {"file":"mining_tech.json","count":45,"id_prefix":"MINE","start":58,
         "prompt":"Generate {count} space mining technology entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"description\":\"...\",\"trl\":N}}. Return ONLY JSON array."}
    ]},
    {"name":"deep-sea-tech","dir":"deep-sea-tech","files":[
        {"file":"submersibles.json","count":45,"id_prefix":"SUB","start":97,
         "prompt":"Generate {count} submarine/submersible entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"max_depth\":N,\"operator\":\"...\"}}. Return ONLY JSON array."},
        {"file":"deep_sea_resources.json","count":45,"id_prefix":"DSR","start":64,
         "prompt":"Generate {count} deep sea resource entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"resource_type\":\"...\",\"location\":\"...\",\"depth\":\"...\"}}. Return ONLY JSON array."},
        {"file":"ocean_energy.json","count":30,"id_prefix":"OCE","start":39,
         "prompt":"Generate {count} ocean energy entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"depth\":\"...\",\"power_potential\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"new-energy","dir":"new-energy","files":[
        {"file":"solar.json","count":45,"id_prefix":"SOL","start":137,
         "prompt":"Generate {count} solar technology entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"efficiency\":\"...\",\"cost\":\"...\"}}. Return ONLY JSON array."},
        {"file":"energy_storage.json","count":45,"id_prefix":"STO","start":114,
         "prompt":"Generate {count} energy storage entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"energy_density\":\"...\",\"cycles\":N}}. Return ONLY JSON array."},
        {"file":"hydrogen_energy.json","count":45,"id_prefix":"HYD","start":96,
         "prompt":"Generate {count} hydrogen energy entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"efficiency\":\"...\",\"cost\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"life-science","dir":"life-science","files":[
        {"file":"longevity.json","count":45,"id_prefix":"LON","start":119,
         "prompt":"Generate {count} longevity/anti-aging research entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"mechanism\":\"...\",\"clinical_stage\":\"...\"}}. Return ONLY JSON array."},
        {"file":"cell_therapy.json","count":45,"id_prefix":"CELL","start":92,
         "prompt":"Generate {count} cell therapy entities (CAR-T, stem cell, NK cell). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"mechanism\":\"...\",\"clinical_stage\":\"...\"}}. Return ONLY JSON array."},
        {"file":"synbio.json","count":45,"id_prefix":"SYN","start":110,
         "prompt":"Generate {count} synthetic biology entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"type\":\"...\",\"applications\":\"...\",\"companies\":\"...\"}}. Return ONLY JSON array."}
    ]},
    {"name":"genetech-tools","dir":"genetech-tools","files":[
        {"file":"genes.json","count":45,"id_prefix":"GENE","start":132,
         "prompt":"Generate {count} human gene entities (real genes like BRCA1, TP53, EGFR). IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"symbol\":\"...\",\"first_seen\":\"...\",\"last_updated\":\"...\",\"source_count\":N}}. Return ONLY JSON array."},
        {"file":"diseases.json","count":45,"id_prefix":"DIS","start":183,
         "prompt":"Generate {count} genetic disease entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"name\":\"...\",\"first_seen\":\"...\",\"last_updated\":\"...\",\"source_count\":N}}. Return ONLY JSON array."},
        {"file":"gene_therapies.json","count":45,"id_prefix":"GT","start":74,
         "prompt":"Generate {count} gene therapy entities. IDs: {prefix}-{num}+. Each: {{\"id\":\"...\",\"target_genes\":\"...\",\"target_diseases\":\"...\",\"therapy_type\":\"...\",\"therapy_types\":\"...\"}}. Return ONLY JSON array."}
    ]}
]

def expand_file(site_dir, fdef):
    fpath = os.path.join(site_dir, fdef['file'])
    
    # Read existing
    existing = []
    is_dict = False
    raw_dict = None
    if os.path.exists(fpath):
        try:
            raw = json.load(open(fpath))
            if isinstance(raw, list):
                existing = raw
            elif isinstance(raw, dict):
                is_dict = True
                raw_dict = raw
                existing = raw.get('entities', raw.get('data', []))
        except:
            pass
    
    old_count = len(existing)
    
    # Generate in batches of 20
    batch_size = 20
    new_entities = []
    batches = (fdef['count'] + batch_size - 1) // batch_size
    
    for b in range(batches):
        bcount = min(batch_size, fdef['count'] - b * batch_size)
        bstart = fdef['start'] + b * batch_size
        prompt = fdef['prompt'].format(count=bcount, prefix=fdef['id_prefix'], num=bstart)
        
        content = call_xiaowu(prompt)
        batch_ents = parse_json_array(content)
        new_entities.extend(batch_ents)
        log(f"    batch {b+1}/{batches}: +{len(batch_ents)}")
        time.sleep(2)
    
    # Merge & write
    all_entities = existing + new_entities
    if is_dict and raw_dict:
        raw_dict['entities'] = all_entities
        if 'last_updated' in raw_dict:
            raw_dict['last_updated'] = '2026-06-28'
        with open(fpath, 'w') as f:
            json.dump(raw_dict, f, ensure_ascii=False, indent=2)
    else:
        with open(fpath, 'w') as f:
            json.dump(all_entities, f, ensure_ascii=False, indent=2)
    
    log(f"  ✅ {fdef['file']}: {old_count} → {len(all_entities)} (+{len(new_entities)})")
    return len(new_entities)

# Main
site_order = [s['name'] for s in SITES]
if len(sys.argv) > 1:
    site_order = [s for s in site_order if s in sys.argv[1:]]

grand = 0
for sname in site_order:
    site = next(s for s in SITES if s['name'] == sname)
    sdir = f"{BASE}/{site['dir']}/knowledge-base/entities"
    if not os.path.isdir(sdir):
        sdir = f"{BASE}/{site['dir']}/entities"
    if not os.path.isdir(sdir):
        log(f"❌ {sname}: dir not found")
        continue
    
    log(f"\n{'='*50}")
    log(f"Expanding: {sname}")
    added = 0
    for fdef in site['files']:
        added += expand_file(sdir, fdef)
    grand += added
    log(f"  {sname} total: +{added}")

log(f"\n{'='*50}")
log(f"GRAND TOTAL: +{grand} entities")
