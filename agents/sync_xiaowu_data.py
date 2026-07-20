#!/usr/bin/env python3
"""
小乌数据同步脚本——从GitHub agent-results私仓同步数据到14站知识库
用法: python3 sync_xiaowu_data.py
"""
import json, os, sys, shutil, subprocess, re, hashlib
from datetime import datetime
from pathlib import Path

BASE = Path('/home/z/my-project')
REPO_URL = 'https://github.com/lm203688/agent-results.git'
CLONE_DIR = Path('/tmp/agent-results-sync')
STATE_FILE = BASE / 'agents' / 'xiaowu_sync_state.json'

# task文件 → 站点+entity文件 映射
TASK_MAP = {
    # BCI相关 → brain-science
    'task02_synchron_bci': ('brain-science', 'bci.json'),
    'task09_neuralink_bcis': ('brain-science', 'bci.json'),
    'task09_tencent_news_bcis': ('brain-science', 'bci.json'),
    # 量子计算 → quantum-computing
    'task05_nasa_quantum_computers': ('quantum-computing', 'processors.json'),
    'task08_rigetti_quantum_processors': ('quantum-computing', 'processors.json'),
    'task08_nasa_sensors': ('exo-science', 'space_telescopes.json'),
    # 中医药 → tcm-tools
    'task08_cnzyao_chinese_herbs': ('tcm-tools', 'herbs.json'),
    'task08_nicu_pku_chinese_medicine': ('tcm-tools', 'tcm_innovative_drugs.json'),
    'task08_yellow_four': ('life-science', 'biomanufacturing.json'),
    'task09_neuralink_bcis': ('brain-science', 'neural_implants.json'),
    # NASA TESS exoplanets → exo-science
    'task08_30_nasa_tess_exoplanets': ('exo-science', 'exoplanets.json'),
    # 枸杞 → tcm-tools
    'task09_wolfberry': ('tcm-tools', 'herbs.json'),
    # Kymriah CAR-T → genetech-tools
    'task12_kymriah': ('genetech-tools', 'gene_therapies.json'),
    # BCI companies → brain-science
    'task08_13_bci_companies': ('brain-science', 'bci_devices.json'),
    # Novanta adapters → robot-parts
    'task09_novanta_adapters': ('robot-parts', 'actuators.json'),
    # 50 TCM herbal medicines → tcm-tools
    'task08_50_tcm_herbal_medicines': ('tcm-tools', 'herbs.json'),
}

def load_state():
    if STATE_FILE.exists():
        return json.load(open(STATE_FILE))
    return {'synced_files': []}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    json.dump(state, open(STATE_FILE, 'w'), ensure_ascii=False, indent=2)

def clone_or_pull():
    """克隆或更新agent-results仓库"""
    if CLONE_DIR.exists():
        os.chdir(CLONE_DIR)
        subprocess.run(['git', 'pull', '--quiet'], capture_output=True)
    else:
        subprocess.run(['git', 'clone', '--quiet', REPO_URL, str(CLONE_DIR)], capture_output=True)
        os.chdir(CLONE_DIR)
    return CLONE_DIR / 'results'

def find_task_file_mapping(filename):
    """根据文件名找到站点映射"""
    name = filename.replace('.json', '')
    # 精确匹配
    if name in TASK_MAP:
        return TASK_MAP[name]
    # 模糊匹配
    for key, (site, entity) in TASK_MAP.items():
        if key in name or name in key:
            return (site, entity)
    # 按关键词推断
    lower = name.lower()
    if 'bci' in lower or 'neural' in lower or 'brain' in lower:
        return ('brain-science', 'bci.json')
    if 'quantum' in lower:
        return ('quantum-computing', 'processors.json')
    if 'tcm' in lower or 'herb' in lower or 'chinese_medicine' in lower or 'wolfberry' in lower:
        return ('tcm-tools', 'herbs.json')
    if 'nasa' in lower or 'exoplanet' in lower or 'tess' in lower:
        return ('exo-science', 'exoplanets.json')
    if 'gene' in lower or 'kymriah' in lower or 'car-t' in lower:
        return ('genetech-tools', 'gene_therapies.json')
    if 'robot' in lower or 'novanta' in lower or 'adapter' in lower:
        return ('robot-parts', 'actuators.json')
    return None

