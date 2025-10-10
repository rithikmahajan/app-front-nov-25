#!/bin/bash

# Navigate to iOS directory and install pods with microphone permission
cd ios
echo "Installing CocoaPods with Microphone permission..."
pod install
echo "Pod install completed!"
cd ..
