"""
Agent 4: 营销官（Growth）— Agent原生分发执行者
职责：GEO内容优化、Agent发现层、AI搜索索引、API接入层、监控优化、社媒推广
端口：8463
"""

import sys, os, json, time, traceback
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.base_agent import BaseAgent
from shared.llm_client import call_llm, web_search
from shared.project_db import check_ecs_services, check_pages_sites


class GrowthAgent(BaseAgent):
    def __init__(self):
        super().__init__("growth", "Agent原生分发执行者", 8463)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "geo_audit": self._geo_audit,
                "agent_discovery_check": self._agent_discovery_check,
                "content_generate": self._content_generate,
                "seo_submit": self._seo_submit,
                "distribution_status": self._distribution_status,
                "promotion_plan": self._promotion_plan,
                "social_post_draft": self._social_post_draft,
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

    def _geo_audit(self, params: dict) -> dict:
        """GEO内容优化审计 — 检查5层Agent原生分发"""
        url = params.get("url", "")
        checks = {
            "llms_txt": False,
            "ai_plugin_json": False,
            "openapi_json": False,
            "robots_txt": False,
            "schema_org": False,
            "tldr_summary": False,
        }

        if url:
            import urllib.request
            base = url.rstrip("/")
            for path_key, path in [
                ("llms_txt", "/llms.txt"),
                ("ai_plugin_json", "/.well-known/ai-plugin.json"),
                ("openapi_json", "/api/v1/openapi.json"),
                ("robots_txt", "/robots.txt"),
            ]:
                try:
                    req = urllib.request.Request(base + path, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        checks[path_key] = resp.status == 200
                except:
                    checks[path_key] = False

            # 检查首页是否有TL;DR和Schema.org
            try:
                req = urllib.request.Request(base, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    html = resp.read().decode("utf-8", errors="ignore").lower()
                    checks["tldr_summary"] = "tldr" in html or "摘要" in html
                    checks["schema_org"] = "schema.org" in html or "application/ld+json" in html
            except:
                pass

        score = sum(checks.values()) * 100 // len(checks)
        missing = [k for k, v in checks.items() if not v]

        return {
            "url": url,
            "geo_score": score,
            "checks": checks,
            "missing": missing,
            "recommendation": f"GEO评分{score}/100，缺失：{', '.join(missing)}" if missing else "GEO配置完整"
        }

    def _agent_discovery_check(self, params: dict) -> dict:
        """检查Agent发现层"""
        url = params.get("url", "")
        results = {
            "llms_txt_exists": False,
            "ai_plugin_exists": False,
            "mcp_endpoint": False,
            "agent_json": False,
        }

        if url:
            import urllib.request
            base = url.rstrip("/")
            for key, path in [
                ("llms_txt_exists", "/llms.txt"),
                ("ai_plugin_exists", "/.well-known/ai-plugin.json"),
                ("mcp_endpoint", "/mcp"),
                ("agent_json", "/.well-known/agent.json"),
            ]:
                try:
                    req = urllib.request.Request(base + path, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        results[key] = resp.status in (200, 405)  # 405 for MCP POST-only
                except:
                    results[key] = False

        return {"url": url, "discovery_status": results}

    def _content_generate(self, params: dict) -> dict:
        """内容生成 — 四平台适配"""
        topic = params.get("topic", "")
        platform = params.get("platform", "all")  # all/xiaohongshu/zhihu/wechat/douyin
        style = params.get("style", "专业")

        platforms = {
            "xiaohongshu": "小红书风格：emoji多、口语化、种草感、800字以内",
            "zhihu": "知乎风格：专业、有数据支撑、逻辑清晰、1500-2000字",
            "wechat": "公众号风格：深度、有观点、结构化、2000-3000字",
            "douyin": "抖音文案风格：开头抓人、节奏快、口语化、300字以内"
        }

        target_platforms = list(platforms.keys()) if platform == "all" else [platform]
        contents = {}

        for p in target_platforms:
            prompt = f"""你是{p}内容创作专家。请围绕以下主题创作内容：

主题：{topic}
风格要求：{style}
平台要求：{platforms[p]}

请直接输出内容正文，不需要标题说明。"""
            contents[p] = call_llm(prompt, model="glm-4-flash", max_tokens=1000)
            time.sleep(2)

        return {"topic": topic, "contents": contents}

    def _seo_submit(self, params: dict) -> dict:
        """IndexNow提交状态"""
        # 调用现有seo-submit.sh或直接报告
        return {
            "status": "IndexNow提交脚本路径: /home/z/my-project/kb-workflow/scripts/seo-submit.sh",
            "key": "kb3f8a2c9d7e1f4b6a5d8c3e7f9a2b4d",
            "sites": "14域名 × 3搜索引擎 = 36次提交",
            "note": "运行 bash seo-submit.sh 执行提交"
        }

    def _distribution_status(self, params: dict) -> dict:
        """分发状态总览"""
        pages = check_pages_sites()
        ecs = check_ecs_services()

        return {
            "pages_sites_14": pages,
            "ecs_services": ecs,
            "all_pages_online": all(v == 200 for v in pages.values()),
            "note": "14站+ECS服务状态总览"
        }

    def _promotion_plan(self, params: dict) -> dict:
        """推广方案设计"""
        product = params.get("product", "")
        budget = params.get("budget", 0)
        target = params.get("target", "")

        prompt = f"""你是营销策略专家。设计推广方案：

产品：{product}
预算：¥{budget}/月
目标：{target}

请输出：
1. 渠道选择（GitHub/社媒/社区/SEO/付费）
2. 各渠道预算分配
3. 内容计划（每周产出）
4. KPI设定
5. 时间表（4周）
6. 自动化部分 vs 需用户配合部分"""

        plan = call_llm(prompt, model="glm-4-plus", max_tokens=1500)
        return {"promotion_plan": plan}

    def _social_post_draft(self, params: dict) -> dict:
        """社媒帖子草稿（需用户确认后发布）"""
        platform = params.get("platform", "")
        topic = params.get("topic", "")

        prompt = f"""为{platform}创作一篇关于{topic}的帖子。
要求：符合{platform}平台调性，有吸引力，包含行动号召。
直接输出帖子内容。"""

        draft = call_llm(prompt, model="glm-4-flash", max_tokens=800)
        return {
            "platform": platform,
            "draft": draft,
            "status": "draft",
            "note": "需用户确认后发布，可用social-auto-upload自动发布（需扫码登录）"
        }

    def get_capabilities(self) -> dict:
        return {
            "agent": "growth",
            "description": self.description,
            "capabilities": [
                "GEO内容优化审计（5层检查）",
                "Agent发现层检查（llms.txt/ai-plugin.json/MCP）",
                "四平台内容生成（小红书/知乎/公众号/抖音）",
                "IndexNow SEO提交",
                "分发状态监控",
                "推广方案设计",
                "社媒帖子草稿（需用户确认发布）",
                "项目长期增长跟踪"
            ],
            "tools": ["web_search", "IndexNow", "GitHub API", "social-auto-upload", "content-producer"],
            "models": ["glm-4-plus", "glm-4-flash"],
            "version": "1.0.0",
            "port": 8463,
            "agent_native_distribution": {
                "layer1_geo": "GEO内容优化",
                "layer2_discovery": "llms.txt+ai-plugin.json+MCP",
                "layer3_index": "IndexNow+robots.txt",
                "layer4_api": "免费层+付费层+OpenAPI",
                "layer5_monitor": "GEO追踪+转化漏斗"
            }
        }


if __name__ == "__main__":
    agent = GrowthAgent()
    print("=== Health Check ===")
    print(json.dumps(agent.health_check(), ensure_ascii=False, indent=2))
    print("\n=== Capabilities ===")
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
