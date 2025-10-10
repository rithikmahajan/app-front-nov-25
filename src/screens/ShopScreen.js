import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Spacing, BorderRadius, Shadows } from '../constants';
import Svg, { Path } from 'react-native-svg';
import { AnimatedHeartIcon } from '../components';
import yoraaAPI from '../services/yoraaBackendAPI';
import { apiService } from '../services/apiService';

// SVG Icon Components
const SearchIcon = ({ color = '#262626' }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M19.0002 19.0002L14.6572 14.6572M14.6572 14.6572C15.4001 13.9143 15.9894 13.0324 16.3914 12.0618C16.7935 11.0911 17.0004 10.0508 17.0004 9.00021C17.0004 7.9496 16.7935 6.90929 16.3914 5.93866C15.9894 4.96803 15.4001 4.08609 14.6572 3.34321C13.9143 2.60032 13.0324 2.01103 12.0618 1.60898C11.0911 1.20693 10.0508 1 9.00021 1C7.9496 1 6.90929 1.20693 5.93866 1.60898C4.96803 2.01103 4.08609 2.60032 3.34321 3.34321C1.84288 4.84354 1 6.87842 1 9.00021C1 11.122 1.84288 13.1569 3.34321 14.6572C4.84354 16.1575 6.87842 17.0004 9.00021 17.0004C11.122 17.0004 13.1569 16.1575 14.6572 14.6572Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </Svg>
);



// Import GlobalCartIcon from assets
import { GlobalCartIcon } from '../assets/icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';

// Sample data for new arrivals and trending now
const NEW_ARRIVALS = [
    { 
    id: '1', 
    name: 'Product One', 
    price: '$99', 
    isNewArrival: true, 
    image: 'https://via.placeholder.com/150x200/CCCCCC/000000?text=Product+1'
  },
  { 
    id: '2', 
    name: 'Product Two', 
    price: '$149', 
    isNewArrival: true, 
    image: 'https://via.placeholder.com/150x200/CCCCCC/000000?text=Product+2'
  },
  { 
    id: '3', 
    name: 'Product Three', 
    price: '$199', 
    isNewArrival: true, 
    image: 'https://via.placeholder.com/150x200/CCCCCC/000000?text=Product+3'
  },
];

const TRENDING_NOW = [
  {
    id: '1',
    name: 'Nike Life',
    price: 'US$180',
    image: null,
  },
  {
    id: '2',
    name: 'Nike Life',
    price: 'US$120',
    image: null,
  },
  {
    id: '3',
    name: 'Adidas Originals',
    price: 'US$160',
    image: null,
  },
];

const SALE_CATEGORIES = [
  {
    id: '1',
    name: 'T-Shirts',
    image: null,
  },
  {
    id: '2',
    name: 'Trousers',
    image: null,
  },
];

const TABS = ['Men', 'Women', 'Kids'];

