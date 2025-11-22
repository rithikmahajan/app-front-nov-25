#!/bin/bash

# reCAPTCHA iOS Rebuild Script
# This script cleans and rebuilds the iOS app with the new reCAPTCHA configuration

echo "🚀 Starting iOS rebuild for reCAPTCHA fix..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "ios" ]; then
    echo -e "${RED}❌ Error: ios directory not found. Please run this from the project root.${NC}"
    exit 1
fi

# Step 1: Clean iOS build
echo -e "${YELLOW}📦 Step 1/5: Cleaning iOS build...${NC}"
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ iOS build cleaned${NC}"
echo ""

# Step 2: Install pods
echo -e "${YELLOW}📦 Step 2/5: Installing CocoaPods...${NC}"
pod install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Pod install failed. Please check your Podfile.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pods installed successfully${NC}"
echo ""

# Go back to root
cd ..

# Step 3: Clean React Native cache
echo -e "${YELLOW}📦 Step 3/5: Cleaning React Native cache...${NC}"
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
echo -e "${GREEN}✅ Metro bundler started with clean cache${NC}"
echo ""

# Step 4: Clean build folder
echo -e "${YELLOW}📦 Step 4/5: Cleaning watchman and temp files...${NC}"
watchman watch-del-all 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
echo -e "${GREEN}✅ Cache cleaned${NC}"
echo ""

# Step 5: Information
echo -e "${YELLOW}📦 Step 5/5: Ready to rebuild${NC}"
echo ""
echo -e "${GREEN}✅ All cleaning and setup complete!${NC}"
echo ""
echo "Now run ONE of these commands in a NEW terminal:"
echo ""
echo "  For iOS Simulator:"
echo "    npx react-native run-ios"
echo ""
echo "  For specific iOS Simulator:"
echo "    npx react-native run-ios --simulator=\"iPhone 15 Pro\""
echo ""
echo "  For physical device:"
echo "    npx react-native run-ios --device"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Before testing, make sure you've configured the site keys in Firebase Console!${NC}"
echo ""
echo "See RECAPTCHA_FIX_GUIDE.md for complete instructions."
echo ""
echo "Metro bundler is running in the background (PID: $METRO_PID)"
echo "Press Ctrl+C to stop Metro bundler"
echo ""

# Keep script running to keep Metro alive
wait $METRO_PID
