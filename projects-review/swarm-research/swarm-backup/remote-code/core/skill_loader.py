"""
蜂群科研平台 — Skill加载系统

每个skill是一个YAML文件，定义：
- name: skill唯一标识
- display_name: 显示名称
- description: 描述
- icon: emoji图标
- cost_credits: 积分消耗
- category: 分类(literature/chemistry/writing/analysis/review/ml)
- module: 对应的Python模块(agents/xxx.py)
- params: 参数定义
- pipeline_step: 在full_pipeline中的位置(可选)

支持：
1. 内置skill（skills/*.yaml）
2. 自定义skill（用户上传，付费功能）
3. 动态加载，无需改代码
"""
import os
import yaml
import glob

SKILLS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skills")


def load_skill(skill_file):
    """加载单个skill定义"""
    try:
        with open(skill_file, 'r', encoding='utf-8') as f:
            skill = yaml.safe_load(f)
        skill['_file'] = os.path.basename(skill_file)
        return skill
    except Exception as e:
        return None


def load_all_skills():
    """加载所有内置skill"""
    skills = {}
    for f in glob.glob(os.path.join(SKILLS_DIR, "*.yaml")):
        skill = load_skill(f)
        if skill and 'name' in skill:
            skills[skill['name']] = skill
    return skills


def get_skill(skill_name):
    """获取单个skill"""
    skills = load_all_skills()
    return skills.get(skill_name)


def get_skills_by_category(category=None):
    """按分类获取skill"""
    skills = load_all_skills()
    if category:
        return {k: v for k, v in skills.items() if v.get('category') == category}
    return skills


def get_pipeline_skills():
    """获取full_pipeline中使用的skill（按step排序）"""
    skills = load_all_skills()
    pipeline_skills = [
        v for v in skills.values()
        if v.get('pipeline_step') is not None
    ]
    pipeline_skills.sort(key=lambda s: s.get('pipeline_step', 99))
    return pipeline_skills


def validate_skill(skill_data):
    """验证skill定义是否合法"""
    required = ['name', 'display_name', 'module', 'cost_credits']
    for field in required:
        if field not in skill_data:
            return False, f"缺少必填字段: {field}"
    return True, "OK"


def list_skills_summary():
    """获取skill列表摘要（给前端用）"""
    skills = load_all_skills()
    result = []
    for name, skill in skills.items():
        result.append({
            'name': name,
            'display_name': skill.get('display_name', name),
            'description': skill.get('description', ''),
            'icon': skill.get('icon', '🐝'),
            'cost_credits': skill.get('cost_credits', 5),
            'category': skill.get('category', 'other'),
            'pipeline_step': skill.get('pipeline_step'),
            'params': skill.get('params', []),
            'premium': skill.get('premium', False),
        })
    return result
