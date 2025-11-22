#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING DEV TOOLS - Complete Solution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will:"
echo "  1. ✅ Start Metro bundler in background"
echo "  2. ✅ Wait for Metro to be ready"
echo "  3. ✅ Reload app to connect to Metro"
echo "  4. ✅ Instructions for enabling dev tools"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10

# Kill any existing Metro
echo "🧹 Cleaning up old Metro processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 1

# Start Metro in true background (using nohup)
echo "🚀 Starting Metro bundler..."
nohup npm start -- --reset-cache > /tmp/metro-output.log 2>&1 &
METRO_PID=$!
echo "   Metro PID: $METRO_PID"

# Wait for Metro to be ready
echo "⏳ Waiting for Metro to start..."
sleep 5

# Check if Metro is running
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "✅ Metro is running on port 8081!"
    echo ""
    
    # Reload app
    echo "🔄 Reloading app to connect to Metro..."
    xcrun simctl terminate 8E52B2F3-D349-4FE5-B47B-E67F8903A65B com.yoraaapparelsprivatelimited.yoraa 2>/dev/null
    sleep 2
    xcrun simctl launch 8E52B2F3-D349-4FE5-B47B-E67F8903A65B com.yoraaapparelsprivatelimited.yoraa
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DONE! Now do this:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Wait 3 seconds for app to connect to Metro"
    echo ""
    echo "2. Click on the iPad Air simulator window"
    echo ""
    echo "3. Press Cmd+D (⌘ + D) on your keyboard"
    echo ""
    echo "4. Dev menu should appear!"
    echo ""
    echo "5. Tap 'Enable Fast Refresh'"
    echo ""
    echo "6. Make a code change and save - it should auto-reload!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Metro logs: tail -f /tmp/metro-output.log"
    echo "🛑 Stop Metro: kill $METRO_PID"
    echo ""
else
    echo "❌ Metro failed to start!"
    echo "   Check logs: cat /tmp/metro-output.log"
    exit 1
fi
