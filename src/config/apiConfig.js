/**
 * API Configuration - Direct localhost connection (Simplified)
 * Using direct localhost for easier development
 */

import environmentConfig from './environment';
import { Platform } from 'react-native';

// 🚀 PRODUCTION NETWORK CONFIGURATION
// Updated for new Docker deployment on Contabo
// FORCED TO USE PRODUCTION BACKEND
const getNetworkConfig = () => {
  // Always use production backend (commented out dev mode)
  // if (__DEV__) {
  //   // Development mode - localhost on port 8001 for local testing
  //   if (Platform.OS === 'android') {
  //     // Android emulator uses 10.0.2.2 to map to host localhost
  //     return {
  //       BASE_URL: `http://10.0.2.2:8001/api`,
  //     };
  //   } else {
  //     // iOS Simulator - direct localhost on port 8001
  //     return {
  //       BASE_URL: `http://localhost:8001/api`,
  //     };
  //   }
  // }
  
  // Production mode - PRODUCTION URL (Contabo backend on port 8000 - CORRECTED)
  return {
    BASE_URL: 'http://185.193.19.244:8000/api',
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

// ✅ Production URL Configuration (Updated October 12, 2025)
export const PRODUCTION_URL_OPTIONS = {
  PRODUCTION: 'http://185.193.19.244:8000/api',  // ✅ NEW PRODUCTION (Actual working port)
  LEGACY: 'http://185.193.19.244:8080/api',      // 📦 OLD (Docker port - not active)
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
