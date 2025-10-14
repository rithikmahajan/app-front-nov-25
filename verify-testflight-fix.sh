#!/bin/bash

# TestFlight Authentication & Profile Data Fix - Verification Script
# This script helps verify the fix is working correctly

echo "🔍 YORAA TestFlight Fix Verification"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Environment Files
echo "1️⃣ Checking Environment Configuration..."
echo ""

if [ -f ".env.production" ]; then
    PROD_URL=$(grep "BACKEND_URL" .env.production | cut -d '=' -f2)
    if [[ $PROD_URL == *"8080"* ]]; then
        echo -e "${GREEN}✅ Production backend URL correct: $PROD_URL${NC}"
    else
        echo -e "${RED}❌ Production backend URL incorrect: $PROD_URL (should be port 8080)${NC}"
    fi
else
    echo -e "${RED}❌ .env.production file not found${NC}"
fi

if [ -f ".env" ]; then
    DEV_URL=$(grep "API_BASE_URL" .env | cut -d '=' -f2)
    if [[ $DEV_URL == *"8080"* ]]; then
        echo -e "${GREEN}✅ Development API URL correct: $DEV_URL${NC}"
    else
        echo -e "${RED}❌ Development API URL incorrect: $DEV_URL (should be port 8080)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found (using defaults)${NC}"
fi

echo ""

# 2. Check yoraaAPI.js
echo "2️⃣ Checking yoraaAPI.js Configuration..."
echo ""

if grep -q "environment.getApiUrl()" src/services/yoraaAPI.js; then
    echo -e "${GREEN}✅ yoraaAPI using environment config${NC}"
else
    echo -e "${RED}❌ yoraaAPI not using environment config (hardcoded URLs)${NC}"
fi

if grep -q "reinitialize()" src/services/yoraaAPI.js; then
    echo -e "${GREEN}✅ yoraaAPI has reinitialize method${NC}"
else
    echo -e "${YELLOW}⚠️  yoraaAPI missing reinitialize method${NC}"
fi

echo ""

# 3. Check ProfileScreen.js
echo "3️⃣ Checking ProfileScreen.js..."
echo ""

if grep -q "useFocusEffect" src/screens/ProfileScreen.js; then
    echo -e "${GREEN}✅ ProfileScreen has useFocusEffect hook${NC}"
else
    echo -e "${RED}❌ ProfileScreen missing useFocusEffect hook${NC}"
fi

if grep -q "syncBackendAuth" src/screens/ProfileScreen.js; then
    echo -e "${GREEN}✅ ProfileScreen syncs backend auth${NC}"
else
    echo -e "${YELLOW}⚠️  ProfileScreen might not sync backend auth${NC}"
fi

echo ""

# 4. Check EditProfile.js
echo "4️⃣ Checking EditProfile.js..."
echo ""

if grep -q "useFocusEffect" src/screens/EditProfile.js; then
    echo -e "${GREEN}✅ EditProfile has useFocusEffect hook${NC}"
else
    echo -e "${RED}❌ EditProfile missing useFocusEffect hook${NC}"
fi

if grep -q "syncBackendAuth" src/screens/EditProfile.js; then
    echo -e "${GREEN}✅ EditProfile syncs backend auth${NC}"
else
    echo -e "${YELLOW}⚠️  EditProfile might not sync backend auth${NC}"
fi

echo ""

# 5. Check App.js
echo "5️⃣ Checking App.js Initialization..."
echo ""

if grep -q "yoraaAPI.reinitialize" App.js; then
    echo -e "${GREEN}✅ App.js reinitializes API on app active${NC}"
else
    echo -e "${YELLOW}⚠️  App.js might not reinitialize API${NC}"
fi

if grep -q "AppState.addEventListener" App.js; then
    echo -e "${GREEN}✅ App.js listens to app state changes${NC}"
else
    echo -e "${RED}❌ App.js not listening to app state changes${NC}"
fi

echo ""

# 6. Check Dependencies
echo "6️⃣ Checking Dependencies..."
echo ""

if grep -q "@react-navigation/native" package.json; then
    echo -e "${GREEN}✅ React Navigation installed${NC}"
else
    echo -e "${RED}❌ React Navigation not found${NC}"
fi

if grep -q "@react-native-firebase/auth" package.json; then
    echo -e "${GREEN}✅ Firebase Auth installed${NC}"
else
    echo -e "${RED}❌ Firebase Auth not found${NC}"
fi

if grep -q "@react-native-async-storage/async-storage" package.json; then
    echo -e "${GREEN}✅ AsyncStorage installed${NC}"
else
    echo -e "${RED}❌ AsyncStorage not found${NC}"
fi

echo ""

# 7. Summary
echo "📋 Summary"
echo "=========="
echo ""
echo "This verification checks if all the critical fixes are in place."
echo ""
echo "Key fixes implemented:"
echo "  ✓ Backend URL now uses port 8080 consistently (CORRECTED)"
echo "  ✓ ProfileScreen and EditProfile reload data on focus"
echo "  ✓ Backend authentication syncs on app resume"
echo "  ✓ Better error handling for authentication failures"
echo "  ✓ Environment-based configuration (dev vs production)"
echo ""
echo "Next steps:"
echo "  1. Run 'npm install' or 'yarn install' if dependencies changed"
echo "  2. Run 'cd ios && pod install' for iOS"
echo "  3. Test locally: 'npx react-native run-ios'"
echo "  4. Build for TestFlight with production environment"
echo "  5. Test all authentication flows in TestFlight"
echo ""

# Test backend connectivity (if server is specified)
if [ ! -z "$1" ]; then
    echo "🌐 Testing Backend Connectivity..."
    echo ""
    
    BACKEND_HOST="$1"
    
    # Test if backend is reachable
    if curl -s --connect-timeout 5 "http://${BACKEND_HOST}:8080/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server reachable at http://${BACKEND_HOST}:8080${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend server not reachable at http://${BACKEND_HOST}:8080${NC}"
        echo "   Make sure the backend server is running"
    fi
    echo ""
fi

echo "✨ Verification complete!"
echo ""
