"""
Agent Swarm Supervisor — 多智能体系统的中央调度器
负责意图理解、复杂度判断、任务路由
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Task:
    id: str
    type: str
    content: str
    complexity: str  # direct | delegate
    target_agent: Optional[str] = None

class ComplexityGate:
    """复杂度门控：判断任务是否需要委派到专业Agent"""

    COMPLEXITY_KEYWORDS = {
        "search":  ["检索", "查找", "搜索", "资料", "查一下", "google"],
        "analysis": ["分析", "评估", "对比", "研究", "论文", "深度", "解读", "辩证"],
        "code":    ["开发", "修改", "重构", "写代码", "API", "函数", "类", "bug", "调试", "部署"],
        "vision":  ["图片", "图像", "截图", "识别", "OCR", "看图", "这张图"]
    }

    @classmethod
    def judge(cls, user_input: str) -> Dict[str, Any]:
        """返回 (route_type, confidence)"""
        scores = {agent: 0 for agent in cls.COMPLEXITY_KEYWORDS}
        for agent, keywords in cls.COMPLEXITY_KEYWORDS.items():
            scores[agent] = sum(1 for kw in keywords if kw in user_input.lower())

        max_agent = max(scores, key=scores.get)
        max_score = scores[max_agent]

        if max_score >= 2:
            return {"route": "delegate", "agent": max_agent, "confidence": min(max_score / 5, 1.0)}
        elif max_score == 1:
            return {"route": "delegate", "agent": max_agent, "confidence": 0.5}
        else:
            return {"route": "direct", "agent": None, "confidence": 1.0}


class Supervisor:
    """Supervisor Agent — 基于gemma4:26b"""

    def __init__(self, ollama_host: str = "http://localhost:11434"):
        self.ollama_host = ollama_host
        self.model = "gemma4:26b"
        self.gate = ComplexityGate()
        self.conversation_history: list = []

    def route(self, user_input: str) -> Task:
        """路由决策"""
        decision = self.gate.judge(user_input)

        task_id = f"task-{hash(user_input) % 10000}"
        task = Task(
            id=task_id,
            type=decision["route"],
            content=user_input,
            complexity=decision["route"],
            target_agent=decision.get("agent")
        )

        print(f"[Supervisor] 复杂度判定: {decision}")
        print(f"[Supervisor] 路由: {task.target_agent or '直接处理'}")
        return task

    def direct_answer(self, user_input: str) -> str:
        """简单任务：直接调用gemma4回答"""
        # 此处为骨架，实际需集成Ollama Python API
        return f"[Supervisor直接回答] {user_input}"

    def delegate(self, task: Task, agent_instance) -> str:
        """委派复杂任务到专业Agent"""
        print(f"[Supervisor] 委派任务 {task.id} → {task.target_agent}")
        return agent_instance.process(task)


if __name__ == "__main__":
    sup = Supervisor()

    # 测试用例
    test_cases = [
        "你好，今天天气怎么样？",
        "帮我搜索一下ROS2的最新版本是多少",
        "分析一下UR5e和FANUC M-10iA的性价比",
        "帮我写一个Python函数来解析JSON文件",
        "看这张图里有什么"
    ]

    for case in test_cases:
        task = sup.route(case)
        print(f"  输入: {case}")
        print(f"  → {task.complexity} → {task.target_agent}\n")
