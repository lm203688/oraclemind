#!/bin/bash
# Daily SEO submission script
# Submits URLs to search engines via IndexNow
# Strategy: GET format for reliability, submit homepage + sitemap URL to all 3 endpoints

BASE="/home/z/my-project"
LOG="/home/z/my-project/kb-workflow/logs/seo-submit.log"
INDEXNOW_KEY="kb3f8a2c9d7e1f4b6a5d8c3e7f9a2b4d"

mkdir -p "$(dirname "$LOG")"

echo "$(date): Starting SEO submission" >> "$LOG"

for dir in genetech-tools tcm-tools agent-ecosystem robot-parts quantum-computing brain-science nuclear-energy exo-science alien-minerals deep-sea-tech new-energy life-science biocomputing; do
  domain_map="genetech-tools:genetech.tools tcm-tools:tcm.genetech.tools agent-ecosystem:agent.genetech.tools robot-parts:robot.genetech.tools quantum-computing:quantum.genetech.tools brain-science:brain.genetech.tools nuclear-energy:nuclear.genetech.tools exo-science:exo.genetech.tools alien-minerals:mineral.genetech.tools deep-sea-tech:deepsea.genetech.tools new-energy:energy.genetech.tools life-science:life.genetech.tools biocomputing:biocompute.genetech.tools"
  domain=$(echo "$domain_map" | tr ' ' '\n' | grep "^$dir:" | sed "s/^$dir://")
  
  # Submit homepage and sitemap via GET to all 3 IndexNow endpoints
  # GET format is more reliable than POST for subdomains
  urls=("https://$domain/" "https://$domain/sitemap.xml")
  endpoints=("api.indexnow.org" "www.bing.com" "yandex.com")
  
  for url in "${urls[@]}"; do
    for endpoint in "${endpoints[@]}"; do
      code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
        "https://$endpoint/indexnow?url=${url}&key=$INDEXNOW_KEY" 2>/dev/null)
      echo "$(date): $domain: $url → $endpoint: $code" >> "$LOG"
    done
  done
  
  # Also try POST batch submission (works for main domain, may fail for subdomains due to Bing cache)
  urls_json=$(curl -sL --max-time 10 "https://$domain/sitemap.xml" 2>/dev/null | python3 -c "
import sys, re, json
content = sys.stdin.read()
urls = re.findall(r'<loc>(.*?)</loc>', content)
print(json.dumps(urls[:100]))
" 2>/dev/null)
  
  if [ "$urls_json" != "[]" ] && [ -n "$urls_json" ]; then
    payload="{\"host\":\"$domain\",\"key\":\"$INDEXNOW_KEY\",\"urlList\":$urls_json}"
    post_result=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST \
      "https://api.indexnow.org/indexnow" \
      -H "Content-Type: application/json" \
      -d "$payload" 2>/dev/null)
    echo "$(date): $domain: POST batch → IndexNow: $post_result" >> "$LOG"
  fi
done

# Submit aishield.tools (separate domain via CF Tunnel)
echo "$(date): Submitting aishield.tools" >> "$LOG"
for endpoint in api.indexnow.org www.bing.com yandex.com; do
  for url in "https://aishield.tools/" "https://aishield.tools/llms.txt" "https://aishield.tools/.well-known/ai-plugin.json"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
      "https://$endpoint/indexnow?url=${url}&key=$INDEXNOW_KEY" 2>/dev/null)
    echo "$(date): aishield.tools: $url → $endpoint: $code" >> "$LOG"
  done
done

echo "$(date): SEO submission complete" >> "$LOG"
