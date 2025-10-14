# 🚀 YORAA App - Developer Quick Reference

## 🎯 Complete Flow Overview (One Page)

```
┌─────────────────────────────────────────────────────────────────┐
│                    YORAA USER JOURNEY MAP                       │
└─────────────────────────────────────────────────────────────────┘

1. Browse  →  2. Wishlist  →  3. Cart  →  4. Checkout  →  5. Order
    ↓            ↓             ↓           ↓              ↓
  Home      Save Items    Add to Bag   Authenticate   Track Status
```

---

## 📱 Key Screens & Their Roles

| Screen | File | Purpose | Auth Required |
|--------|------|---------|---------------|
| Home | `home.js` | Product discovery | ❌ No |
| Product Details | `productdetailsmain.js` | View product info | ❌ No |
| Bag/Cart | `bag.js` | Manage cart items | ❌ No |
| Checkout | `deliveryoptionssteptwo.js` | Address & payment | ✅ Yes |
| Orders | `orders.js` | View order history | ✅ Yes |
| Tracking | `trackingorder.js` | Track shipment | ✅ Yes |

---

## 🔧 Key Services & Functions

### 1. yoraaAPI Service
**File:** `src/services/yoraaAPI.js`

```javascript
// Authentication
await yoraaAPI.login(email, password)
await yoraaAPI.firebaseLogin(idToken)
await yoraaAPI.appleSignIn(idToken)
await yoraaAPI.logout()

// Wishlist
await yoraaAPI.getWishlist(page, limit)
await yoraaAPI.addToWishlist(itemId)
await yoraaAPI.removeFromWishlist(itemId)
await yoraaAPI.toggleWishlist(itemId)

// Cart
await yoraaAPI.getCart()
await yoraaAPI.addToCart(itemId, size, quantity, sku)
await yoraaAPI.updateCartItem(itemId, size, quantity)
await yoraaAPI.removeFromCart(itemId, size)
await yoraaAPI.clearCart()

// Orders
await yoraaAPI.getOrders(page, limit)
await yoraaAPI.getOrderById(orderId)
```

### 2. orderService
**File:** `src/services/orderService.js`

```javascript
// ✅ NEW: Product validation
await orderService.validateProductIds(cartItems)

// Order creation
await orderService.createOrder(cart, address, options)

// Validation
orderService.validateCart(cart)
orderService.validateAddress(address)

// Formatting
orderService.formatCartItemsForAPI(cartItems)
orderService.formatAddressForAPI(address)

// Payment
await orderService.verifyPayment(paymentData)
```

### 3. paymentService
**File:** `src/services/paymentService.js`

```javascript
// Complete order flow
await paymentService.processCompleteOrder(cart, address, options)
```

---

## 🎨 React Contexts

### BagContext
```javascript
const { 
  bagItems,           // Array of cart items
  addToBag,          // Add item to cart
  removeFromBag,     // Remove item from cart
  updateQuantity,    // Update item quantity
  updateSize,        // Update item size
  clearBag,          // Clear entire cart
  getTotalPrice      // Calculate total
} = useBag();
```

### AddressContext
```javascript
const { 
  addresses,         // Array of saved addresses
  selectedAddress,   // Currently selected address
  addAddress,        // Add new address
  updateAddress,     // Update existing address
  deleteAddress,     // Delete address
  selectAddress      // Set selected address
} = useAddress();
```

### CurrencyContext
```javascript
const { 
  currency,          // Current currency (INR/USD)
  formatPrice,       // Format number to currency
  convertPrice       // Convert between currencies
} = useCurrencyContext();
```

---

## 🔐 Authentication Flow

```javascript
// Check authentication status
const isAuthenticated = yoraaAPI.isAuthenticated();

// Get user data
const userData = await yoraaAPI.getUserData();

// Get current token
const token = yoraaAPI.getUserToken();

// Get user profile
const profile = await yoraaAPI.getUserProfile();
```

---

## 🛒 Common Operations

### Add to Wishlist
```javascript
try {
  const result = await yoraaAPI.toggleWishlist(productId);
  if (result.added) {
    // Item added to wishlist
  } else {
    // Item removed from wishlist
  }
} catch (error) {
  console.error('Wishlist error:', error);
}
```

### Add to Cart
```javascript
const { addToBag } = useBag();

try {
  await addToBag(product, selectedSize);
  Alert.alert('Success', 'Added to cart');
} catch (error) {
  Alert.alert('Error', 'Failed to add to cart');
}
```

### Process Checkout
```javascript
// In bag.js
const handleCheckout = async () => {
  // 1. Check authentication
  if (!yoraaAPI.isAuthenticated()) {
    navigation.navigate('RewardsScreen', { fromCheckout: true });
    return;
  }
  
  // 2. Navigate to delivery options
  navigation.navigate('deliveryoptionsstepone', {
    bagData: { items: bagItems, pricing: dynamicPricing }
  });
};
```

### Complete Order
```javascript
// In deliveryoptionssteptwo.js
try {
  // 1. Validate products (NEW)
  const validationResult = await orderService.validateProductIds(cart);
  if (!validationResult.valid) {
    throw new Error(validationResult.message);
  }
  
  // 2. Process order
  const result = await paymentService.processCompleteOrder(
    cart, 
    address, 
    { orderNotes: 'Standard delivery' }
  );
  
  // 3. Clear cart
  clearBag();
  
  // 4. Navigate to confirmation
  navigation.navigate('orderconfirmationphone', { orderDetails: result });
} catch (error) {
  // Show error with action buttons
  if (error.message.includes('no longer available')) {
    Alert.alert('Cart Issue', error.message, [
      { text: 'Review Cart', onPress: () => navigation.navigate('bag') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  }
}
```

