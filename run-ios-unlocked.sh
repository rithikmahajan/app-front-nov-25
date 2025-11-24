#!/bin/bash

# iOS Simulator Auto-Unlock & Launch Script
# This script ensures the simulator is unlocked before launching your app

set -e

echo "🚀 Starting iOS build process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if simulator is running
echo -e "${BLUE}📱 Checking simulator status...${NC}"
BOOTED_DEVICE=$(xcrun simctl list devices | grep Booted || echo "")

if [ -z "$BOOTED_DEVICE" ]; then
    echo -e "${YELLOW}⚠️  No simulator running. Starting default simulator...${NC}"
    open -a Simulator
    sleep 5
else
    echo -e "${GREEN}✅ Simulator is running${NC}"
fi

# Step 2: Unlock the simulator
echo -e "${BLUE}🔓 Unlocking simulator...${NC}"
osascript -e 'tell application "Simulator" to activate' \
          -e 'tell application "System Events" to keystroke "l" using command down' 2>/dev/null || true

# Give it a moment to unlock
sleep 1

# Step 3: Wake up the simulator (set appearance to trigger UI update)
xcrun simctl ui booted appearance light 2>/dev/null || true

echo -e "${GREEN}✅ Simulator unlocked${NC}"
echo ""

# Step 4: Launch the app
echo -e "${BLUE}🚀 Launching React Native app...${NC}"
echo ""

npx react-native run-ios

echo ""
echo -e "${GREEN}✅ Done!${NC}"
