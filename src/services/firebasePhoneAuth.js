import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

class FirebasePhoneAuthService {
  constructor() {
    this.confirmation = null;
    this.verificationId = null;
    this.phoneNumber = null;
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number with country code (e.g., +917006114695)
   * @returns {Promise<object>} - Confirmation object to verify OTP
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 FIREBASE PHONE AUTH - SEND OTP FLOW                  ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📞 Phone Number: ${phoneNumber}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🏗️  Build Type: ${__DEV__ ? 'DEBUG' : 'PRODUCTION'}`);

      // Validate phone number format
      console.log('\n🔍 STEP 1: Validating phone number format...');
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        console.error('❌ Validation failed: Phone number must include country code');
        throw new Error('Phone number must include country code (e.g., +91...)');
      }
      console.log('✅ Phone number format valid');
      
      // ✅ CRITICAL FIX: Configure app verification based on environment
      console.log('\n🔐 STEP 1.5: Configuring app verification...');
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🏗️  Build Type: ${__DEV__ ? 'DEBUG/DEVELOPMENT' : 'PRODUCTION/RELEASE'}`);
      
      if (__DEV__) {
        // DEVELOPMENT/DEBUG MODE: Disable verification for emulators/testing
        console.log('🧪 Development mode - disabling app verification for emulator testing...');
        auth().settings.appVerificationDisabledForTesting = true;
        console.log('✅ App verification DISABLED (prevents reCAPTCHA errors on emulators)');
        console.log('ℹ️  Use test phone numbers configured in Firebase Console for testing');
      } else {
        // PRODUCTION/RELEASE MODE: Enable verification for real devices
        console.log('🔐 Production mode - enabling app verification...');
        auth().settings.appVerificationDisabledForTesting = false;
        
        // ✅ NEW: Force auto-retrieval timeout to ensure SMS is retrieved quickly
        if (Platform.OS === 'android') {
          try {
            // Set a longer timeout for auto-retrieval (in milliseconds)
            auth().settings.autoRetrievedSmsCodeForPhoneNumber = null; // Clear any test number
            console.log('✅ Cleared test phone number auto-retrieval');
          } catch (settingsError) {
            console.warn('⚠️ Could not configure auto-retrieval settings:', settingsError.message);
          }
        }
        
        console.log('✅ App verification ENABLED (uses SafetyNet/Play Integrity on Android, APNs on iOS)');
        console.log('ℹ️  Real SMS will be sent to the phone number');
      }
      console.log('✅ App verification configured');

