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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerRight: {
    width: 68,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 51,
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
    // Active tab styling handled by underline
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
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
  sizeChartContainer: {
    flex: 1,
  },
  unitSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 17,
    backgroundColor: '#FFFFFF',
    height: 45,
  },
  selectSizeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    height: 30,
    width: 80,
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
    fontSize: 12,
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
    height: 45,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 13,
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
    height: 45,
    paddingHorizontal: 16,
  },
  sizeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  radioContainer: {
    width: 30,
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#000000',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  measurementText: {
    fontSize: 16,
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
    padding: 20,
    flex: 1,
  },
  howToMeasureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  exchangeButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeButtonDisabled: {
    backgroundColor: '#999999',
  },
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
});

export default OrdersExchangeSizeSelectionChart;
