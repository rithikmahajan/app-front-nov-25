import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,  
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import apiService from '../services/apiService';

const { width: screenWidth } = Dimensions.get('window');

const FavouritesSizeChartReference = ({ route, navigation }) => {
  const { product, sizeChartData: passedSizeChartData, sizeChartImage: passedSizeChartImage } = route.params || {};
  
  // State management
  const [activeTab, setActiveTab] = useState('sizeChart'); // 'sizeChart' or 'howToMeasure'
  const [measurementUnit, setMeasurementUnit] = useState('cm'); // 'in' or 'cm'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic data state
  const [sizeChartData, setSizeChartData] = useState([]);
  const [sizeChartImage, setSizeChartImage] = useState(null);

  // Load dynamic data from API
  useEffect(() => {
    loadProductSizeData();
  }, [loadProductSizeData]);

  const loadProductSizeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading size chart data for product:', product);
      console.log('🔍 Product keys:', product ? Object.keys(product) : 'No product');

      // Use passed data if available, otherwise fetch from API
      if (passedSizeChartData && passedSizeChartData.length > 0) {
        console.log('✅ Using passed size chart data:', passedSizeChartData);
        setSizeChartData(passedSizeChartData);
      }

      if (passedSizeChartImage) {
        console.log('✅ Using passed size chart image:', passedSizeChartImage.url);
        setSizeChartImage(passedSizeChartImage);
      }

      // If no passed data, fetch from API
      if (!passedSizeChartData || passedSizeChartData.length === 0) {
        console.log('🔍 Fetching from API...');
        
        if (!product?._id && !product?.productId && !product?.itemId) {
          console.log('⚠️ No product ID found');
          setSizeChartData([]);
          setError('Product ID not available');
          return;
        }

        // Try multiple ID fields to fetch product data
        const productId = product._id || product.productId || product.itemId;
        console.log('🔍 Fetching product with ID:', productId);
        
        const response = await apiService.getItemById(productId);

        if (response?.data) {
          const matchingProduct = response.data;
          console.log('✅ Found product with full data:', matchingProduct.productName);
          
          // Extract size chart data based on actual backend fields
          if (matchingProduct.sizes && matchingProduct.sizes.length > 0) {
            const dynamicSizes = matchingProduct.sizes
              .filter(size => size.size) // Only require size field
              .map(size => ({
                size: size.size,
                // Map all available backend fields with proper fallbacks
                chestCm: size.chestCm || 'N/A',
                chestIn: size.chestIn || 'N/A',
                frontLengthCm: size.frontLengthCm || 'N/A',
                frontLengthIn: size.frontLengthIn || 'N/A',
                acrossShoulderCm: size.acrossShoulderCm || 'N/A',
                acrossShoulderIn: size.acrossShoulderIn || 'N/A',
                waistCm: size.waistCm || 'N/A',
                waistIn: size.waistIn || 'N/A',
                inseamCm: size.inseamCm || 'N/A',
                inseamIn: size.inseamIn || 'N/A',
                hipCm: size.hipCm || 'N/A',
                hipIn: size.hipIn || 'N/A',
                quantity: size.quantity || 0,
                stock: size.stock || 0,
                regularPrice: size.regularPrice || 0,
                salePrice: size.salePrice || 0,
                available: (size.stock || 0) > 0
              }));
            
            setSizeChartData(dynamicSizes);
            console.log('✅ Size chart data loaded with all fields:', dynamicSizes);
          } else {
            console.log('⚠️ No sizes found in product');
            setSizeChartData([]);
            setError('No size information available for this product');
          }

          // Extract size chart image
          if (matchingProduct.sizeChartImage?.url) {
            setSizeChartImage({
              url: matchingProduct.sizeChartImage.url,
              filename: matchingProduct.sizeChartImage.filename,
              uploadedAt: matchingProduct.sizeChartImage.uploadedAt
            });
            console.log('✅ Size chart image found:', matchingProduct.sizeChartImage.url);
          }
        } else {
          console.log('⚠️ No product data found in API response');
          setSizeChartData([]);
          setError('Product not found in database');
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading size chart data:', err);
      setError('Failed to load size chart data');
    } finally {
      setLoading(false);
    }
  }, [product, passedSizeChartData, passedSizeChartImage]);

  // Note: Backend provides both cm and inch measurements, no conversion needed



  // PanResponder for handling swipe down gesture on header area
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Allow pan responder to start immediately
      return true;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Respond to any movement, prioritize vertical gestures
      return Math.abs(gestureState.dy) > 5 || Math.abs(gestureState.dx) > 5;
    },
    onPanResponderGrant: (evt, gestureState) => {
      // Gesture started
      console.log('🎯 Pan gesture started');
    },
    onPanResponderMove: (evt, gestureState) => {
      // Track the gesture movement
      if (gestureState.dy > 0) {
        console.log('🔄 Dragging down:', gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      console.log('🏁 Pan gesture released - dy:', gestureState.dy, 'vy:', gestureState.vy);
      // Check if it's a swipe down gesture (positive dy, minimum distance)
      if (gestureState.dy > 30 && gestureState.vy > 0.2) {
        console.log('✅ Closing modal via swipe');
        handleClose();
      }
    },
    onPanResponderTerminate: (evt, gestureState) => {
      // Gesture was terminated
      console.log('❌ Pan gesture terminated');
    },
  });

  const handleClose = () => {
    // Navigate back to the size selection modal
    navigation.navigate('FavouritesModalOverlayForSizeSelection', route.params);
  };

  const renderSizeChart = () => {
    if (loading) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.black} />
          <Text style={styles.loadingText}>Loading size chart...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadProductSizeData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!sizeChartData || sizeChartData.length === 0) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <Text style={styles.noDataText}>No size chart data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <Text style={styles.selectSizeText}>Select size in</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                measurementUnit === 'in' && styles.unitButtonActive,
              ]}
              onPress={() => setMeasurementUnit('in')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  measurementUnit === 'in' && styles.unitButtonTextActive,
                ]}
              >
                in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                measurementUnit === 'cm' && styles.unitButtonActive,
              ]}
              onPress={() => setMeasurementUnit('cm')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  measurementUnit === 'cm' && styles.unitButtonTextActive,
                ]}
              >
                cm
              </Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* Size Chart Table */}
        <View style={styles.tableContainer}>
          {/* Table Header - Dynamic based on available fields */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Size</Text>
            {sizeChartData[0]?.chestCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Chest({measurementUnit})
              </Text>
            )}
            {sizeChartData[0]?.frontLengthCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Length({measurementUnit})
              </Text>
            )}
            {sizeChartData[0]?.acrossShoulderCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Shoulder({measurementUnit})
              </Text>
            )}
            {sizeChartData[0]?.waistCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Waist({measurementUnit})
              </Text>
            )}
            {sizeChartData[0]?.inseamCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Inseam({measurementUnit})
              </Text>
            )}
            {sizeChartData[0]?.hipCm !== 'N/A' && (
              <Text style={styles.tableHeaderText}>
                Hip({measurementUnit})
              </Text>
            )}
          </View>

          {/* Table Rows - Dynamic Data with all available measurements */}
          {sizeChartData.map((item, index, array) => (
            <View 
              key={item.size} 
              style={[
                styles.tableRow,
                index === array.length - 1 && styles.lastTableRow
              ]}
            >
              <Text style={styles.tableCellText}>{item.size}</Text>
              {item.chestCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.chestCm : item.chestIn}
                </Text>
              )}
              {item.frontLengthCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.frontLengthCm : item.frontLengthIn}
                </Text>
              )}
              {item.acrossShoulderCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.acrossShoulderCm : item.acrossShoulderIn}
                </Text>
              )}
              {item.waistCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.waistCm : item.waistIn}
                </Text>
              )}
              {item.inseamCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.inseamCm : item.inseamIn}
                </Text>
              )}
              {item.hipCm !== 'N/A' && (
                <Text style={styles.tableCellText}>
                  {measurementUnit === 'cm' ? item.hipCm : item.hipIn}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHowToMeasure = () => {
    if (loading) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.black} />
          <Text style={styles.loadingText}>Loading measurement guide...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadProductSizeData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>


        <View style={styles.measurementImageContainer}>
          {/* Dynamic Measurement Image or Placeholder */}
          {sizeChartImage?.url ? (
            <Image
              source={{ uri: sizeChartImage.url }}
              style={styles.measurementImage}
              resizeMode="contain"
              onError={(imageError) => {
                console.warn('Failed to load measurement image:', sizeChartImage.url);
                console.warn('Image error:', imageError);
              }}
              onLoad={() => {
                console.log('✅ Measurement image loaded successfully:', sizeChartImage.url);
              }}
            />
          ) : (
            <View style={styles.measurementPlaceholder}>
              {/* Placeholder for measurement illustration */}
              <View style={styles.pantsDiagram}>
                {/* Waist measurement */}
                <View style={styles.waistMeasurement}>
                  <Text style={styles.measurementLabel}>To Fit Waist</Text>
                  <View style={styles.measurementLine} />
                </View>
                
                {/* Rise measurement */}
                <View style={styles.riseMeasurement}>
                  <Text style={styles.measurementLabel}>Rise</Text>
                </View>
                
                {/* Thigh measurement */}
                <View style={styles.thighMeasurement}>
                  <Text style={styles.measurementLabel}>Thigh</Text>
                </View>
                
                {/* Inseam measurement */}
                <View style={styles.inseamMeasurement}>
                  <Text style={styles.measurementLabel}>Inseam</Text>
                  <View style={styles.measurementLineVertical} />
                </View>
                
                {/* Outseam measurement */}
                <View style={styles.outseamMeasurement}>
                  <Text style={styles.measurementLabel}>Outseam Length</Text>
                </View>
                
                {/* Bottom hem measurement */}
                <View style={styles.bottomHemMeasurement}>
                  <Text style={styles.measurementLabel}>Bottom Hem</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section with Swipe Gesture */}
      <View style={styles.headerSection} {...panResponder.panHandlers}>
        {/* Handle */}
        <View style={styles.drawerHandle} />

        {/* Header */}
        <Text style={styles.headerTitle}>SIZE SELECTION</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'sizeChart' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('sizeChart')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'sizeChart' && styles.activeTabText,
              ]}
            >
              Size Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'howToMeasure' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('howToMeasure')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'howToMeasure' && styles.activeTabText,
              ]}
            >
              How To Measure
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {activeTab === 'sizeChart' ? renderSizeChart() : renderHowToMeasure()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerSection: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    minHeight: 80,
  },
  drawerHandle: {
    width: 64,
    height: 6,
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.black,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    letterSpacing: -0.16,
  },
  activeTabText: {
    color: Colors.black,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  selectSizeText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    letterSpacing: -0.14,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 40,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: Colors.black,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    letterSpacing: -0.14,
  },
  unitButtonTextActive: {
    color: Colors.white,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.black,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCellText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.14,
  },
  measurementImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  measurementPlaceholder: {
    width: screenWidth - 48,
    height: 400,
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pantsDiagram: {
    width: 200,
    height: 350,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waistMeasurement: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    marginBottom: 4,
  },
  measurementLine: {
    width: 80,
    height: 1,
    backgroundColor: '#767676',
  },
  measurementLineVertical: {
    width: 1,
    height: 120,
    backgroundColor: '#767676',
  },
  riseMeasurement: {
    position: 'absolute',
    top: 80,
    left: -60,
  },
  thighMeasurement: {
    position: 'absolute',
    top: 140,
    left: -60,
  },
  inseamMeasurement: {
    position: 'absolute',
    top: 100,
    right: -80,
    alignItems: 'center',
  },
  outseamMeasurement: {
    position: 'absolute',
    top: 200,
    right: -80,
  },
  bottomHemMeasurement: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  // Loading and error states
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.red || '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  retryButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  measurementImage: {
    width: screenWidth - 48,
    height: 300,
    borderRadius: 8,
  },
  placeholderImageContainer: {
    width: screenWidth - 48,
    height: 300,
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImageText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: '#767676',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default FavouritesSizeChartReference;
