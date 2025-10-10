#!/bin/bash

# 🌐 React Native Backend Connection Setup Script
# This script helps configure your React Native app to connect to localhost:8001

echo "🚀 React Native Backend Connection Setup"
echo "========================================"

# Get IP address
echo "🔍 Finding your computer's IP address..."
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Could not automatically detect IP address"
    echo "📋 Please manually find your IP address using:"
    echo "   ifconfig | grep 'inet '"
    echo "   Look for something like: 192.168.1.xxx or 10.0.0.xxx"
    IP_ADDRESS="192.168.1.100"  # Default fallback
    echo "🔧 Using fallback IP: $IP_ADDRESS"
else
    echo "✅ Found IP address: $IP_ADDRESS"
fi

echo ""
echo "📱 React Native Configuration:"
echo "   iOS Simulator URL: http://$IP_ADDRESS:8001/api"
echo "   Android Emulator URL: http://10.0.2.2:8001/api"
echo "   Android Device URL: http://$IP_ADDRESS:8001/api"

# Update .env.development file
echo ""
echo "📝 Updating .env.development file..."

cat > .env.development << EOF
# Development Environment Variables - React Native Backend Connection
# 🚨 CRITICAL: React Native apps cannot use "localhost" - they need your computer's IP!
API_BASE_URL=http://$IP_ADDRESS:8001/api
BACKEND_URL=http://$IP_ADDRESS:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true

# Network configuration for different platforms
LOCAL_SERVER_URL=http://$IP_ADDRESS:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://$IP_ADDRESS:8001/api

# Proxy configuration (disabled for direct connection)
USE_PROXY=false
PROXY_PORT=8001

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

echo "✅ .env.development updated with IP: $IP_ADDRESS"

# Test backend connection
echo ""
echo "🧪 Testing backend connection..."

# Test localhost connection (for backend verification)
echo "Testing localhost:8001..."
if curl -s -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on localhost:8001"
else
    echo "❌ Backend is NOT running on localhost:8001"
    echo "📋 Please start your backend server first!"
fi

# Test IP address connection (for React Native)
echo "Testing $IP_ADDRESS:8001..."
if curl -s -f http://$IP_ADDRESS:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend accessible via IP address $IP_ADDRESS:8001"
else
    echo "⚠️  Backend may not be accessible via IP address"
    echo "   This could be due to firewall settings or network configuration"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Make sure your backend server is running: npm start (in backend directory)"
echo "2. Restart Metro bundler: npx react-native start --reset-cache"
echo "3. Test the React Native app connection"
echo ""
echo "💡 Troubleshooting:"
echo "• If connection fails, ensure backend is running: curl http://localhost:8001/api/health"
echo "• Check firewall settings if IP connection doesn't work"
echo "• For Android emulator, the app will use http://10.0.2.2:8001/api automatically"
echo "• For iOS Simulator, the app will use http://$IP_ADDRESS:8001/api"
echo ""
echo "🎉 Configuration complete! Your React Native app should now connect to the backend."
