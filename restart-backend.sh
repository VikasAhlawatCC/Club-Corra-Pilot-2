#!/bin/bash

echo "🔄 Restarting Club Corra API backend service..."

# SSH into EC2 and restart the service
ssh -i ~/.ssh/your-key.pem ubuntu@16.170.179.71.nip.io << 'EOF'
    echo "📡 Connected to EC2 instance"
    
    # Stop the service
    echo "⏹️  Stopping club-corra-api service..."
    sudo systemctl stop club-corra-api
    
    # Wait a moment
    sleep 2
    
    # Start the service
    echo "▶️  Starting club-corra-api service..."
    sudo systemctl start club-corra-api
    
    # Check status
    echo "📊 Service status:"
    sudo systemctl status club-corra-api --no-pager
    
    # Show recent logs
    echo "📋 Recent logs:"
    sudo journalctl -u club-corra-api -n 20 --no-pager
EOF

echo "✅ Backend service restart completed"
