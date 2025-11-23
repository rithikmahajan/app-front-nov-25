import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

const FONT_FAMILY = {
  REGULAR: 'Montserrat-Regular',
  BOLD: 'Montserrat-Bold',
};

const CheckIcon = ({ width, height }) => (
  <View
    style={[
      styles.checkIconContainer,
      { width: width, height: height, borderRadius: width / 2 }
    ]}
  >
    <Text style={[styles.checkIconText, { fontSize: width * 0.5 }]}>✓</Text>
  </View>
);

const ModalExchange = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [exchangeDetails, setExchangeDetails] = useState(null);
  const { navigation } = props;

  useImperativeHandle(ref, () => ({
    open(details) {
      setExchangeDetails(details || null);
      setVisible(true);
    },
    close() {
      setVisible(false);
      setExchangeDetails(null);
    },
  }));

  const handleDone = () => {
    setVisible(false);
    setExchangeDetails(null);
    if (navigation) {
      navigation.navigate('Orders');
    }
  };

  const orderData = exchangeDetails?.orderData;
  const exchangeData = exchangeDetails?.exchangeData;
  const selectedSize = exchangeDetails?.selectedSize;
  const orderNumber = orderData?.orderNumber || orderData?._id?.slice(-8) || 'N/A';
  const exchangeId = exchangeData?.exchangeId || exchangeData?._id?.slice(-8) || 'N/A';

  const iconSize = isTablet ? hp(13.2) : isSmallDevice ? hp(9.2) : hp(10.5);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <CheckIcon width={iconSize} height={iconSize} />

          <Text style={styles.heading}>
            Thank you for requesting exchange !
          </Text>

          {exchangeDetails && (
            <View style={styles.exchangeDetailsContainer}>
              <Text style={styles.exchangeDetailsTitle}>
                Exchange Details:
              </Text>
              <Text style={styles.exchangeDetailsText}>
                Order: #{orderNumber}
              </Text>
              <Text style={styles.exchangeDetailsText}>
                Exchange ID: #{exchangeId}
              </Text>
              {selectedSize && (
                <Text style={styles.exchangeDetailsText}>
                  New Size: {selectedSize}
                </Text>
              )}
            </View>
          )}

          <Text style={styles.subtext}>
            We appreciate your patience. We'll get back to you with tracking
            details.
          </Text>

          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: isTablet ? wp(75) : isSmallDevice ? wp(85) : wp(90),
    backgroundColor: "white",
    borderRadius: 15,
    padding: isTablet ? wp(6.7) : isSmallDevice ? wp(4.3) : wp(5.3),
    alignItems: "center",
  },
  checkIconContainer: {
    backgroundColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: isTablet ? fs(24) : isSmallDevice ? fs(18) : fs(20),
    fontFamily: FONT_FAMILY.BOLD,
    marginTop: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
    textAlign: "center",
    paddingVertical: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
  },
  exchangeDetailsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: isTablet ? wp(5) : isSmallDevice ? wp(3.2) : wp(4),
    marginVertical: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
  },
  exchangeDetailsTitle: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: FONT_FAMILY.BOLD,
    color: '#333',
    marginBottom: isTablet ? hp(1.1) : isSmallDevice ? hp(0.9) : hp(1),
  },
  exchangeDetailsText: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#666',
    marginBottom: isTablet ? hp(0.5) : isSmallDevice ? hp(0.4) : hp(0.5),
  },
  subtext: {
    textAlign: "center",
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontFamily: FONT_FAMILY.BOLD,
    color: "gray",
    marginVertical: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
  },
  doneButton: {
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "lightgray",
    width: isTablet ? wp(58.3) : isSmallDevice ? wp(56) : wp(63),
    paddingVertical: isTablet ? hp(2) : isSmallDevice ? hp(1.6) : hp(1.9),
    borderRadius: 30,
    marginBottom: isTablet ? hp(1.3) : isSmallDevice ? hp(1.1) : hp(1.2),
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
  },
});

export default ModalExchange;
