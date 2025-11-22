import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { GlobalBackButton } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const isLargeTablet = SCREEN_WIDTH >= 1024;

const ForgotLoginPasswordVerificationCode = ({ navigation, route }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(10);
  const inputRefs = useRef([]);
  const email = route?.params?.email || '';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    // Reset timer and resend code logic
    setTimer(10);
    setCode(['', '', '', '', '', '']);
  };

  const handleVerifyNow = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      // Here you would typically validate the code with your backend
      // Navigate to the create new password screen
      if (navigation && navigation.navigate) {
        navigation.navigate('forgotloginpqasswordcreatenewpasword', { 
          email, 
          code: verificationCode 
        });
      }
    } else {
      // Handle incomplete code
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Wrapper for Tablet Centering */}
        <View style={styles.contentWrapper}>
          {/* Back Button */}
          <View style={styles.headerContainer}>
            <GlobalBackButton onPress={handleBack} />
          </View>

          {/* Instructions Container */}
          <View style={styles.instructionsContainer}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Verification code</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Please enter the verification code we sent to your email address
            </Text>
          </View>

          {/* Code Input Fields */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={`forgot-password-code-${index}`}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          {/* Verify Now Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.verifyButton, !isCodeComplete && styles.verifyButtonDisabled]} 
              onPress={handleVerifyNow}
              disabled={!isCodeComplete}
            >
              <Text style={styles.verifyButtonText}>VERIFY NOW</Text>
            </TouchableOpacity>
          </View>

          {/* Resend Timer */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.resendText}>
                Resend in {formatTime(timer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLinkText}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingVertical: isTablet ? 40 : 0,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    paddingHorizontal: isTablet ? 60 : 0,
  },
  headerContainer: {
    paddingTop: isTablet ? 20 : 15,
    paddingHorizontal: isTablet ? 40 : 33,
    marginBottom: isTablet ? 20 : 0,
  },
  instructionsContainer: {
    paddingHorizontal: isTablet ? 0 : 32,
    paddingTop: isTablet ? 30 : 16,
    gap: isTablet ? 24 : 18,
  },
  headerSection: {
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: isLargeTablet ? 32 : isTablet ? 28 : 24,
    lineHeight: isLargeTablet ? 56 : isTablet ? 52 : 48,
    color: '#000000',
    textAlign: 'left',
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 28 : 24,
    color: '#000000',
    maxWidth: isTablet ? '100%' : 308,
    textAlign: 'left',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: isTablet ? 'center' : 'space-between',
    marginHorizontal: isTablet ? 0 : 32,
    marginTop: isTablet ? 80 : 60,
    gap: isLargeTablet ? 20 : isTablet ? 16 : 12,
  },
  codeInput: {
    width: isLargeTablet ? 64 : isTablet ? 56 : 44,
    height: isLargeTablet ? 64 : isTablet ? 56 : 44,
    borderRadius: isLargeTablet ? 32 : isTablet ? 28 : 22,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    fontSize: isLargeTablet ? 24 : isTablet ? 20 : 18,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: isTablet ? 60 : 40,
    marginBottom: isTablet ? 20 : 0,
  },
  resendText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: isTablet ? 16 : 14,
    color: '#999999',
  },
  resendLinkText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: isTablet ? 16 : 14,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginHorizontal: isTablet ? 0 : 32,
    marginTop: isTablet ? 60 : 40,
  },
  verifyButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: isTablet ? 20 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 24 : 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPasswordVerificationCode;