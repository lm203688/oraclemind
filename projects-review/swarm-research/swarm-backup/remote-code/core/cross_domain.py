"""
蜂群科研平台 — AI跨领域发现
分析验证结果在哪些跨领域可能有价值

工作流程:
  1. 拿到一个验证结果（用户指定或从知识库选）
  2. 在知识库中找性质指纹相似的条目
  3. 如果有相似条目，提取它们的应用领域
  4. LLM分析+建议跨领域应用
  5. 输出建议+进一步验证方向

性质指纹匹配:
  - 分子性质: logP/TPSA/分子量/Lipinski状态相近的分子
  - 材料特性: 相近的物理参数
  - ML指标: 相近的模型表现
"""
import json
from core.llm_client import call_llm_simple
from core.verified_kb import _load_kb, get_knowledge


# ============================================================
# 性质指纹提取
# ============================================================
def _extract_property_fingerprint(item):
    """从知识条目中提取性质指纹"""
    fp = {
        "claim_type": item.get("claim_type", ""),
        "smiles": item.get("smiles", ""),
        "actual_value": item.get("actual_value"),
        "claim": item.get("claim", ""),
    }
    
    # 如果有SMILES，尝试用RDKit提取分子指纹
    if fp["smiles"]:
        try:
            from rdkit import Chem
            from rdkit.Chem import Descriptors, Crippen, rdMolDescriptors
            from rdkit import RDLogger
            RDLogger.DisableLog('rdApp.*')
            
            mol = Chem.MolFromSmiles(fp["smiles"])
            if mol:
                fp["mol_weight"] = round(Descriptors.MolWt(mol), 1)
                fp["logp"] = round(Crippen.MolLogP(mol), 2)
                fp["tpsa"] = round(Descriptors.TPSA(mol), 1)
                fp["num_rings"] = rdMolDescriptors.CalcNumRings(mol)
                fp["num_hba"] = rdMolDescriptors.CalcNumHBA(mol)
                fp["num_hbd"] = rdMolDescriptors.CalcNumHBD(mol)
                fp["num_rotatable"] = rdMolDescriptors.CalcNumRotatableBonds(mol)
        except:
            pass
    
    return fp


# ============================================================
# 相似度匹配
# ============================================================
def _similarity_score(fp1, fp2):
    """计算两个性质指纹的相似度 (0-1)"""
    # 只对分子类条目计算
    if not fp1.get("mol_weight") or not fp2.get("mol_weight"):
        return 0
    
    # 分子量差异
    mw_diff = abs(fp1["mol_weight"] - fp2["mol_weight"]) / max(fp1["mol_weight"], fp2["mol_weight"], 1)
    
    # logP差异
    logp_diff = abs(fp1.get("logp", 0) - fp2.get("logp", 0)) / 5.0  # logP范围约0-5
    
    # TPSA差异
    tpsa_diff = abs(fp1.get("tpsa", 0) - fp2.get("tpsa", 0)) / 100.0
    
    # 环数差异
    ring_diff = abs(fp1.get("num_rings", 0) - fp2.get("num_rings", 0)) / 5.0
    
    # 综合相似度
    score = 1 - (mw_diff * 0.3 + logp_diff * 0.3 + tpsa_diff * 0.2 + ring_diff * 0.2)
    return max(0, min(1, score))


def find_similar_items(kb_id, top_n=5):
    """在知识库中找性质相似但不同的条目"""
    kb = _load_kb()
    target = kb["items"].get(kb_id)
    if not target:
        return []
    
    target_fp = _extract_property_fingerprint(target)
    
    similar = []
    for item_id, item in kb["items"].items():
        if item_id == kb_id:
            continue
        if item.get("status") != "active":
            continue
        
        item_fp = _extract_property_fingerprint(item)
        score = _similarity_score(target_fp, item_fp)
        
        if score > 0.3:  # 相似度阈值
            similar.append({
                "kb_id": item_id,
                "claim": item["claim"][:100],
                "claim_type": item["claim_type"],
                "similarity": round(score, 3),
                "smiles": item.get("smiles", ""),
                "actual_value": item.get("actual_value"),
                "trust_label": item.get("trust_label", ""),
                "citations": item.get("citations", 0),
            })
    
    similar.sort(key=lambda x: x["similarity"], reverse=True)
    return similar[:top_n]


