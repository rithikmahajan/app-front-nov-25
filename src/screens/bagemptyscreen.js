import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import BagIconSvg from '../assets/icons/BagIconSvg';
import { useBag } from '../contexts/BagContext';
import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveValue,
  wp,
  hp,
  fs,
  device,
  isTablet,
  isSmallDevice
} from '../utils/responsive';

const BagEmptyScreen = React.memo(({ navigation }) => {
  const { getBagItemsCount } = useBag();

  // Memoize the bag count to prevent unnecessary recalculations
  const bagItemsCount = useMemo(() => getBagItemsCount(), [getBagItemsCount]);
  
  // Check if we should show content or empty state
  const hasBagItems = bagItemsCount > 0;

  // Optimized handlers with useCallback
  const handleShopNow = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleViewBag = useCallback(() => {
    navigation.navigate('BagContent');
  }, [navigation]);

  // If there are items in bag, show a different UI that leads to content
  if (hasBagItems) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle} accessibilityRole="header">Bag</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <View style={styles.bagIconContainer}>
            <View style={styles.bagIconCircle}>
              <BagIconSvg size={getResponsiveValue(35, 40, 45)} color="#000000" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.emptyText}>
              You have {bagItemsCount} item{bagItemsCount > 1 ? 's' : ''} in your <Text style={styles.boldText}>bag</Text>!
            </Text>
            <Text style={styles.descriptionText}>
              Tap below to view your bag.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.viewBagButton}
            onPress={handleViewBag}
            accessibilityRole="button"
            accessibilityLabel="View Bag"
            accessibilityHint="Navigate to bag content"
          >
            <Text style={styles.buttonText}>View Bag</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no items in bag
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle} accessibilityRole="header">Bag</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.bagIconContainer}>
          <View style={styles.bagIconCircle}>
            <BagIconSvg size={getResponsiveValue(27, 32, 37)} color="#000000" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.emptyText}>
            Your bag is empty.
          </Text>
          <Text style={styles.descriptionText}>
            When you add products, they'll{'\n'}appear here.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.shopNowButton}
          onPress={handleShopNow}
          accessibilityRole="button"
          accessibilityLabel="Shop Now"
          accessibilityHint="Navigate to shop"
        >
          <Text style={styles.buttonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingTop: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(12),
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    width: getResponsiveValue(68, 76, 84),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: getResponsiveValue(68, 76, 84),
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(24),
    marginTop: getResponsiveValue(-100, -80, -60),
  },
  
  bagIconContainer: {
    marginBottom: getResponsiveSpacing(32),
    alignItems: 'center',
  },
  
  bagIconCircle: {
    width: getResponsiveValue(60, 70, 80),
    height: getResponsiveValue(60, 70, 80),
    borderRadius: getResponsiveValue(30, 35, 40),
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(40),
  },

  emptyText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.384,
    fontFamily: 'Montserrat-Regular',
    lineHeight: getResponsiveFontSize(24),
    marginBottom: getResponsiveSpacing(8),
  },

  boldText: {
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  descriptionText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.384,
    fontFamily: 'Montserrat-Regular',
    lineHeight: getResponsiveFontSize(24),
  },

  buttonContainer: {
    paddingHorizontal: getResponsiveSpacing(24),
    paddingBottom: getResponsiveSpacing(34),
  },

  shopNowButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(51),
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewBagButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: getResponsiveSpacing(16),
    paddingHorizontal: getResponsiveSpacing(51),
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    lineHeight: getResponsiveFontSize(19.2),
  },

  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default BagEmptyScreen;