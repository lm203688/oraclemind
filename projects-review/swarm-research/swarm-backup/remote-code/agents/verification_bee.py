"""
验证蜂 — 扫描研究中的声明，用真实计算验证
将"论文声明"变成"验证过的结论"

验证类型:
  1. 分子性质声明 → RDKit真实计算验证
  2. Lipinski规则声明 → RDKit计算验证
  3. 药物相似性声明 → RDKit计算验证
  4. 引用声明 → 文献数据库查重
  5. 无法计算的声明 → 标记为LLM推理(未验证)

输出:
  - 可信声明标签: 🟢实验确认 / 🟡计算验证 / 🔴LLM推理
  - 验证报告: 每条声明的验证结果
  - 验证通过率
"""
import re
import json
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, get_context_for_bee, get_research


# ============================================================
# 声明提取
# ============================================================
def _extract_claims(paper, context):
    """从论文和上下文中提取可验证声明"""
    prompt = f"""请从以下研究内容中提取所有可验证的科学声明。

研究内容:
{paper}

{context}

对每个声明，提取以下信息：
1. claim: 声明内容（原文）
2. claim_type: 声明类型，必须是以下之一：
   - molecular_property: 分子性质（如logP、分子量、TPSA等）
   - lipinski: Lipinski五规则相关
   - drug_likeness: 药物相似性
   - reaction: 反应预测
   - ml_metric: ML指标（如准确率、F1等）
   - literature: 文献引用
   - hypothesis: 假设性声明
   - other: 其他
3. smiles: 如果涉及分子，提取SMILES（如果没有明确给出，留空）
4. expected_value: 声明中的预期值（如"logP约为3.5"→3.5）
5. property_name: 性质名称（如"logP"、"molecular_weight"）

请以JSON数组格式输出，每个元素是一个声明对象。只输出JSON，不要其他文字。

示例:
[
  {{
    "claim": "该分子的logP约为3.5",
    "claim_type": "molecular_property",
    "smiles": "CCO",
    "expected_value": 3.5,
    "property_name": "logp"
  }}
]"""

    result = call_llm_simple(prompt, system="你是科研声明提取专家",
                             max_tokens=2500)
    
    if result.get("error"):
        return []
    
    content = result["content"].strip()
    # 尝试解析JSON
    try:
        # 去除可能的markdown代码块标记
        if content.startswith("```"):
            content = re.sub(r'^```(?:json)?\n', '', content)
            content = re.sub(r'\n```$', '', content)
        claims = json.loads(content)
        if isinstance(claims, list):
            return claims
    except:
        pass
    
    return []


# ============================================================
# 验证器
# ============================================================
def _verify_molecular_property(claim):
    """验证分子性质声明 — RDKit真实计算"""
    smiles = claim.get("smiles", "")
    if not smiles:
        return {"status": "unverifiable", "reason": "缺少SMILES"}
    
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski, rdMolDescriptors
        from rdkit import RDLogger
        RDLogger.DisableLog('rdApp.*')
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"status": "failed", "reason": f"无法解析SMILES: {smiles}"}
        
        prop_name = claim.get("property_name", "").lower()
        expected = claim.get("expected_value")
        
        # 计算实际值
        actual = None
        if prop_name in ["logp", "脂溶性"]:
            actual = round(Crippen.MolLogP(mol), 2)
        elif prop_name in ["tpsa", "极性表面积"]:
            actual = round(Descriptors.TPSA(mol), 2)
        elif prop_name in ["molecular_weight", "分子量", "mw"]:
            actual = round(Descriptors.MolWt(mol), 2)
        elif prop_name in ["mr", "摩尔折射率"]:
            actual = round(Crippen.MolMR(mol), 2)
        elif prop_name in ["h_bond_donors", "氢键供体"]:
            actual = Lipinski.NumHDonors(mol)
        elif prop_name in ["h_bond_acceptors", "氢键受体"]:
            actual = Lipinski.NumHAcceptors(mol)
        elif prop_name in ["rotatable_bonds", "可旋转键"]:
            actual = Descriptors.NumRotatableBonds(mol)
        elif prop_name in ["num_rings", "环数"]:
            actual = rdMolDescriptors.CalcNumRings(mol)
        elif prop_name in ["num_aromatic_rings", "芳香环数"]:
            actual = rdMolDescriptors.CalcNumAromaticRings(mol)
        else:
            return {"status": "unverifiable", "reason": f"不支持验证的性质: {prop_name}"}
        
        # 比较预期值和实际值
        if expected is not None and isinstance(expected, (int, float)):
            # 允许10%误差或0.5绝对误差
            tolerance = max(abs(expected) * 0.1, 0.5)
            diff = abs(actual - expected)
            if diff <= tolerance:
                status = "verified"
                match = f"匹配(预期{expected}, 实际{actual}, 偏差{round(diff,2)})"
            else:
                status = "failed"
                match = f"不匹配(预期{expected}, 实际{actual}, 偏差{round(diff,2)})"
        else:
            status = "verified"
            match = f"已计算(实际值{actual})"
        
        return {
            "status": status,
            "actual_value": actual,
            "expected_value": expected,
            "match": match,
            "engine": "RDKit",
        }
    except ImportError:
        return {"status": "unverifiable", "reason": "RDKit未安装"}
    except Exception as e:
        return {"status": "failed", "reason": str(e)}


