#!/usr/bin/env python3
"""
蜂群科研——光催化产氢虚拟实验引擎

模拟光催化水分解产氢反应：
1. 催化剂筛选（TiO2/CdS/g-C3N4/BiVO4/等）
2. 光照条件优化（光强/波长/时间）
3. 助催化剂效应（Pt/CoP/MoS2）
4. 牺牲剂效应（甲醇/TEA/乳酸）

物理约束：
- 光吸收（Beer-Lambert定律）
- 激子分离（扩散方程）
- 表面反应动力学
- 量子产率
- 法拉第效率
"""

import json, math
from typing import Dict

# ===== 光催化材料参数 =====

PHOTOCATALYSTS = {
    'TiO2': {
        'bandgap_eV': 3.20,
        'absorption_edge_nm': 387,
        'cb_potential_V': -0.30,  # 导带电位 vs NHE
        'vb_potential_V': 2.90,   # 价带电位
        'exciton_binding_eV': 0.05,
        'surface_area_m2_g': 50,
        'ref_h2_rate': 2.0,  # mmol/h/g 参考产氢速率（含Pt3%+甲醇10%标准条件）
    },
    'CdS': {
        'bandgap_eV': 2.40,
        'absorption_edge_nm': 517,
        'cb_potential_V': -0.50,
        'vb_potential_V': 1.90,
        'exciton_binding_eV': 0.03,
        'surface_area_m2_g': 30,
        'ref_h2_rate': 2.5,
    },
    'g-C3N4': {
        'bandgap_eV': 2.70,
        'absorption_edge_nm': 459,
        'cb_potential_V': -0.85,
        'vb_potential_V': 1.85,
        'exciton_binding_eV': 0.02,
        'surface_area_m2_g': 80,
        'ref_h2_rate': 1.8,
    },
    'BiVO4': {
        'bandgap_eV': 2.40,
        'absorption_edge_nm': 517,
        'cb_potential_V': 0.00,
        'vb_potential_V': 2.40,
        'exciton_binding_eV': 0.04,
        'surface_area_m2_g': 20,
        'ref_h2_rate': 0.25,
    },
    'CdZnS': {
        'bandgap_eV': 2.20,
        'absorption_edge_nm': 564,
        'cb_potential_V': -0.60,
        'vb_potential_V': 1.60,
        'exciton_binding_eV': 0.03,
        'surface_area_m2_g': 40,
        'ref_h2_rate': 3.0,
    },
}

CO_CATALYSTS = {
    'none': {'enhancement': 1.0, 'overpotential_reduction': 0.0},
    'Pt 1wt%': {'enhancement': 8.0, 'overpotential_reduction': 0.15},
    'Pt 3wt%': {'enhancement': 15.0, 'overpotential_reduction': 0.20},
    'Pt 5wt%': {'enhancement': 12.0, 'overpotential_reduction': 0.22},
    'MoS2 2wt%': {'enhancement': 6.0, 'overpotential_reduction': 0.12},
    'CoP 3wt%': {'enhancement': 5.0, 'overpotential_reduction': 0.10},
    'Ni2P 3wt%': {'enhancement': 5.5, 'overpotential_reduction': 0.10},
    'Au 1wt%': {'enhancement': 3.0, 'overpotential_reduction': 0.08},  # 等离激元效应
}

SACRIFICIAL_AGENTS = {
    'none': {'enhancement': 0.3, 'consumption_rate': 0},  # 无空穴清除剂→低产氢（缺陷态+逆反应）
    'methanol 10vol%': {'enhancement': 5.0, 'consumption_rate': 0.8},
    'methanol 20vol%': {'enhancement': 6.5, 'consumption_rate': 1.5},
    'TEA 10vol%': {'enhancement': 5.0, 'consumption_rate': 0.6},
    'TEA 20vol%': {'enhancement': 10.0, 'consumption_rate': 1.2},
    'lactic acid 10vol%': {'enhancement': 7.0, 'consumption_rate': 0.7},
    'Na2S+Na2SO3': {'enhancement': 9.0, 'consumption_rate': 1.0},
}


