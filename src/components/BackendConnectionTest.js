import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import yoraaAPI from '../services/yoraaBackendAPI';

const BackendConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [healthData, setHealthData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('testing');

      // Initialize API service
      await yoraaAPI.initialize();

      // Test health endpoint
      console.log('🔍 Testing health endpoint...');
      const healthResponse = await yoraaAPI.checkHealth();
      
      if (healthResponse.success) {
        setHealthData(healthResponse.data);
        setConnectionStatus('connected');
        console.log('✅ Health check passed');

        // Test loading products
        await loadInitialData();
      } else {
        setConnectionStatus('error');
        console.log('❌ Health check failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Connection test failed:', error);
      Alert.alert('Connection Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      console.log('📦 Loading initial data...');

      // Load products
      const productsResponse = await yoraaAPI.getProducts();
      if (productsResponse.success) {
        setProducts(productsResponse.data.slice(0, 3)); // Show first 3
        console.log(`✅ Loaded ${productsResponse.data.length} products`);
      }

      // Load categories
      const categoriesResponse = await yoraaAPI.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.slice(0, 3)); // Show first 3
        console.log(`✅ Loaded ${categoriesResponse.data.length} categories`);
      }
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
    }
  };

  const testFirebaseAuth = async () => {
    try {
      Alert.alert(
        'Firebase Test',
        'This would normally use your Firebase authentication. For now, this is a placeholder.'
      );
    } catch (error) {
      Alert.alert('Auth Error', error.message);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'error': return '#F44336';
      case 'testing': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected to Backend';
      case 'error': return '❌ Connection Failed';
      case 'testing': return '🔍 Testing Connection...';
      default: return '⏳ Initializing...';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connection Test</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Testing backend connection...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Info</Text>
        <Text style={styles.info}>URL: http://192.168.1.65:8001/api</Text>
        <Text style={styles.info}>Status: {connectionStatus}</Text>
        {healthData && (
          <View>
            <Text style={styles.info}>Server Time: {healthData.timestamp}</Text>
            <Text style={styles.info}>Uptime: {healthData.uptime}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Actions</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testBackendConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔄 Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={loadInitialData}
          disabled={loading || connectionStatus !== 'connected'}
        >
          <Text style={styles.buttonText}>📦 Load Products</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testFirebaseAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔐 Test Firebase Auth</Text>
        </TouchableOpacity>
      </View>

      {products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Products ({products.length})</Text>
          {products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>{product.name || 'Unnamed Product'}</Text>
              <Text style={styles.productPrice}>
                ${product.price || 'N/A'} - {product.category || 'No category'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Categories ({categories.length})</Text>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name || 'Unnamed Category'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Details</Text>
        <Text style={styles.info}>Frontend IP: 192.168.1.7:5001</Text>
        <Text style={styles.info}>Backend IP: 192.168.1.65:8001</Text>
        <Text style={styles.info}>Platform: iOS Simulator</Text>
        <Text style={styles.info}>Bundle ID: com.yoraaapparelsprivatelimited.yoraa</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    color: '#666',
    marginTop: 2,
  },
  categoryItem: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 5,
  },
  categoryName: {
    color: '#333',
    fontWeight: '500',
  },
});

export default BackendConnectionTest;
