"""
物理规则耦合引擎——每个时间步同时执行多物理规则
纲领要求: "物理规则在每个时间步同时作用"
差异化: 上海科研工厂用实体实验，蜂群科研用规则耦合虚拟引擎
"""

import math
from typing import Dict, List, Tuple
from dataclasses import dataclass, field

@dataclass
class SystemState:
    """系统状态——每个时间步的全部物理量"""
    time: float = 0.0  # 时间(s)
    temperature: float = 298.15  # 温度(K)
    pressure: float = 101325  # 压力(Pa)
    concentration: Dict[str, float] = field(default_factory=dict)  # 浓度(mol/L)
    conversion: float = 0.0  # 转化率
    yield_pct: float = 0.0  # 产率
    selectivity: float = 1.0  # 选择性
    energy: float = 0.0  # 能量(J)
    entropy: float = 0.0  # 熵(J/K)
    ph: float = 7.0  # pH
    viscosity: float = 0.001  # 粘度(Pa·s)
    density: float = 1000  # 密度(kg/m³)


class CoupledRuleEngine:
    """耦合规则引擎——每个时间步同时执行所有物理规则"""
    
    def __init__(self, rules: List[Dict]):
        """
        Args:
            rules: 物理规则列表
            [{"name": "Arrhenius", "type": "kinetics", "Ea": 50000, "A": 1e10},
             {"name": "HeatTransfer", "type": "thermal", "U": 100, "A": 1.0},
             {"name": "MassTransfer", "type": "mass", "k_L": 1e-4},
             {"name": "Thermodynamics", "type": "equilibrium", "K": 100}]
        """
        self.rules = rules
        self.history = []
    
    def step(self, state: SystemState, dt: float) -> SystemState:
        """一个时间步——同时执行所有规则"""
        new_state = SystemState(
            time=state.time + dt,
            temperature=state.temperature,
            pressure=state.pressure,
            concentration=dict(state.concentration),
            conversion=state.conversion,
            yield_pct=state.yield_pct,
            selectivity=state.selectivity,
            energy=state.energy,
            entropy=state.entropy,
            ph=state.ph,
            viscosity=state.viscosity,
            density=state.density,
        )
        
        # 同时计算所有规则的影响——不顺序执行
        delta_T = 0.0  # 温度变化
        delta_X = 0.0  # 转化率变化
        delta_Y = 0.0  # 产率变化
        delta_S = 0.0  # 选择性变化
        delta_E = 0.0  # 能量变化
        delta_H = 0.0  # 熵变化
        
        for rule in self.rules:
            rule_type = rule.get('type', '')
            
            if rule_type == 'kinetics':
                # Arrhenius动力学: dX/dt = A*exp(-Ea/RT) * (1-X)
                Ea = rule.get('Ea', 50000)
                A = rule.get('A', 1e10)
                k = A * math.exp(-Ea / (8.314 * new_state.temperature))
                delta_X += k * (1 - new_state.conversion) * dt
                
            elif rule_type == 'thermal':
                # 传热: dT/dt = U*A*(T_wall - T) / (m*Cp)
                U = rule.get('U', 100)
                A_area = rule.get('A', 1.0)
                T_wall = rule.get('T_wall', new_state.temperature + 10)
                m = rule.get('mass', 1.0)
                Cp = rule.get('Cp', 4180)
                delta_T += U * A_area * (T_wall - new_state.temperature) / (m * Cp) * dt
                
            elif rule_type == 'mass':
                # 传质: dC/dt = k_L*a*(C_bulk - C_surface)
                k_L = rule.get('k_L', 1e-4)
                a = rule.get('a', 100)
                C_bulk = rule.get('C_bulk', 1.0)
                for species in new_state.concentration:
                    C_surf = new_state.concentration[species]
                    new_state.concentration[species] += k_L * a * (C_bulk - C_surf) * dt
                    
            elif rule_type == 'equilibrium':
                # 热力学平衡: K = exp(-ΔG/RT)
                K = rule.get('K', 100)
                dH = rule.get('dH', -50000)  # 反应焓
                # 平衡约束——限制转化率不超过平衡转化率
                X_eq = K / (1 + K)
                if new_state.conversion + delta_X > X_eq:
                    delta_X = X_eq - new_state.conversion
                # 反应热
                delta_E += dH * delta_X
                delta_T += dH * delta_X / (rule.get('mass', 1.0) * rule.get('Cp', 4180))
                
            elif rule_type == 'viscosity':
                # 粘度随温度变化
                mu_0 = rule.get('mu_0', 0.001)
                Ea_v = rule.get('Ea_visc', 15000)
                new_state.viscosity = mu_0 * math.exp(Ea_v / (8.314 * new_state.temperature))
                
            elif rule_type == 'ph':
                # pH变化——反应消耗/产生H+
                dH_ion = rule.get('dH_ion', 0)
                if dH_ion != 0:
                    new_state.ph += dH_ion * dt
        
        # 应用所有变化——同时更新
        new_state.temperature += delta_T
        new_state.conversion = min(0.999, max(0, new_state.conversion + delta_X))
        new_state.yield_pct = min(99.9, max(0, new_state.yield_pct + delta_Y))
        new_state.selectivity = min(1.0, max(0, new_state.selectivity + delta_S))
        new_state.energy += delta_E
        new_state.entropy += delta_H
        
        return new_state
    
    def simulate(self, initial_state: SystemState, dt: float = 0.1, 
                 total_time: float = 3600) -> List[SystemState]:
        """完整模拟——每个时间步同时执行所有规则"""
        state = initial_state
        self.history = [state]
        
        steps = int(total_time / dt)
        for i in range(steps):
            state = self.step(state, dt)
            self.history.append(state)
            
            # 每100步记录一次
            if i % 100 == 0:
                pass  # 可以加日志
        
        return self.history


