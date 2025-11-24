#!/bin/bash

# Fix Android App Registration Issues
# This script resolves "App has not been registered" errors

echo "🔧 Fixing Android App Registration Issues..."
echo ""

# Step 1: Kill all React Native processes
echo "1️⃣ Stopping all React Native processes..."
pkill -f "react-native" || true
pkill -f "metro" || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
echo "✅ Processes stopped"
echo ""

# Step 2: Clean build directories
echo "2️⃣ Cleaning build directories..."
rm -rf android/app/build
rm -rf android/build
echo "✅ Build directories cleaned"
echo ""

# Step 3: Clean Metro cache
echo "3️⃣ Cleaning Metro bundler cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*
echo "✅ Metro cache cleaned"
echo ""

# Step 4: Clean watchman (if installed)
echo "4️⃣ Cleaning Watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo "✅ Watchman cleaned"
else
    echo "ℹ️  Watchman not installed (skipping)"
fi
echo ""

# Step 5: Start Metro with reset cache
echo "5️⃣ Starting Metro bundler with cache reset..."
echo "   Metro will start in a new terminal window..."
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && npx react-native start --reset-cache"' &
sleep 5
echo "✅ Metro started"
echo ""

# Step 6: Wait for Metro to be ready
echo "6️⃣ Waiting for Metro to be ready..."
for i in {1..10}; do
    if curl -s http://localhost:8081/status | grep -q "packager-status:running"; then
        echo "✅ Metro is ready"
        break
    fi
    echo "   Waiting... ($i/10)"
    sleep 2
done
echo ""

# Step 7: Build and run Android app
echo "7️⃣ Building and running Android app..."
echo "   This may take a few minutes..."
npx react-native run-android

echo ""
echo "✅ Done! Your app should now be running on the Android emulator."
echo ""
echo "📱 If you still see the error, try:"
echo "   1. Press 'r' in the Metro terminal to reload"
echo "   2. Shake the device and select 'Reload'"
echo "   3. Restart the Android emulator completely"
