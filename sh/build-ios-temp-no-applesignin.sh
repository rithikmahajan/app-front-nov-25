#!/bin/bash

# Temporary iOS Build - Remove Apple Sign-In for Testing
# This will create a working IPA by temporarily disabling Apple Sign-In

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Creating iOS Build - Temporarily Removing Apple Sign-In${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Backup the original entitlements file
echo -e "${YELLOW}📋 Backing up original entitlements...${NC}"
cp ios/YoraaApp/YoraaApp.entitlements ios/YoraaApp/YoraaApp.entitlements.backup

# Remove Apple Sign-In from entitlements
echo -e "${YELLOW}🔧 Removing Apple Sign-In entitlement temporarily...${NC}"
cat > ios/YoraaApp/YoraaApp.entitlements << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>production</string>
</dict>
</plist>
EOF

echo -e "${YELLOW}📱 Creating new archive without Apple Sign-In...${NC}"
cd ios

# Clean and create new archive
xcodebuild clean -workspace Yoraa.xcworkspace -scheme YoraaApp -configuration Release

xcodebuild archive \
  -workspace Yoraa.xcworkspace \
  -scheme YoraaApp \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "./ios-builds/YoraaApp-NoAppleSignIn.xcarchive" \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=UX6XB9FMNN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    
    echo -e "${YELLOW}📤 Exporting IPA...${NC}"
    
    # Create simple export options without Apple Sign-In
    cat > exportOptions-simple-no-applesignin.plist << EOF
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
      -archivePath "./ios-builds/YoraaApp-NoAppleSignIn.xcarchive" \
      -exportPath "./ios-builds/NoAppleSignIn" \
      -exportOptionsPlist "./exportOptions-simple-no-applesignin.plist"
      
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 iOS build completed successfully!${NC}"
        echo -e "${GREEN}IPA location: ./ios/ios-builds/NoAppleSignIn/YoraaApp.ipa${NC}"
        
        # Show file info
        if [ -f "./ios-builds/NoAppleSignIn/YoraaApp.ipa" ]; then
            file_size=$(du -h "./ios-builds/NoAppleSignIn/YoraaApp.ipa" | cut -f1)
            echo -e "${GREEN}IPA size: ${file_size}${NC}"
        fi
        
        echo -e "${YELLOW}📋 Next Steps:${NC}"
        echo "1. Test this IPA to make sure everything else works"
        echo "2. Then add Apple Sign-In capability back by creating proper provisioning profile"
        echo "3. Restore original entitlements: cp ios/YoraaApp/YoraaApp.entitlements.backup ios/YoraaApp/YoraaApp.entitlements"
        
    else
        echo -e "${RED}❌ Export failed${NC}"
    fi
else
    echo -e "${RED}❌ Archive creation failed${NC}"
fi

cd ..
echo -e "${BLUE}🏁 Temporary build process completed${NC}"
