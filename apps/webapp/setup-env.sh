#!/bin/bash

# Webapp Environment Setup Script
# This script helps set up the development environment for the webapp

echo "🚀 Setting up Club Corra Webapp Environment..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy template to .env.local
if [ -f "env.template" ]; then
    cp env.template .env.local
    echo "✅ Created .env.local from template"
else
    echo "❌ env.template not found. Please ensure it exists."
    exit 1
fi

# Set default development values
echo "🔧 Setting up development environment variables..."

# Update API URL for development
sed -i.bak 's|NEXT_PUBLIC_API_BASE_URL=.*|NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1|' .env.local

# Set development environment
sed -i.bak 's|NODE_ENV=.*|NODE_ENV=development|' .env.local

# Enable debug mode for development
sed -i.bak 's|NEXT_PUBLIC_ENABLE_DEBUG_MODE=.*|NEXT_PUBLIC_ENABLE_DEBUG_MODE=true|' .env.local

# Disable analytics for development
sed -i.bak 's|NEXT_PUBLIC_ENABLE_ANALYTICS=.*|NEXT_PUBLIC_ENABLE_ANALYTICS=false|' .env.local

# Clean up backup files
rm -f .env.local.bak

echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review .env.local and update any values as needed"
echo "2. Ensure the API backend is running on port 3001"
echo "3. Run 'yarn dev' to start the development server"
echo ""
echo "🔍 Current configuration:"
echo "- API URL: http://localhost:3001/api/v1"
echo "- Environment: development"
echo "- Debug mode: enabled"
echo "- Analytics: disabled"
echo ""
echo "📚 For more information, see ENVIRONMENT.md"
