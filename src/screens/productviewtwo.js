import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useProductActions } from '../hooks/useProductActions';
import { AnimatedHeartIcon } from '../components';
import { apiService } from '../services/apiService';

// Icon components defined outside to avoid re-rendering
const BackIcon = () => (
  <Svg width="10" height="17" viewBox="0 0 10 17" fill="none">
    <Path d="M8.5 16L1 8.5L8.5 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const GridIcon = () => (
  <View style={{ width: 22, height: 22, position: 'relative' }}>
    <View style={{ position: 'absolute', width: 8, height: 8, borderWidth: 1, borderColor: '#000000', top: 1, left: 1 }} />
    <View style={{ position: 'absolute', width: 8, height: 8, borderWidth: 1, borderColor: '#000000', top: 1, right: 1 }} />
    <View style={{ position: 'absolute', width: 8, height: 8, borderWidth: 1, borderColor: '#000000', bottom: 1, left: 1 }} />
    <View style={{ position: 'absolute', width: 8, height: 8, borderWidth: 1, borderColor: '#000000', bottom: 1, right: 1 }} />
  </View>
);

const ProductViewTwo = ({ navigation, route }) => {
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
  console.log('📍 ProductViewTwo - Route params:', route?.params);
  console.log('📍 ProductViewTwo - Subcategory ID:', subcategoryId);
  console.log('📍 ProductViewTwo - Subcategory name:', subcategoryName);

  const handleFilterPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Filters', {
        previousScreen: 'ProductViewTwo',
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from ProductViewTwo:', filterParams);
          // Handle filtered results here if needed
        }
      });
    }
  };

  const handleSearchPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SearchScreen', { previousScreen: 'ProductViewTwo' });
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
        setProducts(items);
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

  // Helper function to get product price
  const getProductPrice = (product) => {
    // Check sizes array for price
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      const firstSize = product.sizes[0];
      if (firstSize.salePrice) {
        return firstSize.salePrice;
      }
      if (firstSize.regularPrice) {
        return firstSize.regularPrice;
      }
    }
    // Fallback checks
    if (product.price) {
      return product.price;
    }
    if (product.variants && product.variants.length > 0 && product.variants[0].price) {
      return product.variants[0].price;
    }
    return '0';
  };

  // Removed custom FilterIcon, using imported SVG FilterIcon instead

  const renderProduct = (product) => {
    if (!product) return null;
    
    const imageUrl = getProductImageUrl(product);
    
    return (
      <View key={product.id || product._id} style={styles.productContainer}>
        {/* Product Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => navigation.navigate('ProductDetailsMain', { product, previousScreen: 'ProductViewTwo' })}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
              onError={(e) => {
                console.warn('⚠️ Error loading image:', e.nativeEvent.error);
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder} />
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
    console.log('🔄 ProductViewTwo -> ProductViewThree - Passing params:', routeParams);
    if (navigation) {
      navigation.navigate('ProductViewThree', routeParams);
    }
  };

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
            <GridIcon />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid - 3 Columns */}
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading products...</Text>
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
          <View style={styles.productsGrid}>
            {products.map((product) => renderProduct(product))}
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

  // Control Bar / Header Styles
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    height: 90,
  },
  headerLeft: {
    width: 68,
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
    gap: 16,
  },
  headerTitle: {
    fontSize: 16,
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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // Add space for bottom navigation
  },

  // Product Styles
  productContainer: {
    width: '48%', // 2 columns layout
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 0,
  },
  productImage: {
    width: '100%',
    height: '100%',
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

  // Heart Button
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIconContainer: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icons
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 8,
    height: 15,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
  },

  gridIcon: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  gridSquare: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  topLeft: {
    top: 1,
    left: 1,
  },
  topRight: {
    top: 1,
    right: 1,
  },
  bottomLeft: {
    bottom: 1,
    left: 1,
  },
  bottomRight: {
    bottom: 1,
    right: 1,
  },

  filterIcon: {
    width: 26,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot1: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 2,
    top: 3,
  },
  filterLine1: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 6,
    top: 4.5,
  },
  filterDot2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 10,
    top: 8.5,
  },
  filterLine2: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 2,
    top: 10,
  },
  filterDot3: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
    left: 15,
    top: 14,
  },
  filterLine3: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#262626',
    left: 2,
    top: 15.5,
  },

  heartIcon: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartOutline: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    position: 'relative',
  },
  heartFilled: {
    width: 8,
    height: 8,
    backgroundColor: '#FF0000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
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

export default ProductViewTwo;
