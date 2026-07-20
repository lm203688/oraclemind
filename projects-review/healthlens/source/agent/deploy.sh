#!/bin/bash
# 一键部署比特助手到腾讯云ECS
# 用法: bash deploy.sh <AGNES_API_KEY>

set -e

ECS_IP="150.158.119.19"
ECS_USER="ubuntu"
ECS_PATH="/home/ubuntu/bit-assistant"
API_KEY="${1:?用法: bash deploy.sh <AGNES_API_KEY>}"

echo "🚀 部署比特助手到 ${ECS_IP}..."

# 1. 上传文件
echo "📦 上传文件..."
scp agent.py Dockerfile docker-compose.yml ${ECS_USER}@${ECS_IP}:${ECS_PATH}/ 2>/dev/null || {
    echo "📁 创建远程目录..."
    ssh ${ECS_USER}@${ECS_IP} "mkdir -p ${ECS_PATH}"
    scp agent.py Dockerfile docker-compose.yml ${ECS_USER}@${ECS_IP}:${ECS_PATH}/
}

# 2. 远程部署
echo "🔧 远程部署..."
ssh ${ECS_USER}@${ECS_IP} << REMOTE
set -e
cd ${ECS_PATH}

# 写入API Key
echo 'AGNES_API_KEY=${API_KEY}' > .env

# 检查Docker
if command -v docker &> /dev/null; then
    echo "🐳 使用Docker部署..."
    docker compose down 2>/dev/null || true
    docker compose up -d --build
    echo "✅ Docker部署完成"
else
    echo "🐍 直接运行..."
    export AGNES_API_KEY=${API_KEY}
    pkill -f "python3 agent.py" 2>/dev/null || true
    sleep 1
    nohup python3 agent.py > agent.log 2>&1 &
    echo "✅ 直接运行部署完成"
fi

# 验证
sleep 3
curl -s http://localhost:8430/health | python3 -m json.tool 2>/dev/null || echo "⚠️ 健康检查失败，请查看日志"
REMOTE

echo ""
echo "🎉 部署完成！"
echo "   API地址: http://${ECS_IP}:8430"
echo "   健康检查: curl http://${ECS_IP}:8430/health"
echo "   测试聊天: curl -X POST http://${ECS_IP}:8430/chat -H 'Content-Type: application/json' -d '{\"message\":\"你好\"}'"
