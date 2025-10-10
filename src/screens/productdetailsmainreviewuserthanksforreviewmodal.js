import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const ProductDetailsMainReviewUserThanksForReviewModal = ({ 
  visible, 
  onContinueShopping, 
  onClose 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Thank you title */}
          <Text style={styles.titleText}>Thanks for review!</Text>
          
          {/* Subtitle text */}
          <Text style={styles.subtitleText}>
            Your valuable feedback help us make your experience better
          </Text>
          
          {/* Continue Shopping Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={onContinueShopping}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    width: width - 40,
    maxWidth: 400,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.41,
    opacity: 0.75,
    marginBottom: 44,
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    width: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
    lineHeight: 19.2,
  },
});

export default ProductDetailsMainReviewUserThanksForReviewModal;
