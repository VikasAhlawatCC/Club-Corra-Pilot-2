#!/bin/bash

# Quick Manual Fix for crypto-js TypeScript Issue
# Run this directly on your EC2 instance

echo "🔧 Quick manual fix for crypto-js TypeScript issue..."

# Navigate to shared package
cd packages/shared

# Fix the type declaration file with correct syntax
echo "📝 Creating correct type declaration file..."
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

echo "✅ Type declaration file created with correct syntax"

# Fix tsconfig.json
echo "📝 Fixing tsconfig.json..."
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

# Try building
echo "🔨 Testing build..."
if yarn build; then
    echo "✅ SUCCESS: Build completed!"
    echo "🎉 You can now continue with deployment!"
    exit 0
else
    echo "❌ Build still failed. Trying require approach..."
    
    # Try require instead of import
    cd src
    cp utils.ts utils.ts.backup
    sed -i 's/import { SHA256 } from '\''crypto-js'\'';/const { SHA256 } = require('\''crypto-js'\'');/' utils.ts
    cd ..
    
    if yarn build; then
        echo "✅ SUCCESS: Build completed with require!"
        echo "🎉 You can now continue with deployment!"
        exit 0
    else
        echo "❌ All methods failed. Check the error above."
        exit 1
    fi
fi
