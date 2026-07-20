"""
Agent 3: 分析师（Strategist）— 项目商业顾问
职责：商业模式分析、定价策略、市场研究、竞品分析、ROI评估
模型：glm-4-flash + glm-4-plus + agnes（三模型交叉）
端口：8462
"""

import sys, os, json, time, traceback
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.base_agent import BaseAgent
from shared.llm_client import call_llm, call_llm_multi, synthesize, web_search
from shared.project_db import query_all_kb


class StrategistAgent(BaseAgent):
    def __init__(self):
        super().__init__("strategist", "项目商业顾问", 8462)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "business_analysis": self._business_analysis,
                "pricing_strategy": self._pricing_strategy,
                "market_research": self._market_research,
                "competitor_analysis": self._competitor_analysis,
                "roi_assessment": self._roi_assessment,
                "cross_model_analysis": self._cross_model_analysis,
                "health_check": lambda p: self.health_check(),
                "capabilities": lambda p: self.get_capabilities(),
                "register_project": lambda p: self.register_project(p["project_id"], p["name"], p.get("profile", "")),
            }
            handler = handlers.get(task)
            if not handler:
                return {"error": f"Unknown task: {task}", "available": list(handlers.keys())}
            result = handler(params)
            duration = int((time.time() - start) * 1000)
            self._log_task(project_id, task, "success", json.dumps(result, ensure_ascii=False)[:500], duration)
            return result
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            err = traceback.format_exc()[:500]
            self._log_task(project_id, task, "error", err, duration)
            self.log_growth("failure", f"Task {task} failed: {err}")
            return {"error": str(e), "traceback": err}

    def _cross_model_analysis(self, prompt: str) -> dict:
        """三模型交叉分析"""
        results = call_llm_multi(prompt, models=["glm-4-flash", "glm-4-plus", "agnes"], max_tokens=2000)
        final = synthesize(results, prompt)
        return {"models": results, "synthesis": final}

    def _business_analysis(self, params: dict) -> dict:
        """商业模式分析"""
        project_desc = params.get("project_description", "")
        project_id = params.get("project_id", "default")

        # 互联网搜索市场数据
        market_data = web_search(f"{project_desc} 市场规模 商业模式 竞品", count=10)

        # 项目数据库补充
        kb_data = query_all_kb(project_desc, limit_per_site=3)

        prompt = f"""你是资深商业分析师。分析以下项目的商业模式：

项目描述：{project_desc}

市场数据：
{json.dumps(market_data[:5], ensure_ascii=False)[:1500]}

知识库数据：
{json.dumps(kb_data, ensure_ascii=False)[:800]}

请输出：
1. 商业模式画布（客户细分/价值主张/渠道/收入流/成本结构）
2. 竞争优势分析
3. 市场规模估算
4. 风险评估
5. 优化建议
6. 阶段性发展路径"""

        analysis = self._cross_model_analysis(prompt)
        if project_id != "default":
            self.add_project_note(project_id, f"商业模式分析完成\n{analysis['synthesis'][:300]}")
        return {"business_analysis": analysis["synthesis"], "models_detail": analysis["models"], "market_data": market_data[:5]}

    def _pricing_strategy(self, params: dict) -> dict:
        """定价策略"""
        product = params.get("product", "")
        cost = params.get("cost", 0)
        competitors = params.get("competitors", [])

        comp_data = []
        for comp in competitors:
            results = web_search(f"{comp} 价格 定价", count=3)
            comp_data.extend(results[:2])
            time.sleep(1)

        prompt = f"""你是定价策略专家。为以下产品设计定价方案：

产品：{product}
成本：{cost}
竞品价格数据：{json.dumps(comp_data, ensure_ascii=False)[:1000]}

请输出：
1. 定价模型建议（订阅/按次/ freemium/组合）
2. 具体价格档位（3-4档）
3. 各档位功能划分
4. 竞品价格对比
5. 价格心理学建议
6. 动态定价策略"""

        result = self._cross_model_analysis(prompt)
        return {"pricing_strategy": result["synthesis"]}

    def _market_research(self, params: dict) -> dict:
        """市场调研"""
        industry = params.get("industry", "")
        region = params.get("region", "全球")

        results = web_search(f"{industry} {region} 市场规模 增长率 趋势 2026", count=15)

        prompt = f"""你是市场调研分析师。分析 {industry} 市场（{region}）：

搜索结果：
{json.dumps(results, ensure_ascii=False)[:3000]}

请输出：
1. 市场规模（TAM/SAM/SOM）
2. 增长率
3. 主要玩家
4. 市场驱动因素
5. 市场阻碍
6. 未来3年预测
7. 机会窗口"""

        analysis = self._cross_model_analysis(prompt)
        return {"market_research": analysis["synthesis"], "raw_data": results[:10]}

    def _competitor_analysis(self, params: dict) -> dict:
        """竞品分析"""
        competitors = params.get("competitors", [])
        own_product = params.get("own_product", "")

        analyses = {}
        for comp in competitors:
            results = web_search(f"{comp} 功能 定价 优势 劣势 评价", count=5)
            analyses[comp] = results[:3]
            time.sleep(1)

        prompt = f"""你是竞品分析专家。对比分析以下产品：

我们的产品：{own_product}
竞品数据：{json.dumps(analyses, ensure_ascii=False)[:2000]}

请输出对比表格：
1. 功能对比矩阵
2. 定价对比
3. 优势/劣势分析（我们 vs 每个竞品）
4. 差异化机会
5. 竞争策略建议"""

        result = self._cross_model_analysis(prompt)
        return {"competitor_analysis": result["synthesis"], "raw_data": analyses}

    def _roi_assessment(self, params: dict) -> dict:
        """ROI评估"""
        investment = params.get("investment", 0)
        monthly_cost = params.get("monthly_cost", 0)
        expected_revenue = params.get("expected_revenue", 0)
        timeframe_months = params.get("timeframe_months", 12)

        total_cost = investment + monthly_cost * timeframe_months
        total_revenue = expected_revenue * timeframe_months
        roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        payback_month = investment / expected_revenue if expected_revenue > 0 else 999

        prompt = f"""评估以下项目的ROI：
初期投入：¥{investment}
月运营成本：¥{monthly_cost}
预期月收入：¥{expected_revenue}
评估周期：{timeframe_months}个月

计算结果：
总成本：¥{total_cost}
总收入：¥{total_revenue}
ROI：{roi:.1f}%
回本周期：{payback_month:.1f}个月

请分析：
1. ROI是否合理
2. 风险因素
3. 优化建议
4. 敏感性分析（收入下降20%的影响）"""

        analysis = call_llm(prompt, model="glm-4-plus", max_tokens=1000)
        return {
            "roi": f"{roi:.1f}%",
            "payback_months": round(payback_month, 1),
            "total_cost": total_cost,
            "total_revenue": total_revenue,
            "analysis": analysis
        }

    def get_capabilities(self) -> dict:
        return {
            "agent": "strategist",
            "description": self.description,
            "capabilities": [
                "商业模式分析（三模型交叉）",
                "定价策略",
                "市场调研",
                "竞品分析",
                "ROI评估",
                "项目长期商业跟踪"
            ],
            "tools": ["glm-4-flash", "glm-4-plus", "agnes", "web_search", "14站知识库"],
            "models": ["glm-4-flash", "glm-4-plus", "agnes"],
            "version": "1.0.0",
            "port": 8462
        }


if __name__ == "__main__":
    agent = StrategistAgent()
    print("=== Health Check ===")
    print(json.dumps(agent.health_check(), ensure_ascii=False, indent=2))
    print("\n=== Capabilities ===")
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
