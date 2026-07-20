#!/usr/bin/env python3
"""
Agent-Trust Distributor Agent v2
- 用 GitHub API 获取真实数据（无需联网搜索）
- 用 Agnes API 分析并生成建议
- 输出到 weekly-suggestions/YYYY-MM-DD.md
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(ROOT, ".env")
OUT_DIR = os.path.join(ROOT, "weekly-suggestions")


def load_env():
    config = {}
    if not os.path.exists(ENV_FILE):
        print(f"[ERROR] .env 不存在: {ENV_FILE}")
        sys.exit(1)
    with open(ENV_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                k, _, v = line.partition("=")
                config[k.strip()] = v.strip()
    for k in ["AGNES_API_KEY", "AGNES_BASE_URL", "AGNES_MODEL"]:
        if k not in config:
            print(f"[ERROR] .env 缺少: {k}")
            sys.exit(1)
    return config


def call_agnes(config, messages, max_tokens=2000):
    url = f"{config['AGNES_BASE_URL']}/chat/completions"
    headers = {
        "Authorization": f"Bearer {config['AGNES_API_KEY']}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": config["AGNES_MODEL"],
        "messages": messages,
        "max_tokens": max_tokens
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[ERROR] Agnes API 失败: {e}")
        sys.exit(1)


def github_api(path, params=None):
    """调用 GitHub REST API（无需 token，有 rate limit）"""
    base = "https://api.github.com"
    url = f"{base}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("User-Agent", "agent-trust-distributor/0.1")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[WARN] GitHub API 失败: {path} — {e}")
        return None


def get_our_repo_info():
    """获取 agent-trust-protocol 的 star/fork 数据"""
    data = github_api("/repos/lm203688/agent-trust-protocol")
    if not data:
        return None
    return {
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "updated_at": data.get("updated_at", ""),
    }


def search_agent_projects():
    """
    搜索近期活跃的 Agent 相关开源项目（未接入 agent-trust）
    GitHub Search API 要求至少有一个关键词（不能用纯 qualifier 搜索）
    """
    one_month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    # 必须有普通关键词，不能只有 qualifier
    query = f"agent OR mcp pushed:>{one_month_ago}"
    data = github_api("/search/repositories", {
        "q": query,
        "sort": "stars",
        "order": "desc",
        "per_page": 30
    })
    if not data or "items" not in data:
        return []
    # 过滤掉已经是 agent-trust-protocol 相关的
    results = []
    for item in data["items"]:
        name = item["full_name"]
        if "agent-trust" in name.lower():
            continue
        results.append({
            "name": name,
            "url": item["html_url"],
            "description": item.get("description", ""),
            "stars": item.get("stargazers_count", 0),
            "language": item.get("language", ""),
        })
    return results[:10]  # 取前 10


def main():
    print("[Distributor Agent] 启动...")
    config = load_env()
    print(f"[Distributor Agent] 模型: {config['AGNES_MODEL']}")

    # ── Step 1: 获取我们自己的 repo 数据 ──────────────────────────
    print("[1/4] 获取 agent-trust-protocol 仓库数据...")
    our_data = get_our_repo_info()
    if our_data:
        print(f"  stars={our_data['stars']} forks={our_data['forks']} issues={our_data['open_issues']}")
    else:
        print("  [WARN] 无法获取仓库数据（GitHub API rate limit？）")

    # ── Step 2: 搜索潜在目标项目 ────────────────────────────────────
    print("[2/4] 搜索潜在目标项目...")
    targets = search_agent_projects()
    print(f"  找到 {len(targets)} 个候选目标")

    # ── Step 3: 让 Agnes 分析并生成建议 ───────────────────────────
    print("[3/4] 调用 Agnes AI 生成分析报告...")

    targets_text = "\n".join([
        f"- **{t['name']}** ({t['stars']}⭐) — {t['description']} — {t['url']}"
        for t in targets
    ])

    our_text = (
        f"stars={our_data['stars']}, forks={our_data['forks']}, open_issues={our_data['open_issues']}"
        if our_data else "数据获取失败"
    )

    prompt = f"""你是 agent-trust-protocol 的开源生态顾问。

## 我们的项目数据
{our_text}

## 发现的潜在目标项目（未接入 agent-trust-protocol）
{targets_text if targets else "（搜索失败，基于你的知识给出建议）"}

请直接输出以下 Markdown 内容（不要前言、不要总结）：

### 生态健康度（0-100 分）
（一句话评分 + 依据）

### P0 — 今天必做
- [ ] ...

### P1 — 本周内做
- [ ] ...

### P2 — 有空做
- [ ] ...

### 本周最值得接触的项目（Top 5）
| 项目名 | GitHub URL | 接触理由 | 推荐方式 |
"""

    report_body = call_agnes(config, [{"role": "user", "content": prompt}], max_tokens=2500)
    print("[3/4] 完成")

    # ── Step 4: 写入文件 ────────────────────────────────────────────
    print("[4/4] 写入报告...")
    os.makedirs(OUT_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    out_path = os.path.join(OUT_DIR, f"{today}.md")

    content = f"""# agent-trust-protocol 每周生态报告 — {today}

> 由 Distributor Agent (Agnes AI) 自动生成

## 数据来源
- 我们的仓库: https://github.com/lm203688/agent-trust-protocol
- 目标项目: GitHub Search API (topic:ai-agent OR topic:mcp, 近 30 天)

---

{report_body}

---
*生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
"""

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"[Distributor Agent] ✅ 报告已写入: {out_path}")
    print("[Distributor Agent] 完成")


if __name__ == "__main__":
    main()
