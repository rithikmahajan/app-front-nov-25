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
  ShopIcon,
  CollectionIcon,
  RewardsIcon,
  ProfileIcon,
} from '../assets/icons';

const BottomNavigationBar = ({ activeTab = 'Home', onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState('Home');
  
  // Use external activeTab if provided, otherwise use internal state
  const currentActiveTab = activeTab || internalActiveTab;

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
      name: 'Shop',
      label: 'Shop',
      icon: ShopIcon,
    },
    {
      name: 'Collection',
      label: 'Collection',
      icon: CollectionIcon,
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
              
              return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <tab.icon 
                active={isActive} 
                color={isActive ? '#000000' : '#848688'}
                size={18}
              />
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
    paddingTop: 13,
    paddingHorizontal: 15,
    paddingBottom: 5, // Added bottom padding for better spacing
    height: 60, // Slightly increased height for better touch targets
    alignItems: 'flex-start',
    // Seamless integration with screen content
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
    minHeight: 40, // Increased for better touch targets
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: FontWeights.normal,
    fontFamily: FontFamilies.regular,
    color: '#848688',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 12,
  },
  activeTabLabel: {
    color: '#000000',
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.bold,
  },
});

export default BottomNavigationBar;
