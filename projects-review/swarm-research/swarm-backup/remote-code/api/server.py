"""
蜂群科研平台 — API服务
端口: 8460
"""
import sys
import os
import json
import time
from datetime import datetime

# 确保项目根目录在path中
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, request, jsonify
from flask_cors import CORS

from core.config import (
    PLATFORM_NAME, PLATFORM_VERSION, API_PORT,
    CREDIT_PACKS, CREDIT_COSTS, MODULE_UNLOCK,
    FREE_DAILY_CREDITS, REGISTER_BONUS,
)
from core.credits import (
    register_user, purchase_credits, spend_credits, get_user_credits,
    get_effective_balance, unlock_module, get_credit_history,
)
from core.scheduler import (
    start_research, run_full_pipeline, run_single_bee, get_research_status,
)
from core.knowledge import get_research, get_context_for_bee

app = Flask(__name__)
CORS(app)


@app.route("/api/v1/health")
def health():
    return jsonify({
        "status": "healthy",
        "platform": PLATFORM_NAME,
        "version": PLATFORM_VERSION,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })


@app.route("/api/v1/pricing")
def pricing():
    """积分包定价"""
    return jsonify({
        "credit_packs": {
            k: {
                "name": v["name"],
                "price": v["price"],
                "credits": int(v["credits"] * (1 + v["bonus"])),
                "bonus": f"{int(v['bonus']*100)}%",
                "valid_days": v["valid_days"],
                "byok": v.get("byok", False),
            }
            for k, v in CREDIT_PACKS.items()
        },
        "free": {
            "daily_credits": FREE_DAILY_CREDITS,
            "register_bonus": REGISTER_BONUS,
        },
        "credit_costs": CREDIT_COSTS,
        "modules": MODULE_UNLOCK,
        "notes": [
            "积分有效期365天",
            "充值后不可退款",
            "BYOK(自带模型)积分消耗减半",
            "BYOK需要¥69及以上套餐",
        ],
    })


# ============ 用户管理 ============

@app.route("/api/v1/register", methods=["POST"])
def register():
    """注册用户，送10000积分"""
    data = request.json or {}
    user_id = data.get("user_id", "")
    email = data.get("email", "")
    
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    result = register_user(user_id, email)
    return jsonify(result)


@app.route("/api/v1/credits/<user_id>")
def credits_balance(user_id):
    """查询积分余额"""
    balance = get_effective_balance(user_id)
    credit_data = get_user_credits(user_id)
    return jsonify({
        "user_id": user_id,
        "balance": balance["total"],
        "paid_credits": balance["paid_balance"],
        "free_credits": balance["daily_free"],
        "modules": credit_data.get("modules", []),
        "byok_enabled": credit_data.get("byok_enabled", False),
    })


@app.route("/api/v1/credits/<user_id>/purchase", methods=["POST"])
def credits_purchase(user_id):
    """充值积分"""
    data = request.json or {}
    pack_key = data.get("pack", "")
    
    if pack_key not in CREDIT_PACKS:
        return jsonify({"error": f"未知积分包: {pack_key}"}), 400
    
    pack = CREDIT_PACKS[pack_key]
    result = purchase_credits(user_id, pack_key)
    return jsonify(result)


@app.route("/api/v1/credits/<user_id>/history")
def credits_history(user_id):
    """积分历史"""
    limit = request.args.get("limit", 20, type=int)
    history = get_credit_history(user_id, limit)
    return jsonify({"user_id": user_id, "history": history})


@app.route("/api/v1/credits/<user_id>/byok", methods=["POST"])
def set_byok(user_id):
    """设置BYOK"""
    data = request.json or {}
    pack_key = data.get("pack", "")
    
    if pack_key not in CREDIT_PACKS or not CREDIT_PACKS[pack_key].get("byok"):
        return jsonify({"error": "当前套餐不支持BYOK，需要¥69及以上"}), 403
    
    credit_data = get_user_credits(user_id)
    credit_data["byok_enabled"] = True
    credit_data["byok_config"] = {
        "llm_url": data.get("llm_url", ""),
        "llm_key": data.get("llm_key", ""),
        "llm_model": data.get("llm_model", ""),
    }
    
    from core.credits import _save_user_credits
    _save_user_credits(user_id, credit_data)
    
    return jsonify({"success": True, "message": "BYOK已启用，积分消耗减半"})


