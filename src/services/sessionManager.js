// Session Management Service - Handles persistent user authentication
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';
import yoraaAPI from './yoraaAPI';

class SessionManager {
  constructor() {
    this.sessionCheckListeners = [];
    this.isInitialized = false;
    this.currentSessionState = {
      isAuthenticated: false,
      userId: null,
      email: null,
      phone: null,
      loginMethod: null,
      sessionStartTime: null,
      lastActivityTime: null
    };
  }

  /**
   * Initialize session manager - should be called when app starts
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Session Manager...');
      
      // Check if user has valid session data
      const sessionData = await this.getStoredSessionData();
      
      if (sessionData.isAuthenticated) {
        console.log('📱 Found existing session, validating...');
        
        // Validate the session
        const isValid = await this.validateStoredSession(sessionData);
        
        if (isValid) {
          this.currentSessionState = sessionData;
          await this.updateLastActivity();
          console.log('✅ Session restored successfully');
          
          // Ensure backend is also authenticated
          await this.ensureBackendAuthentication();
        } else {
          console.log('❌ Stored session invalid, clearing...');
          await this.clearSession();
        }
      }
      
      this.isInitialized = true;
      this.notifySessionListeners();
      
    } catch (error) {
      console.error('❌ Session initialization failed:', error);
      await this.clearSession();
      this.isInitialized = true;
    }
  }

  /**
   * Create new session after successful login
   */
  async createSession(userInfo, loginMethod) {
    try {
      const sessionData = {
        isAuthenticated: true,
        userId: userInfo.uid || userInfo.id,
        email: userInfo.email,
        phone: userInfo.phoneNumber || userInfo.phone,
        loginMethod: loginMethod, // 'email', 'phone', 'google', 'apple'
        sessionStartTime: Date.now(),
        lastActivityTime: Date.now(),
        userData: userInfo
      };

      // Store session data
      await AsyncStorage.setItem('sessionData', JSON.stringify(sessionData));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      this.currentSessionState = sessionData;
      
      console.log(`✅ Session created for user: ${userInfo.email || userInfo.phone} via ${loginMethod}`);
      
      this.notifySessionListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      return false;
    }
  }

  /**
   * Update last activity time to keep session alive
   */
  async updateLastActivity() {
    try {
      if (this.currentSessionState.isAuthenticated) {
        this.currentSessionState.lastActivityTime = Date.now();
        await AsyncStorage.setItem('sessionData', JSON.stringify(this.currentSessionState));
      }
    } catch (error) {
      console.warn('⚠️ Failed to update last activity:', error);
    }
  }

  /**
   * Check if current session is valid
   * Enhanced for TestFlight - ensures backend auth is synchronized
   */
  async isSessionValid() {
    try {
      console.log('🔍 Validating session...');
      
      if (!this.currentSessionState.isAuthenticated) {
        console.log('❌ Session state shows not authenticated');
        return false;
      }

      // Check if tokens exist (sessionId is optional - only for chat)
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('❌ No user token found in storage');
        // Don't clear session yet - might be in memory
      }

      // Check Firebase auth state
      const authInstance = getAuth();
      const firebaseUser = authInstance.currentUser;
      if (!firebaseUser) {
        console.log('⚠️ Session exists but Firebase user is null - clearing invalid session');
        await this.clearSession();
        return false;
      }

      // CRITICAL FOR TESTFLIGHT: Check if backend is authenticated
      const backendAuth = yoraaAPI.isAuthenticated();
      console.log('🔍 Backend authentication status:', backendAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
      
      if (!backendAuth) {
        console.log('⚠️ Backend not authenticated, attempting to re-sync...');
        // Try to re-authenticate with backend
        try {
          const idToken = await firebaseUser.getIdToken(true);
          await yoraaAPI.firebaseLogin(idToken);
          
          const isNowAuthenticated = yoraaAPI.isAuthenticated();
          if (!isNowAuthenticated) {
            console.log('❌ Failed to re-authenticate backend after token refresh - clearing invalid session');
            // CRITICAL FIX: Clear session when backend auth definitively fails
            await this.clearSession();
            return false;
          }
          console.log('✅ Backend re-authenticated successfully during session validation');
          return true;
        } catch (error) {
          // Handle "no-current-user" errors gracefully
          if (error.message?.includes('no-current-user') || 
              error.message?.includes('User signed out') ||
              error.message?.includes('No user currently signed in')) {
            console.warn('⚠️ User signed out during session validation - clearing session');
            await this.clearSession();
            return false;
          }
          console.error('❌ Failed to re-authenticate backend:', error.message);
          // CRITICAL FIX: Clear session on persistent backend auth failure
          console.log('🧹 Clearing session due to backend auth failure');
          await this.clearSession();
          return false;
        }
      }

      console.log('✅ Session validation successful');
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      // Don't clear session on validation errors - might be temporary
      return false;
    }
  }

