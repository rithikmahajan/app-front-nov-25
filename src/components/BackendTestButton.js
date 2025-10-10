import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import yoraaAPI from '../services/yoraaBackendAPI';

const BackendTestButton = () => {
  const [status, setStatus] = useState('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testBackend = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing...');
      
      console.log('🔍 Starting backend connection test...');
      
      // Initialize API service
      await yoraaAPI.initialize();
      
      // Test connection
      const isConnected = await yoraaAPI.testConnection();
      
      if (isConnected) {
        setStatus('✅ Connected');
        Alert.alert('Success!', 'Backend connection successful!');
        
        // Try to load some products
        const products = await yoraaAPI.getProducts();
        console.log('📦 Products loaded:', products.data?.length || 0);
        
      } else {
        setStatus('❌ Failed');
        Alert.alert('Connection Failed', 'Could not connect to backend');
      }
      
    } catch (error) {
      setStatus('❌ Error');
      console.error('❌ Backend test error:', error);
      Alert.alert('Error', `Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.url}>http://localhost:8001/api</Text>
      <Text style={styles.status}>Status: {status}</Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testBackend}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : '🔗 Test Backend Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BackendTestButton;
