"""
蜂群调度器 — 协调蜂群Agent协作
负责：任务分配、进度管理、蜂间通信、Co-Pilot模式
"""
import time
from datetime import datetime
from core.knowledge import (
    create_research, update_research_status, add_finding, get_research
)
from core.credits import spend_credits, get_effective_balance
from core.config import CREDIT_COSTS


def start_research(user_id, topic, description="", user_config=None):
    """
    启动一个研究项目
    
    Returns:
        {"research_id": str, "status": str}
    """
    research_id = create_research(user_id, topic, description)
    update_research_status(research_id, "running")
    add_finding(research_id, "coordinator_bee", f"研究项目启动: {topic}")
    
    return {"research_id": research_id, "status": "running"}


# ============================================================
# Co-Pilot模式：gate定义
# ============================================================
PIPELINE_GATES = {
    "full_auto": {
        "literature_bee": {"step": "文献综述", "require_approval": False},
        "hypothesis_bee": {"step": "假设生成", "require_approval": False},
        "writing_bee": {"step": "论文撰写", "require_approval": False},
    },
    "gate_only": {
        "literature_bee": {"step": "文献综述", "require_approval": True},
        "hypothesis_bee": {"step": "假设生成", "require_approval": True},
        "writing_bee": {"step": "论文撰写", "require_approval": True},
    },
    "co_pilot": {
        "literature_bee": {"step": "文献综述", "require_approval": True, "interactive": True},
        "hypothesis_bee": {"step": "假设生成", "require_approval": True, "interactive": True},
        "writing_bee": {"step": "论文撰写", "require_approval": True, "interactive": True},
    },
}


def run_full_pipeline(research_id, user_id, user_config=None, mode="full_auto"):
    """
    运行完整蜂群流程：文献→假设→写作
    
    Args:
        mode: "full_auto"(全自动) / "gate_only"(关键节点批准) / "co_pilot"(交互式协作)
    
    消耗：80积分（完整流程）
    """
    # 检查积分
    balance = get_effective_balance(user_id)
    pipeline_cost = CREDIT_COSTS.get("full_research", 80)
    if balance["total"] < pipeline_cost:
        return {
            "success": False,
            "error": f"积分不足(需要{pipeline_cost}, 余额{balance['total']})",
        }
    
    # 消耗积分
    byok = user_config and user_config.get("byok_enabled")
    spend_result = spend_credits(user_id, "full_research", byok=byok)
    if not spend_result["success"]:
        return spend_result
    
    gates = PIPELINE_GATES.get(mode, PIPELINE_GATES["full_auto"])
    results = {"research_id": research_id, "mode": mode, "steps": [], "pending_gate": None}
    
    # Step 1: 文献蜂
    add_finding(research_id, "coordinator_bee", f"▶ 启动文献蜂 [模式: {mode}]")
    try:
        from agents.literature_bee import run as lit_run
        lit_result = lit_run(research_id, user_config=user_config)
        results["steps"].append({
            "bee": "literature_bee",
            "step": gates["literature_bee"]["step"],
            "success": lit_result.get("success", False),
            "papers": len(lit_result.get("papers", [])),
            "verified_count": lit_result.get("verified_count", 0),
            "summary": lit_result.get("summary", "")[:200],
        })
        if not lit_result.get("success"):
            results["steps"].append({"bee": "coordinator", "error": "文献蜂失败，继续下一步"})
    except Exception as e:
        results["steps"].append({"bee": "literature_bee", "error": str(e)})
    
    # gate_only/co_pilot: 文献蜂完成后暂停等待批准
    if gates["literature_bee"]["require_approval"] and mode != "full_auto":
        update_research_status(research_id, "awaiting_approval")
        add_finding(research_id, "coordinator_bee",
                    "⏸ 文献综述完成，等待批准后继续假设生成", "info")
        results["pending_gate"] = {
            "step": "hypothesis_bee",
            "label": "假设生成",
            "message": "文献综述已完成，是否继续生成研究假设？",
            "review_data": {
                "papers": lit_result.get("papers", []) if lit_result else [],
                "summary": lit_result.get("summary", "") if lit_result else "",
            },
        }
        results["status"] = "awaiting_approval"
        results["credits_spent"] = spend_result["spent"]
        results["balance"] = spend_result["balance"]
        return results
    
    # Step 2: 假设蜂
    add_finding(research_id, "coordinator_bee", "▶ 启动假设蜂")
    try:
        from agents.hypothesis_bee import run as hyp_run
        hyp_result = hyp_run(research_id, user_config=user_config)
        results["steps"].append({
            "bee": "hypothesis_bee",
            "step": gates["hypothesis_bee"]["step"],
            "success": hyp_result.get("success", False),
            "hypotheses": hyp_result.get("hypotheses", []),
        })
    except Exception as e:
        results["steps"].append({"bee": "hypothesis_bee", "error": str(e)})
    
    # gate_only/co_pilot: 假设蜂完成后暂停
    if gates["hypothesis_bee"]["require_approval"] and mode != "full_auto":
        update_research_status(research_id, "awaiting_approval")
        add_finding(research_id, "coordinator_bee",
                    "⏸ 假设生成完成，等待批准后继续论文撰写", "info")
        results["pending_gate"] = {
            "step": "writing_bee",
            "label": "论文撰写",
            "message": "研究假设已生成，是否继续撰写论文？",
            "review_data": {
                "hypotheses": hyp_result.get("hypotheses", []) if hyp_result else [],
            },
        }
        results["status"] = "awaiting_approval"
        results["credits_spent"] = spend_result["spent"]
        results["balance"] = spend_result["balance"]
        return results
    
    # Step 3: 写作蜂
    add_finding(research_id, "coordinator_bee", "▶ 启动写作蜂")
    try:
        from agents.writing_bee import run as write_run
        write_result = write_run(research_id, user_config=user_config)
        results["steps"].append({
            "bee": "writing_bee",
            "step": gates["writing_bee"]["step"],
            "success": write_result.get("success", False),
            "word_count": write_result.get("word_count", 0),
        })
        results["paper"] = write_result.get("paper", "")
    except Exception as e:
        results["steps"].append({"bee": "writing_bee", "error": str(e)})
    
    # 完成
    update_research_status(research_id, "completed")
    add_finding(research_id, "coordinator_bee", "✅ 蜂群流程完成")
    results["status"] = "completed"
    results["credits_spent"] = spend_result["spent"]
    results["balance"] = spend_result["balance"]
    
    return results


