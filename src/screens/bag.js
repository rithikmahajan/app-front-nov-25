import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  LayoutAnimation,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import Config from 'react-native-config';
import BottomNavigationBar from '../components/bottomnavigationbar';
import BagQuantitySelectorModalOverlay from './bagquantityselectormodaloverlay';
import BagSizeSelectorModalOverlay from './bagsizeselectormodaloverlay';
import BagSizeSelectorSizeChart from './bagsizeselectorsizechart';

import { useBag } from '../contexts/BagContext';
import { useAddress } from '../contexts/AddressContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { apiService } from '../services/apiService';
import { yoraaAPI } from '../services/yoraaAPI';
import RazorpayCheckout from 'react-native-razorpay';
import { 
  validateCart, 
  formatCartItemForAPI, 
  debugCart, 
  getItemPrice 
} from '../utils/skuUtils';
import {
  VisaIcon,
  MasterCardIcon,
  AmexIcon,
  PayPalIcon,
  DiscoverIcon,
  GooglePayIcon,
  ApplePayIcon,
  DinersIcon,
  UnionPayIcon,
  JCBIcon,
  MetroIcon,
  MaestroIcon,
  CaretDownIcon,
  BackIcon
} from '../assets/icons';

// Helper function to get first image URL
const getFirstImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  return images[0]?.url || null;
};

