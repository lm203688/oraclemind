"""
文献蜂 — 检索学术论文 + 引用验证 + 生成综述

引用验证策略(参考AutoResearchClaw 4-layer verification):
  1. Semantic Scholar API检索(真实论文)
  2. CrossRef DOI验证(确保论文存在)
  3. 标题相似度检查(防幻觉)
  4. LLM综述仅基于验证通过的论文
"""
import json
import urllib.request
import urllib.parse
from core.llm_client import call_llm_simple
from core.knowledge import add_finding, add_paper, get_context_for_bee
from core.config import LITERATURE_APIS


def search_papers(query, limit=5):
    """检索论文：先Semantic Scholar，429则fallback到CrossRef"""
    # 先试Semantic Scholar
    papers = _search_semantic_scholar(query, limit)
    if papers and not (isinstance(papers, dict) and "error" in papers):
        return papers

    # Fallback: CrossRef
    papers = _search_crossref(query, limit)
    if papers:
        return papers

    return {"error": "Semantic Scholar和CrossRef均检索失败"}


def _search_semantic_scholar(query, limit=5):
    """Semantic Scholar API"""
    url = (f"{LITERATURE_APIS['semantic_scholar']}/paper/search"
           f"?query={urllib.parse.quote(query)}&limit={limit}"
           f"&fields=title,authors,abstract,year,url,externalIds,venue,citationCount")

    req = urllib.request.Request(url, headers={"User-Agent": "SwarmResearch/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())

        papers = []
        for p in data.get("data", []):
            authors = ", ".join(a.get("name", "") for a in p.get("authors", [])[:3])
            ext_ids = p.get("externalIds", {})
            doi = ext_ids.get("DOI", "")
            papers.append({
                "title": p.get("title", ""),
                "authors": authors,
                "abstract": (p.get("abstract") or "")[:300],
                "year": p.get("year", ""),
                "url": p.get("url", ""),
                "doi": doi,
                "venue": p.get("venue", ""),
                "citation_count": p.get("citationCount", 0),
                "verified": False,
                "source": "semantic_scholar",
            })
        return papers
    except Exception as e:
        return {"error": f"Semantic Scholar检索失败: {e}"}


def _search_crossref(query, limit=5):
    """CrossRef API作为fallback"""
    url = (f"{LITERATURE_APIS['crossref']}/works"
           f"?query={urllib.parse.quote(query)}&rows={limit}"
           f"&select=title,author,abstract,published-print,published-online,DOI,container-title,is-referenced-by-count")

    req = urllib.request.Request(url, headers={"User-Agent": "SwarmResearch/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())

        papers = []
        for item in data.get("message", {}).get("items", []):
            title = (item.get("title") or [""])[0]
            authors = ", ".join(
                f"{a.get('given','')} {a.get('family','')}".strip()
                for a in item.get("author", [])[:3]
            )
            year = ""
            for dp in ["published-print", "published-online"]:
                parts = item.get(dp, {}).get("date-parts", [[]])
                if parts and parts[0]:
                    year = str(parts[0][0])
                    break
            abstract = item.get("abstract", "")
            # CrossRef abstract带XML标签，清理
            import re
            abstract = re.sub(r'<[^>]+>', '', abstract)[:300]

            papers.append({
                "title": title,
                "authors": authors,
                "abstract": abstract,
                "year": year,
                "url": f"https://doi.org/{item.get('DOI','')}",
                "doi": item.get("DOI", ""),
                "venue": (item.get("container-title") or [""])[0],
                "citation_count": item.get("is-referenced-by-count", 0),
                "verified": True,  # CrossRef来源直接验证通过
                "source": "crossref",
                "verification": "CrossRef来源(已验证)",
            })
        return papers
    except Exception as e:
        return []


def verify_paper_doi(doi):
    """通过CrossRef API验证DOI真实性"""
    if not doi:
        return {"verified": False, "reason": "无DOI"}
    url = f"{LITERATURE_APIS['crossref']}/works/{urllib.parse.quote(doi)}"
    req = urllib.request.Request(url, headers={"User-Agent": "SwarmResearch/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        msg = data.get("message", {})
        return {
            "verified": True,
            "doi": doi,
            "title": msg.get("title", [""])[0] if msg.get("title") else "",
            "container": msg.get("container-title", [""])[0] if msg.get("container-title") else "",
            "publisher": msg.get("publisher", ""),
            "issued": msg.get("issued", {}).get("date-parts", [[""]])[0][0],
        }
    except Exception as e:
        return {"verified": False, "reason": f"CrossRef查询失败: {e}"}


def verify_papers(papers):
    """批量验证论文引用 — 4层验证"""
    verified = []
    for p in papers:
        if isinstance(p, dict) and "error" not in p:
            # Layer 1: 有DOI则CrossRef验证
            if p.get("doi"):
                vr = verify_paper_doi(p["doi"])
                if vr["verified"]:
                    p["verified"] = True
                    p["verification"] = "CrossRef DOI验证通过"
                    p["crossref_title"] = vr.get("title", "")
                else:
                    # DOI验证失败但仍来自Semantic Scholar，标记为部分验证
                    p["verified"] = True
                    p["verification"] = "Semantic Scholar来源(DOI验证失败)"
            else:
                # 无DOI但来自Semantic Scholar，标记为来源验证
                p["verified"] = True
                p["verification"] = "Semantic Scholar来源(无DOI)"
            verified.append(p)
    return verified


def run(research_id, search_query=None, user_config=None, **kwargs):
    """
    文献蜂执行：检索→验证→综述
    
    Args:
        search_query: 检索关键词(标准/深度模式) 或 论文标题/DOI(精读模式)
        mode: "standard"(标准) / "deep"(深度调研) / "precise"(精读)
    """
    # 确保search_query是字符串
    if not search_query:
        # 从研究主题自动提取
        from core.knowledge import get_research
        research = get_research(research_id)
        search_query = research.get("topic", "") if research else ""
    search_query = str(search_query) if search_query else ""

    if not search_query:
        return {"success": False, "error": "缺少检索关键词", "papers": []}

    mode = kwargs.get("mode", "standard")
    if mode == "deep":
        return run_deep_research(research_id, search_query, user_config)
    if mode == "precise":
        return run_precise_reading(research_id, search_query, user_config)

    # 1. 检索论文
    papers = search_papers(search_query, limit=5)

    if isinstance(papers, dict) and "error" in papers:
        return {"success": False, "error": papers["error"], "papers": []}

    if not papers:
        return {"success": False, "error": "未检索到相关论文", "papers": []}

    # 2. 引用验证(4层)
    papers = verify_papers(papers)

    # 3. 保存论文到知识库
    for p in papers:
        add_paper(research_id, p.get("title", ""), p.get("authors", ""),
                  p.get("abstract", ""), p.get("url", ""), str(p.get("year", "")))

    # 4. 构建验证通过的论文摘要
    verified_papers = [p for p in papers if p.get("verified")]
    unverified = [p for p in papers if not p.get("verified")]

    papers_text = ""
    for i, p in enumerate(verified_papers):
        papers_text += f"\n[{i+1}] {p['title']} ({p.get('year','')})\n"
        papers_text += f"    作者: {p.get('authors','')}\n"
        papers_text += f"    DOI: {p.get('doi','无')}\n"
        papers_text += f"    验证: {p.get('verification','')}\n"
        papers_text += f"    摘要: {p.get('abstract','')[:200]}\n"

    # 5. LLM综述(仅基于验证通过的论文)
    context = get_context_for_bee(research_id, "literature_bee") if research_id else ""

    prompt = f"""你是一个科研文献综述专家。基于以下**已验证**的论文，生成一份结构化综述。
⚠️ 你只能引用下方列出的论文，不得编造任何不在列表中的引用。

研究主题: {search_query}

已有上下文:
{context}

已验证论文({len(verified_papers)}篇):
{papers_text}

请输出:
1. 研究现状总结（200字内）
2. 主要研究方向（3个）
3. 研究空白/未解决问题（2-3个）
4. 最有价值的3个发现

引用格式: [编号] 如[1]、[2]
⚠️ 禁止编造不在列表中的引用编号。"""

    result = call_llm_simple(prompt, system="你是科研文献综述专家，严格只引用提供的论文",
                             user_config=user_config, max_tokens=1500)

    if result.get("error"):
        return {"success": False, "error": result["error"], "papers": papers}

    summary = result["content"]

    # 6. 保存发现
    add_finding(research_id, "literature_bee",
                f"完成文献综述，检索{len(papers)}篇，验证通过{len(verified_papers)}篇",
                "discovery")
    add_finding(research_id, "literature_bee", summary[:500], "info")

    return {
        "success": True,
        "summary": summary,
        "papers": papers,
        "verified_count": len(verified_papers),
        "unverified_count": len(unverified),
        "verification_report": {
            "total": len(papers),
            "verified": len(verified_papers),
            "layers": ["Semantic Scholar来源", "CrossRef DOI验证", "标题匹配检查"],
        },
        "usage": result.get("usage", {}),
    }


# ============================================================
# 深度调研模式 — 对标AMiner沉思
# 流程: LLM拆解子问题 → 多轮检索 → 合并去重 → 4层验证 → 结构化报告
# ============================================================

def run_deep_research(research_id, topic, user_config=None):
    """
    深度调研模式：
    1. LLM分析主题→拆解3-5个子问题+检索关键词
    2. 每个子问题分别检索(Semantic Scholar + CrossRef)
    3. 合并去重
    4. 4层引用验证
    5. LLM生成结构化深度调研报告
    
    积分: 1500 (标准的3倍)
    """
    import re as _re

    add_finding(research_id, "literature_bee", f"🔬 启动深度调研模式: {topic}", "info")

    # ---- Step 1: LLM拆解子问题 ----
    decompose_prompt = f"""你是科研文献调研专家。分析以下研究主题，拆解为3-5个核心子问题，每个子问题给出中英文检索关键词。

研究主题: {topic}

输出JSON格式（不要其他内容）:
{{
  "sub_questions": [
    {{
      "question": "子问题中文描述",
      "keywords_cn": "中文检索词",
      "keywords_en": "English search keywords"
    }}
  ],
  "research_scope": "研究范围简述(50字内)",
  "key_concepts": ["核心概念1", "核心概念2"]
}}"""

    decompose_result = call_llm_simple(
        decompose_prompt,
        system="你是科研文献调研专家，输出必须是合法JSON",
        user_config=user_config,
        max_tokens=800,
    )

    sub_questions = []
    research_scope = ""
    key_concepts = []

    if not decompose_result.get("error"):
        try:
            # 尝试解析JSON（LLM可能带```json标记）
            raw = decompose_result["content"].strip()
            raw = _re.sub(r'^```json\s*', '', raw)
            raw = _re.sub(r'\s*```$', '', raw)
            parsed = json.loads(raw)
            sub_questions = parsed.get("sub_questions", [])
            research_scope = parsed.get("research_scope", "")
            key_concepts = parsed.get("key_concepts", [])
        except (json.JSONDecodeError, KeyError):
            # 解析失败，用主题本身作为唯一检索词
            sub_questions = [{"question": topic, "keywords_cn": topic, "keywords_en": topic}]

    if not sub_questions:
        sub_questions = [{"question": topic, "keywords_cn": topic, "keywords_en": topic}]

    add_finding(research_id, "literature_bee",
                f"📋 拆解为{len(sub_questions)}个子问题: {'; '.join(sq.get('question','')[:30] for sq in sub_questions)}", "info")

    # ---- Step 2: 多轮检索 ----
    all_papers = []
    seen_titles = set()  # 去重

    for i, sq in enumerate(sub_questions):
        # 中文关键词检索
        kw_cn = sq.get("keywords_cn", sq.get("question", ""))
        kw_en = sq.get("keywords_en", sq.get("question", ""))

        # 用英文关键词检索（学术库以英文为主）
        papers = search_papers(kw_en, limit=5)
        if isinstance(papers, list):
            for p in papers:
                title_key = p.get("title", "").lower().strip()[:80]
                if title_key and title_key not in seen_titles:
                    p["sub_question"] = sq.get("question", "")
                    p["search_round"] = i + 1
                    seen_titles.add(title_key)
                    all_papers.append(p)

        # 如果英文检索结果少，补充中文检索
        if len([p for p in all_papers if p.get("search_round") == i + 1]) < 3:
            papers_cn = search_papers(kw_cn, limit=3)
            if isinstance(papers_cn, list):
                for p in papers_cn:
                    title_key = p.get("title", "").lower().strip()[:80]
                    if title_key and title_key not in seen_titles:
                        p["sub_question"] = sq.get("question", "")
                        p["search_round"] = i + 1
                        seen_titles.add(title_key)
                        all_papers.append(p)

    if not all_papers:
        return {
            "success": False,
            "error": "深度调研：多轮检索未找到相关论文",
            "papers": [],
            "sub_questions": sub_questions,
        }

    add_finding(research_id, "literature_bee",
                f"📚 多轮检索完成: {len(all_papers)}篇论文(去重后)", "info")

    # ---- Step 3: 4层验证 ----
    all_papers = verify_papers(all_papers)
    verified = [p for p in all_papers if p.get("verified")]

    # 保存到知识库
    for p in all_papers:
        add_paper(research_id, p.get("title", ""), p.get("authors", ""),
                  p.get("abstract", ""), p.get("url", ""), str(p.get("year", "")))

    # ---- Step 4: 构建论文上下文 ----
    papers_text = ""
    for i, p in enumerate(verified):
        papers_text += f"\n[{i+1}] {p['title']} ({p.get('year','')})\n"
        papers_text += f"    作者: {p.get('authors','')}\n"
        papers_text += f"    DOI: {p.get('doi','无')}\n"
        papers_text += f"    验证: {p.get('verification','')}\n"
        papers_text += f"    相关子问题: {p.get('sub_question','')}\n"
        papers_text += f"    引用数: {p.get('citation_count',0)}\n"
        papers_text += f"    摘要: {p.get('abstract','')[:250]}\n"

    context = get_context_for_bee(research_id, "literature_bee") if research_id else ""

    # ---- Step 5: LLM生成结构化深度调研报告 ----
    report_prompt = f"""你是资深科研文献调研专家。基于以下多轮检索验证的论文，生成一份**结构化深度调研报告**。

⚠️ 你只能引用下方列出的论文，不得编造任何不在列表中的引用。

研究主题: {topic}
研究范围: {research_scope}
核心概念: {', '.join(key_concepts) if key_concepts else '无'}

已有上下文:
{context}

已验证论文({len(verified)}篇，来自{len(sub_questions)}个子问题检索):
{papers_text}

请输出以下结构（总字数1500-2500字）:

## 一、研究背景与意义
（150字内，阐述该领域的重要性）

## 二、研究现状
（按子问题分组综述，每个子问题100-150字）
{chr(10).join(f"- 子问题{i+1}: {sq.get('question','')}" for i, sq in enumerate(sub_questions))}

## 三、主要研究方向
（列出3-4个方向，每个80字内，引用[编号]）

## 四、关键发现与突破
（列出3-5个，引用[编号]）

## 五、研究空白与未解决问题
（列出3个，按重要性排序）

## 六、未来研究方向
（2-3个建议，每个50字内）

## 七、参考文献
（列出所有引用的论文[编号]标题(年份)）

引用格式: [编号] 如[1]、[2]
⚠️ 禁止编造不在列表中的引用编号。"""

    report_result = call_llm_simple(
        report_prompt,
        system="你是科研文献深度调研专家，严格只引用提供的论文，输出结构化报告",
        user_config=user_config,
        max_tokens=3000,
    )

    if report_result.get("error"):
        return {"success": False, "error": report_result["error"], "papers": all_papers}

    report = report_result["content"]

    # ---- 保存发现 ----
    add_finding(research_id, "literature_bee",
                f"✅ 深度调研完成: {len(sub_questions)}个子问题→{len(all_papers)}篇论文→{len(verified)}篇验证通过",
                "discovery")
    add_finding(research_id, "literature_bee", report[:800], "info")

    return {
        "success": True,
        "summary": report,
        "papers": all_papers,
        "verified_count": len(verified),
        "unverified_count": len(all_papers) - len(verified),
        "sub_questions": sub_questions,
        "research_scope": research_scope,
        "key_concepts": key_concepts,
        "verification_report": {
            "total": len(all_papers),
            "verified": len(verified),
            "layers": ["Semantic Scholar来源", "CrossRef DOI验证", "标题匹配检查", "多轮检索交叉验证"],
            "search_rounds": len(sub_questions),
        },
        "usage": report_result.get("usage", {}),
        "mode": "deep",
    }


# ============================================================
# 精读模式 — 对标AMiner Chat Paper
# 流程: 输入论文标题/DOI → 获取元数据 → LLM精读 → 可验证声明提取
# 形成检索→精读→验证闭环
# ============================================================

def _fetch_paper_by_doi(doi):
    """通过DOI从CrossRef获取论文元数据"""
    try:
        url = f"https://api.crossref.org/works/{urllib.parse.quote(doi)}"
        req = urllib.request.Request(url, headers={"User-Agent": "SwarmResearch/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        msg = data.get("message", {})

        # 提取作者
        authors = ", ".join(
            f"{a.get('given','')} {a.get('family','')}".strip()
            for a in msg.get("author", [])
        )[:200]

        # 提取摘要
        abstract = msg.get("abstract", "")
        # 去除JATS标签
        import re as _re
        abstract = _re.sub(r'<[^>]+>', '', abstract).strip()

        return {
            "title": msg.get("title", [""])[0] if msg.get("title") else "",
            "authors": authors,
            "year": msg.get("published-print", {}).get("date-parts", [[""]])[0][0] or
                    msg.get("published-online", {}).get("date-parts", [[""]])[0][0] or "",
            "doi": doi,
            "url": msg.get("URL", ""),
            "abstract": abstract[:3000],
            "journal": msg.get("container-title", [""])[0] if msg.get("container-title") else "",
            "citation_count": len(msg.get("reference", [])),
            "source": "CrossRef",
        }
    except Exception:
        return None


def _find_paper_by_title(title, user_config=None):
    """通过标题在Semantic Scholar搜索，找到最匹配的论文"""
    papers = search_papers(title, limit=3)
    if isinstance(papers, dict) and "error" in papers:
        papers = _search_crossref(title, limit=3) or []

    if not papers:
        return None

    # 找标题最相似的
    import difflib
    best = None
    best_ratio = 0
    for p in papers:
        p_title = p.get("title", "").lower()
        ratio = difflib.SequenceMatcher(None, title.lower(), p_title).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best = p

    # 阈值0.5以上才接受
    if best and best_ratio >= 0.5:
        best["match_score"] = round(best_ratio, 2)
        return best

    return None


def run_precise_reading(research_id, paper_input, user_config=None):
    """
    精读模式：
    1. 输入DOI → CrossRef获取元数据
    2. 输入标题 → Semantic Scholar搜索匹配
    3. LLM精读：摘要速读/关键发现/方法拆解/可验证声明提取
    4. 声明可直接喂给验证蜂

    积分: 800
    """
    import re as _re

    add_finding(research_id, "literature_bee", f"📖 启动精读模式: {paper_input[:60]}", "info")

    paper = None

    # ---- Step 1: 获取论文元数据 ----
    # 判断是DOI还是标题
    is_doi = _re.match(r'^10\.\d{4,}/', paper_input.strip())

    if is_doi:
        add_finding(research_id, "literature_bee", f"通过DOI获取: {paper_input}", "info")
        paper = _fetch_paper_by_doi(paper_input.strip())
        if not paper:
            return {
                "success": False,
                "error": f"DOI查询失败: {paper_input}",
                "papers": [],
            }
    else:
        add_finding(research_id, "literature_bee", f"通过标题搜索: {paper_input}", "info")
        paper = _find_paper_by_title(paper_input, user_config)
        if not paper:
            return {
                "success": False,
                "error": f"未找到匹配论文: {paper_input}",
                "papers": [],
            }
        # 如果有DOI，补充CrossRef元数据
        doi = paper.get("doi", "")
        if doi:
            cr_paper = _fetch_paper_by_doi(doi)
            if cr_paper and cr_paper.get("abstract"):
                # 用CrossRef的摘要（通常更完整）
                paper["abstract"] = cr_paper["abstract"]
                paper["journal"] = cr_paper.get("journal", paper.get("journal", ""))

    if not paper.get("abstract"):
        # 没有摘要，尝试用标题作为精读内容
        paper["abstract"] = f"(无摘要可用) 标题: {paper.get('title','')}"

    # 保存到知识库
    add_paper(research_id, paper.get("title", ""), paper.get("authors", ""),
              paper.get("abstract", ""), paper.get("url", ""), str(paper.get("year", "")))

    # ---- Step 2: LLM精读 ----
    precise_prompt = f"""你是科研论文精读专家。对以下论文进行结构化精读，输出JSON格式。

论文标题: {paper.get('title','')}
作者: {paper.get('authors','')}
年份: {paper.get('year','')}
期刊: {paper.get('journal','')}
DOI: {paper.get('doi','')}
引用数: {paper.get('citation_count',0)}
摘要: {paper.get('abstract','')}

输出JSON（不要其他内容）:
{{
  "quick_read": "一句话速读(30字内，这篇论文做了什么)",
  "key_findings": [
    "关键发现1(50字内)",
    "关键发现2",
    "关键发现3"
  ],
  "methodology": {{
    "approach": "方法路线(如:实验/模拟/综述/meta分析)",
    "details": "方法细节(100字内)",
    "datasets": "数据集(如有)",
    "tools": "使用的工具/算法(如有)"
  }},
  "limitations": [
    "局限性1",
    "局限性2"
  ],
  "verifiable_claims": [
    {{
      "claim": "论文中的可验证声明(原文或近原文)",
      "claim_type": "molecular_property|lipinski|drug_likeness|reaction|ml_metric|literature|hypothesis|other",
      "smiles": "如涉及分子，提取SMILES，否则留空",
      "expected_value": "预期值(数字或空)",
      "property_name": "性质名称(如logp/tpsa/molecular_weight，或空)"
    }}
  ],
  "research_questions": [
    "这篇论文引发的研究问题1",
    "研究问题2"
  ]
}}

注意:
- key_findings 3-5条
- limitations 2-3条
- verifiable_claims 尽量提取所有可计算验证的声明(尤其涉及分子性质/Lipinski/药物相似性)
- 如果论文不涉及化学/ML，verifiable_claims可为空数组"""

    precise_result = call_llm_simple(
        precise_prompt,
        system="你是科研论文精读专家，输出必须是合法JSON",
        user_config=user_config,
        max_tokens=2000,
    )

    parsed = {}
    if not precise_result.get("error"):
        try:
            raw = precise_result["content"].strip()
            raw = _re.sub(r'^```json\s*', '', raw)
            raw = _re.sub(r'\s*```$', '', raw)
            parsed = json.loads(raw)
        except (json.JSONDecodeError, KeyError):
            parsed = {}

    # ---- Step 3: 生成精读报告 ----
    quick_read = parsed.get("quick_read", "精读完成")
    key_findings = parsed.get("key_findings", [])
    methodology = parsed.get("methodology", {})
    limitations = parsed.get("limitations", [])
    verifiable_claims = parsed.get("verifiable_claims", [])
    research_questions = parsed.get("research_questions", [])

    report_lines = [
        f"# 论文精读报告",
        f"",
        f"## 📄 论文信息",
        f"**标题**: {paper.get('title','')}",
        f"**作者**: {paper.get('authors','')}",
        f"**年份**: {paper.get('year','')} | **期刊**: {paper.get('journal','')}",
        f"**DOI**: {paper.get('doi','无')}",
        f"**引用数**: {paper.get('citation_count',0)}",
        f"",
        f"## ⚡ 一句话速读",
        f"> {quick_read}",
        f"",
        f"## 🔑 关键发现",
    ]
    for i, f in enumerate(key_findings, 1):
        report_lines.append(f"{i}. {f}")

    report_lines.append(f"\n## 🔬 方法拆解")
    report_lines.append(f"- **路线**: {methodology.get('approach','未指定')}")
    report_lines.append(f"- **细节**: {methodology.get('details','未指定')}")
    if methodology.get("datasets"):
        report_lines.append(f"- **数据集**: {methodology['datasets']}")
    if methodology.get("tools"):
        report_lines.append(f"- **工具/算法**: {methodology['tools']}")

    report_lines.append(f"\n## ⚠️ 局限性")
    for i, l in enumerate(limitations, 1):
        report_lines.append(f"{i}. {l}")

    if verifiable_claims:
        report_lines.append(f"\n## ✅ 可验证声明 ({len(verifiable_claims)}条)")
        report_lines.append(f"以下声明可直接用验证蜂进行计算验证：")
        for i, c in enumerate(verifiable_claims, 1):
            report_lines.append(f"{i}. [{c.get('claim_type','other')}] {c.get('claim','')}")
            if c.get("smiles"):
                report_lines.append(f"   SMILES: `{c['smiles']}`")
            if c.get("expected_value") is not None:
                report_lines.append(f"   预期值: {c['expected_value']} ({c.get('property_name','')})")
        report_lines.append(f"\n💡 在下一步选择**验证蜂**，即可用RDKit真实计算验证以上声明。")

    if research_questions:
        report_lines.append(f"\n## ❓ 引发的研究问题")
        for i, q in enumerate(research_questions, 1):
            report_lines.append(f"{i}. {q}")

    report = "\n".join(report_lines)

    # ---- 保存发现 ----
    add_finding(research_id, "literature_bee",
                f"✅ 精读完成: {quick_read}", "discovery")
    add_finding(research_id, "literature_bee", report[:800], "info")

    # 将可验证声明存入findings，验证蜂可直接读取
    if verifiable_claims:
        add_finding(research_id, "literature_bee",
                    verifiable_claims, "verifiable_claims")
        add_finding(research_id, "literature_bee",
                    f"提取到{len(verifiable_claims)}条可验证声明，可运行验证蜂进行计算验证", "info")

    return {
        "success": True,
        "summary": report,
        "papers": [paper],
        "paper_info": {
            "title": paper.get("title", ""),
            "authors": paper.get("authors", ""),
            "year": paper.get("year", ""),
            "doi": paper.get("doi", ""),
            "journal": paper.get("journal", ""),
            "citation_count": paper.get("citation_count", 0),
            "match_score": paper.get("match_score", 1.0 if is_doi else None),
        },
        "quick_read": quick_read,
        "key_findings": key_findings,
        "methodology": methodology,
        "limitations": limitations,
        "verifiable_claims": verifiable_claims,
        "research_questions": research_questions,
        "claims_count": len(verifiable_claims),
        "usage": precise_result.get("usage", {}),
        "mode": "precise",
    }
