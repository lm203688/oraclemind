#!/usr/bin/env python3
"""
Eve每日全流程 v3 — 全项目覆盖
6个项目: genetech-tools, aishield, roboparts, swarm-research, healthlens, agent-trust
每个Agent对每个项目都执行任务
"""

import sys, os, json, time, traceback, urllib.request
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scout.agent import ScoutAgent
from builder.agent import BuilderAgent
from strategist.agent import StrategistAgent
from growth.agent import GrowthAgent
from guardian.agent import GuardianAgent
from designer.agent import DesignerAgent
from ops.agent import OperatorAgent
from researcher.agent import ResearcherAgent
from shared.llm_client import call_llm, web_search
from shared.project_db import check_ecs_services, check_pages_sites

REPORT_DIR = os.path.join(os.path.dirname(__file__), "reports")
INTEL_BOARD = os.path.join(os.path.dirname(__file__), "intel_board.json")
os.makedirs(REPORT_DIR, exist_ok=True)

# ========= 全项目定义 =========
PROJECTS = [
    {
        "id": "genetech-tools",
        "name": "GeneTech 14站",
        "domain": "genetech.tools",
        "keywords": "gene editing CRISPR synthetic biology biotechnology",
        "ecs_ports": {"api": "http://150.158.119.19:8420/api/v1/status", "compliance": "http://150.158.119.19:8450/api/v1/health"},
        "pages": ["genetech-tools", "tcm-tools", "agentecosystem", "robotparts", "quantumcomputing", "brainscience", "nuclearenergy", "exoscience", "alienminerals", "deepseatech", "newenergy-nya", "lifescience-epe", "biocomputedb", "bionicai"],
        "revenue": "Creem 6产品 $19-$499",
        "status": "运营中"
    },
    {
        "id": "aishield",
        "name": "AIShield安全平台",
        "domain": "aishield.tools",
        "keywords": "AI agent security MCP safety compliance OWASP",
        "ecs_ports": {"api": "http://150.158.119.19:8420/api/v1/status", "compliance": "http://150.158.119.19:8450/api/v1/health"},
        "pages": [],
        "revenue": "违禁词¥0.5/次, MCP扫描¥10/次, 合规¥50/次",
        "status": "运营中"
    },
    {
        "id": "roboparts",
        "name": "RoboParts机器人零件",
        "domain": "roboparts.cc",
        "keywords": "robot parts compatibility gripper arm integration",
        "ecs_ports": {},
        "pages": ["robotparts"],
        "revenue": "¥0",
        "status": "主线项目"
    },
    {
        "id": "swarm-research",
        "name": "蜂群科研平台",
        "domain": "swarm.aishield.tools",
        "keywords": "AI research automation virtual lab literature review",
        "ecs_ports": {"api": "http://150.158.119.19:8460/api/health"},
        "pages": [],
        "revenue": "积分制 ¥39-499, 毛利率96%",
        "status": "活跃"
    },
    {
        "id": "healthlens",
        "name": "HealthLens健康数据",
        "domain": "healthlens (ECS:8432)",
        "keywords": "health data aggregation medical report OCR Apple Health",
        "ecs_ports": {"app": "http://150.158.119.19:8432/"},
        "pages": [],
        "revenue": "¥0",
        "status": "活跃"
    },
    {
        "id": "agent-trust",
        "name": "AgentTrust Protocol",
        "domain": "github.com/lm203688/agent-trust-protocol",
        "keywords": "agent trust reputation protocol MCP W3C VC",
        "ecs_ports": {},
        "pages": [],
        "revenue": "开源Apache 2.0",
        "status": "v0.1已发布"
    },
]


def update_intel_board(source, content, project_id="general"):
    try:
        with open(INTEL_BOARD, "r", encoding="utf-8") as f:
            board = json.load(f)
    except:
        board = {"version": "1.0", "last_updated": "", "entries": []}
    board["entries"].append({
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "project_id": project_id,
        "content": content[:500]
    })
    board["entries"] = board["entries"][-200:]  # 保留最近200条
    board["last_updated"] = datetime.now().isoformat()
    with open(INTEL_BOARD, "w", encoding="utf-8") as f:
        json.dump(board, f, ensure_ascii=False, indent=2)


def check_url(url, timeout=3):
    """快速检查URL状态"""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except:
        return 0


