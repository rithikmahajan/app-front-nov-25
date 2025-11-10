# Cart API Documentation

## Overview
This document provides comprehensive details about the cart (shopping bag) functionality in the YORAA mobile app and the APIs used, enabling the same functionality to be implemented on the website user side.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Cart Item Structure](#cart-item-structure)
5. [API Usage Examples](#api-usage-examples)
6. [Response Formats](#response-formats)
7. [Error Handling](#error-handling)
8. [Guest vs Authenticated Users](#guest-vs-authenticated-users)
9. [Cart Transfer & Sync](#cart-transfer--sync)
10. [Price Calculation](#price-calculation)
11. [Validation](#validation)
12. [Implementation Guide for Website](#implementation-guide-for-website)

---

## Architecture Overview

### Base URLs
- **Development**: `http://localhost:8001/api`
- **Production**: `http://185.193.19.244:8080/api`

### Key Components
1. **YoraaAPI Service** (`src/services/yoraaAPI.js`) - Main API service
2. **YoraaBackendAPI Service** (`src/services/yoraaBackendAPI.js`) - Alternative API service
3. **BagContext** (`src/contexts/BagContext.js`) - React Context for cart state management
4. **OrderService** (`src/services/orderService.js`) - Cart validation and formatting utilities

### State Management
- Uses React Context API (`BagContext`) to manage cart state
- Synchronizes local state with backend
- Supports both authenticated and guest users
- Auto-syncs when user signs in
- Optimistic UI updates with rollback on error

---

## API Endpoints

### 1. Get Cart
Retrieves the user's cart items.

**Endpoint**: `GET /api/cart/user`

**Query Parameters**:
- `sessionId` (optional) - Guest session ID (required for unauthenticated users)

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // For authenticated users
  'Content-Type': 'application/json'
}
```

**Alternative Endpoints**:
- `GET /cart` (Backend API Service)

---

### 2. Add to Cart
Adds an item to the user's cart.

**Endpoint**: `POST /api/cart/`

**Request Body**:
```javascript
{
  "itemId": "product_id_here",
  "size": "M",
  "quantity": 1,
  "sku": "SKU-123456", // Optional but recommended
  "sessionId": "guest_session_id" // Optional, for guest users
}
```

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // For authenticated users
  'Content-Type': 'application/json'
}
```

**Alternative Endpoints**:
- `POST /cart/add` (Backend API Service)

---

### 3. Update Cart Item
Updates the quantity of an existing cart item.

**Endpoint**: `PUT /api/cart/update`

**Request Body**:
```javascript
{
  "itemId": "product_id_here",
  "sizeId": "M",
  "quantity": 3
}
```

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // For authenticated users
  'Content-Type': 'application/json'
}
```

**Alternative Endpoints**:
- `PUT /cart/update` (Backend API Service)

---

### 4. Remove from Cart
Removes an item from the user's cart.

**Endpoint**: `DELETE /api/cart/remove`

**Request Body**:
```javascript
{
  "itemId": "product_id_here",
  "sizeId": "M"
}
```

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // For authenticated users
  'Content-Type': 'application/json'
}
```

**Alternative Endpoints**:
- `DELETE /cart/remove` (Backend API Service)

---

### 5. Clear Cart
Removes all items from the user's cart.

**Endpoint**: `DELETE /api/cart/clear`

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // Required
  'Content-Type': 'application/json'
}
```

---

### 6. Transfer Guest Cart
Transfers guest cart items to authenticated user account (used when user signs in).

**Endpoint**: `POST /api/cart/transfer`

**Request Body**:
```javascript
{
  "sessionId": "guest_session_id"
}
```

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // Required
  'Content-Type': 'application/json'
}
```

---

## Authentication

### Token-Based Authentication (Authenticated Users)

**Token Storage**:
- Stored in `AsyncStorage` (mobile) or `localStorage` (web)
- Key: `userToken`
- Format: JWT token

**Request Headers**:
```javascript
{
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  'Content-Type': 'application/json'
}
```

### Session-Based Authentication (Guest Users)

**Session ID**:
- Generated client-side using UUID
- Stored in `AsyncStorage` (mobile) or `localStorage` (web)
- Key: `guestSessionId`
- Sent in request body or as query parameter

**Example**:
```javascript
// Generate session ID
const guestSessionId = 'uuid-v4-generated-string';
localStorage.setItem('guestSessionId', guestSessionId);

// Use in requests
POST /api/cart/ with body: { sessionId: 'uuid-v4-generated-string', ... }
```

---

## Cart Item Structure

### Frontend Cart Item Format
```javascript
{
  "id": "product_mongodb_id",           // Product ID (MongoDB ObjectId)
  "name": "Product Name",                // Product display name
  "price": 1999,                         // Current selling price
  "regularPrice": 2499,                  // Original price (before discount)
  "salePrice": 1999,                     // Sale price (same as price)
  "size": "M",                           // Selected size
  "quantity": 2,                         // Quantity in cart
  "sku": "SKU-PROD-M-001",              // Stock Keeping Unit
  "brand": "Brand Name",                 // Product brand
  "image": "https://example.com/img.jpg", // Product image URL
  "addedAt": "2025-10-20T10:30:00Z",    // When item was added
  "description": "Product description"   // Optional product description
}
```

### Backend Expected Format (for Order Creation)
```javascript
{
  "id": "product_mongodb_id",           // Required: Product ID
  "name": "Product Name",                // Required: Product name
  "quantity": 2,                         // Required: Must be > 0
  "price": 1999,                         // Required: Unit price
  "size": "M",                           // Required: Size variant
  "sku": "SKU-PROD-M-001",              // Recommended: Stock Keeping Unit
  "image": "https://example.com/img.jpg", // Optional: For display
  "description": "Product description"   // Optional: For display
}
```

### Backend Response Format (from GET /api/cart/user)
```javascript
{
  "success": true,
  "items": [
    {
      "itemId": "product_mongodb_id",
      "_id": "cart_item_id",
      "sizeId": "M",
      "quantity": 2,
      "sku": "SKU-PROD-M-001",
      "addedAt": "2025-10-20T10:30:00Z",
      "itemDetails": {
        "productName": "Product Name",
        "price": 1999,
        "brand": "Brand Name",
        "sku": "SKU-PROD-M-001",
        "images": [
          { "url": "https://example.com/img.jpg" }
        ]
      }
    }
  ]
}
```

---

## API Usage Examples

### Example 1: Get Cart (Authenticated User)

```javascript
async function getCart() {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/user',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
}

// Usage
const cartData = await getCart();
console.log('Cart items:', cartData.items);
```

### Example 2: Get Cart (Guest User)

```javascript
async function getCartAsGuest() {
  const sessionId = localStorage.getItem('guestSessionId');
  
  const response = await fetch(
    `http://185.193.19.244:8080/api/cart/user?sessionId=${sessionId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Example 3: Add to Cart (Authenticated User)

```javascript
async function addToCart(itemId, size, quantity = 1, sku = null) {
  const token = localStorage.getItem('userToken');
  
  const requestBody = {
    itemId,
    size,
    quantity
  };
  
  if (sku) {
    requestBody.sku = sku;
  }
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );
  
  const data = await response.json();
  return data;
}

// Usage
await addToCart('product_123', 'M', 2, 'SKU-PROD-M-001');
```

### Example 4: Add to Cart (Guest User)

```javascript
async function addToCartAsGuest(itemId, size, quantity = 1, sku = null) {
  const sessionId = localStorage.getItem('guestSessionId');
  
  const requestBody = {
    itemId,
    size,
    quantity,
    sessionId
  };
  
  if (sku) {
    requestBody.sku = sku;
  }
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Example 5: Update Cart Item Quantity

```javascript
async function updateCartQuantity(itemId, size, newQuantity) {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/update',
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemId,
        sizeId: size,
        quantity: newQuantity
      })
    }
  );
  
  const data = await response.json();
  return data;
}

// Usage
await updateCartQuantity('product_123', 'M', 5);
```

### Example 6: Remove from Cart

```javascript
async function removeFromCart(itemId, size) {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/remove',
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemId,
        sizeId: size
      })
    }
  );
  
  const data = await response.json();
  return data;
}