# ============================================================
# LLM跨领域分析
# ============================================================
def _build_analysis_prompt(item, similar_items):
    """构建跨领域分析prompt"""
    fp = _extract_property_fingerprint(item)
    
    # 分子性质描述
    mol_desc = ""
    if fp.get("mol_weight"):
        mol_desc = f"""
分子性质指纹:
- 分子量: {fp.get('mol_weight', 'N/A')}
- logP: {fp.get('logp', 'N/A')}
- TPSA: {fp.get('tpsa', 'N/A')}
- 环数: {fp.get('num_rings', 'N/A')}
- 氢键受体: {fp.get('num_hba', 'N/A')}
- 氢键供体: {fp.get('num_hbd', 'N/A')}
- 可旋转键: {fp.get('num_rotatable', 'N/A')}
"""
    
    # 相似条目描述
    similar_desc = ""
    if similar_items:
        similar_desc = "\n知识库中找到的相似条目:\n"
        for i, s in enumerate(similar_items, 1):
            similar_desc += f"{i}. [{s['trust_label']}] {s['claim']} (相似度:{s['similarity']})\n"
    else:
        similar_desc = "\n（知识库中暂无高度相似条目）\n"
    
    return f"""请分析以下验证过的科研成果可能在哪些跨领域有应用价值。

## 验证结果
- 声明: {item['claim']}
- 类型: {item['claim_type']}
- SMILES: {item.get('smiles', 'N/A')}
- 实际值: {item.get('actual_value', 'N/A')}
- 验证引擎: {item.get('verification_engine', 'N/A')}
- 信任等级: {item.get('trust_label', '')}
{mol_desc}
{similar_desc}

## 请输出以下内容:

### 跨领域应用建议（3-5个方向）

对每个方向：
1. 领域名称
2. 为什么这个成果在该领域有价值（基于性质指纹分析）
3. 潜在应用场景（具体）
4. 需要进一步验证什么（可操作）
5. 置信度（高/中/低）

### 关键性质匹配分析
- 哪些性质特征是跨领域应用的关键
- 与知识库中相似条目的对比分析

### 建议的下一步研究
- 1-2个具体可执行的验证方向
- 预估需要消耗的积分类型

请基于分子性质和化学知识给出有依据的建议，不要泛泛而谈。"""


def analyze_cross_domain(kb_id):
    """
    AI跨领域发现
    
    Args:
        kb_id: 知识库条目ID
    
    Returns:
        {
            "success": bool,
            "kb_id": str,
            "analysis": str,        # LLM分析结果
            "similar_items": list,  # 相似条目
            "fingerprint": dict,    # 性质指纹
        }
    """
    item = get_knowledge(kb_id)
    if not item:
        return {"success": False, "error": "知识条目不存在"}
    
    # Step 1: 提取性质指纹
    fp = _extract_property_fingerprint(item)
    
    # Step 2: 找相似条目
    similar = find_similar_items(kb_id, top_n=5)
    
    # Step 3: LLM分析
    prompt = _build_analysis_prompt(item, similar)
    
    result = call_llm_simple(
        prompt,
        system="你是一位跨领域科研顾问，擅长从分子性质和化学特征中发现跨领域应用价值。你的建议必须基于具体的性质数据，不要空泛。",
        max_tokens=2500,
    )
    
    if result.get("error"):
        return {"success": False, "error": result["error"]}
    
    return {
        "success": True,
        "kb_id": kb_id,
        "claim": item["claim"],
        "fingerprint": fp,
        "similar_items": similar,
        "analysis": result["content"],
        "usage": result.get("usage", {}),
    }
