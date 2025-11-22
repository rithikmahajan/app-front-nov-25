#!/bin/bash

# Quick action script for remaining Firebase OTP setup

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🔥 Firebase OTP - Remaining Steps                             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${GREEN}✅ ALREADY COMPLETE:${NC}"
echo "   ✅ SHA-1 registered in Firebase"
echo "   ✅ SHA-256 registered in Firebase"
echo "   ✅ SafetyNet dependency added to code"
echo "   ✅ App verification enabled in code"
echo ""

echo -e "${YELLOW}⚠️  REMAINING STEPS (15 minutes):${NC}"
echo ""

# Step 1
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}${BOLD}STEP 1: Enable Android Device Verification API${NC} (MOST CRITICAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open this URL:"
echo -e "${YELLOW}https://console.cloud.google.com/apis/library${NC}"
echo ""
echo "📋 Steps:"
echo "1. Ensure 'yoraa-android-ios' project is selected (top left)"
echo "2. Search for: 'Android Device Verification API'"
echo "3. Click on the API"
echo "4. Click 'ENABLE' button"
echo "5. Wait for green checkmark"
echo ""
echo "❗ WITHOUT THIS, OTP WILL NOT WORK IN PRODUCTION!"
echo ""
read -p "Press ENTER after enabling the API..."
echo ""

# Step 2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}${BOLD}STEP 2: Verify Phone Auth is Enabled${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open this URL:"
echo -e "${YELLOW}https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers${NC}"
echo ""
echo "📋 Check:"
echo "1. Find 'Phone' in the sign-in providers list"
echo "2. Verify it shows 'Enabled'"
echo "3. If not enabled, click on it and enable"
echo ""
read -p "Press ENTER after verifying..."
echo ""

# Step 3
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}${BOLD}STEP 3: Download Fresh google-services.json${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open this URL:"
echo -e "${YELLOW}https://console.firebase.google.com/project/yoraa-android-ios/settings/general${NC}"
echo ""
echo "📋 Steps:"
echo "1. Scroll to your Android app"
echo "2. Click 'Download google-services.json'"
echo "3. Save to Downloads folder"
echo ""
read -p "Press ENTER after downloading..."
echo ""

# Replace google-services.json
echo "📁 Replacing google-services.json..."

if [ -f "$HOME/Downloads/google-services.json" ]; then
    # Backup existing
    if [ -f "android/app/google-services.json" ]; then
        cp android/app/google-services.json "android/app/google-services.json.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Backed up existing google-services.json${NC}"
    fi
    
    # Copy new file
    cp "$HOME/Downloads/google-services.json" android/app/google-services.json
    echo -e "${GREEN}✅ google-services.json updated successfully!${NC}"
    
    # Show modification time
    echo "   Last modified: $(stat -f "%Sm" android/app/google-services.json)"
else
    echo -e "${RED}❌ google-services.json not found in Downloads${NC}"
    echo "Please manually copy it to: android/app/google-services.json"
    read -p "Press ENTER after copying manually..."
fi

echo ""

# Step 4
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}${BOLD}STEP 4: Rebuild Production APK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔨 Cleaning and rebuilding..."
echo ""

# Clean
cd android
./gradlew clean
echo -e "${GREEN}✅ Clean complete${NC}"
echo ""

# Build
echo "🏗️  Building production APK..."
echo ""
ENVFILE=../.env.production ./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Production APK built successfully!                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo "📦 APK Location:"
        echo "   $APK_PATH"
        echo ""
        ls -lh "$APK_PATH"
        echo ""
    fi
else
    echo -e "${RED}❌ Build failed - check errors above${NC}"
    exit 1
fi

cd ..

# Step 5
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}${BOLD}STEP 5: Install & Test on Physical Device${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Connect your Android device via USB"
echo ""
read -p "Press ENTER when device is connected..."
echo ""

# Check if device is connected
if adb devices | grep -q "device$"; then
    echo -e "${GREEN}✅ Device detected!${NC}"
    echo ""
    echo "📲 Installing APK..."
    adb install -r android/app/build/outputs/apk/release/app-release.apk
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ APK installed successfully!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No device detected${NC}"
    echo "Please install manually:"
    echo "   adb install -r android/app/build/outputs/apk/release/app-release.apk"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🎉 Setup Complete! Now Test OTP Flow                          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BOLD}Test Steps:${NC}"
echo "1. Open app on physical device"
echo "2. Go to login screen"
echo "3. Enter phone number with country code (e.g., +919876543210)"
echo "4. Tap LOGIN button"
echo "5. Wait for OTP SMS (30-60 seconds)"
echo "6. Enter 6-digit OTP"
echo "7. Verify successful login"
echo ""
echo -e "${BOLD}Monitor Logs:${NC}"
echo "   adb logcat | grep -i \"FirebaseAuth\\|SafetyNet\\|yoraa\""
echo ""
echo -e "${GREEN}✅ If all steps completed, OTP should work in production!${NC}"
echo ""
