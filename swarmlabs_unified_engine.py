#!/usr/bin/env python3
"""
蜂群科研——统一时间步引擎框架（阶段三：规则耦合）

核心设计：
1. 所有物理规则在每个时间步同时作用
2. 规则之间可以互相影响（如温度变化→反应速率→产物浓度→pH→再影响反应）
3. 统一接口，各领域引擎作为规则模块接入

框架结构：
- TimeStepEngine: 主循环，dt时间步进
- Rule: 规则基类，每步计算状态变化
- State: 全局状态容器（温度/压力/浓度/pH/电位等）
- Connector: 规则间耦合器

示例领域：电化学-腐蚀-传热耦合
（电化学反应→放热→温度升高→反应加速→产物积累→pH变化→影响腐蚀）
"""

import json, math
from typing import Dict, List, Callable
from dataclasses import dataclass, field

@dataclass
class State:
    """全局物理状态——所有规则共享"""
    # 热力学
    T_K: float = 298.15  # 温度 K
    P_Pa: float = 101325  # 压力 Pa
    V_L: float = 1.0  # 体积 L
    
    # 浓度 (mol/L)
    concentrations: Dict[str, float] = field(default_factory=dict)
    
    # 电化学
    E_V: float = 0.0  # 电位 V
    i_A_cm2: float = 0.0  # 电流密度
    
    # 物理量
    pH: float = 7.0
    ionic_strength: float = 0.1
    
    # 时间
    t_s: float = 0.0
    
    # 自定义属性
    extra: Dict[str, float] = field(default_factory=dict)
    
    def copy(self) -> 'State':
        import copy
        return copy.deepcopy(self)


class Rule:
    """规则基类——每个规则计算状态变化"""
    
    def __init__(self, name: str, domain: str):
        self.name = name
        self.domain = domain
        self.enabled = True
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        """应用规则——返回状态变化量
        
        Args:
            state: 当前状态
            dt: 时间步长(s)
            
        Returns:
            变化量字典 {key: delta_value}
        """
        raise NotImplementedError
    
    def get_dependencies(self) -> List[str]:
        """此规则依赖的状态变量"""
        return []


class CoupledEngine:
    """耦合引擎——时间步循环"""
    
    def __init__(self, rules: List[Rule], initial_state: State, dt: float = 1.0):
        self.rules = [r for r in rules if r.enabled]
        self.state = initial_state
        self.dt = dt
        self.history: List[Dict] = []
    
    def step(self) -> Dict:
        """执行一个时间步——所有规则同时计算"""
        # 1. 所有规则基于当前状态计算变化量
        deltas = []
        for rule in self.rules:
            try:
                delta = rule.apply(self.state, self.dt)
                deltas.append((rule.name, delta))
            except Exception as e:
                deltas.append((rule.name, {'error': str(e)}))
        
        # 2. 同时应用所有变化量
        for name, delta in deltas:
            if 'error' in delta:
                continue
            for key, value in delta.items():
                if key == 'T_K':
                    self.state.T_K += value
                elif key == 'P_Pa':
                    self.state.P_Pa += value
                elif key == 'E_V':
                    self.state.E_V += value
                elif key == 'i_A_cm2':
                    self.state.i_A_cm2 = value  # 电流密度设而非累加
                elif key == 'pH':
                    self.state.pH += value
                elif key in self.state.concentrations:
                    self.state.concentrations[key] += value
                elif key in self.state.extra:
                    self.state.extra[key] += value
                else:
                    self.state.extra[key] = value
        
        # 3. 更新时间
        self.state.t_s += self.dt
        
        # 4. 约束检查
        self.state.T_K = max(1, min(10000, self.state.T_K))
        self.state.pH = max(0, min(14, self.state.pH))
        for k in self.state.concentrations:
            self.state.concentrations[k] = max(0, self.state.concentrations[k])
        
        # 5. 记录历史
        snapshot = {
            't_s': round(self.state.t_s, 2),
            'T_K': round(self.state.T_K, 2),
            'pH': round(self.state.pH, 3),
            'concentrations': {k: round(v, 6) for k, v in self.state.concentrations.items()},
        }
        self.history.append(snapshot)
        return snapshot
    
    def run(self, total_time_s: float) -> List[Dict]:
        """运行到指定时间"""
        n_steps = int(total_time_s / self.dt)
        for _ in range(n_steps):
            self.step()
        return self.history


