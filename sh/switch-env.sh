#!/bin/bash

# Environment Switcher Script
# Easily switch between local and production backends

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

echo "🔧 Environment Switcher"
echo "======================"
echo ""
echo "Current environment files:"
echo "  - .env.development (localhost:8001)"
echo "  - .env.production (185.193.19.244:8000)"
echo ""
echo "Select environment:"
echo "  1) Development (localhost)"
echo "  2) Production (remote server)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    echo "📝 Copying .env.development to .env..."
    cp "$SCRIPT_DIR/.env.development" "$ENV_FILE"
    echo "✅ Switched to DEVELOPMENT environment"
    echo "📍 Backend: http://localhost:8001/api"
    echo "🔑 Razorpay: LIVE keys (rzp_live_VRU7ggfYLI7DWV)"
    echo ""
    echo "⚠️  Make sure your local backend is running on port 8001!"
    echo ""
    echo "To start your local backend:"
    echo "  cd /path/to/backend"
    echo "  npm start"
    echo ""
    echo "🔄 Please restart Metro bundler:"
    echo "  npm start -- --reset-cache"
    ;;
  2)
    echo "📝 Copying .env.production to .env..."
    cp "$SCRIPT_DIR/.env.production" "$ENV_FILE"
    echo "✅ Switched to PRODUCTION environment"
    echo "📍 Backend: http://185.193.19.244:8000/api"
    echo "🔑 Razorpay: LIVE keys (rzp_live_VRU7ggfYLI7DWV)"
    echo ""
    echo "⚠️  WARNING: Using production server!"
    echo ""
    echo "🔄 Please restart Metro bundler:"
    echo "  npm start -- --reset-cache"
    ;;
  *)
    echo "❌ Invalid choice. Please run again and select 1 or 2."
    exit 1
    ;;
esac

echo ""
echo "Current .env content:"
cat "$ENV_FILE"
