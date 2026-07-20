#!/bin/bash
# Deploy Feishu Bot Adapter to ECS

SSH_KEY="/home/z/.ssh/id_rsa"
ECS_USER="root"
ECS_HOST="150.158.119.19"
REMOTE_DIR="/opt/feishu-adapter"
SERVICE_NAME="feishu-adapter"

echo "=== Deploying Feishu Adapter to ECS ==="

# Upload script
echo "Uploading files..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no /home/z/my-project/feishu-adapter/feishu_bot.py $ECS_USER@$ECS_HOST:$REMOTE_DIR/feishu_bot.py

# Install deps and set up service
echo "Setting up service on ECS..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $ECS_USER@$ECS_HOST << 'ENDSSH'
set -e

# Install Flask if needed
pip3 install flask 2>/dev/null || pip install flask 2>/dev/null

# Create service file
cat > /etc/systemd/system/feishu-adapter.service << 'EOF'
[Unit]
Description=Feishu Bot Adapter for 比特助手
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/feishu-adapter
Environment=FEISHU_APP_ID=cli_a914f113bf225bca
Environment=FEISHU_APP_SECRET=wGLoeRkMxeJothRQ5Cwicg434YbHb2bq
Environment=BIT_API_URL=http://localhost:8431/v1/chat/completions
Environment=BIT_API_KEY=sk-S8VeYfNBqQwVDfXVOq9dVrobXnv7a5JCWlE5Wbd6oKBJn97v
Environment=PORT=8433
ExecStart=/usr/bin/python3 /opt/feishu-adapter/feishu_bot.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable feishu-adapter
systemctl restart feishu-adapter

echo "Waiting for service to start..."
sleep 3
systemctl status feishu-adapter --no-pager

# Open port 8433 in firewall if needed
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --add-port=8433/tcp --permanent 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
fi

echo "=== Deployment Complete ==="
ENDSSH
