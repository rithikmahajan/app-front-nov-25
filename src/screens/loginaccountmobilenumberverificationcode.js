import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import phoneAuthService from '../services/phoneAuthService';
import sessionManager from '../services/sessionManager';

const LoginAccountMobileNumberVerificationCode = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  
  // Get params from navigation
  const phoneNumber = route?.params?.phoneNumber || '';
  const confirmation = route?.params?.confirmation || null;
  const countryCode = route?.params?.countryCode || '';
  const mobileNumber = route?.params?.mobileNumber || '';

  const handleVerification = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    if (!confirmation) {
      Alert.alert('Error', 'No verification session found. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📱 Verifying OTP:', code);
      
      // Verify OTP using Firebase Phone Auth
      const userCredential = await phoneAuthService.verifyOTP(code, confirmation);
      const user = userCredential.user;
      
      console.log('✅ Phone authentication successful:', user.uid);
      
      // Wait a moment for Firebase auth state to fully propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify user is still signed in
      const currentUser = phoneAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication failed. Please try again.');
      }
      
      // Create session for phone login
      await sessionManager.createSession({
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber || phoneNumber,
        displayName: user.displayName
      }, 'phone');
      
      console.log('✅ Session created for phone login');
      
      Alert.alert(
        'Success', 
        'Phone number verified successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Terms and Conditions screen after successful login verification
              if (navigation) {
                navigation.navigate('TermsAndConditions', { 
                  previousScreen: 'LoginAccountMobileNumberVerificationCode',
                  user: user,
                  fromCheckout: route?.params?.fromCheckout
                });
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Handle specific authentication errors
      let errorMessage = error.message || 'Invalid verification code. Please try again.';
      
      if (error.message?.includes('no-current-user') || 
          error.message?.includes('No user currently signed in')) {
        errorMessage = 'Authentication session expired. Please request a new OTP.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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

  const handleResendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Resending OTP to:', phoneNumber);
      
      // Resend OTP using Firebase Phone Auth
      const newConfirmation = await phoneAuthService.resendOTP(phoneNumber);
      
      // Update the confirmation object for this screen
      if (route?.params) {
        route.params.confirmation = newConfirmation;
      }
      
      // Reset verification code inputs
      setVerificationCode(['', '', '', '', '', '']);
      
      // Reset timer and restart countdown
      setResendTimer(30);
      
      Alert.alert('Success', 'A new verification code has been sent to your phone.');
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with Global Back button */}
        <View style={styles.header}>
          <GlobalBackButton 
            navigation={navigation}
            onPress={() => navigation && navigation.navigate('LoginAccountMobileNumber')}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verify your mobile number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to {phoneNumber || 'your mobile number'} for login
          </Text>
        </View>

        {/* Verification Code Input */}
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={`verification-code-${index}`}
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
            (!isCodeComplete || isLoading) && styles.verifyButtonDisabled
          ]} 
          onPress={handleVerification}
          disabled={!isCodeComplete || isLoading}
        >
          <Text style={[
            styles.verifyButtonText,
            (!isCodeComplete || isLoading) && styles.verifyButtonTextDisabled
          ]}>
            {isLoading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
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
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  titleContainer: {
    paddingHorizontal: 33,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 33,
    marginTop: 60,
    gap: 12,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    marginHorizontal: 38,
    marginTop: 60,
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: 16,
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
    marginTop: 40,
    paddingHorizontal: 33,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  resendTimer: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  resendLink: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});

export default LoginAccountMobileNumberVerificationCode;
