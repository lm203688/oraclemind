#!/usr/bin/env python3
"""
Eve总管 — 每日任务调度器
按用户确认的工作流执行，结果写入文件，不受Bash超时限制
"""

import sys, os, json, time, traceback
from datetime import datetime
from threading import Thread
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scout.agent import ScoutAgent
from builder.agent import BuilderAgent
from strategist.agent import StrategistAgent
from growth.agent import GrowthAgent
from guardian.agent import GuardianAgent
from designer.agent import DesignerAgent
from ops.agent import OperatorAgent
from researcher.agent import ResearcherAgent

REPORT_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


def run_daily_tasks():
    """执行每日任务全流程"""
    today = datetime.now().strftime("%Y-%m-%d")
    report = {"date": today, "tasks": {}}

    # === 1. 运营财务官 08:00 ===
    print("[1/5] 运营财务官: 每日监控...")
    try:
        ops = OperatorAgent()
        result = ops.execute("daily_monitor", {})
        issues = result.get("issues", [])
        report["tasks"]["operator"] = {
            "status": "done",
            "ecs_services": result.get("ecs_services", {}),
            "pages_sites": result.get("pages_sites", {}),
            "issues": issues,
            "issue_count": len(issues)
        }
        print(f"  完成: {len(issues)}个异常")
    except Exception as e:
        report["tasks"]["operator"] = {"status": "error", "error": str(e)[:100]}
        print(f"  失败: {e}")

    # === 2. 情报员 08:30 ===
    print("[2/5] 情报员: 14站情报收集...")
    try:
        scout = ScoutAgent()
        # 对14站逐站采集
        sites = ["genetech", "tcm", "agent", "robot", "quantum", "brain",
                 "nuclear", "exo", "alien", "deepsea", "newenergy", "lifescience",
                 "biocomputing", "bionicai"]
        intel_results = {}
        for site in sites[:3]:  # 每日先做3站，轮替
            r = scout.execute("kb_search", {"keyword": "latest", "site": site})
            intel_results[site] = r.get("results", {})
        report["tasks"]["scout"] = {
            "status": "done",
            "sites_checked": list(intel_results.keys()),
            "results": intel_results
        }
        print(f"  完成: 检查{len(intel_results)}站")
    except Exception as e:
        report["tasks"]["scout"] = {"status": "error", "error": str(e)[:100]}
        print(f"  失败: {e}")

    # === 3. 审计师 22:00 ===
    print("[3/5] 审计师: AIShield状态检查...")
    try:
        guardian = GuardianAgent()
        result = guardian.execute("aishield_status", {})
        report["tasks"]["guardian"] = {
            "status": "done",
            "stats": result.get("stats", {}),
            "aishield_api": result.get("aishield_api", "?"),
            "aishield_compliance": result.get("aishield_compliance", "?")
        }
        print(f"  完成: {result.get('stats', {}).get('total_tools', '?')}工具")
    except Exception as e:
        report["tasks"]["guardian"] = {"status": "error", "error": str(e)[:100]}
        print(f"  失败: {e}")

    # === 4. 工程师 09:00-22:00 ===
    print("[4/5] 工程师: 部署检查...")
    try:
        builder = BuilderAgent()
        result = builder.execute("deploy_check", {})
        report["tasks"]["builder"] = {
            "status": "done",
            "ecs_services": result.get("ecs_services", {}),
            "issues": result.get("issues", [])
        }
        print(f"  完成: {len(result.get('issues', []))}个部署问题")
    except Exception as e:
        report["tasks"]["builder"] = {"status": "error", "error": str(e)[:100]}
        print(f"  失败: {e}")

    # === 5. Eve汇总 ===
    print("[5/5] Eve: 汇总每日报告...")

    # 收集所有异常
    all_issues = []
    for agent_name, task_result in report["tasks"].items():
        if task_result.get("issues"):
            for issue in task_result["issues"]:
                all_issues.append({"agent": agent_name, "issue": issue})

    # 生成需用户决策的疑问
    questions = []
    for issue_item in all_issues:
        issue = issue_item["issue"]
        if "异常: 0" in str(issue) or "连接失败" in str(issue):
            questions.append(f"【{issue_item['agent']}】{issue} — 是否在ECS重启该服务？")
        elif "404" in str(issue):
            questions.append(f"【{issue_item['agent']}】{issue} — 是否需要排查路由配置？")

    report["summary"] = {
        "total_issues": len(all_issues),
        "questions_for_user": questions,
        "all_healthy": len(all_issues) == 0
    }

    # 写入报告文件
    report_file = os.path.join(REPORT_DIR, f"daily_{today}.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # 生成Markdown报告
    md_report = generate_daily_report_md(report)
    md_file = os.path.join(REPORT_DIR, f"daily_{today}.md")
    with open(md_file, "w", encoding="utf-8") as f:
        f.write(md_report)

    print(f"\n报告已生成: {md_file}")
    return report


def generate_daily_report_md(report):
    """生成Markdown格式每日报告"""
    today = report["date"]
    md = f"# Eve日报 {today}\n\n"

    # 项目状态
    md += "## 项目状态清单\n\n"

    # 运营状态
    ops = report["tasks"].get("operator", {})
    ecs = ops.get("ecs_services", {})
    pages = ops.get("pages_sites", {})
    md += "### 运营状态\n"
    md += f"- 14站Pages: {sum(1 for v in pages.values() if v == 200)}/{len(pages)} 正常\n"
    md += f"- ECS服务: {sum(1 for v in ecs.values() if v == 200)}/{len(ecs)} 正常\n"

    if ops.get("issues"):
        md += f"- 异常: {len(ops['issues'])}个\n"
        for issue in ops["issues"]:
            md += f"  - ⚠️ {issue}\n"
    md += "\n"

    # 审计状态
    guardian = report["tasks"].get("guardian", {})
    if guardian.get("stats"):
        stats = guardian["stats"]
        md += "### 安全审计\n"
        md += f"- 工具数: {stats.get('total_tools', '?')}\n"
        md += f"- 审计记录: {stats.get('total_audits', '?')}\n"
        md += f"- 平均安全分: {stats.get('avg_security_score', '?')}\n"
        md += f"- 风险分布: {stats.get('by_risk', '?')}\n\n"

    # 工程师
    builder = report["tasks"].get("builder", {})
    if builder.get("issues"):
        md += "### 工程师发现\n"
        for issue in builder["issues"]:
            md += f"- ⚠️ {issue}\n"
        md += "\n"

    # 情报员
    scout = report["tasks"].get("scout", {})
    if scout.get("sites_checked"):
        md += f"### 情报采集\n"
        md += f"- 今日检查站点: {', '.join(scout['sites_checked'])}\n\n"

    # 需用户决策
    summary = report.get("summary", {})
    questions = summary.get("questions_for_user", [])
    if questions:
        md += "## ❓需用户决策\n\n"
        for i, q in enumerate(questions, 1):
            md += f"{i}. {q}\n"
    else:
        md += "## ✅ 无需用户决策\n\n所有项目运行正常。\n"

    return md


def run_weekly_tasks():
    """执行每周任务"""
    today = datetime.now().strftime("%Y-%m-%d")
    report = {"date": today, "type": "weekly", "tasks": {}}

    # 1. 情报员 — 非14站项目情报
    print("[1/3] 情报员: 非14站项目情报...")
    try:
        scout = ScoutAgent()
        projects_intel = {
            "aishield": "AI agent security protocol 2024",
            "roboparts": "robot parts compatibility platform 2024",
            "swarm-research": "AI research automation platform",
            "healthlens": "health data aggregator AI",
            "agent-trust": "agent trust reputation protocol"
        }
        results = {}
        for project, query in projects_intel.items():
            r = scout.execute("intel_search", {"query": query, "project_id": project})
            results[project] = r.get("analysis", "")[:500]
        report["tasks"]["scout"] = {"status": "done", "results": results}
    except Exception as e:
        report["tasks"]["scout"] = {"status": "error", "error": str(e)[:100]}

    # 2. 分析师 — 周度改进建议（基于情报）
    print("[2/3] 分析师: 周度改进建议...")
    try:
        from shared.llm_client import call_llm
        intel_summary = json.dumps(report["tasks"].get("scout", {}).get("results", {}),
                                   ensure_ascii=False)[:2000]
        prompt = f"""你是商业分析师。基于本周情报，对所有项目提出改进建议：

情报摘要：
{intel_summary}

项目清单：
1. GeneTech 14站(6354实体,Creem 6产品,无付费用户)
2. AIShield(21工具/119规则,安全平台)
3. RoboParts(机器人零件,15品牌34型号,¥0收入)
4. 蜂群科研(8种蜂,积分制¥39-499)
5. HealthLens(健康数据聚合)
6. AgentTrust(信任评分协议,开源)

请逐项目输出：1.现状 2.改进建议 3.优先级(高/中/低)"""
        analysis = call_llm(prompt, model="glm-4-plus", max_tokens=1500)
        report["tasks"]["strategist"] = {"status": "done", "analysis": analysis}
    except Exception as e:
        report["tasks"]["strategist"] = {"status": "error", "error": str(e)[:100]}

    # 3. 营销师 — 周度营销建议
    print("[3/3] 营销师: 周度营销建议...")
    try:
        from shared.llm_client import call_llm
        prompt = """你是营销官。基于Agent原生分发5层体系，为所有项目制定本周营销计划：

项目：GeneTech 14站/AIShield/RoboParts/蜂群科研/HealthLens/AgentTrust

每项目输出：
1. 本周可自动执行的（SEO/IndexNow/GitHub PR）
2. 需用户配合的（社媒发帖/社区互动）
3. 预期效果"""
        marketing_plan = call_llm(prompt, model="glm-4-plus", max_tokens=1200)
        report["tasks"]["growth"] = {"status": "done", "plan": marketing_plan}
    except Exception as e:
        report["tasks"]["growth"] = {"status": "error", "error": str(e)[:100]}

    # 写入报告
    report_file = os.path.join(REPORT_DIR, f"weekly_{today}.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    md_file = os.path.join(REPORT_DIR, f"weekly_{today}.md")
    with open(md_file, "w", encoding="utf-8") as f:
        f.write(f"# Eve周报 {today}\n\n")
        f.write("## 情报员 — 项目情报\n\n")
        for project, analysis in report["tasks"].get("scout", {}).get("results", {}).items():
            f.write(f"### {project}\n{analysis}\n\n")
        f.write("\n## 分析师 — 改进建议\n\n")
        f.write(report["tasks"].get("strategist", {}).get("analysis", "无"))
        f.write("\n\n## 营销官 — 营销计划\n\n")
        f.write(report["tasks"].get("growth", {}).get("plan", "无"))

    print(f"\n周报已生成: {md_file}")
    return report


def run_monthly_backup():
    """月度备份"""
    import shutil, zipfile
    today = datetime.now().strftime("%Y-%m-%d")

    backup_dir = os.path.join(REPORT_DIR, "backups")
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, f"project_backup_{today}.zip")

    # 打包agents目录 + 关键项目文件
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(base_dir)

    with zipfile.ZipFile(backup_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        # agents目录
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if f.endswith(('.py', '.md', '.json', '.yaml', '.yml')):
                    filepath = os.path.join(root, f)
                    arcname = os.path.relpath(filepath, project_dir)
                    zf.write(filepath, arcname)
        # TOOLS.md, AGENTS.md等关键文件
        for f in ['TOOLS.md', 'AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md']:
            fp = os.path.join(project_dir, f)
            if os.path.exists(fp):
                zf.write(fp, f)

    print(f"月度备份: {backup_file} ({os.path.getsize(backup_file)//1024}KB)")
    return backup_file


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["daily", "weekly", "monthly", "all"])
    args = parser.parse_args()

    if args.mode == "daily":
        run_daily_tasks()
    elif args.mode == "weekly":
        run_weekly_tasks()
    elif args.mode == "monthly":
        run_monthly_backup()
    elif args.mode == "all":
        run_daily_tasks()
        run_weekly_tasks()
        run_monthly_backup()
