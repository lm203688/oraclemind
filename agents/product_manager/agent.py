"""产品经理Agent — 需求分析/路线图/用户研究"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.base_agent import BaseAgent
from shared.llm_client import call_llm


class ProductManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__("product_manager", "产品经理——需求/路线图/用户研究", 8472)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "requirement_analysis": self._requirement_analysis,
                "prd_draft": self._prd_draft,
                "roadmap": self._roadmap,
                "user_research": self._user_research,
                "feature_prioritization": self._feature_prioritization,
                "competitive_analysis": self._competitive_analysis,
                "user_story": self._user_story,
                "acceptance_criteria": self._acceptance_criteria,
                "sprint_planning": self._sprint_planning,
                "health_check": lambda p: self.health_check(),
                "capabilities": lambda p: self.get_capabilities(),
            }
            handler = handlers.get(task)
            if not handler:
                return {"error": f"Unknown task: {task}", "available": list(handlers.keys())}
            result = handler(params)
            duration = int((time.time() - start) * 1000)
            self._log_task(project_id, task, "success", json.dumps(result, ensure_ascii=False)[:500], duration)
            return result
        except Exception as err:
            duration = int((time.time() - start) * 1000)
            err_msg = str(err)[:200]
            self._log_task(project_id, task, "error", err_msg, duration)
            return {"error": err_msg}

    def _requirement_analysis(self, params):
        req = params.get("requirement", "")
        analysis = call_llm(f"分析需求[{req}]:1.核心目标 2.用户场景 3.功能拆解 4.技术约束 5.优先级", model="glm-4-plus", max_tokens=600)
        return {"requirement": req, "analysis": analysis}

    def _prd_draft(self, params):
        feature = params.get("feature", "")
        prd = call_llm(f"为[{feature}]写PRD:1.背景 2.目标 3.功能详述 4.交互流程 5.数据需求 6.验收标准", model="glm-4-plus", max_tokens=800)
        return {"feature": feature, "prd": prd}

    def _roadmap(self, params):
        product = params.get("product", "")
        roadmap = call_llm(f"为[{product}]制定产品路线图:1.Q1-Q4规划 2.里程碑 3.依赖关系 4.资源需求 5.风险", model="glm-4-plus", max_tokens=600)
        return {"product": product, "roadmap": roadmap}

    def _user_research(self, params):
        topic = params.get("topic", "")
        research = call_llm(f"用户研究[{topic}]:1.目标用户画像 2.调研方法 3.问卷设计要点 4.访谈大纲 5.关键指标", model="glm-4-flash", max_tokens=500)
        return {"topic": topic, "research": research}

    def _feature_prioritization(self, params):
        features = params.get("features", [])
        result = call_llm(f"用RICE/MoSCoW方法对功能{features}排序:1.影响力 2.信心 3.工作量 4.优先级矩阵", model="glm-4-flash", max_tokens=400)
        return {"features": features, "prioritization": result}

    def _competitive_analysis(self, params):
        competitors = params.get("competitors", [])
        product = params.get("product", "")
        analysis = call_llm(f"竞品分析:我们的产品[{product}] vs 竞品{competitors}:1.功能对比 2.差异化 3.定价策略 4.市场定位", model="glm-4-plus", max_tokens=600)
        return {"product": product, "competitors": competitors, "analysis": analysis}

    def _user_story(self, params):
        feature = params.get("feature", "")
        story = call_llm(f"为[{feature}]写用户故事:As a [角色],I want [功能],So that [价值]。含验收标准(给/当/则)", model="glm-4-flash", max_tokens=400)
        return {"feature": feature, "user_story": story}

    def _acceptance_criteria(self, params):
        feature = params.get("feature", "")
        criteria = call_llm(f"为[{feature}]定义验收标准:1.功能验收 2.性能验收 3.安全验收 4.兼容性验收 5.测试用例", model="glm-4-flash", max_tokens=400)
        return {"feature": feature, "criteria": criteria}

    def _sprint_planning(self, params):
        backlog = params.get("backlog", [])
        sprint = call_llm(f"Sprint规划:待办{backlog}。1.本Sprint目标 2.任务分配 3.时间估算 4.风险点", model="glm-4-flash", max_tokens=400)
        return {"backlog": backlog, "sprint_plan": sprint}

    def get_capabilities(self):
        return {
            "name": self.name, "description": self.description,
            "tasks": ["requirement_analysis", "prd_draft", "roadmap", "user_research",
                       "feature_prioritization", "competitive_analysis", "user_story",
                       "acceptance_criteria", "sprint_planning", "health_check", "capabilities"],
        }


if __name__ == "__main__":
    agent = ProductManagerAgent()
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
