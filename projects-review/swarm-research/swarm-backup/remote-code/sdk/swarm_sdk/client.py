"""
蜂群科研 Python SDK — 客户端
开源引流，核心算力付费

用法:
    from swarm_sdk import SwarmClient
    client = SwarmClient(api_key="your_key")
    
    # 启动研究
    research = client.start_research(topic="AI药物发现", user_id="me")
    
    # 运行文献蜂
    result = client.run_bee(research["research_id"], "literature_bee", user_id="me")
    
    # 运行化学蜂（计算分子性质）
    result = client.run_bee(research["research_id"], "chemistry_bee", 
                           user_id="me", mode="property", smiles="CC(=O)OC1=CC=CC=C1C(=O)O")
    
    # 验证蜂
    result = client.run_bee(research["research_id"], "verification_bee", user_id="me")
    
    # 入库验证结果
    result = client.deposit_verified(research["research_id"], user_id="me")
    
    # 搜索知识库
    results = client.search_kb(query="logP")
    
    # AI跨领域发现
    analysis = client.cross_domain_analysis(kb_id="kb_xxx", user_id="me")
"""
import json
import urllib.request
import urllib.parse


class SwarmAPIError(Exception):
    """API错误"""
    pass


class SwarmClient:
    """蜂群科研平台客户端"""
    
    def __init__(self, api_key="", base_url="http://8.217.147.255:8450"):
        """
        Args:
            api_key: 平台API Key（注册后获取）
            base_url: 平台地址（默认公共服务）
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
    
    def _request(self, method, path, data=None, params=None):
        """发送HTTP请求"""
        url = self.base_url + path
        if params:
            url += "?" + urllib.parse.urlencode(params)
        
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        
        body = json.dumps(data).encode() if data else None
        
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                result = json.loads(r.read())
            return result
        except urllib.error.HTTPError as e:
            try:
                err = json.loads(e.read())
                raise SwarmAPIError(f"HTTP {e.code}: {err.get('error', err)}")
            except:
                raise SwarmAPIError(f"HTTP {e.code}")
        except Exception as e:
            raise SwarmAPIError(str(e))
    
    # ============ 用户管理 ============
    
    def register(self, user_id, email=""):
        """注册用户，获得10000积分"""
        return self._request("POST", "/api/v1/register", 
                            {"user_id": user_id, "email": email})
    
    def get_credits(self, user_id):
        """查询积分余额"""
        return self._request("GET", f"/api/v1/credits/{user_id}")
    
    def get_pricing(self):
        """获取定价信息"""
        return self._request("GET", "/api/v1/pricing")
    
    # ============ 研究流程 ============
    
    def start_research(self, topic, user_id, description=""):
        """启动研究项目"""
        return self._request("POST", "/api/v1/research/start",
                            {"user_id": user_id, "topic": topic, "description": description})
    
    def run_bee(self, research_id, bee_type, user_id, **kwargs):
        """
        运行单个蜂
        
        Args:
            research_id: 研究ID
            bee_type: 蜂类型(literature_bee/chemistry_bee/writing_bee/...)
            user_id: 用户ID
            **kwargs: 蜂参数(如chemistry_bee的smiles/mode)
        """
        data = {"user_id": user_id, "bee_type": bee_type}
        data.update(kwargs)
        return self._request("POST", f"/api/v1/research/{research_id}/run", data)
    
    def get_research_status(self, research_id):
        """获取研究进度"""
        return self._request("GET", f"/api/v1/research/{research_id}/status")
    
    def get_research_knowledge(self, research_id):
        """查看研究知识库"""
        return self._request("GET", f"/api/v1/research/{research_id}/knowledge")
    
    def verify_research(self, research_id, user_id):
        """运行验证蜂"""
        return self._request("POST", f"/api/v1/research/{research_id}/verify",
                            {"user_id": user_id})
    
    # ============ 知识库 ============
    
    def search_kb(self, query="", claim_type="", smiles="", limit=20):
        """搜索验证知识库"""
        params = {}
        if query:
            params["q"] = query
        if claim_type:
            params["type"] = claim_type
        if smiles:
            params["smiles"] = smiles
        if limit:
            params["limit"] = str(limit)
        return self._request("GET", "/api/v1/kb/search", params=params)
    
    def get_kb_item(self, kb_id):
        """查看知识条目详情"""
        return self._request("GET", f"/api/v1/kb/{kb_id}")
    
    def deposit_verified(self, research_id, user_id, claim_indices=None):
        """将验证结果入库"""
        data = {"user_id": user_id, "research_id": research_id}
        if claim_indices:
            data["claim_indices"] = claim_indices
        return self._request("POST", "/api/v1/kb/deposit", data)
    
    def cite_knowledge(self, kb_id, user_id, research_id=""):
        """引用知识库条目"""
        return self._request("POST", f"/api/v1/kb/{kb_id}/cite",
                            {"user_id": user_id, "research_id": research_id})
    
    def cross_domain_analysis(self, kb_id, user_id):
        """AI跨领域发现"""
        return self._request("POST", f"/api/v1/kb/{kb_id}/cross-domain",
                            {"user_id": user_id})
    
    def get_kb_stats(self):
        """知识库统计"""
        return self._request("GET", "/api/v1/kb/stats")
    
    def get_user_items(self, user_id):
        """用户入库的条目"""
        return self._request("GET", f"/api/v1/kb/user/{user_id}")
    
    # ============ Skill系统 ============
    
    def list_skills(self):
        """获取所有skill列表"""
        return self._request("GET", "/api/v1/skills")