def task_operator(report):
    """1. 运营财务官 — 全项目监控"""
    print("[1/7] 运营财务官: 全项目监控...")
    try:
        project_results = []
        for p in PROJECTS:
            # 检查ECS端口
            ecs_status = {}
            for name, url in p["ecs_ports"].items():
                ecs_status[name] = check_url(url)
            
            # 检查Pages
            pages_status = {}
            for site in p["pages"]:
                url = f"https://{site}.pages.dev/api/entities.json" if site not in ["robotparts"] else f"https://{site}.pages.dev/"
                pages_status[site] = check_url(url)
            
            # 判断异常
            p0_issues = []
            for name, code in ecs_status.items():
                if code == 0 or code >= 500:
                    p0_issues.append(f"{p['name']} {name} 异常: {code}")
            for site, code in pages_status.items():
                if code == 0 or code >= 500:
                    p0_issues.append(f"{p['name']} Pages {site} 异常: {code}")
            
            project_results.append({
                "project": p["name"],
                "ecs": ecs_status,
                "pages": pages_status,
                "revenue": p["revenue"],
                "p0_issues": p0_issues
            })
            status = "✅" if not p0_issues else "❌"
            print(f"  {status} {p['name']}")

        report["operator"] = {"projects": project_results, "p0_count": sum(len(pr["p0_issues"]) for pr in project_results)}
        print(f"  P0异常: {report['operator']['p0_count']}个")
    except Exception as e:
        print(f"  ❌ 运营财务官失败: {e}")
        report["operator"] = {"error": str(e)}


def task_scout(report):
    """2. 情报员 — 全项目情报采集"""
    print("[2/7] 情报员: 全项目情报采集...")
    try:
        project_intel = []
        for p in PROJECTS:
            try:
                # web搜索
                results = web_search(p["keywords"], count=3)
                if results and isinstance(results, list) and len(results) > 0:
                    snippets = "\n".join([f"- {r.get('name','')}: {r.get('snippet','')[:80]}" for r in results[:3]])
                    # LLM简短分析
                    analysis = call_llm(
                        f"用80字总结{p['name']}领域最新动态：\n{snippets}",
                        model="glm-4-flash", max_tokens=150
                    )
                    project_intel.append({"project": p["name"], "intel": analysis[:300]})
                    update_intel_board("scout", analysis, p["id"])
                    print(f"  {p['name']}: ✅")
                else:
                    project_intel.append({"project": p["name"], "intel": "无搜索结果"})
                    print(f"  {p['name']}: ⚠️ 无结果")
                time.sleep(1)
            except Exception as e:
                project_intel.append({"project": p["name"], "intel": f"采集失败: {str(e)[:50]}"})
                print(f"  {p['name']}: ❌ {str(e)[:30]}")
        
        report["scout"] = {"projects": project_intel}
    except Exception as e:
        print(f"  ❌ 情报员失败: {e}")
        report["scout"] = {"error": str(e)}


def task_guardian(report):
    """3. 审计师 — 全项目安全审计"""
    print("[3/7] 审计师: 全项目安全审计...")
    try:
        project_audits = []
        for p in PROJECTS:
            issues = []
            # 检查HTTP是否用HTTPS
            for name, url in p["ecs_ports"].items():
                if url.startswith("http://"):
                    issues.append(f"{name}使用HTTP非HTTPS")
            # 检查服务是否在线
            for name, code in {k: check_url(v) for k, v in p["ecs_ports"].items()}.items():
                if code == 0:
                    issues.append(f"{name}服务不可达")
            
            # AIShield特殊：查审计统计
            aishield_stats = None
            if p["id"] == "aishield":
                try:
                    url = "http://150.158.119.19:8450/api/v1/stats"
                    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        aishield_stats = json.loads(resp.read().decode("utf-8"))
                except:
                    pass
            
            project_audits.append({
                "project": p["name"],
                "issues": issues,
                "aishield_stats": aishield_stats
            })
            print(f"  {p['name']}: {'⚠️ '+str(len(issues))+'个问题' if issues else '✅'}")
        
        report["guardian"] = {"projects": project_audits}
    except Exception as e:
        print(f"  ❌ 审计师失败: {e}")
        report["guardian"] = {"error": str(e)}


def task_builder(report):
    """4. 工程师 — 全项目部署检查"""
    print("[4/7] 工程师: 全项目部署检查...")
    try:
        project_checks = []
        for p in PROJECTS:
            issues = []
            # 检查ECS服务
            for name, url in p["ecs_ports"].items():
                code = check_url(url)
                if code == 0:
                    issues.append(f"ECS {name} 不可达: {code}")
                elif code >= 400:
                    issues.append(f"ECS {name} 异常: {code}")
            
            # 检查Pages
            for site in p["pages"]:
                url = f"https://{site}.pages.dev/api/entities.json" if site not in ["robotparts"] else f"https://{site}.pages.dev/"
                code = check_url(url)
                if code == 0 or code >= 500:
                    issues.append(f"Pages {site} 异常: {code}")
            
            project_checks.append({
                "project": p["name"],
                "issues": issues,
                "all_healthy": len(issues) == 0
            })
            print(f"  {p['name']}: {'❌ '+str(len(issues))+'个问题' if issues else '✅'}")
        
        report["builder"] = {"projects": project_checks}
    except Exception as e:
        print(f"  ❌ 工程师失败: {e}")
        report["builder"] = {"error": str(e)}


