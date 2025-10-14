# Complete Checkout to Backend Order Initiation Flow - YORA App

## 📋 Overview

This document provides a **complete, detailed technical implementation** of how users checkout from the cart, how payments are processed and verified, how shipping orders are generated, and how shipping status is tracked in the YORA app.

---

## 🎯 Flow Summary

```
USER JOURNEY
============
1. User adds items to bag (cart)
2. User clicks "Proceed to Checkout"
3. System validates authentication & address
4. System creates order in backend (Razorpay Order ID)
5. User completes payment via Razorpay UI
6. Backend verifies payment signature
7. Backend creates database order record
8. Backend creates Shiprocket shipment
9. System clears user's cart
10. User sees order confirmation with tracking
```

---

## 📁 File Structure

```
src/
├── screens/
│   ├── bag.js                          # Main cart/checkout screen
│   └── orderconfirmationphone.js      # Order confirmation screen
├── services/
│   ├── paymentService.js               # Razorpay payment integration
│   ├── orderService.js                 # Order creation & validation
│   └── yoraaAPI.js                     # API client & authentication
└── constants/
    └── config.js                       # API base URL configuration
```

---

## 🔄 PART 1: Cart Checkout Initiation

### File: `src/screens/bag.js`

#### Step 1: User Clicks "Proceed to Checkout"

When the user clicks the checkout button, the `handleCheckout` function is triggered.

```javascript
const handleCheckout = useCallback(async () => {
  console.log('🔍 handleCheckout (ENHANCED) - dynamicPricing:', dynamicPricing);
  
  // ============================================
  // STEP 1: VALIDATE CART HAS ITEMS
  // ============================================
  if (!dynamicPricing.isValid) {
    Alert.alert('Empty Bag', 'Please add items to your bag before checking out.');
    return;
  }

  // ============================================
  // STEP 1.5: VALIDATE CART ITEMS EXIST IN BACKEND
  // ============================================
  console.log('🔍 Validating cart items before checkout...');
  try {
    const isCartValid = await validateAndCleanCart();
    
    if (!isCartValid) {
      Alert.alert(
        'Cart Updated',
        'Some items in your cart were no longer available and have been removed.',
        [{ text: 'Review Cart', style: 'default' }]
      );
      return;
    }
    console.log('✅ Cart validation passed');
  } catch (validationError) {
    console.error('❌ Error validating cart:', validationError);
    Alert.alert(
      'Validation Error',
      'Unable to validate your cart. Please try again.',
      [{ text: 'OK' }]
    );
    return;
  }
  
  // ============================================
  // STEP 1.6: DEBUG PRODUCT EXISTENCE
  // ============================================
  console.log('🔍 CHECKOUT DEBUG - Verifying all products exist in backend...');
  for (const item of bagItems) {
    const productId = item.id || item._id;
    console.log(`🔍 Checking product ${productId} (${item.name})...`);
    try {
      const product = await yoraaAPI.makeRequest(`/api/products/${productId}`, 'GET', null, false);
      console.log(`✅ Product ${productId} exists in backend`);
    } catch (error) {
      console.error(`❌ Product ${productId} NOT FOUND in backend:`, error);
    }
  }

  // ============================================
  // STEP 2: CHECK AUTHENTICATION STATUS
  // ============================================
  const isAuthenticated = yoraaAPI.isAuthenticated();
  console.log('🔍 handleCheckout - isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    // User is not authenticated, navigate to login
    console.log('🔒 User not authenticated, navigating to RewardsScreen for login');
    navigation.navigate('RewardsScreen', { 
      fromCheckout: true,
      bagData: {
        items: bagItems,
        pricing: dynamicPricing,
        calculations: bagCalculations
      }
    });
    return;
  }

  // ============================================
  // STEP 3: CHECK IF USER HAS SELECTED AN ADDRESS
  // ============================================
  if (!selectedAddress) {
    console.log('📍 No address selected, navigating to delivery address selection');
    Alert.alert(
      'Delivery Address Required',
      'Please select or add a delivery address to continue with payment.',
      [
        {
          text: 'Select Address',
          onPress: () => {
            navigation.navigate('deliveryaddress', {
              returnScreen: 'Bag',
              fromCheckout: true
            });
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
    return;
  }

  // ============================================
  // STEP 4: PROCESS PAYMENT
  // ============================================
  console.log('✅ User is authenticated with address, processing complete order');
  
  try {
    // ✅ FIX: Get authenticated user data BEFORE formatting address
    const userData = await yoraaAPI.getUserData();
    const userToken = yoraaAPI.getUserToken();
    const userId = userData?.id || userData?.uid || userData?._id;
    
    console.log('🔑 Authentication data retrieved:', {
      hasUserId: !!userId,
      hasUserToken: !!userToken,
      userId: userId,
      tokenLength: userToken ? userToken.length : 0
    });
    
    // ✅ FIX: Validate authentication before proceeding
    if (!userId || !userToken) {
      console.error('❌ Missing authentication data');
      Alert.alert(
        'Authentication Required',
        'Please login to complete your order.',
        [
          {
            text: 'Login',
            onPress: () => navigation.navigate('RewardsScreen', { fromCheckout: true })
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    // Format address for backend - ensure all required fields are present
    const formattedAddress = {
      firstName: selectedAddress.firstName || selectedAddress.name?.split(' ')[0] || userData?.firstName || 'Customer',
      lastName: selectedAddress.lastName || selectedAddress.name?.split(' ').slice(1).join(' ') || userData?.lastName || '',
      email: selectedAddress.email || userData?.email || 'customer@yoraa.com',
      phone: selectedAddress.phoneNumber || selectedAddress.phone || userData?.phoneNumber || '',
      addressLine1: selectedAddress.address || selectedAddress.addressLine1 || '',
      addressLine2: selectedAddress.addressLine2 || '',
      city: selectedAddress.city || '',
      state: selectedAddress.state || '',
      country: selectedAddress.country || 'India',
      zipCode: selectedAddress.pinCode || selectedAddress.zipCode || ''
    };
    
    console.log('📍 Formatted address for backend:', formattedAddress);
    
    // ============================================
    // CALL PAYMENT SERVICE TO PROCESS ORDER
    // ============================================
    const result = await paymentService.processCompleteOrder(
      bagItems,  // Pass original items, orderService will format them
      formattedAddress,
      {
        userId: userId,          // ✅ Ensure userId is passed
        userToken: userToken,    // ✅ Ensure token is passed
        orderNotes: '',
        paymentMethod: 'razorpay'
      }
    );
    
    console.log('✅ Payment completed successfully:', result);
    
    // ============================================
    // HANDLE SUCCESSFUL PAYMENT
    // ============================================
    if (result.success && result.order) {
      // Clear the bag
      clearBag();
      
      // Navigate to order confirmation screen
      navigation.navigate('orderconfirmationphone', {
        orderDetails: {
          orderId: result.order._id || result.orderId,
          paymentId: result.paymentId,
          amount: result.order.totalAmount || result.order.amount,
          currency: 'INR',
          deliveryAddress: result.order.deliveryAddress || selectedAddress,
          deliveryOption: result.order.deliveryOption || 'standard',
          items: result.order.items || result.order.orderItems || bagItems.map(item => ({
            id: item.id || item._id,
            name: item.productName || item.name,
            size: item.selectedSize?.size || item.size,
            color: item.selectedSize?.color || item.color,
            quantity: item.quantity || 1,
            price: item.selectedSize?.price || item.price,
            images: item.images || []
          })),
          timestamp: result.order.createdAt || new Date().toISOString(),
          awbCode: result.order.awbCode,
          shiprocketOrderId: result.order.shiprocketOrderId,
          status: result.order.status || 'confirmed',
          trackingUrl: result.order.tracking_url
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Payment error:', error);
    
    const errorMessage = error.message || 'Payment failed. Please try again.';
    
    Alert.alert(
      'Payment Failed',
      errorMessage,
      [
        {
          text: 'Try Again',
          onPress: () => handleCheckout()
        },
        {
          text: 'Continue Shopping',
          style: 'cancel'
        }
      ]
    );
  }
}, [dynamicPricing, bagCalculations, navigation, bagItems, validateAndCleanCart, selectedAddress, clearBag]);
```

