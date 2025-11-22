#!/bin/bash

# Test Backend Invite Friend API
# This script tests all the invite friend endpoints

echo "🧪 Testing Backend Invite Friend APIs"
echo "======================================"
echo ""

# Get JWT token from console logs
echo "📝 Instructions:"
echo "1. Open your browser console"
echo "2. Look for this log: '🔐 Making authenticated request to: ... with token: eyJhbGciOiJIUzI1NiIs...'"
echo "3. Copy the token (everything after 'token: ')"
echo ""
read -p "Enter your JWT token: " TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

BASE_URL="http://localhost:8001"

echo ""
echo "🔍 Testing all endpoints..."
echo ""

# Test 1: /api/promoCode/user/available
echo "1️⃣  Testing /api/promoCode/user/available"
echo "   This should return INVITE322 but currently returns []"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$BASE_URL/api/promoCode/user/available" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 2: /api/invite-friend/admin/all
echo "2️⃣  Testing /api/invite-friend/admin/all?status=active"
echo "   This returns 403 (admin rights required)"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$BASE_URL/api/invite-friend/admin/all?status=active" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 3: /api/invite-friend/active
echo "3️⃣  Testing /api/invite-friend/active"
echo "   This returns 404 (endpoint doesn't exist)"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$BASE_URL/api/invite-friend/active" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 4: /api/invite-friend/public
echo "4️⃣  Testing /api/invite-friend/public"
echo "   This returns 404 (endpoint doesn't exist)"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$BASE_URL/api/invite-friend/public" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

echo "======================================"
echo "🎯 SUMMARY"
echo "======================================"
echo ""
echo "✅ /api/promoCode/user/available - Returns 200 but EMPTY array"
echo "❌ /api/invite-friend/admin/all - Returns 403 (needs admin)"
echo "❌ /api/invite-friend/active - Returns 404 (doesn't exist)"
echo "❌ /api/invite-friend/public - Returns 404 (doesn't exist)"
echo ""
echo "🔧 SOLUTION:"
echo "Backend team must modify /api/promoCode/user/available to include"
echo "invite friend codes from the 'invitefriends' collection."
echo ""
echo "See URGENT_BACKEND_FIX_NEEDED.md for implementation details."
echo ""
