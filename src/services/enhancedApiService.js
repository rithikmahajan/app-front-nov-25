/**
 * ⚡ Enhanced API Service for React Native Backend Connection
 * Configured for connecting to localhost:8001 backend server
 */

import axios from 'axios';
import { API_CONFIG, NetworkManager, TokenManager } from '../config/networkConfig';
import fcmService from './fcmService';

// Create enhanced axios instance with React Native optimizations
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  // React Native specific configurations
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Request interceptor - Add authentication and logging
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check network connectivity first
      const networkStatus = await NetworkManager.checkConnection();
      if (!networkStatus.isConnected) {
        throw new Error('No internet connection');
      }

      // Add authentication token if available
      const token = await TokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Enhanced logging for development
      if (__DEV__) {
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        if (config.data) {
          console.log('📤 Request Data:', config.data);
        }
      }

      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error.message);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // Enhanced error logging
    if (response) {
      console.error(`❌ API Error: ${response.status} ${config?.url}`, response.data);
      
      // Handle 401 Unauthorized - remove invalid token
      if (response.status === 401) {
        console.log('🔓 Unauthorized - removing invalid token');
        await TokenManager.removeToken();
        // You can dispatch a logout action here if using Redux
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout:', config?.url);
    } else if (error.message === 'Network Error') {
      console.error('🌐 Network error - check backend connection');
    } else {
      console.error('❌ Unknown API error:', error.message);
    }

    return Promise.reject(error);
  }
);