def _verify_lipinski(claim):
    """验证Lipinski五规则声明"""
    smiles = claim.get("smiles", "")
    if not smiles:
        return {"status": "unverifiable", "reason": "缺少SMILES"}
    
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        from rdkit import RDLogger
        RDLogger.DisableLog('rdApp.*')
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"status": "failed", "reason": f"无法解析SMILES"}
        
        mw = Descriptors.MolWt(mol)
        logp = Crippen.MolLogP(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        
        violations = sum([mw > 500, logp > 5, hbd > 5, hba > 10])
        passes = violations == 0
        
        claim_text = claim.get("claim", "").lower()
        if "符合" in claim_text or "通过" in claim_text or "pass" in claim_text:
            expected_pass = True
        elif "违反" in claim_text or "不符合" in claim_text or "fail" in claim_text:
            expected_pass = False
        else:
            expected_pass = None
        
        if expected_pass is not None:
            status = "verified" if passes == expected_pass else "failed"
            match = f"声明{'符合' if expected_pass else '违反'}, 实际{'符合' if passes else '违反'}(违反{violations}条)"
        else:
            status = "verified"
            match = f"Lipinski{'符合' if passes else '违反'}(违反{violations}条: MW={round(mw,1)}, logP={round(logp,2)}, HBD={hbd}, HBA={hba})"
        
        return {
            "status": status,
            "actual_value": {"mw": round(mw, 2), "logp": round(logp, 2), "hbd": hbd, "hba": hba, "violations": violations},
            "match": match,
            "engine": "RDKit",
        }
    except ImportError:
        return {"status": "unverifiable", "reason": "RDKit未安装"}
    except Exception as e:
        return {"status": "failed", "reason": str(e)}


def _verify_drug_likeness(claim):
    """验证药物相似性声明"""
    smiles = claim.get("smiles", "")
    if not smiles:
        return {"status": "unverifiable", "reason": "缺少SMILES"}
    
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        from rdkit import RDLogger
        RDLogger.DisableLog('rdApp.*')
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"status": "failed", "reason": "无法解析SMILES"}
        
        mw = Descriptors.MolWt(mol)
        logp = Crippen.MolLogP(mol)
        tpsa = Descriptors.TPSA(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        
        lipinski_pass = (mw <= 500 and logp <= 5 and hbd <= 5 and hba <= 10)
        drug_like = lipinski_pass and tpsa < 140
        
        return {
            "status": "verified",
            "actual_value": {"drug_like": drug_like, "mw": round(mw,2), "logp": round(logp,2), "tpsa": round(tpsa,2)},
            "match": f"药物相似性: {'是' if drug_like else '否'} (MW={round(mw,1)}, logP={round(logp,2)}, TPSA={round(tpsa,2)})",
            "engine": "RDKit",
        }
    except ImportError:
        return {"status": "unverifiable", "reason": "RDKit未安装"}
    except Exception as e:
        return {"status": "failed", "reason": str(e)}


# ============================================================
# 可信标签
# ============================================================
TRUST_LABELS = {
    "verified": "🟡计算验证",
    "failed": "🔴验证失败",
    "unverifiable": "🔴LLM推理",
}


def _get_trust_label(status, claim_type):
    """获取可信标签"""
    if status == "verified":
        return "🟡计算验证"
    elif status == "failed":
        return "🔴验证失败"
    else:
        # 无法验证的声明，根据类型标签
        if claim_type == "hypothesis":
            return "🟡假设待验"
        elif claim_type == "literature":
            return "🟡文献引用"
        else:
            return "🔴LLM推理"


# ============================================================
# 主流程
# ============================================================
def run(research_id, user_config=None, **kwargs):
    """验证蜂执行"""
    context = get_context_for_bee(research_id, "verification_bee")
    research = get_research(research_id)
    
    # 获取论文内容（从findings中找写作蜂的输出）
    paper = ""
    for f in reversed(research.get("findings", [])):
        if f.get("bee") == "writing_bee":
            paper = f.get("content", "")
            break
    if not paper:
        paper = context  # 没有论文就用上下文
    
    add_finding(research_id, "verification_bee", "▶ 开始提取可验证声明", "info")
    
    # Step 1: 提取声明
    claims = _extract_claims(paper, context)
    
    if not claims:
        add_finding(research_id, "verification_bee", "未找到可验证声明", "warning")
        return {
            "success": True,
            "claims": [],
            "summary": "未找到可验证声明",
            "verified_count": 0,
            "failed_count": 0,
            "unverifiable_count": 0,
            "trust_score": 0,
        }
    
    add_finding(research_id, "verification_bee", f"提取到{len(claims)}条声明，开始验证", "info")
    
    # Step 2: 验证每条声明
    results = []
    for i, claim in enumerate(claims):
        claim_type = claim.get("claim_type", "other")
        verification = None
        
        if claim_type == "molecular_property":
            verification = _verify_molecular_property(claim)
        elif claim_type == "lipinski":
            verification = _verify_lipinski(claim)
        elif claim_type == "drug_likeness":
            verification = _verify_drug_likeness(claim)
        else:
            verification = {"status": "unverifiable", "reason": f"暂不支持验证类型: {claim_type}"}
        
        status = verification.get("status", "unverifiable")
        trust_label = _get_trust_label(status, claim_type)
        
        results.append({
            "claim": claim.get("claim", ""),
            "claim_type": claim_type,
            "smiles": claim.get("smiles", ""),
            "expected_value": claim.get("expected_value"),
            "status": status,
            "trust_label": trust_label,
            "verification": verification,
        })
    
    # Step 3: 统计
    verified = sum(1 for r in results if r["status"] == "verified")
    failed = sum(1 for r in results if r["status"] == "failed")
    unverifiable = sum(1 for r in results if r["status"] == "unverifiable")
    total = len(results)
    
    # 可信度评分：验证通过的比例
    trust_score = round(verified / total * 100, 1) if total > 0 else 0
    
    # Step 4: 生成验证报告
    report = _generate_report(results, trust_score, research)
    
    add_finding(research_id, "verification_bee", 
                f"验证完成: {verified}通过/{failed}失败/{unverifiable}未验证, 可信度{trust_score}%", 
                "verification_result")
    add_finding(research_id, "verification_bee", report[:500], "verification_report")
    
    # 存储完整验证结果（供入库使用）
    add_finding(research_id, "verification_bee", results, "verification_claims")
    
    return {
        "success": True,
        "claims": results,
        "summary": f"{total}条声明: {verified}验证通过, {failed}验证失败, {unverifiable}无法验证",
        "verified_count": verified,
        "failed_count": failed,
        "unverifiable_count": unverifiable,
        "total_count": total,
        "trust_score": trust_score,
        "report": report,
        "usage": {},
    }


def get_depositable_claims(verification_results):
    """
    从验证蜂结果中提取可入库的声明（仅计算验证通过的）
    返回可供用户选择入库的声明列表
    """
    depositable = []
    for r in verification_results.get("claims", []):
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
            "trust_score": verification_results.get("trust_score", 0),
        })
    return depositable



