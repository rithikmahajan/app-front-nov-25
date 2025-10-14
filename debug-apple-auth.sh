#!/bin/bash

# Apple Login Authentication Debug Script
# Run this to check authentication status in your app

echo "🔍 Apple Login Authentication Debugger"
echo "======================================="
echo ""

# Check if app is running
if ! pgrep -f "YoraaApp" > /dev/null; then
    echo "❌ App is not running. Please start the app first."
    exit 1
fi

echo "✅ App is running"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📱 Checking React Native Metro logs..."
echo "-----------------------------------"
echo ""
echo "Looking for authentication status messages..."
echo ""

# Function to check logs
check_auth_logs() {
    # Check for success messages
    if tail -n 100 ~/Library/Logs/YoraaApp/*.log 2>/dev/null | grep -q "AUTHENTICATED ✅"; then
        echo -e "${GREEN}✅ Found AUTHENTICATED status in logs${NC}"
        return 0
    fi
    
    # Check for warning messages
    if tail -n 100 ~/Library/Logs/YoraaApp/*.log 2>/dev/null | grep -q "NOT AUTHENTICATED"; then
        echo -e "${RED}❌ Found NOT AUTHENTICATED status in logs${NC}"
        return 1
    fi
    
    # Check for backend auth messages
    if tail -n 100 ~/Library/Logs/YoraaApp/*.log 2>/dev/null | grep -q "Backend token verification: TOKEN EXISTS"; then
        echo -e "${GREEN}✅ Backend token exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not find backend token verification${NC}"
    fi
    
    return 2
}

echo "Recent Authentication Logs:"
echo "-----------------------------------"

# Try to get recent logs
if command -v react-native &> /dev/null; then
    echo "Checking Metro bundler logs..."
    # This will show the last 50 lines of relevant logs
    tail -n 50 node_modules/.metro/log.txt 2>/dev/null | grep -E "Apple|Authentication|AUTHENTICATED|Backend" || echo "No Metro logs found"
fi

echo ""
echo "-----------------------------------"
echo ""

# Instructions
echo "📋 Manual Testing Checklist:"
echo "-----------------------------------"
echo "1. Open the app and log in with Apple"
echo "2. Watch for these console messages:"
echo "   ${GREEN}✅ Successfully authenticated with Yoraa backend${NC}"
echo "   ${GREEN}✅ Backend token verification: TOKEN EXISTS${NC}"
echo "   ${GREEN}✅ Final authentication status: AUTHENTICATED${NC}"
echo ""
echo "3. After login, check if you can:"
echo "   - Access your profile"
echo "   - View rewards"
echo "   - Add items to favorites"
echo "   - Proceed to checkout"
echo ""
echo "4. Background the app, then bring it back:"
echo "   - Watch for: ${GREEN}Auth status after reinitialization: AUTHENTICATED ✅${NC}"
echo ""

# Check AsyncStorage (if possible)
echo "💾 Checking stored authentication data..."
echo "-----------------------------------"

# For iOS Simulator
SIMULATOR_DIR="$HOME/Library/Developer/CoreSimulator/Devices"

if [ -d "$SIMULATOR_DIR" ]; then
    echo "Found iOS Simulator directory"
    
    # Find the most recently modified device
    RECENT_DEVICE=$(find "$SIMULATOR_DIR" -name "Documents" -type d | grep -i yoraa | head -1)
    
    if [ -n "$RECENT_DEVICE" ]; then
        STORAGE_DIR=$(dirname "$RECENT_DEVICE")/Library/Preferences
        echo "Checking AsyncStorage at: $STORAGE_DIR"
        
        # Check for authentication tokens
        if [ -f "$STORAGE_DIR/RCTAsyncLocalStorage_V1" ]; then
            echo "Found AsyncStorage database"
            
            # Try to check for tokens (requires sqlite3)
            if command -v sqlite3 &> /dev/null; then
                TOKEN_CHECK=$(sqlite3 "$STORAGE_DIR/RCTAsyncLocalStorage_V1" "SELECT key FROM catalystLocalStorage WHERE key LIKE '%token%' OR key LIKE '%auth%'" 2>/dev/null)
                
                if [ -n "$TOKEN_CHECK" ]; then
                    echo -e "${GREEN}✅ Found authentication data in storage:${NC}"
                    echo "$TOKEN_CHECK"
                else
                    echo -e "${YELLOW}⚠️  No authentication tokens found in storage${NC}"
                fi
            fi
        fi
    fi
fi

echo ""
echo "🎯 Quick Verification Commands:"
echo "-----------------------------------"
echo "To check Xcode console logs:"
echo "  ${YELLOW}Open Xcode -> Window -> Devices and Simulators -> View Device Logs${NC}"
echo ""
echo "To check Metro bundler:"
echo "  ${YELLOW}Look at the terminal where you ran 'npx react-native start'${NC}"
echo ""
echo "To check app logs in real-time:"
echo "  ${YELLOW}xcrun simctl spawn booted log stream --predicate 'process == \"YoraaApp\"'${NC}"
echo ""

echo "🔧 Troubleshooting:"
echo "-----------------------------------"
echo "If authentication fails:"
echo "1. Check backend server: ${YELLOW}curl http://185.193.19.244:8001/health${NC}"
echo "2. Clear app data: ${YELLOW}Settings -> YoraaApp -> Reset${NC}"
echo "3. Check logs for specific errors"
echo "4. Verify Firebase configuration"
echo ""

echo "✅ Debug script complete!"
echo ""
