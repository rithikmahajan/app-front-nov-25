# 🔧 LOCAL BACKEND SETUP GUIDE

**Date**: October 14, 2025  
**Purpose**: Connect React Native app to local backend for debugging checkout issues  
**Status**: ✅ Environment configured for localhost:8001

---

## 🎯 QUICK START

### 1. Switch to Development Environment

```bash
# Already done! Current environment:
# API_BASE_URL=http://localhost:8001/api
# RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
```

### 2. Start Your Local Backend

```bash
# Navigate to backend directory
cd /path/to/your/backend

# Install dependencies (if not already done)
npm install

# Start backend on port 8001
PORT=8001 npm start

# OR if using different start command:
npm run dev
```

**CRITICAL**: Your backend MUST run on port **8001** (not 8000, not 8080)

### 3. Restart React Native App

```bash
# In your frontend directory
npm start -- --reset-cache

# In another terminal, run iOS:
npx react-native run-ios
```

---

## 📁 ENVIRONMENT FILES

### Development (.env.development) - ACTIVE
```bash
API_BASE_URL=http://localhost:8001/api
BACKEND_URL=http://localhost:8001/api
APP_ENV=development
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV  # Live key for testing
```

### Production (.env.production)
```bash
API_BASE_URL=http://185.193.19.244:8000/api
BACKEND_URL=http://185.193.19.244:8000/api
APP_ENV=production
RAZORPAY_KEY_ID=rzp_live_VRU7ggfYLI7DWV
```

---

## 🔄 SWITCHING ENVIRONMENTS

### Method 1: Using Script
```bash
./switch-env.sh
# Select option 1 for Development
# Select option 2 for Production
```

### Method 2: Manual
```bash
# Switch to Development (localhost)
cp .env.development .env

# Switch to Production (remote server)
cp .env.production .env

# Always restart Metro after switching:
npm start -- --reset-cache
```

---

## ✅ VERIFICATION CHECKLIST

### Backend Setup
- [ ] Backend code cloned/pulled latest
- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB running (local or remote)
- [ ] Backend started on **port 8001**
- [ ] Can access http://localhost:8001/api/health (or similar endpoint)

### Frontend Setup
- [ ] .env file copied from .env.development
- [ ] Metro bundler restarted with cache clear
- [ ] App running on iOS Simulator
- [ ] Console shows "DEVELOPMENT" environment logs

### Expected Console Output
```javascript
🌍 Environment: DEVELOPMENT
📍 API URL: http://localhost:8001/api
🔑 Razorpay: LIVE (rzp_live_VRU7ggfYLI7DWV)
```

---

## 🐛 TESTING CHECKOUT FLOW

### 1. Add Products to Cart
- Add product: 68da56fc0561b958f6694e1d (Product 36)
- Add product: 68da56fc0561b958f6694e19 (Product 34)

### 2. Proceed to Checkout
- Click "Checkout" button
- Fill in address details
- Click "Pay Now"

### 3. Watch Console Logs

**Frontend logs to watch for:**
```javascript
🛒 Processing complete order...
📦 Original bagItems: [...]
🔄 Calling orderService.createOrder...
✅ Order created successfully: { id: 'order_...', amount: 1752 }
🚀 About to call RazorpayCheckout.open()...
```

**Backend logs to watch for:**
```javascript
POST /api/razorpay/create-order
🔍 Product IDs to validate: [ '68da56fc0561b958f6694e1d', '68da56fc0561b958f6694e19' ]
✅ Converted 2 IDs to ObjectId
✅ Found 2 valid products in database
✅ All products validated successfully
✅ Razorpay order created: order_NabcdefghijkL
```

---

## ❌ TROUBLESHOOTING

### Issue: "Network request failed"
**Cause**: Backend not running or wrong port  
**Fix**: 
```bash
# Check if backend is running:
curl http://localhost:8001/api/health

# If 404 or connection refused:
cd /path/to/backend
PORT=8001 npm start
```

### Issue: "Invalid item IDs" still occurs
**Cause**: Backend doesn't have ObjectId conversion fix  
**Fix**: Apply the fix from URGENT_BACKEND_FIX_NOT_APPLIED.md

### Issue: App still connects to production
**Cause**: Metro cache not cleared  
**Fix**:
```bash
# Stop Metro (Ctrl+C)
npm start -- --reset-cache
# Rebuild app:
npx react-native run-ios
```

### Issue: "Port 8001 already in use"
**Cause**: Something else running on port 8001  
**Fix**:
```bash
# Find what's using port 8001:
lsof -i :8001

# Kill the process:
kill -9 <PID>

# Or use a different port and update .env:
# API_BASE_URL=http://localhost:8002/api
```

