#!/bin/bash

# 🚀 React Native IP Configuration Update Script
# Usage: ./update-ip.sh YOUR_IP_ADDRESS

if [ $# -eq 0 ]; then
    echo "❌ Please provide your IP address"
    echo "Usage: ./update-ip.sh 192.168.1.100"
    echo ""
    echo "🔍 To find your IP, run in a new terminal:"
    echo "   ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo "   OR"
    echo "   ipconfig getifaddr en0"
    exit 1
fi

NEW_IP=$1
echo "🔧 Updating React Native configuration with IP: $NEW_IP"

# Validate IP format (basic check)
if [[ ! $NEW_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "❌ Invalid IP format. Please use format like: 192.168.1.100"
    exit 1
fi

echo ""
echo "📝 Updating configuration files..."

# Update .env.development
echo "1. Updating .env.development..."
sed -i.bak "s/192\.168\.1\.53/$NEW_IP/g" .env.development
echo "   ✅ .env.development updated"

# Update networkConfig.js
echo "2. Updating src/config/networkConfig.js..."
sed -i.bak "s/192\.168\.1\.53/$NEW_IP/g" src/config/networkConfig.js
echo "   ✅ networkConfig.js updated"

# Update apiConfig.js
echo "3. Updating src/config/apiConfig.js..."
sed -i.bak "s/192\.168\.1\.53/$NEW_IP/g" src/config/apiConfig.js
echo "   ✅ apiConfig.js updated"

echo ""
echo "🧪 Testing backend connection..."

# Test localhost (backend should be running here)
if curl -s -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on localhost:8001"
else
    echo "⚠️  Backend is NOT running on localhost:8001"
    echo "   Please start your backend: PORT=8001 npm start"
fi

# Test the new IP
if curl -s -f http://$NEW_IP:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend accessible via $NEW_IP:8001"
else
    echo "⚠️  Backend not accessible via $NEW_IP:8001"
    echo "   This might be due to firewall settings"
fi

echo ""
echo "🎉 Configuration Update Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Make sure backend is running: PORT=8001 npm start"
echo "2. Restart Metro bundler: npx react-native start --reset-cache"
echo "3. Your React Native app will now use: http://$NEW_IP:8001/api"
echo ""
echo "🔍 Your React Native URLs are now:"
echo "   • iOS Simulator: http://$NEW_IP:8001/api"
echo "   • Android Emulator: http://10.0.2.2:8001/api"
echo "   • Android Device: http://$NEW_IP:8001/api"
