#!/bin/bash

echo "🚀 Starting ASSERO Platform Server..."
echo "======================================"
echo ""

# Navigate to platform directory
cd "$(dirname "$0")"

# Kill any existing process on port 3000
echo "🔧 Freeing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo "✓ Port 3000 is free"
echo ""

# Clean cache
echo "🧹 Cleaning cache..."
rm -rf .next
echo "✓ Cache cleaned"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: No .env or .env.local file found!"
    echo "   Create .env with:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your-url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
    echo ""
    echo "   Server will start but Supabase features won't work."
    echo ""
fi

# Start the server
echo "🌐 Starting Next.js dev server..."
echo "   Server will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""
echo "======================================"
echo ""

npm run dev

