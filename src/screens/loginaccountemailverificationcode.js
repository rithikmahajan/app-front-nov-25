import React, { useState, useRef, useEffect } from 'react';
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
import emailOTPService from '../services/emailOTPService';
import auth from '@react-native-firebase/auth';
import sessionManager from '../services/sessionManager';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const LoginAccountEmailVerificationCode = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  
  const email = route?.params?.email || '';
  const password = route?.params?.password || '';
  const devOTP = route?.params?.devOTP; // For development testing only

  // Start countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Log dev OTP for testing - ONLY in development builds
  useEffect(() => {
    if (devOTP && __DEV__) {
      console.log('🔑 DEV MODE - OTP for testing:', devOTP);
      Alert.alert('Dev Mode', `OTP: ${devOTP}\n\nThis is only shown in development mode.`);
    }
  }, [devOTP]);

  const handleVerification = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔍 Verifying OTP...');
      
      // Verify OTP
      await emailOTPService.verifyOTP(email, code);
      console.log('✅ OTP verified successfully');
      
      // Re-authenticate with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('✅ Firebase authentication successful');
      
      // Create session
      await sessionManager.createSession({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 'email');
      
      console.log('✅ Session created for email login');
      
      // Navigate to Terms and Conditions or main app
      if (navigation) {
        navigation.navigate('TermsAndConditions', { 
          previousScreen: 'LoginAccountEmailVerificationCode',
          fromCheckout: route?.params?.fromCheckout
        });
      }
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
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
    try {
      console.log('🔄 Resending OTP to:', email);
      setResendTimer(30);
      
      const otpResponse = await emailOTPService.resendOTP(email);
      
      // Show dev OTP ONLY in development builds
      if (otpResponse.devOTP && __DEV__) {
        console.log('🔑 DEV MODE - New OTP:', otpResponse.devOTP);
        Alert.alert('Dev Mode', `New OTP: ${otpResponse.devOTP}\n\nThis is only shown in development mode.`);
      } else {
        Alert.alert('Success', 'A new verification code has been sent to your email');
      }
      
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
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
            onPress={() => navigation && navigation.navigate('LoginAccountEmail')}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to your email for login
          </Text>
        </View>

        {/* Verification Code Input */}
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={`email-verification-code-${index}`}
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
            (!isCodeComplete || isVerifying) && styles.verifyButtonDisabled
          ]} 
          onPress={handleVerification}
          disabled={!isCodeComplete || isVerifying}
        >
          <Text style={[
            styles.verifyButtonText,
            (!isCodeComplete || isVerifying) && styles.verifyButtonTextDisabled
          ]}>
            {isVerifying ? 'VERIFYING...' : 'VERIFY & LOGIN'}
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
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    paddingTop: hp(isTablet ? 3.1 : 2.5),
  },
  titleContainer: {
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginTop: hp(isTablet ? 6.2 : 5),
    alignItems: 'center',
  },
  title: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: fs(isTablet ? 38 : isSmallDevice ? 28 : 32),
    textAlign: 'center',
    marginBottom: hp(isTablet ? 2.5 : 2),
  },
  subtitle: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginTop: hp(isTablet ? 9.3 : 7.5),
    gap: wp(isTablet ? 4 : isSmallDevice ? 2.4 : 3.2),
  },
  codeInput: {
    width: wp(isTablet ? 14.6 : isSmallDevice ? 11 : 12),
    height: hp(isTablet ? 8.5 : isSmallDevice ? 6.4 : 6.8),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    marginHorizontal: wp(isTablet ? 12.6 : 10.1),
    marginTop: hp(isTablet ? 9.3 : 7.5),
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: hp(isTablet ? 7.9 : 6.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
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
    marginTop: hp(isTablet ? 6.2 : 5),
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
  },
  resendText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  resendTimer: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  resendLink: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});

export default LoginAccountEmailVerificationCode;
