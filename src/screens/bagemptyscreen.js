import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import BagIconSvg from '../assets/icons/BagIconSvg';
import BottomNavigationBar from '../components/bottomnavigationbar';
import { useBag } from '../contexts/BagContext';

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

  const handleTabChange = useCallback((tabName) => {
    console.log('Tab changed to:', tabName);
    navigation.navigate(tabName);
  }, [navigation]);

  // If there are items in bag, show a different UI that leads to content
  if (hasBagItems) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle} accessibilityRole="header">Bag</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
          <View style={styles.content}>
          <View style={styles.bagIconContainer}>
            <View style={styles.bagIconCircle}>
              <BagIconSvg size={35} color="#000000" />
            </View>
          </View>          <View style={styles.textContainer}>
            <Text style={styles.emptyText}>
              You have {bagItemsCount} item{bagItemsCount > 1 ? 's' : ''} in your <Text style={styles.boldText}>bag</Text>!
            </Text>
            <Text style={styles.descriptionText}>
              Tap below to view your bag.
            </Text>
          </View>
        </View>

        {/* View Bag Button */}
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

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
          <BottomNavigationBar 
            activeTab="Shop" 
            onTabChange={handleTabChange}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no items in bag
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle} accessibilityRole="header">Bag</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content - Empty State */}
      <View style={styles.content}>
        <View style={styles.bagIconContainer}>
          <View style={styles.bagIconCircle}>
            <BagIconSvg size={27} color="#000000" />
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

      {/* Shop Now Button */}
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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigationBar 
          activeTab="Shop" 
          onTabChange={handleTabChange}
        />
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    width: 68,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 68,
  },

  // Content Styles
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -100, // Adjust to center the content better
  },
  
  bagIconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  
  bagIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.384,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 24,
    marginBottom: 8,
  },

  boldText: {
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },

  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.384,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 24,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Increased to account for bottom navigation bar
  },

  shopNowButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewBagButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2,
  },

  // Bottom Navigation Bar Styles
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default BagEmptyScreen;