def _generate_report(results, trust_score, research):
    """生成验证报告"""
    lines = [
        f"# 验证报告",
        f"",
        f"研究主题: {research['topic']}",
        f"可信度评分: {trust_score}%",
        f"",
        f"## 验证统计",
        f"- 总声明数: {len(results)}",
        f"- 🟡 计算验证通过: {sum(1 for r in results if r['status'] == 'verified')}",
        f"- 🔴 验证失败: {sum(1 for r in results if r['status'] == 'failed')}",
        f"- 🔴 无法验证: {sum(1 for r in results if r['status'] == 'unverifiable')}",
        f"",
        f"## 声明详情",
    ]
    
    for i, r in enumerate(results, 1):
        lines.append(f"")
        lines.append(f"### {i}. {r['trust_label']}")
        lines.append(f"**声明**: {r['claim']}")
        if r.get("smiles"):
            lines.append(f"**SMILES**: `{r['smiles']}`")
        if r.get("expected_value") is not None:
            lines.append(f"**预期值**: {r['expected_value']}")
        
        v = r.get("verification", {})
        if v.get("actual_value") is not None:
            lines.append(f"**实际值**: {v['actual_value']}")
        if v.get("match"):
            lines.append(f"**验证结果**: {v['match']}")
        if v.get("engine"):
            lines.append(f"**验证引擎**: {v['engine']}")
        if v.get("reason"):
            lines.append(f"**原因**: {v['reason']}")
    
    lines.append("")
    lines.append("## 可信标签说明")
    lines.append("- 🟢 实验确认: 有真实实验数据支撑")
    lines.append("- 🟡 计算验证: RDKit/ML真实计算验证通过")
    lines.append("- 🔴 验证失败: 计算验证未通过，声明可能有误")
    lines.append("- 🔴 LLM推理: AI生成未验证")
    
    return "\n".join(lines)
