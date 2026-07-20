"""
PaperSpine - 论文深度拆解模块
功能: 输入论文URL/DOI → 拆解研究问题/方法/结果/边界/可引用价值
真实数据源: arXiv API + PubMed API + Crossref API
"""
import json, urllib.request, urllib.parse, re
from typing import Dict, List

class PaperSpine:
    def __init__(self):
        self.arxiv_base = "http://export.arxiv.org/api/query"
        self.pubmed_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.crossref_base = "https://api.crossref.org/works"
    
    def fetch_paper(self, query: str, source: str = "arxiv") -> Dict:
        """从真实API获取论文"""
        if source == "arxiv":
            return self._fetch_arxiv(query)
        elif source == "pubmed":
            return self._fetch_pubmed(query)
        elif source == "doi":
            return self._fetch_crossref(query)
        return {}
    
    def _fetch_arxiv(self, query: str) -> Dict:
        url = f"{self.arxiv_base}?search_query=all:{urllib.parse.quote(query)}&max_results=1"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Swarmlabs/1.0'})
            data = urllib.request.urlopen(req, timeout=15).read().decode()
            # 解析arXiv Atom XML
            entry = {}
            entry['title'] = re.search(r'<entry>.*?<title>(.*?)</title>', data, re.S)
            entry['title'] = entry['title'].group(1).strip() if entry['title'] else ""
            summary = re.search(r'<entry>.*?<summary>(.*?)</summary>', data, re.S)
            entry['abstract'] = summary.group(1).strip() if summary else ""
            entry['authors'] = re.findall(r'<name>(.*?)</name>', data)
            link = re.search(r'<entry>.*?<id>(.*?)</id>', data, re.S)
            entry['url'] = link.group(1).strip() if link else ""
            date = re.search(r'<entry>.*?<published>(.*?)</published>', data, re.S)
            entry['date'] = date.group(1)[:10] if date else ""
            return entry
        except Exception as e:
            return {"error": str(e)}
    
    def _fetch_pubmed(self, query: str) -> Dict:
        # esearch获取PMID
        url = f"{self.pubmed_base}/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmax=1&retmode=json"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Swarmlabs/1.0'})
            data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
            pmids = data.get('esearchresult', {}).get('idlist', [])
            if not pmids:
                return {}
            # esummary获取元数据
            pmid = pmids[0]
            url2 = f"{self.pubmed_base}/esummary.fcgi?db=pubmed&id={pmid}&retmode=json"
            req2 = urllib.request.Request(url2, headers={'User-Agent': 'Swarmlabs/1.0'})
            data2 = json.loads(urllib.request.urlopen(req2, timeout=15).read().decode())
            result = data2.get('result', {}).get(pmid, {})
            return {
                'title': result.get('title', ''),
                'authors': [a.get('name', '') for a in result.get('authors', [])],
                'journal': result.get('fulljournalname', ''),
                'date': result.get('pubdate', ''),
                'pmid': pmid,
                'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _fetch_crossref(self, doi: str) -> Dict:
        url = f"{self.crossref_base}/{doi}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Swarmlabs/1.0 (mailto:research@swarmlabs.tools)'})
            data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
            msg = data.get('message', {})
            return {
                'title': msg.get('title', [''])[0] if msg.get('title') else '',
                'authors': [f"{a.get('given','')} {a.get('family','')}" for a in msg.get('author', [])],
                'journal': msg.get('container-title', [''])[0] if msg.get('container-title') else '',
                'date': msg.get('published-print', msg.get('published-online', {})).get('date-parts', [['']])[0],
                'doi': doi,
                'url': msg.get('URL', ''),
                'volume': msg.get('volume', ''),
                'issue': msg.get('issue', ''),
                'pages': msg.get('page', ''),
                'abstract': msg.get('abstract', ''),
            }
        except Exception as e:
            return {"error": str(e)}
    
    def decompose(self, paper: Dict) -> Dict:
        """审稿视角拆解论文"""
        abstract = paper.get('abstract', '')
        title = paper.get('title', '')
        
        return {
            'research_question': self._extract_question(title, abstract),
            'methodology': self._assess_method(abstract),
            'results': self._extract_results(abstract),
            'boundaries': self._identify_boundaries(abstract),
            'citation_value': self._assess_value(title, abstract),
            'paper_info': paper,
        }
    
    def _extract_question(self, title, abstract):
        # 从摘要提取研究问题
        sentences = abstract.split('.')
        q = sentences[0] if sentences else title
        return {
            'question': q.strip(),
            'clarity': 'high' if len(q) < 200 else 'medium',
            'page_ref': 'Abstract L1',
        }
    
    def _assess_method(self, abstract):
        methods = []
        method_keywords = {
            'experimental': ['experiment', '实验', 'measured', '测定'],
            'computational': ['simulation', 'DFT', 'MD', '模拟', '计算'],
            'theoretical': ['theory', 'model', '理论', '推导'],
            'statistical': ['regression', 'ANOVA', '统计', '回归'],
        }
        for mtype, keywords in method_keywords.items():
            if any(kw.lower() in abstract.lower() for kw in keywords):
                methods.append(mtype)
        return {
            'types': methods or ['unknown'],
            'assessment': 'multi-method' if len(methods) > 1 else 'single-method' if methods else 'unclear',
        }
    
    def _extract_results(self, abstract):
        # 找数值结果
        numbers = re.findall(r'(\d+\.?\d*)\s*(%|nm|μm|K|mol|mg|GHz|eV)', abstract)
        return {
            'quantitative': [f"{n[0]}{n[1]}" for n in numbers[:5]],
            'has_quant': len(numbers) > 0,
        }
    
    def _identify_boundaries(self, abstract):
        boundary_keywords = ['however', 'limitation', 'but', 'only', '尽管', '但是', '局限']
        found = [kw for kw in boundary_keywords if kw.lower() in abstract.lower()]
        return {
            'limitations_mentioned': found,
            'explicit_boundary': len(found) > 0,
        }
    
    def _assess_value(self, title, abstract):
        novelty_kw = ['novel', 'first', 'new', 'unprecedented', '首次', '新型']
        impact = sum(1 for kw in novelty_kw if kw.lower() in (title+abstract).lower())
        return {
            'novelty_score': min(5, impact),
            'citation_recommendation': 'high' if impact >= 2 else 'medium' if impact >= 1 else 'low',
        }


if __name__ == "__main__":
    ps = PaperSpine()
    # 真实测试: 搜索Suzuki偶联论文
    paper = ps.fetch_paper("Suzuki coupling palladium catalyst", "arxiv")
    if paper and 'title' in paper:
        print(f"论文: {paper['title'][:80]}")
        decomposition = ps.decompose(paper)
        print(f"研究问题: {decomposition['research_question']['question'][:80]}")
        print(f"方法类型: {decomposition['methodology']['types']}")
        print(f"结果: {decomposition['results']['quantitative']}")
        print(f"可引用价值: {decomposition['citation_value']['citation_recommendation']}")
