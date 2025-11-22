#!/bin/bash

# Quick Production Connection Verification
# Run this after app launches to verify HTTPS connection

echo "🔍 Production Connection Verification"
echo "======================================"
echo ""

# 1. Check environment files
echo "1️⃣ Environment Files:"
echo "   .env API_BASE_URL: $(grep "^API_BASE_URL=" .env | cut -d '=' -f2)"
echo "   .env BACKEND_URL: $(grep "^BACKEND_URL=" .env | cut -d '=' -f2)"
echo "   .env USE_HTTPS: $(grep "^USE_HTTPS=" .env | cut -d '=' -f2)"
echo ""

# 2. Test backend connectivity
echo "2️⃣ Testing Backend Connection:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.yoraa.in.net/api/products" --max-time 10)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ Backend reachable (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  HTTP $HTTP_CODE"
fi
echo ""

# 3. Check Metro bundler
echo "3️⃣ Metro Bundler:"
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "   ✅ Running on port 8081"
else
    echo "   ❌ Not running"
fi
echo ""

# 4. Check simulator
echo "4️⃣ Simulator:"
SIMULATOR=$(xcrun simctl list devices | grep "Booted" | head -1)
if [ -n "$SIMULATOR" ]; then
    echo "   ✅ $SIMULATOR"
else
    echo "   ❌ No simulator running"
fi
echo ""

# 5. Check app installation
echo "5️⃣ App Installation:"
if xcrun simctl listapps booted | grep -q "yoraa"; then
    echo "   ✅ Yoraa app installed"
else
    echo "   ❌ App not found"
fi
echo ""

# 6. Summary
echo "======================================"
echo "📋 Summary:"
echo ""
echo "Backend URL: https://api.yoraa.in.net/api"
echo "Protocol: HTTPS ✅"
echo "Expected Data: Products from production DB"
echo ""
echo "Next: Check Xcode Console for connection logs"
echo "      Window → Devices → Console"
echo ""
