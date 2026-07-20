"""
假设蜂 — 基于文献综述生成研究假设
"""
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, add_hypothesis, get_context_for_bee, get_research
import re


def run(research_id, user_config=None, num_hypotheses=3):
    """
    假设蜂执行
    
    Returns:
        {"success": bool, "hypotheses": list}
    """
    context = get_context_for_bee(research_id, "hypothesis_bee")
    research = get_research(research_id)
    topic = research.get("topic", "")
    
    prompt = f"""你是一个科研假设生成专家。基于以下研究上下文，生成{num_hypotheses}个创新且可验证的研究假设。

研究主题: {topic}

研究上下文:
{context}

要求:
1. 每个假设必须可验证（可设计实验测试）
2. 假设要有创新性（不是已知结论）
3. 假设要有科学依据（基于已有发现）
4. 标注置信度(0.1-0.9)

输出格式（严格遵循）:
假设1: [假设内容]
置信度: 0.X
依据: [简述依据]
验证方法: [如何验证]

假设2: ...
"""

    result = call_llm_simple(prompt, system="你是科研假设生成专家，善于发现研究空白", user_config=user_config, max_tokens=1500)
    
    if result.get("error"):
        return {"success": False, "error": result["error"]}
    
    content = result["content"]
    
    # 解析假设
    hypotheses = []
    blocks = re.split(r'假设\d+\s*[:：]', content)
    for block in blocks[1:]:  # 跳过第一个空块
        lines = block.strip().split('\n')
        hyp_content = lines[0].strip()
        
        confidence = 0.5
        basis = ""
        method = ""
        
        for line in lines[1:]:
            if '置信度' in line:
                m = re.search(r'0?\.\d+', line)
                if m:
                    confidence = float(m.group())
            elif '依据' in line:
                basis = line.split(':', 1)[-1].strip() if ':' in line else line.split('：', 1)[-1].strip()
            elif '验证' in line:
                method = line.split(':', 1)[-1].strip() if ':' in line else line.split('：', 1)[-1].strip()
        
        hyp_id = add_hypothesis(research_id, hyp_content, confidence)
        hypotheses.append({
            "id": hyp_id,
            "content": hyp_content,
            "confidence": confidence,
            "basis": basis,
            "method": method,
        })
        
        add_finding(research_id, "hypothesis_bee", f"提出假设: {hyp_content[:100]} (置信度{confidence})", "discovery")
    
    return {
        "success": True,
        "hypotheses": hypotheses,
        "usage": result.get("usage", {}),
    }
