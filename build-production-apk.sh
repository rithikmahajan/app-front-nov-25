#!/bin/bash

# ================================
# 🚀 YORAA Android Production APK Builder
# Fully Automated - No User Input Required
# ================================

set -e  # Exit on error

echo "================================"
echo "🚀 YORAA Production APK Build"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📍 Working directory: $SCRIPT_DIR${NC}"
echo ""

# Step 1: Verify production environment file exists
echo -e "${BLUE}Step 1: Verifying production environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env.production found${NC}"
echo ""

# Step 2: Display production configuration
echo -e "${BLUE}Step 2: Production Configuration:${NC}"
echo -e "${YELLOW}Backend API:${NC} $(grep 'API_BASE_URL=' .env.production | cut -d'=' -f2)"
echo -e "${YELLOW}Environment:${NC} $(grep 'APP_ENV=' .env.production | cut -d'=' -f2)"
echo -e "${YELLOW}Build Type:${NC} $(grep 'BUILD_TYPE=' .env.production | cut -d'=' -f2)"
echo -e "${YELLOW}Debug Mode:${NC} $(grep 'DEBUG_MODE=' .env.production | cut -d'=' -f2)"
echo ""

# Step 3: Verify keystore exists
echo -e "${BLUE}Step 3: Verifying release keystore...${NC}"
if [ ! -f "android/app/upload-keystore.jks" ]; then
    echo -e "${RED}❌ Error: upload-keystore.jks not found!${NC}"
    echo "Please ensure the keystore file is in android/app/"
    exit 1
fi

if [ ! -f "android/upload-keystore.properties" ]; then
    echo -e "${RED}❌ Error: upload-keystore.properties not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Release keystore verified${NC}"
echo ""

# Step 4: Clean previous builds
echo -e "${BLUE}Step 4: Cleaning previous builds...${NC}"
cd android
./gradlew clean --quiet
cd ..
echo -e "${GREEN}✅ Clean completed${NC}"
echo ""

# Step 5: Build production APK
BUILD_TYPE="apk"
BUILD_TASK="assembleRelease"
OUTPUT_FILE="app-release.apk"
OUTPUT_PATH="android/app/build/outputs/apk/release/app-release.apk"

echo ""
echo -e "${BLUE}Step 5: Building production APK...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"
echo ""

# Set environment file and build
export ENVFILE=.env.production
cd android
./gradlew $BUILD_TASK --warning-mode all 2>&1 | tee ../build-production.log
BUILD_STATUS=$?
cd ..

# Step 6: Verify build output
echo ""
echo -e "${BLUE}Step 6: Verifying build output...${NC}"

if [ $BUILD_STATUS -eq 0 ] && [ -f "$OUTPUT_PATH" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_PATH" | awk '{print $5}')
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "================================"
    echo -e "${GREEN}🎉 Production APK Complete!${NC}"
    echo "================================"
    echo ""
    echo -e "${BLUE}Output Details:${NC}"
    echo -e "  Type: ${YELLOW}$BUILD_TYPE${NC}"
    echo -e "  File: ${YELLOW}$OUTPUT_FILE${NC}"
    echo -e "  Size: ${YELLOW}$FILE_SIZE${NC}"
    echo -e "  Path: ${YELLOW}$OUTPUT_PATH${NC}"
    echo ""
    
    echo -e "${GREEN}📦 APK is ready for installation/testing${NC}"
    echo ""
    echo "To install on a connected device:"
    echo "  adb install $OUTPUT_PATH"
    echo ""
    
    echo -e "${BLUE}Configuration Used:${NC}"
    echo "  Backend: https://api.yoraa.in.net/api"
    echo "  Environment: Production"
    echo "  Signed: Yes (with upload keystore)"
    echo ""
    
    # Copy to root for easy access
    cp "$OUTPUT_PATH" "./$OUTPUT_FILE"
    echo -e "${GREEN}✅ Build also copied to: ./$OUTPUT_FILE${NC}"
    echo ""
    
    # Generate timestamp
    TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
    cp "$OUTPUT_PATH" "./yoraa-production-${TIMESTAMP}.apk"
    echo -e "${GREEN}✅ Timestamped copy: ./yoraa-production-${TIMESTAMP}.apk${NC}"
    echo ""
    
else
    echo -e "${RED}❌ Build failed!${NC}"
    echo "Check build-production.log for details"
    exit 1
fi

echo -e "${GREEN}Build log saved to: build-production.log${NC}"
echo "================================"
