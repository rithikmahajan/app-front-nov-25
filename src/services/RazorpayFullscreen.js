import { NativeModules, Platform } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const { RazorpayFullscreen } = NativeModules;

/**
 * Razorpay Fullscreen Wrapper for Android Tablets
 * 
 * This module ensures Razorpay checkout screen covers the complete iPad/tablet screen on Android
 * by setting fullscreen mode before and after Razorpay opens
 */
class RazorpayCheckoutFullscreen {
  static async open(options) {
    try {
      // Enable fullscreen mode BEFORE opening Razorpay (Android only)
      if (Platform.OS === 'android' && RazorpayFullscreen) {
        console.log('🔲 Setting fullscreen mode for tablet...');
        try {
          await RazorpayFullscreen.setFullscreenMode(true);
          console.log('✅ Fullscreen mode enabled');
        } catch (err) {
          console.warn('⚠️ Failed to set fullscreen mode:', err);
        }
      }
      
      // Small delay to ensure fullscreen takes effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Open Razorpay checkout
      console.log('🚀 Opening Razorpay...');
      const result = await RazorpayCheckout.open(options);
      console.log('✅ Payment successful');
      
      // Restore normal screen mode after payment (Android only)
      if (Platform.OS === 'android' && RazorpayFullscreen) {
        try {
          await RazorpayFullscreen.setFullscreenMode(false);
          console.log('✅ Screen mode restored');
        } catch (restoreError) {
          console.warn('⚠️ Failed to restore screen mode:', restoreError);
        }
      }
      
      return result;
    } catch (error) {
      console.log('❌ Payment error or cancelled');
      
      // Restore screen mode on error too (Android only)
      if (Platform.OS === 'android' && RazorpayFullscreen) {
        try {
          await RazorpayFullscreen.setFullscreenMode(false);
          console.log('✅ Screen mode restored after error');
        } catch (restoreError) {
          console.warn('⚠️ Failed to restore screen mode after error:', restoreError);
        }
      }
      
      throw error;
    }
  }
}

export default RazorpayCheckoutFullscreen;
