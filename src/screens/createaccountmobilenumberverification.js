import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { BackIcon } from '../assets/icons';
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

const CreateAccountMobileNumberVerification = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  const handleSkip = () => {
    // Navigate back to previous screen
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleBackPress = () => {
    // Navigate back to CreateAccountMobileNumber screen
    if (navigation) {
      navigation.navigate('CreateAccountMobileNumber');
    }
  };

  const handleVerification = () => {
    // Handle verification logic
    const code = verificationCode.join('');
    console.log('Verification code:', code); // For debugging
    
    // Navigate to account created confirmation modal
    if (navigation) {
      navigation.navigate('CreateAccountMobileNumberAccountCreatedConfirmationModal');
    }
  };

  const handleCodeChange = (text, index) => {
    if (text.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = text;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    // Handle resend code logic
    // Resend verification code logged - removed for production
    setResendTimer(30);
    // Reset timer countdown logic would go here
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with Back button and Skip button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <BackIcon size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verify your mobile number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to your mobile number
          </Text>
        </View>

        {/* Verification Code Input */}
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={`create-verification-code-${index}`}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            !isCodeComplete && styles.verifyButtonDisabled
          ]} 
          onPress={handleVerification}
          disabled={!isCodeComplete}
        >
          <Text style={[
            styles.verifyButtonText,
            !isCodeComplete && styles.verifyButtonTextDisabled
          ]}>
            VERIFY
          </Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Resend in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(32),
    paddingTop: getResponsiveSpacing(20),
  },
  backButton: {
    paddingVertical: getResponsiveSpacing(8),
    paddingRight: getResponsiveSpacing(8),
  },
  skipButton: {
    paddingVertical: getResponsiveSpacing(8),
  },
  skipText: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    textAlign: 'right',
  },
  titleContainer: {
    paddingHorizontal: getResponsiveSpacing(33),
    marginTop: getResponsiveSpacing(40),
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize(24),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: getResponsiveValue(32, 36, 40),
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16),
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: getResponsiveValue(24, 27, 30),
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(33),
    marginTop: getResponsiveSpacing(60),
    gap: getResponsiveSpacing(12),
  },
  codeInput: {
    width: getResponsiveValue(45, 52, 60),
    height: getResponsiveValue(55, 62, 70),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: getResponsiveFontSize(24),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    marginHorizontal: getResponsiveSpacing(38),
    marginTop: getResponsiveSpacing(60),
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: getResponsiveValue(51, 58, 64),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  verifyButtonTextDisabled: {
    color: '#999999',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getResponsiveSpacing(40),
    paddingHorizontal: getResponsiveSpacing(33),
  },
  resendText: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  resendTimer: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  resendLink: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});

export default CreateAccountMobileNumberVerification;
