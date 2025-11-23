import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import GlobalBackButton from '../components/GlobalBackButton';
import { useFavorites } from '../contexts/FavoritesContext';
import { yoraaAPI } from '../services/yoraaAPI';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const TrashIcon = ({ size = 20 }) => (
  <View style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{ color: 'white', fontSize: size * 0.6, fontWeight: 'bold' }}>×</Text>
  </View>
);

const FavouritesContentEditView = ({ navigation }) => {
  const { loadFavoritesFromAPI, removeFromFavorites } = useFavorites();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());

  // Load wishlist items from API
  const loadWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await yoraaAPI.getWishlist();
      console.log('EditView - Wishlist API Response:', JSON.stringify(response, null, 2));

      let items = [];
      if (response?.data?.wishlist && Array.isArray(response.data.wishlist)) {
        items = response.data.wishlist.map(wishlistEntry => {
          const product = wishlistEntry.item;
          return {
            id: wishlistEntry._id, // Use wishlist entry ID for removal
            productId: product._id,
            name: product.productName || 'Product',
            price: product.sizes?.[0]?.salePrice ? `₹${product.sizes[0].salePrice}` : 'N/A',
            originalPrice: product.sizes?.[0]?.originalPrice ? `₹${product.sizes[0].originalPrice}` : null,
            image: product.images?.[0]?.url || null,
            isSelected: false,
          };
        });
      }
      
      console.log('EditView - Processed items:', items.length);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlistItems();
  }, [loadWishlistItems]);

  // Handle individual item removal
  const handleRemoveItem = async (itemId) => {
    try {
      setRemovingItems(prev => new Set([...prev, itemId]));
      
      // Find the product ID from the wishlist item
      const wishlistItem = wishlistItems.find(i => i.id === itemId);
      if (!wishlistItem) {
        console.error('Item not found:', itemId);
        return;
      }
      
      // Use context method which handles the API call and state updates
      await removeFromFavorites(wishlistItem.productId);
      
      // Remove from local state
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      // Refresh favorites context
      await loadFavoritesFromAPI();
      
      console.log('Item removed successfully:', itemId);
    } catch (error) {
      console.error('Error removing item:', error);
      // The context already shows an error alert, so we don't need to show another one
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Handle clear all items
  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              
              // Remove all items one by one using context method
              const removePromises = wishlistItems.map(item => 
                removeFromFavorites(item.productId)
              );
              
              await Promise.all(removePromises);
              
              // Clear local state
              setWishlistItems([]);
              
              // Refresh favorites context
              await loadFavoritesFromAPI();
              
              console.log('All items cleared successfully');
            } catch (error) {
              console.error('Error clearing all items:', error);
              Alert.alert('Error', 'Failed to clear all items');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleRemovePress = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => handleRemoveItem(itemId)
        }
      ]
    );
  };

  const renderProductItem = ({ item, index }) => {
    const isRemoving = removingItems.has(item.id);
    
    return (
      <View style={[
        styles.productContainer,
        isTablet ? styles.leftProduct : (index % 2 === 0 ? styles.leftProduct : styles.rightProduct),
      ]}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          
          {/* Delete/Trash Icon */}
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemovePress(item.id)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <TrashIcon size={20} />
            )}
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {item.price}
            </Text>
            {item.originalPrice && item.originalPrice !== item.price && (
              <Text style={styles.originalPrice}>
                (was {item.originalPrice})
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <GlobalBackButton />
          <Text style={styles.title}>Edit Favourites</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your favourites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <GlobalBackButton />
          <Text style={styles.title}>Edit Favourites</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in your wishlist</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton />
        <Text style={styles.title}>Edit Favourites</Text>
        <TouchableOpacity 
          onPress={handleClearAll}
          disabled={isClearing}
          style={styles.clearAllButton}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.clearAllText}>Clear All</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={wishlistItems}
        renderItem={renderProductItem}
        numColumns={isTablet ? 3 : 2}
        key={isTablet ? 'tablet-3-col' : 'phone-2-col'}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(isTablet ? 6 : 5.3),
    paddingVertical: hp(isTablet ? 2.5 : 2),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: fs(isTablet ? 22 : isSmallDevice ? 16 : 18),
    fontFamily: FontFamilies.medium,
    color: Colors.text,
  },
  clearAllButton: {
    paddingHorizontal: wp(isTablet ? 4 : 3.2),
    paddingVertical: hp(isTablet ? 1 : 0.7),
  },
  clearAllText: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    fontFamily: FontFamilies.medium,
    color: Colors.primary,
  },
  spacer: {
    width: wp(isTablet ? 8 : 6.4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(isTablet ? 2.5 : 2),
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: FontFamilies.regular,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(isTablet ? 12 : 10.6),
  },
  emptyText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: hp(isTablet ? 4 : 3),
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(isTablet ? 8 : 6.4),
    paddingVertical: hp(isTablet ? 2 : 1.5),
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: fs(isTablet ? 18 : isSmallDevice ? 14 : 16),
    fontFamily: FontFamilies.medium,
    color: Colors.white,
  },
  productsContainer: {
    padding: wp(isTablet ? 5 : 4.2),
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: wp(isTablet ? 4 : 3.2),
    marginBottom: hp(isTablet ? 2.5 : 2),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftProduct: {
    width: isTablet ? '32%' : '48%',
  },
  rightProduct: {
    width: isTablet ? '32%' : '48%',
  },
  imageContainer: {
    position: 'relative',
    height: hp(isTablet ? 20 : isSmallDevice ? 13 : 15),
    borderRadius: 8,
    marginBottom: hp(isTablet ? 1.5 : 1),
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: hp(isTablet ? 1.2 : 1),
    right: wp(isTablet ? 3 : 2),
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: wp(isTablet ? 10 : 8.5),
    height: wp(isTablet ? 10 : 8.5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    fontFamily: FontFamilies.medium,
    color: Colors.text,
    marginBottom: hp(isTablet ? 0.8 : 0.5),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: fs(isTablet ? 16 : isSmallDevice ? 12 : 14),
    fontFamily: FontFamilies.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: fs(isTablet ? 14 : isSmallDevice ? 10 : 12),
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
    marginLeft: wp(isTablet ? 1.5 : 1),
  },
});

export default FavouritesContentEditView;
