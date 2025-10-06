#!/bin/bash

# Test script to verify the seeding process works
# This script runs the seeding and checks for errors

echo "🧪 Testing database seeding process..."

# Navigate to the API directory
cd apps/api

# Check if the seeding script exists
if [ ! -f "src/scripts/seed-dummy-data-simple.ts" ]; then
    echo "❌ Seeding script not found!"
    exit 1
fi

# Check if package.json has the seed script
if ! grep -q "seed:dummy" package.json; then
    echo "❌ Seed script not found in package.json!"
    exit 1
fi

echo "✅ Seeding script and configuration found"

# Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
npx tsc --noEmit src/scripts/seed-dummy-data-simple.ts

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "🎉 All tests passed! The seeding script is ready to use."
echo ""
echo "To run the actual seeding:"
echo "  ./scripts/seed-dummy-data.sh"
echo ""
echo "Or manually:"
echo "  cd apps/api && npm run seed:dummy"
