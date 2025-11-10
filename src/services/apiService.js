import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

// Import centralized API configuration and environment
import { API_CONFIG } from '../config/apiConfig';
import environmentConfig from '../config/environment';

// API Configuration
const BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerSecond: 5,
  maxRetries: 3,
  baseRetryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  rateLimitPauseMs: 5000, // 5 seconds pause when rate limited
};

// Request queue for rate limiting
class RequestQueue {
  constructor(maxRequestsPerSecond) {
    this.queue = [];
    this.activeRequests = 0;
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.requestTimestamps = [];
    this.isRateLimited = false;
    this.rateLimitResetTime = null;
  }

  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.queue.length === 0 || this.isRateLimited) {
      return;
    }

    // Check if we've hit rate limit
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 1000
    );

    if (this.requestTimestamps.length >= this.maxRequestsPerSecond) {
      console.warn('⏱️ Rate limit reached, waiting before next request...');
      setTimeout(() => this.processQueue(), 200);
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.requestTimestamps.push(now);
    this.activeRequests++;

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 200);
      }
    }
  }

  setRateLimited(durationMs) {
    console.warn(`🛑 Rate limited for ${durationMs}ms`);
    this.isRateLimited = true;
    this.rateLimitResetTime = Date.now() + durationMs;
    
    setTimeout(() => {
      this.isRateLimited = false;
      this.rateLimitResetTime = null;
      console.log('✅ Rate limit cleared, resuming requests');
      this.processQueue();
    }, durationMs);
  }

  clear() {
    this.queue = [];
  }
}

// Initialize request queue
const requestQueue = new RequestQueue(RATE_LIMIT_CONFIG.maxRequestsPerSecond);

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
      // ✅ FIX: Check multiple possible token storage keys for compatibility
      const userToken = await AsyncStorage.getItem('userToken') || 
                        await AsyncStorage.getItem('authToken');
      
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        console.log('✅ Auth token added to request');
      } else {
        console.warn('⚠️ No auth token found - request may require authentication');
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

    // Handle 429 (Too Many Requests) - Rate Limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter 
        ? parseInt(retryAfter, 10) * 1000 
        : RATE_LIMIT_CONFIG.rateLimitPauseMs;
      
      console.warn(`⚠️ Rate limited (429). Waiting ${waitTime}ms before retry...`);
      requestQueue.setRateLimited(waitTime);
      
      // Retry after waiting
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }
      
      if (originalRequest._retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        originalRequest._retryCount++;
        console.log(`🔄 Retry attempt ${originalRequest._retryCount}/${RATE_LIMIT_CONFIG.maxRetries}`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return apiClient(originalRequest);
      } else {
        console.error('❌ Max retries reached for rate-limited request');
        error.userMessage = 'Too many requests. Please wait a moment and try again.';
        return Promise.reject(error);
      }
    }

    // Handle 401 (Unauthorized) with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't log initial 401 error (it's expected when token expires)
      console.log('🔄 Token expired, attempting refresh...');
      const newToken = await refreshAuthToken();
      
      if (newToken) {
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('✅ Token refreshed, retrying request...');
        return apiClient(originalRequest);
      } else {
        // Token refresh failed, log the error
        console.log('❌ Token refresh failed, user needs to re-login');
        environmentConfig.log('API Response Error', {
          message: 'Authentication failed - token refresh failed',
          code: error.code,
          status: 401,
          url: error.config?.url,
        }, 'error');
        // You can emit an event here to redirect to login screen
        // EventEmitter.emit('LOGOUT_USER');
      }
    } else {
      // Log non-401 errors normally
      environmentConfig.log('API Response Error', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
      }, 'error');
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
    } else if (error.response?.status === 429) {
      error.userMessage = 'Too many requests. Please wait a moment and try again.';
    } else {
      error.userMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    }

    return Promise.reject(error);
  }
);

// Request deduplication cache
const pendingRequests = new Map();

