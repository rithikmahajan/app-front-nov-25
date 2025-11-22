#!/bin/bash

echo "🧪 Testing Production Configuration..."
echo ""

# Test production backend directly (this is what TestFlight will use)
echo "1️⃣ Testing production backend (TestFlight will use this):"
PROD_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://185.193.19.244:8000/api/categories" --max-time 10)
if [ "$PROD_STATUS" = "200" ]; then
    echo "✅ Production backend: WORKING ($PROD_STATUS)"
    echo "   URL: http://185.193.19.244:8000/api"
    
    # Get sample data
    echo "   Sample categories:"
    curl -s "http://185.193.19.244:8000/api/categories" | grep -o '"name":"[^"]*"' | head -3
else
    echo "❌ Production backend: FAILED ($PROD_STATUS)"
    echo "   This will cause TestFlight version to fail!"
fi

echo ""
echo "2️⃣ Current build configuration:"
echo "   Build Version: $(grep -A 1 'CFBundleVersion' ios/YoraaApp/Info.plist | grep '<string>' | sed 's/.*<string>\(.*\)<\/string>.*/\1/')"
echo "   Bundle ID: com.yoraaapparelsprivatelimited.yoraa"

echo ""
echo "3️⃣ Network security configuration:"
if grep -q "185.193.19.244" ios/YoraaApp/Info.plist; then
    echo "✅ Production backend URL exception added to Info.plist"
else
    echo "❌ Production backend URL not found in Info.plist"
fi

echo ""
echo "4️⃣ API Configuration check:"
echo "   Development URL: http://localhost:3001/api (local proxy)"
echo "   Production URL: http://185.193.19.244:8000/api (direct backend)"

echo ""
if [ "$PROD_STATUS" = "200" ]; then
    echo "🚀 Ready for TestFlight deployment!"
    echo ""
    echo "📋 To upload to TestFlight:"
    echo "1. Run: ./build-for-testflight.sh"
    echo "2. In Xcode: Product → Archive"
    echo "3. Distribute to App Store Connect"
else
    echo "⚠️  Production backend issue detected!"
    echo "   TestFlight build will fail until backend is accessible"
fi
