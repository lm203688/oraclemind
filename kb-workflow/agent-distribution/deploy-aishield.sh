#!/bin/bash
# AIShield部署脚本 - 在ECS(150.158.119.19)上执行
# 用法: ssh到ECS后运行 bash deploy-aishield.sh

BASE="/home/z/aishield"
PORT=8450

echo "🛡️ AIShield部署脚本"
echo "================================================"

# 1. 检查是否已运行
if curl -s http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
    echo "✅ AIShield已在运行"
    curl -s http://localhost:$PORT/api/v1/health
    exit 0
fi

# 2. 安装依赖
echo "📦 安装依赖..."
pip install flask flask-cors gunicorn requests --break-system-packages 2>/dev/null

# 3. 拉取最新代码
if [ ! -d "$BASE" ]; then
    echo "📥 克隆AIShield..."
    git clone https://github.com/lm203688/aishield.git "$BASE"
else
    echo "📥 更新AIShield..."
    cd "$BASE" && git pull
fi

# 4. 启动服务
echo "🚀 启动AIShield (端口 $PORT)..."
cd "$BASE"
gunicorn api.server_flask:app \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 60 \
    --threads 2 \
    --daemon \
    --pid aishield.pid \
    --access-logfile server.log \
    --error-logfile server.log

sleep 3

# 5. 验证
if curl -s http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
    echo "✅ AIShield启动成功"
    curl -s http://localhost:$PORT/api/v1/health | python3 -m json.tool
else
    echo "❌ 启动失败，查看日志: tail -20 $BASE/server.log"
fi

echo ""
echo "================================================"
echo "AIShield API: http://150.158.119.19:$PORT"
echo "API文档: http://150.158.119.19:$PORT/api/v1/health"
echo "GitHub: https://github.com/lm203688/aishield"
