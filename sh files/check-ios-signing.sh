#!/bin/bash

# iOS Signing Diagnostic Script
# This script will check your current signing setup and identify issues

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 iOS Signing & Certificate Diagnostic Tool${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check 1: Apple ID and Xcode Accounts
echo -e "${YELLOW}📋 1. Checking Xcode Accounts...${NC}"
xcodebuild -showBuildSettings -workspace ios/Yoraa.xcworkspace -scheme YoraaApp | grep -E "DEVELOPMENT_TEAM|CODE_SIGN_IDENTITY" | head -5

echo ""

# Check 2: Available Code Signing Identities
echo -e "${YELLOW}🔑 2. Available Code Signing Identities...${NC}"
security find-identity -v -p codesigning | grep -E "Apple Development|Apple Distribution|iPhone Developer|iPhone Distribution"

echo ""

# Check 3: Provisioning Profiles
echo -e "${YELLOW}📄 3. Installed Provisioning Profiles...${NC}"
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILES_DIR" ]; then
    echo "Found $(ls "$PROFILES_DIR"/*.mobileprovision 2>/dev/null | wc -l) provisioning profiles"
    
    # Show relevant profiles for Yoraa
    for profile in "$PROFILES_DIR"/*.mobileprovision; do
        if [ -f "$profile" ]; then
            APP_ID=$(security cms -D -i "$profile" 2>/dev/null | plutil -extract Entitlements.application-identifier raw -)
            TEAM_ID=$(security cms -D -i "$profile" 2>/dev/null | plutil -extract TeamIdentifier.0 raw -)
            PROFILE_NAME=$(security cms -D -i "$profile" 2>/dev/null | plutil -extract Name raw -)
            
            if [[ "$APP_ID" == *"yoraa"* ]] || [[ "$TEAM_ID" == "UX6XB9FMNN" ]]; then
                echo -e "${GREEN}✅ $PROFILE_NAME${NC}"
                echo "   App ID: $APP_ID"
                echo "   Team: $TEAM_ID"
                echo ""
            fi
        fi
    done
else
    echo -e "${RED}❌ No provisioning profiles directory found${NC}"
fi

echo ""

# Check 4: Connected Devices
echo -e "${YELLOW}📱 4. Connected iOS Devices...${NC}"
xcrun xctrace list devices | grep -E "iPhone|iPad" | grep -v "Simulator"

echo ""

# Check 5: Bundle Identifier Check
echo -e "${YELLOW}📦 5. Bundle Identifier Configuration...${NC}"
if [ -f "ios/YoraaApp/Info.plist" ]; then
    BUNDLE_ID=$(plutil -extract CFBundleIdentifier raw - < ios/YoraaApp/Info.plist)
    echo "Current Bundle ID: $BUNDLE_ID"
    
    if [ "$BUNDLE_ID" = "com.yoraaapparelsprivatelimited.yoraa" ]; then
        echo -e "${GREEN}✅ Bundle ID is correct${NC}"
    else
        echo -e "${RED}❌ Bundle ID mismatch! Expected: com.yoraaapparelsprivatelimited.yoraa${NC}"
    fi
else
    echo -e "${RED}❌ Info.plist not found${NC}"
fi

echo ""

# Check 6: Xcode Project Settings
echo -e "${YELLOW}⚙️ 6. Xcode Project Signing Settings...${NC}"
cd ios
xcodebuild -showBuildSettings -workspace Yoraa.xcworkspace -scheme YoraaApp -configuration Debug | grep -E "CODE_SIGN|DEVELOPMENT_TEAM|PRODUCT_BUNDLE_IDENTIFIER" | sort | uniq

echo ""

# Check 7: Entitlements File
echo -e "${YELLOW}📋 7. Entitlements Configuration...${NC}"
if [ -f "YoraaApp/YoraaApp.entitlements" ]; then
    echo "Entitlements file exists:"
    cat YoraaApp/YoraaApp.entitlements
else
    echo -e "${RED}❌ Entitlements file not found${NC}"
fi

cd ..

echo ""

# Summary and Recommendations
echo -e "${BLUE}📋 Summary & Recommendations:${NC}"
echo "============================================"

echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. If you see 'No matching provisioning profiles', create one in Apple Developer Console"
echo "2. If certificates are missing, generate new ones in Apple Developer Console"
echo "3. Make sure Rithik's iPhone is registered in your developer account"
echo "4. Verify team ID 'UX6XB9FMNN' is correct in Xcode project settings"

echo ""
echo -e "${GREEN}📖 For detailed instructions, see: iOS-Signing-Setup-Guide.md${NC}"

echo ""
echo -e "${BLUE}🚀 To try building after fixes:${NC}"
echo "npx react-native run-ios --device \"rithiks iPhone\""
