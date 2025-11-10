# 🚀 Shiprocket Tracking Integration - Implementation Guide

## Overview

This guide shows you **exactly** how to integrate real Shiprocket tracking into your YORA app.

---

## ✅ **What's Already Done**

1. ✅ Tracking modal UI component (`src/screens/orderstrackmodeloverlay.js`)
2. ✅ Orders screen with track button (`src/screens/orders.js`)
3. ✅ Shiprocket service created (`src/services/shiprocketService.js`)
4. ✅ Order service with payment integration (`src/services/orderService.js`)

---

## 🔧 **Required Code Changes**

### **Step 1: Update Orders Screen**

**File:** `src/screens/orders.js`

#### Add Import

```javascript
// At the top of the file, add:
import { 
  fetchTrackingDetails, 
  transformTrackingForModal,
  getCurrentStatus 
} from '../services/shiprocketService';
import { Alert, ActivityIndicator } from 'react-native';
```

#### Replace Mock Tracking Function

Find this function (around line 256):

```javascript
// ❌ REMOVE THIS ENTIRE FUNCTION
const getTrackingData = useCallback((order) => {
  // Mock tracking data based on order status
  if (order.status === 'confirmed') {
    return [
      { status: "Packing", location: "Warehouse Mumbai", timestamp: "2024-01-15 10:30 AM" },
      { status: "Picked", location: "Courier Hub Mumbai", timestamp: "2024-01-15 02:45 PM" },
    ];
  } else if (order.status === 'delivered') {
    return [
      { status: "Packing", location: "Warehouse Mumbai", timestamp: "2024-01-15 10:30 AM" },
      { status: "Picked", location: "Courier Hub Mumbai", timestamp: "2024-01-15 02:45 PM" },
      { status: "In Transit", location: "In Transit to Delhi", timestamp: "2024-01-16 08:00 AM" },
      { status: "Delivered", location: "Delivered to Customer", timestamp: "2024-01-17 11:30 AM" },
    ];
  }
  return [];
}, []);
```

Replace with:

```javascript
// ✅ ADD THIS NEW FUNCTION
const fetchRealTrackingData = useCallback(async (order) => {
  if (!order.awb_code) {
    Alert.alert(
      'Tracking Not Available',
      'Your order is being processed. Tracking will be available soon.',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    // Show loading state
    setLoading(true);

    console.log(`🚀 Fetching tracking for AWB: ${order.awb_code}`);

    // Fetch real tracking data from Shiprocket
    const trackingData = await fetchTrackingDetails(order.awb_code);

    // Transform to modal format
    const transformedData = transformTrackingForModal(trackingData);

    if (transformedData.length === 0) {
      Alert.alert(
        'No Tracking Data',
        'Tracking information is not yet available for this order.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Open modal with real data
    trackingModalRef.current?.openModal(transformedData);

  } catch (error) {
    console.error('❌ Error fetching tracking:', error);
    Alert.alert(
      'Error',
      'Failed to fetch tracking details. Please try again later.',
      [{ text: 'OK' }]
    );
  } finally {
    setLoading(false);
  }
}, []);
```

#### Update Track Order Handler

Find this function (around line 274):

```javascript
// ❌ REMOVE THIS
const handleTrackOrder = useCallback((order) => {
  const trackingData = getTrackingData(order);
  trackingModalRef.current?.openModal(trackingData);
}, [getTrackingData]);
```

Replace with:

```javascript
// ✅ REPLACE WITH THIS
const handleTrackOrder = useCallback(async (order) => {
  await fetchRealTrackingData(order);
}, [fetchRealTrackingData]);
```

---

### **Step 2: Update Order Data Transformation**

**File:** `src/screens/orders.js`

Find the `fetchOrders` function (around line 68):

