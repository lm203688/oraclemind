"""技术文档工程师Agent — API文档/教程/手册"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.base_agent import BaseAgent
from shared.llm_client import call_llm


class TechWriterAgent(BaseAgent):
    def __init__(self):
        super().__init__("tech_writer", "技术文档工程师——API文档/教程/手册", 8474)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "api_doc": self._api_doc,
                "tutorial": self._tutorial,
                "user_manual": self._user_manual,
                "readme": self._readme,
                "changelog": self._changelog,
                "architecture_doc": self._architecture_doc,
                "faq": self._faq,
                "translation": self._translation,
                "style_guide": self._style_guide,
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

    def _api_doc(self, params):
        api = params.get("api", "")
        doc = call_llm(f"为API[{api}]写文档:1.端点说明 2.参数表 3.请求示例 4.响应示例 5.错误码 6.SDK代码", model="glm-4-plus", max_tokens=800)
        return {"api": api, "documentation": doc}

    def _tutorial(self, params):
        topic = params.get("topic", "")
        tutorial = call_llm(f"写[{topic}]教程:1.前置条件 2.分步骤(带代码) 3.常见问题 4.进阶用法 5.最佳实践", model="glm-4-plus", max_tokens=800)
        return {"topic": topic, "tutorial": tutorial}

    def _user_manual(self, params):
        product = params.get("product", "")
        manual = call_llm(f"为[{product}]写用户手册:1.快速开始 2.功能说明 3.操作步骤 4.故障排除 5.FAQ", model="glm-4-plus", max_tokens=800)
        return {"product": product, "manual": manual}

    def _readme(self, params):
        project = params.get("project", "")
        readme = call_llm(f"为[{project}]写README:1.项目简介 2.特性 3.安装 4.使用 5.配置 6.贡献指南 7.License", model="glm-4-flash", max_tokens=600)
        return {"project": project, "readme": readme}

    def _changelog(self, params):
        version = params.get("version", "")
        changes = params.get("changes", "")
        changelog = call_llm(f"为版本[{version}]写changelog,变更[{changes}]:1.新功能 2.修复 3.破坏性变更 4.迁移指南", model="glm-4-flash", max_tokens=400)
        return {"version": version, "changelog": changelog}

    def _architecture_doc(self, params):
        system = params.get("system", "")
        doc = call_llm(f"为[{system}]写架构文档:1.系统概览 2.组件图 3.数据流 4.技术选型 5.扩展方案", model="glm-4-plus", max_tokens=600)
        return {"system": system, "architecture_doc": doc}

    def _faq(self, params):
        product = params.get("product", "")
        faq = call_llm(f"为[{product}]写FAQ:1.常见问题(10个) 2.故障排除 3.最佳实践 4.相关资源", model="glm-4-flash", max_tokens=500)
        return {"product": product, "faq": faq}

    def _translation(self, params):
        content = params.get("content", "")
        target_lang = params.get("target_lang", "en")
        translation = call_llm(f"将以下内容翻译为{target_lang},保持技术术语准确:\n{content[:500]}", model="glm-4-flash", max_tokens=500)
        return {"target_lang": target_lang, "translation": translation}

    def _style_guide(self, params):
        guide = call_llm(f"技术文档风格指南:1.术语表 2.格式规范 3.代码示例风格 4.语气语调 5.多语言策略", model="glm-4-flash", max_tokens=400)
        return {"style_guide": guide}

    def get_capabilities(self):
        return {
            "name": self.name, "description": self.description,
            "tasks": ["api_doc", "tutorial", "user_manual", "readme", "changelog",
                       "architecture_doc", "faq", "translation", "style_guide",
                       "health_check", "capabilities"],
        }


if __name__ == "__main__":
    agent = TechWriterAgent()
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
