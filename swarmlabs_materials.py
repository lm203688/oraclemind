#!/usr/bin/env python3
from typing import Dict, List, Tuple, Any
"""
蜂群科研——材料预设库

为批量筛选提供常见材料候选：
- 光催化催化剂库（TiO2/CdS/ZnO/g-C3N4/BiVO4等20+）
- 吸附剂库（活性炭/氧化铁/沸石/MOF等20+）
- 电极材料库（LiCoO2/石墨/LFP/NCM等15+）
- 腐蚀材料库（碳钢/不锈钢/铝合金/铜等10+）
- 钙钛矿材料库（MAPbI3/FAPbI3/混合阳离子等10+）

用户: "帮我筛选光催化催化剂"
系统: 自动从库中取20种材料→批量运行→返回Top 5
"""

MATERIAL_LIBRARY = {
    # ============================================================
    # 光催化催化剂
    # ============================================================
    'photocatalysis': {
        'TiO2-P25':     {'catalyst': 'TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'TiO2-anatase': {'catalyst': 'TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'TiO2-rutile':  {'catalyst': 'TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'CdS':          {'catalyst': 'CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'ZnO':          {'catalyst': 'ZnO', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'g-C3N4':       {'catalyst': 'g-C3N4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'BiVO4':        {'catalyst': 'BiVO4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'WO3':          {'catalyst': 'WO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Fe2O3':        {'catalyst': 'Fe2O3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'MoS2':         {'catalyst': 'MoS2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Pt-TiO2':      {'catalyst': 'Pt-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Au-TiO2':      {'catalyst': 'Au-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'CdSe':         {'catalyst': 'CdSe', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Ga2O3':        {'catalyst': 'Ga2O3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Ta2O5':        {'catalyst': 'Ta2O5', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'SrTiO3':       {'catalyst': 'SrTiO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'KNbO3':        {'catalyst': 'KNbO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'Ag3PO4':       {'catalyst': 'Ag3PO4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'In2S3':        {'catalyst': 'In2S3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
        'SnS2':         {'catalyst': 'SnS2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    },
    
    # ============================================================
    # 吸附剂
    # ============================================================
    'adsorption': {
        '活性炭':           {'adsorbent': 'activated_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '氧化铁':           {'adsorbent': 'Fe2O3', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '氧化铝':           {'adsorbent': 'Al2O3', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '沸石13X':          {'adsorbent': 'zeolite_13X', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '沸石4A':           {'adsorbent': 'zeolite_4A', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        'MOF-808':         {'adsorbent': 'MOF_808', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        'UiO-66':          {'adsorbent': 'UiO_66', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        'MIL-101':         {'adsorbent': 'MIL_101', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '蒙脱土':           {'adsorbent': 'montmorillonite', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '高岭土':           {'adsorbent': 'kaolin', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '碳纳米管':          {'adsorbent': 'CNT', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '石墨烯':           {'adsorbent': 'graphene_oxide', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '壳聚糖':           {'adsorbent': 'chitosan', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '生物炭':           {'adsorbent': 'biochar', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '二氧化钛':          {'adsorbent': 'TiO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '氧化石墨烯':         {'adsorbent': 'GO', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '凹凸棒石':          {'adsorbent': 'attapulgite', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '海泡石':           {'adsorbent': 'sepiolite', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '磁性Fe3O4':       {'adsorbent': 'Fe3O4', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
        '椰壳活性炭':         {'adsorbent': 'coconut_carbon', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    },
    
    # ============================================================
    # 电池电极材料
    # ============================================================
    'battery': {
        'LiCoO2':         {'cathode': 'LiCoO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
        'LiFePO4':        {'cathode': 'LiFePO4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
        'NCM-532':        {'cathode': 'NCM532', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
        'NCM-811':        {'cathode': 'NCM811', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
        'NCA':            {'cathode': 'NCA', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
        'LiMn2O4':        {'cathode': 'LiMn2O4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
        'Li-rich':        {'cathode': 'Li-rich', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
        '石墨':            {'cathode': 'graphite', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
        '硅碳':            {'cathode': 'Si-C', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
        'Li4Ti5O12':     {'cathode': 'LTO', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 1.0},
        '硬碳':            {'cathode': 'hard_carbon', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
        'SnO2':           {'cathode': 'SnO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    },
    
    # ============================================================
    # 腐蚀材料
    # ============================================================
    'corrosion': {
        '碳钢':       {'material': 'carbon_steel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '304不锈钢':  {'material': 'SS304', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '316不锈钢':  {'material': 'SS316', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '铝合金':     {'material': 'Al_alloy', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '铜':         {'material': 'copper', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '黄铜':       {'material': 'brass', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '钛合金':     {'material': 'Ti_alloy', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '镀锌钢':     {'material': 'galvanized_steel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '双相不锈钢': {'material': 'duplex_SS', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
        '哈氏合金':   {'material': 'hastelloy', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    },
    
    # ============================================================
    # 钙钛矿材料
    # ============================================================
    'perovskite': {
        'MAPbI3':         {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
        'FAPbI3':         {'composition': 'FAPbI3', 'annealing_temp': 150, 'annealing_time': 60, 'thickness': 500},
        'MAFAPbI3':       {'composition': 'MAFAPbI3', 'annealing_temp': 120, 'annealing_time': 60, 'thickness': 500},
        'CsFAPbI3':       {'composition': 'CsFAPbI3', 'annealing_temp': 130, 'annealing_time': 60, 'thickness': 500},
        'MAPbBr3':        {'composition': 'MAPbBr3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
        'FAPbBr3':        {'composition': 'FAPbBr3', 'annealing_temp': 120, 'annealing_time': 60, 'thickness': 500},
        'CsPbI3':         {'composition': 'CsPbI3', 'annealing_temp': 200, 'annealing_time': 60, 'thickness': 500},
        'CsPbBr3':        {'composition': 'CsPbBr3', 'annealing_temp': 200, 'annealing_time': 60, 'thickness': 500},
        'RbFAPbI3':       {'composition': 'RbFAPbI3', 'annealing_temp': 140, 'annealing_time': 60, 'thickness': 500},
        'K-doped MAPbI3': {'composition': 'K-MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
    },
    
    # ============================================================
    # CO2还原催化剂
    # ============================================================
    'co2': {
        'Cu':             {'catalyst': 'Cu', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Ag':             {'catalyst': 'Ag', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Au':             {'catalyst': 'Au', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Zn':             {'catalyst': 'Zn', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Sn':             {'catalyst': 'Sn', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Pb':             {'catalyst': 'Pb', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Bi':             {'catalyst': 'Bi', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Cu-Ag合金':      {'catalyst': 'CuAg', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Cu-Au合金':      {'catalyst': 'CuAu', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'Cu2O':           {'catalyst': 'Cu2O', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'CuO':            {'catalyst': 'CuO', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
        'N-Cu':           {'catalyst': 'N-Cu', 'potential': -1.0, 'CO2_pressure': 1, 'temperature': 25, 'electrolyte': 'KHCO3'},
    },
}


def get_materials(engine_name: str, category: str = None) -> Dict:
    """获取材料库"""
    materials = MATERIAL_LIBRARY.get(engine_name, {})
    if category:
        materials = {k: v for k, v in materials.items() if category.lower() in k.lower()}
    return materials


def auto_screen(engine_name: str, top_k: int = 5, **overrides):
    """自动从材料库生成候选并筛选"""
    materials = MATERIAL_LIBRARY.get(engine_name, {})
    if not materials:
        return {'error': f'No materials found for engine {engine_name}'}
    
    candidates = []
    for name, conditions in materials.items():
        # 应用用户覆盖条件
        merged = {**conditions, **overrides}
        candidates.append({'label': name, 'conditions': merged})
    
    # 调用加速器筛选
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from swarmlabs_accelerator import VirtualAccelerator
    acc = VirtualAccelerator()
    
    return acc.batch_screening(engine_name, candidates, top_k=top_k)


if __name__ == '__main__':
    # 测试：自动筛选光催化催化剂
    print("=== 自动筛选光催化催化剂 ===")
    result = auto_screen('photocatalysis', top_k=5)
    print(result['recommendation'])
    
    print("\n=== 自动筛选吸附剂 ===")
    result = auto_screen('adsorption', top_k=5)
    print(result['recommendation'])
    
    print("\n=== 自动筛选电池正极材料 ===")
    result = auto_screen('battery', top_k=3)
    print(result['recommendation'])
    
    print("\n=== 材料库统计 ===")
    for engine, materials in MATERIAL_LIBRARY.items():
        print(f"  {engine}: {len(materials)}种材料")


# ============================================================
# 扩展材料库——24个引擎
# ============================================================

MATERIAL_LIBRARY.update({
    'ammonia': {
        'Fe基催化剂':     {'catalyst': 'Fe', 'temperature': 450, 'pressure': 200, 'H2_N2_ratio': 3, 'space_velocity': 10000},
        'Ru基催化剂':     {'catalyst': 'Ru', 'temperature': 400, 'pressure': 100, 'H2_N2_ratio': 3, 'space_velocity': 8000},
        'Co-Mo-N':       {'catalyst': 'CoMoN', 'temperature': 400, 'pressure': 150, 'H2_N2_ratio': 3, 'space_velocity': 9000},
        'Cs-Ru/C':       {'catalyst': 'CsRu', 'temperature': 350, 'pressure': 80, 'H2_N2_ratio': 3, 'space_velocity': 6000},
        'Ba-Ru':         {'catalyst': 'BaRu', 'temperature': 380, 'pressure': 50, 'H2_N2_ratio': 3, 'space_velocity': 5000},
        'Fe-Al2O3-K2O': {'catalyst': 'FeK', 'temperature': 450, 'pressure': 200, 'H2_N2_ratio': 3, 'space_velocity': 10000},
        'Ni-MgO':        {'catalyst': 'NiMgO', 'temperature': 500, 'pressure': 100, 'H2_N2_ratio': 3, 'space_velocity': 7000},
        'MoP':           {'catalyst': 'MoP', 'temperature': 450, 'pressure': 150, 'H2_N2_ratio': 3, 'space_velocity': 8000},
    },
    
    'bioreactor': {
        'E.coli':        {'organism': 'E_coli', 'substrate': 'glucose', 'S0': 20, 'temperature': 37, 'pH': 7.0, 'DO': 30, 'stirring': 200},
        '酵母':          {'organism': 'yeast', 'substrate': 'glucose', 'S0': 50, 'temperature': 30, 'pH': 5.5, 'DO': 20, 'stirring': 150},
        'CHO细胞':       {'organism': 'CHO', 'substrate': 'glucose', 'S0': 10, 'temperature': 37, 'pH': 7.2, 'DO': 40, 'stirring': 100},
        '枯草芽孢杆菌':   {'organism': 'B_subtilis', 'substrate': 'glycerol', 'S0': 30, 'temperature': 32, 'pH': 6.8, 'DO': 30, 'stirring': 180},
        '乳酸菌':        {'organism': 'lactobacillus', 'substrate': 'lactose', 'S0': 40, 'temperature': 37, 'pH': 6.0, 'DO': 0, 'stirring': 50},
        '青霉':          {'organism': 'penicillium', 'substrate': 'sucrose', 'S0': 60, 'temperature': 25, 'pH': 6.5, 'DO': 25, 'stirring': 120},
        '蓝藻':          {'organism': 'cyanobacteria', 'substrate': 'CO2', 'S0': 5, 'temperature': 30, 'pH': 8.0, 'DO': 100, 'stirring': 80},
        '微藻':          {'organism': 'microalgae', 'substrate': 'CO2', 'S0': 5, 'temperature': 28, 'pH': 7.5, 'DO': 80, 'stirring': 60},
    },
    
    'combustion': {
        'CH4-空气':      {'fuel': 'CH4', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'CH4-纯氧':      {'fuel': 'CH4', 'oxidizer': 'O2', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'H2-空气':       {'fuel': 'H2', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'C8H18-空气':    {'fuel': 'C8H18', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'CO-空气':       {'fuel': 'CO', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'C2H4-空气':     {'fuel': 'C2H4', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
        'CH4-贫燃':      {'fuel': 'CH4', 'oxidizer': 'air', 'phi': 0.6, 'T_in': 500, 'P': 101325},
        'CH4-富燃':      {'fuel': 'CH4', 'oxidizer': 'air', 'phi': 1.5, 'T_in': 300, 'P': 101325},
        'NH3-空气':      {'fuel': 'NH3', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 400, 'P': 101325},
        'CH3OH-空气':    {'fuel': 'CH3OH', 'oxidizer': 'air', 'phi': 1.0, 'T_in': 300, 'P': 101325},
    },
    
    'complexometric': {
        'EDTA-Ca':       {'titrant': 'EDTA', 'metal': 'Ca', 'concentration': 0.01, 'pH': 10, 'indicator': 'EBT'},
        'EDTA-Mg':       {'titrant': 'EDTA', 'metal': 'Mg', 'concentration': 0.01, 'pH': 10, 'indicator': 'EBT'},
        'EDTA-Zn':       {'titrant': 'EDTA', 'metal': 'Zn', 'concentration': 0.01, 'pH': 10, 'indicator': 'EBT'},
        'EDTA-Cu':       {'titrant': 'EDTA', 'metal': 'Cu', 'concentration': 0.01, 'pH': 10, 'indicator': 'PAN'},
        'EDTA-Fe':       {'titrant': 'EDTA', 'metal': 'Fe', 'concentration': 0.01, 'pH': 3, 'indicator': 'SS'},
        'EDTA-Ni':       {'titrant': 'EDTA', 'metal': 'Ni', 'concentration': 0.01, 'pH': 10, 'indicator': 'murexide'},
        'EDTA-Pb':       {'titrant': 'EDTA', 'metal': 'Pb', 'concentration': 0.01, 'pH': 10, 'indicator': 'XO'},
        'EDTA-Al':       {'titrant': 'EDTA', 'metal': 'Al', 'concentration': 0.01, 'pH': 5, 'indicator': 'XO'},
    },
    
    'crystal': {
        '蔗糖':          {'solute': 'sucrose', 'solvent': 'water', 'C0': 2000, 'T0': 60, 'Tf': 20, 'cooling_rate': 10},
        'NaCl':          {'solute': 'NaCl', 'solvent': 'water', 'C0': 360, 'T0': 80, 'Tf': 25, 'cooling_rate': 15},
        'KNO3':          {'solute': 'KNO3', 'solvent': 'water', 'C0': 500, 'T0': 70, 'Tf': 20, 'cooling_rate': 10},
        'CuSO4':         {'solute': 'CuSO4', 'solvent': 'water', 'C0': 300, 'T0': 60, 'Tf': 20, 'cooling_rate': 8},
        '尿素':          {'solute': 'urea', 'solvent': 'water', 'C0': 800, 'T0': 50, 'Tf': 10, 'cooling_rate': 5},
        '阿司匹林':       {'solute': 'aspirin', 'solvent': 'ethanol', 'C0': 200, 'T0': 50, 'Tf': 5, 'cooling_rate': 3},
        '布洛芬':        {'solute': 'ibuprofen', 'solvent': 'ethanol', 'C0': 150, 'T0': 45, 'Tf': 5, 'cooling_rate': 2},
        '甘氨酸':        {'solute': 'glycine', 'solvent': 'water', 'C0': 250, 'T0': 60, 'Tf': 15, 'cooling_rate': 8},
    },
    
    'distillation': {
        '乙醇-水':       {'mixture': 'ethanol_water', 'xF': 0.3, 'xD_target': 0.95, 'R': 2.0, 'feed_stage': 10, 'N_stages': 20},
        '甲醇-水':       {'mixture': 'methanol_water', 'xF': 0.3, 'xD_target': 0.99, 'R': 1.5, 'feed_stage': 8, 'N_stages': 15},
        '苯-甲苯':       {'mixture': 'benzene_toluene', 'xF': 0.4, 'xD_target': 0.95, 'R': 2.5, 'feed_stage': 10, 'N_stages': 20},
        '丙酮-水':       {'mixture': 'acetone_water', 'xF': 0.2, 'xD_target': 0.99, 'R': 1.8, 'feed_stage': 8, 'N_stages': 15},
        '异丙醇-水':     {'mixture': 'IPA_water', 'xF': 0.25, 'xD_target': 0.95, 'R': 3.0, 'feed_stage': 12, 'N_stages': 25},
        '乙腈-水':       {'mixture': 'acetonitrile_water', 'xF': 0.3, 'xD_target': 0.99, 'R': 2.0, 'feed_stage': 10, 'N_stages': 20},
        '正己烷-甲苯':   {'mixture': 'hexane_toluene', 'xF': 0.4, 'xD_target': 0.95, 'R': 2.0, 'feed_stage': 10, 'N_stages': 18},
        '醋酸-水':       {'mixture': 'acetic_acid_water', 'xF': 0.3, 'xD_target': 0.90, 'R': 3.5, 'feed_stage': 15, 'N_stages': 30},
    },
    
    'drying': {
        '苹果片':        {'material': 'apple', 'T': 60, 'RH': 30, 'v': 1.0, 'thickness': 5},
        '胡萝卜片':      {'material': 'carrot', 'T': 65, 'RH': 25, 'v': 1.5, 'thickness': 4},
        '土豆片':        {'material': 'potato', 'T': 70, 'RH': 20, 'v': 1.5, 'thickness': 3},
        '木材':          {'material': 'wood', 'T': 80, 'RH': 15, 'v': 2.0, 'thickness': 20},
        '陶瓷':          {'material': 'ceramic', 'T': 120, 'RH': 5, 'v': 1.0, 'thickness': 10},
        '纸张':          {'material': 'paper', 'T': 90, 'RH': 10, 'v': 2.0, 'thickness': 0.1},
        '药品颗粒':      {'material': 'pharma', 'T': 45, 'RH': 20, 'v': 1.0, 'thickness': 2},
        '污泥':          {'material': 'sludge', 'T': 100, 'RH': 15, 'v': 1.5, 'thickness': 8},
    },
    
    'electrodialysis': {
        'NaCl溶液':      {'salt': 'NaCl', 'C0': 2000, 'voltage': 10, 'flow_rate': 50, 'membrane': 'standard'},
        '海水':          {'salt': 'seawater', 'C0': 35000, 'voltage': 15, 'flow_rate': 30, 'membrane': 'standard'},
        '苦咸水':        {'salt': 'brackish', 'C0': 5000, 'voltage': 12, 'flow_rate': 40, 'membrane': 'standard'},
        'Na2SO4':       {'salt': 'Na2SO4', 'C0': 3000, 'voltage': 10, 'flow_rate': 50, 'membrane': 'monovalent'},
        'CaCl2':        {'salt': 'CaCl2', 'C0': 2500, 'voltage': 10, 'flow_rate': 50, 'membrane': 'standard'},
        'KCl':          {'salt': 'KCl', 'C0': 2000, 'voltage': 10, 'flow_rate': 50, 'membrane': 'standard'},
        'NH4Cl':        {'salt': 'NH4Cl', 'C0': 3000, 'voltage': 12, 'flow_rate': 40, 'membrane': 'standard'},
        '混合盐':        {'salt': 'mixed', 'C0': 4000, 'voltage': 12, 'flow_rate': 35, 'membrane': 'standard'},
    },
    
    'electroplating': {
        '镀铜':          {'metal': 'Cu', 'bath': 'acid_sulfate', 'current_density': 2.0, 'temperature': 25, 'time': 30, 'pH': 1},
        '镀镍':          {'metal': 'Ni', 'bath': 'Watts', 'current_density': 3.0, 'temperature': 50, 'time': 30, 'pH': 4},
        '镀锌':          {'metal': 'Zn', 'bath': 'cyanide', 'current_density': 2.5, 'temperature': 30, 'time': 20, 'pH': 12},
        '镀铬':          {'metal': 'Cr', 'bath': 'chromic_acid', 'current_density': 15, 'temperature': 45, 'time': 10, 'pH': 1},
        '镀金':          {'metal': 'Au', 'bath': 'cyanide', 'current_density': 0.5, 'temperature': 60, 'time': 20, 'pH': 8},
        '镀银':          {'metal': 'Ag', 'bath': 'cyanide', 'current_density': 1.0, 'temperature': 25, 'time': 15, 'pH': 11},
        '镀锡':          {'metal': 'Sn', 'bath': 'acid_stannous', 'current_density': 2.0, 'temperature': 25, 'time': 20, 'pH': 1},
        '合金电镀Ni-Fe': {'metal': 'NiFe', 'bath': 'sulfate', 'current_density': 2.0, 'temperature': 50, 'time': 30, 'pH': 3},
    },
    
    'enzyme': {
        '淀粉酶':        {'enzyme': 'amylase', 'substrate': 'starch', 'S0': 10, 'T': 37, 'pH': 6.8, 'E0': 0.01},
        '蛋白酶':        {'enzyme': 'protease', 'substrate': 'casein', 'S0': 5, 'T': 37, 'pH': 7.5, 'E0': 0.005},
        '脂肪酶':        {'enzyme': 'lipase', 'substrate': 'olive_oil', 'S0': 8, 'T': 40, 'pH': 8.0, 'E0': 0.01},
        '纤维素酶':      {'enzyme': 'cellulase', 'substrate': 'CMC', 'S0': 10, 'T': 50, 'pH': 5.0, 'E0': 0.02},
        '果胶酶':        {'enzyme': 'pectinase', 'substrate': 'pectin', 'S0': 5, 'T': 45, 'pH': 4.5, 'E0': 0.01},
        '乳糖酶':        {'enzyme': 'lactase', 'substrate': 'lactose', 'S0': 50, 'T': 37, 'pH': 6.5, 'E0': 0.005},
        '葡萄糖异构酶':  {'enzyme': 'glucose_isomerase', 'substrate': 'glucose', 'S0': 40, 'T': 60, 'pH': 7.5, 'E0': 0.02},
        '木瓜蛋白酶':    {'enzyme': 'papain', 'substrate': 'casein', 'S0': 5, 'T': 65, 'pH': 6.0, 'E0': 0.01},
    },
    
    'extraction': {
        '乙酸乙酯-水':   {'solvent': 'ethyl_acetate', 'solute': 'acetic_acid', 'C0_aq': 5, 'ratio': 0.5, 'stages': 1},
        '甲苯-水':       {'solvent': 'toluene', 'solute': 'benzoic_acid', 'C0_aq': 3, 'ratio': 0.5, 'stages': 1},
        '二氯甲烷-水':   {'solvent': 'DCM', 'solute': 'caffeine', 'C0_aq': 2, 'ratio': 0.3, 'stages': 1},
        '正己烷-乙醇':   {'solvent': 'hexane', 'solute': 'oil', 'C0_aq': 10, 'ratio': 1.0, 'stages': 1},
        '超临界CO2':     {'solvent': 'scCO2', 'solute': 'caffeine', 'C0_aq': 5, 'ratio': 0.2, 'stages': 1},
        'MIBK-水':      {'solvent': 'MIBK', 'solute': 'phenol', 'C0_aq': 8, 'ratio': 0.5, 'stages': 1},
        '叔丁醇-水':     {'solvent': 't_butanol', 'solute': 'enzyme', 'C0_aq': 3, 'ratio': 0.8, 'stages': 1},
        '离子液体萃取':  {'solvent': 'IL_BMIM', 'solute': 'metal_ion', 'C0_aq': 1, 'ratio': 0.2, 'stages': 1},
    },
    
    'flocculation': {
        'PAC':           {'coagulant': 'PAC', 'dose': 30, 'turbidity': 50, 'pH': 7, 'temperature': 25},
        'PFS':           {'coagulant': 'PFS', 'dose': 25, 'turbidity': 50, 'pH': 7, 'temperature': 25},
        '明矾':          {'coagulant': 'alum', 'dose': 40, 'turbidity': 50, 'pH': 6, 'temperature': 25},
        'FeCl3':        {'coagulant': 'FeCl3', 'dose': 30, 'turbidity': 50, 'pH': 7, 'temperature': 25},
        'PAM-阴离子':    {'coagulant': 'PAM_anion', 'dose': 2, 'turbidity': 50, 'pH': 8, 'temperature': 25},
        'PAM-阳离子':    {'coagulant': 'PAM_cation', 'dose': 2, 'turbidity': 50, 'pH': 6, 'temperature': 25},
        '壳聚糖絮凝':    {'coagulant': 'chitosan', 'dose': 5, 'turbidity': 50, 'pH': 6, 'temperature': 25},
        '复合PAC+PAM':  {'coagulant': 'PAC_PAM', 'dose': 20, 'turbidity': 50, 'pH': 7, 'temperature': 25},
    },
    
    'fluidization': {
        '砂子':          {'particle': 'sand', 'dp': 200, 'rho_s': 2650, 'gas': 'air', 'U': 0.5},
        '催化剂FCC':     {'particle': 'FCC', 'dp': 70, 'rho_s': 1500, 'gas': 'air', 'U': 0.3},
        '煤粉':          {'particle': 'coal', 'dp': 500, 'rho_s': 1400, 'gas': 'air', 'U': 1.0},
        '生物质颗粒':    {'particle': 'biomass', 'dp': 1000, 'rho_s': 600, 'gas': 'air', 'U': 0.8},
        '氧化铝球':      {'particle': 'Al2O3', 'dp': 3000, 'rho_s': 1800, 'gas': 'air', 'U': 2.0},
        '塑料颗粒':      {'particle': 'plastic', 'dp': 500, 'rho_s': 950, 'gas': 'air', 'U': 0.5},
        '活性炭颗粒':    {'particle': 'activated_carbon', 'dp': 800, 'rho_s': 500, 'gas': 'air', 'U': 0.4},
        '小麦':          {'particle': 'wheat', 'dp': 4000, 'rho_s': 800, 'gas': 'air', 'U': 1.5},
    },
    
    'gassolid': {
        'Fe2O3还原':     {'solid': 'Fe2O3', 'gas': 'H2', 'T': 800, 'P': 101325, 'flow': 0.1},
        'CaCO3分解':     {'solid': 'CaCO3', 'gas': 'N2', 'T': 900, 'P': 101325, 'flow': 0.1},
        '碳气化':        {'solid': 'carbon', 'gas': 'CO2', 'T': 1000, 'P': 101325, 'flow': 0.1},
        'ZnO还原':       {'solid': 'ZnO', 'gas': 'CO', 'T': 1200, 'P': 101325, 'flow': 0.1},
        'CuO还原':       {'solid': 'CuO', 'gas': 'H2', 'T': 300, 'P': 101325, 'flow': 0.1},
        'NiO还原':       {'solid': 'NiO', 'gas': 'H2', 'T': 400, 'P': 101325, 'flow': 0.1},
        'MnO2还原':      {'solid': 'MnO2', 'gas': 'CO', 'T': 500, 'P': 101325, 'flow': 0.1},
        '石膏煅烧':      {'solid': 'CaSO4', 'gas': 'air', 'T': 150, 'P': 101325, 'flow': 0.1},
    },
    
    'ion_exchange': {
        '强酸001x7':     {'resin': 'strong_acid', 'ion': 'Ca2+', 'C0': 100, 'flow_rate': 10, 'bed_volume': 100},
        '弱酸D113':      {'resin': 'weak_acid', 'ion': 'Ca2+', 'C0': 100, 'flow_rate': 10, 'bed_volume': 100},
        '强碱201x7':     {'resin': 'strong_base', 'ion': 'Cl-', 'C0': 100, 'flow_rate': 10, 'bed_volume': 100},
        '弱碱D301':      {'resin': 'weak_base', 'ion': 'Cl-', 'C0': 100, 'flow_rate': 10, 'bed_volume': 100},
        '螯合D403':      {'resin': 'chelating', 'ion': 'Cu2+', 'C0': 50, 'flow_rate': 5, 'bed_volume': 100},
        '强酸-钠型':     {'resin': 'strong_acid_Na', 'ion': 'Na+', 'C0': 200, 'flow_rate': 15, 'bed_volume': 100},
        '大孔吸附树脂':  {'resin': 'macroporous', 'ion': 'organic', 'C0': 100, 'flow_rate': 8, 'bed_volume': 100},
        '锂选择性树脂':  {'resin': 'Li_selective', 'ion': 'Li+', 'C0': 500, 'flow_rate': 5, 'bed_volume': 100},
    },
    
    'ionic_liquid': {
        'BMIM-BF4':     {'cation': 'BMIM', 'anion': 'BF4', 'T': 25, 'density': 1.2, 'viscosity': 0.15},
        'BMIM-PF6':     {'cation': 'BMIM', 'anion': 'PF6', 'T': 25, 'density': 1.3, 'viscosity': 0.3},
        'EMIM-TFSI':    {'cation': 'EMIM', 'anion': 'TFSI', 'T': 25, 'density': 1.5, 'viscosity': 0.03},
        'BMIM-Cl':      {'cation': 'BMIM', 'anion': 'Cl', 'T': 60, 'density': 1.1, 'viscosity': 0.8},
        'PYR14-TFSI':   {'cation': 'PYR14', 'anion': 'TFSI', 'T': 25, 'density': 1.4, 'viscosity': 0.06},
        'BMIM-Ac':      {'cation': 'BMIM', 'anion': 'Ac', 'T': 40, 'density': 1.05, 'viscosity': 0.5},
        'OMIM-Cl':      {'cation': 'OMIM', 'anion': 'Cl', 'T': 60, 'density': 1.0, 'viscosity': 1.2},
        'EMIM-Ac':      {'cation': 'EMIM', 'anion': 'Ac', 'T': 40, 'density': 1.1, 'viscosity': 0.1},
    },
    
    'membrane': {
        'RO-海水淡化':   {'membrane_type': 'RO', 'feed': 'seawater', 'C0': 35000, 'P': 60, 'T': 25},
        'RO-苦咸水':     {'membrane_type': 'RO', 'feed': 'brackish', 'C0': 3000, 'P': 20, 'T': 25},
        'NF-软化':       {'membrane_type': 'NF', 'feed': 'hardness', 'C0': 500, 'P': 10, 'T': 25},
        'UF-蛋白分离':   {'membrane_type': 'UF', 'feed': 'protein', 'C0': 1000, 'P': 2, 'T': 25},
        'MF-菌体去除':   {'membrane_type': 'MF', 'feed': 'bacteria', 'C0': 100, 'P': 0.5, 'T': 25},
        'RO-废水回用':   {'membrane_type': 'RO', 'feed': 'wastewater', 'C0': 2000, 'P': 30, 'T': 25},
        '气体分离CO2':   {'membrane_type': 'gas_sep', 'feed': 'CO2_CH4', 'C0': 30, 'P': 20, 'T': 25},
        '渗析-血液':     {'membrane_type': 'dialysis', 'feed': 'blood', 'C0': 100, 'P': 0.1, 'T': 37},
    },
    
    'membrane_distillation': {
        'DCMD-纯水':     {'config': 'DCMD', 'feed': 'pure_water', 'Tf': 60, 'Tp': 20, 'flow': 0.3},
        'DCMD-盐水':     {'config': 'DCMD', 'feed': 'NaCl', 'Tf': 70, 'Tp': 25, 'flow': 0.3},
        'AGMD-海水':     {'config': 'AGMD', 'feed': 'seawater', 'Tf': 80, 'Tp': 20, 'flow': 0.2},
        'SGMD-废水':     {'config': 'SGMD', 'feed': 'wastewater', 'Tf': 70, 'Tp': 25, 'flow': 0.5},
        'VMD-盐水':      {'config': 'VMD', 'feed': 'brine', 'Tf': 65, 'Tp': 20, 'flow': 0.3},
        'PGMD-海水':     {'config': 'PGMD', 'feed': 'seawater', 'Tf': 75, 'Tp': 20, 'flow': 0.25},
        'DCMD-酸液':     {'config': 'DCMD', 'feed': 'HCl', 'Tf': 60, 'Tp': 25, 'flow': 0.2},
        'AGMD-糖液':     {'config': 'AGMD', 'feed': 'sugar', 'Tf': 70, 'Tp': 20, 'flow': 0.2},
    },
    
    'pcr': {
        '人类DNA':       {'template': 'human', 'primer_Tm': 60, 'cycles': 30, 'elongation': 60, 'Mg': 2.0},
        '细菌DNA':       {'template': 'bacteria', 'primer_Tm': 58, 'cycles': 35, 'elongation': 30, 'Mg': 1.5},
        '病毒RNA':       {'template': 'virus', 'primer_Tm': 62, 'cycles': 40, 'elongation': 45, 'Mg': 2.5},
        '植物DNA':       {'template': 'plant', 'primer_Tm': 55, 'cycles': 30, 'elongation': 90, 'Mg': 2.0},
        '真菌DNA':       {'template': 'fungi', 'primer_Tm': 58, 'cycles': 32, 'elongation': 60, 'Mg': 2.0},
        '质粒DNA':       {'template': 'plasmid', 'primer_Tm': 65, 'cycles': 25, 'elongation': 30, 'Mg': 1.5},
        '法医DNA':       {'template': 'forensic', 'primer_Tm': 60, 'cycles': 35, 'elongation': 60, 'Mg': 2.0},
        '环境DNA':       {'template': 'environmental', 'primer_Tm': 55, 'cycles': 40, 'elongation': 45, 'Mg': 2.5},
    },
    
    'photoFenton': {
        'Fe2+-H2O2-UV':  {'catalyst': 'Fe2H2O2', 'light': 'UV', 'C0': 50, 'pH': 3, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Fe3+-H2O2-UV':  {'catalyst': 'Fe3H2O2', 'light': 'UV', 'C0': 50, 'pH': 3, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Fe-柠檬酸-UV':  {'catalyst': 'Fe_citrate', 'light': 'UV', 'C0': 50, 'pH': 5, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Fe-草酸-UV':    {'catalyst': 'Fe_oxalate', 'light': 'UV', 'C0': 50, 'pH': 4, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Fe2+-H2O2-可见': {'catalyst': 'Fe2H2O2', 'light': 'visible', 'C0': 50, 'pH': 3, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Cu-H2O2-UV':   {'catalyst': 'CuH2O2', 'light': 'UV', 'C0': 50, 'pH': 5, 'Fe': 0, 'H2O2': 100, 'T': 25},
        'Fe-蒙脱土-UV':  {'catalyst': 'Fe_mont', 'light': 'UV', 'C0': 50, 'pH': 4, 'Fe': 5, 'H2O2': 100, 'T': 25},
        'Fe-ZSM5-UV':    {'catalyst': 'Fe_ZSM5', 'light': 'UV', 'C0': 50, 'pH': 5, 'Fe': 5, 'H2O2': 100, 'T': 25},
    },
    
    'polymer': {
        'PMMA':          {'monomer': 'MMA', 'initiator': 'AIBN', 'I0': 0.01, 'T': 70, 'time': 120},
        'PS':            {'monomer': 'styrene', 'initiator': 'AIBN', 'I0': 0.01, 'T': 70, 'time': 180},
        'PAN':           {'monomer': 'AN', 'initiator': 'AIBN', 'I0': 0.02, 'T': 60, 'time': 120},
        'PAA':           {'monomer': 'AA', 'initiator': 'KPS', 'I0': 0.01, 'T': 70, 'time': 60},
        'PAM':           {'monomer': 'AM', 'initiator': 'KPS', 'I0': 0.01, 'T': 60, 'time': 120},
        'PVDF':          {'monomer': 'VDF', 'initiator': 'peroxide', 'I0': 0.005, 'T': 80, 'time': 240},
        'PCL':           {'monomer': 'CL', 'initiator': 'SnOct2', 'I0': 0.001, 'T': 120, 'time': 300},
        'PLA':           {'monomer': 'LA', 'initiator': 'SnOct2', 'I0': 0.001, 'T': 130, 'time': 360},
    },
    
    'scfluid': {
        'scCO2-咖啡因':  {'fluid': 'CO2', 'T': 60, 'P': 250, 'solute': 'caffeine', 'flow': 0.5},
        'scCO2-精油':    {'fluid': 'CO2', 'T': 40, 'P': 100, 'solute': 'essential_oil', 'flow': 0.3},
        'scCO2-胆固醇':  {'fluid': 'CO2', 'T': 50, 'P': 200, 'solute': 'cholesterol', 'flow': 0.4},
        'scH2O-酚':      {'fluid': 'H2O', 'T': 400, 'P': 250, 'solute': 'phenol', 'flow': 0.2},
        'scCO2-药物':    {'fluid': 'CO2', 'T': 45, 'P': 150, 'solute': 'drug', 'flow': 0.3},
        'scCO2-聚合物':  {'fluid': 'CO2', 'T': 35, 'P': 200, 'solute': 'polymer', 'flow': 0.1},
        'scCO2-重金属':  {'fluid': 'CO2', 'T': 60, 'P': 300, 'solute': 'metal', 'flow': 0.5},
        'scCO2-染料':    {'fluid': 'CO2', 'T': 50, 'P': 180, 'solute': 'dye', 'flow': 0.3},
    },
    
    'sonochemical': {
        'TiO2超声':      {'reactant': 'TiO4', 'frequency': 20, 'power': 100, 'T': 25, 'time': 60},
        'Ag超声':        {'reactant': 'AgNO3', 'frequency': 40, 'power': 150, 'T': 30, 'time': 30},
        'Au超声':        {'reactant': 'HAuCl4', 'frequency': 40, 'power': 200, 'T': 25, 'time': 45},
        'ZnO超声':       {'reactant': 'ZnAc', 'frequency': 20, 'power': 100, 'T': 50, 'time': 60},
        'CuO超声':       {'reactant': 'CuAc', 'frequency': 30, 'power': 120, 'T': 40, 'time': 60},
        'BaTiO3超声':    {'reactant': 'BaTi', 'frequency': 20, 'power': 200, 'T': 60, 'time': 120},
        'Fe3O4超声':     {'reactant': 'FeCl3', 'frequency': 40, 'power': 150, 'T': 50, 'time': 90},
        'Pd超声':        {'reactant': 'PdCl2', 'frequency': 40, 'power': 150, 'T': 30, 'time': 30},
    },
    
    'suzuki': {
        'Pd(PPh3)4':     {'catalyst': 'Pd_PPh3', 'base': 'K2CO3', 'T': 80, 'time': 12, 'solvent': 'DMF'},
        'Pd(dppf)Cl2':   {'catalyst': 'Pd_dppf', 'base': 'K3PO4', 'T': 100, 'time': 8, 'solvent': 'dioxane'},
        'Pd(OAc)2':      {'catalyst': 'Pd_OAc', 'base': 'Cs2CO3', 'T': 90, 'time': 10, 'solvent': 'toluene'},
        'Pd-PEPPSI':     {'catalyst': 'PEPPSI', 'base': 'K2CO3', 'T': 60, 'time': 6, 'solvent': 'EtOH'},
        'Pd-XPhos':      {'catalyst': 'Pd_XPhos', 'base': 'K3PO4', 'T': 80, 'time': 4, 'solvent': 'dioxane'},
        'Pd-SPhos':      {'catalyst': 'Pd_SPhos', 'base': 'K2CO3', 'T': 80, 'time': 5, 'solvent': 'toluene'},
        'Pd(tBu3P)2':    {'catalyst': 'Pd_tBu3', 'base': 'KF', 'T': 60, 'time': 8, 'solvent': 'THF'},
        'Ni催化剂':      {'catalyst': 'Ni_dppp', 'base': 'K3PO4', 'T': 100, 'time': 24, 'solvent': 'dioxane'},
    },
})


# ============================================================
# 高频引擎材料扩展——光催化50种/电池30种/吸附40种
# ============================================================

# 光催化扩展30种（从20→50）
MATERIAL_LIBRARY['photocatalysis'].update({
    # 贵金属修饰
    'Pt-CdS':        {'catalyst': 'Pt-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'Pd-TiO2':       {'catalyst': 'Pd-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'Rh-gC3N4':      {'catalyst': 'Rh-gC3N4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'Ru-SrTiO3':     {'catalyst': 'Ru-SrTiO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 双金属
    'Pt-Au-TiO2':    {'catalyst': 'PtAu-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'Pd-Ag-CdS':     {'catalyst': 'PdAg-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 非金属修饰
    'N-TiO2':        {'catalyst': 'N-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'S-TiO2':        {'catalyst': 'S-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'F-TiO2':        {'catalyst': 'F-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'B-TiO2':        {'catalyst': 'B-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 异质结
    'TiO2-CdS':      {'catalyst': 'TiO2-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'gC3N4-TiO2':    {'catalyst': 'gC3N4-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'gC3N4-CdS':     {'catalyst': 'gC3N4-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'ZnO-CdS':       {'catalyst': 'ZnO-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'BiVO4-WO3':     {'catalyst': 'BiVO4-WO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # Z型
    'Z-gC3N4-BiVO4': {'catalyst': 'Z-gC3N4-BiVO4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'Z-CdS-BiVO4':   {'catalyst': 'Z-CdS-BiVO4', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # MOF基
    'MOF-NH2-MIL125':{'catalyst': 'NH2-MIL125', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'MOF-UiO66-NH2': {'catalyst': 'UiO66-NH2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 钙钛矿氧化物
    'SrTiO3':        {'catalyst': 'SrTiO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'BaTiO3':        {'catalyst': 'BaTiO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'LaTiO3':        {'catalyst': 'LaTiO3', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 量子点
    'CdSe-QD':       {'catalyst': 'CdSe-QD', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'ZnS-QD':        {'catalyst': 'ZnS-QD', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'PbS-QD':        {'catalyst': 'PbS-QD', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 2D材料
    'MoSe2':         {'catalyst': 'MoSe2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'WS2':           {'catalyst': 'WS2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'WSe2':          {'catalyst': 'WSe2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'BP':            {'catalyst': 'BP', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    # 复合
    'rGO-CdS':       {'catalyst': 'rGO-CdS', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
    'CNT-TiO2':      {'catalyst': 'CNT-TiO2', 'light_intensity': 100, 'C0': 10, 'pH': 7, 'temperature': 25},
})

# 电池扩展18种（从12→30）
MATERIAL_LIBRARY['battery'].update({
    'LFP-C':          {'cathode': 'LiFePO4-C', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'NCM-622':        {'cathode': 'NCM622', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCM-9055':       {'cathode': 'NCM9055', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LCO-包覆':       {'cathode': 'LCO-coated', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LMO-尖晶石':     {'cathode': 'LMO-spinel', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LiV3O8':        {'cathode': 'LiV3O8', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.0},
    'V2O5':          {'cathode': 'V2O5', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.0},
    'NaCoO2':        {'cathode': 'NaCoO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'NaMnO2':        {'cathode': 'NaMnO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'NaFePO4':       {'cathode': 'NaFePO4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    '硬碳-Na':        {'cathode': 'hard_carbon-Na', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Li金属':         {'cathode': 'Li-metal', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Si-C-复合':      {'cathode': 'SiC-composite', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Sn-C':          {'cathode': 'SnC', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'LTO-钛酸锂':     {'cathode': 'LTO', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 1.0},
    'Li2FePO4F':    {'cathode': 'Li2FePO4F', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'Li2MnSiO4':    {'cathode': 'Li2MnSiO4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'Li2CuO2':      {'cathode': 'Li2CuO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCM-424': {'cathode': 'NCM424', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCM-712': {'cathode': 'NCM712', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LFP-纳米': {'cathode': 'LFP-nano', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'LCO-4.5V': {'cathode': 'LCO-HV', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 4.5},
    'LRMO': {'cathode': 'LRMO', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 4.8},
    'NaCrO2': {'cathode': 'NaCrO2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'Na3V2(PO4)3': {'cathode': 'NVP', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'Na2FePO4F': {'cathode': 'Na2FePO4F', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'S-C': {'cathode': 'S-C', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 1.5},
    'Li2S': {'cathode': 'Li2S', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 1.5},
    'LLZO-LCO': {'cathode': 'LLZO-LCO', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 4.0},
    'MoS2-负极': {'cathode': 'MoS2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.5},
    'WS2-负极': {'cathode': 'WS2', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.5},
    'Fe3O4-负极': {'cathode': 'Fe3O4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.5},
    'Co3O4-负极': {'cathode': 'Co3O4', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.5},
    'SnO2-纳米': {'cathode': 'SnO2-nano', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Si-纳米线': {'cathode': 'Si-nanowire', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Si-C-核壳': {'cathode': 'SiC-core-shell', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'P-红磷': {'cathode': 'red-P', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.01},
    'Sb-负极': {'cathode': 'Sb', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 0.5},
    'PTMA': {'cathode': 'PTMA', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'PEDOT': {'cathode': 'PEDOT', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'PANI': {'cathode': 'PANI', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LFP-钛掺杂': {'cathode': 'LFP-Ti', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 2.5},
    'NCM-单晶': {'cathode': 'NCM-single-crystal', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCM-浓度梯度': {'cathode': 'NCM-gradient', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'LMO-掺Mg': {'cathode': 'LMO-Mg', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCM-Zr掺杂': {'cathode': 'NCM-Zr', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'NCA-Zr掺杂': {'cathode': 'NCA-Zr', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 3.0},
    'Li-rich-包覆': {'cathode': 'LRMO-coated', 'C_rate': 1, 'temperature': 25, 'cutoff_voltage': 4.8},
}
)

# 吸附扩展20种（从20→40）
MATERIAL_LIBRARY['adsorption'].update({
    'MIL-100-Fe':    {'adsorbent': 'MIL100Fe', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'MIL-53-Al':     {'adsorbent': 'MIL53Al', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'ZIF-8':         {'adsorbent': 'ZIF8', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'ZIF-67':        {'adsorbent': 'ZIF67', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'CNT-COOH':      {'adsorbent': 'CNT_COOH', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'CNT-OH':        {'adsorbent': 'CNT_OH', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'rGO':           {'adsorbent': 'rGO', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'GO-Fe3O4':      {'adsorbent': 'GO_Fe3O4', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '生物炭-玉米':   {'adsorbent': 'biochar_corn', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '生物炭-稻壳':   {'adsorbent': 'biochar_rice', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '膨润土':        {'adsorbent': 'bentonite', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '硅藻土':        {'adsorbent': 'diatomite', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '活性氧化铝':    {'adsorbent': 'activated_alumina', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '沸石ZSM-5':     {'adsorbent': 'ZSM5', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'MCM-41':        {'adsorbent': 'MCM41', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'SBA-15':        {'adsorbent': 'SBA15', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '木质素':        {'adsorbent': 'lignin', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '纤维素':        {'adsorbent': 'cellulose', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '活性炭-KOH':   {'adsorbent': 'AC_KOH', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    '活性炭-磷酸':  {'adsorbent': 'AC_H3PO4', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},

    'MIL-100-Cr':    {'adsorbent': 'MIL100Cr', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'MIL-125-Ti':    {'adsorbent': 'MIL125Ti', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'HKUST-1':       {'adsorbent': 'HKUST1', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'MCM-48':        {'adsorbent': 'MCM48', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'KIT-6':         {'adsorbent': 'KIT6', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'Fe3O4-GO':      {'adsorbent': 'Fe3O4_GO', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'MnO2-纳米':     {'adsorbent': 'MnO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'ZrO2':          {'adsorbent': 'ZrO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'CeO2':          {'adsorbent': 'CeO2', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
    'Co3O4':         {'adsorbent': 'Co3O4', 'adsorbate': 'methylene_blue', 'C0_mg_L': 100, 'temperature_C': 25, 'adsorbent_dose_g_L': 1.0, 'contact_time_min': 60, 'pH': 7},
})

# 统计
total = sum(len(v) for v in MATERIAL_LIBRARY.values())
print(f"扩展后: {len(MATERIAL_LIBRARY)}领域 {total}种材料")
for e in ['photocatalysis', 'battery', 'adsorption']:
    print(f"  {e}: {len(MATERIAL_LIBRARY[e])}种")


# 扩展腐蚀和钙钛矿材料
MATERIAL_LIBRARY['corrosion'].update({
    '2205双相钢':    {'material': 'duplex_2205', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '2507超双相':    {'material': 'super_duplex_2507', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '蒙乃尔合金':    {'material': 'monel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '因科镍尔':      {'material': 'inconel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '镍':            {'material': 'nickel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '锌':            {'material': 'zinc', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '镁合金':        {'material': 'Mg_alloy', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 0.5},
    '碳钢-高温':     {'material': 'carbon_steel', 'environment': 'seawater', 'temperature': 80, 'pH': 7, 'Cl_conc': 0.5},
    'SS316-高温':    {'material': 'SS316', 'environment': 'seawater', 'temperature': 80, 'pH': 7, 'Cl_conc': 0.5},
    '碳钢-酸性':     {'material': 'carbon_steel', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    'SS316-酸性':    {'material': 'SS316', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    '碳钢-高氯':     {'material': 'carbon_steel', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 3.0},
    '铝合金-高氯':   {'material': 'Al_alloy', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 3.0},
    '铜-酸性':       {'material': 'copper', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    '2205-酸性':     {'material': 'duplex_2205', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    '钛-高温':       {'material': 'Ti_alloy', 'environment': 'seawater', 'temperature': 80, 'pH': 7, 'Cl_conc': 0.5},
    '因科镍尔-酸性': {'material': 'inconel', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    '碳钢-低温':     {'material': 'carbon_steel', 'environment': 'seawater', 'temperature': 0, 'pH': 7, 'Cl_conc': 0.5},
    '铝合金-酸性':   {'material': 'Al_alloy', 'environment': 'seawater', 'temperature': 25, 'pH': 2, 'Cl_conc': 0.5},
    '铜-高氯':       {'material': 'copper', 'environment': 'seawater', 'temperature': 25, 'pH': 7, 'Cl_conc': 3.0},
})

MATERIAL_LIBRARY['perovskite'].update({
    'CsMAFA三阳':    {'composition': 'CsMAFAPbI3', 'annealing_temp': 120, 'annealing_time': 60, 'thickness': 500},
    'RbCsFAPbI3':   {'composition': 'RbCsFAPbI3', 'annealing_temp': 130, 'annealing_time': 60, 'thickness': 500},
    'KCsFAPbI3':    {'composition': 'KCsFAPbI3', 'annealing_temp': 130, 'annealing_time': 60, 'thickness': 500},
    'MAPbI3-150nm': {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 150},
    'MAPbI3-800nm': {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 800},
    'FAPbI3-120°C': {'composition': 'FAPbI3', 'annealing_temp': 120, 'annealing_time': 60, 'thickness': 500},
    'MAPbI3-30min': {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 30, 'thickness': 500},
    'MAPbI3-120min':{'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 120, 'thickness': 500},
    'FAPbI3-Cl修饰':{'composition': 'FAPbI3-Cl', 'annealing_temp': 150, 'annealing_time': 60, 'thickness': 500},
    'CsPbI3-Br修饰':{'composition': 'CsPbI3-Br', 'annealing_temp': 200, 'annealing_time': 60, 'thickness': 500},
    'MAPbI3-界面层':{'composition': 'MAPbI3-IL', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
    'FAPbI3-钝化':  {'composition': 'FAPbI3-passivated', 'annealing_temp': 150, 'annealing_time': 60, 'thickness': 500},
    'CsFAPbI3-PEAI':{'composition': 'CsFAPbI3-PEAI', 'annealing_temp': 130, 'annealing_time': 60, 'thickness': 500},
    'MAFAPbI3-150°C':{'composition': 'MAFAPbI3', 'annealing_temp': 150, 'annealing_time': 60, 'thickness': 500},
    'CsPbBr3-QD':   {'composition': 'CsPbBr3-QD', 'annealing_temp': 200, 'annealing_time': 30, 'thickness': 300},
    'FAPbI3-200nm': {'composition': 'FAPbI3', 'annealing_temp': 150, 'annealing_time': 60, 'thickness': 200},
    'MAPbI3-600nm': {'composition': 'MAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 600},
    'CsFAPbI3-100°C':{'composition': 'CsFAPbI3', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
    'MAPbI3-FA修饰':{'composition': 'MAPbI3-FA', 'annealing_temp': 100, 'annealing_time': 60, 'thickness': 500},
    'CsPbI3-NiO':   {'composition': 'CsPbI3-NiO', 'annealing_temp': 200, 'annealing_time': 60, 'thickness': 500},
})
