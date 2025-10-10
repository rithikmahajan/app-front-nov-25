import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const TrackingContext = createContext({});

// Hook to use the context
export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

// TrackingProvider component
export const TrackingProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIntervals, setActiveIntervals] = useState({});

  // Base URL for API calls (update this to match your backend)
  const BASE_URL = 'http://localhost:8001'; // Update to your backend URL

  // Get auth token from AsyncStorage
  const getAuthToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (err) {
      console.error('Error getting auth token:', err);
      return null;
    }
  }, []);

  // Fetch all user orders
  const fetchUserOrders = useCallback(async (page = 1, perPage = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/orders/getAllByUser?page=${page}&perPage=${perPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        
        // Automatically fetch tracking for shipped orders
        data.orders?.forEach(order => {
          if (order.awb_code && order.shipping_status !== 'Delivered') {
            fetchShiprocketTracking(order.awb_code);
          }
        });
        
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, fetchShiprocketTracking]);

  // Fetch order status counts
  const fetchOrderStatusCounts = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/orders/status-counts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.statusCounts;
      } else {
        throw new Error(data.message || 'Failed to fetch status counts');
      }
    } catch (err) {
      console.error('Error fetching order status counts:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Fetch Shiprocket tracking data
  const fetchShiprocketTracking = useCallback(async (awbCode, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      const response = await fetch(`${BASE_URL}/api/orders/shiprocket/track/${awbCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (retryCount < maxRetries) {
          console.log(`Retrying tracking fetch for ${awbCode}, attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchShiprocketTracking(awbCode, retryCount + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.tracking_data) {
        const trackingInfo = data.data.tracking_data;
        
        // Process tracking data into a more usable format
        const processedTracking = {
          awbCode,
          status: trackingInfo.track_status,
          shipmentStatus: trackingInfo.shipment_status,
          trackingUrl: trackingInfo.track_url,
          lastUpdated: new Date().toISOString(),
          timeline: trackingInfo.shipment_track_activities?.map(activity => ({
            date: activity.date,
            status: activity.status,
            activity: activity.activity,
            location: activity.location,
            description: activity.status
          })) || [],
          shipmentDetails: trackingInfo.shipment_track?.[0] || {},
          estimatedDelivery: trackingInfo.shipment_track?.[0]?.edd || null,
          destination: trackingInfo.shipment_track?.[0]?.destination || '',
          consigneeName: trackingInfo.shipment_track?.[0]?.consignee_name || ''
        };
        
        setTrackingData(prev => ({
          ...prev,
          [awbCode]: processedTracking
        }));
        
        return processedTracking;
      } else {
        throw new Error(data.message || 'Invalid tracking data received');
      }
    } catch (err) {
      console.error(`Error fetching tracking for ${awbCode}:`, err);
      
      // Store error in tracking data
      setTrackingData(prev => ({
        ...prev,
        [awbCode]: {
          awbCode,
          error: err.message,
          lastUpdated: new Date().toISOString()
        }
      }));
      
      throw err;
    }
  }, []);

  // Start real-time tracking for an order
  const startTracking = useCallback((awbCode, intervalSeconds = 30) => {
    if (!awbCode) {
      console.warn('No AWB code provided for tracking');
      return null;
    }

    // Clear existing interval if any
    if (activeIntervals[awbCode]) {
      clearInterval(activeIntervals[awbCode]);
    }

    // Initial fetch
    fetchShiprocketTracking(awbCode).catch(console.error);

    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchShiprocketTracking(awbCode).catch(err => {
        console.error('Periodic tracking update failed:', err);
      });
    }, intervalSeconds * 1000);

    // Store interval ID
    setActiveIntervals(prev => ({
      ...prev,
      [awbCode]: intervalId
    }));

    console.log(`Started real-time tracking for AWB: ${awbCode} (${intervalSeconds}s intervals)`);

    // Return cleanup function
    return () => stopTracking(awbCode);
  }, [fetchShiprocketTracking, activeIntervals, stopTracking]);

  // Stop tracking for an AWB code
  const stopTracking = useCallback((awbCode) => {
    if (activeIntervals[awbCode]) {
      clearInterval(activeIntervals[awbCode]);
      setActiveIntervals(prev => {
        const updated = { ...prev };
        delete updated[awbCode];
        return updated;
      });
      console.log(`Stopped tracking for AWB: ${awbCode}`);
    }
  }, [activeIntervals]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = 'User requested cancellation') => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/cancel/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders after cancellation
        await fetchUserOrders();
        return data;
      } else {
        throw new Error(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      throw err;
    }
  }, [fetchUserOrders]);

  // Create return order
  const createReturn = useCallback(async (orderId, reason, images = []) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('reason', reason);
      
      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `return_image_${index + 1}.jpg`
        });
      });

      const response = await fetch(`${BASE_URL}/api/orders/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders after creating return
        await fetchUserOrders();
        return data;
      } else {
        throw new Error(data.message || 'Failed to create return');
      }
    } catch (err) {
      console.error('Error creating return:', err);
      throw err;
    }
  }, [getAuthToken, fetchUserOrders]);

  // Create exchange order
  const createExchange = useCallback(async (orderId, reason, exchangeItemId, newSize, images = []) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('reason', reason);
      formData.append('exchange_item_id', exchangeItemId);
      formData.append('new_size', newSize);
      
      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `exchange_image_${index + 1}.jpg`
        });
      });

      const response = await fetch(`${BASE_URL}/api/orders/exchange`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders after creating exchange
        await fetchUserOrders();
        return data;
      } else {
        throw new Error(data.message || 'Failed to create exchange');
      }
    } catch (err) {
      console.error('Error creating exchange:', err);
      throw err;
    }
  }, [getAuthToken, fetchUserOrders]);

  // Get tracking data for a specific AWB code
  const getTrackingData = useCallback((awbCode) => {
    return trackingData[awbCode] || null;
  }, [trackingData]);

  // Get order by ID
  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order._id === orderId) || null;
  }, [orders]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(activeIntervals).forEach(intervalId => {
        clearInterval(intervalId);
      });
    };
  }, [activeIntervals]);

  // Context value
  const contextValue = {
    // State
    orders,
    trackingData,
    loading,
    error,
    
    // Order management functions
    fetchUserOrders,
    fetchOrderStatusCounts,
    getOrderById,
    
    // Tracking functions
    fetchShiprocketTracking,
    startTracking,
    stopTracking,
    getTrackingData,
    
    // Order actions
    cancelOrder,
    createReturn,
    createExchange,
    
    // Utility functions
    setError,
    setLoading
  };

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
};

export default TrackingContext;
