#!/bin/bash

# Android Development Setup Script
# This script sets up port forwarding so Android emulator can access backend on localhost:8001

echo "🔧 Setting up Android development environment..."
echo ""

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    if [ -z "$ANDROID_HOME" ]; then
        echo "❌ Error: ADB not found and ANDROID_HOME not set"
        echo "   Please set ANDROID_HOME or add adb to your PATH"
        exit 1
    fi
    ADB="$ANDROID_HOME/platform-tools/adb"
else
    ADB="adb"
fi

# Check if emulator is running
DEVICES=$($ADB devices | grep -v "List" | grep "device$" | wc -l | xargs)
if [ "$DEVICES" -eq "0" ]; then
    echo "⚠️  No Android emulator/device connected"
    echo "   Please start your emulator first"
    exit 1
fi

echo "✅ Found $DEVICES Android device(s)"
echo ""

# Set up port forwarding
echo "🔄 Setting up port forwarding..."
echo "   Forwarding localhost:8001 (Mac) → localhost:8001 (Emulator)"

$ADB reverse tcp:8001 tcp:8001

if [ $? -eq 0 ]; then
    echo "✅ Port forwarding established"
    echo ""
    
    # Verify it's working
    echo "🧪 Testing connection..."
    
    # Test from emulator
    RESULT=$($ADB shell "curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/health 2>/dev/null")
    
    if [ "$RESULT" = "200" ]; then
        echo "✅ Backend is accessible from emulator!"
        echo ""
        echo "📱 Your Android app can now connect to:"
        echo "   http://localhost:8001/api"
        echo ""
        echo "💡 Current port forwards:"
        $ADB reverse --list
        echo ""
        echo "🚀 You're all set! Run your app:"
        echo "   npx react-native run-android"
    else
        echo "⚠️  Port forwarding set up, but backend may not be running"
        echo "   Expected status 200, got: $RESULT"
        echo ""
        echo "🔍 Check if backend is running on port 8001:"
        echo "   curl http://localhost:8001/health"
    fi
else
    echo "❌ Failed to set up port forwarding"
    exit 1
fi

echo ""
echo "ℹ️  Note: Port forwarding is reset when emulator restarts"
echo "   Run this script again after restarting the emulator"
