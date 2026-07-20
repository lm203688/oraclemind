"""
蜂群科研平台 — 积分系统
预充积分 + 按任务消耗 + BYOK减半
"""
import json
import os
import time
from datetime import datetime, timedelta
from core.config import (
    CREDIT_PACKS, FREE_DAILY_CREDITS, REGISTER_BONUS,
    CREDIT_COSTS, BYOK_DISCOUNT, MODULE_UNLOCK,
    CREDITS_FILE, USERS_FILE, DATA_DIR
)


def _load_json(filepath, default=None):
    if default is None:
        default = {}
    if os.path.exists(filepath):
        try:
            with open(filepath) as f:
                return json.load(f)
        except:
            pass
    return default


def _save_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_user_credits(user_id):
    """获取用户积分信息"""
    credits = _load_json(CREDITS_FILE)
    return credits.get(user_id, {
        "balance": 0,
        "total_purchased": 0,
        "total_spent": 0,
        "daily_free": FREE_DAILY_CREDITS,
        "daily_reset": datetime.now().strftime("%Y-%m-%d"),
        "history": [],
        "modules": [],
    })


def _save_user_credits(user_id, data):
    credits = _load_json(CREDITS_FILE)
    credits[user_id] = data
    _save_json(CREDITS_FILE, credits)


def register_user(user_id, email=""):
    """注册用户，赠送10000积分"""
    credits = _load_json(CREDITS_FILE)
    if user_id in credits:
        return {"error": "用户已存在"}
    
    user_data = {
        "email": email,
        "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "byok_enabled": False,
        "llm_url": "",
        "llm_key": "",
        "llm_model": "",
    }
    users = _load_json(USERS_FILE)
    users[user_id] = user_data
    _save_json(USERS_FILE, users)
    
    # 注册送10000积分
    credit_data = get_user_credits(user_id)
    credit_data["balance"] = REGISTER_BONUS
    credit_data["total_purchased"] = REGISTER_BONUS
    credit_data["history"].append({
        "type": "register_bonus",
        "amount": REGISTER_BONUS,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "desc": "注册赠送",
    })
    _save_user_credits(user_id, credit_data)
    
    return {"success": True, "bonus": REGISTER_BONUS}


def purchase_credits(user_id, pack_key):
    """购买积分包"""
    pack = CREDIT_PACKS.get(pack_key)
    if not pack:
        return {"error": f"未知积分包: {pack_key}"}
    
    base_credits = pack["credits"]
    bonus = int(base_credits * pack["bonus"])
    total = base_credits + bonus
    
    credit_data = get_user_credits(user_id)
    credit_data["balance"] += total
    credit_data["total_purchased"] += total
    
    # ¥69及以上解锁BYOK
    if pack.get("byok"):
        users = _load_json(USERS_FILE)
        if user_id in users:
            users[user_id]["byok_eligible"] = True
            _save_json(USERS_FILE, users)
    
    credit_data["history"].append({
        "type": "purchase",
        "amount": total,
        "pack": pack_key,
        "price": pack["price"],
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "desc": f"购买{pack['name']}({base_credits}+{bonus}赠送={total}积分)",
        "expires": (datetime.now() + timedelta(days=pack["valid_days"])).strftime("%Y-%m-%d"),
    })
    _save_user_credits(user_id, credit_data)
    
    return {
        "success": True,
        "pack": pack["name"],
        "base": base_credits,
        "bonus": bonus,
        "total": total,
        "balance": credit_data["balance"],
        "byok_eligible": pack.get("byok", False),
    }


def check_daily_free(user_id):
    """检查并重置每日免费积分"""
    credit_data = get_user_credits(user_id)
    today = datetime.now().strftime("%Y-%m-%d")
    
    if credit_data.get("daily_reset") != today:
        credit_data["daily_free"] = FREE_DAILY_CREDITS
        credit_data["daily_reset"] = today
        _save_user_credits(user_id, credit_data)
    
    return credit_data["daily_free"]


