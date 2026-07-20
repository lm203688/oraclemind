"""
ML实验蜂 — 在Docker沙箱中执行ML实验
第一版：模拟执行(不真实跑代码)，用LLM生成实验代码+预期结果
后续：接入真实Docker沙箱
"""
import os
import json
import subprocess
import tempfile
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, add_experiment, get_context_for_bee


def run(research_id, user_config=None, use_gpu=False, **kwargs):
    """
    ML实验蜂执行
    
    Args:
        use_gpu: 是否使用GPU
        **kwargs: experiment_type, dataset, model, etc.
    """
    context = get_context_for_bee(research_id, "ml_experiment_bee")
    
    experiment_type = kwargs.get("experiment_type", "classification")
    dataset = kwargs.get("dataset", "auto")
    model = kwargs.get("model", "auto")
    
    # Step 1: 用LLM生成实验代码
    prompt = f"""你是ML实验专家。基于以下研究上下文，设计一个ML实验。

研究上下文:
{context}

实验类型: {experiment_type}
数据集: {dataset}
模型: {model}

请生成：
1. 实验设计(假设、变量、评估指标)
2. Python代码(使用PyTorch或scikit-learn)
3. 预期结果和评估标准

输出格式：

## 实验设计
假设: [假设]
自变量: [变量]
因变量: [变量]
评估指标: [指标]

## 代码
```python
# 完整可运行代码
import torch
...
```

## 预期结果
- 预期准确率: XX%
- 预期训练时间: XX分钟
- 关键指标: [描述]

## 实验结论预测
[基于假设的预期结论]"""

    result = call_llm_simple(prompt, system="你是ML实验专家，擅长设计严谨的实验",
                             user_config=user_config, max_tokens=3000)
    
    if result.get("error"):
        return {"success": False, "error": result["error"]}
    
    content = result["content"]
    
    # Step 2: 尝试提取并执行代码(安全沙箱)
    code = _extract_code(content)
    exec_result = None
    if code:
        exec_result = _safe_execute(code)
    
    # Step 3: 记录实验
    experiment_desc = f"ML实验({experiment_type}): {model} on {dataset}"
    result_summary = exec_result["output"][:500] if exec_result else content[:500]
    
    add_experiment(research_id, "ml_experiment_bee", experiment_desc, result_summary)
    add_finding(research_id, "ml_experiment_bee", 
                f"完成ML实验: {experiment_type}，{'执行成功' if exec_result and exec_result['success'] else '代码已生成'}", 
                "discovery")
    
    return {
        "success": True,
        "experiment_type": experiment_type,
        "design": content,
        "code_executed": exec_result is not None and exec_result["success"],
        "execution_output": exec_result["output"][:500] if exec_result else None,
        "usage": result.get("usage", {}),
    }


def _extract_code(text):
    """从LLM输出中提取Python代码"""
    if "```python" in text:
        start = text.index("```python") + 9
        end = text.index("```", start)
        return text[start:end].strip()
    elif "```" in text:
        start = text.index("```") + 3
        end = text.index("```", start)
        return text[start:end].strip()
    return None


def _safe_execute(code):
    """
    安全执行Python代码(限制环境)
    第一版：简单执行，后续加Docker隔离
    """
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(code)
            f.flush()
            script_path = f.name
        
        # 执行(超时30秒)
        proc = subprocess.run(
            ["python3", script_path],
            capture_output=True, text=True, timeout=30,
            env={"PATH": "/home/z/.venv/bin:/usr/bin:/bin", 
                 "HOME": "/tmp",
                 "PYTHONPATH": "/home/z/.venv/lib/python3.12/site-packages"}
        )
        
        os.unlink(script_path)
        
        return {
            "success": proc.returncode == 0,
            "output": proc.stdout[:2000] if proc.returncode == 0 else proc.stderr[:2000],
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "output": "执行超时(30秒)"}
    except Exception as e:
        return {"success": False, "output": str(e)}
