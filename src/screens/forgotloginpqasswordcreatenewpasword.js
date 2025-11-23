import React, { useState } from 'react';
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

const ForgotLoginPasswordCreateNewPassword = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = route?.params?.email || '';
  const verificationCode = route?.params?.code || '';

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (password.length < 6) {
      return;
    }
    
    if (password !== confirmPassword) {
      return;
    }

    // Here you would typically call your API to reset the password
    
    // Navigate to password confirmation modal
    if (navigation) {
      navigation.navigate('ForgotLoginPasswordConfirmationModal');
    }
  };

  const isFormValid = password.length >= 6 && password === confirmPassword;

  const renderPasswordDots = (text) => {
    return text.split('').map((_, index) => (
      <Text key={index} style={styles.passwordDot}>•</Text>
    ));
  };

  const renderEyeIcon = (isVisible) => {
    return (
      <View style={styles.eyeIconContainer}>
        <View style={styles.eyeIcon}>
          <View style={styles.eyeOuter}>
            <View style={styles.eyeInner} />
          </View>
          {!isVisible && <View style={styles.eyeSlash} />}
        </View>
      </View>
    );
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
            <Text style={styles.title}>Create new password</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Your new password must be different from previously used password
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.passwordDisplayContainer}>
                {showPassword ? (
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={false}
                    placeholder=""
                    placeholderTextColor="#BFBFBF"
                  />
                ) : (
                  <View style={styles.dotsAndInputContainer}>
                    <TextInput
                      style={styles.hiddenTextInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      placeholder=""
                      placeholderTextColor="transparent"
                    />
                    <View style={styles.dotsOverlay}>
                      {renderPasswordDots(password)}
                    </View>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {renderEyeIcon(showPassword)}
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.passwordDisplayContainer}>
                {showConfirmPassword ? (
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={false}
                    placeholder=""
                    placeholderTextColor="#BFBFBF"
                  />
                ) : (
                  <View style={styles.dotsAndInputContainer}>
                    <TextInput
                      style={styles.hiddenTextInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={true}
                      placeholder=""
                      placeholderTextColor="transparent"
                    />
                    <View style={styles.dotsOverlay}>
                      {renderPasswordDots(confirmPassword)}
                    </View>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {renderEyeIcon(showConfirmPassword)}
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.submitButtonText}>SUBMIT</Text>
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
    paddingTop: hp(isTablet ? 2.5 : 2),
    paddingHorizontal: wp(isTablet ? 5.3 : 8.8),
  },
  instructionsContainer: {
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
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
  formContainer: {
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    marginTop: hp(isTablet ? 10 : isSmallDevice ? 6.5 : 7.5),
    gap: hp(isTablet ? 6 : 5),
  },
  inputContainer: {
    gap: hp(isTablet ? 1.2 : 1),
  },
  inputLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fs(isTablet ? 15 : isSmallDevice ? 13 : 14),
    color: '#BFBFBF',
    marginBottom: hp(isTablet ? 1.2 : 1),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
  },
  passwordDisplayContainer: {
    flex: 1,
    minHeight: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fs(isTablet ? 17 : isSmallDevice ? 15 : 16),
    color: '#000000',
    paddingVertical: 0,
    height: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
  },
  dotsAndInputContainer: {
    position: 'relative',
    height: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
    justifyContent: 'center',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: '100%',
    height: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
    fontFamily: 'Montserrat-Regular',
    fontSize: fs(isTablet ? 17 : isSmallDevice ? 15 : 16),
    color: 'transparent',
    paddingVertical: 0,
  },
  dotsOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
    pointerEvents: 'none',
  },
  passwordDot: {
    fontSize: fs(isTablet ? 22 : isSmallDevice ? 18 : 20),
    color: '#000000',
    marginRight: wp(isTablet ? 1.5 : 1.1),
    lineHeight: hp(isTablet ? 5 : isSmallDevice ? 3.5 : 3.75),
  },
  eyeButton: {
    padding: wp(isTablet ? 1.5 : 1.3),
    marginLeft: wp(isTablet ? 3 : 2.7),
  },
  eyeIconContainer: {
    width: wp(isTablet ? 6.4 : isSmallDevice ? 6 : 6.4),
    height: wp(isTablet ? 6.4 : isSmallDevice ? 6 : 6.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'relative',
    width: wp(isTablet ? 5.3 : isSmallDevice ? 5 : 5.3),
    height: hp(isTablet ? 2.2 : isSmallDevice ? 1.7 : 1.75),
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOuter: {
    width: wp(isTablet ? 5.3 : isSmallDevice ? 5 : 5.3),
    height: hp(isTablet ? 2.2 : isSmallDevice ? 1.7 : 1.75),
    borderWidth: 1.5,
    borderColor: '#BFBFBF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeInner: {
    width: wp(isTablet ? 1.8 : isSmallDevice ? 1.5 : 1.6),
    height: wp(isTablet ? 1.8 : isSmallDevice ? 1.5 : 1.6),
    backgroundColor: '#BFBFBF',
    borderRadius: 3,
  },
  eyeSlash: {
    position: 'absolute',
    width: wp(isTablet ? 6.4 : isSmallDevice ? 5.5 : 5.8),
    height: 1.5,
    backgroundColor: '#BFBFBF',
    transform: [{ rotate: '45deg' }],
  },
  underline: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginTop: hp(isTablet ? 1.2 : 1),
  },
  buttonContainer: {
    marginHorizontal: wp(isTablet ? 10.6 : 8.5),
    marginTop: hp(isTablet ? 10 : isSmallDevice ? 6.5 : 7.5),
    marginBottom: hp(isTablet ? 6 : 5),
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: hp(isTablet ? 2.5 : 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    lineHeight: fs(isTablet ? 24 : isSmallDevice ? 18 : 20),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPasswordCreateNewPassword;
