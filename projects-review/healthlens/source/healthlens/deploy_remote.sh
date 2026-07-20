#!/bin/bash
# HealthLens 远程部署脚本
# 在ECS上执行此脚本

set -e
cd /home/ubuntu/healthlens

echo "🐳 构建HealthLens..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build 2>&1

echo ""
echo "⏳ 等待启动..."
sleep 5

echo "🔍 健康检查..."
curl -s http://localhost:8432/health || echo "⚠️ 健康检查失败"

echo ""
echo "✅ 部署完成！"
echo "   访问: http://150.158.119.19:8432"
