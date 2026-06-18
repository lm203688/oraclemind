#!/bin/bash
# 12站健康检查
# 用法: bash health-check.sh

echo "🔍 12站健康检查"
echo "================================================"

DOMAINS=(
  "genetech.tools"
  "energy.genetech.tools"
  "life.genetech.tools"
  "agent.genetech.tools"
  "brain.genetech.tools"
  "quantum.genetech.tools"
  "nuclear.genetech.tools"
  "exo.genetech.tools"
  "mineral.genetech.tools"
  "deepsea.genetech.tools"
  "robot.genetech.tools"
  "tcm.genetech.tools"
)

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
OK=0
FAIL=0

for domain in "${DOMAINS[@]}"; do
  # 首页
  code_home=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "User-Agent: $UA" "https://$domain/" 2>&1)
  # agent-discovery.json
  code_discovery=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "User-Agent: $UA" "https://$domain/agent-discovery.json" 2>&1)
  # llms.txt
  code_llms=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "User-Agent: $UA" "https://$domain/llms.txt" 2>&1)
  # api/data.json
  code_api=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "User-Agent: $UA" "https://$domain/api/data.json" 2>&1)

  if [ "$code_home" = "200" ] && [ "$code_discovery" = "200" ] && [ "$code_llms" = "200" ]; then
    echo "  ✅ $domain (home:$code_home discovery:$code_discovery llms:$code_llms api:$code_api)"
    ((OK++))
  else
    echo "  ❌ $domain (home:$code_home discovery:$code_discovery llms:$code_llms api:$code_api)"
    ((FAIL++))
  fi
done

echo "================================================"
echo "✅ OK: $OK | ❌ Fail: $FAIL"
