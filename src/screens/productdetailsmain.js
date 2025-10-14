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
} from 'react-native';
import Svg, { Circle, G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import BottomNavigationBar from '../components/bottomnavigationbar';
import SizeSelectionModal from './productdetailsmainsizeselectionchart';
import GlobalBackButton from '../components/GlobalBackButton';
import { apiService } from '../services/apiService';
import { yoraaAPI } from '../services/yoraaAPI';

const { width } = Dimensions.get('window');

const ProductDetailsMain = ({ navigation, route }) => {
  const [activeSize, setActiveSize] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    sizeAndFit: false,
    manufacturing: false,
    shipping: false,
  });
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const imageSliderRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // API-related state management
  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false since we might have product data
  const [error, setError] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  
  // Detailed ratings state
  const [detailedRatings, setDetailedRatings] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

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

  // Product variants data with different images
  const productVariants = [
    {
      id: '1',
      name: 'Nike Everyday Plus Cushioned',
      subtitle: 'Training Crew Socks (3 Pairs)',
      price: 'US$22',
      originalPrice: 'US$10',
      discountedPrice: 'US$10',
      images: [
        { id: '1-1', backgroundColor: '#F5F5F5' },
        { id: '1-2', backgroundColor: '#EEEEEE' },
        { id: '1-3', backgroundColor: '#E8E8E8' },
      ],
      colors: ['#8B4513', '#CD853F', '#F5F5DC'],
      thumbnailColor: '#F0F0F0',
    },
    {
      id: '2',
      name: 'Nike Everyday Max Cushioned',
      subtitle: 'Training Crew Socks (3 Pairs)',
      price: 'US$24',
      originalPrice: 'US$12',
      discountedPrice: 'US$12',
      images: [
        { id: '2-1', backgroundColor: '#DCDCDC' },
        { id: '2-2', backgroundColor: '#D0D0D0' },
        { id: '2-3', backgroundColor: '#C8C8C8' },
      ],
      colors: ['#000000', '#FFFFFF', '#808080'],
      thumbnailColor: '#D8D8D8',
    },
    {
      id: '3',
      name: 'Nike Performance Cushioned',
      subtitle: 'Training Crew Socks (3 Pairs)',
      price: 'US$26',
      originalPrice: 'US$14',
      discountedPrice: 'US$14',
      images: [
        { id: '3-1', backgroundColor: '#E6E6E6' },
        { id: '3-2', backgroundColor: '#E0E0E0' },
        { id: '3-3', backgroundColor: '#DADADA' },
      ],
      colors: ['#FF0000', '#00FF00', '#0000FF'],
      thumbnailColor: '#E3E3E3',
    },
  ];

  // Get current selected product
  const currentProduct = productVariants && productVariants.length > 0 && selectedProductIndex >= 0 && selectedProductIndex < productVariants.length 
    ? productVariants[selectedProductIndex] 
    : productVariants[0] || null;

  // Share function
  const handleShare = async () => {
    try {
      const productName = currentItem ? currentItem.productName : 'Product';
      const productPrice = currentItem ? formatPrice(currentItem.sizes) : 'N/A';
      const message = `Check out this ${productName}\nPrice: ${productPrice}\n\nShop now on Yoraa App!`;
      
      const result = await Share.share({
        message: message,
        title: currentProduct.name,
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
    } catch (error) {
      if (__DEV__) {
        console.error('Error sharing:', error.message);
      }
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

  const HeartIcon = () => (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Circle cx={17} cy={17} r={17} fill="white" />
      <G clipPath="url(#clip0_10455_54515)">
        <Path
          d="M17 24.5L23.9813 17.4188C24.7139 16.6861 25.1255 15.6924 25.1255 14.6563C25.1255 13.6201 24.7139 12.6264 23.9813 11.8938C23.2486 11.1611 22.2549 10.7495 21.2188 10.7495C20.1826 10.7495 19.1889 11.1611 18.4563 11.8938L17 13.25L15.5438 11.8938C14.8111 11.1611 13.8174 10.7495 12.7813 10.7495C11.7451 10.7495 10.7514 11.1611 10.0188 11.8938C9.28612 12.6264 8.87451 13.6201 8.87451 14.6563C8.87451 15.6924 9.28612 16.6861 10.0188 17.4188L17 24.5Z"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_10455_54515">
          <Rect width={20} height={20} fill="white" transform="translate(7 7)" />
        </ClipPath>
      </Defs>
    </Svg>
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
      <Svg width="18" height="18" viewBox="0 0 32 32" fill="none">
        <G clipPath="url(#clip0)">
          <Path
            d="M15.1307 5.88797C15.2673 5.55946 15.7327 5.55945 15.8693 5.88797L17.3899 9.54398C17.4476 9.68248 17.5778 9.77711 17.7273 9.78909L21.6743 10.1055C22.0289 10.134 22.1728 10.5766 21.9025 10.808L18.8954 13.384C18.7815 13.4816 18.7317 13.6347 18.7665 13.7806L19.6852 17.6322C19.7678 17.9782 19.3913 18.2518 19.0877 18.0663L15.7085 16.0024C15.5805 15.9242 15.4195 15.9242 15.2915 16.0024L11.9123 18.0663C11.6087 18.2518 11.2322 17.9782 11.3148 17.6322L12.2335 13.7806C12.2683 13.6347 12.2185 13.4816 12.1046 13.384L9.09746 10.808C8.82724 10.5766 8.97105 10.134 9.32572 10.1055L13.2727 9.78909C13.4222 9.77711 13.5525 9.68248 13.6101 9.54398L15.1307 5.88797Z"
            fill={filled ? "#FBBC05" : "#E5E5E5"}
          />
        </G>
        <Defs>
          <ClipPath id="clip0">
            <Rect width="32" height="32" fill="white"/>
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTabChange = (tabName) => {
    if (navigation) {
      navigation.navigate(tabName);
    }
  };

  const handleCustomBackPress = () => {
    if (navigation) {
      // Check if we came from orders screen via "Buy It Again"
      if (route?.params?.order) {
        navigation.navigate('Orders');
      } else {
        navigation.goBack();
      }
    }
  };

  const handleProductSelection = (index) => {
    if (index !== selectedProductIndex) {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Update the product
        setSelectedProductIndex(index);
        setActiveImageIndex(0);
        
        // Reset to first image when changing product
        if (imageSliderRef.current) {
          imageSliderRef.current.scrollToIndex({ index: 0, animated: false });
        }
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const renderThumbnailImages = () => (
    <View style={styles.thumbnailContainer}>
      {productVariants.map((variant, index) => (
        <TouchableOpacity
          key={variant.id}
          style={[
            styles.thumbnailImage,
            selectedProductIndex === index && styles.activeThumbnail
          ]}
          onPress={() => handleProductSelection(index)}
          activeOpacity={0.7}
        >
          <View 
            style={[
              styles.thumbnailImageContent,
              { backgroundColor: variant.thumbnailColor }
            ]} 
          />
          {selectedProductIndex === index && (
            <View style={styles.selectedIndicator} />
          )}
        </TouchableOpacity>
      ))}
      {/* Strike through effect (keeping original design element) */}
      {/* <View style={styles.thumbnailStrike} /> */}
    </View>
  );

  const renderProductImages = () => {
    const renderImageItem = ({ item, index }) => (
      <View style={styles.imageSlide}>
        {item.url ? (
          <Image 
            source={{ uri: item.url }}
            style={styles.mainProductImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.mainProductImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
    );

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
        <TouchableOpacity style={styles.heartButton}>
          <View style={styles.heartButtonContainer}>
            <HeartIcon />
          </View>
        </TouchableOpacity>

        {/* Shopping Bag Icon */}
        <TouchableOpacity 
          style={styles.bagButton}
          onPress={() => navigation.navigate('Bag', { previousScreen: 'ProductViewOne' })}
        >
          <View style={styles.bagButtonContainer}>
            <ShoppingBagIcon />
          </View>
        </TouchableOpacity>

        {/* AI Try-On Button */}
        <TouchableOpacity 
          style={styles.aiTryOnButton}
          onPress={() => {
            console.log('AI Try-On pressed');
            navigation?.navigate('TryOnProTips', { 
              product: currentProduct,
              previousScreen: 'ProductDetailsMain' 
            });
          }}
        >
          <Text style={styles.aiTryOnButtonText}>Try On</Text>
        </TouchableOpacity>
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

      <View style={styles.viewDetailsContainer}>
        <TouchableOpacity onPress={() => setShowProductDetails(!showProductDetails)}>
          <Text style={styles.viewDetailsText}>View Product Details</Text>
        </TouchableOpacity>
      </View>

      {/* Share Button - positioned according to Figma */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <ShareIcon />
      </TouchableOpacity>

      {/* Stock status based on API data */}
      {currentItem && currentItem.sizes && currentItem.sizes.length > 0 && currentItem.sizes[0].quantity > 0 ? (
        <Text style={styles.inStockText}>In Stock</Text>
      ) : (
        <Text style={styles.outOfStockText}>Out of Stock</Text>
      )}
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

  const renderRatingSection = () => (
    <View style={styles.ratingSectionContainer}>
      <Text style={styles.ratingSectionTitle}>Rating & Reviews</Text>
      
      <View style={styles.ratingScoresContainer}>
        <View style={styles.leftRatingScore}>
          <Text style={styles.ratingScoreMain}>4.5</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= 4} />
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
            <Text style={styles.reviewsLink}>20 Reviews</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightRatingScore}>
          <Text style={styles.recommendPercent}>91%</Text>
          <Text style={styles.recommendText}>of customer recommend{'\n'}this product</Text>
        </View>
      </View>
    </View>
  );

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

          <View style={styles.buyNowContainer}>
            <TouchableOpacity 
              style={styles.buyNowButton}
              onPress={() => setShowSizeModal(true)}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
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
          <TouchableOpacity style={styles.favoriteButton}>
            <View style={styles.favoriteButtonContainer}>
              <HeartIcon />
            </View>
          </TouchableOpacity>
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
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Product Images */}
          {renderProductImages()}

          {/* Star Rating */}
          {renderStarRating()}

          {/* Thumbnail Images */}
          {renderThumbnailImages()}

          {/* Product Info */}
          {renderProductInfo()}

          {/* Content Sections */}
          {renderContentSections()}

          {/* Scrollable Product Sections - conditionally rendered */}
          {youMightAlsoLike.length > 0 && renderScrollableProductSection('You Might Also Like', youMightAlsoLike)}
          {similarItems.length > 0 && renderScrollableProductSection('Similar Items', similarItems)}
          {othersAlsoBought.length > 0 && renderScrollableProductSection('Other Also Bought', othersAlsoBought)}
        </ScrollView>
      )}

      {/* Bottom Navigation */}
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
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    gap: 8,
  },
  headerButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
    lineHeight: 19.2,
  },

  scrollContainer: {
    flex: 1,
  },

  // Product Images
  productImagesContainer: {
    position: 'relative',
    height: 465,
    backgroundColor: '#EEEEEE',
  },
  imageContainer: {
    flex: 1,
  },
  imageSlider: {
    flex: 1,
  },
  imageSlide: {
    width: width,
    height: 465,
  },
  mainProductImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 12,
  },
  heartButtonContainer: {
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagButton: {
    position: 'absolute',
    bottom: 48,
    right: 12,
  },
  bagButtonContainer: {
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTryOnButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -40 }], // Half of button width to center
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  aiTryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },

  // Star Rating
  starRatingContainer: {
    position: 'absolute',
    top: 479,
    left: width / 2 - 48,
    width: 96,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },

  // Thumbnail Images
  thumbnailContainer: {
    flexDirection: 'row',
    height: 123,
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
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 16,
    height: 246,
  },
  productDescription: {
    marginBottom: 24,
  },
  productSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.4,
    marginBottom: 6,
    lineHeight: 19.2,
  },
  productTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.168,
    lineHeight: 33.6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    position: 'absolute',
    top: 106,
    left: 16,
    width: 327,
  },
  originalPrice: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    textDecorationLine: 'line-through',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  discountedPriceContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  redBannerContainer: {
    position: 'absolute',
    zIndex: 1,
    transform: [{ rotate: '-2.12758deg' }],
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.5,
    zIndex: 2,
    lineHeight: 24,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    transform: [{ translateY: -50 }],
  },
  viewDetailsText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat-Medium',
    textDecorationLine: 'underline',
    textAlign: 'center',
    lineHeight: 24,
  },
  shareButton: {
    position: 'absolute',
    right: 16,
    top: 187,
    padding: 0,
    width: 24,
    height: 24,
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#848688',
    fontFamily: 'Montserrat-Medium',
    position: 'absolute',
    top: -3,
    left: 150,
    lineHeight: 14.4,
  },

  // Product Details Content
  productDetailsContent: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 32,
  },

  // Expandable Sections
  expandableSectionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    paddingHorizontal: 16,
    paddingVertical: 37,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 24,
  },
  sectionArrow: {
    transform: [{ rotate: '180deg' }],
  },
  sectionArrowRotated: {
    transform: [{ rotate: '0deg' }],
  },
  sectionContent: {
    marginTop: 20,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 24,
    letterSpacing: -0.384,
  },

  // Rating Bars
  ratingBarsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
  },
  ratingCategory: {
    marginBottom: 42,
  },
  ratingCategoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 9,
    lineHeight: 19.2,
  },
  ratingBarContainer: {
    position: 'relative',
    height: 10,
    marginBottom: 9,
  },
  ratingBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E4E4E4',
    position: 'absolute',
    top: 3,
  },
  ratingIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
    top: 0,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.14,
    lineHeight: 16.8,
  },
  ratingsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ratingsLoadingText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },

  // Rating Section
  ratingSectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  ratingSectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 24,
    marginBottom: 20,
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
    fontSize: 48,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#000000',
    fontFamily: 'Montserrat-ExtraBold',
    lineHeight: 57.6,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 37,
  },
  reviewsLink: {
    fontSize: 14,
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
    fontSize: 48,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#000000',
    fontFamily: 'Montserrat-ExtraBold',
    lineHeight: 57.6,
    marginBottom: 16,
  },
  recommendText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8,
    letterSpacing: -0.35,
  },

  // Content
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 24,
    marginBottom: 40,
  },
  contentDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 24,
    letterSpacing: -0.384,
    marginBottom: 30,
  },
  buyNowContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  buyNowButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2,
  },

  // Related Products
  relatedProductsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 38,
  },
  relatedProductsTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 24,
    marginBottom: 38,
  },
  relatedProductsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  relatedProductCard: {
    flex: 1,
  },
  relatedProductImage: {
    width: 246,
    height: 246,
    backgroundColor: '#EEEEEE',
    marginBottom: 12,
  },
  relatedProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8,
    letterSpacing: -0.14,
    marginBottom: 4,
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },

  // Scrollable Products Sections
  scrollableProductsContainer: {
    marginBottom: 38,
    paddingLeft: 16,
  },
  scrollableProductsTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 24,
    marginBottom: 38,
    paddingRight: 16,
  },
  horizontalList: {
    paddingRight: 16,
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
    borderRadius: 8,
    marginBottom: 12,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteButtonContainer: {
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
    bottom: 8,
    right: 8,
  },
  cartButtonContainer: {
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
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8,
    letterSpacing: -0.14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8,
    letterSpacing: -0.14,
  },

  // Icons
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

  searchIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  searchCircle: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#262626',
  },
  searchHandle: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 6,
    height: 2,
    backgroundColor: '#262626',
    transform: [{ rotate: '45deg' }],
  },

  heartIcon: {
    // Removed, not needed for SVG
  },

  bagIcon: {
    width: 19,
    height: 19,
    position: 'relative',
  },
  bagBody: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 15,
    height: 13,
    borderWidth: 1,
    borderColor: '#14142B',
    backgroundColor: 'transparent',
  },
  bagHandle: {
    position: 'absolute',
    top: 1,
    left: 5,
    width: 9,
    height: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#14142B',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'transparent',
  },

  shareIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareArrow: {
    width: 10,
    height: 17,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#767676',
    transform: [{ rotate: '45deg' }],
  },
  shareBox: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    width: 18,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#767676',
    backgroundColor: 'transparent',
  },

  starIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: 15,
    height: 14,
    backgroundColor: '#848688',
  },
  starFilled: {
    backgroundColor: '#FBBC05',
  },
  
  // Fallback styles for when images are not available
  fallbackImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fallbackImageText: {
    fontSize: 16,
    color: '#999',
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

  // Additional styles for API integration
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },
  inStockText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },
});

export default ProductDetailsMain;
