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
import { Svg, Path, G, Defs, ClipPath, Rect, Line } from 'react-native-svg';
import BagQuantitySelectorModalOverlay from './bagquantityselectormodaloverlay';
import BagSizeSelectorModalOverlay from './bagsizeselectormodaloverlay';
import BagSizeSelectorSizeChart from './bagsizeselectorsizechart';

import { useBag } from '../contexts/BagContext';
import { useAddress } from '../contexts/AddressContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { apiService } from '../services/apiService';
import { yoraaAPI } from '../services/yoraaAPI';
import paymentService from '../services/paymentService';
import { 
  validateCart, 
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
  CaretDownIcon
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
              {item.title && <Text style={styles.productTitle}>{item.title}</Text>}
              <Text style={styles.productName}>{item.productName || item.name}</Text>
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
                  <View style={styles.priceRowContainer}>
                    <Text style={styles.originalPrice}>₹{priceInfo.originalPrice.toFixed(2)}</Text>
                    <Text style={styles.salePrice}>₹{priceInfo.price.toFixed(2)}</Text>
                  </View>
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

// VoucherShape Component - SVG voucher with dashed border
const VoucherShape = ({ children }) => {
  return (
    <View style={styles.voucherShapeContainer}>
      <Svg 
        width={345} 
        height={137} 
        viewBox="0 0 345 137" 
        style={styles.voucherSvg}
      >
        <Defs>
          <ClipPath id="voucher-clip">
            <Path d="M345 59.8004C345 65.323 339.929 70.7402 337.67 75.7795C336.644 78.069 336.041 80.861 336.041 83.874C336.041 91.5257 339.928 97.751 344.77 97.9434V97.9434C344.898 97.9461 345 98.0507 345 98.1788V127C345 132.523 340.523 137 335 137H10C4.47716 137 0 132.523 0 127V107.948C0 102.425 5.07117 97.008 7.33064 91.9685C8.35715 89.679 8.95996 86.8871 8.95996 83.874C8.95995 80.861 8.35713 78.069 7.33063 75.7795C5.07116 70.74 0 65.3227 0 59.7998V10C0 4.47715 4.47715 0 10 0H335C340.523 0 345 4.47715 345 10V59.8004Z" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#voucher-clip)">
          <Rect width={345} height={137} fill="#F6F6F6" />
        </G>
        <Path 
          d="M345 59.8004C345 65.323 339.929 70.7402 337.67 75.7795C336.644 78.069 336.041 80.861 336.041 83.874C336.041 91.5257 339.928 97.751 344.77 97.9434V97.9434C344.898 97.9461 345 98.0507 345 98.1788V127C345 132.523 340.523 137 335 137H10C4.47716 137 0 132.523 0 127V107.948C0 102.425 5.07117 97.008 7.33064 91.9685C8.35715 89.679 8.95996 86.8871 8.95996 83.874C8.95995 80.861 8.35713 78.069 7.33063 75.7795C5.07116 70.74 0 65.3227 0 59.7998V10C0 4.47715 4.47715 0 10 0H335C340.523 0 345 4.47715 345 10V59.8004Z" 
          fill="#F6F6F6" 
          stroke="#000000" 
          strokeWidth={1}
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
};

// Lightning Icon Component
const LightningIcon = () => (
  <Svg width="18" height="27" viewBox="0 0 18 27" fill="none" style={{ marginHorizontal: 4 }}>
    <Path 
      d="M9.50586 21.6914L6.50586 26.9736L5.51465 24.6504L8.51562 19.3682L9.50586 21.6914ZM6.47754 8.43555L9.36035 12.2012L11.5215 8.58594H13.8506L8.16406 18.1094H7.7793L7.99805 18.3867L4.06543 24.9727H1.73535L8.22266 14.1094H9.7207L9.00977 13.207L7.59863 13.1885L3.93262 8.40137L6.47754 8.43555ZM13.4385 14.8955L10.4375 20.1777L9.44727 17.8545L12.4473 12.5723L13.4385 14.8955ZM17.3711 8.09961L14.3701 13.3818L13.3799 11.0586L16.3799 5.77637L17.3711 8.09961ZM16.9131 2.30371L14.0156 7.63965L12.9805 5.33496L15.8789 0L16.9131 2.30371ZM2.54492 2.61133L6.20996 7.39746L3.66602 7.36328L0 2.57617L2.54492 2.61133Z" 
      fill="#848688"
    />
  </Svg>
);

// PromoCodeItem Component - Individual promo code card
const PromoCodeItem = React.memo(({ promoCode, onApplyPromo, onRemovePromo, isSelected }) => {
  const handleApplyPress = useCallback(() => {
    onApplyPromo?.(promoCode);
  }, [onApplyPromo, promoCode]);

  const handleRemovePress = useCallback(() => {
    onRemovePromo?.();
  }, [onRemovePromo]);

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
    <View style={styles.voucherWrapper}>
      <VoucherShape>
        <View style={styles.voucherContent}>
          <Text style={styles.voucherTitle}>{getDiscountDisplay()}</Text>
          
          <Text style={styles.voucherCode}>{promoCode.code}</Text>
          
          <View style={styles.dashedLineContainer}>
            <Svg width={316} height={1} viewBox="0 0 316 1" style={styles.dashedLineSvg}>
              <Line
                x1="0.5"
                y1="0.5"
                x2="315.5"
                y2="0.5"
                stroke="#000000"
                strokeWidth={1}
                strokeDasharray="8 8"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          
          {promoCode.validUntil && (
            <Text style={styles.voucherDate}>
              {formatDate(promoCode.validUntil)}
            </Text>
          )}
          
          <TouchableOpacity 
            style={[
              styles.voucherApplyButton,
              isSelected && styles.voucherApplyButtonSelected
            ]}
            onPress={isSelected ? handleRemovePress : handleApplyPress}
            accessibilityLabel={isSelected ? `Remove ${promoCode.code} discount` : `Apply ${promoCode.code} discount`}
          >
            <Text style={[
              styles.voucherApplyText,
              isSelected && styles.voucherApplyTextSelected
            ]}>
              {isSelected ? 'Remove' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      </VoucherShape>
    </View>
  );
});

// PromoCodeSection Component - Displays available promo codes
const PromoCodeSection = React.memo(({ promoCodes, onApplyPromo, onRemovePromo, onRetryFetch }) => {
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
          onRemovePromo={onRemovePromo}
          isSelected={promoCodes.selectedCode?.code === promoCode.code}
        />
      ))}
    </View>
  );
});

