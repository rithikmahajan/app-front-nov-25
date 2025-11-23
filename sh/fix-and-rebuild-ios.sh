#!/bin/bash

# ============================================
# 🔧 iOS Production Fix Rebuild Script
# Applies API URL fix and rebuilds
# ============================================

set -e  # Exit on error

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🔧 iOS Production Fix Rebuild${NC}"
echo -e "${BLUE}Cleaning and rebuilding after .env fix${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Step 1: Verify .env fix
echo -e "${YELLOW}📋 Step 1: Verifying .env files...${NC}"
echo -e "Checking API_BASE_URL configuration:\n"

echo -e "${BLUE}📄 .env.production:${NC}"
grep "API_BASE_URL" .env.production || echo -e "${RED}❌ Not found!${NC}"

echo -e "\n${BLUE}📄 .env:${NC}"
grep "API_BASE_URL" .env || echo -e "${RED}❌ Not found!${NC}"

echo -e "\n${BLUE}📄 ios/.env:${NC}"
grep "API_BASE_URL" ios/.env || echo -e "${RED}❌ Not found!${NC}"

# Verify it has /api suffix
if grep -q "API_BASE_URL=https://api.yoraa.in.net/api" .env && \
   grep -q "API_BASE_URL=https://api.yoraa.in.net/api" .env.production && \
   grep -q "API_BASE_URL=https://api.yoraa.in.net/api" ios/.env; then
    echo -e "\n${GREEN}✅ All .env files have correct API URL with /api suffix!${NC}\n"
else
    echo -e "\n${RED}❌ ERROR: Some .env files missing /api suffix!${NC}"
    echo -e "${RED}Please check PRODUCTION_API_FIX_NOV23.md for details${NC}\n"
    exit 1
fi

# Step 2: Clean iOS build
echo -e "${YELLOW}📋 Step 2: Cleaning iOS build artifacts...${NC}"

cd ios

# Remove build directory
if [ -d "build" ]; then
    echo "Removing ios/build..."
    rm -rf build
    echo -e "${GREEN}✅ Removed build directory${NC}"
fi

# Remove Pods directory (will reinstall)
if [ -d "Pods" ]; then
    echo "Removing ios/Pods..."
    rm -rf Pods
    echo -e "${GREEN}✅ Removed Pods directory${NC}"
fi

# Clean Xcode DerivedData
echo "Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Cleaned DerivedData${NC}\n"

# Step 3: Reinstall CocoaPods
echo -e "${YELLOW}📋 Step 3: Reinstalling CocoaPods...${NC}"
pod install --repo-update
echo -e "${GREEN}✅ CocoaPods installed${NC}\n"

cd ..

# Step 4: Clean Metro cache
echo -e "${YELLOW}📋 Step 4: Cleaning Metro cache...${NC}"
if [ -d "node_modules" ]; then
    echo "Metro cache will be cleared when starting packager"
    echo -e "${GREEN}✅ Ready to clear Metro cache${NC}\n"
fi

# Step 5: Ready to build
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo -e "${GREEN}============================================${NC}\n"

echo -e "${BLUE}📱 Next Steps:${NC}\n"
echo -e "1️⃣  Open Xcode workspace:"
echo -e "   ${YELLOW}open ios/Yoraa.xcworkspace${NC}\n"

echo -e "2️⃣  In Xcode:"
echo -e "   • Select '${YELLOW}Any iOS Device (arm64)${NC}' as target"
echo -e "   • Ensure scheme is set to '${YELLOW}Release${NC}'"
echo -e "   • Clean Build Folder: ${YELLOW}⇧⌘K${NC}"
echo -e "   • Archive: ${YELLOW}Product → Archive${NC}\n"

echo -e "3️⃣  After archive completes:"
echo -e "   • Organizer → Distribute App"
echo -e "   • App Store Connect"
echo -e "   • Upload\n"

echo -e "4️⃣  Test in TestFlight:"
echo -e "   • Wait for processing (~30-60 min)"
echo -e "   • Update TestFlight app"
echo -e "   • Categories should load! ✅\n"

echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   ${YELLOW}PRODUCTION_API_FIX_NOV23.md${NC} - Complete fix details\n"

# Ask if user wants to open Xcode
echo -e "${YELLOW}Would you like to open Xcode now? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "\n${GREEN}🚀 Opening Xcode...${NC}\n"
    open ios/Yoraa.xcworkspace
else
    echo -e "\n${BLUE}👍 You can open Xcode manually when ready${NC}\n"
fi

echo -e "${GREEN}Done! Ready to build iOS production release.${NC}\n"
