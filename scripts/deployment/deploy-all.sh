#!/bin/bash

# Club Corra Complete Production Deployment Script
# This script deploys all three applications: Backend (EC2), Admin (Vercel), and Webapp (Vercel)

set -e  # Exit on any error

# Configuration
BACKEND_DOMAIN="${BACKEND_DOMAIN:-}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-}"
WEBAPP_DOMAIN="${WEBAPP_DOMAIN:-}"
EMAIL="${EMAIL:-}"
API_BASE_URL="${API_BASE_URL:-}"
WS_URL="${WS_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_subheader() {
    echo -e "${CYAN}--- $1 ---${NC}"
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

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check if we're in the right directory
    if [ ! -d "apps" ] || [ ! -d "scripts/deployment" ]; then
        print_error "❌ Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if deployment scripts exist
    local scripts=(
        "scripts/deployment/deploy-production-ec2-complete.sh"
        "scripts/deployment/deploy-vercel-admin.sh"
        "scripts/deployment/deploy-vercel-webapp.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ ! -f "$script" ]; then
            print_error "❌ Deployment script not found: $script"
            exit 1
        fi
    done
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "⚠️ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "✅ Prerequisites check completed"
}

# Function to collect deployment information
collect_deployment_info() {
    print_header "COLLECTING DEPLOYMENT INFORMATION"
    
    print_subheader "Domain Configuration"
    get_user_input "Enter your backend API domain (e.g., api.clubcorra.com)" "BACKEND_DOMAIN" ""
    get_user_input "Enter your admin app domain (e.g., admin.clubcorra.com)" "ADMIN_DOMAIN" ""
    get_user_input "Enter your webapp domain (e.g., clubcorra.com)" "WEBAPP_DOMAIN" ""
    
    print_subheader "Contact Information"
    get_user_input "Enter your email address for SSL certificates" "EMAIL" ""
    
    # Set derived URLs
    if [ -n "$BACKEND_DOMAIN" ]; then
        API_BASE_URL="https://$BACKEND_DOMAIN/api/v1"
        WS_URL="wss://$BACKEND_DOMAIN"
    fi
    
    print_subheader "Deployment Summary"
    echo "Backend Domain: $BACKEND_DOMAIN"
    echo "Admin Domain: $ADMIN_DOMAIN"
    echo "Webapp Domain: $WEBAPP_DOMAIN"
    echo "Email: $EMAIL"
    echo "API Base URL: $API_BASE_URL"
    echo "WebSocket URL: $WS_URL"
    echo ""
    
    read -p "Continue with deployment? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
}

