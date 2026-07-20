# TOOLS.md - Local Notes

## 比特助手（辅助Agent）
- 地址：http://150.158.119.19:8431
- 模型：Agnes 2.0 Flash（永久免费）
- 协议：REST + OpenAI兼容 + MCP + A2A + OpenAPI
- API Key：sk-S8VeYfNBqQwVDfXVOq9dVrobXnv7a5JCWlE5Wbd6oKBJn97v
- 部署：Docker容器，ECS 150.158.119.19

## HealthLens（主项目）
- 路径：/home/z/my-project/healthlens/
- 技术栈：Flask + SQLite + Tesseract OCR + 比特助手AI
- 端口：8432
- 版本：v0.5.0
- 功能：体检报告OCR + Apple Health解析 + 跨源关联分析 + AI洞察 + Webhook + Withings OAuth2 + 健康评分 + 分享报告 + bcrypt认证 + 速率限制 + 审计日志 + PII脱敏 + LOINC编码 + FHIR R4导出 + MCP Server + 结构化日志
- 部署状态：✅ 已部署，systemd管理，崩溃自动重启
- 外网访问：✅ 8432端口已开放
- Withings：Client ID/Secret已配置在systemd环境变量
- v0.5.0新增模块：security.py / pii_sanitizer.py / loinc_mapper.py / fhir_exporter.py / mcp_server.py / migrations.py / logging_config.py + 6个Blueprint
- 测试：37个单元测试，本地+ECS双环境通过
- 定时分析：POST /api/analyze/scheduled，返回 {success, users_analyzed, total_alerts, results}，cron每日凌晨触发，SSH+curl调用

## 飞书适配器（Feishu Adapter）
- 路径：/home/z/my-project/feishu-adapter/feishu_bot.py
- ECS路径：/home/ubuntu/feishu-adapter/feishu_bot.py
- 端口：8433（内部），Nginx:80代理 /feishu-webhook/
- 部署：systemd管理（feishu-adapter.service），自动重启
- 比特助手飞书App ID：cli_a914f113bf225bca（ECS免费通道）
- 黄金比特飞书App ID：cli_aa8bcde600f91bd7（AgentMore通道，App Secret: yGNjXXKf7dRlx1SR2U6ATbeJbCCfIrwX）
- ⚠️ 两个Bot是独立的飞书App，Feishu工具绑定时必须用黄金比特的cli_aa8bcde600f91bd7，不要误用比特助手的
- 链路：飞书→Nginx:80→适配器:8433→比特助手API:8431→回复飞书
- 费用：零（走ECS比特助手，不花AgentMore积分）
- Webhook URL：http://150.158.119.19/feishu-webhook/

## ECS服务器
- IP：150.158.119.19
- SSH：密钥认证（id_rsa），用户ubuntu（root认证已失效）
- SSH注意：paramiko需用ubuntu用户，root会认证失败；连失败后需等60秒+防限流
- 端口开放：22, 80, 8420, 8422, 8431, 8432, 8433
- 已部署：比特助手(8431), HealthLens(8432), 飞书适配器(8433)
- Nginx：80端口反向代理，配置在/etc/nginx/sites-enabled/

## Agent Mail CLI（agently-cli）
- 版本：1.0.6（npm全局安装：`npm install -g @tencent-qqmail/agently-cli`）
- Skill路径：~/.agents/skills/agently-mail/
- 授权邮箱：lucien1210@agent.qq.com（app_id: cli_002e8cd166ffecf6）
- 速率限制：每日发送50封，每小时200请求，每分钟10请求
- 附件限制：单文件20MB，总计20MB，最多50个
- 两阶段确认流程：先不带--confirmation-token调用→拿ctk_xxx+summary→展示用户确认→带token重新调用
- 发送：`agently-cli message +send --to xxx --subject "..." --body "..." --confirmation-token ctk_xxx`
- 搜索：`agently-cli message +search --q "关键词"`
- 读取：`agently-cli message +read --id msg_xxx`
- OAuth device flow授权码有效期约15分钟，用户需及时在浏览器完成
- ⚠️ auth login是交互式长命令，AgentMore bash中必须用Python `subprocess.Popen(start_new_session=True)`后台运行，nohup/setsid会被kill

## z-ai CLI
- 429限频：分批3-4组+间隔12秒
- web_search：返回list，字段url/name/snippet/host_name/date
- page_reader：返回data.html，主流媒体返回CSS/JS框架

