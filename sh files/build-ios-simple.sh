#!/bin/bash

# Simple iOS Build Script - Direct Archive & Export
# Avoiding complex script issues that were causing Hermes failures

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Simple iOS Build Process${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Unlock keychain to avoid codesigning issues
echo -e "${YELLOW}🔓 Unlocking keychain...${NC}"
security unlock-keychain -p "" ~/Library/Keyclains/login.keychain-db 2>/dev/null || true

# Basic npm install
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Clean and reinstall pods
echo -e "${YELLOW}🧹 Cleaning and reinstalling iOS dependencies...${NC}"
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..

# Create archive with minimal configuration
echo -e "${YELLOW}📱 Creating iOS archive...${NC}"
cd ios

# Use the most basic archive command with manual signing
xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "./ios-builds/YoraaApp.xcarchive" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_IDENTITY="iPhone Distribution" \
  PROVISIONING_PROFILE_SPECIFIER=""

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    
    # Try simple export with automatic signing
    echo -e "${YELLOW}📤 Exporting IPA...${NC}"
    
    # Create simple export options
    cat > exportOptions-simple.plist << EOF
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
</dict>
</plist>
EOF

    xcodebuild -exportArchive \
      -archivePath "./ios-builds/YoraaApp.xcarchive" \
      -exportPath "./ios-builds" \
      -exportOptionsPlist "./exportOptions-simple.plist"
      
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 iOS build completed successfully!${NC}"
        echo -e "${GREEN}IPA location: ./ios/ios-builds/YoraaApp.ipa${NC}"
    else
        echo -e "${RED}❌ Export failed. Let's try manual signing...${NC}"
        
        # Try with manual signing fallback
        cat > exportOptions-manual.plist << EOF
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
    <string>iPhone Distribution</string>
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
EOF
        
        xcodebuild -exportArchive \
          -archivePath "./ios-builds/YoraaApp.xcarchive" \
          -exportPath "./ios-builds" \
          -exportOptionsPlist "./exportOptions-manual.plist"
          
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}🎉 iOS build completed with manual signing!${NC}"
            echo -e "${GREEN}IPA location: ./ios/ios-builds/YoraaApp.ipa${NC}"
        else
            echo -e "${RED}❌ Both automatic and manual export failed${NC}"
            echo -e "${YELLOW}Archive is available at: ./ios/ios-builds/YoraaApp.xcarchive${NC}"
            echo -e "${YELLOW}You can try exporting manually from Xcode${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Archive creation failed${NC}"
    echo -e "${YELLOW}Try running this in Xcode directly for more detailed error information${NC}"
fi

cd ..
echo -e "${BLUE}🏁 Build process completed${NC}"
