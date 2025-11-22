#!/bin/bash

echo "🌐 Testing Network Backend Connectivity"
echo "======================================"

# Test basic connectivity
echo "1. Testing ping to 192.168.1.53..."
ping -c 2 192.168.1.53

echo ""
echo "2. Testing HTTP connection to backend..."
curl -I --connect-timeout 5 http://192.168.1.53:8000

echo ""
echo "3. Testing API health endpoint..."
curl -s http://192.168.1.53:8000/api/health | jq . 2>/dev/null || curl -s http://192.168.1.53:8000/api/health

echo ""
echo "4. Testing categories endpoint..."
curl -s http://192.168.1.53:8000/api/categories | head -3

echo ""
echo "✅ Network Backend Test Complete"
echo "=================================="
