# 视频脚本 2：《30 秒接入演示》

**类型**: 技术演示型  
**时长**: 45-60 秒  
**格式**: 屏幕录制（真实操作） + 字幕 + 轻音乐  
**目标**: 让看完视频的开发者立即去试用，转化率最大化  
**核心信息**: 接入门槛极低，npx 一行，不需要注册账号  

---

## 前期准备（录制前）

- 打开 macOS / Windows 终端，字体放大到 18px 以上
- 准备好 Claude Desktop（已安装，版本最新）
- 桌面干净，浏览器关掉多余标签页
- 用 QuickTime / OBS 录制全屏，60fps
- 录制完成后用 CapCut 加字幕、分割线、聚焦动画

---

## 分镜脚本

### 第 0-5 秒 | 开场标题卡

**画面**:  
黑色背景，白色文字动画出现（从下往上淡入）：

```
30 秒接入演示
AgentTrust Protocol × Claude Desktop
```

右上角小字：「真实录屏，无剪辑捏造」

**旁白**:  
> "来，我给你演示一下，从零开始，30 秒接入 AgentTrust。"

**字幕**: 「30 秒接入 · 真实操作」（右上角水印）

---

### 第 5-15 秒 | 步骤 1：找到配置文件

**画面**:  
真实屏幕录制。打开 Finder（macOS）或文件浏览器（Windows）。

**macOS 路径**（在屏幕上高亮标注）:  
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

或打开终端，输入：  
```bash
open ~/Library/Application\ Support/Claude/
```

配置文件用 VS Code 打开，初始内容可能是空的 `{}`。

屏幕上用白色圆圈 + 文字标注：「① Claude Desktop 配置文件」

**旁白**:  
> "第一步，找到 Claude Desktop 的配置文件。"  
> "macOS 在这里，Windows 在 AppData 里面。"

**字幕**: 「步骤 1：打开 Claude Desktop 配置文件」  
底部小字（Fira Code）: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

### 第 15-28 秒 | 步骤 2：粘贴 MCP 配置

**画面**:  
VS Code 编辑器，将下面的 JSON 粘贴进去（配合打字动画效果，或直接演示粘贴）：

```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "npx",
      "args": [
        "-y",
        "agent-trust-mcp-server"
      ]
    }
  }
}
```

贴完之后，用白色圆圈 + 动画在关键部分做标注：
- `"npx"` → 标注「不需要提前安装」
- `"agent-trust-mcp-server"` → 标注「这是 npm 包名」

然后 `Cmd+S` 保存（录制按键动画）。

**旁白**:  
> "第二步，把这段配置贴进去。"  
> "用 npx，不需要提前安装任何东西，自动下载运行。"  
> "保存——"  

**字幕**: 「步骤 2：粘贴 MCP 配置 · 保存」

屏幕底部提示条（CapCut 添加）:  
```
💡 完整配置代码在评论区 ↓
```

---

### 第 28-38 秒 | 步骤 3：重启 Claude，看效果

**画面**:  
- 关闭 Claude Desktop（Cmd+Q）
- 重新打开（Dock 点击）
- Claude 启动动画

Claude 启动后，左侧工具栏出现 MCP 标识，用放大镜 + 红圈标注：  
「✅ AgentTrust MCP 已连接」

**旁白**:  
> "重启 Claude Desktop——"  
> "看，左边多了一个工具——AgentTrust 已经连上了。"

**字幕**: 「步骤 3：重启 Claude · MCP 自动连接」

---

### 第 38-55 秒 | 步骤 4：实际查询演示

**画面**:  
Claude Desktop 对话界面。在对话框输入（打字动画）：

```
查一下 did:web:alpha.example.com 的信任分，
它安全吗？可以委托任务给它吗？
```

发送后，Claude 显示工具调用动画（loading 圈圈）。

几秒后，Claude 回复（屏幕上用放大框展示回复内容）：

```
我通过 AgentTrust MCP 查询了该 Agent 的信任评分：

📊 信任评分报告
────────────────────
Agent DID: did:web:alpha.example.com
综合得分: 84 / 100    Grade: B
────────────────────
维度分解:
  ⚡ 性能       88/100
  🛡 安全性     82/100  
  🤝 可靠性     85/100
  📋 合规性     80/100
────────────────────
历史记录: 已完成任务 247 次，违约 2 次
最后评估: 2024-12-15

✅ 综合评估: 可信任，建议正常接入
💡 建议监控安全维度，有提升空间
```

用白色圆圈依次标注：「综合分 84」「Grade B」「4个维度」

**旁白**:  
> "问 Claude：'查一下这个 Agent 的信任分。'"  
> "Claude 自动调用 AgentTrust，给你返回完整评分。"  
> "84 分，B 级，4 个维度，历史记录，全有。"

**字幕**: 「步骤 4：直接问 Claude · 自动返回评分」

---

### 第 55-60 秒 | 结尾 CTA

**画面**:  
切回黑色背景，整洁展示：

```
✅ 完成！全程 30 秒

npx -y agent-trust-mcp-server

AgentTrust Protocol
开源 · 免费 · W3C 标准
github.com/agentrust-protocol
```

**旁白**:  
> "就这样，30 秒接入，完全免费，完全开源。"  
> "GitHub 链接在评论区第一条。"

**字幕**: 「完整教程 + 代码 见评论区 ↓」

---

## 完整旁白文案

> 来，我给你演示一下，从零开始，30 秒接入 AgentTrust。  
>   
> 第一步，找到 Claude Desktop 的配置文件。  
> macOS 在这里，Windows 在 AppData 里面。  
>   
> 第二步，把这段配置贴进去。  
> 用 npx，不需要提前安装任何东西，自动下载运行。  
> 保存——  
>   
> 重启 Claude Desktop——  
> 看，左边多了一个工具——AgentTrust 已经连上了。  
>   
> 问 Claude：查一下这个 Agent 的信任分。  
> Claude 自动调用 AgentTrust，给你返回完整评分。  
> 84 分，B 级，4 个维度，历史记录，全有。  
>   
> 就这样，30 秒接入，完全免费，完全开源。  
> GitHub 链接在评论区第一条。

---

## 后期制作说明

| 时间段 | 后期处理 |
|--------|----------|
| 0-5s | 标题动画，字体 Inter Black |
| 5-15s | 路径文本高亮，文件浏览器聚焦放大 |
| 15-28s | 代码关键词高亮（`npx` 蓝色，包名绿色） |
| 28-38s | 重启动画加速 2x，MCP 标识红圈标注 |
| 38-55s | Claude 回复内容逐段放大展示，字幕同步 |
| 55-60s | 结尾卡片淡入，评论区箭头动画 |

**背景音乐推荐**: Lo-fi Hip Hop，轻快但不抢镜，音量 20-30%

---

## 评论区发布模板

```
📦 MCP 配置代码（直接复制）:

{
  "mcpServers": {
    "agent-trust": {
      "command": "npx",
      "args": ["-y", "agent-trust-mcp-server"]
    }
  }
}

📁 配置文件路径:
macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\Claude\claude_desktop_config.json

🔗 GitHub: github.com/agentrust-protocol
📄 文档: 见 README

#AgentTrust #MCP #Claude #开源 #AI
```

---

## 发布建议

**标题**: 30秒把AgentTrust接进Claude——真实演示，零安装，一行命令

**话题**: `#Claude` `#MCP` `#程序员` `#AI工具` `#开源` `#多智能体` `#AI Agent`

**发布时间**: 工作日晚上 8-10 点（程序员活跃时间）
