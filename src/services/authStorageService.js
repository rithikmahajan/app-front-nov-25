import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

class AuthStorageService {
  /**
   * Store authentication data after successful login
   * MUST be called immediately after receiving login response
   */
  async storeAuthData(token, userData) {
    try {
      console.log('💾 Storing auth data...', { userId: userData?._id || userData?.uid });
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [USER_DATA_KEY, JSON.stringify(userData)]
      ]);
      
      console.log('✅ Auth data stored successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      return { success: false, error };
    }
  }

  /**
   * Retrieve authentication token
   */
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('🔑 Retrieved token:', token ? 'EXISTS' : 'NULL');
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Retrieve user data
   */
  async getUserData() {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('👤 Retrieved user data:', { userId: userData?._id || userData?.uid, name: userData?.name });
        return userData;
      }
      console.log('⚠️ No user data found');
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const token = await this.getAuthToken();
      const userData = await this.getUserData();
      
      const isAuth = !!(token && userData);
      console.log('🔐 Authentication status:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Clear all authentication data (logout)
   */
  async clearAuthData() {
    try {
      console.log('🧹 Clearing auth data...');
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ Auth data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      return { success: false, error };
    }
  }

  /**
   * Update user data only (keep token same)
   */
  async updateUserData(userData) {
    try {
      console.log('📝 Updating user data...');
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ User data updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      return { success: false, error };
    }
  }

  /**
   * Sync with existing userToken storage for backward compatibility
   */
  async syncWithLegacyToken() {
    try {
      const legacyToken = await AsyncStorage.getItem('userToken');
      const newToken = await this.getAuthToken();
      
      if (legacyToken && !newToken) {
        // Migrate legacy token to new storage
        console.log('📦 Migrating legacy token to new storage...');
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
        return { success: true, migrated: true };
      }
      
      if (newToken && !legacyToken) {
        // Keep both in sync for backward compatibility
        await AsyncStorage.setItem('userToken', newToken);
        return { success: true, synced: true };
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error syncing with legacy token:', error);
      return { success: false, error };
    }
  }
}

export default new AuthStorageService();
