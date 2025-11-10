#!/bin/bash

# Archive for App Store - Production Build
# This script creates an archive ready for App Store submission

set -e

echo "📦 Starting iOS Archive for App Store..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Configuration
WORKSPACE="ios/Yoraa.xcworkspace"
SCHEME="YoraaApp"
CONFIGURATION="Release"
ARCHIVE_PATH="$HOME/Desktop/YoraaApp.xcarchive"
EXPORT_PATH="$HOME/Desktop/YoraaApp-IPA"

# Step 1: Verify environment
echo "=========================================="
echo "Step 1: Verifying Environment"
echo "=========================================="
echo ""

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode command line tools not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Xcode found: $(xcodebuild -version | head -1)${NC}"

# Check workspace exists
if [ ! -d "$WORKSPACE" ]; then
    echo -e "${RED}❌ Workspace not found at $WORKSPACE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Workspace found${NC}"
echo ""

# Step 2: Fix Xcode settings
echo "=========================================="
echo "Step 2: Ensuring Xcode Settings"
echo "=========================================="
echo ""

if [ -f "ios/fix-xcode-project.sh" ]; then
  cd ios
  ./fix-xcode-project.sh
  cd ..
  echo -e "${GREEN}✅ Xcode settings verified${NC}"
fi
echo ""

# Step 3: Clean build
echo "=========================================="
echo "Step 3: Cleaning Build"
echo "=========================================="
echo ""

cd ios
rm -rf build/
echo -e "${GREEN}✅ Build folder cleaned${NC}"
cd ..
echo ""

# Step 4: Pod install to ensure everything is up to date
echo "=========================================="
echo "Step 4: Updating CocoaPods"
echo "=========================================="
echo ""

cd ios
pod install --repo-update
cd ..
echo ""

# Step 5: Create Archive
echo "=========================================="
echo "Step 5: Creating Archive"
echo "=========================================="
echo ""

echo -e "${BLUE}📦 Archiving... This may take several minutes...${NC}"
echo ""

# Remove old archive if exists
rm -rf "$ARCHIVE_PATH"

# Archive command
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_STYLE=Automatic \
  | xcpretty || xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  DEVELOPMENT_TEAM=UX6XB9FMNN \
  CODE_SIGN_STYLE=Automatic

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Archive failed!${NC}"
    echo "Check the build output above for errors."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Archive created successfully!${NC}"
echo ""

# Step 6: Open Organizer
echo "=========================================="
echo "Step 6: Opening Xcode Organizer"
echo "=========================================="
echo ""

echo -e "${BLUE}📱 Opening Xcode Organizer...${NC}"
open -a Xcode "$ARCHIVE_PATH"

echo ""
echo "=========================================="
echo "✅ Archive Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}Archive saved to: $ARCHIVE_PATH${NC}"
echo ""
echo "🎯 Next steps in Xcode Organizer:"
echo "  1. Select your archive"
echo "  2. Click 'Distribute App'"
echo "  3. Choose 'App Store Connect'"
echo "  4. Choose 'Upload'"
echo "  5. Follow the wizard to submit"
echo ""
echo "📝 Alternative - Export IPA manually:"
echo "  ./export-ipa.sh"
echo ""
