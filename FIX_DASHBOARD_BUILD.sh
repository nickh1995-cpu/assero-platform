#!/bin/bash

echo "🔧 Fixing Dashboard Build Error..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Remove the duplicate dashboard directory (if it exists)
if [ -d "src/app/dashboard" ]; then
  echo "🗑️  Removing duplicate src/app/dashboard directory..."
  rm -rf src/app/dashboard
  echo "✅ Removed src/app/dashboard"
else
  echo "✅ No duplicate src/app/dashboard directory found"
fi
echo ""

# Step 2: Verify only route group version exists
echo "🔍 Checking for dashboard pages..."
if [ -f "src/app/(dashboard)/dashboard/page.tsx" ]; then
  echo "✅ Route group version exists: src/app/(dashboard)/dashboard/page.tsx"
else
  echo "❌ ERROR: Route group version NOT found!"
  exit 1
fi
echo ""

# Step 3: Clear all Next.js caches
echo "🧹 Clearing Next.js caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# Step 4: Kill any running Next.js processes on port 3000
echo "🛑 Checking for running Next.js processes..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "🛑 Killing process on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  echo "✅ Process killed"
else
  echo "✅ No process running on port 3000"
fi
echo ""

echo "✅ ✅ ✅ Fix complete! ✅ ✅ ✅"
echo ""
echo "🚀 Now run: npm run dev"
echo ""

