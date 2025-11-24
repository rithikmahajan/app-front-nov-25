#!/bin/bash

echo "🔄 Reloading React Native App..."
echo ""
echo "This will:"
echo "1. Kill all React Native processes"
echo "2. Clear Metro bundler cache"
echo "3. Restart Metro"
echo ""

# Kill all React Native and Metro processes
echo "🛑 Stopping all React Native processes..."
pkill -f "react-native" 2>/dev/null
pkill -f "metro" 2>/dev/null
pkill -f "node.*cli.js start" 2>/dev/null

sleep 2

# Clear watchman cache
echo "🧹 Clearing Watchman cache..."
watchman watch-del-all 2>/dev/null

# Clear Metro cache
echo "🧹 Clearing Metro cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null

# Start Metro with clean cache
echo ""
echo "✅ All processes killed and caches cleared!"
echo ""
echo "📱 Now run ONE of these commands in a NEW terminal:"
echo ""
echo "For iOS:"
echo "  npx react-native run-ios"
echo ""
echo "For Android:"
echo "  npx react-native run-android"
echo ""
echo "Or start Metro manually:"
echo "  npx react-native start --reset-cache"
echo ""
