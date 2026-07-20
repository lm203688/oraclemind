#!/usr/bin/env python3
"""
Agent团队 cron定时监控脚本
由运营财务官+审计师+工程师联合执行
每30分钟运行一次
"""

import sys, os, json, time, subprocess
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ops.agent import OperatorAgent
from guardian.agent import GuardianAgent
from builder.agent import BuilderAgent

def run_monitor():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"=== Agent团队监控 {timestamp} ===")

    all_issues = []

    # 1. 运营财务官 — 服务状态
    print("\n[1] 运营财务官: 服务监控")
    try:
        ops = OperatorAgent()
        result = ops.execute("daily_monitor", {})
        ecs = result.get("ecs_services", {})
        pages = result.get("pages_sites", {})
        issues = result.get("issues", [])
        print(f"  ECS: {len(ecs)}个, Pages: {len(pages)}个, 异常: {len(issues)}个")
        for i in issues:
            print(f"  ⚠️ {i}")
            all_issues.append(("operator", i))
    except Exception as e:
        print(f"  ❌ 运营财务官执行失败: {e}")
        all_issues.append(("operator_error", str(e)))

    # 2. 审计师 — AIShield状态
    print("\n[2] 审计师: AIShield状态")
    try:
        guardian = GuardianAgent()
        result = guardian.execute("aishield_status", {})
        if "stats" in result:
            s = result["stats"]
            print(f"  工具数: {s.get('total_tools','?')}, 审计数: {s.get('total_audits','?')}, 平均分: {s.get('avg_security_score','?')}")
        else:
            print(f"  ⚠️ AIShield服务异常")
            all_issues.append(("guardian", "AIShield服务异常"))
    except Exception as e:
        print(f"  ❌ 审计师执行失败: {e}")
        all_issues.append(("guardian_error", str(e)))

    # 3. 工程师 — 部署检查
    print("\n[3] 工程师: 部署检查")
    try:
        builder = BuilderAgent()
        result = builder.execute("deploy_check", {})
        for issue in result.get("issues", []):
            print(f"  ⚠️ {issue}")
            all_issues.append(("builder", issue))
    except Exception as e:
        print(f"  ❌ 工程师执行失败: {e}")
        all_issues.append(("builder_error", str(e)))

    # 汇总
    print(f"\n=== 汇总 ===")
    print(f"异常总数: {len(all_issues)}")
    if all_issues:
        for source, issue in all_issues:
            print(f"  [{source}] {issue}")

        # Bark推送（仅严重异常）
        severe_keywords = ["0", "500", "502", "503", "Connection refused"]
        severe = [i for _, i in all_issues if any(k in str(i) for k in severe_keywords)]
        if severe:
            try:
                import urllib.request
                msg = "; ".join(severe[:3])
                url = f"https://api.day.app/LxB8pdfWq9q72fguikNQoa/Agent监控告警/{msg}"
                urllib.request.urlopen(url, timeout=5)
                print(f"  📱 Bark推送: {len(severe)}个严重异常")
            except:
                pass
    else:
        print("✅ 全部正常")

    # 写入日志
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f"monitor_{datetime.now().strftime('%Y-%m-%d')}.log")
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"\n--- {timestamp} ---\n")
        f.write(f"异常数: {len(all_issues)}\n")
        for source, issue in all_issues:
            f.write(f"  [{source}] {issue}\n")

    return all_issues


if __name__ == "__main__":
    run_monitor()
