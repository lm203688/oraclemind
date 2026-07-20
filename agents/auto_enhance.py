"""
Agent自动增强模块
在任何agent启动时import此模块,自动为所有agent添加增强能力

用法: 在任何agent脚本开头添加:
    import auto_enhance  # 自动增强所有agent
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from shared.enhanced import enhance_agent

# 自动增强已实例化的agent
_enhanced_agents = set()

def enhance_all():
    """增强所有已加载的agent(12个)"""
    from eve import EveScheduler
    eve = EveScheduler()
    
    # 添加4个新agent
    from data_scientist.agent import DataScientistAgent
    from product_manager.agent import ProductManagerAgent
    from devops.agent import DevOpsAgent
    from tech_writer.agent import TechWriterAgent
    
    eve.agents["data_scientist"] = DataScientistAgent()
    eve.agents["product_manager"] = ProductManagerAgent()
    eve.agents["devops"] = DevOpsAgent()
    eve.agents["tech_writer"] = TechWriterAgent()
    
    for name, agent in eve.agents.items():
        if name not in _enhanced_agents:
            enhance_agent(agent)
            _enhanced_agents.add(name)
    return eve

# 自动执行
if __name__ != "__main__":
    try:
        enhance_all()
    except:
        pass  # 静默失败,不影响正常启动
