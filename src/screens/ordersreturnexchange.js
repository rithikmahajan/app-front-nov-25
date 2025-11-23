import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { GlobalBackButton } from '../components';
import yoraaAPI from '../services/yoraaAPI';
import { wp, hp, fs, isTablet, isSmallDevice } from '../utils/responsive';

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
  const [returnImages, setReturnImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get order data from route params
  const orderId = route?.params?.orderId || route?.params?.order?.id;

  // Fetch fresh order data from API
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        Alert.alert('Error', 'Order ID is missing');
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        console.log('📦 Fetching order details for:', orderId);
        
        const response = await yoraaAPI.makeRequest(
          `/api/orders/${orderId}`,
          'GET',
          null,
          true
        );

        if (response.success && response.data) {
          console.log('✅ Order data fetched:', response.data);
          setOrderData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch order details');
        }
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        Alert.alert(
          'Error',
          'Failed to load order details. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigation]);

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    
    // Navigate to size selection screen if size/fit issue is selected
    if (reason.id === 'size_fit') {
      if (!orderData) {
        Alert.alert('Error', 'Order data not loaded. Please try again.');
        return;
      }
      navigation.navigate('OrdersExchangeSizeSelectionChart', { 
        orderId: orderData._id || orderData.id,
        orderData: orderData 
      });
    }
  };

  const handleImageUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        selectionLimit: 3 - returnImages.length,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to pick images. Please try again.');
        } else if (response.assets) {
          const selectedImages = response.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || `image_${Date.now()}.jpg`,
          }));
          setReturnImages([...returnImages, ...selectedImages].slice(0, 3));
        }
      }
    );
  };

  const handleCameraUpload = () => {
    const { launchCamera } = require('react-native-image-picker');
    launchCamera(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        cameraType: 'back',
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to capture image. Please try again.');
        } else if (response.assets && response.assets.length > 0) {
          const image = response.assets[0];
          const newImage = {
            uri: image.uri,
            type: image.type,
            name: image.fileName || `camera_${Date.now()}.jpg`,
          };
          if (returnImages.length < 3) {
            setReturnImages([...returnImages, newImage]);
          } else {
            Alert.alert('Limit Reached', 'You can upload a maximum of 3 images.');
          }
        }
      }
    );
  };

  const removeImage = (index) => {
    const updatedImages = returnImages.filter((_, i) => i !== index);
    setReturnImages(updatedImages);
  };

  const handleSubmitRequest = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for return.');
      return;
    }

    if (!orderData || !orderData._id) {
      Alert.alert('Error', 'Order information is missing. Please try again.');
      return;
    }

    if (returnImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one image of the product.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', orderData._id || orderData.id);
      formData.append('reason', selectedReason.title);

      // Append images
      returnImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `return_image_${index}.jpg`,
        });
      });

      console.log('📦 Submitting return request for order:', orderData._id);
      
      const response = await yoraaAPI.makeRequest('/api/orders/return', 'POST', formData, true, false, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Your return request has been submitted successfully. We will process it within 2-3 business days.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Orders'),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('❌ Error submitting return request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit return request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        ) : orderData ? (
          <>
            {/* Order Info */}
            <View style={styles.orderInfoContainer}>
              <Text style={styles.orderInfoTitle}>Order Details</Text>
              <Text style={styles.orderInfoText}>
                Order ID: {orderData.orderNumber || orderData._id}
              </Text>
              {orderData.items && orderData.items.length > 0 && (
                <>
                  <Text style={styles.orderInfoText}>
                    Product: {orderData.items[0].name}
                  </Text>
                  {orderData.items[0].size && (
                    <Text style={styles.orderInfoText}>
                      Size: {orderData.items[0].size}
                    </Text>
                  )}
                </>
              )}
              <Text style={styles.orderInfoText}>
                Order Date: {new Date(orderData.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.orderInfoText}>
                Total Amount: ₹{orderData.total_price || orderData.totalAmount}
              </Text>
            </View>

            {/* Submit Return Request Section */}
            <Text style={styles.sectionTitle}>Select Return Reason</Text>
        
        {/* Reasons List */}
        <View style={styles.reasonsList}>
          {returnReasons.map(renderReasonItem)}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>*Return request is chargeable</Text>

        {/* Upload Images Section */}
        <Text style={styles.uploadTitle}>Upload Images Here (Required)</Text>
        
        <View style={styles.uploadContainer}>
          {/* Image Upload Button */}
          {returnImages.length < 3 && (
            <>
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
                <Text style={styles.uploadButtonLabel}>Gallery</Text>
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
                <Text style={styles.uploadButtonLabel}>Camera</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Image Preview */}
        {returnImages.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.uploadTitle}>
              Uploaded Images ({returnImages.length}/3)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {returnImages.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitRequest}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Return Request</Text>
          )}
        </TouchableOpacity>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load order details</Text>
          </View>
        )}
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
    paddingHorizontal: wp(4.3),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.4,
  },
  headerRight: {
    width: isTablet ? wp(10) : wp(18),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4.3),
  },
  orderInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: isTablet ? hp(2.5) : isSmallDevice ? hp(1.5) : hp(2),
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  orderInfoTitle: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: hp(1),
  },
  orderInfoText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp(0.5),
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(17) : fs(20),
  },
  sectionTitle: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#121420',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.07,
    marginTop: hp(3),
    marginBottom: hp(2),
    marginLeft: wp(3.5),
  },
  reasonsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: wp(4.5),
    overflow: 'hidden',
  },
  reasonContainer: {
    minHeight: isTablet ? hp(6) : isSmallDevice ? hp(5) : hp(5.5),
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D6D6D6',
    paddingHorizontal: isTablet ? wp(5) : wp(6),
    paddingVertical: hp(1.2),
  },
  selectedReasonContainer: {
    backgroundColor: '#F0F0F0',
  },
  reasonContent: {
    justifyContent: 'center',
  },
  reasonTitle: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: 0.56,
    lineHeight: isTablet ? fs(22) : isSmallDevice ? fs(17) : fs(20),
  },
  selectedReasonText: {
    color: '#000000',
    fontWeight: '500',
  },
  reasonSubtitle: {
    fontSize: isTablet ? fs(11) : isSmallDevice ? fs(9) : fs(10),
    color: '#666666',
  },
  disclaimer: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    letterSpacing: 0.56,
    marginTop: hp(3),
    marginLeft: wp(4.8),
  },
  uploadTitle: {
    fontSize: isTablet ? fs(16) : isSmallDevice ? fs(12) : fs(14),
    fontWeight: '500',
    color: '#121420',
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.07,
    marginTop: hp(4),
    marginBottom: hp(2),
    marginLeft: wp(3),
  },
  uploadContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4.5),
    gap: isTablet ? wp(3) : wp(4.3),
    flexWrap: 'wrap',
  },
  uploadButton: {
    width: isTablet ? wp(12) : isSmallDevice ? wp(17) : wp(18.5),
    height: isTablet ? hp(11) : isSmallDevice ? hp(9) : hp(10),
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  uploadButtonLabel: {
    fontSize: isTablet ? fs(11) : isSmallDevice ? fs(9) : fs(10),
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginTop: hp(0.5),
  },
  uploadIcon: {
    width: isTablet ? wp(6) : wp(9.5),
    height: isTablet ? hp(4.5) : hp(4.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: isTablet ? wp(6) : wp(9.5),
    height: isTablet ? hp(4.5) : hp(4.4),
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
    top: isTablet ? hp(1) : hp(1),
    right: isTablet ? wp(1) : wp(2),
    width: isTablet ? wp(1.2) : wp(2.2),
    height: isTablet ? hp(1.2) : hp(1),
    borderRadius: isTablet ? wp(0.6) : wp(1.1),
    backgroundColor: '#CCD2E3',
  },
  cameraIcon: {
    width: isTablet ? wp(5.8) : wp(8.9),
    height: isTablet ? hp(4.3) : hp(4.2),
    position: 'relative',
  },
  cameraBody: {
    position: 'absolute',
    top: hp(0.8),
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
    top: hp(1.5),
    left: isTablet ? wp(1) : wp(2.2),
    width: isTablet ? wp(2.5) : wp(3.8),
    height: isTablet ? hp(2) : hp(1.8),
    borderRadius: isTablet ? wp(1.25) : wp(1.9),
    borderWidth: 2,
    borderColor: '#CCD2E3',
    backgroundColor: 'transparent',
  },
  cameraFlash: {
    position: 'absolute',
    top: hp(0.25),
    right: isTablet ? wp(0.6) : wp(1.1),
    width: isTablet ? wp(1) : wp(1.6),
    height: isTablet ? hp(0.8) : hp(0.8),
    borderRadius: isTablet ? wp(0.5) : wp(0.8),
    backgroundColor: '#CCD2E3',
  },
  imagePreviewContainer: {
    marginTop: hp(2),
    paddingHorizontal: wp(4.5),
  },
  imagePreview: {
    width: isTablet ? wp(15) : isSmallDevice ? wp(20) : wp(21.5),
    height: isTablet ? hp(11) : isSmallDevice ? hp(9) : hp(10),
    marginRight: wp(3.2),
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: hp(0.5),
    right: wp(1),
    width: isTablet ? wp(4) : wp(6.5),
    height: isTablet ? hp(3) : hp(3),
    borderRadius: isTablet ? wp(2) : wp(3.25),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: isTablet ? fs(20) : fs(18),
    fontWeight: 'bold',
    lineHeight: isTablet ? fs(22) : fs(20),
  },
  submitButton: {
    backgroundColor: '#000000',
    minHeight: isTablet ? hp(7) : hp(6),
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
    marginBottom: hp(4),
    marginHorizontal: wp(3),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(8),
  },
  submitButtonDisabled: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    fontSize: isTablet ? fs(18) : isSmallDevice ? fs(14) : fs(16),
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: isTablet ? fs(24) : isSmallDevice ? fs(20) : fs(22),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  loadingText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    color: '#666666',
    marginTop: hp(1.5),
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  errorText: {
    fontSize: isTablet ? fs(15) : isSmallDevice ? fs(12) : fs(14),
    color: '#EA4335',
    fontFamily: 'Montserrat-Regular',
  },
});

export default ReturnRequestScreen;
