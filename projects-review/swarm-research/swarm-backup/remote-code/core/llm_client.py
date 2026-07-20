"""
蜂群科研平台 — LLM客户端
支持平台统一Key和BYOK(用户自带Key)
"""
import json
import urllib.request
import os
from core.config import LLM_API_URL, LLM_API_KEY, LLM_MODEL, BYOK_DISCOUNT


def call_llm(messages, user_config=None, temperature=0.7, max_tokens=2000):
    """
    调用LLM，支持BYOK
    
    Args:
        messages: [{"role":"system","content":"..."},{"role":"user","content":"..."}]
        user_config: {"byok_enabled": True, "llm_url": "...", "llm_key": "...", "llm_model": "..."}
        temperature: 温度
        max_tokens: 最大token
    
    Returns:
        {"content": "回复文本", "usage": {"prompt_tokens":N, "completion_tokens":N}, "byok": bool}
    """
    # BYOK模式
    if user_config and user_config.get("byok_enabled"):
        api_url = user_config.get("llm_url", LLM_API_URL)
        api_key = user_config.get("llm_key", "")
        model = user_config.get("llm_model", LLM_MODEL)
        is_byok = True
    else:
        # 平台统一Key
        api_url = LLM_API_URL
        api_key = LLM_API_KEY
        model = LLM_MODEL
        is_byok = False
    
    data = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }).encode()
    
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            result = json.loads(r.read())
        
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        usage = result.get("usage", {"prompt_tokens": 0, "completion_tokens": 0})
        
        return {
            "content": content,
            "usage": usage,
            "byok": is_byok,
            "model": model,
        }
    except Exception as e:
        return {
            "content": f"LLM调用失败: {e}",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0},
            "byok": is_byok,
            "error": str(e),
        }


def call_llm_simple(prompt, system="你是一个科研助手", user_config=None, max_tokens=2000):
    """简化调用：单条prompt"""
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]
    return call_llm(messages, user_config, max_tokens=max_tokens)


def call_llm_with_model(messages, api_url, api_key, model, temperature=0.7, max_tokens=2000):
    """
    用指定模型调用LLM（用于跨模型评审）
    
    Args:
        messages: 消息列表
        api_url: API地址
        api_key: API密钥
        model: 模型名
    Returns:
        {"content": str, "model": str, "error": str|None}
    """
    data = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }).encode()
    
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            result = json.loads(r.read())
        
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        usage = result.get("usage", {"prompt_tokens": 0, "completion_tokens": 0})
        
        return {
            "content": content,
            "model": model,
            "usage": usage,
            "error": None,
        }
    except Exception as e:
        return {
            "content": "",
            "model": model,
            "usage": {"prompt_tokens": 0, "completion_tokens": 0},
            "error": str(e),
        }
