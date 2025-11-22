#!/bin/bash

# TestFlight Build with Production Backend - Complete Clean Build
# This ensures environment variables are properly embedded

echo "🚀 Building for TestFlight with Production Backend..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check we're in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Verify production environment
echo -e "${BLUE}Step 1: Verifying production environment...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

PROD_URL=$(grep "^API_BASE_URL=" .env.production | cut -d '=' -f2)
echo -e "${GREEN}✅ Production backend: $PROD_URL${NC}"

if [[ "$PROD_URL" == *"localhost"* ]]; then
    echo -e "${RED}❌ ERROR: Production URL contains localhost!${NC}"
    exit 1
fi

echo ""

# Step 2: Clean everything
echo -e "${BLUE}Step 2: Cleaning build artifacts...${NC}"
echo -e "${YELLOW}This ensures environment variables are re-embedded${NC}"

# Clean iOS build folder
rm -rf ios/build
echo "  ✅ Removed ios/build"

# Clean Pods
rm -rf ios/Pods
rm -f ios/Podfile.lock
echo "  ✅ Removed Pods"

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "  ✅ Cleaned Xcode derived data"

# Clean Metro cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
echo "  ✅ Cleaned Metro cache"

echo ""

# Step 3: Reinstall Pods
echo -e "${BLUE}Step 3: Installing iOS dependencies...${NC}"
cd ios
pod install
cd ..

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Pod install failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pods installed${NC}"
echo ""

# Step 4: Set production environment for build
echo -e "${BLUE}Step 4: Setting production environment...${NC}"
export ENVFILE=.env.production
echo -e "${GREEN}✅ ENVFILE=.env.production${NC}"
echo ""

# Step 5: Clean Xcode project
echo -e "${BLUE}Step 5: Cleaning Xcode project...${NC}"
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa -configuration Release
cd ..

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Xcode clean failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Xcode project cleaned${NC}"
echo ""

# Step 6: Build archive
echo -e "${BLUE}Step 6: Building archive for TestFlight...${NC}"
echo -e "${YELLOW}This will take 10-15 minutes...${NC}"
echo ""

cd ios

xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme Yoraa \
  -configuration Release \
  -archivePath "$HOME/Desktop/YoraaApp.xcarchive" \
  -allowProvisioningUpdates \
  ENVFILE=../.env.production

BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📦 Archive location:${NC}"
    echo "   $HOME/Desktop/YoraaApp.xcarchive"
    echo ""
    echo -e "${BLUE}🔍 Production Backend:${NC}"
    echo "   $PROD_URL"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "   1. Open Xcode → Window → Organizer"
    echo "   2. Select your archive"
    echo "   3. Click 'Distribute App'"
    echo "   4. Choose 'TestFlight & App Store'"
    echo "   5. Upload to App Store Connect"
    echo ""
    echo -e "${GREEN}✅ Your TestFlight build will fetch data from production backend!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "   1. Open Xcode and check build errors"
    echo "   2. Verify signing certificates"
    echo "   3. Check provisioning profiles"
    echo "   4. Try building directly in Xcode"
    exit 1
fi
