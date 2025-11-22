#!/bin/bash

# Fix Development Tools - Enable React Native Dev Menu
# Run this when dev tools stop working after switching environments

echo "🔧 Fixing Development Tools..."
echo ""

# 1. Stop all processes
echo "1️⃣ Stopping all React Native processes..."
pkill -f "react-native" 2>/dev/null
pkill -f "metro" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
echo "✅ Processes stopped"
echo ""

# 2. Clear all caches
echo "2️⃣ Clearing all caches..."
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-map-* 2>/dev/null
watchman watch-del-all 2>/dev/null
echo "✅ Caches cleared"
echo ""

# 3. Clear iOS build cache
echo "3️⃣ Clearing iOS build cache..."
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa 2>/dev/null
cd ..
echo "✅ iOS cache cleared"
echo ""

# 4. Ensure .env is set correctly for development
echo "4️⃣ Setting up development environment..."
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

# Development tools enabled
USE_PROXY=false
USE_HTTPS=false
SERVER_IP=localhost
SERVER_PORT=8001
HEALTH_CHECK_URL=http://localhost:8001/api/health

# Debug features - ENABLED
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Firebase
FIREBASE_API_KEY=your_dev_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id

# Build configuration - DEBUG MODE
BUILD_TYPE=debug
EOF
echo "✅ Development environment configured"
echo ""

# 5. Start Metro bundler
echo "5️⃣ Starting Metro bundler..."
echo "   Metro will start in a new terminal window"
echo ""

# 6. Show next steps
echo "📋 Next Steps:"
echo "   1. Metro bundler should be starting now"
echo "   2. Wait for Metro to show 'Dev server ready'"
echo "   3. Run: npx react-native run-ios"
echo "   4. Once app loads, shake device or press Cmd+D"
echo "   5. Dev menu should appear!"
echo ""
echo "🔍 Troubleshooting:"
echo "   • Make sure Metro is running on port 8081"
echo "   • Try: lsof -i:8081 to check"
echo "   • In simulator, press Cmd+D to open dev menu"
echo "   • Or shake device (Cmd+Ctrl+Z on simulator)"
echo ""
echo "✅ Development tools fix complete!"
echo ""

# Start Metro in background
npx react-native start --reset-cache
