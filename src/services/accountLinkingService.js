import auth from '@react-native-firebase/auth';
import appleAuthService from './appleAuthService';
import googleAuthService from './googleAuthService';
import yoraaAPI from './yoraaAPI';

class AccountLinkingService {
  /**
   * Handle account conflict and initiate linking flow
   * @param {Object} conflictData - Data from 409 response
   * @param {string} newProvider - The provider user tried to sign in with ('apple', 'google', 'email')
   * @param {Function} onSuccess - Callback on successful linking
   * @param {Function} onCancel - Callback on user cancellation
   */
  async handleAccountConflict(conflictData, newProvider, onSuccess, onCancel) {
    try {
      console.log('🔗 Starting account linking flow...', {
        email: conflictData.email,
        existingMethods: conflictData.existing_methods,
        newProvider
      });

      return {
        email: conflictData.email,
        existingMethod: conflictData.existing_methods?.[0] || 'email',
        newProvider,
        onSuccess,
        onCancel
      };
    } catch (error) {
      console.error('❌ Error handling account conflict:', error);
      throw error;
    }
  }

  /**
   * Re-authenticate user with their existing provider
   * @param {string} method - Authentication method ('email', 'google', 'apple')
   * @param {string} email - User's email
   * @param {string} password - Password (for email auth only)
   * @returns {Promise<string>} JWT token
   */
  async reAuthenticateUser(method, email, password = null) {
    try {
      console.log(`🔐 Re-authenticating user with ${method}...`);

      let userCredential;

      if (method === 'email') {
        if (!password) {
          throw new Error('Password is required for email authentication');
        }
        
        // Sign in with email/password
        userCredential = await auth().signInWithEmailAndPassword(email, password);
        
      } else if (method === 'google') {
        // Re-authenticate with Google
        userCredential = await googleAuthService.signInWithGoogle();
        
        if (!userCredential) {
          throw new Error('Google authentication was cancelled');
        }
        
      } else if (method === 'apple') {
        // Re-authenticate with Apple
        userCredential = await appleAuthService.signInWithApple();
        
        if (!userCredential) {
          throw new Error('Apple authentication was cancelled');
        }
        
      } else {
        throw new Error(`Unsupported authentication method: ${method}`);
      }

      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      console.log('✅ Re-authentication successful');
      
      // Authenticate with backend to get JWT
      const response = await yoraaAPI.firebaseLogin(idToken);
      
      return response.token;
      
    } catch (error) {
      console.error(`❌ Re-authentication failed with ${method}:`, error);
      throw error;
    }
  }

  /**
   * Link new provider to existing account
   * @param {string} newProvider - Provider to link ('apple', 'google')
   * @returns {Promise<Object>} Linking result
   */
  async linkNewProvider(newProvider) {
    try {
      console.log(`🔗 Linking ${newProvider} to existing account...`);

      let userCredential;

      if (newProvider === 'apple') {
        userCredential = await appleAuthService.signInWithApple();
        
        if (!userCredential) {
          throw new Error('Apple authentication was cancelled');
        }
        
      } else if (newProvider === 'google') {
        userCredential = await googleAuthService.signInWithGoogle();
        
        if (!userCredential) {
          throw new Error('Google authentication was cancelled');
        }
        
      } else {
        throw new Error(`Unsupported provider for linking: ${newProvider}`);
      }

      // Get Firebase ID token for the new provider
      const idToken = await userCredential.user.getIdToken();
      
      // Call backend to link the provider
      const response = await yoraaAPI.linkAuthProvider(idToken);
      
      console.log('✅ Provider linked successfully:', response);
      
      return response;
      
    } catch (error) {
      console.error(`❌ Failed to link ${newProvider}:`, error);
      throw error;
    }
  }

  /**
   * Complete account linking flow
   * @param {string} existingMethod - Existing auth method
   * @param {string} newProvider - New provider to link
   * @param {string} email - User's email
   * @param {string} password - Password (for email re-auth only)
   * @returns {Promise<Object>} Final result
   */
  async completeAccountLinking(existingMethod, newProvider, email, password = null) {
    try {
      console.log('🔄 Starting complete account linking flow...');

      // Step 1: Re-authenticate with existing method
      console.log('Step 1: Re-authenticating with existing method...');
      const token = await this.reAuthenticateUser(existingMethod, email, password);
      
      if (!token) {
        throw new Error('Re-authentication failed - no token received');
      }

      console.log('✅ Step 1 complete: User re-authenticated');

      // Step 2: Link new provider
      console.log('Step 2: Linking new provider...');
      const linkResult = await this.linkNewProvider(newProvider);
      
      console.log('✅ Step 2 complete: Provider linked');
      console.log('✅ Account linking complete!');

      return {
        success: true,
        user: linkResult.user,
        linkedProviders: linkResult.user?.linkedProviders || [existingMethod, newProvider]
      };
      
    } catch (error) {
      console.error('❌ Complete account linking failed:', error);
      throw error;
    }
  }

  /**
   * Get linked providers for current user
   * @returns {Promise<Array>} List of linked providers
   */
  async getLinkedProviders() {
    try {
      const response = await yoraaAPI.getLinkedProviders();
      return response.linkedProviders || [];
    } catch (error) {
      console.error('❌ Failed to get linked providers:', error);
      throw error;
    }
  }
}

export default new AccountLinkingService();
