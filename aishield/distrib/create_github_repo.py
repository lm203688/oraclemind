#!/usr/bin/env python3
"""
AIShield GitHub Repo Creator — 纯Contents API版本，不用git命令。

用法:
  python3 create_github_repo.py
"""
import json
import os
import base64
import urllib.request
import urllib.error
import ssl
import time

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not GITHUB_TOKEN:
    print("❌ 请设置 GITHUB_TOKEN 环境变量")
    print("   export GITHUB_TOKEN=your_token_here")
    sys.exit(1)
DISTRIB_DIR = "/home/z/my-project/aishield/distrib"
ctx = ssl.create_default_context()


def gh_api(method, endpoint, body=None):
    """GitHub API request"""
    url = f"https://api.github.com{endpoint}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"token {GITHUB_TOKEN}",
        "User-Agent": "AIShield-Deploy",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json"
    })
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:500]
        return {"error": f"HTTP {e.code}", "body": body}
    except Exception as e:
        return {"error": str(e)}


def upload_file(username, repo, path, filepath):
    """Upload a single file via Contents API"""
    with open(filepath, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode()
    
    upload_body = {
        "message": f"Add {path}",
        "content": content_b64,
        "branch": "main"
    }
    
    # Check if file exists (to get sha for update)
    existing = gh_api("GET", f"/repos/{username}/{repo}/contents/{path}?ref=main")
    if "sha" in existing:
        upload_body["sha"] = existing["sha"]
    
    result = gh_api("PUT", f"/repos/{username}/{repo}/contents/{path}", upload_body)
    return "content" in result


def collect_files():
    """Collect all files to upload: (github_path, local_path)"""
    files = []
    repo_dir = os.path.join(DISTRIB_DIR, "public-repo")
    
    # Root files
    for f in ["README.md", "LICENSE", "package.json"]:
        s = os.path.join(repo_dir, f)
        if os.path.exists(s):
            files.append((f, s))
    
    # packages/npm-mcp
    for f in ["index.js", "package.json", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "npm-package", f)
        if os.path.exists(s):
            files.append((f"packages/npm-mcp/{f}", s))
    
    # packages/npm-guardrail
    for f in ["index.js", "package.json", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "guardrail-mcp", f)
        if os.path.exists(s):
            files.append((f"packages/npm-guardrail/{f}", s))
    
    # sdk/python
    for f in ["pyproject.toml", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "pypi-package", f)
        if os.path.exists(s):
            files.append((f"sdk/python/{f}", s))
    s = os.path.join(DISTRIB_DIR, "pypi-package", "aishield", "__init__.py")
    if os.path.exists(s):
        files.append(("sdk/python/aishield/__init__.py", s))
    
    # claude-skill
    for f in ["plugin.json", "SKILL.md", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "claude-skill", f)
        if os.path.exists(s):
            files.append((f"claude-skill/{f}", s))
    
    # github-action
    s = os.path.join(repo_dir, "github-action", "action.yml")
    if os.path.exists(s):
        files.append(("github-action/action.yml", s))
    
    # docs
    s = os.path.join(repo_dir, "docs", "openapi.yaml")
    if os.path.exists(s):
        files.append(("docs/openapi.yaml", s))
    
    # examples
    s = os.path.join(repo_dir, "examples", "README.md")
    if os.path.exists(s):
        files.append(("examples/README.md", s))
    
    # batch-scanner
    src = os.path.join(DISTRIB_DIR, "batch-scanner")
    for f in os.listdir(src):
        s = os.path.join(src, f)
        if os.path.isfile(s):
            files.append((f"batch-scanner/{f}", s))
    
    return files


def main():
    print("=" * 60)
    print("🛡️  AIShield GitHub Repo Creator")
    print("=" * 60)
    
    # 1. Get user
    print("\n📋 Step 1: Authenticating with GitHub...")
    user = gh_api("GET", "/user")
    if "login" not in user:
        print(f"❌ GitHub auth failed: {user}")
        return False
    username = user["login"]
    print(f"✅ Authenticated as: {username}")
    
    # 2. Check if repo exists, create if not
    print(f"\n📋 Step 2: Checking repo {username}/aishield...")
    existing = gh_api("GET", f"/repos/{username}/aishield")
    if "full_name" in existing:
        print(f"✅ Repo exists: {existing['full_name']}")
    else:
        print("📦 Creating new repo...")
        result = gh_api("POST", "/user/repos", {
            "name": "aishield",
            "description": "🛡️ Agent-native AI tool security scanner. Scan MCP/Skill/GPT/Prompt for security risks. 4-dimensional scoring. Certified badges. Guardrail MCP for auto-protection.",
            "private": False,
            "has_issues": True,
            "has_projects": True,
            "has_wiki": True,
            "license_template": "mit",
            "homepage": "https://aishield.ai"
        })
        if "full_name" in result:
            print(f"✅ Repo created: {result['full_name']}")
            print(f"   URL: {result['html_url']}")
        else:
            print(f"❌ Create failed: {result}")
            return False
    
    # 3. Upload files via Contents API
    print("\n📋 Step 3: Uploading files...")
    files = collect_files()
    print(f"📁 Found {len(files)} files to upload")
    
    success_count = 0
    for i, (path, filepath) in enumerate(files, 1):
        print(f"  [{i}/{len(files)}] {path}...", end=" ")
        if upload_file(username, "aishield", path, filepath):
            print("✅")
            success_count += 1
        else:
            print("⚠️")
        time.sleep(0.5)  # Rate limit
    
    print(f"\n✅ Uploaded {success_count}/{len(files)} files")
    
    # 4. Summary
    repo_url = f"https://github.com/{username}/aishield"
    print("\n" + "=" * 60)
    print(f"🎉 GitHub repo ready: {repo_url}")
    print("=" * 60)
    print("\n下一步:")
    print("  1. 提交到7个MCP Registry")
    print(f"     - MCP官方Registry: https://registry.modelcontextprotocol.io")
    print(f"     - Smithery: https://smithery.ai/new")
    print(f"     - Glama: https://glama.ai/mcp-servers")
    print(f"     - mcp.so: https://mcp.so")
    print(f"     - MCPMarket: https://mcpmarket.com/submit")
    print(f"     - PulseMCP: https://pulsemcp.com (自动爬取)")
    print(f"     - ToolPlex: https://toolplex.dev")
    print("  2. GitHub Action → Marketplace上架")
    print("  3. npm publish (需npm login)")
    print("  4. PyPI publish (需twine)")
    
    # Write result for verification
    with open("/tmp/aishield_deploy_result.json", "w") as f:
        json.dump({
            "success": True,
            "username": username,
            "repo_url": repo_url,
            "files_uploaded": success_count,
            "files_total": len(files)
        }, f, indent=2)
    
    return True


if __name__ == "__main__":
    main()
