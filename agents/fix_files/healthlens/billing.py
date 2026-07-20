"""
HealthLens 付费模块 — 商业化层
免费：基础健康档案、1次OCR/天
付费：AI分析报告¥9/次、Withings同步¥19/月、无限OCR¥29/月
"""

import os, json, time, hashlib, sqlite3
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Optional

# 定价方案
PLANS = {
    "free": {
        "name": "免费版",
        "price": 0,
        "features": ["基础健康档案", "1次OCR/天", "基础数据展示", "FHIR导出"],
        "limits": {"ocr_daily": 1, "ai_analysis": 0, "withings_sync": False}
    },
    "pay_per_analysis": {
        "name": "单次AI分析",
        "price": 9,
        "features": ["1次深度AI分析报告", "异常指标解读", "健康趋势预测", "建议方案"],
        "limits": {"ocr_daily": 5, "ai_analysis": 1, "withings_sync": False}
    },
    "monthly_pro": {
        "name": "月度Pro",
        "price": 19,
        "period": "every-month",
        "features": ["无限AI分析", "Withings数据同步", "Apple Health自动同步", "每日健康简报", "异常预警", "5次OCR/天"],
        "limits": {"ocr_daily": 5, "ai_analysis": -1, "withings_sync": True}  # -1=无限
    },
    "monthly_unlimited": {
        "name": "不限量版",
        "price": 29,
        "period": "every-month",
        "features": ["所有Pro功能", "无限OCR", "家用药相互作用检查", "个性化健康计划", "优先客服"],
        "limits": {"ocr_daily": -1, "ai_analysis": -1, "withings_sync": True}
    },
}

# 简单内存存储（后续换SQLite）
user_credits = {}  # user_id -> { plan, credits, expires, ocr_used_today, ocr_reset_date }
api_keys = {}      # key -> { user_id, plan, credits }


def get_or_create_user_usage(user_id: str) -> Dict:
    """获取或创建用户使用记录"""
    if user_id not in user_credits:
        user_credits[user_id] = {
            "plan": "free",
            "credits": {"ai_analysis": 0, "ocr_daily": 0},
            "ocr_reset_date": datetime.now().strftime("%Y-%m-%d"),
            "expires": None,
        }
    usage = user_credits[user_id]
    # 每日重置OCR
    today = datetime.now().strftime("%Y-%m-%d")
    if usage["ocr_reset_date"] != today:
        usage["credits"]["ocr_daily"] = 0
        usage["ocr_reset_date"] = today
    return usage


def check_feature_access(user_id: str, feature: str) -> Dict:
    """检查用户是否有权限使用某功能"""
    usage = get_or_create_user_usage(user_id)
    plan = PLANS.get(usage["plan"], PLANS["free"])
    limits = plan["limits"]

    # 检查订阅是否过期
    if usage["expires"] and datetime.now() > datetime.fromisoformat(usage["expires"]):
        usage["plan"] = "free"
        plan = PLANS["free"]
        limits = plan["limits"]

    if feature == "ocr":
        if limits["ocr_daily"] == -1:
            return {"allowed": True, "remaining": "unlimited"}
        used = usage["credits"]["ocr_daily"]
        if used >= limits["ocr_daily"]:
            return {"allowed": False, "error": f"今日OCR次数已用完({limits['ocr_daily']}次/天)", "upgrade_url": "/pricing"}
        usage["credits"]["ocr_daily"] += 1
        return {"allowed": True, "remaining": limits["ocr_daily"] - usage["credits"]["ocr_daily"]}

    elif feature == "ai_analysis":
        if limits["ai_analysis"] == -1:
            return {"allowed": True, "remaining": "unlimited"}
        if usage["credits"]["ai_analysis"] <= 0:
            return {"allowed": False, "error": "AI分析次数已用完", "upgrade_url": "/pricing", "price": 9}
        usage["credits"]["ai_analysis"] -= 1
        return {"allowed": True, "remaining": usage["credits"]["ai_analysis"]}

    elif feature == "withings_sync":
        if not limits["withings_sync"]:
            return {"allowed": False, "error": "Withings同步需订阅Pro版", "upgrade_url": "/pricing"}
        return {"allowed": True}

    return {"allowed": False, "error": "Unknown feature"}


