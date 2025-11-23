import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAddress } from '../contexts/AddressContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Circle Checkbox Component
const CircleCheckbox = ({ checked, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const DeliveryAddressModal = ({ visible, onClose, navigation, asScreen = false, route }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const { addresses, loading, selectedAddress, selectAddress } = useAddress();
  const [localSelectedId, setLocalSelectedId] = useState(selectedAddress?._id || null);

  // Debug navigation object
  useEffect(() => {
    console.log('🔍 DeliveryAddressModal mounted');
    console.log('🔍 navigation object:', navigation);
    console.log('🔍 navigation.navigate type:', typeof navigation?.navigate);
    console.log('🔍 asScreen:', asScreen);
    console.log('🔍 route params:', route?.params);
  }, [navigation, asScreen, route]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
      if (navigation) navigation.goBack();
    });
  }, [translateY, onClose, navigation]);

    const handleAddAddress = useCallback(() => {
    console.log('🔵 handleAddAddress called');
    console.log('🔵 navigation exists:', !!navigation);
    console.log('🔵 navigation.navigate exists:', !!navigation?.navigate);
    console.log('🔵 navigation keys:', navigation ? Object.keys(navigation) : 'null');
    
    try {
      if (!navigation) {
        console.error('❌ Navigation object is undefined');
        return;
      }
      
      if (typeof navigation.navigate !== 'function') {
        console.error('❌ navigation.navigate is not a function, type:', typeof navigation.navigate);
        return;
      }
      
      console.log('🔵 Calling navigation.navigate with DeliveryOptionsStepThreeAddAddress');
      navigation.navigate('DeliveryOptionsStepThreeAddAddress', {
        returnScreen: asScreen ? 'deliveryaddress' : 'Bag'
      });
      console.log('✅ navigation.navigate called successfully');
    } catch (error) {
      console.error('❌ Error in handleAddAddress:', error);
      console.error('❌ Error stack:', error.stack);
    }
  }, [navigation, asScreen]);

  const handleSelectAddress = useCallback((address) => {
    setLocalSelectedId(address._id);
  }, []);

  const handleEditAddress = useCallback((address) => {
    console.log('🟡 handleEditAddress called');
    console.log('🟡 address:', address);
    console.log('🟡 navigation exists:', !!navigation);
    console.log('🟡 navigation.navigate exists:', !!navigation?.navigate);
    console.log('🟡 navigation keys:', navigation ? Object.keys(navigation) : 'null');
    
    try {
      if (!navigation) {
        console.error('❌ Navigation object is undefined');
        return;
      }
      
      if (typeof navigation.navigate !== 'function') {
        console.error('❌ navigation.navigate is not a function, type:', typeof navigation.navigate);
        return;
      }
      
      console.log('🟡 Calling navigation.navigate with editingAddress param');
      navigation.navigate('DeliveryOptionsStepThreeAddAddress', {
        addressData: address,
        isEdit: true,
        returnScreen: asScreen ? 'deliveryaddress' : 'Bag',
        fromDeliveryAddress: true
      });
      console.log('✅ navigation.navigate called successfully with params');
    } catch (error) {
      console.error('❌ Error in handleEditAddress:', error);
      console.error('❌ Error stack:', error.stack);
    }
  }, [navigation, asScreen]);

  const handleContinue = useCallback(() => {
    console.log('🟢 handleContinue called');
    console.log('🟢 localSelectedId:', localSelectedId);
    console.log('🟢 addresses:', addresses);
    console.log('🟢 navigation exists:', !!navigation);
    console.log('🟢 route params:', route?.params);
    
    const selected = addresses.find(addr => addr._id === localSelectedId);
    console.log('🟢 selected address:', selected);
    
    if (selected) {
      selectAddress(selected);
      console.log('✅ Address set, navigating back...');
      
      // Navigate back to the return screen or to Bag
      if (navigation) {
        try {
          const returnScreen = route?.params?.returnScreen;
          if (returnScreen) {
            // If there's a return screen specified, navigate to it
            console.log('✅ Navigating to returnScreen:', returnScreen);
            navigation.navigate(returnScreen);
          } else {
            // Otherwise navigate to Bag
            console.log('✅ Navigating to Bag');
            navigation.navigate('Bag');
          }
          console.log('✅ Navigation successful');
        } catch (error) {
          console.error('❌ Error navigating:', error);
        }
      } else {
        console.log('⚠️ No navigation object, closing modal');
        handleClose();
      }
    } else {
      console.log('⚠️ No address selected');
    }
  }, [localSelectedId, addresses, selectAddress, handleClose, navigation, route]);

  const modalContent = (
    <Animated.View
      style={[
        styles.modalContainer,
        asScreen && styles.modalContainerFullScreen,
        { transform: [{ translateY }] }
      ]}
      {...(asScreen ? {} : panResponder.panHandlers)}
    >
      {/* Safe Area Top Spacer for Full Screen Mode */}
      {asScreen && Platform.OS === 'ios' && (
        <SafeAreaView style={styles.safeAreaTop} />
      )}

      {/* Handle bar for drag gesture */}
      {!asScreen && (
        <View style={styles.handleBar} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Add Address Button */}
      <TouchableOpacity 
        style={styles.addAddressButton}
        onPress={handleAddAddress}
      >
        <Text style={styles.addAddressPlus}>+</Text>
        <Text style={styles.addAddressText}>Add Address</Text>
      </TouchableOpacity>

      {/* Delivery Details Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
      </View>

      {/* Address List */}
      <ScrollView 
        style={styles.addressList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.addressListContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No addresses found</Text>
            <Text style={styles.emptySubtext}>Add an address to continue</Text>
          </View>
        ) : (
          addresses.map((address, index) => (
            <View
              key={address._id || index}
              style={[
                styles.addressItem,
                index === addresses.length - 1 && styles.addressItemLast
              ]}
            >
              <CircleCheckbox
                checked={localSelectedId === address._id}
                onPress={() => handleSelectAddress(address)}
              />
              <View style={styles.addressInfo}>
                {address.type && (
                  <View style={styles.addressTypeBadge}>
                    <Text style={styles.addressTypeText}>
                      {address.type.charAt(0).toUpperCase() + address.type.slice(1).toLowerCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.addressName}>
                  {address.firstName} {address.lastName}, {address.phoneNumber}
                </Text>
                <Text style={styles.addressDetails}>
                  {address.address}, {address.city}, {address.country}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleEditAddress(address)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!localSelectedId || addresses.length === 0) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!localSelectedId || addresses.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (asScreen) {
    return (
      <View style={styles.screenContainer}>
        {modalContent}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity activeOpacity={1}>
          {modalContent}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Screen wrapper component
const DeliveryAddressScreen = ({ navigation, route }) => {
  return (
    <DeliveryAddressModal
      visible={true}
      navigation={navigation}
      route={route}
      asScreen={true}
      onClose={() => {
        if (route?.params?.returnScreen) {
          navigation.navigate(route.params.returnScreen);
        } else {
          navigation.goBack();
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 34, // Safe area for home indicator
  },
  modalContainerFullScreen: {
    flex: 1,
    maxHeight: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  safeAreaTop: {
    backgroundColor: '#FFFFFF',
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E4E4E4',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    height: 64,
  },
  headerTitle: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.4,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '300',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  addAddressPlus: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginRight: 8,
  },
  addAddressText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.4,
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.4,
  },
  addressList: {
    flex: 1,
  },
  addressListContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 14,
    color: '#767676',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    gap: 22,
  },
  addressItemLast: {
    borderBottomWidth: 0,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#CDCDCD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressInfo: {
    flex: 1,
    gap: 8,
  },
  addressTypeBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addressTypeText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 12,
    color: '#000000',
    letterSpacing: -0.3,
  },
  addressName: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.4,
  },
  addressDetails: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 16,
    color: '#767676',
    letterSpacing: -0.4,
  },
  editButton: {
    paddingLeft: 8,
  },
  editButtonText: {
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fontSize: 12,
    color: '#000000',
    letterSpacing: -0.3,
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E4E4E4',
    borderColor: '#E4E4E4',
  },
  continueButtonText: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
});

export default DeliveryAddressScreen;
export { DeliveryAddressModal };
