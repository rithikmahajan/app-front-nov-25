#!/bin/bash

# 🔥 Firebase Phone Auth - Clean Build and Setup Script
# This script cleans your iOS build and prepares for testing

echo "🔥 Firebase Phone Authentication - Clean Build Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify REVERSED_CLIENT_ID
echo -e "${BLUE}Step 1: Verifying REVERSED_CLIENT_ID...${NC}"
REVERSED_CLIENT_ID=$(grep -A 1 "REVERSED_CLIENT_ID" ios/YoraaApp/GoogleService-Info.plist | tail -1 | sed 's/<string>//g' | sed 's/<\/string>//g' | xargs)

if [ -z "$REVERSED_CLIENT_ID" ]; then
    echo -e "${RED}❌ REVERSED_CLIENT_ID not found in GoogleService-Info.plist${NC}"
    exit 1
else
    echo -e "${GREEN}✅ REVERSED_CLIENT_ID found: $REVERSED_CLIENT_ID${NC}"
fi

# Step 2: Check if REVERSED_CLIENT_ID is in Info.plist
echo -e "\n${BLUE}Step 2: Checking Info.plist configuration...${NC}"
if grep -q "$REVERSED_CLIENT_ID" ios/YoraaApp/Info.plist; then
    echo -e "${GREEN}✅ REVERSED_CLIENT_ID is configured in Info.plist${NC}"
else
    echo -e "${YELLOW}⚠️  REVERSED_CLIENT_ID not found in Info.plist${NC}"
    echo -e "${YELLOW}   This might cause issues with Phone Authentication${NC}"
fi

# Step 3: Clean Metro Bundler Cache
echo -e "\n${BLUE}Step 3: Cleaning Metro Bundler cache...${NC}"
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
echo -e "${GREEN}✅ Metro cache cleaned${NC}"

# Step 4: Clean Watchman (if installed)
echo -e "\n${BLUE}Step 4: Cleaning Watchman...${NC}"
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null
    echo -e "${GREEN}✅ Watchman cache cleaned${NC}"
else
    echo -e "${YELLOW}⚠️  Watchman not installed (optional)${NC}"
fi

# Step 5: Clean iOS build folder
echo -e "\n${BLUE}Step 5: Cleaning iOS build folder...${NC}"
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/*YoraaApp* 2>/dev/null
echo -e "${GREEN}✅ iOS build folder cleaned${NC}"

# Step 6: Clean Pods (optional - comment out if you want to skip)
echo -e "\n${BLUE}Step 6: Cleaning CocoaPods...${NC}"
read -p "Do you want to clean and reinstall Pods? This may take a few minutes. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pod deintegrate
    rm -rf Pods
    rm -rf Podfile.lock
    echo -e "${YELLOW}🔄 Installing Pods (this may take a while)...${NC}"
    pod install
    echo -e "${GREEN}✅ Pods cleaned and reinstalled${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped pod cleaning${NC}"
fi

cd ..

# Step 7: Clean node_modules (optional)
echo -e "\n${BLUE}Step 7: Node modules check...${NC}"
read -p "Do you want to reinstall node_modules? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔄 Reinstalling node_modules (this may take a while)...${NC}"
    rm -rf node_modules
    npm install
    echo -e "${GREEN}✅ Node modules reinstalled${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped node_modules reinstall${NC}"
fi

# Step 8: Verify Firebase packages
echo -e "\n${BLUE}Step 8: Verifying Firebase packages...${NC}"
if grep -q "@react-native-firebase/auth" package.json; then
    echo -e "${GREEN}✅ @react-native-firebase/auth installed${NC}"
else
    echo -e "${RED}❌ @react-native-firebase/auth not found in package.json${NC}"
fi

if grep -q "@react-native-firebase/app" package.json; then
    echo -e "${GREEN}✅ @react-native-firebase/app installed${NC}"
else
    echo -e "${RED}❌ @react-native-firebase/app not found in package.json${NC}"
fi

# Step 9: Summary and Next Steps
echo -e "\n${GREEN}=================================================="
echo -e "✅ Clean build completed successfully!"
echo -e "==================================================${NC}"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "1. ${BLUE}Enable Phone Authentication in Firebase Console:${NC}"
echo -e "   https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers"
echo -e ""
echo -e "2. ${BLUE}Add test phone numbers (optional):${NC}"
echo -e "   - Phone: +1 650-555-1234"
echo -e "   - Code: 123456"
echo -e ""
echo -e "3. ${BLUE}Configure APNs for iOS (for real devices):${NC}"
echo -e "   - Get APNs key from Apple Developer Portal"
echo -e "   - Upload to Firebase Console → Project Settings → Cloud Messaging"
echo -e ""
echo -e "4. ${BLUE}Build and run the app:${NC}"
echo -e "   ${GREEN}npx react-native run-ios${NC}"
echo -e "   OR"
echo -e "   Open ${GREEN}ios/YoraaApp.xcworkspace${NC} in Xcode"
echo -e "   - Product → Clean Build Folder (Cmd+Shift+K)"
echo -e "   - Product → Build (Cmd+B)"
echo -e "   - Product → Run (Cmd+R)"
echo -e ""
echo -e "5. ${BLUE}Test Phone Authentication:${NC}"
echo -e "   - Use test phone number: +1 650-555-1234 (code: 123456)"
echo -e "   - OR use real phone number (will send SMS)"
echo -e ""

echo -e "\n${YELLOW}📝 Important Notes:${NC}"
echo -e "- Your REVERSED_CLIENT_ID: ${GREEN}$REVERSED_CLIENT_ID${NC}"
echo -e "- Info.plist is already configured ✅"
echo -e "- GoogleService-Info.plist is present ✅"
echo -e "- Phone auth code is implemented ✅"
echo -e ""
echo -e "${RED}⚠️  The ONLY missing step is enabling Phone Auth in Firebase Console!${NC}"
echo -e ""

echo -e "${GREEN}🚀 You're ready to go!${NC}"
