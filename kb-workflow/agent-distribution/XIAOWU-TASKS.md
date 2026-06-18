# 小乌定时任务清单

## 每日任务

### 1. 知识库深挖（已有cron job，每天6:00 AM）
- AgentMore cron自动执行
- 轮换规则见 cron job prompt

### 2. SEO提交（已有cron job，每天3:00 AM）
- AgentMore cron自动执行

## 每周任务

### 3. CF Pages部署（周一10:00 AM）
脚本: `bash /home/z/my-project/kb-workflow/agent-distribution/deploy-all.sh`

### 4. MCP目录提交+Agent分发检查（周二2:00 PM）
脚本: `bash /home/z/my-project/kb-workflow/agent-distribution/submit-to-directories.sh`

## 按需任务（小乌可随时执行）

### 5. 知识库更新后自动部署
```bash
cd /home/z/my-project
node kb-workflow/scripts/add-agent-api.js
bash kb-workflow/agent-distribution/deploy-all.sh
```

### 6. 检查12站健康状态
```bash
bash /home/z/my-project/kb-workflow/agent-distribution/health-check.sh
```

### 7. 更新llms.txt和schema.json
```bash
python3 /home/z/my-project/kb-workflow/agent-distribution/update-agent-files.py
bash /home/z/my-project/kb-workflow/agent-distribution/deploy-all.sh
```
