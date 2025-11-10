// ShopScreen.js - Now displays the Bag/Cart functionality
import React from 'react';
import BagScreen from './bag';

const ShopScreen = ({ navigation, route }) => {
  // Simply render the BagScreen component
  return <BagScreen navigation={navigation} route={route} />;
};

export default ShopScreen;
