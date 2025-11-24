#!/bin/bash

# Complete Android Development Startup Script
# This script ensures everything is set up correctly

echo "🚀 Starting Android Development Environment"
echo "=========================================="
echo ""

# Set up Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Check if backend is running
echo "1️⃣ Checking backend server..."
if lsof -i :8001 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8001"
else
    echo "⚠️  Backend is NOT running on port 8001"
    echo "   Start it with: cd /Users/rithikmahajan/Desktop/oct-7-backend-admin-main && npm start"
fi
echo ""

# Check if emulator is running
echo "2️⃣ Checking Android emulator..."
if adb devices | grep -q "device$"; then
    echo "✅ Android emulator is running"
else
    echo "❌ No Android emulator detected!"
    echo "   Please start an Android emulator first"
    exit 1
fi
echo ""

# Set up ADB reverse for Metro
echo "3️⃣ Setting up port forwarding..."
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8001 tcp:8001
echo "✅ Port forwarding configured:"
echo "   - Metro bundler: localhost:8081 → emulator"
echo "   - Backend API: localhost:8001 → emulator"
echo ""

# Check if Metro is running
echo "4️⃣ Checking Metro bundler..."
if lsof -i :8081 > /dev/null 2>&1; then
    echo "✅ Metro bundler is already running"
    echo ""
    echo "📱 To reload the app:"
    echo "   1. On emulator: Press Cmd+M → Tap 'Reload'"
    echo "   2. Or run: adb shell input keyevent 82"
else
    echo "⚠️  Metro is not running"
    echo "   Starting Metro bundler..."
    echo ""
    
    # Start Metro in background
    npx react-native start --reset-cache > /tmp/metro.log 2>&1 &
    METRO_PID=$!
    
    echo "   Waiting for Metro to start..."
    for i in {1..15}; do
        if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
            echo "✅ Metro is ready!"
            break
        fi
        sleep 2
        echo "   Still waiting... ($i/15)"
    done
fi

echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📱 Your Android emulator should now be connected to:"
echo "   - Metro Bundler: http://localhost:8081"
echo "   - Backend API: http://localhost:8001 (forwarded to emulator)"
echo ""
echo "🔄 To reload the app on emulator:"
echo "   • Press Cmd+M and tap 'Reload'"
echo "   • Or tap the 'RELOAD' button if you see it"
echo "   • Or run: ./reload-android-app.sh"
echo ""
echo "🛠️  Useful commands:"
echo "   • View Metro logs: tail -f /tmp/metro.log"
echo "   • Reload app: adb shell input keyevent 82"
echo "   • View app logs: adb logcat | grep -i ReactNative"
echo ""
echo "Happy coding! 🎉"
