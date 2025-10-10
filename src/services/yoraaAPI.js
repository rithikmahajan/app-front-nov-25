// Enhanced API Service for Yoraa App - Backend Integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

class YoraaAPIService {
  constructor() {
    // Environment-based API URLs - ✅ Updated to working port 8001
    this.baseURL = __DEV__ 
      ? 'http://localhost:8001'        // Development (iOS Simulator) - Backend server port
      : 'http://185.193.19.244:8001';  // Production (TestFlight/Physical Device)
    this.userToken = null;
    this.adminToken = null;
    this.guestSessionId = null;
  }

  async initialize() {
    try {
      this.userToken = await AsyncStorage.getItem('userToken');
      this.adminToken = await AsyncStorage.getItem('adminToken');
      
      // Initialize or generate guest session ID
      await this.initializeGuestSession();

      // If no backend token but Firebase user is signed in, try to authenticate with backend
      if (!this.userToken) {
        await this.tryFirebaseBackendAuth();
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  async initializeGuestSession() {
    try {
      this.guestSessionId = await AsyncStorage.getItem('guestSessionId');
      
      if (!this.guestSessionId) {
        // Generate new guest session ID
        this.guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('guestSessionId', this.guestSessionId);
        console.log('🆕 Generated new guest session ID:', this.guestSessionId);
      } else {
        console.log('🔄 Using existing guest session ID:', this.guestSessionId);
      }
    } catch (error) {
      console.error('Error initializing guest session:', error);
      // Fallback: generate session ID without storage
      this.guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async tryFirebaseBackendAuth() {
    try {
      // Use Firebase auth to get current user
      const currentUser = auth().currentUser;
      
      if (currentUser) {
        console.log('Found Firebase user, attempting backend authentication...');
        const idToken = await currentUser.getIdToken();
        await this.firebaseLogin(idToken);
        console.log('✅ Successfully authenticated existing Firebase user with backend');
      }
    } catch (error) {
      console.warn('Failed to authenticate existing Firebase user with backend:', error);
    }
  }

  /**
   * Ensure we have a fresh Firebase token for authenticated requests
   */
  async ensureFreshFirebaseToken() {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        console.warn('⚠️ Cannot get Firebase token - user not signed in');
        throw new Error('User not authenticated with Firebase');
      }
      
      // Reduce token logging frequency - only log every 5th token refresh
      if (!this.tokenLogCount) this.tokenLogCount = 0;
      this.tokenLogCount++;
      
      if (this.tokenLogCount % 5 === 1) {
        console.log('🔄 Getting fresh Firebase ID token...');
      }
      
      const idToken = await currentUser.getIdToken(true); // Force refresh
      this.userToken = idToken;
      
      if (this.tokenLogCount % 5 === 1) {
        console.log('✅ Fresh Firebase token obtained');
      }
      
      return idToken;
    } catch (error) {
      // Handle user sign-out during token refresh gracefully
      if (error.code === 'auth/no-current-user' || 
          error.message?.includes('no-current-user') ||
          error.message?.includes('User not authenticated')) {
        console.warn('⚠️ User signed out during token refresh');
        this.userToken = null;
        throw error;
      }
      
      console.error('❌ Failed to get Firebase token:', error);
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  async makeRequest(endpoint, method = 'GET', body = null, requireAuth = false, isAdmin = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = isAdmin ? this.adminToken : this.userToken;
      if (!token) {
        console.error('❌ No authentication token available for:', endpoint);
        throw new Error('Authentication required. Please log in.');
      }
      headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Making authenticated request to:', endpoint, 'with token:', token.substring(0, 20) + '...');
    } else {
      console.log('🌐 Making public request to:', endpoint);
    }

    try {
      console.log('API Request:', { 
        method, 
        url: `${this.baseURL}${endpoint}`, 
        data: body, 
        hasToken: !!headers.Authorization 
      });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error(`❌ Backend returned HTML instead of JSON for ${endpoint}:`, htmlText.substring(0, 200));
        throw new Error(`Backend error: Received HTML response instead of JSON. Endpoint may not exist or backend may be misconfigured.`);
      }

      const data = await response.json();
      
      console.log('API Response:', { 
        status: response.status, 
        url: endpoint, 
        data: data 
      });

      if (!response.ok) {
        // Handle Firebase token expiration with refresh attempt
        if (response.status === 401 && requireAuth && !isAdmin) {
          console.log('🔄 Firebase token expired or invalid, attempting refresh...');
          
          try {
            // Get fresh Firebase token instead of using old refresh method
            const newToken = await this.ensureFreshFirebaseToken();
            
            if (newToken) {
              // Retry the request with new Firebase token
              headers.Authorization = `Bearer ${newToken}`;
              console.log('🔁 Retrying request with fresh Firebase token...');
              
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                console.log(`✅ Retry successful with Firebase token [${method}] ${endpoint}`);
                return retryData;
              }
            }
          } catch (refreshError) {
            console.error('❌ Firebase token refresh failed:', refreshError);
          }
          
          // Firebase token refresh failed, user needs to re-authenticate
          console.log('❌ Firebase authentication failed, user needs to login again');
          this.userToken = null;
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          
          // Create specific error for authentication failures
          if (endpoint.includes('/api/chat/')) {
            const authError = new Error('Authentication required to access chat support.');
            authError.code = 'AUTHENTICATION_REQUIRED';
            authError.requiresLogin = true;
            throw authError;
          }
        }
        
        // Don't log "already in wishlist" errors as they're expected and handled by toggleWishlist
        if (endpoint.includes('/api/wishlist/add') && data.message?.includes('already in wishlist')) {
          console.log(`ℹ️ Expected wishlist toggle: ${data.message}`);
          // Create a specific error type for expected wishlist toggle scenarios
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
          error.isExpectedWishlistError = true;
          throw error;
        }
        
        // Handle duplicate review errors specially
        if (endpoint.includes('/reviews') && data.message?.includes('already reviewed')) {
          console.log(`ℹ️ Duplicate review attempt: ${data.message}`);
          // Create a specific error type for duplicate review scenarios
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
          error.isDuplicateReviewError = true;
          throw error;
        } else {
          console.error(`❌ API Error [${response.status}] ${endpoint}:`, data);
          console.error('❌ Full error response:', JSON.stringify(data, null, 2));
          console.error('❌ Request that failed:', body ? JSON.stringify(body, null, 2) : 'No body');
          
          // Enhanced error handling for chat endpoints
          if (endpoint.includes('/chat/')) {
            console.error('🔍 CHAT ENDPOINT ERROR ANALYSIS:');
            
            if (response.status === 401) {
              console.error('🔐 Authentication Error: Firebase JWT token invalid or expired');
              console.error('💡 Try: Refresh Firebase token and retry');
            } else if (response.status === 500) {
              console.error('🚨 Server Error: Backend processing failed');
              console.error('💡 Possible causes:');
              console.error('• Firebase Admin SDK configuration issues');
              console.error('• Database connection problems');
              console.error('• Backend authentication middleware errors');
              console.error('• Check backend server logs for details');
            } else if (response.status === 403) {
              console.error('🚫 Forbidden: User not authorized for chat functionality');
            }
          }
          
          throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      console.log(`✅ API Success [${method}] ${endpoint}:`, data.success ? 'SUCCESS' : 'RESPONSE_RECEIVED');
      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Token refresh functionality
  async refreshAuthToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('🔐 No refresh token available');
        return null;
      }

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          this.userToken = data.token;
          await AsyncStorage.setItem('userToken', data.token);
          
          if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
          }
          
          console.log('✅ Token refreshed successfully');
          return data.token;
        }
      }
      
      console.log('❌ Token refresh failed');
      return null;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
      return null;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.makeRequest('/api/auth/login', 'POST', { email, password });
    if (response.token) {
      this.userToken = response.token;
      await AsyncStorage.setItem('userToken', response.token);
      
      // Transfer guest data after successful authentication
      try {
        await this.transferAllGuestData();
      } catch (transferError) {
        console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
      }
    }
    return response;
  }

  async firebaseLogin(idToken) {
    try {
      console.log('🔄 Authenticating with Yoraa backend...');
      
      const response = await this.makeRequest('/api/auth/login/firebase', 'POST', { idToken });
      
      if (response.success && response.data) {
        console.log('✅ Backend authentication successful');
        console.log('ℹ️ Backend automatically links accounts with same email across different providers');
        
        // CRITICAL: Store the JWT token for future API calls
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token) {
          this.userToken = token;
          await AsyncStorage.setItem('userToken', token);
          
          if (userData) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          }
          
          console.log('✅ Token stored successfully');
          
          // Transfer guest data after successful authentication
          try {
            await this.transferAllGuestData();
          } catch (transferError) {
            console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
          }
          
          return response.data;
        } else {
          throw new Error('No token received from backend');
        }
      } else {
        throw new Error(response.message || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Backend authentication failed:', error);
      throw error;
    }
  }

  /**
   * Link a new authentication provider to existing account
   * Requires user to be authenticated
   */
  async linkAuthProvider(idToken) {
    try {
      console.log('🔗 Linking authentication provider...');
      
      if (!this.userToken) {
        throw new Error('Must be authenticated to link providers');
      }
      
      const response = await this.makeRequest(
        '/api/auth/link-provider', 
        'POST', 
        { idToken }, 
        true // Requires authentication
      );
      
      if (response.success) {
        console.log('✅ Provider linked successfully');
        
        // Update stored user data if provided
        if (response.data?.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to link provider');
      }
    } catch (error) {
      console.error('❌ Failed to link provider:', error);
      throw error;
    }
  }

  /**
   * Get list of linked authentication providers
   */
  async getLinkedProviders() {
    try {
      console.log('📋 Fetching linked providers...');
      
      const response = await this.makeRequest(
        '/api/auth/linked-providers', 
        'GET', 
        null, 
        true // Requires authentication
      );
      
      if (response.success && response.data) {
        console.log('✅ Linked providers retrieved:', response.data.linkedProviders);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch linked providers');
      }
    } catch (error) {
      console.error('❌ Failed to fetch linked providers:', error);
      throw error;
    }
  }

  /**
   * Apple Sign In with conflict detection
   */
  async appleSignIn(idToken) {
    try {
      console.log('🍎 Apple Sign In to backend...');
      
      const response = await this.makeRequest('/api/auth/apple-signin', 'POST', { idToken });
      
      if (response.success && response.data) {
        console.log('✅ Apple Sign In successful');
        
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token) {
          this.userToken = token;
          await AsyncStorage.setItem('userToken', token);
          
          if (userData) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          }
          
          console.log('✅ Apple token stored successfully');
          
          // Transfer guest data after successful authentication
          try {
            await this.transferAllGuestData();
          } catch (transferError) {
            console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
          }
          
          return response.data;
        } else {
          throw new Error('No token received from backend');
        }
      } else {
        throw new Error(response.message || 'Apple Sign In failed');
      }
    } catch (error) {
      console.error('❌ Apple Sign In failed:', error);
      
      // Check if it's a 409 conflict error
      if (error.response?.status === 409 || error.message?.includes('account exists')) {
        const conflictError = new Error(error.message || 'Account exists with different authentication method');
        conflictError.isAccountConflict = true;
        conflictError.status = 409;
        conflictError.data = error.response?.data?.data || error.data;
        throw conflictError;
      }
      
      throw error;
    }
  }

