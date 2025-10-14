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
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║         🔵 GOOGLE AUTH SERVICE - SIGN IN FLOW                 ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      
      // Check if your device supports Google Play (Android only)
      if (Platform.OS === 'android') {
        console.log('\n🔍 STEP 1: Checking Google Play Services (Android)...');
        await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true,
          autoResolve: true 
        });
        console.log('✅ Google Play Services available');
      } else {
        console.log('\n⏭️ STEP 1: Skipped (iOS platform)');
      }
      
      // Sign out first to ensure clean state
      console.log('\n🔄 STEP 2: Signing out from previous session...');
      await GoogleSignin.signOut();
      console.log('✅ Signed out from previous session');
      
      // Get the users ID token
      console.log('\n� STEP 3: Initiating Google Sign In...');
      const signInResult = await GoogleSignin.signIn();
      
      console.log('📦 Sign In Result Structure:', {
        hasData: !!signInResult?.data,
        hasIdToken: !!(signInResult?.data?.idToken || signInResult?.idToken),
        hasUser: !!(signInResult?.data?.user || signInResult?.user),
        resultKeys: signInResult ? Object.keys(signInResult) : []
      });
      
      // Check if user cancelled (signInResult might be null or have a specific structure)
      if (!signInResult) {
        console.log('ℹ️ User canceled Google Sign In (null result)');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        return null;
      }
      
      console.log('✅ Google Sign In result received');
      
      // Extract idToken using the new API structure (v13+) with fallback to old structure
      console.log('\n🔄 STEP 4: Extracting ID token...');
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // Fallback for older versions of google-signin
        idToken = signInResult.idToken;
      }
      
      if (!idToken) {
        console.log('⚠️ No ID token in response - treating as cancellation');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        // No token might mean user cancelled - don't show error
        return null;
      }
      
      console.log(`✅ ID token extracted: ${idToken.substring(0, 30)}... (${idToken.length} chars)`);
      
      // Extract user info for logging
      const googleUser = signInResult.data?.user || signInResult.user;
      if (googleUser) {
        console.log('👤 Google User Info:');
        console.log(`   - ID: ${googleUser.id}`);
        console.log(`   - Email: ${googleUser.email}`);
        console.log(`   - Name: ${googleUser.name}`);
        console.log(`   - Photo: ${googleUser.photo || 'N/A'}`);
      }
      
      // Create a Google credential with the token
      console.log('\n🔄 STEP 5: Creating Firebase credential...');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('✅ Firebase credential created');
      
      // Sign in with the credential
      console.log('\n🔄 STEP 6: Signing in to Firebase...');
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Firebase Sign In successful');
      console.log('👤 Firebase User Details:');
      console.log(`   - UID: ${userCredential.user.uid}`);
      console.log(`   - Email: ${userCredential.user.email}`);
      console.log(`   - Display Name: ${userCredential.user.displayName}`);
      console.log(`   - Phone: ${userCredential.user.phoneNumber || 'N/A'}`);
      console.log(`   - Photo URL: ${userCredential.user.photoURL || 'N/A'}`);
      console.log(`   - Email Verified: ${userCredential.user.emailVerified}`);
      console.log(`   - Created At: ${userCredential.user.metadata?.creationTime}`);
      console.log(`   - Last Sign In: ${userCredential.user.metadata?.lastSignInTime}`);
      console.log(`   - Is New User: ${userCredential.additionalUserInfo?.isNewUser}`);
      console.log(`   - Provider ID: ${userCredential.user.providerData?.[0]?.providerId || 'N/A'}`);

      // Authenticate with Yoraa backend using Firebase ID token
      console.log('\n🔄 STEP 7: Authenticating with Yoraa backend...');
      try {
        console.log('   - Getting Firebase ID token...');
        const firebaseIdToken = await userCredential.user.getIdToken(true);
        console.log(`   - Firebase ID Token: ${firebaseIdToken.substring(0, 30)}... (${firebaseIdToken.length} chars)`);
        
        console.log('   - Calling backend firebaseLogin API...');
        const backendResponse = await yoraaAPI.firebaseLogin(firebaseIdToken);
        console.log('✅ Backend authentication successful');
        console.log('📦 Backend Response:', JSON.stringify(backendResponse, null, 2));
        console.log('ℹ️ Note: Backend automatically links providers with same email');
        
        // CRITICAL: Verify token was stored correctly
        console.log('\n🔍 STEP 8: Verifying token storage...');
        const storedToken = await yoraaAPI.getUserToken();
        console.log(`   - Token Storage: ${storedToken ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!storedToken) {
          console.error('⚠️ Backend token not set properly, reinitializing...');
          await yoraaAPI.initialize();
          
          // Re-check after initialization
          const retryToken = await yoraaAPI.getUserToken();
          console.log(`   - Token After Retry: ${retryToken ? '✅ EXISTS' : '❌ STILL MISSING'}`);
        }
        
        // Double-check authentication status
        const isAuth = yoraaAPI.isAuthenticated();
        console.log(`🔐 Final Authentication Status: ${isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
        
        if (!isAuth) {
          console.error('❌ CRITICAL: Backend authentication succeeded but token not persisted');
          throw new Error('Backend authentication succeeded but token not persisted');
        }
        
        console.log('✅ STEP 8: Token verification complete');
        
        // ✅ NEW: STEP 9 - Initialize and Register FCM Token
        console.log('\n🔔 STEP 9: Initializing FCM service...');
        try {
          // Import FCM service
          const fcmService = require('./fcmService').default;
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          
          // Initialize FCM and get token
          const fcmResult = await fcmService.initialize();
          
          if (fcmResult.success && fcmResult.token) {
            console.log('✅ FCM token obtained:', fcmResult.token.substring(0, 20) + '...');
            
            // Register token with backend using the auth token we just verified
            const authToken = await AsyncStorage.getItem('userToken');
            
            if (authToken) {
              const registerResult = await fcmService.registerTokenWithBackend(authToken);
              
              if (registerResult.success) {
                console.log('✅ FCM token registered with backend');
              } else {
                console.warn('⚠️ FCM registration failed (non-critical):', registerResult.error);
              }
            } else {
              console.warn('⚠️ Auth token not found for FCM registration');
            }
          } else {
            console.warn('⚠️ FCM initialization failed:', fcmResult.error);
          }
        } catch (fcmError) {
          console.warn('⚠️ FCM setup error (non-critical):', fcmError.message);
          // Don't throw - FCM is non-critical to authentication
        }
        console.log('✅ STEP 9: FCM setup completed');
        
      } catch (backendError) {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║              ⚠️  BACKEND AUTHENTICATION FAILED                ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.error('❌ Backend Error Type:', backendError.constructor.name);
        console.error('❌ Backend Error Code:', backendError.code);
        console.error('❌ Backend Error Message:', backendError.message);
        console.error('❌ Full Backend Error:', JSON.stringify(backendError, null, 2));
        console.error('❌ Stack Trace:', backendError.stack);
        
        // Don't throw here - Firebase auth succeeded, backend auth is optional but log prominently
        console.warn('⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend!');
        console.warn('This WILL cause "not authenticated" status to display in the app');
        console.warn('User will appear logged in but won\'t have access to backend resources');
      }
      
      console.log('\n✅ Google Sign In flow completed successfully');
      console.log(`⏰ End Time: ${new Date().toISOString()}`);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return userCredential;
    } catch (error) {
      // Handle specific error cases
      // User canceled the sign-in
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User canceled Google Sign In (not an error)');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        // Silently handle cancellation - don't throw error
        return null;
      }
      
      // Log actual errors
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ GOOGLE SIGN IN ERROR                          ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Platform:', Platform.OS);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
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
