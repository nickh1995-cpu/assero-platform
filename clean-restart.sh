#!/bin/bash

echo "🧹 CLEAN BUILD STARTEN..."
echo ""

# Kill existing dev servers
echo "1️⃣ Stoppe laufende Server..."
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✓ Server gestoppt"
echo ""

# Delete .next cache
echo "2️⃣ Lösche .next Cache..."
cd "$(dirname "$0")"
rm -rf .next
echo "✓ Cache gelöscht"
echo ""

# Increase file descriptor limit
echo "3️⃣ Erhöhe File Descriptor Limit..."
ulimit -n 10240
echo "✓ Limit erhöht (ulimit -n = $(ulimit -n))"
echo ""

# Start dev server
echo "4️⃣ Starte Next.js Dev Server..."
echo ""
npm run dev

