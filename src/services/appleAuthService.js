import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import yoraaAPI from './yoraaAPI';
import { decode as base64Decode } from 'base-64';

class AppleAuthService {
  /**
   * Check if Apple Authentication is available on this device
   * @returns {boolean}
   */
  isAppleAuthAvailable() {
    return appleAuth.isSupported;
  }

  /**
   * Sign in with Apple
   * @returns {Promise<object>} User credential
   */
  async signInWithApple() {
    try {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║          🍎 APPLE AUTH SERVICE - SIGN IN FLOW                 ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);

      // CRITICAL: Set sign-in lock IMMEDIATELY to prevent app state interference
      yoraaAPI.setSignInLock(true);
      console.log('🔒 Sign-in lock activated - preventing reinitialize() interference');

      // Check if Apple Auth is supported
      if (!appleAuth.isSupported) {
        console.error('❌ Apple Sign In not supported on this device');
        yoraaAPI.setSignInLock(false);
        throw new Error('Apple Sign In is not supported on this device');
      }
      console.log('✅ Apple Auth is supported');

      // Start the sign-in request
      console.log('\n🔄 STEP 1: Requesting Apple credentials...');
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      
      console.log('✅ Apple credentials received');
      console.log('📦 Complete Apple Response Object:');
      console.log('═══════════════════════════════════════════════════════════════');
      
      // Log ALL available properties from the response
      console.log('🔑 Raw Response (stringified):', JSON.stringify(appleAuthRequestResponse, null, 2));
      console.log('\n📋 Individual Properties:');
      console.log(`   ├─ user: ${appleAuthRequestResponse.user || 'N/A'}`);
      console.log(`   ├─ email: ${appleAuthRequestResponse.email || 'N/A (may be hidden by user)'}`);
      console.log(`   ├─ fullName: ${appleAuthRequestResponse.fullName ? JSON.stringify(appleAuthRequestResponse.fullName) : 'N/A'}`);
      
      if (appleAuthRequestResponse.fullName) {
        console.log(`   │  ├─ givenName: ${appleAuthRequestResponse.fullName.givenName || 'null'}`);
        console.log(`   │  ├─ familyName: ${appleAuthRequestResponse.fullName.familyName || 'null'}`);
        console.log(`   │  ├─ middleName: ${appleAuthRequestResponse.fullName.middleName || 'null'}`);
        console.log(`   │  ├─ namePrefix: ${appleAuthRequestResponse.fullName.namePrefix || 'null'}`);
        console.log(`   │  ├─ nameSuffix: ${appleAuthRequestResponse.fullName.nameSuffix || 'null'}`);
        console.log(`   │  └─ nickname: ${appleAuthRequestResponse.fullName.nickname || 'null'}`);
      }
      
      console.log(`   ├─ identityToken: ${appleAuthRequestResponse.identityToken ? `[${appleAuthRequestResponse.identityToken.length} chars] ${appleAuthRequestResponse.identityToken.substring(0, 50)}...` : 'MISSING'}`);
      console.log(`   ├─ authorizationCode: ${appleAuthRequestResponse.authorizationCode ? `[${appleAuthRequestResponse.authorizationCode.length} chars] ${appleAuthRequestResponse.authorizationCode.substring(0, 50)}...` : 'MISSING'}`);
      console.log(`   ├─ nonce: ${appleAuthRequestResponse.nonce || 'N/A'}`);
      console.log(`   ├─ state: ${appleAuthRequestResponse.state || 'N/A'}`);
      console.log(`   ├─ realUserStatus: ${appleAuthRequestResponse.realUserStatus !== undefined ? appleAuthRequestResponse.realUserStatus : 'N/A'}`);
      
      // Decode and log identityToken payload if available
      if (appleAuthRequestResponse.identityToken) {
        try {
          const tokenParts = appleAuthRequestResponse.identityToken.split('.');
          if (tokenParts.length === 3) {
            // Decode base64 payload (React Native compatible)
            const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = base64Decode(base64Payload);
            const payload = JSON.parse(decodedPayload);
            
            console.log('\n🔓 Decoded Identity Token Payload:');
            console.log(JSON.stringify(payload, null, 2));
            console.log(`   ├─ iss (issuer): ${payload.iss || 'N/A'}`);
            console.log(`   ├─ sub (subject/user ID): ${payload.sub || 'N/A'}`);
            console.log(`   ├─ aud (audience): ${payload.aud || 'N/A'}`);
            console.log(`   ├─ iat (issued at): ${payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A'}`);
            console.log(`   ├─ exp (expires): ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'}`);
            console.log(`   ├─ email: ${payload.email || 'N/A'}`);
            console.log(`   ├─ email_verified: ${payload.email_verified !== undefined ? payload.email_verified : 'N/A'}`);
            console.log(`   ├─ is_private_email: ${payload.is_private_email !== undefined ? payload.is_private_email : 'N/A'}`);
            console.log(`   └─ nonce_supported: ${payload.nonce_supported !== undefined ? payload.nonce_supported : 'N/A'}`);
          }
        } catch (decodeError) {
          console.log('⚠️ Could not decode identity token:', decodeError.message);
        }
      }
      
      console.log('═══════════════════════════════════════════════════════════════');
      
      // Check all possible properties that might be in the object
      const allKeys = Object.keys(appleAuthRequestResponse);
      if (allKeys.length > 0) {
        console.log('\n🔍 All Available Keys in Response:', allKeys.join(', '));
      }

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        console.error('❌ No identity token in Apple response');
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      console.log('\n🔄 STEP 2: Creating Firebase credential...');
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      console.log('✅ Firebase credential created');

      // Sign the user in with the credential
      console.log('\n🔄 STEP 3: Signing in to Firebase...');
      const userCredential = await auth().signInWithCredential(appleCredential);

      console.log('✅ Firebase Sign In successful');
      console.log('👤 User Details:');
      console.log(`   - UID: ${userCredential.user.uid}`);
      console.log(`   - Email: ${userCredential.user.email}`);
      console.log(`   - Display Name: ${userCredential.user.displayName || 'N/A'}`);
      console.log(`   - Phone: ${userCredential.user.phoneNumber || 'N/A'}`);
      console.log(`   - Email Verified: ${userCredential.user.emailVerified}`);
      console.log(`   - Created At: ${userCredential.user.metadata?.creationTime}`);
      console.log(`   - Last Sign In: ${userCredential.user.metadata?.lastSignInTime}`);
      console.log(`   - Is New User: ${userCredential.additionalUserInfo?.isNewUser}`);
      console.log(`   - Provider ID: ${userCredential.user.providerData?.[0]?.providerId || 'N/A'}`);

      // Handle user data
      const user = userCredential.user;
      const additionalUserInfo = userCredential.additionalUserInfo;

      // Update user profile if this is first time sign in
      console.log('\n🔄 STEP 4: Firebase Profile Update Check...');
      console.log(`   - Is New Firebase User: ${additionalUserInfo?.isNewUser ? 'YES ✨' : 'NO (existing)'}`);
      console.log(`   - Current Display Name: ${user.displayName || 'None'}`);
      console.log(`   - Apple Provided Name: ${appleAuthRequestResponse.fullName ? JSON.stringify(appleAuthRequestResponse.fullName) : 'None (privacy - only sent on first login)'}`);
      
      if (additionalUserInfo?.isNewUser && appleAuthRequestResponse.fullName) {
        console.log('   - Action: Updating Firebase profile with Apple-provided name');
        const { givenName, familyName } = appleAuthRequestResponse.fullName;
        const displayName = `${givenName || ''} ${familyName || ''}`.trim();
        
        if (displayName) {
          await user.updateProfile({ displayName });
          console.log(`✅ Updated Firebase profile with name: ${displayName}`);
        } else {
          console.log('⚠️ No display name to update');
        }
      } else if (!additionalUserInfo?.isNewUser) {
        console.log('   - Action: ⏭️ Skipping (existing Firebase user - profile already set)');
      } else {
        console.log('   - Action: ⏭️ Skipping (no name data from Apple - privacy feature)');
      }

      // Authenticate with Yoraa backend using Firebase ID token
      console.log('\n🔄 STEP 5: Backend Authentication & User Verification...');
      console.log('⚠️ CRITICAL: Backend authentication is REQUIRED for sign-in');
      console.log(`   - Firebase UID: ${user.uid}`);
      console.log(`   - Firebase Email: ${user.email || 'None (Apple privacy)'}`);
      console.log(`   - Firebase Display Name: ${user.displayName || 'None'}`);
      console.log(`   - Firebase User Status: ${additionalUserInfo?.isNewUser ? '✨ NEW' : '👋 EXISTING'}`);
      
      try {
        console.log('   - Getting Firebase ID token...');
        const firebaseIdToken = await user.getIdToken(/* forceRefresh */ true);
        console.log(`   - Firebase ID Token: ${firebaseIdToken.substring(0, 30)}... (${firebaseIdToken.length} chars)`);
        
        console.log('   - Calling backend firebaseLogin API...');
        console.log('   - Backend will verify user exists or create new account');
        const backendResponse = await yoraaAPI.firebaseLogin(firebaseIdToken);
        
        console.log('\n✅ Backend authentication successful');
        
        // Extract user data from response
        const userData = backendResponse.data?.user || backendResponse.user;
        const isNewBackendUser = backendResponse.data?.isNewUser || backendResponse.isNewUser || false;
        
        // Comprehensive User Sync Verification
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║           🔄 FIREBASE ↔️ BACKEND SYNC VERIFICATION            ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        
        console.log('\n📊 Firebase User State:');
        console.log(`   - UID: ${user.uid}`);
        console.log(`   - Email: ${user.email || 'Hidden by Apple'}`);
        console.log(`   - Display Name: ${user.displayName || 'Not set'}`);
        console.log(`   - Is New User: ${additionalUserInfo?.isNewUser ? 'YES ✨' : 'NO 👋'}`);
        console.log(`   - Created: ${user.metadata?.creationTime || 'Unknown'}`);
        console.log(`   - Last Sign In: ${user.metadata?.lastSignInTime || 'Unknown'}`);
        
        if (userData) {
          console.log('\n� Backend User State:');
          console.log(`   - User ID: ${userData._id || userData.id || 'Unknown'}`);
          console.log(`   - Name: ${userData.name || 'Not set'}`);
          console.log(`   - Email: ${userData.email || 'Not set'}`);
          console.log(`   - Is New User: ${isNewBackendUser ? 'YES ✨' : 'NO 👋'}`);
          console.log(`   - Created At: ${userData.createdAt || 'Unknown'}`);
          console.log(`   - Last Login: ${userData.lastLogin || userData.updatedAt || 'Unknown'}`);
          console.log(`   - Auth Provider: ${userData.authProvider || 'Unknown'}`);
          
          // Verify sync status
          console.log('\n🔍 Sync Verification:');
          
          // Check if Firebase and Backend agree on user status
          if (additionalUserInfo?.isNewUser === isNewBackendUser) {
            console.log(`   ✅ User Status: SYNCED (both say ${isNewBackendUser ? 'NEW' : 'EXISTING'})`);
          } else {
            console.log(`   ⚠️ User Status: MISMATCH!`);
            console.log(`      - Firebase says: ${additionalUserInfo?.isNewUser ? 'NEW' : 'EXISTING'}`);
            console.log(`      - Backend says: ${isNewBackendUser ? 'NEW' : 'EXISTING'}`);
            console.log(`      - This can happen if user was created via different auth provider`);
            console.log(`      - Backend automatically links accounts with same email`);
          }
          
          // Verify email sync (if available)
          if (user.email && userData.email) {
            if (user.email === userData.email) {
              console.log(`   ✅ Email: SYNCED (${user.email})`);
            } else {
              console.log(`   ⚠️ Email: MISMATCH!`);
              console.log(`      - Firebase: ${user.email}`);
              console.log(`      - Backend: ${userData.email}`);
            }
          } else if (user.email) {
            console.log(`   ℹ️ Email: Firebase has email, backend will sync on next update`);
          } else {
            console.log(`   ℹ️ Email: Hidden by Apple (privacy feature)`);
          }
          
          // Verify name sync
          if (user.displayName && userData.name) {
            if (user.displayName === userData.name) {
              console.log(`   ✅ Name: SYNCED (${user.displayName})`);
            } else {
              console.log(`   ℹ️ Name: Different between Firebase and Backend`);
              console.log(`      - Firebase: ${user.displayName}`);
              console.log(`      - Backend: ${userData.name}`);
            }
          } else if (user.displayName) {
            console.log(`   ℹ️ Name: Set in Firebase, backend will sync`);
          } else if (userData.name) {
            console.log(`   ℹ️ Name: Set in Backend only`);
          } else {
            console.log(`   ℹ️ Name: Not set (Apple privacy - only sent on first login)`);
          }
          
          console.log('\n' + '═'.repeat(65));
          
        } else {
          console.warn('⚠️ No user data in backend response - unexpected');
        }
        
        console.log('\nℹ️ Note: Backend automatically links accounts with same email across providers');
        
        // CRITICAL: Verify token was stored correctly
        console.log('\n🔍 STEP 6: Verifying token storage...');
        const storedToken = await yoraaAPI.getUserToken();
        console.log(`   - Token Storage: ${storedToken ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!storedToken) {
          console.error('❌ CRITICAL: Backend token not stored properly');
          throw new Error('Backend authentication failed: Token not stored');
        }
        
        // Double-check authentication status
        const isAuth = yoraaAPI.isAuthenticated();
        console.log(`🔐 Final Authentication Status: ${isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
        
        if (!isAuth) {
          console.error('❌ CRITICAL: Backend authentication verification failed');
          throw new Error('Backend authentication verification failed');
        }
        
        console.log('✅ STEP 6: Token verification complete');
        
        // ✅ NEW: STEP 7 - Initialize and Register FCM Token
        console.log('\n🔔 STEP 7: Initializing FCM service...');
        try {
          // Import FCM service
          const fcmService = require('./fcmService').default;
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
        console.log('✅ STEP 7: FCM setup completed');
        
      } catch (backendError) {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║         ❌ BACKEND AUTHENTICATION FAILED - CRITICAL          ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.error('❌ Backend Error Type:', backendError.constructor.name);
        console.error('❌ Backend Error Code:', backendError.code);
        console.error('❌ Backend Error Message:', backendError.message);
        console.error('❌ Stack Trace:', backendError.stack);
        
        // ✅ CRITICAL FIX: Retry backend authentication before rolling back
        console.log('\n🔄 RETRY: Attempting backend authentication again...');
        try {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('   - Getting fresh Firebase ID token...');
          const retryIdToken = await userCredential.user.getIdToken(/* forceRefresh */ true);
          console.log(`   - Fresh Firebase ID Token obtained (${retryIdToken.length} chars)`);
          
          console.log('   - Retrying backend firebaseLogin API...');
          const retryBackendResponse = await yoraaAPI.firebaseLogin(retryIdToken);
          
          if (retryBackendResponse && retryBackendResponse.token) {
            console.log('✅ RETRY SUCCESS: Backend authentication successful on retry');
            
            // Verify token storage
            const storedToken = await yoraaAPI.getUserToken();
            console.log(`   - Token Storage After Retry: ${storedToken ? '✅ EXISTS' : '❌ MISSING'}`);
            
            const isAuth = yoraaAPI.isAuthenticated();
            console.log(`🔐 Backend Authentication Status After Retry: ${isAuth ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
            
            if (!isAuth) {
              throw new Error('Token not persisted after retry');
            }
            
            // Success - continue with the flow
            console.log('✅ Retry successful - continuing with Apple Sign In flow');
          } else {
            throw new Error('Retry failed: No token received');
          }
        } catch (retryError) {
          console.error('❌ RETRY FAILED:', retryError.message);
          
          // CRITICAL: Backend authentication FAILED even after retry - Rollback Firebase auth
          console.error('🔄 ROLLBACK: Signing out from Firebase due to backend auth failure...');
          
          try {
            await auth().signOut();
            console.log('✅ Firebase sign-out successful');
          } catch (signOutError) {
            console.error('❌ Failed to sign out from Firebase:', signOutError);
          }
          
          // Clear any partial data
          await yoraaAPI.clearAuthTokens();
          
          // Throw a user-friendly error
          const errorMessage = backendError.message || 'Backend authentication failed';
          throw new Error(`Sign-in failed: ${errorMessage}. Please try again or contact support.`);
        }
      }

      console.log('\n✅ Apple Sign In flow completed successfully');
      console.log(`⏰ End Time: ${new Date().toISOString()}`);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      // CRITICAL: Release sign-in lock after successful completion
      yoraaAPI.setSignInLock(false);
      console.log('🔓 Sign-in lock released - authentication complete');
      
      return userCredential;
    } catch (error) {
      // CRITICAL: Release sign-in lock on ANY error
      yoraaAPI.setSignInLock(false);
      console.log('🔓 Sign-in lock released - error occurred');
      
      // Handle specific error cases
      // Error code 1001 is user cancellation
      if (error.code === '1001' || error.code === 1001 || error.code === 'ERR_REQUEST_CANCELED') {
        console.log('ℹ️ User canceled Apple Sign In (not an error)');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        // Silently handle cancellation - don't throw error
        return null;
      }
      
      // Log actual errors
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              ❌ APPLE SIGN IN ERROR                           ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error:', JSON.stringify(error, null, 2));
      console.error('❌ Stack Trace:', error.stack);
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        throw new Error('Apple Sign In not handled');
      } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
        throw new Error('Apple Sign In not interactive');
      } else if (error.code === 'ERR_REQUEST_UNKNOWN') {
        throw new Error('Unknown Apple Sign In error');
      }
      
      throw new Error(error.message || 'Apple Sign In failed');
    }
  }

  /**
   * Get current Apple Auth state
   * @returns {Promise<number>} Current credential state
   */
  async getCredentialStateForUser(userID) {
    try {
      const credentialState = await appleAuth.getCredentialStateForUser(userID);
      return credentialState;
    } catch (error) {
      console.error('Error getting Apple credential state:', error);
      throw error;
    }
  }

  /**
   * Sign out from Apple (mainly clears local state)
   * Note: Apple doesn't provide a traditional sign out, 
   * but we can sign out from Firebase
   */
  async signOut() {
    try {
      await auth().signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Listen for Apple ID credential revoked events
   * @param {function} callback - Callback function for credential revoked
   */
  onCredentialRevoked(callback) {
    return appleAuth.onCredentialRevoked(callback);
  }
}

// Export singleton instance
export default new AppleAuthService();
