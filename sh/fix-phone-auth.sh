#!/bin/bash

# 🚀 Quick Fix for Phone Authentication Issues
# This script helps you fix both production and emulator phone auth errors

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        🚀 PHONE AUTHENTICATION QUICK FIX GUIDE               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}You are experiencing two different errors:${NC}"
echo ""
echo -e "${RED}Error 1 (Production):${NC} [auth/app-not-authorized]"
echo "   → Your production SHA-256 certificate is not in Firebase Console"
echo ""
echo -e "${RED}Error 2 (Emulator):${NC} [auth/missing-recaptcha-token]"
echo "   → reCAPTCHA token issue in debug/emulator builds"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

PS3='What would you like to do? '
options=(
    "Get Production SHA Certificates (Fix Error 1)"
    "Test Debug/Emulator Build (Check Error 2)"
    "Clean and Rebuild Production"
    "View Complete Fix Documentation"
    "Exit"
)

select opt in "${options[@]}"
do
    case $opt in
        "Get Production SHA Certificates (Fix Error 1)")
            echo ""
            echo -e "${BLUE}📋 Getting your production SHA certificates...${NC}"
            echo ""
            ./get-production-sha-certificates.sh
            echo ""
            echo -e "${YELLOW}⚠️  NEXT STEPS (CRITICAL):${NC}"
            echo "1. Copy the SHA-1 and SHA-256 shown above"
            echo "2. Go to: https://console.firebase.google.com/"
            echo "3. Add them to Firebase Console (see instructions above)"
            echo "4. Download updated google-services.json"
            echo "5. Replace android/app/google-services.json"
            echo "6. Wait 5-10 minutes"
            echo "7. Rebuild your production app"
            echo ""
            break
            ;;
        "Test Debug/Emulator Build (Check Error 2)")
            echo ""
            echo -e "${BLUE}🧪 Testing debug build...${NC}"
            echo ""
            echo "Starting Metro bundler with cache reset..."
            npm start -- --reset-cache &
            METRO_PID=$!
            
            echo ""
            echo "Waiting 5 seconds for Metro to start..."
            sleep 5
            
            echo ""
            echo "Running Android debug build..."
            npx react-native run-android
            
            echo ""
            echo -e "${GREEN}✅ Debug build launched!${NC}"
            echo ""
            echo "Test phone login now. You should see in logs:"
            echo "  🧪 Development build detected - disabling app verification for testing..."
            echo "  ✅ App verification DISABLED for development"
            echo ""
            echo "If you still see reCAPTCHA error, check:"
            echo "  1. Make sure it's a debug build (not release)"
            echo "  2. Check Metro logs for any errors"
            echo "  3. Try using a test phone number from Firebase Console"
            echo ""
            break
            ;;
        "Clean and Rebuild Production")
            echo ""
            echo -e "${BLUE}🧹 Cleaning and rebuilding production build...${NC}"
            echo ""
            
            echo "Step 1: Cleaning previous builds..."
            cd android
            ./gradlew clean
            cd ..
            
            echo ""
            echo "Step 2: Building release AAB..."
            cd android
            ./gradlew bundleRelease
            cd ..
            
            echo ""
            if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
                echo -e "${GREEN}✅ Production build successful!${NC}"
                echo ""
                echo "Your AAB is at:"
                echo "  android/app/build/outputs/bundle/release/app-release.aab"
                echo ""
                echo -e "${YELLOW}⚠️  BEFORE UPLOADING TO PLAY STORE:${NC}"
                echo "  1. Make sure you added SHA certificates to Firebase Console"
                echo "  2. Make sure you downloaded updated google-services.json"
                echo "  3. Wait 5-10 minutes after adding certificates"
                echo ""
            else
                echo -e "${RED}❌ Build failed!${NC}"
                echo "Check the error messages above."
                echo ""
            fi
            break
            ;;
        "View Complete Fix Documentation")
            echo ""
            echo -e "${BLUE}📖 Opening documentation...${NC}"
            echo ""
            cat PHONE_AUTH_FIX_NOV21_2025.md
            echo ""
            break
            ;;
        "Exit")
            echo ""
            echo -e "${GREEN}✅ Goodbye!${NC}"
            echo ""
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option $REPLY${NC}"
            ;;
    esac
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${CYAN}📚 For complete documentation, read:${NC}"
echo "   PHONE_AUTH_FIX_NOV21_2025.md"
echo ""
echo -e "${CYAN}🆘 Need help?${NC}"
echo "   1. Check Firebase Console for SHA certificates"
echo "   2. Verify google-services.json is updated"
echo "   3. Check logs when testing phone auth"
echo "   4. Wait 5-10 minutes after Firebase Console changes"
echo ""
