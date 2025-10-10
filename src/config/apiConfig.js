/**
 * API Configuration - Direct localhost connection (Simplified)
 * Using direct localhost for easier development
 */

import environmentConfig from './environment';
import { Platform } from 'react-native';

// 🚀 SIMPLIFIED NETWORK CONFIGURATION
// Direct localhost connection - no IP address needed!
const getNetworkConfig = () => {
  if (__DEV__) {
    // Development mode - direct localhost connection
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to map to host localhost
      return {
        BASE_URL: `http://10.0.2.2:8001/api`,
      };
    } else {
      // iOS Simulator - direct localhost should work
      return {
        BASE_URL: `http://localhost:8001/api`,
      };
    }
  }
  
  // Production mode - use production URL
  return {
    BASE_URL: 'https://yoraa.in.net/api',
  };
};

// Get the appropriate network configuration
const networkConfig = getNetworkConfig();

// Simplified configuration using direct localhost
export const API_CONFIG = {
  BASE_URL: networkConfig.BASE_URL || environmentConfig.getApiUrl(),
  BACKEND_URL: networkConfig.BASE_URL || environmentConfig.getBackendUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// ✅ Confirmed working production URL options
export const PRODUCTION_URL_OPTIONS = {
  WORKING: 'http://185.193.19.244:8000/api',   // ✅ CONFIRMED WORKING (returns JSON)
  OLD_HTML: 'http://185.193.19.244:8080/api',  // ❌ Returns HTML (React frontend)
};

// Debug info using environment config
environmentConfig.log('API Configuration loaded');
environmentConfig.log(`Base URL: ${API_CONFIG.BASE_URL}`);
environmentConfig.log(`Backend URL: ${API_CONFIG.BACKEND_URL}`);
environmentConfig.log(`Environment: ${environmentConfig.env}`);

if (environmentConfig.isDevelopment) {
  environmentConfig.log('Using proxy for iOS Simulator compatibility');
} else {
  environmentConfig.log('Using production backend directly');
}

export default API_CONFIG;
