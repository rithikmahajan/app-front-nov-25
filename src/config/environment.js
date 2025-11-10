import Config from 'react-native-config';
import { Platform } from 'react-native';

class EnvironmentConfig {
  constructor() {
    // Get environment from react-native-config or fallback to __DEV__
    this.env = Config.APP_ENV || (__DEV__ ? 'development' : 'production');
    this.isDevelopment = this.env === 'development' || __DEV__;
    this.isProduction = this.env === 'production' && !__DEV__;
    
    // 🎯 API Configuration - Read from .env files
    // .env.development: API_BASE_URL=http://localhost:8001/api
    // .env.production: BACKEND_URL=https://api.yoraa.in.net/api
    this.api = {
      // Development: Read from .env.development (default: localhost:8001)
      baseUrl: Config.API_BASE_URL || Config.BACKEND_URL || 'http://localhost:8001/api',
      // Production: Read from .env.production (default: Cloudflare tunnel domain)
      backendUrl: Config.BACKEND_URL || Config.API_BASE_URL || 'https://api.yoraa.in.net/api',
    };
    
    // App Configuration
    this.app = {
      name: Config.APP_NAME || 'YORAA',
      title: this.isDevelopment ? `${Config.APP_NAME || 'YORAA'} - Dev` : (Config.APP_NAME || 'YORAA'),
    };
    
    // Debug Configuration
    this.debug = {
      enabled: Config.DEBUG_MODE === 'true' || __DEV__,
      showInfo: Config.SHOW_DEBUG_INFO === 'true' || __DEV__,
      enableFlipper: Config.ENABLE_FLIPPER === 'true' || __DEV__,
    };
    
    // Proxy Configuration
    this.proxy = {
      enabled: Config.USE_PROXY === 'true' || this.isDevelopment,
      port: Config.PROXY_PORT || '3001',
    };
    
    // Platform Configuration
    this.platform = {
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isDevice: !Config.ENABLE_DEBUGGING, // Assume device if debugging disabled
    };
    
    // Firebase Configuration
    this.firebase = {
      apiKey: Config.FIREBASE_API_KEY,
      googleClientId: Config.GOOGLE_SIGNIN_WEB_CLIENT_ID,
    };
    
    // Build Configuration
    this.build = {
      type: Config.BUILD_TYPE || 'debug',
      version: this.getAppVersion(),
    };
    
    // Log environment info on initialization
    this.logEnvironmentInfo();
  }

  /**
   * Get the appropriate API URL based on environment and platform
   * This is the SINGLE SOURCE OF TRUTH for API URLs
   */
  getApiUrl() {
    if (this.isDevelopment) {
      // Development mode - use localhost backend from .env.development
      if (this.platform.isAndroid) {
        // Android emulator uses 10.0.2.2 to access host machine
        const url = this.api.baseUrl.replace('localhost', '10.0.2.2');
        if (__DEV__) {
          console.log('🤖 Android Emulator URL:', url);
        }
        return url;
      } else {
        // iOS Simulator - direct localhost from .env.development
        if (__DEV__) {
          console.log('📱 iOS Simulator URL:', this.api.baseUrl);
        }
        return this.api.baseUrl;
      }
    }
    
    // Production - use production backend from .env.production (port 8080)
    if (!__DEV__) {
      console.log('🚀 Production URL:', this.api.backendUrl);
    }
    return this.api.backendUrl;
  }

  /**
   * Get backend URL (always direct)
   */
  getBackendUrl() {
    return this.api.backendUrl;
  }

  /**
   * Environment-aware logging
   */
  log(message, data = null, level = 'info') {
    if (this.debug.enabled) {
      const prefix = `[${this.env.toUpperCase()}]`;
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      switch (level) {
        case 'error':
          console.error(`${prefix} ${timestamp} ❌ ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`${prefix} ${timestamp} ⚠️  ${message}`, data || '');
          break;
        case 'success':
          console.log(`${prefix} ${timestamp} ✅ ${message}`, data || '');
          break;
        default:
          console.log(`${prefix} ${timestamp} ℹ️  ${message}`, data || '');
      }
    }
  }

  /**
   * Get app version (you might want to get this from package.json or native)
   */
  getAppVersion() {
    // You can implement version reading from package.json or native modules
    return '1.0.0';
  }

  /**
   * Validate environment configuration
   */
  validate() {
    const issues = [];
    
    if (this.isProduction) {
      // Production validations
      if (!this.api.backendUrl || this.api.backendUrl.includes('localhost')) {
        issues.push('Production backend URL should not use localhost');
      }
      
      if (this.debug.enabled) {
        issues.push('Debug mode should be disabled in production');
      }
      
      if (!this.firebase.apiKey || this.firebase.apiKey === 'your_prod_firebase_key') {
        issues.push('Production Firebase API key not configured');
      }
    }
    
    if (this.isDevelopment && this.proxy.enabled) {
      // Development proxy validations  
      if (!this.api.baseUrl.includes('localhost') && !this.api.baseUrl.includes('192.168')) {
        issues.push('Development proxy URL should use localhost or local IP');
      }
    }
    
    if (issues.length > 0) {
      this.log('Environment validation issues found:', issues, 'warn');
      return { valid: false, issues };
    }
    
    this.log('Environment configuration validation passed', null, 'success');
    return { valid: true, issues: [] };
  }

  /**
   * Log environment information
   */
  logEnvironmentInfo() {
    if (this.debug.showInfo) {
      console.log('\n🔧 ===== ENVIRONMENT CONFIGURATION =====');
      console.log(`📱 Environment: ${this.env}`);
      console.log(`🏗️  Build Type: ${this.build.type}`);
      console.log(`🌐 API URL: ${this.getApiUrl()}`);
      console.log(`🔗 Backend URL: ${this.getBackendUrl()}`);
      console.log(`📋 App Name: ${this.app.title}`);
      console.log(`🔧 Platform: ${Platform.OS} ${Platform.Version}`);
      console.log(`🛠️  Debug Mode: ${this.debug.enabled ? '✅' : '❌'}`);
      console.log(`🔄 Proxy Enabled: ${this.proxy.enabled ? '✅' : '❌'}`);
      console.log(`📊 Is Development: ${this.isDevelopment ? '✅' : '❌'}`);
      console.log(`🚀 Is Production: ${this.isProduction ? '✅' : '❌'}`);
      console.log('=====================================\n');
    }
  }

  /**
   * Get all configuration as object (for debugging)
   */
  getAllConfig() {
    return {
      environment: this.env,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      api: {
        baseUrl: this.getApiUrl(),
        backendUrl: this.getBackendUrl(),
      },
      app: this.app,
      debug: this.debug,
      proxy: this.proxy,
      platform: this.platform,
      firebase: this.firebase,
      build: this.build,
    };
  }
}

// Create and export singleton instance
const environmentConfig = new EnvironmentConfig();

// Validate configuration on startup
environmentConfig.validate();

export default environmentConfig;

// Export individual properties for convenience
export const {
  env: environment,
  isDevelopment,
  isProduction,
  api,
  app,
  debug,
  proxy,
  platform,
  firebase,
  build
} = environmentConfig;
