import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const BagSizeSelectorSizeChart = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('US');
  const [selectedUnit, setSelectedUnit] = useState('in');

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

  const renderTable = () => {
    const data = sizeData[activeTab][selectedUnit];
    
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
          
          {/* Tab Container */}
          <View style={styles.tabContainer}>
            {['US', 'UK'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Unit Selection */}
            <View style={styles.unitSelectionContainer}>
              <Text style={styles.selectSizeText}>Select your size</Text>
              
              <View style={styles.unitToggle}>
                {['in', 'cm'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitOption,
                      selectedUnit === unit ? styles.activeUnit : styles.inactiveUnit
                    ]}
                    onPress={() => setSelectedUnit(unit)}
                  >
                    <Text style={[
                      styles.unitText,
                      selectedUnit === unit ? styles.activeUnitText : styles.inactiveUnitText
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Size Table */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderTable()}
              
              <Text style={styles.measurementText}>
                All measurements are in {selectedUnit === 'in' ? 'inches' : 'centimeters'}
              </Text>
            </ScrollView>
          </View>
          
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
    marginBottom: 24,
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
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  tableRow: {
    backgroundColor: '#FFFFFF',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  cellText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.4,
    textAlign: 'center',
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
});

export default BagSizeSelectorSizeChart;