      // For iOS, we need to handle verification differently
      if (Platform.OS === 'ios') {
        console.log('\n🔄 STEP 2: iOS - Using signInWithPhoneNumber');
        console.log('ℹ️ iOS will use one of:');
        console.log('   1. Test phone numbers (if configured in Firebase Console)');
        console.log('   2. APNS Silent Push (if app verification is disabled in DEBUG)');
        console.log('   3. reCAPTCHA (fallback)');
        
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        
        console.log('✅ OTP sent successfully (iOS)');
        console.log('📦 Confirmation Object:', {
          verificationId: confirmation.verificationId ? 'EXISTS' : 'MISSING',
          hasConfirm: typeof confirmation.confirm === 'function'
        });
        
        // ✅ CRITICAL FIX: Store confirmation object and verificationId in service instance
        this.confirmation = confirmation;
        this.verificationId = confirmation.verificationId;
        this.phoneNumber = phoneNumber;
        console.log('✅ Confirmation stored in service instance');
        console.log(`⏰ End Time: ${new Date().toISOString()}`);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        return { success: true, confirmation, verificationId: confirmation.verificationId };
      } else {
        // Android
        console.log('\n🔄 STEP 2: Android - Using signInWithPhoneNumber');
        console.log('ℹ️ Android will use SMS auto-retrieval');
        
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        
        console.log('✅ OTP sent successfully (Android)');
        console.log('📦 Confirmation Object:', {
          verificationId: confirmation.verificationId ? 'EXISTS' : 'MISSING',
          hasConfirm: typeof confirmation.confirm === 'function'
        });
        
        // ✅ CRITICAL FIX: Store confirmation object and verificationId in service instance
        this.confirmation = confirmation;
        this.verificationId = confirmation.verificationId;
        this.phoneNumber = phoneNumber;
        console.log('✅ Confirmation stored in service instance');
        console.log(`⏰ End Time: ${new Date().toISOString()}`);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        return { success: true, confirmation, verificationId: confirmation.verificationId };
      }
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ SEND OTP ERROR                                ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Platform:', Platform.OS);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please include country code.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Phone authentication error. Please ensure Phone Auth is enabled in Firebase Console and GoogleService-Info.plist is updated.';
      } else if (error.code === 'auth/app-not-authorized') {
        errorMessage = 'App not authorized. Please verify SHA-256 certificate is added to Firebase Console and google-services.json is updated.';
        console.error('🚨 APP NOT AUTHORIZED ERROR - TROUBLESHOOTING:');
        console.error('   1. Verify SHA-256 certificate is added to Firebase Console');
        console.error('   2. Download and replace google-services.json');
        console.error('   3. Rebuild the app after updating google-services.json');
        console.error('   4. Check that package name matches in Firebase Console');
      } else if (error.code === 'auth/missing-recaptcha-token' || error.message?.includes('missing-recaptcha-token') || error.message?.includes('missing initial state') || error.message?.includes('sessionStorage')) {
        errorMessage = 'Verification failed. This may be due to SafetyNet/Play Integrity issues. Please try again or use a different device.';
        console.error('🚨 RECAPTCHA/SESSION ERROR - TROUBLESHOOTING:');
        console.error('   1. Ensure SHA-256 certificate is correctly added to Firebase Console');
        console.error('   2. Verify google-services.json is up to date (downloaded after adding SHA-256)');
        console.error('   3. Check that Google Play Services is up to date on device');
        console.error('   4. Try restarting the app or device');
        console.error('   5. Use a real Android device (not emulator) with Google Play Services');
        console.error('   6. For testing, add test phone numbers in Firebase Console');
      }
      
      console.log('📱 User-Friendly Error:', errorMessage);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code,
        fullError: error.message, // Add full error message for debugging
      };
    }
  }

  /**
   * Verify OTP code
   * @param {object} confirmation - Confirmation object from sendOTP
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise<object>} - User credential or error
   */
  async verifyOTP(confirmation, otpCode) {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       📱 FIREBASE PHONE AUTH - VERIFY OTP FLOW                ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`📝 OTP Code: ${otpCode}`);
      console.log(`📦 Confirmation Object: ${confirmation ? 'EXISTS' : 'MISSING'}`);

      console.log('\n🔍 STEP 1: Validating inputs...');
      if (!confirmation) {
        console.error('❌ No confirmation object found');
        throw new Error('No confirmation object. Please send OTP first.');
      }

      if (!otpCode || otpCode.length !== 6) {
        console.error('❌ Invalid OTP code length:', otpCode?.length);
        throw new Error('OTP must be 6 digits');
      }
      console.log('✅ Inputs validated');

      // Confirm the OTP code
      console.log('\n🔄 STEP 2: Confirming OTP with Firebase...');
      const userCredential = await confirmation.confirm(otpCode);
      
      console.log('✅ OTP verified successfully');
      console.log('👤 User Details:');
      console.log(`   - UID: ${userCredential.user.uid}`);
      console.log(`   - Phone Number: ${userCredential.user.phoneNumber}`);
      console.log(`   - Email: ${userCredential.user.email || 'N/A'}`);
      console.log(`   - Display Name: ${userCredential.user.displayName || 'N/A'}`);
      console.log(`   - Email Verified: ${userCredential.user.emailVerified}`);
      console.log(`   - Is Anonymous: ${userCredential.user.isAnonymous}`);
      console.log(`   - Created At: ${userCredential.user.metadata?.creationTime}`);
      console.log(`   - Last Sign In: ${userCredential.user.metadata?.lastSignInTime}`);
      console.log(`   - Provider ID: ${userCredential.user.providerData?.[0]?.providerId || 'N/A'}`);

      // Get Firebase ID token for backend authentication
      console.log('\n🔄 STEP 3: Getting Firebase ID token...');
      // CRITICAL FIX: Use auth().currentUser instead of userCredential.user
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Firebase user not found after phone authentication');
      }
      const idToken = await currentUser.getIdToken(true);
      console.log(`✅ Firebase ID Token obtained: ${idToken.substring(0, 30)}... (${idToken.length} chars)`);

      console.log(`⏰ End Time: ${new Date().toISOString()}`);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');

      return {
        success: true,
        user: userCredential.user,
        idToken,
        phoneNumber: userCredential.user.phoneNumber,
        uid: userCredential.user.uid,
      };
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ VERIFY OTP ERROR                              ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new one.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session expired. Please request a new OTP.';
      }
      
      console.log('📱 User-Friendly Error:', errorMessage);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code,
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await auth().signOut();
      this.confirmation = null;
      this.verificationId = null;
      this.phoneNumber = null;
      console.log('[FirebasePhoneAuth] ✅ Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('[FirebasePhoneAuth] ❌ Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get stored confirmation object (for production builds where navigation may lose it)
   */
  getStoredConfirmation() {
    console.log('[FirebasePhoneAuth] 📦 Getting stored confirmation:', {
      hasConfirmation: !!this.confirmation,
      hasVerificationId: !!this.verificationId,
      phoneNumber: this.phoneNumber
    });
    return this.confirmation;
  }

  /**
   * Get stored verification ID
   */
  getStoredVerificationId() {
    console.log('[FirebasePhoneAuth] 🆔 Getting stored verificationId:', this.verificationId);
    return this.verificationId;
  }

  /**
   * Verify OTP using stored confirmation or verificationId
   */
  async verifyStoredOTP(otpCode) {
    try {
      console.log('[FirebasePhoneAuth] 🔐 Verifying OTP with stored confirmation');
      
      if (this.confirmation) {
        console.log('[FirebasePhoneAuth] ✅ Using stored confirmation object');
        return await this.verifyOTP(this.confirmation, otpCode);
      } else if (this.verificationId) {
        console.log('[FirebasePhoneAuth] ✅ Using stored verificationId');
        const credential = auth.PhoneAuthProvider.credential(this.verificationId, otpCode);
        const userCredential = await auth().signInWithCredential(credential);
        
        // Get Firebase ID token for backend authentication
        // CRITICAL FIX: Use auth().currentUser instead of userCredential.user
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Firebase user not found after credential sign-in');
        }
        const idToken = await currentUser.getIdToken(true);
        
        return {
          success: true,
          user: userCredential.user,
          idToken,
          phoneNumber: userCredential.user.phoneNumber,
          uid: userCredential.user.uid,
        };
      } else {
        throw new Error('No stored verification session found');
      }
    } catch (error) {
      console.error('[FirebasePhoneAuth] ❌ Error verifying stored OTP:', error);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return auth().currentUser !== null;
  }
}

// Export singleton instance
const firebasePhoneAuthService = new FirebasePhoneAuthService();
export default firebasePhoneAuthService;
