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

// Simple trash icon component without SVG dependency
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
    const isLeftColumn = index % 2 === 0;
    const isRemoving = removingItems.has(item.id);
    
    return (
      <View style={[
        styles.productContainer,
        isLeftColumn ? styles.leftProduct : styles.rightProduct,
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
        numColumns={2}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamilies.medium,
    color: Colors.text,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: Colors.primary,
  },
  spacer: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    color: Colors.white,
  },
  productsContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftProduct: {
    width: '48%',
  },
  rightProduct: {
    width: '48%',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
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
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: 32,
    height: 32,
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
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 14,
    fontFamily: FontFamilies.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});

export default FavouritesContentEditView;
