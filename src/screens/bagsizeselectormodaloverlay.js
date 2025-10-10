import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BagSizeSelectorModalOverlay = ({ 
  visible, 
  onClose, 
  item, 
  productDetails,
  onSizeChange,
  onSizeChartPress 
}) => {
  // Get available sizes from product details
  const getAvailableSizes = () => {
    if (!productDetails || !productDetails.sizes) {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Default fallback
    }
    
    // Filter only sizes with available quantity > 0
    return productDetails.sizes
      .filter(sizeInfo => sizeInfo.quantity > 0)
      .map(sizeInfo => sizeInfo.size)
      .sort((a, b) => {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const indexA = sizeOrder.indexOf(a);
        const indexB = sizeOrder.indexOf(b);
        return indexA - indexB;
      });
  };

  const availableSizes = getAvailableSizes();
  
  // Current selected size, defaulting to item's size or 'M'
  const [selectedSize, setSelectedSize] = useState(item?.size || 'M');
  
  // State for showing size chart
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Animation refs
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
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
  }, [visible, translateY]);

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

  // Pan responder for drag handle - always allows drag to close
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Always respond to any movement on the drag handle
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          // Lower threshold for drag handle
          handleClose();
        } else {
          // Snap back to original position
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

  // Pan responder for content area - only for downward swipes
  const contentPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to significant downward swipes
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Higher threshold for content area
          handleClose();
        } else {
          // Snap back to original position
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

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleDone = () => {
    if (item && onSizeChange) {
      onSizeChange(item.id, selectedSize);
    }
    onClose();
  };

  const handleSizeChart = () => {
    // Handle size chart navigation or modal
    Alert.alert('Test', `Size Chart button pressed! onSizeChartPress is: ${typeof onSizeChartPress}`);
    
    // Show size chart within this modal
    setShowSizeChart(true);
    
    if (onSizeChartPress) {
      Alert.alert('Test', 'Calling onSizeChartPress function...');
      onSizeChartPress();
    } else {
      Alert.alert('Error', 'onSizeChartPress is not defined!');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop - touchable to close */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY }] 
            }
          ]}
        >
          {/* Drag Handle - draggable area */}
          <View style={styles.dragHandleContainer} {...dragHandlePanResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>
          
          {!showSizeChart ? (
            <View style={styles.contentContainer} {...contentPanResponder.panHandlers}>
              {/* Size Options */}
              <View style={styles.sizeGrid}>
                {availableSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      selectedSize === size && styles.selectedSizeOption
                    ]}
                    onPress={() => handleSizeSelect(size)}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedSize === size && styles.selectedSizeText
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Size Chart Link */}
              <TouchableOpacity 
                style={styles.sizeChartContainer}
                onPress={handleSizeChart}
              >
                <Text style={styles.sizeChartText}>Size Chart</Text>
              </TouchableOpacity>

              {/* Done Button */}
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contentContainer} {...contentPanResponder.panHandlers}>
              {/* Size Chart Content */}
              <Text style={styles.sizeChartTitle}>Size Chart</Text>
            </View>
          )}
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 320,
  },
  dragHandleContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
    justifyContent: 'center',
  },
  sizeOption: {
    width: (screenWidth - 48 - 32) / 3, // 3 columns with gaps
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedSizeOption: {
    backgroundColor: '#2F2F2F',
    borderColor: '#2F2F2F',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  sizeChartContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  sizeChartText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textDecorationLine: 'underline',
    letterSpacing: -0.4,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 19.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  sizeChartContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default BagSizeSelectorModalOverlay;
