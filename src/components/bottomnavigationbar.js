import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { FontWeights, FontFamilies } from '../constants';
import {
  HomeIcon,
  CollectionIcon,
  RewardsIcon,
  ProfileIcon,
  HeartIcon,
  GlobalCartIcon,
} from '../assets/icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBag } from '../contexts/BagContext';

// Wrapper for HeartIcon to match the navigation bar interface
const FavouritesIcon = ({ active, color, size }) => (
  <HeartIcon size={size} color={color} filled={active} />
);

// Wrapper for GlobalCartIcon to match the navigation bar interface
const BagIcon = ({ active, color, size }) => (
  <GlobalCartIcon size={size} color={color} filled={active} />
);

const BottomNavigationBar = ({ activeTab = 'Home', onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState('Home');
  const { favorites } = useFavorites();
  const { getBagItemsCount } = useBag();
  
  // Use external activeTab if provided, otherwise use internal state
  const currentActiveTab = activeTab || internalActiveTab;
  
  // Get favorites count - directly from favorites state for reactivity
  const favoritesCount = favorites?.size || 0;
  
  // Get bag items count
  const bagItemsCount = getBagItemsCount();

  const handleTabPress = useCallback((tabName) => {
    // Update internal state if no external activeTab provided
    if (!activeTab) {
      setInternalActiveTab(tabName);
    }
    
    // Call external handler if provided
    if (onTabChange) {
      onTabChange(tabName);
    }
    
    // Tab selection logging removed for production
  }, [activeTab, onTabChange]);

  const tabs = [
    {
      name: 'Home',
      label: 'Home',
      icon: HomeIcon,
    },
    {
      name: 'Collection',
      label: 'Collection',
      icon: CollectionIcon,
    },
    {
      name: 'Favourites',
      label: 'Favourites',
      icon: FavouritesIcon,
    },
    {
      name: 'Shop',
      label: 'Bag',
      icon: BagIcon,
    },
    {
      name: 'Rewards',
      label: 'Rewards',
      icon: RewardsIcon,
    },
    {
      name: 'Profile',
      label: 'Profile',
      icon: ProfileIcon,
    },
  ];

  return (
        <SafeAreaView style={styles.container}>
          <View style={styles.navigationBar}>
            {tabs.map((tab) => {
              const isActive = currentActiveTab === tab.name;
              const showFavoritesBadge = tab.name === 'Favourites' && favoritesCount > 0;
              const showBagBadge = tab.name === 'Shop' && bagItemsCount > 0;
              
              return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <tab.icon 
                  active={isActive} 
                  color={isActive ? '#000000' : '#848688'}
                  size={18}
                />
                {showFavoritesBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favoritesCount > 99 ? '99+' : favoritesCount}</Text>
                  </View>
                )}
                {showBagBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{bagItemsCount > 99 ? '99+' : bagItemsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    // Removed shadow and elevation for modern seamless look
    // No borders or visual separations for clean integration
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 8, // Increased bottom padding for text visibility
    minHeight: 70, // Increased height to accommodate icons and labels
    alignItems: 'flex-start',
    // Seamless integration with screen content
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
    minHeight: 50, // Increased for better touch targets and full content visibility
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2, // Added margin for better spacing
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.bold,
    textAlign: 'center',
    lineHeight: 11,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: FontWeights.normal,
    fontFamily: FontFamilies.regular,
    color: '#848688',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 13,
    paddingBottom: 2, // Added padding to ensure text is not cut off
  },
  activeTabLabel: {
    color: '#000000',
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.bold,
  },
});

export default BottomNavigationBar;