// 🚀 Enhanced API Service with comprehensive backend integration
export const ApiService = {
  // Health and connectivity
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return { 
        success: true, 
        data: response.data,
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        status: error.response?.status 
      };
    }
  },

  async testConnection() {
    console.log('🧪 Testing backend connection...');
    const result = await this.healthCheck();
    
    if (result.success) {
      console.log('✅ Backend connection successful!');
    } else {
      console.log('❌ Backend connection failed:', result.error);
    }
    
    return result;
  },

  // Authentication endpoints
  async sendOTP(phoneNumber) {
    try {
      const response = await apiClient.post('/auth/send-otp', { 
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      });
      
      return { 
        success: true, 
        data: response.data,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async verifyFirebaseOTP(idToken, phoneNumber) {
    try {
      const response = await apiClient.post('/auth/verify-firebase-otp', { 
        idToken, 
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      });
      
      // Save token if authentication successful
      if (response.data.token) {
        await TokenManager.setToken(response.data.token);
        console.log('🔐 Authentication successful, token saved');
        
        // ═══════════════════════════════════════════════════════════
        // 🆕 CRITICAL FIX: Register FCM token with backend
        // ═══════════════════════════════════════════════════════════
        try {
          console.log('🔔 Initializing FCM after login...');
          
          // Initialize FCM and get token
          const fcmResult = await fcmService.initialize();
          
          if (fcmResult.success && fcmResult.token) {
            console.log('📱 FCM token obtained, registering with backend...');
            
            // Register FCM token with backend
            const registerResult = await fcmService.registerTokenWithBackend(response.data.token);
            
            if (registerResult.success) {
              console.log('✅ FCM token successfully registered with backend');
            } else {
              console.warn('⚠️ FCM token registration failed:', registerResult.error);
              // Don't fail login if FCM registration fails
            }
          } else {
            console.warn('⚠️ FCM initialization failed:', fcmResult.error);
            // Don't fail login if FCM fails
          }
        } catch (fcmError) {
          console.error('❌ FCM setup error (non-critical):', fcmError);
          // Don't fail login if FCM fails
        }
        // ═══════════════════════════════════════════════════════════
      }
      
      return { 
        success: true, 
        data: response.data,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async login(phoneNumber, password) {
    try {
      const response = await apiClient.post('/auth/login', { 
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`,
        password 
      });
      
      // Save token if login successful
      if (response.data.token) {
        await TokenManager.setToken(response.data.token);
        console.log('🔐 Login successful, token saved');
        
        // ═══════════════════════════════════════════════════════════
        // 🆕 CRITICAL FIX: Register FCM token with backend
        // ═══════════════════════════════════════════════════════════
        try {
          console.log('🔔 Initializing FCM after login...');
          
          // Initialize FCM and get token
          const fcmResult = await fcmService.initialize();
          
          if (fcmResult.success && fcmResult.token) {
            console.log('📱 FCM token obtained, registering with backend...');
            
            // Register FCM token with backend
            const registerResult = await fcmService.registerTokenWithBackend(response.data.token);
            
            if (registerResult.success) {
              console.log('✅ FCM token successfully registered with backend');
            } else {
              console.warn('⚠️ FCM token registration failed:', registerResult.error);
              // Don't fail login if FCM registration fails
            }
          } else {
            console.warn('⚠️ FCM initialization failed:', fcmResult.error);
            // Don't fail login if FCM fails
          }
        } catch (fcmError) {
          console.error('❌ FCM setup error (non-critical):', fcmError);
          // Don't fail login if FCM fails
        }
        // ═══════════════════════════════════════════════════════════
      }
      
      return { 
        success: true, 
        data: response.data,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async logout() {
    try {
      // Call backend logout endpoint if available
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed:', error.message);
    } finally {
      // Always remove local token
      await TokenManager.removeToken();
      
      // ═══════════════════════════════════════════════════════════
      // 🆕 Clear FCM token on logout
      // ═══════════════════════════════════════════════════════════
      try {
        await fcmService.clearToken();
        console.log('🔔 FCM token cleared');
      } catch (fcmError) {
        console.warn('⚠️ Failed to clear FCM token:', fcmError);
      }
      // ═══════════════════════════════════════════════════════════
      
      console.log('🚪 Logout successful');
    }
    
    return { success: true };
  },

  // Categories and content
  async getCategories() {
    try {
      const response = await apiClient.get('/categories');
      
      // Handle different response formats
      const categories = response.data.data || response.data || [];
      
      return { 
        success: true, 
        data: categories,
        count: categories.length
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: [] // Fallback empty array
      };
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return { 
        success: true, 
        data: response.data,
        message: 'Category created successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async getSubcategories(categoryId = null) {
    try {
      const url = categoryId ? `/subcategories?categoryId=${categoryId}` : '/subcategories';
      const response = await apiClient.get(url);
      
      // Handle different response formats
      const subcategories = response.data.data || response.data || [];
      
      return { 
        success: true, 
        data: subcategories,
        count: subcategories.length
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: [] // Fallback empty array
      };
    }
  },

  // Products and items
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/products?${params}` : '/products';
      const response = await apiClient.get(url);
      
      // Handle different response formats
      const products = response.data.data || response.data || [];
      
      return { 
        success: true, 
        data: products,
        count: products.length
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: [] // Fallback empty array
      };
    }
  },

  async getItems(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/items?${params}` : '/items';
      const response = await apiClient.get(url);
      
      // Handle different response formats
      const items = response.data.data || response.data || [];
      
      return { 
        success: true, 
        data: items,
        count: items.length
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: [] // Fallback empty array
      };
    }
  },

  async searchProducts(query) {
    try {
      const response = await apiClient.get(`/items/search?query=${encodeURIComponent(query)}`);
      
      // Handle different response formats
      const results = response.data.data || response.data || [];
      
      return { 
        success: true, 
        data: results,
        count: results.length,
        query: query
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: [] // Fallback empty array
      };
    }
  },

  // User profile and wishlist
  async getUserProfile() {
    try {
      const response = await apiClient.get('/user/profile');
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async getWishlist() {
    try {
      const response = await apiClient.get('/user/wishlist');
      return { 
        success: true, 
        data: response.data || []
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  async addToWishlist(itemId) {
    try {
      const response = await apiClient.post(`/user/wishlist/${itemId}`);
      return { 
        success: true, 
        data: response.data,
        message: 'Added to wishlist'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  async removeFromWishlist(itemId) {
    try {
      const response = await apiClient.delete(`/user/wishlist/${itemId}`);
      return { 
        success: true, 
        data: response.data,
        message: 'Removed from wishlist'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // File upload helper
  async uploadFile(file, endpoint = '/upload') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.fileName || 'upload.jpg'
      });

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // Longer timeout for file uploads
      });

      return { 
        success: true, 
        data: response.data,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

// Development utilities
if (__DEV__) {
  // Auto-test connection when service loads
  setTimeout(() => {
    ApiService.testConnection();
  }, 1000);
}

export default ApiService;
