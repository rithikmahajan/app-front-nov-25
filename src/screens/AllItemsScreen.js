import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
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
import { apiService } from '../services/apiService';

const AllItemsScreen = React.memo(({ navigation }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBag } = useBag();

  // State management
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter options
  const filterOptions = ['All', 'Men', 'Women', 'Kids', 'Sale', 'New'];

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      if (response && response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch all items from all categories
  const fetchAllItems = useCallback(async () => {
    try {
      setError(null);
      
      // Get all items
      const itemsResponse = await yoraaAPI.getAllCollectionItems();
      
      if (itemsResponse && itemsResponse.success) {
        const items = itemsResponse.data.items || itemsResponse.data || [];
        setAllItems(items);
        setFilteredItems(items);
      } else {
        // Fallback: get items by fetching each category
        const allCategoriesItems = [];
        
        for (const category of categories) {
          try {
            const categoryItems = await apiService.getProductsByCategory(category._id);
            if (categoryItems && categoryItems.success) {
              const itemsWithCategory = (categoryItems.data || []).map(item => ({
                ...item,
                categoryInfo: category
              }));
              allCategoriesItems.push(...itemsWithCategory);
            }
          } catch (err) {
            console.error(`Error fetching items for category ${category.name}:`, err);
          }
        }
        
        setAllItems(allCategoriesItems);
        setFilteredItems(allCategoriesItems);
      }
    } catch (err) {
      console.error('Error fetching all items:', err);
      setError(err.message);
    }
  }, [categories]);

  // Filter items based on selected filter
  const filterItems = useCallback((filter) => {
    let filtered = [];
    
    switch (filter) {
      case 'All':
        filtered = allItems;
        break;
      case 'Men':
        filtered = allItems.filter(item => 
          item.categoryInfo?.name?.toLowerCase() === 'men' ||
          item.category?.toLowerCase() === 'men'
        );
        break;
      case 'Women':
        filtered = allItems.filter(item => 
          item.categoryInfo?.name?.toLowerCase() === 'women' ||
          item.category?.toLowerCase() === 'women'
        );
        break;
      case 'Kids':
        filtered = allItems.filter(item => 
          item.categoryInfo?.name?.toLowerCase() === 'kids' ||
          item.category?.toLowerCase() === 'kids'
        );
        break;
      case 'Sale':
        filtered = allItems.filter(item => 
          item.isSale || // New backend field
          item.isOnSale || // Legacy field
          item.salePrice || // Direct sale price field
          (item.sizes && item.sizes.some(size => size.salePrice))
        );
        break;
      case 'New':
        // Filter items created in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = allItems.filter(item => {
          const createdDate = new Date(item.createdAt || item.dateAdded);
          return createdDate > thirtyDaysAgo;
        });
        break;
      default:
        filtered = allItems;
    }
    
    setFilteredItems(filtered);
  }, [allItems]);

  // Handle filter change
  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
    filterItems(filter);
  }, [filterItems]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchCategories();
      await fetchAllItems();
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchAllItems]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filtered items when filter changes
  useEffect(() => {
    filterItems(selectedFilter);
  }, [selectedFilter, filterItems]);

  // Render filter item
  const renderFilterItem = useCallback((filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => handleFilterChange(filter)}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedFilter === filter }}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter && styles.activeFilterText
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  ), [selectedFilter, handleFilterChange]);

  // Render product item
  const renderProductItem = useCallback(({ item }) => {
    const productName = item.productName || item.name || 'Product';
    const firstImage = item.images?.[0]?.url;
    
    // Get price information
    let displayPrice = 'Price not available';
    let originalPrice = null;
    let isOnSale = false;
    
    // Check for new backend format first
    if (item.isSale && item.salePrice) {
      displayPrice = `₹${item.salePrice}`;
      isOnSale = true;
      if (item.price && item.price !== item.salePrice) {
        originalPrice = `₹${item.price}`;
      }
    } else if (item.price) {
      displayPrice = `₹${item.price}`;
    } else if (item.sizes && item.sizes.length > 0) {
      // Fallback to old format
      const firstSize = item.sizes[0];
      if (firstSize.salePrice) {
        displayPrice = `₹${firstSize.salePrice}`;
        isOnSale = true;
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
          {isOnSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}

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
            <Text style={[
              styles.displayPrice, 
              isOnSale && styles.salePrice
            ]}>
              {displayPrice}
            </Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>{originalPrice}</Text>
            )}
          </View>
          {item.categoryInfo && (
            <Text style={styles.categoryText}>
              {item.categoryInfo.name}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleProductPress, toggleFavorite, isFavorite, handleAddToBag]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading All Items...</Text>
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
        <Text style={styles.headerTitle}>All Items</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
        >
          {filterOptions.map(renderFilterItem)}
        </ScrollView>
      </View>

      {/* Items Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredItems.length} items {selectedFilter !== 'All' && `in ${selectedFilter}`}
        </Text>
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
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
            No items found {selectedFilter !== 'All' && `in ${selectedFilter}`}
          </Text>
          <Text style={styles.emptySubtext}>
            Try selecting a different filter
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
  filtersContainer: {
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersScrollContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#000000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  productList: {
    paddingHorizontal: Spacing.lg,
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
    marginBottom: 4,
  },
  displayPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginRight: 8,
  },
  salePrice: {
    color: '#FF4444',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textDecorationLine: 'line-through',
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    textTransform: 'capitalize',
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

export default AllItemsScreen;
