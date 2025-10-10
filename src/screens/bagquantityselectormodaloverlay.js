import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  PanResponder,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const BagQuantitySelectorModalOverlay = ({ visible, onClose, item, productDetails, onQuantityChange }) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isRemoveSelected, setIsRemoveSelected] = useState(false);
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const scrollViewRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

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
  const options = ['Remove', ...quantities]; // Include Remove as first option
  const ITEM_HEIGHT = 60;

  useEffect(() => {
    if (visible) {
      setSelectedQuantity(item?.quantity || 1);
      setIsRemoveSelected(false);
      // Animate modal up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Animate modal down
      Animated.spring(translateY, {
        toValue: screenHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, item?.quantity, translateY]);

  const handleClose = () => {
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

  // Pan responder for swipe to dismiss from scroll view
  const scrollPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture gesture if we're scrolling down and scroll view is at top
        return gestureState.dy > 10 && scrollY <= 0;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Capture the gesture when dragging down from the top
        return gestureState.dy > 10 && scrollY <= 0;
      },
      onPanResponderGrant: () => {
        // Disable scroll when pan responder takes control
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: false });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Re-enable scroll
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: true });
        }
        
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
      onPanResponderTerminate: () => {
        // Re-enable scroll if gesture is terminated
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: true });
        }
      },
    }),
  ).current;

  const handleQuantitySelect = (option) => {
    if (option === 'Remove') {
      setIsRemoveSelected(true);
      setSelectedQuantity(null);
    } else {
      setSelectedQuantity(option);
      setIsRemoveSelected(false);
    }
  };

  const handleDone = () => {
    if (isRemoveSelected) {
      // Handle remove item logic
      onQuantityChange(item?.id, 0); // 0 means remove
    } else if (selectedQuantity) {
      onQuantityChange(item?.id, selectedQuantity);
    }
    handleClose();
  };

  const renderOption = (option) => {
    const isRemove = option === 'Remove';
    const isSelected = isRemove ? isRemoveSelected : (selectedQuantity === option && !isRemoveSelected);
    
    return (
      <TouchableOpacity
        key={option}
        style={[
          styles.quantityOption,
          isSelected && styles.selectedQuantityOption
        ]}
        onPress={() => handleQuantitySelect(option)}
      >
        <Text style={[
          styles.quantityText,
          isSelected && (isRemove ? styles.selectedRemoveText : styles.selectedQuantityText),
          isRemove && !isSelected && styles.removeText
        ]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
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
          
          {/* Quantity options */}
          <View style={styles.quantityContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              bounces={true}
              bouncesZoom={false}
              onScroll={(event) => {
                setScrollY(event.nativeEvent.contentOffset.y);
              }}
              {...scrollPanResponder.panHandlers}
            >
              {/* Add some padding at top */}
              <View style={styles.topPadding} />
              
              {options.map(renderOption)}
              
              {/* Add some padding at bottom */}
              <View style={styles.bottomPadding} />
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
    paddingBottom: 34, // Safe area bottom
    height: 372,
  },
  handleBarContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#767676',
    borderRadius: 30,
    marginTop: 4,
    marginBottom: 10,
  },
  quantityContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  topPadding: {
    height: 60,
  },
  bottomPadding: {
    height: 60,
  },
  quantityOption: {
    width: '100%',
    height: 41,
    backgroundColor: '#F6F6F6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedQuantityOption: {
    backgroundColor: '#F6F6F6',
  },
  quantityText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#BABABA',
  },
  selectedQuantityText: {
    color: '#000000',
    fontWeight: '500',
  },
  removeText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#BABABA',
  },
  selectedRemoveText: {
    color: '#EA4335',
    fontWeight: '400',
    fontSize: 20,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    marginHorizontal: 23,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default BagQuantitySelectorModalOverlay;
