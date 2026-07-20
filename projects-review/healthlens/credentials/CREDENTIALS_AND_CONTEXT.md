# 项目完整备份 - 凭证与关键上下文

**备份日期**: 2026-07-01
**备份人**: 比特 (AgentMore Agent)
**项目名称**: HealthLens 跨生态健康数据聚合器 + 比特助手生态

---

## 一、服务器信息

### ECS 服务器
- **IP**: 150.158.119.19
- **SSH用户**: ubuntu
- **SSH认证**: 密钥认证（/home/z/.ssh/id_rsa），密码登录已禁用
- **SSH注意事项**:
  - paramiko必须用ubuntu用户，root认证失败
  - 连续失败后需等60秒+防限流
  - AgentMore bash无ssh/scp命令，ECS操作用paramiko或curl
  - paramiko Transport设banner_timeout=60防超时
- **开放端口**: 22, 80, 8420, 8422, 8431, 8432, 8433
- **Nginx**: 80端口反向代理，配置在/etc/nginx/sites-enabled/

---

## 二、已部署服务

### 1. 比特助手 (辅助Agent)
- **地址**: http://150.158.119.19:8431
- **模型**: Agnes 2.0 Flash（永久免费）
- **协议**: REST + OpenAI兼容 + MCP + A2A + OpenAPI
- **API Key**: sk-S8VeYfNBqQwVDfXVOq9dVrobXnv7a5JCWlE5Wbd6oKBJn97v
- **Agnes API Base**: https://apihub.agnes-ai.com/v1
- **模型名**: agnes-2.0-flash
- **部署**: Docker容器
- **源码路径**: /home/z/my-project/agent/agent.py
- **Docker端口**: 容器内8430，映射到宿主8431

### 2. HealthLens (主项目)
- **地址**: http://150.158.119.19:8432
- **版本**: v0.5.0（已部署）/ v0.6.0（开发中，未部署ECS）
- **技术栈**: Flask + SQLite + Tesseract OCR + 比特助手AI
- **端口**: 8432
- **部署**: systemd管理，崩溃自动重启
- **外网访问**: ✅ 8432端口已开放
- **SECRET_KEY**: healthlens-secret-key-change-in-production (默认值，生产应改)
- **BIT_ASSISTANT_URL**: http://150.158.119.19:8431
- **源码路径**: /home/z/my-project/healthlens/
- **Dockerfile**: 基于python:3.11-slim + tesseract-ocr + tesseract-ocr-chi-sim + poppler-utils
- **v0.5.0模块**: security.py / pii_sanitizer.py / loinc_mapper.py / fhir_exporter.py / mcp_server.py / migrations.py / logging_config.py + 6个Blueprint (upload, trends, connectors, webhooks, analysis, auth, health)
- **v0.6.0新增**: OCR语义增强(红黄绿三级分级) + 跨源关联分析v2(20+规则库) + 纵向趋势报告(周/月/年报+评分A-E)
- **测试**: 37个单元测试(v0.5.0) + 12个单元测试(v0.6.0)，本地+ECS双环境通过

### 3. 飞书适配器 (Feishu Adapter)
- **地址**: http://150.158.119.19:8433（内部），Nginx:80代理 /feishu-webhook/
- **端口**: 8433
- **部署**: systemd管理（feishu-adapter.service），自动重启
- **链路**: 飞书→Nginx:80→适配器:8433→比特助手API:8431→回复飞书
- **费用**: 零（走ECS比特助手，不花AgentMore积分）
- **Webhook URL**: http://150.158.119.19/feishu-webhook/
- **源码路径**: /home/z/my-project/feishu-adapter/feishu_bot.py
- **ECS源码路径**: /home/ubuntu/feishu-adapter/feishu_bot.py

---

## 三、飞书Bot凭证

### 双Bot架构（两个独立飞书App，不能混用！）

#### 黄金比特（AgentMore通道）
- **App ID**: cli_aa8bcde600f91bd7
- **App Secret**: yGNjXXKf7dRlx1SR2U6ATbeJbCCfIrwX
- **用途**: 通过Feishu工具绑定，走AgentMore积分
- **⚠️ 铁律**: Feishu工具绑定时必须用这个App ID

#### 比特助手（ECS免费通道）
- **App ID**: cli_a914f113bf225bca
- **用途**: 飞书适配器(8433)→比特助手API(8431)，零成本
- **环境变量**: FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_VERIFICATION_TOKEN, FEISHU_ENCRYPT_KEY

---

## 四、Withings OAuth2

- **状态**: Client ID/Secret已配置在systemd环境变量
- **回调URL**: http://150.158.119.19:8432/api/connect/withings/callback
- **Cloud**: Europe Cloud（US Cloud需签合同，Europe开放注册）
- **限制**: 开发环境限制非标准端口(8432)，限制10用户
- **生产需换**: 80/443端口

---

## 五、Agent Mail CLI

