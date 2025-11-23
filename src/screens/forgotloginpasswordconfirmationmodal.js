import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const ForgotLoginPasswordConfirmationModal = ({ navigation }) => {
  const handleContinue = () => {
    if (navigation) {
      navigation.navigate('LoginAccountEmail');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />
          
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Your password has been changed</Text>
              <Text style={styles.description}>Welcome back! Discover now!</Text>
            </View>
            
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
    borderTopLeftRadius: isTablet ? 50 : 45,
    borderTopRightRadius: isTablet ? 50 : 45,
    paddingHorizontal: wp(isTablet ? 10 : 8),
    paddingTop: hp(isTablet ? 2.5 : 2),
    paddingBottom: hp(isTablet ? 12 : 10),
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
    width: wp(isTablet ? 30 : 27),
    height: hp(isTablet ? 1.2 : 1),
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: hp(isTablet ? 12 : 10),
  },
  contentContainer: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: hp(isTablet ? 12 : 10),
  },
  title: {
    fontSize: fs(isTablet ? 22 : isSmallDevice ? 15 : 17),
    fontWeight: '400',
    color: '#332218',
    textAlign: 'center',
    letterSpacing: -0.41,
    lineHeight: fs(isTablet ? 30 : isSmallDevice ? 20 : 22),
    marginBottom: hp(isTablet ? 2.5 : 1.8),
    fontFamily: 'Montserrat-Regular',
  },
  description: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 11 : 12),
    fontWeight: '400',
    color: '#332218',
    opacity: 0.6,
    textAlign: 'center',
    letterSpacing: -0.12,
    fontFamily: 'Montserrat-Regular',
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 30,
    width: wp(isTablet ? 70 : 84),
    height: hp(isTablet ? 8 : 7.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 14 : 16),
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: fs(isTablet ? 28 : 22.5),
    fontFamily: 'Montserrat-Bold',
  },
});

export default ForgotLoginPasswordConfirmationModal;
