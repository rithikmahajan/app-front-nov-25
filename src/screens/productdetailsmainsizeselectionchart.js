import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  PanResponder,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiService from '../services/apiService';
import { useBag } from '../contexts/BagContext';

const { height } = Dimensions.get('window');

const SizeSelectionModal = ({
  visible,
  onClose,
  product,
  activeSize,
  setActiveSize,
  navigation,
  actionType = 'addToCart' // 'addToCart' or 'buyNow'
}) => {
  const { addToBag } = useBag();
  const [activeTab, setActiveTab] = useState('sizeChart'); // 'sizeChart' or 'howToMeasure'
  const [selectedSize, setSelectedSize] = useState(null); // Start with no size selected
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [sizeChartImage, setSizeChartImage] = useState(null);
  const [measurementUnit, setMeasurementUnit] = useState('inches'); // 'inches' or 'cm'
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Single animated value for transform to avoid native driver conflicts
  const translateY = useRef(new Animated.Value(height)).current;
  
  // Gesture handling state
  const [isDragging, setIsDragging] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Gesture state tracking
  const gestureTracker = useRef({
    isActive: false,
    startY: 0,
    currentY: 0,
    velocity: 0,
    lastTimestamp: 0,
  }).current;

  // Sheet dimensions and constraints
  const DISMISS_THRESHOLD = 150;

  // Fetch API data on component mount
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching data for product:', product);
        
        let response;
        
        // Strategy 1: If we have a specific product ID, try to fetch that product directly
        if (product?._id) {
          try {
            console.log('📦 Trying to fetch specific product by ID:', product._id);
            const productResponse = await apiService.get(`/items/${product._id}`);
            if (productResponse.success && productResponse.data) {
              console.log('✅ Got specific product data:', productResponse.data);
              // Create a response structure similar to subcategory response
              response = {
                success: true,
                data: {
                  items: [productResponse.data]
                }
              };
            }
          } catch (directFetchError) {
            console.log('⚠️ Direct product fetch failed, trying subcategory approach');
          }
        }
        
        // Strategy 2: If direct fetch failed or no product ID, use subcategory endpoint
        if (!response || !response.success) {
          // Get subcategory ID from product or use default
          let subcategoryId = '68da9e1f7d547feb3ed6a874'; // Default subcategory
          if (product?.subCategoryId?._id) {
            subcategoryId = product.subCategoryId._id;
          } else if (product?.subCategoryId) {
            subcategoryId = product.subCategoryId;
          }
          
          console.log('📦 Using subcategory API endpoint:', `/items/subcategory/${subcategoryId}`);
          
          // Make API call using the subcategory endpoint you specified
          response = await apiService.get(`/items/subcategory/${subcategoryId}`);
          console.log('✅ Subcategory API response:', response);
        }
        
        if (response.success && response.data?.items?.length > 0) {
          setApiData(response.data);
          
          console.log('🔍 FULL API RESPONSE:', JSON.stringify(response.data, null, 2));
          console.log('🔍 All items in response:', response.data.items.map(item => ({
            id: item._id,
            productId: item.productId,
            itemId: item.itemId,
            productName: item.productName,
            hasSizes: !!item.sizes,
            sizesCount: item.sizes?.length || 0,
            firstSizeKeys: item.sizes?.[0] ? Object.keys(item.sizes[0]) : []
          })));
          
          console.log('🔍 Looking for product:', {
            id: product?._id,
            productId: product?.productId,
            itemId: product?.itemId,
            productName: product?.productName
          });
          
          // Find the specific product we're viewing
          let targetItem = null;
          
          // If we have only one item (from direct product fetch), use it
          if (response.data.items.length === 1) {
            targetItem = response.data.items[0];
            console.log('✅ Using directly fetched product:', targetItem.productName);
          } else if (product) {
            // For subcategory responses, find the matching product
            targetItem = response.data.items.find(item => {
              // Match by various ID fields
              const idMatch = item._id === product._id || 
                            item.productId === product.productId || 
                            item.itemId === product.itemId;
              
              // Match by product name (exact match)
              const nameMatch = item.productName === product.productName;
              
              // Match by title if available
              const titleMatch = product.title && item.title === product.title;
              
              console.log(`🔍 Checking item ${item.productName}:`, {
                idMatch,
                nameMatch,
                titleMatch,
                itemIds: { _id: item._id, productId: item.productId, itemId: item.itemId },
                productIds: { _id: product._id, productId: product.productId, itemId: product.itemId }
              });
              
              return idMatch || nameMatch || titleMatch;
            });
          }
          
          // If no match found, use the first item as fallback
          if (!targetItem) {
            targetItem = response.data.items[0];
            console.log('⚠️ No matching product found, using first item as fallback');
          }
          
          console.log('📊 Selected target item:', {
            id: targetItem._id,
            productName: targetItem.productName,
            hasSizeChart: !!targetItem.sizeChartImage?.url
          });
          
          // Extract size chart image from the specific target item
          if (targetItem.sizeChartImage?.url) {
            setSizeChartImage({
              url: targetItem.sizeChartImage.url,
              filename: targetItem.sizeChartImage.filename || 'size-chart.png',
              uploadedAt: targetItem.sizeChartImage.uploadedAt,
              productName: targetItem.productName,
              productId: targetItem._id
            });
            console.log('✅ Size chart image found for product:', targetItem.productName);
            console.log('✅ Image URL:', targetItem.sizeChartImage.url);
          } else {
            console.log('❌ No size chart image found for product:', targetItem.productName);
            setSizeChartImage(null);
          }
          
        } else {
          setError('No items found for this subcategory');
        }
      } catch (err) {
        console.error('❌ Error fetching API data:', err);
        setError(err.userMessage || 'Failed to load size chart data');
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchApiData();
    }
  }, [visible, product]);

  // Get dynamic size data from API - specific to the current product
  const getSizeData = () => {
    if (!apiData || !apiData.items || apiData.items.length === 0) {
      return [];
    }

    // Find the specific product we're viewing (same logic as in fetchApiData)
    let targetItem = null;
    
    if (product) {
      targetItem = apiData.items.find(item => {
        const idMatch = item._id === product._id || 
                      item.productId === product.productId || 
                      item.itemId === product.itemId;
        const nameMatch = item.productName === product.productName;
        const titleMatch = product.title && item.title === product.title;
        return idMatch || nameMatch || titleMatch;
      });
    }
    
    // If no match found, use the first item as fallback
    if (!targetItem) {
      targetItem = apiData.items[0];
    }

    console.log('📏 Getting size data for product:', targetItem.productName);
    console.log('📏 TARGET ITEM FULL OBJECT:', JSON.stringify(targetItem, null, 2));
    console.log('📏 Target item has sizes?:', !!targetItem.sizes);
    console.log('📏 Target item sizes length:', targetItem.sizes?.length);
    console.log('📏 Target item sizeOptions?:', targetItem.sizeOptions);
    console.log('📏 All keys in target item:', Object.keys(targetItem));

    // Get sizes from the specific target product only
    const allSizes = [];
    
    // Check multiple possible locations for size data
    const sizesArray = targetItem.sizes || targetItem.sizeOptions || targetItem.sizeVariants || [];
    
    console.log('📏 Using sizes array with length:', sizesArray.length);
    
    if (sizesArray && sizesArray.length > 0) {
      sizesArray.forEach((sizeInfo) => {
        console.log('===========================================');
        console.log('📏 RAW SIZE OBJECT:', JSON.stringify(sizeInfo, null, 2));
        console.log('📏 All available keys:', Object.keys(sizeInfo));
        
        // Helper function to safely get value
        const getValue = (obj, keys) => {
          for (const key of keys) {
            const val = obj[key];
            if (val !== undefined && val !== null && val !== '') {
              return val;
            }
          }
          return null;
        };
        
        // Extract measurements with CORRECT backend field names
        const chestCm = getValue(sizeInfo, ['chestCm', 'Chest (cm)', 'chest (cm)', 'chest_cm']);
        const chestIn = getValue(sizeInfo, ['chestIn', 'Chest (in)', 'chest (in)', 'chest_in']);
        const frontLengthCm = getValue(sizeInfo, ['frontLengthCm', 'Front Length (cm)', 'frontLength (cm)', 'length (cm)', 'Length (cm)']);
        const frontLengthIn = getValue(sizeInfo, ['frontLengthIn', 'Front Length (in)', 'frontLength (in)', 'length (in)', 'Length (in)']);
        const shoulderCm = getValue(sizeInfo, ['acrossShoulderCm', 'Shoulder (cm)', 'shoulder (cm)', 'shoulderCm', 'shoulder_cm']);
        const shoulderIn = getValue(sizeInfo, ['acrossShoulderIn', 'Shoulder (in)', 'shoulder (in)', 'shoulderIn', 'shoulder_in']);
        const waistCm = getValue(sizeInfo, ['fitWaistCm', 'Waist (cm)', 'waist (cm)', 'waistCm', 'waist_cm']);
        const waistIn = getValue(sizeInfo, ['toFitWaistIn', 'Waist (in)', 'waist (in)', 'waistIn', 'waist_in']);
        const inseamCm = getValue(sizeInfo, ['inseamLengthCm', 'Inseam (cm)', 'inseam (cm)', 'inseamCm', 'inseam_cm']);
        const inseamIn = getValue(sizeInfo, ['inseamLengthIn', 'Inseam (in)', 'inseam (in)', 'inseamIn', 'inseam_in']);
        
        console.log('📏 Extracted measurements:', {
          size: sizeInfo.size,
          chest: `${chestCm}cm / ${chestIn}in`,
          frontLength: `${frontLengthCm}cm / ${frontLengthIn}in`,
          shoulder: `${shoulderCm}cm / ${shoulderIn}in`,
          waist: `${waistCm}cm / ${waistIn}in`,
          inseam: `${inseamCm}cm / ${inseamIn}in`
        });
        console.log('===========================================');
        console.log('===========================================');
        
        allSizes.push({
          size: sizeInfo.size,
          // Chest measurements
          chestIn: chestIn || 0,
          chestCm: chestCm || 0,
          // Front Length measurements
          frontLengthIn: frontLengthIn || 0,
          frontLengthCm: frontLengthCm || 0,
          // Shoulder measurements
          acrossShoulderIn: shoulderIn || 0,
          acrossShoulderCm: shoulderCm || 0,
          // Waist measurements
          waistIn: waistIn || 0,
          waistCm: waistCm || 0,
          // Inseam measurements
          inseamIn: inseamIn || 0,
          inseamCm: inseamCm || 0,
          // Price and stock
          regularPrice: sizeInfo.regularPrice || 0,
          salePrice: sizeInfo.salePrice || 0,
          quantity: sizeInfo.quantity || 0,
        });
      });
    }

    // Sort sizes in standard order
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return allSizes.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.size);
      const indexB = sizeOrder.indexOf(b.size);
      if (indexA === -1 && indexB === -1) return a.size.localeCompare(b.size);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsDragging(false);
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // Simple touch handlers as fallback
  const handleTouchStart = useCallback((evt) => {
    const startY = evt.nativeEvent.pageY;
    gestureTracker.startY = startY;
    gestureTracker.isActive = true;
  }, [gestureTracker]);

  const handleTouchMove = useCallback((evt) => {
    if (!gestureTracker.isActive) return;
    
    const currentY = evt.nativeEvent.pageY;
    const deltaY = currentY - gestureTracker.startY;
    
    if (deltaY > 5) { // Only for downward movement
      setIsDragging(true);
      translateY.setValue(deltaY);
      
      // Update backdrop opacity
      const dragProgress = Math.max(0, Math.min(1, deltaY / DISMISS_THRESHOLD));
      const newBackdropOpacity = 1 - (dragProgress * 0.5);
      backdropOpacity.setValue(newBackdropOpacity);
    }
  }, [gestureTracker, translateY, backdropOpacity, DISMISS_THRESHOLD]);

  const handleTouchEnd = useCallback((evt) => {
    if (!gestureTracker.isActive) return;
    
    const currentY = evt.nativeEvent.pageY;
    const deltaY = currentY - gestureTracker.startY;
    
    gestureTracker.isActive = false;
    
    if (deltaY > DISMISS_THRESHOLD) {
      // Close the modal
      handleClose();
    } else {
      // Snap back
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start(() => {
        setIsDragging(false);
      });
    }
  }, [gestureTracker, DISMISS_THRESHOLD, handleClose, translateY]);

  // Simple PanResponder for gesture control
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dy } = gestureState;
        return Math.abs(dy) > 2;
      },
      
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        
        if (dy > 0) {
          translateY.setValue(dy);
          
          // Update backdrop opacity
          const dragProgress = Math.max(0, Math.min(1, dy / DISMISS_THRESHOLD));
          const newBackdropOpacity = 1 - (dragProgress * 0.5);
          backdropOpacity.setValue(newBackdropOpacity);
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        
        if (dy > DISMISS_THRESHOLD) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start(() => {
            setIsDragging(false);
          });
        }
      },
    })
  ).current;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setActiveSize(size);
    // Don't automatically trigger action - wait for confirm button
  };

  // New function to handle confirm button press
  const handleConfirmSize = async () => {
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before confirming');
      return;
    }

    if (actionType === 'addToCart') {
      await handleAddToCartWithSize(selectedSize);
    } else if (actionType === 'buyNow') {
      await handleBuyNowWithSize(selectedSize);
    }
  };

  const handleAddToCartWithSize = async (size) => {
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }

    if (!size) {
      Alert.alert('Select Size', 'Please select a size before proceeding');
      return;
    }

    setIsAddingToCart(true);
    try {
      // Find the SKU for the selected size
      let sku = null;
      if (product.sizes && Array.isArray(product.sizes)) {
        const sizeVariant = product.sizes.find(s => s.size === size);
        sku = sizeVariant?.sku;
      }

      await addToBag(product, size, sku);
      
      // Close modal after adding to cart
      handleClose();
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNowWithSize = async (size) => {
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }

    if (!size) {
      Alert.alert('Select Size', 'Please select a size before proceeding');
      return;
    }

    setIsAddingToCart(true);
    try {
      // Find the SKU for the selected size
      let sku = null;
      if (product.sizes && Array.isArray(product.sizes)) {
        const sizeVariant = product.sizes.find(s => s.size === size);
        sku = sizeVariant?.sku;
      }

      await addToBag(product, size, sku);
      
      // Close modal and navigate to bag for checkout
      handleClose();
      setTimeout(() => {
        if (navigation && navigation.navigate) {
          navigation.navigate('Bag', { 
            previousScreen: 'ProductViewOne',
            fromBuyNow: true,
            checkoutItem: {
              product,
              size,
              sku
            }
          });
        }
      }, 300); // Wait for modal close animation
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderSizeChart = () => {
    const sizeData = getSizeData();
    
    // Enhanced logging for debugging
    console.log('🎯 renderSizeChart - Size data length:', sizeData.length);
    console.log('🎯 renderSizeChart - Size data:', JSON.stringify(sizeData, null, 2));
    console.log('🎯 renderSizeChart - Product:', JSON.stringify(product, null, 2));
    console.log('🎯 renderSizeChart - API Data:', apiData);
    
    if (loading) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading size chart...</Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setLoading(true);
              setError(null);
              setApiData(null);
            }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (sizeData.length === 0) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No size data available for this product</Text>
            <Text style={styles.noDataSubText}>Please contact support to add size information</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Size selection instructions with unit toggle */}
        <View style={styles.sizeSelectionHeader}>
          <Text style={styles.sizeInstructions}>Select size in</Text>
          
          {/* Unit Toggle */}
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity
              style={[styles.unitToggleButton, measurementUnit === 'inches' && styles.unitToggleButtonActive]}
              onPress={() => setMeasurementUnit('inches')}
            >
              <Text style={[styles.unitToggleText, measurementUnit === 'inches' && styles.unitToggleTextActive]}>
                in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitToggleButton, measurementUnit === 'cm' && styles.unitToggleButtonActive]}
              onPress={() => setMeasurementUnit('cm')}
            >
              <Text style={[styles.unitToggleText, measurementUnit === 'cm' && styles.unitToggleTextActive]}>
                cm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Excel-like Size Chart Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {/* Empty space for radio button */}
            <View style={styles.radioButtonSpace} />
            <Text style={[styles.tableHeaderText, styles.sizeColumn]}>Size</Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Chest {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Length {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Shoulder {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Waist {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Inseam {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
          </View>

          {/* Table Rows */}
          {sizeData.map((item, index) => {
            // Get the measurement values
            const chestValue = measurementUnit === 'inches' ? item.chestIn : item.chestCm;
            const lengthValue = measurementUnit === 'inches' ? item.frontLengthIn : item.frontLengthCm;
            const shoulderValue = measurementUnit === 'inches' ? item.acrossShoulderIn : item.acrossShoulderCm;
            const waistValue = measurementUnit === 'inches' ? item.waistIn : item.waistCm;
            const inseamValue = measurementUnit === 'inches' ? item.inseamIn : item.inseamCm;
            
            return (
              <TouchableOpacity
                key={item.size}
                style={[styles.tableRow, index === sizeData.length - 1 && styles.lastTableRow]}
                onPress={() => handleSizeSelect(item.size)}
              >
                <View style={[
                  styles.radioButton,
                  selectedSize === item.size && styles.radioButtonSelected
                ]}>
                  {selectedSize === item.size && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.tableCellText, styles.sizeColumn]}>{item.size}</Text>
                <Text style={[styles.tableCellText, styles.measurementColumn]}>
                  {chestValue || '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.measurementColumn]}>
                  {lengthValue || '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.measurementColumn]}>
                  {shoulderValue || '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.measurementColumn]}>
                  {waistValue || '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.measurementColumn]}>
                  {inseamValue || '-'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.tableBottomSpacing} />
      </ScrollView>
    );
  };

  const renderHowToMeasure = () => {
    if (loading) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading measurement guide...</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.measurementGuideContainer}>
          <Text style={styles.measurementGuideTitle}>How to Measure</Text>
          
          {sizeChartImage?.url ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: sizeChartImage.url }}
                style={styles.measurementImage}
                resizeMode="contain"
                onError={(imageError) => {
                  console.log('❌ Image load error for product:', sizeChartImage.productName);
                  console.log('❌ Failed URL:', sizeChartImage.url);
                  console.log('❌ Error details:', imageError);
                }}
                onLoad={() => {
                  console.log('✅ Measurement image loaded successfully for:', sizeChartImage.productName);
                  console.log('✅ Loaded URL:', sizeChartImage.url);
                }}
              />
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageTitle}>Measurement Guide Not Available</Text>
              <Text style={styles.noImageText}>
                The measurement guide image is not available for this product.
              </Text>
              {/* Show debug info when no image */}
              <Text style={styles.debugInfo}>
                Product: {product?.productName || 'Unknown'}
                {'\n'}API Data: {apiData ? 'Loaded' : 'Not loaded'}
                {'\n'}Items Count: {apiData?.items?.length || 0}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // Early return if modal is not visible
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Animated backdrop */}
        <Animated.View style={[styles.backdrop, {
          opacity: backdropOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }]} />
        
        {/* Backdrop touchable */}
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        {/* Bottom sheet with gesture handling */}
        <TouchableWithoutFeedback>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }]
              }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Draggable area for gesture detection */}
            <View 
              style={styles.dragArea}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag handle */}
              <View style={styles.dragHandle} />
            </View>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>SIZE SELECTION</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'sizeChart' && styles.activeTab]}
                onPress={() => setActiveTab('sizeChart')}
                disabled={isDragging}
              >
                <Text style={[styles.tabText, activeTab === 'sizeChart' && styles.activeTabText]}>
                  Size Chart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'howToMeasure' && styles.activeTab]}
                onPress={() => setActiveTab('howToMeasure')}
                disabled={isDragging}
              >
                <Text style={[styles.tabText, activeTab === 'howToMeasure' && styles.activeTabText]}>
                  How To Measure
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.contentContainer} 
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isDragging}
            >
              {activeTab === 'sizeChart' ? renderSizeChart() : renderHowToMeasure()}
            </ScrollView>

            {/* Confirm Size Button - Only show when a size is selected and on Size Chart tab */}
            {selectedSize && activeTab === 'sizeChart' && (
              <View style={styles.confirmButtonContainer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmSize}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Confirm Size ({selectedSize})
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  backdropTouchable: {
    flex: 1,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    alignSelf: 'center',
  },
  dragArea: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    maxHeight: height * 0.90,
    minHeight: height * 0.70,
    paddingBottom: 34, // Safe area bottom
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 51,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  activeTabText: {
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  sizeSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 26,
    height: 45,
  },
  sizeInstructions: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    marginRight: 12,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: 30,
    width: 80,
    overflow: 'hidden',
    flexShrink: 0,
  },
  unitToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: 50,
  },
  unitToggleButtonActive: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  unitToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  // Excel-like table styles
  tableContainer: {
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSpace: {
    width: 28, // 20px radio button + 8px marginRight
    height: 20,
  },
  radioButtonSelected: {
    borderColor: '#000000',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  sizeColumn: {
    flex: 1,
  },
  measurementColumn: {
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FF0000',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  // How to Measure tab styles
  measurementGuideContainer: {
    padding: 20,
    alignItems: 'center',
  },
  measurementGuideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  measurementImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  imageMetadata: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  imageFilename: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  debugProductInfo: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugInfo: {
    fontSize: 10,
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 4,
  },
  noImageContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noImageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Montserrat-SemiBold',
  },
  noImageText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tableBottomSpacing: {
    height: 20,
  },
  // Confirm Button Styles
  confirmButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2,
  },
});

export default SizeSelectionModal;
