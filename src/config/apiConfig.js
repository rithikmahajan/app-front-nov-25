/**
 * API Configuration - Environment-based (Uses .env files)
 * Automatically switches between local development and production
 */

import environmentConfig from './environment';

// 🎯 USE ENVIRONMENT CONFIG (respects .env.development and .env.production)
// No hardcoded URLs - everything comes from environment variables
const getNetworkConfig = () => {
  // Use environmentConfig which reads from .env files
  return {
    BASE_URL: environmentConfig.getApiUrl(),
  };
};

// Get the appropriate network configuration
const networkConfig = getNetworkConfig();

// API Configuration - Driven by environment variables
export const API_CONFIG = {
  BASE_URL: networkConfig.BASE_URL,
  BACKEND_URL: environmentConfig.getBackendUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// ✅ Production URL Configuration (Updated November 7, 2025)
export const PRODUCTION_URL_OPTIONS = {
  PRODUCTION: 'https://api.yoraa.in.net/api',    // ✅ CURRENT PRODUCTION (Cloudflare tunnel)
  LEGACY_IP: 'http://185.193.19.244:8080/api',   // 📦 OLD IP (Not publicly accessible)
  LEGACY: 'http://185.193.19.244:8000/api',      // 📦 LEGACY (Not active)
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
