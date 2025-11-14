/**
 * Temporary Debug Component for Referral Code Testing
 * Add this to your InviteAFriend.js temporarily to see what's happening
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import yoraaAPI from '../services/yoraaAPI';

const DebugReferralCode = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [testing, setTesting] = useState(false);

  const testAllEndpoints = async () => {
    setTesting(true);
    let results = '🧪 TESTING ALL REFERRAL ENDPOINTS\n\n';
    
    // Test 1: Check authentication
    results += '1️⃣ Authentication Check:\n';
    const isAuth = yoraaAPI.isAuthenticated();
    const token = yoraaAPI.getUserToken();
    results += `   Authenticated: ${isAuth}\n`;
    results += `   Token exists: ${token ? 'YES' : 'NO'}\n`;
    if (token) {
      results += `   Token preview: ${token.substring(0, 30)}...\n`;
    }
    results += '\n';

    // Test 2: Get user data
    results += '2️⃣ User Data:\n';
    try {
      const userData = await yoraaAPI.getUserData();
      results += `   User: ${JSON.stringify(userData, null, 2)}\n`;
    } catch (error) {
      results += `   Error: ${error.message}\n`;
    }
    results += '\n';

    // Test 3: Try referral code endpoint
    results += '3️⃣ Referral Code API:\n';
    try {
      const response = await yoraaAPI.getUserReferralCode();
      results += `   Success: ${response.success}\n`;
      results += `   Data: ${JSON.stringify(response.data, null, 2)}\n`;
      results += `   Message: ${response.message}\n`;
    } catch (error) {
      results += `   Error: ${error.message}\n`;
    }
    results += '\n';

    // Test 4: Try promo codes endpoint directly
    results += '4️⃣ Promo Codes API:\n';
    try {
      const response = await yoraaAPI.getAvailablePromoCodes();
      results += `   Success: ${response.success}\n`;
      results += `   Data: ${JSON.stringify(response.data, null, 2)}\n`;
    } catch (error) {
      results += `   Error: ${error.message}\n`;
    }
    results += '\n';

    // Test 5: Try user profile
    results += '5️⃣ User Profile API:\n';
    try {
      const response = await yoraaAPI.getUserProfile();
      results += `   Success: ${response.success}\n`;
      if (response.data) {
        results += `   Name: ${response.data.name}\n`;
        results += `   Referral Code: ${response.data.referralCode || 'NOT FOUND'}\n`;
      }
    } catch (error) {
      results += `   Error: ${error.message}\n`;
    }
    results += '\n';

    results += '✅ Testing complete!\n';
    setDebugInfo(results);
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Referral Code Debugger</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={testAllEndpoints}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      {debugInfo ? (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsText}>{debugInfo}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  resultsText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#333',
  },
});

export default DebugReferralCode;

/*
HOW TO USE:
1. Temporarily add this to your InviteAFriend.js screen at the top (before the main content)
2. Run the app and navigate to "Invite a Friend"
3. Tap "Run All Tests" button
4. Share the debug output with me

Example integration in InviteAFriend.js:

import DebugReferralCode from './DebugReferralCode'; // Add this import

// In the render, add this at the top of the content:
return (
  <SafeAreaView style={styles.container}>
    {__DEV__ && <DebugReferralCode />}  // Add this line
    <View style={styles.header}>
      ...rest of your code
    </View>
  </SafeAreaView>
);
*/
