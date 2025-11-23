import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import BagSizeSelectorSizeChart from './bagsizeselectorsizechart';
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
  getScreenDimensions,
} from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = getScreenDimensions();

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
    // Close this modal and show the size chart as a new modal
    setShowSizeChart(true);
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
          
          {/* Size Chart Modal */}
          <BagSizeSelectorSizeChart 
            visible={showSizeChart} 
            onClose={() => setShowSizeChart(false)}
            product={productDetails || item}
          />
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
    paddingHorizontal: getResponsiveSpacing(24),
    paddingBottom: getResponsiveSpacing(40),
    minHeight: getResponsiveValue(320, 360, 400),
  },
  dragHandleContainer: {
    paddingVertical: getResponsiveSpacing(15),
    paddingHorizontal: getResponsiveSpacing(20),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: getResponsiveValue(40, 45, 50),
    height: getResponsiveValue(4, 5, 6),
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing(24),
    marginBottom: getResponsiveSpacing(40),
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
  },
  sizeOption: {
    width: getResponsiveValue(
      (screenWidth - 48 - 72) / 3,
      (screenWidth - 60 - 96) / 3,
      (screenWidth - 80 - 120) / 3
    ),
    height: getResponsiveValue(60, 70, 80),
    backgroundColor: 'transparent',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedSizeOption: {
    backgroundColor: 'transparent',
    borderBottomColor: '#000000',
  },
  sizeText: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: '400',
    color: '#999999',
    letterSpacing: -0.4,
  },
  selectedSizeText: {
    color: '#000000',
    fontWeight: '600',
  },
  sizeChartContainer: {
    alignSelf: 'flex-end',
    marginBottom: getResponsiveSpacing(32),
  },
  sizeChartText: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '400',
    color: '#000000',
    textDecorationLine: 'underline',
    letterSpacing: -0.4,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(51),
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: getResponsiveValue(19.2, 22, 24),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(20),
  },
  sizeChartContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing(20),
  },
});

export default BagSizeSelectorModalOverlay;
