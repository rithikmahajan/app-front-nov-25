import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { GlobalBackButton } from '../components';
import ModalExchange from './ordersexchangethankyoumodal';

const sizes = [
  { id: 'S', name: 'S', waist: '71.1', inseam: '70.1', available: false },
  { id: 'M', name: 'M', waist: '71.1', inseam: '70.1', available: true },
  { id: 'L', name: 'L', waist: '71.1', inseam: '70.1', available: true },
  { id: 'XL', name: 'XL', waist: '71.1', inseam: '70.1', available: true },
  { id: 'XXL', name: 'XXL', waist: '71.1', inseam: '70.1', available: true },
];

const OrdersExchangeSizeSelectionChart = ({ navigation, route }) => {
  const [selectedSize, setSelectedSize] = useState('M'); // Default to M as shown in design
  const [activeTab, setActiveTab] = useState('sizeChart'); // 'sizeChart' or 'howToMeasure'
  const [unit, setUnit] = useState('cm'); // 'cm' or 'in'
  const modalExchangeRef = useRef(null);

  const handleSizeSelect = (sizeId) => {
    // Find the size to check if it's available
    const size = sizes.find(s => s.id === sizeId);
    if (size && !size.available) {
      // Don't allow selection of unavailable sizes
      return;
    }
    setSelectedSize(sizeId);
  };

  const handleExchange = () => {
    if (!selectedSize) {
      Alert.alert('Error', 'Please select a size for exchange.');
      return;
    }
    
    // Open the exchange thank you modal
    modalExchangeRef.current?.open();
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
        {sizes.map(renderSizeRow)}
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
            style={styles.exchangeButton}
            onPress={handleExchange}
            activeOpacity={0.8}
          >
            <Text style={styles.exchangeButtonText}>Exchange</Text>
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
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
});

export default OrdersExchangeSizeSelectionChart;
