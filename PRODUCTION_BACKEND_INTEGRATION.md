# 🚀 Production Backend Integration - Complete Guide

## ✅ Configuration Updated!

Your React Native app is now configured to use the production backend deployed on Contabo.

---

## 📊 Current Configuration

### **Development Mode** (`__DEV__ = true`)
- **iOS Simulator:** `http://localhost:8080/api`
- **Android Emulator:** `http://10.0.2.2:8080/api`

### **Production Mode** (`__DEV__ = false`)
- **All Platforms:** `http://185.193.19.244:8080/api`

### **Backend Health Check**
```
http://185.193.19.244:8080/health
```

---

## 🔧 Files Updated

1. ✅ `/src/config/apiConfig.js` - Updated production URL
2. ✅ `/src/config/environment.js` - Updated backend URL
3. ✅ `/src/services/apiService.js` - Already configured to use API_CONFIG

---

## 🧪 Testing the Integration

### **1. Test Health Endpoint**
Run the included test script:

```bash
node test-production-api.js
```

### **2. Manual Testing Steps**

#### **A. Health Check**
```bash
curl http://185.193.19.244:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-10-11T17:44:58.000Z",
  "memory": { ... }
}
```

#### **B. Test Categories Endpoint**
```bash
curl http://185.193.19.244:8080/api/categories
```

#### **C. Test Authentication**
```bash
curl -X POST http://185.193.19.244:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📱 Using the API in Your App

### **Example: Login Function**

```javascript
import apiService from '../services/apiService';

export const loginUser = async (email, password) => {
  try {
    const response = await apiService.post('/auth/login', {
      email,
      password,
    });
    
    // Store the token
    await AsyncStorage.setItem('userToken', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### **Example: Firebase Login**

```javascript
export const loginWithFirebase = async (idToken) => {
  try {
    const response = await apiService.post('/auth/loginFirebase', {
      idToken,
    });
    
    await AsyncStorage.setItem('userToken', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Firebase login failed:', error);
    throw error;
  }
};
```

### **Example: Get Products**

```javascript
export const getProducts = async (filters = {}) => {
  try {
    const response = await apiService.get('/products', {
      params: filters,
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};
```

### **Example: Add to Cart**

```javascript
export const addToCart = async (productId, quantity, variantId) => {
  try {
    const response = await apiService.post('/cart/add', {
      productId,
      quantity,
      variantId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
};
```

---

## 🔌 Available API Endpoints

### **Authentication**
```javascript
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/loginFirebase
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp
POST   /api/auth/link-account
```

### **User Profile**
```javascript
GET    /api/profile
PUT    /api/profile
DELETE /api/profile
GET    /api/profile/orders
GET    /api/profile/addresses
POST   /api/profile/addresses
PUT    /api/profile/addresses/:id
DELETE /api/profile/addresses/:id
```

### **Products & Categories**
```javascript
GET    /api/categories
GET    /api/categories/:id
GET    /api/products
GET    /api/products/:id
GET    /api/products/search
GET    /api/products/featured
GET    /api/products/new
```

### **Cart Operations**
```javascript
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/:itemId
DELETE /api/cart/:itemId
DELETE /api/cart
```

### **Orders**
```javascript
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/cancel
GET    /api/orders/:id/track
```

### **Wishlist**
```javascript
GET    /api/wishlist
POST   /api/wishlist/add
DELETE /api/wishlist/:productId
```

### **Reviews**
```javascript
POST   /api/products/:id/reviews
GET    /api/products/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

---

## 🚨 Error Handling

The `apiService.js` already includes comprehensive error handling:

### **401 Unauthorized**
- Automatically clears auth token
- Triggers token refresh if available
- Redirects to login if needed

### **Network Errors**
- Logs detailed error information
- Returns user-friendly error messages
- Includes retry logic for failed requests

### **Timeout Errors**
- 30 second timeout configured
- Automatically retries on timeout

---

## 🔒 Security Best Practices

### **1. Token Storage**
- Tokens are stored in `AsyncStorage` with key `userToken`
- Automatically included in all authenticated requests
- Cleared on logout or 401 responses

### **2. Request Interceptors**
The app includes request interceptors that:
- Add auth token to all requests
- Log request details in development
- Handle token refresh automatically

### **3. Response Interceptors**
Response interceptors handle:
- Token expiration
- Network errors
- Server errors
- Retry logic

---

## 🔄 Switching Between Dev and Production

### **For Development Testing**
To test with local backend during development:

```javascript
// In src/config/apiConfig.js
if (__DEV__) {
  return {
    BASE_URL: `http://localhost:8080/api`, // or your local backend
  };
}
```

### **For Production Testing**
To test production backend in development mode:

```javascript
// In src/config/apiConfig.js
const FORCE_PRODUCTION = true; // Set to true to always use production

if (__DEV__ && !FORCE_PRODUCTION) {
  // Development config
} else {
  // Production config
}
```

---

## 📊 Monitoring & Debugging

### **Enable Debug Logging**
The app includes environment-aware logging. To see detailed logs:

```javascript
// Check logs in Metro bundler
// All API requests/responses are logged in development mode
```

### **Check Backend Status**
```bash
# Health check
curl http://185.193.19.244:8080/health

# Test specific endpoint
curl http://185.193.19.244:8080/api/categories
```

### **Common Issues**

#### **Issue: Cannot connect to API**
**Solutions:**
1. Check backend status: `curl http://185.193.19.244:8080/health`
2. Verify network connectivity
3. Check if running on real device (not simulator) and using correct URL
4. Ensure firewall/network allows port 8080

#### **Issue: 401 Unauthorized**
**Solutions:**
1. Check if token is stored: `AsyncStorage.getItem('userToken')`
2. Verify token is valid
3. Re-login to get new token

#### **Issue: CORS errors**
**Solution:**
Backend already has CORS enabled. Should not be an issue for mobile apps.

---

## ✅ Integration Checklist

- [x] Update API configuration files
- [x] Configure environment for dev/prod
- [ ] Test health endpoint
- [ ] Test authentication endpoints
- [ ] Test product listing
- [ ] Test cart operations
- [ ] Test order placement
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test error handling
- [ ] Test token refresh
- [ ] Test offline behavior
- [ ] Update environment variables for production build

---

## 🚀 Quick Test Commands

### **Test Health Endpoint**
```bash
curl http://185.193.19.244:8080/health
```

### **Test Categories**
```bash
curl http://185.193.19.244:8080/api/categories
```

### **Test Login**
```bash
curl -X POST http://185.193.19.244:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### **Run Automated Test Script**
```bash
node test-production-api.js
```

---

## 📞 Support

### **Backend Issues**
- Server IP: `185.193.19.244`
- Health Check: `http://185.193.19.244:8080/health`
- Contact: contact@yoraa.in

### **API Documentation**
- Base URL: `http://185.193.19.244:8080/api`
- All endpoints documented in this guide

---

## 🎯 Next Steps

1. **Run the test script** to verify connectivity:
   ```bash
   node test-production-api.js
   ```

2. **Test authentication** in your app:
   - Try logging in with existing account
   - Try Firebase authentication (Google/Apple/Phone)

3. **Test core features**:
   - Browse products
   - Add to cart
   - Place order

4. **Monitor for issues**:
   - Check app logs
   - Test on different networks
   - Test on physical devices

---

**Configuration Updated:** October 11, 2025  
**Backend Version:** Production v1.0  
**Status:** ✅ Ready for Integration  
**Deployment:** Docker on Contabo VPS

🎉 **Your app is now connected to production backend!**
