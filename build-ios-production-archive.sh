#!/bin/bash

# iOS Production Archive Build Script
# This script creates a production archive for iOS using xcodebuild

set -e  # Exit on error

echo "🚀 Starting iOS Production Archive Build..."
echo "================================================"

# Configuration
WORKSPACE="ios/Yoraa.xcworkspace"
SCHEME="Yoraa"
CONFIGURATION="Release"
ARCHIVE_PATH="build/ios/Yoraa.xcarchive"
EXPORT_PATH="build/ios/export"
EXPORT_OPTIONS_PLIST="ios/ExportOptions.plist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if workspace exists
if [ ! -d "$WORKSPACE" ]; then
    echo -e "${RED}❌ Error: Workspace not found at $WORKSPACE${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf build/ios
mkdir -p build/ios

# Install pods if needed
echo -e "${YELLOW}📦 Checking CocoaPods dependencies...${NC}"
cd ios
if [ -f "Podfile" ]; then
    echo "Installing/Updating pods..."
    pod install
fi
cd ..

# Create ExportOptions.plist if it doesn't exist
if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
    echo -e "${YELLOW}📝 Creating ExportOptions.plist...${NC}"
    cat > "$EXPORT_OPTIONS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF
fi

# Build Archive
echo -e "${YELLOW}🔨 Building archive...${NC}"
echo "This may take several minutes..."

xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    | xcpretty || true

# Check if archive was created
if [ ! -d "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Archive creation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archive created successfully!${NC}"
echo -e "Archive location: ${YELLOW}$ARCHIVE_PATH${NC}"

# Export IPA
echo -e "${YELLOW}📤 Exporting IPA...${NC}"

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    -allowProvisioningUpdates \
    | xcpretty || true

# Check if IPA was created
if [ -f "$EXPORT_PATH/Yoraa.ipa" ]; then
    echo -e "${GREEN}✅ IPA exported successfully!${NC}"
    echo -e "IPA location: ${YELLOW}$EXPORT_PATH/Yoraa.ipa${NC}"
    
    # Get IPA size
    IPA_SIZE=$(du -h "$EXPORT_PATH/Yoraa.ipa" | cut -f1)
    echo -e "IPA size: ${YELLOW}$IPA_SIZE${NC}"
else
    echo -e "${RED}❌ IPA export failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 iOS Production Build Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Open Xcode Organizer to upload to App Store Connect"
echo "   - Xcode → Window → Organizer"
echo "2. Or use the IPA file at: $EXPORT_PATH/Yoraa.ipa"
echo ""
echo "To open archive in Xcode Organizer:"
echo "  open $ARCHIVE_PATH"
echo ""
