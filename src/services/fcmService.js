// FCM Service - Handles Firebase Cloud Messaging token registration and notifications
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/networkConfig';

// Create axios instance for FCM API calls
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

class FCMService {
  constructor() {
    this.fcmToken = null;
    this.isInitialized = false;
  }

  /**
   * Initialize FCM service
   * Call this after user successfully logs in
   */
  async initialize() {
    try {
      console.log('🔔 Initializing FCM Service...');

      // Request permission
      const hasPermission = await this.requestUserPermission();
      
      if (!hasPermission) {
        console.warn('⚠️ FCM permission not granted');
        return {
          success: false,
          error: 'Notification permission not granted'
        };
      }

      // Get FCM token
      const token = await this.getFCMToken();
      
      if (!token) {
        console.error('❌ Failed to get FCM token');
        return {
          success: false,
          error: 'Failed to get FCM token'
        };
      }

      this.fcmToken = token;
      this.isInitialized = true;

      // Setup notification listeners
      this.setupNotificationListeners();

      // Setup token refresh listener
      this.setupTokenRefreshListener();

      console.log('✅ FCM Service initialized successfully');
      
      return {
        success: true,
        token: token
      };
    } catch (error) {
      console.error('❌ FCM initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Request notification permission from user
   */
  async requestUserPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ requires runtime permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Android notification permission granted');
            return true;
          } else {
            console.warn('⚠️ Android notification permission denied');
            return false;
          }
        } else {
          // Android 12 and below - permission granted by default
          return true;
        }
      } else if (Platform.OS === 'ios') {
        // iOS permission request
        const authStatus = await messaging().requestPermission();
        
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS notification permission granted:', authStatus);
          return true;
        } else {
          console.warn('⚠️ iOS notification permission denied:', authStatus);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token from Firebase
   */
  async getFCMToken() {
    try {
      // Check if we have a cached token
      const cachedToken = await AsyncStorage.getItem('fcmToken');
      
      if (cachedToken) {
        console.log('📱 Using cached FCM token');
        return cachedToken;
      }

      // Get new token from Firebase
      const token = await messaging().getToken();
      
      if (token) {
        console.log('📱 FCM Token received:', token.substring(0, 20) + '...');
        
        // Cache the token
        await AsyncStorage.setItem('fcmToken', token);
        
        return token;
      } else {
        console.error('❌ No FCM token received');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   * This is the CRITICAL missing piece!
   */
  async registerTokenWithBackend(authToken) {
    try {
      if (!this.fcmToken) {
        console.error('❌ No FCM token available to register');
        return {
          success: false,
          error: 'No FCM token available'
        };
      }

      if (!authToken) {
        console.error('❌ No auth token provided for backend registration');
        return {
          success: false,
          error: 'No authentication token'
        };
      }

      console.log('📤 Registering FCM token with backend...');

      const response = await apiClient.post(
        '/users/update-fcm-token',
        {
          fcmToken: this.fcmToken,
          platform: Platform.OS // 'android' or 'ios'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ FCM token registered with backend successfully');
        
        // Mark as registered
        await AsyncStorage.setItem('fcmTokenRegistered', 'true');
        await AsyncStorage.setItem('fcmTokenRegisteredAt', new Date().toISOString());
        
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('❌ Backend registration failed:', response.data.message);
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('❌ Error registering FCM token with backend:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners() {
    // Handle foreground notifications
    messaging().onMessage(async remoteMessage => {
      console.log('📬 Foreground notification received:', remoteMessage);
      
      // Display notification to user
      if (Platform.OS === 'android') {
        // You can use a library like react-native-push-notification for better control
        Alert.alert(
          remoteMessage.notification?.title || 'New Notification',
          remoteMessage.notification?.body || 'You have a new message'
        );
      }
    });

    // Handle background notifications (when app is in background but not killed)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📬 Background notification received:', remoteMessage);
    });

    // Handle notification opened app (user tapped on notification)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📬 Notification opened app:', remoteMessage);
      // Navigate to specific screen based on notification data
      // Example: navigation.navigate('Orders', { orderId: remoteMessage.data.orderId });
    });

    // Check if app was opened from a notification (when app was killed)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📬 App opened from notification (killed state):', remoteMessage);
          // Navigate to specific screen
        }
      });
  }

  /**
   * Setup token refresh listener
   */
  setupTokenRefreshListener() {
    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      console.log('🔄 FCM Token refreshed:', token.substring(0, 20) + '...');
      
      this.fcmToken = token;
      
      // Update cached token
      await AsyncStorage.setItem('fcmToken', token);
      
      // Re-register with backend
      const authToken = await AsyncStorage.getItem('userToken');
      if (authToken) {
        await this.registerTokenWithBackend(authToken);
      }
    });
  }

  /**
   * Check if FCM token is already registered with backend
   */
  async isTokenRegistered() {
    try {
      const registered = await AsyncStorage.getItem('fcmTokenRegistered');
      return registered === 'true';
    } catch (error) {
      console.error('❌ Error checking token registration status:', error);
      return false;
    }
  }

  /**
   * Clear FCM token (call on logout)
   */
  async clearToken() {
    try {
      console.log('🗑️ Clearing FCM token...');
      
      // Delete token from Firebase
      await messaging().deleteToken();
      
      // Clear cached data
      await AsyncStorage.removeItem('fcmToken');
      await AsyncStorage.removeItem('fcmTokenRegistered');
      await AsyncStorage.removeItem('fcmTokenRegisteredAt');
      
      this.fcmToken = null;
      this.isInitialized = false;
      
      console.log('✅ FCM token cleared');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing FCM token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken() {
    return this.fcmToken;
  }

  /**
   * Check if FCM is initialized
   */
  isReady() {
    return this.isInitialized && this.fcmToken !== null;
  }
}

// Export singleton instance
const fcmService = new FCMService();
export default fcmService;