### Data Structure Passed to Payment Service

```javascript
{
  // Cart Items (Original Format)
  bagItems: [
    {
      id: "64abc123...",                    // Product MongoDB ID
      _id: "64abc123...",                   // Alternative ID field
      name: "Cotton T-Shirt",
      productName: "Cotton T-Shirt",
      size: "M",
      color: "Red",
      quantity: 2,
      price: 250,                           // Price per unit
      images: ["https://..."],
      sku: "RED-M-12345-0"
    }
    // ... more items
  ],
  
  // Formatted Address
  formattedAddress: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+919876543210",
    addressLine1: "123 Main Street, Apt 4B",
    addressLine2: "",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    zipCode: "400001"
  },
  
  // Authentication Options
  options: {
    userId: "firebase_uid_123",           // Firebase UID
    userToken: "jwt_token_string...",     // JWT authentication token
    orderNotes: "",                       // Optional notes
    paymentMethod: "razorpay"             // Payment method
  }
}
```

---

## 🔄 PART 2: Payment Service - Order Creation

### File: `src/services/paymentService.js`

#### Main Function: `processCompleteOrder`

This function orchestrates the entire order creation and payment flow.

```javascript
export const processCompleteOrder = async (cart, address, options = {}) => {
  console.log('🎯 Processing complete order flow...');
  console.log('📦 Cart:', cart);
  console.log('📍 Address:', address);
  
  try {
    // ============================================
    // STEP 1: ENSURE AUTHENTICATION DATA
    // ============================================
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
    
    // ============================================
    // STEP 2: CREATE ORDER IN BACKEND
    // ============================================
    console.log('1️⃣ Creating order with authentication...');
    let orderResponse;
    try {
      orderResponse = await orderService.createOrder(cart, address, enhancedOptions);
    } catch (orderError) {
      console.error('❌ Order creation failed:', orderError.message);
      
      // Show user-friendly error message
      if (orderError.message.includes('Invalid item IDs') || 
          orderError.message.includes('no longer available')) {
        throw new Error('⚠️ Some products in your cart are no longer available.');
      } else if (orderError.message.includes('Cart validation failed')) {
        throw new Error('⚠️ There is an issue with your cart. Please refresh and try again.');
      } else {
        throw new Error(`⚠️ Order creation failed: ${orderError.message}`);
      }
    }
    
    // ============================================
    // STEP 3: CHECK FOR AMOUNT DIFFERENCES
    // ============================================
    if (orderResponse.order_details && orderResponse.order_details.amount_difference > 0) {
      console.log('⚠️ Amount difference detected:', orderResponse.order_details.amount_difference);
      
      const userConfirmed = await orderService.showAmountDifferenceDialog(
        orderResponse.order_details.frontend_amount,
        orderResponse.order_details.final_amount,
        orderResponse.validation_messages || []
      );
      
      if (!userConfirmed) {
        console.log('🚫 User declined amount difference');
        
        // Cancel the order
        if (orderResponse.database_order_id) {
          await orderService.handlePaymentCancellation(orderResponse.database_order_id);
        }
        
        throw new Error('Order cancelled by user due to amount difference');
      }
    }
    
    // ============================================
    // STEP 4: INITIALIZE PAYMENT
    // ============================================
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
```