---

## 🎯 WHY LOCALHOST DEBUGGING?

### Advantages
✅ **Instant feedback** - No deployment delays  
✅ **Full control** - Add console.logs, breakpoints  
✅ **Fast iteration** - Change code, restart, test  
✅ **Safe testing** - No production impact  
✅ **Better errors** - See full stack traces  

### The Problem We're Solving
The production backend (http://185.193.19.244:8000) returns:
```json
{
  "error": "Invalid item IDs"
}
```

Backend team claims they fixed it, but error persists. By running locally:
1. We can verify if the fix code actually works
2. We can add debug logs to see what's happening
3. We can test the fix before deploying to production

---

## 🔧 BACKEND FIX TO APPLY

If your local backend doesn't have the ObjectId conversion fix, add this:

```javascript
// File: src/controllers/paymentController/paymentController.js
const mongoose = require('mongoose');

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { cart, amount, staticAddress, userId } = req.body;
    
    console.log('🛒 Creating Razorpay order...');
    console.log('📦 Cart items:', cart.length);
    
    // CRITICAL FIX: Convert string IDs to ObjectId
    const productIds = cart.map(item => item.id || item._id);
    console.log('🔍 Product IDs to validate:', productIds);
    
    const objectIds = productIds.map(id => {
      try {
        return mongoose.Types.ObjectId(id);
      } catch (err) {
        console.error(`❌ Invalid ObjectId format: ${id}`);
        return null;
      }
    }).filter(id => id !== null);
    
    console.log(`✅ Converted ${objectIds.length} IDs to ObjectId`);
    
    // Query products with ObjectId
    const products = await Item.find({
      _id: { $in: objectIds },
      status: { $in: ['live', 'active', 'published'] }
    });
    
    console.log(`✅ Found ${products.length} valid products in database`);
    
    // Validate all products found
    if (products.length !== objectIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      
      console.error('❌ Missing products:', missingIds);
      
      return res.status(400).json({
        statusCode: 400,
        success: false,
        error: 'Some products are not available',
        missingIds: missingIds,
        message: `${missingIds.length} product(s) not found or unavailable`
      });
    }
    
    console.log('✅ All products validated successfully');
    
    // Continue with Razorpay order creation...
    // (rest of your code)
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};
```

---

## 📊 EXPECTED RESULTS

### ✅ Success Flow
```
User clicks "Pay Now"
  ↓
Frontend: Creating order...
  ↓
Backend: Validating products... (with ObjectId conversion)
  ↓
Backend: All products found ✅
  ↓
Backend: Creating Razorpay order...
  ↓
Backend: Returns { orderId: "order_...", amount: 175200 }
  ↓
Frontend: Opens Razorpay checkout modal
  ↓
User completes payment
  ↓
Success! 🎉
```

### ❌ Current Flow (Production)
```
User clicks "Pay Now"
  ↓
Frontend: Creating order...
  ↓
Backend: Validating products... (NO ObjectId conversion)
  ↓
Backend: 0 products found ❌
  ↓
Backend: Returns { error: "Invalid item IDs" }
  ↓
Frontend: Error - Payment failed
  ↓
User sees error ❌
```

---

## 🚀 NEXT STEPS

1. **Start your local backend on port 8001**
2. **Restart React Native app** (Metro cache cleared)
3. **Test checkout flow** with products 68da56fc0561b958f6694e1d and 68da56fc0561b958f6694e19
4. **Watch console logs** on both frontend and backend
5. **Verify ObjectId conversion** is working
6. **Once verified working**, deploy to production server

---

## 📝 NOTES

- **Razorpay Key**: Using LIVE key (rzp_live_VRU7ggfYLI7DWV) even in development for consistency
- **Port 8001**: Chosen to avoid conflicts with common ports (8000, 8080, 3000)
- **Environment Detection**: App uses `__DEV__` flag + `APP_ENV` from .env
- **Cache Important**: Always clear Metro cache when switching environments

---

## 🔗 RELATED DOCUMENTS

- **URGENT_BACKEND_FIX_NOT_APPLIED.md** - Details of the backend bug
- **BACKEND_DEPLOYMENT_VERIFICATION.md** - How to verify production deployment
- **RAZORPAY_BAG_FIX_SUMMARY.md** - Frontend Razorpay implementation details

---

**STATUS**: 🟢 **Environment Configured - Ready for Local Testing**

**WAITING FOR**: Backend to start on localhost:8001

**NEXT ACTION**: Start local backend and test checkout flow
