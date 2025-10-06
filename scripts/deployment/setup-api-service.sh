#!/bin/bash

# Club Corra API Service Setup Script
# Run this script on your EC2 instance after deploying the API

set -e

echo "🚀 Setting up Club Corra API Service..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root or with sudo"
    exit 1
fi

# Create the service file
cat > /etc/systemd/system/club-corra-api.service << 'EOF'
[Unit]
Description=Club Corra API Service
After=network.target nginx.service
Wants=nginx.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/club-corra-api
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
Environment=CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app,https://club-corra-pilot-admin-*.vercel.app
StandardOutput=journal
StandardError=journal
SyslogIdentifier=club-corra-api

[Install]
WantedBy=multi-user.target
EOF

echo "📋 Service file created"

# Reload systemd
systemctl daemon-reload

# Enable the service
systemctl enable club-corra-api

echo "✅ Service enabled and ready to start"
echo ""
echo "To start the service:"
echo "  sudo systemctl start club-corra-api"
echo ""
echo "To check status:"
echo "  sudo systemctl status club-corra-api"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u club-corra-api -f"
