import React, { useState, useRef, useEffect } from 'react';
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
import auth from '@react-native-firebase/auth';
import GlobalBackButton from '../components/GlobalBackButton';
import sessionManager from '../services/sessionManager';
import yoraaAPI from '../services/yoraaAPI';
import authStorageService from '../services/authStorageService';
import firebasePhoneAuthService from '../services/firebasePhoneAuth';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const LoginAccountMobileNumberVerificationCode = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  
  // ✅ CRITICAL FIX: Use state with useEffect to handle async navigation params
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [verificationId, setVerificationId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // ✅ CRITICAL FIX: Store confirmation in ref to prevent loss during re-renders
  const confirmationRef = useRef(null);
  
  // ✅ Update state when route params change
  useEffect(() => {
    if (route?.params) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║  📦 ROUTE PARAMS RECEIVED                                     ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log('📞 Phone Number:', route.params.phoneNumber);
      console.log('🆔 Verification ID:', route.params.verificationId ? 'EXISTS' : 'MISSING');
      console.log('📦 Confirmation:', route.params.confirmation ? 'EXISTS' : 'MISSING');
      console.log('📦 Confirmation Type:', typeof route.params.confirmation);
      console.log('📦 Confirmation Object Keys:', route.params.confirmation ? Object.keys(route.params.confirmation) : 'N/A');
      console.log('📦 Has confirm method:', route.params.confirmation?.confirm ? 'YES' : 'NO');
      console.log('🌍 Country Code:', route.params.countryCode);
      console.log('📱 Mobile Number:', route.params.mobileNumber);
      
      if (route.params.phoneNumber) {
        setPhoneNumber(route.params.phoneNumber);
      }
      if (route.params.verificationId) {
        console.log('🔧 Setting verificationId to state...');
        setVerificationId(route.params.verificationId);
      }
      if (route.params.confirmation) {
        console.log('🔧 Setting confirmation object to state and ref...');
        setConfirmation(route.params.confirmation);
        confirmationRef.current = route.params.confirmation; // ✅ Store in ref too
        console.log('✅ Confirmation state and ref updated');
      } else {
        console.log('⚠️ No confirmation object in route params!');
      }
      if (route.params.countryCode) {
        setCountryCode(route.params.countryCode);
      }
      if (route.params.mobileNumber) {
        setMobileNumber(route.params.mobileNumber);
      }
    }
  }, [route?.params]);
  
  // 🐛 DEBUG: Log phone number when it changes
  useEffect(() => {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  📱 PHONE NUMBER STATE UPDATED                                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('📞 Phone Number:', phoneNumber);
    console.log('✅ Has Value:', !!phoneNumber);
    console.log('📏 Length:', phoneNumber?.length || 0);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }, [phoneNumber]);
  
  // ✅ Timer countdown effect
  useEffect(() => {
    let interval = null;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

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
    console.log(`� Confirmation Type: ${typeof confirmation}`);
    console.log(`📦 Confirmation Keys: ${confirmation ? Object.keys(confirmation) : 'N/A'}`);
    console.log(`📦 Has confirm method: ${confirmation?.confirm ? 'YES' : 'NO'}`);
    console.log(`�🛒 From Checkout: ${route?.params?.fromCheckout ? 'YES' : 'NO'}`);
    
    if (code.length !== 6) {
      console.log('❌ Validation failed: Incomplete OTP code');
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    // ✅ CRITICAL FIX: Use confirmation from ref or state or try to get from service
    let activeConfirmation = confirmation || confirmationRef.current || route?.params?.confirmation;
    
    console.log('🔍 Confirmation Object Status:');
    console.log('   - State confirmation:', confirmation ? 'EXISTS' : 'MISSING');
    console.log('   - Ref confirmation:', confirmationRef.current ? 'EXISTS' : 'MISSING');
    console.log('   - Route params confirmation:', route?.params?.confirmation ? 'EXISTS' : 'MISSING');
    console.log('   - Active confirmation (merged):', activeConfirmation ? 'EXISTS' : 'MISSING');
    
    // ✅ PRODUCTION FIX: Try to get stored confirmation from service (for production builds)
    if (!activeConfirmation) {
      console.log('⚠️ No confirmation object in state/ref/params');
      console.log('🔄 Attempting to retrieve from firebasePhoneAuthService...');
      activeConfirmation = firebasePhoneAuthService.getStoredConfirmation();
      
      if (activeConfirmation) {
        console.log('✅ Retrieved confirmation from service instance');
        console.log('📦 Service confirmation has confirm method:', typeof activeConfirmation?.confirm === 'function' ? 'YES' : 'NO');
      } else {
        console.log('❌ Service also has no confirmation stored');
      }
    }
    
    // ✅ CRITICAL FIX: If no confirmation object, try to verify using verificationId directly
    if (!activeConfirmation) {
      console.log('⚠️ No confirmation object found anywhere');
      console.log('🔄 Attempting alternative verification using verificationId...');
      
      // Try to get verificationId from state, params, or service
      let activeVerificationId = verificationId || route?.params?.verificationId || firebasePhoneAuthService.getStoredVerificationId();
      
      if (activeVerificationId) {
        try {
          console.log('📝 Creating PhoneAuthCredential from verificationId...');
          const credential = auth.PhoneAuthProvider.credential(activeVerificationId, code);
          console.log('✅ Credential created, attempting sign-in...');
          
          // Create a mock confirmation object that works like the real one
          activeConfirmation = {
            verificationId: activeVerificationId,
            confirm: async (otp) => {
              console.log('🔐 Using credential-based verification...');
              return await auth().signInWithCredential(credential);
            }
          };
          console.log('✅ Alternative confirmation object created');
        } catch (credError) {
          console.error('❌ Failed to create credential:', credError);
        }
      }
    }
    
    if (!activeConfirmation) {
      console.log('❌ Validation failed: No confirmation object available');
      console.log('❌ State Confirmation:', confirmation ? 'EXISTS' : 'MISSING');
      console.log('❌ Ref Confirmation:', confirmationRef.current ? 'EXISTS' : 'MISSING');
      console.log('❌ Route Params Confirmation:', route?.params?.confirmation ? 'EXISTS' : 'MISSING');
      console.log('❌ VerificationId:', verificationId ? 'EXISTS' : 'MISSING');
      Alert.alert('Error', 'No verification session found. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('\n🔄 STEP 1: Verifying OTP with Firebase...');
      console.log(`⏰ Verification Start: ${new Date().toISOString()}`);
      
      // Step 1: Verify OTP with Firebase using activeConfirmation
      const verificationResult = await activeConfirmation.confirm(code);
      
      console.log('✅ STEP 1 SUCCESS: OTP verified by Firebase');
      console.log('📦 Verification Result:', {
        hasUser: !!verificationResult?.user,
        hasAdditionalUserInfo: !!verificationResult?.additionalUserInfo
      });
      
      // Step 2: Get the current user from Firebase Auth
      console.log('\n🔄 STEP 2: Getting Firebase Auth current user...');
      const user = auth().currentUser;
      
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
        
        // ✅ CRITICAL FIX: Retry backend authentication
        console.log('\n🔄 RETRY: Attempting backend authentication again...');
        try {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('   - Getting fresh Firebase ID token...');
          const retryIdToken = await user.getIdToken(/* forceRefresh */ true);
          console.log(`   - Fresh Firebase ID Token obtained (${retryIdToken.length} chars)`);
          
          console.log('   - Retrying backend firebaseLogin API...');
          const retryBackendResponse = await yoraaAPI.firebaseLogin(retryIdToken);
          
          if (retryBackendResponse && retryBackendResponse.token) {
            console.log('✅ RETRY SUCCESS: Backend authentication successful on retry');
            console.log('📦 Backend JWT token received and stored');
            
            // Store user data in auth storage service
            if (retryBackendResponse.user) {
              console.log('   - Storing user data in auth storage...');
              await authStorageService.storeAuthData(retryBackendResponse.token, retryBackendResponse.user);
              console.log('✅ User data stored in auth storage');
            }
            
            // Verify token storage
            const storedToken = await yoraaAPI.getUserToken();
            console.log(`   - Token Storage After Retry: ${storedToken ? '✅ EXISTS' : '❌ MISSING'}`);
            
            const isAuth = yoraaAPI.isAuthenticated();
            console.log(`🔐 Backend Authentication Status After Retry: ${isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
          } else {
            throw new Error('Retry failed: No token received');
          }
        } catch (retryError) {
          console.error('❌ RETRY FAILED:', retryError.message);
          console.error('⚠️⚠️⚠️ CRITICAL: User logged in to Firebase but NOT authenticated with backend!');
          console.error('This WILL cause "not authenticated" status to display in the app');
          
          // ✅ CRITICAL: Don't continue if backend auth failed - show detailed error
          setIsLoading(false);
          
          // Determine specific error message based on error type
          let errorTitle = 'Authentication Error';
          let errorMessage = 'We could not complete your login. Please try again or contact support if the problem persists.';
          
          if (retryError.message.includes('Network request failed') || retryError.message.includes('timeout')) {
            errorTitle = 'Network Error';
            errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
          } else if (retryError.message.includes('HTML response') || retryError.message.includes('Received HTML')) {
            errorTitle = 'Server Error';
            errorMessage = 'The server is temporarily unavailable. Please try again in a few moments.';
          } else if (retryError.message.includes('No token received')) {
            errorTitle = 'Server Error';
            errorMessage = 'Authentication with our server failed. Please try again or contact support.';
          }
          
          Alert.alert(
            errorTitle,
            errorMessage,
            [
              {
                text: 'Try Again',
                onPress: () => navigation.goBack()
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
          return; // Stop execution - don't proceed without backend auth
        }
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
                fromCheckout: route?.params?.fromCheckout,
                fromReview: route?.params?.fromReview
              });
              
              // Navigate to Terms and Conditions screen after successful login verification
              if (navigation) {
                navigation.navigate('TermsAndConditions', { 
                  previousScreen: 'LoginAccountMobileNumberVerificationCode',
                  user: user,
                  fromCheckout: route?.params?.fromCheckout,
                  fromReview: route?.params?.fromReview,
                  reviewData: route?.params?.reviewData
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
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  🔄 RESEND OTP BUTTON CLICKED - DEBUG INFO                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('📞 Phone Number from state:', phoneNumber);
    console.log('✅ Phone Number Exists:', !!phoneNumber);
    console.log('📏 Phone Number Length:', phoneNumber?.length || 0);
    console.log('📦 Route Params:', route?.params);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Resending OTP to:', phoneNumber);
      console.log('📱 Platform:', Platform.OS);
      console.log('🏗️  Build Type:', __DEV__ ? 'DEBUG' : 'PRODUCTION');
      console.log('📱 Platform:', Platform.OS);
      console.log('🏗️  Build Type:', __DEV__ ? 'DEBUG' : 'PRODUCTION');
      
      // ✅ CRITICAL FIX: Enable app verification for production builds
      console.log('\n🔐 Configuring app verification for resend...');
      if (Platform.OS === 'android' && !__DEV__) {
        console.log('🔐 Production build detected - enabling app verification...');
        auth().settings.appVerificationDisabledForTesting = false;
        console.log('✅ App verification ENABLED for production');
      } else if (__DEV__) {
        console.log('🧪 Development build - disabling app verification for testing...');
        auth().settings.appVerificationDisabledForTesting = true;
        console.log('✅ App verification DISABLED for development');
      }
      
      // Resend OTP using correct React Native Firebase API
      console.log('📤 Sending OTP via Firebase with forceResend=true...');
      const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber, true);
      
      console.log('✅ OTP resent successfully!');
      console.log('📬 Confirmation ID:', newConfirmation.verificationId ? 'Present' : 'Missing');
      
      // ✅ CRITICAL FIX: Update both confirmation state and ref, plus verificationId
      setConfirmation(newConfirmation);
      confirmationRef.current = newConfirmation; // ✅ Also update ref
      
      if (newConfirmation.verificationId) {
        setVerificationId(newConfirmation.verificationId); // ✅ Update verificationId
        console.log('✅ VerificationId updated:', newConfirmation.verificationId);
      }
      
      // ✅ PRODUCTION FIX: Also store in service for production builds
      console.log('💾 Storing confirmation in firebasePhoneAuthService for production...');
      firebasePhoneAuthService.confirmation = newConfirmation;
      firebasePhoneAuthService.verificationId = newConfirmation.verificationId;
      firebasePhoneAuthService.phoneNumber = phoneNumber;
      console.log('✅ Service instance updated');
      
      console.log('✅ Confirmation state, ref, service, and verificationId all updated');
      
      // Reset verification code inputs
      setVerificationCode(['', '', '', '', '', '']);
      
      // Reset timer and restart countdown
      setResendTimer(30);
      
      Alert.alert('Success', 'A new verification code has been sent to your phone.');
      
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.code === 'auth/app-not-authorized') {
        errorMessage = 'App not authorized. Please check Firebase Console configuration.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.message) {
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
            onPress={() => {
              if (route?.params?.fromReview) {
                // Go back to login screen with review data preserved
                navigation && navigation.navigate('LoginAccountMobileNumber', {
                  fromReview: true,
                  returnScreen: route?.params?.returnScreen,
                  reviewData: route?.params?.reviewData
                });
              } else {
                // Default behavior - just go back to login screen
                navigation && navigation.navigate('LoginAccountMobileNumber');
              }
            }}
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
    paddingHorizontal: wp(isTablet ? 10.6 : 8.5),
    paddingTop: hp(isTablet ? 3.1 : 2.5),
  },
  titleContainer: {
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginTop: hp(isTablet ? 6.2 : 5),
    alignItems: 'center',
  },
  title: {
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: fs(isTablet ? 38 : isSmallDevice ? 28 : 32),
    textAlign: 'center',
    marginBottom: hp(isTablet ? 2.5 : 2),
  },
  subtitle: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
    marginTop: hp(isTablet ? 9.3 : 7.5),
    gap: wp(isTablet ? 4 : isSmallDevice ? 2.4 : 3.2),
  },
  codeInput: {
    width: wp(isTablet ? 14.6 : isSmallDevice ? 11 : 12),
    height: hp(isTablet ? 8.5 : isSmallDevice ? 6.4 : 6.8),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: fs(isTablet ? 28 : isSmallDevice ? 20 : 24),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    marginHorizontal: wp(isTablet ? 12.6 : 10.1),
    marginTop: hp(isTablet ? 9.3 : 7.5),
    backgroundColor: '#000000',
    borderRadius: 26.5,
    height: hp(isTablet ? 7.9 : 6.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
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
    marginTop: hp(isTablet ? 6.2 : 5),
    paddingHorizontal: wp(isTablet ? 11 : 8.8),
  },
  resendText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  resendTimer: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  resendLink: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 13 : 14),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});

export default LoginAccountMobileNumberVerificationCode;
