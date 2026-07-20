"""
Swarmlabs Python SDK - 蜂群科研Python SDK
pip install swarmlabs (待发布)
用法:
    from swarmlabs import Swarmlabs
    client = Swarmlabs()
    result = client.run('suzuki', temperature_C=80, time_h=4)
    print(result)
"""
import json, urllib.request, urllib.parse
from typing import Dict, Optional

class Swarmlabs:
    """蜂群科研虚拟实验平台SDK"""
    
    def __init__(self, base_url: str = 'http://localhost:8461', api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
    
    def _request(self, method: str, path: str, data: Dict = None) -> Dict:
        url = f'{self.base_url}{path}'
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        
        if method == 'GET':
            req = urllib.request.Request(url, headers=headers)
        else:
            body = json.dumps(data or {}).encode()
            req = urllib.request.Request(url, data=body, headers=headers, method=method)
        
        try:
            resp = urllib.request.urlopen(req, timeout=30)
            return json.loads(resp.read().decode())
        except Exception as e:
            return {'error': str(e)}
    
    def list_engines(self) -> Dict:
        """列出全部166个引擎"""
        return self._request('GET', '/api/v1/engines/all')
    
    def run(self, engine: str, **params) -> Dict:
        """运行虚拟实验
        
        Args:
            engine: 引擎名(如'suzuki', 'battery')
            **params: 实验参数(temperature_C, concentration, time_h等)
        
        Returns:
            {'engine': 'suzuki', 'result': {'result': 68.0, ...}, 'status': 'success'}
        """
        return self._request('POST', f'/api/v2/run/{engine}', params)
    
    def optimize(self, engine: str, objectives: list = None, n_iterations: int = 100) -> Dict:
        """AI参数优化
        
        Args:
            engine: 引擎名
            objectives: 优化目标(如['maximize_conversion', 'minimize_time'])
            n_iterations: 迭代次数
        
        Returns:
            {'optimization': {'best_params': {...}, 'best_result': 95.0, ...}}
        """
        data = {'objectives': objectives or ['maximize_conversion'], 'n_iterations': n_iterations}
        return self._request('POST', f'/api/v2/optimize/{engine}', data)
    
    def validate(self, engine: str) -> Dict:
        """验证引擎精度
        
        Returns:
            {'validation': {'n_validations': 100, 'mean_error': 4.2, 'reliability': 99.0, ...}}
        """
        return self._request('GET', f'/api/v2/validate/{engine}')
    
    def info(self, engine: str) -> Dict:
        """获取引擎信息"""
        return self._request('GET', f'/api/v2/info/{engine}')
    
    def health(self) -> bool:
        """检查API健康状态"""
        result = self._request('GET', '/api/v1/health')
        return 'error' not in result


# 便捷函数
def run_experiment(engine: str, **params) -> Dict:
    """快捷运行实验(无需创建client)"""
    client = Swarmlabs()
    return client.run(engine, **params)

def list_all_engines() -> list:
    """快捷列出所有引擎"""
    client = Swarmlabs()
    return client.list_engines().get('engines', [])


if __name__ == '__main__':
    # 示例用法
    client = Swarmlabs()
    
    print("=== 蜂群科研Python SDK ===\n")
    
    # 列出引擎
    engines = client.list_engines()
    print(f"可用引擎: {engines.get('total', 0)}个")
    
    # 运行实验
    result = client.run('suzuki', temperature_C=80, concentration=1.0, time_h=4)
    r = result.get('result', {})
    print(f"\nSuzuki实验: {r.get('result', 0):.1f}% (模型: {r.get('model', '')})")
    
    # 优化
    opt = client.optimize('suzuki', n_iterations=50)
    o = opt.get('optimization', {})
    print(f"优化结果: best={o.get('best_result', 0):.1f}%")
    
    # 验证
    val = client.validate('suzuki')
    v = val.get('validation', {})
    print(f"验证: {v.get('n_validations', 0)}组, 均值{v.get('mean_error', 0)}%")
