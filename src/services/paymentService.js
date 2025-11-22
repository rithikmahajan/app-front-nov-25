/**
 * Payment Service - Razorpay Payment Integration
 * Following Backend Team's Comprehensive Guide (October 5, 2025)
 * 
 * Handles Razorpay payment initialization, processing, and verification
 * Integrates with order service for complete checkout flow
 */

import RazorpayCheckout from 'react-native-razorpay';
import RazorpayFullscreen from './RazorpayFullscreen';
import orderService from './orderService';

// Razorpay Configuration
const RAZORPAY_CONFIG = {
  // ALWAYS USE LIVE KEY - as per user request
  key: 'rzp_live_VRU7ggfYLI7DWV',
  
  // Company branding
  name: 'Yoraa Apparels',
  description: 'Yoraa Apparels Purchase',
  image: 'https://yoraa.com/logo.png', // Company logo URL
  currency: 'INR',
  theme: {
    color: '#000000' // Black theme
  }
};

// Log which key is being used
console.log('🔑 Razorpay Config:', {
  mode: 'LIVE (FORCED)',
  key: RAZORPAY_CONFIG.key
});

/**
 * Initialize Razorpay Payment
 * Opens Razorpay checkout with proper configuration
 */
export const initiatePayment = async (orderResponse, address, onSuccess, onError) => {
  console.log('💳 Initiating Razorpay payment with order:', orderResponse);
  console.log('📍 Using address for prefill:', address);
  
  try {
    // Check if RazorpayCheckout module is available
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
      throw new Error('Razorpay SDK not properly initialized. Please restart the app.');
    }
    
    // Validate required parameters
    if (!orderResponse || !orderResponse.id) {
      throw new Error('Invalid order response - missing order ID');
    }
    
    if (!orderResponse.amount || orderResponse.amount <= 0) {
      throw new Error(`Invalid amount: ${orderResponse.amount}`);
    }
    
    // Prepare Razorpay options as per backend specification
    const razorpayOptions = {
      key: RAZORPAY_CONFIG.key,                    // Razorpay key from config
      amount: orderResponse.amount,                // Amount in paise
      currency: orderResponse.currency || RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image: RAZORPAY_CONFIG.image,
      order_id: orderResponse.id,                  // Razorpay order ID
      
      // Prefill customer data
      prefill: {
        name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
        email: address.email || '',
        contact: address.phone || address.phoneNumber || ''
      },
      
      // Theme
      theme: RAZORPAY_CONFIG.theme
    };
    
    console.log('💳 Opening Razorpay checkout with options:', JSON.stringify(razorpayOptions, null, 2));
    console.log('🔍 Razorpay validation check:', {
      hasKey: !!razorpayOptions.key,
      hasAmount: !!razorpayOptions.amount,
      hasOrderId: !!razorpayOptions.order_id,
      amountValue: razorpayOptions.amount,
      orderIdValue: razorpayOptions.order_id
    });
    
    // Validate required Razorpay fields
    if (!razorpayOptions.key) {
      throw new Error('Razorpay key is missing');
    }
    if (!razorpayOptions.amount || razorpayOptions.amount <= 0) {
      throw new Error(`Invalid amount: ${razorpayOptions.amount}`);
    }
    if (!razorpayOptions.order_id) {
      throw new Error('Order ID is missing');
    }
    
    console.log('🚀 About to call RazorpayFullscreen.open() for tablet support...');
    
    // Open Razorpay checkout with fullscreen support for tablets
    let paymentResponse;
    try {
      paymentResponse = await RazorpayFullscreen.open(razorpayOptions);
      console.log('✅ RazorpayFullscreen.open() resolved successfully');
      console.log('✅ Payment successful:', paymentResponse);
    } catch (razorpayError) {
      // Check if this is a cancellation (code 0) before logging as error
      const isCancellation = razorpayError?.code === 0 || razorpayError?.code === 'payment_cancelled';
      
      if (isCancellation) {
        console.log('ℹ️ Payment cancelled by user');
        console.log('ℹ️ Cancellation details:', JSON.stringify(razorpayError, null, 2));
      } else {
        // Log actual errors
        console.error('❌ Razorpay SDK error:', razorpayError);
        console.error('❌ Error type:', typeof razorpayError);
        console.error('❌ Error keys:', Object.keys(razorpayError || {}));
        
        // Try to extract all possible error properties
        const errorDetails = {
          code: razorpayError?.code,
          description: razorpayError?.description,
          message: razorpayError?.message,
          reason: razorpayError?.reason,
          step: razorpayError?.step,
          source: razorpayError?.source,
          error: razorpayError?.error,
          metadata: razorpayError?.metadata,
        };
        
        console.error('❌ Extracted error details:', JSON.stringify(errorDetails, null, 2));
      }
      
      // Re-throw to be caught by outer catch
      throw razorpayError;
    }
    
    // Handle successful payment
    await handlePaymentSuccess(paymentResponse, orderResponse, onSuccess, onError);
    
  } catch (error) {
    // Check if cancellation before logging as error
    const isCancellation = error?.code === 0 || error?.code === 'payment_cancelled';
    
    if (isCancellation) {
      console.log('ℹ️ Payment flow: User cancelled');
    } else {
      console.error('❌ Payment flow error:', error);
    }
    
    handlePaymentFailure(error, orderResponse, onError);
  }
};

