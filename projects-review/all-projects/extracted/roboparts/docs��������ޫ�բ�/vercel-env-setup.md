# Vercel 环境变量配置指南

## 1. 打开 Vercel 项目设置

- 访问 https://vercel.com/dashboard
- 选择项目 `roboparts`（域名 roboparts.cc）
- 左侧菜单 → **Settings** → **Environment Variables**

## 2. 添加 1 个新变量

| Key | Value | Environment |
|-----|-------|-------------|
| `AGNES_API_KEY` | `sk-KBSFxJBTWxZtA8G4nFRWjvzBwxBDbkPy9Y5tAcNLavqgoZso` | ✅ Production / ✅ Preview / ✅ Development |

（Value 直接复制整行 sk-… 开头的字符串）

## 3. 触发重新部署

加完环境变量后需要重新部署才生效：
- 进入 **Deployments** 标签
- 找到最新一次部署 → 三个点菜单 → **Redeploy**
- 勾选 **Clear Build Cache**（可选，但保险起见勾上）
- 点 **Redeploy**

## 4. 验证生效

部署完成后（约 30-60 秒），在终端执行：

```bash
curl -X POST https://roboparts.cc/api/v1/nl-compat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rbp_test1234567890abc" \
  -d '{"query":"我想用UR5e抓鸡蛋，预算2000"}'
```

成功响应会返回：
- `stage: "result"`
- `recommendations: [...]`（top 3 候选夹爪 + 转接件）
- `parsed.task: "抓易碎品"`
- `model: "agnes-2.0-flash"`

## 5. 注意事项

- **不要**把 `sk-…` 提交到任何公开仓库或前端代码里
- 同样的 key 也可以放在 `Preview` 环境，preview 部署也能调用
- 之前已有的 `XUNHU_APP_ID` / `XUNHU_APP_SECRET` / `SUPABASE_URL` 等保持不动
- 如果将来想换模型（DeepSeek/GLM/Qwen），加 1 个 `AGNES_BASE_URL` 和 `AGNES_MODEL` 即可

## 6. 一键复制命令（可选）

如果已装 Vercel CLI（推荐 28.0+）：

```bash
cd robot-parts-platform
vercel env add AGNES_API_KEY production
# 粘贴 sk-KBSFxJBTWxZtA8G4nFRWjvzBwxBDbkPy9Y5tAcNLavqgoZso
# 一路回车接受默认值

vercel --prod  # 重新部署
```

---

**配置完成时间预估**：1-2 分钟（含部署等待）
**当前状态**：代码已部署（commit 135b2b0），只差这个环境变量即可完全跑通
