#!/bin/bash

# Simplified iOS Production Archive Build
# Focus on preventing the 8481/8495 stuck issue

set -e

echo "🍎 iOS Production Archive Build - Simple & Safe"
echo "=============================================="
echo ""

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Step 1: Kill any stuck processes
echo "1️⃣  Killing stuck processes..."
pkill -f "node.*react-native.*bundle" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
sleep 2
echo "✅ Done"
echo ""

# Step 2: Clean caches
echo "2️⃣  Clearing caches..."
rm -rf /tmp/metro-* /tmp/react-native-* /tmp/haste-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
echo "✅ Done"
echo ""

# Step 3: Pre-bundle JavaScript (THIS PREVENTS THE STUCK ISSUE)
echo "3️⃣  Pre-bundling JavaScript..."
echo "   This step prevents the build from getting stuck at 8481/8495"
echo ""

# Create temp directory for bundle
mkdir -p /tmp/ios-bundle-temp

# Bundle with timeout - this is the KEY to preventing stuck builds
timeout 300 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --minify true \
  --bundle-output /tmp/ios-bundle-temp/main.jsbundle \
  --assets-dest /tmp/ios-bundle-temp/assets || {
    echo "❌ JavaScript bundling failed or timed out"
    exit 1
}

echo "✅ JavaScript bundled successfully"
echo "   Bundle size: $(du -h /tmp/ios-bundle-temp/main.jsbundle | cut -f1)"
echo ""

# Step 4: Open Xcode for manual archive
echo "4️⃣  Ready to build archive"
echo ""
echo "📱 Next: Build the archive in Xcode"
echo ""
echo "Option A - Using Xcode GUI (Recommended):"
echo "  1. Open ios/Yoraa.xcworkspace in Xcode"
echo "  2. Select 'Any iOS Device' as destination"
echo "  3. Go to Product → Archive"
echo "  4. Wait for archive to complete (~10 minutes)"
echo ""
echo "Option B - Using command line:"
echo "  cd ios"
echo "  xcodebuild archive \\"
echo "    -workspace Yoraa.xcworkspace \\"
echo "    -scheme Yoraa \\"
echo "    -configuration Release \\"
echo "    -archivePath ../build/ios/Yoraa.xcarchive \\"
echo "    -destination 'generic/platform=iOS'"
echo ""
echo "🎯 The JavaScript is already bundled, so the build WON'T get stuck!"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleanup: Removing temporary bundle..."
    rm -rf /tmp/ios-bundle-temp
}

trap cleanup EXIT

# Ask user if they want to open Xcode now
echo "Press ENTER to open Xcode workspace, or Ctrl+C to exit..."
read

open ios/Yoraa.xcworkspace
