#!/bin/bash

# Enable Fast Refresh and Dev Tools in Simulator
# For React Native 0.80+ with New Architecture (Bridgeless)

echo "🔧 Enabling Fast Refresh and Dev Tools..."

SIMULATOR_ID="8E52B2F3-D349-4FE5-B47B-E67F8903A65B"
BUNDLE_ID="com.yoraaapparelsprivatelimited.yoraa"

# Check if Metro is running
if ! lsof -ti:8081 > /dev/null 2>&1; then
    echo "❌ Metro bundler is not running!"
    echo "📦 Starting Metro bundler..."
    npm start -- --reset-cache &
    sleep 5
else
    echo "✅ Metro bundler is running on port 8081"
fi

# Check if simulator is booted
SIM_STATE=$(xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -o "Booted\|Shutdown")
if [ "$SIM_STATE" != "Booted" ]; then
    echo "📱 Booting iPad Air simulator..."
    xcrun simctl boot "$SIMULATOR_ID"
    sleep 3
fi

echo ""
echo "🎯 To Enable Fast Refresh:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Method 1: Press Cmd+D in simulator, then:"
echo "   - Tap 'Enable Fast Refresh'"
echo ""
echo "Method 2: Shake gesture (Cmd+Ctrl+Z), then:"
echo "   - Select 'Enable Fast Refresh'"
echo ""
echo "Method 3: Press 'd' in this terminal, then:"
echo "   - Enable Fast Refresh option"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to reload the app to reconnect to Metro
echo "🔄 Reloading app to connect to Metro..."
xcrun simctl terminate "$SIMULATOR_ID" "$BUNDLE_ID" 2>/dev/null
sleep 1
xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Troubleshooting:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "If dev menu doesn't open:"
echo "1. Try Cmd+D multiple times"
echo "2. Try Cmd+Ctrl+Z (shake gesture)"
echo "3. Check app is connected: Look for 'Connected to dev server' message"
echo "4. Rebuild app: npx react-native run-ios --simulator='iPad Air 11-inch (M3)'"
echo ""
echo "If Fast Refresh still not working:"
echo "1. Make sure you see Fast Refresh enabled in dev menu"
echo "2. Try making a code change (add a comment)"
echo "3. Save the file and watch Metro terminal"
echo "4. Should see 'Reloading...' message"
echo ""
