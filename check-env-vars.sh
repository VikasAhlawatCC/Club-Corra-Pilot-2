#!/bin/bash

echo "🔍 Checking environment variables on EC2..."

# SSH into EC2 and check environment variables
ssh -i ~/.ssh/your-key.pem ubuntu@16.170.179.71.nip.io << 'EOF'
    echo "📡 Connected to EC2 instance"
    
    # Check if the service is running
    echo "📊 Service status:"
    sudo systemctl status club-corra-api --no-pager
    
    echo ""
    echo "🔍 Checking environment variables in the service:"
    
    # Get the PID of the running service
    PID=$(sudo systemctl show -p MainPID --value club-corra-api)
    if [ "$PID" != "0" ] && [ "$PID" != "" ]; then
        echo "Service PID: $PID"
        echo ""
        echo "S3_BUCKET: $(sudo cat /proc/$PID/environ | tr '\0' '\n' | grep S3_BUCKET)"
        echo "S3_REGION: $(sudo cat /proc/$PID/environ | tr '\0' '\n' | grep S3_REGION)"
        echo "S3_ACCESS_KEY_ID: $(sudo cat /proc/$PID/environ | tr '\0' '\n' | grep S3_ACCESS_KEY_ID | cut -d'=' -f1)=***"
        echo "S3_SECRET_ACCESS_KEY: $(sudo cat /proc/$PID/environ | tr '\0' '\n' | grep S3_SECRET_ACCESS_KEY | cut -d'=' -f1)=***"
    else
        echo "Service is not running or PID not found"
    fi
    
    echo ""
    echo "🔍 Checking production.env file:"
    if [ -f "/home/ubuntu/club-corra-pilot-2/scripts/deployment/production.env" ]; then
        echo "S3_BUCKET: $(grep S3_BUCKET /home/ubuntu/club-corra-pilot-2/scripts/deployment/production.env)"
        echo "S3_REGION: $(grep S3_REGION /home/ubuntu/club-corra-pilot-2/scripts/deployment/production.env)"
        echo "S3_ACCESS_KEY_ID: $(grep S3_ACCESS_KEY_ID /home/ubuntu/club-corra-pilot-2/scripts/deployment/production.env | cut -d'=' -f1)=***"
        echo "S3_SECRET_ACCESS_KEY: $(grep S3_SECRET_ACCESS_KEY /home/ubuntu/club-corra-pilot-2/scripts/deployment/production.env | cut -d'=' -f1)=***"
    else
        echo "production.env file not found"
    fi
EOF

echo "✅ Environment variables check completed"
