#!/bin/bash

echo "🧪 Testing connection to Contabo production server..."
echo ""

# Test basic connectivity
echo "1️⃣ Testing server reachability..."
curl -v --connect-timeout 5 http://185.193.19.244:8080/api/health 2>&1 | head -20

echo ""
echo "2️⃣ Testing categories endpoint..."
curl -s http://185.193.19.244:8080/api/categories | head -100

echo ""
echo "3️⃣ Testing auth endpoint structure..."
curl -v -X POST http://185.193.19.244:8080/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}' 2>&1 | head -30

echo ""
echo "✅ Connection test complete!"
