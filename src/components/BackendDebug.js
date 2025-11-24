/**
 * Backend Connection Debug Component
 * Add this to your HomeScreen to see what URL is being used
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { API_CONFIG } from '../config/apiConfig';
import environmentConfig from '../config/environment';
import axios from 'axios';

const BackendDebug = () => {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});

  const testBackend = async () => {
    try {
      const url = API_CONFIG.BASE_URL;
      console.log('🧪 Testing backend at:', url);
      console.log('📊 Environment info:', {
        env: environmentConfig.env,
        isDevelopment: environmentConfig.isDevelopment,
        __DEV__,
      });
      
      // Capture debug info
      setDebugInfo({
        __DEV__: __DEV__,
        isDevelopment: environmentConfig.isDevelopment,
      });
      
      // Test categories endpoint
      const response = await axios.get(`${url}/categories`, { timeout: 5000 });
      setBackendStatus('✅ Connected');
      setCategoriesCount(response.data?.length || 0);
      console.log('✅ Backend working! Categories:', response.data?.length);
    } catch (error) {
      setBackendStatus('❌ Failed: ' + error.message);
      console.error('❌ Backend test failed:', error);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Backend Debug Info</Text>
      <Text style={styles.info}>__DEV__: {String(__DEV__)}</Text>
      <Text style={styles.info}>isDev: {String(environmentConfig.isDevelopment)}</Text>
      <Text style={styles.info}>Environment: {environmentConfig.env}</Text>
      <Text style={styles.info}>Backend URL: {API_CONFIG.BASE_URL}</Text>
      <Text style={styles.info}>Status: {backendStatus}</Text>
      <Text style={styles.info}>Categories: {categoriesCount}</Text>
      <TouchableOpacity style={styles.button} onPress={testBackend}>
        <Text style={styles.buttonText}>🔄 Retest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BackendDebug;
