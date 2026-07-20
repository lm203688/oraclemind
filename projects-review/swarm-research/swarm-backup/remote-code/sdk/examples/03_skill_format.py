"""
示例3: Skill YAML格式
开源skill定义，社区可贡献新skill
"""
import yaml

# 蜂群skill YAML格式示例
example_skill = """
name: my_custom_bee
display_name: 自定义蜂
description: 用户自定义的科研蜂
icon: 🐝
cost_credits: 500
category: custom
module: agents.my_custom_bee
pipeline_step: null
params:
  - name: input_text
    type: string
    required: true
    description: 输入文本
premium: false
features:
  - 自定义功能1
  - 自定义功能2
"""

print("蜂群Skill YAML格式:")
print(yaml.dump(yaml.safe_load(example_skill), allow_unicode=True, default_flow_style=False))

# 7个内置skill均为开源
# 用户可以:
# 1. 阅读内置skill定义，理解蜂的工作方式
# 2. 编写自定义skill YAML，上传到平台
# 3. 自定义skill用平台算力执行，消耗积分
