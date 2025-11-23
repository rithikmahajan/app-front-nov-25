#!/bin/bash

# 🔐 Get SHA-1 and SHA-256 Certificates for Firebase
# This script extracts the certificates from your production keystore

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔐 GETTING PRODUCTION SHA CERTIFICATES FOR FIREBASE      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to android directory
cd android

# Check if keystore exists
if [ ! -f "app/upload-keystore.jks" ]; then
    echo -e "${RED}❌ Error: upload-keystore.jks not found!${NC}"
    echo ""
    echo "Expected location: android/app/upload-keystore.jks"
    exit 1
fi

echo -e "${BLUE}📍 Keystore found: app/upload-keystore.jks${NC}"
echo ""
echo -e "${YELLOW}🔑 Please enter your keystore password when prompted...${NC}"
echo ""

# Get certificate details
keytool -list -v -keystore app/upload-keystore.jks -alias upload > /tmp/cert_output.txt 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully retrieved certificates!${NC}"
    echo ""
    
    # Extract SHA1
    SHA1=$(grep "SHA1:" /tmp/cert_output.txt | head -1 | cut -d: -f2- | xargs)
    
    # Extract SHA256
    SHA256=$(grep "SHA256:" /tmp/cert_output.txt | head -1 | cut -d: -f2- | xargs)
    
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              📋 COPY THESE TO FIREBASE CONSOLE               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}SHA-1:${NC}"
    echo -e "${BLUE}$SHA1${NC}"
    echo ""
    echo -e "${GREEN}SHA-256:${NC}"
    echo -e "${BLUE}$SHA256${NC}"
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    📖 NEXT STEPS                             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1. Go to: https://console.firebase.google.com/"
    echo "2. Select project: yoraa-android-ios"
    echo "3. Click Settings ⚙️ → Project settings"
    echo "4. Find your Android app (com.yoraa)"
    echo "5. Click 'Add fingerprint'"
    echo "6. Add BOTH SHA-1 and SHA-256 (one at a time)"
    echo "7. Download updated google-services.json"
    echo "8. Replace android/app/google-services.json"
    echo ""
    echo -e "${YELLOW}⏰ Wait 5-10 minutes after adding for Firebase to propagate changes${NC}"
    echo ""
    
    # Save to file
    echo "SHA-1: $SHA1" > ../production-sha-certificates.txt
    echo "SHA-256: $SHA256" >> ../production-sha-certificates.txt
    echo ""
    echo "Date: $(date)" >> ../production-sha-certificates.txt
    
    echo -e "${GREEN}✅ Certificates also saved to: production-sha-certificates.txt${NC}"
    echo ""
else
    echo -e "${RED}❌ Error: Failed to retrieve certificates${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Wrong password"
    echo "2. Keystore file corrupted"
    echo "3. Wrong alias name"
    echo ""
    echo "Try running manually:"
    echo "cd android"
    echo "keytool -list -v -keystore app/upload-keystore.jks -alias upload"
    echo ""
    exit 1
fi

# Clean up
rm /tmp/cert_output.txt

cd ..
