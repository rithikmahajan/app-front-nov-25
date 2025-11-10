#!/bin/bash

# Comprehensive iOS Production Build, Install & Archive Script
# This script performs a complete production build process

set -e  # Exit on any error

echo ""
echo "🚀 =============================================="
echo "🚀 COMPREHENSIVE iOS PRODUCTION BUILD PROCESS"
echo "🚀 =============================================="
echo ""

# Configuration
WORKSPACE="ios/Yoraa.xcworkspace"
SCHEME="YoraaApp"
CONFIGURATION="Release"
BUNDLE_ID="com.yoraaapparelsprivatelimited.yoraa"
TEAM_ID="UX6XB9FMNN"
ARCHIVE_PATH="$HOME/Desktop/Yoraa-$(date +%Y%m%d-%H%M%S).xcarchive"

# Check if device is connected
echo "📱 Step 1/6: Checking for connected device..."
DEVICE_ID=$(xcrun xctrace list devices 2>&1 | grep -m1 "iPhone" | sed 's/.*(\([^)]*\)).*/\1/' | tr -d '\n')
if [ -z "$DEVICE_ID" ]; then
    echo "❌ No iPhone device found. Please connect your device."
    exit 1
fi
echo "✅ Found device: $DEVICE_ID"
echo ""

# Apply Xcode Project Fixes
echo "🔧 Step 2/6: Applying Xcode project fixes..."
cd ios

# Backup project file
cp Yoraa.xcodeproj/project.pbxproj Yoraa.xcodeproj/project.pbxproj.backup

# Fix ENABLE_USER_SCRIPT_SANDBOXING
echo "   → Disabling user script sandboxing..."
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES/ENABLE_USER_SCRIPT_SANDBOXING = NO/g' Yoraa.xcodeproj/project.pbxproj

# Fix IPHONEOS_DEPLOYMENT_TARGET
echo "   → Setting deployment target to 13.4..."
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 15.1/IPHONEOS_DEPLOYMENT_TARGET = 13.4/g' Yoraa.xcodeproj/project.pbxproj

# Add weak framework linking for CoreAudioTypes in project file
echo "   → Adding CoreAudioTypes weak framework linking..."
sed -i '' 's/OTHER_LDFLAGS = (/OTHER_LDFLAGS = (\
				"-Wl,-weak_framework,CoreAudioTypes",/g' Yoraa.xcodeproj/project.pbxproj

cd ..
echo "✅ Xcode project fixes applied"
echo ""

# Clean previous builds (but keep codegen files)
echo "🧹 Step 3/6: Cleaning previous builds..."
# Clean DerivedData but keep ios/build/generated for codegen files
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true
# Only clean the Build folder, not the generated codegen files
rm -rf ios/build/Build 2>/dev/null || true
echo "✅ Clean complete (codegen files preserved)"
echo ""

# Build for Release and Install on Device
echo "📦 Step 4/6: Building Release version and installing on device..."
echo "   This will take several minutes..."
npx react-native run-ios \
    --mode Release \
    --device "$DEVICE_ID" \
    --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release build successful and installed on device!"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the output above for errors."
    echo "💡 Try opening ios/Yoraa.xcworkspace in Xcode for more details."
    exit 1
fi

# Create Archive for App Store
echo "📦 Step 5/6: Creating archive for App Store distribution..."
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    CODE_SIGN_STYLE="Manual" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    -allowProvisioningUpdates

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Archive created successfully!"
    echo "📍 Archive location: $ARCHIVE_PATH"
    echo ""
else
    echo ""
    echo "⚠️  Archive creation had issues. You can create it manually in Xcode."
    echo ""
fi

# Summary
echo "🎉 =============================================="
echo "🎉 PRODUCTION BUILD PROCESS COMPLETE!"
echo "🎉 =============================================="
echo ""
echo "✅ Completed steps:"
echo "   1. Device detected: $DEVICE_ID"
echo "   2. Xcode fixes applied"
echo "   3. Build cache cleaned"
echo "   4. Release build created and installed on device"
echo "   5. Archive created (if successful)"
echo ""
echo "📱 Your iPhone now has the PRODUCTION build installed!"
echo ""
echo "📦 Next steps for App Store submission:"
echo "   1. Open Xcode"
echo "   2. Go to Window → Organizer"
echo "   3. Select your archive"
echo "   4. Click 'Distribute App'"
echo "   5. Follow the App Store submission wizard"
echo ""
echo "   Or use this command to open Organizer:"
echo "   open -a Xcode $ARCHIVE_PATH"
echo ""
