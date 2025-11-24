#!/bin/bash

# Fix Xcode Startup Issues - Clean All Temporary Files
# Use this when Xcode is stuck loading unsaved data or won't start properly

set -e

echo "🔧 Fixing Xcode Startup Issues..."
echo "================================================"

# Kill all Xcode processes
echo "1️⃣ Terminating Xcode processes..."
killall Xcode 2>/dev/null || true
sleep 1
killall -9 Xcode 2>/dev/null || true
killall -9 Simulator 2>/dev/null || true
killall -9 xcodebuild 2>/dev/null || true
killall -9 IBAgent 2>/dev/null || true
killall -9 Interface\ Builder\ Cocoa\ Touch\ Tool 2>/dev/null || true

echo "✅ All Xcode processes terminated"

# Remove unsaved documents
echo ""
echo "2️⃣ Removing unsaved Xcode documents..."
rm -rf ~/Library/Autosave\ Information/Unsaved\ Xcode\ Document* 2>/dev/null || true
echo "✅ Unsaved documents removed"

# Clear Xcode saved state
echo ""
echo "3️⃣ Clearing Xcode saved application state..."
rm -rf ~/Library/Saved\ Application\ State/com.apple.dt.Xcode.savedState 2>/dev/null || true
echo "✅ Saved state cleared"

# Clean Xcode index data
echo ""
echo "4️⃣ Cleaning Xcode index data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*/Index* 2>/dev/null || true
echo "✅ Index data cleaned"

# Clear module cache
echo ""
echo "5️⃣ Clearing module cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex 2>/dev/null || true
echo "✅ Module cache cleared"

# Clear workspace data (optional)
echo ""
echo "6️⃣ Clearing workspace user data..."
find ios -name "*.xcworkspace" -exec rm -rf {}/xcuserdata 2>/dev/null \; || true
find ios -name "*.xcodeproj" -exec rm -rf {}/xcuserdata 2>/dev/null \; || true
echo "✅ Workspace user data cleared"

# Verify no Xcode processes running
echo ""
echo "7️⃣ Verifying cleanup..."
if ps aux | grep -i xcode | grep -v grep > /dev/null; then
    echo "⚠️  Warning: Some Xcode processes still running"
    ps aux | grep -i xcode | grep -v grep
else
    echo "✅ No Xcode processes running"
fi

echo ""
echo "================================================"
echo "✅ Xcode Cleanup Complete!"
echo ""
echo "Next Steps:"
echo "1. Wait 5 seconds for system to settle"
echo "2. Open Xcode with: open -a Xcode ios/Yoraa.xcworkspace"
echo "3. Xcode should start fresh without loading unsaved data"
echo ""
echo "If issues persist:"
echo "- Restart your Mac"
echo "- Or run: rm -rf ~/Library/Developer/Xcode/DerivedData/*"
echo ""
