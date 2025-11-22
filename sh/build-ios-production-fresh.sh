#!/bin/bash

# Fresh iOS Production Build - Using Proper Provisioning Profile
# Team: Yoraa Apparels Private Limited (UX6XB9FMNN)
# Bundle ID: com.yoraaapparelsprivatelimited.yoraa
# Provisioning Profile: Yoraa App Store Distribution
# Certificate: Apple Distribution: Yoraa Apparels Private Limited

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Fresh iOS Production Build${NC}"
echo -e "${BLUE}Team: Yoraa Apparels Private Limited (UX6XB9FMNN)${NC}"
echo -e "${BLUE}Bundle ID: com.yoraaapparelsprivatelimited.yoraa${NC}"
echo -e "${BLUE}Profile: Yoraa App Store Distribution${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Clean everything first
echo -e "${YELLOW}🧹 Deep cleaning project...${NC}"
npm cache clean --force
rm -rf node_modules
npm install

# Clean iOS
cd ios
rm -rf Pods Podfile.lock build DerivedData
rm -rf ios-builds/*.xcarchive
rm -rf ios-builds/*.ipa

# Reinstall pods
echo -e "${YELLOW}📦 Reinstalling iOS dependencies...${NC}"
pod deintegrate || true
pod install --repo-update

# Clean Xcode build
echo -e "${YELLOW}🔨 Cleaning Xcode build...${NC}"
xcodebuild clean -workspace Yoraa.xcworkspace -scheme YoraaApp -configuration Release

echo -e "${YELLOW}📱 Creating production archive...${NC}"

# Create archive with manual signing using your specific provisioning profile
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "./ios-builds/YoraaApp-Production.xcarchive" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_IDENTITY="Apple Distribution: Yoraa Apparels Private Limited" \
  PROVISIONING_PROFILE_SPECIFIER="Yoraa App Store Distribution" \
  PRODUCT_BUNDLE_IDENTIFIER="com.yoraaapparelsprivatelimited.yoraa"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    
    echo -e "${YELLOW}📤 Exporting IPA with manual signing...${NC}"
    
    # Create export options for manual signing with your specific profile
    cat > exportOptions-production-manual.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>UX6XB9FMNN</string>
    <key>signingStyle</key>
    <string>manual</string>
    <key>signingCertificate</key>
    <string>Apple Distribution: Yoraa Apparels Private Limited</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.yoraaapparelsprivatelimited.yoraa</key>
        <string>Yoraa App Store Distribution</string>
    </dict>
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
      -archivePath "./ios-builds/YoraaApp-Production.xcarchive" \
      -exportPath "./ios-builds/Production" \
      -exportOptionsPlist "./exportOptions-production-manual.plist"
      
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 iOS Production Build Completed Successfully!${NC}"
        echo -e "${GREEN}IPA location: ./ios/ios-builds/Production/YoraaApp.ipa${NC}"
        
        # Show file info
        if [ -f "./ios-builds/Production/YoraaApp.ipa" ]; then
            file_size=$(du -h "./ios-builds/Production/YoraaApp.ipa" | cut -f1)
            echo -e "${GREEN}IPA size: ${file_size}${NC}"
            echo -e "${GREEN}Archive: ./ios/ios-builds/YoraaApp-Production.xcarchive${NC}"
        fi
        
        echo -e "${BLUE}📋 Build Summary:${NC}"
        echo "✅ Team: Yoraa Apparels Private Limited (UX6XB9FMNN)"
        echo "✅ Bundle ID: com.yoraaapparelsprivatelimited.yoraa"
        echo "✅ Provisioning Profile: Yoraa App Store Distribution"
        echo "✅ Certificate: Apple Distribution: Yoraa Apparels Private Limited"
        echo "✅ Manual Signing: Configured"
        echo "✅ Production IPA: Ready for App Store"
        
    else
        echo -e "${RED}❌ Export failed with manual signing${NC}"
        echo -e "${YELLOW}Archive is available at: ./ios/ios-builds/YoraaApp-Production.xcarchive${NC}"
        echo -e "${YELLOW}You can try exporting manually from Xcode Organizer${NC}"
    fi
else
    echo -e "${RED}❌ Archive creation failed${NC}"
    echo -e "${YELLOW}Please check Xcode for detailed error information${NC}"
fi

cd ..
echo -e "${BLUE}🏁 Fresh production build process completed${NC}"
