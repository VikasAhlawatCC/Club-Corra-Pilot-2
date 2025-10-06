#!/bin/bash

# Script to seed dummy data into the database
# This script populates all tables except admin, brands, and categories

echo "🌱 Starting database seeding process..."

# Navigate to the API directory
cd apps/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the seeding script
echo "🚀 Running dummy data seeding..."
npm run seed:dummy

echo "✅ Database seeding completed!"
echo "📊 Check your database to see the populated dummy data."
