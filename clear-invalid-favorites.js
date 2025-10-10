/**
 * Utility script to clear invalid favorites from AsyncStorage
 * Run this with: node clear-invalid-favorites.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

const clearInvalidFavorites = async () => {
  try {
    console.log('Clearing invalid favorites from local storage...');
    
    // Remove the specific invalid item ID
    const invalidItemId = '68dda7ea3eb841295df47573';
    
    // Get current favorites
    const favoritesData = await AsyncStorage.getItem('favorites');
    if (favoritesData) {
      const favorites = JSON.parse(favoritesData);
      console.log('Current favorites:', favorites);
      
      // Remove invalid item if it exists
      if (Array.isArray(favorites)) {
        const filteredFavorites = favorites.filter(id => id !== invalidItemId);
        await AsyncStorage.setItem('favorites', JSON.stringify(filteredFavorites));
        console.log('✅ Updated favorites:', filteredFavorites);
      }
    }
    
    // Alternatively, just clear all favorites
    // await AsyncStorage.removeItem('favorites');
    // console.log('✅ Cleared all favorites');
    
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
};

// For React Native environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearInvalidFavorites };
}

// For direct execution
if (require.main === module) {
  clearInvalidFavorites();
}
