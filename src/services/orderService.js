/**
 * Order Service - Frontend Order Creation Implementation
 * Following Backend Team's Comprehensive Guide (October 5, 2025)
 * 
 * 🛡️ SECURITY-FIRST APPROACH:
 * - Frontend prices are IGNORED for final calculations
 * - Backend fetches all prices from database  
 * - Sale prices automatically selected over regular prices
 * - Frontend amount is validated but backend amount always wins
 * - 100% secure pricing - no client-side manipulation possible
 */

import apiService from './apiService';
import yoraaAPI from './yoraaAPI';
import { Alert } from 'react-native';

/**
 * Calculate Frontend Amount (Display Only)
 * Backend will recalculate everything using database prices
 */
export const calculateFrontendAmount = (cart) => {
  console.log('💰 Calculating frontend amount (display only):', cart);
  
  let subtotal = 0;
  let itemCount = 0;
  
  if (!cart || cart.length === 0) {
    return {
      subtotal: 0,
      shippingCharges: 0,
      taxAmount: 0,
      total: 0,
      itemCount: 0
    };
  }
  
  cart.forEach(item => {
    // ✅ FIX: Ensure price is parsed correctly and not zero
    let itemPrice = parseFloat(item.price) || parseFloat(item.selectedPrice) || 0;
    
    // ✅ FIX: If price is still 0, try other price fields
    if (itemPrice === 0) {
      itemPrice = parseFloat(item.salePrice) || parseFloat(item.regularPrice) || parseFloat(item.unitPrice) || 0;
    }
    
    const itemQuantity = parseInt(item.quantity, 10) || 0;
    const itemTotal = itemPrice * itemQuantity;
    
    console.log(`📊 Item calculation: ${item.name} - Price: ₹${itemPrice} × ${itemQuantity} = ₹${itemTotal}`);
    
    subtotal += itemTotal;
    itemCount += itemQuantity;
  });
  
  // ✅ FIX: Correct shipping logic - free shipping for all orders during testing
  // For production, use: const shippingCharges = subtotal >= 500 ? 0 : 50;
  const shippingCharges = 0; // ✅ TEMP FIX: Free shipping for testing
  
  const taxAmount = 0; // Currently not implemented
  const total = subtotal + shippingCharges + taxAmount;
  
  console.log('💰 Frontend calculation result:', {
    subtotal,
    shippingCharges,
    taxAmount,
    total,
    itemCount
  });
  
  return {
    subtotal,
    shippingCharges,
    taxAmount,
    total,
    itemCount
  };
};

/**
 * Validate Cart Data
 * Ensures cart items have all required fields as per backend specification
 */
export const validateCart = (cart) => {
  console.log('🔍 Validating cart:', cart);
  
  if (!cart || cart.length === 0) {
    Alert.alert('Empty Cart', 'Your cart is empty. Please add items before proceeding.');
    return false;
  }
  
  for (const item of cart) {
    // Required fields - check for both possible field names
    const itemId = item.id || item._id || item.itemId || item.productId;
    const itemName = item.name || item.productName || item.title;
    const hasQuantity = item.quantity !== undefined && item.quantity !== null && item.quantity > 0;
    
    // Log detailed validation info
    console.log('🔍 Validating item:', {
      itemId: itemId,
      itemName: itemName,
      quantity: item.quantity,
      hasId: !!itemId,
      hasName: !!itemName,
      hasQuantity: hasQuantity
    });
    
    if (!itemId || !itemName) {
      Alert.alert(
        'Invalid Cart Item', 
        `Invalid cart item: ${itemName || 'Unknown'}. Missing required fields.`
      );
      console.error('❌ Cart validation failed for item:', item);
      console.error('Missing fields:', {
        hasId: !!itemId,
        hasName: !!itemName, 
        hasQuantity: hasQuantity,
        sku: item.sku || 'missing'
      });
      return false;
    }
    
    if (!hasQuantity) {
      Alert.alert(
        'Invalid Quantity', 
        `Invalid quantity for ${itemName}. Quantity must be greater than 0.`
      );
      console.error('❌ Invalid quantity for item:', itemName, 'quantity:', item.quantity);
      return false;
    }
    
    // Check if required fields are not empty strings (only for existing fields)
    if (itemId && !itemId.toString().trim()) {
      Alert.alert(
        'Invalid Cart Item', 
        `Invalid cart item: ${itemName || 'Unknown'}. Item ID cannot be empty.`
      );
      return false;
    }
    
    if (itemName && !itemName.trim()) {
      Alert.alert(
        'Invalid Cart Item', 
        `Invalid cart item. Item name cannot be empty.`
      );
      return false;
    }
    
    // SKU is optional - don't fail validation if missing
    // The backend team mentioned they will handle SKU generation
  }
  
  console.log('✅ Cart validation passed');
  return true;
};

