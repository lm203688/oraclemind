# SwarmLabs MCP Server

蜂群科研分子性质预测平台的MCP Server，让Claude Code / ChatGPT / Codex可以直接调用。

## 安装

### Claude Code
```bash
# 添加到 ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "swarmlabs": {
      "command": "python3",
      "args": ["/path/to/swarmlabs-mcp/server.py"],
      "env": {
        "SWARMLABS_API_KEY": "gtk_internal_eve_2026"
      }
    }
  }
}
```

### 使用
安装后，Claude会自动发现以下工具：
- `full_predict` — 全流程分子性质预测
- `quantum_predict` — 量子化学预测
- `bio_predict` — 生物/化学性质预测
- `toxicity_assessment` — 毒性评估
- `gnn_predict` — GNN图神经网络预测
- `morgan_predict` — Morgan指纹预测
- `batch_predict` — 批量预测
- `auto_research` — ARIS自动研究
- `journal_recommend` — 期刊投稿建议
- `molecule_info` — 分子信息
- `dataset_info` — 数据集信息

## 能力
- 166,656分子真实数据训练
- 49个ML模型
- 3种架构: RandomForest + Morgan指纹 + GNN图神经网络
- 27个毒性预测模型(12分类+15回归)
- 0.58秒全流程预测
