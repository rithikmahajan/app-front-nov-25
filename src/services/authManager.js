// Auth Manager - Handles Firebase and Backend Auth Synchronization with Session Management
import auth from '@react-native-firebase/auth';
import yoraaAPI from './yoraaAPI';
import sessionManager from './sessionManager';

class AuthManager {
  constructor() {
    this.authStateListeners = [];
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Auth Manager...');
      
      // Initialize session manager first
      await sessionManager.initialize();
      
      // Listen to Firebase auth state changes
      auth().onAuthStateChanged(async (firebaseUser) => {
        console.log('🔥 Firebase Auth state changed:', firebaseUser ? `User: ${firebaseUser.email || firebaseUser.uid}` : 'User signed out');
        
        if (firebaseUser) {
          // User is signed in with Firebase
          try {
            // Add delay to ensure Firebase user is fully initialized
            // This prevents race conditions when getting ID tokens
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Double-check user is still signed in after delay
            const revalidatedUser = auth().currentUser;
            if (!revalidatedUser) {
              console.warn('⚠️ Firebase user signed out immediately after sign in');
              return;
            }
            
            // Verify the user UIDs match
            if (revalidatedUser.uid !== firebaseUser.uid) {
              console.warn('⚠️ User changed during initialization, skipping');
              return;
            }
            
            // Check if session manager knows about this user
            const sessionState = sessionManager.getSessionState();
            
            if (!sessionState.isAuthenticated || sessionState.userId !== firebaseUser.uid) {
              console.log('🔄 Creating new session for Firebase user...');
              
              // Determine login method from Firebase user
              const loginMethod = this.determineLoginMethod(firebaseUser);
              
              // Create session
              await sessionManager.createSession({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL
              }, loginMethod);
            } else {
              console.log('✅ Session already exists for this user');
              // Update last activity
              await sessionManager.updateLastActivity();
            }
            
            // Ensure backend is authenticated
            if (!yoraaAPI.isAuthenticated()) {
              console.log('🔄 Authenticating with backend...');
              
              // Verify Firebase user is still available before getting token
              const currentUser = auth().currentUser;
              if (!currentUser) {
                console.warn('⚠️ Firebase user signed out during backend auth attempt');
                return;
              }
              
              // Retry logic for getting ID token (handles race conditions)
              let retryCount = 0;
              const maxRetries = 3;
              let authSuccessful = false;
              
              while (retryCount < maxRetries && !authSuccessful) {
                try {
                  // Re-verify user still exists on each retry
                  const userForToken = auth().currentUser;
                  if (!userForToken) {
                    console.warn(`⚠️ User signed out during retry ${retryCount + 1}`);
                    return; // Exit gracefully
                  }
                  
                  const idToken = await userForToken.getIdToken(false);
                  await yoraaAPI.firebaseLogin(idToken);
                  console.log('✅ Backend authentication successful');
                  authSuccessful = true;
                  break; // Success, exit retry loop
                  
                } catch (tokenError) {
                  
                  // Handle specific token errors - these are expected in some cases
                  if (tokenError.code === 'auth/no-current-user' || 
                      tokenError.message?.includes('no-current-user') ||
                      tokenError.message?.includes('No user currently signed in')) {
                    
                    retryCount++;
                    if (retryCount < maxRetries) {
                      console.warn(`⚠️ No current user error (attempt ${retryCount}/${maxRetries}), retrying in ${retryCount * 200}ms...`);
                      await new Promise(resolve => setTimeout(resolve, retryCount * 200)); // Exponential backoff
                      continue; // Try again
                    } else {
                      console.warn('⚠️ User signed out after all retries, skipping backend auth');
                      return; // Exit gracefully without throwing
                    }
                  }
                  
                  // For other errors, log but don't throw to outer catch
                  console.error('⚠️ Backend authentication error:', tokenError.message);
                  return; // Exit gracefully
                }
              }
              
              // If we exhausted retries without success, just log and continue
              if (!authSuccessful) {
                console.warn('⚠️ Backend authentication could not be completed, will retry later');
              }
            }
            
          } catch (error) {
            // Only log truly unexpected errors (filter out expected auth state errors)
            const isExpectedAuthError = 
              error.code === 'auth/no-current-user' ||
              error.message?.includes('no-current-user') || 
              error.message?.includes('No user currently signed in') ||
              error.message?.includes('User signed out during authentication');
            
            if (!isExpectedAuthError) {
              console.error('❌ Unexpected error handling Firebase user sign in:', error);
            } else {
              console.log('ℹ️ Auth state change handled gracefully (user signed out during initialization)');
            }
          }
          
        } else {
          // User is signed out from Firebase
          console.log('🔐 Firebase user signed out, checking session...');
          
          // Check if this was an intentional logout or just a Firebase state change
          const sessionState = sessionManager.getSessionState();
          
          if (sessionState.isAuthenticated) {
            console.log('⚠️ Session exists but Firebase user is null - this might be a Firebase issue');
            
            // Try to validate session without Firebase
            const isSessionValid = await sessionManager.isSessionValid();
            
            if (!isSessionValid) {
              console.log('❌ Session invalid, clearing...');
              await sessionManager.clearSession();
              
              // Also clear backend
              try {
                await yoraaAPI.logout();
              } catch (error) {
                console.warn('⚠️ Backend logout failed during cleanup:', error);
              }
            }
          }
        }

        // Notify auth state listeners
        this.notifyAuthListeners(firebaseUser);
      });
      
      this.isInitialized = true;
      console.log('✅ Auth Manager initialized');
      
    } catch (error) {
      console.error('❌ Auth Manager initialization failed:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Determine login method from Firebase user data
   */
  determineLoginMethod(firebaseUser) {
    if (!firebaseUser.providerData || firebaseUser.providerData.length === 0) {
      return 'unknown';
    }

    const provider = firebaseUser.providerData[0];
    
    switch (provider.providerId) {
      case 'google.com':
        return 'google';
      case 'apple.com':
        return 'apple';
      case 'phone':
        return 'phone';
      case 'password':
        return firebaseUser.email ? 'email' : 'unknown';
      default:
        return 'unknown';
    }
  }

  /**
   * Notify all auth state listeners
   */
  notifyAuthListeners(firebaseUser) {
    this.authStateListeners.forEach(listener => {
      try {
        listener(firebaseUser);
      } catch (error) {
        console.error('❌ Auth state listener error:', error);
      }
    });
  }

  /**
   * Add listener for auth state changes
   */
  addAuthStateListener(listener) {
    this.authStateListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get comprehensive auth status including session state
   */
  async getAuthStatus() {
    const firebaseUser = auth().currentUser;
    const backendAuth = yoraaAPI.isAuthenticated();
    const sessionState = sessionManager.getSessionState();
    const isSessionValid = await sessionManager.isSessionValid();
    
    return {
      firebase: !!firebaseUser,
      backend: backendAuth,
      session: sessionState.isAuthenticated,
      sessionValid: isSessionValid,
      user: firebaseUser,
      sessionData: sessionState,
      isFullyAuthenticated: !!firebaseUser && backendAuth && sessionState.isAuthenticated && isSessionValid
    };
  }

  /**
   * Check if user is authenticated (all systems)
   */
  async isAuthenticated() {
    const authStatus = await this.getAuthStatus();
    return authStatus.isFullyAuthenticated;
  }

  /**
   * Force backend authentication for current Firebase user
   * Now with retry logic and better error handling
   */
  async syncBackendAuth(retryCount = 0, maxRetries = 3) {
    const user = auth().currentUser;
    
    if (!user) {
      console.warn('⚠️ No Firebase user to sync');
      return false;
    }
    
    if (yoraaAPI.isAuthenticated()) {
      console.log('✅ Backend already authenticated');
      return true;
    }
    
    try {
      console.log(`🔄 Syncing backend auth (attempt ${retryCount + 1}/${maxRetries})...`);
      
      // Get fresh ID token
      const idToken = await user.getIdToken(true);
      
      // Authenticate with backend
      await yoraaAPI.firebaseLogin(idToken);
      
      console.log('✅ Backend auth synchronized successfully');
      
      // Verify session exists
      const sessionState = sessionManager.getSessionState();
      if (!sessionState.isAuthenticated) {
        const loginMethod = this.determineLoginMethod(user);
        await sessionManager.createSession({
          uid: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          photoURL: user.photoURL
        }, loginMethod);
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ Backend sync failed (attempt ${retryCount + 1}):`, error.message);
      
      // Retry with exponential backoff
      if (retryCount < maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.syncBackendAuth(retryCount + 1, maxRetries);
      }
      
      console.error('❌ All backend sync attempts failed');
      return false;
    }
  }

  /**
   * Complete logout from all systems
   */
  async logout() {
    try {
      console.log('🔐 Starting complete logout from Auth Manager...');
      
      // 1. Clear session first
      await sessionManager.logout();
      
      // 2. Logout from backend
      try {
        await yoraaAPI.logoutComplete();
      } catch (error) {
        console.warn('⚠️ Backend logout failed (continuing):', error);
      }
      
      // 3. Sign out from Firebase (this will trigger the auth state change)
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        await auth().signOut();
        console.log('✅ Firebase logout successful');
      }
      
      console.log('✅ Complete logout from Auth Manager finished');
      return true;
      
    } catch (error) {
      console.error('❌ Auth Manager logout error:', error);
      return false;
    }
  }

  /**
   * Refresh all authentication states
   */
  async refreshAuth() {
    try {
      console.log('🔄 Refreshing authentication state...');
      
      // Refresh session
      await sessionManager.refreshSession();
      
      // Sync backend if needed
      await this.syncBackendAuth();
      
      console.log('✅ Authentication state refreshed');
      
    } catch (error) {
      console.error('❌ Auth refresh error:', error);
    }
  }

  /**
   * Debug method to check all auth states
   */
  async debugAuthStatus() {
    console.log('🔍 Complete Auth Debug Status:');
    
    const authStatus = await this.getAuthStatus();
    console.log('  - Firebase User:', !!authStatus.user);
    console.log('  - Backend Auth:', authStatus.backend);
    console.log('  - Session Auth:', authStatus.session);
    console.log('  - Session Valid:', authStatus.sessionValid);
    console.log('  - Fully Authenticated:', authStatus.isFullyAuthenticated);
    
    if (authStatus.user) {
      console.log('  - User Email:', authStatus.user.email);
      console.log('  - User UID:', authStatus.user.uid);
    }
    
    if (authStatus.sessionData.isAuthenticated) {
      console.log('  - Session Login Method:', authStatus.sessionData.loginMethod);
      console.log('  - Session Duration (min):', sessionManager.getSessionDuration());
    }
    
    // Also debug session manager
    await sessionManager.debugSessionStatus();
  }
}

// Export singleton instance
export default new AuthManager();
