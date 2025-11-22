# FAQ API Endpoint Fix - November 20, 2024

## Issue
FAQ screen was showing error: **"API endpoint not found: GET /api/api/faqs"**

Notice the duplicate `/api/api` in the URL path.

## Root Cause
The base URL in `.env.production` already includes the `/api` path:
```
API_BASE_URL=https://api.yoraa.in.net/api
```

But the FAQ methods in `YoraaAPIClient.js` were also adding `/api/` prefix:
```javascript
async getFAQs() {
  return await this.makeRequest('/api/faqs');  // ❌ Creates: /api/api/faqs
}
```

This resulted in:
- Base URL: `https://api.yoraa.in.net/api`
- Endpoint: `/api/faqs`
- **Final URL: `https://api.yoraa.in.net/api/api/faqs`** ❌

## Solution
Removed the `/api` prefix from FAQ endpoints in `YoraaAPIClient.js` since the base URL already includes it.

## Files Modified
- `YoraaAPIClient.js` - Fixed FAQ method endpoints

## Changes Made

### Before (Broken)
```javascript
// FAQ Methods
async getFAQs() {
  return await this.makeRequest('/api/faqs');  // ❌ Duplicate /api
}

async getFAQById(faqId) {
  return await this.makeRequest(`/api/faqs/${faqId}`);  // ❌
}

async getFAQsByCategory(category) {
  return await this.makeRequest(`/api/faqs/category/${category}`);  // ❌
}
```

### After (Fixed)
```javascript
// FAQ Methods
async getFAQs() {
  return await this.makeRequest('/faqs');  // ✅ Correct
}

async getFAQById(faqId) {
  return await this.makeRequest(`/faqs/${faqId}`);  // ✅
}

async getFAQsByCategory(category) {
  return await this.makeRequest(`/faqs/category/${category}`);  // ✅
}
```

## URL Construction
Now the URLs are constructed correctly:
- Base URL: `https://api.yoraa.in.net/api`
- Endpoint: `/faqs`
- **Final URL: `https://api.yoraa.in.net/api/faqs`** ✅

## Testing
1. **Reload the app** (press R twice in emulator)
2. Navigate to FAQ screen
3. FAQs should load successfully from the backend

## Note
- `.env.production` file was NOT changed (kept as is)
- Only the FAQ endpoints in `YoraaAPIClient.js` were fixed
- All other API endpoints that already work correctly were left unchanged

## Date
November 20, 2024