---

## 🐛 Debugging Tips

### Check Logs
```javascript
// Product validation
console.log('🔍 Validating product IDs...');
console.log('✅ Product IDs validated successfully');
console.log('❌ Product validation failed:', invalidIds);

// Order creation
console.log('📦 Creating order with cart:', cart);
console.log('✅ Order created successfully:', orderId);

// Payment
console.log('💳 Processing payment...');
console.log('✅ Payment verified:', paymentId);
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid item IDs" | Product deleted from backend | ✅ Now validated before payment |
| "Authentication required" | User not logged in | Check `yoraaAPI.isAuthenticated()` |
| "Cart validation failed" | Empty cart or missing data | Validate cart before checkout |
| "Payment failed" | Network/Razorpay issue | Check internet + Razorpay status |

---

## 📊 Backend API Endpoints

### Authentication
```
POST   /api/auth/login                 - Email/password login
POST   /api/auth/login/firebase        - Firebase authentication
POST   /api/auth/apple-signin          - Apple Sign In
POST   /api/auth/logout                - Logout user
```

### Wishlist
```
GET    /api/wishlist/                  - Get wishlist items
POST   /api/wishlist/add               - Add to wishlist
DELETE /api/wishlist/remove/:itemId    - Remove from wishlist
```

### Cart
```
GET    /api/cart/user                  - Get user cart
POST   /api/cart/                      - Add to cart
PUT    /api/cart/update                - Update cart item
DELETE /api/cart/remove                - Remove from cart
DELETE /api/cart/clear                 - Clear cart
```

### Orders
```
POST   /api/razorpay/create-order      - Create Razorpay order
POST   /api/razorpay/verify-payment    - Verify payment
GET    /api/orders/getAllByUser        - Get user orders
GET    /api/orders/:orderId            - Get order details
```

### Products
```
GET    /api/products/:productId        - ✅ NEW: Used for validation
GET    /api/products/                  - Get all products
GET    /api/products/category/:catId   - Get by category
```

---

## 🔄 State Flow Quick Reference

```
User Action → Component → Context → Service → API → Backend
                   ↓          ↓         ↓        ↓       ↓
               UI Update  State Mgmt  Logic  HTTP Call  DB
```

---

## 🆘 Quick Troubleshooting

### Problem: Order creation fails
```bash
# Check these in order:
1. Is user authenticated? → yoraaAPI.isAuthenticated()
2. Is cart valid? → orderService.validateCart(cart)
3. Is address valid? → orderService.validateAddress(address)
4. Do products exist? → orderService.validateProductIds(cart) ✅ NEW
5. Check backend logs → Look for error messages
```

### Problem: Wishlist not syncing
```bash
# Check these:
1. For authenticated users → Check userToken exists
2. For guest users → Check guestSessionId exists
3. Check API response → Look for error messages
4. Try force sync → await yoraaAPI.getWishlist()
```

### Problem: Cart items disappear
```bash
# Check these:
1. Check BagContext state → console.log(bagItems)
2. Check AsyncStorage → Check if data persisted
3. Check backend cart → Call /api/cart/user
4. Check guest session → Verify guestSessionId
```

---

## 📝 Code Snippets

### Navigate with Cart Data
```javascript
navigation.navigate('deliveryoptionsstepone', {
  bagData: {
    items: bagItems,
    pricing: dynamicPricing,
    calculations: bagCalculations
  },
  fromCheckout: true
});
```

### Handle Async Errors
```javascript
try {
  const result = await someAsyncFunction();
  // Success handling
} catch (error) {
  console.error('Error:', error);
  
  // User-friendly error
  let message = 'Something went wrong';
  if (error.message.includes('network')) {
    message = 'Please check your internet connection';
  } else if (error.message.includes('auth')) {
    message = 'Please log in again';
  }
  
  Alert.alert('Error', message);
}
```

### Format Currency
```javascript
const { formatPrice } = useCurrencyContext();

// Display price
<Text>{formatPrice(2600)}</Text>  // ₹2,600 or $26.00
```

---

## 🎯 Performance Tips

1. **Memoize expensive calculations**
   ```javascript
   const totalPrice = useMemo(() => 
     bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
     [bagItems]
   );
   ```

2. **Use useCallback for functions**
   ```javascript
   const handleAddToBag = useCallback((product) => {
     addToBag(product, selectedSize);
   }, [addToBag, selectedSize]);
   ```

3. **Lazy load images**
   ```javascript
   <Image 
     source={{ uri: imageUrl }}
     resizeMode="cover"
     loadingIndicatorSource={require('./placeholder.png')}
   />
   ```

---

## 🔒 Security Checklist

- [x] JWT tokens stored securely (AsyncStorage)
- [x] Tokens never exposed in navigation params
- [x] Payment signatures verified server-side
- [x] Order amounts validated on backend
- [x] Product IDs validated before order creation ✅ NEW
- [x] User authentication required for sensitive operations
- [x] Guest sessions properly isolated

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Backend endpoints verified
- [ ] Razorpay credentials correct
- [ ] Shiprocket credentials correct
- [ ] Error handling tested
- [ ] Edge cases tested
- [ ] QA approval obtained

---

**Quick Access:** Keep this document open for rapid reference during development!  
**Last Updated:** October 14, 2025  
**Version:** 1.0
