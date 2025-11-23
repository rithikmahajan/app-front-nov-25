#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        🔍 PHONE AUTH ISSUE DIAGNOSTIC TOOL                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ CONFIGURATION VERIFICATION:${NC}"
echo ""
echo -e "${BLUE}1. Package Name (build.gradle):${NC}"
grep "applicationId" android/app/build.gradle | head -1
echo ""

echo -e "${BLUE}2. App ID (google-services.json):${NC}"
cat android/app/google-services.json | grep "mobilesdk_app_id" | head -1
echo ""

echo -e "${BLUE}3. Package Name (google-services.json):${NC}"
cat android/app/google-services.json | grep "package_name" | head -1
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${CYAN}📱 WHICH BUILD ARE YOU TESTING?${NC}"
echo ""
echo "This is CRITICAL to diagnose the issue:"
echo ""
echo "1️⃣  Debug Build (Emulator/Local Device)"
echo "   - Should work WITHOUT SHA certificates"
echo "   - App verification disabled in code"
echo ""
echo "2️⃣  Release Build (Local - not from Play Store)"
echo "   - Needs upload-keystore.jks SHA in Firebase"
echo "   - Build with: ./gradlew assembleRelease"
echo ""
echo "3️⃣  Production Build (From Play Store)"
echo "   - Needs Play Console SHA in Firebase"
echo "   - Play Console re-signs the app!"
echo ""

PS3='Select the build type you are testing: '
options=("Debug Build (Emulator)" "Release Build (Local)" "Production Build (Play Store)" "I don't know" "Exit")

select opt in "${options[@]}"
do
    case $opt in
        "Debug Build (Emulator)")
            echo ""
            echo -e "${GREEN}📋 DEBUG BUILD DIAGNOSIS:${NC}"
            echo ""
            echo "For debug builds, SHA certificates are NOT needed because"
            echo "your code disables app verification:"
            echo ""
            echo -e "${BLUE}firebasePhoneAuth.js (lines 39-42):${NC}"
            echo "  if (__DEV__) {"
            echo "    auth().settings.appVerificationDisabledForTesting = true;"
            echo "  }"
            echo ""
            echo -e "${YELLOW}⚠️  If you're STILL getting the error in debug build:${NC}"
            echo ""
            echo "Possible causes:"
            echo "  1. You're running RELEASE build by mistake"
            echo "  2. Metro bundler is serving old cached code"
            echo "  3. Different Firebase error (not SHA-related)"
            echo ""
            echo -e "${CYAN}🛠️  Solutions:${NC}"
            echo "  1. Verify it's debug build:"
            echo "     npm start -- --reset-cache"
            echo "     npx react-native run-android"
            echo ""
            echo "  2. Check logs for: '__DEV__ = true'"
            echo ""
            echo "  3. Look for the EXACT error message"
            echo ""
            break
            ;;
        "Release Build (Local)")
            echo ""
            echo -e "${GREEN}📋 RELEASE BUILD (LOCAL) DIAGNOSIS:${NC}"
            echo ""
            echo "For local release builds, you need the SHA from:"
            echo "  android/app/upload-keystore.jks"
            echo ""
            echo "Getting your release keystore SHA certificates..."
            echo ""
            
            if [ -f "android/app/upload-keystore.jks" ]; then
                echo "Enter keystore password:"
                keytool -list -v -keystore android/app/upload-keystore.jks -alias upload | grep -A 2 "Certificate fingerprints"
                echo ""
                echo -e "${CYAN}🔍 CHECK:${NC}"
                echo "  1. Do these SHA values match what's in Firebase Console?"
                echo "  2. Go to: https://console.firebase.google.com/"
                echo "  3. Find app: yoraa-android-fix"
                echo "  4. Verify BOTH SHA-1 and SHA-256 are there"
                echo ""
                echo -e "${YELLOW}If they DON'T match:${NC}"
                echo "  1. Add the CORRECT SHA to Firebase Console"
                echo "  2. Wait 15 minutes"
                echo "  3. Rebuild and test"
                echo ""
            else
                echo -e "${RED}❌ upload-keystore.jks not found!${NC}"
                echo ""
            fi
            break
            ;;
        "Production Build (Play Store)")
            echo ""
            echo -e "${GREEN}📋 PRODUCTION BUILD (PLAY STORE) DIAGNOSIS:${NC}"
            echo ""
            echo -e "${YELLOW}🚨 IMPORTANT:${NC} Google Play Console RE-SIGNS your app!"
            echo ""
            echo "This means the SHA certificate is DIFFERENT from your local keystore."
            echo ""
            echo -e "${CYAN}📍 WHERE TO FIND PLAY CONSOLE SHA:${NC}"
            echo ""
            echo "  1. Go to: https://play.google.com/console/"
            echo "  2. Select your app"
            echo "  3. Navigate to: Setup → App integrity"
            echo "  4. Find: 'App signing key certificate'"
            echo "  5. Copy the SHA-256 fingerprint"
            echo ""
            echo -e "${CYAN}📍 ADD TO FIREBASE:${NC}"
            echo ""
            echo "  1. Go to: https://console.firebase.google.com/"
            echo "  2. Select project: yoraa-android-ios"
            echo "  3. Find app: yoraa-android-fix"
            echo "  4. Click 'Add fingerprint'"
            echo "  5. Paste the Play Console SHA-256"
            echo "  6. Save"
            echo "  7. Wait 15-30 minutes for propagation"
            echo "  8. Test again"
            echo ""
            echo -e "${GREEN}✅ This is most likely your issue!${NC}"
            echo ""
            break
            ;;
        "I don't know")
            echo ""
            echo -e "${BLUE}📋 HOW TO DETERMINE BUILD TYPE:${NC}"
            echo ""
            echo "Check how you're testing the app:"
            echo ""
            echo "🔍 Debug Build:"
            echo "   - Running with: npx react-native run-android"
            echo "   - Testing on emulator or device via USB"
            echo "   - Metro bundler is running"
            echo ""
            echo "🔍 Release Build (Local):"
            echo "   - Built with: ./gradlew assembleRelease"
            echo "   - Installed APK manually from android/app/build/outputs/"
            echo "   - No Metro bundler running"
            echo ""
            echo "🔍 Production Build (Play Store):"
            echo "   - Downloaded from Google Play Store"
            echo "   - Internal testing, closed testing, or production track"
            echo "   - Installed via Play Store app"
            echo ""
            break
            ;;
        "Exit")
            echo ""
            echo "Exiting..."
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option $REPLY${NC}"
            ;;
    esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}📚 For complete diagnosis, see:${NC}"
echo "   FIREBASE_CONFIG_VERIFICATION_NOV21.md"
echo ""
