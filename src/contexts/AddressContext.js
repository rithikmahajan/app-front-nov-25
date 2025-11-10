import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { yoraaAPI } from '../services/yoraaAPI';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Load addresses for the current user
  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before making request
      if (!yoraaAPI.isAuthenticated()) {
        console.log('📍 Skipping address loading - user not authenticated');
        setAddresses([]);
        setSelectedAddress(null);
        return;
      }
      
      // Use yoraaAPI directly (it has better token management)
      let response;
      try {
        response = await yoraaAPI.getAddresses();
      } catch (yoraaAPIError) {
        // If yoraaAPI fails, try apiService as fallback
        console.warn('yoraaAPI failed, trying apiService as fallback:', yoraaAPIError.message);
        try {
          response = await apiService.getAddresses();
        } catch (apiServiceError) {
          // If both fail with 404, it means no addresses exist or endpoint not available
          if (apiServiceError.response?.status === 404 || yoraaAPIError.response?.status === 404) {
            console.log('📍 No addresses found or endpoint not available - this is normal for new users');
            setAddresses([]);
            setSelectedAddress(null);
            setLoading(false);
            return;
          }
          console.error('Both API services failed to load addresses');
          throw apiServiceError;
        }
      }
      
      if (response.success && response.data) {
        setAddresses(response.data);
        
        // Set first address as selected if none is selected
        if (!selectedAddress && response.data.length > 0) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (error) {
      // Only log as error if it's not a 404
      if (error.response?.status === 404) {
        console.log('📍 Address endpoint returned 404 - user may not have any addresses yet');
      } else {
        console.error('Error loading addresses:', error);
      }
      // Set empty addresses on error to prevent infinite loading
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAddress]);

  // Add new address
  const addAddress = async (addressData) => {
    try {
      setLoading(true);
      
      // Use yoraaAPI directly (it has better token management)
      let response;
      try {
        response = await yoraaAPI.createAddress(addressData);
      } catch (yoraaAPIError) {
        // If yoraaAPI fails, try apiService as fallback
        console.warn('yoraaAPI failed, trying apiService as fallback:', yoraaAPIError.message);
        response = await apiService.createAddress(addressData);
      }
      
      if (response.success && response.data) {
        setAddresses(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding address:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorMessage = 'Failed to add address';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      setLoading(true);
      
      // Use yoraaAPI directly (it has better token management)
      let response;
      try {
        response = await yoraaAPI.updateAddress(addressId, addressData);
      } catch (yoraaAPIError) {
        // If yoraaAPI fails, try apiService as fallback
        console.warn('yoraaAPI failed, trying apiService as fallback:', yoraaAPIError.message);
        response = await apiService.updateAddress(addressId, addressData);
      }
      
      if (response.success && response.data) {
        setAddresses(prev => 
          prev.map(addr => 
            addr._id === addressId ? response.data : addr
          )
        );
        
        // Update selected address if it was the one updated
        if (selectedAddress && selectedAddress._id === addressId) {
          setSelectedAddress(response.data);
        }
        
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, message: 'Failed to update address' };
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      setLoading(true);
      
      // Use yoraaAPI directly (it has better token management)
      let response;
      try {
        response = await yoraaAPI.deleteAddress(addressId);
      } catch (yoraaAPIError) {
        // If yoraaAPI fails, try apiService as fallback
        console.warn('yoraaAPI failed, trying apiService as fallback:', yoraaAPIError.message);
        response = await apiService.deleteAddress(addressId);
      }
      
      if (response.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        
        // Clear selected address if it was deleted
        if (selectedAddress && selectedAddress._id === addressId) {
          setSelectedAddress(addresses.length > 1 ? addresses[0] : null);
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, message: 'Failed to delete address' };
    } finally {
      setLoading(false);
    }
  };

  // Select address
  const selectAddress = (address) => {
    console.log('📍 AddressContext: Selecting address:', address._id, address.firstName, address.lastName);
    setSelectedAddress(address);
    console.log('📍 AddressContext: Address selected successfully');
  };

  // Load addresses on mount only if authenticated
  useEffect(() => {
    const initializeAddresses = async () => {
      // Only load addresses if user is authenticated
      if (yoraaAPI.isAuthenticated()) {
        await loadAddresses();
      } else {
        console.log('📍 AddressContext: Skipping address initialization - user not authenticated');
      }
    };
    initializeAddresses();
  }, [loadAddresses]);

  const value = {
    addresses,
    selectedAddress,
    loading,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

export default AddressContext;
