# Collection Screen Navigation Fix

## Problem
When navigating from a selected subcategory tab in the Collection screen to a product details page and then pressing back, the user was returned to the Collection screen but the active subcategory tab was not preserved. This resulted in losing the user's context.

## Solution
Implemented a navigation state preservation system that:

1. **Passes the active tab information** when navigating to product details
2. **Restores the active tab** when returning to the Collection screen
3. **Uses React Navigation's focus effect** to handle the restoration

## Changes Made

### 1. CollectionScreen.js

#### Added useFocusEffect Import
```javascript
import { useFocusEffect } from '@react-navigation/native';
```

#### Added route parameter to function signature
```javascript
const CollectionScreen = ({ navigation, route }) => {
```

#### Added useFocusEffect hook to restore active tab
```javascript
// Restore active tab when returning to screen
useFocusEffect(
  React.useCallback(() => {
    // Check if returning from a product details screen with saved tab
    if (route?.params?.returnToTab) {
      console.log('🔄 Restoring active tab:', route.params.returnToTab);
      setActiveTab(route.params.returnToTab);
      // Clear the param so it doesn't interfere with future navigations
      navigation.setParams({ returnToTab: undefined });
    }
  }, [route?.params?.returnToTab, navigation])
);
```

#### Updated product navigation to pass active tab
```javascript
onPress={() => navigation?.navigate('ProductDetailsMain', { 
  product: item,
  item: item,
  previousScreen: 'Collection',
  activeTab: activeTab // Pass the active tab to restore when returning
})}
```

### 2. productdetailsmain.js

#### Updated handleCustomBackPress function
```javascript
const handleCustomBackPress = () => {
  if (navigation) {
    // Check if we came from orders screen via "Buy It Again"
    if (route?.params?.order) {
      navigation.navigate('Orders');
    } else if (route?.params?.previousScreen === 'Collection' && route?.params?.activeTab) {
      // If coming from Collection screen with an active tab, navigate back with the tab info
      navigation.navigate('Collection', { returnToTab: route.params.activeTab });
    } else {
      navigation.goBack();
    }
  }
};
```

## How It Works

1. **User selects a subcategory tab** in Collection screen (e.g., "JACKET")
2. **User taps on a product** - The navigation passes:
   - The product data
   - `previousScreen: 'Collection'`
   - `activeTab: <selected_tab_id>`

3. **User views product details** and then presses the back button

4. **Back navigation logic**:
   - Checks if coming from Collection screen
   - If yes, navigates to Collection with `returnToTab` parameter

5. **Collection screen receives focus**:
   - `useFocusEffect` hook triggers
   - Checks for `returnToTab` parameter
   - If found, restores the active tab state
   - Clears the parameter to prevent interference

## Result
Users now return to the exact subcategory tab they were viewing before navigating to the product details, maintaining their browsing context and improving the user experience.

## Testing
To test this feature:
1. Open the Collection screen
2. Select a subcategory tab (e.g., "JACKET" or "SHORTS")
3. Tap on any product to view its details
4. Press the back button
5. Verify that you return to the same subcategory tab you were viewing

Expected: The active tab should be restored to the one you selected before viewing the product.
