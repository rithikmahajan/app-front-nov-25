# FAQ API Issue - Backend Team Action Required

**Date:** November 20, 2024  
**Priority:** Medium  
**Component:** FAQ API Endpoints  
**Environment:** Production

---

## Issue Summary

The mobile app is attempting to fetch FAQs from the backend but receiving a **404 Not Found** error.

### Error Details
- **Endpoint Attempted:** `GET /api/faqs`
- **Full URL:** `https://api.yoraa.in.net/api/faqs`
- **HTTP Status:** 404 (Not Found)
- **Error Message:** "API endpoint not found: GET /api/api/faqs" (initially had path duplication)

---

## Frontend Configuration

### Current API Base URL
```
Production: https://api.yoraa.in.net/api
```

### Expected FAQ Endpoints
The mobile app expects the following endpoints to be available:

#### 1. Get All FAQs
```
GET /api/faqs
```

**Expected Response:**
```json
{
  "success": true,
  "faqs": [
    {
      "id": 1,
      "question": "What is Yoraa?",
      "answer": "Yoraa is a fashion platform...",
      "category": "General",
      "order": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Alternative Format (also supported):**
```json
[
  {
    "id": 1,
    "question": "What is Yoraa?",
    "answer": "Yoraa is a fashion platform..."
  }
]
```

#### 2. Get FAQ by ID
```
GET /api/faqs/:id
```

**Example:** `GET /api/faqs/1`

**Expected Response:**
```json
{
  "success": true,
  "faq": {
    "id": 1,
    "question": "What is Yoraa?",
    "answer": "Yoraa is a fashion platform...",
    "category": "General"
  }
}
```

#### 3. Get FAQs by Category
```
GET /api/faqs/category/:category
```

**Example:** `GET /api/faqs/category/Shipping`

**Expected Response:**
```json
{
  "success": true,
  "faqs": [
    {
      "id": 5,
      "question": "How long does shipping take?",
      "answer": "Shipping typically takes 3-5 business days...",
      "category": "Shipping"
    }
  ]
}
```

---

## Frontend Code Implementation

### API Client (YoraaAPIClient.js)
```javascript
// FAQ Methods
async getFAQs() {
  return await this.makeRequest('/faqs');
}

async getFAQById(faqId) {
  return await this.makeRequest(`/faqs/${faqId}`);
}

async getFAQsByCategory(category) {
  return await this.makeRequest(`/faqs/category/${category}`);
}
```

### Usage in FAQ Screen (faq_new.js)
```javascript
import { YoraaAPI } from '../../YoraaAPIClient';

// Fetch all FAQs
const response = await YoraaAPI.getFAQs();

// Fetch FAQs by category
const response = await YoraaAPI.getFAQsByCategory('Shipping');
```

---

## Backend Requirements

### ✅ What We Need from Backend Team

1. **Verify Endpoint Exists**
   - Confirm that `GET /api/faqs` endpoint is implemented
   - Check if it's properly registered in the API routes

2. **Check Route Configuration**
   - Ensure the route is accessible without authentication (if FAQs are public)
   - Or specify if authentication is required

3. **Verify Response Format**
   - Confirm the response structure matches our expected format
   - Send a sample response for testing

4. **Database/Data Check**
   - Verify that FAQs are populated in the database
   - Check if any FAQs have `isActive: true` status

5. **CORS Configuration**
   - Ensure CORS is configured for the domain
   - Check if `https://api.yoraa.in.net` allows the mobile app requests

6. **SSL/HTTPS**
   - Confirm the endpoint is accessible via HTTPS
   - Verify Cloudflare tunnel configuration

---

## Testing Steps for Backend Team

### 1. Direct API Test
```bash
# Test the endpoint directly
curl -X GET https://api.yoraa.in.net/api/faqs \
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "success": true,
  "faqs": [...]
}
```

### 2. Health Check
```bash
# Verify the API is running
curl -X GET https://api.yoraa.in.net/api/health
```

### 3. Check Available Routes
```bash
# If you have a routes listing endpoint
curl -X GET https://api.yoraa.in.net/api/routes
```

