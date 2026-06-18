#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# AIShield 一键发布脚本 v2
# 在任何能联网的Linux/Mac上运行: bash deploy.sh
#
# 自动完成:
#   1. 创建GitHub公开repo (aishield-ai/aishield 或 用户名/aishield)
#   2. 上传所有代码文件 (通过Contents API, 不需要git)
#   3. 发布npm包 (aishield-mcp + aishield-guardrail)
#   4. 发布PyPI包 (aishield SDK)
#   5. 输出7个MCP Registry提交链接
#
# 前提:
#   - 环境变量 GITHUB_TOKEN (GitHub PAT, 有repo权限)
#   - 环境变量 NPM_TOKEN (npm publish token, 可选)
#   - 环境变量 PYPI_TOKEN (PyPI API token, 可选)
# ============================================================

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 请设置 GITHUB_TOKEN 环境变量"
    echo "   export GITHUB_TOKEN=your_token_here"
    exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🛡️ AIShield 一键发布"
echo "=========================================="

# ========== 1. GitHub Repo ==========
echo ""
echo "📦 [1/3] 创建GitHub公开Repo..."

# Get GitHub username
GH_USER=$(curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "User-Agent: AIShield" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin).get('login',''))" 2>/dev/null)

if [ -z "$GH_USER" ]; then
    echo "❌ GitHub token无效"
    exit 1
fi
echo "✅ GitHub用户: $GH_USER"

