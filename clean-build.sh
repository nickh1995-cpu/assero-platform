#!/bin/bash

# Clean Build Script for Next.js
# Löscht alle Build-Artefakte und startet neu

echo "🧹 Cleaning Next.js build artifacts..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next directory"
fi

# Remove node_modules/.cache (sometimes Next.js caches here too)
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Removed node_modules/.cache"
fi

echo ""
echo "✅ Clean complete!"
echo ""
echo "🚀 Starting dev server..."
echo ""

npm run dev

