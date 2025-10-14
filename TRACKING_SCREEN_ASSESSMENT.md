# 📍 Tracking Screen Implementation Assessment

## Current Status: ✅ **TRACKING MODAL IMPLEMENTED**

---

## 📋 What's Currently Implemented

### ✅ **1. Tracking Modal Component** (`src/screens/orderstrackmodeloverlay.js`)

The tracking modal is a **fully functional** modal overlay that displays order tracking status.

#### Features Implemented:

```javascript
✅ Modal overlay with bottom sheet animation
✅ Drag-to-close functionality (both drag handle and content area)
✅ Master tracking steps visualization
✅ Step completion status indicators
✅ Dynamic tracking data display
✅ Location information for each step
✅ Responsive design (adapts to device height)
✅ Smooth animations using Animated API
✅ Pan responder for swipe gestures
```

#### Master Tracking Steps:

```javascript
const masterSteps = [
  { status: "Packing" },
  { status: "Picked" },
  { status: "In Transit" },
  { status: "Delivered" },
];
```

---

## 📋 What's in Orders Screen

### ✅ **2. Orders Display** (`src/screens/orders.js`)

The orders screen is **fully implemented** with:

```javascript
✅ Fetch orders from backend API
✅ Display order cards with product details
✅ Order status badges with color coding
✅ Track order button functionality
✅ Pull-to-refresh functionality
✅ Loading and error states
✅ Empty state handling
✅ Action buttons (Track, Cancel, Buy Again, Return/Exchange)
✅ Integration with tracking modal
✅ Integration with cancel order modal
```

---

## 🚨 **CRITICAL GAPS - What's MISSING for Full Shiprocket Integration**

### ❌ **1. Real-time Shiprocket Tracking Data**

**Current Issue:**
```javascript
// In orders.js - MOCK DATA ONLY
const getTrackingData = useCallback((order) => {
  // Mock tracking data based on order status
  if (order.status === 'confirmed') {
    return [
      { status: "Packing", location: "Warehouse Mumbai", timestamp: "2024-01-15 10:30 AM" },
      { status: "Picked", location: "Courier Hub Mumbai", timestamp: "2024-01-15 02:45 PM" },
    ];
  }
  // ... more mock data
  return [];
}, []);
```

**What's Needed:**
```javascript
// ❌ MISSING: Real API call to fetch Shiprocket tracking
const fetchShiprocketTracking = async (awbCode) => {
  const token = await getShiprocketToken();
  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

---

### ❌ **2. AWB Code Storage & Retrieval**

**Current Issue:**
- Orders don't have `awb_code` field displayed
- No way to retrieve tracking number from backend

**What's Needed:**
```javascript
// Backend must return AWB code with order data
{
  _id: "64order123...",
  awb_code: "141123221084922",  // ❌ MISSING
  shipment_id: 236612717,        // ❌ MISSING
  courier_name: "Xpressbees",    // ❌ MISSING
  // ... other order fields
}
```

---

### ❌ **3. Shiprocket Status Mapping**

**Current Issue:**
- Modal uses generic statuses: "Packing", "Picked", "In Transit", "Delivered"
- Shiprocket uses different status codes: "OP", "PKD", "IT", "RAD", "OFD", "DLVD"

**What's Needed:**
```javascript
// ❌ MISSING: Status mapping function
const SHIPROCKET_STATUS_MAP = {
  'OP': 'Packing',
  'OFP': 'Out for Pickup',
  'PKD': 'Picked',
  'PUD': 'Picked',
  'IT': 'In Transit',
  'RAD': 'Reached Destination',
  'OFD': 'Out for Delivery',
  'DLVD': 'Delivered',
  'RTO': 'Return to Origin',
  'LOST': 'Lost',
  'DAMAGED': 'Damaged',
  'CANCELLED': 'Cancelled'
};
```

---

### ❌ **4. Full-Screen Tracking Page**

**Current Status:**
- Only modal overlay exists
- No dedicated full-screen tracking page

**What's Recommended:**
Create a dedicated tracking screen like in the documentation:

```
src/screens/TrackingOrderScreen.js  ❌ MISSING
```

This should include:
- Full tracking timeline with dates
- Delivery address display
- Product information
- Estimated delivery date
- Cancel order button
- AWB code display

---

## 🔧 **Required Code Changes**

### **Change 1: Update Orders Screen to Fetch AWB Code**

**File:** `src/screens/orders.js`

```javascript
const fetchOrders = useCallback(async () => {
  try {
    const response = await yoraaAPI.getUserOrders();
    
    const transformedOrders = response.data.map(order => ({
      id: order._id,
      status: order.order_status,
      awb_code: order.awb_code,           // ✅ ADD THIS
      shipment_id: order.shipment_id,     // ✅ ADD THIS
      courier_name: order.courier_name,   // ✅ ADD THIS
      // ... other fields
    }));
    
    setOrders(transformedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
}, []);
```

---

### **Change 2: Replace Mock Tracking with Real API Call**

**File:** `src/screens/orders.js`

```javascript
// ❌ REMOVE THIS
const getTrackingData = useCallback((order) => {
  // Mock tracking data
  return [];
}, []);

// ✅ REPLACE WITH THIS
const fetchRealTrackingData = useCallback(async (order) => {
  if (!order.awb_code) {
    Alert.alert('Error', 'Tracking number not available');
    return;
  }

  try {
    setLoading(true);
    
    // Authenticate with Shiprocket
    const authResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'support@yoraa.in',
          password: 'R@2727thik'
        })
      }
    );
    
    const authData = await authResponse.json();
    const token = authData.token;
    
    // Fetch tracking data
    const trackingResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.awb_code}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const trackingData = await trackingResponse.json();
    
    // Transform Shiprocket data to modal format
    const activities = trackingData.tracking_data?.shipment_track_activities || [];
    const transformedData = activities.map(activity => ({
      status: mapShiprocketStatus(activity.status),
      location: activity.location,
      timestamp: activity.date
    }));
    
    trackingModalRef.current?.openModal(transformedData);
    
  } catch (error) {
    console.error('Error fetching tracking:', error);
    Alert.alert('Error', 'Failed to fetch tracking details');
  } finally {
    setLoading(false);
  }
}, []);

