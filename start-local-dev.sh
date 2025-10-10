#!/bin/bash

# Script to start local development environment
# This script starts the proxy server, Metro bundler, and iOS app in development mode

echo "🚀 Starting Local Development Environment"
echo "========================================"

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo "❌ Error: .env.development file not found!"
    echo "Please make sure you have the environment files set up."
    exit 1
fi

# Kill any existing processes on the required ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No processes found on port 3001"
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "No processes found on port 8081"

# Wait a moment for processes to clean up
sleep 2

echo ""
echo "🔄 Starting proxy server..."
# Start proxy server in background
node proxy-server.js &
PROXY_PID=$!

# Wait for proxy to start
sleep 3

echo ""
echo "📱 Starting Metro bundler..."
# Start Metro in background
npm run start:dev &
METRO_PID=$!

# Wait for Metro to start
sleep 5

echo ""
echo "🍎 Starting iOS app..."
# Start iOS app
npm run ios:dev &
IOS_PID=$!

echo ""
echo "✅ Local Development Environment Started!"
echo "========================================"
echo "🔄 Proxy Server: http://localhost:3001/api"
echo "📱 Metro Bundler: http://localhost:8081"
echo "🍎 iOS App: Starting..."
echo ""
echo "📝 Environment: Development (.env.development)"
echo "🌐 Backend Proxy: http://185.193.19.244:8000/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $PROXY_PID 2>/dev/null
    kill $METRO_PID 2>/dev/null
    kill $IOS_PID 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
