#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔍 IDENTIFY PRODUCTION CERTIFICATE - DIAGNOSTIC TOOL     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}This script will help you identify which SHA-256 certificate${NC}"
echo -e "${CYAN}your production app is using.${NC}"
echo ""

# Step 1: Get upload keystore SHA-256
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}STEP 1: Getting SHA-256 from upload-keystore.jks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f "android/app/upload-keystore.jks" ]; then
    echo -e "${RED}❌ upload-keystore.jks not found!${NC}"
    echo "Expected location: android/app/upload-keystore.jks"
    echo ""
    exit 1
fi

echo "Enter your keystore password:"
KEYSTORE_SHA256=$(keytool -list -v -keystore android/app/upload-keystore.jks -alias upload 2>&1 | grep "SHA256:" | head -1 | cut -d: -f2- | xargs)

if [ -z "$KEYSTORE_SHA256" ]; then
    echo -e "${RED}❌ Failed to get SHA-256. Wrong password or alias?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Successfully retrieved!${NC}"
echo ""
echo -e "${YELLOW}Your upload-keystore.jks SHA-256:${NC}"
echo -e "${BLUE}$KEYSTORE_SHA256${NC}"
echo ""

# Step 2: Compare with Firebase Console
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}STEP 2: Comparing with Firebase Console SHA-256s${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FIREBASE_SHA256_1="FA:C6:17:45:0C:B9:D5:7B:6F:6E:BE:7A:9C:2B:3B:9F:73:4B:7B:BA:6F:B9:0B:83:92:60:75:91:0B:3D:0E:73:DB:FB:DD:6F:C0:9B:81:32:66:79:01:83:30:9C"
FIREBASE_SHA256_2="99:C0:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3:1B:CC:74:F1:C5:94:2E:06:A7:07:67:08:9A:3F:4F"

# Convert to uppercase for comparison
KEYSTORE_SHA256_UPPER=$(echo "$KEYSTORE_SHA256" | tr '[:lower:]' '[:upper:]')

echo "Firebase Console SHA-256 #1:"
echo "$FIREBASE_SHA256_1"
echo ""
echo "Firebase Console SHA-256 #2:"
echo "$FIREBASE_SHA256_2"
echo ""

# Check if it matches
MATCH_FOUND=0

if [ "$KEYSTORE_SHA256_UPPER" = "$FIREBASE_SHA256_1" ]; then
    echo -e "${GREEN}✅ MATCH FOUND!${NC}"
    echo "Your upload-keystore.jks SHA-256 matches Firebase SHA-256 #1"
    MATCH_FOUND=1
elif [ "$KEYSTORE_SHA256_UPPER" = "$FIREBASE_SHA256_2" ]; then
    echo -e "${GREEN}✅ MATCH FOUND!${NC}"
    echo "Your upload-keystore.jks SHA-256 matches Firebase SHA-256 #2"
    MATCH_FOUND=1
else
    echo -e "${RED}❌ NO MATCH FOUND!${NC}"
    echo ""
    echo "Your upload-keystore.jks SHA-256 does NOT match either Firebase SHA-256."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}STEP 3: Diagnosis & Fix${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $MATCH_FOUND -eq 1 ]; then
    echo -e "${GREEN}🎉 GOOD NEWS: Your keystore SHA-256 IS registered in Firebase!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  But you're still getting the error, which means:${NC}"
    echo ""
    echo "You're testing a PLAY STORE build, and Google Play Console"
    echo "is re-signing your app with a DIFFERENT certificate!"
    echo ""
    echo -e "${CYAN}🔧 THE FIX:${NC}"
    echo ""
    echo "1. Go to: https://play.google.com/console/"
    echo "2. Select your app"
    echo "3. Navigate to: Setup → App integrity → App signing"
    echo "4. Find: 'App signing key certificate' section"
    echo "5. Copy the SHA-256 fingerprint (NOT the one you just checked)"
    echo "6. Go to: https://console.firebase.google.com/"
    echo "7. Select: yoraa-android-ios project"
    echo "8. Find app: yoraa-android-fix"
    echo "9. Click: 'Add fingerprint'"
    echo "10. Paste the Play Console SHA-256"
    echo "11. Wait 15 minutes for propagation"
    echo "12. Test again ✅"
    echo ""
