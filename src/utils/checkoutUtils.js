/**
 * Checkout Utilities - Helper functions for checkout process
 * Following Backend Team's Comprehensive Guide (October 5, 2025)
 * 
 * Provides validation, formatting, and utility functions for the checkout process
 */

/**
 * Enhanced Cart Validation
 * Comprehensive validation for cart items before checkout
 */
export const validateCheckoutData = (cartItems) => {
  console.log('🔍 Validating checkout data:', cartItems);
  
  if (!cartItems || cartItems.length === 0) {
    return {
      isValid: false,
      errors: ['Cart is empty'],
      invalidItems: [],
      totalAmount: 0,
      itemCount: 0
    };
  }
  
  const errors = [];
  const invalidItems = [];
  let totalAmount = 0;
  let itemCount = 0;
  
  cartItems.forEach((item, index) => {
    const itemErrors = [];
    
    // Check required fields
    if (!item.id && !item.productId && !item._id) {
      itemErrors.push('Missing product ID');
    }
    
    if (!item.name && !item.productName) {
      itemErrors.push('Missing product name');
    }
    
    if (!item.sku && !item.productSku) {
      itemErrors.push('Missing SKU');
    }
    
    if (!item.size && !item.selectedSize) {
      itemErrors.push('Missing size selection');
    }
    
    // Validate quantity
    const quantity = parseInt(item.quantity, 10) || 0;
    if (quantity <= 0) {
      itemErrors.push('Invalid quantity');
    }
    
    // Validate price
    const price = parseFloat(item.price) || 0;
    if (price < 0) {
      itemErrors.push('Invalid price');
    }
    
    // Calculate totals for valid items
    if (itemErrors.length === 0) {
      totalAmount += (price * quantity);
      itemCount += quantity;
    } else {
      invalidItems.push({
        index,
        item,
        errors: itemErrors
      });
      errors.push(`Item ${index + 1} (${item.name || 'Unknown'}): ${itemErrors.join(', ')}`);
    }
  });
  
  const isValid = errors.length === 0;
  
  console.log('🔍 Checkout validation result:', {
    isValid,
    errorCount: errors.length,
    invalidItemCount: invalidItems.length,
    totalAmount,
    itemCount
  });
  
  return {
    isValid,
    errors,
    invalidItems,
    totalAmount,
    itemCount,
    breakdown: {
      subtotal: totalAmount,
      shipping: totalAmount >= 500 ? 0 : 50, // Example shipping logic
      tax: 0, // Currently not implemented
      total: totalAmount + (totalAmount >= 500 ? 0 : 50)
    }
  };
};

/**
 * Format Price Display
 * Consistent price formatting throughout the app
 */
export const formatPrice = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) {
    return '₹0.00';
  }
  
  const numAmount = parseFloat(amount) || 0;
  
  if (currency === 'INR') {
    return `₹${numAmount.toFixed(2)}`;
  }
  
  return `${currency} ${numAmount.toFixed(2)}`;
};

/**
 * Calculate Shipping Charges
 * Centralized shipping calculation logic
 */
export const calculateShipping = (subtotal, location = 'domestic') => {
  console.log('📦 Calculating shipping for subtotal:', subtotal, 'location:', location);
  
  // Free shipping threshold
  const freeShippingThreshold = 500;
  
  if (subtotal >= freeShippingThreshold) {
    return {
      amount: 0,
      reason: 'Free shipping on orders above ₹500',
      isFree: true
    };
  }
  
  // Standard shipping charges
  const domesticShipping = 50;
  const internationalShipping = 200;
  
  const shippingAmount = location === 'international' ? internationalShipping : domesticShipping;
  
  return {
    amount: shippingAmount,
    reason: `Standard ${location} shipping`,
    isFree: false
  };
};

/**
 * Generate Order Summary
 * Creates a comprehensive order summary for display
 */
export const generateOrderSummary = (cartItems, shippingInfo = null) => {
  console.log('📋 Generating order summary for:', cartItems.length, 'items');
  
  const validation = validateCheckoutData(cartItems);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      summary: null
    };
  }
  
  const subtotal = validation.breakdown.subtotal;
  const shipping = shippingInfo || calculateShipping(subtotal);
  const tax = 0; // Currently not implemented
  const discount = 0; // Currently not implemented
  
  const total = subtotal + shipping.amount + tax - discount;
  
  const summary = {
    items: cartItems.length,
    itemCount: validation.itemCount,
    subtotal: subtotal,
    shipping: shipping.amount,
    shippingInfo: shipping,
    tax: tax,
    discount: discount,
    total: total,
    
    // Formatted display values
    display: {
      subtotal: formatPrice(subtotal),
      shipping: formatPrice(shipping.amount),
      tax: formatPrice(tax),
      discount: formatPrice(discount),
      total: formatPrice(total)
    },
    
    // Item breakdown
    itemBreakdown: cartItems.map(item => ({
      id: item.id || item.productId || item._id,
      name: item.name || item.productName,
      quantity: parseInt(item.quantity, 10) || 1,
      unitPrice: parseFloat(item.price) || 0,
      totalPrice: (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
      size: item.size || item.selectedSize,
      sku: item.sku || item.productSku,
      display: {
        unitPrice: formatPrice(item.price),
        totalPrice: formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1))
      }
    }))
  };
  
  console.log('✅ Order summary generated:', {
    items: summary.items,
    total: summary.display.total,
    hasShipping: shipping.amount > 0
  });
  
  return {
    isValid: true,
    errors: [],
    summary: summary
  };
};

/**
 * Validate User Input
 * General validation for user inputs
 */
