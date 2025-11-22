import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { yoraaAPI } from '../services/yoraaAPI';
import authManager from '../services/authManager';
import { Alert } from 'react-native';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  // Initialize with empty favorites
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize API and load favorites from backend
  useEffect(() => {
    const initializeFavorites = async () => {
      try {
        await yoraaAPI.initialize();
        // Always load favorites - API handles both authenticated and guest sessions
        await loadFavoritesFromAPI();
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing favorites:', error);
        setInitialized(true);
      }
    };

    initializeFavorites();

    // Listen for auth state changes and sync favorites
    const removeAuthListener = authManager.addAuthStateListener(async (user) => {
      if (user && yoraaAPI.isAuthenticated()) {
        // User signed in - sync local favorites to server, then load server favorites
        if (favorites.size > 0) {
          await syncLocalFavoritesToServer();
        }
        await loadFavoritesFromAPI();
      } else {
        // User signed out or is guest - still load favorites (will use guest session)
        await loadFavoritesFromAPI();
      }
    });

    return removeAuthListener;
  }, [favorites.size, syncLocalFavoritesToServer]);

  // Sync local favorites to server when user signs in
  const syncLocalFavoritesToServer = useCallback(async () => {
    if (!yoraaAPI.isAuthenticated() || favorites.size === 0) {
      return;
    }

    console.log('❤️ Syncing local favorites to server...', favorites.size, 'items');
    
    try {
      for (const productId of favorites) {
        try {
          // Use toggleWishlist to handle items that might already exist on server
          const result = await yoraaAPI.toggleWishlist(productId);
          if (result.added) {
            console.log('✅ Synced item to server:', productId);
          } else {
            console.log('ℹ️ Item already existed on server:', productId);
          }
        } catch (error) {
          // Handle "Item not found" errors by removing from local favorites
          if (error.message?.includes('Item not found') || error.message?.includes('not found')) {
            console.warn('⚠️ Item not found on server, removing from local favorites:', productId);
            setFavorites(prev => {
              const newFavorites = new Set(prev);
              newFavorites.delete(productId);
              return newFavorites;
            });
          } else {
            console.error('❌ Error syncing item:', productId, error.message);
          }
          // Continue syncing other items even if one fails
        }
      }
      console.log('✅ Local favorites sync completed');
    } catch (error) {
      console.error('❌ Error syncing local favorites to server:', error);
      // Don't clear local favorites on sync error - user can continue browsing
    }
  }, [favorites]);

  // Load favorites from API
  const loadFavoritesFromAPI = async () => {
    // Always try to load wishlist - API will use guest session if not authenticated
    try {
      setLoading(true);
      console.log('🔍 Loading favorites from API... (authenticated:', yoraaAPI.isAuthenticated(), ')');
      const response = await yoraaAPI.getWishlist();
      
      console.log('🔍 API Response structure:', {
        response,
        hasData: !!response.data,
        hasItems: !!(response.data && response.data.items),
        directItems: !!response.items,
        fullResponseData: response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data'
      });
      
      // Check different possible response structures
      let items = null;
      if (response && response.data && response.data.items) {
        items = response.data.items;
        console.log('🔍 Found items in response.data.items:', items.length);
      } else if (response && response.items) {
        items = response.items;
        console.log('🔍 Found items in response.items:', items.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
        console.log('🔍 Found items in response.data (array):', items.length);
      } else if (response && response.data && response.data.wishlist) {
        items = response.data.wishlist;
        console.log('🔍 Found items in response.data.wishlist:', items.length);
        console.log('🔍 Sample wishlist item structure:', items[0]);
      } else if (response && response.data && response.data.products) {
        items = response.data.products;
        console.log('🔍 Found items in response.data.products:', items.length);
      } else if (response && response.wishlist) {
        items = response.wishlist;
        console.log('🔍 Found items in response.wishlist:', items.length);
      } else if (response && response.products) {
        items = response.products;
        console.log('🔍 Found items in response.products:', items.length);
      } else if (response && response.data) {
        // Try to find any array in the data object
        const dataKeys = Object.keys(response.data);
        console.log('🔍 Available data keys:', dataKeys);
        for (const key of dataKeys) {
          if (Array.isArray(response.data[key])) {
            items = response.data[key];
            console.log(`🔍 Found items in response.data.${key}:`, items.length);
            break;
          }
        }
      }
      
      if (items && items.length > 0) {
        // Convert API response to Set of product IDs
        const favoriteIds = new Set(items.map(item => {
          const id = item.itemId || item._id || item.id || item.productId;
          console.log('🔍 Processing item:', { item, extractedId: id });
          return id;
        }));
        
        console.log('🔍 Setting favorites:', Array.from(favoriteIds));
        setFavorites(favoriteIds);
      } else {
        console.log('🔍 No items found in API response, setting empty favorites');
        setFavorites(new Set());
      }
    } catch (error) {
      console.error('Error loading favorites from API:', error);
      // Don't show error to user for initial load
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    // Always sync with backend - API handles both authenticated and guest sessions
    try {
      const result = await yoraaAPI.toggleWishlist(productId);
      
      // Update local state based on backend response
      const newFavorites = new Set(favorites);
      if (result.added) {
        newFavorites.add(productId);
        console.log('✅ Item added to wishlist');
      } else {
        newFavorites.delete(productId);
        console.log('✅ Item removed from wishlist (was already added)');
      }
      setFavorites(newFavorites);
      
    } catch (error) {
      const errorMessage = yoraaAPI.handleError(error);
      
      // Don't show alerts for expected wishlist toggle errors
      if (error.isExpectedWishlistError) {
        console.log('ℹ️ Expected wishlist error handled by toggle logic');
        return;
      }
      
      console.error('Error toggling favorites:', errorMessage);
      
      if (errorMessage.includes('Authentication required')) {
        Alert.alert('Login Required', 'Please log in to add items to your favorites.');
      } else {
        Alert.alert('Error', 'Failed to update favorites. Please try again.');
      }
    }
  };

  const removeFromFavorites = async (productId) => {
    // Optimistic update
    const newFavorites = new Set(favorites);
    newFavorites.delete(productId);
    setFavorites(newFavorites);

    // Always sync with backend - API handles both authenticated and guest sessions
    try {
      await yoraaAPI.removeFromWishlist(productId);
    } catch (error) {
      // Revert optimistic update on error
      const revertedFavorites = new Set(favorites);
      revertedFavorites.add(productId);
      setFavorites(revertedFavorites);
      
      const errorMessage = yoraaAPI.handleError(error);
      console.error('Error removing from favorites:', errorMessage);
      Alert.alert('Error', 'Failed to remove item from favorites. Please try again.');
    }
  };

  const toggleFavorite = async (productId) => {
    // Always use backend toggle logic - API handles both authenticated and guest sessions
    try {
      const result = await yoraaAPI.toggleWishlist(productId);
      
      // Update local state based on backend response
      const newFavorites = new Set(favorites);
      if (result.added) {
        newFavorites.add(productId);
        console.log('✅ Item added to wishlist');
      } else {
        newFavorites.delete(productId);
        console.log('✅ Item removed from wishlist');
      }
      setFavorites(newFavorites);
      
      return result.added;
    } catch (error) {
      const errorMessage = yoraaAPI.handleError(error);
      console.error('Error toggling favorites:', errorMessage);
      
      if (errorMessage.includes('Authentication required')) {
        Alert.alert('Login Required', 'Please log in to manage your favorites.');
      } else {
        Alert.alert('Error', 'Failed to update favorites. Please try again.');
      }
      return null; // Indicate error
    }
  };

  const isFavorite = (productId) => {
    return favorites.has(productId);
  };

  const getFavoritesArray = () => {
    return Array.from(favorites);
  };

  const getFavoritesCount = () => {
    return favorites.size;
  };

  // Clean up invalid favorites from local storage
  const cleanupInvalidFavorites = useCallback(async () => {
    if (favorites.size === 0) return;
    
    console.log('🧹 Cleaning up invalid favorites...');
    const validFavorites = new Set();
    let removedCount = 0;
    
    for (const productId of favorites) {
      try {
        // Test if item exists by making a simple API call
        const response = await yoraaAPI.getItemById(productId);
        if (response && response.data) {
          validFavorites.add(productId);
        } else {
          removedCount++;
          console.log('🗑️ Removed invalid favorite:', productId);
        }
      } catch (error) {
        if (error.message?.includes('not found') || error.message?.includes('Item not found')) {
          removedCount++;
          console.log('🗑️ Removed invalid favorite:', productId);
        } else {
          // Keep the item if we can't verify (network issues, etc.)
          validFavorites.add(productId);
        }
      }
    }
    
    if (removedCount > 0) {
      setFavorites(validFavorites);
      console.log(`✅ Cleaned up ${removedCount} invalid favorites`);
    }
  }, [favorites]);

  const value = {
    favorites, // Expose favorites state for reactive updates
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesArray,
    getFavoritesCount,
    loadFavoritesFromAPI,
    cleanupInvalidFavorites,
    loading,
    initialized,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
