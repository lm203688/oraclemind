# RoboParts × LLM 控制层集成规范（草案 v0.1）

> 状态：草案（2026-06-18）  
> 背景：阿里巴巴于 2026-06-16 发布 Qwen-Robot 系列（Manip/Nav/World），
> 提出"标准化接口"以实现不同形态机器人的统一控制。
> 本规范定义 RoboParts（零件选型层）与控制层 LLM 的标准对接方式。

---

## 一、背景与目标

### 问题
当前机器人开发生态存在断层：

```
┌──────────────────────────────────────┐
│  控制层 LLM（Qwen-Robot / GPT 等）  │  ← 知道"要做什么"
│  Manip: 抓取 │ Nav: 移动 │ World: 预测 │
├──────────────────────────────────────┤
│              断层！                          │
├──────────────────────────────────────┤
│  RoboParts（零件选型层）              │  ← 知道"能接什么"
│  兼容性检查 │ STL转接件 │ 选型推荐      │
└──────────────────────────────────────┘
```

### 目标
定义标准 API 和规范，使：
1. **控制层 LLM** 能查询"这个机械臂能接什么夹爪"
2. **RoboParts** 能接收 LLM 的零件需求，返回兼容方案 + 转接件 STL
3. **用户** 用自然语言完成"从任务描述 → 零件选型 → 下单打印"全流程

---

## 二、Qwen-Robot 接口标准化分析

根据阿里巴巴 2026-06-16 发布信息，Qwen-Robot 系列的核心设计理念是：

| 模型 | 职责 | 关键接口设计 |
|---|---|---|
| Qwen-RobotManip | 操作控制（手） | 规范状态-动作空间 + 相机坐标系末端执行器增量位姿 |
| Qwen-RobotNav | 移动控制（脚） | 可控观测编码 + 工具接口，统一四类导航任务 |
| Qwen-RobotWorld | 世界模型（大脑） | 自然语言动作接口，跨操作/驾驶/导航场景 |

**关键洞察**：Qwen-Robot 定义了一个"规范状态-动作空间"——
这意味着它需要一个**零件能力数据库**来告诉模型"当前末端执行器能做什么"。

**RoboParts 的角色**：为 Qwen-Robot 提供末端执行器能力数据。

---

## 三、RoboParts API 规范（V1.0 草案）

### Base URL
```
https://roboparts.cc/api/v1
```

### 认证
```http
X-API-Key: rbp_<your_api_key>
```
（免费申请，限 1000 次/天）

---

### Endpoint 1: 兼容性检查
```http
POST /api/v1/compat/check
Content-Type: application/json

{
  "robot_arm": "DOBOT Magician",
  "end_effector": "Robotiq 2F-85",
  "check_items": ["flange", "voltage", "protocol"]
}
```

**响应**：
```json
{
  "compatible": true,
  "direct_mount": true,
  "flange_match": "ISO 9409-50-4-M6",
  "adapter_required": false,
  "stl_url": null,
  "notes": "可直接安装，无需转接件"
}
```

**不兼容时**：
```json
{
  "compatible": false,
  "direct_mount": false,
  "missing_adapter": {
    "name": "ISO50转舵机转接件 v3",
    "stl_url": "https://roboparts.cc/stl/iso50-to-servo.stl",
    "print_price": 18,
    "order_url": "https://roboparts.cc/api/create-order?stl_id=iso50-to-servo"
  }
}
```

---

### Endpoint 2: 零件选型推荐
```http
POST /api/v1/parts/recommend
Content-Type: application/json

{
  "robot_arm": "myCobot 280",
  "task": "抓取易碎品，需要力反馈",
  "budget": 1000,
  "prefer_brand": null
}
```

**响应**：
```json
{
  "recommendations": [
    {
      "rank": 1,
      "part": {
        "name": "慧灵 LFG-Micro",
        "brand": "慧灵科技",
        "type": "electric-gripper",
        "price": 680,
        "compat": true,
        "adapter_stl": "https://roboparts.cc/stl/mycobot-flange-adapter.stl"
      },
      "reasoning": "LFG-Micro 支持力矩反馈，适合易碎品抓取；价格在预算内；myCobot 280 可直接安装（需转接件，已提供）"
    }
  ]
}
```

---