@app.route("/api/v1/credits/<user_id>/unlock", methods=["POST"])
def credits_unlock(user_id):
    """解锁模块"""
    data = request.json or {}
    module = data.get("module", "")
    result = unlock_module(user_id, module)
    return jsonify(result)


# ============ 蜂群科研 ============

@app.route("/api/v1/research/start", methods=["POST"])
def research_start():
    """启动研究项目"""
    data = request.json or {}
    user_id = data.get("user_id", "")
    topic = data.get("topic", "")
    description = data.get("description", "")
    
    if not topic:
        return jsonify({"error": "topic required"}), 400
    
    result = start_research(user_id, topic, description)
    return jsonify(result)


@app.route("/api/v1/research/<research_id>/status")
def research_status(research_id):
    """查看研究进度"""
    return jsonify(get_research_status(research_id))


@app.route("/api/v1/research/<research_id>/run", methods=["POST"])
def research_run(research_id):
    """运行蜂群（完整流程或单个蜂）"""
    data = request.json or {}
    user_id = data.get("user_id", "")
    bee_type = data.get("bee_type", "full_pipeline")
    
    # 获取用户配置（含BYOK + 跨模型评审）
    credit_data = get_user_credits(user_id)
    user_config = None
    if credit_data.get("byok_enabled"):
        user_config = credit_data.get("byok_config", {})
        user_config["byok_enabled"] = True
    # 跨模型评审配置
    if credit_data.get("review_models"):
        user_config = user_config or {}
        user_config["review_models"] = credit_data["review_models"]
    
    # 化学蜂模式参数
    extra_kwargs = {}
    if bee_type == "chemistry_bee":
        chem_mode = data.get("chem_mode", data.get("mode", "property"))
        extra_kwargs["mode"] = chem_mode
        # smiles参数
        if data.get("smiles"):
            extra_kwargs["smiles"] = data["smiles"]
    
    if bee_type == "full_pipeline":
        result = run_full_pipeline(research_id, user_id, user_config)
    else:
        result = run_single_bee(research_id, user_id, bee_type, user_config, **extra_kwargs)
    
    return jsonify(result)


@app.route("/api/v1/research/<research_id>/knowledge")
def research_knowledge(research_id):
    """查看共享知识库"""
    research = get_research(research_id)
    if not research:
        return jsonify({"error": "研究项目不存在"}), 404
    
    return jsonify({
        "research_id": research_id,
        "topic": research["topic"],
        "status": research["status"],
        "findings": research["findings"],
        "hypotheses": research["hypotheses"],
        "papers": research["papers"],
        "experiments": research["experiments"],
        "logs": research["logs"][-20:],
    })


# ============ 跨模型评审 ============

@app.route("/api/v1/review/roles")
def review_roles():
    """获取评审角色列表"""
    from core.config import REVIEW_ROLES
    return jsonify({
        "roles": [
            {"id": r["id"], "name": r["name"], "focus": r["focus"]}
            for r in REVIEW_ROLES
        ],
        "default_mode": "role_simulated",
        "byok_mode": "cross_model",
    })


@app.route("/api/v1/credits/<user_id>/review-models", methods=["POST"])
def set_review_models(user_id):
    """配置跨模型评审的多个模型（BYOK）"""
    data = request.json or {}
    models = data.get("models", [])
    
    if not models:
        return jsonify({"error": "models列表不能为空"}), 400
    
    if len(models) < 2:
        return jsonify({"error": "跨模型评审至少需要2个模型"}), 400
    
    # 验证每个模型配置
    for i, m in enumerate(models):
        if not m.get("model"):
            return jsonify({"error": f"第{i+1}个模型缺少model字段"}), 400
        if not m.get("url"):
            return jsonify({"error": f"第{i+1}个模型缺少url字段"}), 400
    
    credit_data = get_user_credits(user_id)
    credit_data["review_models"] = models
    credit_data["review_mode"] = "cross_model"
    
    from core.credits import _save_user_credits
    _save_user_credits(user_id, credit_data)
    
    return jsonify({
        "success": True,
        "message": f"已配置{len(models)}个评审模型",
        "models": [{"name": m.get("name", m["model"]), "model": m["model"]} for m in models],
    })


@app.route("/api/v1/credits/<user_id>/review-models", methods=["GET"])
def get_review_models(user_id):
    """获取当前评审模型配置"""
    credit_data = get_user_credits(user_id)
    models = credit_data.get("review_models", [])
    mode = credit_data.get("review_mode", "role_simulated")
    
    return jsonify({
        "user_id": user_id,
        "mode": mode,
        "models": [{"name": m.get("name", m["model"]), "model": m["model"], "url": m["url"]} for m in models],
        "note": "跨模型评审需要BYOK权限" if mode == "cross_model" else "当前为角色模拟模式",
    })


