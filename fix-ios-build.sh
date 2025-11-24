#!/bin/bash

echo "🔧 Fixing iOS Build - Reverting Fabric Architecture Change"
echo "============================================================"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Kill any running build processes
echo "1️⃣ Killing stuck build processes..."
pkill -f "metro" 2>/dev/null || true
pkill -f "react-native-xcode" 2>/dev/null || true
pkill -f "node.*bundle" 2>/dev/null || true
echo "   ✅ Processes killed"
echo ""

# Step 2: Clean Xcode derived data
echo "2️⃣ Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*
echo "   ✅ Derived data cleaned"
echo ""

# Step 3: Clean iOS build folder
echo "3️⃣ Cleaning iOS build folder..."
cd ios
rm -rf build/
echo "   ✅ Build folder cleaned"
echo ""

# Step 4: Clean Pods
echo "4️⃣ Cleaning Pods..."
rm -rf Pods/
rm -rf Podfile.lock
echo "   ✅ Pods cleaned"
echo ""

# Step 5: Reinstall Pods
echo "5️⃣ Installing Pods with Fabric DISABLED..."
pod install --repo-update
if [ $? -eq 0 ]; then
    echo "   ✅ Pods installed successfully"
else
    echo "   ❌ Pod install failed!"
    exit 1
fi
echo ""

# Step 6: Clean Metro cache
echo "6️⃣ Cleaning Metro bundler cache..."
cd ..
rm -rf /tmp/metro-*
rm -rf /tmp/react-*
watchman watch-del-all 2>/dev/null || echo "   (watchman not installed - skipping)"
echo "   ✅ Metro cache cleaned"
echo ""

# Step 7: Clean React Native cache
echo "7️⃣ Cleaning React Native cache..."
rm -rf $TMPDIR/react-* 2>/dev/null || true
echo "   ✅ React Native cache cleaned"
echo ""

echo "============================================================"
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. In Xcode:"
echo "   - Press Cmd + Shift + K (Clean Build Folder)"
echo "   - Wait for cleaning to complete"
echo ""
echo "2. Build for Archive:"
echo "   - Product > Archive"
echo ""
echo "3. Monitor the build:"
echo "   - It should now pass 8481/8495 without hanging"
echo "   - The bundler will use the old architecture (working config)"
echo ""
echo "============================================================"
echo ""
echo "🔍 What was fixed:"
echo "   - Reverted fabric_enabled from TRUE to FALSE"
echo "   - The New Architecture (Fabric) was causing bundler hangs"
echo "   - Pods reinstalled with old architecture"
echo "   - All caches cleared"
echo ""
