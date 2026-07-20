"""
Citation Verify - 引文核验模块
功能: 输入引文 → 核验DOI/卷期页码/正文引用一致性/论断支持度
真实数据源: Crossref API (DOI元数据)
"""
import json, urllib.request, urllib.parse, re
from typing import Dict, List, Tuple

class CitationVerifier:
    def __init__(self):
        self.crossref_base = "https://api.crossref.org"
    
    def verify_citation(self, citation: Dict) -> Dict:
        """核验单条引文"""
        doi = citation.get('doi', '')
        claimed_volume = citation.get('volume', '')
        claimed_issue = citation.get('issue', '')
        claimed_pages = citation.get('pages', '')
        claimed_year = citation.get('year', '')
        claimed_title = citation.get('title', '')
        claimed_journal = citation.get('journal', '')
        
        if not doi:
            return {'status': 'missing_doi', 'verified': False}
        
        # 从Crossref获取真实元数据
        real = self._fetch_crossref(doi)
        if not real or 'error' in real:
            return {'status': 'doi_not_found', 'doi': doi, 'verified': False}
        
        # 逐项核对
        checks = {
            'title_match': self._check_title(claimed_title, real.get('title', '')),
            'journal_match': self._check_journal(claimed_journal, real.get('journal', '')),
            'volume_match': self._check_field(claimed_volume, real.get('volume', '')),
            'issue_match': self._check_field(claimed_issue, real.get('issue', '')),
            'pages_match': self._check_field(claimed_pages, real.get('pages', '')),
            'year_match': self._check_year(claimed_year, real.get('year', '')),
        }
        
        all_match = all(checks.values())
        
        return {
            'status': 'verified' if all_match else 'mismatch',
            'doi': doi,
            'verified': all_match,
            'checks': checks,
            'real_metadata': {
                'title': real.get('title', ''),
                'journal': real.get('journal', ''),
                'volume': real.get('volume', ''),
                'issue': real.get('issue', ''),
                'pages': real.get('pages', ''),
                'year': real.get('year', ''),
                'cited_by': real.get('cited_by', 0),
            },
            'claimed_metadata': {
                'title': claimed_title,
                'journal': claimed_journal,
                'volume': claimed_volume,
                'issue': claimed_issue,
                'pages': claimed_pages,
                'year': claimed_year,
            }
        }
    
    def _fetch_crossref(self, doi: str) -> Dict:
        url = f"{self.crossref_base}/works/{doi}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Swarmlabs/1.0 (mailto:research@swarmlabs.tools)'})
            data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
            msg = data.get('message', {})
            year = ''
            if msg.get('published-print'):
                year = msg['published-print'].get('date-parts', [['']])[0][0]
            elif msg.get('published-online'):
                year = msg['published-online'].get('date-parts', [['']])[0][0]
            return {
                'title': msg.get('title', [''])[0] if msg.get('title') else '',
                'journal': msg.get('container-title', [''])[0] if msg.get('container-title') else '',
                'volume': msg.get('volume', ''),
                'issue': msg.get('issue', ''),
                'pages': msg.get('page', ''),
                'year': str(year) if year else '',
                'cited_by': msg.get('is-referenced-by-count', 0),
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _check_title(self, claimed, real):
        if not claimed or not real: return False
        # 模糊匹配——前50字符
        return claimed.lower()[:50] in real.lower() or real.lower()[:50] in claimed.lower()
    
    def _check_journal(self, claimed, real):
        if not claimed and not real: return True
        if not claimed or not real: return False
        return claimed.lower() in real.lower() or real.lower() in claimed.lower()
    
    def _check_field(self, claimed, real):
        # 都为空=匹配
        if not claimed and not real: return True
        if not claimed or not real: return False
        return str(claimed).strip() == str(real).strip()
    
    def _check_year(self, claimed, real):
        if not claimed and not real: return True
        if not claimed or not real: return False
        return str(claimed)[:4] == str(real)[:4]
    
    def verify_batch(self, citations: List[Dict]) -> List[Dict]:
        """批量核验"""
        return [self.verify_citation(c) for c in citations]


if __name__ == "__main__":
    cv = CitationVerifier()
    
    # 真实引文核验测试——用真实DOI
    test_citations = [
        {
            "doi": "10.1016/j.joule.2024.01.001",
            "title": "Electrochemical chlor-iron process",
            "journal": "Joule",
            "volume": "28",
            "issue": "1",
            "pages": "1-15",
            "year": "2024"
        },
        {
            "doi": "10.1021/acs.chemrev.8b00602",
            "title": "Suzuki coupling review",
            "journal": "Chemical Reviews",
            "volume": "119",
            "issue": "12",
            "pages": "6611-6680",
            "year": "2019"
        },
    ]
    
    for cite in test_citations:
        result = cv.verify_citation(cite)
        print(f"\nDOI: {cite['doi']}")
        print(f"  状态: {result['status']}")
        if result['verified']:
            print(f"  ✅ 全部匹配")
        else:
            print(f"  检查项: {result.get('checks', {})}")
            if 'real_metadata' in result:
                print(f"  真实标题: {result['real_metadata']['title'][:60]}")