# ========== 预设规则组合 ==========
RULE_PRESETS = {
    'suzuki_coupling': [
        {"name": "Arrhenius", "type": "kinetics", "Ea": 60000, "A": 5e10},
        {"name": "HeatTransfer", "type": "thermal", "U": 50, "A": 0.5, "T_wall": 353.15},
        {"name": "Thermodynamics", "type": "equilibrium", "K": 1000, "dH": -80000},
        {"name": "Viscosity", "type": "viscosity", "mu_0": 0.001, "Ea_visc": 15000},
    ],
    'electrolysis': [
        {"name": "Faraday", "type": "kinetics", "Ea": 30000, "A": 1e8},
        {"name": "OhmicHeating", "type": "thermal", "U": 100, "A": 1.0, "T_wall": 353.15},
        {"name": "GasEvolution", "type": "mass", "k_L": 5e-4, "a": 200},
        {"name": "Thermodynamics", "type": "equilibrium", "K": 100, "dH": -285000},
    ],
    'crystallization': [
        {"name": "Nucleation", "type": "kinetics", "Ea": 40000, "A": 1e12},
        {"name": "Cooling", "type": "thermal", "U": 200, "A": 2.0, "T_wall": 293.15},
        {"name": "MassTransfer", "type": "mass", "k_L": 1e-5, "a": 1000},
        {"name": "Thermodynamics", "type": "equilibrium", "K": 10, "dH": 20000},
    ],
}


# ========== 验证 ============
if __name__ == "__main__":
    # 测试Suzuki耦合规则
    engine = CoupledRuleEngine(RULE_PRESETS['suzuki_coupling'])
    
    initial = SystemState(
        temperature=353.15,  # 80°C
        concentration={'reactant': 1.0, 'product': 0.0},
        conversion=0.0,
    )
    
    # 模拟4小时
    history = engine.simulate(initial, dt=1.0, total_time=14400)
    
    final = history[-1]
    print(f"Suzuki耦合模拟(4小时):")
    print(f"  转化率: {final.conversion*100:.1f}%")
    print(f"  温度: {final.temperature-273.15:.1f}°C")
    print(f"  能量: {final.energy:.0f}J")
    print(f"  时间步: {len(history)}")
    print(f"  规则数: {len(engine.rules)} (同时执行)")