const ShopScreen = React.memo(({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Men');
  const [dynamicSaleItems, setDynamicSaleItems] = useState([
    {
      _id: 'initial-sale-1',
      productName: 'T-Shirts',
      price: 2999,
      salePrice: 1999,
      discountPercentage: 33,
      isSale: true,
      category: 'men',
      subcategory: 'shirts',
      images: []
    },
    {
      _id: 'initial-sale-2',
      productName: 'Trousers',
      price: 4999,
      salePrice: 3499,
      discountPercentage: 30,
      isSale: true,
      category: 'men',
      subcategory: 'pants',
      images: []
    }
  ]);
  const [categories, setCategories] = useState([]);

  // Use contexts instead of local state
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToBag } = useBag();

  // Fetch dynamic sale items and categories
  const fetchSaleData = useCallback(async () => {
    try {
      
      // Create mock sale data immediately as fallback
      const mockSaleItems = [
        {
          _id: 'mock-sale-1',
          productName: `${selectedTab} T-Shirt`,
          price: 2999,
          salePrice: 1999,
          discountPercentage: 33,
          isSale: true,
          category: selectedTab.toLowerCase(),
          subcategory: 'shirts',
          images: []
        },
        {
          _id: 'mock-sale-2',
          productName: `${selectedTab} Jeans`,
          price: 4999,
          salePrice: 3499,
          discountPercentage: 30,
          isSale: true,
          category: selectedTab.toLowerCase(),
          subcategory: 'pants',
          images: []
        }
      ];

      // Set fallback data immediately
      setDynamicSaleItems(mockSaleItems);
      
      // Try to fetch real data (but don't block UI)
      try {
        const categoriesResponse = await apiService.getCategories();
        if (categoriesResponse && categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }
        
        // Try to get sale items
        const saleResponse = await yoraaAPI.getSaleItems(1, 10, selectedTab.toLowerCase());
        if (saleResponse && saleResponse.success && saleResponse.data) {
          const products = saleResponse.data.products || saleResponse.data.items || saleResponse.data || [];
          if (products.length > 0) {
            setDynamicSaleItems(products);
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        // Keep mock data - already set above
      }
    } catch (error) {
      console.error('Error in fetchSaleData:', error);
      // Ensure we have some data
      const fallbackItems = [
        {
          _id: 'fallback-1',
          productName: 'Sale Item',
          price: 1999,
          salePrice: 1299,
          isSale: true,
          category: selectedTab.toLowerCase(),
          images: []
        }
      ];
      setDynamicSaleItems(fallbackItems);
    } finally {
      // Loading removed - show content immediately
    }
  }, [selectedTab]);

  // Load data on mount and tab change
  useEffect(() => {
    fetchSaleData();
  }, [fetchSaleData]);

  // Memoize static data arrays to prevent recreation on each render
  const newArrivals = useMemo(() => NEW_ARRIVALS, []);
  const trendingNow = useMemo(() => TRENDING_NOW, []);
  const saleCategories = useMemo(() => {
    // Use dynamic sale items if available, otherwise fallback to static
    if (dynamicSaleItems.length > 0) {
      return dynamicSaleItems.slice(0, 5).map(item => ({
        id: item._id,
        name: item.productName || item.name,
        image: item.images?.[0]?.url,
      }));
    }
    return SALE_CATEGORIES;
  }, [dynamicSaleItems]);
  const tabs = useMemo(() => TABS, []);

  // Optimized handlers with useCallback
  const handleNavigateToSearch = useCallback(() => {
    navigation?.navigate('SearchScreen', { previousScreen: 'Shop' });
  }, [navigation]);

  // Navigate to sale screen
  const handleNavigateToSale = useCallback(() => {
    navigation?.navigate('SaleScreen');
  }, [navigation]);

  // Navigate to all items collection
  const handleNavigateToCollection = useCallback(() => {
    navigation?.navigate('Collection');
  }, [navigation]);

  const handleTabSelect = useCallback((tab) => {
    setSelectedTab(tab);
  }, []);

  const handleAddToBag = useCallback((product) => {
    // For now, add with default size. In a real app, you might want to show a size selector
    const productToAdd = {
      ...product,
      size: 'M', // Default size - could be made configurable
    };
    
    addToBag(productToAdd);
    console.log('Added to bag! Check your Bag to see all items.');
  }, [addToBag]);

  // Memoized render functions for better performance
  const renderProductItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.price}`}
      accessibilityHint="View product details"
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImagePlaceholder}
          resizeMode="cover"
        />
        <AnimatedHeartIcon
          isFavorite={isFavorite(item.id)}
          onPress={() => toggleFavorite(item.id)}
          size={13}
          containerStyle={styles.favoriteButton}
          filledColor="#000000"
          unfilledColor="#000000"
        />
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => handleAddToBag(item)}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          accessibilityHint="Add product to shopping cart"
        >
          <GlobalCartIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  ), [toggleFavorite, isFavorite, handleAddToBag]);

  const renderSaleCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.saleCategoryCard}
      onPress={() => {
        // Navigate to sale category with item details
        const selectedCategory = categories.find(cat => 
          cat.name.toLowerCase() === selectedTab.toLowerCase()
        );
        navigation?.navigate('SaleCategoryScreen', {
          categoryId: selectedCategory?._id,
          categoryName: selectedCategory?.name,
          subcategoryId: item.subcategoryId,
          subcategoryName: item.name
        });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} sale category`}
      accessibilityHint="Browse sale products in this category"
    >
      {item.image ? (
        <Image 
          source={{ uri: item.image }}
          style={styles.saleCategoryImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.saleCategoryImagePlaceholder} />
      )}
      <View style={styles.saleCategoryOverlay}>
        <Text style={styles.saleCategoryText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  ), [categories, selectedTab, navigation]);

  const renderTab = useCallback((tab) => (
    <TouchableOpacity
      key={tab}
      style={styles.tabItem}
      onPress={() => handleTabSelect(tab)}
      accessibilityRole="tab"
      accessibilityLabel={`${tab} tab`}
      accessibilityState={{ selected: selectedTab === tab }}
    >
      <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
        {tab}
      </Text>
      {selectedTab === tab && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  ), [selectedTab, handleTabSelect]);

  return (
    <View style={styles.container}>
      {/* Header with search */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleNavigateToSearch}
          accessibilityRole="button"
          accessibilityLabel="Search"
          accessibilityHint="Navigate to search screen"
        >
          <SearchIcon />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* New Arrivals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">New Arrivals</Text>
          <FlatList
            data={newArrivals}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            accessibilityLabel="New arrivals product list"
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            windowSize={7}
            getItemLayout={(data, index) => {
              // Safer getItemLayout with additional validation
              const safeIndex = Math.max(0, index || 0);
              const itemLength = 180;
              return {
                length: itemLength,
                offset: itemLength * safeIndex,
                index: safeIndex,
              };
            }}
          />
        </View>

        {/* Trending Now Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Trending Now</Text>
          <FlatList
            data={trendingNow}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            accessibilityLabel="Trending products list"
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            windowSize={7}
            getItemLayout={(data, index) => {
              // Safer getItemLayout with additional validation
              const safeIndex = Math.max(0, index || 0);
              const itemLength = 180;
              return {
                length: itemLength,
                offset: itemLength * safeIndex,
                index: safeIndex,
              };
            }}
          />
        </View>

        {/* Sale Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.saleTitle} accessibilityRole="header">Sale</Text>
            <TouchableOpacity 
              onPress={handleNavigateToSale}
              style={styles.viewAllButton}
              accessibilityRole="button"
              accessibilityLabel="View all sale items"
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Dynamic Sale Items Preview */}
          {dynamicSaleItems.length > 0 ? (
            <View style={styles.dynamicSalePreview}>
              <TouchableOpacity 
                style={styles.salePreviewCard}
                onPress={handleNavigateToSale}
                accessibilityRole="button"
                accessibilityLabel="View sale items"
              >
                <Text style={styles.salePreviewTitle}>
                  🔥 {dynamicSaleItems.length} Items on Sale
                </Text>
                <Text style={styles.salePreviewSubtitle}>
                  Up to 50% off on {selectedTab} collection
                </Text>
                <Text style={styles.salePreviewAction}>Shop Now →</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          
          {/* Tabs */}
          <View style={styles.tabContainer} accessibilityRole="tablist">
            {tabs.map(renderTab)}
          </View>

          {/* Sale Categories */}
          <FlatList
            data={saleCategories}
            renderItem={renderSaleCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            accessibilityLabel="Sale categories list"
            removeClippedSubviews={true}
            maxToRenderPerBatch={4}
            initialNumToRender={4}
            windowSize={6}
            getItemLayout={(data, index) => {
              // Safer getItemLayout with additional validation
              const safeIndex = Math.max(0, index || 0);
              const itemLength = 120;
              return {
                length: itemLength,
                offset: itemLength * safeIndex,
                index: safeIndex,
              };
            }}
          />
        </View>

        {/* Collection Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.collectionButton}
            onPress={handleNavigateToCollection}
            accessibilityRole="button"
            accessibilityLabel="View all items collection"
          >
            <Text style={styles.collectionButtonText}>
              🛍️ View All Collection
            </Text>
            <Text style={styles.collectionButtonSubtext}>
              Browse all items from Men, Women & Kids
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16, // 16px top padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 16, // Consistent spacing
    paddingBottom: Spacing.lg,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: 38,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    marginBottom: Spacing.lg,
    fontFamily: 'Montserrat-Medium',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  saleTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },

  dynamicSalePreview: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  salePreviewCard: {
    backgroundColor: '#FF4444',
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: 'center',
  },
  salePreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  salePreviewSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  salePreviewAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  collectionButton: {
    marginHorizontal: Spacing.xl,
    backgroundColor: '#000000',
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: 'center',
  },
  collectionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
  },
  collectionButtonSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  horizontalList: {
    paddingRight: Spacing.xl,
    gap: 6,
  },
  productCard: {
    width: 246,
    marginRight: 6,
  },
  productImageContainer: {
    position: 'relative',
    height: 246,
    backgroundColor: '#EEEEEE',
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  productImagePlaceholder: {
    flex: 1,
    borderRadius: BorderRadius.md,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  cartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  productInfo: {
    gap: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.14,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD',
    marginBottom: Spacing.lg,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  activeTabText: {
    color: '#000000',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000000',
  },
  saleCategoryCard: {
    width: 246,
    height: 292,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: 6,
    position: 'relative',
  },
  saleCategoryImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  saleCategoryImagePlaceholder: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  saleCategoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  saleCategoryText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
});

export default ShopScreen;
