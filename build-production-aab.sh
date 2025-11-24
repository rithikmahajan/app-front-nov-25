#!/bin/bash

# Android Production AAB Build Script for Play Store Upload
# This script builds a signed Android App Bundle ready for Play Store release

set -e  # Exit on error

echo "🚀 Starting Android Production AAB Build for Play Store..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Log file
BUILD_LOG="aab-build.log"
echo "Build started at $(date)" > "$BUILD_LOG"

echo -e "${BLUE}Step 1: Cleaning previous builds...${NC}"
cd android
./gradlew clean >> "../$BUILD_LOG" 2>&1
echo -e "${GREEN}✓ Clean complete${NC}"

echo -e "${BLUE}Step 2: Verifying keystore configuration...${NC}"
if [ ! -f "upload-keystore.properties" ]; then
    echo -e "${RED}✗ Error: upload-keystore.properties not found!${NC}"
    exit 1
fi

if [ ! -f "app/upload-keystore.jks" ]; then
    echo -e "${RED}✗ Error: upload-keystore.jks not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Keystore verified${NC}"

echo -e "${BLUE}Step 3: Building production AAB (Android App Bundle)...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"

# Build the release AAB
./gradlew bundleRelease >> "../$BUILD_LOG" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ AAB build successful!${NC}"
else
    echo -e "${RED}✗ Build failed! Check $BUILD_LOG for details${NC}"
    tail -50 "../$BUILD_LOG"
    exit 1
fi

cd ..

# Check if AAB was created
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
    echo -e "${GREEN}✓ AAB file created successfully!${NC}"
    
    # Get file size
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}🎉 BUILD SUCCESSFUL!${NC}"
    echo "================================================"
    echo "AAB Location: $AAB_PATH"
    echo "AAB Size: $AAB_SIZE"
    echo ""
    
    # Get version info from build.gradle
    VERSION_CODE=$(grep "versionCode" android/app/build.gradle | awk '{print $2}')
    VERSION_NAME=$(grep "versionName" android/app/build.gradle | awk '{print $2}' | tr -d '"')
    
    echo "Version Code: $VERSION_CODE"
    echo "Version Name: $VERSION_NAME"
    echo ""
    echo "📦 Next Steps for Play Store Upload:"
    echo "1. Go to https://play.google.com/console"
    echo "2. Select your app (com.yoraa)"
    echo "3. Navigate to Production → Create new release"
    echo "4. Upload the AAB file at: $AAB_PATH"
    echo "5. Fill in release notes and submit for review"
    echo ""
    
    # Copy to easy access location
    cp "$AAB_PATH" "app-release.aab"
    echo -e "${GREEN}✓ AAB also copied to: $(pwd)/app-release.aab${NC}"
    echo ""
    echo "Build completed at $(date)" >> "$BUILD_LOG"
    
else
    echo -e "${RED}✗ Error: AAB file not found at expected location${NC}"
    echo "Expected: $AAB_PATH"
    exit 1
fi
