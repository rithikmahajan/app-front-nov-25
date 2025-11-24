/**
 * Logout Address Persistence Test Script
 * 
 * Purpose: Verify that user addresses and other personal data
 * are properly cleared during logout to prevent data leakage
 * between different users on the same device.
 * 
 * Run this script in your React Native app to test logout functionality.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import yoraaAPI from '../services/yoraaAPI';
import authenticationService from '../services/authenticationService';

/**
 * Test 1: Check if addresses persist after logout
 */
export async function testAddressPersistence() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 TEST 1: Address Persistence After Logout              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Step 1: Setup - Add test data
    console.log('📝 Step 1: Setting up test data...');
    await AsyncStorage.setItem('userToken', 'test_token_123');
    await AsyncStorage.setItem('userAddresses', JSON.stringify([
      {
        id: 'test_addr_1',
        street: '123 Test Street',
        city: 'Test City',
        zipCode: '12345'
      }
    ]));
    await AsyncStorage.setItem('orderHistory', JSON.stringify([
      { id: 'order_1', total: 99.99 }
    ]));
    
    // Verify setup
    const setupAddresses = await AsyncStorage.getItem('userAddresses');
    const setupOrders = await AsyncStorage.getItem('orderHistory');
    console.log('✅ Test data created:');
    console.log('   - userAddresses:', setupAddresses ? 'EXISTS' : 'MISSING');
    console.log('   - orderHistory:', setupOrders ? 'EXISTS' : 'MISSING');
    
    // Step 2: Get all keys before logout
    console.log('\n📦 Step 2: Checking storage BEFORE logout...');
    const keysBefore = await AsyncStorage.getAllKeys();
    console.log(`   Total keys: ${keysBefore.length}`);
    console.log('   Keys:', keysBefore.join(', '));
    
    const beforeData = {
      userToken: await AsyncStorage.getItem('userToken'),
      userAddresses: await AsyncStorage.getItem('userAddresses'),
      orderHistory: await AsyncStorage.getItem('orderHistory'),
      cartItems: await AsyncStorage.getItem('cartItems'),
      wishlistItems: await AsyncStorage.getItem('wishlistItems')
    };
    
    console.log('\n   Storage contents:');
    console.log('   ├─ userToken:', beforeData.userToken ? 'EXISTS' : 'null');
    console.log('   ├─ userAddresses:', beforeData.userAddresses ? 'EXISTS' : 'null');
    console.log('   ├─ orderHistory:', beforeData.orderHistory ? 'EXISTS' : 'null');
    console.log('   ├─ cartItems:', beforeData.cartItems ? 'EXISTS' : 'null');
    console.log('   └─ wishlistItems:', beforeData.wishlistItems ? 'EXISTS' : 'null');
    
    // Step 3: Perform logout
    console.log('\n🚪 Step 3: Logging out...');
    await yoraaAPI.logout();
    console.log('   ✅ Logout completed');
    
    // Step 4: Check storage after logout
    console.log('\n📦 Step 4: Checking storage AFTER logout...');
    const keysAfter = await AsyncStorage.getAllKeys();
    console.log(`   Total keys: ${keysAfter.length}`);
    console.log('   Keys:', keysAfter.join(', '));
    
    const afterData = {
      userToken: await AsyncStorage.getItem('userToken'),
      userAddresses: await AsyncStorage.getItem('userAddresses'),
      orderHistory: await AsyncStorage.getItem('orderHistory'),
      cartItems: await AsyncStorage.getItem('cartItems'),
      wishlistItems: await AsyncStorage.getItem('wishlistItems')
    };
    
    console.log('\n   Storage contents:');
    console.log('   ├─ userToken:', afterData.userToken ? '❌ STILL EXISTS' : '✅ null');
    console.log('   ├─ userAddresses:', afterData.userAddresses ? '❌ STILL EXISTS' : '✅ null');
    console.log('   ├─ orderHistory:', afterData.orderHistory ? '❌ STILL EXISTS' : '✅ null');
    console.log('   ├─ cartItems:', afterData.cartItems ? '❌ STILL EXISTS' : '✅ null');
    console.log('   └─ wishlistItems:', afterData.wishlistItems ? '❌ STILL EXISTS' : '✅ null');
    
    // Step 5: Verification
    console.log('\n✅ Step 5: Test Results');
    const issues = [];
    
    if (afterData.userToken !== null) issues.push('userToken');
    if (afterData.userAddresses !== null) issues.push('userAddresses 🚨');
    if (afterData.orderHistory !== null) issues.push('orderHistory');
    if (afterData.cartItems !== null) issues.push('cartItems');
    if (afterData.wishlistItems !== null) issues.push('wishlistItems');
    
    if (issues.length === 0) {
      console.log('   ✅ PASS: All user data properly cleared');
      return { success: true, issues: [] };
    } else {
      console.log(`   ❌ FAIL: ${issues.length} items not cleared:`);
      issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
      console.log('\n   🚨 BUG CONFIRMED: User data persists after logout!');
      return { success: false, issues };
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: error.message };
  } finally {
    // Cleanup
    await AsyncStorage.clear();
    console.log('\n🧹 Test cleanup completed\n');
  }
}

