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
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useProductActions } from '../hooks/useProductActions';
import { AnimatedHeartIcon } from '../components';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { apiService } from '../services/apiService';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// Icon components defined outside to avoid re-rendering
const BackIcon = () => (
  <Svg width="10" height="17" viewBox="0 0 10 17" fill="none">
    <Path d="M8.5 16L1 8.5L8.5 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ViewTwoButton = () => (
  <View style={styles.viewButtonContainer}>
    <Text style={styles.viewButtonText}>VIEW 2</Text>
  </View>
);

const ProductViewTwo = ({ navigation, route }) => {
  const { handleToggleFavorite, checkIsFavorite } = useProductActions(navigation);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
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
        previousParams: routeParams, // Pass all route params back
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from ProductViewTwo:', filterParams);
          // Handle filtered results here if needed
        }
      });
    }
  };

  const handleSearchPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SearchScreen', { 
        previousScreen: 'ProductViewTwo',
        previousParams: routeParams // Pass all route params back
      });
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
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return null;
  };

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
            size={isTablet ? 24 : 21}
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
            <GlobalSearchIcon size={isTablet ? 24 : 20} color="#000000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleGridPress}>
            <ViewTwoButton />
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
          <ProductGridSkeleton count={6} columns={2} />
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

  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp(3.1) : wp(4.3),
    paddingTop: isTablet ? hp(2.5) : hp(2),
    paddingBottom: isTablet ? hp(2) : hp(1.5),
    backgroundColor: '#FFFFFF',
    minHeight: isTablet ? hp(10) : hp(11),
  },
  headerLeft: {
    width: isTablet ? wp(10.4) : wp(18),
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
    gap: isTablet ? wp(2.6) : wp(4.3),
  },
  headerTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  backButton: {
    padding: wp(2),
  },
  iconButton: {
    padding: wp(1),
  },

  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(0.53),
    paddingHorizontal: wp(0.53),
    paddingBottom: isTablet ? hp(14.7) : hp(12.2),
  },

  productContainer: {
    width: isTablet ? '32.8%' : '32.8%',
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 0.77,
    backgroundColor: '#EEEEEE',
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(7.3),
    minHeight: hp(36.7),
  },
  loadingText: {
    marginTop: hp(1.5),
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(7.3),
    paddingHorizontal: wp(5.3),
    minHeight: hp(36.7),
  },
  errorText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    color: '#FF0000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: wp(6.4),
    paddingVertical: hp(1.5),
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(7.3),
    minHeight: hp(36.7),
  },
  emptyText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(15) : fs(16),
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },

  heartButton: {
    position: 'absolute',
    top: isTablet ? hp(1.2) : hp(1.22),
    right: isTablet ? wp(1.2) : wp(1.9),
    width: isTablet ? wp(3.1) : wp(5.3),
    height: isTablet ? wp(3.1) : wp(5.3),
    borderRadius: isTablet ? wp(1.55) : wp(2.65),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  heartIconContainer: {
    width: isTablet ? wp(1.8) : wp(3.2),
    height: isTablet ? wp(1.8) : wp(3.2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: isTablet ? wp(3) : wp(6.4),
    height: isTablet ? hp(2.5) : hp(2.9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: isTablet ? wp(1.2) : wp(2.1),
    height: isTablet ? hp(1.8) : hp(1.83),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
  },

  viewButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  viewButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: isTablet ? fs(12) : isSmallDevice ? fs(9) : fs(10),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.06,
    textAlign: 'center',
  },

  filterIcon: {
    width: isTablet ? wp(3.4) : wp(6.9),
    height: isTablet ? hp(2.6) : hp(2.6),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot1: {
    position: 'absolute',
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
    left: isTablet ? wp(0.3) : wp(0.53),
    top: isTablet ? hp(0.4) : hp(0.37),
  },
  filterLine1: {
    position: 'absolute',
    width: isTablet ? wp(2.3) : wp(4.8),
    height: 1.5,
    backgroundColor: '#262626',
    left: isTablet ? wp(0.8) : wp(1.6),
    top: isTablet ? hp(0.55) : hp(0.55),
  },
  filterDot2: {
    position: 'absolute',
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
    left: isTablet ? wp(1.3) : wp(2.67),
    top: isTablet ? hp(1.04) : hp(1.04),
  },
  filterLine2: {
    position: 'absolute',
    width: isTablet ? wp(2.3) : wp(4.8),
    height: 1.5,
    backgroundColor: '#262626',
    left: isTablet ? wp(0.3) : wp(0.53),
    top: isTablet ? hp(1.22) : hp(1.22),
  },
  filterDot3: {
    position: 'absolute',
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
    left: isTablet ? wp(2) : wp(4),
    top: isTablet ? hp(1.71) : hp(1.71),
  },
  filterLine3: {
    position: 'absolute',
    width: isTablet ? wp(2.3) : wp(4.8),
    height: 1.5,
    backgroundColor: '#262626',
    left: isTablet ? wp(0.3) : wp(0.53),
    top: isTablet ? hp(1.9) : hp(1.9),
  },

  heartIcon: {
    width: isTablet ? wp(1.8) : wp(3.2),
    height: isTablet ? wp(1.8) : wp(3.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartOutline: {
    width: isTablet ? wp(1.2) : wp(2.1),
    height: isTablet ? wp(1.2) : wp(2.1),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    position: 'relative',
  },
  heartFilled: {
    width: isTablet ? wp(1.2) : wp(2.1),
    height: isTablet ? wp(1.2) : wp(2.1),
    backgroundColor: '#FF0000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default ProductViewTwo;
