import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const ForgotLoginPasswordConfirmationModal = ({ navigation }) => {
  const handleContinue = () => {
    // Navigate to login account email screen
    if (navigation) {
      navigation.navigate('LoginAccountEmail');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Title and description */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Your password has been changed</Text>
              <Text style={styles.description}>Welcome back! Discover now!</Text>
            </View>
            
            {/* Continue button */}
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 82,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1.5,
    elevation: 5,
  },
  handleBar: {
    width: 102,
    height: 8,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 80,
  },
  contentContainer: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 17,
    fontWeight: '400',
    color: '#332218',
    textAlign: 'center',
    letterSpacing: -0.41,
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: '#332218',
    opacity: 0.6,
    textAlign: 'center',
    letterSpacing: -0.12,
    lineHeight: 'normal',
    fontFamily: 'Montserrat-Regular',
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 30,
    width: 315,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22.5,
    fontFamily: 'Montserrat-Bold',
  },
});

export default ForgotLoginPasswordConfirmationModal;
