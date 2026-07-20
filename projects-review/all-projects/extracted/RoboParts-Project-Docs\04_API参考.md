# RoboParts API 参考

> 文档版本：v1.0 | 更新日期：2026-06-25

---

## 一、API基础信息

| 项目 | 值 |
|------|-----|
| 基础URL | `https://roboparts.cc/api/v1` |
| 协议 | HTTPS |
| 请求格式 | JSON |
| 响应格式 | JSON |
| 认证方式 | 当前无认证（nl-compat需Agnes Key） |

---

## 二、端点详情

### 2.1 GET/POST `/api/v1/compat-check` ✅

**描述**：查询零件与机械臂的兼容性

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `arm_model` | string | 是 | 机械臂型号，如 "UR5e" |
| `gripper_model` | string | 是 | 夹爪型号，如 "Robotiq 2F-85" |
| `sources` | string[] | 否 | 数据来源过滤 ["official","community"] |

**响应结构**：
```json
{
  "success": true,
  "data": {
    "compatible": true,
    "confidence": 0.95,
    "adapter_required": false,
    "adapter_stl_available": false,
    "notes": "原生ISO-9283法兰兼容，无需适配器",
    "sources": [
      { "type": "official", "name": "UR官方", "verified": true },
      { "type": "community", "name": "用户@李明", "verified": false }
    ]
  }
}
```

**错误码**：
| HTTP状态 | 含义 |
|-----------|------|
| 200 | 成功 |
| 400 | 参数缺失或无效 |
| 404 | 未找到匹配数据 |

---

### 2.2 GET/POST `/api/v1/parts-recommend` ✅

**描述**：根据机械臂型号推荐兼容零件

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `arm_model` | string | 是 | 机械臂型号 |
| `part_type` | string | 否 | 零件类型：gripper/sensor/camera/adapter |
| `limit` | int | 否 | 返回条数，默认10 |
| `budget_usd` | float | 否 | 预算上限(USD) |

**响应结构**：
```json
{
  "success": true,
  "data": {
    "arm_model": "UR5e",
    "count": 5,
    "results": [
      {
        "gripper_model": "Robotiq 2F-85",
        "brand": "Robotiq",
        "type": "平行夹爪",
        "payload_kg": 5,
        "price_usd": 1495,
        "compatible": true,
        "adapter_required": false,
        "affiliate_url": "https://robotiq.com/?ref=roboparts"
      }
    ]
  }
}
```

---

### 2.3 POST `/api/v1/nl-compat` 🔄

**描述**：自然语言兼容性查询（LLM驱动）

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | 是 | 自然语言查询 |
| `lang` | string | 否 | 语言，默认"zh" |

**响应结构**：
```json
{
  "success": true,
  "data": {
    "query": "UR5e能用Robotiq 2F-85夹爪吗？",
    "answer": "是的，Robotiq 2F-85可以直接安装在UR5e上，都支持ISO-9283标准法兰。无需适配器，开箱即用。",
    "compatible": true,
    "confidence": 0.95,
    "related_parts": [...]
  }
}
```

**测试用例清单**：
1. ✅ "UR5e能用Robotiq 2F-85夹爪吗？"
2. 🔲 "FANUC M-10iA兼容哪些夹爪？"
3. 🔲 "Dobot CR5法兰盘规格"
4. 🔲 "推荐UR3e的精密装配夹爪，预算300美元内"

---

### 2.4 （预留） `/api/v1/export-db` 💡

**描述**：导出兼容性数据库为CSV/JSON（规划中）

---

## 三、Serverless实现模式

两个零成本端点采用 Vercel Serverless Functions，核心逻辑：

```javascript
// /api/v1/compat-check.js Vercel Edge Function
export default async function handler(req, res) {
  const { arm_model, gripper_model } = req.body;

  // 1. 查询Supabase兼容性表
  const { data } = await supabase
    .from('compatibility')
    .select('*, arms!inner(*), grippers!inner(*)')
    .eq('arms.model', arm_model)
    .eq('grippers.model', gripper_model)
    .single();

  // 2. 返回结果
  return res.json({ success: true, data });
}
```

```javascript
// /api/v1/nl-compat.js — LLM驱动版本
export default async function handler(req, res) {
  const { query } = req.body;

  // 1. 用LLM理解自然语言意图
  const intent = await llm.parse(query);

  // 2. 调用compat-check内部逻辑
  const result = await checkCompatibility(intent.arm, intent.gripper);

  // 3. 用LLM生成自然语言回复
  const answer = await llm.generate(result, query);

  return res.json({ success: true, data: { query, answer, ...result } });
}
```
