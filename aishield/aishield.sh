#!/bin/bash
# AIShield 启动脚本 - 含健康检查和自动重启
# 修复：使用gunicorn全路径，避免容器重启后PATH不含venv导致command not found

PORT=8450
PIDFILE=/home/z/my-project/aishield/aishield.pid
LOGFILE=/home/z/my-project/aishield/server.log
GUNICORN=/home/z/.venv/bin/gunicorn
WORKERS=2
TIMEOUT=60
THREADS=2

start() {
    if [ -f "$PIDFILE" ]; then
        OLD_PID=$(cat "$PIDFILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            echo "AIShield already running (PID: $OLD_PID)"
            return 1
        fi
        rm -f "$PIDFILE"
    fi
    
    if [ ! -x "$GUNICORN" ]; then
        echo "❌ gunicorn not found at $GUNICORN"
        return 1
    fi
    
    echo "Starting AIShield..."
    cd /home/z/my-project/aishield
    
    $GUNICORN api.server_flask:app \
        --bind 0.0.0.0:$PORT \
        --workers $WORKERS \
        --timeout $TIMEOUT \
        --threads $THREADS \
        --pid "$PIDFILE" \
        --access-logfile - \
        >> "$LOGFILE" 2>&1 &
    
    echo $! > "$PIDFILE"
    sleep 3
    
    if curl -s --max-time 5 http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
        echo "✅ AIShield started successfully (PID: $(cat $PIDFILE))"
    else
        echo "❌ AIShield failed to start"
        return 1
    fi
}

stop() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        echo "Stopping AIShield (PID: $PID)..."
        kill "$PID" 2>/dev/null
        sleep 2
        kill -9 "$PID" 2>/dev/null
        rm -f "$PIDFILE"
        echo "✅ AIShield stopped"
    else
        echo "AIShield not running"
    fi
}

status() {
    if curl -s --max-time 5 http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
        STATS=$(curl -s --max-time 5 http://localhost:$PORT/api/v1/health)
        echo "✅ AIShield running: $STATS"
    else
        echo "❌ AIShield not responding"
    fi
}

healthcheck() {
    # 重试3次，每次间隔3秒，避免偶发超时误判
    for i in 1 2 3; do
        if curl -s --max-time 5 http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
            return 0
        fi
        sleep 3
    done
    echo "⚠️ Health check failed (3 retries), restarting..."
    stop
    sleep 2
    start
    # 验证重启是否成功
    sleep 3
    if curl -s --max-time 5 http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
        return 0
    else
        echo "❌ Restart failed - service still not responding"
        return 1
    fi
}

case "$1" in
    start)   start ;;
    stop)    stop ;;
    restart) stop; sleep 2; start ;;
    status)  status ;;
    health)  healthcheck ;;
    *)       echo "Usage: $0 {start|stop|restart|status|health}" ;;
esac
