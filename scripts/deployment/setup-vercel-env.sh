#!/bin/bash

# Script to set up Vercel environment variables for Club Corra Admin
# This script helps you configure the environment variables needed to fix the mixed content issue

echo "🚀 Setting up Vercel Environment Variables for Club Corra Admin"
echo "================================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Get current project info
echo "📋 Current project information:"
vercel project ls 2>/dev/null || echo "   No projects found or not logged in"

echo ""
echo "🔧 To fix the mixed content issue, you need to set these environment variables in Vercel:"
echo ""

echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Select your Club Corra Admin project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the following variables:"
echo ""

echo "   Variable Name: NEXT_PUBLIC_API_BASE_URL"
echo "   Value: https://16.170.179.71:8080/api/v1"
echo "   Environment: Production, Preview, Development"
echo ""

echo "   Variable Name: NEXT_PUBLIC_WS_URL"
echo "   Value: wss://16.170.179.71:8080"
echo "   Environment: Production, Preview, Development"
echo ""

echo "   Variable Name: NEXTAUTH_URL"
echo "   Value: https://your-domain.vercel.app (or your custom domain)"
echo "   Environment: Production, Preview, Development"
echo ""

echo "5. Click 'Save' and redeploy your project"
echo ""

echo "⚠️  IMPORTANT: Before setting these variables, ensure your backend supports HTTPS!"
echo "   - Your backend must be accessible via https://16.170.179.71:8080"
echo "   - Or use a proper domain like https://api.clubcorra.com"
echo ""

echo "🔍 To verify the setup:"
echo "   1. Check that your backend is accessible via HTTPS"
echo "   2. Verify CORS is configured to allow your Vercel domain"
echo "   3. Test WebSocket connections via WSS"
echo ""

echo "📚 For detailed instructions, see: docs/MIXED_CONTENT_FIX.md"
echo ""

# Offer to help with Vercel CLI setup
read -p "Would you like to set up environment variables via Vercel CLI? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Setting up via Vercel CLI..."
    echo ""
    
    # Get project ID
    echo "Please select your project:"
    vercel project ls
    
    read -p "Enter your project ID: " project_id
    
    if [ ! -z "$project_id" ]; then
        echo ""
        echo "Setting environment variables..."
        
        # Set API base URL
        vercel env add NEXT_PUBLIC_API_BASE_URL production
        vercel env add NEXT_PUBLIC_API_BASE_URL preview
        vercel env add NEXT_PUBLIC_API_BASE_URL development
        
        # Set WebSocket URL
        vercel env add NEXT_PUBLIC_WS_URL production
        vercel env add NEXT_PUBLIC_WS_URL preview
        vercel env add NEXT_PUBLIC_WS_URL development
        
        echo ""
        echo "✅ Environment variables added successfully!"
        echo "🔄 You may need to redeploy your project for changes to take effect"
    else
        echo "❌ No project ID provided"
    fi
else
    echo "ℹ️  Please set the environment variables manually in the Vercel dashboard"
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Ensure your backend supports HTTPS"
echo "   2. Set environment variables in Vercel"
echo "   3. Redeploy your project"
echo "   4. Test the application"
echo ""
echo "📖 For more help, see: docs/MIXED_CONTENT_FIX.md"
