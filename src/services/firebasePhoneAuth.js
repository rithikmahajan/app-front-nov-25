import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

class FirebasePhoneAuthService {
  constructor() {
    this.confirmation = null;
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

      // Validate phone number format
      console.log('\n🔍 STEP 1: Validating phone number format...');
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        console.error('❌ Validation failed: Phone number must include country code');
        throw new Error('Phone number must include country code (e.g., +91...)');
      }
      console.log('✅ Phone number format valid');

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
        
        this.confirmation = confirmation;
        console.log(`⏰ End Time: ${new Date().toISOString()}`);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        return { success: true, confirmation };
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
        
        this.confirmation = confirmation;
        console.log(`⏰ End Time: ${new Date().toISOString()}`);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        return { success: true, confirmation };
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
      const idToken = await userCredential.user.getIdToken(true);
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
      console.log('[FirebasePhoneAuth] ✅ Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('[FirebasePhoneAuth] ❌ Error signing out:', error);
      return { success: false, error: error.message };
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
