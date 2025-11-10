import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
  PanResponder,
} from 'react-native';
import { Colors } from '../constants';
import apiService from '../services/apiService';

const { height: screenHeight } = Dimensions.get('window');

const BagSizeSelectorSizeChart = ({ visible, onClose, product }) => {
  const [activeTab, setActiveTab] = useState('sizeChart'); // 'sizeChart' or 'howToMeasure'
  const [measurementUnit, setMeasurementUnit] = useState('cm'); // 'cm' or 'in'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic data state
  const [sizeChartData, setSizeChartData] = useState([]);
  const [sizeChartImage, setSizeChartImage] = useState(null);

  // Load dynamic data from API when modal becomes visible
  useEffect(() => {
    if (visible && product) {
      loadProductSizeData();
    }
  }, [visible, product]);

  const loadProductSizeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [Bag Size Chart] Loading size chart data for product:', product);

      if (!product?._id && !product?.productId && !product?.itemId && !product?.id) {
        console.log('⚠️ [Bag Size Chart] No product ID found');
        setSizeChartData([]);
        setError('Product ID not available');
        setLoading(false);
        return;
      }

      const productId = product._id || product.productId || product.itemId || product.id;
      console.log('🔍 [Bag Size Chart] Fetching product with ID:', productId);
      
      const response = await apiService.getItemById(productId);

      if (response?.data) {
        const matchingProduct = response.data;
        console.log('✅ [Bag Size Chart] Found product:', matchingProduct.productName);
        
        if (matchingProduct.sizes && matchingProduct.sizes.length > 0) {
          const dynamicSizes = matchingProduct.sizes
            .filter(size => size.size)
            .map(size => {
              // Helper function to safely get value with multiple field name variations
              const getValue = (obj, keys) => {
                for (const key of keys) {
                  if (obj.hasOwnProperty(key)) {
                    const val = obj[key];
                    if (val !== undefined && val !== null && val !== '' && val !== 'N/A' && val !== '-') {
                      const numVal = Number(val);
                      return !isNaN(numVal) ? numVal : val;
                    }
                  }
                }
                return null;
              };
              
              // Extract measurements with camelCase priority to match backend structure
              const chestCm = getValue(size, ['chestCm', 'Chest (cm)', 'chest (cm)']);
              const chestIn = getValue(size, ['chestIn', 'Chest (in)', 'chest (in)']);
              const frontLengthCm = getValue(size, ['frontLengthCm', 'Front Length (cm)', 'length (cm)', 'Length (cm)']);
              const frontLengthIn = getValue(size, ['frontLengthIn', 'Front Length (in)', 'length (in)', 'Length (in)']);
              const shoulderCm = getValue(size, ['acrossShoulderCm', 'Shoulder (cm)', 'shoulder (cm)', 'shoulderCm']);
              const shoulderIn = getValue(size, ['acrossShoulderIn', 'Shoulder (in)', 'shoulder (in)', 'shoulderIn']);
              const waistCm = getValue(size, ['fitWaistCm', 'Waist (cm)', 'waist (cm)', 'waistCm']);
              const waistIn = getValue(size, ['toFitWaistIn', 'Waist (in)', 'waist (in)', 'waistIn']);
              const inseamCm = getValue(size, ['inseamLengthCm', 'Inseam (cm)', 'inseam (cm)', 'inseamCm']);
              const inseamIn = getValue(size, ['inseamLengthIn', 'Inseam (in)', 'inseam (in)', 'inseamIn']);
              const hipCm = getValue(size, ['hipCm', 'Hip (cm)', 'hip (cm)']);
              const hipIn = getValue(size, ['hipIn', 'Hip (in)', 'hip (in)']);
              
              return {
                size: size.size,
                chestCm,
                chestIn,
                frontLengthCm,
                frontLengthIn,
                acrossShoulderCm: shoulderCm,
                acrossShoulderIn: shoulderIn,
                waistCm,
                waistIn,
                inseamCm,
                inseamIn,
                hipCm,
                hipIn,
              };
            });
          
          setSizeChartData(dynamicSizes);
          console.log('✅ [Bag Size Chart] Size chart data loaded with all measurements:', dynamicSizes);
        } else {
          setSizeChartData([]);
          setError('No size information available');
        }

        if (matchingProduct.sizeChartImage?.url) {
          setSizeChartImage(matchingProduct.sizeChartImage);
          console.log('✅ [Bag Size Chart] Size chart image found');
        }
      } else {
        setSizeChartData([]);
        setError('Product not found');
      }
      
    } catch (err) {
      console.error('❌ [Bag Size Chart] Error loading:', err);
      setError('Failed to load size chart data');
    } finally {
      setLoading(false);
    }
  }, [product]);

  const sizeData = {
    US: {
      in: [
        { size: 'XS', chest: '32-34', waist: '26-28', hips: '34-36' },
        { size: 'S', chest: '34-36', waist: '28-30', hips: '36-38' },
        { size: 'M', chest: '36-38', waist: '30-32', hips: '38-40' },
        { size: 'L', chest: '38-40', waist: '32-34', hips: '40-42' },
        { size: 'XL', chest: '40-42', waist: '34-36', hips: '42-44' },
        { size: 'XXL', chest: '42-44', waist: '36-38', hips: '44-46' },
      ],
      cm: [
        { size: 'XS', chest: '81-86', waist: '66-71', hips: '86-91' },
        { size: 'S', chest: '86-91', waist: '71-76', hips: '91-97' },
        { size: 'M', chest: '91-97', waist: '76-81', hips: '97-102' },
        { size: 'L', chest: '97-102', waist: '81-86', hips: '102-107' },
        { size: 'XL', chest: '102-107', waist: '86-91', hips: '107-112' },
        { size: 'XXL', chest: '107-112', waist: '91-97', hips: '112-117' },
      ],
    },
    UK: {
      in: [
        { size: '6', chest: '32', waist: '26', hips: '34' },
        { size: '8', chest: '34', waist: '28', hips: '36' },
        { size: '10', chest: '36', waist: '30', hips: '38' },
        { size: '12', chest: '38', waist: '32', hips: '40' },
        { size: '14', chest: '40', waist: '34', hips: '42' },
        { size: '16', chest: '42', waist: '36', hips: '44' },
      ],
      cm: [
        { size: '6', chest: '81', waist: '66', hips: '86' },
        { size: '8', chest: '86', waist: '71', hips: '91' },
        { size: '10', chest: '91', waist: '76', hips: '97' },
        { size: '12', chest: '97', waist: '81', hips: '102' },
        { size: '14', chest: '102', waist: '86', hips: '107' },
        { size: '16', chest: '107', waist: '91', hips: '112' },
      ],
    },
  };

  const handleClose = () => {
    onClose();
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

    if (error || !sizeChartData || sizeChartData.length === 0) {
      return (
        <View style={[styles.contentContainer, styles.centerContent]}>
          <Text style={styles.errorText}>{error || 'No size chart data available'}</Text>
          <TouchableOpacity onPress={loadProductSizeData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.unitSelectionContainer}>
          <Text style={styles.selectSizeText}>Select size in</Text>
          <View style={styles.unitToggle}>
            {['in', 'cm'].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitOption,
                  measurementUnit === unit ? styles.activeUnit : styles.inactiveUnit
                ]}
                onPress={() => setMeasurementUnit(unit)}
              >
                <Text style={[
                  styles.unitText,
                  measurementUnit === unit ? styles.activeUnitText : styles.inactiveUnitText
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={{ marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <View style={styles.tableContainer}>
            {/* Table Header - Dynamic based on available fields */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Size</Text>
              {/* Only show columns that have data in at least one size variant */}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.chestCm : item.chestIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Chest ({measurementUnit})
                </Text>
              )}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.frontLengthCm : item.frontLengthIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Length ({measurementUnit})
                </Text>
              )}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.acrossShoulderCm : item.acrossShoulderIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Shoulder ({measurementUnit})
                </Text>
              )}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.waistCm : item.waistIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Waist ({measurementUnit})
                </Text>
              )}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.inseamCm : item.inseamIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Inseam ({measurementUnit})
                </Text>
              )}
              {sizeChartData.some(item => {
                const value = measurementUnit === 'cm' ? item.hipCm : item.hipIn;
                return value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== '-';
              }) && (
                <Text style={styles.headerText}>
                  Hip ({measurementUnit})
                </Text>
              )}
            </View>
            
            {/* Table Rows - Dynamic Data with all available measurements */}
            {sizeChartData.map((item, index) => {
              // Helper function to get measurement value based on unit
              const getMeasurement = (cmField, inField) => {
                const value = measurementUnit === 'cm' ? item[cmField] : item[inField];
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
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cellText}>{item.size}</Text>
                  {shouldShowColumn('chestCm', 'chestIn') && (
                    <Text style={styles.cellText}>
                      {getMeasurement('chestCm', 'chestIn')}
                    </Text>
                  )}
                  {shouldShowColumn('frontLengthCm', 'frontLengthIn') && (
                    <Text style={styles.cellText}>
                      {getMeasurement('frontLengthCm', 'frontLengthIn')}
                    </Text>
                  )}
                  {shouldShowColumn('acrossShoulderCm', 'acrossShoulderIn') && (
                    <Text style={styles.cellText}>
                      {getMeasurement('acrossShoulderCm', 'acrossShoulderIn')}
                    </Text>
                  )}
                  {shouldShowColumn('waistCm', 'waistIn') && (
                    <Text style={styles.cellText}>
                      {getMeasurement('waistCm', 'waistIn')}
                    </Text>
                  )}
                  {shouldShowColumn('inseamCm', 'inseamIn') && (
                    <Text style={styles.cellText}>
                      {getMeasurement('inseamCm', 'inseamIn')}
                    </Text>
                  )}
                  {shouldShowColumn('hipCm', 'hipIn') && (
                    <Text style={styles.cellText}>
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
    if (sizeChartImage?.url) {
      return (
        <View style={styles.contentContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.measurementGuideTitle}>How to Measure</Text>
            <Image
              source={{ uri: sizeChartImage.url }}
              style={styles.measurementImage}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      );
    }
    return (
      <View style={[styles.contentContainer, styles.centerContent]}>
        <Text style={styles.noDataText}>No measurement guide available</Text>
      </View>
    );
  };

  const renderTable = () => {
    const data = sizeData[activeTab]?.in || [];
    
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Size</Text>
          <Text style={styles.headerText}>Chest</Text>
          <Text style={styles.headerText}>Waist</Text>
          <Text style={styles.headerText}>Hips</Text>
        </View>
        
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cellText}>{item.size}</Text>
            <Text style={styles.cellText}>{item.chest}</Text>
            <Text style={styles.cellText}>{item.waist}</Text>
            <Text style={styles.cellText}>{item.hips}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          
          {/* Header */}
          <Text style={styles.headerTitle}>Size Chart</Text>
          
          {/* Tab Container - Size Chart / How to Measure */}
          <View style={styles.tabContainer}>
            {['sizeChart', 'howToMeasure'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab === 'sizeChart' ? 'Size Chart' : 'How to Measure'}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Content */}
          {activeTab === 'sizeChart' ? renderSizeChart() : renderHowToMeasure()}
          
          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: screenHeight * 0.7,
    maxHeight: screenHeight * 0.9,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 51,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
  },
  activeTabText: {
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 11,
    right: 11,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 50,
  },
  contentContainer: {
    flex: 1,
  },
  unitSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 20,
    height: 45,
  },
  selectSizeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.4,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: 30,
    width: 80,
    padding: 0,
  },
  unitOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  activeUnit: {
    backgroundColor: '#000000',
  },
  inactiveUnit: {
    backgroundColor: 'transparent',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
  },
  activeUnitText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inactiveUnitText: {
    color: '#000000',
    fontWeight: '400',
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: '#000000',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    minWidth: 80,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tableRow: {
    backgroundColor: '#FFFFFF',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  cellText: {
    minWidth: 80,
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  measurementText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginTop: 50,
    letterSpacing: -0.4,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 19.2,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FF0000',
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
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
  },
  measurementGuideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  measurementImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
});

export default BagSizeSelectorSizeChart;