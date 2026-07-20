# 🐝 SwarmLabs 蜂群科研

AI驱动的材料模拟平台——4层全尺度物理模拟+ML校正预测。

## 核心能力

### 4层模拟栈
1. **量子级** — PySCF DFT (误差<1%, NIST验证)
2. **原子级** — OpenMM/MMFF94 MD (8种力场, Langevin恒温器)
3. **ML校正** — 物理方程+GBR残差 (8引擎精度提升32-50%)
4. **宏观级** — 反应动力学方程 (Arrhenius/幂律退化)

### 技术栈
| 组件 | 版本 | 用途 |
|------|------|------|
| PySCF | 2.13.1 | DFT量子化学计算 |
| OpenMM | 8.5.2 | 分子动力学(TIP3P+Langevin) |
| RDKit | 2026.03.3 | MMFF94/UFF力场+SMILES→3D |
| scikit-learn | — | GradientBoosting ML校正 |
| ASE | 3.29.0 | 原子模拟环境 |

### 真实验证数据
- 10个分子NIST CCCBDB DFT能量+实验偶极矩
- 来源: NIST CCCBDB + McClellan(1963) + NIST WebBook

### 材料属性数据库
8类70种材料(带隙/电压/容量/效率/晶体结构等真实属性):
- 光催化(10) / 电池(10) / 钙钛矿(10) / 吸附(10)
- 腐蚀(10) / 高分子(10) / 合成氨(5) / 燃烧(5)
- 来源: NIST/JARVIS/NREL/文献

### ML校正模型
8个引擎的"物理方程+ML残差"校正:
| 引擎 | 精度提升 |
|------|----------|
| 光催化 | 42.3% |
| 电池 | 34.1% |
| 钙钛矿 | 36.5% |
| 吸附 | 49.8% |
| 腐蚀 | 43.3% |
| 高分子 | 41.9% |
| 合成氨 | 34.9% |
| 燃烧 | 32.5% |

## API端点 (25+)

### 量子化学
- `GET /api/v1/quantum_calc/{molecule}` — DFT计算
- `GET /api/v1/quantum_molecules` — 可用分子列表

### 分子动力学
- `POST /api/v1/md/simulate` — MD模拟(多力场)
- `GET /api/v1/md/forcefields` — 8种力场数据库
- `GET /api/v1/md/recommend_forcefield?system=药物` — 力场推荐
- `POST /api/v1/md/compare_forcefields` — 多力场对比
- `POST /api/v1/md/optimize` — 结构优化

### ML预测
- `GET /api/v1/ml/predict?smiles=CCO` — 分子ML预测
- `GET /api/v1/ml/benchmark` — NIST验证数据集
- `GET /api/v1/engine_ml/list` — 8引擎ML模型
- `GET /api/v1/engine_ml/{engine_id}` — 引擎ML校正

### 材料数据库
- `GET /api/v1/materials_db/{category}` — 8类70种材料

### 跨项目API
- `GET /api/v1/cross/sites` — 14站API列表
- `GET /api/v1/cross/{site}/entities` — 跨站查询
- `GET /api/v1/cross/search?q=关键词` — 跨14站搜索

### 鉴权
| Key类型 | 限制 | 获取方式 |
|---------|------|----------|
| 内部Key | 无限制 | gtk_internal_eve_2026 |
| 免费Key | 30次/小时 | POST /api/register |
| Pro Key | 10000次/天 | Creem $49/月 |

## 前端 (11页面)
- 首页 / 量子计算 / 分子动力学 / ML预测 / 材料数据库
- 材料预测 / 引擎详情 / 力场引擎 / 反应动力学 / API文档 / 关于

## 部署
- API: http://150.158.119.19:8461
- 前端: https://swarmlabs.pages.dev
- GitHub: https://github.com/lm203688/swarmlabs

## License
MIT