def get_effective_balance(user_id):
    """获取有效余额 = 付费积分余额 + 每日免费积分"""
    credit_data = get_user_credits(user_id)
    check_daily_free(user_id)
    return {
        "paid_balance": credit_data["balance"],
        "daily_free": credit_data.get("daily_free", 0),
        "total": credit_data["balance"] + credit_data.get("daily_free", 0),
    }


def spend_credits(user_id, task_type, byok=False, amount=None):
    """
    消耗积分
    
    Args:
        user_id: 用户ID
        task_type: 任务类型(见CREDIT_COSTS)
        byok: 是否BYOK模式(减半消耗)
        amount: 自定义消耗量(优先于CREDIT_COSTS)
    
    Returns:
        {"success": bool, "spent": int, "balance": int, "error": str}
    """
    if amount is not None:
        cost = amount
    else:
        cost = CREDIT_COSTS.get(task_type)
        if cost is None:
            return {"success": False, "error": f"未知任务类型: {task_type}"}
    
    # BYOK减半
    if byok:
        cost = max(1, int(cost * BYOK_DISCOUNT))
    
    credit_data = get_user_credits(user_id)
    check_daily_free(user_id)
    
    # 先扣免费积分，再扣付费积分
    daily_free = credit_data.get("daily_free", 0)
    paid = credit_data["balance"]
    total = daily_free + paid
    
    if total < cost:
        return {
            "success": False,
            "error": f"积分不足(需要{cost}, 余额{total})",
            "balance": total,
        }
    
    # 先扣免费
    free_used = min(daily_free, cost)
    remaining_cost = cost - free_used
    credit_data["daily_free"] = daily_free - free_used
    
    # 再扣付费
    if remaining_cost > 0:
        credit_data["balance"] -= remaining_cost
    
    credit_data["total_spent"] += cost
    credit_data["history"].append({
        "type": "spend",
        "amount": -cost,
        "task": task_type,
        "byok": byok,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "desc": f"消耗{cost}积分({task_type}{' BYOK' if byok else ''})",
    })
    _save_user_credits(user_id, credit_data)
    
    return {
        "success": True,
        "spent": cost,
        "balance": credit_data["balance"] + credit_data["daily_free"],
        "paid_balance": credit_data["balance"],
        "daily_free": credit_data["daily_free"],
    }


def unlock_module(user_id, module_key):
    """解锁模块"""
    module = MODULE_UNLOCK.get(module_key)
    if not module:
        return {"error": f"未知模块: {module_key}"}
    
    cost = module["credits"]
    credit_data = get_user_credits(user_id)
    
    if module_key in credit_data.get("modules", []):
        return {"error": "模块已解锁"}
    
    if credit_data["balance"] < cost:
        return {"error": f"积分不足(需要{cost})"}
    
    credit_data["balance"] -= cost
    credit_data["modules"].append(module_key)
    credit_data["history"].append({
        "type": "unlock",
        "amount": -cost,
        "module": module_key,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "desc": f"解锁{module['name']}({cost}积分)",
    })
    _save_user_credits(user_id, credit_data)
    
    return {"success": True, "module": module_key, "cost": cost, "balance": credit_data["balance"]}


def get_credit_history(user_id, limit=20):
    """获取积分历史"""
    credit_data = get_user_credits(user_id)
    history = credit_data.get("history", [])
    return history[-limit:][::-1]  # 最新的在前


def add_credits(user_id, amount, reason, extra=None):
    """
    增加积分（用于入库奖励、被引用分润等）
    
    Args:
        user_id: 用户ID
        amount: 增加的积分数量
        reason: 原因描述
        extra: 额外信息(dict)
    
    Returns:
        {"success": bool, "balance": int}
    """
    credit_data = get_user_credits(user_id)
    credit_data["balance"] += amount
    credit_data["total_earned"] = credit_data.get("total_earned", 0) + amount
    
    entry = {
        "type": "earn",
        "amount": amount,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "desc": reason,
    }
    if extra:
        entry.update(extra)
    
    credit_data["history"].append(entry)
    _save_user_credits(user_id, credit_data)
    
    return {
        "success": True,
        "balance": credit_data["balance"],
        "paid_balance": credit_data["balance"],
    }