/**
 * Validate Address Data
 * Ensures address has all required fields for backend API
 */
export const validateAddress = (address) => {
  console.log('🔍 Validating address:', address);
  
  if (!address) {
    Alert.alert('Address Required', 'Please provide a delivery address.');
    return false;
  }
  
  const required = [
    'firstName', 'lastName', 'email', 'phone', 
    'addressLine1', 'city', 'state', 'zipCode', 'country'
  ];
  
  for (const field of required) {
    if (!address[field] || address[field].toString().trim() === '') {
      Alert.alert(
        'Address Required', 
        `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`
      );
      console.error(`❌ Address validation failed: ${field} is missing or empty`);
      return false;
    }
    
    // Validate minimum length for address fields
    const fieldValue = address[field].toString().trim();
    if (field === 'addressLine1' && fieldValue.length < 3) {
      Alert.alert('Invalid Address', 'Address line 1 must be at least 3 characters long.');
      console.error(`❌ Address validation failed: ${field} is too short`);
      return false;
    }
    
    if ((field === 'city' || field === 'state') && fieldValue.length < 2) {
      Alert.alert('Invalid Address', `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least 2 characters long.`);
      console.error(`❌ Address validation failed: ${field} is too short`);
      return false;
    }
    
    if ((field === 'firstName' || field === 'lastName') && fieldValue.length < 1) {
      Alert.alert('Invalid Name', `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} cannot be empty.`);
      console.error(`❌ Address validation failed: ${field} is too short`);
      return false;
    }
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(address.email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return false;
  }
  
  // Phone validation (basic)
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  if (!phoneRegex.test(address.phone)) {
    Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
    return false;
  }
  
  // Zipcode validation
  if (address.zipCode && address.zipCode.toString().length < 5) {
    Alert.alert('Invalid Zipcode', 'Please enter a valid zipcode (at least 5 digits).');
    return false;
  }
  
  console.log('✅ Address validation passed');
  return true;
};

/**
 * Validate Product IDs exist in the backend
 * Checks if all cart item product IDs are valid before creating order
 */
export const validateProductIds = async (cartItems) => {
  console.log('🔍 Validating product IDs with backend...');
  
  try {
    // Check for various possible ID field names
    const productIds = cartItems.map(item => 
      item.id || item.itemId || item.productId || item._id
    ).filter(Boolean);
    
    console.log('🔍 Extracted product IDs:', productIds);
    console.log('🔍 From cart items:', cartItems.map(item => ({
      id: item.id,
      itemId: item.itemId,
      productId: item.productId,
      _id: item._id
    })));
    
    if (productIds.length === 0) {
      console.error('❌ No valid product IDs found in cart');
      console.error('❌ Cart items structure:', JSON.stringify(cartItems, null, 2));
      return { valid: false, invalidIds: [], message: 'No valid products in cart' };
    }
    
    console.log('📋 Product IDs to validate:', productIds);
    
    // Skip validation in development if products are mock/test data
    if (__DEV__) {
      console.log('⚠️ Running in development mode - skipping strict product validation');
      console.log('💡 Backend will validate product IDs during order creation');
      return { valid: true, invalidIds: [], message: 'Validation deferred to backend' };
    }
    
    // Try to fetch each product to verify it exists
    const invalidIds = [];
    for (const productId of productIds) {
      try {
        // Attempt to get product details from backend
        const response = await yoraaAPI.makeRequest(`/api/products/${productId}`, 'GET', null, false);
        if (!response || response.error) {
          console.warn(`⚠️ Product ID ${productId} not found or invalid`);
          invalidIds.push(productId);
        } else {
          console.log(`✅ Product ID ${productId} validated successfully`);
        }
      } catch (error) {
        console.warn(`⚠️ Product ID ${productId} validation failed:`, error.message);
        invalidIds.push(productId);
      }
    }
    
    if (invalidIds.length > 0) {
      console.error('❌ Invalid product IDs found:', invalidIds);
      return { 
        valid: false, 
        invalidIds, 
        message: `Some products in your cart are no longer available. Please remove them and try again.` 
      };
    }
    
    console.log('✅ All product IDs are valid');
    return { valid: true, invalidIds: [], message: 'All products validated' };
    
  } catch (error) {
    console.error('❌ Error validating product IDs:', error);
    // If validation fails, we'll let the backend handle it
    return { valid: true, invalidIds: [], message: 'Validation skipped due to error' };
  }
};

/**
 * Format Cart Items for Backend API
 * Ensures cart items match exact structure expected by backend
 */
export const formatCartItemsForAPI = (cartItems) => {
  console.log('🔄 Formatting cart items for API:', cartItems);
  
  const formattedItems = cartItems.map(item => {
    // ✅ FIX: Ensure price is correctly extracted and formatted
    let itemPrice = parseFloat(item.price);
    
    // ✅ FIX: If price is 0 or NaN, try alternative price fields
    if (!itemPrice || itemPrice === 0) {
      itemPrice = parseFloat(item.selectedPrice) || 
                  parseFloat(item.salePrice) || 
                  parseFloat(item.regularPrice) || 
                  parseFloat(item.unitPrice) || 
                  0;
    }
    
    console.log(`💰 Item price resolution for ${item.name}: original=${item.price}, resolved=${itemPrice}`);
    
    // Extract required fields as per backend specification
    const formattedItem = {
      id: item.id || item.productId || item._id,           // Product MongoDB ObjectId
      name: item.name || item.productName,                 // Product name for display
      quantity: parseInt(item.quantity, 10) || 1,          // Must be > 0
      price: itemPrice,                                     // ✅ FIX: Use resolved price, not original
      size: item.size || item.selectedSize || 'ONE_SIZE',  // Product size/variant
      sku: item.sku || item.productSku,                    // Stock Keeping Unit
      image: item.image || item.imageUrl,                  // Optional - for display
      description: item.description                         // Optional - for display
    };
    
    // Validation: Ensure price is not zero for paid products
    if (formattedItem.price === 0) {
      console.warn(`⚠️ Warning: Item ${formattedItem.name} has zero price. This may cause payment issues.`);
    }
    
    // Log product ID for debugging
    console.log(`🔍 Product ID for ${formattedItem.name}: ${formattedItem.id}`);
    
    console.log(`✅ Formatted item:`, {
      id: formattedItem.id,
      name: formattedItem.name,
      price: formattedItem.price,
      quantity: formattedItem.quantity,
      total: formattedItem.price * formattedItem.quantity
    });
    
    // Ensure all required fields are present (SKU is optional)
    if (!formattedItem.id || !formattedItem.name) {
      console.error('❌ Missing required fields in cart item:', item);
      throw new Error(`Invalid cart item: ${item.name || 'Unknown'}`);
    }
    
    // Generate SKU if missing
    if (!formattedItem.sku) {
      formattedItem.sku = `SKU-${formattedItem.id}-${Date.now()}`;
      console.log(`⚠️ Generated SKU for item ${formattedItem.name}: ${formattedItem.sku}`);
    }
    
    return formattedItem;
  });
  
  console.log('✅ Cart items formatted for API:', formattedItems);
  return formattedItems;
};

/**
 * Format Address for Backend API
 * Ensures address matches the exact structure expected by backend
 */
export const formatAddressForAPI = (addressData) => {
  console.log('🔄 Formatting address for API:', addressData);
  
  const formattedAddress = {
    // Personal Info (Required)
    firstName: addressData.firstName || addressData.name?.split(' ')[0] || '',
    lastName: addressData.lastName || addressData.name?.split(' ').slice(1).join(' ') || '',
    email: addressData.email,
    
    // Backend expects these specific field names
    phoneNumber: addressData.phone || addressData.phoneNumber, // Backend expects 'phoneNumber'
    address: addressData.addressLine1 || addressData.address,  // Backend expects 'address'
    pinCode: addressData.zipCode || addressData.pinCode,       // Backend expects 'pinCode'
    
    // Additional address fields
    addressLine2: addressData.addressLine2 || '', // Optional
    city: addressData.city,
    state: addressData.state,
    country: addressData.country || 'India',
    
    // Address Type (Optional)
    addressType: addressData.addressType || 'HOME',
    landmark: addressData.landmark || '' // Optional
  };
  
  console.log('✅ Address formatted for API:', formattedAddress);
  return formattedAddress;
};

/**
 * Create Order via Backend API
 * Main order creation function following backend specifications
 */
export const createOrder = async (cart, address, additionalOptions = {}) => {
  console.log('📦 Creating order with cart:', cart);
  console.log('📍 Using address:', address);
  
  try {
    // 1️⃣ Validate cart and address
    if (!validateCart(cart)) {
      throw new Error('Cart validation failed');
    }
    
    if (!validateAddress(address)) {
      throw new Error('Address validation failed');
    }
    
    // 1.5️⃣ Validate product IDs exist in backend
    console.log('🔍 Validating product IDs before order creation...');
    const validationResult = await validateProductIds(cart);
    if (!validationResult.valid) {
      console.error('❌ Product validation failed:', validationResult.invalidIds);
      throw new Error(validationResult.message);
    }
    console.log('✅ Product IDs validated successfully');
    
    // 2️⃣ Format data for API
    const formattedCart = formatCartItemsForAPI(cart);
    const formattedAddress = formatAddressForAPI(address);
    
    // 3️⃣ Calculate frontend amount (for validation only)
    const frontendCalculation = calculateFrontendAmount(cart);
    
    // ✅ FIX: Get current user authentication data
    let userId = additionalOptions.userId;
    let userToken = additionalOptions.userToken;
    
    // If not provided in options, try to get from current authentication state
    if (!userId || !userToken) {
      try {
        // Get current authenticated user data
        const currentUser = await yoraaAPI.getUserData();
        const isAuthenticated = yoraaAPI.isAuthenticated();
        const currentToken = yoraaAPI.getUserToken();
        
        console.log('🔍 Authentication check:', {
          isAuthenticated,
          hasToken: !!currentToken,
          hasUserData: !!currentUser,
          userId: currentUser?.id || currentUser?.uid
        });
        
        if (isAuthenticated && currentToken) {
          userId = currentUser?.id || currentUser?.uid || userId;
          userToken = currentToken;
          
          console.log('✅ Retrieved authentication data:', {
            userId: userId,
            hasToken: !!userToken
          });
        } else {
          console.warn('⚠️ User not authenticated - proceeding as guest order');
        }
      } catch (authError) {
        console.error('❌ Error retrieving authentication data:', authError);
        console.warn('⚠️ Proceeding without authentication data');
      }
    }
    
    // 4️⃣ Prepare request body as per backend specification with corrected authentication data
    const requestBody = {
      // Amount - Backend will recalculate this
      amount: frontendCalculation.total, // Used for validation only
      
      // Cart Data
      cart: formattedCart, // Array of cart items
      
      // Address Data  
      staticAddress: formattedAddress, // Complete address object
      
      // Additional Info (Optional)
      orderNotes: additionalOptions.orderNotes || '', // Optional
      paymentMethod: additionalOptions.paymentMethod || 'razorpay', // Optional - Default: razorpay
      
      // ✅ FIX: Include authentication data if available
      userId: userId || null, // Optional - Firebase UID
      userToken: userToken || null // Optional - For auth
    };
    
    console.log('📋 Sending order creation request:', JSON.stringify(requestBody, null, 2));
    console.log('� Sending order creation request with authentication:', {
      hasUserId: !!requestBody.userId,
      hasUserToken: !!requestBody.userToken,
      userId: requestBody.userId,
      tokenLength: requestBody.userToken ? requestBody.userToken.length : 0
    });
    
    console.log('�🔍 Request validation details:', {
      hasAmount: !!requestBody.amount,
      hasCart: !!requestBody.cart,
      hasStaticAddress: !!requestBody.staticAddress,
      amountValue: requestBody.amount,
      cartLength: requestBody.cart?.length || 0,
      addressFields: requestBody.staticAddress ? Object.keys(requestBody.staticAddress) : [],
      cartItems: requestBody.cart?.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price, // ✅ Include price in validation
        sku: item.sku,
        hasRequiredFields: !!(item.id && item.name && item.quantity)
      })),
      addressDetails: requestBody.staticAddress ? {
        firstName: requestBody.staticAddress.firstName,
        lastName: requestBody.staticAddress.lastName,
        email: requestBody.staticAddress.email,
        phone: requestBody.staticAddress.phone,
        addressLine1: requestBody.staticAddress.addressLine1,
        city: requestBody.staticAddress.city,
        state: requestBody.staticAddress.state,
        zipCode: requestBody.staticAddress.zipCode,
        country: requestBody.staticAddress.country
      } : null
    });
    
    // 5️⃣ Make API call
    let response;
    try {
      // Primary API call
      response = await apiService.post('/razorpay/create-order', requestBody);
      console.log('✅ Order created via apiService:', response);
    } catch (apiServiceError) {
      console.warn('apiService failed, trying yoraaAPI as fallback:', apiServiceError.message);
      
      // Check if this is the "Invalid item IDs" backend error
      if (apiServiceError.message && apiServiceError.message.includes('Invalid item IDs')) {
        console.error('🚨 BACKEND ISSUE: Invalid item IDs error - ObjectId conversion not deployed!');
        console.error('📋 Product IDs that failed:', formattedCart.map(item => item.id));
        throw new Error('Backend validation failed: Invalid item IDs. The backend team needs to deploy the ObjectId conversion fix.');
      }
      
      // Try fallback API call
      response = await yoraaAPI.makeRequest('/api/razorpay/create-order', 'POST', requestBody, true);
      console.log('✅ Order created via yoraaAPI fallback:', response);
    }
    
    // 6️⃣ Validate response
    if (!response || !response.id) {
      console.error('❌ Invalid response from backend:', response);
      throw new Error(`Failed to create order. Invalid response from server.`);
    }
    
    console.log('✅ Order created successfully:', response.id);
    console.log('🔍 Order details:', response.order_details);
    console.log('🛒 Cart calculation:', response.cart_calculation);
    
    return response;
    
  } catch (error) {
    console.error('❌ Order creation failed:', error);
    
    // Enhanced error handling
    let errorMessage = 'Failed to create order. Please try again.';
    
    if (error.message) {
      if (error.message.includes('Cart validation failed')) {
        errorMessage = 'There was an issue with your cart items. Please check and try again.';
      } else if (error.message.includes('Address validation failed')) {
        errorMessage = 'Please fill all required address fields.';
      } else if (error.message.includes('Invalid item IDs') || error.message.includes('no longer available')) {
        errorMessage = 'Some products in your cart are no longer available. Please refresh your cart and try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid order data. Please check your cart and address.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication required. Please login and try again.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Show Amount Difference Dialog
 * Handles cases where backend calculates different amounts than frontend
 */
export const showAmountDifferenceDialog = (frontendAmount, backendAmount, messages = []) => {
  return new Promise((resolve) => {
    const difference = Math.abs(backendAmount - frontendAmount);
    
    const dialogMessage = `
Amount Recalculated:

Your calculation: ₹${frontendAmount.toFixed(2)}
Actual amount: ₹${backendAmount.toFixed(2)}
Difference: ₹${difference.toFixed(2)}

${messages.length > 0 ? 'Reasons:\n' + messages.join('\n') : ''}

Do you want to proceed with ₹${backendAmount.toFixed(2)}?`;
    
    Alert.alert(
      'Amount Updated',
      dialogMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false)
        },
        {
          text: 'Proceed',
          onPress: () => resolve(true)
        }
      ]
    );
  });
};