/**
 * Handle Payment Success
 * Processes successful payment response and verifies with backend
 */
const handlePaymentSuccess = async (paymentResponse, orderResponse, onSuccess, onError) => {
  try {
    console.log('🔍 Verifying payment:', paymentResponse);
    console.log('📦 Order response for verification:', orderResponse);
    
    // Prepare verification data with ALL required order creation data
    const verificationData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      database_order_id: orderResponse.database_order_id, // Include database order ID if available
      
      // ✅ FIX: Include order creation data for backend
      cart: orderResponse.cart || orderResponse.items,
      staticAddress: orderResponse.staticAddress || orderResponse.address,
      amount: orderResponse.amount,
      userId: orderResponse.userId,
      orderNotes: orderResponse.orderNotes
    };
    
    console.log('🔐 Sending payment verification data with order details:', {
      ...verificationData,
      cart: verificationData.cart ? `${verificationData.cart.length} items` : 'none',
      hasAddress: !!verificationData.staticAddress,
      amount: verificationData.amount
    });
    
    // Verify payment with backend
    const verificationResult = await orderService.verifyPayment(verificationData);
    
    if (verificationResult.success) {
      console.log('✅ Payment verification successful');
      
      // Call success callback with order details
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess({
          orderId: verificationResult.orderId,
          order: verificationResult.order,
          paymentId: paymentResponse.razorpay_payment_id,
          message: 'Payment completed successfully!'
        });
      }
    } else {
      console.error('❌ Payment verification failed:', verificationResult.message);
      
      // Handle verification failure
      if (onError && typeof onError === 'function') {
        onError(new Error(verificationResult.message || 'Payment verification failed'));
      } else {
        orderService.handlePaymentError(verificationResult.message || 'Payment verification failed');
      }
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    if (onError && typeof onError === 'function') {
      onError(error);
    } else {
      orderService.handlePaymentError('Payment verification failed');
    }
  }
};

/**
 * Handle Payment Failure
 * Processes payment failures and errors
 */
const handlePaymentFailure = (error, orderResponse, onError) => {
  console.log('💳 Payment response received:', error);
  console.log('💳 Full error object:', JSON.stringify(error, null, 2));
  
  let errorMessage = 'Payment failed. Please try again.';
  
  // Enhanced error handling for Razorpay SDK errors
  if (error && typeof error.code !== 'undefined') {
    console.log('🔍 Processing Razorpay response with code:', error.code);
    
    switch (error.code) {
      case 0: // User cancelled payment (code 0)
      case 'payment_cancelled':
        console.log('ℹ️ Payment cancelled by user (not an error)');
        
        // Handle payment cancellation cleanup
        if (orderResponse && orderResponse.database_order_id) {
          orderService.handlePaymentCancellation(orderResponse.database_order_id);
        }
        
        // Don't call onError for cancellation - just return silently
        // User intentionally closed the payment, no need to show error
        return;
        
      case 1: // Payment failed (code 1)
      case 'payment_failed':
        errorMessage = error.description || 'Payment failed. Please check your payment details and try again.';
        console.error('❌ Payment failed:', errorMessage);
        break;
        
      case 2: // Network error (code 2)
      case 'network_error':
        errorMessage = 'Network error. Please check your connection and try again.';
        console.error('❌ Network error during payment');
        break;
        
      case 3: // Payment timed out (code 3)
        errorMessage = 'Payment timed out. Please try again.';
        console.error('❌ Payment timed out');
        break;
        
      case 'invalid_order_id':
        errorMessage = 'Invalid order. Please try again.';
        console.error('❌ Invalid order ID');
        break;
        
      default:
        errorMessage = error.description || error.message || `Payment error (code: ${error.code})`;
        console.error('❌ Unhandled payment error code:', error.code);
    }
  } else if (error && error.message) {
    if (error.message.includes('Razorpay key is missing')) {
      errorMessage = 'Payment configuration error. Please contact support.';
      console.error('❌ Razorpay key missing');
    } else if (error.message.includes('Invalid amount')) {
      errorMessage = 'Invalid order amount. Please refresh and try again.';
      console.error('❌ Invalid amount');
    } else if (error.message.includes('Order ID is missing')) {
      errorMessage = 'Order creation failed. Please try again.';
      console.error('❌ Order ID missing');
    } else {
      errorMessage = error.message;
      console.error('❌ Payment error:', errorMessage);
    }
  }
  
  // Call error callback for actual payment errors
  console.error('❌ Calling error handler with message:', errorMessage);
  if (onError && typeof onError === 'function') {
    onError(new Error(errorMessage));
  } else {
    orderService.handlePaymentError(errorMessage);
  }
};