// Usage
await removeFromCart('product_123', 'M');
```

### Example 7: Clear Cart

```javascript
async function clearCart() {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/clear',
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Example 8: Transfer Guest Cart (on Sign In)

```javascript
async function transferGuestCart() {
  const token = localStorage.getItem('userToken');
  const sessionId = localStorage.getItem('guestSessionId');
  
  if (!sessionId || !token) {
    console.log('No guest session or auth token available');
    return { success: true, transferredItems: 0 };
  }
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/cart/transfer',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    }
  );
  
  const data = await response.json();
  console.log(`Transferred ${data.data?.transferredItems || 0} items`);
  
  // Clear guest session after successful transfer
  localStorage.removeItem('guestSessionId');
  
  return data;
}
```

---

## Response Formats

### Success Response - Get Cart

```json
{
  "success": true,
  "items": [
    {
      "itemId": "670e1f5a8b9c4d2e1a3f4b5c",
      "_id": "cart_item_unique_id",
      "sizeId": "M",
      "quantity": 2,
      "sku": "SKU-PROD-M-001",
      "addedAt": "2025-10-20T10:30:00Z",
      "itemDetails": {
        "productName": "Cotton T-Shirt",
        "price": 1999,
        "regularPrice": 2499,
        "brand": "YORAA",
        "sku": "SKU-PROD-M-001",
        "images": [
          {
            "url": "https://example.com/products/tshirt-1.jpg",
            "alt": "Cotton T-Shirt"
          }
        ],
        "description": "Premium cotton t-shirt"
      }
    }
  ]
}
```

### Success Response - Add to Cart

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "itemId": "670e1f5a8b9c4d2e1a3f4b5c",
    "size": "M",
    "quantity": 1
  }
}
```

### Success Response - Update Cart

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "itemId": "670e1f5a8b9c4d2e1a3f4b5c",
    "sizeId": "M",
    "quantity": 3
  }
}
```