def task_strategist(report):
    """5. 分析师 — 全项目快速分析"""
    print("[5/7] 分析师: 全项目分析...")
    try:
        # 收集各项目运营+情报数据
        ops_data = report.get("operator", {}).get("projects", [])
        scout_data = report.get("scout", {}).get("projects", [])
        
        project_analyses = []
        for i, p in enumerate(PROJECTS):
            # 获取该项目的情报
            intel = ""
            for s in scout_data:
                if s.get("project") == p["name"]:
                    intel = s.get("intel", "")[:200]
                    break
            
            # 获取该项目的运营状态
            ops = ""
            for o in ops_data:
                if o.get("project") == p["name"]:
                    ops = f"P0异常:{len(o.get('p0_issues',[]))}个, 收入:{o.get('revenue','?')}"
                    break
            
            try:
                prompt = f"""你是商业分析师。用100字分析{p['name']}项目：
状态: {p['status']}, 收入: {p['revenue']}
运营: {ops}
情报: {intel}
请输出: 1个最紧急问题 + 1个机会点"""
                analysis = call_llm(prompt, model="glm-4-flash", max_tokens=200)
                project_analyses.append({"project": p["name"], "analysis": analysis[:300]})
                print(f"  {p['name']}: ✅")
            except Exception as e:
                project_analyses.append({"project": p["name"], "analysis": f"分析失败: {str(e)[:30]}"})
                print(f"  {p['name']}: ❌")
            time.sleep(0.5)
        
        report["strategist"] = {"projects": project_analyses}
    except Exception as e:
        print(f"  ❌ 分析师失败: {e}")
        report["strategist"] = {"error": str(e)}


def task_researcher(report):
    """6. 科研员 — 全项目前沿扫描"""
    print("[6/7] 科研员: 全项目前沿扫描...")
    try:
        project_research = []
        for p in PROJECTS:
            try:
                results = web_search(p["keywords"] + " breakthrough 2024 2025", count=2)
                if results and isinstance(results, list) and len(results) > 0:
                    snippets = "\n".join([f"- {r.get('name','')}: {r.get('snippet','')[:60]}" for r in results[:2]])
                    summary = call_llm(
                        f"用60字总结{p['name']}相关领域前沿发现：\n{snippets}",
                        model="glm-4-flash", max_tokens=100
                    )
                    project_research.append({"project": p["name"], "frontier": summary[:200]})
                    print(f"  {p['name']}: ✅")
                else:
                    project_research.append({"project": p["name"], "frontier": "无结果"})
                    print(f"  {p['name']}: ⚠️")
                time.sleep(1)
            except Exception as e:
                project_research.append({"project": p["name"], "frontier": f"失败: {str(e)[:30]}"})
                print(f"  {p['name']}: ❌")
        
        report["researcher"] = {"projects": project_research}
    except Exception as e:
        print(f"  ❌ 科研员失败: {e}")
        report["researcher"] = {"error": str(e)}


def task_growth(report):
    """7. 营销官 — 全项目分发状态"""
    print("[7/7] 营销官: 全项目分发检查...")
    try:
        project_growth = []
        for p in PROJECTS:
            checks = {}
            # 检查域名可达性
            if p["domain"].startswith("http") or "." in p["domain"]:
                domain_url = f"https://{p['domain']}" if not p["domain"].startswith("http") else p["domain"]
                checks["domain"] = check_url(domain_url, timeout=5)
            
            # 检查llms.txt
            if p["ecs_ports"]:
                for name, base_url in p["ecs_ports"].items():
                    llms_url = base_url.rsplit("/", 2)[0] + "/llms.txt"
                    checks["llms_txt"] = check_url(llms_url, timeout=3)
                    break
            
            project_growth.append({"project": p["name"], "checks": checks, "revenue": p["revenue"]})
            status = "✅" if all(v == 200 for v in checks.values()) else "⚠️"
            print(f"  {p['name']}: {status}")
        
        report["growth"] = {"projects": project_growth}
    except Exception as e:
        print(f"  ❌ 营销官失败: {e}")
        report["growth"] = {"error": str(e)}


