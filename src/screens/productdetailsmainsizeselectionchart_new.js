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
} from 'react-native';
import apiService from '../services/apiService';

const { height } = Dimensions.get('window');

const SizeSelectionModal = ({
  visible,
  onClose,
  product,
  activeSize,
  setActiveSize,
  navigation
}) => {
  const [activeTab, setActiveTab] = useState('sizeChart'); // 'sizeChart' or 'howToMeasure'
  const [selectedSize, setSelectedSize] = useState(activeSize || 'M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [sizeChartImage, setSizeChartImage] = useState(null);
  const [measurementUnit, setMeasurementUnit] = useState('inches'); // 'inches' or 'cm'
  
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
        
        console.log('🔍 Fetching data for subcategory:', product?.subCategoryId);
        
        // Get subcategory ID from product or use default
        let subcategoryId = '68da9e1f7d547feb3ed6a874'; // Default subcategory
        if (product?.subCategoryId?._id) {
          subcategoryId = product.subCategoryId._id;
        } else if (product?.subCategoryId) {
          subcategoryId = product.subCategoryId;
        }
        
        console.log('📦 Using subcategory ID:', subcategoryId);
        
        // Make API call to get all products in the subcategory
        const response = await apiService.get(`/items/latest-items/${subcategoryId}`);
        console.log('✅ API response:', response);
        
        if (response.success && response.data?.items?.length > 0) {
          setApiData(response.data);
          
          // Find the specific product we're viewing or use the first item
          let targetItem = response.data.items[0];
          
          if (product && response.data.items.length > 1) {
            const matchingItem = response.data.items.find(item => 
              item._id === product._id || 
              item.productId === product.productId || 
              item.itemId === product.itemId ||
              item.productName === product.productName
            );
            if (matchingItem) {
              targetItem = matchingItem;
            }
          }
          
          console.log('📊 Target item:', targetItem.productName);
          
          // Extract size chart image
          if (targetItem.sizeChartImage?.url) {
            setSizeChartImage({
              url: targetItem.sizeChartImage.url,
              filename: targetItem.sizeChartImage.filename || 'size-chart.png',
              uploadedAt: targetItem.sizeChartImage.uploadedAt
            });
            console.log('✅ Size chart image found:', targetItem.sizeChartImage.url);
          } else {
            console.log('❌ No size chart image found');
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

  // Get dynamic size data from API
  const getSizeData = () => {
    if (!apiData || !apiData.items || apiData.items.length === 0) {
      return [];
    }

    // Collect all sizes from all items in the subcategory
    const allSizes = [];
    
    apiData.items.forEach((item) => {
      if (item.sizes && item.sizes.length > 0) {
        item.sizes.forEach((sizeInfo) => {
          // Check if this size already exists
          const existingSize = allSizes.find(s => s.size === sizeInfo.size);
          
          if (!existingSize) {
            allSizes.push({
              size: sizeInfo.size,
              chestIn: sizeInfo.chestIn || 0,
              frontLengthIn: sizeInfo.frontLengthIn || 0,
              acrossShoulderIn: sizeInfo.acrossShoulderIn || 0,
              chestCm: sizeInfo.chestCm || 0,
              frontLengthCm: sizeInfo.frontLengthCm || 0,
              acrossShoulderCm: sizeInfo.acrossShoulderCm || 0,
              regularPrice: sizeInfo.regularPrice || 0,
              salePrice: sizeInfo.salePrice || 0,
              quantity: sizeInfo.quantity || 0,
            });
          }
        });
      }
    });

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
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      handleClose();
    }
  }, [navigation, handleClose]);

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
  };

  const handleGoToBag = () => {
    // Navigate to bag/cart screen
    handleClose();
    if (navigation && navigation.navigate) {
      navigation.navigate('Bag', { previousScreen: 'ProductViewOne' });
    }
  };

  const renderSizeChart = () => {
    const sizeData = getSizeData();
    
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
            <Text style={styles.noDataText}>No size data available</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Size selection instructions */}
        <View style={styles.sizeSelectionHeader}>
          <Text style={styles.sizeInstructions}>Select your size from the measurements below</Text>
        </View>

        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <TouchableOpacity
            style={[styles.unitToggleButton, measurementUnit === 'inches' && styles.unitToggleButtonActive]}
            onPress={() => setMeasurementUnit('inches')}
          >
            <Text style={[styles.unitToggleText, measurementUnit === 'inches' && styles.unitToggleTextActive]}>
              Inches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitToggleButton, measurementUnit === 'cm' && styles.unitToggleButtonActive]}
            onPress={() => setMeasurementUnit('cm')}
          >
            <Text style={[styles.unitToggleText, measurementUnit === 'cm' && styles.unitToggleTextActive]}>
              Centimeters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Excel-like Size Chart Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.sizeColumn]}>Size</Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Chest {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Front Length {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.measurementColumn]}>
              Across Shoulder {measurementUnit === 'inches' ? '(in)' : '(cm)'}
            </Text>
          </View>

          {/* Table Rows */}
          {sizeData.map((item, index) => (
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
                {measurementUnit === 'inches' ? item.chestIn : item.chestCm}
              </Text>
              <Text style={[styles.tableCellText, styles.measurementColumn]}>
                {measurementUnit === 'inches' ? item.frontLengthIn : item.frontLengthCm}
              </Text>
              <Text style={[styles.tableCellText, styles.measurementColumn]}>
                {measurementUnit === 'inches' ? item.acrossShoulderIn : item.acrossShoulderCm}
              </Text>
            </TouchableOpacity>
          ))}
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
                  console.log('❌ Image load error:', imageError);
                }}
                onLoad={() => {
                  console.log('✅ Measurement image loaded successfully');
                }}
              />
              {sizeChartImage.uploadedAt && (
                <Text style={styles.imageMetadata}>
                  Updated: {new Date(sizeChartImage.uploadedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageTitle}>Measurement Guide Not Available</Text>
              <Text style={styles.noImageText}>
                The measurement guide image is not available for this product category.
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

            {/* Go to Bag Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.goToBagButton, isDragging && styles.buttonDisabled]} 
                onPress={handleGoToBag}
                disabled={isDragging}
              >
                <Text style={styles.goToBagText}>Go to Bag</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 26,
  },
  sizeInstructions: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  unitToggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  unitToggleButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  unitToggleText: {
    fontSize: 14,
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
    backgroundColor: '#F8F8F8',
  },
  imageMetadata: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
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
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  goToBagButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  goToBagText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  tableBottomSpacing: {
    height: 20,
  },
});

export default SizeSelectionModal;