/**
 * Test 2: Device switching scenario (User A → Logout → User B)
 */
export async function testDeviceSwitching() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 TEST 2: Device Switching Scenario                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Step 1: User A logs in
    console.log('👤 Step 1: User A logs in...');
    await AsyncStorage.setItem('userToken', 'token_user_a');
    await AsyncStorage.setItem('userData', JSON.stringify({
      id: 'user_a',
      name: 'Alice Anderson',
      email: 'alice@test.com'
    }));
    await AsyncStorage.setItem('userAddresses', JSON.stringify([
      {
        id: 'addr_a1',
        name: 'Alice Anderson',
        street: '123 Alice Street',
        city: 'Alice City',
        zipCode: '11111'
      },
      {
        id: 'addr_a2',
        name: 'Alice Anderson',
        street: '456 Alice Avenue',
        city: 'Alice Town',
        zipCode: '22222'
      }
    ]));
    
    const userAData = {
      token: await AsyncStorage.getItem('userToken'),
      user: JSON.parse(await AsyncStorage.getItem('userData') || '{}'),
      addresses: JSON.parse(await AsyncStorage.getItem('userAddresses') || '[]')
    };
    
    console.log('   ✅ User A logged in:');
    console.log('      - Name:', userAData.user.name);
    console.log('      - Email:', userAData.user.email);
    console.log(`      - Addresses: ${userAData.addresses.length} saved`);
    userAData.addresses.forEach((addr, i) => {
      console.log(`         ${i + 1}. ${addr.street}, ${addr.city}`);
    });
    
    // Step 2: User A logs out
    console.log('\n🚪 Step 2: User A logs out...');
    await yoraaAPI.logout();
    
    const afterLogout = {
      token: await AsyncStorage.getItem('userToken'),
      userData: await AsyncStorage.getItem('userData'),
      addresses: await AsyncStorage.getItem('userAddresses')
    };
    
    console.log('   Storage after User A logout:');
    console.log('      - userToken:', afterLogout.token ? '❌ STILL EXISTS' : '✅ null');
    console.log('      - userData:', afterLogout.userData ? '❌ STILL EXISTS' : '✅ null');
    console.log('      - userAddresses:', afterLogout.addresses ? '❌ STILL EXISTS' : '✅ null');
    
    // Check for privacy violation
    if (afterLogout.addresses !== null) {
      const staleAddresses = JSON.parse(afterLogout.addresses);
      console.log('\n      🚨 PRIVACY VIOLATION DETECTED!');
      console.log(`      User A's ${staleAddresses.length} addresses still in storage:`);
      staleAddresses.forEach((addr, i) => {
        console.log(`         ${i + 1}. ${addr.street}, ${addr.city}`);
      });
    }
    
    // Step 3: User B logs in
    console.log('\n👤 Step 3: User B logs in...');
    await AsyncStorage.setItem('userToken', 'token_user_b');
    await AsyncStorage.setItem('userData', JSON.stringify({
      id: 'user_b',
      name: 'Bob Brown',
      email: 'bob@test.com'
    }));
    
    // User B hasn't added addresses yet, so shouldn't set any
    // Check what addresses User B sees
    const userBAddresses = await AsyncStorage.getItem('userAddresses');
    
    const userBData = {
      token: await AsyncStorage.getItem('userToken'),
      user: JSON.parse(await AsyncStorage.getItem('userData') || '{}'),
      addresses: userBAddresses ? JSON.parse(userBAddresses) : null
    };
    
    console.log('   ✅ User B logged in:');
    console.log('      - Name:', userBData.user.name);
    console.log('      - Email:', userBData.user.email);
    console.log('      - Addresses:', userBData.addresses ? `${userBData.addresses.length} visible` : 'none (expected)');
    
    // Step 4: Verification
    console.log('\n✅ Step 4: Privacy Check Results');
    
    if (userBData.addresses === null || userBData.addresses.length === 0) {
      console.log('   ✅ PASS: User B sees no addresses (clean state)');
      console.log('   ✅ Privacy maintained: No data leakage between users');
      return { success: true, privacyViolation: false };
    } else {
      console.log('   ❌ FAIL: User B sees addresses!');
      console.log(`   🚨 PRIVACY VIOLATION: User B can see User A's data!`);
      console.log('\n   Leaked addresses:');
      userBData.addresses.forEach((addr, i) => {
        console.log(`      ${i + 1}. ${addr.name} - ${addr.street}, ${addr.city}`);
      });
      console.log('\n   ⚠️ This is a critical security/privacy issue!');
      return { success: false, privacyViolation: true, leakedData: userBData.addresses };
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: error.message };
  } finally {
    // Cleanup
    await AsyncStorage.clear();
    console.log('\n🧹 Test cleanup completed\n');
  }
}

/**
 * Test 3: Complete data audit - check what persists
 */
