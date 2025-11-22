#!/bin/bash

# Quick TestFlight Build with Production Backend
# Skips full DerivedData cleanup for faster builds

echo "🚀 Quick Build for TestFlight with Production Backend..."
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

# Step 2: Quick clean
echo -e "${BLUE}Step 2: Quick clean...${NC}"

# Clean iOS build folder
rm -rf ios/build
echo "  ✅ Removed ios/build"

# Clean Pods
rm -rf ios/Pods
rm -f ios/Podfile.lock
echo "  ✅ Removed Pods"

# Clean Metro cache only (skip full DerivedData)
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/metro-* 2>/dev/null
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

# Step 4: Set production environment
echo -e "${BLUE}Step 4: Setting production environment...${NC}"
export ENVFILE=.env.production
echo -e "${GREEN}✅ ENVFILE=.env.production${NC}"
echo ""

# Step 5: Build archive
echo -e "${BLUE}Step 5: Building archive for TestFlight...${NC}"
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
    echo "   4. Choose 'App Store Connect'"
    echo "   5. Upload to TestFlight"
    echo ""
    echo -e "${GREEN}✅ Your TestFlight build will use production backend!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "   1. Check build errors above"
    echo "   2. Verify signing certificates in Xcode"
    echo "   3. Try: ./build-testflight-production.sh for full clean"
    exit 1
fi
