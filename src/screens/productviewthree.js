import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useProductActions } from '../hooks/useProductActions';
import { AnimatedHeartIcon, ListItemSkeleton } from '../components';
import { apiService } from '../services/apiService';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// Icon components defined outside to avoid re-rendering
const BackIcon = () => (
  <Svg width="10" height="17" viewBox="0 0 10 17" fill="none">
    <Path d="M8.5 16L1 8.5L8.5 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ViewThreeButton = () => (
  <View style={styles.viewButtonContainer}>
    <Text style={styles.viewButtonText}>VIEW 3</Text>
  </View>
);

const ProductViewThree = ({ navigation, route }) => {
  const { handleToggleFavorite, checkIsFavorite } = useProductActions(navigation);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get route params to pass along
  const routeParams = route?.params || {};
  const subcategoryId = route?.params?.subcategoryId || '68d7e6091447aecb79415ba5';
  const subcategoryName = route?.params?.subcategoryName || 'Products';
  
  // Debug logging
  console.log('📍 ProductViewThree - Route params:', route?.params);
  console.log('📍 ProductViewThree - Subcategory ID:', subcategoryId);
  console.log('📍 ProductViewThree - Subcategory name:', subcategoryName);

  const handleFilterPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Filters', {
        previousScreen: 'ProductViewThree',
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from ProductViewThree:', filterParams);
          // Handle filtered results here if needed
        }
      });
    }
  };

  const handleSearchPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SearchScreen', { previousScreen: 'ProductViewThree' });
    }
  };

  // Fetch products from backend API by subcategory
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`� Fetching latest items for subcategory ${subcategoryId}...`);
      
      const response = await apiService.getLatestItemsBySubcategory(subcategoryId);
      
      if (response.success && response.data) {
        console.log('✅ Products fetched successfully:', response.data);
        // The API returns data.items array
        const items = response.data.items || [];
        console.log(`📦 Found ${items.length} items for subcategory ${subcategoryId}`);
        
        // Add masonry layout heights matching Figma design
        // Figma shows full-width product images stacked vertically
        // For iPad/tablets, increase heights proportionally to screen width
        const baseHeight1 = isTablet ? 480 : 363;
        const baseHeight2 = isTablet ? 512 : 388;
        
        const itemsWithHeights = items.map((item, index) => ({
          ...item,
          height: index % 2 === 0 ? baseHeight1 : baseHeight2, // Alternating heights scaled for device
        }));
        
        setProducts(itemsWithHeights);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products for this subcategory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    // Check if images array exists and has items
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Return the first image's URL (images are objects with url property)
      return product.images[0].url || product.images[0];
    }
    // Fallback to image property
    if (product.image) {
      return product.image;
    }
    return null;
  };

  // Removed custom FilterIcon, using imported SVG FilterIcon instead

  const renderProduct = (product, index, columnIndex) => {
    if (!product) return null;
    
    const imageUrl = getProductImageUrl(product);
    // Use responsive height based on device
    const productHeight = product.height || (isTablet ? 480 : 363);
    
    // Calculate staggered top position based on previous items in same column
    let topPosition = 0;
    const columnProducts = columnIndex === 0 ? leftColumnProducts : rightColumnProducts;
    for (let i = 0; i < columnProducts.indexOf(product); i++) {
      const prevProductHeight = columnProducts[i].height || (isTablet ? 480 : 363);
      topPosition += prevProductHeight + (isTablet ? 16 : 10); // Larger gap for tablets
    }
    
    return (
      <View 
        key={product.id || product._id || `product-${index}`} 
        style={[
          styles.productContainer,
          styles.productAbsolute,
          { 
            height: productHeight,
            top: topPosition,
          }
        ]}
      >
        {/* Product Image */}
        <TouchableOpacity 
          style={[styles.imageContainer, { height: productHeight }]}
          onPress={() => navigation.navigate('ProductDetailsMain', { product, previousScreen: 'ProductViewThree' })}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.productImage, { height: productHeight }]}
              resizeMode="cover"
              onError={(e) => {
                console.warn('⚠️ Error loading image:', e.nativeEvent.error);
              }}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { height: productHeight }]} />
          )}
          
          {/* Animated Heart Icon */}
          <AnimatedHeartIcon
            isFavorite={checkIsFavorite(product)}
            onPress={async () => {
              await handleToggleFavorite(product);
            }}
            size={21}
            containerStyle={styles.heartButton}
            style={styles.heartIconContainer}
            filledColor="#FF0000"
            unfilledColor="#000000"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderColumn = (columnProducts, columnIndex) => {
    // Calculate total height for column container with responsive gaps
    const gapSize = isTablet ? 16 : 10;
    const totalHeight = columnProducts.reduce((sum, product) => {
      const productHeight = product.height || (isTablet ? 480 : 363);
      return sum + productHeight + gapSize;
    }, 0);
    
    return (
      <View style={[
        styles.column,
        { 
          height: totalHeight,
        }
      ]}>
        {columnProducts.map((product, index) => renderProduct(product, index, columnIndex))}
      </View>
    );
  };

  const handleTabChange = (tabName) => {
    if (navigation) {
      navigation.navigate(tabName);
    }
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleGridPress = () => {
    console.log('🔄 ProductViewThree -> ProductViewOne - Passing params:', routeParams);
    if (navigation) {
      navigation.navigate('ProductViewOne', routeParams);
    }
  };

  // Split products into two columns for Pinterest-style layout
  const leftColumnProducts = products.filter((_, index) => index % 2 === 0);
  const rightColumnProducts = products.filter((_, index) => index % 2 === 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Control Bar / Header */}
      <View style={styles.controlBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{subcategoryName}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
            <GlobalSearchIcon size={20} color="#000000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleGridPress}>
            <ViewThreeButton />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid - Pinterest Style */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <ListItemSkeleton key={index} />
            ))}
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          <View style={styles.pinterestGrid}>
            {renderColumn(leftColumnProducts, 0)}
            {renderColumn(rightColumnProducts, 1)}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation - Absolute Position */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigationBar 
          activeTab="Home" 
          onTabChange={handleTabChange}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 24 : 16,
    paddingTop: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    backgroundColor: '#FFFFFF',
    height: isTablet ? 100 : 90,
  },
  headerLeft: {
    width: isTablet ? 80 : 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 20 : 16,
  },
  headerTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    padding: 4,
  },
  
  // Icon Styles
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backArrow: {
    width: 10,
    height: 17,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '-45deg' }],
    marginRight: 4,
  },
  
  viewButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  viewButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.06,
    textAlign: 'center',
  },
  
  filterIcon: {
    width: 26,
    height: 20,
    position: 'relative',
  },
  
  filterLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#262626',
  },
  
  filterCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#262626',
    backgroundColor: '#FFFFFF',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  
  pinterestGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 16 : 8,
    paddingTop: 0,
    paddingBottom: isTablet ? 120 : 100, // More space for bottom navigation on tablets
    gap: isTablet ? 12 : 6, // Larger gap between columns on tablets
  },
  
  column: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  
  productContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  
  productAbsolute: {
    position: 'absolute',
    width: '100%',
  },
  
  imageContainer: {
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  
  imagePlaceholder: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
  },
  
  productImage: {
    width: '100%',
    borderRadius: 0,
  },
  
  // Loading, Error, Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    minHeight: 300,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
  
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 7,
    zIndex: 2,
  },
  
  heartIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  heartIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  heartOutline: {
    width: 12,
    height: 11,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'transparent',
  },
  
  heartFilled: {
    width: 12,
    height: 11,
    backgroundColor: '#FF4444',
  },
  
  // Bottom Navigation Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default ProductViewThree;