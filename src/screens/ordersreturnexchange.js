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
  orderInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
  },
  orderInfoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
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
    flexWrap: 'wrap',
  },
  uploadButton: {
    width: 69,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#CCD2E3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  uploadButtonLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
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
  imagePreviewContainer: {
    marginTop: 16,
    paddingHorizontal: 17,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 12,
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
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
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
  submitButtonDisabled: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#EA4335',
    fontFamily: 'Montserrat-Regular',
  },
});

export default ReturnRequestScreen;
