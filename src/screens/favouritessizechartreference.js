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
  Modal,
  TouchableWithoutFeedback,
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

      // SKIP passed data and ALWAYS fetch from API for correct field mapping
      const skipPassedData = true;
      
      if (false && passedSizeChartData && passedSizeChartData.length > 0) {
        // This block is now disabled - we always fetch from API
        console.log('✅ Using passed size chart data (will process for field mapping):', passedSizeChartData);
        console.log('📋 Raw passed data structure:', JSON.stringify(passedSizeChartData[0], null, 2));
        
        // Process passed data through the same extraction logic to ensure consistent field mapping
        const processedSizes = passedSizeChartData.map(size => {
          console.log('===========================================');
          console.log('📏 RAW PASSED SIZE OBJECT:', JSON.stringify(size, null, 2));
          console.log('📏 All available keys:', Object.keys(size));
          
          // Helper function to safely get value - checks if value is valid number or string
          const getValue = (obj, keys) => {
            for (const key of keys) {
              if (obj.hasOwnProperty(key)) {
                const val = obj[key];
                console.log(`  🔍 Checking key "${key}": ${JSON.stringify(val)} (type: ${typeof val})`);
                // Check if value exists and is not empty (0 is valid)
                if (val !== undefined && val !== null && val !== '' && val !== 'N/A' && val !== '-') {
                  // Convert to number if it's a numeric string, otherwise return as is
                  const numVal = Number(val);
                  const result = !isNaN(numVal) ? numVal : val;
                  console.log(`  ✅ FOUND value for "${key}": ${result}`);
                  return result;
                }
              }
            }
            console.log(`  ❌ No value found for keys: ${keys.join(', ')}`);
            return null;
          };
          
          // Extract measurements with camelCase priority
          const chestCm = getValue(size, ['chestCm', 'Chest (cm)', 'chest (cm)', 'chest_cm', 'Chest', 'chest']);
          const chestIn = getValue(size, ['chestIn', 'Chest (in)', 'chest (in)', 'chest_in']);
          const frontLengthCm = getValue(size, ['frontLengthCm', 'Front Length (cm)', 'frontLength (cm)', 'length (cm)', 'Length (cm)', 'front_length_cm', 'Length', 'length']);
          const frontLengthIn = getValue(size, ['frontLengthIn', 'Front Length (in)', 'frontLength (in)', 'length (in)', 'Length (in)', 'front_length_in']);
          const shoulderCm = getValue(size, ['acrossShoulderCm', 'Shoulder (cm)', 'shoulder (cm)', 'Across Shoulder (cm)', 'shoulderCm', 'shoulder_cm', 'across_shoulder_cm', 'Shoulder', 'shoulder']);
          const shoulderIn = getValue(size, ['acrossShoulderIn', 'Shoulder (in)', 'shoulder (in)', 'Across Shoulder (in)', 'shoulderIn', 'shoulder_in', 'across_shoulder_in']);
          const waistCm = getValue(size, ['fitWaistCm', 'Waist (cm)', 'waist (cm)', 'To Fit Waist (cm)', 'Fit Waist (cm)', 'waistCm', 'waist_cm', 'fit_waist_cm', 'Waist', 'waist']);
          const waistIn = getValue(size, ['toFitWaistIn', 'Waist (in)', 'waist (in)', 'To Fit Waist (in)', 'Fit Waist (in)', 'waistIn', 'waist_in', 'to_fit_waist_in']);
          const inseamCm = getValue(size, ['inseamLengthCm', 'Inseam (cm)', 'inseam (cm)', 'Inseam Length (cm)', 'inseamCm', 'inseam_cm', 'inseam_length_cm', 'Inseam', 'inseam']);
          const inseamIn = getValue(size, ['inseamLengthIn', 'Inseam (in)', 'inseam (in)', 'Inseam Length (in)', 'inseamIn', 'inseam_in', 'inseam_length_in']);
          const hipCm = getValue(size, ['hipCm', 'Hip (cm)', 'hip (cm)', 'hip_cm', 'Hip', 'hip']);
          const hipIn = getValue(size, ['hipIn', 'Hip (in)', 'hip (in)', 'hip_in']);
          
          console.log('📏 Extracted measurements from passed data:', {
            size: size.size,
            chest: `${chestCm}cm / ${chestIn}in`,
            frontLength: `${frontLengthCm}cm / ${frontLengthIn}in`,
            shoulder: `${shoulderCm}cm / ${shoulderIn}in`,
            waist: `${waistCm}cm / ${waistIn}in`,
            inseam: `${inseamCm}cm / ${inseamIn}in`,
            hip: `${hipCm}cm / ${hipIn}in`
          });
          
          return {
            size: size.size,
            chestCm: chestCm !== null ? chestCm : null,
            chestIn: chestIn !== null ? chestIn : null,
            frontLengthCm: frontLengthCm !== null ? frontLengthCm : null,
            frontLengthIn: frontLengthIn !== null ? frontLengthIn : null,
            acrossShoulderCm: shoulderCm !== null ? shoulderCm : null,
            acrossShoulderIn: shoulderIn !== null ? shoulderIn : null,
            waistCm: waistCm !== null ? waistCm : null,
            waistIn: waistIn !== null ? waistIn : null,
            inseamCm: inseamCm !== null ? inseamCm : null,
            inseamIn: inseamIn !== null ? inseamIn : null,
            hipCm: hipCm !== null ? hipCm : null,
            hipIn: hipIn !== null ? hipIn : null,
            quantity: size.quantity || 0,
            stock: size.stock || 0,
            regularPrice: size.regularPrice || 0,
            salePrice: size.salePrice || 0,
            available: (size.stock || 0) > 0
          };
        });
        
        setSizeChartData(processedSizes);
        console.log('✅ Processed passed size chart data:', processedSizes);
        console.log('📊 Final sizeChartData structure:', JSON.stringify(processedSizes, null, 2));
      }

      if (passedSizeChartImage) {
        console.log('✅ Using passed size chart image:', passedSizeChartImage.url);
        setSizeChartImage(passedSizeChartImage);
      }

      // ALWAYS fetch from API to ensure latest field mappings
      // (Passed data may have been extracted with old field name logic)
      console.log('🔍 Fetching fresh data from API to ensure all measurements...');
      if (true) { // Always fetch
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
              .map(size => {
                // Log the size object to see what fields are actually available
                console.log('===========================================');
                console.log('📏 RAW SIZE OBJECT:', JSON.stringify(size, null, 2));
                console.log('📏 All available keys:', Object.keys(size));
                
                // Log each field individually to see exact values
                Object.keys(size).forEach(key => {
                  console.log(`📏 Field "${key}" = ${JSON.stringify(size[key])}`);
                });
                
                // Helper function to safely get value - checks if value is valid number or string
                const getValue = (obj, keys) => {
                  for (const key of keys) {
                    if (obj.hasOwnProperty(key)) {
                      const val = obj[key];
                      console.log(`  🔍 Checking key "${key}": ${JSON.stringify(val)} (type: ${typeof val})`);
                      // Check if value exists and is not empty (0 is valid)
                      if (val !== undefined && val !== null && val !== '' && val !== 'N/A' && val !== '-') {
                        // Convert to number if it's a numeric string, otherwise return as is
                        const numVal = Number(val);
                        const result = !isNaN(numVal) ? numVal : val;
                        console.log(`  ✅ FOUND value for "${key}": ${result}`);
                        return result;
                      }
                    }
                  }
                  console.log(`  ❌ No value found for keys: ${keys.join(', ')}`);
                  return null;
                };
                
                // Extract measurements with ALL possible backend field name variations
                // Priority order: camelCase FIRST (matches backend structure) -> "Field (unit)" format -> snake_case -> plain
                const chestCm = getValue(size, ['chestCm', 'Chest (cm)', 'chest (cm)', 'chest_cm', 'Chest', 'chest']);
                const chestIn = getValue(size, ['chestIn', 'Chest (in)', 'chest (in)', 'chest_in']);
                const frontLengthCm = getValue(size, ['frontLengthCm', 'Front Length (cm)', 'frontLength (cm)', 'length (cm)', 'Length (cm)', 'front_length_cm', 'Length', 'length']);
                const frontLengthIn = getValue(size, ['frontLengthIn', 'Front Length (in)', 'frontLength (in)', 'length (in)', 'Length (in)', 'front_length_in']);
                const shoulderCm = getValue(size, ['acrossShoulderCm', 'Shoulder (cm)', 'shoulder (cm)', 'Across Shoulder (cm)', 'shoulderCm', 'shoulder_cm', 'across_shoulder_cm', 'Shoulder', 'shoulder']);
                const shoulderIn = getValue(size, ['acrossShoulderIn', 'Shoulder (in)', 'shoulder (in)', 'Across Shoulder (in)', 'shoulderIn', 'shoulder_in', 'across_shoulder_in']);
                const waistCm = getValue(size, ['fitWaistCm', 'Waist (cm)', 'waist (cm)', 'To Fit Waist (cm)', 'Fit Waist (cm)', 'waistCm', 'waist_cm', 'fit_waist_cm', 'Waist', 'waist']);
                const waistIn = getValue(size, ['toFitWaistIn', 'Waist (in)', 'waist (in)', 'To Fit Waist (in)', 'Fit Waist (in)', 'waistIn', 'waist_in', 'to_fit_waist_in']);
                const inseamCm = getValue(size, ['inseamLengthCm', 'Inseam (cm)', 'inseam (cm)', 'Inseam Length (cm)', 'inseamCm', 'inseam_cm', 'inseam_length_cm', 'Inseam', 'inseam']);
                const inseamIn = getValue(size, ['inseamLengthIn', 'Inseam (in)', 'inseam (in)', 'Inseam Length (in)', 'inseamIn', 'inseam_in', 'inseam_length_in']);
                const hipCm = getValue(size, ['hipCm', 'Hip (cm)', 'hip (cm)', 'hip_cm', 'Hip', 'hip']);
                const hipIn = getValue(size, ['hipIn', 'Hip (in)', 'hip (in)', 'hip_in']);
                
                console.log('📏 Extracted measurements:', {
                  size: size.size,
                  chest: `${chestCm}cm / ${chestIn}in`,
                  frontLength: `${frontLengthCm}cm / ${frontLengthIn}in`,
                  shoulder: `${shoulderCm}cm / ${shoulderIn}in`,
                  waist: `${waistCm}cm / ${waistIn}in`,
                  inseam: `${inseamCm}cm / ${inseamIn}in`,
                  hip: `${hipCm}cm / ${hipIn}in`
                });
                
                return {
                  size: size.size,
                  // Map all available backend fields - use null instead of 0 for missing values
                  chestCm: chestCm !== null ? chestCm : null,
                  chestIn: chestIn !== null ? chestIn : null,
                  frontLengthCm: frontLengthCm !== null ? frontLengthCm : null,
                  frontLengthIn: frontLengthIn !== null ? frontLengthIn : null,
                  acrossShoulderCm: shoulderCm !== null ? shoulderCm : null,
                  acrossShoulderIn: shoulderIn !== null ? shoulderIn : null,
                  waistCm: waistCm !== null ? waistCm : null,
                  waistIn: waistIn !== null ? waistIn : null,
                  inseamCm: inseamCm !== null ? inseamCm : null,
                  inseamIn: inseamIn !== null ? inseamIn : null,
                  hipCm: hipCm !== null ? hipCm : null,
                  hipIn: hipIn !== null ? hipIn : null,
                  quantity: size.quantity || 0,
                  stock: size.stock || 0,
                  regularPrice: size.regularPrice || 0,
                  salePrice: size.salePrice || 0,
                  available: (size.stock || 0) > 0
                };
              });
            
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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('FavouritesModalOverlayForSizeSelection', route.params);
    }
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          <View style={styles.tableContainer}>
            {/* Table Header - Dynamic based on available fields */}
            {/* Debug: Log what data we have */}
            {console.log('🔍 [Render] sizeChartData:', JSON.stringify(sizeChartData, null, 2))}
            {console.log('🔍 [Render] measurementUnit:', measurementUnit)}
            {sizeChartData.length > 0 && console.log('🔍 [Render] First item keys:', Object.keys(sizeChartData[0]))}
            {sizeChartData.length > 0 && console.log('🔍 [Render] Sample values:', {
              chestCm: sizeChartData[0].chestCm,
              chestIn: sizeChartData[0].chestIn,
              waistCm: sizeChartData[0].waistCm,
              waistIn: sizeChartData[0].waistIn,
              inseamCm: sizeChartData[0].inseamCm,
              inseamIn: sizeChartData[0].inseamIn
            })}
            <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Size</Text>
            {/* Only show columns that have data in at least one size variant */}
            {sizeChartData.some(item => {
              const value = measurementUnit === 'cm' ? item.chestCm : item.chestIn;
              return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
            }) && (
              <Text style={styles.tableHeaderText}>
                Chest ({measurementUnit})
              </Text>
            )}
            {sizeChartData.some(item => {
              const value = measurementUnit === 'cm' ? item.frontLengthCm : item.frontLengthIn;
              return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
            }) && (
              <Text style={styles.tableHeaderText}>
                Length ({measurementUnit})
              </Text>
            )}
            {sizeChartData.some(item => {
              const value = measurementUnit === 'cm' ? item.acrossShoulderCm : item.acrossShoulderIn;
              return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
            }) && (
              <Text style={styles.tableHeaderText}>
                Shoulder ({measurementUnit})
              </Text>
            )}
            {/* Always show waist column if data has waist measurements */}
            <Text style={styles.tableHeaderText}>
              Waist ({measurementUnit})
            </Text>
            {/* Always show inseam column if data has inseam measurements */}
            <Text style={styles.tableHeaderText}>
              Inseam ({measurementUnit})
            </Text>
            {sizeChartData.some(item => {
              const value = measurementUnit === 'cm' ? item.hipCm : item.hipIn;
              return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
            }) && (
              <Text style={styles.tableHeaderText}>
                Hip ({measurementUnit})
              </Text>
            )}
          </View>

          {/* Table Rows - Dynamic Data with all available measurements */}
          {sizeChartData.map((item, index, array) => {
            // Helper function to get measurement value based on unit
            const getMeasurement = (cmField, inField) => {
              const value = measurementUnit === 'cm' ? item[cmField] : item[inField];
              // Return '-' if value is null, undefined, 'N/A', or empty string (but 0 is valid)
              if (value === null || value === undefined || value === 'N/A' || value === '-' || value === '') {
                return '-';
              }
              return value;
            };

            // Helper to check if column should be shown
            const shouldShowColumn = (cmField, inField) => {
              return sizeChartData.some(i => {
                const value = measurementUnit === 'cm' ? i[cmField] : i[inField];
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              });
            };

            return (
              <View 
                key={`${item.size}-${index}`} 
                style={[
                  styles.tableRow,
                  index === array.length - 1 && styles.lastTableRow
                ]}
              >
                <Text style={styles.tableCellText}>{item.size}</Text>
                {shouldShowColumn('chestCm', 'chestIn') && (
                  <Text style={styles.tableCellText}>
                    {getMeasurement('chestCm', 'chestIn')}
                  </Text>
                )}
                {shouldShowColumn('frontLengthCm', 'frontLengthIn') && (
                  <Text style={styles.tableCellText}>
                    {getMeasurement('frontLengthCm', 'frontLengthIn')}
                  </Text>
                )}
                {shouldShowColumn('acrossShoulderCm', 'acrossShoulderIn') && (
                  <Text style={styles.tableCellText}>
                    {getMeasurement('acrossShoulderCm', 'acrossShoulderIn')}
                  </Text>
                )}
                {/* Always show waist cell */}
                <Text style={styles.tableCellText}>
                  {getMeasurement('waistCm', 'waistIn')}
                </Text>
                {/* Always show inseam cell */}
                <Text style={styles.tableCellText}>
                  {getMeasurement('inseamCm', 'inseamIn')}
                </Text>
                {shouldShowColumn('hipCm', 'hipIn') && (
                  <Text style={styles.tableCellText}>
                    {getMeasurement('hipCm', 'hipIn')}
                  </Text>
                )}
              </View>
            );
          })}
          </View>
        </ScrollView>
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
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    minHeight: '70%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  headerSection: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
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
    marginBottom: 16,
    letterSpacing: -0.16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
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
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
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
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    minWidth: 80,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.2,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCellText: {
    minWidth: 80,
    fontSize: 15,
    fontWeight: '400',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.2,
    paddingHorizontal: 8,
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
    minHeight: 300,
    paddingVertical: 40,
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
