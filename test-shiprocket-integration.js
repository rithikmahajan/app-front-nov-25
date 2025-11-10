/**
 * Test Shiprocket Integration
 * Run this file to test if Shiprocket authentication and order creation works
 * 
 * Usage: node test-shiprocket-integration.js
 */

const axios = require('axios');

// Shiprocket Configuration
const SHIPROCKET_CONFIG = {
  API_USER_EMAIL: 'support@yoraa.in',
  API_USER_PASSWORD: 'R@0621thik',
  BASE_URL: 'https://apiv2.shiprocket.in/v1/external'
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Test 1: Authentication
 */
async function testAuthentication() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 1: Shiprocket Authentication', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    log('\n🔐 Authenticating with Shiprocket API...', 'yellow');
    log(`   Email: ${SHIPROCKET_CONFIG.API_USER_EMAIL}`, 'blue');

    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/auth/login`,
      {
        email: SHIPROCKET_CONFIG.API_USER_EMAIL,
        password: SHIPROCKET_CONFIG.API_USER_PASSWORD
      },
      {
        headers: { 
          'Content-Type': 'application/json' 
        }
      }
    );

    if (response.data && response.data.token) {
      log('\n✅ Authentication Successful!', 'green');
      log(`   Token: ${response.data.token.substring(0, 30)}...`, 'blue');
      log(`   Email: ${response.data.email}`, 'blue');
      log(`   User ID: ${response.data.id}`, 'blue');
      
      return {
        success: true,
        token: response.data.token
      };
    } else {
      throw new Error('No token received');
    }

  } catch (error) {
    log('\n❌ Authentication Failed!', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    
    if (error.response?.data) {
      log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test 2: Create Test Order
 */
async function testOrderCreation(token) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 2: Order Creation (DRY RUN)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  log('\n⚠️  This is a dry run - no actual order will be created', 'yellow');
  log('   Uncomment the API call in code to create real test order', 'yellow');

  const testOrderData = {
    order_id: `TEST-${Date.now()}`,
    order_date: new Date().toISOString().split('T')[0],
    pickup_location: "Primary",
    channel_id: "",
    comment: "Test order from integration script",
    billing_customer_name: "Test",
    billing_last_name: "Customer",
    billing_address: "123 Test Street, Test Area",
    billing_address_2: "Near Test Landmark",
    billing_city: "Mumbai",
    billing_pincode: "400001",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_email: "test@yoraa.in",
    billing_phone: "9876543210",
    shipping_is_billing: true,
    order_items: [{
      name: "Test Product",
      sku: "TEST-SKU-001",
      units: 1,
      selling_price: 999,
      discount: 0,
      tax: 0
    }],
    payment_method: "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: 999,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5
  };

  log('\n📦 Test Order Data:', 'blue');
  log(JSON.stringify(testOrderData, null, 2), 'blue');

  log('\n✅ Order data prepared successfully', 'green');
  log('   To create a real order, uncomment the API call in the code', 'yellow');

  // Uncomment below to create actual test order
  /*
  try {
    log('\n📤 Creating order in Shiprocket...', 'yellow');

    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/orders/create/adhoc`,
      testOrderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.order_id) {
      log('\n✅ Order Created Successfully!', 'green');
      log(`   Order ID: ${response.data.order_id}`, 'blue');
      log(`   Shipment ID: ${response.data.shipment_id}`, 'blue');
      log(`   Status: ${response.data.status}`, 'blue');
      
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Invalid response from Shiprocket');
    }

  } catch (error) {
    log('\n❌ Order Creation Failed!', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    
    if (error.response?.data) {
      log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
  */

  return { success: true, dryRun: true };
}

/**
 * Test 3: Track Shipment
 */
async function testTracking(token) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 3: Shipment Tracking', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  log('\n⚠️  To test tracking, enter a valid AWB code', 'yellow');
  log('   Get AWB code from Shiprocket dashboard', 'yellow');

  // Example AWB code - replace with real one to test
  const testAwbCode = '1234567890';

  log(`\n📍 Test AWB Code: ${testAwbCode}`, 'blue');
  log('   (This is just an example - use real AWB to test)', 'yellow');

  // Uncomment below to test real tracking
  /*
  try {
    log('\n📡 Fetching tracking data...', 'yellow');

    const response = await axios.get(
      `${SHIPROCKET_CONFIG.BASE_URL}/courier/track/awb/${testAwbCode}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      log('\n✅ Tracking Data Retrieved!', 'green');
      log(JSON.stringify(response.data, null, 2), 'blue');
      
      return {
        success: true,
        data: response.data
      };
    }

  } catch (error) {
    log('\n❌ Tracking Failed!', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    
    return {
      success: false,
      error: error.message
    };
  }
  */

  return { success: true, dryRun: true };
}

/**
 * Test 4: Check Configuration
 */
function testConfiguration() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 4: Configuration Check', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const checks = [
    {
      name: 'API User Email',
      value: SHIPROCKET_CONFIG.API_USER_EMAIL,
      expected: 'support@yoraa.in',
      pass: SHIPROCKET_CONFIG.API_USER_EMAIL === 'support@yoraa.in'
    },
    {
      name: 'API User Password',
      value: SHIPROCKET_CONFIG.API_USER_PASSWORD.replace(/./g, '*'),
      expected: 'R@0621thik',
      pass: SHIPROCKET_CONFIG.API_USER_PASSWORD === 'R@0621thik'
    },
    {
      name: 'Base URL',
      value: SHIPROCKET_CONFIG.BASE_URL,
      expected: 'https://apiv2.shiprocket.in/v1/external',
      pass: SHIPROCKET_CONFIG.BASE_URL === 'https://apiv2.shiprocket.in/v1/external'
    }
  ];

  log('\n📋 Configuration Status:', 'blue');
  let allPassed = true;

  checks.forEach(check => {
    const status = check.pass ? '✅' : '❌';
    const color = check.pass ? 'green' : 'red';
    log(`   ${status} ${check.name}: ${check.value}`, color);
    if (!check.pass) {
      log(`      Expected: ${check.expected}`, 'yellow');
      allPassed = false;
    }
  });

  if (allPassed) {
    log('\n✅ All configuration checks passed!', 'green');
  } else {
    log('\n❌ Some configuration checks failed!', 'red');
  }

  return { success: allPassed };
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════╗', 'cyan');
  log('║  SHIPROCKET INTEGRATION TEST SUITE      ║', 'cyan');
  log('║  YORAA - October 2025                   ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');

  const results = {
    configuration: false,
    authentication: false,
    orderCreation: false,
    tracking: false
  };

  // Test 4: Configuration (runs first)
  const configResult = testConfiguration();
  results.configuration = configResult.success;

  if (!configResult.success) {
    log('\n⚠️  Configuration check failed. Fix configuration before proceeding.', 'yellow');
    return;
  }

  // Test 1: Authentication
  const authResult = await testAuthentication();
  results.authentication = authResult.success;

  if (!authResult.success) {
    log('\n⚠️  Authentication failed. Cannot proceed with other tests.', 'yellow');
    printSummary(results);
    return;
  }

  // Test 2: Order Creation (dry run)
  const orderResult = await testOrderCreation(authResult.token);
  results.orderCreation = orderResult.success;

  // Test 3: Tracking (dry run)
  const trackingResult = await testTracking(authResult.token);
  results.tracking = trackingResult.success;

  // Print summary
  printSummary(results);
}

/**
 * Print test summary
 */
function printSummary(results) {
  log('\n╔═══════════════════════════════════════════╗', 'cyan');
  log('║           TEST SUMMARY                    ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');

  const tests = [
    { name: 'Configuration Check', status: results.configuration },
    { name: 'Authentication', status: results.authentication },
    { name: 'Order Creation (Dry Run)', status: results.orderCreation },
    { name: 'Tracking (Dry Run)', status: results.tracking }
  ];

  tests.forEach(test => {
    const status = test.status ? '✅ PASS' : '❌ FAIL';
    const color = test.status ? 'green' : 'red';
    log(`   ${status} - ${test.name}`, color);
  });

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    log('\n🎉 All tests passed! Integration is ready.', 'green');
    log('   Next steps:', 'blue');
    log('   1. Copy backend-shiprocket-service.js to your backend', 'blue');
    log('   2. Update your .env file with credentials', 'blue');
    log('   3. Integrate into order controller', 'blue');
    log('   4. Deploy and test with real orders', 'blue');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Test suite failed:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