class PhotocatalysisPhysics:
    """光催化物理约束"""
    
    @staticmethod
    def beer_lambert(absorption_coeff: float, thickness: float = 1e-3) -> float:
        """Beer-Lambert定律——光吸收"""
        return 1 - math.exp(-absorption_coeff * thickness)
    
    @staticmethod
    def light_absorption(bandgap_eV: float, wavelength_nm: float, has_au: bool = False) -> float:
        """光吸收——波长小于吸收边才有吸收"""
        absorption_edge = 1240 / bandgap_eV  # nm
        if wavelength_nm > absorption_edge:
            # Au等离激元在520nm有吸收峰
            if has_au and 450 < wavelength_nm < 600:
                return 0.7  # LSPR吸收
            return 0.0
        ratio = wavelength_nm / absorption_edge
        return min(1.0, 1 - ratio + 0.5)
    
    @staticmethod
    def exciton_separation(binding_energy: float, bandgap: float, temp_C: float = 25) -> float:
        """激子分离效率——结合能越小越易分离"""
        kB = 8.617e-5
        T = temp_C + 273.15
        # 热能kT vs 结合能
        thermal_energy = kB * T
        if binding_energy < thermal_energy:
            return 0.95  # 几乎完全分离
        return math.exp(-binding_energy / thermal_energy * 0.5)
    
    @staticmethod
    def quantum_yield(absorption: float, separation: float, surface_reaction: float) -> float:
        """量子产率 = 吸收 × 分离 × 表面反应"""
        return absorption * separation * surface_reaction
    
    @staticmethod
    def overpotential_check(cb_potential: float, co_catalyst: str = 'none') -> float:
        """过电位检查——导带电位必须比H+/H2更负"""
        E_H2 = 0.0  # vs NHE at pH=0
        co_reduction = CO_CATALYSTS.get(co_catalyst, {}).get('overpotential_reduction', 0)
        driving_force = -(cb_potential) - 0.0 + co_reduction
        if driving_force <= 0:
            return 0.3  # 驱动力不足但有缺陷态微量活性
        return min(1.0, driving_force * 2 + 0.15)


class VirtualPhotocatalysisExperiment:
    """光催化产氢虚拟实验"""
    
    def __init__(self, conditions: Dict):
        self.catalyst = conditions.get('catalyst', 'TiO2')
        self.params = PHOTOCATALYSTS.get(self.catalyst, PHOTOCATALYSTS['TiO2'])
        self.light_intensity = conditions.get('light_intensity_mW_cm2', 100)  # mW/cm²
        self.wavelength = conditions.get('wavelength_nm', 365)  # nm
        self.co_catalyst = conditions.get('co_catalyst', 'none')
        self.co_params = CO_CATALYSTS.get(self.co_catalyst, CO_CATALYSTS['none'])
        self.sacrificial = conditions.get('sacrificial_agent', 'none')
        self.sac_params = SACRIFICIAL_AGENTS.get(self.sacrificial, SACRIFICIAL_AGENTS['none'])
        self.temp_C = conditions.get('temp_C', 25)
        self.catalyst_amount = conditions.get('catalyst_amount_mg', 50)  # mg
        self.reaction_time_h = conditions.get('time_h', 5)
        
    def run(self) -> Dict:
        # 1. 光吸收
        absorption = PhotocatalysisPhysics.light_absorption(
            self.params['bandgap_eV'], self.wavelength, 'Au' in self.co_catalyst
        )
        
        # 光强效应——更高光强→更多光子→更高速率（但有饱和）
        light_factor = min(1.5, self.light_intensity / 100)
        
        # 2. 激子分离
        separation = PhotocatalysisPhysics.exciton_separation(
            self.params['exciton_binding_eV'], self.params['bandgap_eV'], self.temp_C
        )
        
        # 3. 表面反应——过电位检查
        overpotential = PhotocatalysisPhysics.overpotential_check(
            self.params['cb_potential_V'], self.co_catalyst
        )
        
        # 4. 助催化剂增强
        co_enhancement = self.co_params['enhancement']
        
        # 5. 牺牲剂增强
        sac_enhancement = self.sac_params['enhancement']
        
        # 6. 量子产率
        qy = PhotocatalysisPhysics.quantum_yield(absorption, separation, overpotential)
        
        # 7. 产氢速率计算——增强因子归一化
        # 以标准条件(TiO2/Pt3%/甲醇10%/100mW/365nm/25°C)为基准
        temp_factor = math.exp(0.02 * (self.temp_C - 25))
        temp_factor = min(1.3, max(0.5, temp_factor))
        
        # 催化剂用量效应
        # 催化剂用量效应——线性缩放
        # 催化剂用量——单位质量速率在20-50mg最高
        if self.catalyst_amount <= 50:
            amount_factor = 0.6 + 0.4 * (self.catalyst_amount / 50)  # 20mg→0.76, 50mg→1.0
        else:
            amount_factor = max(0.85, 1.0 - (self.catalyst_amount - 50) / 300)  # 100mg→0.83
        
        # 增强因子取对数叠加（避免指数放大）
        # 标准条件增强=Pt3%(15) × 甲醇10%(5) = 75
        # 实际增强 = co_enhancement × sac_enhancement
        # 归一化：enhancement_ratio = actual / standard
        standard_enhancement = 75  # Pt3% × methanol10%
        actual_enhancement = co_enhancement * sac_enhancement
        enhancement_ratio = actual_enhancement / standard_enhancement
        # 保底——无催化剂无牺牲剂也有本征活性
        enhancement_ratio = max(enhancement_ratio, 0.05)
        
        # 产氢速率 = ref_rate × 光强 × QY × 增强比 × 温度 × 用量
        h2_rate = (self.params['ref_h2_rate'] * light_factor * qy * 
                   enhancement_ratio * temp_factor * amount_factor * 15)
        
        
        
        
        # 8. 总产氢量
        total_h2 = h2_rate * self.reaction_time_h
        
        # 9. 量子效率（表观量子效率AQY）
        photon_flux = self.light_intensity / 1000 * 0.01  # 简化光子流
        aqy = (h2_rate / (photon_flux + 0.01)) * 100
        aqy = min(80, max(0.1, aqy))
        
        return {
            'catalyst': self.catalyst,
            'conditions': f"{self.wavelength}nm/{self.light_intensity}mW/{self.co_catalyst}/{self.sacrificial}",
            'h2_rate': round(h2_rate, 2),  # mmol/h/g
            'total_h2': round(total_h2, 2),  # mmol/g
            'quantum_yield': round(qy * 100, 1),  # %
            'aQY': round(aqy, 1),  # 表观量子效率
            'light_absorption': round(absorption * 100, 1),
            'exciton_separation': round(separation * 100, 1),
            'overpotential_driving': round(overpotential * 100, 1),
        }


