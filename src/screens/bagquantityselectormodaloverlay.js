import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  wp,
  hp,
  fs,
  device,
  isTablet,
  isSmallDevice,
  getScreenDimensions
} from '../utils/responsive';

const { height: screenHeight } = getScreenDimensions();

const BagQuantitySelectorModalOverlay = ({ visible, onClose, item, productDetails, onQuantityChange }) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isRemoveSelected, setIsRemoveSelected] = useState(false);
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const scrollViewRef = useRef(null);
  const ITEM_HEIGHT = getResponsiveValue(44, 50, 56);

  // Get available quantity for the current item's size from product details
  const getAvailableQuantity = () => {
    if (!productDetails || !productDetails.sizes || !item?.size) {
      return 5; // Default fallback
    }
    
    const sizeInfo = productDetails.sizes.find(size => size.size === item.size);
    return sizeInfo ? Math.min(sizeInfo.quantity, 10) : 5; // Limit to 10 max for UI
  };

  const maxQuantity = getAvailableQuantity();
  const quantities = Array.from({ length: maxQuantity }, (_, i) => i + 1);

  useEffect(() => {
    if (visible) {
      const initialQuantity = item?.quantity || 1;
      setSelectedQuantity(initialQuantity);
      setIsRemoveSelected(false);
      
      // Animate modal up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      // Scroll to the current quantity after a short delay
      setTimeout(() => {
        if (scrollViewRef.current) {
          const index = initialQuantity; // index 0 is "Remove", so quantity 1 is at index 1
          scrollViewRef.current.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 100);
    } else {
      // Animate modal down
      Animated.spring(translateY, {
        toValue: screenHeight,
        useNativeDriver: true,
        tension: 100,
      friction: 8,
    }).start();
  }
}, [visible, item?.quantity, translateY, ITEM_HEIGHT]);  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: screenHeight,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  // Pan responder for handle bar - always allows drag to close
  const handleBarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  const handleDone = () => {
    if (isRemoveSelected) {
      // Handle remove item logic
      onQuantityChange(item?.id, 0); // 0 means remove
    } else if (selectedQuantity) {
      onQuantityChange(item?.id, selectedQuantity);
    }
    handleClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
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
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBarContainer} {...handleBarPanResponder.panHandlers}>
            <View style={styles.handleBar} />
          </View>
          
          {/* Quantity options - iOS-style wheel picker */}
          <View style={styles.quantityContainer}>
            {/* Selection indicator overlay */}
            <View style={styles.selectionIndicator} pointerEvents="none">
              <View style={styles.selectionLine} />
              <View style={styles.selectionHighlight} />
              <View style={styles.selectionLine} />
            </View>
            
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const index = Math.round(yOffset / ITEM_HEIGHT);
                
                if (index === 0) {
                  setIsRemoveSelected(true);
                  setSelectedQuantity(null);
                } else {
                  setIsRemoveSelected(false);
                  setSelectedQuantity(index);
                }
              }}
            >
              {/* Top padding to center first item */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
              
              {/* Remove option */}
              <View style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
                <Text style={[styles.pickerItemText, styles.removeText]}>Remove</Text>
              </View>
              
              {/* Quantity options */}
              {quantities.map((qty) => (
                <View key={qty} style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
                  <Text style={styles.pickerItemText}>{qty}</Text>
                </View>
              ))}
              
              {/* Bottom padding to center last item */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
          </View>
          
          {/* Done button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: getResponsiveSpacing(34),
    height: getResponsiveValue(372, 420, 480),
  },
  handleBarContainer: {
    paddingVertical: getResponsiveSpacing(10),
    alignItems: 'center',
  },
  handleBar: {
    width: getResponsiveValue(40, 45, 50),
    height: getResponsiveValue(4, 5, 6),
    backgroundColor: '#767676',
    borderRadius: 30,
    marginTop: getResponsiveSpacing(4),
    marginBottom: getResponsiveSpacing(10),
  },
  quantityContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(20),
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: getResponsiveValue(44, 50, 56),
    marginTop: getResponsiveValue(-22, -25, -28),
    zIndex: 1,
    justifyContent: 'space-between',
  },
  selectionLine: {
    height: 0.5,
    backgroundColor: '#C7C7CC',
  },
  selectionHighlight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  scrollView: {
    height: getResponsiveValue(220, 250, 280),
  },
  scrollContent: {
    alignItems: 'center',
  },
  pickerItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: getResponsiveFontSize(20),
    color: '#000000',
    fontWeight: '400',
  },
  removeText: {
    color: '#EA4335',
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    marginHorizontal: getResponsiveSpacing(23),
    paddingVertical: getResponsiveSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveSpacing(20),
  },
  doneButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default BagQuantitySelectorModalOverlay;
