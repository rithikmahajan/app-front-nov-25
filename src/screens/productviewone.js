import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Svg, { Path, Rect } from 'react-native-svg';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useFavorites } from '../contexts/FavoritesContext';
import { apiService } from '../services/apiService';
import { AnimatedHeartIcon, ProductGridSkeleton } from '../components';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

// Icon components defined outside to avoid re-rendering
const BackIcon = () => (
  <Svg width="10" height="17" viewBox="0 0 10 17" fill="none">
    <Path d="M8.5 16L1 8.5L8.5 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ViewOneButton = () => (
  <View style={styles.viewButtonContainer}>
    <Text style={styles.viewButtonText}>VIEW 1</Text>
  </View>
);

const ProductViewOne = ({ navigation, route }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Get subcategory ID from route parameters
  const subcategoryId = route?.params?.subcategoryId || '68d7e6091447aecb79415ba5';
  const subcategoryName = route?.params?.subcategoryName || 'Products';
  
  // Get category information to pass to product details for back navigation
  const categoryName = route?.params?.categoryName || null;
  
  // Get route params to pass along when switching views
  const routeParams = route?.params || {};
  
  // Debug logging
  console.log('📍 ProductViewOne - Route params:', route?.params);
  console.log('📍 ProductViewOne - Subcategory name:', subcategoryName);
  console.log('📍 ProductViewOne - Category name:', categoryName);
  
  // State management for API data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items data from API by subcategory
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching latest items for subcategory ${subcategoryId}...`);
      
      const response = await apiService.getLatestItemsBySubcategory(subcategoryId);
      console.log('✅ Latest Items API Response:', response);
      
      if (response.success && response.data && response.data.items) {
        setItems(response.data.items);
        console.log(`📦 Found ${response.data.items.length} items for subcategory ${subcategoryId}`);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setError('No items found for this category');
      }
    } catch (err) {
      console.error('❌ Error fetching latest items:', err);
      setError(err.userMessage || 'Failed to load products for this category');
    } finally {
      setLoading(false);
    }
  }, [subcategoryId]);

  // Load data on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Filters', {
        previousScreen: 'ProductViewOne',
        previousParams: routeParams,
        onApplyFilters: (filteredItems, filterParams) => {
          console.log('🔍 Filters applied from ProductViewOne:', filterParams);
        }
      });
    }
  };

  const handleSearchPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SearchScreen', { 
        previousScreen: 'ProductViewOne',
        previousParams: routeParams // Pass all route params back
      });
    }
  };

  // Format price from the API data
  const formatPrice = (sizes) => {
    if (!sizes || sizes.length === 0) return 'Price not available';
    
    // Get the first size with pricing info
    const firstSize = sizes[0];
    if (firstSize.salePrice && firstSize.salePrice !== firstSize.regularPrice) {
      return `₹${firstSize.salePrice}`;
    }
    return `₹${firstSize.regularPrice || 'N/A'}`;
  };

  // Get the first image URL from the item
  const getFirstImage = (images) => {
    if (!images || images.length === 0) return null;
    return images[0]?.url || null;
  };

  // Removed custom FilterIcon, using imported SVG FilterIcon instead

  const renderProduct = (item, index) => {
    const isLiked = isFavorite(item._id);
    const isFirstInRow = index % 2 === 0;
    const imageUrl = getFirstImage(item.images);
    const price = formatPrice(item.sizes);
    
    // Check if first media is a video
    const firstMedia = item.images && item.images.length > 0 ? item.images[0] : null;
    const isFirstMediaVideo = firstMedia && (
      firstMedia.mediaType === 'video' || 
      firstMedia.type === 'video' ||
      (firstMedia.url && (
        firstMedia.url.includes('.mp4') || 
        firstMedia.url.includes('.mov') || 
        firstMedia.url.includes('.avi') ||
        firstMedia.url.includes('.m4v')
      ))
    );
    
    return (
      <View key={item._id} style={[
        styles.productContainer,
        !isFirstInRow && styles.productContainerRight
      ]}>
        {/* Product Image/Video */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => navigation.navigate('ProductDetailsMain', { 
            product: item, 
            previousScreen: 'ProductViewOne',
            categoryName: categoryName, // Pass category for back navigation to Home
            subcategoryName: subcategoryName
          })}
        >
          {imageUrl ? (
            isFirstMediaVideo ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                  repeat={true}
                  muted={true}
                  paused={true}
                  controls={false}
                />
                {/* Video Play Icon Indicator */}
                <View style={styles.videoPlayIcon}>
                  <Svg width={isTablet ? 60 : 40} height={isTablet ? 60 : 40} viewBox="0 0 40 40" fill="none">
                    <Rect width="40" height="40" rx="20" fill="rgba(0, 0, 0, 0.6)" />
                    <Path d="M16 12L28 20L16 28V12Z" fill="white" />
                  </Svg>
                </View>
              </View>
            ) : (
              <Image 
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            )
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          
          {/* Animated Heart Icon */}
          <AnimatedHeartIcon
            isFavorite={isLiked}
            onPress={async () => {
              try {
                await toggleFavorite(item._id);
              } catch (favoriteError) {
                console.error('Error toggling favorite:', favoriteError);
              }
            }}
            size={isTablet ? 26 : 21}
            containerStyle={styles.heartButton}
            style={styles.heartIconContainer}
            filledColor="#FF0000"
            unfilledColor="#000000"
          />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productSubtitle}>{item.title}</Text>
          
          <Text style={styles.productPrice}>{price}</Text>
        </View>
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
      // Check if we came from SearchScreen or Search flow, if so navigate to Home
      const previousScreen = route?.params?.previousScreen;
      if (previousScreen === 'SearchScreen' || previousScreen === 'Search') {
        navigation.navigate('Home');
      } else {
        navigation.goBack();
      }
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
          
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            console.log('🔄 ProductViewOne -> ProductViewTwo - Passing params:', routeParams);
            navigation.navigate('ProductViewTwo', routeParams);
          }}>
            <ViewOneButton />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ProductGridSkeleton count={6} columns={1} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchItems}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {items.map((item, index) => renderProduct(item, index))}
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
    paddingHorizontal: wp(4.3),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    backgroundColor: '#FFFFFF',
    minHeight: isTablet ? hp(10) : hp(11),
  },
  headerLeft: {
    width: isTablet ? wp(10) : wp(18),
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
    gap: isTablet ? wp(2.5) : wp(4.3),
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

  backIcon: {
    width: isTablet ? wp(3) : wp(6.4),
    height: isTablet ? hp(2.5) : hp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: isTablet ? wp(1.5) : wp(2.7),
    height: isTablet ? hp(2) : hp(2.1),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    marginRight: wp(0.5),
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
    width: isTablet ? wp(3.5) : wp(7),
    height: isTablet ? hp(3) : hp(3.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDot1: {
    position: 'absolute',
    top: isTablet ? hp(0.4) : hp(0.37),
    left: isTablet ? wp(0.15) : wp(0.27),
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
  },
  filterLine1: {
    position: 'absolute',
    top: isTablet ? hp(0.55) : hp(0.55),
    left: isTablet ? wp(1) : wp(1.87),
    width: isTablet ? wp(2.5) : wp(4.53),
    height: 1.5,
    backgroundColor: '#262626',
  },
  filterDot2: {
    position: 'absolute',
    top: isTablet ? hp(1.3) : hp(1.35),
    left: isTablet ? wp(1.3) : wp(2.4),
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
  },
  filterLine2: {
    position: 'absolute',
    top: isTablet ? hp(1.45) : hp(1.53),
    left: isTablet ? wp(0.15) : wp(0.27),
    width: isTablet ? wp(0.9) : wp(1.6),
    height: 1.5,
    backgroundColor: '#262626',
  },
  filterDot3: {
    position: 'absolute',
    top: isTablet ? hp(2.2) : hp(2.32),
    left: isTablet ? wp(1.7) : wp(3.2),
    width: isTablet ? wp(0.6) : wp(1.1),
    height: isTablet ? wp(0.6) : wp(1.1),
    borderRadius: isTablet ? wp(0.3) : wp(0.55),
    backgroundColor: '#262626',
  },
  filterLine3: {
    position: 'absolute',
    top: isTablet ? hp(2.35) : hp(2.51),
    left: isTablet ? wp(0.15) : wp(0.27),
    width: isTablet ? wp(1.3) : wp(2.4),
    height: 1.5,
    backgroundColor: '#262626',
  },

  content: {
    flex: 1,
    paddingTop: hp(1.2),
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isTablet ? wp(2) : wp(1.6),
    paddingBottom: isTablet ? hp(12) : hp(12),
    justifyContent: 'space-between',
  },

  productContainer: {
    width: isTablet ? wp(46) : wp(47.5),
    marginBottom: isTablet ? hp(5) : hp(4.9),
  },
  productContainerRight: {
  },
  
  imageContainer: {
    position: 'relative',
    marginBottom: isTablet ? hp(1.8) : hp(1.7),
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 0,
  },
  
  heartButton: {
    position: 'absolute',
    top: isTablet ? hp(1.5) : hp(1.47),
    right: isTablet ? wp(2) : wp(3.2),
  },
  heartIconContainer: {
    width: isTablet ? wp(5.5) : wp(9.1),
    height: isTablet ? wp(5.5) : wp(9.1),
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? wp(2.75) : wp(4.55),
    justifyContent: 'center',
    alignItems: 'center',
  },

  heartIcon: {
    width: isTablet ? wp(3) : wp(5.3),
    height: isTablet ? wp(3) : wp(5.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartShape: {
    width: isTablet ? wp(2.5) : wp(4.3),
    height: isTablet ? wp(2.2) : wp(3.73),
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  heartFilled: {
    backgroundColor: '#CA3327',
    borderColor: '#CA3327',
  },

  productInfo: {
    paddingHorizontal: isTablet ? wp(2) : wp(3.73),
  },
  productName: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: hp(0.6),
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(15) : fs(17),
  },
  productSubtitle: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp(0.6),
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(15) : fs(17),
  },
  
  colorDotsContainer: {
    flexDirection: 'row',
    marginBottom: hp(0.6),
    gap: wp(1.1),
  },
  colorDot: {
    width: isTablet ? wp(2) : wp(3.2),
    height: isTablet ? wp(2) : wp(3.2),
    borderRadius: isTablet ? wp(1) : wp(1.6),
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  
  productPrice: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(20) : isSmallDevice ? fs(15) : fs(17),
  },

  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: isTablet ? wp(-3) : wp(-5.3),
    marginLeft: isTablet ? wp(-3) : wp(-5.3),
    width: isTablet ? wp(6) : wp(10.7),
    height: isTablet ? wp(6) : wp(10.7),
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(6),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5.3),
    paddingTop: hp(6),
  },
  errorText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: hp(2.4),
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: wp(6.4),
    paddingVertical: hp(1.5),
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(13) : fs(14),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },

  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default ProductViewOne;