// Wrapper function to deduplicate concurrent requests
const deduplicatedRequest = async (requestFn, cacheKey) => {
  // If request is already pending, return the existing promise
  if (pendingRequests.has(cacheKey)) {
    console.log(`♻️ Reusing pending request: ${cacheKey}`);
    return pendingRequests.get(cacheKey);
  }

  // Execute request and cache the promise
  const requestPromise = requestFn()
    .finally(() => {
      // Remove from cache when complete
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// API Service methods
export const apiService = {
    // Fetch categories
  getCategories: async () => {
    const cacheKey = 'GET:/categories';
    return deduplicatedRequest(async () => {
      try {
        const response = await apiClient.get('/categories');
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    }, cacheKey);
  },

  // Fetch all subcategories
  getSubcategories: async () => {
    const cacheKey = 'GET:/subcategories';
    return deduplicatedRequest(async () => {
      try {
        const response = await apiClient.get('/subcategories');
        // Handle nested response structure: {success, message, data: [...], statusCode}
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
      }
    }, cacheKey);
  },

  // Fetch subcategories by category ID (filtered client-side)
  getSubcategoriesByCategory: async (categoryId) => {
    const cacheKey = `GET:/subcategories:category=${categoryId}`;
    return deduplicatedRequest(async () => {
      try {
        const response = await apiClient.get('/subcategories');
        
        // Handle API response structure: response.data.data contains the array
        const allSubcategories = response.data?.data || response.data || [];
        
        // Ensure we have an array before filtering
        if (!Array.isArray(allSubcategories)) {
          console.warn('⚠️ API returned non-array subcategories:', allSubcategories);
          return {
            success: true,
            data: [],
            message: `No subcategories found for category ${categoryId}`
          };
        }
        
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
    }, cacheKey);
  },

  // Fetch all items
  getItems: async () => {
    const cacheKey = 'GET:/items';
    return deduplicatedRequest(async () => {
      try {
        const response = await apiClient.get('/items');
        return response.data;
      } catch (error) {
        throw error;
      }
    }, cacheKey);
  },

  // Fetch latest items by subcategory ID
  getLatestItemsBySubcategory: async (subcategoryId) => {
    const cacheKey = `GET:/items/latest-items/${subcategoryId}`;
    return deduplicatedRequest(async () => {
      try {
        const response = await apiClient.get(`/items/latest-items/${subcategoryId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }, cacheKey);
  },

  // Fetch items by subcategory ID (correct endpoint)
  getItemsBySubcategory: async (subcategoryId) => {
    const cacheKey = `GET:/items/subcategory/${subcategoryId}`;
    return deduplicatedRequest(async () => {
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
    }, cacheKey);
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
      // If 404, return empty array instead of throwing (user may not have addresses)
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'No addresses found for user'
        };
      }
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

  // Linked Products / Item Groups
  getItemGroupByItemId: async (itemId) => {
    try {
      // FIXED: Changed endpoint from /item-groups/item/:id to /item-groups/by-item/:id
      const response = await apiClient.get(`/item-groups/by-item/${itemId}`);
      
      // Transform backend response to expected format
      // Backend returns: { success, count, groups: [] }
      if (response.data.success && response.data.groups && response.data.groups.length > 0) {
        const group = response.data.groups[0]; // Get first group
        return {
          success: true,
          data: {
            _id: group._id,
            name: group.name,
            items: group.items,
            currentItem: itemId,
            isActive: group.isActive
          },
          message: 'Item group retrieved successfully'
        };
      }
      
      // No groups found
      return { success: false, data: null, message: 'No item group found' };
    } catch (error) {
      console.error('Error fetching item group:', error);
      // If no group found (404), return null instead of throwing
      if (error.response?.status === 404) {
        return { success: false, data: null, message: 'No item group found' };
      }
      throw error;
    }
  },

  // Authentication methods
  checkAuthStatus: checkAuthStatus,
  refreshAuthToken: refreshAuthToken,
};

export default apiService;
