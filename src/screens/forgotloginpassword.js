import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { GlobalBackButton } from '../components';

const ForgotLoginPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSendCode = () => {
    if (email.trim()) {
      // Navigate to verification code screen
      if (navigation) {
        navigation.navigate('ForgotLoginPasswordVerificationCode', { email });
      }
    }
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
            <Text style={styles.title}>Forgot password?</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Please enter email associated with your account and we'll send and email with instructions to reset your password
          </Text>
        </View>

        {/* Email Input Field */}
        <View style={styles.emailContainer}>
          <View style={styles.emailInputWrapper}>
            <View style={styles.emailIconContainer}>
              <Text style={styles.emailIcon}>✉</Text>
            </View>
            <TextInput
              style={styles.emailInput}
              placeholder="enter your email here"
              placeholderTextColor="#020202"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          <View style={styles.divider} />
        </View>

        {/* Send Code Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.sendCodeButton, !email.trim() && styles.sendCodeButtonDisabled]} 
            onPress={handleSendCode}
            disabled={!email.trim()}
          >
            <Text style={styles.sendCodeButtonText}>SEND CODE</Text>
          </TouchableOpacity>
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
  emailContainer: {
    marginHorizontal: 32,
    marginTop: 40,
  },
  emailInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  emailIconContainer: {
    marginRight: 12,
    opacity: 0.7,
  },
  emailIcon: {
    fontSize: 16,
    color: '#BFBFBF',
  },
  emailInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    lineHeight: 20,
    color: '#020202',
    paddingLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFF4',
    width: '100%',
  },
  buttonContainer: {
    marginHorizontal: 32,
    marginTop: 40,
  },
  sendCodeButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendCodeButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPassword;
