#!/bin/bash
HEALTH_URL="http://localhost:8460/api/v1/health"
LOG="/home/z/my-project/swarm-research/keeper.log"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    exit 0
fi

echo "$(date '+%Y-%m-%d %H:%M:%S'): 8460异常(HTTP $HTTP_CODE)，正在重启..." >> "$LOG"
pkill -f "api_server_v3" 2>/dev/null
sleep 3

cd /home/z/my-project/swarm-research
nohup python3 api_server_v3.py >> "$LOG" 2>&1 &

sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S'): 重启成功" >> "$LOG"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S'): 重启失败 HTTP=$HTTP_CODE" >> "$LOG"
fi
