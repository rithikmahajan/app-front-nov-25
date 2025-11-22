# Wishlist API Documentation

## Overview
This document describes how the wishlist (favorites) functionality works in the YORAA mobile app and provides details about the APIs used, so the same functionality can be implemented on the website user side.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [API Usage Examples](#api-usage-examples)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [Guest vs Authenticated Users](#guest-vs-authenticated-users)
8. [Implementation Guide for Website](#implementation-guide-for-website)

---

## Architecture Overview

### Base URLs
- **Development**: `http://localhost:8001/api`
- **Production**: `http://185.193.19.244:8080/api`

### Key Components
1. **YoraaAPI Service** (`src/services/yoraaAPI.js`) - Main API service
2. **YoraaBackendAPI Service** (`src/services/yoraaBackendAPI.js`) - Alternative API service
3. **EnhancedApiService** (`src/services/enhancedApiService.js`) - Enhanced API with better error handling
4. **FavoritesContext** (`src/contexts/FavoritesContext.js`) - React Context for state management

### State Management
- Uses React Context API (`FavoritesContext`) to manage wishlist state
- Synchronizes local state with backend
- Supports both authenticated and guest users
- Auto-syncs when user signs in

---

## API Endpoints

### 1. Get Wishlist
Retrieves the user's wishlist items.

**Endpoint**: `GET /api/wishlist/`

**Query Parameters**:
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10) - Number of items per page
- `sessionId` (optional) - Guest session ID (required for unauthenticated users)

**Headers**:
```javascript
{
  'Authorization': 'Bearer <user_token>', // For authenticated users
  'Content-Type': 'application/json'
}
```

**Alternative Endpoints**:
- `GET /user/wishlist` (Enhanced API Service)
- `GET /wishlist` (Backend API Service)

---

### 2. Add to Wishlist
Adds an item to the user's wishlist.

**Endpoint**: `POST /api/wishlist/add`

**Request Body**:
```javascript
{
  "itemId": "product_id_here",
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
- `POST /user/wishlist/{itemId}` (Enhanced API Service)
- `POST /wishlist/add` (Backend API Service)

---

### 3. Remove from Wishlist
Removes an item from the user's wishlist.

**Endpoint**: `DELETE /api/wishlist/remove/{itemId}`

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
- `DELETE /user/wishlist/{itemId}` (Enhanced API Service)
- `DELETE /wishlist/remove` with body `{ "itemId": "product_id" }` (Backend API Service)

---

### 4. Toggle Wishlist
Smart function that adds or removes item based on current state.

**Implementation**:
```javascript
async toggleWishlist(itemId) {
  try {
    // First try to add to wishlist
    const response = await this.addToWishlist(itemId);
    return { added: true, response };
  } catch (error) {
    if (error.message.includes('already exists') || 
        error.message.includes('already in wishlist')) {
      // Item already in wishlist, remove it
      const response = await this.removeFromWishlist(itemId);
      return { added: false, response };
    }
    throw error;
  }
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
- Sent as query parameter or in request body

**Example**:
```javascript
// Generate session ID
const guestSessionId = 'uuid-v4-generated-string';
localStorage.setItem('guestSessionId', guestSessionId);

// Use in requests
GET /api/wishlist/?sessionId=uuid-v4-generated-string
```

---

## API Usage Examples

### Example 1: Get Wishlist (Authenticated User)

```javascript
// JavaScript/Fetch Example
async function getWishlist(page = 1, limit = 10) {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    `http://185.193.19.244:8080/api/wishlist/?page=${page}&limit=${limit}`,
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
```

### Example 2: Get Wishlist (Guest User)

```javascript
async function getWishlistAsGuest(page = 1, limit = 10) {
  const sessionId = localStorage.getItem('guestSessionId');
  
  const response = await fetch(
    `http://185.193.19.244:8080/api/wishlist/?page=${page}&limit=${limit}&sessionId=${sessionId}`,
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

### Example 3: Add to Wishlist (Authenticated User)

```javascript
async function addToWishlist(itemId) {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/wishlist/add',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemId })
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Example 4: Add to Wishlist (Guest User)

```javascript
async function addToWishlistAsGuest(itemId) {
  const sessionId = localStorage.getItem('guestSessionId');
  
  const response = await fetch(
    'http://185.193.19.244:8080/api/wishlist/add',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        itemId,
        sessionId 
      })
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Example 5: Remove from Wishlist (Authenticated User)

```javascript
async function removeFromWishlist(itemId) {
  const token = localStorage.getItem('userToken');
  
  const response = await fetch(
    `http://185.193.19.244:8080/api/wishlist/remove/${itemId}`,
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

### Example 6: Remove from Wishlist (Guest User)

```javascript
async function removeFromWishlistAsGuest(itemId) {
  const sessionId = localStorage.getItem('guestSessionId');
  
  const response = await fetch(
    `http://185.193.19.244:8080/api/wishlist/remove/${itemId}?sessionId=${sessionId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
}
```

---

## Response Formats

### Success Response - Get Wishlist

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "product_id_123",
        "itemId": "product_id_123",
        "name": "Product Name",
        "price": 1999,
        "image": "https://example.com/image.jpg",
        "description": "Product description"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Alternative Response Structures** (the app handles all of these):
- `response.data.items` ✓
- `response.items` ✓
- `response.data` (as array) ✓
- `response.data.wishlist` ✓
- `response.data.products` ✓
- `response.wishlist` ✓
- `response.products` ✓

### Success Response - Add to Wishlist

```json
{
  "success": true,
  "message": "Item added to wishlist successfully",
  "data": {
    "itemId": "product_id_123"
  }
}
```

### Success Response - Remove from Wishlist

```json
{
  "success": true,
  "message": "Item removed from wishlist successfully",
  "data": {
    "itemId": "product_id_123"
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

1. **Item Already in Wishlist**
```json
{
  "success": false,
  "message": "Item already in wishlist"
}
```

2. **Item Not Found**
```json
{
  "success": false,
  "message": "Item not found"
}
```

3. **Authentication Required**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

4. **Invalid Session**
```json
{
  "success": false,
  "message": "Invalid or missing session ID"
}
```

### Error Handling in Code

```javascript
async function handleWishlistOperation(operation) {
  try {
    const result = await operation();
    
    if (result.success) {
      console.log('✅ Operation successful:', result.message);
      return result.data;
    } else {
      console.error('❌ Operation failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    // Handle specific errors
    if (error.message?.includes('already in wishlist')) {
      console.log('ℹ️ Item already in wishlist');
      // Handle as expected behavior
    } else if (error.message?.includes('Item not found')) {
      console.error('❌ Product not found on server');
      // Remove from local state
    } else if (error.message?.includes('Authentication required')) {
      console.error('🔐 User needs to login');
      // Redirect to login
    } else {
      console.error('❌ Unexpected error:', error);
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
- Limited to session duration
- Data synced when user signs in

**Session ID Generation**:
```javascript
// Using UUID library
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
- Persistent across sessions
- Can sync guest wishlist items when signing in

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

### Syncing Guest to Authenticated

When a guest user signs in, their wishlist items should be synced:

```javascript
async function syncGuestWishlistToUser() {
  const guestWishlist = await getLocalWishlist(); // Get from local state
  const userToken = localStorage.getItem('userToken');
  
  if (!userToken || guestWishlist.length === 0) {
    return;
  }
  
  console.log('❤️ Syncing guest wishlist to user account...', guestWishlist.length, 'items');
  
  for (const itemId of guestWishlist) {
    try {
      await addToWishlist(itemId);
      console.log('✅ Synced item:', itemId);
    } catch (error) {
      if (error.message?.includes('already in wishlist')) {
        console.log('ℹ️ Item already exists on server:', itemId);
      } else if (error.message?.includes('Item not found')) {
        console.warn('⚠️ Item not found on server:', itemId);
      } else {
        console.error('❌ Error syncing item:', itemId, error);
      }
    }
  }
  
  // Clear guest session after successful sync
  localStorage.removeItem('guestSessionId');
  console.log('✅ Guest wishlist sync completed');
}
```

---

## Implementation Guide for Website

### Step 1: Create API Service

```javascript
// wishlistService.js

const API_BASE_URL = 'http://185.193.19.244:8080/api';

class WishlistService {
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
  
  async getWishlist(page = 1, limit = 10) {
    const isAuthenticated = !!this.token;
    let url = `${API_BASE_URL}/wishlist/?page=${page}&limit=${limit}`;
    
    if (!isAuthenticated) {
      url += `&sessionId=${this.sessionId}`;
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    return response.json();
  }
  
  async addToWishlist(itemId) {
    const isAuthenticated = !!this.token;
    const url = `${API_BASE_URL}/wishlist/add`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const body = { itemId };
    if (!isAuthenticated) {
      body.sessionId = this.sessionId;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    return response.json();
  }
  
  async removeFromWishlist(itemId) {
    const isAuthenticated = !!this.token;
    let url = `${API_BASE_URL}/wishlist/remove/${itemId}`;
    
    if (!isAuthenticated) {
      url += `?sessionId=${this.sessionId}`;
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    return response.json();
  }
  
  async toggleWishlist(itemId) {
    try {
      const response = await this.addToWishlist(itemId);
      return { added: true, response };
    } catch (error) {
      if (error.message?.includes('already in wishlist')) {
        const response = await this.removeFromWishlist(itemId);
        return { added: false, response };
      }
      throw error;
    }
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

export default new WishlistService();
```

### Step 2: Create React Context (Optional)

```javascript
// WishlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from './wishlistService';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadWishlist();
  }, []);
  
  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      const items = response.data?.items || [];
      const ids = new Set(items.map(item => item.itemId || item._id));
      setWishlist(ids);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addToWishlist = async (itemId) => {
    try {
      await wishlistService.addToWishlist(itemId);
      setWishlist(prev => new Set([...prev, itemId]));
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };
  
  const removeFromWishlist = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      setWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };
  
  const toggleWishlist = async (itemId) => {
    if (wishlist.has(itemId)) {
      return removeFromWishlist(itemId);
    } else {
      return addToWishlist(itemId);
    }
  };
  
  const isInWishlist = (itemId) => wishlist.has(itemId);
  
  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      refreshWishlist: loadWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
```

### Step 3: Use in Components

```javascript
// ProductCard.js
import React from 'react';
import { useWishlist } from './WishlistContext';

function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product._id);
  
  const handleWishlistClick = async () => {
    await toggleWishlist(product._id);
  };
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleWishlistClick}>
        {isFavorite ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
      </button>
    </div>
  );
}

export default ProductCard;
```

### Step 4: Wishlist Page

```javascript
// WishlistPage.js
import React, { useEffect, useState } from 'react';
import wishlistService from './wishlistService';

function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWishlist();
  }, []);
  
  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      setItems(response.data?.items || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  if (items.length === 0) {
    return <div>Your wishlist is empty</div>;
  }
  
  return (
    <div className="wishlist-page">
      <h1>My Wishlist ({items.length})</h1>
      <div className="wishlist-grid">
        {items.map(item => (
          <div key={item._id} className="wishlist-item">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <button onClick={() => handleRemove(item._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
```

---

## Best Practices

1. **Always check authentication state** before making requests
2. **Handle all possible response structures** (as shown in Response Formats)
3. **Implement proper error handling** for network failures and API errors
4. **Use optimistic UI updates** for better user experience
5. **Sync guest wishlist** when user signs in
6. **Clear guest session** after successful sync
7. **Implement retry logic** for failed requests
8. **Cache wishlist data** locally to reduce API calls
9. **Use pagination** for large wishlists
10. **Show loading states** during API operations

---

## Testing

### Test Authentication Flow

```javascript
// Test authenticated user
localStorage.setItem('userToken', 'your-test-token');
const result = await wishlistService.getWishlist();
console.log('Authenticated wishlist:', result);

// Test guest user
localStorage.removeItem('userToken');
const guestResult = await wishlistService.getWishlist();
console.log('Guest wishlist:', guestResult);
```

### Test Toggle Functionality

```javascript
const itemId = 'test-product-123';

// Add to wishlist
await wishlistService.toggleWishlist(itemId);
console.log('Item added');

// Remove from wishlist (toggle again)
await wishlistService.toggleWishlist(itemId);
console.log('Item removed');
```

---

## Summary

The wishlist functionality in the YORAA app:

1. **Supports both authenticated and guest users**
2. **Uses RESTful API endpoints** for all operations
3. **Implements proper error handling** for edge cases
4. **Syncs guest data** when user signs in
5. **Provides toggle functionality** for easy add/remove
6. **Handles multiple response formats** from the backend
7. **Uses JWT tokens** for authenticated users
8. **Uses session IDs** for guest users

For website implementation, follow the provided code examples and ensure proper authentication handling, error management, and state synchronization.

---

## Contact & Support

For backend API issues or questions, contact the backend development team.

**Last Updated**: October 19, 2025
