import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
  Modal,
  Share,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import SizeSelectionModal from './productdetailsmainsizeselectionchart';
import GlobalBackButton from '../components/GlobalBackButton';
import BundleRecommendations from '../components/BundleRecommendations';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { apiService } from '../services/apiService';
import { yoraaAPI } from '../services/yoraaAPI';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';
import AnimatedHeartIcon from '../components/AnimatedHeartIcon';
import { 
  wp, 
  hp, 
  fs, 
  isTablet, 
  isSmallDevice 
} from '../utils/responsive';

const { width } = Dimensions.get('window');

const ProductDetailsMain = ({ navigation, route }) => {
  const [activeSize, setActiveSize] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    sizeAndFit: false,
    manufacturing: false,
    shipping: false,
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [modalActionType, setModalActionType] = useState('addToCart'); // Track action type: 'addToCart' or 'buyNow'
  const imageSliderRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Favorites context
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Bag context
  const { addToBag } = useBag();

  // API-related state management
  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false since we might have product data
  const [error, setError] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  
  // Detailed ratings state
  const [detailedRatings, setDetailedRatings] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Linked products state
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [linkedProductsLoading, setLinkedProductsLoading] = useState(false);

  // Get product from route params (clicked product from previous screen)
  const productFromRoute = route?.params?.product;
  
  // Fixed subcategory ID for API fallback
  const subcategoryId = productFromRoute?.subCategoryId?._id || '68d7e6091447aecb79415ba5';

  // Fetch items from API (fallback or related products)
  const fetchLatestItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching latest items for subcategory ${subcategoryId}...`);
      
      const response = await apiService.getLatestItemsBySubcategory(subcategoryId);
      console.log('✅ Latest Items API Response:', response);
      
      if (response.success && response.data && response.data.items && response.data.items.length > 0) {
        setApiItems(response.data.items);
        console.log(`📦 Found ${response.data.items.length} items for related products`);
        
        // If no specific product was passed, use first API item as currentItem
        if (!productFromRoute) {
          setCurrentItem(response.data.items[0]);
          console.log('📦 Using first API item as current product');
        }
      } else {
        console.warn('⚠️ No items found in API response');
        if (!productFromRoute) {
          setError('No items found');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching latest items:', err);
      if (!productFromRoute) {
        setError(err.userMessage || 'Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  }, [subcategoryId, productFromRoute]);

  // Fetch detailed ratings for current product
  const fetchDetailedRatings = useCallback(async (productId) => {
    if (!productId) return;
    
    try {
      setRatingsLoading(true);
      console.log('🔄 Fetching detailed ratings for product:', productId);
      
      const response = await yoraaAPI.getProductRatingStats(productId);
      console.log('✅ Detailed Ratings API Response:', response);
      
      if (response.success && response.data) {
        setDetailedRatings(response.data);
        console.log('📊 Updated detailed ratings state:', response.data);
      } else {
        console.warn('⚠️ No detailed ratings found for product');
        setDetailedRatings(null);
      }
    } catch (err) {
      console.error('❌ Error fetching detailed ratings:', err);
      setDetailedRatings(null);
    } finally {
      setRatingsLoading(false);
    }
  }, []);

  // Fetch linked products for current item
  const fetchLinkedProducts = useCallback(async (itemId) => {
    if (!itemId) {
      console.log('⚠️ No itemId provided to fetchLinkedProducts');
      return;
    }
    
    try {
      setLinkedProductsLoading(true);
      console.log('🔄 Fetching linked products for item:', itemId);
      
      const response = await apiService.getItemGroupByItemId(itemId);
      console.log('✅ Linked Products API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.items) {
        console.log(`📦 Found ${response.data.items.length} items in group`);
        
        // Set linked products if there are multiple items
        if (response.data.items.length > 1) {
          setLinkedProducts(response.data.items);
          console.log('✅ Set linked products:', response.data.items.map(i => ({ id: i.itemId, name: i.productName })));
        } else {
          console.log('ℹ️ Only single product in group, not showing variants');
          setLinkedProducts([]);
        }
      } else {
        console.log('ℹ️ No linked products found - response.success:', response.success, 'has data:', !!response.data);
        console.log('💡 To show linked products: Create an Item Group in the admin panel at /item-linking');
        setLinkedProducts([]);
      }
    } catch (err) {
      console.log('ℹ️ No item group found for this product (this is normal):', err.message);
      console.log('💡 To enable linked products: Go to admin panel → Item Linking → Create Group');
      setLinkedProducts([]);
    } finally {
      setLinkedProductsLoading(false);
    }
  }, []);

  // Initialize component data
  useEffect(() => {
    if (productFromRoute) {
      // Use the specific product passed from previous screen
      console.log('📦 Using specific product from route params:', productFromRoute.productName);
      setCurrentItem(productFromRoute);
      setLoading(false);
      // Still fetch API items for related products
      fetchLatestItems();
      // Fetch detailed ratings for this product
      const productId = productFromRoute._id || productFromRoute.id;
      if (productId) {
        fetchDetailedRatings(productId);
      }
    } else {
      // No specific product, fetch from API
      console.log('📦 No specific product provided, fetching from API');
      fetchLatestItems();
    }
  }, [productFromRoute, fetchLatestItems, fetchDetailedRatings]);

  // Fetch detailed ratings when currentItem changes
  useEffect(() => {
    if (currentItem) {
      const productId = currentItem._id || currentItem.id;
      if (productId) {
        fetchDetailedRatings(productId);
      }
    }
  }, [currentItem, fetchDetailedRatings]);

  // Fetch linked products when currentItem changes
  useEffect(() => {
    if (currentItem) {
      const itemId = currentItem._id || currentItem.id;
      if (itemId) {
        fetchLinkedProducts(itemId);
      }
    }
  }, [currentItem, fetchLinkedProducts]);

  // Utility functions for API data
  const getFirstImage = (images) => {
    if (images && images.length > 0) {
      return images[0].url;
    }
    return null;
  };

  const formatPrice = (sizes) => {
    if (!sizes || sizes.length === 0) return 'N/A';
    const firstSize = sizes[0];
    if (firstSize.salePrice && firstSize.salePrice !== firstSize.regularPrice) {
      return `₹${firstSize.salePrice}`;
    }
    return `₹${firstSize.regularPrice || 'N/A'}`;
  };

  const formatOriginalPrice = (sizes) => {
    if (!sizes || sizes.length === 0) return null;
    const firstSize = sizes[0];
    if (firstSize.salePrice && firstSize.salePrice !== firstSize.regularPrice) {
      return `₹${firstSize.regularPrice}`;
    }
    return null;
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!currentItem) return;
    
    const productId = currentItem._id || currentItem.id;
    await toggleFavorite(productId);
  };

  // Check if current product is favorited
  const isCurrentProductFavorited = currentItem ? isFavorite(currentItem._id || currentItem.id) : false;

  // Handle add to bag
  const handleAddToBag = async () => {
    if (!currentItem) {
      Alert.alert('Error', 'Product information not available');
      return;
    }

    if (!activeSize) {
      Alert.alert('Select Size', 'Please select a size before adding to bag');
      return;
    }

    try {
      await addToBag(currentItem, activeSize);
      Alert.alert('Success', 'Item added to bag successfully!');
    } catch (error) {
      console.error('Error adding to bag:', error);
      Alert.alert('Error', 'Failed to add item to bag. Please try again.');
    }
  };

  // Share function
  const handleShare = async () => {
    try {
      const productName = currentItem ? currentItem.productName : 'Product';
      const productPrice = currentItem ? formatPrice(currentItem.sizes) : 'N/A';
      const message = `Check out this ${productName}\nPrice: ${productPrice}\n\nShop now on Yoraa App!`;
      
      const result = await Share.share({
        message: message,
        title: productName,
        url: '', // Add your product URL here if available
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Error sharing:', err.message);
      }
    }
  };

  // Handle linked product variant selection
  const handleLinkedProductSelect = async (variantItemId) => {
    // Extract the actual ID if an object was passed
    const actualItemId = typeof variantItemId === 'object' ? (variantItemId._id || variantItemId.id) : variantItemId;
    
    if (!actualItemId || actualItemId === (currentItem?._id || currentItem?.id)) {
      return; // Already selected or invalid
    }
    
    try {
      console.log('🔄 Switching to linked product:', actualItemId);
      setLoading(true);
      
      // Fetch the full product details for the selected variant
      const response = await apiService.getItemById(actualItemId);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched variant:', response.data.productName);
        
        // Update current item directly - this is faster and smoother than navigation
        setCurrentItem(response.data);
        
        // Reset image slider to first image
        setActiveImageIndex(0);
        if (imageSliderRef.current) {
          imageSliderRef.current.scrollToIndex({ index: 0, animated: false });
        }
        
        // Reset size selection
        setActiveSize(null);
        
        // Scroll to top of the page
        // This gives a better UX when switching variants
        
        console.log('✅ Product variant switched successfully');
      } else {
        console.error('❌ Failed to fetch variant details');
        Alert.alert('Error', 'Failed to load product variant');
      }
    } catch (err) {
      console.error('❌ Error switching variant:', err);
      console.error('Error details:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to switch product variant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic related products based on API response
  const getRelatedItems = (type) => {
    if (!currentItem || !currentItem.alsoShowInOptions) {
      return [];
    }

    const options = currentItem.alsoShowInOptions[type];
    
    // Filter out the current item from related products
    const filteredItems = apiItems.filter(item => item._id !== currentItem._id);
    
    // Check if the option is enabled
    if (typeof options === 'boolean') {
      return options ? filteredItems.slice(0, 4) : []; // Show other items if enabled, max 4
    }
    
    if (typeof options === 'object' && options.enabled) {
      return options.items && options.items.length > 0 ? options.items : filteredItems.slice(0, 4);
    }
    
    return [];
  };

  const youMightAlsoLike = getRelatedItems('youMightAlsoLike');
  const similarItems = getRelatedItems('similarItems');
  const othersAlsoBought = getRelatedItems('othersAlsoBought');

  // Legacy related products for backward compatibility
  const relatedProducts = [
    {
      id: '1',
      name: 'Nike Everyday Max Cushioned',
      price: 'US$24',
    },
    {
      id: '2',
      name: 'Nike Dunk Low',
      price: 'US$55',
    },
  ];

  // Icon Components
  const SearchIcon = () => (
    <View style={styles.searchIcon}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );


  const ShoppingBagIcon = () => (
    <View style={styles.bagIcon}>
      <View style={styles.bagBody} />
      <View style={styles.bagHandle} />
    </View>
  );

  const ShareIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M14.2857 5.14289L12.0251 2.85718L9.71425 5.14289M12 2.85718V13.1429M8.57139 7.42861H7.42854C6.82233 7.42861 6.24095 7.66942 5.81229 8.09808C5.38364 8.52673 5.14282 9.10811 5.14282 9.71432V17.7143C5.14282 18.3205 5.38364 18.9019 5.81229 19.3306C6.24095 19.7592 6.82233 20 7.42854 20H16.5714C17.1776 20 17.759 19.7592 18.1876 19.3306C18.6163 18.9019 18.8571 18.3205 18.8571 17.7143V9.71432C18.8571 9.10811 18.6163 8.52673 18.1876 8.09808C17.759 7.66942 17.1776 7.42861 16.5714 7.42861H15.4285" 
        stroke="#767676" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const RedBannerIcon = () => (
    <Svg width="82" height="39" viewBox="0 0 82 39" fill="none">
      <Rect y="2.99023" width="80.5495" height="35.9825" transform="rotate(-2.12758 0 2.99023)" fill="#EA4335"/>
    </Svg>
  );

  const UpArrowIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_10602_37010)">
        <Path 
          d="M4.5 15L12 7.5L19.5 15" 
          stroke="black" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_10602_37010">
          <Rect 
            width="24" 
            height="24" 
            fill="white" 
            transform="matrix(-1 0 0 -1 24 24)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );

  const StarIcon = ({ filled = true }) => (
    <View style={styles.starIcon}>
      <Svg width="18" height="13" viewBox="0 0 45 32" fill="none">
        <Path
          d="M23.6558 11.1753C23.3551 11.1782 23.0611 11.0894 22.8151 10.9213C22.5691 10.7532 22.3835 10.5143 22.2846 10.2383L19.1039 0.936539C19.0027 0.662351 18.8169 0.425233 18.5719 0.2576C18.3268 0.0899667 18.0345 0 17.7348 0C17.4352 0 17.1429 0.0899667 16.8978 0.2576C16.6528 0.425233 16.4669 0.662351 16.3658 0.936539L13.1676 10.2213C13.0686 10.4973 12.883 10.7361 12.637 10.9042C12.391 11.0723 12.097 11.1612 11.7963 11.1582H1.43515C1.13706 11.1514 0.844419 11.2368 0.599511 11.4021C0.354603 11.5675 0.170101 11.8042 0.0726491 12.0782C-0.0226684 12.3514 -0.0242315 12.6473 0.0681953 12.9215C0.160622 13.1957 0.342048 13.4333 0.58523 13.5987L8.99684 19.3867C9.23736 19.5494 9.41755 19.783 9.51067 20.0531C9.60379 20.3231 9.60489 20.6152 9.5138 20.8859L6.30688 30.2388C6.23886 30.4443 6.22285 30.6627 6.26023 30.8755C6.2976 31.0883 6.38725 31.2892 6.52155 31.4611C6.65754 31.6341 6.83348 31.7736 7.03516 31.8683C7.23684 31.963 7.45859 32.0103 7.68253 32.0063C7.98633 32.0051 8.28209 31.9113 8.52807 31.7379L16.8783 25.9925C17.1281 25.8224 17.4256 25.7312 17.7305 25.7312C18.0353 25.7312 18.3329 25.8224 18.5826 25.9925L26.9328 31.7379C27.1788 31.9113 27.4746 32.0051 27.7784 32.0063C28.0023 32.0103 28.2241 31.963 28.4258 31.8683C28.6274 31.7736 28.8034 31.6341 28.9394 31.4611C29.0737 31.2892 29.1633 31.0883 29.2007 30.8755C29.2381 30.6627 29.2221 30.4443 29.154 30.2388L25.9471 20.8944C25.856 20.6237 25.8571 20.3317 25.9502 20.0616C26.0434 19.7916 26.2236 19.5579 26.4641 19.3952L34.8801 13.6285C35.1232 13.4631 35.3047 13.2255 35.3971 12.9513C35.4895 12.6772 35.488 12.3812 35.3926 12.108C35.2952 11.834 35.1107 11.5973 34.8658 11.4319C34.6209 11.2666 34.3282 11.1812 34.0301 11.1881L23.6558 11.1753Z"
          fill={filled ? "#FBBC05" : "white"}
          stroke={filled ? "none" : "black"}
          strokeWidth={filled ? "0" : "0.5"}
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </Svg>
    </View>
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTabChange = (tab) => {
    // Navigate to the selected tab
    switch(tab) {
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'Collection':
        navigation.navigate('Collection');
        break;
      case 'Shop':
        navigation.navigate('Bag');
        break;
      case 'Favourites':
        navigation.navigate('Favourites');
        break;
      case 'Rewards':
        navigation.navigate('Rewards');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const handleCustomBackPress = () => {
    if (navigation) {
      // Check if we came from orders screen via "Buy It Again"
      if (route?.params?.order) {
        navigation.navigate('Orders');
      } else if (route?.params?.previousScreen === 'ProductViewOne' && route?.params?.categoryName) {
        // If coming from ProductViewOne (which came from Home), navigate back to Home with the correct category tab
        console.log('🔙 Navigating back to Home with category:', route.params.categoryName);
        navigation.navigate('Home', { returnToCategory: route.params.categoryName });
      } else if (route?.params?.previousScreen === 'Search') {
        // If coming from Search, navigate to ProductViewOne with the product's subcategory
        const subcategoryId = currentItem?.subCategoryId?._id || 
                             currentItem?.subCategoryId || 
                             productFromRoute?.subCategoryId?._id || 
                             productFromRoute?.subCategoryId;
        const subcategoryName = currentItem?.subCategoryId?.name || 
                               currentItem?.categoryName || 
                               productFromRoute?.subCategoryId?.name || 
                               productFromRoute?.categoryName || 
                               'Products';
        
        console.log('🔙 Navigating to ProductViewOne from Search with:', {
          subcategoryId,
          subcategoryName
        });
        
        if (subcategoryId) {
          navigation.navigate('ProductViewOne', {
            subcategoryId,
            subcategoryName,
            previousScreen: 'Search' // Pass 'Search' instead of 'ProductDetailsMain' to maintain search flow
          });
        } else {
          // Fallback to Collection if no subcategory found
          navigation.navigate('Collection');
        }
      } else if (route?.params?.previousScreen === 'Collection' && route?.params?.activeTab) {
        // If coming from Collection screen with an active tab, navigate back with the tab info
        navigation.navigate('Collection', { returnToTab: route.params.activeTab });
      } else {
        navigation.goBack();
      }
    }
  };

  const renderProductImages = () => {
    const renderImageItem = ({ item, index }) => {
      // Check if the item is a video based on mediaType or file extension
      const isVideo = item.mediaType === 'video' || 
                      item.type === 'video' || 
                      (item.url && (
                        item.url.includes('.mp4') || 
                        item.url.includes('.mov') || 
                        item.url.includes('.avi') ||
                        item.url.includes('.m4v')
                      ));

      return (
        <View style={styles.imageSlide}>
          {item.url ? (
            isVideo ? (
              <Video
                source={{ uri: item.url }}
                style={styles.mainProductImage}
                resizeMode="contain"
                repeat={true}
                muted={true}
                paused={activeImageIndex !== index}
                controls={false}
              />
            ) : (
              <Image 
                source={{ uri: item.url }}
                style={styles.mainProductImage}
                resizeMode="contain"
              />
            )
          ) : (
            <View style={[styles.mainProductImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
      );
    };

    const onImageScroll = (event) => {
      const slideSize = width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      setActiveImageIndex(index);
    };

    // Use API images if available, otherwise show empty state
    const images = currentItem && currentItem.images && currentItem.images.length > 0 
      ? currentItem.images 
      : [];

    return (
      <View style={styles.productImagesContainer}>
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          {images.length > 0 ? (
          <FlatList
            ref={imageSliderRef}
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => item._id || `image-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onImageScroll}
            scrollEventThrottle={16}
            style={styles.imageSlider}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
            windowSize={5}
            getItemLayout={(data, index) => {
              // Safer getItemLayout with additional validation
              const safeIndex = Math.max(0, index || 0);
              return {
                length: width,
                offset: width * safeIndex,
                index: safeIndex,
              };
            }}
          />
          ) : (
            <View style={styles.fallbackImageContainer}>
              <Text style={styles.fallbackImageText}>No images available</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive
              ]}
              onPress={() => {
                if (imageSliderRef.current) {
                  imageSliderRef.current.scrollToIndex({ index, animated: true });
                }
              }}
            />
          ))}
        </View>

        {/* Heart Icon */}
        <AnimatedHeartIcon
          isFavorite={isCurrentProductFavorited}
          onPress={handleFavoriteToggle}
          size={21}
          containerStyle={styles.heartButton}
          style={styles.heartButtonContainer}
          filledColor="#FF0000"
          unfilledColor="#000000"
          animationDuration={400}
          scaleAnimation={true}
          colorTransition={true}
        />
      </View>
    );
  };

  // Render linked products section (below image)
  const renderLinkedProducts = () => {
    // Only show if there are multiple products (more than 1)
    if (!linkedProducts || linkedProducts.length <= 1) {
      return null;
    }

    return (
      <View style={styles.linkedProductsSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.linkedProductsList}
        >
          {linkedProducts
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((variant, index) => {
              // Extract the actual item ID (handle both string and object cases)
              const variantId = typeof variant.itemId === 'object' ? (variant.itemId._id || variant.itemId.id) : variant.itemId;
              const isSelected = variantId === (currentItem?._id || currentItem?.id);
              // Use combination of itemId and index to ensure unique keys
              const uniqueKey = `${variantId}_${index}`;
              
              return (
                <TouchableOpacity
                  key={uniqueKey}
                  style={[
                    styles.linkedProductTile,
                    isSelected && styles.linkedProductTileSelected,
                  ]}
                  onPress={() => handleLinkedProductSelect(variantId)}
                  disabled={linkedProductsLoading}
                >
                  <Image
                    source={{ uri: variant.image }}
                    style={styles.linkedProductImage}
                    resizeMode="cover"
                  />
                  {isSelected && (
                    <View style={styles.linkedProductSelectedBadge} />
                  )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
    );
  };

  const renderProductInfo = () => (
    <View style={styles.productInfoContainer}>
      <View style={styles.productDescription}>
        <Text style={styles.productSubtitle}>
          {currentItem ? currentItem.title : 'Product Title'}
        </Text>
        <Text style={styles.productTitle}>
          {currentItem ? currentItem.productName : 'Product Name'}
        </Text>
      </View>
      
      <View style={styles.priceContainer}>
        {currentItem && formatOriginalPrice(currentItem.sizes) && (
          <Text style={styles.originalPrice}>{formatOriginalPrice(currentItem.sizes)}</Text>
        )}
        <View style={styles.discountedPriceContainer}>
          <View style={styles.redBannerContainer}>
            <RedBannerIcon />
          </View>
          <Text style={styles.discountedPrice}>
            {currentItem ? formatPrice(currentItem.sizes) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* View Product Details and Share Button on same level */}
      <View style={styles.viewDetailsContainer}>
        <TouchableOpacity onPress={() => setShowProductDetails(!showProductDetails)}>
          <Text style={styles.viewDetailsText}>View Product Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <ShareIcon />
        </TouchableOpacity>
      </View>

      {/* Buy Now Button - Always visible, right below View Product Details */}
      <View style={styles.buyNowContainer}>
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={() => {
            setModalActionType('buyNow');
            setShowSizeModal(true);
          }}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Add to Cart Button - Below Buy Now */}
      <View style={styles.addToCartContainer}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => {
            setModalActionType('addToCart');
            setShowSizeModal(true);
          }}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStarRating = () => {
    const rating = currentItem ? currentItem.averageRating || 0 : 0;
    const totalReviews = currentItem ? currentItem.totalReviews || 0 : 0;
    
    return (
      <View style={styles.starRatingContainer}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= rating} />
          ))}
        </View>
        {totalReviews > 0 && (
          <Text style={styles.reviewCount}>
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </Text>
        )}
      </View>
    );
  };

  // Calculate dynamic position for rating indicator based on rating value (1-5)
  const calculateIndicatorPosition = (rating) => {
    if (!rating || rating < 1 || rating > 5) return 0;
    
    // Rating bar total width appears to be around 280px based on current static values
    // Position range: 0px (rating 1) to 280px (rating 5)
    const barWidth = 280;
    const position = ((rating - 1) / 4) * barWidth;
    return Math.round(position);
  };

  // Get rating value from detailed ratings data
  const getRatingValue = (category) => {
    if (!detailedRatings || !detailedRatings.averageRatings) return 2.5; // Default middle value
    
    switch (category.toLowerCase()) {
      case 'size':
        return detailedRatings.averageRatings.size || 2.5;
      case 'comfort':
        return detailedRatings.averageRatings.comfort || 2.5;
      case 'durability':
        return detailedRatings.averageRatings.durability || 2.5;
      default:
        return 2.5;
    }
  };

  const renderRatingBars = () => {
    const sizeRating = getRatingValue('size');
    const comfortRating = getRatingValue('comfort');
    const durabilityRating = getRatingValue('durability');
    
    return (
      <View style={styles.ratingBarsContainer}>
        <View style={styles.ratingCategory}>
          <Text style={styles.ratingCategoryTitle}>Size</Text>
          <View style={styles.ratingBarContainer}>
            <View style={styles.ratingBar} />
            <View style={[styles.ratingIndicator, { left: calculateIndicatorPosition(sizeRating) }]} />
          </View>
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>Fits Small</Text>
            <Text style={styles.ratingLabel}>Run Large</Text>
          </View>
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.ratingCategoryTitle}>Comfort</Text>
          <View style={styles.ratingBarContainer}>
            <View style={styles.ratingBar} />
            <View style={[styles.ratingIndicator, { left: calculateIndicatorPosition(comfortRating) }]} />
          </View>
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>Uncomfortable</Text>
            <Text style={styles.ratingLabel}>Comfortable</Text>
          </View>
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.ratingCategoryTitle}>Durability</Text>
          <View style={styles.ratingBarContainer}>
            <View style={styles.ratingBar} />
            <View style={[styles.ratingIndicator, { left: calculateIndicatorPosition(durabilityRating) }]} />
          </View>
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>Non-Durable</Text>
            <Text style={styles.ratingLabel}>Durable</Text>
          </View>
        </View>
        
        {ratingsLoading && (
          <View style={styles.ratingsLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.ratingsLoadingText}>Loading ratings...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRatingSection = () => {
    // Get real-time ratings data from API
    const averageRating = detailedRatings?.averageRating || 0;
    const totalReviews = detailedRatings?.totalReviews || 0;
    const recommendationPercentage = detailedRatings?.recommendationPercentage || 0;
    
    // Debug logging
    console.log('📊 Rating Section Data:', {
      detailedRatings,
      averageRating,
      totalReviews,
      recommendationPercentage,
      ratingsLoading
    });
    
    // Calculate filled stars based on average rating
    const filledStars = Math.round(averageRating);
    
    return (
      <View style={styles.ratingSectionContainer}>
        <Text style={styles.ratingSectionTitle}>Rating & Reviews</Text>
        
        {ratingsLoading ? (
          <View style={styles.ratingsLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.ratingsLoadingText}>Loading ratings...</Text>
          </View>
        ) : totalReviews === 0 ? (
          <View style={styles.ratingScoresContainer}>
            <View style={styles.leftRatingScore}>
              <Text style={styles.ratingScoreMain}>0.0</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={false} />
                ))}
              </View>
              <TouchableOpacity onPress={() => {
                const productToPass = currentItem || productFromRoute;
                navigation.navigate('ProductDetailsMainReview', {
                  product: productToPass
                });
              }}>
                <Text style={styles.reviewsLink}>0 Reviews</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.rightRatingScore}>
              <Text style={styles.recommendPercent}>0%</Text>
              <Text style={styles.recommendText}>of customer recommend{'\n'}this product</Text>
            </View>
          </View>
        ) : (
          <View style={styles.ratingScoresContainer}>
            <View style={styles.leftRatingScore}>
              <Text style={styles.ratingScoreMain}>{averageRating.toFixed(1)}</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= filledStars} />
                ))}
              </View>
              <TouchableOpacity onPress={() => {
                const productToPass = currentItem || productFromRoute;
                console.log('🚀 Navigating to reviews with product:', productToPass);
                console.log('🚀 Product ID will be:', productToPass?._id || productToPass?.id);
                navigation.navigate('ProductDetailsMainReview', {
                  product: productToPass
                });
              }}>
                <Text style={styles.reviewsLink}>{totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.rightRatingScore}>
              <Text style={styles.recommendPercent}>{Math.round(recommendationPercentage)}%</Text>
              <Text style={styles.recommendText}>of customer recommend{'\n'}this product</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSizeAndFitSection = () => (
    <TouchableOpacity 
      style={styles.expandableSectionContainer}
      onPress={() => toggleSection('sizeAndFit')}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Size and Fit</Text>
        <View style={[styles.sectionArrow, !expandedSections.sizeAndFit && styles.sectionArrowRotated]}>
          <UpArrowIcon />
        </View>
      </View>
      {expandedSections.sizeAndFit && (
        <View style={styles.sectionContent}>
          {renderRatingBars()}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderExpandableSection = (title, section, content) => (
    <TouchableOpacity 
      style={styles.expandableSectionContainer}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.sectionArrow, !expandedSections[section] && styles.sectionArrowRotated]}>
          <UpArrowIcon />
        </View>
      </View>
      {expandedSections[section] && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContentSections = () => (
    <View style={styles.contentContainer}>
      {showProductDetails && (
        <View style={styles.productDetailsContent}>
          <Text style={styles.contentTitle}>Description & Specifications</Text>
          <Text style={styles.contentDescription}>
            {currentItem ? currentItem.description : 'Product description not available.'}
          </Text>

          {renderExpandableSection(
            'Manufacturing Details',
            'manufacturing',
            currentItem ? currentItem.manufacturingDetails : 'Manufacturing details not available.'
          )}

          {renderExpandableSection(
            'Shipping, Return & Exchanges',
            'shipping',
            currentItem ? currentItem.shippingAndReturns : 'Shipping and return information not available.'
          )}
        </View>
      )}

      {/* Size and Fit Section - Always visible */}
      {renderSizeAndFitSection()}

      {/* Rating Section - Always visible */}
      {renderRatingSection()}
    </View>
  );

  const renderProductItem = ({ item }) => {
    // Handle both API items and legacy format
    const productName = item.productName || item.name || 'Product';
    const productPrice = item.sizes ? formatPrice(item.sizes) : (item.price || 'N/A');
    const imageUrl = item.images ? getFirstImage(item.images) : null;

    return (
      <TouchableOpacity style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }}
              style={styles.productImagePlaceholder}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder} />
          )}
          <AnimatedHeartIcon
            isFavorite={isFavorite(item._id || item.id)}
            onPress={async () => {
              const productId = item._id || item.id;
              await toggleFavorite(productId);
            }}
            size={18}
            containerStyle={styles.favoriteButton}
            style={styles.favoriteButtonContainer}
            filledColor="#FF0000"
            unfilledColor="#000000"
            animationDuration={400}
            scaleAnimation={true}
            colorTransition={true}
          />
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Bag', { previousScreen: 'ProductViewOne' })}
          >
            <View style={styles.cartButtonContainer}>
              <ShoppingBagIcon />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productPrice}>{productPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScrollableProductSection = (title, data) => (
    <View style={styles.scrollableProductsContainer}>
      <Text style={styles.scrollableProductsTitle}>{title}</Text>
      {data && data.length > 0 ? (
      <FlatList
        data={data}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => item._id || item.id || `item-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        initialNumToRender={4}
        windowSize={6}
        getItemLayout={(listData, index) => {
          // Safer getItemLayout with additional validation
          const safeIndex = Math.max(0, index || 0);
          const itemLength = 160;
          return {
            length: itemLength,
            offset: itemLength * safeIndex,
            index: safeIndex,
          };
        }}
      />
      ) : (
        <Text style={styles.fallbackImageText}>No products available</Text>
      )}
    </View>
  );

  const renderRelatedProducts = (title) => (
    <View style={styles.relatedProductsContainer}>
      <Text style={styles.relatedProductsTitle}>{title}</Text>
      <View style={styles.relatedProductsRow}>
        {relatedProducts.map((relatedProduct) => (
          <View key={relatedProduct.id} style={styles.relatedProductCard}>
            <View style={styles.relatedProductImage} />
            <Text style={styles.relatedProductName}>{relatedProduct.name}</Text>
            <Text style={styles.relatedProductPrice}>{relatedProduct.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Control Bar Header - matching Figma exactly */}
      <View style={styles.controlBar}>
        <View style={styles.headerButtonContainer}>
          <GlobalBackButton 
            navigation={navigation}
            style={styles.headerButton}
            iconColor="#000000"
            iconSize={24}
            onPress={handleCustomBackPress}
          />
        </View>
        <Text style={styles.headerTitle}>
          {currentItem ? currentItem.productName : 'Product Details'}
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLatestItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      {!loading && !error && currentItem && (
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {/* Product Images */}
          {renderProductImages()}

          {/* Linked Products / Color Variants */}
          {renderLinkedProducts()}

          {/* Product Info */}
          {renderProductInfo()}

          {/* Content Sections */}
          {renderContentSections()}

          {/* Bundle Recommendations - Show bundles for this product */}
          {currentItem && currentItem._id && (
            <BundleRecommendations
              productId={currentItem._id}
              navigation={navigation}
              addToBag={addToBag}
            />
          )}

          {/* Scrollable Product Sections - conditionally rendered */}
          {youMightAlsoLike.length > 0 && renderScrollableProductSection('You Might Also Like', youMightAlsoLike)}
          {similarItems.length > 0 && renderScrollableProductSection('Similar Items', similarItems)}
          {othersAlsoBought.length > 0 && renderScrollableProductSection('Other Also Bought', othersAlsoBought)}
        </ScrollView>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavigationBar 
        activeTab="Home" 
        onTabChange={handleTabChange}
      />

      {/* Size Selection Modal */}
      <SizeSelectionModal
        visible={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        product={currentItem}
        activeSize={activeSize}
        setActiveSize={setActiveSize}
        navigation={navigation}
        actionType={modalActionType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Control Bar (Header)
  controlBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: hp(6.5),
    paddingBottom: hp(1.5),
    gap: wp(2),
  },
  headerButtonContainer: {
    width: isTablet ? wp(10) : wp(17),
    alignItems: 'flex-start',
  },
  headerButton: {
    width: isTablet ? wp(4) : wp(6),
    height: isTablet ? hp(3) : hp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContentContainer: {
    paddingBottom: hp(25),
    paddingHorizontal: 0,
  },

  // Product Images
  productImagesContainer: {
    position: 'relative',
    width: width,
    height: Math.min(width * 1.2, isTablet ? hp(70) : hp(60)),
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  imageContainer: {
    flex: 1,
    width: width,
  },
  imageSlider: {
    flex: 1,
    width: width,
  },
  imageSlide: {
    width: width,
    height: Math.min(width * 1.2, isTablet ? hp(70) : hp(60)),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainProductImage: {
    width: width,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: hp(2),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(2),
  },
  paginationDot: {
    width: isTablet ? wp(1.5) : wp(2),
    height: isTablet ? wp(1.5) : wp(2),
    borderRadius: isTablet ? wp(0.75) : wp(1),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: isTablet ? wp(2) : wp(2.5),
    height: isTablet ? wp(2) : wp(2.5),
    borderRadius: isTablet ? wp(1) : wp(1.25),
  },
  heartButton: {
    position: 'absolute',
    top: hp(2),
    right: wp(4),
    zIndex: 10,
    elevation: 5,
  },
  heartButtonContainer: {
    width: isTablet ? wp(7) : wp(10),
    height: isTablet ? wp(7) : wp(10),
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? wp(3.5) : wp(5),
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
  bagButton: {
    position: 'absolute',
    bottom: hp(6),
    right: wp(3),
  },
  bagButtonContainer: {
    width: isTablet ? wp(6) : wp(8.5),
    height: isTablet ? wp(6) : wp(8.5),
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? wp(3) : wp(4.25),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Linked Products / Variants Section (below image)
  linkedProductsSection: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkedProductsList: {
    flexDirection: 'row',
    gap: wp(3),
    paddingVertical: hp(0.5),
  },
  linkedProductTile: {
    width: isTablet ? wp(12) : wp(17.5),
    height: isTablet ? wp(12) : wp(17.5),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  linkedProductTileSelected: {
    borderColor: '#000000',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  linkedProductImage: {
    width: '100%',
    height: '100%',
  },
  linkedProductSelectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: isTablet ? wp(3) : wp(4),
    height: isTablet ? wp(3) : wp(4),
    backgroundColor: '#000000',
    borderRadius: isTablet ? wp(1.5) : wp(2),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Debug Container
  debugContainer: {
    position: 'absolute',
    top: hp(1.2),
    left: wp(2.5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: wp(2),
    borderRadius: wp(1),
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: fs(10),
    fontFamily: 'Montserrat-Regular',
  },

  // Star Rating
  starRatingContainer: {
    width: '100%',
    paddingVertical: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: wp(1),
    marginBottom: hp(1),
  },

  // Thumbnail Images
  thumbnailContainer: {
    flexDirection: 'row',
    height: isTablet ? hp(18) : hp(15),
    marginTop: 0,
    paddingHorizontal: 0,
    gap: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  thumbnailImage: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  thumbnailImageContent: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  activeThumbnail: {
    borderColor: '#000000',
    borderBottomWidth: 1.5,
    transform: [{ scale: 1 }],
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 1.5,
  },
  thumbnailStrike: {
    position: 'absolute',
    top: '50%',
    left: '33.33%',
    width: 153,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },

  // Product Info
  productInfoContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(4.2),
    paddingBottom: hp(2),
  },
  productDescription: {
    marginBottom: hp(3),
  },
  productSubtitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.4,
    marginBottom: hp(0.7),
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },
  productTitle: {
    fontSize: isTablet ? fs(32) : isSmallDevice ? fs(24) : fs(28),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.168,
    lineHeight: isTablet ? fs(38) : isSmallDevice ? fs(29) : fs(33.6),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    gap: wp(2),
  },
  originalPrice: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    textDecorationLine: 'line-through',
    letterSpacing: -0.5,
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
  },
  discountedPriceContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(2),
  },
  redBannerContainer: {
    position: 'absolute',
    zIndex: 1,
    transform: [{ rotate: '-2.12758deg' }],
  },
  discountedPrice: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.5,
    zIndex: 2,
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  viewDetailsText: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
    textDecorationLine: 'underline',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
  },
  shareButton: {
    padding: 0,
    width: isTablet ? wp(5) : wp(6),
    height: isTablet ? wp(5) : wp(6),
  },
  outOfStockText: {
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
    fontWeight: '500',
    color: '#848688',
    fontFamily: 'Montserrat-Medium',
    position: 'absolute',
    top: hp(-0.4),
    left: wp(37.5),
    lineHeight: isTablet ? fs(17) : isSmallDevice ? fs(12) : fs(14.4),
  },

  // Product Details Content
  productDetailsContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3.6),
    paddingBottom: hp(4),
  },

  // Expandable Sections
  expandableSectionContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.4),
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
  },
  sectionArrow: {
    transform: [{ rotate: '180deg' }],
  },
  sectionArrowRotated: {
    transform: [{ rotate: '0deg' }],
  },
  sectionContent: {
    marginTop: hp(2.4),
  },
  sectionText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: isTablet ? fs(27) : isSmallDevice ? fs(21) : fs(24),
    letterSpacing: -0.384,
  },

  // Rating Bars
  ratingBarsContainer: {
    paddingHorizontal: 0,
    paddingVertical: hp(3),
  },
  ratingCategory: {
    marginBottom: hp(5),
  },
  ratingCategoryTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: hp(1.1),
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },
  ratingBarContainer: {
    position: 'relative',
    height: hp(1.2),
    marginBottom: hp(1.1),
  },
  ratingBar: {
    width: '100%',
    height: hp(0.5),
    backgroundColor: '#E4E4E4',
    position: 'absolute',
    top: hp(0.36),
  },
  ratingIndicator: {
    position: 'absolute',
    width: isTablet ? wp(2) : wp(2.5),
    height: isTablet ? wp(2) : wp(2.5),
    backgroundColor: '#000000',
    borderRadius: isTablet ? wp(1) : wp(1.25),
    top: 0,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.14,
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
  },
  ratingsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  ratingsLoadingText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#007AFF',
    fontFamily: 'Montserrat-Regular',
    marginLeft: wp(2),
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: hp(3),
  },
  noReviewsText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp(1.5),
  },
  beFirstReviewLink: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#007AFF',
    fontFamily: 'Montserrat-Medium',
    textDecorationLine: 'underline',
  },

  // Rating Section
  ratingSectionContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.4),
    paddingBottom: hp(4.8),
    backgroundColor: '#FFFFFF',
    marginBottom: hp(3.6),
  },
  ratingSectionTitle: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
    marginBottom: hp(2.4),
  },
  ratingScoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftRatingScore: {
    alignItems: 'flex-start',
  },
  ratingScoreMain: {
    fontSize: isTablet ? fs(54) : isSmallDevice ? fs(40) : fs(48),
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#000000',
    fontFamily: 'Montserrat-ExtraBold',
    lineHeight: isTablet ? fs(65) : isSmallDevice ? fs(48) : fs(57.6),
    marginBottom: hp(0.5),
  },
  starsContainer: {
    flexDirection: 'row',
    gap: wp(1),
    marginBottom: hp(4.5),
  },
  reviewsLink: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    textDecorationLine: 'underline',
    letterSpacing: -0.35,
  },
  rightRatingScore: {
    alignItems: 'flex-start',
  },
  recommendPercent: {
    fontSize: isTablet ? fs(54) : isSmallDevice ? fs(40) : fs(48),
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#000000',
    fontFamily: 'Montserrat-ExtraBold',
    lineHeight: isTablet ? fs(65) : isSmallDevice ? fs(48) : fs(57.6),
    marginBottom: hp(2),
  },
  recommendText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
    letterSpacing: -0.35,
  },

  // Content
  contentContainer: {
    paddingVertical: hp(3.6),
  },
  contentTitle: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
    marginBottom: hp(4.8),
  },
  contentDescription: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: isTablet ? fs(27) : isSmallDevice ? fs(21) : fs(24),
    letterSpacing: -0.384,
    marginBottom: hp(3.6),
  },
  buyNowContainer: {
    paddingTop: hp(3.8),
    paddingBottom: hp(2),
  },
  buyNowButton: {
    backgroundColor: '#000000',
    borderRadius: wp(25),
    paddingVertical: hp(2),
    paddingHorizontal: wp(12.75),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },
  addToCartContainer: {
    paddingBottom: hp(2),
    paddingTop: 0,
    marginBottom: 0,
  },
  addToCartButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(25),
    paddingVertical: hp(2),
    paddingHorizontal: wp(12.75),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  addToCartText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },

  scrollIndicatorLine: {
    height: hp(0.5),
    backgroundColor: '#E0E0E0',
    marginTop: hp(3),
    marginBottom: hp(1),
    borderRadius: wp(0.5),
  },

  scrollHintText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#999999',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: hp(2),
    letterSpacing: -0.2,
  },

  // Related Products
  relatedProductsContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(4.6),
  },
  relatedProductsTitle: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
    marginBottom: hp(4.6),
  },
  relatedProductsRow: {
    flexDirection: 'row',
    gap: wp(1.5),
  },
  relatedProductCard: {
    flex: 1,
  },
  relatedProductImage: {
    width: isTablet ? wp(42) : wp(61.5),
    height: isTablet ? wp(42) : wp(61.5),
    backgroundColor: '#EEEEEE',
    marginBottom: hp(1.5),
  },
  relatedProductName: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
    letterSpacing: -0.14,
    marginBottom: hp(0.5),
  },
  relatedProductPrice: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
    letterSpacing: -0.14,
  },

  // Scrollable Products Sections
  scrollableProductsContainer: {
    marginBottom: hp(4.6),
    paddingLeft: wp(4),
  },
  scrollableProductsTitle: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(18) : fs(20),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(22) : fs(24),
    marginBottom: hp(4.6),
    paddingRight: wp(4),
  },
  horizontalList: {
    paddingRight: wp(4),
    gap: wp(1.5),
  },
  productCard: {
    width: isTablet ? wp(42) : wp(61.5),
    marginRight: wp(1.5),
  },
  productImageContainer: {
    position: 'relative',
    height: isTablet ? wp(42) : wp(61.5),
    backgroundColor: '#EEEEEE',
    borderRadius: wp(2),
    marginBottom: hp(1.5),
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: wp(2),
  },
  favoriteButton: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
  },
  favoriteButtonContainer: {
    width: isTablet ? wp(6) : wp(8.5),
    height: isTablet ? wp(6) : wp(8.5),
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? wp(3) : wp(4.25),
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
    bottom: hp(1),
    right: wp(2),
  },
  cartButtonContainer: {
    width: isTablet ? wp(6) : wp(8.5),
    height: isTablet ? wp(6) : wp(8.5),
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? wp(3) : wp(4.25),
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
    paddingHorizontal: wp(1),
  },
  productName: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
    letterSpacing: -0.14,
    marginBottom: hp(0.5),
  },
  productPrice: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    lineHeight: isTablet ? fs(19) : isSmallDevice ? fs(14) : fs(16.8),
    letterSpacing: -0.14,
  },

  // Icons
  backIcon: {
    width: isTablet ? wp(5) : wp(6),
    height: isTablet ? wp(5) : wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: isTablet ? wp(2) : wp(2.5),
    height: isTablet ? wp(3.5) : wp(4.25),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    marginRight: wp(0.5),
  },

  searchIcon: {
    width: isTablet ? wp(5) : wp(6),
    height: isTablet ? wp(5) : wp(6),
    position: 'relative',
  },
  searchCircle: {
    position: 'absolute',
    top: hp(0.36),
    left: wp(0.75),
    width: isTablet ? wp(3) : wp(3.5),
    height: isTablet ? wp(3) : wp(3.5),
    borderRadius: isTablet ? wp(1.5) : wp(1.75),
    borderWidth: 1.5,
    borderColor: '#262626',
  },
  searchHandle: {
    position: 'absolute',
    bottom: hp(0.12),
    right: wp(0.25),
    width: wp(1.5),
    height: hp(0.24),
    backgroundColor: '#262626',
    transform: [{ rotate: '45deg' }],
  },

  heartIcon: {
    // Removed, not needed for SVG
  },

  bagIcon: {
    width: isTablet ? wp(4) : wp(4.75),
    height: isTablet ? wp(4) : wp(4.75),
    position: 'relative',
  },
  bagBody: {
    position: 'absolute',
    bottom: 0,
    left: wp(0.5),
    width: isTablet ? wp(3) : wp(3.75),
    height: isTablet ? wp(2.6) : wp(3.25),
    borderWidth: 1,
    borderColor: '#14142B',
    backgroundColor: 'transparent',
  },
  bagHandle: {
    position: 'absolute',
    top: hp(0.12),
    left: wp(1.25),
    width: isTablet ? wp(1.8) : wp(2.25),
    height: isTablet ? wp(1.6) : wp(2),
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#14142B',
    borderTopLeftRadius: wp(1),
    borderTopRightRadius: wp(1),
    backgroundColor: 'transparent',
  },

  shareIcon: {
    width: isTablet ? wp(5) : wp(6),
    height: isTablet ? wp(5) : wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareArrow: {
    width: isTablet ? wp(2) : wp(2.5),
    height: isTablet ? wp(3.5) : wp(4.25),
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#767676',
    transform: [{ rotate: '45deg' }],
  },
  shareBox: {
    position: 'absolute',
    bottom: hp(0.36),
    left: wp(0.75),
    width: isTablet ? wp(3.8) : wp(4.5),
    height: isTablet ? wp(2.4) : wp(3),
    borderWidth: 1.5,
    borderColor: '#767676',
    backgroundColor: 'transparent',
  },

  starIcon: {
    width: isTablet ? wp(4) : wp(4.5),
    height: isTablet ? wp(4) : wp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: isTablet ? wp(3.2) : wp(3.75),
    height: isTablet ? wp(3) : wp(3.5),
    backgroundColor: '#848688',
  },
  starFilled: {
    backgroundColor: '#FBBC05',
  },
  
  // Fallback styles for when images are not available
  fallbackImageContainer: {
    width: '100%',
    height: hp(24),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fallbackImageText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    color: '#999',
  },

  // Loading and Error States
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
    paddingHorizontal: wp(5),
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
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Additional styles for API integration
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },
  inStockText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#28a745',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: hp(1),
  },
  reviewCount: {
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginLeft: wp(2),
  },
});

export default ProductDetailsMain;
