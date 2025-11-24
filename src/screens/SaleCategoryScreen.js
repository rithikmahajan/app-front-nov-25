import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Spacing, BorderRadius, Shadows } from '../constants';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import { AnimatedHeartIcon } from '../components';
import { GlobalCartIcon } from '../assets/icons';
import yoraaAPI from '../services/yoraaBackendAPI';

const SaleCategoryScreen = React.memo(({ navigation, route }) => {
  const { categoryId, categoryName, subcategoryId, subcategoryName } = route.params || {};
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBag } = useBag();

  // State management
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sale items
  const fetchSaleItems = useCallback(async () => {
    try {
      setError(null);
      let response;
      
      if (subcategoryId) {
        response = await yoraaAPI.getSaleItemsBySubcategory(subcategoryId);
      } else if (categoryId) {
        response = await yoraaAPI.getSaleItemsByCategory(categoryId);
      } else {
        response = await yoraaAPI.getSaleItems();
      }

      if (response && response.success) {
        setSaleItems(response.data.items || response.data || []);
      } else {
        setSaleItems([]);
      }
    } catch (err) {
      console.error('Error fetching sale items:', err);
      setError(err.message);
      setSaleItems([]);
    }
  }, [categoryId, subcategoryId]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSaleItems();
      setLoading(false);
    };
    loadData();
  }, [fetchSaleItems]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSaleItems();
    setRefreshing(false);
  }, [fetchSaleItems]);

  // Handle product press
  const handleProductPress = useCallback((product) => {
    navigation.navigate('productdetails', {
      productId: product._id,
      product: product
    });
  }, [navigation]);

  // Handle add to bag
  const handleAddToBag = useCallback(async (product) => {
    try {
      // Find first available size
      const firstSize = product.sizes?.[0];
      if (firstSize) {
        await addToBag({
          ...product,
          size: firstSize.size,
          quantity: 1
        });
        console.log('Added to bag:', product.productName);
      }
    } catch (err) {
      console.error('Error adding to bag:', err);
    }
  }, [addToBag]);

  // Render product item
  const renderProductItem = useCallback(({ item }) => {
    const productName = item.productName || item.name || 'Product';
    const firstImage = item.images?.[0]?.url;
    
    // Get price information
    let displayPrice = 'Price not available';
    let originalPrice = null;
    
    if (item.sizes && item.sizes.length > 0) {
      const firstSize = item.sizes[0];
      if (firstSize.salePrice) {
        displayPrice = `₹${firstSize.salePrice}`;
        if (firstSize.regularPrice && firstSize.regularPrice !== firstSize.salePrice) {
          originalPrice = `₹${firstSize.regularPrice}`;
        }
      } else if (firstSize.regularPrice) {
        displayPrice = `₹${firstSize.regularPrice}`;
      }
    }

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${productName} - ${displayPrice}`}
      >
        <View style={styles.productImageContainer}>
          {firstImage ? (
            <Image 
              source={{ uri: firstImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder} />
          )}
          
          {/* Sale Badge */}
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>

          {/* Heart Icon */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(item._id)}
            accessibilityRole="button"
            accessibilityLabel="Toggle favorite"
          >
            <AnimatedHeartIcon
              isFilled={isFavorite(item._id)}
              size={20}
            />
          </TouchableOpacity>

          {/* Cart Icon */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToBag(item)}
            accessibilityRole="button"
            accessibilityLabel="Add to cart"
          >
            <GlobalCartIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.salePrice}>{displayPrice}</Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>{originalPrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleProductPress, toggleFavorite, isFavorite, handleAddToBag]);

  // Get screen title
  const getScreenTitle = () => {
    if (subcategoryName) {
      return `${subcategoryName} Sale`;
    } else if (categoryName) {
      return `${categoryName} Sale`;
    }
    return 'Sale Items';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading Sale Items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchSaleItems}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : saleItems.length > 0 ? (
        <FlatList
          data={saleItems}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No sale items found
          </Text>
          <Text style={styles.emptySubtext}>
            Check back later for new deals!
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  productList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  productImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    fontFamily: 'Montserrat-SemiBold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default SaleCategoryScreen;
