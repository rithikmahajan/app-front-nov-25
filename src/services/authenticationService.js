/**
 * 🔐 Unified Authentication Service
 * Handles all authentication methods: Apple, Google, Phone/OTP, Email
 * Integrates with Firebase and FCM token registration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { Platform, Alert } from 'react-native';
import yoraaAPI from './yoraaAPI';
import fcmService from './fcmService';
import googleAuthService from './googleAuthService';
import appleAuthService from './appleAuthService';
import authStorageService from './authStorageService';

class AuthenticationService {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
  }

  /**
   * 📱 PHONE NUMBER LOGIN WITH OTP
   * Uses Firebase Phone Authentication
   */
  async signInWithPhoneNumber(phoneNumber) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 PHONE AUTH - SEND OTP FLOW                           ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📞 Phone Number: ${phoneNumber}`);

      // Validate phone number format
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +91...)');
      }

      // Send OTP via Firebase
      console.log('🔄 Sending OTP via Firebase...');
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('✅ OTP sent successfully');
      return {
        success: true,
        confirmation,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error),
        errorCode: error.code
      };
    }
  }

  /**
   * 🔐 VERIFY OTP AND COMPLETE LOGIN
   */
  async verifyOTP(confirmation, otpCode) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 PHONE AUTH - VERIFY OTP FLOW                         ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📝 OTP Code: ${otpCode}`);

      if (!confirmation) {
        throw new Error('No confirmation object. Please send OTP first.');
      }

      if (!otpCode || otpCode.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      // Confirm OTP with Firebase
      console.log('🔄 Confirming OTP with Firebase...');
      const userCredential = await confirmation.confirm(otpCode);
      
      console.log('✅ OTP verified successfully');
      console.log(`👤 Firebase UID: ${userCredential.user.uid}`);

      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Send to backend for registration/login
      const backendResult = await this._authenticateWithBackend({
        idToken,
        phoneNumber: userCredential.user.phoneNumber,
        method: 'phone'
      });

      if (backendResult.success) {
        // Complete authentication flow
        await this._completeAuthentication(backendResult.data);
        
        return {
          success: true,
          user: backendResult.data.user,
          token: backendResult.data.token,
          message: 'Login successful'
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error),
        errorCode: error.code
      };
    }
  }

  /**
   * 🍎 APPLE SIGN IN
   */
  async signInWithApple() {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       🍎 APPLE AUTH - SIGN IN FLOW                            ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);

      // Use existing Apple auth service
      const appleResult = await appleAuthService.signInWithApple();
      
      if (!appleResult.success) {
        throw new Error(appleResult.error || 'Apple Sign In failed');
      }

      // Get Firebase ID token
      const firebaseUser = auth().currentUser;
      if (!firebaseUser) {
        throw new Error('Firebase user not found after Apple Sign In');
      }

      const idToken = await firebaseUser.getIdToken();
      
      // Send to backend
      const backendResult = await this._authenticateWithBackend({
        idToken,
        email: appleResult.user.email,
        fullName: appleResult.user.fullName,
        method: 'apple'
      });

      if (backendResult.success) {
        await this._completeAuthentication(backendResult.data);
        
        return {
          success: true,
          user: backendResult.data.user,
          token: backendResult.data.token,
          message: 'Apple Sign In successful'
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Apple Sign In error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error)
      };
    }
  }

  /**
   * 🔵 GOOGLE SIGN IN
   */
  async signInWithGoogle() {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       🔵 GOOGLE AUTH - SIGN IN FLOW                           ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);

      // Use existing Google auth service
      const googleResult = await googleAuthService.signInWithGoogle();
      
      if (!googleResult.success) {
        throw new Error(googleResult.error || 'Google Sign In failed');
      }

      // Get Firebase ID token
      const firebaseUser = auth().currentUser;
      if (!firebaseUser) {
        throw new Error('Firebase user not found after Google Sign In');
      }

      const idToken = await firebaseUser.getIdToken();
      
      // Send to backend
      const backendResult = await this._authenticateWithBackend({
        idToken,
        email: googleResult.user.email,
        fullName: googleResult.user.name,
        photoURL: googleResult.user.photo,
        method: 'google'
      });

      if (backendResult.success) {
        await this._completeAuthentication(backendResult.data);
        
        return {
          success: true,
          user: backendResult.data.user,
          token: backendResult.data.token,
          message: 'Google Sign In successful'
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Google Sign In error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error)
      };
    }
  }

  /**
   * 📧 EMAIL & PASSWORD LOGIN
   */
  async signInWithEmail(email, password) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📧 EMAIL AUTH - SIGN IN FLOW                            ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📧 Email: ${email}`);

      // Sign in with Firebase
      console.log('🔄 Signing in with Firebase...');
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      console.log('✅ Firebase sign in successful');
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Send to backend
      const backendResult = await this._authenticateWithBackend({
        idToken,
        email: userCredential.user.email,
        method: 'email'
      });

      if (backendResult.success) {
        await this._completeAuthentication(backendResult.data);
        
        return {
          success: true,
          user: backendResult.data.user,
          token: backendResult.data.token,
          message: 'Login successful'
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Email sign in error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error),
        errorCode: error.code
      };
    }
  }

  /**
   * 📝 EMAIL & PASSWORD SIGN UP
   */
  async signUpWithEmail(email, password, fullName) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📝 EMAIL AUTH - SIGN UP FLOW                            ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📧 Email: ${email}`);

      // Create account with Firebase
      console.log('🔄 Creating account with Firebase...');
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      console.log('✅ Firebase account created');
      
      // Update profile with name
      if (fullName) {
        await userCredential.user.updateProfile({
          displayName: fullName
        });
      }
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Send to backend
      const backendResult = await this._authenticateWithBackend({
        idToken,
        email: userCredential.user.email,
        fullName,
        method: 'email'
      });

      if (backendResult.success) {
        await this._completeAuthentication(backendResult.data);
        
        return {
          success: true,
          user: backendResult.data.user,
          token: backendResult.data.token,
          message: 'Sign up successful'
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Email sign up error:', error);
      return {
        success: false,
        error: this._getAuthErrorMessage(error),
        errorCode: error.code
      };
    }
  }

  /**
   * 🔓 LOGOUT
   * Signs out from Firebase and clears all stored data
   */
  async logout() {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       🔓 LOGOUT FLOW                                          ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);

      // 1. Sign out from Firebase
      console.log('🔄 Signing out from Firebase...');
      await auth().signOut();
      console.log('✅ Firebase sign out successful');

      // 2. Sign out from Google (if applicable)
      try {
        if (googleAuthService.isModuleAvailable) {
          await googleAuthService.signOut();
          console.log('✅ Google sign out successful');
        }
      } catch (error) {
        console.warn('⚠️ Google sign out failed (non-critical):', error.message);
      }

      // 3. Clear FCM token from backend (before removing auth token!)
      try {
        const authToken = await AsyncStorage.getItem('token');
        if (authToken) {
          await fcmService.unregisterTokenFromBackend(authToken);
          console.log('✅ FCM token unregistered from backend');
        }
      } catch (error) {
        console.warn('⚠️ FCM token unregister failed (non-critical):', error.message);
      }

      // 4. Clear all stored auth data
      console.log('🔄 Clearing stored authentication data...');
      await AsyncStorage.multiRemove([
        'token',
        'user',
        'firebaseToken',
        'fcmToken',
        'fcmTokenRegistered',
        'fcmTokenRegisteredAt',
        'wishlistItems',
        'cartItems',
        'userPreferences'
      ]);
      console.log('✅ All stored data cleared');

      // 5. Reset internal state
      this.currentUser = null;
      this.authToken = null;

      console.log('✅ Logout completed successfully');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if logout fails, clear local data
      try {
        await AsyncStorage.clear();
      } catch (clearError) {
        console.error('❌ Failed to clear AsyncStorage:', clearError);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔄 PRIVATE: Authenticate with backend server
   */
  async _authenticateWithBackend(authData) {
    try {
      console.log('🔄 Authenticating with backend server...');
      
      const endpoint = '/auth/firebase-login';
      const response = await yoraaAPI.post(endpoint, authData);
      
      if (response.success && response.data.token) {
        console.log('✅ Backend authentication successful');
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user
          }
        };
      } else {
        throw new Error(response.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('❌ Backend authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ PRIVATE: Complete authentication flow
   * 1. Save auth data to AsyncStorage
   * 2. Initialize and register FCM token
   * 3. Set internal state
   */
  async _completeAuthentication(authData) {
    try {
      console.log('🔄 Completing authentication flow...');
      
      // 1. CRITICAL: Save token FIRST before any other operations
      console.log('💾 Saving authentication data...');
      await AsyncStorage.setItem('token', authData.token);
      await AsyncStorage.setItem('user', JSON.stringify(authData.user));
      console.log('✅ Auth data saved to AsyncStorage');
      
      // 2. Set internal state
      this.authToken = authData.token;
      this.currentUser = authData.user;
      
      // 3. Initialize and register FCM token (non-blocking)
      console.log('🔔 Initializing FCM service...');
      this._initializeFCM(authData.token).catch(error => {
        console.warn('⚠️ FCM initialization failed (non-critical):', error.message);
      });
      
      console.log('✅ Authentication flow completed');
    } catch (error) {
      console.error('❌ Complete authentication error:', error);
      throw error;
    }
  }

  /**
   * 🔔 PRIVATE: Initialize FCM and register token
   */
  async _initializeFCM(authToken) {
    try {
      // Initialize FCM service
      const fcmResult = await fcmService.initialize();
      
      if (fcmResult.success && fcmResult.token) {
        console.log('✅ FCM initialized successfully');
        
        // Register token with backend
        const registerResult = await fcmService.registerTokenWithBackend(authToken);
        
        if (registerResult.success) {
          console.log('✅ FCM token registered with backend');
        } else {
          console.warn('⚠️ FCM token registration failed:', registerResult.error);
        }
      } else {
        console.warn('⚠️ FCM initialization failed:', fcmResult.error);
      }
    } catch (error) {
      console.error('❌ FCM setup error:', error);
      // Don't throw - FCM is non-critical
    }
  }

  /**
   * 🔍 CHECK AUTHENTICATION STATUS
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      
      return !!(token && user);
    } catch (error) {
      console.error('❌ Check authentication error:', error);
      return false;
    }
  }

  /**
   * 👤 GET CURRENT USER
   */
  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  /**
   * 🔑 GET AUTH TOKEN
   */
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('❌ Get auth token error:', error);
      return null;
    }
  }

  /**
   * 📝 PRIVATE: Get user-friendly error message
   */
  _getAuthErrorMessage(error) {
    const errorMessages = {
      'auth/invalid-phone-number': 'Invalid phone number format. Please include country code.',
      'auth/invalid-verification-code': 'Invalid OTP code. Please check and try again.',
      'auth/code-expired': 'OTP code has expired. Please request a new one.',
      'auth/too-many-requests': 'Too many requests. Please try again later.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    };

    return errorMessages[error.code] || error.message || 'Authentication failed. Please try again.';
  }
}

// Export singleton instance
export default new AuthenticationService();
