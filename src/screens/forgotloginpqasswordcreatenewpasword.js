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
  formContainer: {
    paddingHorizontal: 32,
    marginTop: 60,
    gap: 40,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#BFBFBF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  passwordDisplayContainer: {
    flex: 1,
    minHeight: 30,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
    height: 30,
  },
  dotsAndInputContainer: {
    position: 'relative',
    height: 30,
    justifyContent: 'center',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: '100%',
    height: 30,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: 'transparent',
    paddingVertical: 0,
  },
  dotsOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    pointerEvents: 'none',
  },
  passwordDot: {
    fontSize: 20,
    color: '#000000',
    marginRight: 4,
    lineHeight: 30,
  },
  eyeButton: {
    padding: 5,
    marginLeft: 10,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'relative',
    width: 20,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOuter: {
    width: 20,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#BFBFBF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeInner: {
    width: 6,
    height: 6,
    backgroundColor: '#BFBFBF',
    borderRadius: 3,
  },
  eyeSlash: {
    position: 'absolute',
    width: 22,
    height: 1.5,
    backgroundColor: '#BFBFBF',
    transform: [{ rotate: '45deg' }],
  },
  underline: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginTop: 8,
  },
  buttonContainer: {
    marginHorizontal: 32,
    marginTop: 60,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ForgotLoginPasswordCreateNewPassword;