  /**
   * Get current session state
   */
  getSessionState() {
    return { ...this.currentSessionState };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentSessionState.isAuthenticated;
  }

  /**
   * Get stored session data from AsyncStorage
   */
  async getStoredSessionData() {
    try {
      const sessionDataStr = await AsyncStorage.getItem('sessionData');
      const isAuthenticatedStr = await AsyncStorage.getItem('isAuthenticated');
      
      if (sessionDataStr && isAuthenticatedStr === 'true') {
        return JSON.parse(sessionDataStr);
      }
      
      return { isAuthenticated: false };
    } catch (error) {
      console.error('❌ Failed to get stored session:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Validate stored session data
   */
  async validateStoredSession(sessionData) {
    try {
      // Check if session data is complete
      if (!sessionData.userId || (!sessionData.email && !sessionData.phone)) {
        console.log('❌ Incomplete session data - clearing all auth data');
        // CRITICAL: Clear all auth tokens when session is invalid
        await this.clearAllAuthData();
        return false;
      }

      // Check if tokens exist
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('❌ No stored token found - clearing session');
        // CRITICAL: Clear session when no token exists
        await this.clearAllAuthData();
        return false;
      }

      // Session is potentially valid
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      // CRITICAL: Clear all auth on validation error
      await this.clearAllAuthData();
      return false;
    }
  }

  /**
   * Clear ALL authentication data including tokens
   * Called when session validation fails to prevent auto-login with stale data
   */
  async clearAllAuthData() {
    try {
      console.log('🧹 Clearing ALL authentication data (session + tokens)...');
      
      // Import authStorageService dynamically to avoid circular dependency
      const { default: authStorageService } = await import('./authStorageService');
      
      // Clear auth tokens
      await authStorageService.clearAuthData();
      
      // Clear legacy tokens
      await AsyncStorage.multiRemove([
        'userToken',
        'firebaseToken',
        'backendAuthToken',
        'guestSessionId'
      ]);
      
      // Clear session data
      await AsyncStorage.removeItem('sessionData');
      await AsyncStorage.setItem('isAuthenticated', 'false');
      
      console.log('✅ All auth data cleared - app will start in logged-out state');
    } catch (error) {
      console.error('❌ Failed to clear all auth data:', error);
    }
  }

  /**
   * Ensure backend is authenticated when Firebase user exists
   */
  async ensureBackendAuthentication() {
    try {
      const authInstance = getAuth();
      const firebaseUser = authInstance.currentUser;
      
      if (!firebaseUser) {
        console.warn('⚠️ Cannot re-authenticate backend: No Firebase user');
        throw new Error('No Firebase user available');
      }
      
      if (!yoraaAPI.isAuthenticated()) {
        console.log('🔄 Re-authenticating backend...');
        
        // Double-check user is still signed in before getting token
        const currentUser = authInstance.currentUser;
        if (!currentUser) {
          console.warn('⚠️ Firebase user signed out during backend auth attempt');
          throw new Error('User signed out during authentication');
        }
        
        try {
          const idToken = await currentUser.getIdToken(false);
          await yoraaAPI.firebaseLogin(idToken);
          console.log('✅ Backend re-authenticated');
        } catch (tokenError) {
          // Handle the specific "no current user" error gracefully
          if (tokenError.code === 'auth/no-current-user' || 
              tokenError.message?.includes('no-current-user') ||
              tokenError.message?.includes('No user currently signed in')) {
            console.warn('⚠️ User signed out while getting ID token, skipping backend auth');
            throw new Error('User signed out during authentication');
          }
          throw tokenError;
        }
      }
    } catch (error) {
      console.error('❌ Backend re-authentication failed:', error);
      throw error;
    }
  }

  /**
   * Clear session completely
   */
  async clearSession() {
    try {
      // Clear session state
      this.currentSessionState = {
        isAuthenticated: false,
        userId: null,
        email: null,
        phone: null,
        loginMethod: null,
        sessionStartTime: null,
        lastActivityTime: null
      };

      // Clear stored session data
      await AsyncStorage.removeItem('sessionData');
      await AsyncStorage.setItem('isAuthenticated', 'false');
      
      // IMPORTANT: Also clear auth tokens to prevent auto-login
      await AsyncStorage.multiRemove([
        'userToken',
        'firebaseToken',
        'backendAuthToken'
      ]);
      
      console.log('✅ Session cleared (including auth tokens)');
      
      this.notifySessionListeners();
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  }

  /**
   * Complete logout - clears everything
   */
  async logout() {
    try {
      console.log('🔐 Starting session logout...');
      
      // Clear session
      await this.clearSession();
      
      // The actual Firebase/backend logout is handled by the logout modal
      // This just manages the session state
      
      console.log('✅ Session logout complete');
      
    } catch (error) {
      console.error('❌ Session logout error:', error);
    }
  }

  /**
   * Add listener for session state changes
   */
  addSessionListener(listener) {
    this.sessionCheckListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      const index = this.sessionCheckListeners.indexOf(listener);
      if (index > -1) {
        this.sessionCheckListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all session listeners
   */
  notifySessionListeners() {
    this.sessionCheckListeners.forEach(listener => {
      try {
        listener(this.currentSessionState);
      } catch (error) {
        console.error('❌ Session listener error:', error);
      }
    });
  }

  /**
   * Auto-session refresh - call this periodically or on app focus
   */
  async refreshSession() {
    try {
      if (this.currentSessionState.isAuthenticated) {
        const isValid = await this.isSessionValid();
        
        if (isValid) {
          await this.updateLastActivity();
          console.log('✅ Session refreshed');
        } else {
          console.log('❌ Session invalid during refresh, clearing...');
          await this.clearSession();
        }
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
    }
  }

  /**
   * Get session duration in minutes
   */
  getSessionDuration() {
    if (!this.currentSessionState.sessionStartTime) {
      return 0;
    }
    
    return Math.floor((Date.now() - this.currentSessionState.sessionStartTime) / (1000 * 60));
  }

  /**
   * Get time since last activity in minutes
   */
  getTimeSinceLastActivity() {
    if (!this.currentSessionState.lastActivityTime) {
      return 0;
    }
    
    return Math.floor((Date.now() - this.currentSessionState.lastActivityTime) / (1000 * 60));
  }

  /**
   * Debug method to log current session status
   */
  async debugSessionStatus() {
    console.log('🔍 Session Debug Status:');
    console.log('  - Is Initialized:', this.isInitialized);
    console.log('  - Is Authenticated:', this.currentSessionState.isAuthenticated);
    console.log('  - User ID:', this.currentSessionState.userId);
    console.log('  - Email:', this.currentSessionState.email);
    console.log('  - Phone:', this.currentSessionState.phone);
    console.log('  - Login Method:', this.currentSessionState.loginMethod);
    console.log('  - Session Duration (min):', this.getSessionDuration());
    console.log('  - Last Activity (min ago):', this.getTimeSinceLastActivity());
    
    const isValid = await this.isSessionValid();
    console.log('  - Session Valid:', isValid);
    
    const storedData = await this.getStoredSessionData();
    console.log('  - Stored Session:', storedData.isAuthenticated);
  }
}

// Export singleton instance
export default new SessionManager();
