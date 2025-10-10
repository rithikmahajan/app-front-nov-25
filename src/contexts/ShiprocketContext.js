// Shiprocket Context for managing shipping operations
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { yoraaAPI } from '../services/yoraaAPI';

const ShiprocketContext = createContext();

export const useShiprocket = () => {
  const context = useContext(ShiprocketContext);
  if (!context) {
    throw new Error('useShiprocket must be used within a ShiprocketProvider');
  }
  return context;
};

export const ShiprocketProvider = ({ children }) => {
  const [loading, setLoading] = useState({});
  const [trackingData, setTrackingData] = useState({});
  const [error, setError] = useState(null);

  // Set loading state for specific operations
  const setOperationLoading = useCallback((operation, orderId, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [`${operation}_${orderId}`]: isLoading
    }));
  }, []);

  // Get loading state for specific operations
  const isOperationLoading = useCallback((operation, orderId) => {
    return loading[`${operation}_${orderId}`] || false;
  }, [loading]);

  // Create Shiprocket order
  const createShipment = useCallback(async (orderId, pickupLocationId = null) => {
    try {
      setOperationLoading('create_shipment', orderId, true);
      setError(null);

      const response = await yoraaAPI.createShiprocketOrder(orderId, pickupLocationId);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Shipment created successfully!',
          [{ text: 'OK' }]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to create shipment';
        Alert.alert('Error', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error creating shipment:', err);
      const errorMessage = err.message || 'Failed to create shipment';
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('create_shipment', orderId, false);
    }
  }, [setOperationLoading]);

  // Generate AWB
  const generateAWB = useCallback(async (orderId, preferredCourier = null) => {
    try {
      setOperationLoading('generate_awb', orderId, true);
      setError(null);

      const response = await yoraaAPI.generateAWB(orderId, preferredCourier);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `AWB Generated: ${response.data.awb_code}`,
          [{ text: 'OK' }]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to generate AWB';
        Alert.alert('Error', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error generating AWB:', err);
      const errorMessage = err.message || 'Failed to generate AWB';
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('generate_awb', orderId, false);
    }
  }, [setOperationLoading]);

  // Track shipment
  const trackShipment = useCallback(async (orderId, useCache = true) => {
    try {
      setOperationLoading('track_shipment', orderId, true);
      setError(null);

      // Return cached data if available and useCache is true
      if (useCache && trackingData[orderId]) {
        setOperationLoading('track_shipment', orderId, false);
        return { success: true, data: trackingData[orderId] };
      }

      const response = await yoraaAPI.trackShipment(orderId);
      
      if (response.success) {
        // Cache the tracking data
        setTrackingData(prev => ({
          ...prev,
          [orderId]: response.tracking_data
        }));
        return { success: true, data: response.tracking_data };
      } else {
        const errorMessage = response.message || 'Failed to get tracking data';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error tracking shipment:', err);
      const errorMessage = err.message || 'Failed to get tracking data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('track_shipment', orderId, false);
    }
  }, [setOperationLoading, trackingData]);

  // Create return request
  const createReturn = useCallback(async (orderId, returnData) => {
    try {
      setOperationLoading('create_return', orderId, true);
      setError(null);

      const response = await yoraaAPI.createReturnRequest(orderId, returnData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Return request created successfully!',
          [{ text: 'OK' }]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to create return request';
        Alert.alert('Error', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error creating return:', err);
      const errorMessage = err.message || 'Failed to create return request';
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('create_return', orderId, false);
    }
  }, [setOperationLoading]);

  // Process return AWB
  const processReturnAWB = useCallback(async (orderId) => {
    try {
      setOperationLoading('process_return_awb', orderId, true);
      setError(null);

      const response = await yoraaAPI.processReturnAWB(orderId);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `Return AWB Generated: ${response.data.return_awb}`,
          [{ text: 'OK' }]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to process return AWB';
        Alert.alert('Error', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error processing return AWB:', err);
      const errorMessage = err.message || 'Failed to process return AWB';
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('process_return_awb', orderId, false);
    }
  }, [setOperationLoading]);

  // Create exchange request
  const createExchange = useCallback(async (orderId, exchangeData) => {
    try {
      setOperationLoading('create_exchange', orderId, true);
      setError(null);

      const response = await yoraaAPI.createExchangeRequest(orderId, exchangeData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Exchange request created successfully!',
          [{ text: 'OK' }]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to create exchange request';
        Alert.alert('Error', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error creating exchange:', err);
      const errorMessage = err.message || 'Failed to create exchange request';
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('create_exchange', orderId, false);
    }
  }, [setOperationLoading]);

  // Check serviceability
  const checkServiceability = useCallback(async (pickupPincode, deliveryPincode, weight) => {
    try {
      setOperationLoading('check_serviceability', 'general', true);
      setError(null);

      const response = await yoraaAPI.checkServiceability(pickupPincode, deliveryPincode, weight);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Service not available for this location';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Error checking serviceability:', err);
      const errorMessage = err.message || 'Failed to check serviceability';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading('check_serviceability', 'general', false);
    }
  }, [setOperationLoading]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get order shipping status
  const getShippingStatus = useCallback((order) => {
    if (!order) return 'NEW';
    
    if (order.awbNumber) {
      return order.shippingStatus || 'SHIPPED';
    } else if (order.shiprocketOrderId) {
      return 'PROCESSING';
    } else {
      return 'NEW';
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    const colors = {
      'NEW': '#2196F3',
      'PROCESSING': '#FF9800',
      'SHIPPED': '#9C27B0',
      'IN_TRANSIT': '#FF5722',
      'DELIVERED': '#4CAF50',
      'CANCELLED': '#F44336',
      'RETURNED': '#757575'
    };
    return colors[status] || colors.NEW;
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status) => {
    const icons = {
      'NEW': '📦',
      'PROCESSING': '⚙️',
      'SHIPPED': '🚚',
      'IN_TRANSIT': '📍',
      'DELIVERED': '✅',
      'CANCELLED': '❌',
      'RETURNED': '↩️'
    };
    return icons[status] || icons.NEW;
  }, []);

  const value = {
    // State
    loading,
    trackingData,
    error,
    
    // Actions
    createShipment,
    generateAWB,
    trackShipment,
    createReturn,
    processReturnAWB,
    createExchange,
    checkServiceability,
    clearError,
    
    // Helpers
    isOperationLoading,
    getShippingStatus,
    getStatusColor,
    getStatusIcon
  };

  return (
    <ShiprocketContext.Provider value={value}>
      {children}
    </ShiprocketContext.Provider>
  );
};

export default ShiprocketProvider;
