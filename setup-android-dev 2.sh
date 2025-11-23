#!/bin/bash

# Android Development Setup Script
# Configures ADB port forwarding for local backend connection
# Last Updated: November 23, 2025

set -e

echo "🔧 Android Development Setup"
echo "=============================="
echo ""

# Find ADB
ADB_PATH=""
if command -v adb &> /dev/null; then
    ADB_PATH="adb"
elif [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"
else
    echo "❌ ADB not found!"
    echo "Please install Android SDK or add it to PATH"
    exit 1
fi

echo "✅ Found ADB: $ADB_PATH"
echo ""

# Check if device is connected
if ! $ADB_PATH devices | grep -q "device$"; then
    echo "❌ No Android device/emulator connected!"
    echo ""
    echo "Please start your Android emulator or connect your device"
    echo "Run: $ADB_PATH devices"
    exit 1
fi

echo "✅ Android device/emulator connected"
echo ""

# Configure port forwarding
echo "🔄 Configuring ADB reverse port forwarding..."
echo ""

PORTS=("8001" "8081")
for PORT in "${PORTS[@]}"; do
    if $ADB_PATH reverse tcp:$PORT tcp:$PORT; then
        echo "  ✅ Port $PORT: Android localhost:$PORT → Mac localhost:$PORT"
    else
        echo "  ⚠️  Port $PORT: Failed to configure (may already be set)"
    fi
done

echo ""
echo "🧪 Testing backend connectivity..."
echo ""

# Test backend connection
if $ADB_PATH shell "curl -s http://localhost:8001/api/health" > /dev/null 2>&1; then
    echo "✅ Backend is reachable from Android at http://localhost:8001/api"
    echo ""
    HEALTH_RESPONSE=$($ADB_PATH shell "curl -s http://localhost:8001/api/health")
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is NOT reachable!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if backend is running: lsof -i :8001"
    echo "2. Backend must listen on 0.0.0.0:8001 (not just 127.0.0.1)"
    echo "3. Try restarting the backend"
    exit 1
fi

echo ""
echo "=============================="
echo "✅ Android development setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Metro: npx react-native start"
echo "2. Run app: npx react-native run-android"
echo ""
echo "💡 Tip: Run this script whenever you restart your Android emulator"
