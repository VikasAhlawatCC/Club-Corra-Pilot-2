#!/bin/bash

# Quick Fix for crypto-js TypeScript Issue
# Run this directly on your EC2 instance

set -e

echo "🔧 Quick fix for crypto-js TypeScript issue..."

# Navigate to shared package
cd packages/shared

# Method 1: Create a simple type declaration file
echo "📝 Creating type declaration file..."
mkdir -p types

cat > types/crypto-js.d.ts << 'EOF'
declare module 'crypto-js' {
  export function SHA256(message: string): string;
  export function MD5(message: string): string;
  export function AES: any;
  export function enc: any;
  export function mode: any;
  export function pad: any;
}
EOF

# Method 2: Update tsconfig.json to include types
echo "📝 Updating tsconfig.json..."
if [ -f "tsconfig.json" ]; then
    # Create backup
    cp tsconfig.json tsconfig.json.backup
    
    # Add types to include if it exists, or create include section
    if grep -q '"include"' tsconfig.json; then
        # Add types to existing include
        sed -i 's/"include": \[/"include": [\n    "types\/**\/*",/' tsconfig.json
    else
        # Add include section
        sed -i '/"compilerOptions": {/a\  "include": [\n    "src\/**\/*",\n    "types\/**\/*"\n  ],' tsconfig.json
    fi
fi

# Method 3: Try building
echo "🔨 Testing build..."
if yarn build; then
    echo "✅ SUCCESS: Build completed!"
    exit 0
fi

# Method 4: If build still fails, modify the import
echo "🔧 Modifying import to use require..."
cd src

# Create backup
cp utils.ts utils.ts.backup

# Replace import with require
sed -i 's/import { SHA256 } from '\''crypto-js'\'';/const { SHA256 } = require('\''crypto-js'\'');/' utils.ts

cd ..

# Try building again
echo "🔨 Testing build with require..."
if yarn build; then
    echo "✅ SUCCESS: Build completed with require!"
    exit 0
fi

# If still failing, restore backup and show error
echo "❌ Build still failing, restoring backup..."
cp src/utils.ts.backup src/utils.ts

echo "❌ Could not fix automatically. Manual intervention required."
echo "Try running: yarn add --dev @types/crypto-js"
echo "Or check if crypto-js is properly installed: yarn add crypto-js"

exit 1
