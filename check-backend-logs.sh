#!/bin/bash

echo "🔍 Checking Club Corra API backend logs..."

# SSH into EC2 and check logs
ssh -i ~/.ssh/your-key.pem ubuntu@16.170.179.71.nip.io << 'EOF'
    echo "📡 Connected to EC2 instance"
    
    # Check service status
    echo "📊 Service status:"
    sudo systemctl status club-corra-api --no-pager
    
    echo ""
    echo "📋 Recent logs (last 50 lines):"
    sudo journalctl -u club-corra-api -n 50 --no-pager
    
    echo ""
    echo "🔍 Looking for S3-related logs:"
    sudo journalctl -u club-corra-api --no-pager | grep -i s3 | tail -10
    
    echo ""
    echo "🔍 Looking for upload URL logs:"
    sudo journalctl -u club-corra-api --no-pager | grep -i "upload-url\|presigned" | tail -10
    
    echo ""
    echo "🔍 Looking for errors:"
    sudo journalctl -u club-corra-api --no-pager | grep -i error | tail -10
EOF

echo "✅ Log check completed"