### Success Response - Remove from Cart

```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### Success Response - Clear Cart

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Success Response - Transfer Cart

```json
{
  "success": true,
  "message": "Guest cart transferred successfully",
  "data": {
    "transferredItems": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## Error Handling

### Common Errors

1. **Product Not Found**
```json
{
  "success": false,
  "message": "Product not found",
  "error": "Item with ID xxx does not exist"
}
```

2. **Invalid Size**
```json
{
  "success": false,
  "message": "Invalid size selected",
  "error": "Size M is not available for this product"
}
```

3. **Out of Stock**
```json
{
  "success": false,
  "message": "Product is out of stock",
  "error": "Insufficient inventory for the requested quantity"
}
```

4. **Authentication Required**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

5. **Invalid Quantity**
```json
{
  "success": false,
  "message": "Invalid quantity",
  "error": "Quantity must be greater than 0"
}
```

6. **Cart Endpoint Not Available (404)**
```json
{
  "success": false,
  "message": "Cart endpoint not available",
  "error": "404 Not Found"
}
```
*Note: The app handles this gracefully by using local cart storage only*

### Error Handling in Code

```javascript
async function handleCartOperation(operation) {
  try {
    const result = await operation();
    
    if (result.success) {
      console.log('✅ Operation successful:', result.message);
      return result;
    } else {
      console.error('❌ Operation failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    // Handle 404 errors (endpoint not available)
    if (error.status === 404 || error.statusCode === 404) {
      console.warn('⚠️ Cart endpoint not available, using local cart only');
      return { success: true, localOnly: true };
    }
    
    // Handle specific errors
    if (error.message?.includes('out of stock')) {
      console.error('❌ Product out of stock');
      alert('Sorry, this product is currently out of stock.');
    } else if (error.message?.includes('Product not found')) {
      console.error('❌ Product not found');
      alert('This product is no longer available.');
    } else if (error.message?.includes('Authentication required')) {
      console.error('🔐 User needs to login');
      // Redirect to login or switch to guest mode
    } else {
      console.error('❌ Unexpected error:', error);
      alert('An error occurred. Please try again.');
    }
    
    throw error;
  }
}
```

---

## Guest vs Authenticated Users

### Guest Users
- Use `sessionId` for identification
- Session ID generated client-side (UUID v4)
- Stored in `localStorage` or `AsyncStorage`
- Cart data stored in backend with session association
- Cart automatically transferred when user signs in
- Limited to session duration (unless transferred)

**Session ID Generation**:
```javascript
import { v4 as uuidv4 } from 'uuid';

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('guestSessionId');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('guestSessionId', sessionId);
    console.log('👤 New guest session created:', sessionId);
  }
  
  return sessionId;
}
```

### Authenticated Users
- Use JWT token for authentication
- Token received after login
- Stored in `localStorage` or `AsyncStorage`
- Persistent cart across sessions
- Can merge guest cart when signing in

**Token Management**:
```javascript
function setAuthToken(token, userData) {
  localStorage.setItem('userToken', token);
  localStorage.setItem('userData', JSON.stringify(userData));
  console.log('🔐 User token stored');
}

function getAuthToken() {
  return localStorage.getItem('userToken');
}

function clearAuthToken() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  console.log('🔓 User token cleared');
}
```

---

## Cart Transfer & Sync

### When User Signs In

When a guest user signs in, their cart should be transferred to their authenticated account:

```javascript
async function handleUserSignIn(token, userData) {
  // Store auth token
  setAuthToken(token, userData);
  
  // Transfer guest cart to user account
  await transferGuestCart();
  
  // Load updated cart from server
  await loadCart();
  
  console.log('✅ User signed in and cart transferred');
}
```

### Manual Cart Sync

For authenticated users, sync local cart changes with backend:

```javascript
async function syncCartWithBackend(localCartItems) {
  const token = localStorage.getItem('userToken');
  
  if (!token) {
    console.log('⚠️ User not authenticated, skipping sync');
    return;
  }
  
  console.log('🔄 Syncing local cart to backend...', localCartItems.length, 'items');
  
  try {
    for (const item of localCartItems) {
      await addToCart(item.id, item.size, item.quantity, item.sku);
    }
    console.log('✅ Cart synced successfully');
  } catch (error) {
    console.error('❌ Error syncing cart:', error);
  }
}
```

---

## Price Calculation

### Frontend Price Calculation (Display Only)

**⚠️ Important**: Frontend prices are for display purposes only. The backend recalculates all prices from the database for security.

```javascript
function calculateCartTotal(cartItems) {
  let subtotal = 0;
  let itemCount = 0;
  
  cartItems.forEach(item => {
    // Use sale price if available, otherwise regular price
    const itemPrice = parseFloat(item.salePrice || item.price || item.regularPrice || 0);
    const itemQuantity = parseInt(item.quantity, 10) || 0;
    const itemTotal = itemPrice * itemQuantity;
    
    subtotal += itemTotal;
    itemCount += itemQuantity;
  });
  
  // Shipping calculation
  const shippingCharges = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
  
  // Tax calculation (if applicable)
  const taxAmount = 0; // Currently not implemented
  
  const total = subtotal + shippingCharges + taxAmount;
  
  return {
    subtotal,
    shippingCharges,
    taxAmount,
    total,
    itemCount
  };
}

// Usage
const cartSummary = calculateCartTotal(cartItems);
console.log('Cart Total:', cartSummary);
```

### Backend Price Calculation

The backend fetches fresh prices from the database and recalculates everything:
- Fetches current product prices from database
- Automatically selects sale price if available
- Calculates shipping based on total
- Applies taxes if configured
- Returns final amount for payment

**Client prices are never trusted for payment processing.**

---

## Validation

### Cart Validation Before Checkout

```javascript
function validateCart(cartItems) {
  // Check if cart is empty
  if (!cartItems || cartItems.length === 0) {
    alert('Your cart is empty. Please add items before proceeding.');
    return false;
  }
  
  // Validate each item
  for (const item of cartItems) {
    // Check required fields
    const itemId = item.id || item._id || item.itemId;
    const itemName = item.name || item.productName;
    const hasQuantity = item.quantity > 0;
    
    if (!itemId || !itemName) {
      alert(`Invalid cart item: ${itemName || 'Unknown'}. Please remove and re-add it.`);
      return false;
    }
    
    if (!hasQuantity) {
      alert(`Invalid quantity for ${itemName}. Quantity must be greater than 0.`);
      return false;
    }
    
    // Check if price is valid
    const price = parseFloat(item.price || item.salePrice || item.regularPrice || 0);
    if (price === 0) {
      console.warn(`⚠️ Warning: Item ${itemName} has zero price`);
    }
  }
  
  console.log('✅ Cart validation passed');
  return true;
}
```

### Product Validation Before Adding to Cart

```javascript
async function validateProductAndSize(product, size) {
  // Validate product exists in backend
  try {
    const response = await fetch(
      `http://185.193.19.244:8080/api/products/${product.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const productData = await response.json();
    
    if (!productData.success) {
      alert('This product is no longer available.');
      return false;
    }
    
    // Check if size is available
    if (size && productData.data.sizes) {
      const sizeVariant = productData.data.sizes.find(s => s.size === size);
      
      if (!sizeVariant) {
        alert(`Size ${size} is not available for this product.`);
        return false;
      }
      
      // Check stock availability
      if (sizeVariant.stock <= 0) {
        alert(`Size ${size} is currently out of stock.`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating product:', error);
    // Allow adding even if validation fails (backend will validate again)
    return true;
  }
}
```

---

## Implementation Guide for Website

### Step 1: Create Cart Service

```javascript
// cartService.js

const API_BASE_URL = 'http://185.193.19.244:8080/api';

class CartService {
  constructor() {
    this.token = localStorage.getItem('userToken');
    this.sessionId = this.getOrCreateSessionId();
  }
  
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }
  
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  async getCart() {
    const isAuthenticated = !!this.token;
    let url = `${API_BASE_URL}/cart/user`;
    
    if (!isAuthenticated && this.sessionId) {
      url += `?sessionId=${this.sessionId}`;
    }
    
    const headers = { 'Content-Type': 'application/json' };
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, { method: 'GET', headers });
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.status === 404) {
        return { success: true, items: [], localOnly: true };
      }
      throw error;
    }
  }
  
  async addToCart(itemId, size, quantity = 1, sku = null) {
    const isAuthenticated = !!this.token;
    const url = `${API_BASE_URL}/cart/`;
    
    const headers = { 'Content-Type': 'application/json' };
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const body = { itemId, size, quantity };
    if (sku) body.sku = sku;
    if (!isAuthenticated) body.sessionId = this.sessionId;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      return response.json();
    } catch (error) {
      if (error.status === 404) {
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }
  
  async updateCartItem(itemId, size, quantity) {
    const url = `${API_BASE_URL}/cart/update`;
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ itemId, sizeId: size, quantity })
      });
      return response.json();
    } catch (error) {
      if (error.status === 404) {
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }
  
  async removeFromCart(itemId, size) {
    const url = `${API_BASE_URL}/cart/remove`;
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ itemId, sizeId: size })
      });
      return response.json();
    } catch (error) {
      if (error.status === 404) {
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }
  
  async clearCart() {
    const url = `${API_BASE_URL}/cart/clear`;
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await fetch(url, { method: 'DELETE', headers });
      return response.json();
    } catch (error) {
      if (error.status === 404) {
        return { success: true, localOnly: true };
      }
      throw error;
    }
  }
  
  async transferGuestCart() {
    if (!this.sessionId || !this.token) {
      return { success: true, transferredItems: 0 };
    }
    
    const url = `${API_BASE_URL}/cart/transfer`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId: this.sessionId })
    });
    
    const data = await response.json();
    
    // Clear guest session after successful transfer
    if (data.success) {
      localStorage.removeItem('guestSessionId');
    }
    
    return data;
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('userToken', token);
  }
  
  clearToken() {
    this.token = null;
    localStorage.removeItem('userToken');
  }
}

