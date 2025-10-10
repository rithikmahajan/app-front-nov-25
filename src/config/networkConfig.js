/**
 * 🌐// 🚀 SIMPLIFIED: Direct localhost connection (no IP needed!)

// Network configuration for different environments and platforms
export const NetworkConfig = {
  development: {
    // Simplified localhost URLs
    IOS_URL: 'http://localhost:8001/api',                     // iOS Simulator (direct localhost)
    ANDROID_EMULATOR_URL: 'http://10.0.2.2:8001/api',        // Android Emulator (maps to localhost)
    ANDROID_DEVICE_URL: 'http://localhost:8001/api',          // Android Physical Device (try localhost first)
    WEBSOCKET_URL: 'ws://localhost:8001',
  },
  production: {
    API_URL: 'https://yoraa.in.net/api',
    WEBSOCKET_URL: 'wss://yoraa.in.net',
  }
}; Configuration Service for React Native
 * Handles platform-specific networking requirements for connecting to backend
 */

import NetInfo from '@react-native-netinfo/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// � SIMPLIFIED: Using direct localhost connection (no IP needed!)
const USE_LOCALHOST = true; // Much simpler approach!

// Network configuration for different environments and platforms
export const NetworkConfig = {
  development: {
    // React Native specific URLs - cannot use localhost!
    IOS_URL: `http://${YOUR_COMPUTER_IP}:8001/api`,           // iOS Simulator
    ANDROID_EMULATOR_URL: 'http://10.0.2.2:8001/api',        // Android Emulator  
    ANDROID_DEVICE_URL: `http://${YOUR_COMPUTER_IP}:8001/api`, // Android Physical Device
    WEBSOCKET_URL: `ws://${YOUR_COMPUTER_IP}:8001`,
  },
  production: {
    API_URL: 'https://yoraa.in.net/api',
    WEBSOCKET_URL: 'wss://yoraa.in.net',
  }
};

// Auto-detect the appropriate API URL based on platform and environment
export const getApiUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'ios') {
      return NetworkConfig.development.IOS_URL;
    } else if (Platform.OS === 'android') {
      // You can switch between emulator and device URLs as needed
      return NetworkConfig.development.ANDROID_EMULATOR_URL;
      // For physical Android device, use:
      // return NetworkConfig.development.ANDROID_DEVICE_URL;
    }
  }
  
  // Production mode
  return NetworkConfig.production.API_URL;
};

// Network connectivity checker
export const NetworkManager = {
  async checkConnection() {
    try {
      const netInfo = await NetInfo.fetch();
      return {
        isConnected: netInfo.isConnected,
        isInternetReachable: netInfo.isInternetReachable,
        connectionType: netInfo.type,
        details: netInfo.details
      };
    } catch (error) {
      console.warn('🌐 Network check failed:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        connectionType: 'unknown',
        error: error.message
      };
    }
  },

  async testBackendConnection(url = getApiUrl()) {
    console.log(`🧪 Testing backend connection: ${url}`);
    
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const isHealthy = response.ok;
      console.log(`${isHealthy ? '✅' : '❌'} Backend health check: ${response.status}`);
      
      return {
        success: isHealthy,
        status: response.status,
        url: url
      };
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return {
        success: false,
        error: error.message,
        url: url
      };
    }
  }
};

// Token management for authentication
export const TokenManager = {
  async setToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      console.log('🔐 Auth token saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving token:', error);
      return false;
    }
  },

  async getToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
      console.log('🗑️ Auth token removed');
      return true;
    } catch (error) {
      console.error('❌ Error removing token:', error);
      return false;
    }
  },

  async hasValidToken() {
    const token = await this.getToken();
    return token !== null && token.length > 0;
  }
};

// Development utilities
export const DevUtils = {
  logNetworkInfo() {
    console.log('\n🌐 NETWORK CONFIGURATION');
    console.log('========================');
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`🔗 API URL: ${getApiUrl()}`);
    console.log(`🏠 Using: Direct localhost connection`);
    console.log(`🚀 Environment: ${__DEV__ ? 'Development' : 'Production'}`);
    console.log('========================\n');
  },

  async testAllConnections() {
    console.log('🧪 Testing all network connections...\n');
    
    const urls = [
      NetworkConfig.development.IOS_URL,
      NetworkConfig.development.ANDROID_EMULATOR_URL,
      'http://localhost:8001/api', // Direct localhost test
    ];

    for (const url of urls) {
      await NetworkManager.testBackendConnection(url);
    }
  }
};

// Export the current API configuration
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  WEBSOCKET_URL: __DEV__ 
    ? NetworkConfig.development.WEBSOCKET_URL 
    : NetworkConfig.production.WEBSOCKET_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Initialize and log configuration
DevUtils.logNetworkInfo();

export default {
  NetworkConfig,
  NetworkManager,
  TokenManager,
  DevUtils,
  API_CONFIG,
  getApiUrl
};
