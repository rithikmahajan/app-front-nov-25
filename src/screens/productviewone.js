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
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Svg, { Path, Rect } from 'react-native-svg';
import GlobalSearchIcon from '../assets/icons/GlobalSearchIcon';
import FilterIcon from '../assets/icons/FilterIcon';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useFavorites } from '../contexts/FavoritesContext';
import { apiService } from '../services/apiService';
import { AnimatedHeartIcon, ProductGridSkeleton } from '../components';

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
        previousParams: routeParams, // Pass all route params back
        onApplyFilters: (items, filterParams) => {
          console.log('🔍 Filters applied from ProductViewOne:', filterParams);
          // Handle filtered results here if needed
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
                  <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
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
            size={21}
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
            <GlobalSearchIcon size={20} color="#000000" />
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

  // Icon Styles
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: 10,
    height: 17,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    marginRight: 2,
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
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDot1: {
    position: 'absolute',
    top: 3,
    left: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  filterLine1: {
    position: 'absolute',
    top: 4.5,
    left: 7,
    width: 17,
    height: 1.5,
    backgroundColor: '#262626',
  },
  filterDot2: {
    position: 'absolute',
    top: 11,
    left: 9,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  filterLine2: {
    position: 'absolute',
    top: 12.5,
    left: 1,
    width: 6,
    height: 1.5,
    backgroundColor: '#262626',
  },
  filterDot3: {
    position: 'absolute',
    top: 19,
    left: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  filterLine3: {
    position: 'absolute',
    top: 20.5,
    left: 1,
    width: 9,
    height: 1.5,
    backgroundColor: '#262626',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingTop: 10,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
    paddingBottom: 100, // Add space for bottom navigation
  },

  // Product Styles
  productContainer: {
    width: 184,
    marginLeft: 6,
    marginRight: 6,
    marginBottom: 40,
  },
  productContainerRight: {
    marginLeft: 6,
  },
  
  imageContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  imagePlaceholder: {
    width: 184,
    height: 184,
    backgroundColor: '#EEEEEE',
    borderRadius: 0,
  },
  
  // Icon Buttons on Product
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  heartIconContainer: {
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Heart Icon
  heartIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartShape: {
    width: 16,
    height: 14,
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

  // Product Info Styles
  productInfo: {
    paddingHorizontal: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 5,
    lineHeight: 17,
  },
  productSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 5,
    lineHeight: 17,
  },
  
  // Color Dots
  colorDotsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 17,
  },

  // Video Styles
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Product Image
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
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

export default ProductViewOne;