def generate_daily_report(report):
    """生成完整日报"""
    today = datetime.now().strftime("%Y-%m-%d")
    report_file = os.path.join(REPORT_DIR, f"eve_daily_{today}.md")

    md = f"# Eve日报 {today}\n\n"

    # 一、运营状态（全项目）
    md += "## 一、运营状态（全项目）\n\n"
    ops = report.get("operator", {})
    if "projects" in ops:
        for pr in ops["projects"]:
            md += f"### {pr['project']}\n"
            md += f"- 收入: {pr['revenue']}\n"
            if pr["ecs"]:
                for name, code in pr["ecs"].items():
                    md += f"- ECS {name}: {code}\n"
            if pr["pages"]:
                pages_ok = sum(1 for c in pr["pages"].values() if c == 200)
                md += f"- Pages: {pages_ok}/{len(pr['pages'])}正常\n"
            if pr["p0_issues"]:
                for issue in pr["p0_issues"]:
                    md += f"- 🔴 P0: {issue}\n"
            md += "\n"
    md += f"**P0异常总计: {ops.get('p0_count', 0)}个**\n\n"

    # 二、情报摘要（全项目）
    md += "## 二、情报摘要（全项目）\n\n"
    scout = report.get("scout", {})
    if "projects" in scout:
        for pr in scout["projects"]:
            md += f"### {pr['project']}\n{pr['intel']}\n\n"

    # 三、安全审计（全项目）
    md += "## 三、安全审计（全项目）\n\n"
    guard = report.get("guardian", {})
    if "projects" in guard:
        for pr in guard["projects"]:
            md += f"### {pr['project']}\n"
            if pr.get("aishield_stats"):
                s = pr["aishield_stats"]
                md += f"- 工具数: {s.get('total_tools','?')}, 审计: {s.get('total_audits','?')}, 均分: {s.get('avg_security_score','?')}\n"
                md += f"- 风险: {s.get('by_risk','?')}\n"
            if pr["issues"]:
                for issue in pr["issues"]:
                    md += f"- ⚠️ {issue}\n"
            if not pr["issues"] and not pr.get("aishield_stats"):
                md += "- ✅ 无问题\n"
            md += "\n"

    # 四、部署检查（全项目）
    md += "## 四、部署检查（全项目）\n\n"
    builder = report.get("builder", {})
    if "projects" in builder:
        for pr in builder["projects"]:
            status = "✅" if pr["all_healthy"] else "❌"
            md += f"- {status} {pr['project']}"
            if pr["issues"]:
                md += f" — {', '.join(pr['issues'][:2])}"
            md += "\n"
    md += "\n"

    # 五、分析师建议（全项目）
    md += "## 五、分析师建议（全项目）\n\n"
    strat = report.get("strategist", {})
    if "projects" in strat:
        for pr in strat["projects"]:
            md += f"### {pr['project']}\n{pr['analysis']}\n\n"

    # 六、前沿发现（全项目）
    md += "## 六、前沿发现（全项目）\n\n"
    res = report.get("researcher", {})
    if "projects" in res:
        for pr in res["projects"]:
            md += f"### {pr['project']}\n{pr['frontier']}\n\n"

    # 七、营销分发（全项目）
    md += "## 七、营销分发状态（全项目）\n\n"
    growth = report.get("growth", {})
    if "projects" in growth:
        for pr in growth["projects"]:
            md += f"### {pr['project']}\n"
            for name, code in pr["checks"].items():
                md += f"- {name}: {code}\n"
            md += f"- 收入: {pr['revenue']}\n\n"

    # 八、待决策
    md += "## 八、待用户决策\n"
    decisions = []
    ops_projects = ops.get("projects", [])
    for pr in ops_projects:
        for issue in pr.get("p0_issues", []):
            decisions.append(f"{pr['project']}: {issue}")
    if not decisions:
        md += "- 无待决策项\n"
    else:
        for d in decisions:
            md += f"- 🔴 {d}\n"

    with open(report_file, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"\n✅ 日报: {report_file}")
    return report_file


if __name__ == "__main__":
    print(f"=== Eve每日全流程 v3 {datetime.now().strftime('%Y-%m-%d %H:%M')} ===\n")

    report = {"date": datetime.now().strftime("%Y-%m-%d")}

    tasks = [task_operator, task_scout, task_guardian, task_builder, task_strategist, task_researcher, task_growth]
    for task in tasks:
        try:
            task(report)
        except Exception as e:
            print(f"  ❌ {task.__name__}全局失败: {e}")
            traceback.print_exc()
            report[task.__name__.replace("task_","")] = {"error": str(e)}

    try:
        report_file = generate_daily_report(report)
    except Exception as e:
        print(f"  ❌ 日报生成失败: {e}")
        traceback.print_exc()

    json_file = os.path.join(REPORT_DIR, f"eve_daily_{report['date']}.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n=== 完成 ===")
    print(f"JSON: {json_file}")
