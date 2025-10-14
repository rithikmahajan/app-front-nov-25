#!/bin/bash

echo "🔍 Checking Current API Configuration..."
echo ""

# Check if Metro is running
if pgrep -f "react-native start" > /dev/null; then
    echo "✅ Metro bundler is running"
else
    echo "❌ Metro bundler is NOT running"
    echo "   Run: ./restart-metro-clean.sh"
fi

echo ""
echo "📋 Current Configuration:"
echo ""

# Check environment.js
if grep -q "185.193.19.244:8080" /Users/rithikmahajan/Desktop/oct-7-appfront-main/src/config/environment.js; then
    echo "✅ environment.js → Production Server (185.193.19.244:8080)"
else
    echo "❌ environment.js → Localhost"
fi

# Check networkConfig.js
if grep -q "185.193.19.244:8080" /Users/rithikmahajan/Desktop/oct-7-appfront-main/src/config/networkConfig.js; then
    echo "✅ networkConfig.js → Production Server (185.193.19.244:8080)"
else
    echo "❌ networkConfig.js → Localhost"
fi

echo ""
echo "🧪 Test Connection to Production Server:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://185.193.19.244:8080/api/health

echo ""
echo "📱 Next Steps:"
echo "   1. Reload app: Press Cmd+R in iOS simulator"
echo "   2. Sign in with Apple/Google"
echo "   3. Watch console logs for API Request URL"
echo "   4. Verify URL contains: 185.193.19.244:8080"
echo ""