export const validateUserInput = (value, type, required = true) => {
  if (!value || value.toString().trim() === '') {
    return {
      isValid: !required,
      error: required ? 'This field is required' : null
    };
  }
  
  const trimmedValue = value.toString().trim();
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(trimmedValue),
        error: emailRegex.test(trimmedValue) ? null : 'Please enter a valid email address'
      };
      
    case 'phone':
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      return {
        isValid: phoneRegex.test(trimmedValue),
        error: phoneRegex.test(trimmedValue) ? null : 'Please enter a valid phone number'
      };
      
    case 'pincode':
      const pincodeRegex = /^\d{6}$/;
      return {
        isValid: pincodeRegex.test(trimmedValue),
        error: pincodeRegex.test(trimmedValue) ? null : 'Please enter a valid 6-digit pincode'
      };
      
    case 'name':
      const nameRegex = /^[a-zA-Z\s]{2,}$/;
      return {
        isValid: nameRegex.test(trimmedValue),
        error: nameRegex.test(trimmedValue) ? null : 'Please enter a valid name (minimum 2 characters)'
      };
      
    default:
      return {
        isValid: trimmedValue.length > 0,
        error: trimmedValue.length > 0 ? null : 'This field cannot be empty'
      };
  }
};

/**
 * Format Address for Display
 * Creates a formatted address string for display purposes
 */
export const formatAddressDisplay = (address) => {
  if (!address) {
    return 'No address provided';
  }
  
  const parts = [];
  
  // Name
  const name = `${address.firstName || ''} ${address.lastName || ''}`.trim();
  if (name) {
    parts.push(name);
  }
  
  // Address lines
  if (address.addressLine1) {
    parts.push(address.addressLine1);
  }
  if (address.addressLine2) {
    parts.push(address.addressLine2);
  }
  
  // City, State, Pincode
  const cityStatePin = [
    address.city,
    address.state,
    address.zipCode || address.pinCode
  ].filter(Boolean).join(', ');
  
  if (cityStatePin) {
    parts.push(cityStatePin);
  }
  
  // Country
  if (address.country) {
    parts.push(address.country);
  }
  
  // Phone
  if (address.phone || address.phoneNumber) {
    parts.push(`Phone: ${address.phone || address.phoneNumber}`);
  }
  
  return parts.join('\n');
};

/**
 * Debug Helper
 * Comprehensive debugging information for checkout process
 */
export const debugCheckoutProcess = (cart, address, stage = 'unknown') => {
  console.log('='.repeat(60));
  console.log(`🔍 CHECKOUT DEBUG - ${stage.toUpperCase()}`);
  console.log('='.repeat(60));
  
  // Cart debug info
  console.log('📦 CART DEBUG:');
  console.log(`   Total Items: ${cart ? cart.length : 0}`);
  if (cart && cart.length > 0) {
    cart.forEach((item, index) => {
      console.log(`   Item ${index + 1}:`, {
        id: item.id || item.productId || item._id || 'NO_ID',
        name: item.name || item.productName || 'NO_NAME',
        quantity: item.quantity || 'NO_QUANTITY',
        price: item.price || 'NO_PRICE',
        size: item.size || item.selectedSize || 'NO_SIZE',
        sku: item.sku || item.productSku || 'NO_SKU'
      });
    });
    
    const summary = generateOrderSummary(cart);
    if (summary.isValid) {
      console.log('   Order Total:', summary.summary.display.total);
    } else {
      console.log('   ❌ Cart validation errors:', summary.errors);
    }
  }
  
  // Address debug info
  console.log('📍 ADDRESS DEBUG:');
  if (address) {
    console.log('   Required Fields Check:', {
      firstName: !!address.firstName,
      lastName: !!address.lastName,
      email: !!address.email,
      phone: !!(address.phone || address.phoneNumber),
      addressLine1: !!(address.addressLine1 || address.address),
      city: !!address.city,
      state: !!address.state,
      zipCode: !!(address.zipCode || address.pinCode),
      country: !!address.country
    });
    
    if (address.email) {
      const emailValidation = validateUserInput(address.email, 'email');
      console.log('   Email Validation:', emailValidation);
    }
    
    if (address.phone || address.phoneNumber) {
      const phoneValidation = validateUserInput(address.phone || address.phoneNumber, 'phone');
      console.log('   Phone Validation:', phoneValidation);
    }
  } else {
    console.log('   ❌ No address provided');
  }
  
  console.log('='.repeat(60));
};

/**
 * Create Test Data
 * Helper function to create test data for development
 */
export const createTestData = () => {
  const testCart = [
    {
      id: "68da56fc0561b958f6694e35",
      name: "Cotton T-Shirt",
      quantity: 2,
      price: 299.99,
      size: "LARGE",
      sku: "TSHIRT001-LARGE-1696234567-0",
      image: "https://example.com/image1.jpg"
    },
    {
      id: "68da56fc0561b958f6694e36",
      name: "Denim Jeans",
      quantity: 1,
      price: 1299.99,
      size: "32",
      sku: "JEANS002-32-1696234568-0",
      image: "https://example.com/image2.jpg"
    }
  ];
  
  const testAddress = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+919876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India",
    addressType: "HOME"
  };
  
  return {
    cart: testCart,
    address: testAddress,
    summary: generateOrderSummary(testCart)
  };
};

export default {
  validateCheckoutData,
  formatPrice,
  calculateShipping,
  generateOrderSummary,
  validateUserInput,
  formatAddressDisplay,
  debugCheckoutProcess,
  createTestData
};
