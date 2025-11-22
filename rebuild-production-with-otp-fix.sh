#!/bin/bash

# 🚀 Automated Production Rebuild with OTP Fix
# Run this AFTER completing manual Firebase Console steps

set -e  # Exit on any error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🔥 Production APK Rebuild - Firebase OTP Fix                   ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo -e "${CYAN}${BOLD}Pre-Flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if manual steps were completed
echo "⚠️  ${YELLOW}IMPORTANT:${NC} Have you completed these manual steps?"
echo ""
echo "1. ✅ Enabled Android Device Verification API"
echo "2. ✅ Verified Phone Authentication is enabled"
echo "3. ✅ Downloaded google-services.json to ~/Downloads/"
echo ""
read -p "Have you completed ALL 3 steps above? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please complete the manual steps first.${NC}"
    echo "See: ACTION_PLAN_OTP_FIX.md"
    exit 1
fi

echo ""
echo -e "${CYAN}${BOLD}Step 1: Replace google-services.json${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if new google-services.json exists
if [ ! -f "$HOME/Downloads/google-services.json" ]; then
    echo -e "${RED}❌ google-services.json not found in Downloads folder${NC}"
    echo ""
    echo "Please download it from Firebase Console:"
    echo "https://console.firebase.google.com/project/yoraa-android-ios/settings/general"
    echo ""
    exit 1
fi

# Backup existing file
BACKUP_FILE="android/app/google-services.json.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "android/app/google-services.json" ]; then
    cp android/app/google-services.json "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backed up existing file to:${NC}"
    echo "   $BACKUP_FILE"
fi

# Copy new file
cp "$HOME/Downloads/google-services.json" android/app/google-services.json
echo -e "${GREEN}✅ google-services.json updated${NC}"
echo ""

# Show file info
echo "📄 New file info:"
ls -lh android/app/google-services.json
echo ""

# Verify package name
PACKAGE_NAME=$(grep '"package_name"' android/app/google-services.json | head -1 | sed 's/.*": "\(.*\)".*/\1/')
echo "📦 Package name in file: $PACKAGE_NAME"

if [ "$PACKAGE_NAME" != "com.yoraa" ]; then
    echo -e "${YELLOW}⚠️  Warning: Package name doesn't match expected 'com.yoraa'${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${CYAN}${BOLD}Step 2: Clean Previous Builds${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd android
./gradlew clean

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Clean complete${NC}"
else
    echo -e "${RED}❌ Clean failed${NC}"
    exit 1
fi

cd ..
echo ""

echo -e "${CYAN}${BOLD}Step 3: Build Production APK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show build configuration
echo "🏗️  Build Configuration:"
echo "   Environment: Production (.env.production)"
echo "   Build Type: Release"
echo "   Package: com.yoraa"
echo ""

# Build
cd android
ENVFILE=../.env.production ./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Production APK Built Successfully!                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
else
    echo -e "${RED}❌ Build failed - check errors above${NC}"
    cd ..
    exit 1
fi

cd ..

# Show APK info
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "📦 APK Details:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ls -lh "$APK_PATH"
    echo ""
    echo "📍 Location: $APK_PATH"
    echo ""
fi

echo ""
echo -e "${CYAN}${BOLD}Step 4: Install on Device${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for connected device
if ! command -v adb &> /dev/null; then
    echo -e "${YELLOW}⚠️  adb not found - cannot install automatically${NC}"
    echo "Please install manually"
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ Build Complete! Manual Install Required                     ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    exit 0
fi

# Check for devices
DEVICE_COUNT=$(adb devices | grep -c "device$" || true)

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No Android device detected${NC}"
    echo ""
    echo "To install manually:"
    echo "   1. Connect device via USB"
    echo "   2. Enable USB debugging"
    echo "   3. Run: adb install -r $APK_PATH"
    echo ""
else
    echo -e "${GREEN}✅ Android device detected${NC}"
    echo ""
    echo "📲 Installing APK..."
    adb install -r "$APK_PATH"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ APK installed successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Installation failed - try manual install${NC}"
    fi
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🎉 Production Build Complete with OTP Fix!                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BOLD}Next Steps - Test OTP Flow:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open app on your physical device"
echo "2. Go to login screen"
echo "3. Enter phone number with country code (e.g., +919876543210)"
echo "4. Tap LOGIN button"
echo "5. Wait for OTP SMS (30-60 seconds)"
echo "6. Enter 6-digit OTP code"
echo "7. Verify successful login"
echo ""
echo -e "${BOLD}Monitor Logs:${NC}"
echo "   adb logcat | grep -i \"FirebaseAuth\\|SafetyNet\\|yoraa\""
echo ""
echo -e "${BOLD}Expected Production Logs:${NC}"
echo "   📱 Platform: android"
echo "   🏗️  Build Type: PRODUCTION"
echo "   🔐 Production build detected - enabling app verification..."
echo "   ✅ App verification enabled for production"
echo "   🔄 Sending OTP via Firebase..."
echo "   ✅ OTP sent successfully"
echo ""
echo -e "${GREEN}${BOLD}✅ If manual steps were completed correctly, OTP should work!${NC}"
echo ""
