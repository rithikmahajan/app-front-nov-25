#!/bin/bash

# 🔐 reCAPTCHA Configuration Rebuild Script
# Run this AFTER you've configured the site keys in Firebase Console

set -e  # Exit on error

echo "════════════════════════════════════════════════════════"
echo "  🔐 reCAPTCHA Reconfiguration Rebuild Script"
echo "════════════════════════════════════════════════════════"
echo ""
echo "This script will rebuild your iOS and Android apps"
echo "with the new reCAPTCHA configuration."
echo ""
echo "Your reCAPTCHA Keys:"
echo "  iOS:     6Lc5t-UrAAAAANbZi1nLmgC8E426zp-gF5CKLIkt"
echo "  Android: 6LfV0uUrAAAAALtIIPs9vd2uSEExW8L3isMybRL_"
echo ""
echo "Your Bundle IDs:"
echo "  iOS:     com.yoraaapparelsprivatelimited.yoraa"
echo "  Android: com.yoraapparelsprivatelimited.yoraa"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  IMPORTANT: Have you configured the site keys in Firebase Console?${NC}"
echo ""
echo "You need to:"
echo "  1. Go to Firebase Console → Authentication → Settings"
echo "  2. Click 'Configure site keys'"
echo "  3. Add iOS platform with the iOS key and bundle ID"
echo "  4. Add Android platform with the Android key and package name"
echo "  5. Click Save"
echo ""
read -p "Have you completed the Firebase Console configuration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Please complete the Firebase Console configuration first!${NC}"
    echo "See FIREBASE_CONSOLE_SETUP_VISUAL_GUIDE.md for detailed instructions."
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Great! Starting rebuild process...${NC}"
echo ""

# Ask which platform to rebuild
echo "Which platform do you want to rebuild?"
echo "  1) iOS only"
echo "  2) Android only"
echo "  3) Both"
read -p "Enter choice (1-3): " platform_choice

# Function to rebuild iOS
rebuild_ios() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  📱 Rebuilding iOS${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${YELLOW}[1/6] Cleaning iOS build...${NC}"
    cd ios
    rm -rf build
    rm -rf Pods
    rm -rf Podfile.lock
    rm -rf ~/Library/Developer/Xcode/DerivedData/Yoraa-* 2>/dev/null || true
    echo -e "${GREEN}✓ iOS build cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[2/6] Installing CocoaPods...${NC}"
    pod install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error: Pod install failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Pods installed${NC}"
    
    cd ..
    
    echo ""
    echo -e "${YELLOW}[3/6] Cleaning watchman...${NC}"
    watchman watch-del-all 2>/dev/null || true
    echo -e "${GREEN}✓ Watchman cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[4/6] Cleaning React Native cache...${NC}"
    rm -rf $TMPDIR/react-* 2>/dev/null || true
    rm -rf $TMPDIR/metro-* 2>/dev/null || true
    echo -e "${GREEN}✓ RN cache cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[5/6] Starting Metro bundler...${NC}"
    npx react-native start --reset-cache &
    METRO_PID=$!
    sleep 5
    echo -e "${GREEN}✓ Metro started (PID: $METRO_PID)${NC}"
    
    echo ""
    echo -e "${YELLOW}[6/6] Building iOS app...${NC}"
    echo -e "${BLUE}This may take a few minutes...${NC}"
    npx react-native run-ios
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✓ iOS build successful!${NC}"
        echo -e "${GREEN}════════════════════════════════════════${NC}"
    else
        echo ""
        echo -e "${RED}════════════════════════════════════════${NC}"
        echo -e "${RED}  ❌ iOS build failed${NC}"
        echo -e "${RED}════════════════════════════════════════${NC}"
        exit 1
    fi
}

# Function to rebuild Android
rebuild_android() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🤖 Rebuilding Android${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${YELLOW}[1/5] Cleaning Android build...${NC}"
    cd android
    ./gradlew clean
    cd ..
    echo -e "${GREEN}✓ Android build cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[2/5] Cleaning watchman...${NC}"
    watchman watch-del-all 2>/dev/null || true
    echo -e "${GREEN}✓ Watchman cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[3/5] Cleaning React Native cache...${NC}"
    rm -rf $TMPDIR/react-* 2>/dev/null || true
    rm -rf $TMPDIR/metro-* 2>/dev/null || true
    echo -e "${GREEN}✓ RN cache cleaned${NC}"
    
    echo ""
    echo -e "${YELLOW}[4/5] Starting Metro bundler...${NC}"
    npx react-native start --reset-cache &
    METRO_PID=$!
    sleep 5
    echo -e "${GREEN}✓ Metro started (PID: $METRO_PID)${NC}"
    
    echo ""
    echo -e "${YELLOW}[5/5] Building Android app...${NC}"
    echo -e "${BLUE}This may take a few minutes...${NC}"
    npx react-native run-android
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✓ Android build successful!${NC}"
        echo -e "${GREEN}════════════════════════════════════════${NC}"
    else
        echo ""
        echo -e "${RED}════════════════════════════════════════${NC}"
        echo -e "${RED}  ❌ Android build failed${NC}"
        echo -e "${RED}════════════════════════════════════════${NC}"
        exit 1
    fi
}

# Execute based on choice
case $platform_choice in
    1)
        rebuild_ios
        ;;
    2)
        rebuild_android
        ;;
    3)
        rebuild_ios
        echo ""
        echo -e "${BLUE}Press Enter to continue with Android build...${NC}"
        read
        rebuild_android
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Rebuild Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open the app on your device/simulator"
echo "  2. Navigate to Phone Login"
echo "  3. Enter a phone number"
echo "  4. Check that you DON'T see the 'reCAPTCHA SDK not linked' error"
echo "  5. Verify that OTP is sent successfully"
echo ""
echo -e "${BLUE}If you still see errors:${NC}"
echo "  • Double-check Firebase Console configuration"
echo "  • Verify bundle IDs match exactly"
echo "  • See FIREBASE_CONSOLE_SETUP_VISUAL_GUIDE.md"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
echo ""
