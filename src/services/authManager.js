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
              const idToken = await firebaseUser.getIdToken(false);
              await yoraaAPI.firebaseLogin(idToken);
              console.log('✅ Backend authentication successful');
            }
            
          } catch (error) {
            console.error('❌ Error handling Firebase user sign in:', error);
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
   */
  async syncBackendAuth() {
    const user = auth().currentUser;
    if (user && !yoraaAPI.isAuthenticated()) {
      try {
        console.log('🔄 Synchronizing backend authentication...');
        const idToken = await user.getIdToken(true); // Force refresh
        await yoraaAPI.firebaseLogin(idToken);
        console.log('✅ Backend auth synchronized');
        
        // Update session if needed
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
        console.error('❌ Failed to sync backend auth:', error);
        return false;
      }
    }
    return yoraaAPI.isAuthenticated();
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
