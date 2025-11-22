#!/bin/bash

# Enable Debug Mode and Dev Tools for Bridgeless (New Architecture)
# This fixes dev tools not opening in React Native New Architecture

echo "🔧 Enabling Debug Mode for Bridgeless Architecture..."
echo ""

# Stop all processes
echo "1️⃣ Stopping all processes..."
pkill -f "react-native" 2>/dev/null
pkill -f "metro" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
echo "✅ Processes stopped"
echo ""

# Clear caches
echo "2️⃣ Clearing caches..."
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/metro-* 2>/dev/null
watchman watch-del-all 2>/dev/null
echo "✅ Caches cleared"
echo ""

# Configure for DEBUG build with New Architecture
echo "3️⃣ Configuring for DEBUG mode with Bridgeless..."

# Update .env for development with debug flags
cat > .env << 'EOF'
BACKEND_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
API_BASE_URL=http://localhost:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Direct localhost configuration
LOCAL_SERVER_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api

# Development tools - ALL ENABLED for bridgeless mode
USE_PROXY=false
USE_HTTPS=false
SERVER_IP=localhost
SERVER_PORT=8001
HEALTH_CHECK_URL=http://localhost:8001/api/health

# Debug features - CRITICAL for bridgeless
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Firebase
FIREBASE_API_KEY=your_dev_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id

# Build configuration - MUST BE DEBUG
BUILD_TYPE=debug
__DEV__=true
EOF

echo "✅ Environment configured for DEBUG mode"
echo ""

# Clean iOS build completely
echo "4️⃣ Cleaning iOS build..."
cd ios
rm -rf build 2>/dev/null
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa -configuration Debug 2>/dev/null
cd ..
echo "✅ iOS cleaned"
echo ""

echo "5️⃣ Starting Metro bundler..."
echo ""
echo "📋 IMPORTANT - New Architecture Dev Tools:"
echo "   • Bridgeless mode uses different dev tools"
echo "   • Press Cmd+D or shake device to open dev menu"
echo "   • If Cmd+D doesn't work, use the DevTools command below"
echo ""
echo "🔧 Alternative ways to open dev tools:"
echo "   1. In simulator: Press Cmd+D (⌘+D)"
echo "   2. Shake gesture: Press Cmd+Ctrl+Z (⌘+⌃+Z)"
echo "   3. Terminal command: 'xcrun simctl spawn booted log stream --level debug'"
echo "   4. Metro CLI: Press 'd' in Metro terminal"
echo ""
echo "📱 Next steps:"
echo "   1. Wait for Metro to start (below)"
echo "   2. In new terminal: npx react-native run-ios --mode Debug"
echo "   3. Once app loads, press Cmd+D"
echo "   4. Select 'Enable Debugging' or 'Open DevTools'"
echo ""
echo "✅ Debug mode setup complete!"
echo ""

# Start Metro with verbose logging for debugging
npx react-native start --reset-cache --verbose
