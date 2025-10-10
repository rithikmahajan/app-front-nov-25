import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Share,
} from 'react-native';
import GlobalBackButton from '../components/GlobalBackButton';

// User Icon Component
const UserIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>👤</Text>
  </View>
);

// Bag Icon Component
const BagIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>🛍️</Text>
  </View>
);

// Share Icon Component
const ShareIcon = () => (
  <View style={styles.shareIconContainer}>
    <Text style={styles.shareIconText}>↗</Text>
  </View>
);

const InvoiceDetails = ({ navigation, route }) => {
  const { invoice } = route.params || {};

  const handleBack = () => {
    console.log('InvoiceDetails: handleBack called');
    console.log('Navigation object:', navigation);
    try {
      navigation.navigate('Invoice');
      console.log('InvoiceDetails: Successfully navigated to Invoice');
    } catch (error) {
      console.error('InvoiceDetails: Navigation error:', error);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      Alert.alert(
        'Download Started',
        `Invoice ${invoice?.orderNumber} is being downloaded to your device.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Download Failed',
        'Failed to download invoice. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShareInvoice = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoice?.orderNumber} - Order ${invoice?.statusText}\nDate: ${invoice?.date}\nAmount: ${invoice?.amount}`,
        title: `Invoice ${invoice?.orderNumber}`,
        ...(Platform.OS === 'ios' && {
          url: `https://yoraa.app/invoice/${invoice?.orderNumber}`,
        }),
      });
    } catch (error) {
      Alert.alert(
        'Share Failed',
        'Failed to share invoice. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4CD964'; // Green for delivered
      case 'cancelled':
        return '#EA4335'; // Red for cancelled
      case 'exchange':
        return '#FBBC05'; // Yellow for exchange
      default:
        return '#767676'; // Gray default
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'exchange':
        return 'Exchange Requested';
      default:
        return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <GlobalBackButton onPress={handleBack} />
        </View>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order ID and Status */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderIdText}>Orders ID: #{invoice?.orderNumber?.slice(-4) || '6743'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice?.status) }]}>
            <Text style={styles.statusBadgeText}>
              {getStatusText(invoice?.status)}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Dated:</Text>
          <Text style={styles.dateValue}>feb 16,2025</Text>
        </View>

        {/* Product Image Section */}
        <View style={styles.productImageSection}>
          <View style={styles.productImageGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.productImageItem}>
                <Text style={styles.productImagePlaceholder}>👕</Text>
              </View>
            ))}
          </View>
          <View style={styles.imageIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Download and Share Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Text style={styles.downloadButtonText}>Download Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareInvoice}
            activeOpacity={0.8}
          >
            <ShareIcon />
          </TouchableOpacity>
        </View>

        {/* Order Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <BagIcon />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Order Info</Text>
              <Text style={styles.infoDetail}>Shipping: Next express</Text>
              <Text style={styles.infoDetail}>Payment Method: Paypal</Text>
              <Text style={styles.infoDetail}>Status: Pending</Text>
            </View>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <UserIcon />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Customer</Text>
              <Text style={styles.infoDetail}>Full Name: Shristi Singh</Text>
              <Text style={styles.infoDetail}>Email: shristi@gmail.com</Text>
              <Text style={styles.infoDetail}>Phone: +91 904 1212</Text>
            </View>
          </View>
        </View>

        {/* Billing Address Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <BagIcon />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Billed to</Text>
              <Text style={styles.infoDetail}>
                Address: Dharam Colony, Palam Vihar, Gurgaon, Haryana
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.deliverySection}>
          <Text style={styles.infoTitle}>Delivered to</Text>
          <Text style={styles.infoDetail}>
            Address: Dharam Colony, Palam Vihar, Gurgaon, Haryana
          </Text>
        </View>

        {/* Payment Info Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>payment info</Text>
          <View style={styles.paymentRow}>
            <View style={styles.cardIcon} />
            <Text style={styles.paymentDetail}>Master Card **** **** 6557</Text>
          </View>
          <Text style={styles.paymentDetail}>Business name: Shristi Singh</Text>
          <Text style={styles.paymentDetail}>Phone: +91 904 231 1212</Text>
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

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  backButtonContainer: {
    width: 68,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'Montserrat-Medium',
  },
  headerSpacer: {
    width: 68,
  },

  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Order Header Styles
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#232321',
    fontFamily: 'OpenSans-SemiBold',
  },

  // Date Styles
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dateLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#232321',
    marginRight: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    alignSelf: 'flex-end',
    fontFamily: 'Montserrat-SemiBold',
  },

  // Product Image Styles
  productImageSection: {
    marginBottom: 30,
    backgroundColor: '#EEE',
    borderRadius: 0,
    padding: 0,
    height: 465,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  productImageItem: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholder: {
    fontSize: 24,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 10,
    height: 2,
    backgroundColor: '#848688',
    marginHorizontal: 2,
  },
  activeIndicator: {
    backgroundColor: '#000000',
    width: 34,
  },

  // Action Section Styles
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info Section Styles
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#232321',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#232321',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  infoDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    marginBottom: 4,
    lineHeight: 27.5,
    fontFamily: 'Montserrat-SemiBold',
  },

  // Delivery Section
  deliverySection: {
    marginBottom: 30,
    marginLeft: 64, // Offset to align with other content
  },

  // Payment Section Styles
  paymentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#232321',
    marginBottom: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 21,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: 8,
  },
  paymentDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70706E',
    marginBottom: 4,
    fontFamily: 'OpenSans-SemiBold',
  },

  // Share Icon Styles
  shareIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: 16,
    color: '#767676',
  },
});

export default InvoiceDetails;
