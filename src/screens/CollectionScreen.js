import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import { GlobalSearchIcon, FilterIcon, GlobalCartIcon, HeartIcon } from '../assets/icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import { apiService } from '../services/apiService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced Animated Heart Button Component with improved feedback
const AnimatedHeartButton = ({ productId, onToggle, isFavorite, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    console.log(`❤️ Heart button pressed for product: ${productId}, current favorite: ${isFavorite}`);
    
    // Enhanced animation sequence for better visual feedback
    const scaleAnimation = Animated.sequence([
      // Quick shrink
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      // Bounce back bigger
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      // Settle to normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    // Pulse animation for adding to favorites (when turning red)
    const pulseAnimation = !isFavorite ? Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]) : null;

    // Subtle rotation for added visual interest
    const rotationAnimation = Animated.timing(rotateAnim, {
      toValue: isFavorite ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    });

    // Start animations in parallel
    Animated.parallel([
      scaleAnimation,
      rotationAnimation,
      ...(pulseAnimation ? [pulseAnimation] : [])
    ]).start();

    // Call the toggle function
    try {
      const result = await onToggle(productId);
      console.log(`✅ Heart toggle result: ${result ? 'Added to favorites' : 'Removed from favorites'}`);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    }
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg']
  });

  return (
    <TouchableOpacity 
      style={[styles.heartButton, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={{
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) },
          { rotate: rotateInterpolation }
        ]
      }}>
        <HeartIcon 
          size={20} 
          filled={isFavorite} 
          color={isFavorite ? "#FF0000" : "#000000"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// FilterModal component
const FilterModal = ({ 
  visible, 
  onClose, 
  slideAnim, 
  selectedSizes, 
  setSelectedSizes, 
  selectedColors, 
  setSelectedColors, 
  selectedSort, 
  setSelectedSort, 
  onClearFilters 
}) => {
  const renderColorOption = (colorOption, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.colorOption,
        selectedColors.includes(colorOption.name) && styles.selectedColorOption
      ]}
      onPress={() => {
        if (selectedColors.includes(colorOption.name)) {
          setSelectedColors(selectedColors.filter(c => c !== colorOption.name));
        } else {
          setSelectedColors([...selectedColors, colorOption.name]);
        }
      }}
    >
      <View style={[styles.colorCircle, { backgroundColor: colorOption.color }]} />
      <Text style={styles.colorName}>{colorOption.name}</Text>
    </TouchableOpacity>
  );

  const renderSizeOption = (size) => (
    <TouchableOpacity
      key={size}
      style={[
        styles.sizeOption,
        selectedSizes.includes(size) && styles.selectedSizeOption
      ]}
      onPress={() => {
        if (selectedSizes.includes(size)) {
          setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
          setSelectedSizes([...selectedSizes, size]);
        }
      }}
    >
      <Text style={[
        styles.sizeText,
        selectedSizes.includes(size) && styles.selectedSizeText
      ]}>{size}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.filterModal,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Handle */}
            <View style={styles.modalHandle} />
            
            {/* Filter Header */}
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={onClearFilters}>
                <Text style={styles.clearFiltersText}>CLEAR FILTERS</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Sizes */}
              <View style={styles.filterSection}>
                <View style={styles.sizeGrid}>
                  {FILTER_OPTIONS.sizes.map(renderSizeOption)}
                </View>
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>VIEW MORE</Text>
                </TouchableOpacity>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>PRICE</Text>
                <View style={styles.priceSlider}>
                  <View style={styles.sliderTrack} />
                  <View style={styles.sliderRange} />
                  <View style={styles.sliderThumb} />
                  <View style={[styles.sliderThumb, styles.sliderThumbEnd]} />
                </View>
                <Text style={styles.priceRangeText}>₹ 450 - ₹ 23,950,200</Text>
              </View>

              {/* Colors */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>COLOUR</Text>
                {FILTER_OPTIONS.colors.map(renderColorOption)}
              </View>

              {/* Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>SHORT BY</Text>
                {FILTER_OPTIONS.sortBy.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.sortOption}
                    onPress={() => setSelectedSort(option)}
                  >
                    <Text style={[
                      styles.sortText,
                      selectedSort === option && styles.selectedSortText
                    ]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* More Sizes */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>SIZE</Text>
                <View style={styles.sizeGrid}>
                  {FILTER_OPTIONS.sizes2.map(renderSizeOption)}
                </View>
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>VIEW MORE</Text>
                </TouchableOpacity>
              </View>

              {/* Categories */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>SHORT BY</Text>
                {FILTER_OPTIONS.categories.map((category) => (
                  <TouchableOpacity key={category} style={styles.categoryOption}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.kidsSection}>
                  {FILTER_OPTIONS.kidsSizes.map((size) => (
                    <TouchableOpacity key={size} style={styles.kidsSizeOption}>
                      <Text style={styles.kidsSizeText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* View Results Button */}
            <TouchableOpacity style={styles.viewResultsButton} onPress={onClose}>
              <Text style={styles.viewResultsText}>VIEW RESULTS</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
const FILTER_OPTIONS = {
  sizes: ['42', '43', '44', '45'],
  colors: [
    { name: 'BEIGE', color: '#F5F5DC' },
    { name: 'BLACK', color: '#000000' },
    { name: 'BEIGE', color: '#87CEEB' },
    { name: 'BEIGE', color: '#D2B48C' },
    { name: 'BEIGE', color: '#8B0000' },
    { name: 'BEIGE', color: '#FFD700' },
    { name: 'BEIGE', color: '#90EE90' },
  ],
  sortBy: ['ASCENDING PRICE', 'DESCENDING PRICE', 'NEW'],
  sizes2: ['S', 'M', 'L', 'XL', '36', '38', '40'],
  categories: ['MAN', 'WOMEN', 'KIDS'],
  kidsSizes: ['BOY', 'GIRL'],
};

const CollectionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSort, setSelectedSort] = useState('ASCENDING PRICE');
  
  // New state for dynamic data
  const [subcategories, setSubcategories] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the FavoritesContext
  const { toggleFavorite, isFavorite } = useFavorites();

  // Use the BagContext
  const { addToBag } = useBag();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Fetch subcategories on component mount
  useEffect(() => {
    fetchSubcategories();
  }, []);

  // Fetch items when active tab changes
  useEffect(() => {
    if (activeTab) {
      fetchItemsForSubcategory(activeTab);
    }
  }, [activeTab]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching subcategories...');
      
      const response = await apiService.getSubcategories();
      console.log('✅ Subcategories fetched:', response);
      console.log('🔍 First subcategory structure:', response[0]);
      
      if (response && response.length > 0) {
        setSubcategories(response);
        // Set the first subcategory as active by default
        setActiveTab(response[0].id || response[0]._id);
      } else {
        console.warn('⚠️ No subcategories found');
        setSubcategories([]);
      }
    } catch (err) {
      console.error('❌ Error fetching subcategories:', err);
      setError('Failed to load categories. Please try again.');
      
      // Fallback to empty array
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsForSubcategory = async (subcategoryId) => {
    try {
      setItemsLoading(true);
      console.log(`🔄 Fetching items for subcategory: ${subcategoryId}`);
      
      // Use the correct API endpoint for subcategory items
      const response = await apiService.getItemsBySubcategory(subcategoryId);
      console.log('✅ Items API response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures from the API
      let items = [];
      
      if (response && response.success && response.data) {
        // API returns: {success: true, message: 'Items fetched successfully', data: {...}, statusCode: 200}
        const data = response.data;
        console.log('📊 Raw data structure:', JSON.stringify(data, null, 2));
        
        if (Array.isArray(data)) {
          items = data;
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
        } else if (data.products && Array.isArray(data.products)) {
          items = data.products;
        } else if (typeof data === 'object' && data.length !== undefined) {
          // Sometimes the data might be array-like
          items = Object.values(data);
        } else if (typeof data === 'object') {
          // If data is a single object, wrap it in an array
          items = [data];
        }
      } else if (response && Array.isArray(response)) {
        items = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
      }
      
      console.log(`✅ Processed items (${items.length}):`, items);
      setCurrentItems(items);
      
      if (items.length === 0) {
        console.warn('⚠️ No items found for subcategory:', subcategoryId);
      }
    } catch (err) {
      console.error('❌ Error fetching items:', err);
      setCurrentItems([]);
      
      // Show user-friendly error message
      Alert.alert(
        'Connection Error',
        'Unable to load products. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setItemsLoading(false);
    }
  };



  const handleToggleWishlist = async (productId) => {
    try {
      const wasAdded = await toggleFavorite(productId);
      
      // Provide user feedback
      if (wasAdded) {
        console.log(`❤️ Added to favorites! Product ID: ${productId}`);
        // Optional: Show toast or brief message
        // Toast.show('Added to favorites!', Toast.SHORT);
      } else {
        console.log(`💔 Removed from favorites! Product ID: ${productId}`);
        // Optional: Show toast or brief message  
        // Toast.show('Removed from favorites', Toast.SHORT);
      }
      
      return wasAdded;
    } catch (favoriteError) {
      console.error('❌ Error toggling favorite:', favoriteError);
      
      // Show user-friendly error message
      Alert.alert(
        'Connection Error',
        'Unable to update favorites. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      
      throw favoriteError; // Re-throw to let the animation component handle it
    }
  };

  const handleAddToBag = (product) => {
    // For now, add with default size. In a real app, you might want to show a size selector
    const productToAdd = {
      ...product,
      size: 'M', // Default size - could be made configurable
    };
    
    addToBag(productToAdd);
    console.log('Added to bag! Check your Bag to see all items.');
  };

  const openFilterModal = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Filters', {
        previousScreen: 'Collection',
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from Collection:', filterParams);
          // Handle filtered results here if needed
        }
      });
    }
  };

  const closeFilterModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowFilterModal(false);
    });
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedSort('ASCENDING PRICE');
  };

  const renderSeparator = () => <View style={styles.itemSeparator} />;

  // Helper function to extract price from item data structure
  const getItemPrice = (item) => {
    // Check direct price fields first
    if (item.price) return item.price;
    if (item.cost) return item.cost;
    if (item.sellingPrice) return item.sellingPrice;
    if (item.salePrice) return item.salePrice;
    if (item.regularPrice) return item.regularPrice;
    if (item.mrp) return item.mrp;
    
    // Check in sizes array (this is where the price data actually is)
    if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
      const firstSize = item.sizes[0];
      // Prefer sale price over regular price for better deals
      if (firstSize.salePrice) return firstSize.salePrice;
      if (firstSize.regularPrice) return firstSize.regularPrice;
      if (firstSize.price) return firstSize.price;
      if (firstSize.cost) return firstSize.cost;
      if (firstSize.sellingPrice) return firstSize.sellingPrice;
      if (firstSize.mrp) return firstSize.mrp;
    }
    
    // Check in variants array
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      if (firstVariant.salePrice) return firstVariant.salePrice;
      if (firstVariant.regularPrice) return firstVariant.regularPrice;
      if (firstVariant.price) return firstVariant.price;
      if (firstVariant.cost) return firstVariant.cost;
      if (firstVariant.sellingPrice) return firstVariant.sellingPrice;
      if (firstVariant.mrp) return firstVariant.mrp;
    }
    
    // Check nested pricing object
    if (item.pricing) {
      if (item.pricing.salePrice) return item.pricing.salePrice;
      if (item.pricing.regularPrice) return item.pricing.regularPrice;
      if (item.pricing.price) return item.pricing.price;
      if (item.pricing.cost) return item.pricing.cost;
      if (item.pricing.sellingPrice) return item.pricing.sellingPrice;
      if (item.pricing.mrp) return item.pricing.mrp;
    }
    
    // Log the item structure for debugging if no price found
    console.warn('⚠️ No price found for item:', item.title || item.name, 'Available fields:', Object.keys(item));
    if (item.sizes && item.sizes[0]) {
      console.warn('⚠️ First size structure:', Object.keys(item.sizes[0]));
    }
    return '0';
  };

  // Helper function to extract image URL from item data structure
  const getItemImageUrl = (item) => {
    // Check direct image URL fields
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    if (item.thumbnail) return item.thumbnail;
    
    // Check in images array (most likely location)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      
      // Handle different image object structures
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage && firstImage.url) {
        return firstImage.url;
      } else if (firstImage && firstImage.src) {
        return firstImage.src;
      } else if (firstImage && firstImage.uri) {
        return firstImage.uri;
      }
    }
    
    // Check in variants for images
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      if (firstVariant.imageUrl) return firstVariant.imageUrl;
      if (firstVariant.image) return firstVariant.image;
      if (firstVariant.images && firstVariant.images.length > 0) {
        const variantImage = firstVariant.images[0];
        if (typeof variantImage === 'string') return variantImage;
        if (variantImage.url) return variantImage.url;
      }
    }
    
    // Check in sizes for images
    if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
      const firstSize = item.sizes[0];
      if (firstSize.imageUrl) return firstSize.imageUrl;
      if (firstSize.image) return firstSize.image;
    }
    
    // Log if no image found for debugging
    console.warn('⚠️ No image found for item:', item.title || item.name);
    return null;
  };

  const renderProductItem = ({ item }) => {
    // Add safety check for item
    if (!item) {
      console.warn('⚠️ Received null/undefined item in renderProductItem');
      return null;
    }

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation?.navigate('ProductDetailsMain', { 
          product: item,
          item: item, // Pass item as well for compatibility
          previousScreen: 'Collection' 
        })}
      >
        <View style={styles.productImageContainer}>
          {/* Display item image if available */}
          {getItemImageUrl(item) ? (
            <Image
              source={{ uri: getItemImageUrl(item) }}
              style={styles.productImage}
              resizeMode="cover"
              onError={(imageError) => {
                console.warn('⚠️ Error loading image for item:', item.title || item.name, imageError);
              }}
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <View style={styles.productPlaceholderIcon} />
            </View>
          )}
          
          {/* Heart Button */}
          <AnimatedHeartButton
            productId={item.id || item._id}
            onToggle={handleToggleWishlist}
            isFavorite={isFavorite(item.id || item._id)}
            style={styles.heartButton}
          />
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToBag(item);
            }}
          >
            <GlobalCartIcon size={16} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          {/* Display only product name and price as requested */}
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || item.title || item.productName || 'Unnamed Product'}
          </Text>
          <Text style={styles.productPrice}>
            ₹{getItemPrice(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation?.navigate('SearchScreen', { previousScreen: 'Collection' })}
          >
            <GlobalSearchIcon size={24} />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
            <FilterIcon size={20} />
          </TouchableOpacity>
          
          {/* Dynamic Subcategory Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabContainer}
          >
            {loading ? (
              <View key="loading" style={styles.tabLoadingContainer}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : subcategories.length > 0 ? (
              subcategories.map((subcategory, index) => (
                <TouchableOpacity
                  key={subcategory.id || subcategory._id || `subcategory-${index}`}
                  style={[
                    styles.tab,
                    activeTab === (subcategory.id || subcategory._id) && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(subcategory.id || subcategory._id)}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === (subcategory.id || subcategory._id) && styles.activeTabText
                  ]}>
                    {(subcategory.name || subcategory.title || 'Category')?.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View key="error" style={styles.tabErrorContainer}>
                <Text style={styles.errorText}>No categories available</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchSubcategories}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Products Grid */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchSubcategories}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : currentItems.length > 0 ? (
          <View style={styles.contentContainer}>
            {/* Debug info - remove in production */}
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>
                  Debug: {currentItems.length} items loaded
                </Text>
                <Text style={styles.debugText}>
                  Sample item keys: {currentItems[0] ? Object.keys(currentItems[0]).join(', ') : 'none'}
                </Text>
              </View>
            )}
            <FlatList
              data={currentItems}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => item.id?.toString() || item._id?.toString() || `item-${index}`}
              numColumns={2}
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeparator}
            columnWrapperStyle={styles.productRow}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            refreshControl={
              <RefreshControl
                refreshing={itemsLoading}
                onRefresh={() => activeTab && fetchItemsForSubcategory(activeTab)}
                colors={['#000000']}
                tintColor="#000000"
              />
            }
            getItemLayout={(data, index) => {
              // Safer getItemLayout with additional validation
              const safeIndex = Math.max(0, index || 0);
              const itemLength = 240;
              return {
                length: itemLength,
                offset: itemLength * Math.floor(safeIndex / 2),
                index: safeIndex,
              };
            }}
          />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
            <Text style={styles.emptySubText}>Try selecting a different category</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => activeTab && fetchItemsForSubcategory(activeTab)}
            >
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        <FilterModal 
          visible={showFilterModal}
          onClose={closeFilterModal}
          slideAnim={slideAnim}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          onClearFilters={clearFilters}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  filterButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tabScrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#CACACA',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 31,
    width: 129,
  },
  activeTab: {
    backgroundColor: 'transparent',
    borderColor: '#000000',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#CACACA',
    letterSpacing: -0.3,
  },
  activeTabText: {
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  productRow: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginBottom: 40,
    gap: 16,
    width: '100%',
  },
  productCard: {
    flex: 1,
    maxWidth: 180,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  productImageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImagePlaceholder: {
    height: '100%',
    width: '100%',
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPlaceholderIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#CCCCCC',
    borderRadius: 8,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 0,
    width: '100%',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    marginBottom: 5,
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#767676',
    marginBottom: 5,
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },
  productColors: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#767676',
    marginBottom: 5,
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#000000',
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },
  itemSeparator: {
    height: 40,
  },

  // Filter Modal Styles  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filterHeader: {
    paddingHorizontal: 16,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clearFiltersText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: '#000000',
    letterSpacing: 0.5,
  },
  filterContent: {
    paddingHorizontal: 16,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  filterSection: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: '#000000',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sizeOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#F8F8F8',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSizeOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  sizeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: '#666666',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  priceSlider: {
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  sliderRange: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
    left: '20%',
    right: '10%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
    left: '20%',
    top: 12,
  },
  sliderThumbEnd: {
    left: '80%',
  },
  priceRangeText: {
    fontSize: FontSizes.sm,
    color: '#666666',
    textAlign: 'center',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  selectedColorOption: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorName: {
    fontSize: FontSizes.sm,
    color: '#666666',
  },
  sortOption: {
    paddingVertical: Spacing.md,
  },
  sortText: {
    fontSize: FontSizes.sm,
    color: '#666666',
  },
  selectedSortText: {
    color: '#000000',
    fontWeight: FontWeights.semiBold,
  },
  categoryOption: {
    paddingVertical: Spacing.md,
  },
  categoryText: {
    fontSize: FontSizes.sm,
    color: '#666666',
  },
  kidsSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginLeft: Spacing.lg,
  },
  kidsSizeOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F8F8F8',
    borderRadius: BorderRadius.md,
  },
  kidsSizeText: {
    fontSize: FontSizes.sm,
    color: '#666666',
  },
  viewResultsButton: {
    marginHorizontal: 16,
    marginVertical: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#000000',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  viewResultsText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semiBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // New styles for dynamic content
  tabLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  tabErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    fontFamily: 'Montserrat-Regular',
    marginRight: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 4,
  },
  debugTitle: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Montserrat-Medium',
  },
  debugText: {
    fontSize: 10,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
  },
});

export default CollectionScreen;