### Endpoint 3: 自然语言兼容性查询（LLM 友好）
```http
POST /api/v1/nl/compat
Content-Type: application/json

{
  "query": "我的 UR5e 能接 Robotiq 2F-85 吗？如果不能，需要什么转接件？"
}
```

**响应**：
```json
{
  "answer": "可以！UR5e 使用 ISO 9409-50 法兰，Robotiq 2F-85 也使用 ISO 9409-50 接口，可直接安装，无需转接件。",
  "compatible": true,
  "related_stls": [],
  "affiliate_link": "https://s.taobao.com/search?q=Robotiq+2F-85"
}
```

---

### Endpoint 4: 控制层 LLM 回调接口（新增）
允许 Qwen-RobotManip 等控制层 LLM 在"规划抓取"时查询末端执行器能力：

```http
POST /api/v1/end-effector/capabilities
Content-Type: application/json

{
  "end_effector": "Robotiq 2F-85",
  "query_fields": ["grip_force", "stroke", "opening_speed", "sensors"]
}
```

**响应**：
```json
{
  "end_effector": "Robotiq 2F-85",
  "capabilities": {
    "grip_force": [20, 235],  // N
    "stroke": 85,  // mm
    "opening_speed": "可调",
    "sensors": ["位置反馈", "力矩反馈"],
    "control_protocol": "Modbus RTU / TCP",
    "voltage": "24V DC"
  }
}
```

---

## 四、与 Qwen-Robot 的集成方案

### 方案 A：RoboParts 作为 Qwen-Robot 的"零件知识库"

```
Qwen-RobotManip（规划抓取任务）
    ↓ 需要知道"当前夹爪能输出多少力"
    → 调用 RoboParts API: POST /api/v1/end-effector/capabilities
    ← 返回 { grip_force: [20, 235] }
    ↓ 根据力范围规划抓取策略
```

### 方案 B：RoboParts 接入 Qwen-Agent（MCP 协议）

Qwen-Agent 支持 MCP（Model Context Protocol）。
RoboParts 实现 MCP Server，使任何支持 MCP 的 LLM 都能查询零件兼容性。

**MCP Tools 定义**：
```json
{
  "tools": [
    {
      "name": "check_compatibility",
      "description": "检查机械臂与末端执行器的兼容性",
      "parameters": {
        "robot_arm": {"type": "string"},
        "end_effector": {"type": "string"}
      }
    },
    {
      "name": "recommend_parts",
      "description": "根据任务需求推荐零件",
      "parameters": {
        "task": {"type": "string"},
        "budget": {"type": "number"}
      }
    },
    {
      "name": "get_stl",
      "description": "获取转接件 STL 文件下载链接",
      "parameters": {
        "adapter_name": {"type": "string"}
      }
    }
  ]
}
```

### 方案 C：在 RoboParts 平台内嵌入 LLM 对话助手

用户可以在平台内直接问：
- "帮我选一个适合 UR5e 的夹爪，预算 1000 元"
- "这个转接件打印出来后怎么安装？"
- "我的项目需要抓取 500g 的物体，推荐方案"

（使用 Qwen3 或 DeepSeek API，平台内置对话助手）

---

## 五、实施路线图

| 阶段 | 时间 | 内容 |
|---|---|---|
| **P0: API 基础** | 本周 | 实现 `/api/v1/compat/check` 和 `/api/v1/parts/recommend` |
| **P1: NL 查询** | 下周 | 接入 Qwen3 API，实现自然语言兼容性查询 |
| **P2: MCP Server** | 本月 | 实现 MCP 协议，发布到 npm/PyPI |
| **P3: Qwen-Robot 官方对接** | 待定 | 等待 Qwen-Robot API 开放后正式对接 |

---

## 六、下一步行动

- [ ] 在 Supabase 中创建 `api_keys` 表（用于 API 认证）
- [ ] 实现 `api/compat-check.js`（Vercel Serverless）
- [ ] 实现 `api/parts-recommend.js`（Vercel Serverless）
- [ ] 申请 Qwen3 API Key（阿里云百炼平台）
- [ ] 关注 Qwen-Robot GitHub 仓库（https://github.com/QwenLM 等待新仓库出现）
- [ ] 撰写知乎文章："Qwen-Robot 来了，机器人零件平台该怎么接？"

---

*本规范为草案，欢迎社区反馈。*
*最后更新：2026-06-18*
*作者：RoboLink 团队*