# Function to deploy backend
deploy_backend() {
    print_header "DEPLOYING BACKEND API (EC2)"
    
    if [ -z "$BACKEND_DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_error "❌ Backend domain and email are required for backend deployment"
        return 1
    fi
    
    print_status "Starting backend deployment..."
    
    if ./scripts/deployment/deploy-production-ec2-complete.sh \
        --domain "$BACKEND_DOMAIN" \
        --email "$EMAIL"; then
        print_success "✅ Backend deployment completed"
        return 0
    else
        print_error "❌ Backend deployment failed"
        return 1
    fi
}

# Function to deploy admin app
deploy_admin() {
    print_header "DEPLOYING ADMIN APP (Vercel)"
    
    if [ -z "$API_BASE_URL" ] || [ -z "$WS_URL" ]; then
        print_error "❌ API URLs are required for frontend deployment"
        return 1
    fi
    
    print_status "Starting admin app deployment..."
    
    local admin_args=(
        "--project-name" "club-corra-admin"
        "--api-url" "$API_BASE_URL"
        "--ws-url" "$WS_URL"
    )
    
    if [ -n "$ADMIN_DOMAIN" ]; then
        admin_args+=("--domain" "$ADMIN_DOMAIN")
    fi
    
    if ./scripts/deployment/deploy-vercel-admin.sh "${admin_args[@]}"; then
        print_success "✅ Admin app deployment completed"
        return 0
    else
        print_error "❌ Admin app deployment failed"
        return 1
    fi
}

# Function to deploy webapp
deploy_webapp() {
    print_header "DEPLOYING WEBAPP (Vercel)"
    
    if [ -z "$API_BASE_URL" ] || [ -z "$WS_URL" ]; then
        print_error "❌ API URLs are required for frontend deployment"
        return 1
    fi
    
    print_status "Starting webapp deployment..."
    
    local webapp_args=(
        "--project-name" "club-corra-webapp"
        "--api-url" "$API_BASE_URL"
        "--ws-url" "$WS_URL"
    )
    
    if [ -n "$WEBAPP_DOMAIN" ]; then
        webapp_args+=("--domain" "$WEBAPP_DOMAIN")
    fi
    
    if ./scripts/deployment/deploy-vercel-webapp.sh "${webapp_args[@]}"; then
        print_success "✅ Webapp deployment completed"
        return 0
    else
        print_error "❌ Webapp deployment failed"
        return 1
    fi
}

# Function to verify all deployments
verify_deployments() {
    print_header "VERIFYING ALL DEPLOYMENTS"
    
    local all_success=true
    
    # Verify backend
    if [ -n "$BACKEND_DOMAIN" ]; then
        print_subheader "Backend API Verification"
        if curl -f -s -k "https://$BACKEND_DOMAIN/api/v1/health" > /dev/null; then
            print_success "✅ Backend API is responding"
        else
            print_warning "⚠️ Backend API health check failed"
            all_success=false
        fi
    fi
    
    # Verify admin app
    print_subheader "Admin App Verification"
    if vercel ls --json | jq -r '.[] | select(.name=="club-corra-admin") | .url' | head -1 | grep -q "."; then
        print_success "✅ Admin app deployed successfully"
    else
        print_warning "⚠️ Admin app deployment verification failed"
        all_success=false
    fi
    
    # Verify webapp
    print_subheader "Webapp Verification"
    if vercel ls --json | jq -r '.[] | select(.name=="club-corra-webapp") | .url' | head -1 | grep -q "."; then
        print_success "✅ Webapp deployed successfully"
    else
        print_warning "⚠️ Webapp deployment verification failed"
        all_success=false
    fi
    
    if [ "$all_success" = true ]; then
        print_success "✅ All deployments verified successfully"
    else
        print_warning "⚠️ Some deployments may need attention"
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_header "DEPLOYMENT SUMMARY"
    
    echo "🎉 Club Corra Production Deployment Complete!"
    echo ""
    echo "📊 Deployment Results:"
    echo ""
    
    if [ -n "$BACKEND_DOMAIN" ]; then
        echo "🔧 Backend API (EC2):"
        echo "  - URL: https://$BACKEND_DOMAIN/api/v1"
        echo "  - Health: https://$BACKEND_DOMAIN/api/v1/health"
        echo "  - WebSocket: wss://$BACKEND_DOMAIN"
        echo ""
    fi
    
    echo "👨‍💼 Admin App (Vercel):"
    echo "  - Project: club-corra-admin"
    echo "  - Dashboard: https://vercel.com/dashboard"
    if [ -n "$ADMIN_DOMAIN" ]; then
        echo "  - Custom Domain: https://$ADMIN_DOMAIN"
    fi
    echo ""
    
    echo "🌐 Webapp (Vercel):"
    echo "  - Project: club-corra-webapp"
    echo "  - Dashboard: https://vercel.com/dashboard"
    if [ -n "$WEBAPP_DOMAIN" ]; then
        echo "  - Custom Domain: https://$WEBAPP_DOMAIN"
    fi
    echo ""
    
    echo "🔧 Management Commands:"
    echo "  - Backend Logs: sudo journalctl -u club-corra-api -f"
    echo "  - Backend Status: sudo systemctl status club-corra-api"
    echo "  - Vercel Logs: vercel logs"
    echo "  - Vercel Deployments: vercel ls"
    echo ""
    
    echo "⚠️ Next Steps:"
    echo "  1. Update DNS records for your domains"
    echo "  2. Configure environment variables in Vercel"
    echo "  3. Test all applications thoroughly"
    echo "  4. Set up monitoring and alerting"
    echo "  5. Configure CI/CD for automatic deployments"
    echo ""
    
    echo "📚 Documentation:"
    echo "  - Production Guide: scripts/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md"
    echo "  - EC2 Guide: scripts/deployment/EC2_DEPLOYMENT_GUIDE.md"
    echo "  - Troubleshooting: scripts/deployment/TROUBLESHOOTING.md"
    echo ""
    
    echo "🎯 Quick Access:"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - AWS Console: https://console.aws.amazon.com"
    echo "  - Project Repository: https://github.com/your-org/club-corra-pilot-2"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-domain DOMAIN    Set the backend API domain"
    echo "  --admin-domain DOMAIN      Set the admin app domain"
    echo "  --webapp-domain DOMAIN     Set the webapp domain"
    echo "  --email EMAIL              Set the email for SSL certificates"
    echo "  --skip-backend             Skip backend deployment"
    echo "  --skip-admin               Skip admin app deployment"
    echo "  --skip-webapp              Skip webapp deployment"
    echo "  --help                     Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  BACKEND_DOMAIN             Backend API domain"
    echo "  ADMIN_DOMAIN               Admin app domain"
    echo "  WEBAPP_DOMAIN              Webapp domain"
    echo "  EMAIL                      Email for SSL certificates"
    echo ""
    echo "Examples:"
    echo "  $0 --backend-domain api.clubcorra.com --admin-domain admin.clubcorra.com --webapp-domain clubcorra.com --email admin@clubcorra.com"
    echo "  BACKEND_DOMAIN=api.example.com EMAIL=admin@example.com $0"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites"
    echo "  2. Collect deployment information"
    echo "  3. Deploy backend API to EC2"
    echo "  4. Deploy admin app to Vercel"
    echo "  5. Deploy webapp to Vercel"
    echo "  6. Verify all deployments"
    echo "  7. Show deployment summary"
}

# Main deployment function
main() {
    print_header "CLUB CORRA COMPLETE PRODUCTION DEPLOYMENT"
    
    local skip_backend=false
    local skip_admin=false
    local skip_webapp=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-domain)
                BACKEND_DOMAIN="$2"
                shift 2
                ;;
            --admin-domain)
                ADMIN_DOMAIN="$2"
                shift 2
                ;;
            --webapp-domain)
                WEBAPP_DOMAIN="$2"
                shift 2
                ;;
            --email)
                EMAIL="$2"
                shift 2
                ;;
            --skip-backend)
                skip_backend=true
                shift
                ;;
            --skip-admin)
                skip_admin=true
                shift
                ;;
            --skip-webapp)
                skip_webapp=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    collect_deployment_info
    
    local deployment_success=true
    
    # Deploy backend
    if [ "$skip_backend" = false ]; then
        if ! deploy_backend; then
            deployment_success=false
        fi
    else
        print_status "Skipping backend deployment"
    fi
    
    # Deploy admin app
    if [ "$skip_admin" = false ]; then
        if ! deploy_admin; then
            deployment_success=false
        fi
    else
        print_status "Skipping admin app deployment"
    fi
    
    # Deploy webapp
    if [ "$skip_webapp" = false ]; then
        if ! deploy_webapp; then
            deployment_success=false
        fi
    else
        print_status "Skipping webapp deployment"
    fi
    
    # Verify deployments
    verify_deployments
    
    # Show summary
    show_deployment_summary
    
    if [ "$deployment_success" = true ]; then
        print_success "🎉 All deployments completed successfully!"
        exit 0
    else
        print_warning "⚠️ Some deployments had issues. Please check the logs and fix any problems."
        exit 1
    fi
}

# Run main function
main "$@"