// Helper function to map Shiprocket statuses
const mapShiprocketStatus = (status) => {
  const statusMap = {
    'OP': 'Packing',
    'PKD': 'Picked',
    'IT': 'In Transit',
    'DLVD': 'Delivered',
    'OFD': 'Out for Delivery',
    'RAD': 'Reached Destination'
  };
  return statusMap[status] || status;
};
```

---

### **Change 3: Update Track Button Handler**

**File:** `src/screens/orders.js`

```javascript
// ❌ OLD CODE
const handleTrackOrder = useCallback((order) => {
  const trackingData = getTrackingData(order);
  trackingModalRef.current?.openModal(trackingData);
}, [getTrackingData]);

// ✅ NEW CODE
const handleTrackOrder = useCallback(async (order) => {
  if (!order.awb_code) {
    Alert.alert(
      'Tracking Not Available', 
      'Your order is being processed. Tracking will be available soon.'
    );
    return;
  }
  
  // Option 1: Open modal with real data
  await fetchRealTrackingData(order);
  
  // Option 2: Navigate to full tracking screen (recommended)
  navigation.navigate('TrackingOrder', {
    awbCode: order.awb_code,
    address: order.address,
    orderPlaced: order.orderDate,
    imageUrl: order.image,
    orderId: order.id,
    productName: order.productName,
    description: order.productDescription
  });
}, [fetchRealTrackingData, navigation]);
```

---

### **Change 4: Enhance Tracking Modal with More Details**

**File:** `src/screens/orderstrackmodeloverlay.js`

```javascript
// Add timestamp display
<View style={{ flex: 1 }}>
  <Text style={{ /* ... */ }}>
    {step.status}
  </Text>
  <Text style={{ /* ... */ }}>
    {stepData.location || ""}
  </Text>
  {/* ✅ ADD TIMESTAMP */}
  {stepData.timestamp && (
    <Text style={{
      fontSize: FONT_SIZE.XS,
      fontFamily: FONT_FAMILY.REGULAR,
      color: 'gray',
      marginTop: 2
    }}>
      {stepData.timestamp}
    </Text>
  )}
</View>
```

---

## 📊 **Implementation Priority**

### **HIGH PRIORITY (Must Fix):**

1. ✅ **Add AWB code to order data structure**
   - Backend must save AWB code during order creation
   - Frontend must fetch and display AWB code

2. ✅ **Replace mock tracking with real Shiprocket API**
   - Implement authentication flow
   - Fetch real-time tracking data
   - Handle API errors gracefully

3. ✅ **Add status mapping**
   - Map Shiprocket statuses to customer-friendly names
   - Update modal to show correct statuses

---

### **MEDIUM PRIORITY (Recommended):**

4. ✅ **Create full-screen tracking page**
   - Better UX than modal for detailed tracking
   - Show complete delivery address
   - Display estimated delivery date
   - Allow order cancellation

5. ✅ **Add error handling**
   - Handle missing AWB codes
   - Handle API failures
   - Show user-friendly error messages

---

### **LOW PRIORITY (Nice to Have):**

6. ✅ **Add real-time updates**
   - Auto-refresh tracking data
   - Push notifications for status changes

7. ✅ **Add delivery location map**
   - Show courier's current location
   - Estimated time of arrival

---

## 🎯 **Recommended Implementation Steps**

### **Step 1: Update Backend (If not done)**

```javascript
// In razorpay verify-payment endpoint
const shipmentResult = await createShiprocketShipment(newOrder);