```javascript
const fetchOrders = useCallback(async () => {
  try {
    setError(null);
    const response = await yoraaAPI.getUserOrders();
    
    if (response.success && response.data) {
      // Transform API data to match our component structure
      const transformedOrders = response.data.map(order => ({
        id: order._id || order.id,
        status: order.order_status,
        statusColor: getStatusColor(order.order_status),
        productName: order.items?.[0]?.name || order.items?.[0]?.description || 'Product Name',
        productDescription: order.items?.[0]?.description || 'Product Description',
        size: order.item_quantities?.[0]?.sku || 'Size Info',
        image: order.items?.[0]?.image || 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
        actions: getCustomerActions(order),
        orderDate: order.created_at,
        totalAmount: order.total_price,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        razorpayOrderId: order.razorpay_order_id,
        address: order.address
        // ✅ ADD THESE THREE LINES
        awb_code: order.awb_code,
        shipment_id: order.shipment_id,
        courier_name: order.courier_name,
      }));
```

---

### **Step 3: Ensure Backend Returns AWB Code**

**File:** Backend `razorpay verify-payment` endpoint

Make sure this code exists in your backend:

```javascript
// After payment verification
const shipmentResult = await createShiprocketShipment(newOrder);

if (shipmentResult.success) {
  // ✅ MUST SAVE THESE TO DATABASE
  newOrder.awb_code = shipmentResult.awb_code;
  newOrder.shipment_id = shipmentResult.shipment_id;
  newOrder.courier_name = shipmentResult.courier_name;
  await newOrder.save();
  
  console.log('✅ Order updated with shipment details:', {
    awb_code: newOrder.awb_code,
    shipment_id: newOrder.shipment_id
  });
}
```

---

### **Step 4: Update Order Model Schema**

**File:** Backend `models/Order.js`

Ensure these fields exist:

```javascript
const orderSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // ✅ ADD THESE FIELDS IF MISSING
  awb_code: {
    type: String,
    default: null,
    index: true  // Add index for faster queries
  },
  shipment_id: {
    type: Number,
    default: null
  },
  courier_name: {
    type: String,
    default: null
  },
  
  // ... rest of schema ...
});
```

---

### **Step 5: Update Backend Order Response**

**File:** Backend `routes/orders.js` or `controllers/orderController.js`

Ensure the order fetch endpoint returns these fields:

```javascript
// GET /orders/getAllByUser
router.get('/getAllByUser', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ created_at: -1 })
      .select('_id items total_price order_status payment_status shipping_status awb_code shipment_id courier_name razorpay_order_id address created_at updated_at')
      .lean();

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});
```

---

## 🧪 **Testing**

### **Test 1: Check Order Has AWB Code**

After placing a test order, verify the order object has `awb_code`:

```javascript
// In orders.js, add console log
console.log('Order data:', {
  id: order.id,
  awb_code: order.awb_code,    // Should NOT be null
  shipment_id: order.shipment_id,
  courier_name: order.courier_name
});
```

**Expected Output:**
```
Order data: {
  id: "64order123...",
  awb_code: "141123221084922",  // ✅ Should have value
  shipment_id: 236612717,
  courier_name: "Xpressbees Surface"
}
```

---

### **Test 2: Test Track Button**

1. Navigate to Orders screen
2. Click "Track Order" on any order
3. Modal should open with real tracking data

**Expected Behavior:**
- ✅ Modal opens with tracking timeline
- ✅ Shows "Packing", "Picked", "In Transit", "Delivered" steps
- ✅ Each step has location and timestamp
- ✅ Completed steps show filled dot
- ✅ Incomplete steps show empty dot

---

### **Test 3: Test Error Handling**

#### Test 3A: Order Without AWB

```javascript
// Manually create order without AWB
const testOrder = {
  id: '123',
  awb_code: null,  // No tracking number
  // ... other fields
};

handleTrackOrder(testOrder);
```

**Expected:** Alert shows "Tracking Not Available"

#### Test 3B: Invalid AWB

```javascript
const testOrder = {
  id: '123',
  awb_code: 'INVALID_CODE',
  // ... other fields
};

handleTrackOrder(testOrder);
```

**Expected:** Alert shows "Failed to fetch tracking details"

---

## 📊 **Status Mapping Reference**

### Shiprocket Status → Modal Status

| Shiprocket Code | Customer-Facing Status | Modal Display |
|----------------|------------------------|---------------|
| OP | Order Placed | Packing |
| OFP | Out for Pickup | Picked |
| PKD | Picked Up | Picked |
| PUD | Pickup Done | Picked |
| IT | In Transit | In Transit |
| RAD | Reached Destination | In Transit |
| OFD | Out for Delivery | In Transit |
| DLVD | Delivered | Delivered |
| RTO | Return to Origin | ❌ (filtered) |
| CANCELLED | Cancelled | ❌ (filtered) |