#### Helper Function: `getAuthenticatedUserId`

```javascript
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
```

---

## 🔄 PART 3: Order Service - Backend Order Creation

### File: `src/services/orderService.js`

#### Main Function: `createOrder`

This function creates the order in the backend by calling the Razorpay create-order endpoint.

```javascript
export const createOrder = async (cart, address, additionalOptions = {}) => {
  console.log('📦 Creating order with cart:', cart);
  console.log('📍 Using address:', address);
  
  try {
    // ============================================
    // STEP 1: VALIDATE CART AND ADDRESS
    // ============================================
    if (!validateCart(cart)) {
      throw new Error('Cart validation failed');
    }
    
    if (!validateAddress(address)) {
      throw new Error('Address validation failed');
    }
    
    // ============================================
    // STEP 1.5: VALIDATE PRODUCT IDs
    // ============================================
    console.log('🔍 Validating product IDs before order creation...');
    const validationResult = await validateProductIds(cart);
    if (!validationResult.valid) {
      console.error('❌ Product validation failed:', validationResult.invalidIds);
      throw new Error(validationResult.message);
    }
    console.log('✅ Product IDs validated successfully');
    
    // ============================================
    // STEP 2: FORMAT DATA FOR API
    // ============================================
    const formattedCart = formatCartItemsForAPI(cart);
    const formattedAddress = formatAddressForAPI(address);
    
    // ============================================
    // STEP 3: CALCULATE FRONTEND AMOUNT
    // ============================================
    const frontendCalculation = calculateFrontendAmount(cart);
    
    // ============================================
    // STEP 4: GET AUTHENTICATION DATA
    // ============================================
    let userId = additionalOptions.userId;
    let userToken = additionalOptions.userToken;
    
    // If not provided in options, try to get from current authentication state
    if (!userId || !userToken) {
      try {
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
    
    // ============================================
    // STEP 5: PREPARE REQUEST BODY
    // ============================================
    const requestBody = {
      // Amount - Backend will recalculate this
      amount: frontendCalculation.total,
      
      // Cart Data
      cart: formattedCart,
      
      // Address Data  
      staticAddress: formattedAddress,
      
      // Additional Info
      orderNotes: additionalOptions.orderNotes || '',
      paymentMethod: additionalOptions.paymentMethod || 'razorpay',
      
      // ✅ Authentication data
      userId: userId || null,
      userToken: userToken || null
    };
    
    console.log('📋 Sending order creation request:', JSON.stringify(requestBody, null, 2));
    console.log('🔑 Authentication in request:', {
      hasUserId: !!requestBody.userId,
      hasUserToken: !!requestBody.userToken,
      userId: requestBody.userId,
      tokenLength: requestBody.userToken ? requestBody.userToken.length : 0
    });
    
    // ============================================
    // STEP 6: MAKE API CALL TO BACKEND
    // ============================================
    let response;
    try {
      // Primary API call
      response = await apiService.post('/razorpay/create-order', requestBody);
      console.log('✅ Order created via apiService:', response);
    } catch (apiServiceError) {
      console.warn('apiService failed, trying yoraaAPI as fallback:', apiServiceError.message);
      
      // Check if this is the "Invalid item IDs" backend error
      if (apiServiceError.message && apiServiceError.message.includes('Invalid item IDs')) {
        console.error('🚨 BACKEND ISSUE: Invalid item IDs error');
        console.error('📋 Product IDs that failed:', formattedCart.map(item => item.id));
        throw new Error('Backend validation failed: Invalid item IDs. Please contact support.');
      }
      
      // Try fallback API call
      response = await yoraaAPI.makeRequest('/api/razorpay/create-order', 'POST', requestBody, true);
      console.log('✅ Order created via yoraaAPI fallback:', response);
    }
    
    // ============================================
    // STEP 7: VALIDATE RESPONSE
    // ============================================
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
        errorMessage = 'Some products in your cart are no longer available. Please refresh your cart.';
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
```

