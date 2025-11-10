# Search Functionality API Documentation

## Overview
This document provides a detailed guide on how the search functionality is implemented in the YORAA mobile app, including all API endpoints, request/response formats, and implementation details. This will enable the web frontend team to implement the same functionality on the website.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Base Configuration](#api-base-configuration)
3. [Search API Endpoints](#search-api-endpoints)
4. [Text Search Implementation](#text-search-implementation)
5. [Voice Search Implementation](#voice-search-implementation)
6. [Visual/Camera Search (Planned)](#visualcamera-search-planned)
7. [Barcode Search (Planned)](#barcode-search-planned)
8. [Search Suggestions](#search-suggestions)
9. [Authentication & Headers](#authentication--headers)
10. [Request/Response Examples](#requestresponse-examples)
11. [Error Handling](#error-handling)
12. [Implementation Guide for Web](#implementation-guide-for-web)

---

## Architecture Overview

The search functionality in the YORAA app consists of multiple search modes:

1. **Text Search** - Traditional keyword-based product search
2. **Voice Search** - Speech-to-text search with voice recognition
3. **Visual Search** - Image-based product search (camera/gallery)
4. **Barcode Search** - Scan product barcodes for quick lookup

The app uses a centralized API service (`yoraaBackendAPI.js`) that communicates with the backend server for all search operations.

---

## API Base Configuration

### Base URLs

```javascript
// Development Environment
const DEV_BASE_URL = 'http://localhost:8001/api';

// Production Environment (Contabo VPS - Docker)
const PROD_BASE_URL = 'http://185.193.19.244:8080/api';
```

### Environment Detection
```javascript
const baseURL = __DEV__ 
  ? 'http://localhost:8001/api'        // Development
  : 'http://185.193.19.244:8080/api';  // Production
```

---

## Search API Endpoints

### 1. Text Search Endpoint

**Endpoint:** `GET /api/items/search`

**URL:** `{baseURL}/items/search?query={searchQuery}`

**Parameters:**
- `query` (string, required) - The search keyword(s)

**Example:**
```
GET http://185.193.19.244:8080/api/items/search?query=dress
```

---

### 2. Voice Search Endpoint

**Endpoint:** `POST /api/items/voice-search`

**URL:** `{baseURL}/items/voice-search`

**Request Body:**
```json
{
  "query": "blue summer dress",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer {userToken}" // Optional
}
```

---

### 3. Search by Name (Alternative)

**Endpoint:** `GET /api/items/search/name`

**URL:** `{baseURL}/items/search/name?query={searchQuery}`

**Parameters:**
- `query` (string, required) - The product name to search

**Example:**
```
GET http://185.193.19.244:8080/api/items/search/name?query=saree
```

---

### 4. Filter Products (Advanced Search)

**Endpoint:** `GET /api/items/filter`

**URL:** `{baseURL}/items/filter?{filters}`

**Query Parameters:**
- `category` (string, optional) - Filter by category ID
- `minPrice` (number, optional) - Minimum price
- `maxPrice` (number, optional) - Maximum price
- `color` (string, optional) - Filter by color
- `size` (string, optional) - Filter by size
- `brand` (string, optional) - Filter by brand
- `sortBy` (string, optional) - Sort field (e.g., 'price', 'createdAt')
- `sortOrder` (string, optional) - 'asc' or 'desc'
- `page` (number, optional) - Page number for pagination
- `limit` (number, optional) - Items per page

**Example:**
```
GET http://185.193.19.244:8080/api/items/filter?category=dresses&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc
```

---

## Text Search Implementation

### Mobile App Implementation

```javascript
// File: src/services/yoraaBackendAPI.js

async searchProducts(query) {
  return this.request(`/items/search?query=${encodeURIComponent(query)}`);
}
```

### Search Flow in Mobile App

1. **User Input Debouncing** (300ms delay)
2. **API Call** to `/items/search`
3. **Process Results**
4. **Display Products** in grid layout

### Code Example from Mobile App

```javascript
// File: src/screens/search.js

const performSearch = useCallback(async (query) => {
  try {
    setIsLoadingSuggestions(true);
    setIsLoadingResults(true);

    console.log('🔍 Performing API search for:', query);

    // Get suggestions from API
    const apiSuggestions = await searchProductSuggestions(query);
    setSearchSuggestions(apiSuggestions);

    // Search for actual products from API
    const productResults = await apiClient.searchProducts(query);
    const products = productResults.data || productResults || [];
    
    console.log('🔍 API search results:', products);
    setSearchResults(products);

  } catch (error) {
    console.error('❌ Search API error:', error);
    // Handle errors appropriately
  } finally {
    setIsLoadingSuggestions(false);
    setIsLoadingResults(false);
  }
}, [apiClient, searchProductSuggestions]);

// Debounced search trigger
useEffect(() => {
  const searchTimeout = setTimeout(async () => {
    if (searchText.trim().length > 0) {
      await performSearch(searchText.trim());
    } else {
      setSearchSuggestions([]);
      setSearchResults([]);
    }
  }, 300); // 300ms debounce

  return () => clearTimeout(searchTimeout);
}, [searchText, performSearch]);
```

---

## Voice Search Implementation

### Mobile App Voice Search Flow

1. **Request Microphone Permission**
2. **Activate Voice Recognition** (using `@react-native-voice/voice` library)
3. **Capture Speech-to-Text**
4. **Send to Voice Search API**
5. **Display Results**

### Voice Search API Method

```javascript
// File: src/services/yoraaBackendAPI.js

async voiceSearchProducts(voiceText) {
  try {
    console.log('🎤 Voice Search API called with:', voiceText);
    
    const response = await this.request('/items/voice-search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        query: voiceText,
        timestamp: new Date().toISOString()
      }),
      timeout: 15000 // 15 second timeout for voice search
    });
    
    console.log('🎤 Voice Search Response:', {
      success: response.success,
      resultsCount: response.resultsCount,
      query: response.query
    });
    
    return response;
    
  } catch (error) {
    console.error('🎤 Voice search error:', error);
    throw error;
  }
}
```

### Voice Search Implementation in Screen

```javascript
// File: src/screens/search.js

const performVoiceSearch = useCallback(async (query) => {
  try {
    setIsLoadingSuggestions(true);
    setIsLoadingResults(true);

    console.log('🎤 Performing voice search for:', query);

    // Call the voice search API endpoint
    const voiceSearchResponse = await apiClient.voiceSearchProducts(query);
    
    if (voiceSearchResponse.success) {
      const products = voiceSearchResponse.data || [];
      console.log(`🎤 Voice search results: ${voiceSearchResponse.resultsCount} products found`);
      
      // Set the search results
      setSearchResults(products);
      
      // Set suggestions if available
      setSearchSuggestions(products.slice(0, 5) || []);
      
    } else {
      throw new Error(voiceSearchResponse.message || 'Voice search failed');
    }

  } catch (error) {
    console.error('❌ Voice Search API error:', error);
    // Handle errors
  } finally {
    setIsLoadingSuggestions(false);
    setIsLoadingResults(false);
  }
}, [apiClient]);
```

### Voice Search Response Format

```json
{
  "success": true,
  "message": "Voice search completed successfully",
  "query": "blue summer dress",
  "resultsCount": 15,
  "data": [
    {
      "id": "item_123",
      "name": "Blue Summer Floral Dress",
      "price": 1299,
      "imageUrl": "https://...",
      "category": "Dresses",
      "brand": "YORAA",
      "inStock": true
    }
    // ... more products
  ],
  "suggestions": [
    "blue dress",
    "summer dress",
    "floral dress"
  ]
}
```

---

## Visual/Camera Search (Planned)

Currently, the mobile app has UI for camera search but the backend endpoint is not fully implemented. The planned flow is:

### Planned Implementation

**Endpoint:** `POST /api/items/visual-search`

**Request:** Multipart form data with image

```javascript
async visualSearchProducts(imageUri) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'search_image.jpg',
  });
  
  return this.request('/items/visual-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
}
```

### UI Flow in Mobile App

1. User taps camera icon
2. Modal opens with options:
   - Take Photo
   - Choose from Library
3. Image is captured/selected
4. Image is uploaded to backend
5. Backend processes image and returns matching products
6. Results are displayed

---

## Barcode Search (Planned)

The barcode scanning feature is planned but not fully implemented. The intended flow:

**Endpoint:** `GET /api/items/barcode/{barcodeValue}`

**Example:**
```
GET http://185.193.19.244:8080/api/items/barcode/1234567890123
```

---

## Search Suggestions

### How Suggestions Work

The app generates search suggestions by:
1. Making a search API call with the partial query
2. Extracting unique values from results:
   - Product names
   - Category names
   - Brand names
3. Returning top 7 unique suggestions

### Suggestion Generation Code

```javascript
const searchProductSuggestions = useCallback(async (query) => {
  try {
    // Get product-based suggestions from the API
    const response = await apiClient.searchProducts(query);
    const products = response.data || response || [];
    
    // Extract unique product names and categories as suggestions
    const suggestions = products.reduce((acc, product) => {
      if (product.name && !acc.includes(product.name.toLowerCase())) {
        acc.push(product.name.toLowerCase());
      }
      if (product.category && !acc.includes(product.category.toLowerCase())) {
        acc.push(product.category.toLowerCase());
      }
      // Also include brand names if available
      if (product.brand && !acc.includes(product.brand.toLowerCase())) {
        acc.push(product.brand.toLowerCase());
      }
      return acc;
    }, []);

    return suggestions.slice(0, 7);
  } catch (error) {
    console.error('🔍 Search suggestions API error:', error);
    return [];
  }
}, [apiClient]);
```

---

## Authentication & Headers

### Request Headers Structure

```javascript
async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (this.token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${this.token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();
  
  return data;
}
```

### Required Headers

**For Authenticated Users:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {userToken}"
}
```

**For Guest Users:**
```javascript
{
  "Content-Type": "application/json",
  "X-Guest-Session-Id": "{guestSessionId}" // Optional
}
```

### Token Management

```javascript
// Initialize and load token from storage
async initialize() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    this.token = token;
    console.log('🔧 API Service initialized', this.token ? 'with token' : 'without token');
  } catch (error) {
    console.error('❌ Error loading token:', error);
  }
}

// Set token after login
async setToken(token, userData = null) {
  this.token = token;
  await AsyncStorage.setItem('userToken', token);
  console.log('🔐 Token set successfully');
}

// Clear token on logout
async clearToken() {
  this.token = null;
  await AsyncStorage.removeItem('userToken');
  console.log('🔓 Token cleared');
}
```

---

## Request/Response Examples

### Example 1: Text Search Request

**Request:**
```http
GET /api/items/search?query=dress HTTP/1.1
Host: 185.193.19.244:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "id": "65f8e9a7b2c1d4e5f6a7b8c9",
      "name": "Elegant Red Evening Dress",
      "description": "Beautiful red dress perfect for parties",
      "price": 2499,
      "discountedPrice": 1999,
      "category": "Dresses",
      "subcategory": "Evening Wear",
      "brand": "YORAA",
      "images": [
        "https://example.com/images/dress1.jpg",
        "https://example.com/images/dress2.jpg"
      ],
      "sizes": [
        {
          "size": "S",
          "inStock": true,
          "quantity": 5
        },
        {
          "size": "M",
          "inStock": true,
          "quantity": 10
        },
        {
          "size": "L",
          "inStock": false,
          "quantity": 0
        }
      ],
      "colors": ["Red", "Maroon"],
      "rating": 4.5,
      "reviewCount": 89,
      "inStock": true,
      "isFeatured": true,
      "isNew": false,
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-20T15:45:00.000Z"
    }
    // ... more products
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

---

### Example 2: Voice Search Request

**Request:**
```http
POST /api/items/voice-search HTTP/1.1
Host: 185.193.19.244:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "query": "blue summer dress",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice search completed successfully",
  "query": "blue summer dress",
  "resultsCount": 15,
  "data": [
    {
      "id": "65f8e9a7b2c1d4e5f6a7b8c9",
      "name": "Blue Summer Floral Dress",
      "price": 1299,
      "discountedPrice": 999,
      "images": ["https://example.com/images/blue-dress.jpg"],
      "inStock": true,
      "rating": 4.7
    }
    // ... more products
  ],
  "suggestions": [
    "blue dress",
    "summer dress",
    "floral dress",
    "light blue",
    "sky blue dress"
  ],
  "searchMetadata": {
    "processedQuery": "blue summer dress",
    "searchTime": "245ms",
    "voiceConfidence": 0.92
  }
}
```

---

### Example 3: Filter Search Request

**Request:**
```http
GET /api/items/filter?category=dresses&minPrice=500&maxPrice=2000&color=blue&sortBy=price&sortOrder=asc&page=1&limit=20 HTTP/1.1
Host: 185.193.19.244:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Filtered products retrieved successfully",
  "data": [
    {
      "id": "65f8e9a7b2c1d4e5f6a7b8c9",
      "name": "Blue Cotton Dress",
      "price": 799,
      "category": "Dresses",
      "colors": ["Blue"],
      "inStock": true
    }
    // ... more products
  ],
  "filters": {
    "applied": {
      "category": "dresses",
      "minPrice": 500,
      "maxPrice": 2000,
      "color": "blue",
      "sortBy": "price",
      "sortOrder": "asc"
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 58,
    "itemsPerPage": 20
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes

| Status Code | Meaning | Handling |
|-------------|---------|----------|
| 200 | Success | Process data normally |
| 400 | Bad Request | Show validation error to user |
| 401 | Unauthorized | Redirect to login |
| 404 | Not Found | Show "No results found" message |
| 500 | Server Error | Show generic error, suggest retry |
| 503 | Service Unavailable | Show maintenance message |

### Mobile App Error Handling

```javascript
try {
  const productResults = await apiClient.searchProducts(query);
  setSearchResults(productResults.data || []);
} catch (error) {
  console.error('❌ Search API error:', error);
  
  let userMessage = "Something went wrong with your search";
  
  if (error.message?.toLowerCase().includes('network')) {
    userMessage = "Please check your internet connection";
  } else if (error.message?.toLowerCase().includes('timeout')) {
    userMessage = "Search is taking too long, please try again";
  } else if (error.status === 404) {
    userMessage = "No products found for your search";
  } else if (error.status >= 500) {
    userMessage = "Our servers are busy, please try again in a moment";
  }
  
  setErrorMessage(userMessage);
  setShowRetryButton(true);
  setSearchResults([]);
}
```

### Timeout Configuration

```javascript
// Voice search has longer timeout (15 seconds)
async voiceSearchProducts(voiceText) {
  const response = await this.request('/items/voice-search', {
    method: 'POST',
    body: JSON.stringify({ query: voiceText }),
    timeout: 15000 // 15 second timeout
  });
  return response;
}
```

---

## Implementation Guide for Web

### Step 1: Create Search API Service

```javascript
// searchService.js

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8001/api'
  : 'http://185.193.19.244:8080/api';

class SearchService {
  constructor() {
    this.token = localStorage.getItem('userToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('userToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('userToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Text Search
  async searchProducts(query) {
    return await this.request(`/items/search?query=${encodeURIComponent(query)}`);
  }

  // Voice Search
  async voiceSearchProducts(query) {
    return await this.request('/items/voice-search', {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Filter Search
  async filterProducts(filters) {
    const queryParams = new URLSearchParams(filters).toString();
    return await this.request(`/items/filter?${queryParams}`);
  }

  // Get Product by ID
  async getProductById(id) {
    return await this.request(`/items/${id}`);
  }
}

export default new SearchService();
```

---

### Step 2: Create React Search Component

```jsx
// SearchComponent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import searchService from './searchService';
import debounce from 'lodash/debounce';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchService.searchProducts(query);
        
        if (response.success) {
          setSearchResults(response.data || []);
          
          // Generate suggestions from results
          const uniqueSuggestions = [];
          response.data?.forEach(product => {
            if (product.name && !uniqueSuggestions.includes(product.name.toLowerCase())) {
              uniqueSuggestions.push(product.name.toLowerCase());
            }
            if (product.category && !uniqueSuggestions.includes(product.category.toLowerCase())) {
              uniqueSuggestions.push(product.category.toLowerCase());
            }
          });
          
          setSuggestions(uniqueSuggestions.slice(0, 7));
        }
      } catch (err) {
        setError('Failed to search products. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms debounce
    []
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search for products..."
        className="search-input"
      />

      {isLoading && <div className="loading">Searching...</div>}
      
      {error && <div className="error">{error}</div>}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        {searchResults.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.images?.[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">
              {product.discountedPrice ? (
                <>
                  <span className="original-price">₹{product.price}</span>
                  <span className="discounted-price">₹{product.discountedPrice}</span>
                </>
              ) : (
                <span>₹{product.price}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {searchResults.length === 0 && searchQuery && !isLoading && (
        <div className="no-results">No products found</div>
      )}
    </div>
  );
};

export default SearchComponent;
```

---

### Step 3: Implement Voice Search (Web)

```jsx
// VoiceSearchComponent.jsx

import React, { useState } from 'react';
import searchService from './searchService';

const VoiceSearchComponent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);

  const startVoiceSearch = () => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started');
    };

    recognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      // If final result, perform search
      if (event.results[current].isFinal) {
        try {
          const response = await searchService.voiceSearchProducts(transcriptText);
          if (response.success) {
            setResults(response.data || []);
          }
        } catch (error) {
          console.error('Voice search error:', error);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };

    recognition.start();
  };

  return (
    <div className="voice-search">
      <button 
        onClick={startVoiceSearch}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        disabled={isListening}
      >
        {isListening ? '🎤 Listening...' : '🎤 Voice Search'}
      </button>

      {transcript && (
        <div className="transcript">
          Searching for: "{transcript}"
        </div>
      )}

      <div className="voice-results">
        {results.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.images?.[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">₹{product.discountedPrice || product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceSearchComponent;
```

---

### Step 4: Implement Advanced Filter Search

```jsx
// FilterSearchComponent.jsx

import React, { useState } from 'react';
import searchService from './searchService';

const FilterSearchComponent = () => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    color: '',
    size: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      // Remove empty filters
      const activeFilters = Object.entries(filters)
        .filter(([_, value]) => value !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      const response = await searchService.filterProducts(activeFilters);
      
      if (response.success) {
        setResults(response.data || []);
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="filter-search">
      <div className="filters">
        <input
          type="text"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Newest First</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>

        <select
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button onClick={applyFilters} disabled={isLoading}>
          {isLoading ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>

      <div className="filter-results">
        {results.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.images?.[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">₹{product.discountedPrice || product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSearchComponent;
```

---

## Best Practices

### 1. **Debouncing**
Always debounce search input to avoid excessive API calls:
```javascript
// Use 300ms debounce delay
const debouncedSearch = debounce(performSearch, 300);
```

### 2. **Error Handling**
Provide user-friendly error messages:
```javascript
const getErrorMessage = (error) => {
  if (error.message?.includes('network')) {
    return 'Please check your internet connection';
  }
  if (error.status === 404) {
    return 'No products found';
  }
  if (error.status >= 500) {
    return 'Server error. Please try again later';
  }
  return 'Something went wrong';
};
```

### 3. **Loading States**
Always show loading indicators during API calls:
```javascript
setIsLoading(true);
try {
  await searchService.searchProducts(query);
} finally {
  setIsLoading(false);
}
```

### 4. **Caching**
Consider caching search results to improve performance:
```javascript
const searchCache = new Map();

const cachedSearch = async (query) => {
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }
  const results = await searchService.searchProducts(query);
  searchCache.set(query, results);
  return results;
};
```

### 5. **URL Encoding**
Always encode search queries:
```javascript
const query = encodeURIComponent(searchText);
```

### 6. **Authentication**
Include auth token for personalized results:
```javascript
headers: {
  'Authorization': `Bearer ${userToken}`
}
```

---

## Performance Optimization

### 1. **Pagination**
Implement pagination for large result sets:
```javascript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await searchService.searchProducts(query, page + 1);
  setResults(prev => [...prev, ...response.data]);
  setPage(prev => prev + 1);
  setHasMore(response.pagination?.hasMore || false);
};
```

### 2. **Lazy Loading Images**
Use lazy loading for product images:
```jsx
<img 
  src={product.images[0]} 
  alt={product.name}
  loading="lazy"
/>
```

### 3. **Infinite Scroll**
Implement infinite scroll for better UX:
```javascript
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (!isLoading && hasMore) {
      loadMore();
    }
  }
};
```

---

## Testing

### Test Cases

1. **Basic Text Search**
   - Search with single keyword
   - Search with multiple keywords
   - Search with special characters
   - Empty search
   
2. **Voice Search**
   - Clear voice input
   - Noisy environment
   - Different accents
   - Long queries
   
3. **Filters**
   - Single filter
   - Multiple filters
   - Price range
   - Sorting options
   
4. **Error Scenarios**
   - Network failure
   - Server error
   - No results
   - Invalid input

### Example Test (Jest + React Testing Library)

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchComponent from './SearchComponent';
import searchService from './searchService';

jest.mock('./searchService');

test('performs search when user types', async () => {
  const mockResults = {
    success: true,
    data: [{ id: '1', name: 'Test Product', price: 100 }]
  };
  
  searchService.searchProducts.mockResolvedValue(mockResults);

  render(<SearchComponent />);
  
  const searchInput = screen.getByPlaceholderText('Search for products...');
  fireEvent.change(searchInput, { target: { value: 'dress' } });

  await waitFor(() => {
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

---

## Summary

The YORAA search functionality is built on a RESTful API architecture with the following key endpoints:

1. **Text Search:** `GET /api/items/search?query={query}`
2. **Voice Search:** `POST /api/items/voice-search`
3. **Filter Search:** `GET /api/items/filter?{params}`

The mobile app implements:
- **300ms debounced** text search
- **Real-time voice search** with speech recognition
- **Smart suggestions** based on product names, categories, and brands
- **Comprehensive error handling** with user-friendly messages
- **Token-based authentication** for personalized results

Web implementation should follow the same patterns with proper:
- Debouncing
- Error handling
- Loading states
- Caching (optional)
- Authentication
- Pagination

---

## Contact & Support

For questions or issues with API integration, contact:
- **Backend Team:** backend@yoraa.com
- **API Documentation:** http://185.193.19.244:8080/api/docs (if available)

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Author:** Mobile Development Team
