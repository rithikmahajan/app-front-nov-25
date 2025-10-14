/**
 * Authentication Debug Utility
 * Use this component to debug authentication issues
 * 
 * Add to any screen to check auth status:
 * import { AuthDebugPanel } from '../utils/authDebug';
 * <AuthDebugPanel />
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStorageService from '../services/authStorageService';
import yoraaAPI from '../services/yoraaAPI';
import auth from '@react-native-firebase/auth';

export const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [expanded, setExpanded] = useState(false);

  const checkAuthStatus = async () => {
    try {
      // Check new auth storage
      const newToken = await authStorageService.getAuthToken();
      const newUserData = await authStorageService.getUserData();
      const isAuth = await authStorageService.isAuthenticated();

      // Check legacy storage
      const legacyToken = await AsyncStorage.getItem('userToken');
      const legacyUserData = await AsyncStorage.getItem('userData');

      // Check Firebase
      const firebaseUser = auth().currentUser;

      // Check yoraaAPI
      const yoraaToken = yoraaAPI.userToken;

      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();

      setDebugInfo({
        timestamp: new Date().toISOString(),
        
        // New Auth Storage
        newAuthStorage: {
          hasToken: !!newToken,
          tokenPreview: newToken ? newToken.substring(0, 30) + '...' : 'NULL',
          hasUserData: !!newUserData,
          userId: newUserData?._id || newUserData?.uid || 'NULL',
          userName: newUserData?.name || 'NULL',
          userEmail: newUserData?.email || 'NULL',
          isAuthenticated: isAuth,
        },

        // Legacy Storage
        legacyStorage: {
          hasToken: !!legacyToken,
          tokenPreview: legacyToken ? legacyToken.substring(0, 30) + '...' : 'NULL',
          hasUserData: !!legacyUserData,
          userDataPreview: legacyUserData ? legacyUserData.substring(0, 100) + '...' : 'NULL',
        },

        // Firebase
        firebase: {
          isSignedIn: !!firebaseUser,
          uid: firebaseUser?.uid || 'NULL',
          email: firebaseUser?.email || 'NULL',
          phoneNumber: firebaseUser?.phoneNumber || 'NULL',
          displayName: firebaseUser?.displayName || 'NULL',
        },

        // Yoraa API
        yoraaAPI: {
          hasToken: !!yoraaToken,
          tokenPreview: yoraaToken ? yoraaToken.substring(0, 30) + '...' : 'NULL',
          isAuthenticated: yoraaAPI.isAuthenticated ? yoraaAPI.isAuthenticated() : 'N/A',
        },

        // All Storage Keys
        allStorageKeys: allKeys,

        // Status Summary
        status: {
          fullyAuthenticated: !!(newToken && newUserData && firebaseUser && yoraaToken),
          authStorageOK: !!(newToken && newUserData),
          firebaseOK: !!firebaseUser,
          backendOK: !!yoraaToken,
        }
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        stack: error.stack,
      });
    }
  };

  useEffect(() => {
    if (expanded) {
      checkAuthStatus();
    }
  }, [expanded]);

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => {
          setExpanded(!expanded);
          if (!expanded) {
            checkAuthStatus();
          }
        }}
      >
        <Text style={styles.toggleButtonText}>
          {expanded ? '🔽 Hide Auth Debug' : '🔼 Show Auth Debug'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView style={styles.debugPanel}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={checkAuthStatus}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>

          <Text style={styles.debugText}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>

          {debugInfo.status && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Quick Status:</Text>
              <Text style={debugInfo.status.fullyAuthenticated ? styles.statusOK : styles.statusError}>
                {debugInfo.status.fullyAuthenticated ? '✅ Fully Authenticated' : '❌ Not Fully Authenticated'}
              </Text>
              <Text style={debugInfo.status.authStorageOK ? styles.statusOK : styles.statusError}>
                {debugInfo.status.authStorageOK ? '✅ Auth Storage OK' : '❌ Auth Storage Missing'}
              </Text>
              <Text style={debugInfo.status.firebaseOK ? styles.statusOK : styles.statusError}>
                {debugInfo.status.firebaseOK ? '✅ Firebase OK' : '❌ Firebase Not Signed In'}
              </Text>
              <Text style={debugInfo.status.backendOK ? styles.statusOK : styles.statusError}>
                {debugInfo.status.backendOK ? '✅ Backend Token OK' : '❌ Backend Token Missing'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  debugPanel: {
    backgroundColor: '#000',
    maxHeight: 400,
    padding: 10,
  },
  debugText: {
    color: '#0F0',
    fontFamily: 'Courier',
    fontSize: 10,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#222',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  statusTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  statusOK: {
    color: '#0F0',
    fontSize: 12,
    marginBottom: 4,
  },
  statusError: {
    color: '#F00',
    fontSize: 12,
    marginBottom: 4,
  },
});

/**
 * Simple function to log auth status to console
 * Call this from anywhere: logAuthStatus()
 */
export const logAuthStatus = async () => {
  console.log('🔍 ========== AUTH DEBUG ==========');
  
  try {
    const newToken = await authStorageService.getAuthToken();
    const newUserData = await authStorageService.getUserData();
    const isAuth = await authStorageService.isAuthenticated();
    const legacyToken = await AsyncStorage.getItem('userToken');
    const firebaseUser = auth().currentUser;
    const yoraaToken = yoraaAPI.userToken;

    console.log('📦 New Auth Storage:', {
      hasToken: !!newToken,
      hasUserData: !!newUserData,
      isAuthenticated: isAuth,
      userId: newUserData?._id || newUserData?.uid,
    });

    console.log('📦 Legacy Storage:', {
      hasToken: !!legacyToken,
    });

    console.log('🔥 Firebase:', {
      isSignedIn: !!firebaseUser,
      uid: firebaseUser?.uid,
      email: firebaseUser?.email,
    });

    console.log('🌐 Yoraa API:', {
      hasToken: !!yoraaToken,
    });

    console.log('✅ Status:', {
      fullyAuthenticated: !!(newToken && newUserData && firebaseUser && yoraaToken),
    });

  } catch (error) {
    console.error('❌ Error checking auth status:', error);
  }
  
  console.log('🔍 ===================================');
};

/**
 * Clear all authentication data (for testing)
 */
export const clearAllAuth = async () => {
  console.log('🧹 Clearing all authentication data...');
  
  try {
    await authStorageService.clearAuthData();
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('sessionData');
    await AsyncStorage.removeItem('isAuthenticated');
    await auth().signOut();
    
    console.log('✅ All auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

export default {
  AuthDebugPanel,
  logAuthStatus,
  clearAllAuth,
};
