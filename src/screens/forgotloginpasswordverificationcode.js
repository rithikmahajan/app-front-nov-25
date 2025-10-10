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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
  headerContainer: {
    paddingTop: 15,
    paddingHorizontal: 33,
  },
  instructionsContainer: {
    paddingHorizontal: 32,
    paddingTop: 16,
    gap: 18,
  },
  headerSection: {
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 48,
    color: '#000000',
    textAlign: 'left',
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 24,
    color: '#000000',
    width: 308,
    textAlign: 'left',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 32,
    marginTop: 60,
    gap: 12,
  },
  codeInput: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  resendText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#999999',
  },
  resendLinkText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginHorizontal: 32,
    marginTop: 40,
  },
  verifyButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPasswordVerificationCode;