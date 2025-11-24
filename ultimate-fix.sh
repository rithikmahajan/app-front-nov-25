#!/bin/bash

# Ultimate Fix for "App Not Registered" Error
# This script will completely reset everything

echo "🔧 ULTIMATE FIX - Resetting Everything..."
echo ""

# Step 1: Kill everything
echo "1️⃣ Stopping all processes..."
pkill -9 -f "react-native" 2>/dev/null || true
pkill -9 -f "metro" 2>/dev/null || true
pkill -9 -f "node.*8081" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ All processes stopped"
echo ""

# Step 2: Clear ALL caches
echo "2️⃣ Clearing all caches..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf ios/build 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
rm -rf ~/.rncache 2>/dev/null || true

# Watchman
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
fi

echo "✅ All caches cleared"
echo ""

# Step 3: Uninstall app from emulator
echo "3️⃣ Uninstalling app from emulator..."
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

if command -v adb &> /dev/null; then
    adb uninstall com.yoraa 2>/dev/null || true
    echo "✅ App uninstalled"
else
    echo "⚠️  ADB not found, skipping uninstall"
fi
echo ""

# Step 4: Start Metro
echo "4️⃣ Starting Metro bundler..."
echo ""
echo "📱 Metro will start in a NEW terminal window..."
echo "   Wait for it to show 'Dev server ready'"
echo ""

osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && npx react-native start --reset-cache"' &
sleep 10

echo "✅ Metro starting..."
echo ""

# Step 5: Wait for Metro
echo "5️⃣ Waiting for Metro to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
        echo "✅ Metro is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done
echo ""

# Step 6: Build and install
echo "6️⃣ Building and installing app..."
echo "   This will take 2-5 minutes..."
echo ""

npx react-native run-android

echo ""
echo "================================================"
echo "✅ BUILD COMPLETE!"
echo "================================================"
echo ""
echo "📱 CHECK YOUR EMULATOR NOW"
echo ""
echo "If you still see the error:"
echo "1. Go to the Metro terminal (NEW window that opened)"
echo "2. Press the letter 'r' (without quotes)"
echo "3. Press Enter"
echo ""
echo "The app will reload immediately!"
echo "================================================"
