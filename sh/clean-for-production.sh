#!/bin/bash

# Complete Cache Cleanup Script for iOS Production Build
# Run this before creating production builds

echo "🧹 COMPLETE CACHE CLEANUP FOR iOS PRODUCTION"
echo "=============================================="
echo ""

# Get the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

# Step 1: Remove node_modules
echo "1️⃣ Removing node_modules..."
rm -rf node_modules
echo "   ✅ Done"
echo ""

# Step 2: Remove iOS build artifacts
echo "2️⃣ Removing iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -f ios/Podfile.lock
echo "   ✅ Done"
echo ""

# Step 3: Clear Xcode DerivedData
echo "3️⃣ Clearing Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "   ✅ Done"
echo ""

# Step 4: Clear Metro bundler cache
echo "4️⃣ Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
echo "   ✅ Done"
echo ""

# Step 5: Clear Watchman cache
echo "5️⃣ Clearing Watchman cache..."
watchman watch-del-all 2>/dev/null
echo "   ✅ Done"
echo ""

# Step 6: Clear npm cache
echo "6️⃣ Clearing npm cache..."
npm cache clean --force
echo "   ✅ Done"
echo ""

# Step 7: Clear CocoaPods cache
echo "7️⃣ Clearing CocoaPods cache..."
pod cache clean --all 2>/dev/null || echo "   ⚠️  CocoaPods cache clean skipped"
echo "   ✅ Done"
echo ""

# Step 8: Reinstall npm packages
echo "8️⃣ Reinstalling npm packages..."
npm install
echo "   ✅ Done"
echo ""

# Step 9: Reinstall iOS Pods
echo "9️⃣ Reinstalling iOS Pods..."
cd ios
pod install
cd ..
echo "   ✅ Done"
echo ""

# Step 10: Clean Xcode build
echo "🔟 Cleaning Xcode build..."
cd ios
xcodebuild clean -workspace YoraaApp.xcworkspace -scheme YoraaApp 2>/dev/null || echo "   ⚠️  Xcode clean skipped"
cd ..
echo "   ✅ Done"
echo ""

echo "=============================================="
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "📱 Next Steps for Production Build:"
echo "   1. Open Xcode: open ios/YoraaApp.xcworkspace"
echo "   2. Select 'Any iOS Device (arm64)' or your connected device"
echo "   3. Product → Archive"
echo "   4. Distribute App → App Store Connect"
echo ""
echo "🚀 Or run from command line:"
echo "   npx react-native run-ios --configuration Release --device \"Your Device\""
echo ""
