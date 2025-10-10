import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';
import { useBag } from '../contexts/BagContext';
import { GlobalCartIcon } from '../assets/icons';

const BagContent = React.memo(({ navigation }) => {
  const { bagItems, removeFromBag, updateQuantity, getTotalPrice } = useBag();

  const handleBackPress = useCallback(() => {
    navigation.navigate('bagemptyscreen');
  }, [navigation]);

  const handleRemoveItem = useCallback((productId, size) => {
    removeFromBag(productId, size);
  }, [removeFromBag]);

  const handleQuantityChange = useCallback((productId, size, newQuantity) => {
    updateQuantity(productId, size, newQuantity);
  }, [updateQuantity]);

  const handleProceedToCheckout = useCallback(() => {
    navigation.navigate('Bag', { previousScreen: 'BagContent' });
  }, [navigation]);

  const renderBagItem = useCallback((item, index) => (
    <View key={`${item.id}-${item.size}`} style={styles.bagItem}>
      <View style={styles.productImagePlaceholder}>
        <GlobalCartIcon size={24} color="#CCCCCC" />
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand || 'Brand'}</Text>
        <Text style={styles.productSize}>Size: {item.size}</Text>
        <Text style={styles.productPrice}>
          {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.size)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  ), [handleQuantityChange, handleRemoveItem]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to previous screen"
        >
          <GlobalBackButton onPress={handleBackPress} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Bag ({bagItems.length})</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bagItems.map(renderBagItem)}
      </ScrollView>

      {/* Total and Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleProceedToCheckout}
          accessibilityRole="button"
          accessibilityLabel="Proceed to Checkout"
          accessibilityHint="Navigate to checkout screen"
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
  backButton: {
    width: 68,
    alignItems: 'flex-start',
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
    paddingHorizontal: 16,
  },

  bagItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  productDetails: {
    flex: 1,
    paddingRight: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },

  productBrand: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
  },

  productSize: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 12,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },

  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  removeButtonText: {
    fontSize: 14,
    color: '#FF4444',
    fontFamily: 'Montserrat-Regular',
  },

  // Footer Styles
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },

  checkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium',
  },
});

export default BagContent;
