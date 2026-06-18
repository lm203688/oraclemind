#!/bin/bash
# 部署全部12站到CF Pages
# 用法: bash deploy-all.sh
# 注意: CF Token从环境变量或本文件读取

CF_TOKEN="${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_API_TOKEN}}"
BASE="/home/z/my-project"

SITES=(
  "genetech-tools:genetech-tools"
  "new-energy:newenergy"
  "life-science:lifescience"
  "agent-ecosystem:agentecosystem"
  "brain-science:brainscience"
  "quantum-computing:quantumcomputing"
  "nuclear-energy:nuclearenergy"
  "exo-science:exoscience"
  "alien-minerals:alienminerals"
  "deep-sea-tech:deepseatech"
  "robot-parts:robotparts"
  "tcm-tools:tcm-tools"
)

echo "🚀 Deploying 12 sites to CF Pages..."
echo "================================================"

SUCCESS=0
FAIL=0

for entry in "${SITES[@]}"; do
  IFS=':' read -r dir project <<< "$entry"
  echo -n "  $project... "
  tmp_dir=$(mktemp -d)
  cp -r "$BASE/$dir/website/"* "$tmp_dir/" 2>/dev/null
  cd "$tmp_dir"
  result=$(CLOUDFLARE_API_TOKEN="$CF_TOKEN" npx wrangler pages deploy . --project-name="$project" 2>&1)
  if echo "$result" | grep -q "Deployment complete"; then
    echo "✅"
    ((SUCCESS++))
  else
    echo "❌ $(echo $result | tail -1)"
    ((FAIL++))
  fi
  rm -rf "$tmp_dir"
  cd "$BASE"
  sleep 2
done

echo "================================================"
echo "✅ Success: $SUCCESS | ❌ Fail: $FAIL"
