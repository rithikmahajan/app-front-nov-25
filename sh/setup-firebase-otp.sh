#!/bin/bash

# 🚀 Quick Firebase Console Setup Guide
# Follow these steps to enable OTP in production

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     🔥 Firebase Phone Auth Production Setup                    ║"
echo "║     Follow these steps to enable OTP on production devices     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}Your Production Certificates:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}SHA-1:${NC}   84:87:D6:1D:E8:14:57:29:D9:86:9C:44:75:35:35:47:7D:E4:7D:2F"
echo -e "${GREEN}SHA-256:${NC} 99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3"
echo ""

echo -e "${BOLD}Package Name:${NC} com.yoraa"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to wait for user
wait_for_user() {
    echo ""
    read -p "Press ENTER when completed..."
    echo ""
}

# Step 1
echo -e "${CYAN}${BOLD}STEP 1: Add SHA-256 to Firebase Console${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open this link in your browser:"
echo -e "   ${YELLOW}https://console.firebase.google.com/project/yoraa-android-ios/settings/general${NC}"
echo ""
echo "2. Scroll down and click on your Android app (com.yoraa)"
echo ""
echo "3. Scroll to 'SHA certificate fingerprints' section"
echo ""
echo "4. Click 'Add fingerprint' button"
echo ""
echo "5. Copy and paste this SHA-256:"
echo -e "   ${GREEN}99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3${NC}"
echo ""
echo "6. Click 'Save'"
echo ""

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
    echo "99:C9:B4:D5:D5:56:2F:C5:0D:30:95:D2:96:9A:15:A7:4B:10:CC:14:7F:C5:34:2E:9B:A7:B7:67:D8:9A:3F:D3" | pbcopy
    echo -e "${GREEN}✅ SHA-256 copied to clipboard!${NC}"
    echo ""
fi

wait_for_user

# Step 2
echo -e "${CYAN}${BOLD}STEP 2: Enable Android Device Verification API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open this link in your browser:"
echo -e "   ${YELLOW}https://console.cloud.google.com/apis/library${NC}"
echo ""
echo "2. Make sure 'yoraa-android-ios' project is selected (top left)"
echo ""
echo "3. In the search bar, type: 'Android Device Verification API'"
echo ""
echo "4. Click on the API in the results"
echo ""
echo "5. Click the 'ENABLE' button"
echo ""
echo "6. Wait for confirmation"
echo ""

wait_for_user

# Step 3
echo -e "${CYAN}${BOLD}STEP 3: Verify Phone Authentication is Enabled${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open this link in your browser:"
echo -e "   ${YELLOW}https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers${NC}"
echo ""
echo "2. Check if 'Phone' provider is ENABLED"
echo ""
echo "3. If disabled, click on it and enable it"
echo ""
echo "4. Verify your region supports Phone Authentication"
echo ""

wait_for_user

# Step 4
echo -e "${CYAN}${BOLD}STEP 4: Download Updated google-services.json${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go back to Project Settings:"
echo -e "   ${YELLOW}https://console.firebase.google.com/project/yoraa-android-ios/settings/general${NC}"
echo ""
echo "2. Scroll down to your Android app (com.yoraa)"
echo ""
echo "3. Click 'Download google-services.json' button"
echo ""
echo "4. Save the file to Downloads folder"
echo ""

wait_for_user

echo -e "${YELLOW}${BOLD}Would you like to replace the google-services.json file now?${NC}"
echo "Make sure you downloaded the file to your Downloads folder first!"
echo ""
read -p "Replace google-services.json? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Backup existing file
    if [ -f "android/app/google-services.json" ]; then
        cp android/app/google-services.json android/app/google-services.json.backup
        echo -e "${GREEN}✅ Backed up existing google-services.json${NC}"
    fi
    
    # Try to copy from Downloads
    if [ -f "$HOME/Downloads/google-services.json" ]; then
        cp "$HOME/Downloads/google-services.json" android/app/google-services.json
        echo -e "${GREEN}✅ google-services.json updated successfully!${NC}"
    else
        echo -e "${RED}❌ google-services.json not found in Downloads folder${NC}"
        echo "Please manually copy it to: android/app/google-services.json"
    fi
else
    echo -e "${YELLOW}⚠️  Please manually copy google-services.json to: android/app/google-services.json${NC}"
fi

echo ""
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     ✅ Firebase Console Setup Complete!                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Clean and rebuild the production APK:"
echo -e "   ${CYAN}cd android${NC}"
echo -e "   ${CYAN}./gradlew clean${NC}"
echo -e "   ${CYAN}ENVFILE=../.env.production ./gradlew assembleRelease${NC}"
echo ""
echo "2. Install on physical device:"
echo -e "   ${CYAN}adb install -r app/build/outputs/apk/release/app-release.apk${NC}"
echo ""
echo "3. Test OTP login with a real phone number"
echo ""
echo "4. Monitor logs:"
echo -e "   ${CYAN}adb logcat | grep -i \"FirebaseAuth\\|SafetyNet\\|yoraa\"${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}${BOLD}🎉 After rebuild, OTP should work on production devices!${NC}"
echo ""
