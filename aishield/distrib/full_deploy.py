#!/usr/bin/env python3
"""
AIShield 全面部署脚本 — 在cron/独立环境中执行

功能:
  1. 创建GitHub公开repo
  2. 上传所有代码文件
  3. 发布npm包 (aishield-mcp + aishield-guardrail)
  4. 发布PyPI包 (aishield SDK)
  5. 重启gunicorn服务
  6. 输出Registry提交链接

执行:
  python3 full_deploy.py [--skip-npm] [--skip-pypi] [--skip-gunicorn]
"""
import json
import os
import sys
import base64
import subprocess
import urllib.request
import urllib.error
import ssl
import time
import shutil

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not GITHUB_TOKEN:
    log("❌ 请设置 GITHUB_TOKEN 环境变量", "ERROR")
    sys.exit(1)
DISTRIB_DIR = "/home/z/my-project/aishield/distrib"
PROJECT_DIR = "/home/z/my-project/aishield"
ctx = ssl.create_default_context()

SKIP_NPM = "--skip-npm" in sys.argv
SKIP_PYPI = "--skip-pypi" in sys.argv
SKIP_GUNICORN = "--skip-gunicorn" in sys.argv


def log(msg, level="INFO"):
    print(f"[{level}] {msg}")


def gh_api(method, endpoint, body=None):
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
        return {"error": f"HTTP {e.code}", "body": e.read().decode()[:500]}
    except Exception as e:
        return {"error": str(e)}


def step1_github_repo():
    """创建GitHub repo并上传文件"""
    log("=" * 60)
    log("STEP 1: GitHub Repo创建")
    log("=" * 60)
    
    # Get user
    user = gh_api("GET", "/user")
    if "login" not in user:
        log(f"❌ GitHub auth failed: {user}", "ERROR")
        return None
    username = user["login"]
    log(f"✅ Authenticated as: {username}")
    
    # Check/create repo
    existing = gh_api("GET", f"/repos/{username}/aishield")
    if "full_name" in existing:
        log(f"✅ Repo exists: {existing['full_name']}")
    else:
        log("📦 Creating new repo...")
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
            log(f"✅ Repo created: {result['full_name']}")
        else:
            log(f"❌ Create failed: {result}", "ERROR")
            return None
    
    # Upload files
    log("📁 Uploading files...")
    repo_dir = os.path.join(DISTRIB_DIR, "public-repo")
    upload_files = []
    
    # Collect files (same as create_github_repo.py)
    for f in ["README.md", "LICENSE", "package.json"]:
        s = os.path.join(repo_dir, f)
        if os.path.exists(s):
            upload_files.append((f, s))
    for f in ["index.js", "package.json", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "npm-package", f)
        if os.path.exists(s):
            upload_files.append((f"packages/npm-mcp/{f}", s))
    for f in ["index.js", "package.json", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "guardrail-mcp", f)
        if os.path.exists(s):
            upload_files.append((f"packages/npm-guardrail/{f}", s))
    for f in ["pyproject.toml", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "pypi-package", f)
        if os.path.exists(s):
            upload_files.append((f"sdk/python/{f}", s))
    s = os.path.join(DISTRIB_DIR, "pypi-package", "aishield", "__init__.py")
    if os.path.exists(s):
        upload_files.append(("sdk/python/aishield/__init__.py", s))
    for f in ["plugin.json", "SKILL.md", "README.md"]:
        s = os.path.join(DISTRIB_DIR, "claude-skill", f)
        if os.path.exists(s):
            upload_files.append((f"claude-skill/{f}", s))
    s = os.path.join(repo_dir, "github-action", "action.yml")
    if os.path.exists(s):
        upload_files.append(("github-action/action.yml", s))
    s = os.path.join(repo_dir, "docs", "openapi.yaml")
    if os.path.exists(s):
        upload_files.append(("docs/openapi.yaml", s))
    s = os.path.join(repo_dir, "examples", "README.md")
    if os.path.exists(s):
        upload_files.append(("examples/README.md", s))
    src = os.path.join(DISTRIB_DIR, "batch-scanner")
    for f in os.listdir(src):
        s = os.path.join(src, f)
        if os.path.isfile(s):
            upload_files.append((f"batch-scanner/{f}", s))
    
    log(f"📁 Found {len(upload_files)} files to upload")
    success = 0
    for i, (path, filepath) in enumerate(upload_files, 1):
        with open(filepath, "rb") as fh:
            content_b64 = base64.b64encode(fh.read()).decode()
        upload_body = {"message": f"Add {path}", "content": content_b64, "branch": "main"}
        existing_file = gh_api("GET", f"/repos/{username}/aishield/contents/{path}?ref=main")
        if "sha" in existing_file:
            upload_body["sha"] = existing_file["sha"]
        result = gh_api("PUT", f"/repos/{username}/aishield/contents/{path}", upload_body)
        if "content" in result:
            success += 1
            log(f"  [{i}/{len(upload_files)}] {path} ✅")
        else:
            log(f"  [{i}/{len(upload_files)}] {path} ⚠️ {result.get('error', '')}")
        time.sleep(0.5)
    
    log(f"✅ Uploaded {success}/{len(upload_files)} files")
    return username


