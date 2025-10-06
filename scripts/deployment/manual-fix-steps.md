# Manual Fix Steps for crypto-js TypeScript Issue

Run these commands step by step on your EC2 instance:

## Step 1: Navigate to shared package
```bash
cd /home/ec2-user/club-corra-api/club-corra-pilot/packages/shared
```

## Step 2: Fix tsconfig.json
```bash
# Create backup
cp tsconfig.json tsconfig.json.backup

# Replace with correct tsconfig.json
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
```

## Step 3: Create type declaration file
```bash
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
```

## Step 4: Try building
```bash
yarn build
```

## Step 5: If build still fails, use require instead of import
```bash
cd src
cp utils.ts utils.ts.backup
sed -i 's/import { SHA256 } from '\''crypto-js'\'';/const { SHA256 } = require('\''crypto-js'\'');/' utils.ts
cd ..
yarn build
```

## Step 6: If still failing, check dependencies
```bash
# Check if crypto-js is installed
ls -la node_modules/crypto-js

# Check if types are installed
ls -la node_modules/@types/crypto-js

# Install if missing
yarn add crypto-js
yarn add --dev @types/crypto-js
```

## Step 7: Continue with deployment
Once the build succeeds:
```bash
cd /home/ec2-user/club-corra-api/club-corra-pilot
./scripts/deployment/deploy-complete.sh --deploy
```
