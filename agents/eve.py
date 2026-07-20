"""
Eve总管 — Agent团队调度枢纽
职责：任务拆解→分发→汇总→报告
不执行专业任务，只做调度和综合判断
"""

import sys, os, json, time, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pathlib import Path

# 导入所有Agent
from scout.agent import ScoutAgent
from builder.agent import BuilderAgent
from strategist.agent import StrategistAgent
from growth.agent import GrowthAgent
from guardian.agent import GuardianAgent
from designer.agent import DesignerAgent
from ops.agent import OperatorAgent
from researcher.agent import ResearcherAgent


class EveScheduler:
    """Eve总管调度器"""

    def __init__(self):
        self.agents = {
            "scout": ScoutAgent(),
            "builder": BuilderAgent(),
            "strategist": StrategistAgent(),
            "growth": GrowthAgent(),
            "guardian": GuardianAgent(),
            "designer": DesignerAgent(),
            "operator": OperatorAgent(),
            "researcher": ResearcherAgent(),
        }
        self.base_dir = Path(__file__).parent

    def dispatch(self, agent_name: str, task: str, params: dict = None) -> dict:
        """分发任务到指定Agent"""
        params = params or {}
        agent = self.agents.get(agent_name)
        if not agent:
            return {"error": f"Unknown agent: {agent_name}", "available": list(self.agents.keys())}
        return agent.execute(task, params)

    def multi_dispatch(self, tasks: list) -> dict:
        """并行分发多个任务
        tasks: [{"agent": "scout", "task": "intel_search", "params": {...}}, ...]
        """
        results = {}
        for t in tasks:
            agent_name = t.get("agent")
            task = t.get("task")
            params = t.get("params", {})
            key = f"{agent_name}.{task}"
            results[key] = self.dispatch(agent_name, task, params)
        return results

    def project_overview(self) -> dict:
        """项目全景视图"""
        overview = {}
        for name, agent in self.agents.items():
            overview[name] = {
                "health": agent.health_check(),
                "capabilities": agent.get_capabilities(),
                "projects": agent.list_projects()
            }
        return overview

    def daily_report(self) -> dict:
        """每日汇总报告"""
        # 1. 运营官做日常监控
        ops_result = self.dispatch("operator", "daily_monitor", {})

        # 2. 审计师查AIShield状态
        guardian_result = self.dispatch("guardian", "aishield_status", {})

        # 3. 工程师查部署状态
        builder_result = self.dispatch("builder", "deploy_check", {})

        return {
            "date": time.strftime("%Y-%m-%d %H:%M"),
            "operations": ops_result,
            "security": guardian_result,
            "infrastructure": builder_result,
            "agent_count": len(self.agents),
            "all_agents_healthy": all(a.health_check()["status"] == "healthy" for a in self.agents.values())
        }

    def register_project_all(self, project_id: str, name: str, profile: str):
        """向所有Agent注册同一个项目"""
        results = {}
        for agent_name, agent in self.agents.items():
            results[agent_name] = agent.register_project(project_id, name, profile)
        return results


if __name__ == "__main__":
    eve = EveScheduler()

    print("=== Eve总管启动 ===")
    print(f"管理Agent数: {len(eve.agents)}")
    for name, agent in eve.agents.items():
        hc = agent.health_check()
        print(f"  {name:12s} | port {hc['port']:5d} | {hc['status']:8s} | projects: {hc['projects_tracked']}")

    print("\n=== 日报测试 ===")
    report = eve.daily_report()
    print(json.dumps(report, ensure_ascii=False, indent=2)[:2000])