  async signup(userData) {
    const response = await this.makeRequest('/api/auth/signup', 'POST', userData);
    if (response.token) {
      this.userToken = response.token;
      await AsyncStorage.setItem('userToken', response.token);
    }
    return response;
  }

  async logout() {
    try {
      // Store token before clearing it (for backend logout call)
      const tokenForLogout = this.userToken;
      
      // Clear local state first
      this.userToken = null;
      await AsyncStorage.removeItem('userToken');
      
      // Try to call backend logout with the stored token
      if (tokenForLogout) {
        try {
          // Make request with explicit token instead of using requireAuth
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForLogout}`
          };
          
          const response = await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            headers,
            body: null
          });
          
          if (response.ok) {
            console.log('✅ Backend logout successful');
          } else {
            console.warn('⚠️ Backend logout returned non-200 status, but local logout completed');
          }
        } catch (apiError) {
          console.warn('⚠️ Backend logout failed, but local logout completed:', apiError.message);
          // Don't throw - local logout is more important
        }
      } else {
        console.log('⚠️ No token available for backend logout, local logout completed');
      }
      
      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, try to clear local state
      this.userToken = null;
      await AsyncStorage.removeItem('userToken');
      return { success: false, error: error.message };
    }
  }

  // Wishlist/Favorites methods
  async getWishlist(page = 1, limit = 10) {
    try {
      const isAuthenticated = !!this.userToken;
      let endpoint = `/api/wishlist/?page=${page}&limit=${limit}`;
      
      // Add session ID for guest users
      if (!isAuthenticated && this.guestSessionId) {
        endpoint += `&sessionId=${this.guestSessionId}`;
        console.log('👤 Getting wishlist for guest session:', this.guestSessionId);
      }
      
      const response = await this.makeRequest(endpoint, 'GET', null, isAuthenticated);
      console.log('🔍 getWishlist raw response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(itemId) {
    try {
      console.log('❤️ Adding item to wishlist:', itemId);
      
      const requestBody = { itemId };
      const isAuthenticated = !!this.userToken;
      
      // Add session ID for guest users
      if (!isAuthenticated && this.guestSessionId) {
        requestBody.sessionId = this.guestSessionId;
        console.log('👤 Adding to wishlist as guest with session:', this.guestSessionId);
      }
      
      const response = await this.makeRequest('/api/wishlist/add', 'POST', requestBody, isAuthenticated);
      
      if (response.success) {
        console.log('✅ Item added to wishlist successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to add item to wishlist');
      }
    } catch (error) {
      // Don't log "already in wishlist" errors as they're expected and handled by toggleWishlist
      if (error.message?.includes('already in wishlist')) {
        console.log('ℹ️ Item already in wishlist, will be handled by toggle logic');
      } else if (error.message?.includes('Item not found') || error.message?.includes('not found')) {
        console.error('❌ Item not found on server:', itemId);
      } else {
        console.error('❌ Error adding to wishlist:', error);
      }
      throw error;
    }
  }

  async removeFromWishlist(itemId) {
    try {
      console.log('💔 Removing item from wishlist:', itemId);
      
      const isAuthenticated = !!this.userToken;
      let endpoint = `/api/wishlist/remove/${itemId}`;
      let requestBody = null;
      
      console.log('🔐 Authentication state:', {
        hasUserToken: !!this.userToken,
        hasGuestSessionId: !!this.guestSessionId,
        userToken: this.userToken ? 'TOKEN_PRESENT' : 'NO_TOKEN',
        guestSessionId: this.guestSessionId,
        isAuthenticated
      });
      
      // Add session ID for guest users
      if (!isAuthenticated && this.guestSessionId) {
        // For DELETE requests, we might need to send sessionId in body or query param
        // Check with backend team about preferred approach, for now using query param
        endpoint += `?sessionId=${this.guestSessionId}`;
        console.log('👤 Removing from wishlist as guest with session:', this.guestSessionId);
      } else if (isAuthenticated) {
        console.log('🔑 Removing from wishlist as authenticated user');
      } else {
        console.log('⚠️ WARNING: No authentication method available!');
      }
      
      console.log('🌐 Final DELETE endpoint:', endpoint);
      
      const response = await this.makeRequest(endpoint, 'DELETE', requestBody, isAuthenticated);
      
      if (response.success) {
        console.log('✅ Item removed from wishlist successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      throw error;
    }
  }

  async toggleWishlist(itemId) {
    try {
      // First try to add to wishlist
      const response = await this.addToWishlist(itemId);
      return { added: true, response };
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('already in wishlist')) {
        // Item already in wishlist, remove it
        const response = await this.removeFromWishlist(itemId);
        return { added: false, response };
      }
      throw error;
    }
  }

  // Cart methods
  async getCart() {
    try {
      const isAuthenticated = !!this.userToken;
      let endpoint = '/api/cart/user';
      
      // Add session ID for guest users
      if (!isAuthenticated && this.guestSessionId) {
        endpoint += `?sessionId=${this.guestSessionId}`;
        console.log('👤 Getting cart for guest session:', this.guestSessionId);
      }
      
      const response = await this.makeRequest(endpoint, 'GET', null, isAuthenticated);
      return response;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      throw error;
    }
  }

  async addToCart(itemId, size, quantity = 1, sku = null) {
    try {
      console.log('🛒 Adding item to cart:', { itemId, size, quantity, sku });
      
      const requestBody = {
        itemId,
        size,
        quantity
      };
      
      // Add sku if provided
      if (sku) {
        requestBody.sku = sku;
      }

      // Add session ID for guest users (when no auth token available)
      const isAuthenticated = !!this.userToken;
      if (!isAuthenticated && this.guestSessionId) {
        requestBody.sessionId = this.guestSessionId;
        console.log('👤 Adding as guest user with session:', this.guestSessionId);
      }
      
      const response = await this.makeRequest('/api/cart/', 'POST', requestBody, isAuthenticated);
      
      if (response.success) {
        console.log('✅ Item added to cart successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
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

  // Guest Data Transfer Methods
  async transferGuestCart() {
    try {
      if (!this.guestSessionId || !this.userToken) {
        console.log('⚠️ No guest session or auth token available for cart transfer');
        return { success: true, transferredItems: 0 };
      }

      console.log('🔄 Transferring guest cart to authenticated user...');
      const response = await this.makeRequest('/api/cart/transfer', 'POST', {
        sessionId: this.guestSessionId
      }, true);
      
      if (response.success) {
        console.log(`✅ Guest cart transferred: ${response.data?.transferredItems || 0} items`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error transferring guest cart:', error);
      throw error;
    }
  }

  async transferGuestWishlist() {
    try {
      if (!this.guestSessionId || !this.userToken) {
        console.log('⚠️ No guest session or auth token available for wishlist transfer');
        return { success: true, transferredItems: 0 };
      }

      console.log('🔄 Transferring guest wishlist to authenticated user...');
      const response = await this.makeRequest('/api/wishlist/transfer', 'POST', {
        sessionId: this.guestSessionId
      }, true);
      
      if (response.success) {
        console.log(`✅ Guest wishlist transferred: ${response.data?.transferredItems || 0} items`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error transferring guest wishlist:', error);
      throw error;
    }
  }

  async transferAllGuestData() {
    try {
      console.log('🔄 Transferring all guest data...');
      
      const [cartResult, wishlistResult] = await Promise.all([
        this.transferGuestCart(),
        this.transferGuestWishlist()
      ]);

      // Clear guest session after successful transfer
      if (this.guestSessionId) {
        await AsyncStorage.removeItem('guestSessionId');
        this.guestSessionId = null;
        console.log('🗑️ Cleared guest session after transfer');
      }

      return {
        success: true,
        cart: cartResult,
        wishlist: wishlistResult
      };
    } catch (error) {
      console.error('❌ Error transferring guest data:', error);
      throw error;
    }
  }

  // Product methods
  async getItems(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    return await this.makeRequest(`/api/items?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
  }

  async getItemById(itemId) {
    return await this.makeRequest(`/api/items/${itemId}`);
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

  // Orders & Payment
  async createOrder(orderData) {
    return await this.makeRequest('/api/orders', 'POST', orderData, true);
  }

  async createPaymentOrder(orderData) {
    try {
      console.log('💳 Creating payment order with validation...');
      
      // Enhanced checkout validation - check if user is authenticated
      if (!this.userToken) {
        return {
          success: false,
          message: "Authentication required for checkout. Please login with Apple, Google, phone number, or email.",
          requireAuth: true
        };
      }

      // Call the payment creation endpoint
      const response = await this.makeRequest('/api/payment/create-order', 'POST', orderData, true);
      
      return response;
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      
      // Enhanced error handling for authentication and validation
      if (error.message.includes('Authentication required')) {
        return {
          success: false,
          message: "Authentication required for checkout. Please login with Apple, Google, phone number, or email.",
          requireAuth: true
        };
      }
      
      if (error.message.includes('valid email') || error.message.includes('valid phone')) {
        return {
          success: false,
          message: "Please provide valid email address and valid phone number to proceed with checkout.",
          requiresUserInfo: true,
          missingFields: error.message.includes('email') && error.message.includes('phone') 
            ? ["valid email address", "valid phone number"]
            : error.message.includes('email') ? ["valid email address"] : ["valid phone number"]
        };
      }
      
      throw error;
    }
  }

  async getUserOrders() {
    return await this.makeRequest('/api/orders/user', 'GET', null, true);
  }

  // User Profile
  async getUserProfile() {
    try {
      return await this.makeRequest('/api/profile', 'GET', null, true);
    } catch (error) {
      console.warn('⚠️ Profile endpoint not available, returning fallback data:', error.message);
      
      // Return fallback profile data when backend endpoint is missing
      return {
        success: true,
        data: {
          id: 'guest_user',
          name: 'Guest User',
          email: 'guest@yoraa.com',
          phone: null,
          isGuest: true,
          points: 0,
          fallback: true
        },
        message: 'Using fallback profile data - backend endpoint not implemented'
      };
    }
  }

  async updateUserProfile(profileData) {
    return await this.makeRequest('/api/profile', 'PUT', profileData, true);
  }

  // Points & Rewards Methods
  async getUserPoints(userId = null) {
    try {
      console.log('🎯 Fetching user points');
      
      // If userId is provided, use the specific endpoint with userId
      // Otherwise, try the general endpoint that should work with the authenticated user
      const endpoint = userId ? `/api/points/user/${userId}` : '/api/points/user';
      
      const response = await this.makeRequest(endpoint, 'GET', null, true);
      
      if (response.success) {
        console.log('✅ User points fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user points');
      }
    } catch (error) {
      console.error('❌ Error fetching user points:', error);
      
      // If the first endpoint fails and we didn't use userId, we might need to get user data
      if (!userId && error.message.includes('400')) {
        console.log('🔄 Attempting to fetch points with user ID from storage');
        try {
          const userData = await this.getUserData();
          if (userData && userData.id) {
            return await this.getUserPoints(userData.id);
          }
        } catch (retryError) {
          console.error('❌ Retry with user ID also failed:', retryError);
        }
      }
      
      throw error;
    }
  }

  async redeemPoints(points, orderId) {
    try {
      console.log('🎯 Redeeming points:', { points, orderId });
      const response = await this.makeRequest('/api/points/redeem', 'POST', {
        points,
        orderId
      }, true);
      
      if (response.success) {
        console.log('✅ Points redeemed successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('❌ Error redeeming points:', error);
      throw error;
    }
  }

  // Utility methods
  async validatePromoCode(code, orderAmount) {
    return await this.makeRequest('/api/promoCode/promo-codes/validate', 'POST', {
      code,
      orderAmount
    });
  }

  // Promo Code Methods
  async getAvailablePromoCodes() {
    try {
      console.log('🎟️ Fetching available promo codes');
      
      // NOTE: This endpoint might need to be created by backend team
      // For now, we'll try a user-specific endpoint, and fallback to public validation
      let response;
      
      try {
        // Try user-specific promo codes endpoint first
        response = await this.makeRequest('/api/promoCode/user/available', 'GET', null, true);
      } catch (error) {
        if (error.message.includes('404')) {
          console.log('User-specific promo endpoint not available, trying alternative...');
          
          // Fallback: Try to get public/general promo codes 
          // This endpoint might need to be implemented by backend
          try {
            response = await this.makeRequest('/api/promoCode/public', 'GET', null, false);
          } catch (fallbackError) {
            console.log('Public promo endpoint not available either');
            // Return empty array with a note for backend team
            return {
              success: true,
              data: [],
              message: 'No promo code endpoint available - backend implementation needed'
            };
          }
        } else {
          throw error;
        }
      }
      
      if (response && response.success) {
        console.log('✅ Available promo codes fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch promo codes');
      }
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error);
      
      // For development, return mock data if no endpoint is available
      if (error.message.includes('404') || error.message.includes('Network')) {
        console.log('🔄 Using mock promo codes for development');
        return {
          success: true,
          data: [
            {
              id: 'mock_1',
              code: 'WELCOME10',
              title: '10% OFF',
              description: 'Welcome discount for new users',
              discountType: 'percentage',
              discountValue: 10,
              validUntil: '2024-12-31',
              minOrderValue: 50
            },
            {
              id: 'mock_2', 
              code: 'SAVE20',
              title: '20% OFF',
              description: 'Save big on your order',
              discountType: 'percentage',
              discountValue: 20,
              validUntil: '2024-12-31',
              minOrderValue: 100
            }
          ],
          message: 'Using mock data - implement /api/promoCode/user/available endpoint'
        };
      }
      
      throw error;
    }
  }

  async getAppSettings() {
    return await this.makeRequest('/api/settings');
  }

  // Error handling helper
  handleError(error) {
    if (error.message.includes('401') || error.message.includes('Authentication required')) {
      // Unauthorized - clear tokens
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

  // Check if user is authenticated
  isAuthenticated() {
    const hasToken = !!this.userToken;
    console.log('🔍 Authentication check:', hasToken ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
    return hasToken;
  }

  // Helper method to check authentication before protected calls
  requireAuthentication(action = 'perform this action') {
    if (!this.isAuthenticated()) {
      const error = new Error(`Authentication required to ${action}. Please log in.`);
      error.code = 'AUTHENTICATION_REQUIRED';
      console.warn(`⚠️ Attempted to ${action} without authentication`);
      throw error;
    }
  }

  // Get current user token
  getUserToken() {
    return this.userToken;
  }

  // Get user data from storage
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Debug method to check token status
  async debugTokenStatus() {
    const storedToken = await AsyncStorage.getItem('userToken');
    const storedUserData = await AsyncStorage.getItem('userData');
    
    console.log('🔍 Token Debug Status:');
    console.log('  - Memory token:', this.userToken ? 'EXISTS' : 'MISSING');
    console.log('  - Stored token:', storedToken ? 'EXISTS' : 'MISSING');
    console.log('  - User data:', storedUserData ? 'EXISTS' : 'MISSING');
    console.log('  - isAuthenticated():', this.isAuthenticated());
    
    return {
      memoryToken: !!this.userToken,
      storedToken: !!storedToken,
      userData: !!storedUserData,
      isAuthenticated: this.isAuthenticated()
    };
  }

  // AuthUtils compatible methods
  async isAuthenticatedAsync() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async logoutComplete() {
    try {
      // Store token before clearing it (for backend logout call)
      const tokenForLogout = this.userToken;
      
      // Clear local state
      this.userToken = null;
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Try to call backend logout with the stored token
      if (tokenForLogout) {
        try {
          // Make request with explicit token instead of using requireAuth
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForLogout}`
          };
          
          const response = await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            headers,
            body: null
          });
          
          if (response.ok) {
            console.log('✅ Backend logout successful (logoutComplete)');
          } else {
            console.warn('⚠️ Backend logout returned non-200 status (logoutComplete)');
          }
        } catch (apiError) {
          console.warn('⚠️ Backend logout failed (logoutComplete):', apiError.message);
          // Don't throw - local logout is more important
        }
      }
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Ensure local state is cleared even if there's an error
      this.userToken = null;
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    }
  }

  // Address Management Methods
  async createAddress(addressData) {
    try {
      console.log('🏠 Creating new address:', addressData);
      const response = await this.makeRequest('/api/address/createAddress', 'POST', addressData, true);
      
      if (response.success) {
        console.log('✅ Address created successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to create address');
      }
    } catch (error) {
      console.error('❌ Error creating address:', error);
      throw error;
    }
  }

  async getAddresses() {
    try {
      console.log('🏠 Fetching user addresses');
      const response = await this.makeRequest('/api/address/user', 'GET', null, true);
      
      if (response.success) {
        console.log('✅ Addresses fetched successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch addresses');
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      throw error;
    }
  }

  async updateAddress(addressId, addressData) {
    try {
      console.log('🏠 Updating address:', addressId, addressData);
      const response = await this.makeRequest(`/api/address/updateById/${addressId}`, 'PATCH', addressData, true);
      
      if (response.success) {
        console.log('✅ Address updated successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(addressId) {
    try {
      console.log('🏠 Deleting address:', addressId);
      const response = await this.makeRequest(`/api/address/deleteById/${addressId}`, 'DELETE', null, true);
      
      if (response.success) {
        console.log('✅ Address deleted successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      throw error;
    }
  }

  // Quick token verification method
  async verifyTokenStored() {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Stored token:', token ? 'EXISTS' : 'MISSING');
    return !!token;
  }

  // ===== USER LOCATION PREFERENCE METHODS =====

  /**
   * Get user's location preference from backend
   */
  async getUserLocationPreference() {
    try {
      console.log('🌍 Getting user location preference from backend...');
      const response = await this.makeRequest('/api/users/location-preference', 'GET', null, true);
      
      if (response.success && response.data) {
        console.log('✅ User location preference retrieved:', response.data);
        return response.data;
      } else {
        console.log('ℹ️ No location preference found for user');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user location preference:', error);
      return null; // Return null instead of throwing to allow fallback
    }
  }

  /**
   * Set user's location preference in backend
   */
  async setUserLocationPreference(locationData) {
    try {
      console.log('🌍 Setting user location preference:', locationData);
      console.log('🔍 DEBUG - Payload being sent:', JSON.stringify(locationData, null, 2));
      const response = await this.makeRequest('/api/users/location-preference', 'POST', locationData, true);
      
      if (response.success) {
        console.log('✅ User location preference saved successfully');
        return true;
      } else {
        console.log('❌ Backend rejected request. Response:', response);
        throw new Error(response.message || 'Failed to save location preference');
      }
    } catch (error) {
      console.error('❌ Error setting user location preference:', error);
      console.error('❌ Full error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      return false; // Return false instead of throwing to allow graceful handling
    }
  }

  // ===== CURRENCY CONVERSION METHODS =====

  /**
   * Get exchange rate from backend
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      console.log(`💱 Getting exchange rate: ${fromCurrency} → ${toCurrency}`);
      const targetCountry = toCurrency === 'USD' ? 'US' : 'IN';
      
      const response = await this.makeRequest('/api/orders/convert-prices', 'POST', {
        items: [{ price: 1 }], // Test with 1 unit to get rate
        country: targetCountry
      });
      
      if (response && response.exchangeRate) {
        console.log('✅ Exchange rate retrieved:', response.exchangeRate);
        return response.exchangeRate;
      } else {
        throw new Error('Invalid exchange rate response');
      }
    } catch (error) {
      console.error('❌ Error getting exchange rate:', error);
      // Return fallback rates
      if (fromCurrency === 'INR' && toCurrency === 'USD') {
        return 0.012;
      }
      if (fromCurrency === 'USD' && toCurrency === 'INR') {
        return 83.33;
      }
      return 1;
    }
  }

  /**
   * Get delivery options from backend
   */
  async getDeliveryOptions(countryCode, currency) {
    try {
      console.log(`🚚 Getting delivery options for: ${countryCode} (${currency})`);
      const response = await this.makeRequest(`/api/orders/delivery-options?location=${countryCode}&currency=${currency}`, 'GET');
      
      if (response.success && response.data && response.data.deliveryOptions) {
        console.log('✅ Delivery options retrieved:', response.data.deliveryOptions.length);
        return response.data.deliveryOptions;
      } else {
        console.log('⚠️ No delivery options found, will use fallback');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting delivery options:', error);
      return null; // Return null to trigger fallback
    }
  }

  // =============================================================================
  // SHIPROCKET INTEGRATION METHODS
  // =============================================================================

  /**
   * Create Shiprocket order for a placed order
   */
  async createShiprocketOrder(orderId, pickupLocationId = "Primary") {
    try {
      console.log(`📦 Creating Shiprocket order for: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/create-shiprocket-order/${orderId}`, 
        'POST', 
        { pickupLocationId },
        true, // Requires authentication
        false // User token (not admin)
      );
      
      if (response.success) {
        console.log('✅ Shiprocket order created successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to create Shiprocket order:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error creating Shiprocket order:', error);
      throw error;
    }
  }

  /**
   * Generate AWB (Air Waybill) for a shipment
   */
  async generateAWB(orderId, preferredCourier = "bluedart") {
    try {
      console.log(`📋 Generating AWB for order: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/generate-awb/${orderId}`, 
        'POST', 
        preferredCourier ? { preferredCourier } : {},
        true, // Requires authentication
        false // User token (not admin)
      );
      
      if (response.success) {
        console.log('✅ AWB generated successfully:', response.data.awb_code);
        return response;
      } else {
        console.error('❌ Failed to generate AWB:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error generating AWB:', error);
      throw error;
    }
  }

  /**
   * Track shipment using order ID
   */
  async trackShipment(orderId) {
    try {
      console.log(`📍 Tracking shipment for order: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/track-shipment/${orderId}`, 
        'GET', 
        null,
        true // Requires authentication
      );
      
      if (response.success) {
        console.log('✅ Tracking data retrieved successfully');
        return response;
      } else {
        console.error('❌ Failed to get tracking data:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error tracking shipment:', error);
      throw error;
    }
  }

  /**
   * Create return request (using existing endpoint)
   */
  async createReturnRequest(orderId, reason = "Size issue") {
    try {
      console.log(`↩️ Creating return request for order: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/return`, 
        'POST', 
        { orderId, reason },
        true, // Requires authentication  
        false // User token
      );
      
      if (response.success) {
        console.log('✅ Return request created successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to create return request:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error creating return request:', error);
      throw error;
    }
  }

  /**
   * Process return AWB
   */
  async processReturnAWB(orderId) {
    try {
      console.log(`📋 Processing return AWB for order: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/process-return-awb/${orderId}`, 
        'POST', 
        {},
        true, // Requires authentication
        false // User token
      );
      
      if (response.success) {
        console.log('✅ Return AWB processed successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to process return AWB:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error processing return AWB:', error);
      throw error;
    }
  }

  /**
   * Create exchange request (using existing endpoint)
   */
  async createExchangeRequest(orderId, newItemId, reason = "Size exchange") {
    try {
      console.log(`🔄 Creating exchange request for order: ${orderId}`);
      const response = await this.makeRequest(
        `/api/orders/exchange`, 
        'POST', 
        { orderId, newItemId, reason },
        true, // Requires authentication
        false // User token
      );
      
      if (response.success) {
        console.log('✅ Exchange request created successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to create exchange request:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error creating exchange request:', error);
      throw error;
    }
  }

  /**
   * Check serviceability for a pincode
   */
  async checkServiceability(pickupPincode, deliveryPincode, weight) {
    try {
      console.log(`🔍 Checking serviceability: ${pickupPincode} → ${deliveryPincode}`);
      const response = await this.makeRequest(
        '/api/orders/check-serviceability', 
        'POST', 
        {
          pickupPincode,
          deliveryPincode,
          weight
        },
        false // No authentication required according to backend
      );
      
      if (response.success) {
        console.log('✅ Serviceability checked successfully');
        return response;
      } else {
        console.error('❌ Failed to check serviceability:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error checking serviceability:', error);
      throw error;
    }
  }

  // Review methods
  /**
   * Get reviews for a specific product
   */
  async getProductReviews(productId, filters = {}) {
    try {
      console.log(`📋 Fetching reviews for product: ${productId}`);
      
      let queryParams = [];
      if (filters.rating) queryParams.push(`rating=${filters.rating}`);
      if (filters.limit) queryParams.push(`limit=${filters.limit}`);
      if (filters.page) queryParams.push(`page=${filters.page}`);
      
      const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const endpoint = `/api/products/${productId}/reviews${query}`;
      
      const response = await this.makeRequest(endpoint, 'GET', null, false);
      
      if (response.success) {
        console.log('✅ Product reviews fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch product reviews:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching product reviews:', error);
      throw error;
    }
  }

  /**
   * Get overall rating statistics for a product
   */
  async getProductRatingStats(productId) {
    try {
      console.log(`📊 Fetching rating stats for product: ${productId}`);
      
      const response = await this.makeRequest(`/api/products/${productId}/rating-stats`, 'GET', null, false);
      
      if (response.success) {
        console.log('✅ Product rating stats fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch product rating stats:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching product rating stats:', error);
      throw error;
    }
  }

  /**
   * Check if the current user has already reviewed a specific product
   */
  async hasUserReviewedProduct(productId) {
    try {
      console.log(`🔍 Checking if user has already reviewed product: ${productId}`);
      
      if (!this.isAuthenticated()) {
        console.log('❌ User not authenticated, cannot check review status');
        return false;
      }
      
      const response = await this.makeRequest(`/api/products/${productId}/user-review-status`, 'GET', null, true);
      
      if (response.success) {
        console.log(`✅ User review status checked: ${response.hasReviewed ? 'Already reviewed' : 'Not reviewed yet'}`);
        return response.hasReviewed || false;
      } else {
        console.log('ℹ️ Could not determine review status, allowing submission attempt');
        return false;
      }
    } catch (error) {
      console.log('ℹ️ Error checking review status, allowing submission attempt:', error.message);
      return false;
    }
  }

  /**
   * Submit a review for a product
   */
  async submitProductReview(productId, reviewData) {
    try {
      console.log(`✍️ Submitting review for product: ${productId}`);
      
      // Debug authentication status
      console.log('🔍 Pre-review submission debug:');
      console.log('  - User Token:', this.userToken ? 'EXISTS' : 'MISSING');
      console.log('  - Is Authenticated:', this.isAuthenticated());
      
      // Check if user is authenticated
      if (!this.isAuthenticated()) {
        console.error('❌ User not authenticated for review submission');
        throw new Error('Please log in to submit a review');
      }
      
      const response = await this.makeRequest(
        `/api/products/${productId}/reviews`, 
        'POST', 
        reviewData, 
        true // Authentication required
      );
      
      if (response.success) {
        console.log('✅ Product review submitted successfully');
        return response;
      } else {
        console.error('❌ Failed to submit product review:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error submitting product review:', error);
      
      // Handle different error types specifically
      if (error.isDuplicateReviewError) {
        // Pass along the duplicate review error for special handling
        throw error;
      } else if (error.message.includes('Authentication required') || error.message.includes('log in')) {
        throw new Error('Please log in to submit a review');
      } else if (error.message.includes('Token missing') || error.message.includes('session has expired')) {
        throw new Error('Your session has expired. Please log in again');
      } else {
        throw error;
      }
    }
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId) {
    try {
      console.log(`👍 Marking review as helpful: ${reviewId}`);
      
      const response = await this.makeRequest(
        `/api/reviews/${reviewId}/helpful`, 
        'POST', 
        {}, 
        true // Authentication required
      );
      
      if (response.success) {
        console.log('✅ Review marked as helpful successfully');
        return response;
      } else {
        console.error('❌ Failed to mark review as helpful:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error marking review as helpful:', error);
      throw error;
    }
  }

  /**
   * Submit detailed product rating (Size, Comfort, Durability)
   */
  async submitProductRating(productId, ratingData) {
    try {
      console.log(`📊 Submitting detailed rating for product: ${productId}`);
      
      const response = await this.makeRequest(
        `/api/products/${productId}/rating`, 
        'POST', 
        ratingData, 
        true // Authentication required
      );
      
      if (response.success) {
        console.log('✅ Product rating submitted successfully');
        return response;
      } else {
        console.error('❌ Failed to submit product rating:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error submitting product rating:', error);
      throw error;
    }
  }

  /**
   * Get detailed product ratings (Size, Comfort, Durability stats)
   */
  async getProductDetailedRatings(productId) {
    try {
      console.log(`📊 Fetching detailed ratings for product: ${productId}`);
      
      const response = await this.makeRequest(`/api/products/${productId}/detailed-ratings`, 'GET', null, false);
      
      if (response.success) {
        console.log('✅ Product detailed ratings fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch product detailed ratings:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching product detailed ratings:', error);
      throw error;
    }
  }

  // ====================== CHAT SUPPORT API METHODS ======================

  /**
   * Create a new chat session
   */
  async createChatSession(userInfo = null) {
    try {
      console.log('💬 Creating new chat session...');
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      // Get current Firebase user for user info
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated with Firebase');
      }
      
      console.log(`🔐 Firebase User: ${currentUser.uid} (${currentUser.email})`);
      
      // Get a fresh Firebase ID token
      const idToken = await currentUser.getIdToken(true);
      console.log(`🎫 Fresh Firebase token obtained (${idToken.length} chars)`);
      
      const sessionData = {
        sessionId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userInfo: userInfo || {
          isGuest: false,
          userId: currentUser.uid,
          firebaseUid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email || 'User',
          emailVerified: currentUser.emailVerified,
          phoneNumber: currentUser.phoneNumber,
          authSource: 'firebase'
        },
        startTime: new Date().toISOString(),
        status: 'active'
      };

      console.log('📤 Sending chat session request:', {
        url: `${this.baseURL}/api/chat/session`,
        sessionId: sessionData.sessionId,
        userId: sessionData.userInfo.userId,
        email: sessionData.userInfo.email
      });

      // Chat sessions now require authentication - no more guest users
      const response = await this.makeRequest('/api/chat/session', 'POST', sessionData, true);
      
      if (response.success) {
        console.log('✅ Chat session created successfully:', response.data.sessionId);
        return response;
      } else {
        console.error('❌ Failed to create chat session:', response.message);
        console.error('🔍 Backend Response:', JSON.stringify(response, null, 2));
        
        // Handle specific error cases
        if (response.statusCode === 500) {
          console.error('🚨 SERVER ERROR: Backend Firebase configuration issue');
          console.error('💡 Possible causes:');
          console.error('• Firebase Admin SDK not properly configured in backend');
          console.error('• Database connection issues');
          console.error('• Authentication middleware problems');
        }
        
        return response;
      }
    } catch (error) {
      console.error('❌ Error creating chat session:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  /**
   * Send a message in a chat session
   */
  async sendChatMessage(sessionId, message, sender = 'user') {
    try {
      console.log(`💬 Sending message in session: ${sessionId}`);
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      const messageData = {
        sessionId,
        message: message.trim(),
        sender, // 'user' or 'admin'
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const response = await this.makeRequest('/api/chat/message', 'POST', messageData, true);
      
      if (response.success) {
        console.log('✅ Message sent successfully');
        return response;
      } else {
        console.error('❌ Failed to send message:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get chat messages for a session
   */
  async getChatMessages(sessionId, lastMessageId = null) {
    try {
      console.log(`💬 Fetching messages for session: ${sessionId}`);
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      let endpoint = `/api/chat/messages/${sessionId}`;
      if (lastMessageId) {
        endpoint += `?after=${lastMessageId}`;
      }

      const response = await this.makeRequest(endpoint, 'GET', null, true);
      
      if (response.success) {
        console.log('✅ Chat messages fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch chat messages:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching chat messages:', error);
      throw error;
    }
  }

  /**
   * End a chat session
   */
  async endChatSession(sessionId, rating = null, feedback = null) {
    try {
      console.log(`💬 Ending chat session: ${sessionId}`);
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      const endData = {
        sessionId,
        endTime: new Date().toISOString(),
        status: 'ended_by_user',
        rating,
        feedback
      };

      const response = await this.makeRequest('/api/chat/session/end', 'POST', endData, true);
      
      if (response.success) {
        console.log('✅ Chat session ended successfully');
        return response;
      } else {
        console.error('❌ Failed to end chat session:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error ending chat session:', error);
      throw error;
    }
  }

  /**
   * Get chat session history for authenticated user
   */
  async getChatHistory() {
    try {
      console.log('💬 Fetching chat history');
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      const response = await this.makeRequest('/api/chat/history', 'GET', null, true);
      
      if (response.success) {
        console.log('✅ Chat history fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch chat history:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Check for admin response in real-time
   */
  async pollForMessages(sessionId, lastMessageId = null) {
    try {
      // Reduce logging frequency - only log every 10th poll
      if (!this.pollLogCount) this.pollLogCount = 0;
      this.pollLogCount++;
      
      if (this.pollLogCount % 10 === 1) {
        console.log(`💬 Polling for messages in session: ${sessionId}`);
      }
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      let endpoint = `/api/chat/poll/${sessionId}`;
      if (lastMessageId) {
        endpoint += `?after=${lastMessageId}`;
      }

      const response = await this.makeRequest(endpoint, 'GET', null, true);
      
      if (response.success) {
        // Only log when there are actual messages
        if (response.data.messages && response.data.messages.length > 0) {
          console.log(`✅ Polling found ${response.data.messages.length} new message(s)`);
        }
        return response;
      } else {
        console.error('❌ Failed to poll for messages:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error polling for messages:', error);
      throw error;
    }
  }

  /**
   * Submit chat rating and feedback
   */
  async submitChatRating(sessionId, rating, feedback = '') {
    try {
      console.log(`💬 Submitting chat rating for session: ${sessionId}`);
      
      // Ensure we have a fresh Firebase token for chat authentication
      await this.ensureFreshFirebaseToken();
      
      const ratingData = {
        sessionId,
        rating,
        feedback: feedback.trim(),
        timestamp: new Date().toISOString()
      };

      const response = await this.makeRequest('/api/chat/rating', 'POST', ratingData, true);
      
      if (response.success) {
        console.log('✅ Chat rating submitted successfully');
        return response;
      } else {
        console.error('❌ Failed to submit chat rating:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ Error submitting chat rating:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const yoraaAPI = new YoraaAPIService();

// Default export for backward compatibility
export default yoraaAPI;
