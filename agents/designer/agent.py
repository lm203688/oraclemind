"""
Agent 6: 设计师（Designer）— 项目设计顾问
职责：UI/UX设计、品牌视觉、落地页优化、设计系统维护
模型：agnes（设计决策）+ cogview-3-plus（图片生成）+ glm-4v（视觉审查）
端口：8464
"""

import sys, os, json, time, traceback, base64, subprocess
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.base_agent import BaseAgent
from shared.llm_client import call_llm
from shared.project_db import check_pages_sites

NODE_PATH = "/home/z/.bun/install/global/node_modules"


class DesignerAgent(BaseAgent):
    def __init__(self):
        super().__init__("designer", "项目设计顾问", 8464)

    def execute(self, task: str, params: dict) -> dict:
        start = time.time()
        project_id = params.get("project_id", "default")
        try:
            handlers = {
                "design_strategy": self._design_strategy,
                "image_generate": self._image_generate,
                "visual_audit": self._visual_audit,
                "landing_page_advice": self._landing_page_advice,
                "brand_system": self._brand_system,
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

    def _generate_image(self, prompt: str, size: str = "1024x1024") -> dict:
        """调用cogview-3-plus生成图片"""
        script = f"""
const SDK = require('z-ai-web-dev-sdk').default;
(async () => {{
    const client = await SDK.create();
    const img = await client.images.generations.create({{
        model: 'cogview-3-plus',
        prompt: {json.dumps(prompt)},
        size: '{size}'
    }});
    // 返回base64前100字符作为确认
    const b64 = img.data[0].base64 || '';
    console.log(JSON.stringify({{status: 'ok', length: b64.length, prefix: b64.substring(0, 50)}}));
}})().catch(e => console.error(JSON.stringify({{error: e.message}})));
"""
        try:
            result = subprocess.run(
                ["node", "-e", script],
                capture_output=True, text=True, timeout=60,
                env={**os.environ, "NODE_PATH": NODE_PATH}
            )
            return json.loads(result.stdout.strip())
        except Exception as e:
            return {"error": str(e)}

    def _design_strategy(self, params: dict) -> dict:
        """设计策略建议"""
        project = params.get("project", "")
        brand_tone = params.get("brand_tone", "")
        target_audience = params.get("target_audience", "")

        prompt = f"""你是设计策略专家。为以下项目制定设计策略：

项目：{project}
品牌调性：{brand_tone}
目标用户：{target_audience}

请输出：
1. 设计风格建议（参考3-5个同领域优秀案例）
2. 色彩方案（主色+辅助色+语义色）
3. 字体建议（中文+英文）
4. 组件设计原则
5. 响应式断点建议
6. 交互设计原则
7. 设计系统结构"""

        strategy = call_llm(prompt, model="agnes", max_tokens=1500)
        return {"design_strategy": strategy}

    def _image_generate(self, params: dict) -> dict:
        """图片生成"""
        prompt = params.get("prompt", "")
        style = params.get("style", "")
        size = params.get("size", "1024x1024")

        full_prompt = f"{prompt}，风格：{style}" if style else prompt

        # agnes优化prompt
        optimized = call_llm(
            f"优化以下图片生成prompt，使其更适合AI绘图模型，输出英文prompt：\n{full_prompt}",
            model="agnes", max_tokens=200
        )

        # 生成图片
        result = self._generate_image(optimized, size)

        return {
            "original_prompt": prompt,
            "optimized_prompt": optimized,
            "generation_result": result,
            "size": size
        }

    def _visual_audit(self, params: dict) -> dict:
        """视觉审查 — 基于URL分析页面设计"""
        url = params.get("url", "")

        # 抓取页面HTML分析
        import urllib.request
        html_content = ""
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                html_content = resp.read().decode("utf-8", errors="ignore")
        except:
            pass

        prompt = f"""你是视觉设计审查专家。分析以下网页的设计质量：

URL：{url}

HTML片段（前3000字符）：
{html_content[:3000]}

请输出：
1. 视觉一致性评分（1-10）
2. 色彩使用评估
3. 排版评估
4. 交互元素评估
5. 响应式设计评估
6. 改进建议（按优先级）
7. 参考标杆网站"""

        audit = call_llm(prompt, model="agnes", max_tokens=1500)
        return {"url": url, "visual_audit": audit}

    def _landing_page_advice(self, params: dict) -> dict:
        """落地页优化建议"""
        url = params.get("url", "")
        goal = params.get("goal", "转化率提升")

        prompt = f"""你是落地页优化专家。

目标页面：{url}
优化目标：{goal}

请输出：
1. 首屏优化建议（3秒内传达价值）
2. CTA（行动号召）优化
3. 信任元素建议
4. 加载速度优化
5. 移动端优化
6. A/B测试建议（3组实验）
7. 预期提升效果"""

        advice = call_llm(prompt, model="agnes", max_tokens=1500)
        return {"landing_page_advice": advice}

    def _brand_system(self, params: dict) -> dict:
        """品牌VI系统设计"""
        brand_name = params.get("brand_name", "")
        industry = params.get("industry", "")

        prompt = f"""你是品牌设计专家。为以下品牌设计VI系统：

品牌名：{brand_name}
行业：{industry}

请输出：
1. Logo设计方向（3个方案描述）
2. 色彩系统（RGB+HEX）
3. 字体系统（中英文）
4. 图标风格
5. 应用场景规范
6. 品牌语气和文案风格
7. 错误使用示例"""

        brand_system = call_llm(prompt, model="agnes", max_tokens=1500)
        return {"brand_name": brand_name, "brand_system": brand_system}

    def get_capabilities(self) -> dict:
        return {
            "agent": "designer",
            "description": self.description,
            "capabilities": [
                "设计策略制定（agnes分析）",
                "AI图片生成（cogview-3-plus）",
                "视觉审查（网页设计评估）",
                "落地页优化建议",
                "品牌VI系统设计",
                "项目长期设计跟踪"
            ],
            "tools": ["agnes", "cogview-3-plus", "glm-4v", "superdesign skill"],
            "models": ["agnes", "cogview-3-plus"],
            "version": "1.0.0",
            "port": 8464
        }


if __name__ == "__main__":
    agent = DesignerAgent()
    print("=== Health Check ===")
    print(json.dumps(agent.health_check(), ensure_ascii=False, indent=2))
    print("\n=== Capabilities ===")
    print(json.dumps(agent.get_capabilities(), ensure_ascii=False, indent=2))
