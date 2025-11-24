#!/bin/bash

# Quick Reload Script for Android App
# Use this to reload the app when you see errors

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "🔄 Reloading Android App..."
echo ""

# Method 1: Try programmatic reload via adb
if command -v adb &> /dev/null; then
    echo "📱 Sending reload command to emulator..."
    
    # Open dev menu
    adb shell input keyevent 82
    sleep 1
    
    # Tap on "Reload" (approximate position)
    # You may need to adjust coordinates based on your emulator
    adb shell input tap 540 1050
    
    echo "✅ Reload command sent!"
    echo "   If the app doesn't reload, manually:"
    echo "   1. Press Ctrl+M (or Cmd+M) on the emulator"
    echo "   2. Tap 'Reload'"
else
    echo "❌ ADB not found!"
    echo "   Please manually reload:"
    echo "   1. Press Ctrl+M (or Cmd+M) on the emulator"
    echo "   2. Tap 'Reload'"
fi

echo ""
echo "💡 Alternative: Go to Metro terminal and press 'r' to reload"
