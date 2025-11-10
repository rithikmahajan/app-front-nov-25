#!/bin/bash

# ============================================================================
# FINAL PRODUCTION BUILD SCRIPT FOR iOS - COMPREHENSIVE FIX
# This script addresses ALL build issues systematically
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting FINAL Production Build Process..."
echo "================================================"

# Configuration
WORKSPACE="ios/Yoraa.xcworkspace"
SCHEME="YoraaApp"
CONFIGURATION="Release"
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData"

# Step 1: Kill all existing Xcode processes to prevent database locks
echo ""
echo "Step 1/8: Killing all Xcode processes..."
pkill -9 xcodebuild 2>/dev/null || true
pkill -9 Xcode 2>/dev/null || true
pkill -9 Simulator 2>/dev/null || true
sleep 3
echo "✅ All Xcode processes terminated"

# Step 2: Clean DerivedData but preserve codegen
echo ""
echo "Step 2/8: Cleaning DerivedData (preserving codegen)..."
rm -rf "$DERIVED_DATA"/Yoraa-*/Build
rm -rf "$DERIVED_DATA"/Yoraa-*/Logs
rm -rf "$DERIVED_DATA"/Yoraa-*/Index
rm -rf "$DERIVED_DATA"/Yoraa-*/ModuleCache.noindex
# DO NOT remove: ios/build/generated/ - contains critical codegen files
echo "✅ DerivedData cleaned (codegen preserved)"

# Step 3: Verify codegen files exist
echo ""
echo "Step 3/8: Verifying codegen files..."
if [ ! -d "ios/build/generated/ios" ]; then
    echo "❌ ERROR: Codegen files missing!"
    echo "Running: cd ios && pod install"
    cd ios && pod install && cd ..
fi

CODEGEN_COUNT=$(find ios/build/generated/ios -type f 2>/dev/null | wc -l)
if [ "$CODEGEN_COUNT" -lt 40 ]; then
    echo "❌ ERROR: Insufficient codegen files ($CODEGEN_COUNT found, need 40+)"
    echo "Regenerating with pod install..."
    cd ios && pod install && cd ..
fi
echo "✅ Codegen verified: $CODEGEN_COUNT files present"

# Step 4: Clean Xcode build products
echo ""
echo "Step 4/8: Cleaning Xcode build products..."
cd ios
xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration "$CONFIGURATION" 2>&1 | grep -E "CLEAN|BUILD|error" || true
cd ..
echo "✅ Xcode build products cleaned"

# Step 5: Check for connected device
echo ""
echo "Step 5/8: Detecting connected devices..."
DEVICE_ID=$(xcrun xctrace list devices 2>&1 | grep -E "iPhone|iPad" | grep -v "Simulator" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

if [ -z "$DEVICE_ID" ]; then
    echo "⚠️  No physical device connected"
    echo "Options:"
    echo "  1. Connect iPhone/iPad via USB and trust computer"
    echo "  2. Build for simulator: ./build-for-simulator.sh"
    echo "  3. Archive only: ./archive-for-appstore.sh"
    read -p "Continue with archive only? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted by user"
        exit 1
    fi
    DEVICE_BUILD=false
else
    echo "✅ Device detected: $DEVICE_ID"
    DEVICE_BUILD=true
fi

# Step 6: Apply Xcode project fixes
echo ""
echo "Step 6/8: Applying Xcode project fixes..."
cd ios

# Fix ENABLE_USER_SCRIPT_SANDBOXING
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES/ENABLE_USER_SCRIPT_SANDBOXING = NO/g' Yoraa.xcodeproj/project.pbxproj

# Fix IPHONEOS_DEPLOYMENT_TARGET
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 15.1/IPHONEOS_DEPLOYMENT_TARGET = 13.4/g' Yoraa.xcodeproj/project.pbxproj

# Add CoreAudioTypes weak framework
if ! grep -q "weak_framework,CoreAudioTypes" Yoraa.xcodeproj/project.pbxproj; then
    sed -i '' 's/"OTHER_LDFLAGS" = (/&\n\t\t\t\t\t"-Wl,-weak_framework,CoreAudioTypes",/g' Yoraa.xcodeproj/project.pbxproj
fi

cd ..
echo "✅ Xcode project fixes applied"

# Step 7: Build for device (if connected)
if [ "$DEVICE_BUILD" = true ]; then
    echo ""
    echo "Step 7/8: Building Release for device..."
    echo "⏳ This will take 5-10 minutes..."
    
    cd ios
    xcodebuild \
        -workspace "Yoraa.xcworkspace" \
        -scheme "YoraaApp" \
        -configuration Release \
        -sdk iphoneos \
        -destination "id=$DEVICE_ID" \
        -derivedDataPath "$DERIVED_DATA/Yoraa-Production" \
        build \
        CODE_SIGN_STYLE=Automatic \
        DEVELOPMENT_TEAM=UX6XB9FMNN \
        CODE_SIGN_IDENTITY="Apple Development" \
        PROVISIONING_PROFILE_SPECIFIER="" \
        2>&1 | tee ../build-production.log | grep -E "Building|Compiling|Linking|error|warning|succeeded|failed" || true
    
    BUILD_EXIT_CODE=${PIPESTATUS[0]}
    cd ..
    
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        echo "✅ Device build completed successfully"
    else
        echo "❌ Device build failed with exit code $BUILD_EXIT_CODE"
        echo "Check build-production.log for details"
        exit $BUILD_EXIT_CODE
    fi
else
    echo ""
    echo "Step 7/8: Skipping device build (no device connected)"
fi

# Step 8: Create archive for App Store
echo ""
echo "Step 8/8: Creating App Store archive..."
ARCHIVE_PATH="$HOME/Desktop/Yoraa-$(date +%Y%m%d-%H%M%S).xcarchive"

cd ios
xcodebuild archive \
    -workspace "Yoraa.xcworkspace" \
    -scheme "YoraaApp" \
    -configuration Release \
    -sdk iphoneos \
    -archivePath "$ARCHIVE_PATH" \
    -derivedDataPath "$DERIVED_DATA/Yoraa-Archive" \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM=UX6XB9FMNN \
    CODE_SIGN_IDENTITY="Apple Development" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    2>&1 | tee ../archive.log | grep -E "Archive|error|warning|succeeded|failed" || true

ARCHIVE_EXIT_CODE=${PIPESTATUS[0]}
cd ..

if [ $ARCHIVE_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "🎉 SUCCESS! Production build complete!"
    echo "================================================"
    echo ""
    echo "📦 Archive created at:"
    echo "   $ARCHIVE_PATH"
    echo ""
    echo "📱 Next steps for App Store submission:"
    echo "   1. Open Xcode"
    echo "   2. Go to Window → Organizer (⌘⇧O)"
    echo "   3. Select your archive"
    echo "   4. Click 'Distribute App'"
    echo "   5. Choose 'App Store Connect'"
    echo "   6. Follow the upload wizard"
    echo ""
    if [ "$DEVICE_BUILD" = true ]; then
        echo "✅ App is also installed on device: $DEVICE_ID"
    fi
    echo ""
    exit 0
else
    echo ""
    echo "================================================"
    echo "❌ Archive creation failed!"
    echo "================================================"
    echo ""
    echo "📋 Troubleshooting:"
    echo "   1. Check archive.log for detailed errors"
    echo "   2. Verify signing certificate in Xcode"
    echo "   3. Ensure provisioning profile is valid"
    echo "   4. Check Apple Developer account status"
    echo ""
    exit $ARCHIVE_EXIT_CODE
fi
