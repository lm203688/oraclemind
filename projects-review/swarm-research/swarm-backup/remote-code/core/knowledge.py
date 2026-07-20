"""
蜂群科研平台 — 共享知识库
蜂群Agent之间共享信息的核心数据结构
"""
import json
import os
import time
from datetime import datetime
from core.config import KNOWLEDGE_FILE


def _load_knowledge():
    if os.path.exists(KNOWLEDGE_FILE):
        try:
            with open(KNOWLEDGE_FILE) as f:
                return json.load(f)
        except:
            pass
    return {"researches": {}, "findings": []}


def _save_knowledge(data):
    os.makedirs(os.path.dirname(KNOWLEDGE_FILE), exist_ok=True)
    with open(KNOWLEDGE_FILE, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def create_research(user_id, topic, description=""):
    """创建一个研究项目，返回research_id"""
    data = _load_knowledge()
    research_id = f"res_{int(time.time())}_{len(data['researches'])}"
    
    data["researches"][research_id] = {
        "id": research_id,
        "user_id": user_id,
        "topic": topic,
        "description": description,
        "status": "created",
        "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "bees": [],  # 参与的蜂群
        "findings": [],  # 发现
        "papers": [],  # 相关论文
        "hypotheses": [],  # 假设
        "experiments": [],  # 实验结果
        "knowledge_items": [],  # 知识条目
        "logs": [],  # 蜂群日志
    }
    _save_knowledge(data)
    return research_id


def add_finding(research_id, bee_type, content, finding_type="info"):
    """蜂群Agent向知识库添加发现"""
    data = _load_knowledge()
    research = data["researches"].get(research_id)
    if not research:
        return None
    
    finding = {
        "id": f"find_{int(time.time()*1000)}",
        "bee": bee_type,
        "type": finding_type,  # info/warning/critical/discovery
        "content": content,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    
    research["findings"].append(finding)
    research["knowledge_items"].append({
        "source": bee_type,
        "content": content,
        "time": finding["time"],
    })
    research["logs"].append(f"[{bee_type}] {finding_type}: {content[:100]}")
    _save_knowledge(data)
    return finding["id"]


def add_hypothesis(research_id, hypothesis, confidence=0.5):
    """添加研究假设"""
    data = _load_knowledge()
    research = data["researches"].get(research_id)
    if not research:
        return None
    
    hyp = {
        "id": f"hyp_{int(time.time()*1000)}",
        "content": hypothesis,
        "confidence": confidence,
        "status": "proposed",  # proposed/testing/verified/falsified
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    research["hypotheses"].append(hyp)
    research["logs"].append(f"[假设蜂] 提出假设: {hypothesis[:80]} (置信度{confidence})")
    _save_knowledge(data)
    return hyp["id"]


def add_experiment(research_id, bee_type, setup, result, success=True):
    """添加实验结果"""
    data = _load_knowledge()
    research = data["researches"].get(research_id)
    if not research:
        return None
    
    exp = {
        "id": f"exp_{int(time.time()*1000)}",
        "bee": bee_type,
        "setup": setup,
        "result": result,
        "success": success,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    research["experiments"].append(exp)
    research["logs"].append(f"[{bee_type}] 实验{'成功' if success else '失败'}: {result[:80]}")
    _save_knowledge(data)
    return exp["id"]


def add_paper(research_id, title, authors, abstract, url="", year=""):
    """添加相关论文"""
    data = _load_knowledge()
    research = data["researches"].get(research_id)
    if not research:
        return None
    
    paper = {
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "url": url,
        "year": year,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    research["papers"].append(paper)
    research["logs"].append(f"[文献蜂] 发现论文: {title[:60]}")
    _save_knowledge(data)
    return True


def get_research(research_id):
    """获取研究项目信息"""
    data = _load_knowledge()
    return data["researches"].get(research_id)


def update_research_status(research_id, status):
    """更新研究状态"""
    data = _load_knowledge()
    research = data["researches"].get(research_id)
    if research:
        research["status"] = status
        _save_knowledge(data)
        return True
    return False


def get_context_for_bee(research_id, bee_type):
    """
    为蜂群Agent提供共享上下文
    每个蜂能看到其他蜂的发现，实现信息共享
    """
    research = get_research(research_id)
    if not research:
        return ""
    
    context = f"研究主题: {research['topic']}\n"
    context += f"研究描述: {research.get('description', '无')}\n\n"
    
    if research["findings"]:
        context += "=== 已有发现 ===\n"
        for f in research["findings"][-10:]:  # 最近10条
            context += f"[{f['bee']}] {f['content'][:200]}\n"
        context += "\n"
    
    if research["hypotheses"]:
        context += "=== 研究假设 ===\n"
        for h in research["hypotheses"]:
            context += f"- {h['content'][:200]} (置信度:{h['confidence']}, 状态:{h['status']})\n"
        context += "\n"
    
    if research["papers"]:
        context += "=== 相关论文 ===\n"
        for p in research["papers"][-5:]:
            context += f"- {p['title'][:100]} ({p.get('year','')})\n"
        context += "\n"
    
    if research["experiments"]:
        context += "=== 实验结果 ===\n"
        for e in research["experiments"][-5:]:
            context += f"- [{e['bee']}] {e['setup'][:100]} → {e['result'][:100]}\n"
        context += "\n"
    
    return context
