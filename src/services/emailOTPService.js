import YoraaAPI from './yoraaAPI';

class EmailOTPService {
  constructor() {
    // Only used in development mode for testing
    this.pendingOTP = null;
    this.pendingEmail = null;
    this.otpExpiry = null;
  }

  /**
   * Send OTP to email address
   * @param {string} email - User's email address
   * @returns {Promise<object>} Response with success status
   */
  async sendOTP(email) {
    try {
      console.log('📧 Sending OTP to email:', email);
      
      // In development mode, generate OTP locally for testing
      if (__DEV__) {
        const otp = this.generateOTP();
        this.pendingOTP = otp;
        this.pendingEmail = email;
        this.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        console.log('✅ DEV MODE - OTP Generated:', otp);
        console.log('⚠️ In production, this OTP will be sent via email');
        
        return {
          success: true,
          message: 'OTP sent successfully',
          devOTP: otp // Only in development
        };
      }
      
      // Production mode: Call backend API to send email
      const response = await YoraaAPI.makeRequest('/api/auth/send-email-otp', 'POST', { 
        email 
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }
      
      console.log('✅ OTP sent to email:', email);
      
      return {
        success: true,
        message: response.message || 'OTP sent successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  }

  /**
   * Verify OTP entered by user
   * @param {string} email - User's email address
   * @param {string} otp - OTP entered by user
   * @returns {Promise<boolean>} True if OTP is valid
   */
  async verifyOTP(email, otp) {
    try {
      console.log('🔍 Verifying OTP for email:', email);
      
      // Development mode: Verify locally
      if (__DEV__) {
        if (!this.pendingOTP || !this.pendingEmail) {
          throw new Error('No OTP found. Please request a new one.');
        }
        
        if (Date.now() > this.otpExpiry) {
          this.clearOTP();
          throw new Error('OTP has expired. Please request a new one.');
        }
        
        if (this.pendingEmail !== email) {
          throw new Error('Email mismatch. Please try again.');
        }
        
        if (this.pendingOTP !== otp) {
          throw new Error('Invalid OTP. Please check and try again.');
        }
        
        console.log('✅ DEV MODE - OTP verified successfully');
        this.clearOTP();
        return true;
      }
      
      // Production mode: Verify with backend
      const response = await YoraaAPI.makeRequest('/api/auth/verify-email-otp', 'POST', { 
        email, 
        otp 
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Invalid OTP');
      }
      
      console.log('✅ OTP verified successfully');
      return true;
      
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw error;
    }
  }

  /**
   * Resend OTP to email
   * @param {string} email - User's email address
   * @returns {Promise<object>} Response with success status
   */
  async resendOTP(email) {
    console.log('🔄 Resending OTP to:', email);
    return await this.sendOTP(email);
  }

  /**
   * Generate a random 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Clear stored OTP data
   */
  clearOTP() {
    this.pendingOTP = null;
    this.pendingEmail = null;
    this.otpExpiry = null;
  }

  /**
   * Check if OTP is still valid
   * @returns {boolean} True if OTP exists and hasn't expired
   */
  isOTPValid() {
    return this.pendingOTP && this.otpExpiry && Date.now() < this.otpExpiry;
  }

  /**
   * Get remaining time for OTP expiry in seconds
   * @returns {number} Remaining seconds
   */
  getRemainingTime() {
    if (!this.otpExpiry) return 0;
    const remaining = Math.max(0, Math.floor((this.otpExpiry - Date.now()) / 1000));
    return remaining;
  }
}

// Export singleton instance
const emailOTPService = new EmailOTPService();
export default emailOTPService;
