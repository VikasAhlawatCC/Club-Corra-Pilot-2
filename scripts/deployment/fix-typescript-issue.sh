#!/bin/bash

# Emergency Fix Script for TypeScript crypto-js Issue
# This script creates a workaround for the crypto-js types issue

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to create a type declaration file
create_type_declaration() {
    print_step "Creating type declaration file for crypto-js..."
    
    cd packages/shared
    
    # Create a types directory if it doesn't exist
    mkdir -p types
    
    # Create a declaration file for crypto-js
    cat > types/crypto-js.d.ts << 'EOF'
declare module 'crypto-js' {
  export function SHA256(message: string): string;
  export function MD5(message: string): string;
  export function AES: {
    encrypt(message: string, key: string): any;
    decrypt(ciphertext: any, key: string): any;
  };
  export function enc: {
    Utf8: any;
    Base64: any;
    Hex: any;
  };
  export function mode: {
    CBC: any;
    ECB: any;
  };
  export function pad: {
    Pkcs7: any;
    NoPadding: any;
  };
}
EOF
    
    print_status "✅ Type declaration file created"
    
    # Update tsconfig.json to include the types directory
    if [ -f "tsconfig.json" ]; then
        print_status "📝 Updating tsconfig.json to include types directory..."
        
        # Create a backup
        cp tsconfig.json tsconfig.json.backup
        
        # Add types directory to include array
        if grep -q '"include"' tsconfig.json; then
            # If include exists, add types to it
            sed -i 's/"include": \[/"include": [\n    "types\/**\/*",/' tsconfig.json
        else
            # If include doesn't exist, add it
            sed -i '/"compilerOptions": {/a\  "include": [\n    "src\/**\/*",\n    "types\/**\/*"\n  ],' tsconfig.json
        fi
        
        print_status "✅ tsconfig.json updated"
    fi
    
    cd ../..
}

# Function to try alternative installation methods
try_alternative_installation() {
    print_step "Trying alternative installation methods..."
    
    # Method 1: Install globally
    print_status "📦 Installing @types/crypto-js globally..."
    yarn global add @types/crypto-js 2>/dev/null || true
    
    # Method 2: Install in root workspace
    print_status "📦 Installing @types/crypto-js in root workspace..."
    yarn add --dev @types/crypto-js
    
    # Method 3: Install in shared package
    print_status "📦 Installing @types/crypto-js in shared package..."
    cd packages/shared
    yarn add --dev @types/crypto-js
    cd ../..
    
    print_status "✅ Alternative installation methods completed"
}

# Function to modify the import to use require instead
modify_import() {
    print_step "Modifying import to use require instead of ES6 import..."
    
    cd packages/shared/src
    
    # Create a backup
    cp utils.ts utils.ts.backup
    
    # Replace the import with require
    sed -i 's/import { SHA256 } from '\''crypto-js'\'';/const { SHA256 } = require('\''crypto-js'\'');/' utils.ts
    
    print_status "✅ Import modified to use require"
    
    cd ../../..
}

# Function to test the build
test_build() {
    print_step "Testing shared package build..."
    
    cd packages/shared
    
    if yarn build; then
        print_status "✅ Shared package build successful!"
        return 0
    else
        print_error "❌ Shared package build still failing"
        return 1
    fi
    
    cd ../..
}

# Function to restore backup
restore_backup() {
    print_step "Restoring backup files..."
    
    cd packages/shared
    
    if [ -f "utils.ts.backup" ]; then
        cp utils.ts.backup utils.ts
        print_status "✅ utils.ts restored from backup"
    fi
    
    if [ -f "tsconfig.json.backup" ]; then
        cp tsconfig.json.backup tsconfig.json
        print_status "✅ tsconfig.json restored from backup"
    fi
    
    cd ../..
}

# Main function
main() {
    print_status "🔧 Emergency fix for TypeScript crypto-js issue..."
    
    # Try method 1: Create type declaration
    print_status "Method 1: Creating type declaration file..."
    create_type_declaration
    
    if test_build; then
        print_status "🎉 SUCCESS: Type declaration method worked!"
        exit 0
    fi
    
    # Try method 2: Alternative installation
    print_status "Method 2: Trying alternative installation methods..."
    try_alternative_installation
    
    if test_build; then
        print_status "🎉 SUCCESS: Alternative installation method worked!"
        exit 0
    fi
    
    # Try method 3: Modify import
    print_status "Method 3: Modifying import to use require..."
    modify_import
    
    if test_build; then
        print_status "🎉 SUCCESS: Modified import method worked!"
        exit 0
    fi
    
    # If all methods fail, restore backup
    print_error "❌ All methods failed, restoring backup..."
    restore_backup
    
    print_error "❌ Could not fix the TypeScript issue automatically"
    print_status "Manual intervention required:"
    print_status "1. Check if crypto-js is properly installed"
    print_status "2. Verify @types/crypto-js is in the right location"
    print_status "3. Consider using a different crypto library"
    
    exit 1
}

# Run main function
main "$@"