#### Helper Function: `formatCartItemsForAPI`

Converts cart items to the exact format expected by the backend.

```javascript
export const formatCartItemsForAPI = (cartItems) => {
  console.log('🔄 Formatting cart items for API:', cartItems);
  
  const formattedItems = cartItems.map(item => {
    // ✅ Extract price correctly
    let itemPrice = parseFloat(item.price);
    
    // ✅ If price is 0 or NaN, try alternative price fields
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
      price: itemPrice,                                     // Resolved price
      size: item.size || item.selectedSize || 'ONE_SIZE',  // Product size/variant
      sku: item.sku || item.productSku,                    // Stock Keeping Unit
      image: item.image || item.imageUrl,                  // Optional
      description: item.description                         // Optional
    };
    
    // Validation: Ensure price is not zero
    if (formattedItem.price === 0) {
      console.warn(`⚠️ Warning: Item ${formattedItem.name} has zero price.`);
    }
    
    console.log(`✅ Formatted item:`, {
      id: formattedItem.id,
      name: formattedItem.name,
      price: formattedItem.price,
      quantity: formattedItem.quantity,
      total: formattedItem.price * formattedItem.quantity
    });
    
    // Ensure all required fields are present
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
```

#### Helper Function: `formatAddressForAPI`

Converts address to the exact format expected by the backend.

```javascript
export const formatAddressForAPI = (addressData) => {
  console.log('🔄 Formatting address for API:', addressData);
  
  const formattedAddress = {
    // Personal Info (Required)
    firstName: addressData.firstName || addressData.name?.split(' ')[0] || '',
    lastName: addressData.lastName || addressData.name?.split(' ').slice(1).join(' ') || '',
    email: addressData.email,
    
    // Backend expects these specific field names
    phoneNumber: addressData.phone || addressData.phoneNumber,
    address: addressData.addressLine1 || addressData.address,
    pinCode: addressData.zipCode || addressData.pinCode,
    
    // Additional address fields
    addressLine2: addressData.addressLine2 || '',
    city: addressData.city,
    state: addressData.state,
    country: addressData.country || 'India',
    
    // Optional fields
    addressType: addressData.addressType || 'HOME',
    landmark: addressData.landmark || ''
  };
  
  console.log('✅ Address formatted for API:', formattedAddress);
  return formattedAddress;
};
```

---

## 🔄 PART 4: Backend API - Create Order Endpoint

### Endpoint: `POST /api/razorpay/create-order`

This is the backend endpoint that creates the Razorpay order and database order record.

#### Request Format

```javascript
POST /api/razorpay/create-order

Headers:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"  // Optional, can also be in body
}

Body:
{
  "amount": 500,              // Frontend calculated amount (for validation)
  "cart": [
    {
      "id": "64abc123...",    // Product MongoDB ObjectId
      "name": "Cotton T-Shirt",
      "quantity": 2,
      "price": 250,
      "size": "M",
      "sku": "RED-M-12345-0",
      "image": "https://...",
      "description": "Red cotton t-shirt"
    }
  ],
  "staticAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "address": "123 Main Street, Apt 4B",
    "addressLine2": "",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001",
    "country": "India",
    "addressType": "HOME",
    "landmark": "Near Central Mall"
  },
  "orderNotes": "",           // Optional
  "paymentMethod": "razorpay", // Optional
  "userId": "firebase_uid",   // Firebase UID
  "userToken": "jwt_token"    // JWT token
}
```

#### Backend Response Format

```javascript
{
  "success": true,
  "id": "order_xyz123",                    // Razorpay order ID
  "amount": 50000,                         // Amount in paise (₹500.00)
  "currency": "INR",
  "receipt": "receipt_1697275200000",
  "database_order_id": "64order123...",    // MongoDB order ID
  "order_details": {
    "frontend_amount": 500,
    "final_amount": 500,
    "amount_difference": 0,
    "shipping_charges": 0,
    "tax_amount": 0
  },
  "cart_calculation": {
    "items": [
      {
        "id": "64abc123...",
        "name": "Cotton T-Shirt",
        "quantity": 2,
        "price": 250,
        "subtotal": 500
      }
    ],
    "subtotal": 500,
    "shipping": 0,
    "tax": 0,
    "total": 500
  },
  "validation_messages": []
}
```

---

## 🔄 PART 5: Razorpay Payment Processing

### File: `src/services/paymentService.js`

#### Function: `initiatePayment`

Opens the Razorpay payment UI and handles the payment flow.

