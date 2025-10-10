/**
 * Location Detection Hook for React Native
 * Handles user location detection and currency preferences
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserLocation,
  setUserLocation,
  isDomesticUser,
  getCountryList,
  SUPPORTED_LOCATIONS
} from '../utils/currencyUtils';

/**
 * Custom hook for managing user location and currency preferences
 */
export const useLocationCurrency = () => {
  const [currentLocation, setCurrentLocation] = useState(SUPPORTED_LOCATIONS.IN); // Default to India
  const [isLoading, setIsLoading] = useState(true);
  const [isDomestic, setIsDomestic] = useState(true);
  const [availableCountries, setAvailableCountries] = useState([]);

  // Initialize location data
  const initializeLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get user's current location preference
      const location = await getUserLocation();
      setCurrentLocation(location);
      
      // Check if user is domestic (India)
      const domestic = await isDomesticUser(location);
      setIsDomestic(domestic);
      
      // Set available countries
      setAvailableCountries(getCountryList());
      
      console.log('✅ Location initialized:', {
        country: location.country,
        currency: location.currency,
        isDomestic: domestic
      });
    } catch (error) {
      console.error('❌ Error initializing location:', error);
      // Fallback to India
      setCurrentLocation(SUPPORTED_LOCATIONS.IN);
      setIsDomestic(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user location
  const updateUserLocation = useCallback(async (newLocation) => {
    try {
      setIsLoading(true);
      
      // Validate location object
      if (!newLocation || !newLocation.countryCode) {
        throw new Error('Invalid location object');
      }
      
      // Update in storage
      const success = await setUserLocation(newLocation);
      if (!success) {
        throw new Error('Failed to save location preference');
      }
      
      // Update local state
      setCurrentLocation(newLocation);
      const domestic = newLocation.countryCode === 'IN';
      setIsDomestic(domestic);
      
      console.log('✅ Location updated successfully:', newLocation.country);
      return true;
      
    } catch (error) {
      console.error('❌ Error updating location:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get formatted currency symbol
  const getCurrencySymbol = useCallback(() => {
    return currentLocation.symbol || '₹';
  }, [currentLocation]);

  // Get currency code
  const getCurrencyCode = useCallback(() => {
    return currentLocation.currency || 'INR';
  }, [currentLocation]);

  // Check if location needs selection
  const needsLocationSelection = useCallback(() => {
    // You can add logic here to determine if user needs to select location
    // For example, if they haven't explicitly set a preference
    return false; // For now, always return false
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  return {
    // Current state
    currentLocation,
    isLoading,
    isDomestic,
    availableCountries,
    
    // Helper functions
    getCurrencySymbol,
    getCurrencyCode,
    needsLocationSelection,
    
    // Actions
    updateUserLocation,
    refreshLocation: initializeLocation,
    
    // Quick access to common location data
    countryCode: currentLocation.countryCode,
    countryName: currentLocation.country,
    currency: currentLocation.currency,
    currencySymbol: currentLocation.symbol,
    locale: currentLocation.locale,
    flag: currentLocation.flag,
    deliveryType: currentLocation.deliveryType
  };
};

/**
 * Simpler hook for just currency information
 */
export const useCurrency = () => {
  const {
    currentLocation,
    isLoading,
    getCurrencySymbol,
    getCurrencyCode,
    isDomestic
  } = useLocationCurrency();

  return {
    currency: getCurrencyCode(),
    symbol: getCurrencySymbol(),
    locale: currentLocation.locale,
    isDomestic,
    isLoading
  };
};

/**
 * Hook for location selection UI
 */
export const useLocationSelector = () => {
  const {
    currentLocation,
    availableCountries,
    updateUserLocation,
    isLoading
  } = useLocationCurrency();

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const openLocationSelector = useCallback(() => {
    setIsSelectingLocation(true);
  }, []);

  const closeLocationSelector = useCallback(() => {
    setIsSelectingLocation(false);
  }, []);

  const selectLocation = useCallback(async (location) => {
    const success = await updateUserLocation(location);
    if (success) {
      setIsSelectingLocation(false);
    }
    return success;
  }, [updateUserLocation]);

  return {
    currentLocation,
    availableCountries,
    isSelectingLocation,
    isLoading,
    openLocationSelector,
    closeLocationSelector,
    selectLocation
  };
};

export default useLocationCurrency;
