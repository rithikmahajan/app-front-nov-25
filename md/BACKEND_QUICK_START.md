# ⚡ Quick Start - Shiprocket Integration

**For Backend Team - 5 Minute Setup**

---

## 🎯 What You Need to Do

Integrate Shiprocket to automatically create shipments after payment.

---

## 🔐 Credentials (Copy to .env)

```env
SHIPROCKET_API_USER_EMAIL=support@yoraa.in
SHIPROCKET_API_USER_PASSWORD=R@0621thik
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
```

⚠️ **Use `support@yoraa.in` NOT `contact@yoraa.in`**

---

## 📁 Files to Copy

1. Copy `backend-shiprocket-service.js` to `your-backend/services/shiprocketService.js`
2. Install: `npm install axios`

---

## 💻 Code to Add

### In your Order Controller:

```javascript
const shiprocketService = require('../services/shiprocketService');

// After payment verification and order creation:
const shipmentData = {
  orderId: order._id.toString(),
  orderDate: new Date().toISOString().split('T')[0],
  customer: {
    name: shippingAddress.firstName,
    lastName: shippingAddress.lastName || '',
    email: user.email,
    phone: shippingAddress.phone,
    address: shippingAddress.address,
    city: shippingAddress.city,
    state: shippingAddress.state,
    pincode: shippingAddress.pincode,
    country: 'India'
  },
  items: items.map(item => ({
    name: item.name,
    sku: item._id,
    quantity: item.quantity,
    price: item.price
  })),
  paymentMethod: 'Prepaid',
  subTotal: totalAmount
};

const result = await shiprocketService.createCompleteShipment(shipmentData);

if (result.success) {
  order.awbCode = result.awbCode;
  order.shipmentId = result.shipmentId;
  order.courierName = result.courier.name;
  order.shippingStatus = 'processing';
  await order.save();
}
```

---

## 🗄️ Database Fields to Add

Add to Order model:
```javascript
awbCode: String,
shipmentId: String,
courierName: String,
shippingStatus: {
  type: String,
  enum: ['pending', 'processing', 'shipped', 'delivered', 'failed'],
  default: 'pending'
}
```

---

## 🧪 Test It

```bash
# Run test script
node test-shiprocket-integration.js

# Should see:
# ✅ Authentication - PASS
# ✅ All tests passed!
```

---

## 🎯 Result

After this:
- Orders automatically create Shiprocket shipments ✅
- AWB tracking codes generated ✅
- Customers can track orders ✅

---

## 📖 Full Documentation

See `BACKEND_TEAM_SHIPROCKET_INTEGRATION.md` for complete details.

---

**Questions?** Check the full integration guide.

**Ready!** Copy files, add code, test, deploy. Done! 🚀
