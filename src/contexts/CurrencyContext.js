/**
 * Currency Context for React Native
 * Provides global currency and location state management
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import {
  getUserLocation,
  setUserLocation,
  convertProductPrices,
  getDeliveryOptions,
  formatPrice,
  clearCurrencyCache,
  SUPPORTED_LOCATIONS
} from '../utils/currencyUtils';

// Action types
const CURRENCY_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_LOCATION: 'SET_LOCATION',
  SET_DELIVERY_OPTIONS: 'SET_DELIVERY_OPTIONS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  currentLocation: SUPPORTED_LOCATIONS.IN, // Default to India
  deliveryOptions: [],
  isLoading: true,
  error: null,
  initialized: false
};

// Reducer
const currencyReducer = (state, action) => {
  switch (action.type) {
    case CURRENCY_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case CURRENCY_ACTIONS.SET_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
        initialized: true,
        error: null
      };
    
    case CURRENCY_ACTIONS.SET_DELIVERY_OPTIONS:
      return {
        ...state,
        deliveryOptions: action.payload
      };
    
    case CURRENCY_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case CURRENCY_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const CurrencyContext = createContext(null);

// Context provider component
export const CurrencyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(currencyReducer, initialState);

  // Initialize currency context
  const initializeCurrency = useCallback(async () => {
    try {
      dispatch({ type: CURRENCY_ACTIONS.SET_LOADING, payload: true });
      
      // Get user's location preference
      const location = await getUserLocation();
      dispatch({ type: CURRENCY_ACTIONS.SET_LOCATION, payload: location });
      
      // Load delivery options for current location
      const deliveryOpts = await getDeliveryOptions(location);
      dispatch({ type: CURRENCY_ACTIONS.SET_DELIVERY_OPTIONS, payload: deliveryOpts });
      
      console.log('✅ Currency context initialized:', {
        country: location.country,
        currency: location.currency,
        deliveryOptions: deliveryOpts.length
      });
      
    } catch (error) {
      console.error('❌ Currency initialization error:', error);
      dispatch({ 
        type: CURRENCY_ACTIONS.SET_ERROR, 
        payload: 'Failed to initialize currency settings' 
      });
      
      // Fallback to India
      dispatch({ type: CURRENCY_ACTIONS.SET_LOCATION, payload: SUPPORTED_LOCATIONS.IN });
    } finally {
      dispatch({ type: CURRENCY_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Update user location
  const updateLocation = useCallback(async (newLocation) => {
    try {
      dispatch({ type: CURRENCY_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CURRENCY_ACTIONS.CLEAR_ERROR });
      
      // Save location preference
      const success = await setUserLocation(newLocation);
      if (!success) {
        throw new Error('Failed to save location preference');
      }
      
      // Update context state
      dispatch({ type: CURRENCY_ACTIONS.SET_LOCATION, payload: newLocation });
      
      // Load new delivery options
      const deliveryOpts = await getDeliveryOptions(newLocation);
      dispatch({ type: CURRENCY_ACTIONS.SET_DELIVERY_OPTIONS, payload: deliveryOpts });
      
      console.log('✅ Location updated:', newLocation.country);
      return true;
      
    } catch (error) {
      console.error('❌ Location update error:', error);
      dispatch({ 
        type: CURRENCY_ACTIONS.SET_ERROR, 
        payload: 'Failed to update location' 
      });
      return false;
    } finally {
      dispatch({ type: CURRENCY_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Convert product prices based on current location
  const convertProduct = useCallback(async (product) => {
    try {
      return await convertProductPrices(product, state.currentLocation);
    } catch (error) {
      console.error('Product conversion error:', error);
      return product; // Return original on error
    }
  }, [state.currentLocation]);

  // Convert multiple products
  const convertProducts = useCallback(async (products) => {
    if (!Array.isArray(products)) return products;
    
    try {
      const convertedProducts = await Promise.all(
        products.map(product => convertProduct(product))
      );
      return convertedProducts;
    } catch (error) {
      console.error('Products conversion error:', error);
      return products; // Return original on error
    }
  }, [convertProduct]);

  // Format price with current location settings
  const formatCurrentPrice = useCallback((price, options = {}) => {
    return formatPrice(price, state.currentLocation, options);
  }, [state.currentLocation]);

  // Get currency info
  const getCurrencyInfo = useCallback(() => {
    return {
      code: state.currentLocation.currency,
      symbol: state.currentLocation.symbol,
      locale: state.currentLocation.locale,
      country: state.currentLocation.country,
      isDomestic: state.currentLocation.countryCode === 'IN'
    };
  }, [state.currentLocation]);

  // Clear all cached data
  const clearCache = useCallback(async () => {
    try {
      await clearCurrencyCache();
      // Reinitialize after clearing cache
      await initializeCurrency();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }, [initializeCurrency]);

  // Initialize on mount
  useEffect(() => {
    initializeCurrency();
  }, [initializeCurrency]);

  // Context value
  const contextValue = {
    // State
    currentLocation: state.currentLocation,
    deliveryOptions: state.deliveryOptions,
    isLoading: state.isLoading,
    error: state.error,
    initialized: state.initialized,
    
    // Currency info shortcuts
    currency: state.currentLocation.currency,
    currencySymbol: state.currentLocation.symbol,
    countryCode: state.currentLocation.countryCode,
    isDomestic: state.currentLocation.countryCode === 'IN',
    
    // Actions
    updateLocation,
    convertProduct,
    convertProducts,
    formatPrice: formatCurrentPrice,
    getCurrencyInfo,
    clearCache,
    refresh: initializeCurrency,
    
    // Error handling
    clearError: () => dispatch({ type: CURRENCY_ACTIONS.CLEAR_ERROR })
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook to use currency context
export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  
  return context;
};

// Hook for simple currency access
export const useCurrentCurrency = () => {
  const { currency, currencySymbol, isDomestic, formatPrice: formatCurrentPrice } = useCurrencyContext();
  
  return {
    currency,
    symbol: currencySymbol,
    isDomestic,
    formatPrice: formatCurrentPrice
  };
};

export default CurrencyContext;
