import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import yoraaAPI from '../services/yoraaAPI';
import sessionManager from '../services/sessionManager';

const { width } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onSignOut, navigation }) => {
  // Log navigation availability for debugging
  React.useEffect(() => {
    if (visible) {
      console.log('🔍 LogoutModal navigation check:', {
        hasNavigation: !!navigation,
        hasReset: navigation && typeof navigation.reset === 'function',
        hasNavigate: navigation && typeof navigation.navigate === 'function',
        navigationKeys: navigation ? Object.keys(navigation) : [],
      });
    }
  }, [visible, navigation]);

  const handleStay = () => {
    onClose();
  };

  const handleSignOut = async () => {
    try {
      // Close the modal first
      onClose();
      
      console.log('🔐 Starting comprehensive logout process...');
      
      // 1. CRITICAL: Unregister FCM token FIRST (before clearing auth tokens)
      console.log('🔔 STEP 1: Unregistering FCM token...');
      try {
        const fcmService = require('../services/fcmService').default;
        const authToken = await AsyncStorage.getItem('userToken');
        
        if (authToken) {
          const unregisterResult = await fcmService.unregisterTokenFromBackend(authToken);
          
          if (unregisterResult.success) {
            console.log('✅ FCM token unregistered from backend');
          } else {
            console.warn('⚠️ FCM unregister failed (non-critical):', unregisterResult.error);
          }
        } else {
          console.log('ℹ️ No auth token found, skipping FCM unregistration');
        }
      } catch (fcmError) {
        console.warn('⚠️ FCM unregistration error (non-critical):', fcmError.message);
        // Continue with logout even if FCM fails
      }
      
      // 2. CRITICAL: Clear backend tokens (after FCM unregistration)
      // This prevents race conditions where Firebase auth state changes
      // trigger reinitialization before tokens are cleared
      try {
        await yoraaAPI.logoutComplete();
        console.log('✅ Backend logout successful');
      } catch (error) {
        console.warn('⚠️ Backend logout failed (continuing):', error);
      }
      
      // 3. Clear session manager (after backend to use existing session data)
      try {
        await sessionManager.logout();
        console.log('✅ Session manager cleared');
      } catch (sessionError) {
        console.warn('⚠️ Session manager logout failed (continuing):', sessionError);
      }
      
      // 4. Sign out from Firebase (AFTER clearing backend tokens)
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        console.log('🔥 Signing out Firebase user:', firebaseUser.email || firebaseUser.uid);
        await auth().signOut();
        console.log('✅ Firebase logout successful');
      } else {
        console.log('ℹ️ No Firebase user to sign out');
      }
      
      // 5. Sign out from Google if signed in
      console.log('🔵 Checking Google sign-in status...');
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        const isSignedIn = await GoogleSignin.isSignedIn();
        
        if (isSignedIn) {
          await GoogleSignin.signOut();
          console.log('✅ Google sign-out successful');
        } else {
          console.log('ℹ️ Not signed in with Google');
        }
      } catch (googleError) {
        console.warn('⚠️ Google sign-out failed (continuing):', googleError.message);
      }
      
      // 6. Clear all authentication-related data from AsyncStorage
      const keysToRemove = [
        'userToken',
        'adminToken', 
        'userData',
        'refreshToken',
        'auth_token',
        'guestSessionId',
        'userEmail',
        'userPhone',
        'isAuthenticated',
        'session_data',
        'session_created_at',
        'session_last_activity',
        'fcmToken', // Clear FCM token from local storage
        'token',
        'user'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ All authentication data cleared');
      
      // 7. Clear any cached user preferences that should reset on logout
      const userPreferenceKeys = [
        'userAddresses',
        'userPaymentMethods',
        'userLocationPreference'
      ];
      
      await AsyncStorage.multiRemove(userPreferenceKeys);
      console.log('✅ User preferences cleared');
      
      // 8. Navigate to appropriate screen (Rewards as requested)
      if (navigation && typeof navigation.reset === 'function') {
        try {
          // Use reset to ensure clean navigation stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Rewards' }],
          });
          console.log('📱 Navigated to Rewards screen (reset stack)');
        } catch (navError) {
          console.warn('⚠️ Navigation reset failed, trying navigate:', navError);
          // Fallback to regular navigation
          if (typeof navigation.navigate === 'function') {
            navigation.navigate('Rewards');
          }
        }
      } else {
        console.log('ℹ️ Navigation not available, skipping navigation');
      }
      
      // 9. Call the onSignOut callback if provided
      if (onSignOut) {
        onSignOut();
      }
      
      console.log('✅ Complete logout process finished');
      
      // Success message removed as per user request
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Even if there's an error, try to clear local storage
      try {
        await AsyncStorage.clear();
        console.log('🗑️ Cleared all AsyncStorage as fallback');
      } catch (clearError) {
        console.error('❌ Failed to clear AsyncStorage:', clearError);
      }
      
      // Alert removed as per user request
      
      // Still navigate and call callback
      if (navigation && typeof navigation.reset === 'function') {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Rewards' }],
          });
        } catch (navError) {
          console.warn('⚠️ Navigation reset failed in error handler:', navError);
          // Try fallback navigation
          if (typeof navigation.navigate === 'function') {
            navigation.navigate('Rewards');
          }
        }
      }
      if (onSignOut) {
        onSignOut();
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Are you sure you want to leave?</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.stayButton} onPress={handleStay}>
              <Text style={styles.stayButtonText}>stay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingTop: 43,
    paddingBottom: 40,
    paddingHorizontal: 31,
    width: width * 0.9,
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 81,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: 'Montserrat-Bold',
    width: 319,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 0,
  },
  stayButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    height: 56,
    flex: 1,
  },
  stayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e4e4e4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    height: 56,
    flex: 1,
  },
  signOutButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2,
  },
});

export default LogoutModal;
