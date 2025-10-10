import { Platform } from 'react-native';

let GoogleSignin, statusCodes;
let auth;

try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  auth = require('@react-native-firebase/auth').default;
} catch (error) {
  console.warn('Google Sign-in module not available:', error.message);
}

import yoraaAPI from './yoraaAPI';

class GoogleAuthService {
  constructor() {
    this.isConfigured = false;
    this.isModuleAvailable = !!GoogleSignin;
    
    if (this.isModuleAvailable) {
      this.configure();
    } else {
      console.warn('Google Sign-in native module is not available. Please ensure the package is properly linked.');
    }
  }

  configure() {
    if (!this.isModuleAvailable) {
      console.warn('Cannot configure Google Sign-in: native module not available');
      return;
    }

    try {
      const config = {
        // Web Client ID from Firebase project (client_type: 3)
        webClientId: '133733122921-g3f9l1865vk4bchuc8cmu7qpq9o8ukkk.apps.googleusercontent.com',
        offlineAccess: true, // Required for refresh token
        hostedDomain: '', // Specify if you want to restrict to a particular domain
        forceCodeForRefreshToken: true, // Force code for refresh token
      };

      // Android-specific configuration
      if (Platform.OS === 'android') {
        config.scopes = ['profile', 'email']; // Basic scopes for Android
        config.iosClientId = undefined; // Explicitly undefined for Android
        
        // Additional Android configuration
        config.profileImageSize = 120; // Optional: specify profile image size
      }

      console.log('Configuring Google Sign-in with config:', {
        platform: Platform.OS,
        webClientId: config.webClientId.substring(0, 20) + '...',
        hasScopes: !!config.scopes
      });

      GoogleSignin.configure(config);
      this.isConfigured = true;
      console.log('✅ Google Sign In configured successfully for', Platform.OS);
    } catch (error) {
      console.error('❌ Google Sign In configuration error:', error);
      this.isConfigured = false;
    }
  }

  async signInWithGoogle() {
    if (!this.isModuleAvailable) {
      throw new Error('Google Sign-in is not available. Please check if the native module is properly linked.');
    }

    if (!this.isConfigured) {
      throw new Error('Google Sign In is not configured. Please set up your webClientId.');
    }

    try {
      console.log('Starting Google Sign In process...');
      
      // Check if your device supports Google Play (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true,
          autoResolve: true 
        });
        console.log('Google Play Services available');
      }
      
      // Sign out first to ensure clean state
      await GoogleSignin.signOut();
      console.log('Signed out from previous session');
      
      // Get the users ID token
      console.log('🔐 Attempting Google Sign In...');
      const signInResult = await GoogleSignin.signIn();
      
      // Check if user cancelled (signInResult might be null or have a specific structure)
      if (!signInResult) {
        console.log('User canceled Google Sign In (null result)');
        return null;
      }
      
      console.log('✅ Google Sign In result received');
      
      // Extract idToken using the new API structure (v13+) with fallback to old structure
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // Fallback for older versions of google-signin
        idToken = signInResult.idToken;
      }
      
      if (!idToken) {
        console.log('No ID token in response - treating as cancellation');
        // No token might mean user cancelled - don't show error
        return null;
      }
      
      console.log('✅ ID token extracted successfully');
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('✅ Google credential created successfully');
      
      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('Firebase Google Sign In successful:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        isNewUser: userCredential.additionalUserInfo?.isNewUser
      });

      // Authenticate with Yoraa backend using Firebase ID token
      try {
        const firebaseIdToken = await userCredential.user.getIdToken();
        console.log('Getting Firebase ID token for backend authentication...');
        
        await yoraaAPI.firebaseLogin(firebaseIdToken);
        console.log('✅ Successfully authenticated with Yoraa backend');
        console.log('ℹ️ Note: If account exists with same email, backend automatically links providers');
      } catch (backendError) {
        console.warn('Backend authentication failed:', backendError);
        // Don't throw here - Firebase auth succeeded, backend auth is optional
      }
      
      return userCredential;
    } catch (error) {
      // Handle specific error cases
      // User canceled the sign-in
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User canceled Google Sign In');
        // Silently handle cancellation - don't throw error
        return null;
      }
      
      // Log actual errors
      console.error('Google Sign In error details:', {
        code: error.code,
        message: error.message,
        platform: Platform.OS
      });
      
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available. Please update Google Play Services and try again.');
      } else {
        // More detailed error for Android
        if (Platform.OS === 'android') {
          throw new Error(`Google Sign In failed on Android: ${error.message || error.code || 'Unknown error'}`);
        } else {
          throw new Error(`Google Sign In failed: ${error.message}`);
        }
      }
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      console.log('Google Sign Out successful');
    } catch (error) {
      console.error('Google Sign Out error:', error);
    }
  }

  async isSignedIn() {
    if (!this.isModuleAvailable) {
      return false;
    }
    
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Error checking Google Sign In status:', error);
      return false;
    }
  }

  // Check if Google Sign-in is available and properly configured
  isAvailable() {
    return this.isModuleAvailable && this.isConfigured;
  }

  // Android-specific method to check Google Play Services and configuration
  async checkAndroidConfiguration() {
    if (!this.isModuleAvailable) {
      return {
        success: false,
        message: 'Google Sign-in native module is not available. Please check installation and linking.'
      };
    }

    if (Platform.OS !== 'android') {
      return { success: true, message: 'iOS platform detected' };
    }

    try {
      console.log('🔍 Checking Android Google Sign-in configuration...');
      
      // Check if Google Play Services is available
      console.log('📱 Checking Google Play Services availability...');
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: false,
        autoResolve: false
      });
      
      if (!hasPlayServices) {
        return {
          success: false,
          message: 'Google Play Services not available. Please install or update Google Play Services.'
        };
      }
      
      console.log('✅ Google Play Services available');
      
      // Additional configuration checks
      if (!this.isConfigured) {
        return {
          success: false,
          message: 'Google Sign-in is not properly configured. Please check your Firebase setup.'
        };
      }
      
      console.log('✅ All Android configuration checks passed');
      return {
        success: true,
        message: 'Android Google Sign-in configuration verified successfully'
      };
      
    } catch (error) {
      console.error('❌ Android configuration check failed:', error);
      
      // Handle specific Play Services errors
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          message: 'Google Play Services is not available on this device.'
        };
      } else if (error.code === statusCodes.PLAY_SERVICES_UPDATE_REQUIRED) {
        return {
          success: false,
          message: 'Google Play Services needs to be updated.'
        };
      }
      
      return {
        success: false,
        message: `Configuration check failed: ${error.message || 'Unknown error'}`
      };
    }
  }
}

export default new GoogleAuthService();
