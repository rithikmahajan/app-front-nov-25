import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { AppleIcon, GoogleIcon } from '../assets/icons';
import auth from '@react-native-firebase/auth';
import appleAuthService from '../services/appleAuthService';
import googleAuthService from '../services/googleAuthService';
import sessionManager from '../services/sessionManager';

const LoginAccountEmail = ({ navigation, route }) => {
  const [isEmailSelected, setIsEmailSelected] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting email login process...');
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase email login successful:', user.email);
      
      // Create session - the AuthManager will handle backend authentication
      await sessionManager.createSession({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 'email');
      
      console.log('✅ Session created for email login');
      
      Alert.alert('Success', `Welcome ${user.email}`);
      
      // Navigate to verification or main app
      if (navigation && navigation.navigate) {
        navigation.navigate('LoginAccountEmailVerificationCode', { 
          email,
          fromCheckout: route?.params?.fromCheckout 
        });
      }
      
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }

      Alert.alert('Login Error', errorMessage);
      console.error('❌ Email login error:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type) => {
    setIsEmailSelected(type === 'email');
    if (type === 'phone') {
      // Navigate to mobile number login screen
      if (navigation) {
        navigation.navigate('LoginAccountMobileNumber');
      }
    }
  };

  const handleSignUpLink = () => {
    // Handle "Sign Up" link in the footer
    if (navigation) {
      navigation.navigate('CreateAccountEmail');
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    // Forgot password logging removed for production
    // Navigate to forgot password screen
    if (navigation) {
      navigation.navigate('ForgotLoginPassword');
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
        
        // Create session for Apple login
        await sessionManager.createSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }, 'apple');
        
        console.log('✅ Session created for Apple login');
        
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
        const user = userCredential.user;
        
        console.log('✅ Google Sign In successful, isNewUser:', isNewUser);
        
        // Create session for Google login
        await sessionManager.createSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber
        }, 'google');
        
        console.log('✅ Session created for Google login');
        
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with Global Back button */}
        <View style={styles.header}>
          <GlobalBackButton 
            navigation={navigation}
            onPress={() => navigation && navigation.navigate('Rewards')}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Log into your account</Text>
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
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          <Text style={[styles.loginButtonText, isLoading && styles.loginButtonTextDisabled]}>
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </Text>
        </TouchableOpacity>

        {/* Divider with "or log in with" */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or log in with</Text>
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
            Don't have an account?{' '}
            <Text style={styles.footerLink} onPress={handleSignUpLink}>
              Sign Up
            </Text>
          </Text>
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
    marginTop: 66,
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
    marginTop: 48,
  },
  inputField: {
    marginBottom: 20,
    height: 50,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Mulish-Regular',
    color: '#000000',
    paddingVertical: 0,
    paddingBottom: 12,
    height: 30,
    letterSpacing: 0.32,
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
  eyeText: {
    fontSize: 16,
    color: '#979797',
  },
  underline: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginTop: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 33,
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    marginHorizontal: 33,
    marginTop: 40,
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  loginButtonTextDisabled: {
    color: '#999999',
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 33,
    marginTop: 40,
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
    lineHeight: 24,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
    gap: 20,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 33,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
    lineHeight: 20,
  },
  footerLink: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

export default LoginAccountEmail;