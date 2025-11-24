#!/bin/bash

# Fresh Start on New Simulator Script
# This script will start the app on a clean simulator without full reinstall

set -e

echo "🚀 Starting fresh simulator launch..."

# Step 1: Clean Metro bundler cache
echo ""
echo "📦 Step 1/5: Cleaning Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
echo "✅ Metro cache cleaned"

# Step 2: Clean iOS build folder
echo ""
echo "🧹 Step 2/5: Cleaning iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods/build 2>/dev/null || true
echo "✅ iOS build cleaned"

# Step 3: Reinstall pods (quick operation)
echo ""
echo "📱 Step 3/5: Updating iOS pods..."
cd ios
pod install --repo-update
cd ..
echo "✅ Pods updated"

# Step 4: Kill any existing Metro bundler
echo ""
echo "🔄 Step 4/5: Stopping any running Metro bundler..."
pkill -f "react-native/scripts/launchPackager" || true
pkill -f "metro" || true
sleep 2
echo "✅ Old processes stopped"

# Step 5: Start Metro bundler with reset cache
echo ""
echo "🎯 Step 5/5: Starting Metro bundler with clean cache..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Metro bundler will start now..."
echo "After Metro is ready, press Ctrl+C here and then run:"
echo "  npm run ios"
echo "or to specify a simulator:"
echo "  npx react-native run-ios --simulator='iPhone 15 Pro'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start -- --reset-cache
