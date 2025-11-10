# 🎯 Order Creation Quick Reference
**Backend Integration - Ready to Use**

---

## 📱 Complete Order Flow (Copy-Paste Ready)

### Step 1: Generate OTP
```javascript
const response = await fetch('http://185.193.19.244:8000/api/auth/generate-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '7006114695' })
});
const { data } = await response.json();
console.log('OTP:', data.otp);
```

### Step 2: Verify OTP & Get Token
```javascript
const response = await fetch('http://185.193.19.244:8000/api/auth/verifyOtp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '7006114695', otp: '123456' })
});
const { data } = await response.json();
const token = data.token;
await AsyncStorage.setItem('userToken', token);
```

### Step 3: Create Order
```javascript
const response = await fetch('http://185.193.19.244:8000/api/razorpay/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 1142,
    cart: [{
      itemId: '68da56fc0561b958f6694e39',
      name: 'Product 50',
      quantity: 1,
      price: 1142,
      size: 'M'
    }],
    staticAddress: {
      firstName: 'Rithik',
      lastName: 'Mahajan',
      email: 'rithik@yoraa.in',
      phoneNumber: '7006114695',
      address: '123 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001'
    }
  })
});
const orderData = await response.json();
console.log('Order ID:', orderData.id);
```

### Step 4: Process Payment
```javascript
import RazorpayCheckout from 'react-native-razorpay';

const paymentData = await RazorpayCheckout.open({
  key: 'rzp_live_VRU7ggfYLI7DWV',
  amount: orderData.amount_paise,
  currency: 'INR',
  name: 'Yoraa Apparels',
  order_id: orderData.id,
  prefill: {
    email: 'rithik@yoraa.in',
    contact: '7006114695',
    name: 'Rithik Mahajan'
  },
  theme: { color: '#F37254' }
});
```

### Step 5: Verify Payment (⚠️ CORRECTED STRUCTURE)
```javascript
const response = await fetch('http://185.193.19.244:8000/api/razorpay/verify-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    orderDetails: {  // ✅ Nested structure
      items: [{
        productId: '68da56fc0561b958f6694e39',
        name: 'Product 50',
        quantity: 1,
        price: 1142,
        size: 'M',
        color: 'Blue'
      }],
      shippingAddress: {
        name: 'Rithik Mahajan',
        phone: '7006114695',
        email: 'rithik@yoraa.in',
        addressLine1: '123 Test Street',
        addressLine2: '',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      totalAmount: 1142
    }
  })
});
const result = await response.json();
console.log('Order ID:', result.orderId);
console.log('Shiprocket:', result.shiprocketOrderId);
```

---

## 🔑 Quick Config

```javascript
// API
const API_BASE_URL = 'http://185.193.19.244:8000/api';

// Razorpay
const RAZORPAY_KEY = 'rzp_live_VRU7ggfYLI7DWV';

// Shiprocket (Auto-created by backend)
const SHIPROCKET_EMAIL = 'support@yoraa.in';
const SHIPROCKET_PASSWORD = 'R@0621thik';
```

---

## ✅ Required Fields

### Cart Item:
```javascript
{
  itemId: string,      // Product MongoDB ID
  name: string,        // Product name
  quantity: number,    // Quantity
  price: number,       // Price per unit
  size: string,        // Size/variant
  color: string        // Color (optional)
}
```

### Address:
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  address: string,
  city: string,
  state: string,
  pinCode: string
}
```

---

## 🚨 Common Errors

### 401 Unauthorized
```javascript
// Fix: Add token to headers
headers: { 'Authorization': `Bearer ${token}` }
```

### Invalid item IDs
```javascript
// Fix: Ensure itemId is valid MongoDB ObjectId
itemId: '68da56fc0561b958f6694e39'  // 24-char hex
```

### Payment verification failed
```javascript
// Fix: Use nested orderDetails structure (see Step 5)
orderDetails: { items: [...], shippingAddress: {...}, totalAmount: 1142 }
```

---

## 🧪 Test Commands

```javascript
// Quick test
import { quickTest } from './src/utils/orderFlowTest';
quickTest();

// Step-by-step test
import { testGenerateOTP, testVerifyOTP, testCreateOrder } from './src/utils/orderFlowTest';

const { otp, phoneNumber } = await testGenerateOTP('7006114695');
const { token } = await testVerifyOTP(phoneNumber, otp);
const { order } = await testCreateOrder(token);
```

---

## 📊 Success Response

```javascript
// Order Creation
{
  id: "order_RTIgoWnw8VvBlV",
  amount: 1142,
  amount_paise: 114200,
  currency: "INR",
  database_order_id: "68ee150cc9b73544b20be90f"
}

// Payment Verification
{
  success: true,
  orderId: "68ee150cc9b73544b20be90f",
  shiprocketOrderId: 12345678,
  awb_code: "YORAA123456",
  courier_name: "Delhivery"
}
```

---

## 🔍 Debug Checklist

- [ ] Token stored in AsyncStorage as 'userToken'
- [ ] Authorization header includes "Bearer " prefix
- [ ] Cart items have 'itemId' field (not just 'id')
- [ ] Payment verification uses nested 'orderDetails'
- [ ] Backend URL is correct (port 8000)
- [ ] Razorpay key is live key (not test)

---

**Test Phone:** 7006114695  
**Backend:** http://185.193.19.244:8000/api  
**Shiprocket:** Auto-created ✅
