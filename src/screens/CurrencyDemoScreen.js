/**
 * Currency Demo Screen
 * Demonstrates the location-based currency system implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import LocationCurrencySelector from '../components/LocationCurrencySelector';
import DeliveryOptionsSelector from '../components/DeliveryOptionsSelector';
import { formatPrice } from '../utils/currencyUtils';

const CurrencyDemoScreen = ({ navigation }) => {
  const {
    currentLocation,
    isDomestic,
    currency,
    currencySymbol,
    convertProduct,
    formatPrice: formatCurrentPrice,
    isLoading
  } = useCurrencyContext();
  
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [sampleProducts, setSampleProducts] = useState([]);

  // Sample product data for demonstration
  const sampleProductsData = React.useMemo(() => [
    {
      id: '1',
      name: 'Classic Cotton T-Shirt',
      price: 1999, // INR 1999
      salePrice: 1499, // INR 1499
      image: 'https://example.com/tshirt.jpg'
    },
    {
      id: '2',
      name: 'Denim Jacket',
      price: 4999, // INR 4999
      regularPrice: 4999,
      image: 'https://example.com/jacket.jpg'
    },
    {
      id: '3',
      name: 'Summer Dress',
      price: 2999, // INR 2999
      salePrice: 2299, // INR 2299
      image: 'https://example.com/dress.jpg'
    }
  ], []);

  // Convert sample products when location changes
  useEffect(() => {
    const convertSampleProducts = async () => {
      try {
        const converted = await Promise.all(
          sampleProductsData.map(product => convertProduct(product))
        );
        setSampleProducts(converted);
      } catch (error) {
        console.error('Error converting sample products:', error);
        setSampleProducts(sampleProductsData);
      }
    };

    if (!isLoading) {
      convertSampleProducts();
    }
  }, [currentLocation, convertProduct, isLoading]);

  const handleLocationChange = (location) => {
    Alert.alert(
      'Location Changed',
      `Currency switched to ${location.currency}. All prices have been updated.`,
      [{ text: 'OK' }]
    );
  };

  const renderProductItem = (product) => (
    <View key={product.id} style={styles.productItem}>
      <Text style={styles.productName}>{product.name}</Text>
      <View style={styles.priceContainer}>
        {product.displaySalePrice && (
          <Text style={styles.salePrice}>
            {formatCurrentPrice(product.displaySalePrice)}
          </Text>
        )}
        <Text style={[
          styles.regularPrice,
          product.displaySalePrice && styles.crossedPrice
        ]}>
          {formatCurrentPrice(product.displayPrice)}
        </Text>
      </View>
      {product.isConverted && (
        <Text style={styles.originalPrice}>
          Originally: ₹{product.originalPrice}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading currency system...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency Demo</Text>
        <LocationCurrencySelector 
          onLocationChange={handleLocationChange}
          style={styles.headerLocationSelector}
        />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Current Location Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current Location Settings</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country:</Text>
            <Text style={styles.infoValue}>{currentLocation.country} {currentLocation.flag}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency:</Text>
            <Text style={styles.infoValue}>{currency} ({currencySymbol})</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Type:</Text>
            <Text style={styles.infoValue}>{isDomestic ? 'Domestic' : 'International'}</Text>
          </View>
        </View>

        {/* Sample Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Products</Text>
          <Text style={styles.sectionSubtitle}>
            Prices are automatically converted based on your location
          </Text>
          {sampleProducts.map(renderProductItem)}
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          <DeliveryOptionsSelector
            selectedOption={selectedDeliveryOption}
            onOptionSelect={(option) => {
              setSelectedDeliveryOption(option);
              console.log('Selected delivery option:', option);
            }}
            showTitle={false}
          />
        </View>

        {/* Currency Utils Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Formatting Examples</Text>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>formatPrice(1999):</Text>
            <Text style={styles.exampleValue}>{formatPrice(1999, currentLocation)}</Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>formatPrice(25.99):</Text>
            <Text style={styles.exampleValue}>{formatPrice(25.99, currentLocation)}</Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>formatPrice(0):</Text>
            <Text style={styles.exampleValue}>{formatPrice(0, currentLocation)}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Use</Text>
          <Text style={styles.instructionsText}>
            1. Tap the location selector in the header to change your location{'\n'}
            2. Notice how all prices update automatically{'\n'}
            3. Delivery options change based on domestic vs international{'\n'}
            4. Currency formatting adapts to the selected locale
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerLocationSelector: {
    // Custom positioning for header
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
    marginRight: 8,
  },
  regularPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  crossedPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  originalPrice: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  exampleLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  exampleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
});

export default CurrencyDemoScreen;
