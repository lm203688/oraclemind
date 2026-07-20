
# Eve增强patch——在EveScheduler.__init__中添加以下代码:
# 1. 在文件顶部添加: from shared.enhanced import enhance_agent
# 2. 在self.agents字典定义后添加:
#    for name, agent in self.agents.items():
#        enhance_agent(agent)

# 使用方法: 在eve.py中import后手动添加,或等权限修复后自动集成
