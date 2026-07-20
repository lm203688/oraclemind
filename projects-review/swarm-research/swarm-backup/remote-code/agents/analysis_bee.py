"""
分析蜂 — 数据分析+可视化建议
分析实验结果，提取洞察
"""
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, get_context_for_bee, get_research


def run(research_id, user_config=None, **kwargs):
    """分析蜂执行：分析所有实验结果，生成洞察"""
    context = get_context_for_bee(research_id, "analysis_bee")
    research = get_research(research_id)
    
    prompt = f"""你是数据分析专家。基于以下研究数据，进行深度分析。

研究主题: {research['topic']}

研究上下文（含所有发现、假设、实验结果）:
{context}

请分析：
1. 关键发现总结（3-5条）
2. 假设验证情况（哪些假设得到支持，哪些被否定）
3. 意外发现（超出预期的结果）
4. 数据可视化建议（3个图表）
5. 统计显著性评估
6. 局限性和偏差分析
7. 下一步研究建议

输出格式：

## 关键发现
1. [发现]
2. [发现]
...

## 假设验证
- 假设1: [支持/否定/部分支持]，原因：[分析]
...

## 意外发现
[描述]

## 可视化建议
1. 图表类型: [类型]，数据: [数据]，目的: [目的]
...

## 统计评估
[评估]

## 局限性
[分析]

## 下一步建议
1. [建议]
2. [建议]
..."""

    result = call_llm_simple(prompt, system="你是数据分析专家，善于从实验数据中提取洞察",
                             user_config=user_config, max_tokens=2000)
    
    if result.get("error"):
        return {"success": False, "error": result["error"]}
    
    analysis = result["content"]
    
    add_finding(research_id, "analysis_bee", f"完成数据分析，提取关键洞察", "discovery")
    add_finding(research_id, "analysis_bee", analysis[:500], "analysis")
    
    return {
        "success": True,
        "analysis": analysis,
        "usage": result.get("usage", {}),
    }
