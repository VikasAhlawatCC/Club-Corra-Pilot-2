#!/bin/bash

# Club Corra Admin Vercel Deployment Script
# This script deploys the admin app to Vercel with proper configuration

set -e  # Exit on any error

# Configuration
APP_NAME="club-corra-admin"
APP_DIR="apps/admin"
VERCEL_PROJECT_NAME="${VERCEL_PROJECT_NAME:-club-corra-admin}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "❌ Vercel CLI is not installed"
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    else
        print_success "✅ Vercel CLI is installed"
    fi
    
    # Check if we're in the right directory
    if [ ! -d "$APP_DIR" ]; then
        print_error "❌ Admin directory not found: $APP_DIR"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "❌ package.json not found in $APP_DIR"
        exit 1
    fi
    
    print_success "✅ Prerequisites check completed"
}

# Function to get user input
get_user_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -z "${!var_name}" ]; then
        if [ -n "$default_value" ]; then
            read -p "$prompt [$default_value]: " input
            eval "$var_name=\${input:-$default_value}"
        else
            read -p "$prompt: " input
            eval "$var_name=\"$input\""
        fi
    else
        print_status "Using $var_name: ${!var_name}"
    fi
}

# Function to update existing Vercel configuration
update_vercel_config() {
    print_header "UPDATING VERCEL CONFIGURATION"
    
    print_status "Updating vercel.json configuration..."
    
    cat > "$APP_DIR/vercel.json" << EOF
{
  "version": 2,
  "name": "$VERCEL_PROJECT_NAME",
  "installCommand": "yarn install --frozen-lockfile",
  "buildCommand": "yarn build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_APP_NAME": "@NEXT_PUBLIC_APP_NAME",
    "NEXT_PUBLIC_APP_VERSION": "@NEXT_PUBLIC_APP_VERSION",
    "NEXT_PUBLIC_WS_URL": "@NEXT_PUBLIC_WS_URL",
    "NEXT_PUBLIC_CDN_URL": "@NEXT_PUBLIC_CDN_URL",
    "NEXT_PUBLIC_SENTRY_DSN": "@NEXT_PUBLIC_SENTRY_DSN",
    "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID": "@NEXT_PUBLIC_GOOGLE_ANALYTICS_ID",
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "@NEXT_PUBLIC_ENABLE_ANALYTICS",
    "NEXT_PUBLIC_ENABLE_DEBUG_MODE": "@NEXT_PUBLIC_ENABLE_DEBUG_MODE"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'none';"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/dashboard",
      "destination": "/",
      "permanent": false
    },
    {
      "source": "/admin",
      "destination": "/",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
EOF
    
    print_success "✅ Vercel configuration updated"
}

# Function to create environment template
create_environment_template() {
    print_header "CREATING ENVIRONMENT TEMPLATE"
    
    print_status "Creating .env.production template..."
    
    cat > "$APP_DIR/.env.production" << EOF
# Club Corra Admin Production Environment Variables
# Copy these values to Vercel environment variables

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Club Corra Admin
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=production

# Analytics and Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# CDN Configuration (Optional)
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com
EOF
    
    print_success "✅ Environment template created"
}

# Function to setup Vercel project
setup_vercel_project() {
    print_header "SETTING UP VERCEL PROJECT"
    
    print_status "Navigating to admin directory..."
    cd "$APP_DIR"
    
    print_status "Logging in to Vercel..."
    if ! vercel whoami &> /dev/null; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    print_status "Linking project to Vercel..."
    if [ ! -f ".vercel/project.json" ]; then
        vercel link --yes --name "$VERCEL_PROJECT_NAME"
    else
        print_status "Project already linked to Vercel"
    fi
    
    print_success "✅ Vercel project setup completed"
}

# Function to set environment variables
set_environment_variables() {
    print_header "SETTING ENVIRONMENT VARIABLES"
    
    # Get API URL from user
    get_user_input "Enter your API base URL (e.g., https://api.clubcorra.com/api/v1)" "API_BASE_URL" ""
    get_user_input "Enter your WebSocket URL (e.g., wss://api.clubcorra.com)" "WS_URL" ""
    get_user_input "Enter your app name" "APP_NAME" "Club Corra Admin"
    get_user_input "Enter your app version" "APP_VERSION" "1.0.0"
    
    print_status "Setting environment variables in Vercel..."
    
    # Set production environment variables
    vercel env add NEXT_PUBLIC_API_BASE_URL production <<< "$API_BASE_URL"
    vercel env add NEXT_PUBLIC_WS_URL production <<< "$WS_URL"
    vercel env add NEXT_PUBLIC_APP_NAME production <<< "$APP_NAME"
    vercel env add NEXT_PUBLIC_APP_VERSION production <<< "$APP_VERSION"
    vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production <<< "false"
    vercel env add NEXT_PUBLIC_ENABLE_DEBUG_MODE production <<< "false"
    
    # Set preview environment variables (same as production for now)
    vercel env add NEXT_PUBLIC_API_BASE_URL preview <<< "$API_BASE_URL"
    vercel env add NEXT_PUBLIC_WS_URL preview <<< "$WS_URL"
    vercel env add NEXT_PUBLIC_APP_NAME preview <<< "$APP_NAME (Preview)"
    vercel env add NEXT_PUBLIC_APP_VERSION preview <<< "$APP_VERSION"
    vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS preview <<< "false"
    vercel env add NEXT_PUBLIC_ENABLE_DEBUG_MODE preview <<< "true"
    
    # Set development environment variables
    vercel env add NEXT_PUBLIC_API_BASE_URL development <<< "http://localhost:3001/api/v1"
    vercel env add NEXT_PUBLIC_WS_URL development <<< "ws://localhost:3001"
    vercel env add NEXT_PUBLIC_APP_NAME development <<< "$APP_NAME (Dev)"
    vercel env add NEXT_PUBLIC_APP_VERSION development <<< "$APP_VERSION"
    vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS development <<< "false"
    vercel env add NEXT_PUBLIC_ENABLE_DEBUG_MODE development <<< "true"
    
    print_success "✅ Environment variables set"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    print_header "DEPLOYING TO VERCEL"
    
    print_status "Building and deploying to Vercel..."
    
    # Deploy to production
    vercel --prod
    
    print_success "✅ Deployment completed"
}

# Function to verify deployment
verify_deployment() {
    print_header "VERIFYING DEPLOYMENT"
    
    print_status "Getting deployment URL..."
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "Unable to get URL")
    
    if [ "$DEPLOYMENT_URL" != "Unable to get URL" ]; then
        print_success "✅ Deployment URL: https://$DEPLOYMENT_URL"
        
        print_status "Testing deployment..."
        if curl -f -s "https://$DEPLOYMENT_URL" > /dev/null; then
            print_success "✅ Deployment is accessible"
        else
            print_warning "⚠️ Deployment may not be ready yet"
        fi
        
        print_status "Testing API connectivity..."
        if curl -f -s "$API_BASE_URL/health" > /dev/null; then
            print_success "✅ API connectivity verified"
        else
            print_warning "⚠️ API connectivity test failed - check your API URL"
        fi
    else
        print_warning "⚠️ Could not retrieve deployment URL"
    fi
}

