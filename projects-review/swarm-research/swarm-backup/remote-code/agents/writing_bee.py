"""
写作蜂 — 基于研究发现生成论文草稿
"""
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, get_context_for_bee, get_research


def run(research_id, user_config=None, format="markdown"):
    """
    写作蜂执行
    
    Returns:
        {"success": bool, "paper": str}
    """
    context = get_context_for_bee(research_id, "writing_bee")
    research = get_research(research_id)
    topic = research.get("topic", "")
    
    prompt = f"""你是一个学术论文写作专家。基于以下研究上下文，生成一份完整的论文草稿。

研究主题: {topic}

研究上下文（包含文献综述、假设、实验结果等）:
{context}

请按以下结构生成论文:

# {topic}

## 摘要
[200字内，包含背景、方法、结果、结论]

## 1. 引言
[研究背景、问题、贡献]

## 2. 相关工作
[基于文献蜂的发现]

## 3. 研究假设
[基于假设蜂的发现]

## 4. 实验方法
[基于实验蜂的设置]

## 5. 实验结果
[基于实验蜂的结果]

## 6. 分析与讨论
[基于分析蜂的发现]

## 7. 结论与未来工作

## 参考文献
[列出相关论文]

用中文写作，学术风格。"""

    result = call_llm_simple(prompt, system="你是学术论文写作专家", user_config=user_config, max_tokens=4000)
    
    if result.get("error"):
        return {"success": False, "error": result["error"]}
    
    paper = result["content"]
    
    add_finding(research_id, "writing_bee", f"完成论文草稿，{len(paper)}字", "discovery")
    
    return {
        "success": True,
        "paper": paper,
        "word_count": len(paper),
        "usage": result.get("usage", {}),
    }