- **版本**: 1.0.6 (npm全局安装: npm install -g @tencent-qqmail/agently-cli)
- **Skill路径**: ~/.agents/skills/agently-mail/
- **授权邮箱**: lucien1210@agent.qq.com
- **App ID**: cli_002e8cd166ffecf6
- **速率限制**: 每日50封发送，每小时200请求，每分钟10请求
- **附件限制**: 单文件20MB，总计20MB，最多50个
- **两阶段确认**: 先调用拿ctk_xxx+summary→确认→带token重新调用
- **⚠️ auth login**: 交互式长命令，AgentMore bash中必须用Python subprocess.Popen(start_new_session=True)后台运行

---

## 六、支付信息

- **支付宝**: lx688@sina.com
- **PayPal**: PayPal.me/xinglixingli

---

## 七、项目结构与版本

### HealthLens 版本历史
- **v0.3.0**: 数据连接器框架 + Withings OAuth2 + Webhook接收器 + 自动分析 + API Key管理
- **v0.4.0**: 健康评分 + 分享报告
- **v0.5.0** (2026-06-18): 全面重构 — bcrypt认证+速率限制+审计日志 | PII脱敏 | LOINC标准编码(90+指标) | FHIR R4导出 | MCP Server(7个AI工具) | 6个Blueprint模块化 | loguru结构化日志 | 轻量级DB迁移框架 | 37个单元测试
- **v0.6.0** (2026-06-20~23): OCR语义增强 + 跨源关联分析v2 + 纵向趋势报告。12个单元测试全绿，ECS未部署

### v0.6.0 待推进
- [ ] ECS部署v0.6.0
- [ ] 微信小程序开发（Taro 3 + React）

### 数据库结构 (SQLite)
表: users, sessions, reports, health_records, insights, data_connections, api_keys, webhook_events

### 定时分析
- **端点**: POST /api/analyze/scheduled
- **返回**: {success, users_analyzed, total_alerts, results}
- **触发**: cron每日凌晨，SSH+curl调用

---

## 八、技术踩坑记录

### AgentMore环境
- bash工具持续高负载时会反复超时，不无限重试
- 无tesseract chi_sim语言包，需下载: `curl -sL "https://github.com/tesseract-ocr/tessdata/raw/main/chi_sim.traineddata" -o /tmp/chi_sim.traineddata`，设`TESSDATA_PREFIX=/tmp`
- 无ssh/scp命令，ECS操作一律用paramiko或curl
- git hook是单点故障，避免用git管理代码
- pytest collection挂死（pyproject.toml在/home/z/根目录），用`python -u -m unittest`替代
- nohup批量跑可能丢输出（进程被kill），最可靠是逐个timeout直接前台跑

### ECS
- SSH密码认证已禁用，只能密钥登录
- SSH有IP限流，连续失败后需等60秒+
- docker-compose v1用`docker-compose`命令（非`docker compose`）
- Flask装在venv里本地开发，ECS上用pip3 install --user安装到~/.local
- 端口冲突时先查systemd服务
- SQLite ALTER TABLE只能加列不能删列改列

### Flask/Python
- datetime.utcnow()在Python 3.12+已弃用，用datetime.now().replace(microsecond=0)
- PII正则需加前后瞻(?<!\d)...(?!\d)防匹配身份证号中的手机号子串
- bcrypt旧哈希兼容：检查len==64且无$符号判断为SHA256
- Flask request.json在Content-Type非application/json时返回415，用request.get_json(force=True, silent=True)

### 飞书
- Bot回调必须3秒内返回HTTP 200，异步处理用后台线程
- webhook URL验证失败后会停止推送，修复后需在飞书后台重新验证
- Agnes 2.0 Flash免费版响应慢（30秒+），飞书适配器需设120秒超时+重试

---

## 九、商业定位

- **核心项目**: HealthLens - 跨生态健康数据聚合器
- **商业定位**: 健康领域的Plaid，卡在数据产生方和消费方之间
- **护城河**: 跨生态连接 + 时间积累的个人纵向数据 + 用户转换成本
- **落地路径**: MVP(体检OCR+Apple Health)✅ → 自动化数据流✅ → 产品体验升级✅ → 核心分析能力深化(v0.6.0进行中) → 小程序 → 开放平台API
- **小程序决策**: Taro 3 + React，微信为主入口（获客+查看+分享），网页做数据上传入口
- **多端数据打通**: 小程序+网页共享同一Flask后端和SQLite，身份打通靠微信openid绑定user_id

---

## 十、文件清单

### source/ — 源代码
- healthlens/ — HealthLens主项目（Flask应用，排除venv和缓存）
- feishu-adapter/ — 飞书Bot适配器
- agent/ — 比特助手辅助Agent

### config/ — 工作区配置文件
- SOUL.md — Agent灵魂/身份定义
- IDENTITY.md — Agent身份信息
- USER.md — 用户信息
- TOOLS.md — 工具配置与踩坑记录
- HEARTBEAT.md — 心跳检查清单

### credentials/ — 本文件
- CREDENTIALS_AND_CONTEXT.md — 完整凭证与上下文

---

*备份生成于 2026-07-01 17:08 Asia/Shanghai*
