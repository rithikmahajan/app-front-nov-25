// API Client Utility for Yoraa App
// Usage: import { YoraaAPI } from './YoraaAPIClient';

import AsyncStorage from '@react-native-async-storage/async-storage';

class YoraaAPIClient {
  constructor(baseURL = 'http://localhost:8001') {
    this.baseURL = baseURL;
    this.userToken = null;
    this.adminToken = null;
  }

  // Initialize tokens from storage
  async initialize() {
    try {
      this.userToken = await AsyncStorage.getItem('userToken');
      this.adminToken = await AsyncStorage.getItem('adminToken');
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  // Generic API call method
  async makeRequest(endpoint, method = 'GET', body = null, requireAuth = false, isAdmin = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authentication header if required
    if (requireAuth) {
      const token = isAdmin ? this.adminToken : this.userToken;
      if (!token) {
        throw new Error('Authentication required');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication Methods
  async login(email, password) {
    const response = await this.makeRequest('/api/auth/login', 'POST', { email, password });
    if (response.token) {
      this.userToken = response.token;
      await AsyncStorage.setItem('userToken', response.token);
    }
    return response;
  }

  async signup(userData) {
    return await this.makeRequest('/api/auth/signup', 'POST', userData);
  }

  async firebaseLogin(idToken) {
    const response = await this.makeRequest('/api/auth/firebase-login', 'POST', { idToken });
    if (response.token) {
      this.userToken = response.token;
      await AsyncStorage.setItem('userToken', response.token);
    }
    return response;
  }

  async logout() {
    await this.makeRequest('/api/auth/logout', 'POST', null, true);
    this.userToken = null;
    await AsyncStorage.removeItem('userToken');
  }

  // Admin Authentication
  async adminLogin(email, password) {
    const response = await this.makeRequest('/api/admin/login', 'POST', { email, password });
    if (response.token) {
      this.adminToken = response.token;
      await AsyncStorage.setItem('adminToken', response.token);
    }
    return response;
  }

  // Product Catalog Methods
  async getItems(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    return await this.makeRequest(`/api/items?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
  }

  async getItemById(itemId) {
    return await this.makeRequest(`/api/items/${itemId}`);
  }

  async filterItems(filters, page = 1, limit = 20, searchText = '') {
    return await this.makeRequest('/api/items/filter', 'POST', {
      page,
      limit,
      filters,
      searchText
    });
  }

  async searchItems(query) {
    return await this.makeRequest(`/api/items/search/name?query=${encodeURIComponent(query)}`);
  }

  // Categories
  async getCategories() {
    return await this.makeRequest('/api/categories');
  }

  async getSubCategories() {
    return await this.makeRequest('/api/subcategories');
  }

  // Cart Management
  async addToCart(itemId, sizeId, quantity = 1) {
    return await this.makeRequest('/api/cart/add', 'POST', {
      itemId,
      sizeId,
      quantity
    }, true);
  }

  async getCart() {
    return await this.makeRequest('/api/cart', 'GET', null, true);
  }

  async updateCartItem(itemId, sizeId, quantity) {
    return await this.makeRequest('/api/cart/update', 'PUT', {
      itemId,
      sizeId,
      quantity
    }, true);
  }

  async removeFromCart(itemId, sizeId) {
    return await this.makeRequest('/api/cart/remove', 'DELETE', {
      itemId,
      sizeId
    }, true);
  }

  async clearCart() {
    return await this.makeRequest('/api/cart/clear', 'DELETE', null, true);
  }

  // Order Management
  async createOrder(orderData) {
    return await this.makeRequest('/api/orders', 'POST', orderData, true);
  }

  async getUserOrders() {
    return await this.makeRequest('/api/orders/user', 'GET', null, true);
  }

  async getOrderById(orderId) {
    return await this.makeRequest(`/api/orders/${orderId}`, 'GET', null, true);
  }

  // Wishlist
  async addToWishlist(itemId) {
    return await this.makeRequest('/api/wishlist/add', 'POST', { itemId }, true);
  }

  async getWishlist() {
    return await this.makeRequest('/api/wishlist', 'GET', null, true);
  }

  async removeFromWishlist(itemId) {
    return await this.makeRequest(`/api/wishlist/remove/${itemId}`, 'DELETE', null, true);
  }

  // User Profile
  async getUserProfile() {
    return await this.makeRequest('/api/profile', 'GET', null, true);
  }

  async updateUserProfile(profileData) {
    return await this.makeRequest('/api/profile', 'PUT', profileData, true);
  }

  // Addresses
  async getUserAddresses() {
    return await this.makeRequest('/api/addresses', 'GET', null, true);
  }

  async addAddress(addressData) {
    return await this.makeRequest('/api/addresses', 'POST', addressData, true);
  }

  async updateAddress(addressId, addressData) {
    return await this.makeRequest(`/api/addresses/${addressId}`, 'PUT', addressData, true);
  }

  async deleteAddress(addressId) {
    return await this.makeRequest(`/api/addresses/${addressId}`, 'DELETE', null, true);
  }

  // Utility Methods
  async validatePromoCode(code, orderAmount) {
    return await this.makeRequest('/api/promoCode/promo-codes/validate', 'POST', {
      code,
      orderAmount
    });
  }

  async getAppSettings() {
    return await this.makeRequest('/api/settings');
  }

  async getBanners() {
    return await this.makeRequest('/api/banners');
  }

  // FAQ Methods
  async getFAQs() {
    return await this.makeRequest('/api/faqs');
  }

  async getFAQById(faqId) {
    return await this.makeRequest(`/api/faqs/${faqId}`);
  }

  async getFAQsByCategory(category) {
    return await this.makeRequest(`/api/faqs/category/${category}`);
  }

  // Error handling helper
  handleError(error) {
    if (error.message.includes('401')) {
      // Unauthorized - clear tokens and redirect to login
      this.userToken = null;
      this.adminToken = null;
      AsyncStorage.multiRemove(['userToken', 'adminToken']);
      return 'Authentication required. Please log in again.';
    } else if (error.message.includes('403')) {
      return 'Permission denied. You do not have access to this resource.';
    } else if (error.message.includes('404')) {
      return 'Resource not found.';
    } else if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}

// Export singleton instance
export const YoraaAPI = new YoraaAPIClient();

// Usage Examples:
/*
// Initialize the client
await YoraaAPI.initialize();

// User authentication
try {
  const loginResponse = await YoraaAPI.login('user@example.com', 'password');
  console.log('Logged in:', loginResponse);
} catch (error) {
  console.error('Login failed:', YoraaAPI.handleError(error));
}

// Get products
try {
  const items = await YoraaAPI.getItems(1, 20);
  console.log('Items:', items);
} catch (error) {
  console.error('Failed to fetch items:', YoraaAPI.handleError(error));
}

// Add to cart
try {
  await YoraaAPI.addToCart('item123', 'size456', 2);
  console.log('Added to cart successfully');
} catch (error) {
  console.error('Failed to add to cart:', YoraaAPI.handleError(error));
}
*/
