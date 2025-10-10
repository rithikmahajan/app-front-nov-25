import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Config from 'react-native-config';
import environmentConfig from '../config/environment';
import { API_CONFIG } from '../config/apiConfig';

const EnvironmentTest = () => {
  const config = environmentConfig.getAllConfig();

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${environmentConfig.getApiUrl()}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      if (response.ok) {
        Alert.alert('✅ API Test', `Successfully connected to: ${environmentConfig.getApiUrl()}`);
      } else {
        Alert.alert('⚠️ API Test', `Failed with status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('❌ API Test', `Connection failed: ${error.message}`);
    }
  };

  const getStatusColor = (isDev) => isDev ? '#e6f3ff' : '#f0f8e6';
  const getStatusIcon = (value) => value ? '✅' : '❌';

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.card, { backgroundColor: getStatusColor(config.isDevelopment) }]}>
        <Text style={styles.title}>🔧 Environment Configuration Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Environment Info:</Text>
          <Text style={styles.item}>• Environment: <Text style={styles.value}>{config.environment}</Text></Text>
          <Text style={styles.item}>• Is Development: <Text style={styles.value}>{getStatusIcon(config.isDevelopment)}</Text></Text>
          <Text style={styles.item}>• Is Production: <Text style={styles.value}>{getStatusIcon(config.isProduction)}</Text></Text>
          <Text style={styles.item}>• Build Type: <Text style={styles.value}>{config.build.type}</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 API Configuration:</Text>
          <Text style={styles.item}>• API URL: <Text style={styles.value}>{config.api.baseUrl}</Text></Text>
          <Text style={styles.item}>• Backend URL: <Text style={styles.value}>{config.api.backendUrl}</Text></Text>
          <Text style={styles.item}>• Use Proxy: <Text style={styles.value}>{getStatusIcon(config.proxy.enabled)}</Text></Text>
          <Text style={styles.item}>• Proxy Port: <Text style={styles.value}>{config.proxy.port || 'N/A'}</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 App Configuration:</Text>
          <Text style={styles.item}>• App Name: <Text style={styles.value}>{config.app.name}</Text></Text>
          <Text style={styles.item}>• App Title: <Text style={styles.value}>{config.app.title}</Text></Text>
          <Text style={styles.item}>• Debug Mode: <Text style={styles.value}>{getStatusIcon(config.debug.enabled)}</Text></Text>
          <Text style={styles.item}>• Show Debug Info: <Text style={styles.value}>{getStatusIcon(config.debug.showInfo)}</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Platform Info:</Text>
          <Text style={styles.item}>• Platform: <Text style={styles.value}>{config.platform.isIOS ? 'iOS' : 'Android'}</Text></Text>
          <Text style={styles.item}>• Is iOS: <Text style={styles.value}>{getStatusIcon(config.platform.isIOS)}</Text></Text>
          <Text style={styles.item}>• Is Android: <Text style={styles.value}>{getStatusIcon(config.platform.isAndroid)}</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 React Native Config Values:</Text>
          <Text style={styles.item}>• API_BASE_URL: <Text style={styles.value}>{Config.API_BASE_URL}</Text></Text>
          <Text style={styles.item}>• APP_ENV: <Text style={styles.value}>{Config.APP_ENV}</Text></Text>
          <Text style={styles.item}>• DEBUG_MODE: <Text style={styles.value}>{Config.DEBUG_MODE}</Text></Text>
          <Text style={styles.item}>• USE_PROXY: <Text style={styles.value}>{Config.USE_PROXY}</Text></Text>
          <Text style={styles.item}>• BUILD_TYPE: <Text style={styles.value}>{Config.BUILD_TYPE}</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Runtime Info:</Text>
          <Text style={styles.item}>• __DEV__: <Text style={styles.value}>{getStatusIcon(__DEV__)}</Text></Text>
          <Text style={styles.item}>• Computed API URL: <Text style={styles.value}>{environmentConfig.getApiUrl()}</Text></Text>
          <Text style={styles.item}>• API Config Base: <Text style={styles.value}>{API_CONFIG.BASE_URL}</Text></Text>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={testApiConnection}>
          <Text style={styles.testButtonText}>🧪 Test API Connection</Text>
        </TouchableOpacity>

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            Status: {config.isDevelopment ? '🟡 Development' : '🟢 Production'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBar: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default EnvironmentTest;