```javascript
export const initiatePayment = async (orderResponse, address, onSuccess, onError) => {
  console.log('💳 Initiating Razorpay payment with order:', orderResponse);
  console.log('📍 Using address for prefill:', address);
  
  try {
    // ============================================
    // STEP 1: VALIDATE REQUIRED PARAMETERS
    // ============================================
    if (!orderResponse || !orderResponse.id) {
      throw new Error('Invalid order response - missing order ID');
    }
    
    if (!orderResponse.amount || orderResponse.amount <= 0) {
      throw new Error(`Invalid amount: ${orderResponse.amount}`);
    }
    
    // ============================================
    // STEP 2: PREPARE RAZORPAY OPTIONS
    // ============================================
    const razorpayOptions = {
      key: RAZORPAY_CONFIG.key,                    // Razorpay API Key
      amount: orderResponse.amount,                // Amount in paise
      currency: orderResponse.currency || 'INR',
      name: RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image: RAZORPAY_CONFIG.image,
      order_id: orderResponse.id,                  // Razorpay order ID from backend
      
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
    
    // ============================================
    // STEP 3: VALIDATE RAZORPAY FIELDS
    // ============================================
    if (!razorpayOptions.key) {
      throw new Error('Razorpay key is missing');
    }
    if (!razorpayOptions.amount || razorpayOptions.amount <= 0) {
      throw new Error(`Invalid amount: ${razorpayOptions.amount}`);
    }
    if (!razorpayOptions.order_id) {
      throw new Error('Order ID is missing');
    }
    
    console.log('🚀 About to call RazorpayCheckout.open()...');
    
    // ============================================
    // STEP 4: OPEN RAZORPAY CHECKOUT UI
    // ============================================
    const paymentResponse = await RazorpayCheckout.open(razorpayOptions);
    
    console.log('✅ RazorpayCheckout.open() resolved successfully');
    console.log('✅ Payment successful:', paymentResponse);
    
    /* Payment Response Format:
     * {
     *   razorpay_payment_id: "pay_abc123",
     *   razorpay_order_id: "order_xyz123",
     *   razorpay_signature: "generated_hash"
     * }
     */
    
    // ============================================
    // STEP 5: HANDLE SUCCESSFUL PAYMENT
    // ============================================
    await handlePaymentSuccess(paymentResponse, orderResponse, onSuccess, onError);
    
  } catch (error) {
    console.error('❌ Razorpay payment error:', error);
    handlePaymentFailure(error, orderResponse, onError);
  }
};
```

#### Razorpay Configuration

```javascript
const RAZORPAY_CONFIG = {
  // ALWAYS USE LIVE KEY
  key: 'rzp_live_VRU7ggfYLI7DWV',
  
  // Company branding
  name: 'Yoraa Apparels',
  description: 'Yoraa Apparels Purchase',
  image: 'https://yoraa.com/logo.png',
  currency: 'INR',
  theme: {
    color: '#FF6B35' // Yoraa brand color
  }
};
```

---

## 🔄 PART 6: Payment Verification

### File: `src/services/paymentService.js`

#### Function: `handlePaymentSuccess`

Verifies the payment with the backend after Razorpay confirms payment.

```javascript
const handlePaymentSuccess = async (paymentResponse, orderResponse, onSuccess, onError) => {
  try {
    console.log('🔍 Verifying payment:', paymentResponse);
    
    // ============================================
    // STEP 1: PREPARE VERIFICATION DATA
    // ============================================
    const verificationData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      database_order_id: orderResponse.database_order_id
    };
    
    console.log('🔐 Sending payment verification data:', verificationData);
    
    // ============================================
    // STEP 2: VERIFY PAYMENT WITH BACKEND
    // ============================================
    const verificationResult = await orderService.verifyPayment(verificationData);
    
    if (verificationResult.success) {
      console.log('✅ Payment verification successful');
      
      // ============================================
      // STEP 3: CALL SUCCESS CALLBACK
      // ============================================
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
```

---

## 🔄 PART 7: Backend Payment Verification

### Endpoint: `POST /api/razorpay/verify-payment`

This backend endpoint verifies the payment signature and creates the final order record.

#### Request Format

```javascript
POST /api/razorpay/verify-payment

Headers:
{
  "Content-Type": "application/json"
}

Body:
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "generated_signature_hash",
  "database_order_id": "64order123..."  // Optional
}
```

#### Backend Processing Steps

```javascript
// STEP 1: VERIFY PAYMENT SIGNATURE
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  return res.status(400).json({
    success: false,
    message: 'Payment signature verification failed'
  });
}

// STEP 2: FETCH ORDER DETAILS FROM RAZORPAY
const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

// STEP 3: EXTRACT CART AND ADDRESS FROM ORDER NOTES
const cart = JSON.parse(razorpayOrder.notes.cart);
const address = JSON.parse(razorpayOrder.notes.address);
const userId = razorpayOrder.notes.userId;

// STEP 4: FETCH PRODUCT DETAILS
const enrichedItems = await Promise.all(
  cart.map(async (cartItem) => {
    const product = await Product.findById(cartItem.id);
    return {
      itemId: cartItem.id,
      sku: cartItem.sku,
      quantity: cartItem.quantity,
      price: cartItem.price,
      name: product.name,
      description: product.description,
      imageUrl: product.images[0] || ''
    };
  })
);

// STEP 5: CREATE ORDER IN DATABASE
const newOrder = await Order.create({
  user: userId,
  items: enrichedItems,
  totalAmount: razorpayOrder.amount / 100,  // Convert paise to rupees
  address: address,
  paymentId: razorpay_payment_id,
  orderId: razorpay_order_id,
  paymentStatus: 'SUCCESS',
  orderStatus: 'PENDING',
  created_at: new Date(),
  updated_at: new Date()
});

// STEP 6: CREATE SHIPMENT WITH SHIPROCKET
let awb_code = null;
let shipment_id = null;

try {
  const shipmentResult = await createShiprocketShipment(newOrder);
  
  if (shipmentResult.success) {
    awb_code = shipmentResult.awb_code;
    shipment_id = shipmentResult.shipment_id;
    
    // Update order with shipment details
    newOrder.awb_code = awb_code;
    newOrder.shipment_id = shipment_id;
    newOrder.orderStatus = 'PROCESSING';
    await newOrder.save();
  }
} catch (shipmentError) {
  console.error('Shipment creation failed:', shipmentError);
}

// STEP 7: CLEAR USER'S CART
await Cart.deleteMany({ user: userId });

// STEP 8: SEND SUCCESS RESPONSE
return res.status(200).json({
  success: true,
  orderId: newOrder._id,
  order: newOrder,
  awb_code: awb_code,
  message: 'Payment verified and order created successfully'
});
```

