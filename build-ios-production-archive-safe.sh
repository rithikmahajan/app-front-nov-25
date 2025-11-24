#!/bin/bash

# iOS Production Archive Build Script - No Stuck Builds
# This script ensures the build doesn't get stuck at 8481/8495
# Created: November 24, 2025

set -e  # Exit on error

echo "=================================================="
echo "🍎 iOS Production Archive Build (Safe Mode)"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10"
IOS_DIR="$PROJECT_DIR/ios"
SCHEME="Yoraa"
WORKSPACE="Yoraa.xcworkspace"
CONFIGURATION="Release"
ARCHIVE_PATH="$PROJECT_DIR/build/ios/Yoraa.xcarchive"
BUILD_LOG="$PROJECT_DIR/ios-production-archive.log"

# Step 1: Clean up any stuck processes
echo -e "${YELLOW}Step 1: Cleaning up stuck processes...${NC}"
pkill -f "node.*react-native.*bundle" 2>/dev/null || echo "No stuck bundler processes"
pkill -f "react-native start" 2>/dev/null || echo "No metro bundler processes"
pkill -f "watchman" 2>/dev/null || echo "No watchman processes"

# Wait for processes to fully terminate
sleep 2

echo -e "${GREEN}✅ Processes cleaned${NC}"
echo ""

# Step 2: Clean previous builds
echo -e "${YELLOW}Step 2: Cleaning previous builds...${NC}"
rm -rf "$ARCHIVE_PATH"
rm -rf "$PROJECT_DIR/build/ios"
mkdir -p "$PROJECT_DIR/build/ios"

# Clean Xcode build folder
cd "$IOS_DIR"
rm -rf build/
rm -rf DerivedData/

echo -e "${GREEN}✅ Previous builds cleaned${NC}"
echo ""

# Step 3: Clear React Native cache
echo -e "${YELLOW}Step 3: Clearing React Native cache...${NC}"
cd "$PROJECT_DIR"
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-native-*
rm -rf /tmp/haste-*

echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 4: Install dependencies (if needed)
echo -e "${YELLOW}Step 4: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

cd "$IOS_DIR"
if [ ! -d "Pods" ]; then
    echo "Installing CocoaPods..."
    pod install
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Step 5: Pre-bundle JavaScript with timeout protection
echo -e "${YELLOW}Step 5: Pre-bundling JavaScript (with timeout)...${NC}"
cd "$PROJECT_DIR"

# Create the bundle directory
BUNDLE_DIR="$IOS_DIR/main.jsbundle.temp"
rm -rf "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR"

# Bundle with timeout to prevent hanging
timeout 300 npx react-native bundle \
  --platform ios \
  --dev false \
  --minify true \
  --entry-file index.js \
  --bundle-output "$BUNDLE_DIR/main.jsbundle" \
  --assets-dest "$BUNDLE_DIR" \
  2>&1 | tee -a "$BUILD_LOG" || {
    echo -e "${RED}❌ JavaScript bundling timed out or failed${NC}"
    echo "Check $BUILD_LOG for details"
    exit 1
}

echo -e "${GREEN}✅ JavaScript bundled successfully${NC}"
echo ""

# Step 6: Clean Xcode build
echo -e "${YELLOW}Step 6: Cleaning Xcode project...${NC}"
cd "$IOS_DIR"
xcodebuild clean \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  2>&1 | tee -a "$BUILD_LOG"

echo -e "${GREEN}✅ Xcode project cleaned${NC}"
echo ""

# Step 7: Build Archive
echo -e "${YELLOW}Step 7: Building iOS Archive...${NC}"
echo -e "${BLUE}This may take 10-15 minutes. Please wait...${NC}"
echo ""

cd "$IOS_DIR"
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  SKIP_INSTALL=NO \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
  ONLY_ACTIVE_ARCH=NO \
  2>&1 | tee -a "$BUILD_LOG"

# Check if archive was created successfully
if [ -d "$ARCHIVE_PATH" ]; then
    echo ""
    echo -e "${GREEN}=================================================="
    echo "✅ iOS Archive Created Successfully!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${BLUE}Archive Location:${NC}"
    echo "$ARCHIVE_PATH"
    echo ""
    echo -e "${BLUE}Archive Size:${NC}"
    du -sh "$ARCHIVE_PATH"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Open Xcode Organizer: Window → Organizer"
    echo "2. Select your archive from the Archives tab"
    echo "3. Click 'Distribute App'"
    echo "4. Choose distribution method (App Store, Ad Hoc, etc.)"
    echo "5. Follow the wizard to export the IPA"
    echo ""
    echo -e "${BLUE}Or use this command to export IPA:${NC}"
    echo "xcodebuild -exportArchive \\"
    echo "  -archivePath '$ARCHIVE_PATH' \\"
    echo "  -exportPath '$PROJECT_DIR/build/ios' \\"
    echo "  -exportOptionsPlist ExportOptions.plist"
    echo ""
else
    echo ""
    echo -e "${RED}=================================================="
    echo "❌ Archive Creation Failed!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file for details:${NC}"
    echo "$BUILD_LOG"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "1. Code signing issues - Check certificates and provisioning profiles"
    echo "2. Missing dependencies - Run 'pod install' in ios/ directory"
    echo "3. Build errors - Check the log for specific error messages"
    echo ""
    exit 1
fi

# Step 8: Cleanup temporary bundle
echo -e "${YELLOW}Step 8: Cleaning up temporary files...${NC}"
rm -rf "$BUNDLE_DIR"
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo -e "${GREEN}=================================================="
echo "🎉 Build Process Complete!"
echo "==================================================${NC}"
