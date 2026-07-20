# 蜂群科研平台 — 部署运维指南

## 服务器: 腾讯云 Lighthouse 150.158.119.19

### 基础环境
- OS: Ubuntu 22.04
- Python: 3.10
- 用户: ubuntu (sudo)
- 内存: 2GB
- 磁盘: 50GB

### 目录结构
```
/home/ubuntu/swarm-research/     ← 项目代码
/home/ubuntu/.cache/huggingface/ ← ReactionT5模型(758MB)
/etc/nginx/sites-available/swarm ← nginx配置
/tmp/swarm_gunicorn.pid          ← PID文件
/tmp/swarm_error2.log            ← 错误日志
```

### 服务架构
```
用户 → HTTPS → Cloudflare Tunnel → nginx:80 → gunicorn:8460 → Flask app
                                                         → 比特助手:8431 (LLM)
                                                         → ReactionT5 (本地推理)
```

### 常用运维命令

#### 查看服务状态
```bash
ps aux | grep gunicorn
curl -s http://localhost:8460/ | head -5
curl -s https://swarm.aishield.tools/ | head -5
```

#### 重启gunicorn
```bash
# 注意：不要kill原始进程！用pkill + 重启
pkill -f "api.server:app"
cd /home/ubuntu/swarm-research
gunicorn api.server:app -w 2 --threads 2 -b 0.0.0.0:8460 --timeout 120 --daemon --pid /tmp/swarm_gunicorn.pid --error-logfile /tmp/swarm_error2.log
```

#### 查看日志
```bash
tail -50 /tmp/swarm_error2.log
tail -50 /home/ubuntu/swarm-research/gunicorn.log
```

#### nginx操作
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
```

#### Cloudflare隧道
```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
```

### 已知问题

1. **8460端口外部不可达**: 腾讯云防火墙阻挡，必须通过Cloudflare隧道
2. **gunicorn不可kill**: kill后无法从shell恢复，必须pkill+重启
3. **HF无法直连**: 必须设置 HF_ENDPOINT=https://hf-mirror.com
4. **内存紧张**: 2GB内存，ReactionT5推理时可能OOM，gunicorn workers=2是上限
5. **Semantic Scholar API**: 容器内429限流，CrossRef作为fallback

### 备份策略

- **代码**: git管理 + 本备份
- **数据**: core/data/*.json 每次变更后备份
- **模型**: 758MB太大不备份，可从HF镜像重新下载
- **配置**: nginx + Cloudflare Dashboard