#### Backend Response Format

```javascript
{
  "success": true,
  "orderId": "64order123...",
  "order": {
    "_id": "64order123...",
    "user": "firebase_uid",
    "items": [
      {
        "itemId": "64abc123...",
        "sku": "RED-M-12345-0",
        "quantity": 2,
        "price": 250,
        "name": "Cotton T-Shirt",
        "description": "Red cotton t-shirt",
        "imageUrl": "https://..."
      }
    ],
    "totalAmount": 500,
    "address": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210",
      "address": "123 Main Street, Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pinCode": "400001",
      "country": "India"
    },
    "paymentId": "pay_abc123",
    "orderId": "order_xyz123",
    "paymentStatus": "SUCCESS",
    "orderStatus": "PROCESSING",
    "awbCode": "141123221084922",
    "shipment_id": "12345678",
    "tracking_url": "https://shiprocket.co/tracking/141123221084922",
    "createdAt": "2024-10-14T10:00:00.000Z",
    "updatedAt": "2024-10-14T10:00:00.000Z"
  },
  "awb_code": "141123221084922",
  "message": "Payment verified and order created successfully"
}
```

---

## 🔄 PART 8: Shiprocket Shipment Creation

### Backend Function: `createShiprocketShipment`

This function creates a shipment in Shiprocket and generates the AWB (Airway Bill) code.

```javascript
const createShiprocketShipment = async (order) => {
  try {
    // STEP 1: AUTHENTICATE WITH SHIPROCKET
    const authResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });
    
    const token = authResponse.data.token;
    
    // STEP 2: PREPARE SHIPMENT DATA
    const shipmentData = {
      order_id: order._id.toString(),
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: "Primary",
      billing_customer_name: order.address.firstName,
      billing_last_name: order.address.lastName,
      billing_address: order.address.address,
      billing_city: order.address.city,
      billing_pincode: order.address.pinCode,
      billing_state: order.address.state,
      billing_country: order.address.country,
      billing_email: order.address.email,
      billing_phone: order.address.phoneNumber,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: "Prepaid",
      sub_total: order.totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };
    
    // STEP 3: CREATE SHIPMENT ORDER
    const shipmentResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      shipmentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // STEP 4: EXTRACT AWB CODE AND SHIPMENT ID
    const awb_code = shipmentResponse.data.awb_code;
    const shipment_id = shipmentResponse.data.shipment_id;
    const order_id = shipmentResponse.data.order_id;
    
    console.log('✅ Shiprocket shipment created:', {
      awb_code,
      shipment_id,
      order_id
    });
    
    return {
      success: true,
      awb_code: awb_code,
      shipment_id: shipment_id,
      order_id: order_id,
      tracking_url: `https://shiprocket.co/tracking/${awb_code}`
    };
    
  } catch (error) {
    console.error('❌ Shiprocket shipment creation failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};
```

### Shiprocket Shipment Response

```javascript
{
  "order_id": 123456,
  "shipment_id": 12345678,
  "status": "NEW",
  "status_code": 1,
  "onboarding_completed_now": 0,
  "awb_code": "141123221084922",
  "courier_company_id": 26,
  "courier_name": "Delhivery Surface"
}
```

---

## 🔄 PART 9: Shipping Status Tracking

### Tracking Flow

After the shipment is created, the AWB code is stored in the order record and can be used to track the shipment.

```javascript
// Order record in database
{
  _id: "64order123...",
  awbCode: "141123221084922",
  shipment_id: "12345678",
  orderStatus: "PROCESSING",
  tracking_url: "https://shiprocket.co/tracking/141123221084922"
}
```

### Check Shipment Status

```javascript
// Backend endpoint to check shipment status
app.get('/api/orders/:orderId/track', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order from database
    const order = await Order.findById(orderId);
    
    if (!order || !order.shipment_id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or shipment not created'
      });
    }
    
    // Authenticate with Shiprocket
    const authResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });
    
    const token = authResponse.data.token;
    
    // Get tracking details
    const trackingResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shipment_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return res.status(200).json({
      success: true,
      tracking: trackingResponse.data,
      awbCode: order.awbCode,
      trackingUrl: order.tracking_url
    });
    
  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking details'
    });
  }
});
```

### Shiprocket Tracking Response

```javascript
{
  "tracking_data": {
    "track_status": 1,
    "shipment_status": "Delivered",
    "shipment_track": [
      {
        "id": 1,
        "awb_code": "141123221084922",
        "courier_company_id": 26,
        "shipment_id": 12345678,
        "order_id": 123456,
        "pickup_date": "2024-10-14 10:00:00",
        "delivered_date": "2024-10-16 14:30:00",
        "weight": "0.5",
        "packages": 1,
        "current_status": "Delivered",
        "delivered_to": "John Doe",
        "destination": "Mumbai",
        "consignee_name": "John Doe",
        "origin": "Delhi",
        "courier_agent_details": null,
        "edd": "2024-10-16"
      }
    ],
    "shipment_track_activities": [
      {
        "date": "2024-10-16 14:30:00",
        "status": "Delivered",
        "activity": "Shipment delivered successfully",
        "location": "Mumbai",
        "sr-status": "Delivered",
        "sr-status-label": "Delivered"
      },
      {
        "date": "2024-10-16 09:00:00",
        "status": "Out for Delivery",
        "activity": "Shipment out for delivery",
        "location": "Mumbai",
        "sr-status": "Out for Delivery",
        "sr-status-label": "Out for Delivery"
      },
      {
        "date": "2024-10-15 18:00:00",
        "status": "In Transit",
        "activity": "Shipment arrived at delivery hub",
        "location": "Mumbai",
        "sr-status": "In Transit",
        "sr-status-label": "In Transit"
      },
      {
        "date": "2024-10-14 10:00:00",
        "status": "Picked Up",
        "activity": "Shipment picked up from origin",
        "location": "Delhi",
        "sr-status": "Picked Up",
        "sr-status-label": "Picked Up"
      }
    ]
  }
}
```

---

## 📊 Complete Flow Timeline

```
T=0s    User clicks "Proceed to Checkout" in bag.js
        └─ Validate cart has items
        └─ Validate cart items exist in backend
        └─ Check authentication status
        └─ Check if address is selected

