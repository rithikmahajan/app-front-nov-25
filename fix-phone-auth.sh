#!/bin/bash

# Fix Phone Authentication Script
# Project: yoraa-android-ios

echo "🚀 Phone Authentication Fix Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/rithikmahajan/Desktop/oct-7-appfront-main"
cd "$PROJECT_DIR"

echo -e "${BLUE}Project:${NC} yoraa-android-ios"
echo -e "${BLUE}Bundle ID:${NC} com.yoraaapparelsprivatelimited.yoraa"
echo ""

# Step 1: Check Firebase Console
echo -e "${YELLOW}📋 Step 1: Enable Phone Authentication in Firebase Console${NC}"
echo ""
echo "Please complete this step manually:"
echo "1. Open: https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers"
echo "2. Click on 'Phone' provider"
echo "3. Toggle 'Enable' to ON"
echo "4. Click 'Save'"
echo ""
read -p "Have you completed this step? (y/n): " firebase_enabled

if [ "$firebase_enabled" != "y" ]; then
    echo -e "${RED}❌ Please enable Phone authentication in Firebase Console first!${NC}"
    echo "Open this link: https://console.firebase.google.com/project/yoraa-android-ios/authentication/providers"
    exit 1
fi

echo -e "${GREEN}✅ Step 1 Complete${NC}"
echo ""

# Step 2: Enable reCAPTCHA Enterprise API
echo -e "${YELLOW}📋 Step 2: Enable reCAPTCHA Enterprise API${NC}"
echo ""
echo "Please complete this step manually:"
echo "1. Open: https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=yoraa-android-ios"
echo "2. Click 'Enable'"
echo ""
read -p "Have you completed this step? (y/n): " recaptcha_api_enabled

if [ "$recaptcha_api_enabled" != "y" ]; then
    echo -e "${RED}❌ Please enable reCAPTCHA Enterprise API first!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Step 2 Complete${NC}"
echo ""

# Step 3: Create reCAPTCHA Key
echo -e "${YELLOW}📋 Step 3: Create reCAPTCHA Key for iOS${NC}"
echo ""
echo "Please complete this step manually:"
echo "1. Open: https://console.cloud.google.com/security/recaptcha?project=yoraa-android-ios"
echo "2. Click 'Create Key'"
echo "3. Display name: 'iOS Phone Auth - Yoraa'"
echo "4. Platform type: 'iOS'"
echo "5. Bundle ID: 'com.yoraaapparelsprivatelimited.yoraa'"
echo "6. Click 'Create'"
echo "7. COPY THE KEY ID (looks like: 6Lxxx...xxxxx)"
echo ""
read -p "Enter your reCAPTCHA Site Key: " recaptcha_key

if [ -z "$recaptcha_key" ]; then
    echo -e "${RED}❌ reCAPTCHA key is required!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Step 3 Complete${NC}"
echo ""

# Step 4: Create config file
echo -e "${YELLOW}📋 Step 4: Creating recaptcha config file...${NC}"

mkdir -p src/config

cat > src/config/recaptcha.config.js << EOF
// reCAPTCHA Configuration for iOS
// Generated on: $(date)

export const RECAPTCHA_CONFIG = {
  siteKey: '$recaptcha_key',
};
EOF

echo -e "${GREEN}✅ Created src/config/recaptcha.config.js${NC}"
echo ""

# Step 5: Check for entitlements file
echo -e "${YELLOW}📋 Step 5: Checking entitlements file...${NC}"

ENTITLEMENTS_FILE="ios/YoraaApp/YoraaApp.entitlements"

if [ ! -f "$ENTITLEMENTS_FILE" ]; then
    echo "Creating entitlements file..."
    cat > "$ENTITLEMENTS_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
</dict>
</plist>
EOF
    echo -e "${GREEN}✅ Created entitlements file${NC}"
else
    echo -e "${GREEN}✅ Entitlements file exists${NC}"
fi
echo ""

# Step 6: App Attest reminder
echo -e "${YELLOW}📋 Step 6: Add App Attest Capability in Xcode${NC}"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "1. Open: open ios/YoraaApp.xcworkspace"
echo "2. Select 'YoraaApp' target"
echo "3. Go to 'Signing & Capabilities' tab"
echo "4. Click '+ Capability'"
echo "5. Add 'App Attest'"
echo ""
read -p "Have you completed this step? (y/n): " app_attest_added

# Step 7: Clean and rebuild
echo ""
echo -e "${YELLOW}📋 Step 7: Cleaning and rebuilding...${NC}"
echo ""

cd ios
echo "Removing old pods..."
rm -rf Pods Podfile.lock build

echo "Installing pods..."
pod install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pods installed successfully${NC}"
else
    echo -e "${RED}❌ Pod install failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "=================================="
echo "Next Steps:"
echo "=================================="
echo ""
echo "1. Open Xcode and add App Attest capability (if not done yet):"
echo "   open ios/YoraaApp.xcworkspace"
echo ""
echo "2. Build and run the app:"
echo "   npx react-native run-ios"
echo ""
echo "3. Test with phone number: +91 7006114695"
echo ""
echo -e "${BLUE}📝 Configuration saved to:${NC}"
echo "   - src/config/recaptcha.config.js"
echo "   - $ENTITLEMENTS_FILE"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "   - Add App Attest capability in Xcode"
echo "   - Enable billing in Firebase for production SMS"
echo ""
echo "Good luck! 🚀"
