#!/bin/bash

echo "🔐 TESTING ALL AUTHENTICATION ENDPOINTS"
echo "========================================"
echo ""

BASE_URL="http://localhost:8001/api"

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s "${BASE_URL}/health" | jq '.' 2>/dev/null || echo "❌ Health check failed"
echo ""
echo ""

# Test 2: Generate OTP
echo "2️⃣ Testing Generate OTP..."
OTP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}')
echo "$OTP_RESPONSE" | jq '.'
OTP=$(echo "$OTP_RESPONSE" | jq -r '.data.otp // empty')
echo "Generated OTP: $OTP"
echo ""
echo ""

# Test 3: Verify OTP (if OTP was generated)
if [ -n "$OTP" ]; then
  echo "3️⃣ Testing Verify OTP..."
  VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"9876543210\", \"otp\": \"$OTP\"}")
  echo "$VERIFY_RESPONSE" | jq '.'
  TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.token // empty')
  echo "Received Token: ${TOKEN:0:50}..."
else
  echo "3️⃣ ⚠️  Skipping OTP verification (no OTP generated)"
fi
echo ""
echo ""

# Test 4: Invalid OTP
echo "4️⃣ Testing Invalid OTP..."
curl -s -X POST "${BASE_URL}/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "000000"}' | jq '.'
echo ""
echo ""

# Test 5: Invalid Phone Number Format
echo "5️⃣ Testing Invalid Phone Format..."
curl -s -X POST "${BASE_URL}/auth/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "123"}' | jq '.'
echo ""
echo ""

# Test 6: Admin Phone Number
echo "6️⃣ Testing Admin Phone Number..."
ADMIN_OTP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "7006114695"}')
echo "$ADMIN_OTP_RESPONSE" | jq '.'
ADMIN_OTP=$(echo "$ADMIN_OTP_RESPONSE" | jq -r '.data.otp // empty')
echo "Admin OTP: $ADMIN_OTP"
echo ""
echo ""

# Test 7: Logout
if [ -n "$TOKEN" ]; then
  echo "7️⃣ Testing Logout..."
  curl -s -X POST "${BASE_URL}/auth/logout" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
else
  echo "7️⃣ Testing Logout (without token)..."
  curl -s -X POST "${BASE_URL}/auth/logout" | jq '.'
fi
echo ""
echo ""

# Test 8: Check all auth routes
echo "8️⃣ Checking Available Routes..."
echo "Testing POST /api/auth/login..."
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test"}' | jq -c '{success, message, statusCode}'
echo ""

echo "Testing POST /api/auth/signup-firebase..."
curl -s -X POST "${BASE_URL}/auth/signup-firebase" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "invalid-token"}' | jq -c '{success, message, statusCode}'
echo ""

echo "Testing POST /api/auth/login-firebase..."
curl -s -X POST "${BASE_URL}/auth/login-firebase" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "invalid-token"}' | jq -c '{success, message, statusCode}'
echo ""

echo ""
echo "✅ AUTHENTICATION TESTING COMPLETE"
echo "=================================="

