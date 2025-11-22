#!/bin/bash

# iOS Production Build, Archive & Install Script
# This script builds for production and installs on connected device

set -e

echo "🏭 Starting iOS Production Build & Install Process..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Step 1: Check if device is connected
echo "=========================================="
echo "Step 1: Checking for connected device"
echo "=========================================="
echo ""

DEVICE_ID=$(xcrun xctrace list devices 2>&1 | grep "iPhone" | grep -v "Simulator" | head -1 | sed 's/.*(\(.*\))/\1/')

if [ -z "$DEVICE_ID" ]; then
  echo -e "${RED}❌ No iOS device connected!${NC}"
  echo "Please connect your iPhone and try again."
  exit 1
fi

echo -e "${GREEN}✅ Found device: $DEVICE_ID${NC}"
echo ""

# Step 2: Ensure Xcode project is fixed
echo "=========================================="
echo "Step 2: Ensuring Xcode settings are correct"
echo "=========================================="
echo ""

if [ -f "ios/fix-xcode-project.sh" ]; then
  cd ios
  ./fix-xcode-project.sh
  cd ..
  echo -e "${GREEN}✅ Xcode settings verified${NC}"
else
  echo -e "${YELLOW}⚠️  Fix script not found, continuing...${NC}"
fi
echo ""

# Step 3: Clean build
echo "=========================================="
echo "Step 3: Cleaning previous builds"
echo "=========================================="
echo ""

cd ios
rm -rf build/
echo -e "${GREEN}✅ Build folder cleaned${NC}"
cd ..
echo ""

# Step 4: Build for Release configuration
echo "=========================================="
echo "Step 4: Building for Release (Production)"
echo "=========================================="
echo ""

echo -e "${BLUE}📱 Building and installing on device...${NC}"
echo ""

# Build and install directly on device in Release mode
npx react-native run-ios --mode Release --device

echo ""
echo "=========================================="
echo "✅ Build & Install Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}Your production build has been installed on the device!${NC}"
echo ""
echo "🎯 Next steps:"
echo "  1. Test the app on your device"
echo "  2. If everything works, you can archive for App Store:"
echo "     ./archive-for-appstore.sh"
echo ""
