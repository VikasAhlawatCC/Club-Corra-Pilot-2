#!/bin/bash

# Correct Fix for crypto-js TypeScript Issue
# This script fixes the TypeScript declaration syntax

set -e

echo "🔧 Correct fix for crypto-js TypeScript issue..."

# Navigate to shared package
cd packages/shared

# Method 1: Fix the tsconfig.json properly
echo "📝 Fixing tsconfig.json..."

# Create backup
cp tsconfig.json tsconfig.json.backup

# Fix the tsconfig.json by adding proper include section
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "typeRoots": ["./node_modules/@types", "./types", "../../node_modules/@types"]
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF

echo "✅ tsconfig.json fixed"

# Method 2: Create the CORRECT type declaration file
echo "📝 Creating CORRECT type declaration file..."
mkdir -p types

cat > types/crypto-js.d.ts << 'EOF'
declare module 'crypto-js' {
  export function SHA256(message: string): string;
  export function MD5(message: string): string;
  export const AES: any;
  export const enc: any;
  export const mode: any;
  export const pad: any;
}
EOF

echo "✅ CORRECT type declaration file created"

# Method 3: Try building
echo "🔨 Testing build..."
if yarn build; then
    echo "✅ SUCCESS: Build completed!"
    exit 0
fi

# Method 4: If build still fails, try the require approach
echo "🔧 Trying require approach..."
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

# Method 5: Last resort - install types in the right place
echo "🔧 Installing types in the right location..."
yarn add --dev @types/crypto-js

# Also try installing at workspace root
cd ../..
yarn add --dev @types/crypto-js
cd packages/shared

# Try building one more time
echo "🔨 Final build attempt..."
if yarn build; then
    echo "✅ SUCCESS: Build completed after installing types!"
    exit 0
fi

# If all methods fail, restore backup and show error
echo "❌ All methods failed, restoring backup..."
cp src/utils.ts.backup src/utils.ts
cp tsconfig.json.backup tsconfig.json

echo "❌ Could not fix automatically. Manual intervention required."
echo "The issue might be:"
echo "1. crypto-js package is not properly installed"
echo "2. TypeScript version compatibility issue"
echo "3. Yarn workspace configuration issue"

echo ""
echo "Try these manual steps:"
echo "1. yarn add crypto-js"
echo "2. yarn add --dev @types/crypto-js"
echo "3. Check if crypto-js is in node_modules: ls -la node_modules/crypto-js"
echo "4. Check if types are in node_modules: ls -la node_modules/@types/crypto-js"

exit 1
