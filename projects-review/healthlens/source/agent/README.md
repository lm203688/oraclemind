# 比特助手 - 辅助Agent

基于 **Agnes 2.0 Flash** 模型的辅助Agent，部署在腾讯云ECS，作为黄金比特的远程助手。

## 注册 Agnes API（免费）

1. 打开 https://agnes-ai.com
2. 点击注册（支持Google/GitHub登录）
3. 进入 Dashboard → Settings → API Keys → Create new secret key
4. 复制 API Key（以 `sk-` 开头）
5. **免费额度**：Agnes 2.0 永久免费，无需信用卡

## 部署到腾讯云ECS

### 方式一：Docker（推荐）

```bash
# 1. 上传文件到ECS
scp -r agent/ ubuntu@150.158.119.19:/home/ubuntu/bit-assistant/

# 2. SSH到ECS
ssh ubuntu@150.158.119.19

# 3. 设置API Key
cd /home/ubuntu/bit-assistant
echo 'AGNES_API_KEY=sk-你的密钥' > .env

# 4. 构建并启动
docker compose up -d --build

# 5. 验证
curl http://localhost:8430/health
```

### 方式二：直接运行

```bash
# 1. 上传文件
scp agent.py ubuntu@150.158.119.19:/home/ubuntu/bit-assistant/

# 2. SSH到ECS
ssh ubuntu@150.158.119.19

# 3. 设置环境变量
export AGNES_API_KEY=sk-你的密钥

# 4. 后台启动
cd /home/ubuntu/bit-assistant
nohup python3 agent.py > agent.log 2>&1 &

# 5. 验证
curl http://localhost:8430/health
```

## API 使用

### 聊天（同步）

```bash
curl -X POST http://150.158.119.19:8430/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "分析一下最近AI行业的趋势",
    "session_id": "test001"
  }'
```

### 创建异步任务

```bash
curl -X POST http://150.158.119.19:8430/task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "写一份关于MCP协议的技术分析报告"
  }'
```

### 查看任务状态

```bash
curl http://150.158.119.19:8430/tasks/{task_id}
```

### 健康检查

```bash
curl http://150.158.119.19:8430/health
```

## API 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 服务信息 |
| GET | `/health` | 健康检查 |
| POST | `/chat` | 聊天（同步返回） |
| POST | `/task` | 创建异步任务 |
| GET | `/tasks` | 任务列表 |
| GET | `/tasks/{id}` | 任务状态 |
| GET | `/sessions` | 会话列表 |
| GET | `/sessions/{id}/history` | 会话历史 |
| POST | `/sessions/clear` | 清空会话 |

## 与黄金比特协作

黄金比特可以通过HTTP API调用比特助手：

```python
import urllib.request, json

def ask_assistant(message: str, session_id: str = "default") -> str:
    """调用比特助手"""
    url = "http://150.158.119.19:8430/chat"
    data = json.dumps({"message": message, "session_id": session_id}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        return result["content"] if result["success"] else f"[错误] {result['error']}"
```

## 模型信息

- **模型**: Agnes 2.0 Flash
- **厂商**: Sapiens AI（新加坡，全球Top 10 AI实验室）
- **上下文窗口**: 256K tokens
- **定价**: 免费（永久）
- **能力**: 文本生成、推理、代码、Agent工作流、工具调用
- **兼容**: OpenAI API格式
