#!/bin/bash

# Fix TestFlight Build - Clear All Caches and Rebuild
# This script fixes "undefined is not a function" errors in TestFlight builds
# caused by stale JavaScript bundles

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIXING TESTFLIGHT BUILD - CLEARING ALL CACHES         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Clear Metro bundler cache
echo "📦 Step 1/8: Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-*
echo "✅ Metro cache cleared"
echo ""

# Step 2: Clear watchman
echo "👁  Step 2/8: Clearing Watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo "✅ Watchman cleared"
else
    echo "⚠️  Watchman not installed, skipping..."
fi
echo ""

# Step 3: Clear node_modules
echo "📚 Step 3/8: Clearing node_modules..."
rm -rf node_modules
echo "✅ node_modules removed"
echo ""

# Step 4: Clear package manager cache
echo "🧹 Step 4/8: Clearing package manager cache..."
if command -v yarn &> /dev/null; then
    yarn cache clean
    echo "✅ Yarn cache cleared"
elif command -v npm &> /dev/null; then
    npm cache clean --force
    echo "✅ NPM cache cleared"
else
    echo "⚠️  No package manager found, skipping..."
fi
echo ""

# Step 5: Clear iOS build artifacts
echo "🍎 Step 5/8: Clearing iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/CocoaPods
echo "✅ iOS build artifacts cleared"
echo ""

# Step 6: Reinstall dependencies
echo "📥 Step 6/8: Reinstalling node modules..."
if command -v yarn &> /dev/null; then
    yarn install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ No package manager found! Please install yarn or npm."
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 7: Install pods
echo "🎯 Step 7/8: Installing iOS pods..."
cd ios
pod deintegrate
pod install
cd ..
echo "✅ Pods installed"
echo ""

# Step 8: Instructions for Xcode build
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ CACHE CLEANUP COMPLETE                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 NEXT STEPS TO BUILD FOR TESTFLIGHT:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/YoraaReactNative.xcworkspace"
echo ""
echo "2. In Xcode menu bar:"
echo "   Product → Clean Build Folder (Shift + Cmd + K)"
echo ""
echo "3. Select target device/scheme:"
echo "   - Scheme: YoraaReactNative"
echo "   - Configuration: Release"
echo "   - Device: Any iOS Device (arm64)"
echo ""
echo "4. Build archive:"
echo "   Product → Archive"
echo ""
echo "5. After archive completes:"
echo "   - Click 'Distribute App'"
echo "   - Select 'TestFlight & App Store'"
echo "   - Follow prompts to upload to TestFlight"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎯 This will create a FRESH build without stale JavaScript!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
