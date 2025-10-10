/**
 * Location Currency Selector Component for React Native
 * Allows users to select their location for currency and delivery preferences
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocationSelector } from '../hooks/useLocationCurrency';

const LocationCurrencySelector = ({ 
  style = {},
  showFullSelector = false,
  onLocationChange = null 
}) => {
  const {
    currentLocation,
    availableCountries,
    isSelectingLocation,
    isLoading,
    openLocationSelector,
    closeLocationSelector,
    selectLocation
  } = useLocationSelector();

  const handleLocationSelect = async (location) => {
    try {
      const success = await selectLocation(location);
      if (success) {
        // Call parent callback if provided
        if (onLocationChange) {
          onLocationChange(location);
        }
        
        Alert.alert(
          'Location Updated',
          `Currency changed to ${location.currency}. Prices will be updated accordingly.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to update location preference. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location selection error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderLocationItem = ({ item }) => {
    const isSelected = item.countryCode === currentLocation.countryCode;
    
    return (
      <TouchableOpacity
        style={[
          styles.locationItem,
          isSelected && styles.selectedLocationItem
        ]}
        onPress={() => handleLocationSelect(item)}
      >
        <View style={styles.locationInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.locationText}>
            <Text style={[styles.countryName, isSelected && styles.selectedText]}>
              {item.country}
            </Text>
            <Text style={[styles.currencyInfo, isSelected && styles.selectedSubText]}>
              {item.currency} ({item.symbol})
            </Text>
          </View>
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (showFullSelector) {
    // Full selector view (for dedicated settings screen)
    return (
      <View style={[styles.fullSelectorContainer, style]}>
        <Text style={styles.selectorTitle}>Select Your Location</Text>
        <Text style={styles.selectorSubtitle}>
          This will determine your currency and delivery options
        </Text>
        
        <FlatList
          data={availableCountries}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.countryCode}
          style={styles.locationList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Compact selector button (for headers/nav)
  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, style]}
        onPress={openLocationSelector}
        disabled={isLoading}
      >
        <Text style={styles.flag}>{currentLocation.flag}</Text>
        <Text style={styles.currencyCode}>{currentLocation.currency}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Modal for location selection */}
      <Modal
        visible={isSelectingLocation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeLocationSelector}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeLocationSelector}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={styles.closeButton} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Choose your location to see prices in your local currency
            </Text>
            
            <FlatList
              data={availableCountries}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.countryCode}
              style={styles.modalLocationList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Compact selector styles
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 60,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalLocationList: {
    flex: 1,
  },

  // Location item styles
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedLocationItem: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedText: {
    color: '#007AFF',
  },
  currencyInfo: {
    fontSize: 14,
    color: '#666',
  },
  selectedSubText: {
    color: '#5A9FD4',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },

  // Full selector styles
  fullSelectorContainer: {
    flex: 1,
    padding: 20,
  },
  selectorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectorSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  locationList: {
    flex: 1,
  },
});

export default LocationCurrencySelector;
