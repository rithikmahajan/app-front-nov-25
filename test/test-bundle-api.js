#!/usr/bin/env node

/**
 * Bundle API Test Script
 * Tests the bundle endpoints to verify backend configuration
 */

const API_BASE_URL = 'http://185.193.19.244:8080/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n`),
};

async function testEndpoint(url, description) {
  log.info(`Testing: ${description}`);
  log.info(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const status = response.status;
    
    console.log(`  Status: ${status}`);
    
    if (status === 200) {
      const data = await response.json();
      log.success(`Success! Found ${data.bundles?.length || 0} bundle(s)`);
      
      if (data.bundles && data.bundles.length > 0) {
        console.log('\n  Bundle Details:');
        data.bundles.forEach((bundle, index) => {
          console.log(`    ${index + 1}. ${bundle.name}`);
          console.log(`       Products: ${bundle.products?.length || 0}`);
          console.log(`       Discount: ${bundle.discount || 0}%`);
          console.log(`       Active: ${bundle.isActive ? 'Yes' : 'No'}`);
        });
      }
      
      return { success: true, data };
    } else if (status === 404) {
      log.warning('No bundles found (404)');
      return { success: false, status: 404 };
    } else {
      log.error(`Request failed with status ${status}`);
      return { success: false, status };
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n');
  log.section('🧪 Bundle API Test Suite');
  
  // Test 1: Get all bundles
  log.section('Test 1: Get All Active Bundles');
  const test1 = await testEndpoint(
    `${API_BASE_URL}/bundles`,
    'Fetch all active bundles'
  );
  
  // Test 2: Get bundles for specific product
  // You can replace this product ID with one from your database
  log.section('Test 2: Get Bundles for Specific Product');
  const productId = '68da56fc0561b958f6694e31'; // Replace with your test product ID
  log.warning(`Using test product ID: ${productId}`);
  log.info('💡 Tip: Replace this ID with a valid product ID from your database');
  
  const test2 = await testEndpoint(
    `${API_BASE_URL}/bundles/product/${productId}`,
    'Fetch bundles for product'
  );
  
  // Summary
  log.section('📊 Test Summary');
  
  if (test1.success || test2.success) {
    log.success('At least one endpoint is working! ✨');
    
    if (test1.success && test1.data?.bundles?.length > 0) {
      log.success(`Found ${test1.data.bundles.length} bundle(s) in your system`);
    }
    
    if (!test1.success && !test2.success) {
      log.warning('No bundles found in the system');
      console.log('\n  Next Steps:');
      console.log('  1. Login to your admin panel');
      console.log('  2. Create a new product bundle');
      console.log('  3. Add some products to the bundle');
      console.log('  4. Set the bundle as "Active"');
      console.log('  5. Run this test again\n');
    }
  } else {
    log.error('All tests failed!');
    console.log('\n  Possible Issues:');
    console.log('  1. Backend server is not running');
    console.log('  2. Bundle API endpoints are not implemented');
    console.log('  3. Network connectivity issues');
    console.log('  4. CORS configuration');
    console.log('\n  Next Steps:');
    console.log('  1. Check if backend server is running');
    console.log('  2. Verify bundle routes are configured');
    console.log('  3. Check server logs for errors\n');
  }
  
  log.section('🔗 Quick Links');
  console.log(`  Admin Panel: http://185.193.19.244:8080/admin`);
  console.log(`  API Docs: http://185.193.19.244:8080/api-docs`);
  console.log(`  All Bundles: ${API_BASE_URL}/bundles`);
  console.log('');
}

// Run the tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
