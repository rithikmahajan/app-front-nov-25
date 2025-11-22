import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppleIcon, GoogleIcon, BackIcon } from '../assets/icons';
import auth from '@react-native-firebase/auth';
import appleAuthService from '../services/appleAuthService';
import googleAuthService from '../services/googleAuthService';
import sessionManager from '../services/sessionManager';
import yoraaAPI from '../services/yoraaAPI';

// Eye Icon Component
const EyeIcon = ({ width = 22, height = 16, color = "#979797" }) => (
  <Svg width={width} height={height} viewBox="0 0 22 16" fill="none">
    {/* Outer eye shape */}
    <Path 
      d="M11 1.25C3.5 1.25 0.5 8 0.5 8C0.5 8 3.5 14.75 11 14.75C18.5 14.75 21.5 8 21.5 8C21.5 8 18.5 1.25 11 1.25Z" 
      stroke={color} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Inner circle (pupil) */}
    <Path 
      d="M11 13C13.0711 13 14.75 11.3211 14.75 9.25C14.75 7.17893 13.0711 5.5 11 5.5C8.92893 5.5 7.25 7.17893 7.25 9.25C7.25 11.3211 8.92893 13 11 13Z" 
      stroke={color} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);


const CreateAccountEmail = ({ navigation, route }) => {
  const [isEmailSelected, setIsEmailSelected] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSkip = () => {
    // Navigate back or to next screen
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleBackPress = () => {
    // Check if user came from login screen
    const fromLogin = route?.params?.fromLogin;
    
    if (navigation) {
      if (fromLogin) {
        // Navigate back to login screen if came from sign up link
        navigation.navigate('LoginAccountEmail');
      } else {
        // Navigate back to Rewards screen otherwise
        navigation.navigate('Rewards');
      }
    }
  };

  const handleSignUp = async () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting user creation...');
      
      // Create user with email and password using Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Update user profile with name
      await userCredential.user.updateProfile({
        displayName: name
      });
      
      console.log('User profile updated with name:', name);
      
      // Navigate to success modal or main app
      if (navigation && navigation.navigate) {
        navigation.navigate('CreateAccountEmailSuccessModal');
      }
      
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type) => {
    if (type === 'phone') {
      // Navigate to mobile number screen, preserving fromLogin parameter
      if (navigation) {
        navigation.navigate('CreateAccountMobileNumber', { 
          fromLogin: route?.params?.fromLogin 
        });
      }
    }
    // Keep email selected since we're on the email screen
    setIsEmailSelected(true);
  };

  const handleLogInLink = () => {
    // Handle "Log In" link in the footer
    // Navigate to log in - logging removed for production
    if (navigation) {
      navigation.navigate('LoginAccountEmail');
    }
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'apple') {
      if (Platform.OS !== 'ios') {
        Alert.alert('Error', 'Apple Sign In is only available on iOS devices');
        return;
      }

      if (!appleAuthService.isAppleAuthAvailable()) {
        Alert.alert('Error', 'Apple Sign In is not available on this device');
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('🍎 Starting Apple Sign In...');
        const userCredential = await appleAuthService.signInWithApple();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('Apple Sign In was cancelled by user');
          return;
        }
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        const user = userCredential.user;
        
        console.log('✅ Apple Sign In successful, isNewUser:', isNewUser);
        
        // CRITICAL: Verify backend authentication status before proceeding
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for backend to process
        
        const backendAuth = yoraaAPI.isAuthenticated();
        console.log('🔐 Backend authentication check:', backendAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
        
        if (!backendAuth) {
          console.warn('⚠️ Backend not authenticated after Apple login, attempting to reinitialize...');
          await yoraaAPI.initialize();
          
          const recheckAuth = yoraaAPI.isAuthenticated();
          if (!recheckAuth) {
            throw new Error('Backend authentication failed. Please try logging in again.');
          }
          console.log('✅ Backend authentication recovered after reinitialization');
        }
        
        // Create session for Apple login
        await sessionManager.createSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }, 'apple');
        
        console.log('✅ Session created for Apple login');
        
        // Final verification
        const finalAuthCheck = yoraaAPI.isAuthenticated();
        console.log('🎯 Final auth status before navigation:', finalAuthCheck ? 'AUTHENTICATED ✅' : 'NOT AUTHENTICATED ❌');
        
        // Navigate based on user type and context
        const fromCheckout = route?.params?.fromCheckout;
        
        if (fromCheckout) {
          // From checkout: Always go to Terms & Conditions first
          console.log('User from checkout - navigating to Terms & Conditions');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (isNewUser) {
          // New user not from checkout: Show terms and conditions
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'AppleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          // Returning user not from checkout: Go directly to Home
          console.log('Returning user - navigating directly to HomeScreen');
          navigation.navigate('Home');
        }
        
      } catch (error) {
        console.error('Apple Sign In error:', error);
        Alert.alert('Error', error.message || 'Apple Sign In failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (provider === 'google') {
      // Check if Google Sign-in is available before proceeding
      if (!googleAuthService.isAvailable()) {
        Alert.alert(
          'Google Sign-in Unavailable', 
          'Google Sign-in is not available on this device. This may be due to missing Google Play Services or a configuration issue.'
        );
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('Starting Google Sign In for', Platform.OS);
        
        // Android-specific pre-check
        if (Platform.OS === 'android') {
          console.log('Performing Android-specific Google Sign In checks...');
          const configCheck = await googleAuthService.checkAndroidConfiguration();
          
          if (!configCheck.success) {
            throw new Error(configCheck.message);
          }
          
          console.log('Android configuration check passed:', configCheck.message);
        }
        
        const userCredential = await googleAuthService.signInWithGoogle();
        
        // Handle cancellation (returns null)
        if (!userCredential) {
          console.log('Google Sign In was cancelled by user');
          return;
        }
        
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        
        console.log('Google Sign In successful, isNewUser:', isNewUser);
        
        // Navigate based on user type and context (same logic as Apple Sign In)
        const fromCheckout = route?.params?.fromCheckout;
        
        if (fromCheckout) {
          // From checkout: Always go to Terms & Conditions first
          console.log('User from checkout - navigating to Terms & Conditions');
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: isNewUser,
            fromCheckout: true
          });
        } else if (isNewUser) {
          // New user not from checkout: Show terms and conditions
          navigation.navigate('TermsAndConditions', { 
            previousScreen: 'GoogleSignIn',
            user: userCredential.user,
            isNewUser: true,
            fromCheckout: false
          });
        } else {
          // Returning user not from checkout: Go directly to Home
          console.log('Returning user - navigating directly to Home');
          navigation.navigate('Home');
        }
        
      } catch (error) {
        console.error('Google Sign In error on', Platform.OS, ':', error);
        
        let errorMessage = error.message || 'Google Sign In failed. Please try again.';
        
        // Android-specific error messages
        if (Platform.OS === 'android') {
          if (error.message?.includes('Google Play Services')) {
            errorMessage = 'Please update Google Play Services and try again.';
          } else if (error.message?.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (error.message?.includes('configuration')) {
            errorMessage = 'Google Sign In is not properly configured. Please contact support.';
          }
        }
        
        Alert.alert('Google Sign In Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAppleLogin = () => {
    handleSocialLogin('apple');
  };

  const handleGoogleLogin = () => {
    handleSocialLogin('google');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
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
          <Text style={styles.title}>Create your account</Text>
        </View>

        {/* Toggle between Phone and Email */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleBackground}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !isEmailSelected && styles.toggleOptionActive,
              ]}
              onPress={() => handleToggle('phone')}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isEmailSelected && styles.toggleTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                isEmailSelected && styles.toggleOptionActive,
              ]}
              onPress={() => handleToggle('email')}
            >
              <Text
                style={[
                  styles.toggleText,
                  isEmailSelected && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputField}>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor="#BDBCBC"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <View style={styles.underline} />
          </View>

          {/* Email Field */}
          <View style={styles.inputField}>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#BDBCBC"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.underline} />
          </View>

          {/* Password Field */}
          <View style={styles.inputField}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#BDBCBC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <EyeIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputField}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Confirm Password"
                placeholderTextColor="#BDBCBC"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={[styles.signUpButtonText, isLoading && styles.signUpButtonTextDisabled]}>
            {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </Text>
        </TouchableOpacity>

        {/* Divider with "or sign up with" */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.socialButtonDisabled]} 
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon width={42} height={42} color="#332218" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.socialButtonDisabled]} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon width={42} height={42} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have account?{' '}
            <Text style={styles.footerLink} onPress={handleLogInLink}>
              Log In
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 5,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 19,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    textAlign: 'right',
  },
  titleContainer: {
    paddingHorizontal: 32,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 48,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: '#ededed',
    borderRadius: 15,
    height: 30,
    width: 124,
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  toggleOptionActive: {
    backgroundColor: '#000000',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 33,
    marginTop: 35,
  },
  inputField: {
    marginBottom: 16,
    height: 50,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Mulish-Regular',
    color: '#000000',
    paddingVertical: 0,
    paddingBottom: 12,
    height: 30,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 5,
  },
  underline: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginTop: 8,
  },
  signUpButton: {
    marginHorizontal: 33,
    marginTop: 45,
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  signUpButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  signUpButtonTextDisabled: {
    color: '#999999',
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 33,
    marginTop: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9E9E9',
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    opacity: 0.6,
    marginHorizontal: 16,
    letterSpacing: 0.24,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: '#332218',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 69,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  footerLink: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

export default CreateAccountEmail;
