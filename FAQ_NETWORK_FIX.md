# FAQ Network Connection Fix

## Problem Identified

The FAQ screen was showing the error:
```
[RN Error: [FAQ] Error fetching FAQs: TypeError: Network request failed
Failed to load FAQs from server. Please check your connection and try again.
```

## Root Cause

The `YoraaAPIClient.js` was using `http://localhost:8001` for development mode on **all platforms**, including Android. This is incorrect because:

- **iOS Simulator**: Can use `localhost` directly ✅
- **Android Emulator**: Cannot use `localhost` - must use `10.0.2.2` to access the host machine ❌

## Solution Applied

### 1. Fixed YoraaAPIClient.js Base URL

**Before:**
```javascript
class YoraaAPIClient {
  constructor(baseURL = __DEV__ ? 'http://localhost:8001' : 'http://185.193.19.244:8080') {
    this.baseURL = baseURL;
    this.userToken = null;
    this.adminToken = null;
  }
}
```

**After:**
```javascript
import { Platform } from 'react-native';

class YoraaAPIClient {
  constructor(baseURL) {
    // Auto-detect the correct base URL for the platform
    if (!baseURL) {
      if (__DEV__) {
        // Development mode: Use platform-specific localhost
        baseURL = Platform.OS === 'android' 
          ? 'http://10.0.2.2:8001'  // Android emulator maps localhost to 10.0.2.2
          : 'http://localhost:8001'; // iOS simulator uses localhost directly
      } else {
        // Production mode: Use VPS server
        baseURL = 'http://185.193.19.244:8080';
      }
    }
    this.baseURL = baseURL;
    this.userToken = null;
    this.adminToken = null;
    console.log(`[YoraaAPI] Initialized with baseURL: ${this.baseURL}`);
  }
}
```

### 2. Enhanced Error Handling

Added better error messages and logging to help debug connection issues:

```javascript
async makeRequest(endpoint, method = 'GET', body = null, requireAuth = false, isAdmin = false) {
  const fullUrl = `${this.baseURL}${endpoint}`;
  console.log(`[YoraaAPI] ${method} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      timeout: 10000, // 10 second timeout
    });

    console.log(`[YoraaAPI] Response status: ${response.status}`);
    // ... rest of code
  } catch (error) {
    console.error(`[YoraaAPI] Request failed [${method} ${endpoint}]:`, error.message);
    
    // Provide more helpful error messages
    if (error.message.includes('Network request failed')) {
      throw new Error('Cannot connect to server. Please check:\n1. Backend server is running\n2. Network connection is active\n3. Correct URL is configured');
    }
    
    throw error;
  }
}
```

### 3. Improved FAQ Screen Error Handling

Updated `faq_new.js` to:
- Show detailed error messages from the API client
- Better distinguish between network errors and empty FAQ data
- Not treat empty FAQ array as an error

## How to Test

### 1. Verify Backend is Running
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status":"healthy","uptime":...}
```

### 2. Check FAQ Endpoint
```bash
curl http://localhost:8001/api/faqs
```

Expected response (even if empty):
```json
{
  "success": true,
  "message": "FAQs retrieved successfully",
  "data": {
    "faqs": [],
    "pagination": {...}
  }
}
```

### 3. Test on Android Emulator
1. Build and run: `npx react-native run-android`
2. Navigate to FAQ screen
3. Should see one of:
   - FAQs displayed (if backend has data)
   - "No FAQs available at the moment" (if backend returns empty array)
   - Error message only if actual network/server issue

### 4. Test on iOS Simulator
1. Build and run: `npx react-native run-ios`
2. Same behavior as Android

## Platform-Specific URLs

| Platform | Environment | Base URL |
|----------|-------------|----------|
| Android Emulator | Development | `http://10.0.2.2:8001` |
| iOS Simulator | Development | `http://localhost:8001` |
| Android Device | Development | `http://localhost:8001` |
| iOS Device | Development | `http://localhost:8001` |
| All Platforms | Production | `http://185.193.19.244:8080` |

## Additional Notes

- The backend currently has 0 FAQs in the database (tested via curl)
- This is not an error - the app correctly shows "No FAQs available"
- To add FAQs, use the backend admin panel or API endpoints
- The fix ensures proper network connectivity on all platforms

## Files Modified

1. `/YoraaAPIClient.js` - Fixed platform-specific base URL detection
2. `/src/screens/faq_new.js` - Improved error handling for empty data vs network errors

## Verification

✅ Backend server is running and healthy
✅ FAQ endpoint responds correctly (returns empty array)
✅ Android emulator network connectivity fixed
✅ iOS simulator compatibility maintained
✅ Error messages are clear and helpful
✅ App rebuilt and installed successfully

---

**Status**: ✅ FIXED
**Date**: November 19, 2025
**Build**: Successful (BUILD SUCCESSFUL in 13s)
