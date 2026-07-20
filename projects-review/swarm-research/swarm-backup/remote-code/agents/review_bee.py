"""
评审蜂 — 跨模型同行评审
支持两种模式：
1. 角色模拟（默认）：用不同system prompt模拟3位审稿人
2. 跨模型（BYOK）：用用户配置的多个模型真正跨模型评审
"""
import json
from core.llm_client import call_llm_simple, call_llm_with_model
from core.knowledge import add_finding, get_context_for_bee, get_research
from core.config import REVIEW_ROLES, LLM_API_URL, LLM_API_KEY, LLM_MODEL


def _build_review_prompt(research, context, role):
    """为单个审稿人构建评审prompt"""
    return f"""请以你的专业视角对以下研究进行严格评审。

研究主题: {research['topic']}

研究内容:
{context}

请输出以下内容：

## 评分 (1-10)
[给出具体分数]

## 优点 (至少2条)
1. ...
2. ...

## 缺点 (至少2条)
1. ...
2. ...

## 关键问题
[从你的专业角度指出最关键的问题]

## 改进建议
[给出具体可操作的建议]

## 总体评价
[一句话总结你的评审意见]"""


def _review_with_roles(research, context, user_config):
    """模式1：角色模拟评审（平台默认）"""
    reviews = []
    total_usage = {"prompt_tokens": 0, "completion_tokens": 0}
    
    for role in REVIEW_ROLES:
        prompt = _build_review_prompt(research, context, role)
        result = call_llm_simple(
            prompt,
            system=role["system"],
            user_config=user_config,
            max_tokens=1500
        )
        
        if result.get("error"):
            reviews.append({
                "reviewer": role["name"],
                "role_id": role["id"],
                "focus": role["focus"],
                "model": "role_simulated",
                "error": result["error"],
                "review": f"评审失败: {result['error']}",
            })
        else:
            reviews.append({
                "reviewer": role["name"],
                "role_id": role["id"],
                "focus": role["focus"],
                "model": "role_simulated",
                "review": result["content"],
                "usage": result.get("usage", {}),
            })
            usage = result.get("usage", {})
            total_usage["prompt_tokens"] += usage.get("prompt_tokens", 0)
            total_usage["completion_tokens"] += usage.get("completion_tokens", 0)
    
    return reviews, total_usage


def _review_with_models(research, context, models):
    """模式2：跨模型评审（BYOK）"""
    reviews = []
    total_usage = {"prompt_tokens": 0, "completion_tokens": 0}
    
    for i, model_cfg in enumerate(models):
        name = model_cfg.get("name", f"模型{i+1}")
        url = model_cfg.get("url", LLM_API_URL)
        key = model_cfg.get("key", "")
        model = model_cfg.get("model", LLM_MODEL)
        
        # 每个模型分配一个评审角色
        role = REVIEW_ROLES[i % len(REVIEW_ROLES)]
        
        messages = [
            {"role": "system", "content": role["system"]},
            {"role": "user", "content": _build_review_prompt(research, context, role)},
        ]
        
        result = call_llm_with_model(
            messages, url, key, model, max_tokens=1500
        )
        
        if result.get("error"):
            reviews.append({
                "reviewer": f"{name}（{role['name']}）",
                "role_id": role["id"],
                "focus": role["focus"],
                "model": model,
                "model_name": name,
                "error": result["error"],
                "review": f"模型调用失败: {result['error']}",
            })
        else:
            reviews.append({
                "reviewer": f"{name}（{role['name']}）",
                "role_id": role["id"],
                "focus": role["focus"],
                "model": model,
                "model_name": name,
                "review": result["content"],
                "usage": result.get("usage", {}),
            })
            usage = result.get("usage", {})
            total_usage["prompt_tokens"] += usage.get("prompt_tokens", 0)
            total_usage["completion_tokens"] += usage.get("completion_tokens", 0)
    
    return reviews, total_usage


def _synthesize(reviews, research, context, user_config):
    """汇总多视角评审意见"""
    reviews_text = ""
    for r in reviews:
        reviews_text += f"\n### {r['reviewer']}（{r.get('focus','')}）\n{r.get('review', r.get('error',''))}\n"
    
    prompt = f"""你是评审委员会主席，请汇总以下3位审稿人的意见，给出综合评审报告。

研究主题: {research['topic']}

3位审稿人的评审意见:
{reviews_text}

请输出综合评审报告：

## 综合评分
[3位审稿人的平均分，及你的综合评分]

## 共识优点
[3位审稿人共同认可的优点]

## 共识问题
[3位审稿人共同指出的问题]

## 分歧点
[审稿人之间意见不一致的地方]

## 最终建议
接受 / 小修 / 大修 / 拒稿

## 修改优先级
[列出最需要修改的3个问题，按优先级排序]"""

    result = call_llm_simple(
        prompt,
        system="你是学术评审委员会主席，负责汇总多方意见给出综合判断",
        user_config=user_config,
        max_tokens=1500
    )
    
    if result.get("error"):
        return f"综合评审生成失败: {result['error']}"
    
    return result["content"]


def run(research_id, user_config=None, **kwargs):
    """
    评审蜂执行：跨模型/跨视角同行评审
    
    Args:
        user_config: 
            - byok_enabled + review_models: 跨模型评审
            - 无review_models: 角色模拟评审
    """
    context = get_context_for_bee(research_id, "review_bee")
    research = get_research(research_id)
    
    if not research:
        return {"success": False, "error": "研究项目不存在"}
    
    # 判断评审模式
    review_models = None
    if user_config and user_config.get("review_models"):
        review_models = user_config["review_models"]
    
    add_finding(research_id, "review_bee", 
                f"▶ 启动评审蜂 [{'跨模型' if review_models else '角色模拟'}模式]", "info")
    
    # 执行评审
    if review_models:
        reviews, usage = _review_with_models(research, context, review_models)
        mode = "cross_model"
    else:
        reviews, usage = _review_with_roles(research, context, user_config)
        mode = "role_simulated"
    
    # 汇总综合评审
    add_finding(research_id, "review_bee", "▶ 生成综合评审报告", "info")
    synthesis = _synthesize(reviews, research, context, user_config)
    
    # 提取评分
    scores = []
    for r in reviews:
        review_text = r.get("review", "")
        # 尝试从评审内容中提取评分
        import re
        score_match = re.search(r'(\d+(?:\.\d+)?)/10', review_text)
        if score_match:
            scores.append(float(score_match.group(1)))
    
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # 保存到知识库
    add_finding(research_id, "review_bee", 
                f"完成{len(reviews)}位审稿人评审，平均分{avg_score:.1f}/10", "review")
    add_finding(research_id, "review_bee", synthesis[:500], "review_summary")
    
    return {
        "success": True,
        "mode": mode,
        "reviews": reviews,
        "synthesis": synthesis,
        "avg_score": round(avg_score, 1),
        "reviewer_count": len(reviews),
        "usage": usage,
    }