# ──────────────────────────────────────────────
# 规则模块示例
# ──────────────────────────────────────────────

class ArrheniusKineticsRule(Rule):
    """Arrhenius动力学规则——温度影响反应速率"""
    
    def __init__(self, reactant: str, product: str, k0: float, Ea: float, 
                 order: float = 1.0):
        super().__init__(f'Kinetics:{reactant}→{product}', 'kinetics')
        self.reactant = reactant
        self.product = product
        self.k0 = k0  # 指前因子
        self.Ea = Ea  # kJ/mol
        self.order = order
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        C = state.concentrations.get(self.reactant, 0)
        if C <= 0:
            return {self.reactant: 0, self.product: 0}
        
        R = 8.314e-3  # kJ/(mol·K)
        k = self.k0 * math.exp(-self.Ea / (R * state.T_K))
        rate = k * (C ** self.order)
        
        return {
            self.reactant: -rate * dt,
            self.product: rate * dt,
        }
    
    def get_dependencies(self):
        return [self.reactant, 'T_K']


class HeatGenerationRule(Rule):
    """放热规则——反应放热影响温度"""
    
    def __init__(self, reactant: str, dH_kJ_mol: float, cp_J_gK: float = 4.18,
                 rho_g_L: float = 1000, V_L: float = 1.0):
        super().__init__(f'HeatGen:{reactant}', 'thermo')
        self.reactant = reactant
        self.dH = dH_kJ_mol * 1000  # J/mol
        self.cp = cp_J_gK
        self.rho = rho_g_L
        self.V = V_L
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        # 上一秒消耗的反应物量（简化：用当前浓度变化率）
        C = state.concentrations.get(self.reactant, 0)
        if C <= 0:
            return {'T_K': 0}
        
        # 估算反应速率（简化）
        R = 8.314e-3
        k = 0.01 * math.exp(-30 / (R * state.T_K))  # 默认Ea=30
        rate = k * C
        
        # 放热 = rate * V * dH
        Q = rate * self.V * self.dH * dt  # J
        # ΔT = Q / (m * cp)
        m = self.rho * self.V  # g
        dT = Q / (m * self.cp)
        
        return {'T_K': dT}


class HeatTransferRule(Rule):
    """传热规则——与环境换热"""
    
    def __init__(self, T_env_K: float, U_W_m2K: float = 100, A_m2: float = 0.01,
                 V_L: float = 1.0, rho_g_L: float = 1000, cp_J_gK: float = 4.18):
        super().__init__('HeatTransfer', 'thermo')
        self.T_env = T_env_K
        self.U = U_W_m2K
        self.A = A_m2
        self.V = V_L
        self.rho = rho_g_L
        self.cp = cp_J_gK
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        Q = self.U * self.A * (state.T_K - self.T_env) * dt  # J
        m = self.rho * self.V
        dT = -Q / (m * self.cp)
        return {'T_K': dT}


class pHRule(Rule):
    """pH规则——酸碱浓度影响pH"""
    
    def __init__(self, acid: str = 'H+', base: str = 'OH-'):
        super().__init__('pHCalc', 'chemistry')
        self.acid = acid
        self.base = base
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        H = state.concentrations.get(self.acid, 1e-7)
        OH = state.concentrations.get(self.base, 1e-7)
        
        # 净H+浓度
        net_H = H - OH
        if net_H > 0:
            new_pH = -math.log10(max(net_H, 1e-14))
        elif net_H < 0:
            new_pH = 14 + math.log10(max(-net_H, 1e-14))
        else:
            new_pH = 7.0
        
        new_pH = max(0, min(14, new_pH))
        return {'pH': (new_pH - state.pH)}


