import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import HeartFilledIcon from '../assets/icons/HeartFilledIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import { useOptimizedList } from '../hooks/usePerformanceOptimization';
import { yoraaAPI } from '../services/yoraaAPI';
import { useFavorites } from '../contexts/FavoritesContext';

// Enhanced delete icon component matching Figma design
const DeleteIcon = ({ size = 34, onPress, isLoading = false, animatedValue }) => (
  <Animated.View
    style={[
      styles.deleteIcon,
      {
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            })
          }
        ],
        opacity: animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
          extrapolate: 'clamp',
        })
      }
    ]}
  >
    <TouchableOpacity 
      style={[styles.deleteIconTouchable, { width: size, height: size }]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <View style={styles.deleteLoadingContainer}>
          <ActivityIndicator size="small" color="#CA3327" />
        </View>
      ) : (
        <TrashIcon size={size} />
      )}
    </TouchableOpacity>
  </Animated.View>
);

const FavouritesContent = ({ navigation }) => {
  const { loadFavoritesFromAPI } = useFavorites();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [deleteIconAnimation] = useState(new Animated.Value(0));

  // Load wishlist items from API
  const loadWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 FavouritesContent: Loading wishlist items...');
      
      const response = await yoraaAPI.getWishlist();
      console.log('🔍 FavouritesContent: API response:', response);
      
      // Check different possible response structures
      let items = [];
      if (response && response.data && response.data.wishlist) {
        // Handle the specific structure where wishlist items have nested 'item' objects
        const rawWishlistItems = response.data.wishlist;
        items = rawWishlistItems.map(wishlistEntry => {
          // Extract the actual item from the wishlist entry
          if (wishlistEntry.item) {
            return {
              ...wishlistEntry.item,
              wishlistEntryId: wishlistEntry._id, // Keep the wishlist entry ID for removal
              dateAdded: wishlistEntry.createdAt || wishlistEntry.dateAdded
            };
          }
          return wishlistEntry;
        });
        console.log('🔍 FavouritesContent: Processed wishlist items:', items.length);
      } else if (response && response.data && response.data.items) {
        items = response.data.items;
      } else if (response && response.items) {
        items = response.items;
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('🔍 FavouritesContent: Final extracted items:', items.length);
      if (items.length > 0) {
        console.log('🔍 FavouritesContent: Sample item structure:', items[0]);
      }
      setWishlistItems(items);
      
    } catch (error) {
      console.error('❌ Error loading wishlist items:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load wishlist items on component mount
  useEffect(() => {
    loadWishlistItems();
  }, [loadWishlistItems]);

  // Use wishlist items directly instead of trying to match with local products
  const favouritedProducts = useMemo(() => {
    console.log('🔍 FavouritesContent: Processing favourited products:', wishlistItems.length);
    return wishlistItems;
  }, [wishlistItems]);

  // Optimized list props using performance hook
  const optimizedListProps = useOptimizedList(
    favouritedProducts,
    useCallback((item) => item._id || item.id || item.itemId, [])
  );

  const handleEditPress = useCallback(() => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    
    // Smooth animation for delete icons with spring physics
    Animated.spring(deleteIconAnimation, {
      toValue: newMode ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isEditMode, deleteIconAnimation]);

  const handleProductPress = useCallback((product) => {
    if (isEditMode) return; // Disable product navigation in edit mode
    navigation.navigate('FavouritesModalOverlayForSizeSelection', { 
      product, 
      previousScreen: 'FavouritesContent' 
    });
  }, [navigation, isEditMode]);

  // Handle individual item removal with smooth animation - no alerts
  const handleRemoveItem = useCallback(async (item) => {
    const itemId = item.wishlistEntryId || item._id;
    
    try {
      console.log('🗑️ Removing item with smooth animation:', {
        itemId,
        productName: item.name || 'Unknown'
      });
      
      setRemovingItems(prev => new Set([...prev, itemId]));
      
      // Immediate visual feedback - remove from UI first for responsiveness
      setWishlistItems(prev => prev.filter(wishlistItem => 
        (wishlistItem.wishlistEntryId || wishlistItem._id) !== itemId
      ));
      
      // Try backend removal in background
      await yoraaAPI.removeFromWishlist(itemId);
      console.log('✅ Item removed successfully from backend');
      
      // Update favorites context to sync the count
      await loadFavoritesFromAPI();
      
    } catch (error) {
      console.error('❌ Backend removal failed:', error);
      
      // Don't re-add the item to UI since user already saw it disappear
      // This provides a smooth experience even with backend issues
      if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log('🔄 Item was already removed from backend (404 error)');
      } else {
        console.error('🚨 Unexpected error during removal:', error.message);
      }
      
      // Still update context even on error to keep UI in sync
      await loadFavoritesFromAPI();
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [loadFavoritesFromAPI]);

  // Handle clear all items - smooth action without confirmation
  const handleClearAll = useCallback(async () => {
    try {
      console.log('🧹 Clearing all wishlist items...');
      
      // Immediate visual feedback - clear UI first
      const itemsToRemove = [...wishlistItems];
      setWishlistItems([]);
      setIsEditMode(false);
      
      // Try backend removal in background for all items
      const removePromises = itemsToRemove.map(async (item) => {
        try {
          const itemId = item.wishlistEntryId || item._id;
          await yoraaAPI.removeFromWishlist(itemId);
          return { success: true, id: itemId };
        } catch (error) {
          console.error(`❌ Failed to remove item ${item.wishlistEntryId || item._id}:`, error);
          return { success: false, id: item.wishlistEntryId || item._id, error };
        }
      });
      
      const results = await Promise.all(removePromises);
      const failedRemovals = results.filter(result => !result.success);
      
      if (failedRemovals.length === 0) {
        console.log('✅ All items cleared successfully from backend');
      } else {
        console.log(`⚠️ ${failedRemovals.length} items failed to remove from backend, but UI is already cleared`);
      }
      
      // Update favorites context to sync the count
      await loadFavoritesFromAPI();
      
    } catch (error) {
      console.error('❌ Error during bulk removal:', error);
      // Don't restore items to UI - keep the smooth experience
      // Still update context to keep UI in sync
      await loadFavoritesFromAPI();
    }
  }, [wishlistItems, loadFavoritesFromAPI]);

  // Memoized render function to prevent unnecessary re-renders
  const renderProductItem = useCallback(({ item, index }) => {
    const isLeftColumn = index % 2 === 0;
    const itemId = item.wishlistEntryId || item._id;
    const isRemoving = removingItems.has(itemId);
    
    // Handle the specific API response structure
    const itemName = item.productName || item.title || item.name || 'Product Name';
    
    // Get price from sizes array (regular or sale price)
    let itemPrice = 'Price not available';
    if (item.sizes && item.sizes.length > 0) {
      const firstSize = item.sizes[0];
      if (firstSize.salePrice) {
        itemPrice = `₹${firstSize.salePrice}`;
        if (firstSize.regularPrice && firstSize.regularPrice !== firstSize.salePrice) {
          itemPrice += ` (was ₹${firstSize.regularPrice})`;
        }
      } else if (firstSize.regularPrice) {
        itemPrice = `₹${firstSize.regularPrice}`;
      }
    }
    
    return (
      <View style={[
        styles.productContainer,
        isLeftColumn ? styles.leftProduct : styles.rightProduct
      ]}>
        {/* Product Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => handleProductPress(item)}
          disabled={isEditMode}
        >
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: item.images[0].url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          
          {/* Delete Icon - Always render but animate visibility */}
          <DeleteIcon 
            size={32}
            onPress={() => handleRemoveItem(item)}
            isLoading={isRemoving}
            animatedValue={deleteIconAnimation}
          />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{itemName}</Text>
          <Text style={styles.productPrice}>{itemPrice}</Text>
        </View>
      </View>
    );
  }, [handleProductPress, isEditMode, removingItems, handleRemoveItem, deleteIconAnimation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Favourites</Text>
        {isEditMode ? (
          <View style={styles.editModeButtons}>
            <TouchableOpacity 
              style={styles.clearAllButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={handleEditPress}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPress}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <View style={styles.content}>
        {loading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your favourites...</Text>
          </View>
        ) : favouritedProducts.length > 0 ? (
          <FlatList
            {...optimizedListProps}
            renderItem={renderProductItem}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
          />
        ) : (
          // Empty state
          <View style={styles.emptyContainer}>
            <View style={styles.heartIconCircle}>
              <HeartFilledIcon color="#14142B" />
            </View>
            <Text style={styles.emptyText}>
              Your <Text style={styles.boldText}>Favourites</Text> is empty.
            </Text>
            <Text style={styles.descriptionText}>
              When you add products, they'll appear here.
            </Text>
            <TouchableOpacity 
              style={styles.addFavouritesButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.buttonText}>Add Favourites Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    width: 68,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.4,
    flex: 1,
  },
  editButton: {
    width: 68,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    letterSpacing: -0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80, // Add padding for bottom navigation bar
  },
  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  productContainer: {
    width: '48%',
  },
  leftProduct: {
    marginRight: 8,
  },
  rightProduct: {
    marginLeft: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productInfo: {
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heartIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamilies.montserrat,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.384,
    lineHeight: 24,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: FontFamilies.montserrat,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.384,
    lineHeight: 24,
    marginBottom: 40,
  },
  addFavouritesButton: {
    backgroundColor: Colors.black,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: 19.2,
  },
  // Delete icon styles - matching Figma design
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  deleteIconTouchable: {
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteLoadingContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(202, 51, 39, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CA3327',
  },
  // Edit mode button styles
  editModeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllButton: {
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: FontFamilies.montserrat,
    color: '#ff4444',
    fontWeight: '500',
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneText: {
    fontSize: 14,
    fontFamily: FontFamilies.montserrat,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default React.memo(FavouritesContent);
