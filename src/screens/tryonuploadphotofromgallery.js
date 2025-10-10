import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TryOnUploadPhotoFromGallery = ({ navigation, route }) => {
  const { previousScreen } = route?.params || {};
  const [showModal, setShowModal] = useState(false);
  const modalSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // Show modal with animation when component mounts
    setShowModal(true);
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalSlideAnim]);

  const handleCloseModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      if (previousScreen) {
        navigation?.goBack();
      } else {
        navigation?.navigate('TryOnProTips');
      }
    });
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        console.log('Photo taken:', imageUri);
        handleCloseModal();
        // Navigate to upload modal with photo
        navigation?.navigate('TryUploadFromGalleryUploadModal', { 
          photo: imageUri, 
          previousScreen: 'TryOnUploadPhotoFromGallery' 
        });
      }
    });
  };

  const handleChooseFromLibrary = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        console.log('Photo selected:', imageUri);
        handleCloseModal();
        // Navigate to upload modal with photo
        navigation?.navigate('TryUploadFromGalleryUploadModal', { 
          photo: imageUri, 
          previousScreen: 'TryOnUploadPhotoFromGallery' 
        });
      }
    });
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseModal}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.3)" translucent />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Main Modal Content */}
          <Animated.View 
            style={[
              styles.uploadModal,
              { transform: [{ translateY: modalSlideAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload photo from gallery</Text>
              <Text style={styles.modalDescription}>
                By confirming the photo, you confirm that you own the photo and have the right to send it to us. You also consent that we may use this image as it may contain personal information
              </Text>
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonLast]} 
                onPress={handleChooseFromLibrary}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  Upload from photos
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Cancel Button - Separate Container */}
          <Animated.View 
            style={[
              styles.modalCancelContainer,
              { transform: [{ translateY: modalSlideAnim }] }
            ]}
          >
            <TouchableOpacity style={styles.modalCancelButton} onPress={handleCloseModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingHorizontal: 12,
    paddingBottom: 34, // Safe area bottom
  },
  uploadModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    color: '#3D3D3D',
    textAlign: 'center',
    letterSpacing: -0.08,
    lineHeight: 18,
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#3D3D3D',
    textAlign: 'center',
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  modalButtonContainer: {
    overflow: 'hidden',
  },
  modalButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
  },
  modalButtonLast: {
    borderBottomWidth: 0,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#007AFF',
    letterSpacing: -0.43,
    lineHeight: 22,
  },
  modalButtonSecondaryText: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
    color: '#AEAEB2',
    letterSpacing: -0.43,
    lineHeight: 22,
  },
  modalCancelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    color: '#007AFF',
    letterSpacing: -0.43,
    lineHeight: 22,
  },
});

export default TryOnUploadPhotoFromGallery;
