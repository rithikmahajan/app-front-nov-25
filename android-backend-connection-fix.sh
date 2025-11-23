#!/bin/bash
# Android Backend Connection Diagnostic & Fix Script
# This script helps diagnose and fix Android emulator/device connection to local backend

echo "🔍 ANDROID BACKEND CONNECTION DIAGNOSTIC"
echo "========================================"
echo ""

# Check 1: Backend server status
echo "1️⃣ Checking if backend is running on port 8001..."
BACKEND_PID=$(lsof -ti :8001)
if [ -z "$BACKEND_PID" ]; then
    echo "❌ Backend is NOT running on port 8001"
    echo "   👉 Start your backend server first!"
    exit 1
else
    echo "✅ Backend is running (PID: $BACKEND_PID)"
    
    # Check what interface it's listening on
    LISTEN_ADDRESS=$(lsof -i :8001 -P -n | grep LISTEN | awk '{print $9}')
    echo "   Listening on: $LISTEN_ADDRESS"
    
    if echo "$LISTEN_ADDRESS" | grep -q "127.0.0.1" || echo "$LISTEN_ADDRESS" | grep -q "localhost"; then
        echo "   ⚠️  WARNING: Backend is only listening on localhost!"
        echo "   ⚠️  Android emulator CANNOT connect to localhost-only servers"
        echo "   👉 Backend must listen on 0.0.0.0 (all interfaces)"
        echo ""
        echo "   Fix: Update your backend server to listen on 0.0.0.0:8001"
        echo "   Example (Node.js): app.listen(8001, '0.0.0.0')"
        echo ""
    else
        echo "   ✅ Backend is listening on all interfaces (good for Android)"
    fi
fi
echo ""

# Check 2: Test backend connectivity from this machine
echo "2️⃣ Testing backend connectivity..."
if curl -s --max-time 5 http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is reachable via http://localhost:8001/api"
else
    echo "❌ Cannot reach backend at http://localhost:8001/api"
    echo "   👉 Check if backend is running and health endpoint exists"
fi
echo ""

# Check 3: ADB devices
echo "3️⃣ Checking connected Android devices/emulators..."
ADB_DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')
if [ "$ADB_DEVICES" -eq 0 ]; then
    echo "⚠️  No Android devices/emulators connected"
    echo "   👉 Start your Android emulator or connect your device"
else
    echo "✅ Found $ADB_DEVICES Android device(s)/emulator(s)"
    adb devices
fi
echo ""

# Check 4: ADB reverse setup (for emulator)
if [ "$ADB_DEVICES" -gt 0 ]; then
    echo "4️⃣ Setting up ADB reverse for port forwarding..."
    echo "   Running: adb reverse tcp:8001 tcp:8001"
    
    if adb reverse tcp:8001 tcp:8001 2>&1 | grep -q "error"; then
        echo "   ⚠️  ADB reverse failed (this is normal for physical devices)"
        echo "   👉 For physical devices, use your computer's local IP address"
        echo "   👉 Or ensure backend listens on 0.0.0.0"
    else
        echo "   ✅ ADB reverse configured successfully"
        echo "   ✅ Android emulator can now access localhost:8001 via 10.0.2.2:8001"
    fi
else
    echo "4️⃣ Skipping ADB reverse (no devices connected)"
fi
echo ""

# Check 5: Network configuration
echo "5️⃣ Your computer's local IP addresses:"
if command -v ipconfig &> /dev/null; then
    # macOS
    ipconfig getifaddr en0 2>/dev/null && echo "   WiFi (en0): $(ipconfig getifaddr en0)" || true
    ipconfig getifaddr en1 2>/dev/null && echo "   Ethernet (en1): $(ipconfig getifaddr en1)" || true
else
    # Linux/other
    hostname -I | awk '{print "   " $1}'
fi
echo ""

# Summary
echo "📋 CONFIGURATION SUMMARY"
echo "========================================"
echo "For Android Emulator:"
echo "  • Use URL: http://10.0.2.2:8001/api"
echo "  • Requires: Backend listening on 0.0.0.0:8001"
echo "  • ADB reverse: adb reverse tcp:8001 tcp:8001"
echo ""
echo "For Physical Android Device (on same WiFi):"
echo "  • Use URL: http://YOUR_LOCAL_IP:8001/api"
echo "  • Requires: Backend listening on 0.0.0.0:8001"
echo "  • Firewall: Allow port 8001"
echo ""
echo "Current .env.development settings:"
grep -E "API_BASE_URL|ANDROID_EMULATOR_URL" .env.development || echo "  (file not found)"
echo ""

echo "✅ Diagnostic complete!"
echo ""
echo "Next steps:"
echo "1. Ensure backend listens on 0.0.0.0:8001 (not localhost:8001)"
echo "2. Restart your backend server if you made changes"
echo "3. Rebuild your Android app: cd android && ./gradlew clean"
echo "4. Run: npx react-native run-android"
