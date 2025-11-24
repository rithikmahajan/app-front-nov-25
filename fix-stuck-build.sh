#!/bin/bash

echo "🛑 Stopping all React Native bundler processes..."

# Kill Metro bundler
pkill -f "metro" || echo "No metro processes found"

# Kill React Native bundle processes
pkill -f "react-native-xcode.sh" || echo "No react-native-xcode processes found"

# Kill node processes related to bundling
pkill -f "node.*bundle.js" || echo "No bundle.js processes found"

# Clean Xcode derived data
echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

# Clean Metro cache
echo "🧹 Cleaning Metro cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/react-*

# Clean React Native cache
echo "🧹 Cleaning React Native cache..."
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
watchman watch-del-all 2>/dev/null || echo "Watchman not running"
rm -rf $TMPDIR/react-* 2>/dev/null || true

echo "✅ Cleanup complete! You can now rebuild in Xcode."
echo ""
echo "💡 Tips:"
echo "  1. In Xcode: Product > Clean Build Folder (Cmd+Shift+K)"
echo "  2. Then: Product > Archive"
echo "  3. If it hangs again, the bundler may need --minify true"
