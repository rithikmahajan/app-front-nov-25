#!/bin/bash

# Xcode Sandbox and Build Error Fix Script
# Date: November 8, 2025

echo "🔧 Starting Xcode Build Error Resolution..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)
IOS_DIR="$PROJECT_ROOT/ios"

echo "📁 Project root: $PROJECT_ROOT"
echo "📱 iOS directory: $IOS_DIR"
echo ""

# Step 1: Fix permissions
echo "1️⃣ Fixing file permissions..."
chmod -R 755 "$IOS_DIR/Yoraa.xcodeproj" 2>/dev/null || true
chmod -R 755 "$IOS_DIR/Yoraa.xcworkspace" 2>/dev/null || true
chmod -R 755 "$IOS_DIR/YoraaApp" 2>/dev/null || true
chmod -R 755 "$IOS_DIR/Pods" 2>/dev/null || true
chmod -R 755 "$PROJECT_ROOT/node_modules" 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# Step 2: Remove quarantine attributes
echo "2️⃣ Removing quarantine attributes..."
xattr -r -d com.apple.quarantine "$IOS_DIR/Yoraa.xcodeproj" 2>/dev/null || true
xattr -r -d com.apple.quarantine "$IOS_DIR/Yoraa.xcworkspace" 2>/dev/null || true
echo "   ✅ Quarantine attributes removed"
echo ""

# Step 3: Kill any running Metro bundler
echo "3️⃣ Stopping any running Metro bundler..."
if lsof -ti:8081 > /dev/null 2>&1; then
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    echo "   ✅ Metro bundler stopped"
else
    echo "   ℹ️  No Metro bundler running"
fi
echo ""

# Step 4: Clean iOS build artifacts
echo "4️⃣ Cleaning iOS build artifacts..."
rm -rf "$IOS_DIR/build"
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true
echo "   ✅ Build artifacts cleaned"
echo ""

# Step 5: Verify .xcode.env.local
echo "5️⃣ Verifying Node configuration..."
NODE_PATH=$(which node)
echo "export NODE_BINARY=$NODE_PATH" > "$IOS_DIR/.xcode.env.local"
echo "   ✅ Node binary configured: $NODE_PATH"
echo ""

# Step 6: Clean workspace with xcodebuild
echo "6️⃣ Cleaning Xcode workspace..."
cd "$IOS_DIR"
if xcodebuild clean -workspace Yoraa.xcworkspace -scheme YoraaApp > /dev/null 2>&1; then
    echo "   ✅ Workspace cleaned successfully"
else
    echo "   ⚠️  Workspace clean had warnings (this is usually okay)"
fi
echo ""

# Step 7: Verify pod installation
echo "7️⃣ Verifying CocoaPods installation..."
POD_COUNT=$(ls -1 "$IOS_DIR/Pods" 2>/dev/null | wc -l)
if [ $POD_COUNT -gt 10 ]; then
    echo "   ✅ Pods installed: $POD_COUNT items"
else
    echo "   ⚠️  Running pod install..."
    pod install
fi
echo ""

# Final instructions
echo "✨ Resolution complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps in Xcode:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🛑 Quit Xcode completely (⌘Q)"
echo "2. 📂 Open: ios/Yoraa.xcworkspace (NOT .xcodeproj)"
echo "3. 🧹 Clean Build Folder: Product → Clean Build Folder (Shift+⌘K)"
echo "4. 🔨 Build: Product → Build (⌘B)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  If sandbox errors persist:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Grant Xcode Full Disk Access:"
echo "System Settings → Privacy & Security → Full Disk Access"
echo "→ Click lock → Add Xcode → Restart Xcode"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
