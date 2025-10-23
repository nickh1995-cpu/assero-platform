#!/bin/bash

# ASSERO Platform - Clean Dev Server Start
# Fixes: EMFILE errors, Node.js v24 compatibility issues

set -e

echo "🚀 Starting ASSERO Platform Dev Server..."
echo ""

# Navigate to platform directory
cd "$(dirname "$0")"

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Warn if using Node.js v24 (has known issues with macOS)
if [[ $NODE_VERSION == v24* ]]; then
    echo "⚠️  Warning: Node.js v24 has compatibility issues on macOS"
    echo "    Recommended: Use Node.js v20 (run: nvm use 20)"
    echo ""
fi

# Increase file descriptor limit on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Increasing file descriptor limit..."
    ulimit -n 10240
    echo "✓ File limit set to 10240"
    echo ""
fi

# Clean .next directory if it exists
if [ -d ".next" ]; then
    echo "🧹 Cleaning .next cache..."
    rm -rf .next
    echo "✓ Cache cleaned"
    echo ""
fi

# Start the dev server
echo "🌐 Starting Next.js dev server..."
echo "   Server will be available at: http://localhost:3000"
echo "   Valuation Wizard: http://localhost:3000/valuation"
echo ""

npm run dev

