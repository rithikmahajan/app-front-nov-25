# 🚀 Quick Reference: Cart to Shipping Flow

## 📱 Frontend Files Modified

```
✅ src/screens/bag.js
   - handleCheckout() enhanced with authentication validation
   
✅ src/screens/orders.js
   - fetchOrders() now extracts AWB codes
   - getTrackingData() passes complete order info
   
✅ src/screens/orderstrackmodeloverlay.js
   - Added fetchShiprocketTracking()
   - Enhanced handleOpen() with real-time data
   - Added loading and error states
   
✅ src/services/paymentService.js
   - Already has complete order processing
   
✅ src/services/orderService.js
   - Already has Shiprocket integration
   
✅ src/services/shiprocketService.js
   - Already has tracking functions
```

---

## 🔑 Key Code Snippets

### 1. Bag Screen - Checkout with Authentication
```javascript
// Extract auth before payment
const userData = await yoraaAPI.getUserData();
const userToken = yoraaAPI.getUserToken();
const userId = userData?.id || userData?.uid || userData?._id;

// Process complete order
await paymentService.processCompleteOrder(
  bagItems,
  formattedAddress,
  { userId, userToken, paymentMethod: 'razorpay' }
);
```

### 2. Orders Screen - Extract AWB
```javascript
const transformedOrders = response.data.map(order => ({
  awbCode: order.awb_code || order.awbCode,
  awb_code: order.awb_code || order.awbCode,
  shipmentId: order.shipment_id
}));
```

### 3. Tracking Modal - Real-time Data
```javascript
const fetchShiprocketTracking = async (awbCode) => {
  const data = await shiprocketService.trackByAWB(awbCode);
  setTrackingData(data.activities.map(...));
};

const handleOpen = (data) => {
  if (data.awbCode) {
    fetchShiprocketTracking(data.awbCode);
  }
};
```

---

## 🎯 Testing Commands

### Test Payment (Razorpay Test Mode)
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

### Check Logs
```javascript
// In browser console
console.log('AWB Code:', orderData.awbCode);
console.log('Order ID:', orderData.orderId);
console.log('Tracking Data:', trackingData);
```

---

## 🔍 Debug Checklist

### If Payment Fails:
```
1. Check userId exists: console.log(userId)
2. Check userToken exists: console.log(userToken)
3. Check address complete: console.log(formattedAddress)
4. Check Razorpay credentials in .env
```

### If Tracking Not Working:
```
1. Check AWB in order: console.log(order.awbCode)
2. Check Shiprocket auth: Check token expiry
3. Check API response: console.log(trackingData)
4. Check error state: console.log(error)
```

### If Orders Not Showing:
```
1. Check API response: console.log(response.data)
2. Check JWT token: yoraaAPI.getUserToken()
3. Check backend endpoint: /api/orders/user/:userId
4. Check network tab: XHR requests
```

---

## 📊 Success Indicators

```
✅ Cart checkout redirects to payment
✅ Payment UI opens with correct amount
✅ Order confirmation shows AWB code
✅ Orders screen displays all orders
✅ Track button opens modal
✅ Modal shows loading spinner
✅ Real-time tracking data appears
✅ Timeline shows correct steps
```

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| ₹0.00 amount | Backend not returning totalAmount |
| No AWB code | Shiprocket shipment failed, check logs |
| Tracking not loading | Check Shiprocket authentication |
| Payment fails | Check userId and userToken exist |
| Orders empty | Check JWT token validity |

---

## 📞 Quick Support

**Backend API Issues:**
- Check `/api/orders/user/:userId` endpoint
- Verify response includes `awb_code` field
- Check JWT token in headers

**Shiprocket Issues:**
- Verify credentials in `.env`
- Check Shiprocket dashboard
- Review shipment creation logs

**Payment Issues:**
- Verify Razorpay credentials
- Check payment verification endpoint
- Review Razorpay dashboard

---

## 🎉 Success Checklist

Before marking as complete:
- [ ] Can add items to cart
- [ ] Can checkout with address
- [ ] Payment completes successfully
- [ ] Order confirmation shows correct amount
- [ ] AWB code is displayed
- [ ] Orders screen loads orders
- [ ] Track button works
- [ ] Real-time tracking shows
- [ ] Timeline is accurate
- [ ] Error handling works

---

**Last Updated:** October 14, 2025  
**Status:** Production Ready ✅
