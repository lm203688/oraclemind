# 蜂群科研平台 — 完整备份

**备份时间**: 2026-07-01 17:10
**备份人**: AI生态缔造者
**项目**: 蜂群科研平台 (swarm-research)

---

## 目录结构

```
swarm-backup/
├── README_BACKUP.md          ← 本文件（总览+所有密钥配置）
├── remote-code/              ← 远程Lighthouse完整代码+数据（生产环境）
│   ├── api/server.py         ← Flask API服务
│   ├── agents/               ← 8种蜂Agent
│   ├── core/                 ← 核心模块
│   │   ├── config.py         ← LLM/积分/BYOK配置
│   │   ├── credits.py        ← 积分系统
│   │   ├── knowledge.py      ← 知识库
│   │   ├── verified_kb.py    ← 验证知识库
│   │   ├── skill_loader.py   ← Skill动态加载
│   │   ├── scheduler.py      ← 任务调度
│   │   ├── cross_domain.py   ← 跨领域发现
│   │   ├── llm_client.py     ← LLM客户端
│   │   └── data/             ← 运行时数据（重要！）
│   │       ├── users.json    ← 用户数据
│   │       ├── credits.json  ← 积分记录
│   │       ├── knowledge.json ← 知识库（325KB）
│   │       └── verified_kb.json ← 验证知识库
│   ├── skills/               ← 8个YAML skill定义
│   ├── sdk/                  ← 开源SDK
│   ├── templates/swarm.html  ← 前端工作台（62KB）
│   └── gunicorn.log          ← 运行日志
├── local-docs/               ← 本地设计文档
│   ├── 00_市场调研与架构设计.md
│   ├── 01_模块化架构v2.md
│   ├── 02_成本与商业模式.md
│   ├── 03_积分制商业模式.md
│   ├── 04_最终定价方案.md
│   ├── 05_竞品调研_2026-06-19.md
│   ├── 05b_竞品可参考点分析_2026-06-19.md
│   └── swarm.html.bak        ← 前端备份
└── server-config/            ← 服务器配置
    ├── nginx_swarm           ← nginx站点配置
    ├── nginx.conf            ← nginx主配置
    ├── swarm_error2.log      ← gunicorn错误日志
    └── deployment.md         ← 部署运维指南
```

---

## 服务器信息

| 项目 | 值 |
|------|-----|
| 主机 | 腾讯云 Lighthouse |
| IP | 150.158.119.19 |
| SSH用户 | ubuntu |
| SSH端口 | 22 |
| 登录方式 | 公钥（仅公钥，PasswordAuthentication no） |
| SSH密钥 | /home/z/.ssh/lighthouse_new（公钥结尾5c4B） |

---

## 服务端口

| 端口 | 服务 | 说明 |
|------|------|------|
| 8460 | 蜂群gunicorn | Flask API，2 workers, 2 threads, timeout 120s |
| 8431 | 比特助手 | agnes-2.0-flash，OpenAI兼容 |
| 8450 | AIShield | gunicorn 2 workers |
| 80 | nginx | 反向代理 |
| 443 | nginx | HTTPS |

---

## 域名 & 隧道

| 域名 | 指向 | 方式 |
|------|------|------|
| swarm.aishield.tools | http://localhost:8460 | Cloudflare Tunnel → nginx → gunicorn |

### Cloudflare 隧道配置

- **隧道名**: aishield.tools
- **隧道ID**: a956a3fe-ad15-4f1e-8499-8dad27859d3d
- **Cloudflare账号**: 61960005@qq.com
- **Account ID**: 8162aa3b2241c132e43a81f526d7f758
- **cloudflared版本**: 2026.6.1
- **cloudflared**: systemd服务运行中(token模式)
- **配置位置**: Cloudflare Dashboard → Zero Trust → Networks → Tunnels → aishield.tools → Routes
- **Route**: swarm.aishield.tools → http://localhost:8460

---

## LLM 配置

| 项目 | 值 |
|------|-----|
| API URL | http://150.158.119.19:8431/v1/chat/completions |
| API Key | test（agnes无需真实key） |
| 模型 | bit-assistant-v2 |
| 费用 | 免费 |

---

## ReactionT5 模型（化学蜂反应预测）

| 项目 | 值 |
|------|-----|
| 模型 | sagawa/ReactionT5v2-forward |
| 参数量 | 198M |
| 大小 | 758MB |
| 位置 | /home/ubuntu/.cache/huggingface/hub/models--sagawa--ReactionT5v2-forward |
| 推理时间 | CPU 3-5秒/反应 |
| HF镜像 | hf-mirror.com（Lighthouse无法直连huggingface.co） |
| ⚠️ 模型文件未包含在此备份中（太大758MB），恢复时需重新下载 |