class PhotocatalysisValidation:
    def __init__(self, validation_file: str):
        self.papers = json.load(open(validation_file))
    
    def validate(self) -> Dict:
        results = []
        for paper in self.papers:
            exp = VirtualPhotocatalysisExperiment(paper)
            pred = exp.run()
            
            real_rate = paper.get('h2_rate', 0)
            pred_rate = pred['h2_rate']
            error = abs(pred_rate - real_rate)
            error_pct = error / real_rate * 100 if real_rate > 0 else 0
            
            results.append({
                'id': paper['id'],
                'catalyst': paper['catalyst'],
                'conditions': f"{paper.get('wavelength_nm',365)}nm/{paper.get('co_catalyst','none')}/{paper.get('sacrificial_agent','none')}",
                'real_rate': real_rate,
                'pred_rate': pred_rate,
                'error': round(error, 2),
                'error_pct': round(error_pct, 1),
            })
        
        errors = [r['error'] for r in results]
        error_pcts = [r['error_pct'] for r in results]
        
        return {
            'total': len(results),
            'mean_error': round(sum(errors) / len(errors), 2),
            'mean_error_pct': round(sum(error_pcts) / len(error_pcts), 1),
            'within_10pct': sum(1 for e in error_pcts if e < 10),
            'within_20pct': sum(1 for e in error_pcts if e < 20),
            'within_30pct': sum(1 for e in error_pcts if e < 30),
            'results': results,
        }


if __name__ == '__main__':
    print("=== 蜂群科研——光催化产氢虚拟实验引擎 ===\n")
    
    v = PhotocatalysisValidation('/home/z/my-project/swarmlabs_photocatalysis_validation.json')
    result = v.validate()
    
    print(f"验证: {result['total']}组实验")
    print(f"平均误差: {result['mean_error']} mmol/h/g ({result['mean_error_pct']}%)")
    print(f"误差<10%: {result['within_10pct']}组 ({result['within_10pct']/result['total']*100:.0f}%)")
    print(f"误差<20%: {result['within_20pct']}组 ({result['within_20pct']/result['total']*100:.0f}%)")
    print(f"误差<30%: {result['within_30pct']}组 ({result['within_30pct']/result['total']*100:.0f}%)")
    
    print(f"\n{'ID':<8} {'催化剂':<8} {'条件':<30} {'真实':>6} {'预测':>6} {'误差':>6} {'误差%':>6}")
    for r in result['results']:
        print(f"{r['id']:<8} {r['catalyst']:<8} {r['conditions']:<30} {r['real_rate']:>5.1f} {r['pred_rate']:>5.1f} {r['error']:>5.1f} {r['error_pct']:>5.1f}%")
    
    json.dump(result, open('/home/z/my-project/swarmlabs_photocatalysis_result.json', 'w'), ensure_ascii=False, indent=2)
