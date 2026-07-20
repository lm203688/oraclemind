# Swarmlabs Python SDK

166 virtual experiment engines with 16,000+ real paper validations.

## Install
```bash
pip install swarmlabs
```

## Quick Start
```python
from swarmlabs import Swarmlabs

client = Swarmlabs()

# List all 166 engines
engines = client.list_engines()

# Run virtual experiment
result = client.run('suzuki', temperature_C=80, time_h=4)
print(result['result']['result'])  # 68.0%

# AI optimization
opt = client.optimize('suzuki', n_iterations=100)
print(opt['optimization']['best_result'])  # 95.0%

# Validate accuracy
val = client.validate('suzuki')
print(val['validation']['mean_error'])  # 4.2%
```

## 166 Engines
- Catalysis: suzuki, heck, hydrogenation, enzyme, ammonia
- Electrochemistry: battery, co2, electrolysis, electroplating, corrosion
- Separation: distillation, extraction, membrane, filtration
- Materials: perovskite, polymer, crystal, sintering
- And 150+ more...
