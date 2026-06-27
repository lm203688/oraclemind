# CloudFlare Bot Fight Mode 配置指南

## 问题
CloudFlare Bot Fight Mode 拦截了所有 /api/* 端点的程序化访问，返回JS Challenge (403)。
影响所有12个知识库站点的API访问，以及搜索引擎爬虫对API数据的索引。

## 解决方案

### 方案A：关闭Bot Fight Mode（推荐）
1. 登录 CloudFlare Dashboard → genetech.tools 域名
2. Security → Bots
3. 关闭 "Bot Fight Mode"
4. 关闭 "Super Bot Fight Mode"（付费版才有）

### 方案B：添加API路径白名单（如果需要保留Bot Fight Mode）
1. Security → WAF → Custom rules
2. 创建规则：
   - Rule name: `Allow API access`
   - Expression: `(http.request.uri.path contains "/api/") or (http.request.uri.path contains "/llms") or (http.request.uri.path contains "/.well-known/")`
   - Action: Skip → All remaining custom rules
3. 保存并部署

### 方案C：用Page Rule绕过
1. Rules → Page Rules
2. URL: `*genetech.tools/api/*`
3. Setting: Security Level → Essentially Off

## 验证
配置后执行以下命令验证API可访问：
```bash
curl -s -o /dev/null -w "%{http_code}" https://tcm.genetech.tools/api/data.json
# 应返回 200，不是 403
```

## 注意
- Bot Fight Mode对SEO有负面影响——搜索引擎爬虫也会被JS Challenge拦截
- 建议至少对 /api/、/llms.txt、/.well-known/ 路径白名单
- anti-scrape.js 的honeypot机制足以防止恶意爬取，不需要Bot Fight Mode
