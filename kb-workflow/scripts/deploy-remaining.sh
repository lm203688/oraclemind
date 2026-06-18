#!/bin/bash
# Deploy remaining 7 KB sites to CF Pages
# 需要在463102527@qq.com的CF账户下操作
# 需要CF API Token (Cloudflare Pages Edit权限)

# 使用方法:
# export CLOUDFLARE_API_TOKEN="<463102527@qq.com账户的CF API Token>"
# bash deploy-remaining.sh

SITES=(
  "new-energy:newenergy"
  "life-science:lifescience"
  "agent-ecosystem:agentecosystem"
  "exo-science:exoscience"
  "deep-sea-tech:deepseatech"
  "robot-parts:robotparts"
  "tcm-tools:tcm-tools"
)

BASE="/home/z/my-project"

for entry in "${SITES[@]}"; do
  IFS=':' read -r dir project <<< "$entry"
  echo "🚀 Deploying $dir → $project..."
  
  tmp_dir=$(mktemp -d)
  cp -r "$BASE/$dir/website/"* "$tmp_dir/" 2>/dev/null
  cd "$tmp_dir"
  
  npx wrangler pages deploy . --project-name="$project" 2>&1 | tail -5
  
  rm -rf "$tmp_dir"
  cd "$BASE"
  sleep 3
done

echo "🎉 All 7 sites deployed!"
