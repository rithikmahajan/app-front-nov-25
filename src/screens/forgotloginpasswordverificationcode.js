import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { GlobalBackButton } from '../components';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

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
    paddingVertical: hp(isTablet ? 5 : 0),
  },
  contentWrapper: {
    width: '100%',
    maxWidth: isTablet ? wp(80) : '100%',
    alignSelf: 'center',
    paddingHorizontal: isTablet ? wp(8) : 0,
  },
  headerContainer: {
    paddingTop: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: wp(isTablet ? 5.3 : 8.8),
    marginBottom: hp(isTablet ? 2.5 : 0),
  },
  instructionsContainer: {
    paddingHorizontal: isTablet ? 0 : wp(8.5),
    paddingTop: hp(isTablet ? 3.8 : 2),
    gap: hp(isTablet ? 3 : 2.2),
  },
  headerSection: {
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 22 : 24),
    lineHeight: fs(isTablet ? 52 : isSmallDevice ? 44 : 48),
    color: '#000000',
    textAlign: 'left',
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 22 : 24),
    color: '#000000',
    maxWidth: isTablet ? '100%' : wp(82),
    textAlign: 'left',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: isTablet ? 'center' : 'space-between',
    marginHorizontal: isTablet ? 0 : wp(8.5),
    marginTop: hp(isTablet ? 10 : isSmallDevice ? 7 : 7.5),
    gap: wp(isTablet ? 3.2 : isSmallDevice ? 2 : 3.2),
  },
  codeInput: {
    width: wp(isTablet ? 8.5 : isSmallDevice ? 11 : 11.7),
    height: wp(isTablet ? 8.5 : isSmallDevice ? 11 : 11.7),
    borderRadius: wp(isTablet ? 4.2 : isSmallDevice ? 5.5 : 5.8),
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 16 : 18),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: hp(isTablet ? 7.5 : isSmallDevice ? 4.5 : 5),
    marginBottom: hp(isTablet ? 2.5 : 0),
  },
  resendText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#999999',
  },
  resendLinkText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    color: '#000000',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginHorizontal: isTablet ? 0 : wp(8.5),
    marginTop: hp(isTablet ? 7.5 : isSmallDevice ? 4.5 : 5),
  },
  verifyButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPasswordVerificationCode;