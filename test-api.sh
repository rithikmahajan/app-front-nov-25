#!/bin/bash

echo "🧪 Testing API Configuration..."
echo ""

# Test 1: Direct backend access
echo "1️⃣ Testing direct backend access..."
BACKEND_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://185.193.19.244:8000/api/categories" --max-time 5)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Direct backend: WORKING ($BACKEND_STATUS)"
else
    echo "❌ Direct backend: FAILED ($BACKEND_STATUS)"
fi

# Test 2: Proxy server access
echo ""
echo "2️⃣ Testing proxy server access..."
PROXY_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3001/api/categories" --max-time 5)
if [ "$PROXY_STATUS" = "200" ]; then
    echo "✅ Proxy server: WORKING ($PROXY_STATUS)"
else
    echo "❌ Proxy server: FAILED ($PROXY_STATUS)"
fi

# Test 3: Check proxy health
echo ""
echo "3️⃣ Testing proxy health endpoint..."
HEALTH_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3001/health" --max-time 5)
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Proxy health: WORKING ($HEALTH_STATUS)"
else
    echo "❌ Proxy health: FAILED ($HEALTH_STATUS)"
fi

# Test 4: Get sample data
echo ""
echo "4️⃣ Sample data from proxy:"
curl -s "http://localhost:3001/api/categories" | jq '.data[0].name' 2>/dev/null || echo "Categories data retrieved (jq not available for formatting)"

echo ""
echo "🏁 Test completed!"
