import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    width: width * 0.85,
    minHeight: 300,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.41,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#767676',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.41,
    opacity: 0.75,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    width: 280,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 51,
    paddingVertical: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 19.2,
  },
});

export default CreateAccountEmailSuccessModal;