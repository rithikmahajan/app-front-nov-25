#!/bin/bash

echo "🔄 Restarting Metro with cache reset..."

# Kill existing Metro bundler
echo "🛑 Stopping existing Metro bundler..."
pkill -f "react-native start" || echo "No Metro process found"
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "Port 8081 already free"

# Wait a moment
sleep 2

# Start Metro with reset cache
echo "🚀 Starting Metro bundler with cache reset..."
cd /Users/rithikmahajan/Desktop/oct-7-appfront-main

# Clear watchman
echo "🧹 Clearing watchman..."
watchman watch-del-all 2>/dev/null || echo "Watchman not available"

# Clear temp files
echo "🧹 Clearing temp files..."
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# Start Metro in background
echo "📦 Starting Metro bundler..."
npx react-native start --reset-cache &

echo ""
echo "✅ Metro bundler restarting with clean cache"
echo "⏳ Wait 10 seconds, then reload your app (Cmd+R in simulator)"
echo ""
