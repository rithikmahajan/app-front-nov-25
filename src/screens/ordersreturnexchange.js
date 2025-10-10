import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { GlobalBackButton } from '../components';
import { useShiprocket } from '../contexts/ShiprocketContext';
import { ReturnExchangeActions } from '../components/ShippingComponents';

const returnReasons = [
  { id: 'size_fit', title: 'Size/fit issue', subtitle: '(For Exchanging the product)' },
  { id: 'not_expected', title: 'Product not as expected' },
  { id: 'wrong_item', title: 'Wrong item received' },
  { id: 'damaged', title: 'Damaged/defective product' },
  { id: 'late_delivery', title: 'Late delivery' },
  { id: 'quality', title: 'Quality not as expected' },
];

const ReturnRequestScreen = ({ navigation, route }) => {
  const [selectedReason, setSelectedReason] = useState(null);

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    
    // Navigate to size selection screen if size/fit issue is selected
    if (reason.id === 'size_fit') {
      navigation.navigate('OrdersExchangeSizeSelectionChart');
    } else {
      // Navigate to return request modal for other reasons
      navigation.navigate('OrdersReturnRequest');
    }
  };

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    Alert.alert('Feature Coming Soon', 'Image upload functionality will be implemented.');
  };

  const handleCameraUpload = () => {
    // Placeholder for camera functionality
    Alert.alert('Feature Coming Soon', 'Camera functionality will be implemented.');
  };

  const handleSubmitRequest = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for return/exchange.');
      return;
    }
    
    Alert.alert(
      'Request Submitted',
      'Your return/exchange request has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderReasonItem = (reason) => (
    <TouchableOpacity
      key={reason.id}
      style={[
        styles.reasonContainer,
        selectedReason?.id === reason.id && styles.selectedReasonContainer
      ]}
      onPress={() => handleReasonSelect(reason)}
      activeOpacity={0.7}
    >
      <View style={styles.reasonContent}>
        <Text style={[
          styles.reasonTitle,
          selectedReason?.id === reason.id && styles.selectedReasonText
        ]}>
          {reason.title}
          {reason.subtitle && (
            <Text style={styles.reasonSubtitle}> {reason.subtitle}</Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalBackButton onPress={() => navigation?.navigate('Orders')} />
        <Text style={styles.headerTitle}>Return Request</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shiprocket Return/Exchange Actions */}
        {route?.params?.order && (
          <View style={styles.shiprocketActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ReturnExchangeActions 
              order={route.params.order}
              onSuccess={() => {
                Alert.alert(
                  'Success',
                  'Your request has been processed. You will be redirected to orders.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation?.navigate('Orders')
                    }
                  ]
                );
              }}
            />
          </View>
        )}

        {/* Submit Return Request Section */}
        <Text style={styles.sectionTitle}>Submit Return Request</Text>
        
        {/* Reasons List */}
        <View style={styles.reasonsList}>
          {returnReasons.map(renderReasonItem)}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>*Return request is chargeable</Text>

        {/* Upload Images Section */}
        <Text style={styles.uploadTitle}>Upload Images Here</Text>
        
        <View style={styles.uploadContainer}>
          {/* Image Upload Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIcon}>
              <View style={styles.imageIcon}>
                <View style={styles.imagePlaceholder} />
                <View style={styles.imageCircle} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Camera Upload Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleCameraUpload}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIcon}>
              <View style={styles.cameraIcon}>
                <View style={styles.cameraBody} />
                <View style={styles.cameraLens} />
                <View style={styles.cameraFlash} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Additional Upload Space */}
          <View style={styles.uploadButton} />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitRequest}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerRight: {
    width: 68,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shiprocketActionsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121420',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.07,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 13,
  },
  reasonsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 17,
    overflow: 'hidden',
  },
  reasonContainer: {
    height: 44,
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D6D6D6',
    paddingHorizontal: 22,
  },
  selectedReasonContainer: {
    backgroundColor: '#F0F0F0',
  },
  reasonContent: {
    justifyContent: 'center',
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: 0.56,
  },
  selectedReasonText: {
    color: '#000000',
    fontWeight: '500',
  },
  reasonSubtitle: {
    fontSize: 10,
    color: '#666666',
  },
  disclaimer: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: 0.56,
    marginTop: 24,
    marginLeft: 18,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121420',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.07,
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 11,
  },
  uploadContainer: {
    flexDirection: 'row',
    paddingHorizontal: 17,
    gap: 16,
  },
  uploadButton: {
    width: 69,
    height: 64,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  uploadIcon: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: 35,
    height: 35,
    position: 'relative',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    backgroundColor: 'transparent',
  },
  imageCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCD2E3',
  },
  cameraIcon: {
    width: 33,
    height: 33,
    position: 'relative',
  },
  cameraBody: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    backgroundColor: 'transparent',
  },
  cameraLens: {
    position: 'absolute',
    top: 12,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    backgroundColor: 'transparent',
  },
  cameraFlash: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCD2E3',
  },
  submitButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
    marginHorizontal: 11,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default ReturnRequestScreen;
