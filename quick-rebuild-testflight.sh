#!/bin/bash

# ============================================================================
# Quick Rebuild for TestFlight - After Fixing Error 90683
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

cd "$(dirname "$0")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🚀 Quick Rebuild for TestFlight${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current build number
CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/YoraaApp/Info.plist 2>/dev/null)
echo -e "${BLUE}Current build number:${NC} $CURRENT_BUILD"
echo ""

# Calculate next build
if [ "$CURRENT_BUILD" -lt 56 ]; then
    NEW_BUILD=56
else
    NEW_BUILD=$((CURRENT_BUILD + 1))
fi

echo -e "${YELLOW}Recommended new build:${NC} $NEW_BUILD"
echo ""

read -p "Update build number to $NEW_BUILD? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" ios/YoraaApp/Info.plist
    echo -e "${GREEN}✅ Build number updated: $CURRENT_BUILD → $NEW_BUILD${NC}"
else
    echo -e "${YELLOW}⚠️  Keeping build number: $CURRENT_BUILD${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Cleaning Build Environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Done${NC}"
echo ""

echo "🧹 Cleaning iOS build..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null || true
cd ..
echo -e "${GREEN}✅ Done${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Ready to Build!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Opening Xcode...${NC}"
open ios/Yoraa.xcworkspace
echo ""
echo -e "${YELLOW}In Xcode:${NC}"
echo "  1. Select: Any iOS Device (arm64)"
echo "  2. Product → Clean Build Folder (⌘⇧K)"
echo "  3. Product → Archive"
echo "  4. Distribute → App Store Connect"
echo ""
echo -e "${GREEN}Good luck! 🎉${NC}"
echo ""
