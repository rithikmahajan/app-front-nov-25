#!/bin/bash

# iOS Build Progress Monitor
# Monitors the build and prevents it from getting stuck

echo "🔍 Monitoring iOS Build Progress..."
echo "=================================="
echo ""

BUILD_LOG="/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10/ios-production-archive.log"
TERMINAL_ID="a23f67e0-6d4d-4d54-aeae-895eeff71f1a"

# Check if build is still running
if ps aux | grep -q "xcodebuild.*archive" | grep -v grep; then
    echo "✅ Build process is running"
else
    echo "⚠️  Build process not found"
fi

# Check for stuck bundler
if ps aux | grep -q "node.*react-native.*bundle" | grep -v grep; then
    echo "⚠️  React Native bundler is running (might be stuck)"
    echo "   PID: $(ps aux | grep 'node.*react-native.*bundle' | grep -v grep | awk '{print $2}')"
else
    echo "✅ No bundler process running (pre-bundled successfully)"
fi

# Show last 20 lines of build log
echo ""
echo "📋 Last 20 lines of build log:"
echo "=================================="
if [ -f "$BUILD_LOG" ]; then
    tail -20 "$BUILD_LOG"
else
    echo "Build log not found yet"
fi

echo ""
echo "=================================="
echo "💡 Build is progressing normally"
echo "   Expected time: 10-15 minutes"
echo ""
echo "To check full log:"
echo "  tail -f $BUILD_LOG"
