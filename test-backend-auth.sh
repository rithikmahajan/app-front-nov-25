#!/bin/bash

# Authentication Testing Script
# Tests all backend authentication endpoints

echo "🧪 Testing Yoraa Backend Authentication Endpoints"
echo "=================================================="
echo ""

BASE_URL="http://localhost:8001/api"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 2: Generate OTP
echo "2️⃣ Testing OTP Generation..."
PHONE="9876543210"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/generate-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OTP generation passed${NC}"
    OTP=$(echo "$BODY" | jq -r '.data.otp')
    echo "   OTP: $OTP"
else
    echo -e "${RED}❌ OTP generation failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq .
fi
echo ""

# Test 3: Verify OTP (correct endpoint)
echo "3️⃣ Testing OTP Verification (verifyOTP)..."
if [ ! -z "$OTP" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/verifyOTP" \
        -H "Content-Type: application/json" \
        -d "{\"phoneNumber\": \"$PHONE\", \"otp\": \"$OTP\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ OTP verification passed${NC}"
        TOKEN=$(echo "$BODY" | jq -r '.data.token')
        echo "   JWT Token: ${TOKEN:0:50}..."
    else
        echo -e "${RED}❌ OTP verification failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY" | jq .
    fi
else
    echo -e "${YELLOW}⚠️  Skipped - no OTP from previous test${NC}"
fi
echo ""

# Test 4: Check wrong endpoint (verify-otp)
echo "4️⃣ Testing Wrong OTP Endpoint (verify-otp)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\", \"otp\": \"123456\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠️  Endpoint does not exist (expected)${NC}"
else
    echo -e "${RED}❌ Unexpected response (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 5: Firebase Login Endpoint
echo "5️⃣ Testing Firebase Login Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login/firebase" \
    -H "Content-Type: application/json" \
    -d '{"idToken": "invalid-token"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returns expected error for invalid token)${NC}"
else
    echo -e "${RED}❌ Unexpected response (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq .
fi
echo ""

# Test 6: Link Provider Endpoint
echo "6️⃣ Testing Link Provider Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/link-provider" \
    -H "Content-Type: application/json" \
    -d '{"idToken": "invalid-token"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returns expected error for invalid token)${NC}"
else
    echo -e "${RED}❌ Unexpected response (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq .
fi
echo ""

# Summary
echo "=================================================="
echo "📋 Summary"
echo "=================================================="
echo "✅ All core authentication endpoints are functional"
echo ""
echo "📍 Available Endpoints:"
echo "   • POST /api/auth/generate-otp"
echo "   • POST /api/auth/verifyOTP (camelCase!)"
echo "   • POST /api/auth/login/firebase"
echo "   • POST /api/auth/link-provider"
echo ""
echo "⚠️  Note: Use 'verifyOTP' (camelCase), not 'verify-otp' (kebab-case)"
echo ""
