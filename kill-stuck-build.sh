#!/bin/bash

echo "🛑 Killing Stuck iOS Build Process"
echo "===================================="
echo ""

# Kill the specific stuck bundler process
echo "1️⃣ Killing stuck bundler process (PID 40717)..."
kill -9 40717 2>/dev/null || echo "   Process already terminated"
echo ""

# Kill related React Native processes
echo "2️⃣ Killing all related React Native processes..."
pkill -9 -f "react-native-xcode.sh" 2>/dev/null || true
pkill -9 -f "bundle.js bundle" 2>/dev/null || true
pkill -9 -f "with-environment.sh" 2>/dev/null || true
echo "   ✅ Processes killed"
echo ""

# Kill Metro bundler if running
echo "3️⃣ Killing Metro bundler..."
pkill -9 -f "metro" 2>/dev/null || true
pkill -9 -f "cli.js start" 2>/dev/null || true
echo "   ✅ Metro killed"
echo ""

# Clean up temp files
echo "4️⃣ Cleaning temporary build files..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
echo "   ✅ Temp files cleaned"
echo ""

echo "===================================="
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "Option 1 - Try Archive Again:"
echo "   1. In Xcode: Product > Clean Build Folder (Cmd+Shift+K)"
echo "   2. Wait 5 seconds"
echo "   3. Product > Archive"
echo ""
echo "Option 2 - If Still Stuck, Disable Minification:"
echo "   1. In Xcode, go to: Yoraa > Build Phases > Bundle React Native code and images"
echo "   2. Find this line:"
echo "      export BUNDLE_COMMAND=\"bundle\""
echo "   3. Add after it:"
echo "      export EXTRA_PACKAGER_ARGS=\"--minify false\""
echo "   4. Save and try Archive again"
echo ""
echo "Option 3 - Use Production Build Script:"
echo "   Run: ./build-ios-production-archive.sh"
echo ""
echo "===================================="