T=2s    Call paymentService.processCompleteOrder()
        └─ Get authenticated user data (userId, userToken)
        └─ Format address for backend
        └─ Prepare cart items

T=3s    Call orderService.createOrder()
        └─ Validate cart and address
        └─ Validate product IDs
        └─ Format cart items for API
        └─ Calculate frontend amount
        └─ Prepare request body with authentication data

T=4s    POST /api/razorpay/create-order (Backend)
        ├─ Validate request data
        ├─ Fetch product details from database
        ├─ Calculate backend amount
        ├─ Create Razorpay order
        ├─ Create database order record (status: PENDING)
        └─ Return Razorpay order ID

T=5s    initiatePayment() - Open Razorpay UI
        └─ Prepare Razorpay options
        └─ Validate required fields
        └─ Call RazorpayCheckout.open()

T=20s   User completes payment in Razorpay UI
        └─ Razorpay returns: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature
            }

T=21s   handlePaymentSuccess()
        └─ Prepare verification data
        └─ Call orderService.verifyPayment()

T=22s   POST /api/razorpay/verify-payment (Backend)
        ├─ Verify payment signature with HMAC SHA256
        ├─ Fetch order details from Razorpay
        ├─ Extract cart and address from order notes
        ├─ Fetch product details
        ├─ Update order record (paymentStatus: SUCCESS)
        ├─ Create Shiprocket shipment
        ├─ Get AWB code and shipment ID
        ├─ Update order (orderStatus: PROCESSING, awbCode, shipment_id)
        ├─ Clear user's cart
        └─ Return order details with AWB code

T=24s   Payment success callback
        ├─ Show success alert
        ├─ Clear bag (clearBag())
        └─ Navigate to order confirmation screen

T=25s   Order confirmation screen displayed
        └─ Show order details with tracking information
```

---

## 🔐 Security Considerations

### 1. Payment Signature Verification

**Critical:** The backend MUST verify the payment signature to prevent tampering.

```javascript
const generatedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  // ❌ SECURITY BREACH - Do NOT process order
  throw new Error('Payment signature verification failed');
}
```

### 2. Price Validation

**Critical:** Frontend prices are IGNORED. Backend fetches prices from database.

```javascript
// ❌ NEVER trust frontend prices for final calculation
const frontendPrice = item.price; // Used for display only

// ✅ ALWAYS fetch price from database
const product = await Product.findById(item.id);
const actualPrice = product.salePrice || product.regularPrice;
```

### 3. Authentication

**Critical:** Verify user authentication before creating orders.

```javascript
// Validate JWT token
const decoded = jwt.verify(userToken, JWT_SECRET);
const userId = decoded.userId;

// Ensure order belongs to authenticated user
order.user = userId;
```

### 4. HTTPS Only

**Critical:** ALL API calls MUST use HTTPS in production.

```javascript
// ✅ Production
const BASE_URL = "https://api.yoraa.in";

