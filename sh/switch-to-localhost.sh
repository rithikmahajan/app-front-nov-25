#!/bin/bash

# Switch iOS Simulator back to Localhost Backend
# Run this when you want to develop against local backend

echo "🔄 Switching to LOCALHOST backend for simulator..."
echo ""

# Backup current .env.development
if [ -f ".env.development" ]; then
    cp .env.development .env.development.backup
    echo "✅ Backed up current .env.development"
fi

# Update .env.development to use localhost
cat > .env.development << 'EOF'
# Development Environment Variables - Direct localhost connection
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true

# Razorpay Configuration (Development - LIVE KEYS for testing)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Direct localhost configuration
LOCAL_SERVER_URL=http://localhost:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://localhost:8001/api

# Proxy configuration for iOS Simulator
USE_PROXY=false
PROXY_PORT=8000

# Debug features
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Firebase (Development keys)
FIREBASE_API_KEY=your_dev_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id

# Build configuration
BUILD_TYPE=debug
EOF

echo "✅ Updated .env.development to use LOCALHOST backend"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure your local backend is running on port 8001"
echo "   2. Restart Metro bundler: npm start -- --reset-cache"
echo "   3. Rebuild app: npm run ios (or npm run android)"
echo ""
echo "💻 Local backend should be running at: http://localhost:8001"
echo ""
echo "🔄 To switch back to production, run: ./switch-to-production.sh"