export default new CartService();
```

### Step 2: Create React Context for Cart

```javascript
// CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from './cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadCart();
  }, []);
  
  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      
      if (response.items) {
        const items = response.items.map(item => ({
          id: item.itemId || item._id,
          name: item.itemDetails?.productName || item.name,
          price: item.itemDetails?.price || item.price,
          regularPrice: item.itemDetails?.regularPrice,
          size: item.sizeId || item.size,
          quantity: item.quantity,
          sku: item.sku,
          brand: item.itemDetails?.brand,
          image: item.itemDetails?.images?.[0]?.url,
          addedAt: item.addedAt
        }));
        
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addToCart = async (product, size, quantity = 1) => {
    try {
      // Optimistic update
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        regularPrice: product.regularPrice,
        size,
        quantity,
        sku: product.sku,
        brand: product.brand,
        image: product.image,
        addedAt: new Date().toISOString()
      };
      
      setCartItems(prev => {
        const existingIndex = prev.findIndex(
          item => item.id === product.id && item.size === size
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        
        return [...prev, newItem];
      });
      
      // Sync with backend
      await cartService.addToCart(product.id, size, quantity, product.sku);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Reload cart to ensure consistency
      await loadCart();
      return false;
    }
  };
  
  const updateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId, size);
    }
    
    try {
      // Optimistic update
      setCartItems(prev => prev.map(item => 
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      ));
      
      // Sync with backend
      await cartService.updateCartItem(productId, size, newQuantity);
      
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      await loadCart();
      return false;
    }
  };
  
  const removeFromCart = async (productId, size) => {
    try {
      // Optimistic update
      setCartItems(prev => 
        prev.filter(item => !(item.id === productId && item.size === size))
      );
      
      // Sync with backend
      await cartService.removeFromCart(productId, size);
      
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      await loadCart();
      return false;
    }
  };
  
  const clearCart = async () => {
    try {
      setCartItems([]);
      await cartService.clearCart();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      await loadCart();
      return false;
    }
  };
  
  const getCartTotal = () => {
    let subtotal = 0;
    let itemCount = 0;
    
    cartItems.forEach(item => {
      const itemPrice = parseFloat(item.price || 0);
      const itemQuantity = parseInt(item.quantity, 10) || 0;
      subtotal += itemPrice * itemQuantity;
      itemCount += itemQuantity;
    });
    
    const shippingCharges = subtotal >= 500 ? 0 : 50;
    const taxAmount = 0;
    const total = subtotal + shippingCharges + taxAmount;
    
    return { subtotal, shippingCharges, taxAmount, total, itemCount };
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: loadCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```

### Step 3: Cart Components

#### Cart Page Component

```javascript
// CartPage.js
import React from 'react';
import { useCart } from './CartContext';

function CartPage() {
  const { 
    cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal 
  } = useCart();
  
  const { subtotal, shippingCharges, total, itemCount } = getCartTotal();
  
  if (loading) return <div>Loading cart...</div>;
  
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some items to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <h1>Shopping Cart ({itemCount} items)</h1>
      
      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
            <img src={item.image} alt={item.name} />
            
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>Size: {item.size}</p>
              <p>SKU: {item.sku}</p>
            </div>
            
            <div className="item-price">
              <p className="price">₹{item.price}</p>
              {item.regularPrice && item.regularPrice > item.price && (
                <p className="regular-price">₹{item.regularPrice}</p>
              )}
            </div>
            
            <div className="item-quantity">
              <button 
                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => removeFromCart(item.id, item.size)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>{shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  );
}

export default CartPage;
```

#### Product Card with Add to Cart

```javascript
// ProductCard.js
import React, { useState } from 'react';
import { useCart } from './CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'M');
  const [adding, setAdding] = useState(false);
  
  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product, selectedSize, 1);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="brand">{product.brand}</p>
      
      <div className="price">
        <span className="sale-price">₹{product.price}</span>
        {product.regularPrice && product.regularPrice > product.price && (
          <span className="regular-price">₹{product.regularPrice}</span>
        )}
      </div>
      
      {product.sizes && product.sizes.length > 0 && (
        <div className="size-selector">
          <label>Size:</label>
          <select 
            value={selectedSize} 
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {product.sizes.map(size => (
              <option key={size.size} value={size.size}>
                {size.size}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <button 
        onClick={handleAddToCart}
        disabled={adding}
        className="add-to-cart-btn"
      >
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default ProductCard;
```

---

## Best Practices

1. **Optimistic UI Updates**: Update UI immediately, then sync with backend
2. **Error Rollback**: Revert optimistic updates if backend sync fails
3. **Handle 404 Gracefully**: Use local cart if backend endpoints unavailable
4. **Validate Before Adding**: Check product and size availability
5. **Transfer Guest Cart**: Merge guest cart when user signs in
6. **Clear Guest Session**: Remove session ID after successful transfer
7. **Security-First Pricing**: Never trust client-side prices for payment
8. **SKU Tracking**: Include SKU for better inventory management
9. **Deduplication**: Combine items with same ID and size
10. **Loading States**: Show loading indicators during operations

---

## Testing

### Test Cart Operations

```javascript
// Test adding to cart
await cartService.addToCart('product_123', 'M', 2, 'SKU-123');

// Test updating quantity
await cartService.updateCartItem('product_123', 'M', 5);

// Test removing from cart
await cartService.removeFromCart('product_123', 'M');

// Test clearing cart
await cartService.clearCart();

// Test getting cart
const cart = await cartService.getCart();
console.log('Cart items:', cart.items);
```

### Test Guest to User Transfer

```javascript
// As guest, add items
localStorage.removeItem('userToken');
await cartService.addToCart('product_123', 'M', 1);

// Sign in
localStorage.setItem('userToken', 'test-token');

// Transfer cart
await cartService.transferGuestCart();

// Verify cart transferred
const cart = await cartService.getCart();
console.log('Transferred items:', cart.items.length);
```

---

## Summary

The cart functionality in the YORAA app:

1. **Supports both authenticated and guest users**
2. **Provides comprehensive cart management** (add, update, remove, clear)
3. **Implements optimistic UI updates** with error rollback
4. **Handles cart transfer** when guest users sign in
5. **Validates products and sizes** before adding to cart
6. **Calculates prices** (frontend for display, backend for payment)
7. **Gracefully handles errors** including 404 fallbacks
8. **Uses JWT tokens** for authenticated users
9. **Uses session IDs** for guest users
10. **Syncs with backend** while maintaining local state

For website implementation, follow the provided code examples and ensure proper state management, error handling, and cart synchronization.

---

## Contact & Support

For backend API issues or questions, contact the backend development team.

**Last Updated**: October 20, 2025
