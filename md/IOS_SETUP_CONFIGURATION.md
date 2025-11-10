# iOS Setup Configuration Guide
**Documentation for resolving Error Code 65 and setting up iOS dependencies**

## 📋 Table of Contents
- [Environment Versions](#environment-versions)
- [Ruby Setup](#ruby-setup)
- [CocoaPods Configuration](#cocoapods-configuration)
- [Podfile Configuration](#podfile-configuration)
- [Node.js Configuration](#nodejs-configuration)
- [Xcode Configuration](#xcode-configuration)
- [Key Dependencies](#key-dependencies)
- [Build Settings](#build-settings)
- [Troubleshooting Error Code 65](#troubleshooting-error-code-65)

---

## 🔧 Environment Versions

### Current Working Configuration
```bash
Ruby:        3.2.2
CocoaPods:   1.16.2
Node.js:     v22.18.0
npm:         10.9.3
Xcode:       16.4 (Build 16F6)
React Native: 0.80.2
iOS Min Version: 13.4 (or as defined in react-native)
```

---

## 💎 Ruby Setup

### Ruby Version
- **Version**: 3.2.2 (2023-03-30 revision e51014f9c0)
- **Architecture**: arm64-darwin24 (Apple Silicon)

### How to Set Ruby Version in New Project

#### Option 1: Using `.ruby-version` file
Create a `.ruby-version` file in your project root:
```bash
echo "3.2.2" > .ruby-version
```

#### Option 2: Using rbenv
```bash
# Install rbenv (if not installed)
brew install rbenv ruby-build

# Install Ruby 3.2.2
rbenv install 3.2.2

# Set local Ruby version
rbenv local 3.2.2

# Verify installation
ruby --version
```

#### Option 3: Using RVM
```bash
# Install RVM (if not installed)
\curl -sSL https://get.rvm.io | bash -s stable

# Install Ruby 3.2.2
rvm install 3.2.2

# Use Ruby 3.2.2
rvm use 3.2.2 --default

# Verify installation
ruby --version
```

---

## 📦 CocoaPods Configuration

### CocoaPods Version
- **Version**: 1.16.2

### Installing CocoaPods
```bash
# Install CocoaPods globally
sudo gem install cocoapods -v 1.16.2

# Or without sudo (recommended)
gem install cocoapods -v 1.16.2

# Verify installation
pod --version
```

### Creating Gemfile (Recommended for Version Locking)
Create a `Gemfile` in your `ios/` directory:

```ruby
source 'https://rubygems.org'

gem 'cocoapods', '1.16.2'
gem 'fastlane'
```

Then install:
```bash
cd ios
bundle install
bundle exec pod install
```

---

## 📝 Podfile Configuration

### Complete Podfile Setup

Create or update `ios/Podfile`:

```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
def node_require(script)
  require Pod::Executable.execute_command('node', ['-p',
    "require.resolve(
      '#{script}',
      {paths: [process.argv[1]]},
    )", __dir__]).strip
end

node_require('react-native/scripts/react_native_pods.rb')
node_require('react-native-permissions/scripts/setup.rb')

project 'YourApp.xcodeproj'

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Setup permissions for react-native-permissions
setup_permissions([
  'Camera',
  'Microphone',
  'SpeechRecognition',
])

# Firebase iOS SDK v9+ requires use_frameworks with static linkage
use_frameworks! :linkage => :static

# Enable Static Frameworks for Firebase
$RNFirebaseAsStaticFramework = true

# Enable modular headers for Firebase compatibility
use_modular_headers!

target 'YourApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Firebase dependencies
  pod 'FirebaseAppCheck'
  pod 'RecaptchaEnterprise'

  post_install do |installer|
    # https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/react_native_pods.rb#L197-L202
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      # :ccache_enabled => true
    )
    
    # Fix for Hermes dSYM generation
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Ensure debug information format is set to dwarf-with-dsym for release builds
        if config.name == 'Release'
          config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
          config.build_settings['GENERATE_DSYM'] = 'YES'
        end
        
        # Specific fix for Hermes framework
        if target.name == 'hermes-engine'
          config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
          config.build_settings['GENERATE_DSYM'] = 'YES'
          config.build_settings['STRIP_INSTALLED_PRODUCT'] = 'NO'
        end
      end
    end
  end
end
```

### Key Podfile Settings Explained

1. **`use_frameworks! :linkage => :static`**
   - Required for Firebase iOS SDK v9+
   - Uses static frameworks instead of dynamic

2. **`$RNFirebaseAsStaticFramework = true`**
   - Ensures React Native Firebase uses static frameworks
   - Critical for Firebase compatibility

3. **`use_modular_headers!`**
   - Enables modular headers for better Firebase compatibility
   - Helps prevent header conflicts

4. **Post Install Hooks**
   - Configures dSYM generation for crash reporting
   - Fixes Hermes engine build settings
   - Essential for Release builds

---

## 🔵 Node.js Configuration

### Node Version Management

#### Current Version
```bash
Node.js: v22.18.0
npm: 10.9.3
```

#### Setting Up Node Version

**Option 1: Create `.nvmrc` file**
```bash
echo "22.18.0" > .nvmrc
```

**Option 2: Using nvm**
```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 22.18.0
nvm install 22.18.0

# Use Node 22.18.0
nvm use 22.18.0

# Set as default
nvm alias default 22.18.0
```

### `.xcode.env` Configuration

Create or update `ios/.xcode.env`:

```bash
# This `.xcode.env` file is versioned and is used to source the environment
# used when running script phases inside Xcode.
# To customize your local environment, you can create an `.xcode.env.local`
# file that is not versioned.

# NODE_BINARY variable contains the PATH to the node executable.
#
# Customize the NODE_BINARY variable here.
# For example, to use nvm with brew, add the following line
# . "$(brew --prefix nvm)/nvm.sh" --no-use
export NODE_BINARY=$(command -v node)
```

**For nvm users**, update to:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export NODE_BINARY=$(command -v node)
```

---

## 🍎 Xcode Configuration

### Xcode Version
- **Version**: 16.4
- **Build**: 16F6

### Command Line Tools
Ensure Xcode Command Line Tools are installed and configured:
```bash
# Install Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer

# Set Xcode path (if multiple Xcode versions)
sudo xcode-select --switch /Applications/Xcode.app
```

### Build Settings in Xcode

Key build settings to configure:

1. **Signing & Capabilities**
   - Team: Set your development team
   - Bundle Identifier: Unique identifier for your app

2. **Build Settings**
   - iOS Deployment Target: 13.4 or higher
   - Enable Bitcode: NO
   - Debug Information Format (Release): DWARF with dSYM File
   - Generate Debug Symbols: YES

3. **Build Phases**
   - Ensure "Bundle React Native code and images" script is present
   - Script should reference `node` from `.xcode.env`

---

## 📚 Key Dependencies

### Main Dependencies from package.json

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.80.2",
    "@react-native-firebase/app": "^23.4.0",
    "@react-native-firebase/auth": "^23.4.0",
    "@react-native-firebase/messaging": "^23.4.0",
    "@react-native-google-signin/google-signin": "^15.0.0",
    "@invertase/react-native-apple-authentication": "^2.4.1",
    "@react-native-async-storage/async-storage": "^1.24.0",
    "react-native-permissions": "^5.4.2",
    "react-native-vision-camera": "^4.7.2"
  }
}
```

### Critical iOS Pods (from Podfile.lock)

```
Firebase/Auth:           12.3.0
Firebase/Messaging:      12.3.0
FirebaseAppCheck:        12.3.0
RecaptchaEnterprise:     Latest
RNGoogleSignin:          Latest
RNAppleAuthentication:   Latest
RNPermissions:           Latest
VisionCamera:            Latest
```

---

## 🛠 Build Settings

### Post-Install Build Settings

These are automatically applied via the Podfile post_install hook:

```ruby
# For Release builds
DEBUG_INFORMATION_FORMAT = 'dwarf-with-dsym'
GENERATE_DSYM = 'YES'

# For Hermes engine specifically
STRIP_INSTALLED_PRODUCT = 'NO'
```

### Manual Build Settings Checklist

If Error Code 65 persists, manually verify in Xcode:

1. **Build Settings → Search "bitcode"**
   - Enable Bitcode: NO

2. **Build Settings → Search "dsym"**
   - Debug Information Format (Release): DWARF with dSYM File

3. **Build Settings → Search "strip"**
   - Strip Debug Symbols During Copy: NO (for Debug), YES (for Release)

4. **Build Settings → Search "framework"**
   - Always Embed Swift Standard Libraries: YES

---

## 🚨 Troubleshooting Error Code 65

### Error Code 65 - Common Causes & Solutions

#### 1. Pod Installation Issues
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods/ Podfile.lock
pod cache clean --all
pod deintegrate
pod install --repo-update
```

#### 2. Derived Data Cleanup
```bash
# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean React Native cache
cd ..
npm start -- --reset-cache
```

#### 3. Node Modules Cleanup
```bash
# From project root
rm -rf node_modules
rm package-lock.json
npm install

# Reinstall pods
cd ios
pod install
```

#### 4. Xcode Build Cleanup
```bash
# From project root
cd ios
xcodebuild clean -workspace YourApp.xcworkspace -scheme YourApp
```

#### 5. Check Code Signing
- Open Xcode
- Select your target
- Go to "Signing & Capabilities"
- Ensure "Automatically manage signing" is enabled
- Verify your Team is selected

#### 6. Verify Bundle Identifier
- Must be unique and match App Store Connect
- Format: com.company.appname

#### 7. Check Build Script Phase
In Xcode → Build Phases → "Bundle React Native code and images":
```bash
set -e

WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"
REACT_NATIVE_XCODE="../node_modules/react-native/scripts/react-native-xcode.sh"

/bin/sh -c "$WITH_ENVIRONMENT $REACT_NATIVE_XCODE"
```

#### 8. Fastlane Build Command
If using Fastlane (recommended for production builds):
```bash
cd ios
bundle exec fastlane release
```

---

## 📋 Complete Setup Checklist

### For New Project Setup

- [ ] Install Ruby 3.2.2
- [ ] Install CocoaPods 1.16.2
- [ ] Install Node.js 22.18.0
- [ ] Install Xcode 16.4 and Command Line Tools
- [ ] Create `.ruby-version` file
- [ ] Create `.nvmrc` file
- [ ] Copy `Podfile` configuration
- [ ] Copy `ios/.xcode.env` configuration
- [ ] Create `ios/Gemfile` for CocoaPods version locking
- [ ] Run `npm install`
- [ ] Run `cd ios && pod install`
- [ ] Configure Xcode signing
- [ ] Set unique Bundle Identifier
- [ ] Verify build settings in Xcode
- [ ] Test build: `npx react-native run-ios`

---

## 🔄 Clean Build Process

### Step-by-Step Clean Build

```bash
# 1. Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Reinstall pods
cd ios
pod install
cd ..

# 4. Reset Metro bundler cache
npm start -- --reset-cache

# 5. Build (in new terminal)
npx react-native run-ios
```

---

## 📱 Build Commands Reference

### Development Builds
```bash
# iOS Debug build
npx react-native run-ios

# iOS with specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"

# iOS with environment file
ENVFILE=.env.development npx react-native run-ios
```

### Production Builds
```bash
# Using Fastlane (recommended)
cd ios
bundle exec fastlane release

# Using xcodebuild directly
xcodebuild -workspace ios/YourApp.xcworkspace \
  -scheme YourApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  clean build
```

---

## 🔍 Verification Commands

### Verify Installation
```bash
# Check versions
ruby --version          # Should be 3.2.2
pod --version          # Should be 1.16.2
node --version         # Should be v22.18.0
npm --version          # Should be 10.9.3
xcodebuild -version    # Should be 16.4

# Check Xcode path
xcode-select -p

# Check CocoaPods setup
cd ios
pod --version
```

---

## 📖 Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [CocoaPods Installation Guide](https://guides.cocoapods.org/using/getting-started.html)
- [Xcode Error Code 65 Guide](https://stackoverflow.com/questions/tagged/xcode+error-code-65)
- [React Native Firebase Setup](https://rnfirebase.io/)

---

## 💡 Pro Tips

1. **Use version managers**: rbenv for Ruby, nvm for Node.js
2. **Lock versions**: Use `.ruby-version`, `.nvmrc`, and `Gemfile`
3. **Clean regularly**: Run clean commands when switching branches
4. **Use Fastlane**: For consistent production builds
5. **Enable automatic signing**: Reduces signing-related errors
6. **Update Xcode**: Keep Xcode updated to latest stable version
7. **Check logs**: Read full build logs in Xcode for specific errors

---

**Last Updated**: October 13, 2025  
**Project**: YoraaApp  
**React Native Version**: 0.80.2
