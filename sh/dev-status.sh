#!/bin/bash

# Local Development Environment Status Check
echo "🔍 Local Development Environment Status"
echo "======================================"

# Check proxy server
if lsof -i:3001 >/dev/null 2>&1; then
    echo "✅ Proxy Server: Running on port 3001"
    echo "   📍 URL: http://localhost:3001/api"
else
    echo "❌ Proxy Server: Not running"
fi

# Check Metro bundler
if lsof -i:8081 >/dev/null 2>&1; then
    echo "✅ Metro Bundler: Running on port 8081"
    echo "   📍 URL: http://localhost:8081"
else
    echo "❌ Metro Bundler: Not running"
fi

# Check environment file
if [ -f ".env.development" ]; then
    echo "✅ Environment: .env.development found"
    echo "   📝 Current environment variables:"
    echo "   - API_BASE_URL: $(grep API_BASE_URL .env.development | cut -d'=' -f2)"
    echo "   - APP_ENV: $(grep APP_ENV .env.development | cut -d'=' -f2)"
    echo "   - DEBUG_MODE: $(grep DEBUG_MODE .env.development | cut -d'=' -f2)"
else
    echo "❌ Environment: .env.development not found"
fi

# Test proxy connectivity
echo ""
echo "🌐 Testing Proxy Connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
    echo "✅ Proxy Health Check: Passed"
else
    echo "⚠️  Proxy Health Check: Failed (proxy may not have health endpoint)"
fi

echo ""
echo "🚀 Quick Commands:"
echo "   Start Development: ./start-local-dev.sh"
echo "   iOS Development:   npm run ios:dev"
echo "   Android Development: npm run android:dev"
echo "   Stop Metro:        lsof -ti:8081 | xargs kill -9"
echo "   Stop Proxy:        lsof -ti:3001 | xargs kill -9"