/**
 * Complete Order Flow
 * Combines order creation and payment processing in one flow
 */
// ✅ Helper function to get authenticated user ID
const getAuthenticatedUserId = async () => {
  try {
    const { yoraaAPI } = await import('./yoraaAPI');
    const userData = await yoraaAPI.getUserData();
    return userData?.id || userData?.uid || null;
  } catch (error) {
    console.warn('Could not retrieve user ID:', error);
    return null;
  }
};

export const processCompleteOrder = async (cart, address, options = {}) => {
  console.log('🎯 Processing complete order flow...');
  console.log('📦 Cart:', cart);
  console.log('📍 Address:', address);
  
  try {
    // ✅ FIX: Ensure authentication data is passed to order creation
    const { yoraaAPI } = await import('./yoraaAPI');
    const enhancedOptions = {
      ...options,
      // Try to get authentication data if not provided
      userId: options.userId || (await getAuthenticatedUserId()),
      userToken: options.userToken || yoraaAPI.getUserToken()
    };
    
    console.log('🔑 Enhanced options with auth:', {
      hasUserId: !!enhancedOptions.userId,
      hasUserToken: !!enhancedOptions.userToken
    });
    
    // Step 1: Create order with authentication data
    console.log('1️⃣ Creating order with authentication...');
    let orderResponse;
    try {
      orderResponse = await orderService.createOrder(cart, address, enhancedOptions);
    } catch (orderError) {
      console.error('❌ Order creation failed:', orderError.message);
      
      // Show user-friendly error message
      if (orderError.message.includes('Invalid item IDs') || 
          orderError.message.includes('no longer available')) {
        throw new Error('⚠️ Some products in your cart are no longer available. This is a backend issue - please contact support.');
      } else if (orderError.message.includes('Cart validation failed')) {
        throw new Error('⚠️ There is an issue with your cart. Please refresh and try again.');
      } else {
        throw new Error(`⚠️ Order creation failed: ${orderError.message}`);
      }
    }
    
    // Step 2: Check for amount differences
    if (orderResponse.order_details && orderResponse.order_details.amount_difference > 0) {
      console.log('⚠️ Amount difference detected:', orderResponse.order_details.amount_difference);
      
      const userConfirmed = await orderService.showAmountDifferenceDialog(
        orderResponse.order_details.frontend_amount,
        orderResponse.order_details.final_amount,
        orderResponse.validation_messages || []
      );
      
      if (!userConfirmed) {
        console.log('🚫 User declined amount difference');
        
        // Optionally cancel the order
        if (orderResponse.database_order_id) {
          await orderService.handlePaymentCancellation(orderResponse.database_order_id);
        }
        
        throw new Error('Order cancelled by user due to amount difference');
      }
    }
    
    // Step 3: Initialize payment
    console.log('2️⃣ Initializing payment...');
    
    return new Promise((resolve, reject) => {
      initiatePayment(
        orderResponse,
        address,
        // Success callback
        (paymentResult) => {
          console.log('✅ Complete order flow successful:', paymentResult);
          resolve({
            success: true,
            orderId: paymentResult.orderId,
            order: paymentResult.order,
            paymentId: paymentResult.paymentId,
            orderResponse: orderResponse,
            message: paymentResult.message
          });
        },
        // Error callback
        (error) => {
          console.error('❌ Complete order flow failed:', error);
          reject(error);
        }
      );
    });
    
  } catch (error) {
    console.error('❌ Complete order flow error:', error);
    throw error;
  }
};

/**
 * Test Payment Flow
 * Helper function for testing payment integration
 */
export const testPaymentFlow = async () => {
  console.log('🧪 Testing payment flow...');
  
  const testCart = [
    {
      id: "68da56fc0561b958f6694e35",
      name: "Test Product",
      quantity: 1,
      price: 2, // Test with ₹2 as mentioned in backend guide
      size: "MEDIUM",
      sku: "TEST001-MEDIUM-12345-0"
    }
  ];
  
  const testAddress = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+919876543210",
    addressLine1: "123 Test Street",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India"
  };
  
  try {
    const result = await processCompleteOrder(testCart, testAddress);
    console.log('✅ Test payment flow successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Test payment flow failed:', error);
    throw error;
  }
};

/**
 * Get Payment Status
 * Helper function to check payment status
 */
export const getPaymentStatus = (paymentId) => {
  // This would typically make an API call to check payment status
  // For now, return a placeholder
  console.log('🔍 Checking payment status for:', paymentId);
  
  // Implementation depends on backend API availability
  return {
    paymentId,
    status: 'unknown',
    message: 'Payment status check not implemented'
  };
};

export default {
  initiatePayment,
  processCompleteOrder,
  testPaymentFlow,
  getPaymentStatus,
  RAZORPAY_CONFIG
};
