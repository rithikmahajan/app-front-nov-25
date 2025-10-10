import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import yoraaAPI from '../services/yoraaAPI';

const { width } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onSignOut, navigation }) => {
  const handleStay = () => {
    onClose();
  };

  const handleSignOut = async () => {
    try {
      // Close the modal first
      onClose();
      
      console.log('🔐 Starting comprehensive logout process...');
      
      // 1. Sign out from Firebase
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        await auth().signOut();
        console.log('✅ Firebase logout successful');
      }
      
      // 2. Sign out from backend and clear all tokens
      try {
        await yoraaAPI.logoutComplete();
        console.log('✅ Backend logout successful');
      } catch (error) {
        console.warn('⚠️ Backend logout failed (continuing):', error);
      }
      
      // 3. Clear all authentication-related data from AsyncStorage
      const keysToRemove = [
        'userToken',
        'adminToken', 
        'userData',
        'refreshToken',
        'auth_token',
        'guestSessionId',
        'userEmail',
        'userPhone',
        'isAuthenticated'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ All authentication data cleared');
      
      // 4. Clear any cached user preferences that should reset on logout
      const userPreferenceKeys = [
        'userAddresses',
        'userPaymentMethods',
        'userLocationPreference'
      ];
      
      await AsyncStorage.multiRemove(userPreferenceKeys);
      console.log('✅ User preferences cleared');
      
      // 5. Navigate to appropriate screen (Rewards as requested)
      if (navigation) {
        navigation.navigate('Rewards');
        console.log('📱 Navigated to Rewards screen');
      }
      
      // 6. Call the onSignOut callback if provided
      if (onSignOut) {
        onSignOut();
      }
      
      console.log('✅ Complete logout process finished');
      
      // Show success message
      Alert.alert(
        'Signed Out',
        'You have been successfully signed out.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Even if there's an error, try to clear local storage
      try {
        await AsyncStorage.clear();
        console.log('🗑️ Cleared all AsyncStorage as fallback');
      } catch (clearError) {
        console.error('❌ Failed to clear AsyncStorage:', clearError);
      }
      
      Alert.alert(
        'Logout',
        'You have been signed out.',
        [{ text: 'OK' }]
      );
      
      // Still navigate and call callback
      if (navigation) {
        navigation.navigate('Rewards');
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