---

## Possible Backend Issues to Check

### 1. Route Not Registered
- FAQ routes might not be added to the main router
- Check `routes.js` or equivalent file

### 2. Authentication Middleware
- FAQ endpoint might require authentication when it shouldn't
- Or authentication token format might be incorrect

### 3. Database Connection
- FAQ table might be empty
- Database connection might be failing

### 4. Controller/Handler Issue
- FAQ controller might have errors
- Check server logs for errors

### 5. Typo in Route Path
- Route might be registered as `/api/faq` instead of `/api/faqs`
- Or different spelling variation

### 6. Environment-Specific Issue
- Endpoint might work in development but not production
- Check production environment configuration

---

## Current Workaround

We've temporarily fixed the path duplication issue in the frontend, but the endpoint still needs to exist on the backend.

**Previous Issue (Fixed):**
- Was calling: `/api/api/faqs` ❌
- Now calling: `/api/faqs` ✅

**Current Issue (Needs Backend Fix):**
- Endpoint returns 404
- Backend needs to implement or fix the FAQ endpoints

---

## Additional Information

### Related Backend Endpoints (Working)
These endpoints are currently working, so use them as reference:
- `GET /api/health` ✅
- `POST /api/auth/login` ✅
- `GET /api/products` ✅
- `GET /api/user/profile` ✅

### FAQ Feature Requirements
- FAQs should be publicly accessible (no auth required)
- Support for categories/grouping would be helpful
- Ability to mark FAQs as active/inactive
- Order/priority for display sequence

---

## Contact Information

**Frontend Developer:** [Your Name]  
**Project:** Yoraa Mobile App (iOS & Android)  
**Environment:** Production  
**Base URL:** https://api.yoraa.in.net/api

---

## Backend Team Checklist

Please complete this checklist:

- [ ] Verified `/api/faqs` endpoint exists in code
- [ ] Checked route is registered in main router
- [ ] Tested endpoint with curl/Postman
- [ ] Verified FAQs exist in database
- [ ] Confirmed response format matches specification
- [ ] Checked authentication requirements
- [ ] Reviewed server logs for errors
- [ ] Tested on production environment
- [ ] Provided sample response for testing

---

## Sample FAQ Data (For Testing)

If you need sample data to populate the FAQ table:

```json
[
  {
    "question": "What is Yoraa?",
    "answer": "Yoraa is a premium fashion platform offering curated collections from top designers.",
    "category": "General",
    "order": 1,
    "isActive": true
  },
  {
    "question": "How do I place an order?",
    "answer": "Browse products, add items to cart, proceed to checkout, and complete payment.",
    "category": "Orders",
    "order": 2,
    "isActive": true
  },
  {
    "question": "What payment methods are accepted?",
    "answer": "We accept credit cards, debit cards, UPI, net banking, and Razorpay.",
    "category": "Payment",
    "order": 3,
    "isActive": true
  },
  {
    "question": "How long does shipping take?",
    "answer": "Standard shipping takes 3-5 business days. Express shipping is 1-2 days.",
    "category": "Shipping",
    "order": 4,
    "isActive": true
  },
  {
    "question": "What is the return policy?",
    "answer": "Items can be returned within 7 days of delivery in original condition.",
    "category": "Returns",
    "order": 5,
    "isActive": true
  }
]
```

---

## Expected Timeline

Please provide an estimate for when this can be resolved:
- [ ] **Urgent** (Within 24 hours)
- [ ] **High Priority** (Within 3 days)
- [ ] **Medium Priority** (Within 1 week)
- [ ] **Low Priority** (Within 2 weeks)

---

## Notes

- The FAQ screen is already implemented in the mobile app
- Frontend is ready to consume the API as soon as it's available
- Error handling and loading states are already implemented
- Pull-to-refresh functionality is ready

**Once the backend endpoints are ready, the FAQ feature will work immediately without any frontend changes required.**

---

## Questions?

If you need any clarification or have questions about the expected format, please reach out to the frontend team.

Thank you! 🙏
