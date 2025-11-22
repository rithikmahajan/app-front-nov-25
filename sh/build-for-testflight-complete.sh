#!/bin/bash

# ============================================================================
# Complete TestFlight Build Script
# Run this after enabling Phone Auth in Firebase Console
# ============================================================================

echo "🚀 TestFlight Build Process for Yoraa App"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")"

echo -e "${YELLOW}⚠️  IMPORTANT: Before running this script, ensure:${NC}"
echo "   1. Phone authentication is ENABLED in Firebase Console"
echo "   2. APNs is configured (for production)"
echo "   3. You've saved all your code changes"
echo ""
read -p "Have you completed the above steps? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please complete the Firebase Console configuration first.${NC}"
    echo "Run: ./open-firebase-console.sh"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Cleaning Build Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean derived data
echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo -e "${GREEN}✅ Derived data cleaned${NC}"
echo ""

# Clean build folder
echo "🧹 Cleaning Xcode build folder..."
cd ios
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null
echo -e "${GREEN}✅ Build folder cleaned${NC}"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Reinstalling CocoaPods"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 Deintegrating pods..."
pod deintegrate
echo ""

echo "📦 Installing fresh pods..."
pod install
echo -e "${GREEN}✅ Pods installed${NC}"
echo ""

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Quick verification
echo "🔍 Verifying GoogleService-Info.plist..."
if [ -f "ios/YoraaApp/GoogleService-Info.plist" ]; then
    PROJECT_ID=$(/usr/libexec/PlistBuddy -c "Print :PROJECT_ID" "ios/YoraaApp/GoogleService-Info.plist" 2>/dev/null)
    echo -e "${GREEN}✅ GoogleService-Info.plist found${NC}"
    echo -e "   PROJECT_ID: ${BLUE}$PROJECT_ID${NC}"
else
    echo -e "${RED}❌ GoogleService-Info.plist not found!${NC}"
    exit 1
fi
echo ""

echo "🔍 Verifying Firebase dependencies..."
if grep -q "@react-native-firebase/auth" package.json; then
    echo -e "${GREEN}✅ Firebase Auth dependency found${NC}"
else
    echo -e "${RED}❌ Firebase Auth dependency not found!${NC}"
    exit 1
fi
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Opening Xcode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}Opening Xcode workspace...${NC}"
cd ios
open Yoraa.xcworkspace
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Build Environment Ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 Next Steps in Xcode:${NC}"
echo ""
echo "   1. Wait for Xcode to index the project"
echo ""
echo "   2. Select build destination:"
echo "      → Click on device selector at top"
echo "      → Choose 'Any iOS Device (arm64)'"
echo ""
echo "   3. Clean build folder:"
echo "      → Menu: Product → Clean Build Folder (⌘⇧K)"
echo ""
echo "   4. Create Archive:"
echo "      → Menu: Product → Archive"
echo "      → Wait for build to complete (may take 5-10 minutes)"
echo ""
echo "   5. Distribute to TestFlight:"
echo "      → In Organizer window, click 'Distribute App'"
echo "      → Select 'App Store Connect'"
echo "      → Follow prompts to upload"
echo ""
echo "   6. In App Store Connect:"
echo "      → Go to https://appstoreconnect.apple.com"
echo "      → Navigate to your app → TestFlight"
echo "      → Wait for build to process"
echo "      → Add to test group"
echo ""
echo -e "${BLUE}🔗 Firebase Console (verify settings):${NC}"
echo "   https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers"
echo ""
echo -e "${GREEN}Good luck with your TestFlight build! 🚀${NC}"
echo ""
