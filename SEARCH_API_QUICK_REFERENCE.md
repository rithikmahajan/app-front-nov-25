# Search API Quick Reference

## 🚀 Quick Start

### Base URLs
- **Development:** `http://localhost:8001/api`
- **Production:** `http://185.193.19.244:8080/api`

---

## 📡 API Endpoints Summary

### 1. Text Search
```
GET /items/search?query={searchQuery}
```

**Example:**
```javascript
fetch('http://185.193.19.244:8080/api/items/search?query=dress')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### 2. Voice Search
```
POST /items/voice-search
```

**Example:**
```javascript
fetch('http://185.193.19.244:8080/api/items/voice-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    query: 'blue summer dress',
    timestamp: new Date().toISOString()
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### 3. Filter Search
```
GET /items/filter?category={cat}&minPrice={min}&maxPrice={max}&sortBy={field}&sortOrder={order}
```

**Example:**
```javascript
const params = new URLSearchParams({
  category: 'dresses',
  minPrice: 500,
  maxPrice: 2000,
  sortBy: 'price',
  sortOrder: 'asc',
  page: 1,
  limit: 20
});

fetch(`http://185.193.19.244:8080/api/items/filter?${params}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### 4. Search by Name
```
GET /items/search/name?query={productName}
```

**Example:**
```javascript
fetch('http://185.193.19.244:8080/api/items/search/name?query=saree')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🔑 Authentication

### Headers for Authenticated Requests
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_USER_TOKEN'
}
```

### Headers for Guest Requests
```javascript
headers: {
  'Content-Type': 'application/json'
}
```

---

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "price": 1299,
      "discountedPrice": 999,
      "images": ["url1", "url2"],
      "category": "Category",
      "brand": "Brand",
      "inStock": true,
      "rating": 4.5,
      "reviewCount": 89
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional info"
  }
}
```

---

## 🛠️ Implementation Tips

### 1. Debounce Search Input (300ms)
```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

### 2. URL Encode Search Query
```javascript
const query = encodeURIComponent(searchText);
```

### 3. Handle Loading States
```javascript
setIsLoading(true);
try {
  const results = await searchAPI(query);
  setResults(results);
} catch (error) {
  setError(error.message);
} finally {
  setIsLoading(false);
}
```

### 4. Error Handling
```javascript
if (error.status === 404) {
  showMessage('No products found');
} else if (error.status >= 500) {
  showMessage('Server error. Please try again');
} else if (error.message.includes('network')) {
  showMessage('Check your internet connection');
}
```

---

## 🔍 Available Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | string | Search keyword | `dress` |
| `category` | string | Category name/ID | `dresses` |
| `subcategory` | string | Subcategory | `evening-wear` |
| `minPrice` | number | Minimum price | `500` |
| `maxPrice` | number | Maximum price | `2000` |
| `color` | string | Color filter | `blue` |
| `size` | string | Size filter | `M` |
| `brand` | string | Brand name | `YORAA` |
| `inStock` | boolean | Only in-stock items | `true` |
| `sortBy` | string | Sort field | `price`, `createdAt`, `rating` |
| `sortOrder` | string | Sort direction | `asc`, `desc` |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page | `20` |

---

## 📱 Mobile App Implementation Reference

### Text Search
```javascript
// File: src/services/yoraaBackendAPI.js
async searchProducts(query) {
  return this.request(`/items/search?query=${encodeURIComponent(query)}`);
}
```

### Voice Search
```javascript
// File: src/services/yoraaBackendAPI.js
async voiceSearchProducts(voiceText) {
  return this.request('/items/voice-search', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      query: voiceText,
      timestamp: new Date().toISOString()
    }),
    timeout: 15000
  });
}
```

### Filter Search
```javascript
// File: src/services/yoraaBackendAPI.js
async filterProducts(filters) {
  const queryParams = new URLSearchParams(filters);
  return this.request(`/items/filter?${queryParams}`);
}
```

---

## 🎯 Common Use Cases

### 1. Simple Product Search
```javascript
const results = await fetch(
  'http://185.193.19.244:8080/api/items/search?query=red dress'
).then(r => r.json());
```

### 2. Search with Price Range
```javascript
const results = await fetch(
  'http://185.193.19.244:8080/api/items/filter?query=dress&minPrice=500&maxPrice=2000'
).then(r => r.json());
```

### 3. Search and Sort
```javascript
const results = await fetch(
  'http://185.193.19.244:8080/api/items/search?query=dress&sortBy=price&sortOrder=asc'
).then(r => r.json());
```

### 4. Category Filter
```javascript
const results = await fetch(
  'http://185.193.19.244:8080/api/items/filter?category=dresses&inStock=true'
).then(r => r.json());
```

---

## ⚡ Performance Tips

1. **Use Debouncing:** 300ms delay for text search
2. **Implement Caching:** Cache search results locally
3. **Lazy Load Images:** Use lazy loading for product images
4. **Pagination:** Load results in batches (20 items per page)
5. **Optimize Filters:** Send only active filters to API

---

## 🔗 Related Documentation

- **Full Documentation:** `SEARCH_FUNCTIONALITY_API_DOCUMENTATION.md`
- **Wishlist API:** `WISHLIST_API_DOCUMENTATION.md`
- **Cart API:** `CART_API_DOCUMENTATION.md`
- **Backend Handoff:** `md/BACKEND_HANDOFF.md`

---

## 📞 Support

For API issues or questions:
- Review full documentation in `SEARCH_FUNCTIONALITY_API_DOCUMENTATION.md`
- Check backend logs for detailed error information
- Contact backend team for API changes or new features

---

**Last Updated:** October 21, 2025