def require_feature(feature: str):
    """装饰器：检查功能权限"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user_id = kwargs.get("user_id", "anonymous")
            access = check_feature_access(user_id, feature)
            if not access["allowed"]:
                return {"error": access["error"], "upgrade_url": access.get("upgrade_url", "/pricing")}, 402
            return f(*args, **kwargs)
        return wrapped
    return decorator


def create_api_key(user_id: str, plan: str) -> Dict:
    """创建API Key（用户购买后）"""
    key = "hlk_" + hashlib.sha256(f"{user_id}{time.time()}{plan}".encode()).hexdigest()[:24]
    plan_data = PLANS.get(plan, PLANS["free"])
    expires = None
    if plan_data.get("period") == "every-month":
        expires = (datetime.now() + timedelta(days=30)).isoformat()

    api_keys[key] = {
        "user_id": user_id,
        "plan": plan,
        "credits": {"ai_analysis": plan_data["limits"]["ai_analysis"] if plan_data["limits"]["ai_analysis"] > 0 else 0},
        "expires": expires,
        "created_at": datetime.now().isoformat()
    }

    # 更新用户usage
    user_credits[user_id] = {
        "plan": plan,
        "credits": {"ai_analysis": plan_data["limits"]["ai_analysis"] if plan_data["limits"]["ai_analysis"] > 0 else 0, "ocr_daily": 0},
        "ocr_reset_date": datetime.now().strftime("%Y-%m-%d"),
        "expires": expires,
    }

    return {"key": key, "plan": plan, "plan_name": plan_data["name"], "price": plan_data["price"], "expires": expires}


def get_pricing_page() -> str:
    """返回定价页面HTML"""
    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HealthLens 定价 — 健康数据分析</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,sans-serif; background:#f0f4f8; color:#1e293b; padding:40px 20px; }
.container { max-width:900px; margin:0 auto; }
h1 { text-align:center; font-size:32px; margin-bottom:8px; }
.subtitle { text-align:center; color:#64748b; margin-bottom:40px; }
.plans { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; position:relative; }
.card.featured { border:2px solid #057a55; }
.badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#057a55; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; }
.plan-name { font-size:18px; font-weight:600; margin-bottom:8px; }
.plan-price { font-size:28px; font-weight:700; margin-bottom:4px; }
.plan-price small { font-size:13px; font-weight:400; color:#64748b; }
.features { list-style:none; margin:16px 0; }
.features li { padding:6px 0; font-size:13px; border-bottom:1px solid #f1f5f9; }
.features li:before { content:"✓ "; color:#057a55; }
.btn { display:block; text-align:center; padding:10px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; }
.btn-primary { background:#057a55; color:#fff; }
.btn-secondary { background:#e2e8f0; color:#1e293b; }
@media(max-width:768px) { .plans { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="container">
<h1>HealthLens 定价</h1>
<p class="subtitle">从免费开始，按需升级</p>
<div class="plans">
  <div class="card">
    <div class="plan-name">免费版</div>
    <div class="plan-price">¥0<small>/永久</small></div>
    <ul class="features">
      <li>基础健康档案</li>
      <li>1次OCR/天</li>
      <li>基础数据展示</li>
      <li>FHIR标准导出</li>
    </ul>
    <a href="/register" class="btn btn-secondary">免费注册</a>
  </div>
  <div class="card featured">
    <div class="badge">热门</div>
    <div class="plan-name">单次AI分析</div>
    <div class="plan-price">¥9<small>/次</small></div>
    <ul class="features">
      <li>深度AI分析报告</li>
      <li>异常指标解读</li>
      <li>健康趋势预测</li>
      <li>个性化建议</li>
      <li>5次OCR/天</li>
    </ul>
    <a href="/api/purchase?plan=pay_per_analysis" class="btn btn-primary">购买分析</a>
  </div>
  <div class="card">
    <div class="plan-name">月度Pro</div>
    <div class="plan-price">¥19<small>/月</small></div>
    <ul class="features">
      <li>无限AI分析</li>
      <li>Withings数据同步</li>
      <li>Apple Health自动同步</li>
      <li>每日健康简报</li>
      <li>异常预警</li>
    </ul>
    <a href="/api/purchase?plan=monthly_pro" class="btn btn-primary">订阅Pro</a>
  </div>
  <div class="card">
    <div class="plan-name">不限量</div>
    <div class="plan-price">¥29<small>/月</small></div>
    <ul class="features">
      <li>所有Pro功能</li>
      <li>无限OCR</li>
      <li>药物相互作用检查</li>
      <li>个性化健康计划</li>
      <li>优先客服</li>
    </ul>
    <a href="/api/purchase?plan=monthly_unlimited" class="btn btn-primary">订阅不限量</a>
  </div>
</div>
</div>
</body>
</html>"""
