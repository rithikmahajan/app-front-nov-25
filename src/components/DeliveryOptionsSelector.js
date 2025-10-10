/**
 * Delivery Options Selector Component for React Native
 * Shows delivery options based on user's location (domestic vs international)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useLocationCurrency } from '../hooks/useLocationCurrency';
import { getDeliveryOptions, formatPrice } from '../utils/currencyUtils';

const DeliveryOptionsSelector = ({
  selectedOption = null,
  onOptionSelect = null,
  style = {},
  showTitle = true
}) => {
  const { currentLocation, isLoading: locationLoading } = useLocationCurrency();
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(selectedOption);

  // Load delivery options when location changes
  useEffect(() => {
    const loadDeliveryOptions = async () => {
      try {
        setIsLoading(true);
        const options = await getDeliveryOptions(currentLocation);
        setDeliveryOptions(options);
        
        // Auto-select first option if none selected
        if (!selectedDeliveryOption && options.length > 0) {
          setSelectedDeliveryOption(options[0]);
          if (onOptionSelect) {
            onOptionSelect(options[0]);
          }
        }
      } catch (error) {
        console.error('Error loading delivery options:', error);
        setDeliveryOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!locationLoading) {
      loadDeliveryOptions();
    }
  }, [currentLocation, locationLoading, selectedDeliveryOption, onOptionSelect]);

  const handleOptionSelect = (option) => {
    setSelectedDeliveryOption(option);
    if (onOptionSelect) {
      onOptionSelect(option);
    }
  };

  const renderDeliveryOption = (option) => {
    const isSelected = selectedDeliveryOption?.id === option.id;
    const priceText = option.free ? 'FREE' : formatPrice(option.cost, {
      currency: option.currency,
      symbol: option.symbol
    });

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionContainer,
          isSelected && styles.selectedOption
        ]}
        onPress={() => handleOptionSelect(option)}
      >
        <View style={styles.optionHeader}>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionName, isSelected && styles.selectedText]}>
              {option.name}
            </Text>
            <Text style={[styles.optionDescription, isSelected && styles.selectedSubText]}>
              {option.description}
            </Text>
          </View>
          
          <View style={styles.optionPrice}>
            <Text style={[
              styles.priceText,
              option.free && styles.freeText,
              isSelected && styles.selectedText
            ]}>
              {priceText}
            </Text>
            <Text style={[styles.estimatedDays, isSelected && styles.selectedSubText]}>
              {option.estimatedDays} days
            </Text>
          </View>
        </View>
        
        {/* Selection indicator */}
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.radioButton,
            isSelected && styles.selectedRadio
          ]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (locationLoading || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading delivery options...</Text>
      </View>
    );
  }

  if (deliveryOptions.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {showTitle && (
          <Text style={styles.title}>Delivery Options</Text>
        )}
        <Text style={styles.noOptionsText}>
          No delivery options available for your location.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <Text style={styles.title}>
          Delivery Options {currentLocation.flag}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {deliveryOptions.map(renderDeliveryOption)}
      </View>
      
      {/* Location info */}
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          Delivering to: {currentLocation.country}
        </Text>
        <Text style={styles.currencyText}>
          Prices shown in {currentLocation.currency}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    padding: 16,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  optionPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  freeText: {
    color: '#28A745',
  },
  estimatedDays: {
    fontSize: 12,
    color: '#666',
  },
  selectionIndicator: {
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  selectedText: {
    color: '#007AFF',
  },
  selectedSubText: {
    color: '#5A9FD4',
  },
  locationInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  currencyText: {
    fontSize: 12,
    color: '#666',
  },
  noOptionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default DeliveryOptionsSelector;
