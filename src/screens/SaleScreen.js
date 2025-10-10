import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

const SaleScreen = React.memo(({ navigation, route }) => {
  const { categoryId: routeCategoryId, categoryName } = route.params || {};
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToBag } = useBag();

  // State management
  const [selectedTab, setSelectedTab] = useState('Men');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [saleItems, setSaleItems] = useState([
    {
      _id: 'sale-init-1',
      productName: 'Premium T-Shirt',
      price: 2999,
      salePrice: 1999,
      discountPercentage: 33,
      isSale: true,
      category: 'men',
      subcategory: 'shirts',
      images: []
    },
    {
      _id: 'sale-init-2',
      productName: 'Classic Jeans',
      price: 4999,
      salePrice: 3499,
      discountPercentage: 30,
      isSale: true,
      category: 'men',
      subcategory: 'pants',
      images: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories for tabs
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      if (response && response.success) {
        const mainCategories = response.data.filter(category => 
          ['men', 'women', 'kids'].includes(category.name.toLowerCase())
        );
        setCategories(mainCategories);
        
        // Set first category as selected tab if none selected
        if (mainCategories.length > 0 && !selectedTab) {
          setSelectedTab(mainCategories[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [selectedTab]);

  // Fetch subcategories for selected category
  const fetchSubcategories = useCallback(async (catId) => {
    try {
      const response = await apiService.getSubcategoriesByCategory(catId);
      if (response && response.success) {
        setSubcategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    }
  }, []);

  // Fetch sale items for specific category/subcategory
  const fetchSaleItems = useCallback(async (catId = null, subCatId = null) => {
    try {
      let response;
      
      if (subCatId) {
        response = await yoraaAPI.getSaleItemsBySubcategory(subCatId);
      } else if (catId) {
        response = await yoraaAPI.getSaleItemsByCategory(catId);
      } else {
        response = await yoraaAPI.getSaleItems();
      }

      if (response && response.success && response.data) {
        // Handle backend response format: { success: true, data: { products: [...] } }
        const products = response.data.products || response.data.items || response.data || [];
        setSaleItems(products);
      } else {
        setSaleItems([]);
      }
    } catch (err) {
      console.error('Error fetching sale items:', err);
      // Fallback: use mock sale data to prevent crashes
      const mockSaleItems = [
        {
          _id: 'mock-sale-1',
          productName: 'Sale Item 1',
          price: 2999,
          salePrice: 1999,
          discountPercentage: 33,
          isSale: true,
          category: 'men',
          subcategory: 'shirts',
          images: []
        },
        {
          _id: 'mock-sale-2', 
          productName: 'Sale Item 2',
          price: 3999,
          salePrice: 2499,
          discountPercentage: 37,
          isSale: true,
          category: 'women',
          subcategory: 'dresses',
          images: []
        }
      ];
      setSaleItems(mockSaleItems);
    }
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await fetchCategories();
      
      // If specific category provided, use it
      if (routeCategoryId) {
        await fetchSaleItems(routeCategoryId);
        await fetchSubcategories(routeCategoryId);
      } else {
        // Load sale items for first category
        const response = await apiService.getCategories();
        if (response && response.success && response.data.length > 0) {
          const firstMainCategory = response.data.find(cat => 
            ['men', 'women', 'kids'].includes(cat.name.toLowerCase())
          );
          if (firstMainCategory) {
            await fetchSaleItems(firstMainCategory._id);
            await fetchSubcategories(firstMainCategory._id);
            setSelectedTab(firstMainCategory.name);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [routeCategoryId, fetchCategories, fetchSaleItems, fetchSubcategories]);

  // Handle tab change
  const handleTabChange = useCallback(async (tab) => {
    setSelectedTab(tab);
    const selectedCategory = categories.find(cat => 
      cat.name.toLowerCase() === tab.toLowerCase()
    );
    
    if (selectedCategory) {
      setLoading(true);
      await fetchSaleItems(selectedCategory._id);
      await fetchSubcategories(selectedCategory._id);
      setLoading(false);
    }
  }, [categories, fetchSaleItems, fetchSubcategories]);

  // Handle subcategory selection
  const handleSubcategoryPress = useCallback(async (subcategory) => {
    setLoading(true);
    await fetchSaleItems(subcategory.categoryId, subcategory._id);
    setLoading(false);
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

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized tabs
  const tabs = useMemo(() => {
    return categories.map(cat => 
      cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase()
    );
  }, [categories]);

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

  // Render subcategory item
  const renderSubcategoryItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.subcategoryCard}
      onPress={() => handleSubcategoryPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} subcategory`}
    >
      <View style={styles.subcategoryImageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.subcategoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.subcategoryImagePlaceholder} />
        )}
        <View style={styles.subcategoryOverlay}>
          <Text style={styles.subcategoryText}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleSubcategoryPress]);

  // Render tab item
  const renderTab = useCallback((tab) => (
    <TouchableOpacity
      key={tab}
      style={styles.tabItem}
      onPress={() => handleTabChange(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: selectedTab === tab }}
    >
      <Text style={[
        styles.tabText, 
        selectedTab === tab && styles.activeTabText
      ]}>
        {tab}
      </Text>
      {selectedTab === tab && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  ), [selectedTab, handleTabChange]);

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
        <Text style={styles.headerTitle}>
          {categoryName ? `${categoryName} Sale` : 'Sale'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Category Tabs */}
        {tabs.length > 0 && (
          <View style={styles.tabContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContainer}
            >
              {tabs.map(renderTab)}
            </ScrollView>
          </View>
        )}

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <FlatList
              data={subcategories}
              renderItem={renderSubcategoryItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoryList}
            />
          </View>
        )}

        {/* Sale Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedTab} Sale Items ({saleItems.length})
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadData}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {saleItems.length > 0 ? (
            <FlatList
              data={saleItems}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productList}
              scrollEnabled={false}
            />
          ) : !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No sale items found for {selectedTab}
              </Text>
              <Text style={styles.emptySubtext}>
                Check back later for new deals!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: Spacing.lg,
  },
  tabScrollContainer: {
    paddingHorizontal: Spacing.lg,
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
  },
  activeTabText: {
    color: '#000000',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#000000',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subcategoryList: {
    paddingHorizontal: Spacing.lg,
  },
  subcategoryCard: {
    width: 200,
    height: 120,
    marginRight: 12,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  subcategoryImageContainer: {
    flex: 1,
    position: 'relative',
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
  },
  subcategoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  subcategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
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
    alignItems: 'center',
    paddingVertical: 40,
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
    alignItems: 'center',
    paddingVertical: 20,
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

export default SaleScreen;
