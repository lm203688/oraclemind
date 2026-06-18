#!/usr/bin/env python3
"""
知识库更新后的一键部署脚本
1. 运行 add-agent-api.js 更新所有API
2. 部署12站到CF Pages
3. 健康检查
"""
import subprocess
import sys
import os

BASE = "/home/z/my-project"
CF_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")

SITES = [
    ("genetech-tools", "genetech-tools"),
    ("new-energy", "newenergy"),
    ("life-science", "lifescience"),
    ("agent-ecosystem", "agentecosystem"),
    ("brain-science", "brainscience"),
    ("quantum-computing", "quantumcomputing"),
    ("nuclear-energy", "nuclearenergy"),
    ("exo-science", "exoscience"),
    ("alien-minerals", "alienminerals"),
    ("deep-sea-tech", "deepseatech"),
    ("robot-parts", "robotparts"),
    ("tcm-tools", "tcm-tools"),
]

def run(cmd, cwd=BASE):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    return result.stdout + result.stderr

print("📦 Step 1: Update all API files...")
out = run("node kb-workflow/scripts/add-agent-api.js")
print(out[-500:] if len(out) > 500 else out)

print("\n🚀 Step 2: Deploy 12 sites to CF Pages...")
success = 0
for site_dir, project in SITES:
    print(f"  {project}...", end=" ", flush=True)
    tmp = run("mktemp -d").strip()
    run(f"cp -r {BASE}/{site_dir}/website/* {tmp}/")
    result = subprocess.run(
        f'cd {tmp} && CLOUDFLARE_API_TOKEN="{CF_TOKEN}" npx wrangler pages deploy . --project-name={project} 2>&1',
        shell=True, capture_output=True, text=True
    )
    output = result.stdout + result.stderr
    if "Deployment complete" in output:
        print("✅")
        success += 1
    else:
        print("❌")
    run(f"rm -rf {tmp}")

print(f"\n✅ Deployed: {success}/12")

print("\n🔍 Step 3: Health check...")
import urllib.request
for domain in ["genetech.tools", "energy.genetech.tools", "life.genetech.tools", "agent.genetech.tools"]:
    try:
        req = urllib.request.Request(f"https://{domain}/agent-discovery.json", headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"  ✅ {domain}/agent-discovery.json: {resp.status}")
    except Exception as e:
        print(f"  ❌ {domain}/agent-discovery.json: {e}")

print("\n🎉 Done!")