## 技术踩坑
- AgentMore平台git hook是单点故障，避免用git管理代码
- AgentMore bash环境无tesseract chi_sim语言包，需下载：`curl -sL "https://github.com/tesseract-ocr/tessdata/raw/main/chi_sim.traineddata" -o /tmp/chi_sim.traineddata`，设`TESSDATA_PREFIX=/tmp`，同时复制eng.traineddata到同目录
- 比特助手vision API可做OCR备份：OpenAI兼容`/v1/chat/completions`，content传`type:image_url`+base64，对中文截图识别效果优于tesseract
- ECS SSH密码认证已禁用，只能密钥登录（/home/z/.ssh/id_rsa）
- ECS SSH有IP限流，连续失败后需等待60秒+
- paramiko SSH必须用ubuntu用户，root认证失败（key不匹配authorized_keys）
- paramiko Transport直连时设banner_timeout=60防SSH banner读取超时
- AgentMore bash环境无ssh/scp命令，ECS操作一律用paramiko或curl
- docker-compose v1用`docker-compose`命令，v2用`docker compose`，ECS上是v1
- ECS上端口冲突时先查systemd服务（如atex-saas.service占8430），不能直接杀进程
- Flask装在venv里本地开发，ECS上用`pip3 install --user`安装到~/.local
- SQLite ALTER TABLE只能加列不能删列改列，新增字段用DEFAULT避免旧数据NULL
- Withings开发环境限制非标准端口(8432)，限制10用户，生产需换80/443
- Withings US Cloud需签合同，Europe Cloud开放注册，选Europe
- Nginx配置更新：用sftp上传新文件到/tmp再sudo cp，比sed插入更可靠
- Agnes 2.0 Flash免费版响应慢（实测30秒+），飞书适配器需设120秒超时+重试
- 飞书Bot回调必须3秒内返回HTTP 200，异步处理用后台线程
- Flask `request.json` 在Content-Type非`application/json`时返回415，用`request.get_json(force=True, silent=True)`替代，飞书验证请求可能用不同Content-Type
- 飞书webhook URL验证失败后会停止推送，修复后需在飞书后台重新验证或发消息触发恢复

## v0.5.0重构经验
- GitHub API搜索：`curl -s "https://api.github.com/search/repositories?q=...&sort=stars"` 可直接用，无需token（限10次/min）
- paramiko SFTP部署：批量put文件比tar打包更可靠，逐文件上传+验证
- Flask Blueprint拆分：app.py只做工厂+注册，业务逻辑全进blueprints/
- 轻量级DB迁移：内联Migration类（id+sql），比Alembic更适合小项目，ECS零额外依赖
- 测试先行：写完模块立即写测试，本地pass后ECS上再跑一遍，双环境验证才放心
- datetime.utcnow()在Python 3.12+已弃用，用datetime.now().replace(microsecond=0)替代
- PII正则需加前后瞻`(?<!\d)...(?!\d)`防匹配身份证号中的手机号子串
- bcrypt旧哈希兼容：检查len==64且无$符号判断为SHA256，验证后可触发rehash

## v0.6.0开发与测试经验（2026-06-20~23）
- AgentMore bash工具在持续高负载时会反复超时返回"执行完成"但不输出，遇到时不要无限重试，应汇报进展让用户决策
- test文件中引用模块函数前，先用Grep确认实际方法名，避免测试方法名与实现不匹配
- migrations.py中的migrations列表在run_migrations()函数内部定义，不是模块级别变量，测试时需直接构造SQL验证
- 比特助手(8431)可用于生成分析内容（平台优化建议等），省AgentMore积分，但响应慢需设120秒超时
- ⚠️ pytest collection在本项目会挂死（pyproject.toml在/home/z/根目录导致rootdir错误），用`python -u -m unittest test_v06.TestClass.test_method -v`替代
- AgentMore bash 504频发时策略：nohup后台+文件中转读取结果；但nohup批量跑也可能丢输出（进程被kill），最可靠是逐个`timeout 60 python -u -m unittest ... -v`直接前台跑
- 调比特助手API的测试单条约20-30s，需timeout≥60s；不调API的纯逻辑测试<1s
- 测试与实现字段名不匹配是常见问题：先读实现代码确认实际字段名，再改测试对齐，不要想当然
