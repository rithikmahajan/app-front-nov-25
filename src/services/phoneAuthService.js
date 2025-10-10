import auth from '@react-native-firebase/auth';

class PhoneAuthService {
  constructor() {
    this.verificationId = null;
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Complete phone number with country code (e.g., +1234567890)
   * @returns {Promise<string>} - Returns verification ID
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('Sending OTP to:', phoneNumber);
      
      // Validate phone number format
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      // Send verification code
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      // Store verification ID for later use
      this.verificationId = confirmation.verificationId;
      
      console.log('OTP sent successfully. Verification ID:', this.verificationId);
      return confirmation;
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Please enter a valid phone number';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify OTP code
   * @param {string} verificationCode - 6-digit verification code
   * @param {object} confirmation - Confirmation object from sendOTP
   * @returns {Promise<object>} - Returns user credential
   */
  async verifyOTP(verificationCode, confirmation) {
    try {
      console.log('Verifying OTP:', verificationCode);
      
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      if (!confirmation) {
        throw new Error('No confirmation object found. Please request a new OTP.');
      }

      // Confirm the verification code
      const userCredential = await confirmation.confirm(verificationCode);
      
      console.log('OTP verified successfully. User:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Invalid verification code. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Failed to verify OTP';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Resend OTP to the same phone number
   * @param {string} phoneNumber - Complete phone number with country code
   * @returns {Promise<string>} - Returns new verification ID
   */
  async resendOTP(phoneNumber) {
    try {
      console.log('Resending OTP to:', phoneNumber);
      return await this.sendOTP(phoneNumber);
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently signed in
   * @returns {boolean}
   */
  isUserSignedIn() {
    return auth().currentUser !== null;
  }

  /**
   * Get current user
   * @returns {object|null}
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await auth().signOut();
      this.verificationId = null;
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Format phone number with country code
   * @param {string} countryCode - Country code (e.g., +91)
   * @param {string} phoneNumber - Phone number without country code
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(countryCode, phoneNumber) {
    // Remove any non-numeric characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure country code starts with +
    const formattedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    
    return `${formattedCountryCode}${cleanNumber}`;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Complete phone number with country code
   * @returns {boolean}
   */
  validatePhoneNumber(phoneNumber) {
    // Basic validation: should start with + and have at least 10 digits
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

// Export singleton instance
export default new PhoneAuthService();
