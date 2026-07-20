"""DevOps工程师Agent — CI/CD/监控/自动化"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.base_agent import BaseAgent
from shared.llm_client import call_llm


class DevOpsAgent(BaseAgent):
    def __init__(self):
        super().__init__("devops", "DevOps工程师——CI/CD/监控/自动化", 8473)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "ci_pipeline": self._ci_pipeline,
                "cd_pipeline": self._cd_pipeline,
                "monitoring_setup": self._monitoring_setup,
                "log_analysis": self._log_analysis,
                "incident_response": self._incident_response,
                "infrastructure_audit": self._infrastructure_audit,
                "cost_optimization": self._cost_optimization,
                "security_hardening": self._security_hardening,
                "backup_strategy": self._backup_strategy,
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

    def _ci_pipeline(self, params):
        project = params.get("project", "")
        ci = call_llm(f"为[{project}]设计CI Pipeline:1.触发条件 2.构建步骤 3.测试策略 4.代码质量门禁 5.YAML配置", model="glm-4-plus", max_tokens=600)
        return {"project": project, "ci_config": ci}

    def _cd_pipeline(self, params):
        project = params.get("project", "")
        env = params.get("environment", "production")
        cd = call_llm(f"为[{project}]设计CD到[{env}]:1.部署策略(蓝绿/金丝雀) 2.回滚方案 3.健康检查 4.自动化脚本", model="glm-4-plus", max_tokens=600)
        return {"project": project, "environment": env, "cd_config": cd}

    def _monitoring_setup(self, params):
        system = params.get("system", "")
        monitoring = call_llm(f"为[{system}]设计监控:1.关键指标 2.告警阈值 3.Dashboard设计 4.Prometheus/Grafana配置", model="glm-4-flash", max_tokens=500)
        return {"system": system, "monitoring": monitoring}

    def _log_analysis(self, params):
        logs = params.get("logs", "")
        analysis = call_llm(f"分析日志[{logs[:500]}]:1.错误分类 2.根因分析 3.影响范围 4.修复建议 5.预防措施", model="glm-4-plus", max_tokens=500)
        return {"analysis": analysis}

    def _incident_response(self, params):
        incident = params.get("incident", "")
        response = call_llm(f"事故响应[{incident}]:1.影响评估 2.紧急处理 3.根因分析 4.事后复盘 5.预防措施", model="glm-4-plus", max_tokens=600)
        return {"incident": incident, "response": response}

    def _infrastructure_audit(self, params):
        infra = params.get("infrastructure", "")
        audit = call_llm(f"审计基础设施[{infra}]:1.资源利用率 2.单点故障 3.扩展性 4.安全风险 5.优化建议", model="glm-4-flash", max_tokens=500)
        return {"infrastructure": infra, "audit": audit}

    def _cost_optimization(self, params):
        usage = params.get("usage", "")
        opt = call_llm(f"成本优化[{usage}]:1.资源浪费识别 2.Reserved Instance 3.自动伸缩 4.预计节省", model="glm-4-flash", max_tokens=400)
        return {"optimization": opt}

    def _security_hardening(self, params):
        system = params.get("system", "")
        hardening = call_llm(f"安全加固[{system}]:1.网络隔离 2.访问控制 3.密钥管理 4.审计日志 5.CIS基准", model="glm-4-plus", max_tokens=500)
        return {"system": system, "hardening": hardening}

    def _backup_strategy(self, params):
        system = params.get("system", "")
        strategy = call_llm(f"备份策略[{system}]:1.备份类型(全量/增量) 2.频率 3.存储位置 4.恢复测试 5.RTO/RPO", model="glm-4-flash", max_tokens=400)
        return {"system": system, "strategy": strategy}

    def get_capabilities(self):
        return {
            "name": self.name, "description": self.description,
            "tasks": ["ci_pipeline", "cd_pipeline", "monitoring_setup", "log_analysis",
                       "incident_response", "infrastructure_audit", "cost_optimization",
                       "security_hardening", "backup_strategy", "health_check", "capabilities"],
        }


if __name__ == "__main__":
    agent = DevOpsAgent()
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
