"""
数据科学家Agent — ML模型/数据分析/可视化
职责: 模型训练/评估/部署、数据分析、统计可视化
"""
import sys, os, json, time, traceback
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.base_agent import BaseAgent
from shared.llm_client import call_llm


class DataScientistAgent(BaseAgent):
    def __init__(self):
        super().__init__("data_scientist", "数据科学家——ML模型/数据分析/可视化", 8471)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "model_train": self._model_train,
                "model_evaluate": self._model_evaluate,
                "data_analysis": self._data_analysis,
                "statistical_test": self._statistical_test,
                "feature_engineering": self._feature_engineering,
                "model_deploy": self._model_deploy,
                "data_visualization": self._data_visualization,
                "experiment_design": self._experiment_design,
                "benchmark": self._benchmark,
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
            self.log_growth("failure", f"Task {task} failed: {err_msg}")
            return {"error": err_msg}

    def _model_train(self, params):
        dataset = params.get("dataset", "")
        model_type = params.get("model_type", "random_forest")
        target = params.get("target", "")
        analysis = call_llm(f"你是数据科学家。为数据集[{dataset}]训练{model_type}模型,目标变量[{target}]。给出:1.特征工程建议 2.模型参数 3.验证策略 4.预期性能", model="glm-4-plus", max_tokens=600)
        return {"dataset": dataset, "model_type": model_type, "target": target, "plan": analysis}

    def _model_evaluate(self, params):
        model = params.get("model", "")
        metrics = call_llm(f"评估模型[{model}]的指标:1.准确率/MAE/RMSE 2.过拟合检查 3.特征重要性 4.改进建议", model="glm-4-flash", max_tokens=400)
        return {"model": model, "evaluation": metrics}

    def _data_analysis(self, params):
        data_desc = params.get("data_description", "")
        analysis = call_llm(f"分析数据[{data_desc}]:1.统计摘要 2.分布检查 3.相关性分析 4.异常值检测 5.关键发现", model="glm-4-plus", max_tokens=600)
        return {"data": data_desc, "analysis": analysis}

    def _statistical_test(self, params):
        test_type = params.get("test_type", "ttest")
        hypothesis = params.get("hypothesis", "")
        result = call_llm(f"统计检验[{test_type}],假设[{hypothesis}]:1.零假设/备择假设 2.检验条件 3.p值解释 4.结论", model="glm-4-flash", max_tokens=400)
        return {"test_type": test_type, "hypothesis": hypothesis, "result": result}

    def _feature_engineering(self, params):
        features = params.get("features", "")
        target = params.get("target", "")
        result = call_llm(f"特征工程:现有特征[{features}],目标[{target}]。建议:1.新特征构造 2.特征选择 3.编码方式 4.缩放方法", model="glm-4-plus", max_tokens=500)
        return {"features": features, "target": target, "suggestions": result}

    def _model_deploy(self, params):
        model = params.get("model", "")
        env = params.get("environment", "production")
        result = call_llm(f"部署模型[{model}]到[{env}]:1.部署方案 2.性能监控 3.回滚策略 4.版本管理", model="glm-4-flash", max_tokens=400)
        return {"model": model, "environment": env, "deploy_plan": result}

    def _data_visualization(self, params):
        data = params.get("data", "")
        chart_type = params.get("chart_type", "")
        result = call_llm(f"为数据[{data}]设计{chart_type}可视化:1.图表类型选择 2.配色方案 3.标注说明 4.Python代码(matplotlib)", model="glm-4-plus", max_tokens=500)
        return {"data": data, "chart_type": chart_type, "visualization": result}

    def _experiment_design(self, params):
        goal = params.get("goal", "")
        result = call_llm(f"设计实验[{goal}]:1.实验假设 2.变量控制 3.样本量计算 4.对照组设计 5.统计功效", model="glm-4-plus", max_tokens=500)
        return {"goal": goal, "design": result}

    def _benchmark(self, params):
        models = params.get("models", [])
        dataset = params.get("dataset", "")
        result = call_llm(f"对比模型{models}在数据集[{dataset}]上的表现:1.指标对比 2.速度对比 3.内存使用 4.推荐选择", model="glm-4-flash", max_tokens=400)
        return {"models": models, "dataset": dataset, "benchmark": result}

    def get_capabilities(self):
        return {
            "name": self.name,
            "description": self.description,
            "tasks": ["model_train", "model_evaluate", "data_analysis", "statistical_test",
                       "feature_engineering", "model_deploy", "data_visualization",
                       "experiment_design", "benchmark", "health_check", "capabilities"],
        }


if __name__ == "__main__":
    agent = DataScientistAgent()
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