export async function testCompleteDataAudit() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 TEST 3: Complete Data Audit After Logout              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Step 1: Create comprehensive test data
    console.log('📝 Step 1: Creating comprehensive test data...');
    
    const testData = {
      // Auth data
      'userToken': 'test_token',
      'userData': JSON.stringify({ id: 'user123', name: 'Test User' }),
      
      // Addresses (CRITICAL)
      'userAddresses': JSON.stringify([{ street: '123 Test St' }]),
      'addresses': JSON.stringify([{ street: '456 Alt St' }]),
      'savedAddresses': JSON.stringify([{ street: '789 Saved St' }]),
      'deliveryAddress': JSON.stringify({ street: '101 Delivery St' }),
      'billingAddress': JSON.stringify({ street: '102 Billing St' }),
      'selectedAddress': JSON.stringify({ street: '103 Selected St' }),
      
      // Orders
      'orderHistory': JSON.stringify([{ id: 'order1', total: 99.99 }]),
      'orders': JSON.stringify([{ id: 'order2', total: 149.99 }]),
      
      // Shopping
      'cartItems': JSON.stringify([{ id: 'product1', qty: 2 }]),
      'wishlistItems': JSON.stringify([{ id: 'product2' }]),
      
      // Browsing
      'recentlyViewed': JSON.stringify([{ id: 'product3' }]),
      'recentSearches': JSON.stringify(['laptop', 'phone']),
      
      // Other
      'notifications': JSON.stringify([{ message: 'Test' }]),
      'productReviews': JSON.stringify([{ rating: 5 }])
    };
    
    // Set all test data
    for (const [key, value] of Object.entries(testData)) {
      await AsyncStorage.setItem(key, value);
    }
    
    console.log(`   ✅ Created ${Object.keys(testData).length} test items`);
    
    // Step 2: Verify setup
    console.log('\n📦 Step 2: Verifying test data exists...');
    const allKeysBefore = await AsyncStorage.getAllKeys();
    console.log(`   Total keys: ${allKeysBefore.length}`);
    
    // Step 3: Logout
    console.log('\n🚪 Step 3: Performing logout...');
    await yoraaAPI.logout();
    console.log('   ✅ Logout completed');
    
    // Step 4: Check what remains
    console.log('\n📦 Step 4: Checking what remains after logout...');
    const allKeysAfter = await AsyncStorage.getAllKeys();
    console.log(`   Total keys: ${allKeysAfter.length}`);
    
    // Check each critical key
    const criticalKeys = Object.keys(testData);
    const remainingData = {};
    
    for (const key of criticalKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        remainingData[key] = value;
      }
    }
    
    // Step 5: Report results
    console.log('\n✅ Step 5: Audit Results');
    
    if (Object.keys(remainingData).length === 0) {
      console.log('   ✅ PASS: All user data properly cleared');
      console.log('   ✅ No data leakage detected');
      return { success: true, remainingData: {} };
    } else {
      console.log(`   ❌ FAIL: ${Object.keys(remainingData).length} items remain:`);
      console.log('\n   🚨 DATA STILL PRESENT AFTER LOGOUT:');
      
      Object.keys(remainingData).forEach(key => {
        const isCritical = key.includes('address') || key.includes('Address');
        const icon = isCritical ? '🚨' : '⚠️';
        console.log(`      ${icon} ${key}`);
      });
      
      console.log('\n   ⚠️ Privacy/security issue detected!');
      return { success: false, remainingData };
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: error.message };
  } finally {
    // Cleanup
    await AsyncStorage.clear();
    console.log('\n🧹 Test cleanup completed\n');
  }
}

/**
 * Run all tests
 */
export async function runAllLogoutTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║       LOGOUT DATA PERSISTENCE TEST SUITE                     ║');
  console.log('║       Version 1.0                                             ║');
  console.log('║       Date: November 24, 2024                                 ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  const results = {
    test1: null,
    test2: null,
    test3: null,
    overallSuccess: false
  };
  
  // Run Test 1
  results.test1 = await testAddressPersistence();
  
  // Run Test 2
  results.test2 = await testDeviceSwitching();
  
  // Run Test 3
  results.test3 = await testCompleteDataAudit();
  
  // Overall results
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                  FINAL TEST RESULTS                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  console.log('Test 1 (Address Persistence):', results.test1.success ? '✅ PASS' : '❌ FAIL');
  console.log('Test 2 (Device Switching):', results.test2.success ? '✅ PASS' : '❌ FAIL');
  console.log('Test 3 (Complete Data Audit):', results.test3.success ? '✅ PASS' : '❌ FAIL');
  
  results.overallSuccess = results.test1.success && results.test2.success && results.test3.success;
  
  console.log('\n' + '─'.repeat(65));
  if (results.overallSuccess) {
    console.log('Overall Status: ✅ ALL TESTS PASSED');
    console.log('Logout implementation is secure and working correctly.');
  } else {
    console.log('Overall Status: ❌ TESTS FAILED');
    console.log('🚨 Privacy/security issues detected in logout implementation!');
    console.log('⚠️ Immediate action required to fix data persistence bugs.');
  }
  console.log('─'.repeat(65) + '\n');
  
  return results;
}

// Export default
export default {
  testAddressPersistence,
  testDeviceSwitching,
  testCompleteDataAudit,
  runAllLogoutTests
};
