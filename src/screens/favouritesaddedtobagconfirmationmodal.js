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
import Svg, { Path } from 'react-native-svg';
import { Colors, FontFamilies } from '../constants';
import { useBag } from '../contexts/BagContext';
import { wp, hp, fs, isTablet } from '../utils/responsive';

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
  }, [navigation, handleClose, getBagItemsCount]);

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
            <Svg width={isTablet ? 100 : 81} height={isTablet ? 100 : 81} viewBox="0 0 81 81" fill="none">
              <Path 
                opacity="0.1" 
                d="M40.5 81C62.8675 81 81 62.8675 81 40.5C81 18.1325 62.8675 0 40.5 0C18.1325 0 0 18.1325 0 40.5C0 62.8675 18.1325 81 40.5 81Z" 
                fill="#508A7B"
              />
              <Path 
                d="M40.083 13C25.133 13 13 25.133 13 40.083C13 55.033 25.133 67.166 40.083 67.166C55.033 67.166 67.166 55.033 67.166 40.083C67.166 25.133 55.033 13 40.083 13Z" 
                fill="#508A7B"
              />
              <Path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M53.7878 30.4597C54.4008 31.0727 54.4008 32.0668 53.7878 32.6788L36.5258 49.9417C35.9128 50.5548 34.9198 50.5548 34.3068 49.9417L26.4597 42.0948C25.8468 41.4818 25.8468 40.4887 26.4597 39.8757C27.0727 39.2627 28.0668 39.2627 28.6788 39.8757L35.4157 46.6127L51.5688 30.4597C52.1818 29.8468 53.1758 29.8468 53.7878 30.4597Z" 
                fill="white"
              />
            </Svg>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: hp(4.1),
    height: hp(isTablet ? 60 : 57),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5.9),
  },
  drawerHandleContainer: {
    width: '100%',
    height: hp(4.9),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  drawerHandle: {
    width: wp(17.1),
    height: hp(0.7),
    backgroundColor: '#E6E6E6',
    borderRadius: 40,
    marginTop: hp(1.5),
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.9),
  },
  addedToBagText: {
    fontSize: fs(isTablet ? 28 : 24),
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.96,
    lineHeight: fs(isTablet ? 34 : 28.8),
    marginBottom: hp(14.6),
  },
  viewBagButton: {
    backgroundColor: Colors.black,
    borderRadius: wp(26.7),
    width: wp(88.3),
    height: hp(7.4),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: hp(4.1),
  },
  viewBagButtonText: {
    fontSize: fs(isTablet ? 20 : 16),
    fontWeight: '500',
    fontFamily: FontFamilies.montserrat,
    color: Colors.white,
    lineHeight: fs(isTablet ? 24 : 19.2),
  },
});

export default FavouritesAddedToBagConfirmationModal;
