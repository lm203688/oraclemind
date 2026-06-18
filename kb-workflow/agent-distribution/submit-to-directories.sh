#!/bin/bash
# ============================================================
# 小乌任务：Agent原生分发 — Phase 3 渠道提交
# ============================================================
# 
# 任务说明：
# 1. 将MCP Server提交到各大MCP目录
# 2. 将12站sitemap提交到搜索引擎
# 3. 将llms.txt提交到AI搜索引擎
#
# 执行方式：在服务器上运行 bash submit-to-directories.sh
# ============================================================

CF_TOKEN="${CF_TOKEN:-}"  # 从环境变量读取
GH_TOKEN="${GH_TOKEN:-}"  # 从环境变量读取
BASE="/home/z/my-project"

echo "🚀 Agent Distribution — Phase 3: Channel Submission"
echo "================================================"

# === 1. 提交sitemap到Google Search Console ===
echo ""
echo "📌 1. Google Search Console Sitemap Submission"
echo "   需要手动在 https://search.google.com/search-console 提交以下sitemap:"
for d in genetech-tools new-energy life-science agent-ecosystem brain-science quantum-computing nuclear-energy exo-science alien-minerals deep-sea-tech robot-parts tcm-tools; do
  domain=$(python3 -c "
sites = {
    'genetech-tools': 'genetech.tools',
    'new-energy': 'energy.genetech.tools',
    'life-science': 'life.genetech.tools',
    'agent-ecosystem': 'agent.genetech.tools',
    'brain-science': 'brain.genetech.tools',
    'quantum-computing': 'quantum.genetech.tools',
    'nuclear-energy': 'nuclear.genetech.tools',
    'exo-science': 'exo.genetech.tools',
    'alien-minerals': 'mineral.genetech.tools',
    'deep-sea-tech': 'deepsea.genetech.tools',
    'robot-parts': 'robot.genetech.tools',
    'tcm-tools': 'tcm.genetech.tools',
}
print(sites.get('$d', '$d'))
")
  echo "   - https://$domain/sitemap.xml"
done

# === 2. 提交到Bing Webmaster ===
echo ""
echo "📌 2. Bing Webmaster Submission"
echo "   提交到 https://www.bing.com/webmasters/ping/siteindex"
echo "   URL: https://www.bing.com/ping?sitemap=https://genetech.tools/sitemap.xml"

# === 3. Smithery.ai MCP Server提交 ===
echo ""
echo "📌 3. Smithery.ai MCP Server Submission"
echo "   URL: https://smithery.ai/new"
echo "   Server name: atex-ai"
echo "   GitHub repo: https://github.com/lm203688/kb-ecosystem"
echo "   Description: 23 AI services + 12 knowledge engines. Compliance, TTS/ASR/VLM, image/video gen, and cutting-edge science databases."
echo "   Install: npx @atex-ai/mcp-server"

# === 4. Glama.ai MCP Server提交 ===
echo ""
echo "📌 4. Glama.ai MCP Server Submission"  
echo "   URL: https://glama.ai/mcp-servers"
echo "   Server info same as Smithery"

# === 5. mcp.so MCP Server提交 ===
echo ""
echo "📌 5. mcp.so MCP Server Submission"
echo "   URL: https://mcp.so/submit"
echo "   Server info same as Smithery"

# === 6. 提交agent-discovery.json到搜索引擎 ===
echo ""
echo "📌 6. Submit agent-discovery.json to search engines"
for d in genetech-tools new-energy life-science agent-ecosystem; do
  domain=$(python3 -c "
sites = {
    'genetech-tools': 'genetech.tools',
    'new-energy': 'energy.genetech.tools',
    'life-science': 'life.genetech.tools',
    'agent-ecosystem': 'agent.genetech.tools',
}
print(sites.get('$d', '$d'))
")
  echo "   - https://$domain/agent-discovery.json"
done

# === 7. 部署更新到CF Pages ===
echo ""
echo "📌 7. Deploy updated sites to CF Pages"
echo "   运行: cd $BASE && bash kb-workflow/scripts/deploy-all.sh"

echo ""
echo "================================================"
echo "✅ Task list generated. Execute each step manually or via browser automation."
echo ""
echo "📋 完成后检查清单:"
echo "   [ ] Smithery.ai listing live"
echo "   [ ] Glama.ai listing live"  
echo "   [ ] mcp.so listing live"
echo "   [ ] Google Search Console: 12 sitemaps submitted"
echo "   [ ] Bing: sitemap submitted"
echo "   [ ] CF Pages: 12 sites deployed with new files"
