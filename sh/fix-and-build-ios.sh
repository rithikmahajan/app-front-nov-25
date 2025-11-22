#!/bin/bash

# Complete iOS Build Fix Script
# Fixes Xcode 16 linker issues and rebuilds the project

set -e

echo "🚀 Starting Complete iOS Build Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to iOS directory
cd "$(dirname "$0")/ios"

echo ""
echo "=========================================="
echo "Step 1: Cleaning build artifacts"
echo "=========================================="
echo ""

# Clean build folders
echo -e "${YELLOW}🧹 Removing build folder...${NC}"
rm -rf build/

echo -e "${YELLOW}🧹 Removing Pods...${NC}"
rm -rf Pods/

echo -e "${YELLOW}🧹 Removing Podfile.lock...${NC}"
rm -f Podfile.lock

echo -e "${YELLOW}🧹 Cleaning Xcode derived data...${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-*

echo -e "${GREEN}✅ Build artifacts cleaned${NC}"

echo ""
echo "=========================================="
echo "Step 2: Clearing caches"
echo "=========================================="
echo ""

cd ..

echo -e "${YELLOW}🧹 Clearing npm cache...${NC}"
npm cache clean --force

echo -e "${YELLOW}🧹 Clearing watchman...${NC}"
watchman watch-del-all 2>/dev/null || true

echo -e "${YELLOW}🧹 Clearing metro cache...${NC}"
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

echo -e "${GREEN}✅ Caches cleared${NC}"

echo ""
echo "=========================================="
echo "Step 3: Installing dependencies"
echo "=========================================="
echo ""

echo -e "${YELLOW}📦 Installing npm packages...${NC}"
npm install

cd ios

echo -e "${YELLOW}📦 Installing CocoaPods...${NC}"
pod install --repo-update

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "=========================================="
echo "Step 4: Verifying configuration"
echo "=========================================="
echo ""

# Check if workspace exists
if [ -f "Yoraa.xcworkspace/contents.xcworkspacedata" ]; then
  echo -e "${GREEN}✅ Workspace file exists${NC}"
else
  echo -e "${RED}❌ Workspace file missing${NC}"
  exit 1
fi

# Check if GoogleService-Info.plist exists
if [ -f "YoraaApp/GoogleService-Info.plist" ]; then
  echo -e "${GREEN}✅ Firebase configuration exists${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: GoogleService-Info.plist not found${NC}"
fi

echo ""
echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}You can now build the app with:${NC}"
echo ""
echo -e "${BLUE}  npx react-native run-ios${NC}"
echo ""
echo -e "${BLUE}Or for a specific simulator:${NC}"
echo -e "${BLUE}  npx react-native run-ios --simulator=\"iPhone 15 Pro\"${NC}"
echo ""
echo -e "${BLUE}Or for a device:${NC}"
echo -e "${BLUE}  npx react-native run-ios --device${NC}"
echo ""
echo -e "${BLUE}Or open in Xcode:${NC}"
echo -e "${BLUE}  open ios/Yoraa.xcworkspace${NC}"
echo ""
