/**
 * Order Flow Test Script
 * Tests the complete order creation flow with backend
 * 
 * Usage: Import and call testOrderFlow() from your app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = 'http://185.193.19.244:8000/api';

/**
 * Step 1: Generate OTP
 */
export const testGenerateOTP = async (phoneNumber = '7006114695') => {
  console.log('🧪 TEST STEP 1: Generate OTP');
  console.log('Phone:', phoneNumber);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/generate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();
    console.log('📱 Response:', data);
    
    if (data.success) {
      console.log('✅ OTP Generated:', data.data.otp);
      return { success: true, otp: data.data.otp, phoneNumber };
    } else {
      console.error('❌ OTP Generation Failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Request Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Step 2: Verify OTP and Get Token
 */
export const testVerifyOTP = async (phoneNumber, otp) => {
  console.log('🧪 TEST STEP 2: Verify OTP');
  console.log('Phone:', phoneNumber, 'OTP:', otp);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verifyOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    });

    const data = await response.json();
    console.log('🔐 Response:', data);
    
    if (data.success && data.data.token) {
      const token = data.data.token;
      const user = data.data.user;
      
      // Store token
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('authToken', token); // Store in both keys
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      console.log('✅ OTP Verified, Token Stored');
      console.log('User:', user);
      console.log('Token:', token.substring(0, 50) + '...');
      
      return { success: true, token, user };
    } else {
      console.error('❌ OTP Verification Failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Request Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Step 3: Create Razorpay Order
 */
export const testCreateOrder = async (token) => {
  console.log('🧪 TEST STEP 3: Create Razorpay Order');
  
  const orderData = {
    amount: 1142,
    cart: [
      {
        itemId: '68da56fc0561b958f6694e39', // Test product ID
        name: 'Test Product',
        quantity: 1,
        price: 1142,
        size: 'M'
      }
    ],
    staticAddress: {
      firstName: 'Rithik',
      lastName: 'Mahajan',
      email: 'rithik@yoraa.in',
      phoneNumber: '7006114695',
      address: '123 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001'
    },
    deliveryOption: 'standard'
  };
  
  console.log('📦 Order Data:', orderData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log('🛒 Response:', data);
    
    if (data.id) {
      console.log('✅ Order Created');
      console.log('Razorpay Order ID:', data.id);
      console.log('Database Order ID:', data.database_order_id);
      console.log('Amount (paise):', data.amount_paise);
      
      return { success: true, order: data, originalOrderData: orderData };
    } else {
      console.error('❌ Order Creation Failed:', data.error || data.message);
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    console.error('❌ Request Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Step 4: Process Payment (Mock - requires actual Razorpay SDK)
 */
export const testProcessPayment = async (orderData) => {
  console.log('🧪 TEST STEP 4: Process Payment (Razorpay)');
  console.log('⚠️ This requires React Native environment with Razorpay SDK');
  
  const options = {
    description: 'Test Order Payment',
    currency: orderData.currency,
    key: 'rzp_live_VRU7ggfYLI7DWV',
    amount: orderData.amount_paise,
    name: 'Yoraa Apparels',
    order_id: orderData.id,
    prefill: {
      email: orderData.customer_details.email,
      contact: orderData.customer_details.contact,
      name: orderData.customer_details.name,
    },
    theme: { color: '#F37254' },
  };
  
  console.log('💳 Razorpay Options:', options);
  
  try {
    const data = await RazorpayCheckout.open(options);
    console.log('✅ Payment Successful:', data);
    return { success: true, paymentData: data };
  } catch (error) {
    console.error('❌ Payment Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Step 5: Verify Payment and Create Shiprocket Order
 */
export const testVerifyPayment = async (token, paymentData, orderData, originalOrderData) => {
  console.log('🧪 TEST STEP 5: Verify Payment');
  
  // ✅ Use CORRECTED payload structure as per backend docs
  const verificationPayload = {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    orderDetails: {
      items: originalOrderData.cart.map(item => ({
        productId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      })),
      shippingAddress: {
        name: `${originalOrderData.staticAddress.firstName} ${originalOrderData.staticAddress.lastName}`,
        phone: originalOrderData.staticAddress.phoneNumber,
        email: originalOrderData.staticAddress.email,
        addressLine1: originalOrderData.staticAddress.address,
        addressLine2: originalOrderData.staticAddress.apartment || '',
        city: originalOrderData.staticAddress.city,
        state: originalOrderData.staticAddress.state,
        pincode: originalOrderData.staticAddress.pinCode,
        country: 'India'
      },
      totalAmount: originalOrderData.amount
    }
  };
  
  console.log('🔐 Verification Payload:', verificationPayload);
  
  try {
    const response = await fetch(`${API_BASE_URL}/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(verificationPayload),
    });

    const data = await response.json();
    console.log('✅ Response:', data);
    
    if (data.success) {
      console.log('✅ Payment Verified Successfully');
      console.log('Order ID:', data.orderId || data.order_id);
      console.log('Shiprocket Order ID:', data.shiprocketOrderId);
      console.log('AWB Code (Tracking):', data.awb_code);
      console.log('Courier:', data.courier_name);
      
      return { success: true, result: data };
    } else {
      console.error('❌ Payment Verification Failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Request Failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete Order Flow Test
 * Runs all steps in sequence
 */
export const testCompleteOrderFlow = async () => {
  console.log('🧪 TESTING COMPLETE ORDER FLOW');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Generate OTP
    const otpResult = await testGenerateOTP('7006114695');
    if (!otpResult.success) {
      console.error('❌ Test Failed at Step 1');
      return;
    }
    
    // Step 2: Verify OTP
    const verifyResult = await testVerifyOTP(otpResult.phoneNumber, otpResult.otp);
    if (!verifyResult.success) {
      console.error('❌ Test Failed at Step 2');
      return;
    }
    
    // Step 3: Create Order
    const orderResult = await testCreateOrder(verifyResult.token);
    if (!orderResult.success) {
      console.error('❌ Test Failed at Step 3');
      return;
    }
    
    // Step 4: Process Payment (requires React Native environment)
    console.log('⚠️ Step 4 (Payment) requires React Native environment');
    console.log('💡 Manually test payment using Razorpay SDK in app');
    
    // Step 5: Verify Payment (manual - needs payment data from Step 4)
    console.log('⚠️ Step 5 (Verification) requires payment data from Step 4');
    console.log('💡 Use testVerifyPayment() with actual payment response');
    
    console.log('='.repeat(50));
    console.log('✅ Test Completed (Steps 1-3)');
    console.log('📋 Next: Test payment flow in React Native app');
    
  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
};

/**
 * Quick Test (Steps 1-3 only)
 */
export const quickTest = async () => {
  console.log('🚀 Quick Test - OTP to Order Creation');
  await testCompleteOrderFlow();
};

export default {
  testGenerateOTP,
  testVerifyOTP,
  testCreateOrder,
  testProcessPayment,
  testVerifyPayment,
  testCompleteOrderFlow,
  quickTest
};