else
    echo -e "${RED}🚨 MISMATCH DETECTED!${NC}"
    echo ""
    echo "Your upload-keystore.jks SHA-256 is NOT in Firebase Console."
    echo ""
    echo -e "${CYAN}You have TWO options:${NC}"
    echo ""
    echo -e "${GREEN}Option 1: Add your keystore SHA-256 to Firebase (RECOMMENDED)${NC}"
    echo ""
    echo "1. Copy this SHA-256:"
    echo -e "${BLUE}   $KEYSTORE_SHA256${NC}"
    echo ""
    echo "2. Go to: https://console.firebase.google.com/"
    echo "3. Select: yoraa-android-ios project"
    echo "4. Find app: yoraa-android-fix"
    echo "5. Click: 'Add fingerprint'"
    echo "6. Paste the SHA-256 above"
    echo "7. Wait 15 minutes"
    echo "8. Rebuild your production app:"
    echo "   cd android && ./gradlew clean && ./gradlew bundleRelease"
    echo "9. Test ✅"
    echo ""
    echo -e "${YELLOW}Option 2: Use Play Console SHA-256${NC}"
    echo ""
    echo "1. Go to: https://play.google.com/console/"
    echo "2. Navigate to: Setup → App integrity → App signing"
    echo "3. Copy the SHA-256 from 'App signing key certificate'"
    echo "4. Add to Firebase Console (steps same as Option 1)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}STEP 4: Additional Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Build Type Identification:"
echo ""
echo "• Debug build (emulator):    No SHA-256 check needed"
echo "• Release build (local APK): Uses upload-keystore.jks SHA-256"
echo "• Play Store build:          Uses Play Console SHA-256"
echo ""
echo "💡 If you're testing from Play Store:"
echo "   You MUST add the Play Console SHA-256 to Firebase!"
echo ""
echo "💡 If you're testing a local release build:"
echo "   Add your upload-keystore.jks SHA-256 to Firebase."
echo ""

# Save results to file
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Saving results to: production-certificate-diagnosis.txt${NC}"
echo ""

cat > production-certificate-diagnosis.txt << RESULT
╔═══════════════════════════════════════════════════════════════╗
║        PRODUCTION CERTIFICATE DIAGNOSIS RESULTS               ║
╚═══════════════════════════════════════════════════════════════╝

Date: $(date)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR UPLOAD KEYSTORE SHA-256:
$KEYSTORE_SHA256

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIREBASE CONSOLE SHA-256s:

SHA-256 #1:
$FIREBASE_SHA256_1

SHA-256 #2:
$FIREBASE_SHA256_2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULT: $(if [ $MATCH_FOUND -eq 1 ]; then echo "MATCH FOUND ✅"; else echo "NO MATCH ❌"; fi)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:

$(if [ $MATCH_FOUND -eq 1 ]; then
cat << NEXTSTEPS
Your upload-keystore SHA-256 IS in Firebase, but you're still getting
the error. This means you're testing a PLAY STORE build.

ACTION REQUIRED:
1. Get SHA-256 from Play Console → App Integrity → App signing
2. Add it to Firebase Console (yoraa-android-fix app)
3. Wait 15 minutes
4. Test again
NEXTSTEPS
else
cat << NEXTSTEPS
Your upload-keystore SHA-256 is NOT in Firebase.

ACTION REQUIRED:
Add this SHA-256 to Firebase Console:
$KEYSTORE_SHA256

Then either:
- Rebuild your app locally, OR
- Get Play Console SHA-256 and add that too
NEXTSTEPS
fi)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT

echo "Results saved! You can review it anytime."
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   🎯 SUMMARY                                  ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $MATCH_FOUND -eq 1 ]; then
    echo -e "${GREEN}✅ Your upload keystore SHA-256 is in Firebase${NC}"
    echo -e "${YELLOW}⚠️  But you need to add Play Console SHA-256 too${NC}"
    echo ""
    echo "Priority: Get Play Console SHA-256 and add to Firebase"
else
    echo -e "${RED}❌ Your upload keystore SHA-256 is NOT in Firebase${NC}"
    echo ""
    echo "Priority: Add your keystore SHA-256 to Firebase first"
fi

echo ""