def approve_gate(research_id, user_id, approved=True, feedback=""):
    """
    Co-Pilot模式：批准/拒绝当前gate，继续执行下一步
    
    Args:
        research_id: 研究项目ID
        user_id: 用户ID
        approved: True=批准继续, False=拒绝(终止流程)
        feedback: 用户反馈（co_pilot模式下传给下一步蜂）
    
    Returns:
        继续执行的结果
    """
    research = get_research(research_id)
    if not research:
        return {"error": "研究项目不存在"}
    
    if research.get("status") != "awaiting_approval":
        return {"error": f"当前状态非等待批准({research.get('status')})"}
    
    if not approved:
        update_research_status(research_id, "cancelled")
        add_finding(research_id, "coordinator_bee", "❌ 用户拒绝批准，流程终止", "warning")
        return {"success": False, "status": "cancelled", "message": "流程已终止"}
    
    update_research_status(research_id, "running")
    add_finding(research_id, "coordinator_bee", "✅ 用户批准，继续执行", "info")
    
    # 继续执行下一步(需要知道当前在哪个gate)
    # 从findings里找到最近的pending_gate信息
    # 简化实现：直接继续full_pipeline的剩余步骤
    # 由于stateless设计，我们根据已有步骤判断下一步
    
    steps_done = [f for f in research["findings"] if "▶ 启动" in f.get("content", "")]
    has_literature = any("文献蜂" in s["content"] for s in steps_done)
    has_hypothesis = any("假设蜂" in s["content"] for s in steps_done)
    
    user_config = {"feedback": feedback} if feedback else None
    
    if has_literature and not has_hypothesis:
        # 继续假设蜂→写作蜂
        return _continue_from_hypothesis(research_id, user_id, user_config)
    elif has_literature and has_hypothesis:
        # 继续写作蜂
        return _continue_from_writing(research_id, user_id, user_config)
    else:
        return {"error": "无法确定当前步骤"}


