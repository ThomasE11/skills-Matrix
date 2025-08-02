#!/bin/bash

# Matrix Management System Startup Script
echo "🚀 Starting Matrix Management System..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to the app directory
cd "$SCRIPT_DIR/paramedic_matrix_system/app"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Cannot find package.json. Make sure you're in the right directory."
    echo "Current directory: $(pwd)"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. You may need to set up environment variables."
fi

echo "🌟 Starting development server..."
npm run dev