# ============ Skill列表 + 验证蜂 ============

@app.route("/api/v1/skills")
def list_skills():
    """获取所有skill列表"""
    from core.skill_loader import list_skills_summary
    return jsonify({"skills": list_skills_summary()})


@app.route("/api/v1/research/<research_id>/verify", methods=["POST"])
def research_verify(research_id):
    """对研究进行验证蜂验证"""
    data = request.json or {}
    user_id = data.get("user_id", "")
    
    # 获取用户配置
    credit_data = get_user_credits(user_id)
    user_config = None
    if credit_data.get("byok_enabled"):
        user_config = credit_data.get("byok_config", {})
        user_config["byok_enabled"] = True
    
    result = run_single_bee(research_id, user_id, "verification_bee", user_config)
    return jsonify(result)


# ============ 验证知识库 ============

@app.route("/api/v1/kb/search")
def kb_search():
    """搜索知识库"""
    from core.verified_kb import search_knowledge
    query = request.args.get("q", "")
    claim_type = request.args.get("type", "")
    smiles = request.args.get("smiles", "")
    limit = int(request.args.get("limit", 20))
    
    results = search_knowledge(query=query, claim_type=claim_type, smiles=smiles, limit=limit)
    return jsonify({
        "results": results,
        "count": len(results),
        "cite_cost": CREDIT_COSTS["knowledge_cite"],
        "self_verify_cost": CREDIT_COSTS["verification_bee"],
    })


@app.route("/api/v1/kb/<kb_id>")
def kb_detail(kb_id):
    """查看知识条目详情"""
    from core.verified_kb import get_knowledge
    item = get_knowledge(kb_id)
    if not item:
        return jsonify({"error": "条目不存在"}), 404
    return jsonify(item)


@app.route("/api/v1/kb/deposit", methods=["POST"])
def kb_deposit():
    """将验证结果入库"""
    from core.verified_kb import deposit_knowledge
    from core.credits import add_credits
    
    data = request.json or {}
    user_id = data.get("user_id", "")
    research_id = data.get("research_id", "")
    claim_indices = data.get("claim_indices", [])  # 用户选择入库的声明索引
    
    if not research_id:
        return jsonify({"error": "缺少research_id"}), 400
    
    # 从研究的findings中获取验证蜂结果
    research = get_research(research_id)
    if not research:
        return jsonify({"error": "研究不存在"}), 404
    
    # 找到验证蜂的结果
    verify_result = None
    for f in reversed(research.get("findings", [])):
        if f.get("bee") == "verification_bee" and f.get("type") == "verification_result":
            # 这个只是摘要，需要从run_single_bee重新获取
            break
    
    # 重新跑验证蜂获取完整结果（或从缓存读）
    # 实际生产中应该缓存验证结果，这里简化处理：从findings中的claims里取
    # 更好的做法是验证蜂把完整结果存到findings里
    # 这里假设验证蜂结果存在research的experiments里
    verify_claims = research.get("verification_claims", [])
    if not verify_claims:
        # 尝试从findings中恢复
        for f in research.get("findings", []):
            if f.get("bee") == "verification_bee" and f.get("type") == "verification_claims":
                verify_claims = f.get("content", [])
                if isinstance(verify_claims, str):
                    try:
                        verify_claims = json.loads(verify_claims)
                    except:
                        verify_claims = []
                break
    
    if not verify_claims:
        return jsonify({"error": "未找到验证结果，请先运行验证蜂"}), 400
    
    depositable = []
    for r in verify_claims:
        if r.get("status") != "verified":
            continue
        v = r.get("verification", {})
        depositable.append({
            "claim": r["claim"],
            "claim_type": r["claim_type"],
            "smiles": r.get("smiles", ""),
            "expected_value": r.get("expected_value"),
            "actual_value": v.get("actual_value"),
            "verification_engine": v.get("engine", ""),
            "trust_label": r["trust_label"],
            "trust_score": research.get("trust_score", 0),
        })
    
    if not depositable:
        return jsonify({"error": "没有可入库的验证结果（需要计算验证通过）"}), 400
    
    # 用户选择特定声明，或全部入库
    if claim_indices:
        to_deposit = [depositable[i] for i in claim_indices if i < len(depositable)]
    else:
        to_deposit = depositable
    
    # 入库
    deposited = []
    total_reward = 0
    for item in to_deposit:
        kb_id, kb_item = deposit_knowledge(
            user_id=user_id,
            research_id=research_id,
            claim=item["claim"],
            claim_type=item["claim_type"],
            smiles=item.get("smiles", ""),
            expected_value=item.get("expected_value"),
            actual_value=item.get("actual_value"),
            verification_engine=item.get("verification_engine", ""),
            trust_label=item.get("trust_label", ""),
            trust_score=item.get("trust_score", 0),
        )
        if kb_id:
            deposited.append({"kb_id": kb_id, "claim": item["claim"][:80]})
    
    # 发放入库奖励积分
    if deposited:
        reward = CREDIT_COSTS["knowledge_deposit"] * len(deposited)
        add_credits(user_id, reward, f"验证结果入库奖励({len(deposited)}条)",
                    extra={"kb_ids": [d["kb_id"] for d in deposited]})
        total_reward = reward
    
    return jsonify({
        "success": True,
        "deposited_count": len(deposited),
        "items": deposited,
        "reward_credits": total_reward,
        "message": f"成功入库{len(deposited)}条验证结果，获得{total_reward}积分",
    })


