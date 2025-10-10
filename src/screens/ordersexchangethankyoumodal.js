// ModalExchange.js (For Size/Fit Issue Exchange)
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { FontFamilies, FontSizes } from "../constants/styles";

const DEVICE_HEIGHT = Dimensions.get("window").height;

// Font constants to match your app structure
const FONT_FAMILY = {
  REGULAR: FontFamilies.regular,
  BOLD: FontFamilies.bold,
};

const FONT_SIZE = {
  S: FontSizes.sm,
  MEDIUM: FontSizes.lg,
  LARGE: FontSizes.xl,
};

// Simple check icon component since OrangeCheckSvg is not available
const CheckIcon = ({ width, height }) => (
  <View
    style={{
      width: width,
      height: height,
      backgroundColor: '#FF8C00',
      borderRadius: width / 2,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ fontSize: width * 0.5, color: '#FFF', fontWeight: 'bold' }}>✓</Text>
  </View>
);

const ModalExchange = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const { navigation } = props;

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
    close() {
      setVisible(false);
    },
  }));

  const handleDone = () => {
    setVisible(false);
    // Navigate to orders screen
    if (navigation) {
      navigation.navigate('Orders');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: "white",
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
          }}
        >
          <CheckIcon
            width={DEVICE_HEIGHT * 0.1}
            height={DEVICE_HEIGHT * 0.1}
          />
          {/* Heading */}
          <Text
            style={{
              fontSize: FONT_SIZE.LARGE,
              fontFamily: FONT_FAMILY.BOLD,
              marginTop: 10,
              textAlign: "center",
              paddingVertical: 10,
            }}
          >
            Thank you for requesting exchange !
          </Text>

          {/* Subtext */}
          <Text
            style={{
              textAlign: "center",
              fontSize: FONT_SIZE.S,
              fontFamily: FONT_FAMILY.BOLD,
              color: "gray",
              marginVertical: 10,
            }}
          >
            We appreciate your patience.We'll get back to you with tracking
            details.
          </Text>
          {/*  done button */}
          <TouchableOpacity
            onPress={handleDone}
            style={{
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "lightgray",
              width: "70%",
              paddingVertical: 15,
              borderRadius: 30,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ 
              color: "white",  
              fontFamily: FONT_FAMILY.BOLD,
              fontSize: FONT_SIZE.MEDIUM, 
            }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

export default ModalExchange;
