import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

// Import centralized API configuration and environment
import { API_CONFIG } from '../config/apiConfig';
import environmentConfig from '../config/environment';

// API Configuration
const BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // Environment-aware logging
    environmentConfig.log('API Request', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
    });
    return config;
  },
  (error) => {
    environmentConfig.log('API Request Error', error.message, 'error');
    return Promise.reject(error);
  }
);

// Token refresh functionality using Firebase
const refreshAuthToken = async () => {
  try {
    console.log('🔄 Attempting to refresh backend token using Firebase...');
    
    // Get current Firebase user
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      console.log('🔐 No Firebase user available for token refresh');
      return null;
    }

    // Get fresh Firebase ID token
    console.log('🔥 Getting fresh Firebase ID token...');
    const freshIdToken = await currentUser.getIdToken(true); // force refresh
    
    if (!freshIdToken) {
      console.log('❌ Failed to get fresh Firebase ID token');
      return null;
    }

    // Re-authenticate with backend using fresh Firebase token
    // Note: BASE_URL already includes /api, so we just append /auth/login/firebase
    console.log('🔄 Re-authenticating with backend using fresh Firebase token...');
    const response = await axios.post(`${BASE_URL}/auth/login/firebase`, {
      idToken: freshIdToken
    });

    if (response.data && response.data.success && response.data.data && response.data.data.token) {
      const newToken = response.data.data.token;
      const userData = response.data.data.user;
      
      // Store new token
      await AsyncStorage.setItem('userToken', newToken);
      
      // Update user data if provided
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      
      console.log('✅ Backend token refreshed successfully via Firebase');
      return newToken;
    }
    
    console.log('❌ Backend did not return a valid token');
    return null;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    
    // If Firebase user is not authenticated, clear tokens
    if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-not-found') {
      console.log('🧹 Firebase authentication expired, clearing tokens...');
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    }
    
    return null;
  }
};

// Check authentication status
const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

// Response interceptor for logging and error handling with token refresh
apiClient.interceptors.response.use(
  (response) => {
    environmentConfig.log('API Response', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    environmentConfig.log('API Response Error', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    }, 'error');

    // Handle 401 (Unauthorized) with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Attempting token refresh due to 401 error...');
      const newToken = await refreshAuthToken();
      
      if (newToken) {
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('🔁 Retrying request with new token...');
        return apiClient(originalRequest);
      } else {
        // Token refresh failed, redirect to login
        console.log('❌ Token refresh failed, user needs to re-login');
        // You can emit an event here to redirect to login screen
        // EventEmitter.emit('LOGOUT_USER');
      }
    }

    // Transform network errors to more user-friendly messages
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.userMessage = 'Request timed out. Please check your internet connection and try again.';
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      error.userMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Requested resource not found.';
    } else if (error.response?.status === 401) {
      error.userMessage = 'Authentication failed. Please login again.';
    } else {
      error.userMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    }

    return Promise.reject(error);
  }
);

// API Service methods
export const apiService = {
    // Fetch categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Fetch all subcategories
  getSubcategories: async () => {
    try {
      const response = await apiClient.get('/subcategories');
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Fetch subcategories by category ID (filtered client-side)
  getSubcategoriesByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get('/subcategories');
      const allSubcategories = response.data;
      
      // Filter subcategories by categoryId
      const filteredSubcategories = allSubcategories.filter(sub => sub.categoryId === categoryId);
      
      return {
        success: true,
        data: filteredSubcategories,
        message: `Found ${filteredSubcategories.length} subcategories for category ${categoryId}`
      };
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      throw error;
    }
  },

  // Fetch all items
  getItems: async () => {
    try {
      const response = await apiClient.get('/items');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch latest items by subcategory ID
  getLatestItemsBySubcategory: async (subcategoryId) => {
    try {
      const response = await apiClient.get(`/items/latest-items/${subcategoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch items by subcategory ID (correct endpoint)
  getItemsBySubcategory: async (subcategoryId) => {
    try {
      console.log(`🔄 Fetching items for subcategory: ${subcategoryId}`);
      const response = await apiClient.get(`/items/subcategory/${subcategoryId}`);
      console.log(`✅ Items response for subcategory ${subcategoryId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching items for subcategory ${subcategoryId}:`, {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      throw error;
    }
  },

  // Fetch single item by ID
  getItemById: async (itemId) => {
    try {
      const response = await apiClient.get(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic GET method
  get: async (endpoint, config = {}) => {
    try {
      const response = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic POST method
  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic PUT method
  put: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic DELETE method
  delete: async (endpoint, config = {}) => {
    try {
      const response = await apiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Address Management APIs
  getAddresses: async (userId) => {
    try {
      const response = await apiClient.get('/address/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createAddress: async (addressData) => {
    try {
      const response = await apiClient.post('/address/createAddress', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await apiClient.patch(`/address/updateById/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await apiClient.delete(`/address/deleteById/${addressId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Authentication methods
  checkAuthStatus: checkAuthStatus,
  refreshAuthToken: refreshAuthToken,
};

export default apiService;
