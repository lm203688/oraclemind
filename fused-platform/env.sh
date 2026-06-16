#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ATEX v6.0 环境变量配置模板
# 复制为 env.sh.local 并填入真实值，不要提交到版本控制
# ═══════════════════════════════════════════════════════════════

# ── 必填 ──
export DEEPSEEK_API_KEY=""           # DeepSeek API Key (https://platform.deepseek.com)

# ── 支付配置 ──
export ALIPAY_APP_ID=""              # 支付宝App ID
export ALIPAY_PRIVATE_KEY=""         # 支付宝应用私钥
export ALIPAY_PUBLIC_KEY=""          # 支付宝公钥
export XUNHUPAY_APP_ID=""            # 虎皮椒App ID (备用支付)
export XUNHUPAY_APP_SECRET=""        # 虎皮椒App Secret

# ── SCF API (合规工具后端) ──
export SCF_API_BASE="https://atecservice.com/api"  # SCF API基础URL
export SCF_API_KEY=""                # SCF API Key

# ── z-ai-web-dev-sdk ──
export NODE_PATH="/home/z/.bun/install/global/node_modules"  # SDK所在路径
export ZAI_SDK_API_KEY=""            # z-ai SDK API Key (如需)

# ── 服务配置 ──
export ATEX_PORT="8420"              # 服务端口
export ATEX_HOST="0.0.0.0"           # 监听地址
export ATEX_DEBUG="false"            # 调试模式

echo "✅ ATEX v6.0 环境变量已加载"
echo "   DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY:0:8}..."
echo "   SCF_API_BASE: $SCF_API_BASE"
echo "   ATEX_PORT: $ATEX_PORT"
