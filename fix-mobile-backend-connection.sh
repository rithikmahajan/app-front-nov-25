#!/bin/bash

# ============================================
# Mobile App Backend Connection Fix Script
# Migrates from Contabo IP to Cloudflare domain
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Timestamps
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Mobile App Backend Connection Fix Script        ║${NC}"
echo -e "${CYAN}║   Migrating to Cloudflare Tunnel Domain           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

if [ ! -f "android/app/src/main/AndroidManifest.xml" ]; then
    echo -e "${RED}❌ Error: Android project not found${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Current directory:${NC} $(pwd)"
echo ""

# Step 1: Test Backend Connectivity
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📡 Step 1: Testing Backend Connectivity${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -n "Testing old Contabo IP (185.193.19.244:8080)... "
if curl -s --connect-timeout 5 http://185.193.19.244:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Responding${NC}"
    OLD_BACKEND_STATUS="working"
else
    echo -e "${RED}❌ Not responding${NC}"
    OLD_BACKEND_STATUS="dead"
fi

echo -n "Testing new Cloudflare domain (api.yoraa.in.net)... "
if curl -s --connect-timeout 5 https://api.yoraa.in.net/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Responding${NC}"
    NEW_BACKEND_STATUS="working"
    echo ""
    echo -e "${GREEN}Backend response:${NC}"
    curl -s https://api.yoraa.in.net/api/health | jq '.' 2>/dev/null || curl -s https://api.yoraa.in.net/api/health
else
    echo -e "${RED}❌ Not responding${NC}"
    NEW_BACKEND_STATUS="dead"
    echo ""
    echo -e "${RED}⚠️  WARNING: New backend is not responding!${NC}"
    echo "This fix may not work until the backend is accessible."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Fix cancelled."
        exit 1
    fi
fi

echo ""

# Step 2: Create Backups
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 Step 2: Creating Backups${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create backup directory
BACKUP_DIR="backups/backend_fix_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

echo "Backing up configuration files..."
cp .env.production "$BACKUP_DIR/.env.production"
cp src/config/environment.js "$BACKUP_DIR/environment.js"
cp src/config/apiConfig.js "$BACKUP_DIR/apiConfig.js"
cp android/app/src/main/res/xml/network_security_config.xml "$BACKUP_DIR/network_security_config.xml"

echo -e "${GREEN}✅ Backups created in:${NC} $BACKUP_DIR"
echo ""

# Step 3: Update .env.production
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📝 Step 3: Updating .env.production${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > .env.production << 'EOF'
# ================================
# 🚀 YORAA Production Environment
# Cloudflare Tunnel Configuration
# Last Updated: November 7, 2025
# ================================

# Production Backend API (via Cloudflare Tunnel)
# Same URL as website uses: https://yoraa.in → https://api.yoraa.in.net
API_BASE_URL=https://api.yoraa.in.net/api
BACKEND_URL=https://api.yoraa.in.net/api
SERVER_IP=api.yoraa.in.net
SERVER_PORT=443
HEALTH_CHECK_URL=https://api.yoraa.in.net/api/health

# Environment Configuration
APP_ENV=production
APP_NAME=YORAA
DEBUG_MODE=false
BUILD_TYPE=release

# API Timeout Configuration (milliseconds)
API_TIMEOUT=30000
CONNECT_TIMEOUT=30000

# Razorpay Configuration (Production - LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=giunOIOED3FhjWxW2dZ2peNe

# Production HTTPS connection
USE_HTTPS=true
USE_PROXY=false
PROXY_PORT=

# Debug features disabled in production
ENABLE_DEBUGGING=false
ENABLE_FLIPPER=false
SHOW_DEBUG_INFO=false

# Firebase (Production keys)
FIREBASE_API_KEY=your_prod_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_prod_google_client_id
EOF

echo -e "${GREEN}✅ .env.production updated${NC}"
echo ""

# Step 4: Update Android Network Security Config
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔧 Step 4: Updating Android Network Security Config${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<!--
  Network Security Configuration for YORAA App
  Allows HTTPS to production backend via Cloudflare tunnel
  Last Updated: November 7, 2025
-->
<network-security-config>
    <!-- Production Backend (HTTPS via Cloudflare) -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yoraa.in.net</domain>
        <domain includeSubdomains="true">yoraa.in.net</domain>
        <domain includeSubdomains="true">yoraa.in</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
    
    <!-- Local Development (HTTP allowed) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
    </domain-config>
    
    <!-- Contabo Storage (HTTPS required) -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">usc1.contabostorage.com</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
    
    <!-- Legacy Contabo IP (Keep for fallback) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">185.193.19.244</domain>
    </domain-config>
</network-security-config>
EOF

echo -e "${GREEN}✅ Android network_security_config.xml updated${NC}"
echo ""

# Step 5: Show Manual Updates Required
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚠️  Step 5: Manual Updates Required${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}The following files need manual updates:${NC}"
echo ""

echo "1️⃣  src/config/environment.js (Line 18)"
echo "   Change from:"
echo -e "   ${RED}backendUrl: Config.BACKEND_URL || Config.API_BASE_URL || 'http://185.193.19.244:8080/api',${NC}"
echo "   To:"
echo -e "   ${GREEN}backendUrl: Config.BACKEND_URL || Config.API_BASE_URL || 'https://api.yoraa.in.net/api',${NC}"
echo ""

echo "2️⃣  src/config/apiConfig.js (Line 33)"
echo "   Change from:"
echo -e "   ${RED}PRODUCTION: 'http://185.193.19.244:8080/api',${NC}"
echo "   To:"
echo -e "   ${GREEN}PRODUCTION: 'https://api.yoraa.in.net/api',${NC}"
echo ""

read -p "Press Enter to open these files for manual editing, or Ctrl+C to cancel..."
echo ""

# Step 6: Summary
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Summary${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "✅ Completed:"
echo "  • Created backups in $BACKUP_DIR"
echo "  • Updated .env.production"
echo "  • Updated android/network_security_config.xml"
echo ""

echo "⚠️  Manual Updates Needed:"
echo "  • src/config/environment.js (line 18)"
echo "  • src/config/apiConfig.js (line 33)"
echo ""

echo "🔧 Next Steps:"
echo "  1. Make the manual updates above"
echo "  2. Run: cd android && ./gradlew clean && cd .."
echo "  3. Run: rm -rf node_modules && npm install"
echo "  4. Run: npx react-native run-android --variant=release"
echo "  5. Test login and API calls"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🧪 Quick Test Commands${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Test backend is accessible:"
echo -e "${BLUE}curl https://api.yoraa.in.net/api/health${NC}"
echo ""

echo "After rebuild, check app logs:"
echo -e "${BLUE}npx react-native log-android | grep -i 'base url\\|backend\\|api'${NC}"
echo ""

echo "Expected log output:"
echo -e "${GREEN}🔧 Base URL: https://api.yoraa.in.net/api${NC}"
echo -e "${GREEN}🔧 Environment: Production${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Configuration update complete!${NC}"
echo ""
echo "Would you like to:"
echo "  [1] Open files for manual editing now"
echo "  [2] See rollback instructions"
echo "  [3] Exit"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo ""
        echo "Opening files for editing..."
        echo ""
        code src/config/environment.js
        code src/config/apiConfig.js
        echo ""
        echo "After making changes, rebuild the app using the commands above."
        ;;
    2)
        echo ""
        echo -e "${CYAN}Rollback Instructions:${NC}"
        echo ""
        echo "To restore previous configuration:"
        echo -e "${BLUE}cp $BACKUP_DIR/.env.production .env.production${NC}"
        echo -e "${BLUE}cp $BACKUP_DIR/environment.js src/config/environment.js${NC}"
        echo -e "${BLUE}cp $BACKUP_DIR/apiConfig.js src/config/apiConfig.js${NC}"
        echo -e "${BLUE}cp $BACKUP_DIR/network_security_config.xml android/app/src/main/res/xml/network_security_config.xml${NC}"
        echo ""
        echo "Then rebuild the app."
        ;;
    3)
        echo ""
        echo "Exiting. Remember to make the manual updates!"
        ;;
    *)
        echo ""
        echo "Invalid option. Exiting."
        ;;
esac

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
echo ""
