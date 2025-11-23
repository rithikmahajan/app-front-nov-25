import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  wp,
  hp,
  fs,
  device,
  isTablet,
  isSmallDevice,
  getScreenDimensions,
} from '../utils/responsive';

const { width } = getScreenDimensions();

const CreateAccountEmailSuccessModal = ({ navigation }) => {
  const handleContinueShopping = () => {
    // Navigate to login email screen
    if (navigation) {
      navigation.navigate('LoginAccountEmail');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalContainer}>
        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>Account created !</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your YORAA account has been created successfully
          </Text>
          
          {/* Continue Shopping Button */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    width: width * 0.85,
    minHeight: getResponsiveValue(300, 340, 380),
    paddingVertical: getResponsiveSpacing(40),
    paddingHorizontal: getResponsiveSpacing(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize(18),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: getResponsiveValue(22, 25, 28),
    letterSpacing: -0.41,
    marginBottom: getResponsiveSpacing(20),
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Regular',
    color: '#767676',
    textAlign: 'center',
    lineHeight: getResponsiveValue(22, 25, 28),
    letterSpacing: -0.41,
    opacity: 0.75,
    marginBottom: getResponsiveSpacing(40),
    paddingHorizontal: getResponsiveSpacing(10),
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    width: getResponsiveValue(280, 320, 360),
    height: getResponsiveValue(48, 54, 60),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(51),
    paddingVertical: getResponsiveSpacing(16),
  },
  continueButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: getResponsiveValue(19.2, 22, 24),
  },
});

export default CreateAccountEmailSuccessModal;