if (shipmentResult.success) {
  // ✅ SAVE THESE TO DATABASE
  newOrder.awb_code = shipmentResult.awb_code;
  newOrder.shipment_id = shipmentResult.shipment_id;
  newOrder.courier_name = shipmentResult.courier_name;
  await newOrder.save();
}
```

---

### **Step 2: Update Order Fetching**

```javascript
// Make sure API returns these fields
GET /orders/getAllByUser

Response:
{
  orders: [
    {
      _id: "...",
      awb_code: "141123221084922",  // ✅ REQUIRED
      shipment_id: 236612717,
      courier_name: "Xpressbees",
      // ... other fields
    }
  ]
}
```

---

### **Step 3: Create Shiprocket Service**

Create a new file: `src/services/shiprocketService.js`

```javascript
const SHIPROCKET_EMAIL = 'support@yoraa.in';
const SHIPROCKET_PASSWORD = 'R@2727thik';

let cachedToken = null;
let tokenExpiry = null;

export const getShiprocketToken = async () => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
      })
    }
  );

  const data = await response.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + (10 * 60 * 60 * 1000); // 10 hours

  return cachedToken;
};

export const fetchTrackingDetails = async (awbCode) => {
  const token = await getShiprocketToken();
  
  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.json();
};

export const mapShiprocketStatus = (status) => {
  const statusMap = {
    'OP': 'Order Placed',
    'OFP': 'Out for Pickup',
    'PKD': 'Picked Up',
    'PUD': 'Pick Done',
    'IT': 'In Transit',
    'RAD': 'Reached at Destination',
    'OFD': 'Out for Delivery',
    'DLVD': 'Delivered',
    'RTO': 'Return to Origin',
    'LOST': 'Lost',
    'DAMAGED': 'Damaged',
    'CANCELLED': 'Cancelled'
  };
  return statusMap[status] || status;
};
```

---

### **Step 4: Update Orders Screen**

```javascript
import { fetchTrackingDetails, mapShiprocketStatus } from '../services/shiprocketService';

const handleTrackOrder = async (order) => {
  if (!order.awb_code) {
    Alert.alert('Tracking Unavailable', 'Your order is being processed.');
    return;
  }

  try {
    setLoading(true);
    const trackingData = await fetchTrackingDetails(order.awb_code);
    
    const activities = trackingData.tracking_data?.shipment_track_activities || [];
    const transformedData = activities.map(activity => ({
      status: mapShiprocketStatus(activity.status),
      location: activity.location,
      timestamp: new Date(activity.date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true
      })
    }));

    trackingModalRef.current?.openModal(transformedData);
  } catch (error) {
    Alert.alert('Error', 'Failed to fetch tracking details');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ **Testing Checklist**

After implementing changes, test:

- [ ] Orders display correctly with AWB codes
- [ ] Track button opens modal with real data
- [ ] Shiprocket API authentication works
- [ ] Status mapping displays correctly
- [ ] Error handling works (missing AWB, API failure)
- [ ] Loading states display properly
- [ ] Modal drag-to-close still works
- [ ] Tracking updates reflect real courier status
- [ ] Timestamps display in correct timezone (IST)

---

## 🎉 **Summary**

### **What Works:**
✅ Tracking modal UI is fully implemented  
✅ Orders screen is functional  
✅ Basic tracking flow exists  

### **What's Missing:**
❌ Real Shiprocket API integration  
❌ AWB code storage and retrieval  
❌ Status mapping from Shiprocket  
❌ Full-screen tracking page (recommended)  

### **Estimated Work:**
- **Backend:** 1-2 hours (ensure AWB is saved and returned)
- **Frontend:** 3-4 hours (API integration, error handling, testing)
- **Total:** 4-6 hours for complete implementation

---

## 📞 **Next Steps**

1. Verify backend returns `awb_code`, `shipment_id`, `courier_name`
2. Create `src/services/shiprocketService.js`
3. Update `src/screens/orders.js` with real API calls
4. Test with actual orders that have AWB codes
5. Consider creating full-screen tracking page for better UX

---

**Need help implementing these changes? Let me know which part to tackle first!** 🚀
