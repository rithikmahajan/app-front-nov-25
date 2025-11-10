#!/bin/bash

# Fix Device Provisioning - Enable Automatic Signing
# This script helps resolve the "device not in provisioning profile" error

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Device Provisioning Fix for iPhone Testing          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Device info
DEVICE_NAME="Rithik's iPhone"
DEVICE_ID="00008130-000C79462E43001C"
BUNDLE_ID="com.yoraaapparelsprivatelimited.yoraa"
TEAM_ID="UX6XB9FMNN"

echo -e "${YELLOW}📱 Device Information:${NC}"
echo "   Device Name: $DEVICE_NAME"
echo "   Device ID: $DEVICE_ID"
echo "   Bundle ID: $BUNDLE_ID"
echo "   Team ID: $TEAM_ID"
echo ""

echo -e "${YELLOW}🔍 Issue Detected:${NC}"
echo "   Your iPhone is not registered in the provisioning profile."
echo ""

echo -e "${GREEN}✅ SOLUTION - Follow These Steps:${NC}"
echo ""

echo -e "${BLUE}Step 1: Xcode is Opening...${NC}"
echo "   Wait for Xcode to fully open the workspace."
echo ""

echo -e "${BLUE}Step 2: In Xcode${NC}"
echo "   1. Click on 'Yoraa' (blue icon) in the left panel"
echo "   2. Select 'YoraaApp' under TARGETS (not PROJECT)"
echo "   3. Click 'Signing & Capabilities' tab at the top"
echo ""

echo -e "${BLUE}Step 3: Enable Automatic Signing${NC}"
echo "   ✅ Check the box: 'Automatically manage signing'"
echo "   📋 Team should be: Yoraa Apparels Private Limited ($TEAM_ID)"
echo ""
echo "   Xcode will now:"
echo "   • Register your iPhone automatically"
echo "   • Create/update provisioning profiles"
echo "   • Fix the signing issue"
echo ""

echo -e "${BLUE}Step 4: Close Xcode (After it processes)${NC}"
echo "   Wait for Xcode to finish (you'll see 'Provisioning profile: iOS Team Provisioning Profile')"
echo "   Then close Xcode (Cmd+Q)"
echo ""

echo -e "${YELLOW}⏳ Waiting for you to complete steps in Xcode...${NC}"
echo ""
echo "Press ENTER after you've enabled automatic signing in Xcode..."
read -r

echo ""
echo -e "${GREEN}Great! Now let's clean and rebuild...${NC}"
echo ""

# Clean build
echo -e "${YELLOW}🧹 Cleaning build files...${NC}"
cd ios
rm -rf build
cd ..

echo -e "${GREEN}✅ Clean complete!${NC}"
echo ""

# Try building
echo -e "${YELLOW}🔨 Building and installing on your iPhone...${NC}"
echo ""

npx react-native run-ios --device="$DEVICE_ID"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Build Complete! Check your iPhone                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📱 Next Steps on Your iPhone:${NC}"
echo ""
echo "1. If you see 'Untrusted Developer' when opening the app:"
echo "   Settings → General → VPN & Device Management"
echo "   → Tap 'Yoraa Apparels Private Limited'"
echo "   → Tap 'Trust'"
echo ""
echo "2. Open the Yoraa app and start testing!"
echo ""
