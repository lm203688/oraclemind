#!/bin/bash
# 周六深挖 - 纯bash版，调用小乌API进行LLM提取
# 16个领域逐个处理

BASE="/home/z/my-project"
MINE_DIR="/tmp/kb-mine"
XW_URL="http://150.158.119.19:3003/v1/chat/completions"
XW_KEY="xiaowu-internal-2026"
XW_MODEL="xiaowu-agent"

LOG="/tmp/xw-bash-mine.log"
> "$LOG"

echo "🚀 周六深挖 (小乌LLM + bash)" | tee -a "$LOG"
echo "📅 2026-06-20" | tee -a "$LOG"

# Function: read search results, extract snippets, call xiaowu, save entities
process_task() {
  local task_name="$1"
  local file1="$2"
  local file2="$3"
  local domain="$4"
  local fields="$5"
  local entity_file="$6"
  local prefix="$7"
  local start_num="$8"
  
  echo "" | tee -a "$LOG"
  echo "[$task_name]" | tee -a "$LOG"
  
  # Read search results and build snippets
  local snippets=$(python3 -c "
import json, re
results = []
for f in ['$file1', '$file2']:
    try:
        raw = open(f).read()
        m = re.search(r'\[[\s\S]*\]', raw)
        if m:
            results.extend(json.loads(m.group()))
    except: pass
# Take top 10, truncate
for i, r in enumerate(results[:10]):
    name = (r.get('name','') or r.get('title',''))[:80]
    snippet = (r.get('snippet','') or '')[:200]
    url = r.get('url','')
    print(f'[{i+1}] {name} | {snippet} | {url}')
")
  
  local count=$(echo "$snippets" | grep -c '^\[')
  echo "  Results: $count" | tee -a "$LOG"
  
  if [ "$count" -eq 0 ]; then
    echo "  ⚠️ No results" | tee -a "$LOG"
    echo "0"
    return
  fi
  
  # Build prompt
  local prompt="From these search results about ${domain}, extract 5 real entities as JSON array. Each needs: ${fields}. Return ONLY JSON array.

${snippets}"
  
  # Call xiaowu API
  echo "  Asking 小乌..." | tee -a "$LOG"
  local payload=$(python3 -c "
import json
print(json.dumps({
    'model': '$XW_MODEL',
    'messages': [{'role': 'user', 'content': '''${prompt}'''[:4000]}],
    'temperature': 0.1,
    'max_tokens': 3000
}))
")
  
  local response=$(curl -s -m 120 -X POST "$XW_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XW_KEY" \
    -d "$payload" 2>/dev/null)
  
  # Extract entities from response
  local entities_json=$(echo "$response" | python3 -c "
import sys, json, re
try:
    resp = json.load(sys.stdin)
    content = resp['choices'][0]['message']['content']
    # Strip markdown
    cleaned = content.replace('\`\`\`json', '').replace('\`\`\`', '').strip()
    m = re.search(r'\[[\s\S]*\]', cleaned)
    if m:
        entities = json.loads(m.group())
        print(json.dumps(entities))
    else:
        print('[]')
except Exception as e:
    print('[]', file=sys.stderr)
    print('[]')
" 2>>"$LOG")
  
  local extracted=$(echo "$entities_json" | python3 -c "import json; print(len(json.load(sys.stdin)))")
  echo "  Extracted: $extracted entities" | tee -a "$LOG"
  
  # Save to entity file
  local added=$(python3 -c "
import json
fpath = '$entity_file'
raw = json.load(open(fpath))
if isinstance(raw, list):
    existing = raw
    is_array = True
elif isinstance(raw, dict) and 'entities' in raw:
    existing = raw['entities']
    is_array = False
else:
    existing = []
    is_array = False

# Find max ID
import re
next_id = $start_num
for e in existing:
    eid = e.get('id', '')
    if eid.startswith('$prefix-'):
        m = re.search(r'(\d+)', eid.replace('$prefix-', ''))
        if m:
            n = int(m.group())
            if n >= next_id:
                next_id = n + 1

existing_names = [e.get('name', '').lower() for e in existing]
entities = json.loads('''$entities_json''') if '''$entities_json'''.strip() else []

added = 0
for e in entities:
    if e.get('name') and e['name'].lower() not in existing_names:
        e['id'] = '$prefix-' + str(next_id).zfill(3)
        next_id += 1
        existing.append(e)
        existing_names.append(e['name'].lower())
        added += 1

if added > 0:
    if is_array:
        json.dump(existing, open(fpath, 'w'), indent=2, ensure_ascii=False)
    else:
        raw['entities'] = existing
        raw['last_updated'] = '2026-06-20T07:30:00Z'
        json.dump(raw, open(fpath, 'w'), indent=2, ensure_ascii=False)
print(added)
" 2>>"$LOG")
  
  echo "  ✅ +$added new" | tee -a "$LOG"
  echo "$added"
}

# ===== RUN ALL TASKS =====
NE_TOTAL=0
LS_TOTAL=0
AE_TOTAL=0

# --- 新能源 ---
echo "" | tee -a "$LOG"
echo "=== 新能源 ===" | tee -a "$LOG"

R=$(process_task "solar" "$MINE_DIR/solar1.json" "$MINE_DIR/solar2.json" \
  "solar photovoltaic technology" \
  "name, type, efficiency, developer, status, description" \
  "$BASE/new-energy/knowledge-base/entities/solar.json" "SE" 115)
NE_TOTAL=$((NE_TOTAL + R))

R=$(process_task "storage" "$MINE_DIR/storage1.json" "$MINE_DIR/storage2.json" \
  "energy storage technology" \
  "name, type, capacity, technology, developer, status, description" \
  "$BASE/new-energy/knowledge-base/entities/storage.json" "ST" 96)
NE_TOTAL=$((NE_TOTAL + R))

R=$(process_task "hydrogen" "$MINE_DIR/hydrogen1.json" "$MINE_DIR/hydrogen2.json" \
  "hydrogen energy technology" \
  "name, type, technology, efficiency, developer, status, description" \
  "$BASE/new-energy/knowledge-base/entities/hydrogen_energy.json" "HYD" 79)
NE_TOTAL=$((NE_TOTAL + R))

R=$(process_task "wind" "$MINE_DIR/wind1.json" "$MINE_DIR/wind2.json" \
  "wind energy technology" \
  "name, type, capacity, technology, developer, status, description" \
  "$BASE/new-energy/knowledge-base/entities/wind_energy.json" "WIND" 63)
NE_TOTAL=$((NE_TOTAL + R))

R=$(process_task "grid" "$MINE_DIR/grid1.json" "$MINE_DIR/grid2.json" \
  "grid technology" \
  "name, type, technology, capacity, developer, status, description" \
  "$BASE/new-energy/knowledge-base/entities/grid_tech.json" "GRID" 68)
NE_TOTAL=$((NE_TOTAL + R))

echo "" | tee -a "$LOG"
echo "📊 新能源: +$NE_TOTAL" | tee -a "$LOG"

# --- 生命科学 ---
echo "" | tee -a "$LOG"
echo "=== 生命科学 ===" | tee -a "$LOG"

R=$(process_task "synbio" "$MINE_DIR/synbio1.json" "$MINE_DIR/synbio2.json" \
  "synthetic biology" \
  "name, type, applications, companies, maturity, description, trend" \
  "$BASE/life-science/knowledge-base/entities/synbio.json" "SB" 79)
LS_TOTAL=$((LS_TOTAL + R))

R=$(process_task "cell" "$MINE_DIR/cell1.json" "$MINE_DIR/cell2.json" \
  "cell therapy and regenerative medicine" \
  "name, type, target, technology, status, description" \
  "$BASE/life-science/knowledge-base/entities/cell_therapy.json" "CT" 79)
LS_TOTAL=$((LS_TOTAL + R))

R=$(process_task "longevity" "$MINE_DIR/long1.json" "$MINE_DIR/long2.json" \
  "longevity and anti-aging technology" \
  "name, type, mechanism, target, status, description" \
  "$BASE/life-science/knowledge-base/entities/longevity.json" "LG" 109)
LS_TOTAL=$((LS_TOTAL + R))

R=$(process_task "bioinf" "$MINE_DIR/bioinf1.json" "$MINE_DIR/bioinf2.json" \
  "bioinformatics and computational biology" \
  "name, type, technology, application, status, description" \
  "$BASE/life-science/knowledge-base/entities/bioinformatics.json" "BINF" 71)
LS_TOTAL=$((LS_TOTAL + R))

R=$(process_task "biomanuf" "$MINE_DIR/biomanuf1.json" "$MINE_DIR/biomanuf2.json" \
  "biomanufacturing" \
  "name, type, technology, application, status, description" \
  "$BASE/life-science/knowledge-base/entities/biomanufacturing.json" "BM" 79)
LS_TOTAL=$((LS_TOTAL + R))

echo "" | tee -a "$LOG"
echo "📊 生命科学: +$LS_TOTAL" | tee -a "$LOG"

# --- Agent生态 ---
echo "" | tee -a "$LOG"
echo "=== Agent生态 ===" | tee -a "$LOG"

R=$(process_task "mcp" "$MINE_DIR/mcp1.json" "$MINE_DIR/mcp2.json" \
  "MCP Model Context Protocol servers" \
  "name, full_name, category, description, protocol_version, auth, hosts, security, stars, maintainer, status, language, features" \
  "$BASE/agent-ecosystem/knowledge-base/entities/mcp_servers.json" "MCP" 165)
AE_TOTAL=$((AE_TOTAL + R))

R=$(process_task "sdk" "$MINE_DIR/sdk1.json" "$MINE_DIR/sdk2.json" \
  "AI agent SDKs and frameworks" \
  "name, type, language, features, description, license, github_stars, status" \
  "$BASE/agent-ecosystem/knowledge-base/entities/sdks.json" "SDK" 33)
AE_TOTAL=$((AE_TOTAL + R))

R=$(process_task "proto" "$MINE_DIR/proto1.json" "$MINE_DIR/proto2.json" \
  "AI agent communication protocols" \
  "name, type, description, status, maintainers, features" \
  "$BASE/agent-ecosystem/knowledge-base/entities/protocols.json" "PROTO" 67)
AE_TOTAL=$((AE_TOTAL + R))

R=$(process_task "vdb" "$MINE_DIR/vdb1.json" "$MINE_DIR/vdb2.json" \
  "vector databases" \
  "name, type, description, features, performance, license, github_stars, status" \
  "$BASE/agent-ecosystem/knowledge-base/entities/vector_dbs.json" "VDB" 36)
AE_TOTAL=$((AE_TOTAL + R))

R=$(process_task "mem" "$MINE_DIR/mem1.json" "$MINE_DIR/mem2.json" \
  "AI agent memory systems" \
  "name, type, description, features, integration, status" \
  "$BASE/agent-ecosystem/knowledge-base/entities/memory_systems.json" "MEM" 24)
AE_TOTAL=$((AE_TOTAL + R))

R=$(process_task "bench" "$MINE_DIR/bench1.json" "$MINE_DIR/bench2.json" \
  "AI agent benchmarks and evaluation" \
  "name, type, description, metrics, leaderboard_url, status" \
  "$BASE/agent-ecosystem/knowledge-base/entities/benchmarks.json" "BENCH" 9)
AE_TOTAL=$((AE_TOTAL + R))

echo "" | tee -a "$LOG"
echo "📊 Agent生态: +$AE_TOTAL" | tee -a "$LOG"

# ===== SUMMARY =====
GRAND=$((NE_TOTAL + LS_TOTAL + AE_TOTAL))
echo "" | tee -a "$LOG"
echo "==================================================" | tee -a "$LOG"
echo "🎉 深挖完成! (小乌提取)" | tee -a "$LOG"
echo "  新能源: +$NE_TOTAL" | tee -a "$LOG"
echo "  生命科学: +$LS_TOTAL" | tee -a "$LOG"
echo "  Agent生态: +$AE_TOTAL" | tee -a "$LOG"
echo "  总计新增: $GRAND" | tee -a "$LOG"
echo "==================================================" | tee -a "$LOG"

# Save report
python3 -c "
import json
report = {
    'date': '2026-06-20',
    'day': 'Saturday',
    'executor': 'xiaowu-agent (LLM) + bash',
    'domains': ['new-energy', 'life-science', 'agent-ecosystem'],
    'totals': {'new_energy': $NE_TOTAL, 'life_science': $LS_TOTAL, 'agent_ecosystem': $AE_TOTAL},
    'total_new': $GRAND
}
json.dump(report, open('$BASE/kb-workflow/reports/deep-mine-2026-06-20.json', 'w'), indent=2)
print('Report saved.')
" | tee -a "$LOG"
