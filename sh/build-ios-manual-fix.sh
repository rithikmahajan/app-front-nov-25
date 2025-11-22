#!/bin/bash

# Manual Archive Fix - Direct Provisioning Profile Setup
# This script will guide you through manually fixing the Apple Sign-In capability issue

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Manual iOS Archive Fix - Apple Sign-In Capability${NC}"

# Navigate to project root
cd "$(dirname "$0")"
cd ios

echo -e "${YELLOW}📱 Current Status:${NC}"
echo "The archive is failing because the provisioning profile doesn't include:"
echo "1. Sign in with Apple capability"
echo "2. Push Notifications capability"
echo ""

echo -e "${RED}🔧 MANUAL STEPS REQUIRED:${NC}"
echo ""
echo "1. Open Xcode:"
echo "   open Yoraa.xcworkspace"
echo ""
echo "2. Select the YoraaApp target in the left sidebar"
echo ""
echo "3. Go to 'Signing & Capabilities' tab"
echo ""
echo "4. Make sure 'Automatically manage signing' is CHECKED"
echo ""
echo "5. Verify Team is set to: 'Yoraa Apparels Private Limited (UX6XB9FMNN)'"
echo ""
echo "6. Check that these capabilities are present:"
echo "   ✅ Sign in with Apple"
echo "   ✅ Push Notifications"
echo ""
echo "7. If either capability is missing, click '+ Capability' and add them"
echo ""
echo "8. Close Xcode after making changes"
echo ""

read -p "Press ENTER after completing the manual steps in Xcode..."

echo -e "${YELLOW}🔨 Now attempting archive with automatic signing...${NC}"

# Try archive with automatic signing
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "./ios-builds/YoraaApp.xcarchive" \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=UX6XB9FMNN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    
    echo -e "${YELLOW}📤 Exporting IPA with automatic signing...${NC}"
    
    # Create export options for automatic signing
    cat > exportOptions-auto.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>UX6XB9FMNN</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF

    xcodebuild -exportArchive \
      -archivePath "./ios-builds/YoraaApp.xcarchive" \
      -exportPath "./ios-builds" \
      -exportOptionsPlist "./exportOptions-auto.plist"
      
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 iOS build completed successfully!${NC}"
        echo -e "${GREEN}IPA location: ./ios/ios-builds/YoraaApp.ipa${NC}"
        
        # Show file info
        if [ -f "./ios-builds/YoraaApp.ipa" ]; then
            file_size=$(du -h "./ios-builds/YoraaApp.ipa" | cut -f1)
            echo -e "${GREEN}IPA size: ${file_size}${NC}"
        fi
    else
        echo -e "${RED}❌ Export failed even with automatic signing${NC}"
        echo -e "${YELLOW}Archive is available at: ./ios/ios-builds/YoraaApp.xcarchive${NC}"
        echo -e "${YELLOW}You can try exporting manually from Xcode Organizer${NC}"
    fi
else
    echo -e "${RED}❌ Archive creation failed${NC}"
    echo -e "${YELLOW}Please verify the manual steps were completed correctly${NC}"
    echo -e "${YELLOW}You may need to refresh provisioning profiles in Apple Developer Console${NC}"
fi

cd ..
echo -e "${BLUE}🏁 Manual fix process completed${NC}"
