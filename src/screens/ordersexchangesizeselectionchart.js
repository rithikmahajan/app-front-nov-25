import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GlobalBackButton } from '../components';
import ModalExchange from './ordersexchangethankyoumodal';
import yoraaAPI from '../services/yoraaAPI';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const OrdersExchangeSizeSelectionChart = ({ navigation, route }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('sizeChart');
  const [unit, setUnit] = useState('cm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [productSizes, setProductSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalExchangeRef = useRef(null);

  // Get order data from route params
  const orderId = route?.params?.orderId;
  const routeOrderData = route?.params?.orderData;

  // Fetch order and product data
  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        Alert.alert('Error', 'Order ID is missing');
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        
        // If we have order data from route, use it, otherwise fetch
        let order = routeOrderData;
        if (!order) {
          console.log('📦 Fetching order details for:', orderId);
          const orderResponse = await yoraaAPI.makeRequest(
            `/api/orders/${orderId}`,
            'GET',
            null,
            true
          );

          if (orderResponse.success && orderResponse.data) {
            order = orderResponse.data;
          } else {
            throw new Error('Failed to fetch order details');
          }
        }

        setOrderData(order);

        // Fetch product details to get available sizes
        if (order.items && order.items.length > 0) {
          const productId = order.items[0].product || order.items[0].productId;
          if (productId) {
            console.log('📦 Fetching product details for:', productId);
            const productResponse = await yoraaAPI.makeRequest(
              `/api/items/${productId}`,
              'GET',
              null,
              true
            );

            if (productResponse.success && productResponse.data) {
              const product = productResponse.data;
              console.log('✅ Product data fetched:', product);
              
              // Format sizes for display
              if (product.sizes && Array.isArray(product.sizes)) {
                const formattedSizes = product.sizes.map(size => ({
                  id: size.size || size.name,
                  name: size.size || size.name,
                  waist: size.waist || '71.1',
                  inseam: size.inseam || '70.1',
                  available: size.quantity > 0,
                  stock: size.quantity || 0
                }));
                setProductSizes(formattedSizes);
                
                // Set default selected size if current size is unavailable
                const currentSize = order.items[0].size;
                const currentSizeAvailable = formattedSizes.find(
                  s => s.id === currentSize && s.available
                );
                
                if (!currentSizeAvailable && formattedSizes.length > 0) {
                  // Select first available size
                  const firstAvailable = formattedSizes.find(s => s.available);
                  if (firstAvailable) {
                    setSelectedSize(firstAvailable.id);
                  }
                }
              } else {
                // Fallback to default sizes if product doesn't have sizes
                setProductSizes([
                  { id: 'S', name: 'S', waist: '71.1', inseam: '70.1', available: false },
                  { id: 'M', name: 'M', waist: '71.1', inseam: '70.1', available: true },
                  { id: 'L', name: 'L', waist: '71.1', inseam: '70.1', available: true },
                  { id: 'XL', name: 'XL', waist: '71.1', inseam: '70.1', available: true },
                  { id: 'XXL', name: 'XXL', waist: '71.1', inseam: '70.1', available: true },
                ]);
                setSelectedSize('M');
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        Alert.alert(
          'Error',
          'Failed to load product details. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, routeOrderData, navigation]);

  const handleSizeSelect = (sizeId) => {
    // Find the size to check if it's available
    const size = productSizes.find(s => s.id === sizeId);
    if (size && !size.available) {
      Alert.alert('Size Unavailable', `Size ${sizeId} is currently out of stock.`);
      return;
    }
    setSelectedSize(sizeId);
  };

  const handleExchange = async () => {
    if (!selectedSize) {
      Alert.alert('Error', 'Please select a size for exchange.');
      return;
    }

    if (!orderData || !orderData._id) {
      Alert.alert('Error', 'Order information is missing. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const exchangeData = {
        orderId: orderData._id,
        reason: orderData.exchangeReason || 'Size exchange',
        desiredSize: selectedSize,
      };

      console.log('🔄 Submitting exchange request for order:', orderData._id);
      
      const response = await yoraaAPI.makeRequest(
        '/api/orders/exchange',
        'POST',
        exchangeData,
        true
      );

      if (response.success) {
        console.log('✅ Exchange request successful:', response.data);
        
        // Open the exchange thank you modal with order and exchange details
        modalExchangeRef.current?.open({
          orderData: orderData,
          exchangeData: response.data,
          selectedSize: selectedSize
        });
      } else {
        throw new Error(response.message || 'Failed to submit exchange request');
      }
    } catch (error) {
      console.error('❌ Error submitting exchange request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit exchange request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSizeRow = (size, index) => {
    const isSelected = selectedSize === size.id;
    const isAvailable = size.available;
    
    // Determine background color based on availability
    const backgroundColor = !isAvailable ? '#EDEDED' : '#FFFFFF';
    
    return (
      <TouchableOpacity
        key={size.id}
        style={[
          styles.sizeRow,
          { backgroundColor },
          index > 0 && styles.sizeRowBorder // Add border to all rows except first
        ]}
        onPress={() => handleSizeSelect(size.id)}
        activeOpacity={isAvailable ? 0.7 : 1}
        disabled={!isAvailable}
      >
        <View style={styles.radioContainer}>
          <View style={[
            styles.radioButton, 
            isSelected && styles.radioButtonSelected,
            !isAvailable && styles.radioButtonUnavailable
          ]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
        <Text style={[
          styles.sizeText, 
          isSelected && styles.selectedText,
          !isAvailable && styles.unavailableText
        ]}>
          {size.name}
        </Text>
        <Text style={[
          styles.measurementText, 
          isSelected && styles.selectedText,
          !isAvailable && styles.unavailableText
        ]}>
          {size.waist}
        </Text>
        <Text style={[
          styles.measurementText, 
          isSelected && styles.selectedText,
          !isAvailable && styles.unavailableText,
          styles.centerText
        ]}>
          {size.inseam}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSizeChart = () => (
    <View style={styles.sizeChartContainer}>
      {/* Unit Selection */}
      <View style={styles.unitSelectionContainer}>
        <Text style={styles.selectSizeText}>Select size in</Text>
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'in' && styles.unitButtonInactive]}
            onPress={() => setUnit('in')}
          >
            <Text style={[styles.unitText, unit === 'in' && styles.unitTextInactive]}>in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, styles.unitButtonActive]}
            onPress={() => setUnit('cm')}
          >
            <Text style={[styles.unitText, styles.unitTextActive]}>cm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Size</Text>
        <Text style={styles.headerText}>To fit waist(cm)</Text>
        <Text style={styles.headerText}>Inseam Length(cm)</Text>
      </View>

      {/* Size Rows */}
      <View style={styles.sizeList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading sizes...</Text>
          </View>
        ) : productSizes.length > 0 ? (
          productSizes.map(renderSizeRow)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sizes available</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHowToMeasure = () => (
    <View style={styles.howToMeasureContainer}>
      <Text style={styles.howToMeasureText}>How to measure instructions will be displayed here.</Text>
      <Text style={styles.instructionText}>1. Use a soft measuring tape</Text>
      <Text style={styles.instructionText}>2. Measure around your natural waistline</Text>
      <Text style={styles.instructionText}>3. Keep the tape parallel to the floor</Text>
      <Text style={styles.instructionText}>4. Don't pull the tape too tight</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>SIZE CHART</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Container */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sizeChart' && styles.activeTab]}
            onPress={() => setActiveTab('sizeChart')}
          >
            <Text style={[styles.tabText, activeTab === 'sizeChart' && styles.activeTabText]}>
              Size Chart
            </Text>
            {activeTab === 'sizeChart' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'howToMeasure' && styles.activeTab]}
            onPress={() => setActiveTab('howToMeasure')}
          >
            <Text style={[styles.tabText, activeTab === 'howToMeasure' && styles.activeTabText]}>
              How To Measure
            </Text>
            {activeTab === 'howToMeasure' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'sizeChart' ? renderSizeChart() : renderHowToMeasure()}

        {/* Exchange Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.exchangeButton, isSubmitting && styles.exchangeButtonDisabled]}
            onPress={handleExchange}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.exchangeButtonText}>Exchange</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Exchange Thank You Modal */}
      <ModalExchange ref={modalExchangeRef} navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp(5.3) : isSmallDevice ? wp(3.5) : wp(4.3),
    paddingTop: isTablet ? hp(2.1) : isSmallDevice ? hp(1.7) : hp(2),
    paddingBottom: isTablet ? hp(1.6) : isSmallDevice ? hp(1.3) : hp(1.5),
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerRight: {
    width: isTablet ? wp(22.7) : isSmallDevice ? wp(14.4) : wp(18.1),
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: isTablet ? hp(6.7) : isSmallDevice ? hp(5.6) : hp(6.3),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  tabText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  activeTabText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: isTablet ? wp(3.7) : isSmallDevice ? wp(2.3) : wp(2.9),
    right: isTablet ? wp(3.7) : isSmallDevice ? wp(2.3) : wp(2.9),
    height: isTablet ? hp(0.3) : isSmallDevice ? hp(0.2) : hp(0.25),
    backgroundColor: '#000000',
    borderRadius: 50,
  },
  sizeChartContainer: {
    flex: 1,
  },
  unitSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp(5.3) : isSmallDevice ? wp(3.5) : wp(4.3),
    paddingVertical: isTablet ? hp(2.2) : isSmallDevice ? hp(1.9) : hp(2.1),
    backgroundColor: '#FFFFFF',
    height: isTablet ? hp(5.9) : isSmallDevice ? hp(4.9) : hp(5.6),
  },
  selectSizeText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: isTablet ? hp(4) : isSmallDevice ? hp(3.3) : hp(3.7),
    width: isTablet ? wp(26.7) : isSmallDevice ? wp(17.1) : wp(21.3),
    position: 'relative',
  },
  unitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  unitButtonActive: {
    backgroundColor: '#000000',
  },
  unitButtonInactive: {
    backgroundColor: 'transparent',
  },
  unitText: {
    fontSize: isTablet ? fs(14) : isSmallDevice ? fs(10) : fs(12),
    fontWeight: '400',
    fontFamily: 'Montserrat-Regular',
  },
  unitTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  unitTextInactive: {
    color: '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    height: isTablet ? hp(5.9) : isSmallDevice ? hp(4.9) : hp(5.6),
    alignItems: 'center',
    paddingHorizontal: isTablet ? wp(5.3) : isSmallDevice ? wp(3.5) : wp(4.3),
  },
  headerText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(11) : fs(13),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
  },
  sizeList: {
    backgroundColor: '#FFFFFF',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: isTablet ? hp(5.9) : isSmallDevice ? hp(4.9) : hp(5.6),
    paddingHorizontal: isTablet ? wp(5.3) : isSmallDevice ? wp(3.5) : wp(4.3),
  },
  sizeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  radioContainer: {
    width: isTablet ? wp(10) : isSmallDevice ? wp(6.4) : wp(8),
    alignItems: 'flex-start',
  },
  radioButton: {
    width: isTablet ? wp(4.3) : isSmallDevice ? wp(2.8) : wp(3.5),
    height: isTablet ? hp(1.7) : isSmallDevice ? hp(1.4) : hp(1.6),
    borderRadius: isTablet ? wp(2.2) : isSmallDevice ? wp(1.4) : wp(1.7),
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#000000',
  },
  radioButtonUnavailable: {
    borderColor: '#848688',
  },
  radioButtonInner: {
    width: isTablet ? wp(2.3) : isSmallDevice ? wp(1.5) : wp(1.9),
    height: isTablet ? hp(0.9) : isSmallDevice ? hp(0.8) : hp(0.87),
    borderRadius: isTablet ? wp(1.2) : isSmallDevice ? wp(0.8) : wp(0.9),
    backgroundColor: '#000000',
  },
  sizeText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  measurementText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  centerText: {
    textAlign: 'center',
  },
  selectedText: {
    color: '#000000',
  },
  unavailableText: {
    color: '#848688',
  },
  howToMeasureContainer: {
    padding: isTablet ? wp(6.7) : isSmallDevice ? wp(4.3) : wp(5.3),
    flex: 1,
  },
  howToMeasureText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: isTablet ? hp(2.6) : isSmallDevice ? hp(2.2) : hp(2.5),
  },
  instructionText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
    lineHeight: isTablet ? fs(23) : isSmallDevice ? fs(18) : fs(20),
  },
  buttonContainer: {
    paddingHorizontal: isTablet ? wp(8) : isSmallDevice ? wp(5.3) : wp(6.4),
    paddingVertical: isTablet ? hp(4.2) : isSmallDevice ? hp(3.5) : hp(4),
  },
  exchangeButton: {
    backgroundColor: '#000000',
    height: isTablet ? hp(6.3) : isSmallDevice ? hp(5.2) : hp(6),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeButtonDisabled: {
    backgroundColor: '#999999',
  },
  exchangeButtonText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? wp(13.3) : isSmallDevice ? wp(8.5) : wp(10.7),
  },
  loadingText: {
    marginTop: isTablet ? hp(1.6) : isSmallDevice ? hp(1.3) : hp(1.5),
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? wp(13.3) : isSmallDevice ? wp(8.5) : wp(10.7),
  },
  emptyText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    color: '#999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
});

export default OrdersExchangeSizeSelectionChart;