// SwipeableBagItem Component - with swipe-to-delete functionality using PanResponder
const SwipeableBagItem = React.memo(({ item, index, onOpenQuantityModal, onOpenSizeModal, onRemoveItem }) => {
  const translateX = useMemo(() => new Animated.Value(0), []);
  const deleteButtonWidth = 100; // Width of the delete button

  const handleQuantityPress = useCallback(() => {
    onOpenQuantityModal(item, index);
  }, [item, index, onOpenQuantityModal]);

  const handleSizePress = useCallback(() => {
    onOpenSizeModal(item, index);
  }, [item, index, onOpenSizeModal]);

  const handleRemovePress = useCallback(() => {
    // Animate back to original position first
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onRemoveItem(item.id, index);
    });
  }, [item.id, index, onRemoveItem, translateX]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes with minimal vertical movement
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Set the current value as offset so animation doesn't jump
      translateX.setOffset(translateX._value);
      translateX.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only allow left swipe (negative values)
      const newValue = Math.min(0, gestureState.dx);
      translateX.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Flatten the offset
      translateX.flattenOffset();
      
      const { dx, vx } = gestureState;
      
      // Determine if we should reveal the delete button or snap back
      const shouldReveal = dx < -50 || vx < -0.5;
      
      Animated.spring(translateX, {
        toValue: shouldReveal ? -deleteButtonWidth : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    },
  }), [translateX, deleteButtonWidth]);

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button (hidden behind the item) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleRemovePress}
          accessibilityLabel={`Delete ${item.name} from bag`}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Item Content */}
      <Animated.View 
        style={[
          styles.productContainer,
          styles.swipeableItem,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.productRow}>
          <View style={styles.productImageContainer}>
            {getFirstImage(item.images) ? (
              <Image
                source={{ uri: getFirstImage(item.images) }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>IMG</Text>
              </View>
            )}
          </View>
          <View style={styles.productDetailsContainer}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
            </View>
          </View>
        </View>
        <View style={styles.productActionsContainer}>
          <TouchableOpacity 
            style={styles.quantityContainer}
            onPress={handleQuantityPress}
            accessibilityLabel={`Change quantity for ${item.name}`}
          >
            <Text style={styles.quantityText}>Qty {item.quantity}</Text>
            <CaretDownIcon width={24} height={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sizeContainer}
            onPress={handleSizePress}
            accessibilityLabel={`Change size for ${item.name}`}
          >
            <Text style={styles.sizeText}>{item.size}</Text>
            <CaretDownIcon width={24} height={24} color="#000000" />
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            {(() => {
              const priceInfo = getItemPrice(item);
              if (priceInfo.type === 'sale' && priceInfo.originalPrice > 0) {
                return (
                  <>
                    <Text style={styles.originalPrice}>₹{priceInfo.originalPrice.toFixed(2)}</Text>
                    <Text style={styles.salePrice}>₹{priceInfo.price.toFixed(2)}</Text>
                  </>
                );
              } else if (priceInfo.type === 'regular' || priceInfo.type === 'sale') {
                return <Text style={styles.price}>₹{priceInfo.price.toFixed(2)}</Text>;
              } else {
                return <Text style={styles.price}>₹0.00</Text>;
              }
            })()}
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

// PromoCodeItem Component - Individual promo code card
const PromoCodeItem = React.memo(({ promoCode, onApplyPromo, isSelected }) => {
  const handleApplyPress = useCallback(() => {
    onApplyPromo?.(promoCode);
  }, [onApplyPromo, promoCode]);

  // Format discount display
  const getDiscountDisplay = () => {
    if (promoCode.discountType === 'percentage') {
      return `${promoCode.discountValue}% OFF`;
    } else if (promoCode.discountType === 'fixed') {
      return `₹${promoCode.discountValue} OFF`;
    }
    return 'DISCOUNT';
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.voucherContainer}>
      <View style={[styles.voucherCard, isSelected && styles.voucherCardSelected]}>
        {/* Main voucher background with perforated edges */}
        <View style={styles.voucherShape}>
          {/* Voucher content */}
          <View style={styles.voucherContent}>
            <Text style={styles.voucherTitle}>{getDiscountDisplay()}</Text>
            <Text style={styles.voucherCode}>{promoCode.code}</Text>
            <Text style={styles.voucherDate}>
              {promoCode.description || `Min. order ₹${promoCode.minOrderValue || 0}`}
            </Text>
            {promoCode.validUntil && (
              <Text style={styles.voucherExpiry}>
                Valid until {formatDate(promoCode.validUntil)}
              </Text>
            )}
          </View>
          
          {/* Dashed divider line */}
          <View style={styles.voucherDivider} />
          
          {/* Apply button */}
          <TouchableOpacity 
            style={[
              styles.voucherApplyButton,
              isSelected && styles.voucherApplyButtonSelected
            ]}
            onPress={handleApplyPress}
            accessibilityLabel={`Apply ${promoCode.code} discount`}
          >
            <Text style={[
              styles.voucherApplyText,
              isSelected && styles.voucherApplyTextSelected
            ]}>
              {isSelected ? 'Applied' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Left semicircle cutout */}
        <View style={styles.voucherLeftCutout} />
        {/* Right semicircle cutout */}
        <View style={styles.voucherRightCutout} />
      </View>
    </View>
  );
});

// PromoCodeSection Component - Displays available promo codes
const PromoCodeSection = React.memo(({ promoCodes, onApplyPromo, onRetryFetch }) => {
  if (promoCodes.loading) {
    return (
      <View style={styles.promoLoadingContainer}>
        <Text style={styles.promoLoadingText}>Loading available offers...</Text>
      </View>
    );
  }

  if (promoCodes.error) {
    return (
      <View style={styles.promoErrorContainer}>
        <Text style={styles.promoErrorText}>{promoCodes.error}</Text>
        <TouchableOpacity onPress={onRetryFetch} style={styles.promoRetryButton}>
          <Text style={styles.promoRetryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!promoCodes.available || promoCodes.available.length === 0) {
    return (
      <View style={styles.promoEmptyContainer}>
        <Text style={styles.promoEmptyText}>No promo codes available right now</Text>
        <Text style={styles.promoEmptySubtext}>Check back later for new offers!</Text>
      </View>
    );
  }

  return (
    <View style={styles.promoCodesContainer}>
      {promoCodes.available.map((promoCode, index) => (
        <PromoCodeItem
          key={promoCode.id || promoCode.code || index}
          promoCode={promoCode}
          onApplyPromo={onApplyPromo}
          isSelected={promoCodes.selectedCode?.code === promoCode.code}
        />
      ))}
    </View>
  );
});

const BagScreen = ({ navigation, route }) => {
  // Use BagContext instead of local state
  const { bagItems, removeFromBag, updateQuantity, updateSize, getTotalPrice, clearBag, loadBagFromAPI, validateAndCleanCart } = useBag();
  const { selectedAddress, selectAddress } = useAddress();
  
  // Currency context for location-based pricing
  const { 
    currentLocation, 
    deliveryOptions, 
    isDomestic, 
    formatPrice: formatCurrencyPrice,
    convertProduct,
    isLoading: currencyLoading 
  } = useCurrencyContext();
  
  // Keep local state for UI modals and other non-bag functionality  
  const [modalStates, setModalStates] = useState({
    promoCodeExpanded: false,
    pointsApplied: false,
    quantityModalVisible: false,
    sizeModalVisible: false,
    sizeChartModalVisible: false,
  });

  // OPTIMIZATION: Add payment loading state for better UX
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [, setLoadingProducts] = useState(false);
  
  // Points state
  const [userPoints, setUserPoints] = useState({
    available: 0,
    loading: false,
    error: null
  });

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState({
    available: [],
    loading: false,
    error: null,
    selectedCode: null
  });

  // Function to fetch product details for dynamic sizes and quantities
  const fetchProductDetails = useCallback(async (productId) => {
    if (productDetails[productId]) {
      return productDetails[productId]; // Return cached data
    }

    try {
      setLoadingProducts(true);
      const response = await apiService.getItemById(productId);
      if (response.success && response.data) {
        const product = response.data;
        setProductDetails(prev => ({
          ...prev,
          [productId]: product
        }));
        return product;
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoadingProducts(false);
    }
    return null;
  }, [productDetails]);

  // Function to fetch user points
  const fetchUserPoints = useCallback(async () => {
    try {
      setUserPoints(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if user is authenticated
      if (!yoraaAPI.isAuthenticated()) {
        console.log('User not authenticated, skipping points fetch');
        setUserPoints({ available: 0, loading: false, error: null });
        return;
      }

      const pointsData = await yoraaAPI.getUserPoints();
      
      // The API might return different structures, handle various formats
      let availablePoints = 0;
      
      if (typeof pointsData === 'number') {
        availablePoints = pointsData;
      } else if (pointsData) {
        availablePoints = pointsData.points || 
                         pointsData.available || 
                         pointsData.totalPoints || 
                         pointsData.balance || 
                         0;
      }
      
      setUserPoints({
        available: availablePoints,
        loading: false,
        error: null
      });
      
      console.log('✅ User points fetched:', availablePoints);
    } catch (error) {
      console.error('❌ Error fetching user points:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to fetch points';
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage = 'Please log in to view points';
      } else if (error.message.includes('404')) {
        errorMessage = 'Points service unavailable';
      } else if (error.message.includes('Network') || error.message.includes('connection')) {
        errorMessage = 'Check internet connection';
      }
      
      setUserPoints(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // Function to fetch available promo codes
  const fetchPromoCodes = useCallback(async () => {
    try {
      setPromoCodes(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if user is authenticated (some promo codes might be user-specific)
      const isAuthenticated = yoraaAPI.isAuthenticated();
      console.log('🎟️ Fetching promo codes, user authenticated:', isAuthenticated);

      const promoData = await yoraaAPI.getAvailablePromoCodes();
      
      // Handle different response formats
      let availableCodes = [];
      
      if (promoData && promoData.data) {
        availableCodes = Array.isArray(promoData.data) ? promoData.data : [];
      } else if (Array.isArray(promoData)) {
        availableCodes = promoData;
      }
      
      setPromoCodes({
        available: availableCodes,
        loading: false,
        error: null,
        selectedCode: null
      });
      
      console.log('✅ Promo codes fetched:', availableCodes.length, 'codes available');
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to fetch promo codes';
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage = 'Please log in to view personalized offers';
      } else if (error.message.includes('404')) {
        errorMessage = 'No promo codes available';
      } else if (error.message.includes('Network') || error.message.includes('connection')) {
        errorMessage = 'Check internet connection';
      }
      
      setPromoCodes(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // UNIFIED: Dynamic calculations that match Razorpay checkout amounts
  const dynamicPricing = useMemo(() => {
    console.log('💰 Recalculating dynamic pricing with currency:', currentLocation.currency);
    
    // Base subtotal from cart items (already converted by getItemPrice in SwipeableBagItem)
    const itemsSubtotal = getTotalPrice();
    
    // Dynamic delivery charges - SET TO FREE
    let totalDeliveryCharge = 0; // Always free delivery
    
    // Calculate promo discount dynamically
    let promoDiscount = 0;
    if (promoCodes.selectedCode && itemsSubtotal > 0) {
      const selectedPromo = promoCodes.selectedCode;
      const baseAmount = itemsSubtotal + totalDeliveryCharge; // Apply promo to subtotal + delivery
      
      if (selectedPromo.discountType === 'percentage') {
        promoDiscount = (baseAmount * selectedPromo.discountValue) / 100;
      } else if (selectedPromo.discountType === 'fixed') {
        promoDiscount = selectedPromo.discountValue;
      }
      
      // Apply max discount limit if specified
      if (selectedPromo.maxDiscountAmount && promoDiscount > selectedPromo.maxDiscountAmount) {
        promoDiscount = selectedPromo.maxDiscountAmount;
      }
      
      // Ensure promo discount doesn't exceed the base amount
      promoDiscount = Math.min(promoDiscount, baseAmount);
    }
    
    // Calculate points discount dynamically (applied after promo discount)
    const baseForPointsDiscount = itemsSubtotal + totalDeliveryCharge - promoDiscount;
    const pointsDiscount = modalStates.pointsApplied && baseForPointsDiscount > 0 
      ? Math.min(baseForPointsDiscount * 0.1, userPoints.available * 0.01) // 10% or available points value
      : 0;
    
    // Final total calculation
    const finalTotal = Math.max(0, itemsSubtotal + totalDeliveryCharge - promoDiscount - pointsDiscount);
    
    // Currency-aware formatting
    return {
      itemsSubtotal,
      totalDeliveryCharge,
      promoDiscount,
      pointsDiscount,
      finalTotal,
      
      // For display purposes with currency formatting
      deliveryLabel: 'Delivery',
      deliveryValue: 'FREE', // Always show free delivery
      promoLabel: promoCodes.selectedCode ? `Promo (${promoCodes.selectedCode.code})` : 'Promo',
      promoValue: promoDiscount > 0 ? `-${formatCurrencyPrice(promoDiscount)}` : formatCurrencyPrice(0),
      pointsLabel: 'Points Discount',
      pointsValue: pointsDiscount > 0 ? `-${formatCurrencyPrice(pointsDiscount)}` : formatCurrencyPrice(0),
      totalLabel: 'Total',
      totalValue: formatCurrencyPrice(finalTotal),
      
      // For validation and API
      isValid: bagItems.length > 0 && itemsSubtotal > 0,
      itemCount: bagItems.length,
      razorpayAmount: isDomestic 
        ? Math.round(finalTotal * 100) // Convert to paise for Indian Razorpay
        : Math.round(finalTotal), // Keep as dollars for international
      totalAmountForAPI: finalTotal, // For backend API calls
      currency: currentLocation.currency,
      isDomestic
    };
  }, [
    bagItems, 
    getTotalPrice, 
    promoCodes.selectedCode, 
    modalStates.pointsApplied, 
    userPoints.available,
    currentLocation,
    isDomestic,
    formatCurrencyPrice
  ]);

  // For backward compatibility, keep bagCalculations but use dynamicPricing values
  const bagCalculations = useMemo(() => ({
    subtotal: dynamicPricing.itemsSubtotal.toFixed(2),
    shipping: dynamicPricing.totalDeliveryCharge.toFixed(2),
    tax: '0.00', // No separate tax for now
    discount: (dynamicPricing.promoDiscount + dynamicPricing.pointsDiscount).toFixed(2),
    total: dynamicPricing.finalTotal.toFixed(2),
    itemCount: dynamicPricing.itemCount,
    isValid: dynamicPricing.isValid,
    totalAmount: dynamicPricing.totalAmountForAPI
  }), [dynamicPricing]);

  // Dynamic price breakdown for UI display
  const priceBreakdown = useMemo(() => ({
    delivery: 'FREE', // Always show free delivery
    internationalDelivery: isDomestic 
      ? 'Domestic - FREE'
      : 'International - FREE', // Changed to free
    promo: dynamicPricing.promoValue,
    pointsDiscount: dynamicPricing.pointsValue,
    total: dynamicPricing.totalValue,
    
    // Additional breakdown for detailed display
    itemsSubtotal: formatCurrencyPrice(dynamicPricing.itemsSubtotal),
    deliveryCharge: 'FREE',
    totalSavings: dynamicPricing.promoDiscount + dynamicPricing.pointsDiscount > 0 
      ? formatCurrencyPrice(dynamicPricing.promoDiscount + dynamicPricing.pointsDiscount)
      : formatCurrencyPrice(0)
  }), [dynamicPricing, isDomestic, formatCurrencyPrice]);

  // Debug effect to log pricing changes
  useEffect(() => {
    console.log('💰 DYNAMIC PRICING UPDATE:', {
      itemsSubtotal: dynamicPricing.itemsSubtotal,
      deliveryCharge: dynamicPricing.totalDeliveryCharge,
      promoDiscount: dynamicPricing.promoDiscount,
      pointsDiscount: dynamicPricing.pointsDiscount,
      finalTotal: dynamicPricing.finalTotal,
      displayTotal: dynamicPricing.totalValue,
      razorpayAmount: dynamicPricing.razorpayAmount,
      appliedPromo: promoCodes.selectedCode?.code || 'None',
      pointsApplied: modalStates.pointsApplied,
      deliveryOptions: deliveryOptions.length
    });
  }, [dynamicPricing, promoCodes.selectedCode, modalStates.pointsApplied, deliveryOptions]);

  // Effect for handling navigation params
  useEffect(() => {
    if (route?.params?.updatedItem) {
      const { updatedItem } = route.params;
      // Use context function to update specific item
      updateQuantity(updatedItem.id, updatedItem.size, updatedItem.quantity);
    }
    
    // Handle returning from delivery options with selected address
    if (route?.params?.selectedAddress) {
      const { selectedAddress: newAddress } = route.params;
      console.log('🏠 Address selected from delivery options:', newAddress);
      
      // Update the selected address in context
      if (selectAddress) {
        selectAddress(newAddress);
      }
      
      // Clear the navigation params to prevent reprocessing
      navigation.setParams({ selectedAddress: undefined });
      
      // Automatically proceed to checkout with the new address
      setTimeout(() => {
        handleCheckout();
      }, 500);
    }
  }, [route?.params, updateQuantity, navigation, handleCheckout, selectAddress]);

  // Effect to fetch user points on component mount
  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  // Effect to fetch promo codes on component mount
  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  // Effect to handle cart validation and refresh when requested
  useEffect(() => {
    const handleCartRefresh = async () => {
      if (route?.params?.refresh || route?.params?.forceReload) {
        console.log('🔄 Cart refresh requested');
        
        try {
          const result = await validateAndCleanCart();
          
          if (!result.valid && result.removedItems.length > 0) {
            Alert.alert(
              'Cart Updated',
              result.message,
              [{ text: 'OK' }]
            );
          } else {
            // Force reload from backend
            await loadBagFromAPI();
          }
        } catch (error) {
          console.error('Error refreshing cart:', error);
        }
        
        // Clear the params to prevent repeated refreshes
        navigation.setParams({ refresh: false, forceReload: false });
      }
    };
    
    handleCartRefresh();
  }, [route?.params?.refresh, route?.params?.forceReload, validateAndCleanCart, loadBagFromAPI, navigation]);

  // Enhanced navigation handlers
  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  // Redirect to empty bag screen if no items (only when coming from home screen)
  useEffect(() => {
    if (bagItems.length === 0 && 
        route?.params?.previousScreen !== 'BagContent' && 
        !route?.params?.forceShowContent) {
      navigation.navigate('bagemptyscreen');
    }
  }, [bagItems.length, navigation, route?.params?.previousScreen, route?.params?.forceShowContent]);



  // Pre-checkout validation function using dynamic pricing
  const validateCheckoutData = useCallback(() => {
    // Validate cart using utility functions
    const cartValidation = validateCart(bagItems);
    
    if (!cartValidation.isValid) {
      console.error('❌ Cart validation failed:', cartValidation.invalidItems);
      Alert.alert(
        'Cart Issues Found',
        `${cartValidation.invalidItems.length} items in your cart have issues. Please check your cart and try again.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Debug cart information in development
    if (__DEV__) {
      debugCart(bagItems);
    }
    
    // Use dynamic pricing for total amount (ensures UI and Razorpay match)
    const enhancedValidation = {
      ...cartValidation,
      totalAmount: dynamicPricing.totalAmountForAPI,
      displayTotal: dynamicPricing.totalValue,
      razorpayAmount: dynamicPricing.razorpayAmount,
      breakdown: {
        itemsSubtotal: dynamicPricing.itemsSubtotal,
        deliveryCharge: dynamicPricing.totalDeliveryCharge,
        promoDiscount: dynamicPricing.promoDiscount,
        pointsDiscount: dynamicPricing.pointsDiscount,
        finalTotal: dynamicPricing.finalTotal
      }
    };
    
    console.log('✅ Enhanced checkout validation passed:', {
      totalItems: enhancedValidation.totalItems,
      totalAmount: enhancedValidation.totalAmount,
      displayTotal: enhancedValidation.displayTotal,
      breakdown: enhancedValidation.breakdown
    });
    
    return enhancedValidation;
  }, [bagItems, dynamicPricing]);

  // Updated function to create Razorpay order (matches backend implementation)
  const createRazorpayOrder = useCallback(async () => {
    try {
      console.log('🔍 Creating Razorpay order with bag items:', bagItems);
      console.log('🔍 Selected address:', selectedAddress);

      // Check if we have items and address
      if (!bagItems || bagItems.length === 0) {
        Alert.alert('Empty Cart', 'Please add items to your cart before proceeding with payment.');
        return null;
      }

      if (!selectedAddress) {
        Alert.alert('Address Required', 'Please select a delivery address to continue.');
        return null;
      }

      // Validate cart data before proceeding
      const cartValidation = validateCheckoutData();
      if (!cartValidation) {
        return null; // Validation failed, user was alerted
      }

      // Use the enhanced validated total amount that matches UI display
      const totalAmount = cartValidation.totalAmount;
      const razorpayAmount = cartValidation.razorpayAmount;
      console.log('🔍 Using enhanced validated amounts:', {
        totalAmount,
        razorpayAmount,
        displayTotal: cartValidation.displayTotal,
        breakdown: cartValidation.breakdown
      });
      console.log('🛒 Original bagItems structure:', bagItems);

      // Format cart items for backend using utility function
      const formattedCart = bagItems.map((bagItem, index) => formatCartItemForAPI(bagItem, index));
      
      console.log('� Formatted cart for backend:', formattedCart);

      // Format address for backend (updated to match backend expectations)
      const formattedAddress = {
        firstName: selectedAddress.firstName || selectedAddress.name?.split(' ')[0] || 'Customer',
        lastName: selectedAddress.lastName || selectedAddress.name?.split(' ').slice(1).join(' ') || '',
        address: selectedAddress.address || selectedAddress.addressLine1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country || 'India',
        pinCode: selectedAddress.pinCode || selectedAddress.zipCode,
        phoneNumber: selectedAddress.phoneNumber || selectedAddress.phone
      };

      // Prepare order data for single API call (backend handles both order and Razorpay)
      const orderData = {
        amount: totalAmount, // Amount in rupees (not paise) - backend handles conversion
        cart: formattedCart,
        staticAddress: formattedAddress
      };

      console.log('📤 Sending Razorpay order data:', orderData);

      // Single API call that creates both order and Razorpay order
      let response;
      try {
        response = await apiService.post('/razorpay/create-order', orderData);
      } catch (apiServiceError) {
        console.warn('apiService failed, trying yoraaAPI as fallback:', apiServiceError.message);
        response = await yoraaAPI.makeRequest('/api/razorpay/create-order', 'POST', orderData, true);
      }

      if (response && response.id) {
        // Backend returns standard Razorpay response format
        console.log('✅ Razorpay order created successfully:', response);
        
        // Initialize Razorpay payment
        await initializeRazorpayPayment(response, formattedAddress);
        return response;
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to create Razorpay order';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      
      // Handle specific backend errors
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.message && error.message.includes('Invalid SKU')) {
        errorMessage = 'There was an issue with one of your cart items. Please remove and re-add the items to your cart.';
      } else if (error.message && error.message.includes('status code 400')) {
        errorMessage = 'Invalid order data. Please check your cart items and delivery address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Order Error', errorMessage);
      return null;
    }
  }, [bagItems, selectedAddress, initializeRazorpayPayment, validateCheckoutData]);

  // Function to initialize Razorpay payment (UPDATED - Environment-aware)
  const initializeRazorpayPayment = useCallback(async (razorpayOrder, address) => {
    try {
      console.log('💳 Initializing Razorpay payment with order:', razorpayOrder);

      // Priority: Environment variable > Auto-detect based on __DEV__
      const razorpayKey = Config.RAZORPAY_KEY_ID || (__DEV__ ? 'rzp_test_9WNhUijdgxSon5' : 'rzp_live_VRU7ggfYLI7DWV');
      
      console.log('🔑 Razorpay mode:', __DEV__ ? 'TEST' : 'LIVE');
      console.log('🔑 From environment:', !!Config.RAZORPAY_KEY_ID);
      console.log('🔑 Using Razorpay key:', razorpayKey);

      const options = {
        description: 'Order Payment',
        image: 'https://your-app-logo.com/logo.png', // Replace with actual logo URL
        currency: razorpayOrder.currency,
        key: razorpayKey,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        name: 'Yoraa',
        prefill: {
          email: 'customer@yoraa.com', // Replace with actual user email if available
          contact: address.phoneNumber,
          name: `${address.firstName} ${address.lastName}`
        },
        theme: { color: '#000000' }
      };

      console.log('🚀 Opening Razorpay with options:', options);

      try {
        const paymentResponse = await RazorpayCheckout.open(options);
        console.log('✅ Payment successful:', paymentResponse);
        
        // Verify payment with backend
        await verifyPayment(paymentResponse);
        
      } catch (paymentError) {
        console.log('❌ Payment error/cancelled:', paymentError);
        
        // Handle payment cancellation vs error with Skip option
        if (paymentError.code === 'PAYMENT_CANCELLED') {
          Alert.alert(
            'Payment Cancelled', 
            'Your payment was cancelled. Would you like to try again or continue shopping?',
            [
              { 
                text: 'Continue Shopping', 
                style: 'cancel',
                onPress: () => {
                  console.log('User chose to continue shopping');
                  // User can continue using the app
                }
              },
              { 
                text: 'Retry Payment', 
                onPress: () => initializeRazorpayPayment(razorpayOrder, address) 
              }
            ]
          );
        } else {
          Alert.alert(
            'Payment Failed', 
            'There was an issue processing your payment. You can retry or continue shopping.',
            [
              { 
                text: 'Continue Shopping', 
                style: 'cancel',
                onPress: () => {
                  console.log('User chose to skip payment and continue shopping');
                  // User can continue using the app without completing payment
                }
              },
              { 
                text: 'Retry Payment', 
                onPress: () => initializeRazorpayPayment(razorpayOrder, address) 
              }
            ]
          );
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing Razorpay payment:', error);
      Alert.alert('Payment Error', 'Order created but payment initialization failed. Please contact support.');
      return null;
    }
  }, [verifyPayment]);

  // Function to verify payment (OPTIMIZED - PARALLEL API CALLS)
  const verifyPayment = useCallback(async (paymentResponse) => {
    try {
      console.log('🔍 Verifying payment (OPTIMIZED):', paymentResponse);
      
      const verificationData = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      };

      console.log('📤 Sending verification data (parallel calls):', verificationData);

      // OPTIMIZATION: Parallel API calls instead of sequential
      const apiCalls = [
        apiService.post('/razorpay/verify-payment', verificationData).catch(err => ({ error: err, source: 'apiService' })),
        yoraaAPI.makeRequest('/razorpay/verify-payment', 'POST', verificationData, true).catch(err => ({ error: err, source: 'yoraaAPI' }))
      ];

      console.log('⚡ Making parallel API calls for faster verification...');
      const results = await Promise.allSettled(apiCalls);
      
      console.log('📊 API Results:', results.map(r => ({
        status: r.status,
        success: r.value?.success,
        source: r.value?.source,
        hasError: !!r.value?.error
      })));

      // Find first successful response
      let response = null;
      let errorDetails = null;

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value?.success) {
          response = result.value;
          console.log('✅ Found successful response from:', result.value.source || 'unknown');
          break;
        } else if (result.status === 'fulfilled' && result.value?.error) {
          if (!errorDetails) {
            errorDetails = result.value.error;
          }
        }
      }

      // If no successful response, collect error details
      if (!response) {
        const errors = results.map(r => r.value?.error || r.reason).filter(Boolean);
        errorDetails = errors[0] || 'All verification attempts failed';
        console.error('🚨 All API calls failed:', errors);
      }

      if (response && response.success) {
        // Handle different success scenarios based on Shiprocket integration
        if (response.awbCode && response.awbCode !== "AWB generation failed") {
          // Full success: Payment + Shiprocket + AWB
          handleOrderSuccess(response);
        } else if (response.shiprocketOrderId) {
          // Payment success but AWB generation pending
          handleOrderPartialSuccess(response);
        } else {
          // Payment success but shipping integration failed
          handleOrderWithShippingIssues(response);
        }
        
        // Clear the bag after successful payment verification
        clearBag();
      } else {
        // Enhanced error handling for better user experience
        const isSignatureError = errorDetails?.message?.includes('signature') || 
                                 errorDetails?.includes('signature') ||
                                 (typeof errorDetails === 'string' && errorDetails.includes('signature'));
        
        if (isSignatureError) {
          // Signature verification failed - payment likely went through but backend can't verify
          console.log('🔒 Signature verification failed - payment may have been processed');
          
          Alert.alert(
            'Payment Status Unclear', 
            'Your payment may have been processed successfully, but we couldn\'t verify it immediately. Please check your bank statement and contact support if needed.',
            [
              { 
                text: 'Contact Support',
                onPress: () => console.log('User chose to contact support')
              },
              { 
                text: 'Try Again',
                onPress: () => {
                  console.log('User chose to retry payment');
                  handleCheckout(); // Retry the entire payment process
                }
              },
              { 
                text: 'Continue Shopping',
                style: 'default',
                onPress: () => {
                  console.log('User chose to continue shopping');
                  // Don't clear the bag in case payment failed
                }
              }
            ]
          );
        } else {
          // Other verification errors
          Alert.alert(
            'Payment Verification Failed', 
            'There was an issue verifying your payment. Please contact our support team for assistance.',
            [
              { 
                text: 'Contact Support',
                onPress: () => console.log('User chose to contact support')
              },
              { 
                text: 'Try Again',
                onPress: () => {
                  console.log('User chose to retry payment');
                  handleCheckout(); // Retry the entire payment process
                }
              },
              { 
                text: 'Continue Shopping',
                style: 'cancel',
                onPress: () => console.log('User chose to continue shopping')
              }
            ]
          );
        }
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      
      // User-friendly error handling
      Alert.alert(
        'Verification Error', 
        'There was an issue verifying your payment. If your payment went through, please contact support with your payment details.',
        [
          { 
            text: 'Contact Support',
            onPress: () => console.log('User chose to contact support')
          },
          { 
            text: 'Continue Shopping',
            style: 'cancel',
            onPress: () => console.log('User chose to continue shopping')
          }
        ]
      );
    }
  }, [clearBag, handleCheckout, handleOrderSuccess, handleOrderPartialSuccess, handleOrderWithShippingIssues]);

  // Order success handling functions
  const handleOrderSuccess = useCallback((data) => {
    console.log('🎉 Full order success with AWB:', data.awbCode);
    
    // Navigate to Order Confirmation Screen with order details
    if (navigation && navigation.navigate) {
      navigation.navigate('orderconfirmationphone', {
        orderDetails: {
          orderId: data.order?._id || 'Generated',
          paymentId: data.razorpay_payment_id || data.paymentId,
          amount: data.order?.totalAmount || data.order?.amount,
          currency: 'INR',
          deliveryAddress: data.order?.deliveryAddress || selectedAddress,
          deliveryOption: data.order?.deliveryOption || 'standard',
          items: data.order?.items || data.order?.orderItems || bagItems.map(item => ({
            id: item.id || item._id,
            name: item.productName || item.name,
            size: item.selectedSize?.size || item.size,
            color: item.selectedSize?.color || item.color,
            quantity: item.quantity || 1,
            price: item.selectedSize?.price || item.price,
            images: item.images || []
          })),
          timestamp: data.order?.createdAt || new Date().toISOString(),
          awbCode: data.awbCode,
          shiprocketOrderId: data.shiprocketOrderId,
          status: data.order?.status || 'confirmed',
          trackingUrl: data.order?.tracking_url
        }
      });
    } else {
      // Fallback to Alert if navigation is not available
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order has been confirmed and will be shipped soon.\n\nOrder ID: ${data.order?._id || 'Generated'}\nAWB Code: ${data.awbCode}\n\nYou can track your order using this AWB code.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => console.log('User chose to continue shopping')
          }
        ]
      );
    }
  }, [navigation, selectedAddress, bagItems]);

  const handleOrderPartialSuccess = useCallback((data) => {
    console.log('⏳ Partial success - shipping details pending:', data.shiprocketOrderId);
    
    // Navigate to Order Confirmation Screen even without AWB
    if (navigation && navigation.navigate) {
      navigation.navigate('orderconfirmationphone', {
        orderDetails: {
          orderId: data.order?._id || 'Generated',
          paymentId: data.razorpay_payment_id || data.paymentId,
          amount: data.order?.totalAmount || data.order?.amount,
          currency: 'INR',
          deliveryAddress: data.order?.deliveryAddress || selectedAddress,
          deliveryOption: data.order?.deliveryOption || 'standard',
          items: data.order?.items || data.order?.orderItems || bagItems.map(item => ({
            id: item.id || item._id,
            name: item.productName || item.name,
            size: item.selectedSize?.size || item.size,
            color: item.selectedSize?.color || item.color,
            quantity: item.quantity || 1,
            price: item.selectedSize?.price || item.price,
            images: item.images || []
          })),
          timestamp: data.order?.createdAt || new Date().toISOString(),
          awbCode: null, // Will show as pending
          shiprocketOrderId: data.shiprocketOrderId,
          status: data.order?.status || 'processing',
          trackingUrl: data.order?.tracking_url
        }
      });
    } else {
      // Fallback to Alert
      Alert.alert(
        'Payment Successful! 🎉',
        `Your payment has been confirmed and order is being processed.\n\nOrder ID: ${data.order?._id || 'Generated'}\n\nShipment details will be updated shortly via email/SMS.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => console.log('User chose to continue shopping after partial success')
          }
        ]
      );
    }
  }, [navigation, selectedAddress, bagItems]);

  const handleOrderWithShippingIssues = useCallback((data) => {
    console.log('⚠️ Payment success but shipping integration failed');
    
    Alert.alert(
      'Payment Confirmed! ✅',
      `Your payment has been successfully processed.\n\nOrder ID: ${data.order?._id || 'Generated'}\n\nOur team will contact you shortly with shipping details.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => console.log('User chose to continue shopping after shipping issues')
        }
      ]
    );
  }, []);

  // ENHANCED: Authentication-aware checkout with direct Razorpay payment
  const handleCheckout = useCallback(async () => {
    console.log('🔍 handleCheckout (ENHANCED) - dynamicPricing:', dynamicPricing);
    console.log('🔍 handleCheckout - bagCalculations (compatibility):', bagCalculations);
    
    // STEP 1: Validate cart has items
    if (!dynamicPricing.isValid) {
      Alert.alert('Empty Bag', 'Please add items to your bag before checking out.');
      return;
    }

    // STEP 1.5: Validate cart items exist in backend (CRITICAL FIX)
    console.log('🔍 Validating cart items before checkout...');
    try {
      const isCartValid = await validateAndCleanCart();
      
      if (!isCartValid) {
        Alert.alert(
          'Cart Updated',
          'Some items in your cart were no longer available and have been removed. Please review your cart before proceeding.',
          [
            {
              text: 'Review Cart',
              style: 'default'
            }
          ]
        );
        return;
      }
      console.log('✅ Cart validation passed');
    } catch (validationError) {
      console.error('❌ Error validating cart:', validationError);
      Alert.alert(
        'Validation Error',
        'Unable to validate your cart. Please try again or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    // STEP 2: Check authentication status
    const isAuthenticated = yoraaAPI.isAuthenticated();
    console.log('🔍 handleCheckout - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      // User is not authenticated, navigate to RewardsScreen for signup/login
      console.log('🔒 User not authenticated, navigating to RewardsScreen for signup/login');
      navigation.navigate('RewardsScreen', { 
        fromCheckout: true,
        bagData: {
          items: bagItems,
          pricing: dynamicPricing,
          calculations: bagCalculations
        }
      });
      return;
    }

    // STEP 3: Check if user has selected an address
    if (!selectedAddress) {
      // User needs to select/add an address
      console.log('📍 No address selected, navigating to delivery address selection');
      Alert.alert(
        'Delivery Address Required',
        'Please select or add a delivery address to continue with payment.',
        [
          {
            text: 'Select Address',
            onPress: () => {
              navigation.navigate('deliveryaddress', {
                returnScreen: 'Bag',
                fromCheckout: true
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    // STEP 4: User is authenticated and has address, initiate Razorpay payment directly
    console.log('✅ User is authenticated with address, initiating Razorpay payment');
    console.log('📦 Cart items:', bagItems.length);
    console.log('📍 Delivery address:', selectedAddress);
    console.log('💰 Total amount:', dynamicPricing.total);
    
    // Create Razorpay order and initiate payment
    await createRazorpayOrder();
  }, [dynamicPricing, bagCalculations, navigation, bagItems, validateAndCleanCart, selectedAddress, createRazorpayOrder]);

  // Optimized handler functions with better state management
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    // Find the item to get its size
    const foundItem = bagItems.find(bagItem => bagItem.id === itemId);
    if (foundItem) {
      updateQuantity(itemId, foundItem.size, newQuantity);
    }
  }, [bagItems, updateQuantity]);

  const handleRemoveItem = useCallback((itemId, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Find the item to get its size
    const foundItem = bagItems.find(bagItem => bagItem.id === itemId);
    if (foundItem) {
      removeFromBag(itemId, foundItem.size);
    }
  }, [bagItems, removeFromBag]);

  const handleOpenQuantityModal = useCallback(async (item, index) => {
    setSelectedItem(item);
    // Fetch product details to get available quantities
    await fetchProductDetails(item.id || item._id);
    setModalStates(prev => ({ ...prev, quantityModalVisible: true }));
  }, [fetchProductDetails]);

  const handleCloseQuantityModal = useCallback(() => {
    setModalStates(prev => ({ ...prev, quantityModalVisible: false }));
    setSelectedItem(null);
  }, []);

  const handleSizeChange = useCallback((itemId, newSize) => {
    // Find the item to get its current size
    const foundItem = bagItems.find(bagItem => bagItem.id === itemId);
    if (foundItem) {
      updateSize(itemId, foundItem.size, newSize);
    }
  }, [bagItems, updateSize]);

  const handleOpenSizeModal = useCallback(async (item, index) => {
    setSelectedItem(item);
    // Fetch product details to get available sizes
    await fetchProductDetails(item.id || item._id);
    setModalStates(prev => ({ ...prev, sizeModalVisible: true }));
  }, [fetchProductDetails]);

  const handleCloseSizeModal = useCallback(() => {
    setModalStates(prev => ({ ...prev, sizeModalVisible: false }));
    setSelectedItem(null);
  }, []);

  const handleOpenSizeChart = useCallback(() => {
    setModalStates(prev => ({ ...prev, sizeChartModalVisible: true }));
  }, []);

  const handleCloseSizeChart = useCallback(() => {
    setModalStates(prev => ({ ...prev, sizeChartModalVisible: false }));
  }, []);

  const togglePromoCode = useCallback(() => {
    setModalStates(prev => {
      const newExpanded = !prev.promoCodeExpanded;
      
      // If expanding promo code section, fetch fresh promo codes
      if (newExpanded && !promoCodes.loading) {
        fetchPromoCodes();
      }
      
      return { ...prev, promoCodeExpanded: newExpanded };
    });
  }, [promoCodes.loading, fetchPromoCodes]);

  const togglePoints = useCallback(() => {
    setModalStates(prev => {
      const newState = !prev.pointsApplied;
      
      // If enabling points, refresh the points data to ensure we have the latest
      if (newState && !userPoints.loading) {
        fetchUserPoints();
      }
      
      return { ...prev, pointsApplied: newState };
    });
  }, [userPoints.loading, fetchUserPoints]);

  const handleApplyPromo = useCallback(async (promoCode) => {
    try {
      // If promoCode is a string (legacy), use it directly
      const code = typeof promoCode === 'string' ? promoCode : promoCode.code;
      const discount = typeof promoCode === 'object' ? promoCode.discountValue : 0;
      
      console.log('🎟️ Applying promo code:', code);
      
      // Optional: Validate promo code with backend before applying
      // Uncomment this section when validation is needed
      /*
      try {
        const orderAmount = parseFloat(bagCalculations.total);
        const validation = await yoraaAPI.validatePromoCode(code, orderAmount);
        
        if (!validation.success) {
          Alert.alert('Invalid Promo Code', validation.message || 'This promo code is not valid.');
          return;
        }
      } catch (validationError) {
        console.warn('Promo code validation failed:', validationError);
        Alert.alert('Validation Error', 'Could not validate promo code. Please try again.');
        return;
      }
      */
      
      // Update selected promo code in state
      setPromoCodes(prev => ({
        ...prev,
        selectedCode: typeof promoCode === 'object' ? promoCode : { code, discountValue: discount }
      }));
      
      // Show success message
      const discountText = discount > 0 ? ` (${discount}% off)` : '';
      Alert.alert(
        'Promo Code Applied', 
        `${code}${discountText} has been applied to your order.`
      );
      
    } catch (error) {
      console.error('Error applying promo code:', error);
      Alert.alert('Error', 'Failed to apply promo code. Please try again.');
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <BackIcon color="#000000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bag</Text>
        <View style={styles.headerRight}>
          {/* Currency selector removed */}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Empty Bag State */}
        {bagItems.length === 0 ? (
          <View style={styles.emptyBagContainer}>
            <Text style={styles.emptyBagTitle}>Your bag is empty</Text>
            <Text style={styles.emptyBagSubtitle}>Add some items to get started</Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Bag Items - Optimized rendering with swipe-to-delete */}
            {bagItems.map((item, index) => (
              <SwipeableBagItem 
                key={`bag-item-${item.id}-${item.size}-${index}`}
                item={item} 
                index={index}
                onOpenQuantityModal={handleOpenQuantityModal}
                onOpenSizeModal={handleOpenSizeModal}
                onRemoveItem={handleRemoveItem}
              />
            ))}



            {/* Delivery Location Section - Matches Figma Design */}
            <TouchableOpacity 
              style={styles.deliveryLocationContainer}
              onPress={() => {
                if (yoraaAPI.isAuthenticated()) {
                  // If authenticated, go directly to delivery address screen
                  navigation.navigate('deliveryaddress', {
                    returnScreen: 'Bag',
                    bagData: {
                      items: bagItems,
                      pricing: dynamicPricing,
                      calculations: bagCalculations
                    }
                  });
                } else {
                  // If not authenticated, prompt to sign in first
                  Alert.alert(
                    'Sign In Required',
                    'Please sign in to select delivery address.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Sign In', 
                        onPress: () => navigation.navigate('RewardsScreen', { fromCheckout: true })
                      }
                    ]
                  );
                }
              }}
            >
              <View style={styles.deliveryLocationContent}>
                <Text style={styles.deliveryLocationTitle}>
                  Delivering to: {selectedAddress 
                    ? `${selectedAddress.city || ''}, ${selectedAddress.country || 'India'}`
                    : currentLocation.country}
                </Text>
                {selectedAddress && (
                  <Text style={styles.deliveryLocationSubtitle}>
                    {selectedAddress.firstName} {selectedAddress.lastName}, {selectedAddress.address}
                  </Text>
                )}
              </View>
              <Text style={styles.deliveryLocationArrow}>›</Text>
            </TouchableOpacity>

            {/* Apply Points Section */}
            <View style={styles.applyPointsContainer}>
              <View style={styles.pointsRow}>
                <TouchableOpacity 
                  style={[
                    styles.pointsCheckbox,
                    (userPoints.available === 0 || userPoints.error || userPoints.loading) && styles.pointsCheckboxDisabled
                  ]}
                  onPress={userPoints.available > 0 && !userPoints.error && !userPoints.loading ? togglePoints : null}
                >
                  {modalStates.pointsApplied && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.pointsIcon}>
                  <Text style={styles.pointsIconText}>⚡</Text>
                </View>
                <Text style={styles.pointsText}>Apply Points</Text>
              </View>
              {userPoints.error ? (
                <TouchableOpacity onPress={fetchUserPoints}>
                  <Text style={[styles.availablePoints, styles.availablePointsError]}>
                    {userPoints.error} (Tap to retry)
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.availablePoints}>
                  {userPoints.loading 
                    ? 'Loading Points...' 
                    : `Available Points: ${userPoints.available}`
                  }
                </Text>
              )}
            </View>

            {/* Promo Code Section */}
            <TouchableOpacity 
              style={styles.promoToggleContainer}
              onPress={togglePromoCode}
            >
              <Text style={styles.promoToggleText}>
                {promoCodes.selectedCode 
                  ? `Applied: ${promoCodes.selectedCode.code}` 
                  : promoCodes.available.length > 0 
                    ? `${promoCodes.available.length} Promo Code${promoCodes.available.length !== 1 ? 's' : ''} Available`
                    : 'Have a Promo Code?'
                }
              </Text>
              <Text style={styles.promoToggleIcon}>
                {modalStates.promoCodeExpanded ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {modalStates.promoCodeExpanded && (
              <PromoCodeSection 
                promoCodes={promoCodes}
                onApplyPromo={handleApplyPromo} 
                onRetryFetch={fetchPromoCodes}
              />
            )}

            {/* Price Breakdown */}
            <View style={styles.priceBreakdownContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={styles.priceValue}>{priceBreakdown.delivery}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>International Delivery</Text>
            <Text style={styles.priceValue}>{priceBreakdown.internationalDelivery}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Promo</Text>
            <Text style={styles.priceValue}>{priceBreakdown.promo}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Points Discount</Text>
            <Text style={styles.priceValue}>{priceBreakdown.pointsDiscount}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{priceBreakdown.total}</Text>
          </View>
        </View>

        {/* Payment Icons */}
        <View style={styles.paymentIconsContainer}>
          <View style={styles.paymentIconsRow}>
            <VisaIcon width={24} height={14} />
            <MasterCardIcon width={24} height={14} />
            <AmexIcon width={24} height={14} />
            <PayPalIcon width={24} height={14} />
            <DiscoverIcon width={24} height={14} />
            <GooglePayIcon width={24} height={14} />
            <ApplePayIcon width={24} height={14} />
            <DinersIcon width={24} height={14} />
            <UnionPayIcon width={24} height={14} />
            <JCBIcon width={24} height={14} />
            <MetroIcon width={24} height={14} />
            <MaestroIcon width={24} height={14} />
            <Text style={styles.codText}>COD</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigationBar activeTab="Home" />

      {/* Quantity Selector Modal */}
      <BagQuantitySelectorModalOverlay
        visible={modalStates.quantityModalVisible}
        onClose={handleCloseQuantityModal}
        item={selectedItem}
        productDetails={selectedItem ? productDetails[selectedItem.id || selectedItem._id] : null}
        onQuantityChange={handleQuantityChange}
      />

      {/* Size Selector Modal */}
      <BagSizeSelectorModalOverlay
        visible={modalStates.sizeModalVisible}
        onClose={handleCloseSizeModal}
        item={selectedItem}
        productDetails={selectedItem ? productDetails[selectedItem.id || selectedItem._id] : null}
        onSizeChange={handleSizeChange}
        onSizeChartPress={() => {
          Alert.alert('Test', 'Inline onSizeChartPress called!');
          handleOpenSizeChart();
        }}
      />

      {/* Size Chart Modal */}
      <BagSizeSelectorSizeChart
        key={`size-chart-${modalStates.sizeChartModalVisible}`}
        visible={modalStates.sizeChartModalVisible}
        onClose={handleCloseSizeChart}
      />




    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0, // Remove default padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    height: 94, // 54px top padding + 24px content + 16px bottom
  },
  backButton: {
    width: 68,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat',
  },
  headerRight: {
    width: 68,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  locationSelector: {
    marginRight: -8, // Adjust positioning
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 0, // Remove padding to start right after header
  },
  productContainer: {
    paddingHorizontal: 16, // Changed from 24 to 16 to match Figma
    paddingTop: 24,
    paddingBottom: 0,
  },
  productRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 16, // Added spacing between product and actions
  },
  productImageContainer: {
    flex: 1,
  },
  productImagePlaceholder: {
    height: 154,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    height: 154,
    width: '100%',
    borderRadius: 8,
  },
  imagePlaceholderText: {
    color: '#999999',
    fontSize: 16,
  },
  productDetailsContainer: {
    flex: 1,
    paddingTop: 0, // Removed top padding
  },
  productInfo: {
    gap: 3,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    lineHeight: 16.8,
    fontFamily: 'Montserrat',
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    lineHeight: 16.8,
    fontFamily: 'Montserrat',
  },
  removeButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  productActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    paddingHorizontal: 16, // Match the product container padding
    marginBottom: 0, // Remove bottom margin
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Match Figma gap
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  dropdownButton: {
    padding: 4,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Match Figma gap
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  priceContainer: {
    alignItems: 'flex-end',
    flexDirection: 'column',
    gap: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'right',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53E3E', // Red for sale price
    textAlign: 'right',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'right',
    textDecorationLine: 'line-through',
    lineHeight: 16.8,
    fontFamily: 'Montserrat',
  },
  deliveryContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    marginTop: 16, // Add spacing after products
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  deliveryLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deliveryLocationContent: {
    flex: 1,
  },
  deliveryLocationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
    marginBottom: 2,
  },
  deliveryLocationSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.35,
    lineHeight: 16.8,
    fontFamily: 'Montserrat',
  },
  deliveryLocationArrow: {
    fontSize: 20,
    fontWeight: '400',
    color: '#767676',
    marginLeft: 8,
  },
  deliveryLocationText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  editLocationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textDecorationLine: 'underline',
    letterSpacing: -0.4,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  deliveryOptionsContainer: {
    marginTop: 8,
  },
  deliverySelector: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  selectedDeliveryText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    letterSpacing: -0.3,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  applyPointsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    height: 64, // Fixed height to match Figma
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  pointsCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#BCBCBC',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCheckboxDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  checkmark: {
    fontSize: 12,
    color: '#111111',
  },
  pointsIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 17.371,
    height: 26.974,
  },
  pointsIconText: {
    fontSize: 16,
    color: '#848688',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  availablePoints: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6C6C6C',
    lineHeight: 12,
    marginLeft: 28, // Adjusted to match Figma positioning
    fontFamily: 'Montserrat',
  },
  availablePointsError: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
  promoToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12, // Reduced padding
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    height: 64, // Fixed height to match Figma
  },
  promoToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat',
  },
  promoToggleIcon: {
    fontSize: 14,
    color: '#000000',
    width: 14,
    height: 14,
  },
  // Replace the old promo code styles with voucher styles
  voucherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginTop: 0,
  },
  voucherCard: {
    height: 137,
    alignSelf: 'center',
    position: 'relative',
    marginHorizontal: 8,
    maxWidth: 345,
    width: '100%',
  },
  voucherShape: {
    backgroundColor: '#F6F6F6',
    height: 137,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 10, // Space for the cutouts
  },
  voucherContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  voucherTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#1F2937', // Neutral-800 equivalent
    lineHeight: 25,
    fontFamily: 'Montserrat',
    position: 'absolute',
    left: 24,
    top: 14,
  },
  voucherCode: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C6C6C', // Neutral-80
    fontFamily: 'Montserrat',
    position: 'absolute',
    left: 24,
    top: 49,
  },
  voucherDate: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6C6C6C', // Neutral-80
    fontFamily: 'Montserrat',
    position: 'absolute',
    right: 52,
    top: 16,
  },
  voucherDivider: {
    position: 'absolute',
    left: 0.5,
    right: 0.5,
    top: 84, // Half of 137 height + 16.5 offset
    height: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderStyle: 'dashed',
  },
  voucherApplyButton: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -23.5 }],
  },
  voucherApplyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F7F7F', // Neutral-70
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  voucherLeftCutout: {
    position: 'absolute',
    left: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    zIndex: 10,
  },
  voucherRightCutout: {
    position: 'absolute',
    right: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    zIndex: 10,
  },
  // New promo code styles
  voucherCardSelected: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  voucherExpiry: {
    fontSize: 9,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'Montserrat',
    position: 'absolute',
    right: 52,
    top: 35,
  },
  voucherApplyButtonSelected: {
    opacity: 0.7,
  },
  voucherApplyTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  promoCodesContainer: {
    gap: 12,
  },
  promoLoadingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  promoLoadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat',
  },
  promoErrorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  promoErrorText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FF6B6B',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginBottom: 8,
  },
  promoRetryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promoRetryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    fontFamily: 'Montserrat',
    textDecorationLine: 'underline',
  },
  promoEmptyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
  },
  promoEmptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#767676',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginBottom: 4,
  },
  promoEmptySubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  priceBreakdownContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
    marginTop: 8, // Add spacing after voucher
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.4,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
    textAlign: 'right',
    letterSpacing: -0.32,
    lineHeight: 16,
    fontFamily: 'Montserrat',
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'right',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  paymentIconsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginBottom: 16, // Add spacing before checkout
  },
  paymentIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  codText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#848688',
    letterSpacing: -0.25,
    marginLeft: 8,
    fontFamily: 'Montserrat',
  },
  bottomSpacing: {
    height: 80, // Reduced spacing
  },
  checkoutContainer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0, // Remove any border
  },
  checkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    width: 331, // Fixed width to match Figma
    alignSelf: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  // Empty bag styles
  emptyBagContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyBagTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  emptyBagSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  continueShoppingButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueShoppingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 19.2,
    fontFamily: 'Montserrat',
  },
  // Swipe-to-delete styles
  swipeableContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1A1A1', // Pink background as shown in Figma
    zIndex: 1,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CA3327', // Red text color as shown in Figma
    fontFamily: 'Montserrat',
  },
  swipeableItem: {
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
});

export default React.memo(BagScreen);
