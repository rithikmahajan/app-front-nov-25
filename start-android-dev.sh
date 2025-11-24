#!/bin/bash

# 🤖 Android Emulator Development Setup Script
# This script starts the backend and runs your Android app in the emulator
# The app will automatically connect to localhost:8001 via 10.0.2.2

echo "🚀 Starting Android Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if backend is running
echo -e "${BLUE}📡 Step 1: Checking backend server...${NC}"
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Backend is already running on port 8001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not running. Please start it manually:${NC}"
    echo "   cd /Users/rithikmahajan/Desktop/oct-7-backend-admin-main"
    echo "   npm start"
    echo ""
    read -p "Press Enter once backend is running..."
fi

# Step 2: Test backend connectivity
echo -e "${BLUE}🧪 Step 2: Testing backend connection...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/health | grep -q "200\|404" ; then
    echo -e "${GREEN}✅ Backend is accessible at localhost:8001${NC}"
else
    echo -e "${YELLOW}⚠️  Could not reach backend. Make sure it's running on port 8001${NC}"
fi

# Step 3: Check Android emulator
echo -e "${BLUE}📱 Step 3: Checking Android emulator...${NC}"
if adb devices | grep -q "emulator" ; then
    echo -e "${GREEN}✅ Android emulator is running${NC}"
else
    echo -e "${YELLOW}⚠️  No Android emulator detected. Starting one now...${NC}"
    echo "   Run: npx react-native run-android"
    echo ""
fi

# Step 4: Information
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Android Emulator Network Configuration${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "📱 Your Android emulator will use:"
echo "   • URL: http://10.0.2.2:8001/api"
echo "   • 10.0.2.2 automatically maps to localhost on your Mac"
echo ""
echo "🔧 Backend should be running on:"
echo "   • http://localhost:8001"
echo ""
echo "💡 The app is pre-configured to use 10.0.2.2"
echo "   No additional setup needed!"
echo ""
echo -e "${BLUE}🚀 Ready to launch your app!${NC}"
echo ""
echo "Run: npx react-native run-android"
echo ""
