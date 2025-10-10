import AsyncStorage from '@react-native-async-storage/async-storage';

class UserPreferencesService {
  static KEYS = {
    HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
    USER_PREFERENCES: 'userPreferences',
  };

  /**
   * Check if user has completed onboarding
   * @returns {Promise<boolean>}
   */
  async hasCompletedOnboarding() {
    try {
      const completed = await AsyncStorage.getItem(UserPreferencesService.KEYS.HAS_COMPLETED_ONBOARDING);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   * @returns {Promise<void>}
   */
  async setOnboardingCompleted() {
    try {
      await AsyncStorage.setItem(UserPreferencesService.KEYS.HAS_COMPLETED_ONBOARDING, 'true');
      console.log('Onboarding marked as completed');
    } catch (error) {
      console.error('Error setting onboarding completed:', error);
    }
  }

  /**
   * Save user preferences
   * @param {object} preferences - User preferences object
   * @returns {Promise<void>}
   */
  async saveUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(
        UserPreferencesService.KEYS.USER_PREFERENCES, 
        JSON.stringify(preferences)
      );
      console.log('User preferences saved:', preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<object|null>}
   */
  async getUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(UserPreferencesService.KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Clear all user data (for logout)
   * @returns {Promise<void>}
   */
  async clearUserData() {
    try {
      await AsyncStorage.multiRemove([
        UserPreferencesService.KEYS.HAS_COMPLETED_ONBOARDING,
        UserPreferencesService.KEYS.USER_PREFERENCES,
      ]);
      console.log('User data cleared');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

// Export singleton instance
export default new UserPreferencesService();
