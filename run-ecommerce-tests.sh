#!/bin/bash

# 🛍️ E-Commerce Test Suite - Quick Run Script
# This script runs the comprehensive e-commerce tests against production backend

echo "================================================================================"
echo "🛍️  YORAA E-Commerce Test Suite"
echo "   Industry Standard Testing (H&M, Zara Level)"
echo "   Backend: https://api.yoraa.in.net"
echo "================================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Check if backend is accessible
echo "🔍 Checking backend connectivity..."
if curl -s --head --request GET https://api.yoraa.in.net/api/health | grep "200" > /dev/null; then 
    echo -e "${GREEN}✅ Backend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Cannot reach backend. Tests may fail.${NC}"
    echo "   Please ensure https://api.yoraa.in.net is accessible"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "================================================================================"
echo "📋 Test Configuration Checklist"
echo "================================================================================"
echo ""
echo "Before running tests, ensure you've updated:"
echo "  1. ✏️  Test user credentials (phone number, email, password)"
echo "  2. ✏️  Test product IDs from your backend"
echo "  3. ✏️  Promo codes (if testing promo code functionality)"
echo ""
echo "Configuration file: COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js"
echo ""

read -p "Have you updated the test configuration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Please update the TEST_CONFIG section in COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js${NC}"
    echo ""
    echo "Required updates:"
    echo "  • testUsers.phone.phoneNumber"
    echo "  • testUsers.email.email and password"
    echo "  • testProducts.basic, withSizes, bundle (get from backend)"
    echo ""
    exit 1
fi

echo ""
echo "================================================================================"
echo "🚀 Starting Test Suite..."
echo "================================================================================"
echo ""

# Run the tests
node COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "================================================================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🎉 Your app meets industry standards (H&M, Zara level)"
    echo ""
    echo "Next steps:"
    echo "  1. Review the test report above"
    echo "  2. Check for any warnings"
    echo "  3. Run manual tests for skipped items (Apple Sign In, Google Sign In)"
    echo "  4. Test on real devices (iOS and Android)"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "📝 Review the test results above to identify issues"
    echo ""
    echo "Common fixes:"
    echo "  • Check backend is running and accessible"
    echo "  • Verify test user credentials are correct"
    echo "  • Ensure product IDs exist in backend"
    echo "  • Check Firebase configuration"
    echo ""
    echo "Need help? Check ECOMMERCE_TEST_SUITE_README.md"
fi

echo "================================================================================"
echo ""

exit $TEST_EXIT_CODE
