/**
 * Currency and Location Utilities for React Native
 * Handles location-based currency conversion and delivery options
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { yoraaAPI } from '../services/yoraaAPI';

// Storage keys
const STORAGE_KEYS = {
  USER_LOCATION: '@yoraa_user_location',
  CURRENCY_PREFERENCE: '@yoraa_currency_preference',
  EXCHANGE_RATES: '@yoraa_exchange_rates',
  LAST_RATE_UPDATE: '@yoraa_last_rate_update',
};

// Supported locations and currencies
export const SUPPORTED_LOCATIONS = {
  IN: {
    country: 'India',
    countryCode: 'IN',
    currency: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    locale: 'en-IN',
    deliveryType: 'domestic',
    timezone: 'Asia/Kolkata'
  },
  US: {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
    deliveryType: 'international',
    timezone: 'America/New_York'
  },
  GB: {
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'USD', // Backend converts to USD for international
    symbol: '$',
    flag: '🇬🇧',
    locale: 'en-GB',
    deliveryType: 'international',
    timezone: 'Europe/London'
  },
  CA: {
    country: 'Canada',
    countryCode: 'CA',
    currency: 'USD',
    symbol: '$',
    flag: '🇨🇦',
    locale: 'en-CA',
    deliveryType: 'international',
    timezone: 'America/Toronto'
  },
  AU: {
    country: 'Australia',
    countryCode: 'AU',
    currency: 'USD',
    symbol: '$',
    flag: '🇦🇺',
    locale: 'en-AU',
    deliveryType: 'international',
    timezone: 'Australia/Sydney'
  }
};

// Default fallback location (India)
const DEFAULT_LOCATION = SUPPORTED_LOCATIONS.IN;

/**
 * Map country name to country code
 */
const getCountryCodeFromName = (countryName) => {
  if (!countryName) return 'IN'; // Default to India
  
  const normalizedName = countryName.toString().toLowerCase().trim();
  
  // Map common country names to codes
  const countryMap = {
    'india': 'IN',
    'united states': 'US',
    'usa': 'US',
    'america': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'britain': 'GB',
    'canada': 'CA',
    'australia': 'AU',
    'international': 'US' // Default international to US
  };
  
  return countryMap[normalizedName] || 'IN'; // Default to India if not found
};

/**
 * Get user's current location preference
 * Priority: Backend preference (authenticated users only) > Stored preference > Default (India)
 */
export const getUserLocation = async () => {
  try {
    // First, check backend for user preference (only if user is authenticated)
    if (yoraaAPI.isAuthenticated()) {
      try {
        console.log('🔐 User is authenticated, fetching backend location preference...');
        const backendPreference = await yoraaAPI.getUserLocationPreference();
        if (backendPreference && backendPreference.countryCode) {
          const location = SUPPORTED_LOCATIONS[backendPreference.countryCode];
          if (location) {
            console.log('✅ Using backend location preference:', location.country);
            return location;
          }
        }
      } catch (error) {
        console.log('ℹ️ Backend location preference failed, using local fallback:', error.message);
      }
    } else {
      console.log('👤 Guest user detected, skipping backend location preference check');
    }

    // Fallback to locally stored preference
    const storedLocation = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (storedLocation) {
      const parsed = JSON.parse(storedLocation);
      const location = SUPPORTED_LOCATIONS[parsed.countryCode];
      if (location) {
        console.log('✅ Using locally stored location preference:', location.country);
        return location;
      }
    }

    // Default to India
    console.log('✅ Using default location:', DEFAULT_LOCATION.country);
    return DEFAULT_LOCATION;
  } catch (error) {
    console.error('Error getting user location:', error);
    return DEFAULT_LOCATION;
  }
};

/**
 * Set user's location preference
 * Saves to both backend and local storage
 */
export const setUserLocation = async (location) => {
  try {
    // Try to save to backend first (if user is logged in)
    try {
      // Map country name to country code if needed
      const countryCode = location.countryCode || getCountryCodeFromName(location.country);
      
      console.log('🔍 DEBUG - Location object received:', location);
      console.log('🔍 DEBUG - Extracted countryCode:', countryCode, 'currency:', location.currency);
      
      // Validate required fields
      if (!countryCode || !location.currency) {
        throw new Error(`Invalid location data: countryCode=${countryCode}, currency=${location.currency}`);
      }
      
      const backendSuccess = await yoraaAPI.setUserLocationPreference({
        countryCode: countryCode,
        currency: location.currency
      });
      
      if (backendSuccess) {
        console.log('✅ Location preference saved to backend');
      }
    } catch (error) {
      console.log('ℹ️ Backend save failed, continuing with local save:', error.message);
    }

    // Always save locally as backup/offline access
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
    
    // Clear cached exchange rates when location changes
    await AsyncStorage.removeItem(STORAGE_KEYS.EXCHANGE_RATES);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_RATE_UPDATE);
    
    console.log('✅ User location updated:', location.country);
    return true;
  } catch (error) {
    console.error('❌ Error setting user location:', error);
    return false;
  }
};

