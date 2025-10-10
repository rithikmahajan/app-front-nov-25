#!/bin/bash

# React Native Development Start Script with Environment Configuration
echo "📱 Starting React Native in DEVELOPMENT mode..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo -e "${YELLOW}⚠️  .env.development not found!${NC}"
    echo -e "${RED}Please ensure environment files are created${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Development Configuration:${NC}"
echo -e "  🌐 API URL: $(grep API_BASE_URL .env.development | cut -d '=' -f2)"
echo -e "  🔗 Backend URL: $(grep BACKEND_URL .env.development | cut -d '=' -f2)"
echo -e "  📱 Metro URL: http://localhost:8081"
echo -e "  🔧 Environment: Development"
echo -e "  🛠️  Debug Mode: Enabled"
echo ""

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start proxy server if USE_PROXY is enabled
USE_PROXY=$(grep USE_PROXY .env.development | cut -d '=' -f2)
if [ "$USE_PROXY" = "true" ]; then
    echo -e "${YELLOW}🔄 Starting proxy server...${NC}"
    node proxy-server.js &
    PROXY_PID=$!
    
    # Give proxy time to start
    sleep 2
    
    # Test proxy connectivity
    echo -e "${YELLOW}🧪 Testing proxy connectivity...${NC}"
    if curl -s "http://localhost:3001/health" > /dev/null; then
        echo -e "${GREEN}✅ Proxy server is running successfully${NC}"
    else
        echo -e "${RED}❌ Proxy server failed to start${NC}"
        kill $PROXY_PID 2>/dev/null || true
        exit 1
    fi
else
    echo -e "${BLUE}ℹ️  Proxy disabled - using direct backend connection${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}� Starting React Native Metro with development environment...${NC}"
ENVFILE=.env.development npm start

# Cleanup on exit
if [ ! -z "$PROXY_PID" ]; then
    trap "echo -e '${YELLOW}🧹 Shutting down...${NC}'; kill $PROXY_PID 2>/dev/null || true" EXIT
fi
