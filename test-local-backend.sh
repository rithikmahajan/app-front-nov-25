#!/bin/bash

# Test Local Backend Connection
# This script verifies that your backend is running on localhost:8001

echo "🔍 Testing Local Backend Connection..."
echo "======================================"
echo ""

# Check if backend is running
echo "1️⃣ Testing backend health endpoint..."
if curl -s -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on localhost:8001"
    echo "   Response:"
    curl -s http://localhost:8001/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8001/api/health
else
    echo "   ❌ Backend is NOT running on localhost:8001"
    echo "   Please start your backend server first!"
fi

echo ""
echo "2️⃣ Checking environment variables..."
if [ -f .env ]; then
    echo "   ✅ .env file exists"
    echo "   Current API_BASE_URL: $(grep API_BASE_URL .env | cut -d '=' -f2)"
    echo "   Current BACKEND_URL: $(grep BACKEND_URL .env | cut -d '=' -f2)"
else
    echo "   ❌ .env file not found"
fi

echo ""
echo "3️⃣ Platform-specific URLs:"
echo "   📱 iOS Simulator:     http://localhost:8001/api"
echo "   🤖 Android Emulator:  http://10.0.2.2:8001/api"
echo "   📲 Physical Device:   http://YOUR_LOCAL_IP:8001/api"

echo ""
echo "======================================"
echo "✨ To start developing:"
echo "   1. Start your backend: cd backend && npm start"
echo "   2. Start Metro bundler: npm start"
echo "   3. Run iOS: npm run ios"
echo "   4. Run Android: npm run android"