@app.route("/api/v1/kb/<kb_id>/cite", methods=["POST"])
def kb_cite(kb_id):
    """引用知识库条目"""
    from core.verified_kb import cite_knowledge
    
    data = request.json or {}
    user_id = data.get("user_id", "")
    research_id = data.get("research_id", "")
    
    result = cite_knowledge(kb_id, user_id, research_id)
    
    if not result.get("success"):
        status = 402 if "积分" in result.get("error", "") else 400
        return jsonify({"error": result["error"]}), status
    
    return jsonify({
        "success": True,
        "kb_id": kb_id,
        "cite_cost": result["spent"],
        "author_reward": result["original_author_earned"],
        "platform_reward": result["platform_earned"],
        "balance": result["balance"],
        "item": result["item"],
        "message": f"引用成功，消耗{result['spent']}积分（原作者获得{result['original_author_earned']}积分）",
    })


@app.route("/api/v1/kb/stats")
def kb_stats():
    """知识库统计"""
    from core.verified_kb import get_kb_stats
    return jsonify(get_kb_stats())


@app.route("/api/v1/kb/user/<user_id>")
def kb_user_items(user_id):
    """用户入库的条目"""
    from core.verified_kb import get_user_deposits
    items = get_user_deposits(user_id)
    return jsonify({
        "user_id": user_id,
        "items": items,
        "total": len(items),
        "total_citations": sum(i.get("citations", 0) for i in items),
    })


# ============ AI跨领域发现 ============

@app.route("/api/v1/kb/<kb_id>/cross-domain", methods=["POST"])
def kb_cross_domain(kb_id):
    """AI跨领域发现——分析验证结果在哪些跨领域有价值"""
    from core.cross_domain import analyze_cross_domain
    from core.credits import spend_credits
    
    data = request.json or {}
    user_id = data.get("user_id", "")
    
    # 扣积分
    cost = CREDIT_COSTS["cross_domain_advice"]
    spend_result = spend_credits(user_id, "cross_domain_advice", amount=cost)
    if not spend_result.get("success"):
        return jsonify({"error": spend_result.get("error", "积分不足")}), 402
    
    # 执行分析
    result = analyze_cross_domain(kb_id)
    
    if not result.get("success"):
        # 失败退还积分
        from core.credits import add_credits
        add_credits(user_id, cost, "跨领域分析失败退还")
        return jsonify({"error": result.get("error", "分析失败")}), 500
    
    result["cost"] = cost
    result["balance"] = spend_result.get("balance")
    
    return jsonify(result)




# ============ 前端页面路由 ============
from flask import send_from_directory

@app.route("/swarm")
def swarm_page():
    """蜂群科研工作台前端"""
    return send_from_directory(
        os.path.join(PROJECT_ROOT, "templates"),
        "swarm.html"
    )

@app.route("/")
def index():
    """根路径重定向到蜂群工作台"""
    return send_from_directory(
        os.path.join(PROJECT_ROOT, "templates"),
        "swarm.html"
    )


if __name__ == "__main__":
    print(f"🤖 {PLATFORM_NAME} v{PLATFORM_VERSION}")
    print(f"   端口: {API_PORT}")
    print(f"   LLM: agnes (免费)")
    app.run(host="0.0.0.0", port=API_PORT, threaded=True)
