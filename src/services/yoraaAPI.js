// Enhanced API Service for Yoraa App - Backend Integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import authStorageService from './authStorageService';
import environment from '../config/environment';

class YoraaAPIService {
  constructor() {
    // Environment-based API URLs - Use environment config for consistency
    const apiUrl = environment.getApiUrl();
    
    // CRITICAL FIX: Properly handle the base URL - remove /api only if it exists at the end
    // This fixes the localhost vs production URL mismatch
    this.baseURL = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    
    this.userToken = null;
    this.adminToken = null;
    this.guestSessionId = null;
    
    // CRITICAL: Sign-in lock to prevent race conditions
    this.isSigningIn = false;
    this.signInPromise = null;
    
    // CRITICAL: Logout lock to prevent reinitialization during logout
    this.isLoggingOut = false;
    
    // CRITICAL: Initialization lock to prevent duplicate initializations
    this.isInitializing = false;
    this.initializePromise = null;
    
    console.log('🌐 YoraaAPI initialized with baseURL:', this.baseURL);
    console.log('🔧 Raw API URL from environment:', apiUrl);
    console.log('🔧 Environment:', environment.env, '| Is Production:', environment.isProduction);
  }

  async initialize() {
    try {
      // CRITICAL FIX: Prevent duplicate initializations
      if (this.isInitializing) {
        console.log('⏳ Initialization already in progress, waiting...');
        return this.initializePromise;
      }
      
      if (this.userToken && this.guestSessionId) {
        console.log('✅ Already initialized, skipping...');
        return;
      }
      
      this.isInitializing = true;
      
      this.initializePromise = (async () => {
        console.log('🔄 Initializing YoraaAPI service...');
        
        // CRITICAL: Don't load token from storage if we're in the middle of logging out
        if (this.isLoggingOut) {
          console.log('⏳ Logout in progress, skipping token initialization');
          await this.initializeGuestSession();
          return;
        }
        
        // Try new auth storage first
        let token = await authStorageService.getAuthToken();
        
        // Fallback to legacy storage
        if (!token) {
          token = await AsyncStorage.getItem('userToken');
          if (token) {
            console.log('📦 Migrating token from legacy storage...');
            // Migrate to new storage
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              await authStorageService.storeAuthData(token, JSON.parse(userData));
            }
          }
        }
        
        this.userToken = token;
        this.adminToken = await AsyncStorage.getItem('adminToken');
        
        if (this.userToken) {
          console.log('✅ Backend authentication token loaded from storage');
        } else {
          console.log('⚠️ No backend authentication token found in storage');
        }
        
        // Initialize or generate guest session ID
        await this.initializeGuestSession();

        // If no backend token but Firebase user is signed in, try to authenticate with backend
        if (!this.userToken) {
          await this.tryFirebaseBackendAuth();
        }
      })();
      
      await this.initializePromise;
      
    } catch (error) {
      console.error('❌ Error loading tokens:', error);
    } finally {
      this.isInitializing = false;
      this.initializePromise = null;
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
        console.log('🔄 Found Firebase user, attempting backend authentication...');
        const idToken = await currentUser.getIdToken();
        await this.firebaseLogin(idToken);
        console.log('✅ Successfully authenticated existing Firebase user with backend');
        return true;
      } else {
        console.log('ℹ️ No Firebase user found for backend authentication');
        
        // If no Firebase user but we have a backend token, clear it
        // This handles the case where Firebase logout happened but backend wasn't notified
        if (this.userToken) {
          console.log('⚠️ Backend token exists but no Firebase user - syncing state...');
          await this.syncLogoutState();
        }
        
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to authenticate existing Firebase user with backend:', error.message);
      return false;
    }
  }

  /**
   * Sync logout state with backend
   * Called when local state shows logged out but backend might not be aware
   */
  async syncLogoutState() {
    try {
      console.log('🔄 Syncing logout state with backend...');
      const tokenForLogout = this.userToken;
      
      if (tokenForLogout) {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForLogout}`
          };
          
          await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              reason: 'state_sync',
              timestamp: new Date().toISOString()
            })
          });
          
          console.log('✅ Backend logout state synced');
        } catch (error) {
          console.warn('⚠️ Could not sync logout state with backend:', error.message);
        }
      }
      
      // Clear local tokens regardless
      await this.clearAuthTokens();
      console.log('✅ Local auth state cleared');
    } catch (error) {
      console.error('❌ Error syncing logout state:', error);
      // Clear local state anyway
      await this.clearAuthTokens();
    }
  }

  /**
   * Reinitialize API service - useful when app becomes active
   * CRITICAL: Only reinitialize if not already authenticated to prevent race conditions
   */
  async reinitialize() {
    console.log('🔄 Reinitializing YoraaAPI service...');
    console.log(`   - Current userToken in memory: ${this.userToken ? '✅ EXISTS' : '❌ NULL'}`);
    console.log(`   - Sign-in in progress: ${this.isSigningIn ? '⏳ YES' : '✅ NO'}`);
    console.log(`   - Logout in progress: ${this.isLoggingOut ? '⏳ YES' : '✅ NO'}`);
    
    // CRITICAL: Don't reinitialize if logout is in progress
    if (this.isLoggingOut) {
      console.log('⏳ Logout in progress, skipping reinitialization');
      return;
    }
    
    // CRITICAL: If sign-in is in progress, wait for it to complete
    if (this.isSigningIn && this.signInPromise) {
      console.log('⏳ Sign-in in progress, waiting for completion...');
      try {
        await this.signInPromise;
        console.log('✅ Sign-in completed, token should now be available');
      } catch (error) {
        console.error('❌ Sign-in failed during wait:', error.message);
      }
    }
    
    // If already authenticated in memory, skip reinitialization to prevent token loss
    if (this.userToken) {
      console.log('✅ Already authenticated in memory, skipping reinitialization');
      
      // Just verify Firebase auth is still valid
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.warn('⚠️ Firebase user signed out, clearing backend token');
        await this.clearAuthTokens();
      } else {
        console.log('✅ Firebase user still authenticated, maintaining session');
      }
      return;
    }
    
    // Token not in memory - try to load from storage
    console.log('⚠️ Token not in memory, attempting to load from storage...');
    await this.initialize();
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
      const fullUrl = `${this.baseURL}${endpoint}`;
      
      console.log('API Request:', { 
        method, 
        url: fullUrl,
        baseURL: this.baseURL,
        endpoint: endpoint,
        data: body, 
        hasToken: !!headers.Authorization 
      });
      
      const response = await fetch(fullUrl, {
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
      
      // 🚨 AGGRESSIVE LOGGING for auth endpoints
      if (endpoint.includes('/auth/')) {
        console.log('🔍 AUTH ENDPOINT RESPONSE DETAILS:');
        console.log('   - Endpoint:', endpoint);
        console.log('   - Status:', response.status);
        console.log('   - OK:', response.ok);
        console.log('   - data.success:', data.success);
        console.log('   - data.data exists:', !!data.data);
        console.log('   - data.message:', data.message);
        console.log('   - Full data keys:', Object.keys(data));
        if (data.data) {
          console.log('   - data.data keys:', Object.keys(data.data));
          console.log('   - data.data.token exists:', !!data.data.token);
          console.log('   - data.data.user exists:', !!data.data.user);
        }
      }
      
      console.log('API Response:', { 
        status: response.status, 
        url: fullUrl,
        endpoint: endpoint, 
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
              
              const retryResponse = await fetch(fullUrl, {
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
        }
        
        // Handle cart endpoint 404s silently (backend cart sync is optional)
        if (response.status === 404 && endpoint.includes('/api/cart/')) {
          console.warn(`⚠️ Cart endpoint not available: ${endpoint} - using local cart only`);
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
          error.status = 404;
          error.statusCode = 404;
          error.isCartEndpointMissing = true;
          throw error;
        }
        
        // Handle invite-friend endpoint errors silently (backend implementation pending)
        if (endpoint.includes('/api/invite-friend/') || endpoint.includes('/api/user/invite')) {
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.statusCode = response.status;
          error.response = { status: response.status, data };
          error.isInviteEndpointMissing = true;
          throw error;
        }
        
        // Log other errors normally
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


      console.log(`✅ API Success [${method}] ${endpoint}:`, data.success ? 'SUCCESS' : 'RESPONSE_RECEIVED');
      return data;
    } catch (error) {
      // Don't log cart 404 errors or invite endpoint errors - they're handled gracefully
      if (!(error.isCartEndpointMissing && error.status === 404) && !error.isInviteEndpointMissing) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
      }
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
    try {
      console.log('📧 Email/Password login to backend...');
      
      const response = await this.makeRequest('/api/auth/login', 'POST', { email, password });
      
      if (response.success && response.data) {
        console.log('✅ Email/Password login successful');
        
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token) {
          this.userToken = token;
          
          // Store in both old and new storage systems
          await AsyncStorage.setItem('userToken', token);
          
          if (userData) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            // 🔥 CRITICAL: Store in new auth storage service for persistence
            await authStorageService.storeAuthData(token, userData);
          }
          
          console.log('✅ Email/Password token and user data stored successfully');
          
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
      } else if (response.token) {
        // Fallback for old response format
        const token = response.token;
        const userData = response.user;
        
        this.userToken = token;
        await AsyncStorage.setItem('userToken', token);
        
        if (userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          await authStorageService.storeAuthData(token, userData);
        }
        
        try {
          await this.transferAllGuestData();
        } catch (transferError) {
          console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Email/Password login failed');
      }
    } catch (error) {
      console.error('❌ Email/Password login failed:', error);
      throw error;
    }
  }

  async firebaseLogin(idToken) {
    // Check if lock is already set by parent auth flow (e.g., appleAuthService)
    const lockAlreadySet = this.isSigningIn;
    
    // CRITICAL: Set sign-in lock to prevent race conditions (if not already set)
    if (!lockAlreadySet) {
      this.isSigningIn = true;
      console.log('🔒 Sign-in lock activated by firebaseLogin()');
    } else {
      console.log('🔒 Sign-in lock already active (set by parent auth flow)');
    }
    
    // Store the promise so other operations can wait for it
    this.signInPromise = (async () => {
      try {
        console.log('🔄 Authenticating with Yoraa backend...');
        console.log('🔍 Firebase Login Debug Info:');
        console.log('   - Base URL:', this.baseURL);
        console.log('   - Endpoint:', '/api/auth/login/firebase');
        console.log('   - Full URL:', `${this.baseURL}/api/auth/login/firebase`);
        console.log('   - ID Token (first 50 chars):', idToken ? idToken.substring(0, 50) + '...' : 'NULL');
        console.log('   - ID Token length:', idToken ? idToken.length : 0);
        
        const response = await this.makeRequest('/api/auth/login/firebase', 'POST', { idToken });
        
        // 🚨 AGGRESSIVE LOGGING: Log COMPLETE response to catch backend issues
        console.log('🔍 COMPLETE BACKEND RESPONSE:');
        console.log('   - response.success:', response.success);
        console.log('   - response.data exists:', !!response.data);
        console.log('   - response.data:', JSON.stringify(response.data, null, 2));
        console.log('   - response.message:', response.message);
        console.log('   - Full response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          console.log('✅ Backend authentication successful');
          
          // Extract backend user status
          const token = response.data.token;
          const userData = response.data.user;
          const isNewUser = response.data.isNewUser || false;
          const message = response.data.message || response.message;
          
          console.log(`📊 Backend Response: ${message || 'Login successful'}`);
          console.log(`   - User Status: ${isNewUser ? '✨ NEW USER CREATED' : '👋 EXISTING USER'}`);
          console.log(`   - User ID: ${userData?._id || userData?.id || 'Unknown'}`);
          console.log(`   - Name: ${userData?.name || 'Not set'}`);
          console.log(`   - Email: ${userData?.email || 'Not set'}`);
          console.log('ℹ️ Backend automatically links accounts with same email across different providers');
          
          // 🚨 CRITICAL CHECK: Verify token exists
          console.log('🔍 TOKEN CHECK:');
          console.log('   - Token exists:', !!token);
          console.log('   - Token type:', typeof token);
          console.log('   - Token length:', token ? token.length : 0);
          console.log('   - Token preview:', token ? token.substring(0, 20) + '...' : 'NULL');
          
          if (token) {
            // CRITICAL FIX: Set token in memory IMMEDIATELY (synchronously)
            // This prevents race conditions with reinitialize() calls
            this.userToken = token;
            console.log('✅ Token set in memory immediately');
            
            // Store in both old and new storage systems (async, but don't block)
            // Using Promise.all to parallelize storage operations
            const storagePromise = Promise.all([
              AsyncStorage.setItem('userToken', token).catch(err => 
                console.error('❌ Failed to store userToken:', err)
              ),
              userData ? AsyncStorage.setItem('userData', JSON.stringify(userData)).catch(err =>
                console.error('❌ Failed to store userData:', err)
              ) : Promise.resolve(),
              userData ? authStorageService.storeAuthData(token, userData).catch(err =>
                console.error('❌ Failed to store auth data:', err)
              ) : Promise.resolve()
            ]);
            
            // Wait for all storage operations to complete
            await storagePromise;
            console.log('✅ Token and user data stored successfully in all locations');
            
            // 🚨 VERIFY STORAGE: Confirm token was actually stored
            const verifyToken = await AsyncStorage.getItem('userToken');
            console.log('🔍 STORAGE VERIFICATION:');
            console.log('   - Token in AsyncStorage:', !!verifyToken);
            console.log('   - Token in memory (this.userToken):', !!this.userToken);
            console.log('   - Tokens match:', verifyToken === this.userToken);
            
            if (!verifyToken || verifyToken !== this.userToken) {
              console.error('🚨 CRITICAL: Token storage verification FAILED!');
              console.error('   - Expected:', token.substring(0, 20) + '...');
              console.error('   - In storage:', verifyToken ? verifyToken.substring(0, 20) + '...' : 'NULL');
            }
            
            // Transfer guest data after successful authentication (non-blocking)
            this.transferAllGuestData().catch(transferError => {
              console.warn('⚠️ Guest data transfer failed (non-critical):', transferError);
            });
            
            // Only log release if we set the lock (parent flow will release if they set it)
            if (!lockAlreadySet) {
              console.log('🔓 Sign-in lock will be released by firebaseLogin()');
            } else {
              console.log('ℹ️ Sign-in lock will be released by parent auth flow');
            }
            
            return response.data;
          } else {
            console.error('🚨 CRITICAL ERROR: No token in backend response!');
            console.error('   - response.data.token is:', token);
            console.error('   - response.data keys:', Object.keys(response.data || {}));
            throw new Error('No token received from backend');
          }
        } else {
          console.error('🚨 CRITICAL ERROR: Backend response invalid!');
          console.error('   - response.success:', response.success);
          console.error('   - response.data:', response.data);
          console.error('   - response.message:', response.message);
          console.error('   - Full response structure:', JSON.stringify(response, null, 2));
          throw new Error(response.message || 'Backend authentication failed');
        }
      } catch (error) {
        console.error('❌ Backend authentication failed:', error);
        console.error('   - Error message:', error.message);
        console.error('   - Error type:', error.constructor.name);
        console.error('   - Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        if (!lockAlreadySet) {
          console.log('🔓 Sign-in lock released by firebaseLogin() (error)');
        }
        throw error;
      } finally {
        // CRITICAL: Only release the lock if we set it
        // If parent auth flow set it, let them release it
        if (!lockAlreadySet) {
          this.isSigningIn = false;
          this.signInPromise = null;
        }
      }
    })();
    
    return this.signInPromise;
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
          // 🔥 CRITICAL: Update auth storage service too
          const token = await authStorageService.getAuthToken();
          if (token) {
            await authStorageService.storeAuthData(token, response.data.user);
          }
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
          
          // Store in both old and new storage systems
          await AsyncStorage.setItem('userToken', token);
          
          if (userData) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            // CRITICAL: Store in new auth storage service for persistence
            await authStorageService.storeAuthData(token, userData);
          }
          
          console.log('✅ Apple token and user data stored successfully');
          
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
    try {
      console.log('📝 Signing up new user...');
      
      const response = await this.makeRequest('/api/auth/signup', 'POST', userData);
      
      if (response.success && response.data) {
        console.log('✅ Signup successful');
        
        const token = response.data.token;
        const user = response.data.user;
        
        if (token) {
          this.userToken = token;
          
          // Store in both old and new storage systems
          await AsyncStorage.setItem('userToken', token);
          
          if (user) {
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            // 🔥 CRITICAL: Store in new auth storage service for persistence
            await authStorageService.storeAuthData(token, user);
          }
          
          console.log('✅ Signup token and user data stored successfully');
          
          return response.data;
        } else {
          throw new Error('No token received from backend');
        }
      } else if (response.token) {
        // Fallback for old response format
        const token = response.token;
        const user = response.user;
        
        this.userToken = token;
        await AsyncStorage.setItem('userToken', token);
        
        if (user) {
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          await authStorageService.storeAuthData(token, user);
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('🔐 Starting logout process...');
      
      // Store token before clearing it (for backend logout call)
      const tokenForLogout = this.userToken;
      
      // Clear local state first
      this.userToken = null;
      this.adminToken = null;
      this.guestSessionId = null;
      
      // Clear all auth-related storage
      const keysToRemove = [
        // Auth tokens
        'userToken',
        'adminToken',
        'userData',
        'refreshToken',
        'auth_token',
        'isAuthenticated',
        
        // Session data
        'guestSessionId',
        'userEmail',
        'userPhone',
        
        // 🆕 CRITICAL FIX: User-specific data (addresses, orders, etc.)
        'userAddresses',        // 🚨 Address data (main key)
        'addresses',            // 🚨 Alternative address key
        'savedAddresses',       // 🚨 Saved addresses
        'deliveryAddress',      // 🚨 Selected delivery address
        'billingAddress',       // 🚨 Selected billing address
        'selectedAddress',      // 🚨 Currently selected address
        'addressData',          // 🚨 Any address data
        
        // Order data
        'orderHistory',         // Past orders
        'orders',               // Order list
        'currentOrder',         // Current order
        
        // Shopping data
        'cartItems',            // Shopping cart
        'wishlistItems',        // Wishlist/favorites
        'recentlyViewed',       // Browsing history
        'viewedProducts',       // Product views
        
        // Search & browsing
        'recentSearches',       // Search history
        'searchHistory',        // Alternative search key
        
        // Notifications
        'notifications',        // Notification data
        'notificationSettings', // Notification preferences
        
        // Reviews & ratings
        'productReviews',       // User reviews
        'ratings',              // User ratings
        
        // User preferences
        'userPreferences'       // User-level preferences
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Local storage cleared (${keysToRemove.length} keys removed)`);
      
      // CRITICAL: Clear new auth storage service
      await authStorageService.clearAuthData();
      console.log('✅ Auth storage service cleared');
      
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
      this.adminToken = null;
      this.guestSessionId = null;
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await authStorageService.clearAuthData();
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear authentication tokens (for sign-out scenarios)
   * This is a lightweight version of logout that just clears tokens
   */
  async clearAuthTokens() {
    console.log('🔐 Clearing authentication tokens...');
    
    this.userToken = null;
    this.adminToken = null;
    
    await AsyncStorage.multiRemove(['userToken', 'adminToken', 'userData']);
    await authStorageService.clearAuthData();
    
    console.log('✅ Authentication tokens cleared');
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
      // If cart endpoint doesn't exist (404) or cart is empty, return empty cart
      if (error.status === 404 || error.statusCode === 404) {
        console.warn('⚠️ Cart endpoint not available, using local cart only');
        return { items: [] };
      }
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
      // If cart endpoint doesn't exist (404), return success with localOnly flag
      if (error.status === 404 || error.statusCode === 404) {
        console.warn('⚠️ Cart endpoint not available, item added to local cart only');
        return { success: true, localOnly: true };
      }
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, sizeId, quantity) {
    try {
      return await this.makeRequest('/api/cart/update', 'PUT', {
        itemId,
        sizeId,
        quantity
      }, true);
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail - cart is stored locally
      if (error.status === 404 || error.statusCode === 404) {
        console.warn('⚠️ Cart sync endpoint not available, using local cart only');
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }

  async removeFromCart(itemId, sizeId) {
    try {
      return await this.makeRequest('/api/cart/remove', 'DELETE', {
        itemId,
        sizeId
      }, true);
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail - cart is stored locally
      if (error.status === 404 || error.statusCode === 404) {
        console.warn('⚠️ Cart sync endpoint not available, using local cart only');
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }

  async clearCart() {
    try {
      return await this.makeRequest('/api/cart/clear', 'DELETE', null, true);
    } catch (error) {
      // If endpoint doesn't exist (404), silently fail - cart is stored locally
      if (error.status === 404 || error.statusCode === 404) {
        console.warn('⚠️ Cart sync endpoint not available, using local cart only');
        return { success: true, localOnly: true };
      }
      throw error;
    }
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

  async cancelOrder(orderId, reason = 'Customer requested cancellation') {
    try {
      console.log('🚫 Cancelling order:', orderId);
      return await this.makeRequest(`/api/orders/${orderId}/cancel`, 'PUT', { reason }, true);
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }

  async returnOrder(orderId, reason, images = []) {
    try {
      console.log('📦 Creating return request for order:', orderId);
      
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('reason', reason);

      // Append images
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `return_image_${index}.jpg`,
        });
      });

      return await this.makeRequest('/api/orders/return', 'POST', formData, true, false, {
        'Content-Type': 'multipart/form-data',
      });
    } catch (error) {
      console.error('❌ Error creating return request:', error);
      throw error;
    }
  }

  async exchangeOrder(orderId, reason, desiredSize) {
    try {
      console.log('🔄 Creating exchange request for order:', orderId);
      
      const exchangeData = {
        orderId,
        reason,
        desiredSize,
      };

      return await this.makeRequest('/api/orders/exchange', 'POST', exchangeData, true);
    } catch (error) {
      console.error('❌ Error creating exchange request:', error);
      throw error;
    }
  }

  async getReturnOrders() {
    try {
      console.log('📦 Fetching return orders');
      return await this.makeRequest('/api/orders/return-orders', 'GET', null, true);
    } catch (error) {
      console.error('❌ Error fetching return orders:', error);
      throw error;
    }
  }

  // User Profile
  async getUserProfile() {
    try {
      // Use the correct endpoint that's implemented on the backend
      return await this.makeRequest('/api/profile', 'GET', null, true, false, { silent404: true });
    } catch (error) {
      // Silently return fallback data when backend endpoint is not implemented
      // This is expected behavior since the endpoint doesn't exist yet
      console.log('ℹ️ Using fallback profile data - backend endpoint not yet implemented');
      
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
    try {
      console.log('💾 Updating user profile:', profileData);
      
      // Ensure we have backend authentication
      // Check if we have a backend JWT token
      if (!this.userToken) {
        console.log('⚠️ No backend token found, attempting to authenticate with Firebase...');
        
        // Try to get Firebase user and authenticate with backend
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Get Firebase ID token and exchange it for backend JWT
        const idToken = await currentUser.getIdToken();
        await this.firebaseLogin(idToken);
        
        console.log('✅ Backend authentication successful');
      }
      
      // Verify we now have a token
      if (!this.userToken) {
        throw new Error('Failed to authenticate. Please log in again.');
      }
      
      // Make the PUT request to the correct backend endpoint
      const response = await this.makeRequest('/api/profile', 'PUT', profileData, true);
      
      if (response && response.success) {
        console.log('✅ Profile updated successfully on backend');
        
        // Store updated user data locally
        if (response.data) {
          await authStorageService.updateUserData(response.data);
          console.log('✅ Updated user data stored locally');
        }
        
        return response;
      } else {
        throw new Error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
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
      
      // Check authentication first
      if (!this.isAuthenticated()) {
        console.log('⚠️ User not authenticated, cannot fetch promo codes');
        return {
          success: true,
          data: [],
          message: 'Authentication required for promo codes'
        };
      }
      
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
        
        // Filter out invite-friend codes - only return regular promo codes
        let promoCodes = Array.isArray(response.data) ? response.data : [];
        
        // Mark all codes as regular promo codes and filter by type
        promoCodes = promoCodes
          .map(code => ({
            ...code,
            codeType: code.codeType || 'promo' // Mark as regular promo if not specified
          }))
          .filter(code => {
            // Exclude invite-friend codes
            const isInviteCode = code.codeType === 'invite' || 
                                code.type === 'invite' || 
                                code.isInviteCode === true;
            
            if (isInviteCode) {
              console.log(`🚫 Filtering out invite code from promo list: ${code.code}`);
            }
            
            return !isInviteCode;
          });
        
        console.log(`✅ Filtered ${promoCodes.length} regular promo codes (excluded invite codes)`);
        
        return {
          success: true,
          data: promoCodes,
          message: 'Promo codes retrieved successfully'
        };
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
              minOrderValue: 50,
              codeType: 'promo' // Mark as regular promo code
            },
            {
              id: 'mock_2', 
              code: 'SAVE20',
              title: '20% OFF',
              description: 'Save big on your order',
              discountType: 'percentage',
              discountValue: 20,
              validUntil: '2024-12-31',
              minOrderValue: 100,
              codeType: 'promo' // Mark as regular promo code
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

  // Invite Friend / Referral Code Methods
  async getInviteFriendCodes() {
    try {
      console.log('🎁 Fetching invite friend codes from backend');
      
      // Check authentication first
      if (!this.isAuthenticated()) {
        console.log('⚠️ User not authenticated, cannot fetch invite codes');
        return {
          success: false,
          data: [],
          message: 'Authentication required for invite codes'
        };
      }
      
      try {
        // Try user-accessible endpoints only (no admin endpoints)
        // The backend needs to implement one of these endpoints for invite codes to work
        const endpoints = [
          { url: '/api/invite-friend/user', params: null },                       // User-specific invite codes
          { url: '/api/invite-friend/available', params: null },                  // Available invite codes
          { url: '/api/user/invite-codes', params: null },                        // User invite codes alternative
        ];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 Trying endpoint: ${endpoint.url}`);
            
            // Build URL with params
            let url = endpoint.url;
            if (endpoint.params) {
              const queryString = Object.keys(endpoint.params)
                .map(key => `${key}=${endpoint.params[key]}`)
                .join('&');
              url = `${url}?${queryString}`;
            }
            
            const response = await this.makeRequest(url, 'GET', null, true);
            
            console.log(`📦 Response from ${endpoint.url}:`, JSON.stringify(response, null, 2));
            
            if (response && response.success) {
              // Backend returns: { success: true, data: { inviteCodes: [...] } }
              let codes = response.data?.inviteCodes || response.data || response.inviteCodes || [];
              
              console.log(`🔍 Extracted codes:`, Array.isArray(codes) ? `Array(${codes.length})` : typeof codes);
              
              // Handle different response formats
              if (!Array.isArray(codes)) {
                codes = [codes];
              }
              
              // Filter and format codes
              const validCodes = codes
                .filter(code => {
                  if (!code || !code.code) {
                    console.log('⚠️ Skipping invalid code:', code);
                    return false;
                  }
                  // Accept codes with status 'active' or no status field
                  if (code.status && code.status !== 'active') {
                    console.log(`⚠️ Skipping non-active code: ${code.code} (status: ${code.status})`);
                    return false;
                  }
                  return true;
                })
                .map(code => ({
                  id: code._id || code.id || code.code,
                  code: code.code,
                  description: code.description || `Get ${code.discountType === 'flat' ? '₹' : ''}${code.discountValue}${code.discountType === 'percentage' ? '%' : ''} off`,
                  discountType: code.discountType || 'flat',
                  discountValue: code.discountValue || 10,
                  maxRedemptions: code.maxRedemptions || 100,
                  redemptionCount: code.redemptionCount || 0,
                  status: code.status || 'active',
                  expiryDate: code.expiryDate || code.endDate,
                  minOrderValue: code.minOrderValue || 0,
                  terms: code.terms || 'Share with friends and family',
                  isVisible: code.isVisible !== false,
                  // Mark this as invite-friend type code
                  codeType: 'invite'
                }));
              
              if (validCodes.length > 0) {
                console.log(`✅ Found ${validCodes.length} active invite codes from ${endpoint.url}:`);
                validCodes.forEach(code => {
                  console.log(`   - ${code.code} (${code.discountValue}${code.discountType === 'percentage' ? '%' : '₹'} off)`);
                });
                
                return {
                  success: true,
                  data: validCodes,
                  message: 'Invite codes fetched successfully'
                };
              } else {
                console.log(`⚠️ Response successful but no valid codes found from ${endpoint.url}`);
              }
            } else {
              console.log(`❌ Response not successful from ${endpoint.url}:`, response);
            }
          } catch (error) {
            // Log minimal error info to reduce console noise
            const statusCode = error.response?.status || error.status;
            console.log(`⚠️ ${endpoint.url}: ${statusCode || 'Network error'}`);
            continue; // Try next endpoint
          }
        }
        
        // If all endpoints fail, return empty with helpful message
        console.log('ℹ️ Backend invite endpoints not yet implemented. Ask backend team to add user-accessible invite endpoint.');
        return {
          success: true,
          data: [],
          message: 'Invite codes feature coming soon'
        };
        
      } catch (error) {
        console.error('❌ Error fetching invite codes:', error);
        return {
          success: true,
          data: [],
          message: 'Unable to load invite codes'
        };
      }
    } catch (error) {
      console.error('❌ Error in getInviteFriendCodes:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch invite codes'
      };
    }
  }

  async validateInviteCode(code) {
    try {
      console.log('🔍 Validating invite code:', code);
      
      const response = await this.makeRequest(`/api/invite-friend/validate/${code}`, 'GET', null, false);
      
      if (response && response.success && response.valid) {
        console.log('✅ Invite code is valid:', response.data);
        return response;
      }
      
      console.log('❌ Invite code is invalid');
      return {
        success: false,
        valid: false,
        message: 'Invalid invite code'
      };
    } catch (error) {
      console.error('❌ Error validating invite code:', error);
      return {
        success: false,
        valid: false,
        message: error.message || 'Failed to validate code'
      };
    }
  }

  async redeemInviteCode(code) {
    try {
      console.log('🎉 Redeeming invite code:', code);
      
      if (!this.isAuthenticated()) {
        throw new Error('Authentication required to redeem code');
      }
      
      const response = await this.makeRequest('/api/invite-friend/redeem', 'POST', { code }, true);
      
      if (response && response.success) {
        console.log('✅ Invite code redeemed successfully');
        return response;
      }
      
      throw new Error(response?.message || 'Failed to redeem code');
    } catch (error) {
      console.error('❌ Error redeeming invite code:', error);
      throw error;
    }
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
    const token = this.userToken;
    console.log(`🔍 getUserToken() called - Token ${token ? 'EXISTS ✅' : 'NULL ❌'}`);
    if (token) {
      console.log(`   - Token preview: ${token.substring(0, 30)}...`);
    }
    return token;
  }

  // Set sign-in lock (called by auth services to prevent race conditions)
  setSignInLock(isLocked) {
    this.isSigningIn = isLocked;
    console.log(`🔒 Sign-in lock ${isLocked ? 'ACTIVATED' : 'RELEASED'}`);
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
      console.log('🔐 Starting complete logout process...');
      
      // CRITICAL: Set logout flag FIRST to prevent any reinitializations
      this.isLoggingOut = true;
      this.isInitializing = false; // Cancel any pending initialization
      this.initializePromise = null;
      console.log('🔒 Logout lock activated');
      
      // Store token before clearing it (for backend logout call)
      const tokenForLogout = this.userToken;
      const currentUser = auth().currentUser;
      
      // CRITICAL: Clear tokens from memory IMMEDIATELY (synchronously)
      // This prevents race conditions where other components try to reinitialize
      // and load the token from storage before we clear it
      this.userToken = null;
      this.adminToken = null;
      console.log('✅ Tokens cleared from memory immediately (prevents race conditions)');
      
      // STEP 1: Notify backend FIRST (using saved token)
      // This ensures the backend is aware of the logout state
      if (tokenForLogout) {
        try {
          console.log('📤 Notifying backend of logout state...');
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForLogout}`
          };
          
          const response = await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userId: currentUser?.uid,
              timestamp: new Date().toISOString(),
              reason: 'user_initiated_logout'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend notified of logout:', data);
          } else {
            const errorText = await response.text();
            console.warn('⚠️ Backend logout returned non-200 status:', response.status, errorText);
          }
        } catch (apiError) {
          console.warn('⚠️ Backend logout notification failed:', apiError.message);
          // Don't throw - local logout is more important
        }
      } else {
        console.log('ℹ️ No token available - skipping backend logout notification');
      }
      
      // STEP 2: Clear guest session from memory (DON'T generate new one yet)
      const oldGuestSessionId = this.guestSessionId;
      this.guestSessionId = null;
      
      // STEP 3: Clear all auth-related storage keys
      const keysToRemove = [
        'userToken',
        'adminToken',
        'userData',
        'refreshToken',
        'auth_token',
        'guestSessionId',
        'userEmail',
        'userPhone',
        'isAuthenticated'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ All auth storage cleared');
      
      // STEP 4: Clear auth storage service
      await authStorageService.clearAuthData();
      console.log('✅ Auth storage service cleared');
      
      // STEP 5: Generate new guest session for post-logout state
      // CRITICAL FIX: Wait 100ms to ensure all components have processed the logout
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.initializeGuestSession();
      console.log('✅ New guest session initialized for logged-out state');
      
      // CRITICAL: Release logout lock
      this.isLoggingOut = false;
      console.log('🔓 Logout lock released');
      
      console.log('✅ Complete logout process finished - backend notified, local state cleared');
      console.log('📊 Old guest session:', oldGuestSessionId, '→ New:', this.guestSessionId);
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Ensure local state is cleared even if there's an error
      this.userToken = null;
      this.adminToken = null;
      this.guestSessionId = null;
      await AsyncStorage.multiRemove(['userToken', 'userData', 'adminToken', 'guestSessionId']);
      await authStorageService.clearAuthData();
      
      // CRITICAL: Release logout lock even on error
      this.isLoggingOut = false;
      console.log('🔓 Logout lock released (after error)');
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

  // Rewards & Banner Methods
  async getRewardsBanner() {
    try {
      console.log('🎯 Fetching rewards banner data from /api/manage-banners-rewards');
      const response = await this.makeRequest('/api/manage-banners-rewards', 'GET', null, false);
      
      if (response.success || response.data) {
        console.log('✅ Rewards banner fetched successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch rewards banner');
      }
    } catch (error) {
      console.error('❌ Rewards Banner API Error:', error.message);
      console.error('📋 Backend team: Please implement GET /api/manage-banners-rewards endpoint');
      throw error;
    }
  }

  async getUserLoyaltyStatus() {
    try {
      console.log('🎯 Fetching user loyalty status from /api/loyalty/user/status');
      const response = await this.makeRequest('/api/loyalty/user/status', 'GET', null, true);
      
      if (response.success) {
        console.log('✅ User loyalty status fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch loyalty status');
      }
    } catch (error) {
      console.error('❌ User Loyalty Status API Error:', error.message);
      console.error('📋 Backend team: Please implement GET /api/loyalty/user/status endpoint');
      throw error;
    }
  }

  async getLoyaltyTiers() {
    try {
      console.log('🎯 Fetching loyalty tiers from /api/loyalty/tiers');
      const response = await this.makeRequest('/api/loyalty/tiers', 'GET', null, false);
      
      if (response.success) {
        console.log('✅ Loyalty tiers fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch loyalty tiers');
      }
    } catch (error) {
      console.error('❌ Loyalty Tiers API Error:', error.message);
      console.error('📋 Backend team: Please implement GET /api/loyalty/tiers endpoint');
      throw error;
    }
  }
}

// Export singleton instance
export const yoraaAPI = new YoraaAPIService();

// Default export for backward compatibility
export default yoraaAPI;
