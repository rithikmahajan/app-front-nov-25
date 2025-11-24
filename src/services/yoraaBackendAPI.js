// Complete API Service for Yoraa Backend Integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStorageService from './authStorageService';

class YoraaBackendAPI {
  constructor() {
    // 🎯 USE ENVIRONMENT CONFIG - Automatically uses .env files
    // Import at the top: import environmentConfig from '../config/environment';
    const environmentConfig = require('../config/environment').default;
    
    // Get URL from environment config (respects .env.development and .env.production)
    this.baseURL = environmentConfig.getApiUrl();
    this.token = null;
    
    // Log for debugging
    if (__DEV__) {
      console.log('🌐 YoraaBackendAPI initialized');
      console.log('🔧 Base URL:', this.baseURL);
      console.log('🔧 Environment:', __DEV__ ? 'Development' : 'Production');
    }
  }

  async initialize() {
    try {
      // Try new auth storage first
      let token = await authStorageService.getAuthToken();
      
      // Fallback to legacy storage
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Migrate to new storage
          await authStorageService.syncWithLegacyToken();
        }
      }
      
      this.token = token;
      // Only log in dev mode, don't show warning if no token (guest access is fine)
      if (__DEV__) {
        console.log('🔧 API Service initialized', this.token ? '✅ with token' : '👤 without token (guest mode)');
      }
    } catch (error) {
      console.error('❌ Error loading token:', error);
    }
  }

  async setToken(token, userData = null) {
    this.token = token;
    
    // Store in both old and new storage for backward compatibility
    await AsyncStorage.setItem('userToken', token);
    
    // Store in new auth storage service
    if (userData) {
      await authStorageService.storeAuthData(token, userData);
    }
    
    console.log('🔐 Token set successfully');
  }

  async clearToken() {
    this.token = null;
    
    // Clear from both storages
    await AsyncStorage.removeItem('userToken');
    await authStorageService.clearAuthData();
    
    console.log('🔓 Token cleared');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('📡 API Request:', {
      method: config.method || 'GET',
      url,
      hasToken: !!this.token
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('📨 API Response:', {
        status: response.status,
        success: data.success,
        message: data.message
      });

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error.message);
      throw error;
    }
  }

  // ===== AUTHENTICATION =====

  async registerWithFirebase(idToken, userData = {}) {
    return this.request('/auth/register/firebase', {
      method: 'POST',
      body: JSON.stringify({ 
        idToken, 
        ...userData 
      }),
    });
  }

  async loginWithFirebase(idToken) {
    const response = await this.request('/auth/login/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    // Store token AND user data if login successful
    if (response.success && response.data?.token) {
      await this.setToken(response.data.token, response.data.user);
    }

    return response;
  }

  async refreshToken() {
    return this.request('/auth/refresh-token', {
      method: 'POST',
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  // ===== PRODUCTS =====

  async getProducts() {
    return this.request('/products');
  }

  async getItems() {
    return this.request('/items');
  }

  async getProductById(id) {
    return this.request(`/items/${id}`);
  }

  async getProductsByCategory(categoryId) {
    return this.request(`/items/category/${categoryId}`);
  }

  async searchProducts(query) {
    return this.request(`/items/search?query=${encodeURIComponent(query)}`);
  }

  // Voice Search API Method - Updated for new backend endpoint
  async voiceSearchProducts(voiceText) {
    try {
      console.log('🎤 Voice Search API called with:', voiceText);
      
      const response = await this.request('/items/voice-search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          query: voiceText,
          timestamp: new Date().toISOString()
        }),
        timeout: 15000 // 15 second timeout for voice search
      });
      
      console.log('🎤 Voice Search Response:', {
        success: response.success,
        resultsCount: response.resultsCount,
        query: response.query
      });
      
      return response;
      
    } catch (error) {
      console.error('🎤 Voice search error:', error);
      throw error;
    }
  }

  // Legacy voice search method (for audio file uploads if needed later)
  async voiceSearchAudio(audioData) {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioData.uri,
      type: 'audio/wav',
      name: 'voice_search.wav',
    });
    
    return this.request('/items/voice-search-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async filterProducts(filters) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/items/filter?${queryParams}`);
  }

  // ===== CATEGORIES =====

  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id) {
    return this.request(`/categories/${id}`);
  }

  // ===== CART =====

  async getCart() {
    return this.request('/cart');
  }

  async addToCart(itemData) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        itemId: itemData.itemId,
        size: itemData.size,
        quantity: itemData.quantity || 1,
        color: itemData.color
      }),
    });
  }

  async updateCartItem(updateData) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({
        itemId: updateData.itemId,
        size: updateData.size,
        quantity: updateData.newQuantity
      }),
    });
  }

  async removeFromCart(itemId, size) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ itemId, size }),
    });
  }

  // ===== WISHLIST =====

  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(itemId) {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  async removeFromWishlist(itemId) {
    return this.request('/wishlist/remove', {
      method: 'DELETE',
      body: JSON.stringify({ itemId }),
    });
  }

  // ===== ORDERS =====

  async getUserOrders() {
    return this.request('/orders');
  }

  async createOrder(orderData) {
    return this.request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // ===== USER PROFILE =====

  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // ===== ADDRESSES =====

  async getAddresses() {
    return this.request('/addresses');
  }

  async addAddress(addressData) {
    return this.request('/addresses/add', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // ===== BANNERS =====

  async getBanners() {
    return this.request('/banners');
  }

  // ===== SALE MANAGEMENT =====

  async getSaleItems(page = 1, limit = 20, category = null) {
    let endpoint = `/products/sale?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;
    return this.request(endpoint);
  }

  async getSaleItemsByCategory(categoryId) {
    return this.request(`/products/sale/category/${categoryId}`);
  }

  async getSaleItemsBySubcategory(subCategoryId) {
    // For subcategory, we'll use the main sale endpoint with filtering
    return this.request(`/products/sale?subcategory=${subCategoryId}`);
  }

  async updateSaleStatus(productId, saleData) {
    return this.request(`/products/${productId}/sale-status`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  }

  async bulkUpdateSaleStatus(products) {
    return this.request(`/products/bulk-sale-status`, {
      method: 'PUT',
      body: JSON.stringify({ products }),
    });
  }

  // ===== RECOMMENDATION MANAGEMENT =====

  async getRecommendations(type = 'all', page = 1, limit = 10, category = null) {
    let endpoint = `/recommendations?page=${page}&limit=${limit}`;
    if (type && type !== 'all') endpoint += `&type=${type}`;
    if (category) endpoint += `&category=${category}`;
    return this.request(endpoint);
  }

  async updateRecommendationSettings(productId, settings) {
    return this.request(`/products/${productId}/recommendation-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ===== PRODUCT STATUS MANAGEMENT =====

  async updateProductStatus(itemId, status) {
    return this.request(`/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getProductsByStatus(status, page = 1, limit = 20) {
    return this.request(`/items/status/${status}?page=${page}&limit=${limit}`);
  }

  // ===== COLLECTION ITEMS =====

  async getAllCollectionItems(page = 1, limit = 20) {
    return this.request(`/items/collection?page=${page}&limit=${limit}`);
  }

  // ===== HEALTH CHECK =====

  async checkHealth() {
    return this.request('/health');
  }

  async getStatus() {
    return this.request('/status');
  }

  // ===== UTILITY METHODS =====

  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await this.checkHealth();
      
      if (response.success) {
        console.log('✅ Backend connection successful!');
        console.log('📊 Server status:', response.data);
        return true;
      } else {
        console.log('⚠️ Backend responded but with error:', response.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  }

  // Firebase authentication helper
  async authenticateWithFirebase(firebaseUser, isNewUser = false) {
    try {
      console.log('🔐 Authenticating with Firebase...');
      // CRITICAL FIX: In React Native Firebase, firebaseUser from userCredential doesn't have getIdToken()
      // We need to use auth().currentUser instead
      const auth = require('@react-native-firebase/auth').default;
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Firebase user not authenticated');
      }
      const idToken = await currentUser.getIdToken();
      
      let response;
      if (isNewUser) {
        response = await this.registerWithFirebase(idToken, {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        });
      } else {
        response = await this.loginWithFirebase(idToken);
      }

      if (response.success) {
        console.log('✅ Firebase authentication successful!');
        console.log('👤 User data:', response.data.user);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ Firebase authentication failed:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const yoraaAPI = new YoraaBackendAPI();

export default yoraaAPI;