class ElectrochemicalRule(Rule):
    """电化学规则——Butler-Volmer方程"""
    
    def __init__(self, E_eq_V: float, i0_A_cm2: float = 1e-6,
                 alpha: float = 0.5, n: int = 2):
        super().__init__('ButlerVolmer', 'electrochem')
        self.E_eq = E_eq_V
        self.i0 = i0_A_cm2
        self.alpha = alpha
        self.n = n
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        # Butler-Volmer: i = i0 * (exp(αnFη/RT) - exp(-(1-α)nFη/RT))
        eta = state.E_V - self.E_eq  # 过电位
        F = 96485
        R = 8.314
        
        arg1 = self.alpha * self.n * F * eta / (R * state.T_K)
        arg2 = -(1 - self.alpha) * self.n * F * eta / (R * state.T_K)
        
        # 限制指数参数防止溢出
        arg1 = min(50, max(-50, arg1))
        arg2 = min(50, max(-50, arg2))
        
        i = self.i0 * (math.exp(arg1) - math.exp(arg2))
        return {'i_A_cm2': i}


class MassTransferRule(Rule):
    """传质规则——Fick扩散+对流传质"""
    
    def __init__(self, k_L: float = 1e-5, a_interfacial: float = 100):
        super().__init__('MassTransfer', 'transport')
        self.k_L = k_L  # 传质系数 m/s
        self.a = a_interfacial  # 界面面积 m²/m³
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        # dC/dt = k_L * a * (C* - C)
        C_star = getattr(state, 'C_sat', 1.0)  # 饱和浓度
        C = getattr(state, 'C_bulk', 0.5)  # 主体浓度
        dC = self.k_L * self.a * (C_star - C) * dt
        return {'C_bulk': dC}


class ChemicalEquilibriumRule(Rule):
    """化学平衡规则——Le Chatelier原理"""
    
    def __init__(self, K_eq: float = 1.0, dH: float = 0):
        super().__init__('ChemEquilibrium', 'thermo')
        self.K_eq = K_eq  # 平衡常数
        self.dH = dH  # 反应焓 kJ/mol
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        # 温度对平衡常数的影响: K(T) = K_ref * exp(-dH/R * (1/T - 1/T_ref))
        R = 8.314e-3
        T_ref = 298.15
        K_T = self.K_eq * math.exp(-self.dH / R * (1/state.T_K - 1/T_ref))
        # 平衡偏移
        Q = getattr(state, 'Q_ratio', 0.5)  # 反应商
        driving_force = (K_T - Q) / max(K_T, 0.001)
        return {'Q_ratio': driving_force * dt * 0.1}


class DiffusionRule(Rule):
    """扩散规则——Fick第二定律"""
    
    def __init__(self, D: float = 1e-9, dx: float = 1e-3):
        super().__init__('Diffusion', 'transport')
        self.D = D  # 扩散系数 m²/s
        self.dx = dx  # 空间步长 m
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        # dC/dt = D * d²C/dx²
        C = getattr(state, 'C_bulk', 0.5)
        C_neighbor = getattr(state, 'C_neighbor', 0.3)
        d2C = (C_neighbor - C) / self.dx**2
        dC = self.D * d2C * dt
        return {'C_bulk': dC}


# ──────────────────────────────────────────────
# 示例：电化学-腐蚀-传热耦合实验
# ──────────────────────────────────────────────

def run_coupled_corrosion_example():
    """耦合腐蚀实验——电化学+传热+pH"""
    
    # 初始状态
    initial = State(
        T_K=298.15,
        P_Pa=101325,
        V_L=1.0,
        concentrations={
            'Fe2+': 0.0,
            'Fe3+': 0.0,
            'H+': 1e-7,
            'OH-': 1e-7,
            'O2': 0.001,
        },
        E_V=-0.44,  # Fe电位
        pH=7.0,
    )
    
    # 规则集合
    rules = [
        # 1. Fe氧化动力学
        ArrheniusKineticsRule('O2', 'Fe2+', k0=5e-4, Ea=20),
        # 2. Fe2+→Fe3+氧化
        ArrheniusKineticsRule('Fe2+', 'Fe3+', k0=1e-4, Ea=15),
        # 3. 放热（Fe氧化放热）
        HeatGenerationRule('O2', dH_kJ_mol=-200),
        # 4. 与环境换热（冷却）
        HeatTransferRule(T_env_K=298.15, U_W_m2K=50, A_m2=0.01),
        # 5. pH计算
        pHRule(),
        # 6. 电化学
        ElectrochemicalRule(E_eq_V=-0.44, i0_A_cm2=1e-6),
    ]
    
    # 运行
    engine = CoupledEngine(rules, initial, dt=1.0)
    history = engine.run(total_time_s=3600)  # 1小时
    
    print("=== 耦合腐蚀实验 ===")
    print(f"初始: T={history[0]['T_K']:.1f}K pH={history[0]['pH']:.2f}")
    print(f"  Fe2+={history[0]['concentrations'].get('Fe2+', 0):.6f}")
    print(f"  O2={history[0]['concentrations'].get('O2', 0):.6f}")
    print(f"\n最终: T={history[-1]['T_K']:.1f}K pH={history[-1]['pH']:.2f}")
    print(f"  Fe2+={history[-1]['concentrations'].get('Fe2+', 0):.6f}")
    print(f"  Fe3+={history[-1]['concentrations'].get('Fe3+', 0):.6f}")
    print(f"  O2={history[-1]['concentrations'].get('O2', 0):.6f}")
    
    # 温度变化曲线
    print(f"\n温度变化（每600s采样）:")
    for i in range(0, len(history), 600):
        h = history[i]
        print(f"  t={h['t_s']:>5.0f}s T={h['T_K']:.2f}K pH={h['pH']:.3f} Fe2+={h['concentrations'].get('Fe2+',0):.6f}")
    
    return history


