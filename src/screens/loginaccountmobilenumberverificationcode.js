import React, { useState, useRef } from 'react';
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
import sessionManager from '../services/sessionManager';
import yoraaAPI from '../services/yoraaAPI';
import authStorageService from '../services/authStorageService';

const LoginAccountMobileNumberVerificationCode = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  
  // Get params from navigation
  const phoneNumber = route?.params?.phoneNumber || '';
  const confirmation = route?.params?.confirmation || null;
  const countryCode = route?.params?.countryCode || '';
  const mobileNumber = route?.params?.mobileNumber || '';

  const handleVerification = async () => {
    const code = verificationCode.join('');
    const debugTimestamp = new Date().toISOString();
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║      📱 PHONE OTP VERIFICATION DEBUG SESSION STARTED          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`⏰ Timestamp: ${debugTimestamp}`);
    console.log(`📞 Phone Number: ${phoneNumber}`);
    console.log(`🔢 OTP Code: ${code}`);
    console.log(`📦 Confirmation Object: ${confirmation ? 'EXISTS' : 'MISSING'}`);
    console.log(`🛒 From Checkout: ${route?.params?.fromCheckout ? 'YES' : 'NO'}`);
    
    if (code.length !== 6) {
      console.log('❌ Validation failed: Incomplete OTP code');
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    if (!confirmation) {
      console.log('❌ Validation failed: No confirmation object');
      Alert.alert('Error', 'No verification session found. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('\n� STEP 1: Verifying OTP with Firebase...');
      console.log(`⏰ Verification Start: ${new Date().toISOString()}`);
      
      // Step 1: Verify OTP with Firebase
      const verificationResult = await confirmation.confirm(code);
      
      console.log('✅ STEP 1 SUCCESS: OTP verified by Firebase');
      console.log('📦 Verification Result:', {
        hasUser: !!verificationResult?.user,
        hasAdditionalUserInfo: !!verificationResult?.additionalUserInfo
      });
      
      // Step 2: Get the current user from Firebase Auth
      console.log('\n🔄 STEP 2: Getting Firebase Auth current user...');
      const { getAuth } = require('@react-native-firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('❌ STEP 2 FAILED: No current user found');
        throw new Error('Authentication succeeded but user not found. Please try again.');
      }
      
      console.log('✅ STEP 2 SUCCESS: Current user retrieved');
      console.log('👤 Firebase User Details:');
      console.log(`   - UID: ${user.uid}`);
      console.log(`   - Phone: ${user.phoneNumber}`);
      console.log(`   - Email: ${user.email || 'N/A'}`);
      console.log(`   - Display Name: ${user.displayName || 'N/A'}`);
      console.log(`   - Email Verified: ${user.emailVerified}`);
      console.log(`   - Is Anonymous: ${user.isAnonymous}`);
      console.log(`   - Created At: ${user.metadata?.creationTime}`);
      console.log(`   - Last Sign In: ${user.metadata?.lastSignInTime}`);
      console.log(`   - Provider Data:`, user.providerData?.map(p => p.providerId).join(', ') || 'N/A');
      
      // Step 3: CRITICAL - Authenticate with backend to get JWT token
      console.log('\n🔄 STEP 3: Authenticating with Yoraa backend...');
      
      try {
        console.log('   - Getting Firebase ID token...');
        const idToken = await user.getIdToken(/* forceRefresh */ true);
        console.log(`   - Firebase ID Token: ${idToken.substring(0, 30)}... (${idToken.length} chars)`);
        
        console.log('   - Calling backend firebaseLogin API...');
        const backendResponse = await yoraaAPI.firebaseLogin(idToken);
        
        console.log('✅ STEP 3 SUCCESS: Backend authentication successful');
        console.log('📦 Backend Response:', {
          hasToken: !!backendResponse?.token,
          hasUser: !!backendResponse?.user,
          tokenLength: backendResponse?.token?.length || 0
        });
        
        if (backendResponse && backendResponse.token) {
          console.log('✅ Backend JWT token received and stored');
          
          // Store user data in auth storage service
          if (backendResponse.user) {
            console.log('   - Storing user data in auth storage...');
            await authStorageService.storeAuthData(backendResponse.token, backendResponse.user);
            console.log('✅ User data stored in auth storage');
          }
          
          // Verify token storage
          console.log('\n🔍 STEP 3.1: Verifying token storage...');
          const storedToken = await yoraaAPI.getUserToken();
          console.log(`   - Token Storage: ${storedToken ? '✅ EXISTS' : '❌ MISSING'}`);
          
          if (!storedToken) {
            console.error('⚠️ Token not stored properly, reinitializing...');
            await yoraaAPI.initialize();
            
            const retryToken = await yoraaAPI.getUserToken();
            console.log(`   - Token After Retry: ${retryToken ? '✅ EXISTS' : '❌ STILL MISSING'}`);
          }
          
          const isAuth = yoraaAPI.isAuthenticated();
          console.log(`🔐 Backend Authentication Status: ${isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
          
          // ✅ NEW: STEP 3.2 - Initialize and Register FCM Token
          console.log('\n🔔 STEP 3.2: Initializing FCM service...');
          try {
            // Import FCM service
            const fcmService = require('../services/fcmService').default;
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            
            // Initialize FCM and get token
            const fcmResult = await fcmService.initialize();
            
            if (fcmResult.success && fcmResult.token) {
              console.log('✅ FCM token obtained:', fcmResult.token.substring(0, 20) + '...');
              
              // Register token with backend using the auth token we just verified
              const authToken = await AsyncStorage.getItem('userToken');
              
              if (authToken) {
                const registerResult = await fcmService.registerTokenWithBackend(authToken);
                
                if (registerResult.success) {
                  console.log('✅ FCM token registered with backend');
                } else {
                  console.warn('⚠️ FCM registration failed (non-critical):', registerResult.error);
                }
              } else {
                console.warn('⚠️ Auth token not found for FCM registration');
              }
            } else {
              console.warn('⚠️ FCM initialization failed:', fcmResult.error);
            }
          } catch (fcmError) {
            console.warn('⚠️ FCM setup error (non-critical):', fcmError.message);
            // Don't throw - FCM is non-critical to authentication
          }
          console.log('✅ STEP 3.2: FCM setup completed');
          
        } else {
          console.warn('⚠️ Backend authentication succeeded but no token received');
          console.warn('⚠️ This may cause authentication issues');
        }
      } catch (backendError) {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║              ⚠️  BACKEND AUTHENTICATION FAILED                ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.error('❌ Backend Error Type:', backendError.constructor.name);
        console.error('❌ Backend Error Code:', backendError.code);
        console.error('❌ Backend Error Message:', backendError.message);
        console.error('❌ Full Backend Error:', JSON.stringify(backendError, null, 2));
        console.error('❌ Stack Trace:', backendError.stack);
        
        // Continue anyway - Firebase auth succeeded
        console.warn('⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend!');
        console.warn('This WILL cause "not authenticated" status to display in the app');
        
        Alert.alert(
          'Warning',
          'Login successful but some features may be limited. Please try logging in again if you experience issues.',
          [{ text: 'OK' }]
        );
      }
      
      // Step 4: Create session for phone login
      console.log('\n🔄 STEP 4: Creating session...');
      await sessionManager.createSession({
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber || phoneNumber,
        displayName: user.displayName
      }, 'phone');
      
      console.log('✅ STEP 4 SUCCESS: Session created for phone login');
      console.log(`⏰ Total Time: ${new Date().toISOString()}`);
      
      Alert.alert(
        'Success', 
        'Phone number verified successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('\n🚀 STEP 5: Navigating to next screen...');
              console.log('📍 Navigation Target: TermsAndConditions');
              console.log('📦 Navigation Params:', {
                previousScreen: 'LoginAccountMobileNumberVerificationCode',
                hasUser: !!user,
                fromCheckout: route?.params?.fromCheckout
              });
              
              // Navigate to Terms and Conditions screen after successful login verification
              if (navigation) {
                navigation.navigate('TermsAndConditions', { 
                  previousScreen: 'LoginAccountMobileNumberVerificationCode',
                  user: user,
                  fromCheckout: route?.params?.fromCheckout
                });
              }
              
              console.log('✅ Navigation completed');
              console.log('╚═══════════════════════════════════════════════════════════════╝\n');
            }
          }
        ]
      );
      
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ OTP VERIFICATION ERROR                        ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      
      // Handle specific authentication errors
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new code.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session expired. Please request a new OTP.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('📱 Showing Alert:', errorMessage);
      Alert.alert('Error', errorMessage);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    } finally {
      setIsLoading(false);
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
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Resending OTP to:', phoneNumber);
      
      // Resend OTP using signInWithPhoneNumber directly
      const { signInWithPhoneNumber, getAuth } = require('@react-native-firebase/auth');
      const newConfirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
      
      // Update the confirmation object for this screen
      if (route?.params) {
        route.params.confirmation = newConfirmation;
      }
      
      // Reset verification code inputs
      setVerificationCode(['', '', '', '', '', '']);
      
      // Reset timer and restart countdown
      setResendTimer(30);
      
      Alert.alert('Success', 'A new verification code has been sent to your phone.');
      
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
            onPress={() => navigation && navigation.navigate('LoginAccountMobileNumber')}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verify your mobile number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to {phoneNumber || 'your mobile number'} for login
          </Text>
        </View>

        {/* Verification Code Input */}
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={`verification-code-${index}`}
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
            (!isCodeComplete || isLoading) && styles.verifyButtonDisabled
          ]} 
          onPress={handleVerification}
          disabled={!isCodeComplete || isLoading}
        >
          <Text style={[
            styles.verifyButtonText,
            (!isCodeComplete || isLoading) && styles.verifyButtonTextDisabled
          ]}>
            {isLoading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
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
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  titleContainer: {
    paddingHorizontal: 33,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 33,
    marginTop: 60,
    gap: 12,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    marginHorizontal: 38,
    marginTop: 60,
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: 16,
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
    marginTop: 40,
    paddingHorizontal: 33,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  resendTimer: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  resendLink: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});

export default LoginAccountMobileNumberVerificationCode;