# Check if repo exists
REPO_CHECK=$(curl -sf -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$GH_USER/aishield")

if [ "$REPO_CHECK" = "200" ]; then
    echo "ℹ️  Repo已存在: $GH_USER/aishield"
else
    echo "Creating repo..."
    curl -sf -X POST -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"aishield\",\"description\":\"🛡️ Agent-native AI tool security scanner. Scan MCP/Skill/GPT/Prompt for security risks.\",\"private\":false,\"has_issues\":true,\"license_template\":\"mit\",\"homepage\":\"https://aishield.ai\"}" > /dev/null
    echo "✅ Repo创建: https://github.com/$GH_USER/aishield"
fi

# Upload files via Contents API
echo "📁 上传代码文件..."

upload_file() {
    local local_path="$1"
    local repo_path="$2"
    
    if [ ! -f "$local_path" ]; then return; fi
    
    local content_b64=$(base64 -w 0 "$local_path" 2>/dev/null || base64 "$local_path" | tr -d '\n')
    
    # Check if file exists (get sha)
    local sha=""
    local check=$(curl -sf -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GH_USER/aishield/contents/$repo_path?ref=main" 2>/dev/null)
    if echo "$check" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null; then
        sha=$(echo "$check" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null)
    fi
    
    local body="{\"message\":\"Add $repo_path\",\"content\":\"$content_b64\",\"branch\":\"main\""
    if [ -n "$sha" ]; then body="$body,\"sha\":\"$sha\""; fi
    body="$body}"
    
    curl -sf -X PUT -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$GH_USER/aishield/contents/$repo_path" \
        -d "$body" > /dev/null 2>&1 && echo "  ✅ $repo_path" || echo "  ⚠️  $repo_path"
    
    sleep 0.3
}

# Root files
upload_file "$SCRIPT_DIR/public-repo/README.md" "README.md"
upload_file "$SCRIPT_DIR/public-repo/LICENSE" "LICENSE"
upload_file "$SCRIPT_DIR/public-repo/package.json" "package.json"

# npm packages
for pkg in npm-mcp npm-guardrail; do
    src_dir=$(echo $pkg | sed 's/npm-//')
    [ "$pkg" = "npm-mcp" ] && src_dir="npm-package"
    [ "$pkg" = "npm-guardrail" ] && src_dir="guardrail-mcp"
    
    for f in index.js package.json README.md; do
        upload_file "$SCRIPT_DIR/$src_dir/$f" "packages/$pkg/$f"
    done
done

# Python SDK
upload_file "$SCRIPT_DIR/pypi-package/pyproject.toml" "sdk/python/pyproject.toml"
upload_file "$SCRIPT_DIR/pypi-package/README.md" "sdk/python/README.md"
upload_file "$SCRIPT_DIR/pypi-package/aishield/__init__.py" "sdk/python/aishield/__init__.py"

# Claude Skill
for f in plugin.json SKILL.md README.md; do
    upload_file "$SCRIPT_DIR/claude-skill/$f" "claude-skill/$f"
done

# GitHub Action
upload_file "$SCRIPT_DIR/public-repo/github-action/action.yml" "github-action/action.yml"

# Docs
upload_file "$SCRIPT_DIR/public-repo/docs/openapi.yaml" "docs/openapi.yaml"

# Examples
upload_file "$SCRIPT_DIR/public-repo/examples/README.md" "examples/README.md"

# Batch scanner
for f in "$SCRIPT_DIR/batch-scanner/"*; do
    [ -f "$f" ] && upload_file "$f" "batch-scanner/$(basename $f)"
done

echo "✅ 代码上传完成"

# ========== 2. npm发布 ==========
echo ""
echo "📦 [2/3] 发布npm包..."

if [ -n "${NPM_TOKEN:-}" ]; then
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
    echo "✅ npm token configured"
fi

# Check if logged in
if npm whoami > /dev/null 2>&1; then
    echo "✅ npm已登录: $(npm whoami)"
    
    # Publish aishield-mcp
    echo "Publishing aishield-mcp..."
    cd "$SCRIPT_DIR/npm-package"
    npm publish --access public 2>&1 && echo "✅ aishield-mcp published" || echo "⚠️ aishield-mcp publish failed"
    
    # Publish aishield-guardrail
    echo "Publishing aishield-guardrail..."
    cd "$SCRIPT_DIR/guardrail-mcp"
    npm publish --access public 2>&1 && echo "✅ aishield-guardrail published" || echo "⚠️ aishield-guardrail publish failed"
    
    cd "$SCRIPT_DIR"
else
    echo "⚠️  npm未登录，跳过npm发布"
    echo "   运行 npm login 后重新执行"
fi

# ========== 3. PyPI发布 ==========
echo ""
echo "📦 [3/3] 发布PyPI包..."

if command -v twine > /dev/null 2>&1 || pip install twine build 2>/dev/null; then
    cd "$SCRIPT_DIR/pypi-package"
    
    # Build
    python3 -m build 2>&1 | tail -3
    
    # Upload
    if [ -n "${PYPI_TOKEN:-}" ]; then
        TWINE_PASSWORD="$PYPI_TOKEN" TWINE_USERNAME="__token__" twine upload dist/* 2>&1 && echo "✅ PyPI published" || echo "⚠️ PyPI publish failed"
    elif [ -f ~/.pypirc ]; then
        twine upload dist/* 2>&1 && echo "✅ PyPI published" || echo "⚠️ PyPI publish failed"
    else
        echo "⚠️  PyPI未配置，跳过"
        echo "   配置 ~/.pypirc 或设置 PYPI_TOKEN 后重新执行"
    fi
    
    cd "$SCRIPT_DIR"
else
    echo "⚠️  twine安装失败，跳过PyPI发布"
fi

# ========== 4. Registry提交指引 ==========
echo ""
echo "=========================================="
echo "🎉 代码发布完成！"
echo ""
echo "📋 手动提交到7个MCP Registry:"
echo ""
echo "  1. MCP官方Registry"
echo "     → https://registry.modelcontextprotocol.io"
echo "     → 提交: https://github.com/$GH_USER/aishield"
echo ""
echo "  2. Smithery"
echo "     → https://smithery.ai/new"
echo "     → 提交: https://github.com/$GH_USER/aishield"
echo ""
echo "  3. Glama"
echo "     → https://glama.ai/mcp-servers"
echo "     → 提交: https://github.com/$GH_USER/aishield"
echo ""
echo "  4. mcp.so"
echo "     → https://mcp.so"
echo "     → GitHub issue提交"
echo ""
echo "  5. MCPMarket"
echo "     → https://mcpmarket.com/submit"
echo "     → 表单提交"
echo ""
echo "  6. PulseMCP"
echo "     → https://pulsemcp.com"
echo "     → 自动爬取（repo已有mcp关键词）"
echo ""
echo "  7. ToolPlex"
echo "     → https://toolplex.dev"
echo "     → 注册提交"
echo ""
echo "  8. GitHub Action Marketplace"
echo "     → https://github.com/$GH_USER/aishield/actions"
echo "     → 在action.yml页面点'Publish to Marketplace'"
echo ""
echo "=========================================="
echo "📊 核心指标: Agent调用量 (API requests/day)"
echo "   查看: https://aishield.ai/api/v1/stats"
