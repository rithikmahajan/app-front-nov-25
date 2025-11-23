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
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const ForgotLoginPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSendCode = () => {
    if (email.trim()) {
      if (navigation) {
        navigation.navigate('ForgotLoginPasswordVerificationCode', { email });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <GlobalBackButton onPress={handleBack} />
        </View>

        <View style={styles.instructionsContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Forgot password?</Text>
          </View>

          <Text style={styles.description}>
            Please enter email associated with your account and we'll send and email with instructions to reset your password
          </Text>
        </View>

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
    paddingTop: hp(isTablet ? 3 : 1.8),
    paddingHorizontal: wp(isTablet ? 10 : 8.8),
  },
  instructionsContainer: {
    paddingHorizontal: wp(isTablet ? 10 : 8.5),
    paddingTop: hp(isTablet ? 3 : 2),
    gap: hp(isTablet ? 3 : 2.2),
  },
  headerSection: {
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: fs(isTablet ? 32 : isSmallDevice ? 20 : 24),
    lineHeight: fs(isTablet ? 56 : isSmallDevice ? 40 : 48),
    color: '#000000',
    textAlign: 'left',
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 12 : 14),
    lineHeight: fs(isTablet ? 30 : isSmallDevice ? 20 : 24),
    color: '#000000',
    maxWidth: wp(isTablet ? 70 : 82),
    textAlign: 'left',
  },
  emailContainer: {
    marginHorizontal: wp(isTablet ? 10 : 8.5),
    marginTop: hp(isTablet ? 6 : 5),
  },
  emailInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: 0,
  },
  emailIconContainer: {
    marginRight: wp(isTablet ? 4 : 3.2),
    opacity: 0.7,
  },
  emailIcon: {
    fontSize: fs(isTablet ? 20 : isSmallDevice ? 14 : 16),
    color: '#BFBFBF',
  },
  emailInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 11 : 12),
    lineHeight: fs(isTablet ? 26 : 20),
    color: '#020202',
    paddingLeft: wp(isTablet ? 9 : 7.4),
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFF4',
    width: '100%',
  },
  buttonContainer: {
    marginHorizontal: wp(isTablet ? 10 : 8.5),
    marginTop: hp(isTablet ? 6 : 5),
  },
  sendCodeButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendCodeButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 12 : 14),
    lineHeight: fs(isTablet ? 26 : 20),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPassword;
