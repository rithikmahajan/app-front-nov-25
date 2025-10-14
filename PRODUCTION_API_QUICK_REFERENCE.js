// ============================================
// 🚀 YORAA API Integration Quick Reference
// ============================================

import apiService from './services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Production API Base URL: http://185.193.19.244:8080/api
 * Health Check: http://185.193.19.244:8080/health
 */

// ============================================
// 🔐 AUTHENTICATION SERVICES
// ============================================

/**
 * Login with Email/Password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const response = await apiService.post('/auth/login', {
      email,
      password,
    });
    
    // Store token
    await AsyncStorage.setItem('userToken', response.data.token);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

/**
 * Register New User
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiService.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    });
    
    await AsyncStorage.setItem('userToken', response.data.token);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

/**
 * Login with Firebase (Google, Apple, Phone)
 */
export const loginWithFirebase = async (idToken) => {
  try {
    const response = await apiService.post('/auth/loginFirebase', {
      idToken,
    });
    
    await AsyncStorage.setItem('userToken', response.data.token);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Firebase login failed',
    };
  }
};

/**
 * Link Firebase Account (for account linking)
 */
export const linkFirebaseAccount = async (idToken) => {
  try {
    const response = await apiService.post('/auth/link-account', {
      idToken,
      provider: 'google', // or 'apple', 'phone'
    });
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Account linking failed',
    };
  }
};

/**
 * Logout User
 */
export const logoutUser = async () => {
  try {
    await apiService.post('/auth/logout');
    await AsyncStorage.removeItem('userToken');
    
    return { success: true };
  } catch (error) {
    // Clear token anyway on logout error
    await AsyncStorage.removeItem('userToken');
    return { success: true };
  }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiService.post('/auth/forgot-password', { email });
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send reset email',
    };
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Password reset failed',
    };
  }
};

// ============================================
// 👤 USER PROFILE SERVICES
// ============================================

/**
 * Get User Profile
 */
export const getUserProfile = async () => {
  try {
    const response = await apiService.get('/profile');
    
    return {
      success: true,
      profile: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch profile',
    };
  }
};

/**
 * Update User Profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiService.put('/profile', profileData);
    
    return {
      success: true,
      profile: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

/**
 * Get User Addresses
 */
export const getUserAddresses = async () => {
  try {
    const response = await apiService.get('/profile/addresses');
    
    return {
      success: true,
      addresses: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch addresses',
    };
  }
};

/**
 * Add New Address
 */
export const addAddress = async (addressData) => {
  try {
    const response = await apiService.post('/profile/addresses', addressData);
    
    return {
      success: true,
      address: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add address',
    };
  }
};

// ============================================
// 📦 PRODUCT SERVICES
// ============================================

/**
 * Get All Categories
 */
export const getCategories = async () => {
  try {
    const response = await apiService.get('/categories');
    
    return {
      success: true,
      categories: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch categories',
    };
  }
};

/**
 * Get Products with Filters
 */
export const getProducts = async (filters = {}) => {
  try {
    const response = await apiService.get('/products', {
      params: {
        category: filters.category,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
    
    return {
      success: true,
      products: response.data.products || response.data,
      total: response.data.total,
      page: response.data.page,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch products',
    };
  }
};

/**
 * Get Product by ID
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiService.get(`/products/${productId}`);
    
    return {
      success: true,
      product: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch product',
    };
  }
};

/**
 * Search Products
 */
export const searchProducts = async (query) => {
  try {
    const response = await apiService.get('/products/search', {
      params: { q: query },
    });
    
    return {
      success: true,
      products: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Search failed',
    };
  }
};

/**
 * Get Featured Products
 */
export const getFeaturedProducts = async () => {
  try {
    const response = await apiService.get('/products/featured');
    
    return {
      success: true,
      products: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch featured products',
    };
  }
};

// ============================================
// 🛒 CART SERVICES
// ============================================

/**
 * Get User Cart
 */
export const getCart = async () => {
  try {
    const response = await apiService.get('/cart');
    
    return {
      success: true,
      cart: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch cart',
    };
  }
};

/**
 * Add Item to Cart
 */
export const addToCart = async (productId, quantity, variantId = null) => {
  try {
    const response = await apiService.post('/cart/add', {
      productId,
      quantity,
      variantId,
    });
    
    return {
      success: true,
      cart: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add to cart',
    };
  }
};

/**
 * Update Cart Item Quantity
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await apiService.put(`/cart/${itemId}`, { quantity });
    
    return {
      success: true,
      cart: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update cart',
    };
  }
};

/**
 * Remove Item from Cart
 */
export const removeFromCart = async (itemId) => {
  try {
    const response = await apiService.delete(`/cart/${itemId}`);
    
    return {
      success: true,
      cart: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove from cart',
    };
  }
};

/**
 * Clear Entire Cart
 */
export const clearCart = async () => {
  try {
    const response = await apiService.delete('/cart');
    
    return {
      success: true,
      message: 'Cart cleared',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to clear cart',
    };
  }
};

// ============================================
// 📝 ORDER SERVICES
// ============================================

/**
 * Create New Order
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiService.post('/orders', {
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
    });
    
    return {
      success: true,
      order: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order',
    };
  }
};

/**
 * Get User Orders
 */
export const getUserOrders = async () => {
  try {
    const response = await apiService.get('/orders');
    
    return {
      success: true,
      orders: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders',
    };
  }
};

/**
 * Get Order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiService.get(`/orders/${orderId}`);
    
    return {
      success: true,
      order: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch order',
    };
  }
};

/**
 * Cancel Order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await apiService.put(`/orders/${orderId}/cancel`);
    
    return {
      success: true,
      order: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to cancel order',
    };
  }
};

/**
 * Track Order
 */
export const trackOrder = async (orderId) => {
  try {
    const response = await apiService.get(`/orders/${orderId}/track`);
    
    return {
      success: true,
      tracking: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to track order',
    };
  }
};

// ============================================
// ❤️ WISHLIST SERVICES
// ============================================

/**
 * Get User Wishlist
 */
export const getWishlist = async () => {
  try {
    const response = await apiService.get('/wishlist');
    
    return {
      success: true,
      wishlist: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch wishlist',
    };
  }
};

/**
 * Add to Wishlist
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await apiService.post('/wishlist/add', { productId });
    
    return {
      success: true,
      wishlist: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add to wishlist',
    };
  }
};

/**
 * Remove from Wishlist
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await apiService.delete(`/wishlist/${productId}`);
    
    return {
      success: true,
      wishlist: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove from wishlist',
    };
  }
};

// ============================================
// ⭐ REVIEW SERVICES
// ============================================

/**
 * Add Product Review
 */
export const addReview = async (productId, reviewData) => {
  try {
    const response = await apiService.post(`/products/${productId}/reviews`, {
      rating: reviewData.rating,
      comment: reviewData.comment,
      title: reviewData.title,
    });
    
    return {
      success: true,
      review: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add review',
    };
  }
};

/**
 * Get Product Reviews
 */
export const getProductReviews = async (productId) => {
  try {
    const response = await apiService.get(`/products/${productId}/reviews`);
    
    return {
      success: true,
      reviews: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch reviews',
    };
  }
};

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Check Backend Health
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch('http://185.193.19.244:8080/health');
    const data = await response.json();
    
    return {
      success: true,
      status: data.status,
      uptime: data.uptime,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Backend is unreachable',
    };
  }
};

/**
 * Check if User is Authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Get Stored Auth Token
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    return null;
  }
};
