import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

// Mock data for invoices with different statuses
const invoiceData = [
  {
    id: 1,
    status: 'delivered',
    statusText: 'Order delivered',
    productName: 'Nike Everyday Plus Cushioned',
    productDetails: 'Training Crew Socks Mystic Navy/Worn Blue/Worn Bl...',
    size: 'Size L (W 10-13 / M 8-12)',
    imageColor: '#EEEEEE',
    date: 'Dec 15, 2024',
    orderNumber: 'YOR001234',
    amount: '$24.99',
  },
  {
    id: 2,
    status: 'cancelled',
    statusText: 'Order canceled',
    productName: 'Nike Everyday Plus Cushioned',
    productDetails: 'Training Crew Socks Mystic Navy/Worn Blue/Worn Bl...',
    size: 'Size L (W 10-13 / M 8-12)',
    imageColor: '#EEEEEE',
    date: 'Dec 10, 2024',
    orderNumber: 'YOR001235',
    amount: '$24.99',
  },
  {
    id: 3,
    status: 'exchange',
    statusText: 'Exchange Requeted',
    productName: 'Nike Everyday Plus Cushioned',
    productDetails: 'Training Crew Socks Mystic Navy/Worn Blue/Worn Bl...',
    size: 'Size L (W 10-13 / M 8-12)',
    imageColor: '#EEEEEE',
    date: 'Dec 8, 2024',
    orderNumber: 'YOR001236',
    amount: '$24.99',
  },
];

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return '#32862b'; // Green for delivered - exact Figma color
    case 'cancelled':
      return '#ea4335'; // Red for cancelled - exact Figma color
    case 'exchange':
      return '#fbbc05'; // Yellow for exchange - exact Figma color
    default:
      return '#767676'; // Gray default
  }
};

const InvoiceScreen = ({ navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleBack = () => {
    console.log('Invoice: handleBack called');
    console.log('Invoice: selectedInvoice:', selectedInvoice);
    if (selectedInvoice) {
      setSelectedInvoice(null);
      console.log('Invoice: Cleared selectedInvoice');
    } else {
      console.log('Invoice: Navigating to Profile');
      try {
        navigation.navigate('Profile');
        console.log('Invoice: Successfully navigated to Profile');
      } catch (error) {
        console.error('Invoice: Navigation error:', error);
      }
    }
  };

  const handleViewInvoice = (invoice) => {
    // Navigate to invoice details screen
    navigation.navigate('InvoiceDetails', { invoice });
  };

  const renderInvoiceItem = (invoice) => (
    <View key={invoice.id} style={styles.invoiceItem}>
      {/* Product Content */}
      <View style={styles.productContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>👕</Text>
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <View style={styles.statusAndNameContainer}>
            {/* Status Header */}
            <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
              {invoice.statusText}
            </Text>
            <Text style={styles.productName}>{invoice.productName}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.productDescription}>{invoice.productDetails}</Text>
            <Text style={styles.productSize}>{invoice.size}</Text>
          </View>
        </View>
      </View>

      {/* View Invoice Button */}
      <TouchableOpacity 
        style={styles.viewInvoiceButton}
        onPress={() => handleViewInvoice(invoice)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewInvoiceText}>view Invoice</Text>
      </TouchableOpacity>
    </View>
  );

  // Main list view return
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <GlobalBackButton onPress={handleBack} />
          </View>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {invoiceData.map(renderInvoiceItem)}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  animatedContainer: {
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 0, // Leading 0 as per Figma
  },
  headerSpacer: {
    width: 68,
    opacity: 0,
  },

  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20, // Normal padding after header
    paddingBottom: 20,
  },

  // Invoice Item Styles
  invoiceItem: {
    backgroundColor: 'transparent',
    marginBottom: 40, // Spacing between invoice items
    width: '100%',
  },

  // Product Styles
  productContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24, // 6 * 4 = 24px gap as per Figma
    gap: 14, // 3.5 * 4 = 14px gap as per Figma
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE', // Changed to match Figma background
    flexShrink: 0,
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  productDetails: {
    flex: 1,
    flexDirection: 'column',
    gap: 8, // 2 * 4 = 8px gap as per Figma
    alignSelf: 'stretch',
  },
  statusAndNameContainer: {
    flexDirection: 'column',
    gap: 3, // 3px gap between status and name as per Figma
  },
  descriptionContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  // Status and Text Styles
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Medium',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },
  productSize: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    letterSpacing: -0.14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16.8, // 1.2 * 14 = 16.8
    marginBottom: 0,
  },

  // Button Styles
  viewInvoiceButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e4e4',
  },
  viewInvoiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 19.2, // 1.2 * 16 = 19.2 as per Figma
    textAlign: 'center',
    whiteSpace: 'pre', // To match Figma whitespace handling
  },
});

export default InvoiceScreen;
