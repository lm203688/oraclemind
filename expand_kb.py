#!/usr/bin/env python3
"""Batch expand 13 knowledge base sites using Xiaowu API."""
import json, os, time, requests, sys

API_URL = "http://150.158.119.19:3003/v1/chat/completions"
API_KEY = "xiaowu-internal-2026"
BASE = "/home/z/my-project"

# 13站扩充计划
SITES = [
    {
        "name": "biocomputing",
        "dir": "biocomputing",
        "files": [
            {"file": "biocomputing.json", "count": 80, "id_prefix": "BIOC", "start": 28,
             "fields": ["id","name","type","description","maturity"],
             "prompt": "Generate {count} biocomputing technology entities. Cover: DNA computing, organoid intelligence, molecular computing, protein computing, biological neural networks, memristive bio-circuits, synthetic biology computing, wetware computing, bioluminescent computing, neurotransistor systems. Each entity: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"description\":\"...\",\"maturity\":\"Research/Prototype/Experimental/Commercial\"}}. Return ONLY JSON array."},
            {"file": "platforms.json", "count": 40, "id_prefix": "PLAT", "start": 18,
             "fields": ["id","name","type","description","founded"],
             "prompt": "Generate {count} biocomputing platform entities (research labs, companies, open-source projects). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"description\":\"...\",\"founded\":\"YYYY\"}}. Real organizations. Return ONLY JSON array."}
        ]
    },
    {
        "name": "tcm-tools",
        "dir": "tcm-tools",
        "files": [
            {"file": "herbs.json", "count": 80, "id_prefix": "HERB", "start": 28,
             "fields": ["id","name","category","description"],
             "prompt": "Generate {count} Traditional Chinese Medicine herb entities. Use real TCM herbs (人参, 黄芪, 当归, etc.) with English names. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"category\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."},
            {"file": "formulas.json", "count": 50, "id_prefix": "FORM", "start": 6,
             "fields": ["id","name_cn","name_en","composition","indication"],
             "prompt": "Generate {count} TCM formula entities (经典方剂). Each: {{\"id\":\"{prefix}-{num}\",\"name_cn\":\"...\",\"name_en\":\"...\",\"composition\":\"...\",\"indication\":\"...\"}}. Real formulas like 四物汤, 六味地黄丸. Return ONLY JSON array."},
            {"file": "diseases.json", "count": 60, "id_prefix": "DIS", "start": 40,
             "fields": ["id","name","category","description"],
             "prompt": "Generate {count} diseases treatable by TCM. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"category\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "agent-ecosystem",
        "dir": "agent-ecosystem",
        "files": [
            {"file": "mcp_servers.json", "count": 80, "id_prefix": "MCP", "start": 179,
             "fields": ["id","name","full_name","category","description"],
             "prompt": "Generate {count} MCP (Model Context Protocol) server entities. Cover: database connectors, API integrations, file systems, developer tools, cloud services, automation tools. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"full_name\":\"...\",\"category\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."},
            {"file": "sdks.json", "count": 60, "id_prefix": "SDK", "start": 104,
             "fields": ["id","name","vendor","language","type"],
             "prompt": "Generate {count} AI Agent SDK entities. Cover: LangChain, LlamaIndex, CrewAI, AutoGen, etc. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"vendor\":\"...\",\"language\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
            {"file": "protocols.json", "count": 50, "id_prefix": "PROTO", "start": 73,
             "fields": ["id","name","vendor","version","layer"],
             "prompt": "Generate {count} AI/Agent protocol entities (MCP, A2A, OpenAI function calling, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"vendor\":\"...\",\"version\":\"...\",\"layer\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "robot-parts",
        "dir": "robot-parts",
        "files": [
            {"file": "actuators.json", "count": 60, "id_prefix": "ACT", "start": 118,
             "fields": ["id","name","category","manufacturer","type"],
             "prompt": "Generate {count} robot actuator entities (motors, servos, hydraulics, pneumatics, shape memory alloys, piezoelectric actuators). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"category\":\"...\",\"manufacturer\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
            {"file": "chips.json", "count": 60, "id_prefix": "CHIP", "start": 66,
             "fields": ["id","name","category","manufacturer","type"],
             "prompt": "Generate {count} robot/AI chip entities (NVIDIA Jetson, Intel RealSense, Qualcomm, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"category\":\"...\",\"manufacturer\":\"...\",\"type\":\"...\"}}. Return ONLY JSON array."},
            {"file": "sensors.json", "count": 60, "id_prefix": "SENS", "start": 13,
             "fields": ["id","name","type","range","description"],
             "prompt": "Generate {count} robot sensor entities (LiDAR, IMU, cameras, tactile, ultrasonic, force torque). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"range\":\"...\",\"description\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "quantum-computing",
        "dir": "quantum-computing",
        "files": [
            {"file": "processors.json", "count": 60, "id_prefix": "QPU", "start": 102,
             "fields": ["id","name","manufacturer","qubits","technology"],
             "prompt": "Generate {count} quantum processor entities (IBM, Google, IonQ, Quantinuum, PsiQuantum, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"manufacturer\":\"...\",\"qubits\":N,\"technology\":\"...\"}}. Return ONLY JSON array."},
            {"file": "algorithms.json", "count": 60, "id_prefix": "ALG", "start": 94,
             "fields": ["id","name","type","complexity","application"],
             "prompt": "Generate {count} quantum algorithm entities (Shor, Grover, VQE, QAOA, HHL, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"complexity\":\"...\",\"application\":\"...\"}}. Return ONLY JSON array."},
            {"file": "quantum_software.json", "count": 60, "id_prefix": "QSW", "start": 57,
             "fields": ["id","name","type","language","features"],
             "prompt": "Generate {count} quantum software framework entities (Qiskit, Cirq, PennyLane, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"language\":\"...\",\"features\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "brain-science",
        "dir": "brain-science",
        "files": [
            {"file": "bci.json", "count": 60, "id_prefix": "BCI", "start": 85,
             "fields": ["id","name","company","type","channels"],
             "prompt": "Generate {count} Brain-Computer Interface technology entities. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"company\":\"...\",\"type\":\"...\",\"channels\":N}}. Real tech. Return ONLY JSON array."},
            {"file": "brain_disorders.json", "count": 60, "id_prefix": "BD", "start": 51,
             "fields": ["id","name","type","prevalence","brain_regions"],
             "prompt": "Generate {count} brain disorder entities (Alzheimer, Parkinson, depression, epilepsy, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"prevalence\":\"...\",\"brain_regions\":\"...\"}}. Return ONLY JSON array."},
            {"file": "neural_implants.json", "count": 60, "id_prefix": "NI", "start": 52,
             "fields": ["id","name","company","type","material"],
             "prompt": "Generate {count} neural implant entities (Neuralink, Utah Array, DBS, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"company\":\"...\",\"type\":\"...\",\"material\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "nuclear-energy",
        "dir": "nuclear-energy",
        "files": [
            {"file": "reactors.json", "count": 60, "id_prefix": "REA", "start": 96,
             "fields": ["id","name","type","status","capacity"],
             "prompt": "Generate {count} nuclear reactor entities (PWR, BWR, HTGR, MSR, fusion reactors). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"status\":\"...\",\"capacity\":\"...\"}}. Real reactors. Return ONLY JSON array."},
            {"file": "fusion.json", "count": 60, "id_prefix": "FUS", "start": 75,
             "fields": ["id","name","approach","organization","status"],
             "prompt": "Generate {count} fusion technology entities (tokamak, stellarator, ICF, magnetic confinement, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"approach\":\"...\",\"organization\":\"...\",\"status\":\"...\"}}. Real projects. Return ONLY JSON array."},
            {"file": "smr.json", "count": 60, "id_prefix": "SMR", "start": 53,
             "fields": ["id","name","type","capacity","status"],
             "prompt": "Generate {count} Small Modular Reactor entities (NuScale, Terrapower, Rolls-Royce SMR, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"capacity\":\"...\",\"status\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "exo-science",
        "dir": "exo-science",
        "files": [
            {"file": "exoplanets.json", "count": 80, "id_prefix": "EXO", "start": 112,
             "fields": ["id","name","type","distance","mass"],
             "prompt": "Generate {count} exoplanet entities (gas giants, super-Earths, habitable zone planets). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"distance\":\"...\",\"mass\":\"...\"}}. Real discovered exoplanets. Return ONLY JSON array."},
            {"file": "space_missions.json", "count": 60, "id_prefix": "MIS", "start": 77,
             "fields": ["id","name","agency","type","target"],
             "prompt": "Generate {count} space mission entities (NASA, ESA, JAXA, CNSA missions). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"agency\":\"...\",\"type\":\"...\",\"target\":\"...\"}}. Real missions. Return ONLY JSON array."},
            {"file": "space_telescopes.json", "count": 40, "id_prefix": "TEL", "start": 34,
             "fields": ["id","name","type","wavelength","launch_year"],
             "prompt": "Generate {count} space telescope entities (JWST, Hubble, Kepler, TESS, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"wavelength\":\"...\",\"launch_year\":\"YYYY\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "alien-minerals",
        "dir": "alien-minerals",
        "files": [
            {"file": "minerals.json", "count": 70, "id_prefix": "MIN", "start": 74,
             "fields": ["id","name","formula","crystal_system","hardness"],
             "prompt": "Generate {count} mineral entities (silicates, oxides, sulfides, carbonates, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"formula\":\"...\",\"crystal_system\":\"...\",\"hardness\":N}}. Real minerals. Return ONLY JSON array."},
            {"file": "asteroids.json", "count": 60, "id_prefix": "AST", "start": 54,
             "fields": ["id","name","designation","type","diameter_km"],
             "prompt": "Generate {count} asteroid entities (C-type, S-type, M-type, near-Earth, main belt). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"designation\":\"...\",\"type\":\"...\",\"diameter_km\":N}}. Real asteroids. Return ONLY JSON array."},
            {"file": "mining_tech.json", "count": 60, "id_prefix": "MINE", "start": 58,
             "fields": ["id","name","type","description","trl"],
             "prompt": "Generate {count} space mining technology entities. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"description\":\"...\",\"trl\":N}}. TRL 1-9. Return ONLY JSON array."}
        ]
    },
    {
        "name": "deep-sea-tech",
        "dir": "deep-sea-tech",
        "files": [
            {"file": "submersibles.json", "count": 60, "id_prefix": "SUB", "start": 97,
             "fields": ["id","name","type","max_depth","operator"],
             "prompt": "Generate {count} submarine/submersible entities (Alvin, Nautile, Jiaolong, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"max_depth\":N,\"operator\":\"...\"}}. Return ONLY JSON array."},
            {"file": "deep_sea_resources.json", "count": 60, "id_prefix": "DSR", "start": 64,
             "fields": ["id","name","resource_type","location","depth"],
             "prompt": "Generate {count} deep sea resource entities (manganese nodules, hydrothermal vents, gas hydrates, rare earth elements). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"resource_type\":\"...\",\"location\":\"...\",\"depth\":\"...\"}}. Return ONLY JSON array."},
            {"file": "ocean_energy.json", "count": 50, "id_prefix": "OCE", "start": 39,
             "fields": ["id","name","type","depth","power_potential"],
             "prompt": "Generate {count} ocean energy entities (tidal, wave, OTEC, current). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"depth\":\"...\",\"power_potential\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "new-energy",
        "dir": "new-energy",
        "files": [
            {"file": "solar.json", "count": 60, "id_prefix": "SOL", "start": 137,
             "fields": ["id","name","type","efficiency","cost"],
             "prompt": "Generate {count} solar technology entities (perovskite, tandem, CPV, thin film, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"efficiency\":\"...\",\"cost\":\"...\"}}. Return ONLY JSON array."},
            {"file": "storage.json", "count": 60, "id_prefix": "STO", "start": 114,
             "fields": ["id","name","type","energy_density","cycles"],
             "prompt": "Generate {count} energy storage entities (Li-ion, solid-state, flow batteries, gravity, compressed air, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"energy_density\":\"...\",\"cycles\":N}}. Return ONLY JSON array."},
            {"file": "hydrogen_energy.json", "count": 60, "id_prefix": "HYD", "start": 96,
             "fields": ["id","name","type","efficiency","cost"],
             "prompt": "Generate {count} hydrogen energy entities (electrolysis, fuel cells, storage, transport). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"efficiency\":\"...\",\"cost\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "life-science",
        "dir": "life-science",
        "files": [
            {"file": "longevity.json", "count": 60, "id_prefix": "LON", "start": 119,
             "fields": ["id","name","type","mechanism","clinical_stage"],
             "prompt": "Generate {count} longevity/anti-aging research entities (senolytics, NAD+, mTOR, telomerase, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"mechanism\":\"...\",\"clinical_stage\":\"...\"}}. Return ONLY JSON array."},
            {"file": "cell_therapy.json", "count": 60, "id_prefix": "CELL", "start": 92,
             "fields": ["id","name","type","mechanism","clinical_stage"],
             "prompt": "Generate {count} cell therapy entities (CAR-T, stem cell, NK cell, TIL, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"mechanism\":\"...\",\"clinical_stage\":\"...\"}}. Return ONLY JSON array."},
            {"file": "synbio.json", "count": 60, "id_prefix": "SYN", "start": 110,
             "fields": ["id","name","type","applications","companies"],
             "prompt": "Generate {count} synthetic biology entities (CRISPR, metabolic engineering, cell-free, etc). Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"type\":\"...\",\"applications\":\"...\",\"companies\":\"...\"}}. Return ONLY JSON array."}
        ]
    },
    {
        "name": "genetech-tools",
        "dir": "genetech-tools",
        "files": [
            {"file": "genes.json", "count": 60, "id_prefix": "GENE", "start": 132,
             "fields": ["id","symbol","first_seen","last_updated","source_count"],
             "prompt": "Generate {count} human gene entities (BRCA1, TP53, EGFR, APOE, etc). Each: {{\"id\":\"{prefix}-{num}\",\"symbol\":\"...\",\"first_seen\":\"...\",\"last_updated\":\"...\",\"source_count\":N}}. Real genes. Return ONLY JSON array."},
            {"file": "diseases.json", "count": 60, "id_prefix": "DIS", "start": 183,
             "fields": ["id","name","first_seen","last_updated","source_count"],
             "prompt": "Generate {count} genetic disease entities. Each: {{\"id\":\"{prefix}-{num}\",\"name\":\"...\",\"first_seen\":\"...\",\"last_updated\":\"...\",\"source_count\":N}}. Return ONLY JSON array."},
            {"file": "gene_therapies.json", "count": 60, "id_prefix": "GT", "start": 74,
             "fields": ["id","target_genes","target_diseases","therapy_type","therapy_types"],
             "prompt": "Generate {count} gene therapy entities (AAV, lentivirus, CRISPR therapies). Each: {{\"id\":\"{prefix}-{num}\",\"target_genes\":\"...\",\"target_diseases\":\"...\",\"therapy_type\":\"...\",\"therapy_types\":\"...\"}}. Return ONLY JSON array."}
        ]
    }
]

def call_xiaowu(prompt, max_tokens=3000):
    """Call Xiaowu API to generate data."""
    try:
        resp = requests.post(API_URL, json={
            "model": "xiaowu-agent",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }, headers={"Authorization": f"Bearer {API_KEY}"}, timeout=90)
        data = resp.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        print(f"  ❌ API error: {e}")
        return None

def parse_json_from_response(content):
    """Extract JSON array from LLM response."""
    if not content:
        return []
    # Remove markdown code blocks
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
    # Find JSON array
    import re
    match = re.search(r'\[[\s\S]*\]', content)
    if match:
        try:
            return json.loads(match.group())
        except:
            # Try fixing trailing commas
            fixed = match.group().replace(',]', ']').replace(',}', '}')
            try:
                return json.loads(fixed)
            except:
                return []
    return []

def expand_site(site):
    """Expand one site's data."""
    site_dir = f"{BASE}/{site['dir']}/knowledge-base/entities"
    if not os.path.isdir(site_dir):
        site_dir = f"{BASE}/{site['dir']}/entities"
    if not os.path.isdir(site_dir):
        print(f"❌ {site['name']}: entities dir not found")
        return 0
    
    total_added = 0
    for fdef in site['files']:
        fpath = os.path.join(site_dir, fdef['file'])
        
        # Read existing data
        existing = []
        if os.path.exists(fpath):
            try:
                data = json.load(open(fpath))
                if isinstance(data, list):
                    existing = data
                elif isinstance(data, dict):
                    existing = data.get('entities', data.get('data', []))
            except:
                pass
        
        old_count = len(existing)
        
        # Generate prompt
        prompt = fdef['prompt'].format(
            count=fdef['count'],
            prefix=fdef['id_prefix'],
            num=fdef['start']
        )
        
        # Call API (split into batches of 30 to avoid token limits)
        batch_size = 30
        new_entities = []
        batches = (fdef['count'] + batch_size - 1) // batch_size
        
        for batch in range(batches):
            batch_count = min(batch_size, fdef['count'] - batch * batch_size)
            batch_start = fdef['start'] + batch * batch_size
            batch_prompt = fdef['prompt'].format(
                count=batch_count,
                prefix=fdef['id_prefix'],
                num=batch_start
            )
            
            content = call_xiaowu(batch_prompt)
            batch_entities = parse_json_from_response(content)
            new_entities.extend(batch_entities)
            print(f"  {fdef['file']} batch {batch+1}/{batches}: +{len(batch_entities)}")
            time.sleep(1)  # Rate limit
        
        # Merge
        all_entities = existing + new_entities
        total_added += len(new_entities)
        
        # Write back (preserve format)
        if os.path.exists(fpath):
            try:
                raw = json.load(open(fpath))
                if isinstance(raw, dict) and 'entities' in raw:
                    raw['entities'] = all_entities
                    if 'version' in raw:
                        raw['last_updated'] = '2026-06-28'
                    with open(fpath, 'w') as f:
                        json.dump(raw, f, ensure_ascii=False, indent=2)
                else:
                    with open(fpath, 'w') as f:
                        json.dump(all_entities, f, ensure_ascii=False, indent=2)
            except:
                with open(fpath, 'w') as f:
                    json.dump(all_entities, f, ensure_ascii=False, indent=2)
        else:
            with open(fpath, 'w') as f:
                json.dump(new_entities, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ {fdef['file']}: {old_count} → {len(all_entities)} (+{len(new_entities)})")
    
    return total_added

# Main
if __name__ == "__main__":
    # Process sites in order (smallest first)
    site_order = ["biocomputing", "tcm-tools", "agent-ecosystem", "robot-parts", 
                  "quantum-computing", "brain-science", "nuclear-energy", "exo-science",
                  "alien-minerals", "deep-sea-tech", "new-energy", "life-science", "genetech-tools"]
    
    # Allow command-line site selection
    if len(sys.argv) > 1:
        site_order = [s for s in site_order if s in sys.argv[1:]]
    
    grand_added = 0
    for site_name in site_order:
        site = next((s for s in SITES if s['name'] == site_name), None)
        if not site:
            continue
        print(f"\n{'='*60}")
        print(f"Expanding: {site['name']}")
        added = expand_site(site)
        grand_added += added
        print(f"  Site total: +{added} entities")
    
    print(f"\n{'='*60}")
    print(f"GRAND TOTAL: +{grand_added} entities added")