def step2_npm_publish():
    """发布npm包"""
    if SKIP_NPM:
        log("⏭️  Skipping npm publish")
        return
    
    log("=" * 60)
    log("STEP 2: npm发布")
    log("=" * 60)
    
    for pkg_dir, pkg_name in [
        ("npm-package", "aishield-mcp"),
        ("guardrail-mcp", "aishield-guardrail")
    ]:
        log(f"📦 Publishing {pkg_name}...")
        pkg_path = os.path.join(DISTRIB_DIR, pkg_dir)
        result = subprocess.run(
            ["npm", "publish", "--access", "public"],
            cwd=pkg_path, capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0:
            log(f"✅ {pkg_name} published")
        else:
            log(f"❌ {pkg_name} failed: {result.stderr[:200]}", "ERROR")


def step3_pypi_publish():
    """发布PyPI包"""
    if SKIP_PYPI:
        log("⏭️  Skipping PyPI publish")
        return
    
    log("=" * 60)
    log("STEP 3: PyPI发布")
    log("=" * 60)
    
    pkg_path = os.path.join(DISTRIB_DIR, "pypi-package")
    
    # Build
    log("🔨 Building package...")
    result = subprocess.run(
        ["python3", "-m", "build"],
        cwd=pkg_path, capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        log(f"❌ Build failed: {result.stderr[:200]}", "ERROR")
        return
    
    # Upload
    log("📤 Uploading to PyPI...")
    result = subprocess.run(
        ["python3", "-m", "twine", "upload", "dist/*"],
        cwd=pkg_path, capture_output=True, text=True, timeout=60,
        input=""
    )
    if result.returncode == 0:
        log("✅ aishield SDK published to PyPI")
    else:
        log(f"❌ PyPI upload failed: {result.stderr[:200]}", "ERROR")


def step4_restart_gunicorn():
    """重启gunicorn服务"""
    if SKIP_GUNICORN:
        log("⏭️  Skipping gunicorn restart")
        return
    
    log("=" * 60)
    log("STEP 4: 重启gunicorn")
    log("=" * 60)
    
    # Kill existing
    subprocess.run(["pkill", "-f", "gunicorn api.server_flask"], capture_output=True)
    time.sleep(2)
    
    # Remove stale pidfile and pycache
    pidfile = os.path.join(PROJECT_DIR, "aishield.pid")
    if os.path.exists(pidfile):
        os.remove(pidfile)
    pycache = os.path.join(PROJECT_DIR, "api", "__pycache__")
    if os.path.isdir(pycache):
        shutil.rmtree(pycache, ignore_errors=True)
    
    # Start gunicorn
    log("🚀 Starting gunicorn...")
    proc = subprocess.Popen(
        ["/home/z/.venv/bin/gunicorn", "api.server_flask:app",
         "--bind", "0.0.0.0:8450",
         "--workers", "2",
         "--timeout", "60",
         "--threads", "2",
         "--chdir", PROJECT_DIR,
         "--access-logfile", "-",
         "--pid", pidfile],
        stdout=open(os.path.join(PROJECT_DIR, "server.log"), "a"),
        stderr=subprocess.STDOUT,
        start_new_session=True  # Important: detach from current session
    )
    
    # Wait for boot
    for i in range(30):
        time.sleep(1)
        try:
            req = urllib.request.Request("http://localhost:8450/api/v1/health")
            with urllib.request.urlopen(req, timeout=3) as r:
                data = json.loads(r.read())
                if data.get("status") == "healthy":
                    log(f"✅ Gunicorn healthy (PID: {proc.pid})")
                    return True
        except:
            pass
    
    log("❌ Gunicorn failed to start", "ERROR")
    return False


def step5_summary(username):
    """输出汇总"""
    log("=" * 60)
    log("DEPLOYMENT SUMMARY")
    log("=" * 60)
    if username:
        repo_url = f"https://github.com/{username}/aishield"
        log(f"✅ GitHub repo: {repo_url}")
        log("")
        log("📋 下一步手动操作:")
        log(f"  1. MCP官方Registry: https://registry.modelcontextprotocol.io")
        log(f"  2. Smithery: https://smithery.ai/new")
        log(f"  3. Glama: https://glama.ai/mcp-servers")
        log(f"  4. mcp.so: https://mcp.so")
        log(f"  5. MCPMarket: https://mcpmarket.com/submit")
        log(f"  6. PulseMCP: 自动爬取")
        log(f"  7. ToolPlex: https://toolplex.dev")
        log(f"  8. GitHub Action Marketplace: {repo_url}/actions")
    
    # Write result
    with open("/tmp/aishield_deploy_result.json", "w") as f:
        json.dump({
            "github_username": username,
            "repo_url": f"https://github.com/{username}/aishield" if username else None,
            "npm_published": not SKIP_NPM,
            "pypi_published": not SKIP_PYPI,
            "gunicorn_restarted": not SKIP_GUNICORN,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }, f, indent=2)


def main():
    log("🛡️  AIShield 全面部署脚本")
    log(f"   SKIP_NPM={SKIP_NPM} SKIP_PYPI={SKIP_PYPI} SKIP_GUNICORN={SKIP_GUNICORN}")
    log("")
    
    username = step1_github_repo()
    step2_npm_publish()
    step3_pypi_publish()
    step4_restart_gunicorn()
    step5_summary(username)


if __name__ == "__main__":
    main()