---

## 🐛 **Common Issues & Solutions**

### Issue 1: "Tracking Not Available" for all orders

**Cause:** Backend not saving AWB code during order creation

**Solution:**
1. Check backend logs during payment verification
2. Verify Shiprocket shipment creation is successful
3. Ensure `awb_code` is saved to database
4. Check MongoDB to confirm AWB code exists

```javascript
// In backend, add logging
console.log('Shipment result:', shipmentResult);
console.log('Order after save:', {
  awb_code: newOrder.awb_code,
  shipment_id: newOrder.shipment_id
});
```

---

### Issue 2: "Failed to fetch tracking details"

**Cause 1:** Shiprocket authentication failing

**Solution:** Check Shiprocket credentials

```javascript
// In shiprocketService.js, verify credentials
const SHIPROCKET_EMAIL = 'support@yoraa.in';
const SHIPROCKET_PASSWORD = 'R@2727thik';

// Test authentication separately
const testAuth = async () => {
  const token = await getShiprocketToken();
  console.log('Token:', token);
};
```

**Cause 2:** AWB code not yet generated in Shiprocket

**Solution:** Wait a few minutes after order creation, then try tracking

---

### Issue 3: Modal shows no data

**Cause:** Tracking activities not being transformed correctly

**Solution:** Add logging in transform function

```javascript
// In shiprocketService.js
export const transformTrackingForModal = (trackingData) => {
  console.log('Raw tracking data:', JSON.stringify(trackingData, null, 2));
  
  const activities = trackingData.tracking_data?.shipment_track_activities;
  console.log('Activities:', activities);
  
  // ... rest of function
};
```

---

### Issue 4: Order fetch doesn't return AWB

**Cause:** Backend not including AWB in response

**Solution:** Update backend order controller

```javascript
// Make sure .select() includes AWB fields
.select('... awb_code shipment_id courier_name ...')
```

---

## 🎯 **Verification Checklist**

After implementing, verify:

- [ ] Backend saves AWB code during order creation
- [ ] Backend returns AWB code in order list API
- [ ] Frontend displays AWB code in order object
- [ ] Track button calls `fetchRealTrackingData`
- [ ] Shiprocket authentication works
- [ ] Tracking data is fetched successfully
- [ ] Tracking data is transformed correctly
- [ ] Modal displays tracking timeline
- [ ] Steps show location and timestamp
- [ ] Completed steps have filled dots
- [ ] Error handling works for missing AWB
- [ ] Error handling works for API failures
- [ ] Loading indicator shows during fetch

---

## 🚀 **Deployment Steps**

1. **Backend Deploy:**
   ```bash
   # Ensure backend has Shiprocket integration
   git add backend/
   git commit -m "Add Shiprocket AWB tracking integration"
   git push origin main
   ```

2. **Frontend Deploy:**
   ```bash
   # Add new service file
   git add src/services/shiprocketService.js
   
   # Update orders screen
   git add src/screens/orders.js
   
   git commit -m "Integrate real Shiprocket tracking"
   git push origin main
   ```

3. **Test in Production:**
   - Create test order
   - Wait 5 minutes for shipment creation
   - Check tracking works

---

## 📞 **Support**

If tracking still doesn't work after implementation:

1. Check backend logs for Shiprocket API calls
2. Verify order has AWB in database: `db.orders.findOne({ _id: ObjectId('...') })`
3. Test Shiprocket API directly with Postman
4. Check Shiprocket dashboard for shipment status

---

## ✅ **Summary**

### What You Need to Do:

1. ✅ Update `orders.js` to use real tracking API
2. ✅ Ensure backend returns `awb_code` in order response
3. ✅ Verify backend saves AWB during order creation
4. ✅ Test with real orders
5. ✅ Handle errors gracefully

### Estimated Time:
- Backend verification: 30 minutes
- Frontend changes: 1 hour
- Testing: 1 hour
- **Total: 2.5 hours**

---

**You're all set! The Shiprocket service is ready to use. Just follow the steps above to integrate it.** 🎉
