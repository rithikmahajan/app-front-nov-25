#!/bin/bash

# ============================================================================
# Fix TestFlight Error 90683 - Missing NSSpeechRecognitionUsageDescription
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

cd "$(dirname "$0")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}🔧 Fixing TestFlight Error 90683${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Error:${NC} Missing purpose string in Info.plist"
echo -e "${YELLOW}Key:${NC} NSSpeechRecognitionUsageDescription"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 1: Verifying Fix${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "NSSpeechRecognitionUsageDescription" "$INFO_PLIST"; then
    echo -e "${GREEN}✅ NSSpeechRecognitionUsageDescription found in Info.plist${NC}"
    
    # Extract the description
    DESCRIPTION=$(grep -A 1 "NSSpeechRecognitionUsageDescription" "$INFO_PLIST" | tail -1 | sed 's/<[^>]*>//g' | xargs)
    echo -e "${CYAN}Description:${NC} $DESCRIPTION"
else
    echo -e "${RED}❌ NSSpeechRecognitionUsageDescription NOT found${NC}"
    echo -e "${YELLOW}The key should have been added. Please check Info.plist manually.${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 2: Checking Other Required Keys${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check all privacy keys
REQUIRED_KEYS=(
    "NSCameraUsageDescription"
    "NSMicrophoneUsageDescription"
    "NSSpeechRecognitionUsageDescription"
    "NSPhotoLibraryUsageDescription"
    "NSPhotoLibraryAddUsageDescription"
    "NSLocationWhenInUseUsageDescription"
)

ALL_PRESENT=true

for KEY in "${REQUIRED_KEYS[@]}"; do
    if grep -q "$KEY" "$INFO_PLIST"; then
        echo -e "${GREEN}✅${NC} $KEY"
    else
        echo -e "${RED}❌${NC} $KEY ${YELLOW}(MISSING)${NC}"
        ALL_PRESENT=false
    fi
done

echo ""

if [ "$ALL_PRESENT" = true ]; then
    echo -e "${GREEN}✅ All required privacy keys are present!${NC}"
else
    echo -e "${YELLOW}⚠️  Some privacy keys are missing. This may cause issues.${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 3: Increment Build Number${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current build number
CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null)
NEW_BUILD=$((CURRENT_BUILD + 1))

echo -e "${CYAN}Current build:${NC} $CURRENT_BUILD"
echo -e "${CYAN}New build:${NC} $NEW_BUILD"
echo ""

read -p "Increment build number to $NEW_BUILD? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST"
    echo -e "${GREEN}✅ Build number updated to $NEW_BUILD${NC}"
else
    echo -e "${YELLOW}⚠️  Build number NOT changed (still $CURRENT_BUILD)${NC}"
    echo -e "${YELLOW}   You'll need to manually increment it before uploading${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Step 4: Clean Build Environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Derived data cleaned${NC}"
echo ""

echo "🧹 Cleaning iOS build folder..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null || true
echo -e "${GREEN}✅ Build folder cleaned${NC}"
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Fix Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}${BOLD}Next Steps:${NC}"
echo ""
echo "1. Open Xcode:"
echo -e "   ${YELLOW}open ios/Yoraa.xcworkspace${NC}"
echo ""
echo "2. Create new archive:"
echo "   • Product → Clean Build Folder (⌘⇧K)"
echo "   • Product → Archive"
echo ""
echo "3. Distribute to TestFlight:"
echo "   • Organizer → Distribute App"
echo "   • Upload to App Store Connect"
echo ""
echo -e "${GREEN}The error should now be resolved! 🎉${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
