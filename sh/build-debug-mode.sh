#!/bin/bash

# Build in DEBUG mode with dev tools enabled
# Ensures proper debug configuration for React Native

echo "🔨 Building in DEBUG mode..."
echo ""

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Stop Metro if running
echo "Stopping existing Metro..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
echo ""

# Clean build to ensure DEBUG scheme
echo "Cleaning previous builds..."
cd ios
rm -rf build
xcodebuild clean -workspace Yoraa.xcworkspace -scheme Yoraa -configuration Debug
cd ..
echo "✅ Clean complete"
echo ""

# Start Metro in background
echo "Starting Metro bundler..."
npx react-native start --reset-cache &
METRO_PID=$!
echo "Metro PID: $METRO_PID"
echo ""

# Wait for Metro to be ready
echo "Waiting for Metro to start..."
sleep 5
echo ""

# Build and run in DEBUG configuration
echo "Building app in DEBUG mode..."
npx react-native run-ios \
  --simulator="iPad Pro (12.9-inch) (5th generation)" \
  --mode Debug \
  --verbose

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 Dev Tools Access:"
echo "   • Press Cmd+D (⌘+D) in simulator"
echo "   • Or shake device: Cmd+Ctrl+Z (⌘+⌃+Z)"
echo "   • In Metro terminal: Press 'd'"
echo ""
echo "🔍 If dev menu doesn't open:"
echo "   1. Check that app is in DEBUG mode (not Release)"
echo "   2. Ensure Metro is running on port 8081"
echo "   3. Try reloading: Press 'r' in Metro terminal"
echo "   4. Or run: ./fix-dev-tools.sh"
