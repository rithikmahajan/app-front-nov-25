# Home Screen Category Tab Navigation Fix

## Problem
When navigating from HomeScreen → ProductViewOne → ProductDetailsMain and pressing back, the user was returned to HomeScreen but the category tab (Men/Women/Kids) was not preserved. This resulted in losing the user's browsing context.

## Solution
Implemented a navigation state preservation system that:

1. **Passes category tab information** through the navigation chain
2. **Restores the active category tab** when returning to HomeScreen
3. **Uses React Navigation's focus effect** to handle the restoration

## Changes Made

### 1. HomeScreen.js
#### Updated component signature to accept route
```javascript
const HomeScreen = React.memo(({ navigation, route }) => {
```

#### Added useEffect handler for tab restoration
```javascript
// Handle returning to Home with specific tab selection
useEffect(() => {
  // Check if we need to restore a specific tab when returning from product details
  if (route?.params?.returnToCategory) {
    const categoryToRestore = route.params.returnToCategory;
    console.log('🔙 Returning to Home, restoring tab:', categoryToRestore);
    setActiveTab(categoryToRestore);
    
    // Clear the parameter to prevent interference with future navigations
    if (navigation?.setParams) {
      navigation.setParams({ returnToCategory: undefined });
    }
  }
}, [route?.params?.returnToCategory, navigation]);
```

#### Updated navigation to ProductViewOne
```javascript
navigation?.navigate('ProductViewOne', { 
  subcategoryId, 
  subcategoryName: subcategoryName || 'Products',
  categoryName: activeTab // Pass the current category tab
});
```

### 2. ProductViewOne.js
#### Extract category name from route
```javascript
// Get category information to pass to product details for back navigation
const categoryName = route?.params?.categoryName || null;

// Debug logging
console.log('📍 ProductViewOne - Category name:', categoryName);
```

#### Updated navigation to ProductDetailsMain
```javascript
onPress={() => navigation.navigate('ProductDetailsMain', { 
  product: item, 
  previousScreen: 'ProductViewOne',
  categoryName: categoryName, // Pass category for back navigation to Home
  subcategoryName: subcategoryName
})}
```

### 3. ProductDetailsMain.js
#### Updated back button handler
```javascript
const handleCustomBackPress = () => {
  if (navigation) {
    // Check if we came from orders screen via "Buy It Again"
    if (route?.params?.order) {
      navigation.navigate('Orders');
    } else if (route?.params?.previousScreen === 'ProductViewOne' && route?.params?.categoryName) {
      // If coming from ProductViewOne (which came from Home), navigate back to Home with the correct category tab
      console.log('🔙 Navigating back to Home with category:', route.params.categoryName);
      navigation.navigate('Home', { returnToCategory: route.params.categoryName });
    } else if (route?.params?.previousScreen === 'Search') {
      // ... existing Search logic
    } else if (route?.params?.previousScreen === 'Collection' && route?.params?.activeTab) {
      // ... existing Collection logic
    } else {
      navigation.goBack();
    }
  }
};
```

### 4. layout.js
#### Updated HomeContent to receive route params
```javascript
const HomeContent = ({ navigation, route }) => <HomeScreen navigation={navigation} route={route} />;
```

#### Updated Home case in renderContent
```javascript
case 'Home':
  return <HomeContent navigation={navigation} route={{ params: routeParams }} />;
```

## How It Works

### Navigation Flow
1. **User selects a category tab** in HomeScreen (e.g., "Men")
2. **User taps on a subcategory** (e.g., "Jackets") - The navigation passes:
   - `subcategoryId` and `subcategoryName`
   - `categoryName: activeTab` (e.g., "Men")

3. **User views products** in ProductViewOne
4. **User taps on a product** - The navigation passes:
   - Product data
   - `previousScreen: 'ProductViewOne'`
   - `categoryName` (e.g., "Men")
   - `subcategoryName` (e.g., "Jackets")

5. **User views product details** and then presses the back button

6. **Back navigation logic** (in ProductDetailsMain):
   - Checks if coming from ProductViewOne with categoryName
   - If yes, navigates to Home with `returnToCategory` parameter

7. **HomeScreen receives focus**:
   - `useEffect` hook triggers when route params change
   - Checks for `returnToCategory` parameter
   - If found, restores the active tab state
   - Clears the parameter to prevent interference

## Result
✅ Users now return to the exact category tab they were viewing before navigating through subcategory → products → product details
✅ Browsing context is maintained across the navigation stack
✅ Improved user experience with consistent navigation flow

## Example Flow
```
HomeScreen (Men tab) 
  → Tap "Jackets" subcategory 
    → ProductViewOne (Jackets in Men)
      → Tap product
        → ProductDetailsMain
          → Press back
            → HomeScreen (Men tab restored) ✅
```

## Testing
1. Open the app and go to HomeScreen
2. Select a category tab (e.g., "Men")
3. Tap on any subcategory (e.g., "Jackets")
4. Tap on any product to view details
5. Press the back button
6. **Expected Result**: You should return to HomeScreen with the "Men" tab selected
7. Repeat for other tabs (Women, Kids) to verify consistency

## Notes
- This implementation uses `useEffect` to monitor route params changes (since this app uses a custom navigation system)
- The solution follows the same pattern used for Collection screen navigation
- The solution is non-invasive and doesn't break existing navigation flows
- Console logs have been added for debugging purposes
- The parameter clearing prevents state contamination on subsequent navigations
