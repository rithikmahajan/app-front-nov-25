#!/bin/bash

# Android Production Build Script
# This script creates a production build for Android

set -e  # Exit on any error

echo "🚀 Starting Android Production Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Android directory exists
if [ ! -d "android" ]; then
    print_error "Android directory not found."
    exit 1
fi

print_status "Cleaning previous build artifacts..."

# Kill any running Metro processes
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# Clean node modules and reinstall
print_status "Cleaning and reinstalling node modules..."
rm -rf node_modules
npm install

# Clean Android build
print_status "Cleaning Android build artifacts..."
cd android
./gradlew clean
cd ..

print_status "Creating android-builds directory..."
mkdir -p android/app/build/outputs/apk/release
mkdir -p android/app/build/outputs/bundle/release

print_status "Building production Android app..."

# Build APK
print_status "Building APK..."
cd android
./gradlew assembleRelease

# Build AAB (Android App Bundle) for Play Store
print_status "Building AAB (Android App Bundle)..."
./gradlew bundleRelease

cd ..

print_success "🎉 Android Production Build Process Completed!"

# List the generated files
print_status "📱 Build artifacts are located in:"
echo "   APK: android/app/build/outputs/apk/release/"
echo "   AAB: android/app/build/outputs/bundle/release/"

if [ -d "android/app/build/outputs/apk/release" ]; then
    print_status "Generated APK files:"
    ls -la android/app/build/outputs/apk/release/*.apk 2>/dev/null || echo "   No APK files found"
fi

if [ -d "android/app/build/outputs/bundle/release" ]; then
    print_status "Generated AAB files:"
    ls -la android/app/build/outputs/bundle/release/*.aab 2>/dev/null || echo "   No AAB files found"
fi

print_status "📋 Next steps:"
echo "   1. Test the APK file on a physical device"
echo "   2. Upload the AAB file to Google Play Console"
echo "   3. Submit for Play Store review"

print_success "🎊 Android build completed successfully!"
