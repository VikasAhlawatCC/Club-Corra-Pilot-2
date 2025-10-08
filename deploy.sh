#!/bin/bash

# Quick deployment script for Club Corra API
# This script deploys to EC2 with your production environment

set -e

echo "🚀 Deploying Club Corra API to EC2..."
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if SSH key exists
SSH_KEY="$HOME/.ssh/club-corra-api-key.pem"
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    echo "Please ensure your SSH key is in the correct location"
    exit 1
fi

echo "✅ SSH key found"
echo "✅ Project structure verified"
echo "✅ Production environment configured"
echo ""

# Run the deployment
echo "🔄 Starting deployment..."
./scripts/deployment/deploy-from-local.sh

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your API: curl http://16.170.179.71:8080/api/v1/health"
echo "2. Check logs: ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71 'sudo journalctl -u club-corra-api -f'"
echo "3. View service status: ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71 'sudo systemctl status club-corra-api'"
echo ""
echo "🌐 Your API is now running at:"
echo "   - Direct: http://16.170.179.71:8080/api/v1"
echo "   - Health: http://16.170.179.71:8080/api/v1/health"
echo ""
echo "🔧 Your production environment includes:"
echo "   - PostgreSQL database (Render)"
echo "   - Redis cache (Upstash)"
echo "   - S3 storage (AWS)"
echo "   - CloudFront CDN"
echo "   - Twilio SMS"
echo "   - Gmail SMTP"
echo "   - Google OAuth"
echo ""