/**
 * Verify Payment
 * Handles payment verification after successful Razorpay payment
 * Now includes Shiprocket shipment creation
 */
export const verifyPayment = async (paymentData) => {
  console.log('🔐 Verifying payment:', paymentData);
  console.log('📦 Payment data includes:', {
    hasPaymentId: !!paymentData.razorpay_payment_id,
    hasOrderId: !!paymentData.razorpay_order_id,
    hasSignature: !!paymentData.razorpay_signature
  });
  
  try {
    let response;
    try {
      // Primary API call
      response = await apiService.post('/razorpay/verify-payment', paymentData);
      console.log('✅ Payment verification via apiService successful');
    } catch (apiServiceError) {
      console.warn('apiService verification failed, trying yoraaAPI:', apiServiceError.message);
      // Fallback API call
      response = await yoraaAPI.makeRequest('/api/razorpay/verify-payment', 'POST', paymentData, true);
      console.log('✅ Payment verification via yoraaAPI successful');
    }
    
    if (response && response.success) {
      console.log('✅ Payment verification successful:', {
        orderId: response.orderId || response.order_id,
        awbCode: response.awb_code,
        shipmentId: response.shipment_id,
        courierName: response.courier_name
      });
      
      // Return complete order and shipping details
      return {
        success: true,
        orderId: response.orderId || response.order_id,
        order: response.order,
        
        // Shipping Details from Shiprocket
        awb_code: response.awb_code,           // Tracking number
        shipment_id: response.shipment_id,     // Shiprocket shipment ID
        courier_name: response.courier_name,   // Courier company name
        
        message: response.awb_code 
          ? 'Payment verified and shipment created successfully' 
          : 'Payment verified successfully'
      };
    } else {
      console.error('❌ Payment verification failed:', response);
      return {
        success: false,
        message: response.message || 'Payment verification failed'
      };
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return {
      success: false,
      message: 'Payment verification failed due to network error',
      error: error.message
    };
  }
};

/**
 * Handle Payment Error
 * Centralized error handling for payment-related errors
 */
export const handlePaymentError = (errorMessage) => {
  console.error('💳 Payment error:', errorMessage);
  
  // Show user-friendly error message
  const userMessage = {
    'Payment verification failed': 'Payment could not be verified. Please try again.',
    'Order not found': 'Order details not found. Please contact support.',
    'Invalid signature': 'Payment security check failed. Please try again.',
    'Payment already processed': 'This payment has already been processed.',
    'Network request failed': 'Network error. Please check your connection and try again.',
    'timeout': 'Request timed out. Please try again.'
  }[errorMessage] || 'Payment failed. Please try again.';
  
  Alert.alert('Payment Error', userMessage);
};

/**
 * Handle Payment Cancellation
 * Handles cases where user cancels payment
 */
export const handlePaymentCancellation = async (databaseOrderId) => {
  console.log('🚫 Payment cancelled by user for order:', databaseOrderId);
  
  if (!databaseOrderId) {
    return;
  }
  
  try {
    // Optional: Mark order as cancelled
    await apiService.post('/orders/cancel', { orderId: databaseOrderId });
    console.log('✅ Order marked as cancelled');
  } catch (error) {
    console.error('❌ Failed to cancel order:', error);
    // Don't show error to user as this is optional cleanup
  }
};

/**
 * Debug Console Logs
 * Helper function for comprehensive logging during testing
 */
export const logOrderCreationDebug = (cart, address, frontendAmount) => {
  console.log('='.repeat(50));
  console.log('📦 ORDER CREATION DEBUG INFO');
  console.log('='.repeat(50));
  
  console.log('📦 Creating order with cart:', cart);
  console.log('📍 Using address:', address);
  console.log('💰 Frontend calculated amount:', frontendAmount);
  
  console.log('🔍 Cart validation details:');
  cart.forEach((item, index) => {
    console.log(`   Item ${index + 1}:`, {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      sku: item.sku,
      hasRequiredFields: !!(item.id && item.name && item.quantity && item.sku)
    });
  });
  
  console.log('🔍 Address validation details:', {
    hasFirstName: !!address.firstName,
    hasLastName: !!address.lastName,
    hasEmail: !!address.email,
    hasPhone: !!address.phone,
    hasAddressLine1: !!address.addressLine1,
    hasCity: !!address.city,
    hasState: !!address.state,
    hasZipCode: !!address.zipCode,
    hasCountry: !!address.country
  });
  
  console.log('='.repeat(50));
};

export default {
  calculateFrontendAmount,
  validateCart,
  validateAddress,
  validateProductIds,
  formatCartItemsForAPI,
  formatAddressForAPI,
  createOrder,
  showAmountDifferenceDialog,
  verifyPayment,
  handlePaymentError,
  handlePaymentCancellation,
  logOrderCreationDebug
};
