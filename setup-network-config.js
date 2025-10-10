/**
 * 🌐 Network Configuration Helper for React Native
 * This script helps you find your computer's IP address for backend connection
 */

const { exec } = require('child_process');
const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  console.log('🔍 Finding your computer\'s IP address for React Native...\n');
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const connection of networkInterface) {
      // Skip loopback and non-IPv4 addresses
      if (connection.family === 'IPv4' && !connection.internal) {
        console.log(`📡 Network Interface: ${interfaceName}`);
        console.log(`🌐 IP Address: ${connection.address}`);
        console.log(`📱 React Native URL: http://${connection.address}:8001/api\n`);
        
        return connection.address;
      }
    }
  }
  
  return null;
}

function generateEnvFile(ipAddress) {
  if (!ipAddress) {
    console.log('❌ Could not find IP address automatically');
    console.log('📋 Please manually find your IP and update .env.development');
    return;
  }
  
  const envContent = `# Development Environment Variables - React Native Backend Connection
# 🚨 CRITICAL: React Native apps cannot use "localhost" - they need your computer's IP!
API_BASE_URL=http://${ipAddress}:8001/api
BACKEND_URL=http://${ipAddress}:8001/api
APP_ENV=development
APP_NAME=YORAA Dev
DEBUG_MODE=true

# Network configuration for different platforms
LOCAL_SERVER_URL=http://${ipAddress}:8001/api
ANDROID_EMULATOR_URL=http://10.0.2.2:8001/api
IOS_SIMULATOR_URL=http://${ipAddress}:8001/api

# Proxy configuration (disabled for direct connection)
USE_PROXY=false
PROXY_PORT=8001

# Debug features
ENABLE_DEBUGGING=true
ENABLE_FLIPPER=true
SHOW_DEBUG_INFO=true

# Firebase (Development keys)
FIREBASE_API_KEY=your_dev_firebase_key
GOOGLE_SIGNIN_WEB_CLIENT_ID=your_dev_google_client_id

# Build configuration
BUILD_TYPE=debug
`;

  console.log('📄 Generated environment configuration:');
  console.log('='.repeat(50));
  console.log(envContent);
  console.log('='.repeat(50));
  
  return { ipAddress, envContent };
}

function testBackendConnection(ipAddress) {
  console.log(`🧪 Testing backend connection to ${ipAddress}:8001...\n`);
  
  const testCommands = [
    `curl -s -o /dev/null -w "%{http_code}" http://${ipAddress}:8001/api/health`,
    `curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/health`
  ];
  
  testCommands.forEach((cmd, index) => {
    const label = index === 0 ? 'Network IP' : 'Localhost';
    console.log(`Testing ${label}: ${cmd.split(' ').pop()}`);
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${label}: Connection failed`);
      } else {
        const statusCode = stdout.trim();
        if (statusCode === '200') {
          console.log(`✅ ${label}: Backend responding (HTTP ${statusCode})`);
        } else {
          console.log(`⚠️ ${label}: HTTP ${statusCode}`);
        }
      }
    });
  });
}

// Main execution
console.log('🚀 React Native Backend Connection Setup\n');

const ipAddress = getLocalIPAddress();
const config = generateEnvFile(ipAddress);

if (config) {
  console.log('\n📋 Next Steps:');
  console.log('1. Update your .env.development file with the IP address above');
  console.log('2. Restart Metro bundler: npx react-native start --reset-cache'); 
  console.log('3. Make sure your backend is running on localhost:8001');
  console.log('4. Test the connection from React Native app\n');
  
  // Test the connection
  testBackendConnection(config.ipAddress);
  
  console.log('\n💡 Troubleshooting:');
  console.log('• If connection fails, check if backend is running: curl http://localhost:8001/api/health');
  console.log('• For Android emulator, use: http://10.0.2.2:8001/api');
  console.log('• For physical devices, ensure they\'re on the same WiFi network');
  console.log('• Check firewall settings if connection is blocked\n');
}
