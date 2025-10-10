import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const DeliveryOptionsModal = ({ visible, onClose, onSelectDelivery }) => {
  const [selectedOption, setSelectedOption] = useState('free');
  const slideAnim = useRef(new Animated.Value(visible ? 0 : screenHeight)).current;

  useEffect(() => {
    console.log('DeliveryOptionsModal visibility changed:', visible);
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    onSelectDelivery(selectedOption);
    onClose();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Select Delivery Option</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Delivery Options */}
            <View style={styles.optionsContainer}>
              {/* Free Delivery Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedOption === 'free' && styles.selectedOption
                ]}
                onPress={() => handleOptionSelect('free')}
              >
                <View style={styles.optionContent}>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioButton,
                      selectedOption === 'free' && styles.radioSelected
                    ]}>
                      {selectedOption === 'free' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>Standard Delivery</Text>
                    <Text style={styles.optionDescription}>Free delivery (5-7 business days)</Text>
                    <Text style={styles.optionPrice}>FREE</Text>
                  </View>
                  <View style={styles.deliveryIcon}>
                    <Text style={styles.iconText}>📦</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* International Delivery Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedOption === 'international' && styles.selectedOption
                ]}
                onPress={() => handleOptionSelect('international')}
              >
                <View style={styles.optionContent}>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioButton,
                      selectedOption === 'international' && styles.radioSelected
                    ]}>
                      {selectedOption === 'international' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>International Delivery</Text>
                    <Text style={styles.optionDescription}>Express international shipping (2-3 business days)</Text>
                    <Text style={styles.optionPrice}>$200</Text>
                  </View>
                  <View style={styles.deliveryIcon}>
                    <Text style={styles.iconText}>✈️</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.6,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666666',
    lineHeight: 20,
  },
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderColor: '#000000',
    backgroundColor: '#F8F8F8',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  deliveryIcon: {
    marginLeft: 12,
  },
  iconText: {
    fontSize: 24,
  },
  confirmButton: {
    backgroundColor: '#000000',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeliveryOptionsModal;
