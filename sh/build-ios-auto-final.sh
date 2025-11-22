#!/bin/bash

# Automatic iOS Production Build - Using Your Proper Team and Credentials
# This will use automatic signing which should work with your setup

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Automatic iOS Production Build${NC}"
echo -e "${BLUE}Team: Yoraa Apparels Private Limited (UX6XB9FMNN)${NC}"
echo -e "${BLUE}Bundle ID: com.yoraaapparelsprivatelimited.yoraa${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Go to iOS directory
cd ios

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf ios-builds/*.xcarchive
rm -rf ios-builds/*.ipa

echo -e "${YELLOW}📱 Creating production archive with automatic signing...${NC}"

# Create archive with automatic signing - let Xcode handle everything
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "./ios-builds/YoraaApp-Auto.xcarchive" \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  PRODUCT_BUNDLE_IDENTIFIER="com.yoraaapparelsprivatelimited.yoraa"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    
    echo -e "${YELLOW}📤 Exporting IPA with automatic signing...${NC}"
    
    # Create export options for automatic signing
    cat > exportOptions-auto-final.plist << EOF
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
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
EOF

    xcodebuild -exportArchive \
      -archivePath "./ios-builds/YoraaApp-Auto.xcarchive" \
      -exportPath "./ios-builds/AutomaticSigning" \
      -exportOptionsPlist "./exportOptions-auto-final.plist"
      
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 iOS Production Build Completed Successfully!${NC}"
        echo -e "${GREEN}IPA location: ./ios/ios-builds/AutomaticSigning/YoraaApp.ipa${NC}"
        
        # Show file info
        if [ -f "./ios-builds/AutomaticSigning/YoraaApp.ipa" ]; then
            file_size=$(du -h "./ios-builds/AutomaticSigning/YoraaApp.ipa" | cut -f1)
            echo -e "${GREEN}IPA size: ${file_size}${NC}"
            echo -e "${GREEN}Archive: ./ios/ios-builds/YoraaApp-Auto.xcarchive${NC}"
        fi
        
        echo -e "${BLUE}📋 Build Summary:${NC}"
        echo "✅ Team: Yoraa Apparels Private Limited (UX6XB9FMNN)"
        echo "✅ Bundle ID: com.yoraaapparelsprivatelimited.yoraa"
        echo "✅ Automatic Signing: Enabled"
        echo "✅ Production IPA: Ready for App Store"
        
    else
        echo -e "${RED}❌ Export failed with automatic signing${NC}"
        echo -e "${YELLOW}Archive is available at: ./ios/ios-builds/YoraaApp-Auto.xcarchive${NC}"
        echo -e "${YELLOW}The issue might be Apple Sign-In capability not in provisioning profile${NC}"
        
        echo -e "${BLUE}📋 Next Steps:${NC}"
        echo "1. Check if Apple Sign-In capability is enabled in your Apple Developer Console"
        echo "2. Make sure your App ID has Apple Sign-In capability"
        echo "3. Wait a few minutes for provisioning profiles to sync"
        echo "4. Try the export again"
    fi
else
    echo -e "${RED}❌ Archive creation failed${NC}"
    echo -e "${YELLOW}Please check Xcode for detailed error information${NC}"
fi

cd ..
echo -e "${BLUE}🏁 Automatic production build process completed${NC}"