def sync_data(results_dir, state):
    """同步数据"""
    synced = state.get('synced_files', [])
    new_count = 0
    updated_sites = set()
    details = []
    
    for date_dir in sorted(results_dir.iterdir()):
        if not date_dir.is_dir() or date_dir.name == 'test':
            continue
        
        for json_file in date_dir.glob('*.json'):
            file_key = f"{date_dir.name}/{json_file.name}"
            
            if file_key in synced:
                continue  # 已同步
            
            # 找映射
            mapping = find_task_file_mapping(json_file.name)
            if not mapping:
                details.append(f"  ⚠️ {file_key}: 无映射规则，跳过")
                synced.append(file_key)
                continue
            
            site, entity_file = mapping
            entity_path = BASE / site / 'knowledge-base' / 'entities' / entity_file
            
            # 读取新数据
            try:
                new_data = json.load(open(json_file))
                if not isinstance(new_data, list):
                    new_data = [new_data]
            except:
                details.append(f"  ❌ {file_key}: JSON解析失败")
                continue
            
            # 读取现有数据
            existing = []
            if entity_path.exists():
                try:
                    existing = json.load(open(entity_path))
                    if not isinstance(existing, list):
                        existing = [existing]
                except:
                    existing = []
            
            # 合并——按id去重
            existing_ids = set()
            for item in existing:
                if isinstance(item, dict):
                    item_id = item.get('id', '')
                    if item_id:
                        existing_ids.add(item_id)
            
            added = 0
            for item in new_data:
                if not isinstance(item, dict):
                    continue
                item_id = item.get('id', '')
                if not item_id:
                    # 生成ID
                    item_id = f"XW-{hashlib.md5(str(item).encode()).hexdigest()[:8]}"
                    item['id'] = item_id
                if item_id not in existing_ids:
                    existing.append(item)
                    existing_ids.add(item_id)
                    added += 1
            
            # 写入
            if added > 0:
                entity_path.parent.mkdir(parents=True, exist_ok=True)
                json.dump(existing, open(entity_path, 'w'), ensure_ascii=False, indent=2)
                updated_sites.add(site)
                details.append(f"  ✅ {file_key} → {site}/{entity_file}: +{added}条")
                new_count += added
            else:
                details.append(f"  ➡️ {file_key} → {site}/{entity_file}: 无新增(已存在)")
            
            synced.append(file_key)
    
    state['synced_files'] = synced
    state['last_sync'] = datetime.now().isoformat()
    save_state(state)
    
    return new_count, updated_sites, details

def rebuild_and_deploy(sites):
    """重建+部署受影响的站点"""
    for site in sites:
        site_dir = BASE / site
        if not site_dir.exists():
            continue
        
        # rebuild
        rebuild_script = BASE / 'kb-workflow' / 'scripts' / 'rebuild.js'
        if rebuild_script.exists():
            subprocess.run(['node', str(rebuild_script), site], capture_output=True, cwd=BASE)
        
        # add-agent-api
        add_api = BASE / 'kb-workflow' / 'scripts' / 'add-agent-api.js'
        if add_api.exists():
            subprocess.run(['node', str(add_api)], capture_output=True, cwd=BASE)

def main():
    print("=== 小乌数据同步 ===\n")
    
    # 1. 克隆/更新仓库
    print("1. 更新agent-results仓库...")
    results_dir = clone_or_pull()
    if not results_dir.exists():
        print("❌ 仓库克隆失败")
        return
    
    # 2. 加载状态
    state = load_state()
    
    # 3. 同步数据
    print("2. 同步数据...")
    new_count, updated_sites, details = sync_data(results_dir, state)
    
    for d in details:
        print(d)
    
    # 4. 重建+部署
    if new_count > 0:
        print(f"\n3. 重建{len(updated_sites)}个站点...")
        rebuild_and_deploy(updated_sites)
    
    # 5. 汇总
    print(f"\n=== 同步完成 ===")
    print(f"新增数据: {new_count}条")
    print(f"更新站点: {len(updated_sites)}个 ({', '.join(updated_sites) if updated_sites else '无'})")
    
    if new_count == 0:
        print("\n小乌数据同步完成，无新增")

if __name__ == '__main__':
    main()
