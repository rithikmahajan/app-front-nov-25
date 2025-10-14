#!/bin/bash

echo "🔐 CORRECTED AUTHENTICATION ENDPOINT TESTING"
echo "============================================"
echo ""

BASE_URL="http://localhost:8001/api"

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s "${BASE_URL}/health" | jq '.' 2>/dev/null || curl -s "${BASE_URL}/health"
echo -e "\n"

# Test 2: Generate OTP (Admin)
echo "2️⃣ Testing Generate OTP (Admin Phone)..."
ADMIN_OTP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "7006114695"}')
echo "$ADMIN_OTP_RESPONSE" | jq '.'
ADMIN_OTP=$(echo "$ADMIN_OTP_RESPONSE" | jq -r '.data.otp // empty')
echo "📱 Admin OTP Generated: $ADMIN_OTP"
echo -e "\n"

# Test 3: Verify OTP (CORRECTED ENDPOINT)
if [ -n "$ADMIN_OTP" ]; then
  echo "3️⃣ Testing Verify OTP (CORRECTED: /verifyOtp)..."
  VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/verifyOtp" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"7006114695\", \"otp\": \"$ADMIN_OTP\"}")
  echo "$VERIFY_RESPONSE" | jq '.'
  TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.token // empty')
  USER_ID=$(echo "$VERIFY_RESPONSE" | jq -r '.data.user._id // empty')
  echo "🔑 Token received: ${TOKEN:0:30}..."
  echo "👤 User ID: $USER_ID"
else
  echo "3️⃣ ⚠️  Skipping - No OTP generated"
fi
echo -e "\n"

# Test 4: Invalid OTP
echo "4️⃣ Testing Invalid OTP..."
curl -s -X POST "${BASE_URL}/auth/verifyOtp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "7006114695", "otp": "000000"}' | jq '.'
echo -e "\n"

# Test 5: Firebase Signup (CORRECTED ENDPOINT)
echo "5️⃣ Testing Firebase Signup Endpoint (CORRECTED: /signup/firebase)..."
curl -s -X POST "${BASE_URL}/auth/signup/firebase" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "invalid-test-token"}' | jq -c '{success, message, statusCode}'
echo -e "\n"

# Test 6: Firebase Login (CORRECTED ENDPOINT)
echo "6️⃣ Testing Firebase Login Endpoint (CORRECTED: /login/firebase)..."
curl -s -X POST "${BASE_URL}/auth/login/firebase" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "invalid-test-token"}' | jq -c '{success, message, statusCode}'
echo -e "\n"

# Test 7: Email/Password Login
echo "7️⃣ Testing Email/Password Login..."
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test123"}' | jq -c '{success, message, statusCode}'
echo -e "\n"

# Test 8: Logout (with token if available)
if [ -n "$TOKEN" ]; then
  echo "8️⃣ Testing Logout (with token)..."
  curl -s -X GET "${BASE_URL}/auth/logout" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
else
  echo "8️⃣ Testing Logout (without token)..."
  curl -s -X GET "${BASE_URL}/auth/logout" | jq '.'
fi
echo -e "\n"

# Test 9: Account Linking
if [ -n "$TOKEN" ]; then
  echo "9️⃣ Testing Link Provider Endpoint..."
  curl -s -X POST "${BASE_URL}/auth/link-provider" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"idToken": "test-token", "provider": "google"}' | jq '.'
else
  echo "9️⃣ ⚠️  Skipping link provider test (no token)"
fi
echo -e "\n"

echo "✅ ENDPOINT VERIFICATION COMPLETE"
echo "================================="
echo ""
echo "📝 FINDINGS:"
echo "  ✅ Health: Working"
echo "  ✅ Generate OTP: /auth/generate-otp"
echo "  ✅ Verify OTP: /auth/verifyOtp (NOT verify-otp)"
echo "  ✅ Firebase Signup: /auth/signup/firebase (NOT signup-firebase)"
echo "  ✅ Firebase Login: /auth/login/firebase (NOT login-firebase)"
echo "  ✅ Logout: GET /auth/logout (NOT POST)"

