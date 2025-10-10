import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Colors, FontFamilies } from '../constants';
import { useBag } from '../contexts/BagContext';

const FavouritesAddedToBagConfirmationModal = ({ navigation, route }) => {
  const { height: screenHeight } = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(0)).current;
  const panY = useRef(0);
  const { getBagItemsCount } = useBag();

  // Safety check for navigation
  if (!navigation) {
    console.error('❌ Navigation prop is missing in FavouritesAddedToBagConfirmationModal');
    console.log('Route params:', route?.params);
  }

    const handleViewBag = useCallback(() => {
    console.log('handleViewBag called');
    console.log('Navigation object:', navigation);
    
    if (!navigation) {
      console.error('Navigation object is undefined');
      return;
    }

    // Use the same pattern as HomeScreen - check bag items and navigate accordingly
    const bagItemsCount = getBagItemsCount();
    console.log('Bag items count:', bagItemsCount);
    
    // Close this modal first
    handleClose();
    
    setTimeout(() => {
      if (navigation && navigation.navigate) {
        if (bagItemsCount > 0) {
          // Navigate to bag screen with items
          navigation.navigate('Bag', { 
            previousScreen: 'favourites',
            forceShowContent: true 
          });
        } else {
          // Navigate to empty bag screen
          navigation.navigate('bagemptyscreen', { 
            previousScreen: 'favourites' 
          });
        }
      } else {
        console.error('Navigation.navigate is not available');
      }
    }, 100);
  }, [navigation, handleClose]);

  const handleClose = useCallback(() => {
    // Go back to the previous screen (likely the favorites screen)
    if (navigation && navigation.navigate) {
      navigation.navigate('favourites');
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.error('❌ Unable to navigate - navigation methods not available');
    }
  }, [navigation]);

  const closeModalAnimation = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250, // Faster animation - reduced from 300ms
      useNativeDriver: true,
    }).start(() => {
      handleClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Respond to any vertical movement greater than 2px
        const { dy } = gestureState;
        return Math.abs(dy) > 2;
      },
      onPanResponderGrant: (evt) => {
        panY.current = 0;
        // Stop any ongoing animations
        translateY.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        panY.current = dy;
        
        // Only allow downward movement
        if (dy > 0) {
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        
        // More sensitive thresholds: Close if dragged down more than 50px or with velocity > 0.3
        if (dy > 50 || vy > 0.3) {
          closeModalAnimation();
        } else {
          // Snap back to original position with faster animation
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          onPress={closeModalAnimation}
          activeOpacity={1}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drawer Handle - Enhanced for better touch target */}
          <View style={styles.drawerHandleContainer}>
            <View style={styles.drawerHandle} />
          </View>
          
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIconBackground}>
              <View style={styles.successIcon}>
                {/* Checkmark SVG equivalent */}
                <View style={styles.checkmark}>
                  <View style={styles.checkmarkStem} />
                  <View style={styles.checkmarkKick} />
                </View>
              </View>
            </View>
          </View>
          
          {/* Added to Bag Text */}
          <Text style={styles.addedToBagText}>Added to Bag</Text>
          
          {/* View Bag Button */}
          <TouchableOpacity 
            style={styles.viewBagButton}
            onPress={handleViewBag}
          >
            <Text style={styles.viewBagButtonText}>View Bag</Text>
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
  overlayBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 34,
    height: 467,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  drawerHandleContainer: {
    width: '100%',
    height: 40, // Increased from 20 to 40 for better touch target
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  drawerHandle: {
    width: 64,
    height: 6,
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    marginTop: 12, // Increased margin to center better in larger container
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconBackground: {
    width: 81,
    height: 81,
    borderRadius: 40.5,
    backgroundColor: 'rgba(80, 138, 123, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 54.166,
    height: 54.166,
    borderRadius: 27.083,
    backgroundColor: '#508A7B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 20,
    height: 15,
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    left: 11,
    top: 6,
    width: 8,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkKick: {
    position: 'absolute',
    left: 6,
    top: 9,
    width: 5,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  addedToBagText: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: 28.8,
    marginBottom: 120,
  },
  viewBagButton: {
    backgroundColor: Colors.black,
    borderRadius: 100,
    width: 331,
    height: 61,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 34,
  },
  viewBagButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: 19.2,
  },
});

export default FavouritesAddedToBagConfirmationModal;