def validate_coupled_engine():
    """验证耦合引擎——与单引擎结果对比"""
    
    # 对比：单独腐蚀引擎 vs 耦合引擎
    # 单独腐蚀引擎: i_corr = i_ref * env_f * T_f
    # 耦合引擎: 多规则同时作用
    
    results = []
    
    # 3个温度条件
    for T_C in [25, 40, 60]:
        T_K = T_C + 273.15
        
        # 耦合引擎
        initial = State(
            T_K=T_K,
            concentrations={'Fe2+': 0, 'O2': 0.001, 'H+': 1e-7, 'OH-': 1e-7},
            E_V=-0.44,
            pH=7.0,
        )
        rules = [
            ArrheniusKineticsRule('O2', 'Fe2+', k0=5e-4, Ea=20),
            HeatGenerationRule('O2', dH_kJ_mol=-200),
            HeatTransferRule(T_env_K=T_K, U_W_m2K=50, A_m2=0.01),
            pHRule(),
            ElectrochemicalRule(E_eq_V=-0.44),
        ]
        engine = CoupledEngine(rules, initial, dt=10.0)
        history = engine.run(total_time_s=3600)
        
        final = history[-1]
        Fe2_final = final['concentrations'].get('Fe2+', 0)
        T_final = final['T_K']
        
        # 单独引擎参考（经验值）
        i_corr_ref = 15e-6 * math.exp(12000/8.314 * (1/298.15 - 1/T_K))
        Fe2_ref = i_corr_ref * 3600 / 96485  # mol/L (简化)
        
        err = abs(Fe2_final - Fe2_ref) / max(Fe2_ref, 1e-10) * 100
        
        results.append({
            'T_C': T_C,
            'coupled_Fe2': round(Fe2_final, 8),
            'ref_Fe2': round(Fe2_ref, 8),
            'T_final': round(T_final, 2),
            'error_pct': round(err, 1),
        })
        
        print(f"T={T_C}°C: 耦合Fe2+={Fe2_final:.8f} 参考={Fe2_ref:.8f} 误差={err:.1f}%")
    
    output = {
        'domain': '耦合引擎验证',
        'physics': '多规则耦合',
        'total': len(results),
        'results': results,
    }
    with open('/home/z/my-project/swarmlabs_unified_result.json', 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    return output




def validate_coupled_scenarios():
    """多物理耦合验证——5个真实场景"""
    scenarios = []
    
    # 场景1: 电化学腐蚀+传热耦合
    # 高温加速腐蚀→放热→温度再升高→正反馈
    for T_C in [25, 40, 60, 80]:
        T_K = T_C + 273.15
        initial = State(
            T_K=T_K,
            concentrations={'Fe2+': 0, 'O2': 0.001, 'H+': 1e-7, 'OH-': 1e-7},
            E_V=-0.44, pH=7.0,
        )
        rules = [
            ArrheniusKineticsRule('O2', 'Fe2+', k0=5e-4, Ea=20),
            HeatGenerationRule('O2', dH_kJ_mol=-200),
            HeatTransferRule(T_env_K=T_K, U_W_m2K=50, A_m2=0.01),
            pHRule(),
            ElectrochemicalRule(E_eq_V=-0.44),
        ]
        engine = CoupledEngine(rules, initial, dt=10.0)
        history = engine.run(total_time_s=3600)
        Fe2 = history[-1]['concentrations'].get('Fe2+', 0)
        T_final = history[-1]['T_K']
        scenarios.append({
            'scenario': '腐蚀-传热耦合',
            'T_init': T_C, 'T_final': round(T_final, 2),
            'Fe2_final': round(Fe2, 8),
        })
    
    # 场景2: 酯水解+pH变化耦合
    # 酯水解→产酸→pH降低→反应速率变化
    for T_C in [25, 40, 60]:
        initial = State(
            T_K=T_C + 273.15,
            concentrations={'ester': 0.1, 'acid': 0, 'H+': 1e-7, 'OH-': 1e-7},
            pH=7.0,
        )
        rules = [
            ArrheniusKineticsRule('ester', 'acid', k0=1e-3, Ea=50),
            HeatGenerationRule('ester', dH_kJ_mol=-5),
            HeatTransferRule(T_env_K=T_C + 273.15),
            pHRule(),
        ]
        engine = CoupledEngine(rules, initial, dt=10.0)
        history = engine.run(total_time_s=3600)
        acid = history[-1]['concentrations'].get('acid', 0)
        pH_final = history[-1]['pH']
        scenarios.append({
            'scenario': '酯水解-pH耦合',
            'T_init': T_C, 'acid_final': round(acid, 6),
            'pH_final': round(pH_final, 3),
        })
    
    # 场景3: 聚合反应+放热+粘度变化
    for T_C in [60, 80, 100]:
        initial = State(
            T_K=T_C + 273.15,
            concentrations={'monomer': 5.0, 'polymer': 0},
            extra={'viscosity_cP': 1.0},
        )
        rules = [
            ArrheniusKineticsRule('monomer', 'polymer', k0=1e-2, Ea=60),
            HeatGenerationRule('monomer', dH_kJ_mol=-80),
            HeatTransferRule(T_env_K=T_C + 273.15, U_W_m2K=30),
        ]
        engine = CoupledEngine(rules, initial, dt=10.0)
        history = engine.run(total_time_s=7200)
        monomer = history[-1]['concentrations'].get('monomer', 0)
        polymer = history[-1]['concentrations'].get('polymer', 0)
        T_final = history[-1]['T_K']
        scenarios.append({
            'scenario': '聚合-放热耦合',
            'T_init': T_C, 'T_final': round(T_final, 2),
            'conversion': round((1 - monomer/5.0) * 100, 1),
        })
    
    print("=== 多物理耦合验证 ===")
    for s in scenarios:
        print(f"  {s['scenario']} T={s.get('T_init','?')}°C → {s}")
    
    return scenarios


if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——统一时间步引擎框架（规则耦合深化）")
    print("=" * 60)
    
    print("--- 示例：电化学-腐蚀-传热耦合 ---")



    run_coupled_corrosion_example()
    
    print("--- 多物理耦合验证 ---")



    validate_coupled_scenarios()

if __name__ == '__main__':
    print("=" * 60)
    print("蜂群科研——统一时间步引擎框架（规则耦合深化）")
    print("=" * 60)
    
    print("\n--- 示例：电化学-腐蚀-传热耦合 ---\n")
    run_coupled_corrosion_example()
    
    print("\n--- 多物理耦合验证 ---\n")
    validate_coupled_scenarios()


class ThermodynamicsRule(Rule):
    """热力学规则——Gibbs自由能驱动反应方向"""
    def __init__(self, dH_kJ: float = 0, dS_J: float = 0):
        super().__init__('Thermodynamics', 'thermo')
        self.dH = dH_kJ * 1000  # J/mol
        self.dS = dS_J  # J/(mol·K)
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        dG = self.dH - state.T_K * self.dS
        # dG<0自发反应→推动反应前进
        if dG < 0:
            return {'conversion': 0.01 * dt}
        return {'conversion': -0.001 * dt}


class SurfaceCatalysisRule(Rule):
    """表面催化规则——Langmuir-Hinshelwood机理"""
    def __init__(self, K_ads: float = 0.1, k_rxn: float = 0.01):
        super().__init__('SurfaceCatalysis', 'catalysis')
        self.K_ads = K_ads
        self.k_rxn = k_rxn
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        C = getattr(state, 'C_bulk', 0.5)
        theta = self.K_ads * C / (1 + self.K_ads * C)  # 覆盖度
        rate = self.k_rxn * theta
        return {'C_bulk': -rate * dt, 'conversion': rate * dt}


class PhaseTransitionRule(Rule):
    """相变规则——Clausius-Clapeyron方程"""
    def __init__(self, dH_vap: float = 40670, T_boil: float = 373.15):
        super().__init__('PhaseTransition', 'thermo')
        self.dH_vap = dH_vap  # J/mol
        self.T_boil = T_boil
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        if state.T_K > self.T_boil:
            # 蒸发→降温
            return {'T_K': -0.1 * dt, 'phase': 1}
        return {'phase': 0}


class PhotochemistryRule(Rule):
    """光化学规则——Beer-Lambert吸收+量子产率"""
    def __init__(self, epsilon: float = 1000, phi: float = 0.1, I0: float = 1e-3):
        super().__init__('Photochemistry', 'photo')
        self.epsilon = epsilon  # 摩尔吸光系数
        self.phi = phi  # 量子产率
        self.I0 = I0  # 光强 mol/(m²·s)
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        C = getattr(state, 'C_bulk', 0.5)
        # Beer-Lambert: I = I0 * exp(-epsilon*C*l)
        I_abs = self.I0 * (1 - math.exp(-self.epsilon * C * 0.01))
        rate = self.phi * I_abs  # 光反应速率
        return {'C_bulk': -rate * dt, 'conversion': rate * dt}


class ElectrodeKineticsRule(Rule):
    """电极动力学规则——Tafel方程"""
    def __init__(self, E_eq: float = 0.0, ba: float = 0.12, i0: float = 1e-5):
        super().__init__('ElectrodeKinetics', 'electrochem')
        self.E_eq = E_eq
        self.ba = ba  # Tafel斜率 V/dec
        self.i0 = i0  # 交换电流密度
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        eta = state.E_V - self.E_eq
        if abs(eta) < 0.01:
            return {'i_A_cm2': 0}
        # Tafel: log(i) = log(i0) + eta/ba
        i = self.i0 * 10 ** (eta / self.ba)
        i = min(i, 1.0)  # 限制
        return {'i_A_cm2': i}


class CrystallizationRule(Rule):
    """结晶规则——成核+生长"""
    def __init__(self, k_nucleation: float = 1e6, k_growth: float = 0.01, S_crit: float = 1.2):
        super().__init__('Crystallization', 'phase')
        self.k_nuc = k_nucleation
        self.k_grow = k_growth
        self.S_crit = S_crit
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        S = getattr(state, 'supersaturation', 1.0)
        if S > self.S_crit:
            B = self.k_nuc * (S - 1)**2  # 成核速率
            G = self.k_grow * (S - 1)  # 生长速率
            return {'C_bulk': -(B + G) * dt * 0.01, 'crystal_mass': G * dt}
        return {'crystal_mass': 0}


class PolymerizationRule(Rule):
    """聚合反应规则——链引发+增长+终止"""
    def __init__(self, kp: float = 100, kt: float = 1e7, f: float = 0.5):
        super().__init__('Polymerization', 'kinetics')
        self.kp = kp  # 链增长速率常数
        self.kt = kt  # 链终止速率常数
        self.f = f  # 引发效率
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        M = getattr(state, 'C_bulk', 1.0)  # 单体浓度
        I = getattr(state, 'initiator', 0.01)  # 引发剂
        # 稳态自由基浓度: R* = sqrt(f*kd*I/kt)
        R_star = (self.f * 0.01 * I / max(self.kt, 1)) ** 0.5
        rate = self.kp * M * R_star
        return {'C_bulk': -rate * dt, 'conversion': rate * dt / max(M, 0.001)}


class AdsorptionRule(Rule):
    """吸附规则——Langmuir等温线"""
    def __init__(self, q_max: float = 100, K_L: float = 0.1):
        super().__init__('Adsorption', 'surface')
        self.q_max = q_max  # 最大吸附量 mg/g
        self.K_L = K_L  # Langmuir常数
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        C = getattr(state, 'C_bulk', 10.0)  # 液相浓度
        q_eq = self.q_max * self.K_L * C / (1 + self.K_L * C)
        q_current = getattr(state, 'q_adsorbed', 0)
        # 动力学趋近平衡
        k_ads = 0.1
        dq = k_ads * (q_eq - q_current) * dt
        return {'q_adsorbed': dq, 'C_bulk': -dq * 0.01}


class MembraneSeparationRule(Rule):
    """膜分离规则——溶液扩散模型"""
    def __init__(self, A_perm: float = 5e-12, B_perm: float = 1e-8):
        super().__init__('MembraneSeparation', 'transport')
        self.A = A_perm  # 水渗透系数
        self.B = B_perm  # 溶质渗透系数
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        dP = getattr(state, 'pressure', 10e5)  # 压差 Pa
        dPi = getattr(state, 'osmotic_pressure', 0)  # 渗透压
        J_w = self.A * (dP - dPi)  # 水通量 m/s
        C = getattr(state, 'C_bulk', 0.5)
        J_s = self.B * C  # 溶质通量
        return {'flux_water': J_w, 'flux_solute': J_s}


class FluidizationRule(Rule):
    """流态化规则——Ergun方程+膨胀"""
    def __init__(self, dp: float = 100e-6, rho_s: float = 2500, epsilon_mf: float = 0.4):
        super().__init__('Fluidization', 'transport')
        self.dp = dp
        self.rho_s = rho_s
        self.eps_mf = epsilon_mf
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        U = getattr(state, 'velocity', 0.01)
        # 简化U_mf
        mu = 1.8e-5
        rho_g = 1.2
        Ar = rho_g * self.dp**3 * (self.rho_s - rho_g) * 9.81 / mu**2
        Re_mf = (33.7**2 + 0.0408*Ar)**0.5 - 33.7
        U_mf = Re_mf * mu / (rho_g * self.dp)
        
        if U > U_mf:
            n = 4.65 if self.dp > 150e-6 else 6.0
            epsilon = self.eps_mf * (U / U_mf)**(1/n)
            expansion = epsilon / self.eps_mf
            return {'bed_expansion': (expansion - getattr(state, 'bed_expansion', 1.0)) * 0.1}
        return {'bed_expansion': 0}


class CorrosionRule(Rule):
    """腐蚀规则——电化学腐蚀+钝化"""
    def __init__(self, i_corr_ref: float = 1e-5, Ea: float = 20, passive_current: float = 1e-7):
        super().__init__('Corrosion', 'electrochem')
        self.i_ref = i_corr_ref
        self.Ea = Ea * 1000  # J/mol
        self.i_passive = passive_current
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        R = 8.314
        # 温度效应
        T_factor = math.exp(-self.Ea / R * (1/state.T_K - 1/298.15))
        pH = getattr(state, 'pH', 7.0)
        pH_factor = 1 + max(0, (4 - pH)) * 0.3 if pH < 4 else 1.0
        
        i_corr = self.i_ref * T_factor * pH_factor
        # 钝化检查
        if getattr(state, 'passivated', False):
            i_corr = min(i_corr, self.i_passive)
        
        # 腐蚀速率 mm/year = i_corr * M / (n*F*rho) * 365*24*3600
        F = 96485
        M_metal = 55.85
        n = 2
        rho_metal = 7870
        CR = i_corr * M_metal / (n * F * rho_metal) * 365 * 24 * 3600 * 1000  # mm/year
        
        return {'i_corr': i_corr, 'corrosion_rate': CR * dt / 8760}


class DryingRule(Rule):
    """干燥规则——Page方程"""
    def __init__(self, k_drying: float = 0.5, n_page: float = 1.0, M_eq: float = 0.1):
        super().__init__('Drying', 'transport')
        self.k = k_drying
        self.n = n_page
        self.M_eq = M_eq
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        M = getattr(state, 'moisture', 0.5)  # 当前含水率
        M0 = getattr(state, 'M_initial', 5.0)
        if M0 <= self.M_eq:
            return {'moisture': 0}
        # Page方程: MR = exp(-k*t^n)
        t = getattr(state, 'time', 0)
        MR = math.exp(-self.k * max(t, 0.01) ** self.n)
        M_target = self.M_eq + (M0 - self.M_eq) * MR
        dM = (M_target - M) * 0.1  # 趋近目标
        return {'moisture': dM}


def run_coupled_photocatalysis_example():
    """耦合光催化实验——光化学+传质+热力学+吸附"""
    
    initial = State(
        T_K=298.15,
        P_Pa=101325,
        V_L=0.5,
        concentrations={
            'Catalyst': 0.001,
            'Substrate': 0.01,
            'Product': 0.0,
            'O2': 0.001,
        },
        E_V=0.0,
        pH=7.0,
    )
    
    rules = [
        PhotochemistryRule(epsilon=1000, phi=0.1, I0=1e-3),
        MassTransferRule(k_L=1e-5, a_interfacial=100),
        ThermodynamicsRule(dH_kJ=-50, dS_J=10),
        AdsorptionRule(q_max=100, K_L=0.1),
        HeatGenerationRule('Substrate', dH_kJ_mol=20),
        HeatTransferRule(T_env_K=298.15, U_W_m2K=50, A_m2=0.01),
    ]
    
    engine = CoupledEngine(rules, initial, dt=1.0)
    history = engine.run(total_time_s=1800)
    
    print("=== 耦合光催化实验 ===")
    print(f"初始: T={history[0]['T_K']:.1f}K")
    print(f"终态: T={history[-1]['T_K']:.1f}K")
    print(f"步数: {len(history)}")


def run_coupled_crystallization_example():
    """耦合结晶实验——结晶+传质+热力学+相变"""
    
    initial = State(
        T_K=323.15,  # 50°C
        P_Pa=101325,
        V_L=1.0,
        concentrations={
            'Solute': 0.5,
            'Crystal': 0.0,
        },
        E_V=0.0,
        pH=7.0,
    )
    
    rules = [
        CrystallizationRule(k_nucleation=1e6, k_growth=0.01, S_crit=1.2),
        CoolingRule(T_env_K=298.15, U_W_m2K=100, A_m2=0.01),  # 冷却结晶
        DiffusionRule(D=1e-9, dx=1e-3),
        ThermodynamicsRule(dH_kJ=-20, dS_J=-50),
    ]
    
    engine = CoupledEngine(rules, initial, dt=1.0)
    history = engine.run(total_time_s=3600)
    
    print("=== 耦合结晶实验 ===")
    print(f"初始: T={history[0]['T_K']:.1f}K")
    print(f"终态: T={history[-1]['T_K']:.1f}K")


def run_coupled_electrochemistry_example():
    """耦合电化学实验——电极动力学+传质+热+pH"""
    
    initial = State(
        T_K=298.15,
        P_Pa=101325,
        V_L=0.2,
        concentrations={
            'Cu2+': 0.5,
            'Cu': 0.0,
            'H+': 1e-3,
        },
        E_V=0.34,  # Cu/Cu2+电位
        pH=3.0,
    )
    
    rules = [
        ElectrodeKineticsRule(E_eq=0.34, ba=0.12, i0=1e-5),
        MassTransferRule(k_L=1e-5, a_interfacial=100),
        HeatGenerationRule('Cu2+', dH_kJ_mol=-50),
        HeatTransferRule(T_env_K=298.15, U_W_m2K=50, A_m2=0.01),
        pHRule(),
    ]
    
    engine = CoupledEngine(rules, initial, dt=0.5)
    history = engine.run(total_time_s=1800)
    
    print("=== 耦合电化学实验 ===")
    print(f"初始: T={history[0]['T_K']:.1f}K pH={history[0]['pH']:.2f}")
    print(f"终态: T={history[-1]['T_K']:.1f}K pH={history[-1]['pH']:.2f}")


class CoolingRule(Rule):
    """冷却规则——牛顿冷却定律"""
    def __init__(self, T_env_K: float = 298.15, U_W_m2K: float = 50, A_m2: float = 0.01):
        super().__init__('Cooling', 'heat')
        self.T_env = T_env_K
        self.U = U_W_m2K
        self.A = A_m2
    
    def apply(self, state: State, dt: float) -> Dict[str, float]:
        Q = self.U * self.A * (self.T_env - state.T_K)
        dT = Q / (1000 * 4.18 * 0.5) * dt  # 水的体积0.5L
        return {'T_K': dT}