// ❌ NEVER in production
const BASE_URL = "http://api.yoraa.in";
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid item IDs" Error

**Cause:** Product IDs in cart don't exist in backend database.

**Solution:**
- Validate product IDs before creating order
- Use `validateProductIds()` in `orderService.js`
- Ensure product IDs are MongoDB ObjectIds

```javascript
// Validate before order creation
const validationResult = await validateProductIds(cart);
if (!validationResult.valid) {
  Alert.alert('Error', 'Some products are no longer available.');
  return;
}
```

### Issue 2: "Authentication Required" Error

**Cause:** User token not found or expired.

**Solution:**
- Check if user is authenticated before checkout
- Refresh token if expired
- Redirect to login if not authenticated

```javascript
const isAuthenticated = yoraaAPI.isAuthenticated();
if (!isAuthenticated) {
  navigation.navigate('RewardsScreen', { fromCheckout: true });
  return;
}
```

### Issue 3: "Address validation failed" Error

**Cause:** Missing required address fields.

**Solution:**
- Ensure all required fields are filled
- Validate address format before submission

```javascript
const required = [
  'firstName', 'lastName', 'email', 'phone',
  'addressLine1', 'city', 'state', 'zipCode', 'country'
];

for (const field of required) {
  if (!address[field]) {
    Alert.alert('Error', `${field} is required`);
    return;
  }
}
```

### Issue 4: Shipment Creation Fails

**Cause:** Shiprocket API error or invalid shipment data.

**Solution:**
- Order is still created successfully
- Shipment can be created manually later
- Admin can retry shipment creation

```javascript
try {
  const shipmentResult = await createShiprocketShipment(order);
  // ... handle success
} catch (error) {
  console.error('Shipment creation failed:', error);
  // Order is still valid, shipment can be created later
  // Send notification to admin for manual intervention
}
```

---

## 📝 Environment Variables Required

```bash
# .env file

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Shiprocket Configuration
SHIPROCKET_EMAIL=support@yoraa.in
SHIPROCKET_PASSWORD=your_shiprocket_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Database
MONGODB_URI=mongodb://localhost:27017/yoraa

# API URLs
API_BASE_URL=https://api.yoraa.in
FRONTEND_URL=https://yoraa.in
```

---

## 🧪 Testing Checklist

### Pre-Checkout Tests

- [ ] Add items to cart
- [ ] Verify cart items display correctly
- [ ] Test quantity updates
- [ ] Test item removal
- [ ] Verify price calculations
- [ ] Test cart persistence

### Checkout Flow Tests

- [ ] Click "Proceed to Checkout" with empty cart (should show error)
- [ ] Click "Proceed to Checkout" without login (should redirect to login)
- [ ] Click "Proceed to Checkout" without address (should prompt for address)
- [ ] Select/add delivery address
- [ ] Verify address display on payment screen

### Payment Tests

- [ ] Test with valid card details
- [ ] Test with invalid card details
- [ ] Test payment cancellation
- [ ] Test network failure during payment
- [ ] Test amount mismatch (if backend recalculates)

### Post-Payment Tests

- [ ] Verify order creation in database
- [ ] Verify payment verification
- [ ] Verify shipment creation
- [ ] Verify AWB code generation
- [ ] Verify cart is cleared
- [ ] Verify order confirmation screen

### Tracking Tests

- [ ] Verify tracking URL
- [ ] Test shipment status API
- [ ] Verify tracking updates

---

## 📚 API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/razorpay/create-order` | POST | Create Razorpay order | ✅ Yes |
| `/api/razorpay/verify-payment` | POST | Verify payment signature | ❌ No |
| `/api/orders/:orderId/track` | GET | Get tracking details | ✅ Yes |
| `/api/cart/` | GET | Get user's cart | ✅ Yes |
| `/api/cart/` | POST | Add item to cart | ✅ Yes |
| `/api/cart/clear` | DELETE | Clear user's cart | ✅ Yes |
| `/api/products/:productId` | GET | Get product details | ❌ No |

---

## 🎯 Key Takeaways

1. **Authentication is Critical:** Ensure userId and userToken are properly passed through the entire flow.

2. **Backend Validates Everything:** Frontend prices are for display only. Backend fetches actual prices from database.

3. **Payment Signature Verification:** Always verify Razorpay signature on backend to prevent fraud.

4. **Error Handling:** Provide user-friendly error messages and handle all failure scenarios.

5. **Shipment is Optional:** Order can be created even if shipment creation fails. Shipment can be created later.

6. **Cart Validation:** Validate cart items exist in backend before creating order to prevent "Invalid item IDs" errors.

7. **Tracking Information:** Store AWB code and shipment ID in order record for future tracking.

8. **User Experience:** Show clear progress indicators and confirmation messages throughout the flow.

---

## 📞 Support

For issues or questions:
- Backend Team: backend@yoraa.in
- Frontend Team: frontend@yoraa.in
- DevOps Team: devops@yoraa.in

---

**Last Updated:** October 14, 2025
**Version:** 1.0.0
**Author:** YORA Development Team
