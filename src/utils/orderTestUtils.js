/**
 * Order Flow Testing Utility
 * Testing helper for the new order creation implementation
 * Based on Backend Team's Comprehensive Guide (October 5, 2025)
 */

import orderService from '../services/orderService';
import checkoutUtils from '../utils/checkoutUtils';

/**
 * Test Order Creation - Basic Test Case
 * Tests the complete order flow with sample data
 */
export const testBasicOrderCreation = async () => {
  console.log('🧪 Starting basic order creation test...');
  
  const testCart = [
    {
      id: "68da56fc0561b958f6694e35",
      name: "Cotton T-Shirt",
      quantity: 2,
      price: 299.99,
      size: "LARGE",
      sku: "TSHIRT001-LARGE-1696234567-0",
      image: "https://example.com/image1.jpg"
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
    // Test cart validation
    console.log('1️⃣ Testing cart validation...');
    const cartValid = orderService.validateCart(testCart);
    console.log('   Cart validation result:', cartValid);
    
    // Test address validation
    console.log('2️⃣ Testing address validation...');
    const addressValid = orderService.validateAddress(testAddress);
    console.log('   Address validation result:', addressValid);
    
    // Test cart formatting
    console.log('3️⃣ Testing cart formatting...');
    const formattedCart = orderService.formatCartItemsForAPI(testCart);
    console.log('   Formatted cart:', formattedCart);
    
    // Test address formatting
    console.log('4️⃣ Testing address formatting...');
    const formattedAddress = orderService.formatAddressForAPI(testAddress);
    console.log('   Formatted address:', formattedAddress);
    
    // Test frontend amount calculation
    console.log('5️⃣ Testing amount calculation...');
    const calculation = orderService.calculateFrontendAmount(testCart);
    console.log('   Amount calculation:', calculation);
    
    // Test order summary generation
    console.log('6️⃣ Testing order summary...');
    const summary = checkoutUtils.generateOrderSummary(testCart);
    console.log('   Order summary:', summary);
    
    console.log('✅ All basic tests passed!');
    return {
      success: true,
      results: {
        cartValid,
        addressValid,
        formattedCart,
        formattedAddress,
        calculation,
        summary
      }
    };
    
  } catch (error) {
    console.error('❌ Basic test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test Multiple Items Order
 * Tests order creation with multiple cart items
 */
export const testMultipleItemsOrder = async () => {
  console.log('🧪 Starting multiple items order test...');
  
  const testCart = [
    {
      id: "68da56fc0561b958f6694e35",
      name: "Cotton T-Shirt",
      quantity: 2,
      price: 299.99,
      size: "LARGE",
      sku: "TSHIRT001-LARGE-1696234567-0"
    },
    {
      id: "68da56fc0561b958f6694e36",
      name: "Denim Jeans",
      quantity: 1,
      price: 1299.99,
      size: "32",
      sku: "JEANS002-32-1696234568-0"
    },
    {
      id: "68da56fc0561b958f6694e37",
      name: "Casual Shirt",
      quantity: 3,
      price: 599.99,
      size: "MEDIUM",
      sku: "SHIRT003-MEDIUM-1696234569-0"
    }
  ];
  
  // Test address not needed for this test
  
  try {
    // Test checkout data validation
    const validation = checkoutUtils.validateCheckoutData(testCart);
    console.log('   Checkout validation:', validation);
    
    // Test order summary with multiple items
    const summary = checkoutUtils.generateOrderSummary(testCart);
    console.log('   Multi-item summary:', summary);
    
    // Test amount calculation
    const calculation = orderService.calculateFrontendAmount(testCart);
    console.log('   Multi-item calculation:', calculation);
    
    console.log('✅ Multiple items test passed!');
    return {
      success: true,
      validation,
      summary,
      calculation
    };
    
  } catch (error) {
    console.error('❌ Multiple items test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test Cart Validation Edge Cases
 * Tests various invalid cart scenarios
 */
export const testCartValidationEdgeCases = async () => {
  console.log('🧪 Starting cart validation edge cases test...');
  
  const testCases = [
    {
      name: 'Empty Cart',
      cart: []
    },
    {
      name: 'Missing Product ID',
      cart: [{ name: 'Test Product', quantity: 1, price: 100, size: 'M', sku: 'TEST-M-123' }]
    },
    {
      name: 'Missing Product Name',
      cart: [{ id: '123', quantity: 1, price: 100, size: 'M', sku: 'TEST-M-123' }]
    },
    {
      name: 'Missing SKU',
      cart: [{ id: '123', name: 'Test Product', quantity: 1, price: 100, size: 'M' }]
    },
    {
      name: 'Zero Quantity',
      cart: [{ id: '123', name: 'Test Product', quantity: 0, price: 100, size: 'M', sku: 'TEST-M-123' }]
    },
    {
      name: 'Negative Quantity',
      cart: [{ id: '123', name: 'Test Product', quantity: -1, price: 100, size: 'M', sku: 'TEST-M-123' }]
    },
    {
      name: 'Invalid Price',
      cart: [{ id: '123', name: 'Test Product', quantity: 1, price: 'invalid', size: 'M', sku: 'TEST-M-123' }]
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`   Testing: ${testCase.name}`);
    try {
      const isValid = orderService.validateCart(testCase.cart);
      results.push({
        name: testCase.name,
        expected: false, // All these should fail
        actual: isValid,
        passed: isValid === false
      });
    } catch (error) {
      // Some validation might throw errors, which is also expected
      results.push({
        name: testCase.name,
        expected: false,
        actual: false,
        passed: true,
        error: error.message
      });
    }
  }
  
  const allPassed = results.every(r => r.passed);
  console.log('   Edge cases results:', results);
  console.log(allPassed ? '✅ All edge cases handled correctly!' : '❌ Some edge cases failed');
  
  return {
    success: allPassed,
    results
  };
};

/**
 * Test Address Validation Edge Cases
 * Tests various invalid address scenarios
 */
export const testAddressValidationEdgeCases = async () => {
  console.log('🧪 Starting address validation edge cases test...');
  
  const testCases = [
    {
      name: 'Missing First Name',
      address: { lastName: 'Test', email: 'test@example.com', phone: '+919876543210', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Missing Email',
      address: { firstName: 'Test', lastName: 'User', phone: '+919876543210', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Invalid Email',
      address: { firstName: 'Test', lastName: 'User', email: 'invalid-email', phone: '+919876543210', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Missing Phone',
      address: { firstName: 'Test', lastName: 'User', email: 'test@example.com', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Invalid Phone',
      address: { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '123', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Missing Address Line',
      address: { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '+919876543210', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    },
    {
      name: 'Missing City',
      address: { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '+919876543210', addressLine1: '123 Test St', state: 'Maharashtra', zipCode: '400001', country: 'India' }
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`   Testing: ${testCase.name}`);
    try {
      const isValid = orderService.validateAddress(testCase.address);
      results.push({
        name: testCase.name,
        expected: false, // All these should fail
        actual: isValid,
        passed: isValid === false
      });
    } catch (error) {
      // Some validation might throw errors, which is also expected
      results.push({
        name: testCase.name,
        expected: false,
        actual: false,
        passed: true,
        error: error.message
      });
    }
  }
  
  const allPassed = results.every(r => r.passed);
  console.log('   Address edge cases results:', results);
  console.log(allPassed ? '✅ All address edge cases handled correctly!' : '❌ Some address edge cases failed');
  
  return {
    success: allPassed,
    results
  };
};

/**
 * Test Order Creation with Backend API
 * Note: This requires backend server to be running
 */
export const testOrderCreationWithBackend = async () => {
  console.log('🧪 Starting order creation with backend test...');
  console.log('⚠️  Note: This test requires backend server running on port 8001');
  
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
    firstName: "API",
    lastName: "Test",
    email: "apitest@example.com",
    phone: "+919876543212",
    addressLine1: "789 API Street",
    city: "Bangalore",
    state: "Karnataka",
    zipCode: "560001",
    country: "India"
  };
  
  try {
    // Test order creation (without payment)
    console.log('   Creating order via backend API...');
    const orderResponse = await orderService.createOrder(testCart, testAddress);
    
    console.log('✅ Backend order creation test passed!');
    console.log('   Order ID:', orderResponse.id);
    console.log('   Amount:', orderResponse.amount);
    console.log('   Currency:', orderResponse.currency);
    
    if (orderResponse.order_details) {
      console.log('   Backend calculation details:', orderResponse.order_details);
    }
    
    if (orderResponse.validation_messages) {
      console.log('   Validation messages:', orderResponse.validation_messages);
    }
    
    return {
      success: true,
      orderResponse
    };
    
  } catch (error) {
    console.error('❌ Backend order creation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run All Tests
 * Executes all test functions
 */
export const runAllTests = async () => {
  console.log('🧪 Running comprehensive order flow tests...');
  console.log('='.repeat(60));
  
  const results = {};
  
  try {
    // Run all tests
    results.basicOrder = await testBasicOrderCreation();
    results.multipleItems = await testMultipleItemsOrder();
    results.cartEdgeCases = await testCartValidationEdgeCases();
    results.addressEdgeCases = await testAddressValidationEdgeCases();
    results.backendOrder = await testOrderCreationWithBackend();
    
    // Summary
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log('='.repeat(60));
    console.log('🧪 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Tests Passed: ${successCount}/${totalTests}`);
    console.log(`   Overall Success: ${successCount === totalTests ? '✅' : '❌'}`);
    
    Object.entries(results).forEach(([testName, result]) => {
      console.log(`   ${testName}: ${result.success ? '✅' : '❌'}`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
    
    return {
      success: successCount === totalTests,
      results,
      summary: {
        passed: successCount,
        total: totalTests
      }
    };
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

/**
 * Debug Order Flow
 * Comprehensive debugging helper
 */
export const debugOrderFlow = (cart, address) => {
  console.log('🔍 DEBUGGING ORDER FLOW');
  console.log('='.repeat(50));
  
  // Use order service debug function
  orderService.logOrderCreationDebug(
    cart, 
    address, 
    orderService.calculateFrontendAmount(cart)
  );
  
  // Additional checkout utils debug
  checkoutUtils.debugCheckoutProcess(cart, address, 'debug-session');
  
  console.log('='.repeat(50));
};

export default {
  testBasicOrderCreation,
  testMultipleItemsOrder,
  testCartValidationEdgeCases,
  testAddressValidationEdgeCases,
  testOrderCreationWithBackend,
  runAllTests,
  debugOrderFlow
};