# Function to setup custom domain (optional)
setup_custom_domain() {
    print_header "SETTING UP CUSTOM DOMAIN (OPTIONAL)"
    
    get_user_input "Enter your custom domain (or press Enter to skip)" "CUSTOM_DOMAIN" ""
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        print_status "Adding custom domain to Vercel project..."
        vercel domains add "$CUSTOM_DOMAIN"
        
        print_status "Setting up domain in Vercel project..."
        vercel domains add "$CUSTOM_DOMAIN" "$VERCEL_PROJECT_NAME"
        
        print_success "✅ Custom domain configured"
        print_warning "⚠️ Please update your DNS records as shown in the Vercel dashboard"
    else
        print_status "Skipping custom domain setup"
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_header "DEPLOYMENT SUMMARY"
    
    echo "🎉 Club Corra Admin has been successfully deployed to Vercel!"
    echo ""
    echo "📊 Project Information:"
    echo "  - Project Name: $VERCEL_PROJECT_NAME"
    echo "  - App Directory: $APP_DIR"
    echo "  - Configuration: $APP_DIR/vercel.json"
    echo ""
    echo "🌐 Access Information:"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Project Settings: https://vercel.com/dashboard?project=$VERCEL_PROJECT_NAME"
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo "  - Custom Domain: https://$CUSTOM_DOMAIN"
    fi
    echo ""
    echo "🔧 Management Commands:"
    echo "  - Deploy: vercel --prod"
    echo "  - Preview: vercel"
    echo "  - View Logs: vercel logs"
    echo "  - List Deployments: vercel ls"
    echo "  - Remove Project: vercel remove"
    echo ""
    echo "📝 Environment Variables:"
    echo "  - View: vercel env ls"
    echo "  - Add: vercel env add VARIABLE_NAME"
    echo "  - Remove: vercel env rm VARIABLE_NAME"
    echo ""
    echo "🔐 Security Features:"
    echo "  - Content Security Policy enabled"
    echo "  - Security headers configured"
    echo "  - HTTPS enforced"
    echo "  - Frame protection enabled"
    echo ""
    echo "⚠️ Next Steps:"
    echo "  1. Update your domain DNS to point to Vercel (if using custom domain)"
    echo "  2. Configure authentication and authorization"
    echo "  3. Set up monitoring and analytics"
    echo "  4. Test all admin functionality"
    echo "  5. Set up CI/CD for automatic deployments"
    echo "  6. Configure backup and disaster recovery"
    echo ""
    echo "📚 Documentation:"
    echo "  - Vercel Docs: https://vercel.com/docs"
    echo "  - Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs"
    echo "  - Environment Variables: https://vercel.com/docs/projects/environment-variables"
    echo "  - Custom Domains: https://vercel.com/docs/custom-domains"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --project-name NAME    Set the Vercel project name"
    echo "  --api-url URL          Set the API base URL"
    echo "  --ws-url URL           Set the WebSocket URL"
    echo "  --domain DOMAIN        Set the custom domain"
    echo "  --help                 Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  VERCEL_PROJECT_NAME    Vercel project name"
    echo "  API_BASE_URL           API base URL"
    echo "  WS_URL                 WebSocket URL"
    echo "  CUSTOM_DOMAIN          Custom domain name"
    echo ""
    echo "Examples:"
    echo "  $0 --project-name club-corra-admin"
    echo "  $0 --api-url https://api.clubcorra.com/api/v1 --ws-url wss://api.clubcorra.com"
    echo "  $0 --domain admin.clubcorra.com"
    echo "  VERCEL_PROJECT_NAME=my-admin $0"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites (Vercel CLI)"
    echo "  2. Update Vercel configuration"
    echo "  3. Set up Vercel project"
    echo "  4. Configure environment variables"
    echo "  5. Deploy to Vercel"
    echo "  6. Set up custom domain (optional)"
    echo "  7. Verify deployment"
}

# Main deployment function
main() {
    print_header "CLUB CORRA ADMIN VERCEL DEPLOYMENT"
    
    check_prerequisites
    update_vercel_config
    create_environment_template
    setup_vercel_project
    set_environment_variables
    deploy_to_vercel
    setup_custom_domain
    verify_deployment
    show_deployment_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --project-name)
        VERCEL_PROJECT_NAME="$2"
        shift 2
        ;;
    --api-url)
        API_BASE_URL="$2"
        shift 2
        ;;
    --ws-url)
        WS_URL="$2"
        shift 2
        ;;
    --domain)
        CUSTOM_DOMAIN="$2"
        shift 2
        ;;
    *)
        main
        ;;
esac

