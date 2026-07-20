"""
Eve总管增强版——集成Planning模式 + Agent Loop + 记忆检索
借鉴Devin 2.0 + Manus + Claude Code设计
"""

import sys, os, json, time, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pathlib import Path
from shared.enhanced import enhance_agent

# 导入原版Eve
from eve import EveScheduler
from data_scientist.agent import DataScientistAgent
from product_manager.agent import ProductManagerAgent
from devops.agent import DevOpsAgent
from tech_writer.agent import TechWriterAgent


class EveEnhanced(EveScheduler):
    """Eve增强版"""
    
    def __init__(self):
        super().__init__()
        
        # 添加4个新agent
        self.agents["data_scientist"] = DataScientistAgent()
        self.agents["product_manager"] = ProductManagerAgent()
        self.agents["devops"] = DevOpsAgent()
        self.agents["tech_writer"] = TechWriterAgent()
        
        # 为所有agent添加增强能力
        for name, agent in self.agents.items():
            enhance_agent(agent)
            print(f"  ✅ {name} 已增强(plan/loop/recall)")
    
    def run_daily_enhanced(self):
        """增强版每日全流程——带Planning和Loop"""
        print("=== Eve增强版每日全流程 ===")
        print()
        
        # Planning阶段
        print("[Planning] 分析今日任务...")
        plan = {
            "tasks": [
                {"agent": "operator", "task": "daily_monitor", "params": {}, "priority": "P0"},
                {"agent": "scout", "task": "daily_brief", "params": {"project_id": "default"}, "priority": "P1"},
                {"agent": "guardian", "task": "aishield_status", "params": {}, "priority": "P0"},
                {"agent": "builder", "task": "deploy_check", "params": {}, "priority": "P1"},
                {"agent": "devops", "task": "infrastructure_audit", "params": {"infrastructure": "ECS+CF Pages"}, "priority": "P1"},
                {"agent": "tech_writer", "task": "changelog", "params": {"version": "daily", "changes": "今日更新"}, "priority": "P2"},
            ],
            "parallel_groups": [
                ["operator", "scout"],  # 可并行
                ["guardian"],            # 独立
                ["builder"],             # 独立
            ],
        }
        print(f"  计划: {len(plan['tasks'])}个任务, {len(plan['parallel_groups'])}组")
        print()
        
        # 执行阶段——用Loop模式
        results = {}
        for task_info in plan["tasks"]:
            agent_name = task_info["agent"]
            task_name = task_info["task"]
            
            print(f"[Loop] {agent_name}.{task_name}...")
            agent = self.agents[agent_name]
            
            # 用增强的loop方法执行
            result = agent.loop(task_name, task_info.get("params", {}))
            results[agent_name] = result
            
            if result.get("error"):
                print(f"  ❌ 失败: {result['error'][:80]}")
            else:
                print(f"  ✅ 完成 (iterations={result.get('loop_iterations', 1)})")
        
        # 汇总报告
        print()
        print("=== 每日汇总 ===")
        report = self._generate_report(results)
        print(report)
        
        return report
    
    def _generate_report(self, results: dict) -> str:
        """生成增强版日报"""
        from datetime import datetime
        date = datetime.now().strftime('%Y-%m-%d')
        
        lines = [f"# Eve增强版日报 {date}", ""]
        
        for agent, result in results.items():
            status = "✅" if not result.get("error") else "❌"
            iters = result.get("loop_iterations", 1)
            elapsed = result.get("loop_elapsed_ms", result.get("duration_ms", 0))
            lines.append(f"### {agent} {status}")
            if result.get("error"):
                lines.append(f"- 错误: {result['error'][:100]}")
            else:
                # 提取关键信息
                if isinstance(result, dict):
                    for k, v in result.items():
                        if k not in ("loop_iterations", "loop_elapsed_ms", "error"):
                            if isinstance(v, (str, int, float, bool)):
                                lines.append(f"- {k}: {v}")
                            elif isinstance(v, list):
                                lines.append(f"- {k}: {len(v)}项")
                            elif isinstance(v, dict):
                                lines.append(f"- {k}: {len(v)}字段")
            lines.append(f"迭代: {iters}次 | 耗时: {elapsed}ms")
            lines.append("")
        
        # 保存报告
        report_path = Path(__file__).parent / "reports" / f"eve_enhanced_{date}.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text("\n".join(lines), encoding="utf-8")
        
        return "\n".join(lines)


if __name__ == "__main__":
    eve = EveEnhanced()
    eve.run_daily_enhanced()