/**
 * Format price based on location/currency
 */
export const formatPrice = (price, location = null, options = {}) => {
  if (!price || isNaN(price)) return '₹0';
  
  const loc = location || DEFAULT_LOCATION;
  const {
    showDecimals = true,
    showSymbol = true
  } = options;

  const numericPrice = parseFloat(price);
  
  try {
    const formatted = new Intl.NumberFormat(loc.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: loc.currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(numericPrice);
    
    return formatted;
  } catch (error) {
    // Fallback formatting
    const symbol = showSymbol ? loc.symbol : '';
    const decimals = showDecimals ? numericPrice.toFixed(2) : Math.round(numericPrice);
    return `${symbol}${decimals}`;
  }
};

/**
 * Convert INR price to user's currency
 * Uses cached exchange rates for performance
 */
export const convertPrice = async (inrPrice, targetLocation = null) => {
  if (!inrPrice || isNaN(inrPrice)) return 0;
  
  const location = targetLocation || await getUserLocation();
  
  // No conversion needed for Indian users
  if (location.countryCode === 'IN') {
    return parseFloat(inrPrice);
  }
  
  try {
    const exchangeRate = await getExchangeRate('INR', location.currency);
    const convertedPrice = parseFloat(inrPrice) * exchangeRate;
    
    return Math.round(convertedPrice * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Currency conversion error:', error);
    return parseFloat(inrPrice); // Return original price on error
  }
};

/**
 * Get exchange rate with caching
 * Cache rates for 1 hour to reduce API calls
 */
const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  
  const cacheKey = `${fromCurrency}_${toCurrency}`;
  
  try {
    // Check cache first
    const cachedRates = await AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
    const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RATE_UPDATE);
    
    if (cachedRates && lastUpdate) {
      const rates = JSON.parse(cachedRates);
      const updateTime = parseInt(lastUpdate, 10);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (updateTime > oneHourAgo && rates[cacheKey]) {
        return rates[cacheKey];
      }
    }
    
    // Fetch new rates (you'll need to implement this with your backend)
    const rate = await fetchExchangeRateFromAPI(fromCurrency, toCurrency);
    
    // Cache the result
    const newRates = cachedRates ? JSON.parse(cachedRates) : {};
    newRates[cacheKey] = rate;
    
    await AsyncStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(newRates));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_RATE_UPDATE, Date.now().toString());
    
    return rate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    
    // Fallback rates (update these based on current rates)
    const fallbackRates = {
      'INR_USD': 0.012, // 1 INR = 0.012 USD (approximate)
      'USD_INR': 83.33  // 1 USD = 83.33 INR (approximate)
    };
    
    return fallbackRates[cacheKey] || 0.012;
  }
};

/**
 * Fetch exchange rate from backend API
 * Uses yoraaAPI service for proper authentication and error handling
 */
const fetchExchangeRateFromAPI = async (fromCurrency, toCurrency) => {
  try {
    console.log(`💱 Fetching exchange rate: ${fromCurrency} → ${toCurrency}`);
    const rate = await yoraaAPI.getExchangeRate(fromCurrency, toCurrency);
    console.log('✅ Exchange rate fetched via yoraaAPI:', rate);
    return rate;
  } catch (error) {
    console.error('❌ YoraaAPI exchange rate fetch error:', error);
    
    // Fallback to approximate rates when backend is unavailable
    if (fromCurrency === 'INR' && toCurrency === 'USD') {
      return 0.012; // 1 INR = ~0.012 USD
    }
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      return 83.33; // 1 USD = ~83.33 INR
    }
    
    return 1;
  }
};

/**
 * Convert product object prices based on user location
 */
