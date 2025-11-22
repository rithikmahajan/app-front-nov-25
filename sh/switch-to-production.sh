#!/bin/bash

# Switch iOS Simulator to Production Backend
# Run this when you want to see real production data in simulator

echo "🔄 Switching to PRODUCTION backend for simulator..."
echo ""

# Backup current .env.development
if [ -f ".env.development" ]; then
    cp .env.development .env.development.backup
    echo "✅ Backed up current .env.development"
fi

# Update .env.development to use production
cat > .env.development << 'EOF'
# Development Environment - CONNECTED TO PRODUCTION BACKEND
# WARNING: You are using REAL production data!
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
APP_ENV=development
APP_NAME=YORAA Dev (Production Data)
DEBUG_MODE=true

# Razorpay Configuration (LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Production backend for all platforms
LOCAL_SERVER_URL=https://api.yoraa.in.net/api
ANDROID_EMULATOR_URL=https://api.yoraa.in.net/api
IOS_SIMULATOR_URL=https://api.yoraa.in.net/api

# Proxy configuration
USE_PROXY=false
PROXY_PORT=8000

# Debug features enabled
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Firebase
FIREBASE_API_KEY=your_dev_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id

# Build configuration
BUILD_TYPE=debug
EOF

echo "✅ Updated .env.development to use PRODUCTION backend"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Metro bundler: npm start -- --reset-cache"
echo "   2. Rebuild app: npm run ios (or npm run android)"
echo ""
echo "⚠️  WARNING: You will see REAL production data!"
echo "   - Don't create test orders"
echo "   - Don't modify production data"
echo "   - Use for viewing/testing UI only"
echo ""
echo "🔙 To switch back to localhost, run: ./switch-to-localhost.sh"
