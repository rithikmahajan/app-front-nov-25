import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import yoraaAPI from './yoraaAPI';

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
      console.log('Starting Apple Sign In...');

      // Check if Apple Auth is supported
      if (!appleAuth.isSupported) {
        throw new Error('Apple Sign In is not supported on this device');
      }

      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

      // Sign the user in with the credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      console.log('Apple Sign In successful:', userCredential.user.uid);

      // Handle user data
      const user = userCredential.user;
      const additionalUserInfo = userCredential.additionalUserInfo;

      // Update user profile if this is first time sign in
      if (additionalUserInfo?.isNewUser && appleAuthRequestResponse.fullName) {
        const { givenName, familyName } = appleAuthRequestResponse.fullName;
        const displayName = `${givenName || ''} ${familyName || ''}`.trim();
        
        if (displayName) {
          await user.updateProfile({ displayName });
          console.log('Updated user profile with name:', displayName);
        }
      }

      // Authenticate with Yoraa backend using Firebase ID token
      try {
        const firebaseIdToken = await user.getIdToken(/* forceRefresh */ false);
        console.log('Getting Firebase ID token for backend authentication...');
        
        await yoraaAPI.firebaseLogin(firebaseIdToken);
        console.log('✅ Successfully authenticated with Yoraa backend');
      } catch (backendError) {
        console.warn('Backend authentication failed:', backendError);
        // Don't throw here - Firebase auth succeeded, backend auth is optional
      }

      return userCredential;
    } catch (error) {
      // Handle specific error cases
      // Error code 1001 is user cancellation
      if (error.code === '1001' || error.code === 1001 || error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign In');
        // Silently handle cancellation - don't throw error
        return null;
      }
      
      // Log actual errors
      console.error('Apple Sign In error:', error);
      
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