### 恢复模型命令
```bash
HF_ENDPOINT=https://hf-mirror.com python3 -c "
from transformers import T5ForConditionalGeneration, T5Tokenizer
m = T5ForConditionalGeneration.from_pretrained('sagawa/ReactionT5v2-forward')
t = T5Tokenizer.from_pretrained('sagawa/ReactionT5v2-forward')
"
```

---

## 依赖包（pip）

```
Flask==3.1.3
flask-cors==6.0.5
gunicorn==26.0.0
numpy==2.2.6
rdkit==2026.3.3
requests==2.34.2
torch==2.12.1+cpu  # CPU版，2GB内存Lighthouse专用
```

### torch安装（CPU版，小内存）
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

---

## gunicorn 启动命令

```bash
cd /home/ubuntu/swarm-research
gunicorn api.server:app \
  -w 2 --threads 2 \
  -b 0.0.0.0:8460 \
  --timeout 120 \
  --daemon \
  --pid /tmp/swarm_gunicorn.pid \
  --error-logfile /tmp/swarm_error2.log
```

---

## 用户数据（users.json摘要）

共9个测试用户（无真实用户）：
- test_user, test_li, test_full, debug_user2
- user_alice, user_bob, test_admet
- test_deploy, test_deploy2

无密码字段（注册时不要求密码，仅username+email）。

---

## 积分定价

| 套餐 | 价格 | 积分 | BYOK | 有效期 |
|------|------|------|------|--------|
| 基础包 | ¥39 | 110,000 | ❌ | 365天 |
| 研究包 | ¥69 | 230,000 | ✅ | 365天 |
| 实验室包 | ¥199 | 500,000 | ✅ | 365天 |
| 企业包 | ¥499 | 1,350,000 | ✅ | 365天 |

- 免费额度: 2,000分/天 + 注册10,000分
- 积分有效期: 365天

---

## 8种蜂

| 蜂 | 积分消耗 | 功能 |
|----|---------|------|
| 文献蜂 | 500 | 文献检索与综述 |
| 假设蜂 | 300 | 假设生成 |
| 写作蜂 | 800 | 论文写作 |
| 化学蜂 | 1000-3000 | 分子设计+ADMET+反应预测 |
| ML实验蜂 | 5000 | 机器学习实验设计 |
| 分析蜂 | 500 | 数据分析 |
| 评审蜂 | 1000 | 跨模型评审 |
| 验证蜂 | 1000 | RDKit论文验证 |

---

## 恢复部署步骤

1. **SSH连接Lighthouse**
   ```bash
   ssh -i /path/to/lighthouse_new ubuntu@150.158.119.19
   ```

2. **上传代码**
   ```bash
   scp -r remote-code/ ubuntu@150.158.119.19:/home/ubuntu/swarm-research/
   ```

3. **安装依赖**
   ```bash
   pip3 install flask flask-cors gunicorn rdkit requests numpy
   pip3 install torch --index-url https://download.pytorch.org/whl/cpu
   ```

4. **下载ReactionT5模型**
   ```bash
   HF_ENDPOINT=https://hf-mirror.com python3 -c "
   from transformers import T5ForConditionalGeneration, T5Tokenizer
   T5ForConditionalGeneration.from_pretrained('sagawa/ReactionT5v2-forward')
   T5Tokenizer.from_pretrained('sagawa/ReactionT5v2-forward')
   "
   ```

5. **配置nginx**
   ```bash
   sudo cp server-config/nginx_swarm /etc/nginx/sites-available/swarm
   sudo ln -sf /etc/nginx/sites-available/swarm /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **启动gunicorn**
   ```bash
   cd /home/ubuntu/swarm-research
   gunicorn api.server:app -w 2 --threads 2 -b 0.0.0.0:8460 --timeout 120 --daemon --pid /tmp/swarm_gunicorn.pid --error-logfile /tmp/swarm_error2.log
   ```

7. **验证**
   ```bash
   curl http://localhost:8460/
   curl https://swarm.aishield.tools/
   ```

---

## ⚠️ 注意事项

1. **ReactionT5模型未打包**（758MB太大），恢复时需用HF镜像重新下载
2. **Cloudflare隧道**由systemd的cloudflared服务维持，pod重启后隧道自动恢复
3. **腾讯云8460端口防火墙阻挡外部访问**，必须通过Cloudflare隧道暴露
4. **不要kill原始gunicorn进程**，Lighthouse上无法从shell恢复，需重启服务
5. **__pycache__目录包含在内**，可直接运行无需重新编译
6. **knowledge.json** 325KB，包含知识库全部内容，是核心数据
