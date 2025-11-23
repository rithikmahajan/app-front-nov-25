import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

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
    paddingHorizontal: wp(5),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(9),
    paddingHorizontal: isTablet ? wp(6) : wp(7.5),
    paddingTop: isTablet ? hp(5) : hp(4.8),
    paddingBottom: isTablet ? hp(5) : hp(4.8),
    alignItems: 'center',
    width: isTablet ? wp(60) : wp(90),
    maxWidth: isTablet ? wp(70) : wp(95),
  },
  titleText: {
    fontSize: isTablet ? fs(22) : isSmallDevice ? fs(16) : fs(18),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginBottom: hp(2),
    letterSpacing: -0.41,
    lineHeight: isTablet ? fs(26) : isSmallDevice ? fs(19) : fs(22),
  },
  subtitleText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '400',
    color: '#767676',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    lineHeight: isTablet ? fs(25) : isSmallDevice ? fs(19) : fs(22),
    letterSpacing: -0.41,
    opacity: 0.75,
    marginBottom: isTablet ? hp(5.5) : hp(5.3),
    paddingHorizontal: wp(2.5),
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: wp(25),
    paddingVertical: hp(2),
    paddingHorizontal: isTablet ? wp(10) : wp(12.75),
    width: isTablet ? wp(45) : wp(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
    lineHeight: isTablet ? fs(21) : isSmallDevice ? fs(17) : fs(19.2),
  },
});

export default ProductDetailsMainReviewUserThanksForReviewModal;
