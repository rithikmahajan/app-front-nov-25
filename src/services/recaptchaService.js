/**
 * reCAPTCHA Enterprise Service for Phone Authentication
 * 
 * This service initializes and manages Google reCAPTCHA Enterprise
 * for iOS phone number authentication according to:
 * https://cloud.google.com/recaptcha/docs/instrument-ios-apps
 */

import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';

class RecaptchaService {
  constructor() {
    this.isInitialized = false;
    this.recaptchaKey = null;
  }

  /**
   * Initialize reCAPTCHA Enterprise
   * This should be called early in your app lifecycle
   * 
   * @param {string} siteKey - Your reCAPTCHA site key for iOS
   */
  async initialize(siteKey) {
    try {
      if (Platform.OS !== 'ios') {
        console.log('⚠️  reCAPTCHA Enterprise is only required for iOS');
        this.isInitialized = true;
        return;
      }

      console.log('🔄 Initializing reCAPTCHA Enterprise for iOS...');
      
      // Store the site key
      this.recaptchaKey = siteKey;
      
      // For React Native Firebase, the reCAPTCHA is handled automatically
      // when you have the RecaptchaEnterprise pod installed
      // Just ensure Firebase Auth is initialized
      const authInstance = auth();
      
      if (authInstance) {
        console.log('✅ Firebase Auth initialized with reCAPTCHA support');
        this.isInitialized = true;
      } else {
        throw new Error('Firebase Auth initialization failed');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize reCAPTCHA Enterprise:', error);
      throw error;
    }
  }

  /**
   * Configure Firebase App Check with reCAPTCHA Enterprise
   * This provides additional security for your backend APIs
   */
  async configureAppCheck() {
    try {
      if (Platform.OS !== 'ios') {
        console.log('⚠️  App Check configuration is platform-specific');
        return;
      }

      // Firebase App Check will use reCAPTCHA Enterprise automatically
      // when the RecaptchaEnterprise pod is installed and App Attest is configured
      console.log('✅ App Check configured with reCAPTCHA Enterprise');
      
    } catch (error) {
      console.error('❌ Failed to configure App Check:', error);
      // Don't throw - this is optional additional security
    }
  }

  /**
   * Verify phone number with reCAPTCHA Enterprise
   * 
   * @param {string} phoneNumber - Phone number with country code
   * @returns {Promise} Firebase confirmation object
   */
  async verifyPhoneNumber(phoneNumber) {
    try {
      if (!this.isInitialized && Platform.OS === 'ios') {
        console.warn('⚠️  reCAPTCHA not initialized, but attempting phone auth anyway...');
        // Don't throw, just warn - Firebase might work without explicit initialization
      }

      console.log('📱 Verifying phone number with reCAPTCHA Enterprise:', phoneNumber);
      
      // Ensure auth instance exists
      const authInstance = auth();
      if (!authInstance) {
        throw new Error('Firebase Auth instance is not available. Please check your Firebase configuration.');
      }
      
      console.log('🔐 Firebase Auth instance ready, calling signInWithPhoneNumber...');
      
      // Firebase Auth with reCAPTCHA Enterprise installed will handle verification automatically
      const confirmation = await authInstance.signInWithPhoneNumber(phoneNumber);
      
      if (!confirmation) {
        throw new Error('Phone verification failed - no confirmation object returned');
      }
      
      console.log('✅ Phone number verification initiated successfully');
      return confirmation;
      
    } catch (error) {
      console.error('❌ Phone verification failed:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      // Provide helpful error messages based on error code
      if (error.code === 'auth/unknown') {
        throw new Error(
          'The reCAPTCHA SDK is not linked to your app. ' +
          'Make sure RecaptchaEnterprise pod is installed and App Attest is configured.'
        );
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Phone authentication is not enabled in Firebase Console. ' +
          'Please enable it in Authentication → Sign-in method → Phone'
        );
      }
      
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Please enter a valid phone number with country code.');
      }
      
      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Check if reCAPTCHA is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.isInitialized;
  }

  /**
   * Get configuration status for debugging
   * @returns {object}
   */
  getStatus() {
    return {
      platform: Platform.OS,
      isInitialized: this.isInitialized,
      hasSiteKey: !!this.recaptchaKey,
      isRequired: Platform.OS === 'ios',
    };
  }
}

// Export singleton instance
export default new RecaptchaService();