const BagScreen = ({ navigation, route }) => {
  // Use BagContext instead of local state
  const { bagItems, removeFromBag, updateQuantity, updateSize, getTotalPrice, clearBag, loadBagFromAPI, validateAndCleanCart, initialized } = useBag();
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

      // Only fetch promo codes if user is authenticated
      if (!isAuthenticated) {
        console.log('⚠️ User not authenticated, skipping promo codes fetch');
        setPromoCodes({
          available: [],
          loading: false,
          error: null,
          selectedCode: null
        });
        return;
      }

      const promoData = await yoraaAPI.getAvailablePromoCodes();
      
      // Handle different response formats
      let availableCodes = [];
      
      if (promoData && promoData.data) {
        availableCodes = Array.isArray(promoData.data) ? promoData.data : [];
      } else if (Array.isArray(promoData)) {
        availableCodes = promoData;
      }
      
      // IMPORTANT: Filter out invite-friend codes - only show regular promo codes in cart
      availableCodes = availableCodes.filter(code => {
        const isInviteCode = code.codeType === 'invite' || 
                            code.type === 'invite' || 
                            code.isInviteCode === true;
        
        if (isInviteCode) {
          console.log(`🚫 Cart: Excluding invite-friend code: ${code.code}`);
        }
        
        return !isInviteCode; // Only return regular promo codes
      });
      
      setPromoCodes({
        available: availableCodes,
        loading: false,
        error: null,
        selectedCode: null
      });
      
      console.log('✅ Cart: Loaded', availableCodes.length, 'regular promo codes (invite codes excluded)');
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

  // Redirect to empty bag screen if no items (only when explicitly coming from another screen)
  useEffect(() => {
    // Add a small delay to allow bag context to fully load
    const timer = setTimeout(() => {
      // Always redirect to empty screen when bag is empty and initialized
      // Unless explicitly forced to show content or coming from BagContent
      const shouldRedirectToEmpty = bagItems.length === 0 && 
          route?.params?.previousScreen !== 'BagContent' && 
          !route?.params?.forceShowContent &&
          initialized; // Only redirect if bag context is fully initialized
          
      if (shouldRedirectToEmpty) {
        console.log('🔄 Redirecting to empty bag screen');
        navigation.navigate('bagemptyscreen');
      } else {
        console.log('🛍️ Staying on bag screen - items:', bagItems.length, 'initialized:', initialized, 'previousScreen:', route?.params?.previousScreen);
      }
    }, 100); // Small delay to allow async bag loading
    
    return () => clearTimeout(timer);
  }, [bagItems.length, navigation, route?.params?.previousScreen, route?.params?.forceShowContent, initialized]);



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

  // ========================================================================
  // RAZORPAY PAYMENT FUNCTIONS
  // Now handled by paymentService.processCompleteOrder
  // The implementation follows the official Razorpay Integration Guide
  // ========================================================================

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

  // ENHANCED: Authentication-aware checkout using paymentService
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
    
    // STEP 1.6: Debug product existence before checkout
    console.log('🔍 CHECKOUT DEBUG - Verifying all products exist in backend...');
    for (const item of bagItems) {
      const productId = item.id || item._id;
      console.log(`🔍 Checking product ${productId} (${item.name})...`);
      try {
        const product = await yoraaAPI.makeRequest(`/api/products/${productId}`, 'GET', null, false);
        console.log(`✅ Product ${productId} exists in backend:`, {
          name: product.name || product.productName,
          status: product.status,
          sizesCount: product.sizes?.length,
          hasRequestedSize: product.sizes?.some(s => s.size === item.size)
        });
      } catch (error) {
        console.error(`❌ Product ${productId} NOT FOUND in backend:`, error);
      }
    }
    console.log('🔍 Product verification complete');

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

    // STEP 4: User is authenticated and has address, process payment using paymentService
    console.log('✅ User is authenticated with address, processing complete order');
    console.log('📦 Cart items:', bagItems.length);
    console.log('📍 Delivery address:', selectedAddress);
    console.log('💰 Total amount:', dynamicPricing.total);
    
    try {
      // Don't format cart items here - orderService will handle formatting
      // Just pass the original bagItems to processCompleteOrder
      console.log('📦 Passing original bag items to payment service:', bagItems);
      
      // ✅ FIX: Get authenticated user data BEFORE formatting address
      const userData = await yoraaAPI.getUserData();
      const userToken = yoraaAPI.getUserToken();
      const userId = userData?.id || userData?.uid || userData?._id;
      
      console.log('🔑 Authentication data retrieved:', {
        hasUserId: !!userId,
        hasUserToken: !!userToken,
        hasUserData: !!userData,
        userId: userId,
        userEmail: userData?.email || userData?.emailAddress,
        userPhone: userData?.phoneNumber || userData?.phNo,
        tokenLength: userToken ? userToken.length : 0
      });
      
      // ✅ FIX: Validate authentication before proceeding
      if (!userId || !userToken) {
        console.error('❌ Missing authentication data:', {
          userId: userId,
          hasToken: !!userToken
        });
        Alert.alert(
          'Authentication Required',
          'Please login to complete your order.',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('RewardsScreen', { fromCheckout: true })
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      // Format address for backend - ensure all required fields are present
      const formattedAddress = {
        firstName: selectedAddress.firstName || selectedAddress.name?.split(' ')[0] || userData?.firstName || 'Customer',
        lastName: selectedAddress.lastName || selectedAddress.name?.split(' ').slice(1).join(' ') || userData?.lastName || '',
        email: selectedAddress.email || userData?.email || userData?.emailAddress || '',
        phone: selectedAddress.phoneNumber || selectedAddress.phone || userData?.phoneNumber || userData?.phNo || '',
        addressLine1: selectedAddress.address || selectedAddress.addressLine1 || '',
        addressLine2: selectedAddress.addressLine2 || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        country: selectedAddress.country || 'India',
        zipCode: selectedAddress.pinCode || selectedAddress.zipCode || ''
      };
      
      console.log('📍 Formatted address for backend:', {
        firstName: formattedAddress.firstName,
        lastName: formattedAddress.lastName,
        email: formattedAddress.email,
        phone: formattedAddress.phone,
        city: formattedAddress.city,
        hasAllRequiredFields: !!(
          formattedAddress.firstName &&
          formattedAddress.lastName &&
          formattedAddress.phone &&
          formattedAddress.addressLine1 &&
          formattedAddress.city &&
          formattedAddress.state &&
          formattedAddress.zipCode &&
          formattedAddress.country
        )
      });
      
      // ⚠️ VALIDATION: Check if phone is present (email is optional)
      if (!formattedAddress.phone) {
        console.error('❌ Missing required phone number in address:', {
          hasPhone: !!formattedAddress.phone,
          userDataPhone: userData?.phoneNumber || userData?.phNo
        });
        
        Alert.alert(
          'Missing Phone Number',
          'A phone number is required for delivery. Please update your address or profile with a valid phone number.',
          [
            {
              text: 'Update Profile',
              onPress: () => navigation.navigate('RewardsScreen')
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      // Note: Email is optional - many users in India sign up with just phone numbers
      if (!formattedAddress.email) {
        console.log('ℹ️ No email in address - proceeding with phone number only');
      }
      
      // Process complete order using paymentService
      // Pass original bagItems - orderService will format them correctly
      const result = await paymentService.processCompleteOrder(
        bagItems,  // ✅ Pass original items, not formatted
        formattedAddress,
        {
          userId: userId,          // ✅ Ensure userId is passed
          userToken: userToken,    // ✅ Ensure token is passed
          orderNotes: '',
          paymentMethod: 'razorpay'
        }
      );
      
      console.log('✅ Payment completed successfully:', result);
      
      // Handle successful payment - navigate to order confirmation
      if (result.success && result.order) {
        // Clear the bag
        clearBag();
        
        // Navigate to order confirmation screen
        navigation.navigate('orderconfirmationphone', {
          orderDetails: {
            orderId: result.order._id || result.orderId,
            paymentId: result.paymentId,
            amount: result.order.totalAmount || result.order.amount,
            currency: 'INR',
            deliveryAddress: result.order.deliveryAddress || selectedAddress,
            deliveryOption: result.order.deliveryOption || 'standard',
            items: result.order.items || result.order.orderItems || bagItems.map(item => ({
              id: item.id || item._id,
              name: item.productName || item.name,
              size: item.selectedSize?.size || item.size,
              color: item.selectedSize?.color || item.color,
              quantity: item.quantity || 1,
              price: item.selectedSize?.price || item.price,
              images: item.images || []
            })),
            timestamp: result.order.createdAt || new Date().toISOString(),
            awbCode: result.order.awbCode,
            shiprocketOrderId: result.order.shiprocketOrderId,
            status: result.order.status || 'confirmed',
            trackingUrl: result.order.tracking_url
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Payment failed. Please try again.';
      
      Alert.alert(
        'Payment Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => handleCheckout()
          },
          {
            text: 'Continue Shopping',
            style: 'cancel'
          }
        ]
      );
    }
  }, [dynamicPricing, bagCalculations, navigation, bagItems, validateAndCleanCart, selectedAddress, clearBag]);

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

  // Remove promo code handler
  const handleRemovePromo = useCallback(() => {
    const removedCode = promoCodes.selectedCode?.code;
    
    setPromoCodes(prev => ({
      ...prev,
      selectedCode: null
    }));
    
    Alert.alert(
      'Promo Code Removed',
      `${removedCode} has been removed from your order.`
    );
  }, [promoCodes.selectedCode]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bag</Text>
        <View style={styles.headerRight}>
          {/* Currency selector removed */}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={bagItems.length === 0 ? styles.emptyScrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
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
                  {modalStates.pointsApplied && (
                    <Svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <Path 
                        d="M1 4L3.5 6.5L9 1" 
                        stroke="#111111" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>
                <View style={styles.pointsTextContainer}>
                  <Text style={styles.pointsText}>Apply </Text>
                  <LightningIcon />
                  <Text style={styles.pointsText}> Points</Text>
                </View>
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
              <View style={styles.promoToggleLeft}>
                <Text style={styles.promoToggleText}>
                  {promoCodes.selectedCode 
                    ? `Applied: ${promoCodes.selectedCode.code}` 
                    : promoCodes.available.length > 0 
                      ? `${promoCodes.available.length} Promo Code${promoCodes.available.length !== 1 ? 's' : ''} Available`
                      : 'Have a Promo Code?'
                  }
                </Text>
              </View>
              <View style={styles.promoToggleRight}>
                <Text style={styles.promoToggleIcon}>
                  {modalStates.promoCodeExpanded ? '−' : '+'}
                </Text>
              </View>
            </TouchableOpacity>

            {modalStates.promoCodeExpanded && (
              <PromoCodeSection 
                promoCodes={promoCodes}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 54, // Increased top padding to match Figma
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat',
    position: 'absolute',
    left: 0,
    right: 0,
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
    backgroundColor: '#FFFFFF',
  },
  emptyScrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  productContainer: {
    paddingHorizontal: 24, // Adjusted to match Figma left positioning
    paddingTop: 24,
    paddingBottom: 0,
  },
  productRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 8, // Reduced spacing for tighter layout
  },
  productImageContainer: {
    flex: 1,
  },
  productImagePlaceholder: {
    height: 154,
    backgroundColor: '#F0F0F0', // Lighter background for placeholder
    borderRadius: 0, // Remove border radius to match Figma
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    height: 154,
    width: '100%',
    borderRadius: 0, // Remove border radius to match Figma
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
  productTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    lineHeight: 16.8,
    fontFamily: 'Montserrat',
    marginBottom: 0,
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
    paddingHorizontal: 24, // Match the product container padding
    marginBottom: 0, // Remove bottom margin
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Increased gap to match Figma
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
    gap: 16, // Increased gap to match Figma
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
  priceRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginTop: 0, // Remove extra spacing
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
    height: 64,
    justifyContent: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointsCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#BCBCBC',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pointsCheckboxDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  pointsTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  availablePoints: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6C6C6C',
    marginLeft: 28,
    fontFamily: 'Montserrat-Regular',
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
    paddingVertical: 24, // Increased to match Figma
    height: 64, // Fixed height to match Figma
  },
  promoToggleLeft: {
    flex: 1,
  },
  promoToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat',
  },
  promoSavingsText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#34C759',
    marginTop: 4,
    fontFamily: 'Montserrat',
  },
  removePromoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFFFFF',
  },
  removePromoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'Montserrat',
  },
  promoToggleIcon: {
    fontSize: 14,
    color: '#000000',
    width: 14,
    height: 14,
  },
  // Replace the old promo code styles with voucher styles
  voucherWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16, // Added horizontal padding
  },
  voucherShapeContainer: {
    width: 345, // Updated to match Figma
    height: 137,
    position: 'relative',
  },
  voucherSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  voucherContent: {
    width: 345, // Updated to match Figma
    height: 137,
    position: 'relative',
  },
  voucherCode: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    lineHeight: 14.4,
    position: 'absolute',
    left: 24,
    top: 49,
  },
  voucherTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#3E3E3E',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    lineHeight: 30,
    position: 'absolute',
    left: 24,
    top: 14,
  },
  dashedLineContainer: {
    position: 'absolute',
    width: 316, // Updated to match Figma
    height: 1,
    left: 15,
    top: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLineSvg: {
    transform: [{ rotate: '359.798deg' }],
  },
  voucherDate: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    lineHeight: 12,
    position: 'absolute',
    right: 24, // Changed from left to right for date positioning
    top: 16,
    width: 110,
  },
  voucherExpiry: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#6C6C6C',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    position: 'absolute',
    left: 24,
    bottom: 10,
  },
  voucherApplyButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -23.5 }], // Half of "Apply" text width
    top: 100, // Adjusted for better vertical centering in bottom section
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  voucherApplyText: {
    color: '#7F7F7F',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: 19.2,
  },
  voucherApplyButtonSelected: {
    backgroundColor: 'transparent',
  },
  voucherApplyTextSelected: {
    color: '#EA4335', // Red color for remove button
  },
  promoCodesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    paddingHorizontal: 25, // Adjusted to match Figma positioning
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10,
    marginTop: 0, // Remove spacing
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
    paddingHorizontal: 26, // Match Figma positioning
    paddingVertical: 12,
    marginBottom: 0, // Remove bottom margin
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
    height: 20, // Reduced spacing to bring checkout button closer
  },
  checkoutContainer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0, // Remove any border
    paddingBottom: 32, // Added bottom padding for safe area
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
    marginBottom: 8, // Add spacing between items
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 99, // Match Figma width
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
