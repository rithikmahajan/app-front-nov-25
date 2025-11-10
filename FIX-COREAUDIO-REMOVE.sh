#!/bin/bash

echo "🔧 Removing CoreAudioTypes Framework Linking..."
echo ""
echo "The issue: CoreAudioTypes weak linking is causing linker errors."
echo "The solution: Remove CoreAudioTypes from OTHER_LDFLAGS entirely."
echo "Why: The Xcode 16 fix only requires ENABLE_USER_SCRIPT_SANDBOXING=NO,"
echo "     not CoreAudioTypes linking."
echo ""

cd /Users/rithikmahajan/Desktop/oct-7-appfront-main/ios

# Step 1: Backup
echo "Step 1: Backing up project.pbxproj..."
cp Yoraa.xcodeproj/project.pbxproj Yoraa.xcodeproj/project.pbxproj.backup-before-removal

# Step 2: Remove ALL CoreAudioTypes weak framework entries
echo "Step 2: Removing CoreAudioTypes from OTHER_LDFLAGS..."
sed -i '' '/"-Wl,-weak_framework,CoreAudioTypes",/d' Yoraa.xcodeproj/project.pbxproj

echo "✅ Removed all CoreAudioTypes weak framework entries"

# Step 3: Update Podfile to remove CoreAudioTypes fix
echo "Step 3: Updating Podfile..."
cat > Podfile.new << 'PODFILE_END'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.4'

use_frameworks! :linkage => :static

$RNFirebaseAsStaticFramework = true

target 'Yoraa' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => true,
    :flipper_configuration => FlipperConfiguration.disabled,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  target 'YoraaTests' do
    inherit! :complete
  end

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # XCODE 16 COMPATIBILITY FIXES
    # Fix 1: Disable user script sandboxing (required for React Native)
    # Fix 2: Set consistent deployment target
    # Fix 3: Disable ONLY_ACTIVE_ARCH for Release builds
    
    # Apply to aggregate targets (includes main app target)
    installer.aggregate_targets.each do |aggregate_target|
      aggregate_target.user_project.targets.each do |target|
        target.build_configurations.each do |config|
          # Disable sandboxing (CRITICAL for Xcode 16)
          config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
          
          # Set deployment target
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
          
          # Disable active arch only for Release
          if config.name == 'Release'
            config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
          end
        end
      end
    end
    
    # Apply to pod targets
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Disable sandboxing
        config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
        
        # Set deployment target
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
        
        # Disable active arch only for Release
        if config.name == 'Release'
          config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
        end
      end
    end
  end
end
PODFILE_END

mv Podfile.new Podfile

echo "✅ Updated Podfile (removed CoreAudioTypes fix)"

# Step 4: Reinstall pods
echo "Step 4: Reinstalling pods..."
pod install

echo ""
echo "✅ FIX COMPLETE!"
echo ""
echo "📋 Changes made:"
echo "  - Removed CoreAudioTypes from project.pbxproj OTHER_LDFLAGS"
echo "  - Updated Podfile (kept sandboxing fix, removed CoreAudioTypes)"
echo "  - Reinstalled pods"
echo ""
echo "Next: Run FINAL-PRODUCTION-BUILD.sh again"
