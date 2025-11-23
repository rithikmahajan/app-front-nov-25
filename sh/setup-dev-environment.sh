#!/bin/bash

# Setup Development Environment for React Native
# This script configures port forwarding for Android and ensures Metro is accessible

echo "🚀 Setting up React Native development environment..."

# Check if Metro bundler is running
if ! lsof -ti:8081 > /dev/null; then
    echo "❌ Metro bundler is not running on port 8081"
    echo "   Please start Metro with: npx react-native start --reset-cache"
    exit 1
fi

echo "✅ Metro bundler is running on port 8081"

# Setup Android ADB reverse proxy
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Check if Android device/emulator is connected
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

if [ "$DEVICES" -gt 0 ]; then
    echo "✅ Android device/emulator found"
    
    # Setup port forwarding for Android
    echo "📱 Setting up Android port forwarding..."
    adb reverse tcp:8081 tcp:8081  # Metro bundler
    adb reverse tcp:8097 tcp:8097  # Debugging
    adb reverse tcp:8001 tcp:8001  # Backend API
    
    echo "✅ Android port forwarding configured:"
    echo "   - Metro: localhost:8081"
    echo "   - Debug: localhost:8097"
    echo "   - Backend: localhost:8001"
else
    echo "⚠️  No Android device/emulator connected"
fi

# Check if backend is running (optional)
if lsof -ti:8001 > /dev/null; then
    echo "✅ Backend server is running on port 8001"
else
    echo "⚠️  Backend server is NOT running on port 8001"
    echo "   Start your backend if needed"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "  For Android: npx react-native run-android"
echo "  For iOS: npx react-native run-ios"
echo ""