export const convertProductPrices = async (product, targetLocation = null) => {
  if (!product) return product;
  
  const location = targetLocation || await getUserLocation();
  
  // No conversion needed for Indian users
  if (location.countryCode === 'IN') {
    return {
      ...product,
      displayPrice: product.price || product.regularPrice,
      displayCurrency: 'INR',
      displaySymbol: '₹',
      originalPrice: product.price || product.regularPrice,
      originalCurrency: 'INR'
    };
  }
  
  // Convert prices for international users
  const originalPrice = product.price || product.regularPrice || 0;
  const originalSalePrice = product.salePrice || null;
  
  const convertedPrice = await convertPrice(originalPrice, location);
  const convertedSalePrice = originalSalePrice ? await convertPrice(originalSalePrice, location) : null;
  
  return {
    ...product,
    displayPrice: convertedSalePrice || convertedPrice,
    displaySalePrice: convertedSalePrice,
    displayRegularPrice: convertedPrice,
    displayCurrency: location.currency,
    displaySymbol: location.symbol,
    originalPrice: originalPrice,
    originalSalePrice: originalSalePrice,
    originalCurrency: 'INR',
    isConverted: true,
    conversionRate: await getExchangeRate('INR', location.currency)
  };
};

/**
 * Get delivery options based on user location
 * Now integrated with backend API via yoraaAPI service
 */
export const getDeliveryOptions = async (location = null) => {
  const userLocation = location || await getUserLocation();
  
  try {
    console.log(`🚚 Getting delivery options for: ${userLocation.country}`);
    const deliveryOptions = await yoraaAPI.getDeliveryOptions(userLocation.countryCode, userLocation.currency);
    
    if (deliveryOptions && deliveryOptions.length > 0) {
      console.log('✅ Delivery options fetched via yoraaAPI:', deliveryOptions.length);
      return deliveryOptions;
    }
    
    console.warn('⚠️ Backend delivery options not available, using fallback');
  } catch (error) {
    console.error('❌ Error fetching delivery options via yoraaAPI:', error);
  }
  
  // Fallback to hardcoded options if backend API fails
  return getFallbackDeliveryOptions(userLocation);
};

/**
 * Fallback delivery options when backend API is unavailable
 */
const getFallbackDeliveryOptions = (userLocation) => {
  if (userLocation.deliveryType === 'domestic') {
    return [
      {
        id: 'free_standard',
        name: 'Standard Delivery',
        description: 'Free delivery in 3-5 business days',
        cost: 0,
        currency: 'INR',
        symbol: '₹',
        estimatedDays: '3-5',
        type: 'standard',
        free: true
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Fast delivery in 1-2 business days',
        cost: 199,
        currency: 'INR',
        symbol: '₹',
        estimatedDays: '1-2',
        type: 'express',
        free: false
      }
    ];
  } else {
    // International delivery options
    return [
      {
        id: 'international_standard',
        name: 'International Standard',
        description: 'Standard international shipping',
        cost: 25,
        currency: 'USD',
        symbol: '$',
        estimatedDays: '7-14',
        type: 'international',
        free: false
      },
      {
        id: 'international_express',
        name: 'International Express',
        description: 'Fast international shipping',
        cost: 45,
        currency: 'USD',
        symbol: '$',
        estimatedDays: '3-7',
        type: 'express',
        free: false
      }
    ];
  }
};

/**
 * Check if user is in domestic (India) region
 */
export const isDomesticUser = async (location = null) => {
  const userLocation = location || await getUserLocation();
  return userLocation.countryCode === 'IN';
};

/**
 * Get country list for location selector
 */
export const getCountryList = () => {
  return Object.values(SUPPORTED_LOCATIONS);
};

/**
 * Validate and sanitize location data
 */
export const validateLocation = (location) => {
  if (!location || typeof location !== 'object') return false;
  
  const required = ['country', 'countryCode', 'currency', 'symbol'];
  return required.every(field => location[field]);
};

/**
 * Clear all cached currency data
 */
export const clearCurrencyCache = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.EXCHANGE_RATES,
      STORAGE_KEYS.LAST_RATE_UPDATE
    ]);
    console.log('✅ Currency cache cleared');
  } catch (error) {
    console.error('❌ Error clearing currency cache:', error);
  }
};

export default {
  getUserLocation,
  setUserLocation,
  formatPrice,
  convertPrice,
  convertProductPrices,
  getDeliveryOptions,
  isDomesticUser,
  getCountryList,
  validateLocation,
  clearCurrencyCache,
  SUPPORTED_LOCATIONS
};
