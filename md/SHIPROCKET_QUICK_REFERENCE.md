# 🎯 Shiprocket Quick Reference - YORAA

**Last Updated:** October 14, 2025

---

## 🔐 Credentials Reference

### 📱 Dashboard Login (Web Only)
```
Email: contact@yoraa.in
Password: R@2727thik
Purpose: Login to https://app.shiprocket.in
```

### 🔧 API Integration (Backend Code)
```
Email: support@yoraa.in
Password: R@0621thik
Purpose: All API operations (order creation, tracking)
Company ID: 5783639
```

---

## ⚠️ CRITICAL RULES

### ✅ DO:
- Use `support@yoraa.in` for ALL backend code
- Use `support@yoraa.in` for ALL API requests
- Use `contact@yoraa.in` ONLY for web dashboard login

### ❌ DON'T:
- Don't use `contact@yoraa.in` in backend code
- Don't use `contact@yoraa.in` for API requests
- Don't hardcode credentials (use environment variables)

---

## 🚀 Quick Integration

### 1. Backend .env File
```env
SHIPROCKET_API_USER_EMAIL=support@yoraa.in
SHIPROCKET_API_USER_PASSWORD=R@0621thik
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_COMPANY_ID=5783639
```

### 2. Authentication Code
```javascript
const axios = require('axios');

async function getToken() {
  const response = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      email: 'support@yoraa.in',
      password: 'R@0621thik'
    }
  );
  return response.data.token;
}
```

### 3. Create Order
```javascript
const token = await getToken();

const order = await axios.post(
  'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
  orderData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 📊 Order Flow

```
Payment Success
    ↓
Get Shiprocket Token (support@yoraa.in)
    ↓
Create Order in Shiprocket
    ↓
Get Available Couriers
    ↓
Select Best Courier
    ↓
Generate AWB (tracking code)
    ↓
Save AWB to Database
    ↓
Show Tracking to Customer
```

---

## 🔗 Important URLs

**Shiprocket Dashboard:**
https://app.shiprocket.in

**API Documentation:**
https://apidocs.shiprocket.in

**Track Shipment:**
https://shiprocket.co/tracking/[AWB_CODE]

**Login Endpoint:**
POST https://apiv2.shiprocket.in/v1/external/auth/login

**Create Order Endpoint:**
POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc

**Track by AWB:**
GET https://apiv2.shiprocket.in/v1/external/courier/track/awb/{awb_code}

---

## 🧪 Testing

### Test Authentication
```bash
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@yoraa.in",
    "password": "R@0621thik"
  }'
```

Expected Response:
```json
{
  "token": "eyJ0eXAiOiJKV1Qi...",
  "id": 123456,
  "email": "support@yoraa.in"
}
```

---

## 📁 Files Created

1. **`backend-shiprocket-service.js`**
   - Complete backend service
   - Ready to integrate
   - Token caching included
   - All functions implemented

2. **`SHIPROCKET_BACKEND_INTEGRATION_GUIDE.md`**
   - Step-by-step integration
   - Code examples
   - Troubleshooting guide

3. **`SHIPROCKET_QUICK_REFERENCE.md`** (this file)
   - Quick lookup reference
   - Credentials cheat sheet

---

## 🐛 Common Issues & Fixes

### Issue: "Permission Denied"
**Fix:** Change email from `contact@yoraa.in` to `support@yoraa.in`

### Issue: "Token Expired"
**Fix:** Token expires after 10 hours - code auto-refreshes

### Issue: "No Couriers Available"
**Fix:** Check pincode serviceability in Shiprocket dashboard

### Issue: "Invalid Pickup Location"
**Fix:** Set `pickup_location: "Primary"` in order payload

---

## 📞 Support Contacts

**Shiprocket Support:**
- Email: support@shiprocket.in
- Phone: +91 11 4173 4173
- Company ID (YORAA): 5783639

**Technical Issues:**
- Check API docs: https://apidocs.shiprocket.in
- Test in Postman first
- Verify credentials in dashboard

---

## ✅ Integration Checklist

- [ ] Backend using `support@yoraa.in` ✅
- [ ] Frontend using `support@yoraa.in` ✅
- [ ] Token caching implemented ✅
- [ ] Order creation working ⏳
- [ ] AWB generation working ⏳
- [ ] Tracking endpoint ready ⏳
- [ ] Error handling added ⏳
- [ ] Production deployment ⏳

---

## 🎯 Next Steps

1. **Copy** `backend-shiprocket-service.js` to your backend
2. **Update** `.env` with API credentials
3. **Test** authentication
4. **Integrate** into order controller
5. **Deploy** to production

---

**Remember:** Always use `support@yoraa.in` for API operations! 🚀