def _continue_from_hypothesis(research_id, user_id, user_config=None):
    """从假设蜂继续"""
    add_finding(research_id, "coordinator_bee", "▶ 启动假设蜂(继续)")
    results = {"research_id": research_id, "steps": [], "continued": True}
    
    try:
        from agents.hypothesis_bee import run as hyp_run
        hyp_result = hyp_run(research_id, user_config=user_config)
        results["steps"].append({
            "bee": "hypothesis_bee",
            "step": "假设生成",
            "success": hyp_result.get("success", False),
            "hypotheses": hyp_result.get("hypotheses", []),
        })
        results["hypotheses"] = hyp_result.get("hypotheses", [])
    except Exception as e:
        results["steps"].append({"bee": "hypothesis_bee", "error": str(e)})
    
    # 继续写作蜂
    return _continue_from_writing(research_id, user_id, user_config, prev_results=results)


def _continue_from_writing(research_id, user_id, user_config=None, prev_results=None):
    """从写作蜂继续"""
    add_finding(research_id, "coordinator_bee", "▶ 启动写作蜂(继续)")
    results = prev_results or {"research_id": research_id, "steps": [], "continued": True}
    
    try:
        from agents.writing_bee import run as write_run
        write_result = write_run(research_id, user_config=user_config)
        results["steps"].append({
            "bee": "writing_bee",
            "step": "论文撰写",
            "success": write_result.get("success", False),
            "word_count": write_result.get("word_count", 0),
        })
        results["paper"] = write_result.get("paper", "")
    except Exception as e:
        results["steps"].append({"bee": "writing_bee", "error": str(e)})
    
    update_research_status(research_id, "completed")
    add_finding(research_id, "coordinator_bee", "✅ 蜂群流程完成")
    results["status"] = "completed"
    return results


def run_single_bee(research_id, user_id, bee_type, user_config=None, **kwargs):
    """
    运行单个蜂（通过skill_loader动态加载）
    
    Args:
        bee_type: skill名称(literature_bee/chemistry_bee等)
    """
    from core.skill_loader import get_skill
    from core.config import CREDIT_COSTS
    
    # 从skill定义获取信息
    skill = get_skill(bee_type)
    if not skill:
        return {"error": f"未知skill: {bee_type}"}
    
    # 积分消耗：skill定义优先，否则从CREDIT_COSTS取
    cost = skill.get('cost_credits') or CREDIT_COSTS.get(bee_type)
    if cost is None:
        return {"error": f"无法确定积分消耗: {bee_type}"}
    
    # 化学蜂特殊：根据mode调整积分
    if bee_type == "chemistry_bee":
        mode = kwargs.get("mode", "property")
        mode_costs = {"property": 1000, "admet": 1500, "fast": 1500, "retro": 2000, "deep": 3000}
        cost = mode_costs.get(mode, 1000)
    
    # 文献蜂深度调研模式
    if bee_type == "literature_bee" and kwargs.get("mode") == "deep":
        cost = CREDIT_COSTS.get("literature_deep", 1500)
    
    # 文献蜂精读模式
    if bee_type == "literature_bee" and kwargs.get("mode") == "precise":
        cost = CREDIT_COSTS.get("literature_precise", 800)
    
    # 检查+消耗积分
    byok = user_config and user_config.get("byok_enabled")
    spend_result = spend_credits(user_id, bee_type, byok=byok, amount=cost)
    if not spend_result["success"]:
        return spend_result
    
    # 动态加载模块
    module_path = skill.get('module')
    if not module_path:
        return {"error": f"skill未定义module: {bee_type}"}
    
    try:
        import importlib
        module = importlib.import_module(module_path)
        result = module.run(research_id, user_config=user_config, **kwargs)
        result["credits_spent"] = spend_result["spent"]
        result["balance"] = spend_result["balance"]
        result["skill"] = bee_type
        return result
    except Exception as e:
        return {"success": False, "error": str(e), "credits_spent": spend_result["spent"]}


def get_research_status(research_id):
    """获取研究进度"""
    research = get_research(research_id)
    if not research:
        return {"error": "研究项目不存在"}
    
    return {
        "research_id": research_id,
        "topic": research["topic"],
        "status": research["status"],
        "created": research["created"],
        "findings_count": len(research["findings"]),
        "papers_count": len(research["papers"]),
        "hypotheses_count": len(research["hypotheses"]),
        "experiments_count": len(research["experiments"]),
        "recent_logs": research["logs"][-10:],
        "findings": research["findings"][-5:],
    }
