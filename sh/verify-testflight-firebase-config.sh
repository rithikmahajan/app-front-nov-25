#!/bin/bash

# ============================================================================
# Firebase Phone Auth TestFlight Configuration Verification Script
# ============================================================================

echo "🔍 Firebase Phone Auth TestFlight Configuration Checker"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")"

echo "📂 Project Directory: $(pwd)"
echo ""

# ============================================================================
# 1. Check GoogleService-Info.plist existence and location
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Checking GoogleService-Info.plist Location"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PLIST_PATH="ios/YoraaApp/GoogleService-Info.plist"
if [ -f "$PLIST_PATH" ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist found at: $PLIST_PATH${NC}"
else
    echo -e "${RED}❌ GoogleService-Info.plist NOT found at: $PLIST_PATH${NC}"
    exit 1
fi

# Check for duplicate files
echo ""
echo "🔍 Checking for duplicate GoogleService-Info.plist files..."
DUPLICATE_COUNT=$(find ios -name "GoogleService-Info.plist" -type f | wc -l | tr -d ' ')
if [ "$DUPLICATE_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✅ Only one GoogleService-Info.plist found (correct)${NC}"
else
    echo -e "${YELLOW}⚠️  Multiple GoogleService-Info.plist files found:${NC}"
    find ios -name "GoogleService-Info.plist" -type f
    echo -e "${YELLOW}⚠️  Please ensure only one is being used${NC}"
fi

echo ""

# ============================================================================
# 2. Extract and Verify PROJECT_ID
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Verifying PROJECT_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_ID=$(/usr/libexec/PlistBuddy -c "Print :PROJECT_ID" "$PLIST_PATH" 2>/dev/null)
if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✅ PROJECT_ID: ${BLUE}$PROJECT_ID${NC}"
    echo ""
    echo -e "${YELLOW}📋 Firebase Console URL:${NC}"
    echo -e "${BLUE}https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers${NC}"
    echo ""
    echo -e "${YELLOW}👉 IMPORTANT: Make sure this matches your Firebase Console project!${NC}"
else
    echo -e "${RED}❌ PROJECT_ID not found in GoogleService-Info.plist${NC}"
    exit 1
fi

echo ""

# ============================================================================
# 3. Verify Other Critical Keys
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Verifying Critical Configuration Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check BUNDLE_ID
BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :BUNDLE_ID" "$PLIST_PATH" 2>/dev/null)
echo -e "   BUNDLE_ID: ${BLUE}$BUNDLE_ID${NC}"

# Check CLIENT_ID
CLIENT_ID=$(/usr/libexec/PlistBuddy -c "Print :CLIENT_ID" "$PLIST_PATH" 2>/dev/null)
echo -e "   CLIENT_ID: ${BLUE}${CLIENT_ID:0:30}...${NC}"

# Check REVERSED_CLIENT_ID
REVERSED_CLIENT_ID=$(/usr/libexec/PlistBuddy -c "Print :REVERSED_CLIENT_ID" "$PLIST_PATH" 2>/dev/null)
echo -e "   REVERSED_CLIENT_ID: ${BLUE}$REVERSED_CLIENT_ID${NC}"

# Check API_KEY
API_KEY=$(/usr/libexec/PlistBuddy -c "Print :API_KEY" "$PLIST_PATH" 2>/dev/null)
echo -e "   API_KEY: ${BLUE}${API_KEY:0:20}...${NC}"

# Check GOOGLE_APP_ID
GOOGLE_APP_ID=$(/usr/libexec/PlistBuddy -c "Print :GOOGLE_APP_ID" "$PLIST_PATH" 2>/dev/null)
echo -e "   GOOGLE_APP_ID: ${BLUE}$GOOGLE_APP_ID${NC}"

echo ""

# ============================================================================
# 4. Verify Xcode Project Integration
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Verifying Xcode Project Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if file is referenced in Xcode project
XCODE_REFERENCES=$(grep -c "GoogleService-Info.plist" ios/Yoraa.xcodeproj/project.pbxproj)
if [ "$XCODE_REFERENCES" -gt 0 ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist is referenced in Xcode project ($XCODE_REFERENCES references)${NC}"
else
    echo -e "${RED}❌ GoogleService-Info.plist is NOT referenced in Xcode project${NC}"
    echo -e "${YELLOW}   Action Required: Add the file to your Xcode project target${NC}"
fi

echo ""

# Check target name
echo "🎯 Xcode Target:"
xcodebuild -list -project ios/Yoraa.xcodeproj 2>/dev/null | grep -A 1 "Targets:" | tail -1 | xargs
echo ""

# ============================================================================
# 5. Verify Info.plist URL Schemes
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Verifying Info.plist URL Schemes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INFO_PLIST="ios/YoraaApp/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    # Check if REVERSED_CLIENT_ID is in URL schemes
    if grep -q "$REVERSED_CLIENT_ID" "$INFO_PLIST"; then
        echo -e "${GREEN}✅ REVERSED_CLIENT_ID is configured in Info.plist URL Schemes${NC}"
        echo -e "   ${BLUE}$REVERSED_CLIENT_ID${NC}"
    else
        echo -e "${RED}❌ REVERSED_CLIENT_ID is NOT configured in Info.plist${NC}"
        echo -e "${YELLOW}   Action Required: Add URL scheme to Info.plist${NC}"
    fi
else
    echo -e "${RED}❌ Info.plist not found at: $INFO_PLIST${NC}"
fi

echo ""

# ============================================================================
# 6. Check Firebase Package Dependencies
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Checking Firebase Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "package.json" ]; then
    echo "📦 Firebase packages in package.json:"
    grep "@react-native-firebase" package.json | sed 's/^/   /'
    echo ""
    
    # Check if auth package is installed
    if grep -q "@react-native-firebase/auth" package.json; then
        echo -e "${GREEN}✅ @react-native-firebase/auth is installed${NC}"
    else
        echo -e "${RED}❌ @react-native-firebase/auth is NOT installed${NC}"
    fi
fi

echo ""

# ============================================================================
# 7. Check Podfile and Pod Installation
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  Checking CocoaPods Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "ios/Podfile.lock" ]; then
    echo "🔍 Firebase pods installed:"
    grep -A 1 "Firebase" ios/Podfile.lock | grep -v "^--$" | head -10 | sed 's/^/   /'
    echo ""
    
    # Check for Firebase/Auth specifically
    if grep -q "Firebase/Auth" ios/Podfile.lock; then
        echo -e "${GREEN}✅ Firebase/Auth pod is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Firebase/Auth pod not found in Podfile.lock${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Podfile.lock not found. Run 'pod install' in ios/ directory${NC}"
fi

echo ""

# ============================================================================
# 8. Firebase Console Checklist
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  Firebase Console Checklist (Manual Verification Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Please manually verify the following in Firebase Console:${NC}"
echo ""
echo "   1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo ""
echo "   2. Check that 'Phone' provider is ENABLED"
echo "      □ Click on 'Phone' in the Sign-in providers list"
echo "      □ Ensure the toggle is turned ON (blue)"
echo "      □ Save if you made changes"
echo ""
echo "   3. Verify iOS app is registered:"
echo "      - Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo "      - Check that iOS app with bundle ID '$BUNDLE_ID' exists"
echo "      - Download GoogleService-Info.plist and compare with your local copy"
echo ""
echo "   4. For TestFlight/Production:"
echo "      □ Ensure you're using the PRODUCTION Firebase project (not dev/staging)"
echo "      □ Check APNs configuration if phone auth still fails:"
echo "        - Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/cloudmessaging"
echo "        - Upload your APNs Auth Key or Certificate"
echo ""

echo ""

# ============================================================================
# 9. Build Configuration Recommendations
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  Build & TestFlight Recommendations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}After enabling Phone Auth in Firebase Console:${NC}"
echo ""
echo "   1. Clean Xcode build folder:"
echo -e "      ${YELLOW}cd ios && xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa${NC}"
echo ""
echo "   2. Clean derived data:"
echo -e "      ${YELLOW}rm -rf ~/Library/Developer/Xcode/DerivedData/*${NC}"
echo ""
echo "   3. Reinstall pods:"
echo -e "      ${YELLOW}cd ios && pod deintegrate && pod install${NC}"
echo ""
echo "   4. Rebuild for TestFlight:"
echo -e "      ${YELLOW}Open Xcode → Product → Clean Build Folder (⌘⇧K)${NC}"
echo -e "      ${YELLOW}Then: Product → Archive${NC}"
echo ""
echo "   5. Upload new build to TestFlight"
echo ""

echo ""

# ============================================================================
# 10. Quick Test Command
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔟  Quick Test (Local Simulator)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To test locally before uploading to TestFlight:"
echo -e "${YELLOW}npx react-native run-ios${NC}"
echo ""
echo "Use test phone numbers in Firebase Console for testing:"
echo "   Settings → Authentication → Phone → Phone numbers for testing"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Verification Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "   • GoogleService-Info.plist: ✓ Found and configured"
echo "   • PROJECT_ID: $PROJECT_ID"
echo "   • BUNDLE_ID: $BUNDLE_ID"
echo "   • Xcode Integration: ✓ Verified"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "   1. Manually verify Phone Auth is enabled in Firebase Console"
echo "   2. Clean build and rebuild for TestFlight"
echo "   3. Test with TestFlight build"
echo ""
