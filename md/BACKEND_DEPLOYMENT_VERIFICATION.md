# Backend Deployment Verification Script

## Run These Commands on Production Server

### 1. Check if Code Has ObjectId Conversion

```bash
# SSH to production server
ssh user@185.193.19.244

# Navigate to backend directory
cd /path/to/your/backend

# Check if ObjectId conversion exists in code
grep -n "mongoose.Types.ObjectId" src/controllers/paymentController/paymentController.js

# Expected output (if fix is present):
# Line XX: const mongoose = require('mongoose');
# Line XX: return mongoose.Types.ObjectId(id);
```

**If grep returns nothing** → Fix NOT applied! Apply fix now.

---

### 2. Check File Last Modified Time

```bash
# Check when the payment controller was last modified
ls -lh src/controllers/paymentController/paymentController.js

# Example output:
# -rw-r--r-- 1 user user 15K Oct 14 04:00 paymentController.js
```

**If date is before October 14** → Old code! Need to pull latest and restart.

---

### 3. Check Git Status

```bash
# Check current git branch
git branch

# Check last commit
git log -1 --oneline

# Check if local is behind remote
git fetch origin
git status

# If behind, pull latest:
git pull origin main
```

---

### 4. Verify MongoDB Products Exist

```bash
# Connect to MongoDB
mongosh

# Use your database
use yoraa_db  // or your actual database name

// Check if test products exist
db.items.find({
  _id: ObjectId("68da56fc0561b958f6694e1d")
}, {
  _id: 1,
  name: 1,
  productName: 1,
  status: 1
}).pretty()

db.items.find({
  _id: ObjectId("68da56fc0561b958f6694e19")
}, {
  _id: 1,
  name: 1,
  productName: 1,
  status: 1
}).pretty()
```

**Expected**:
```json
{
  "_id": ObjectId("68da56fc0561b958f6694e1d"),
  "name": "Product 36",
  "status": "live"
}
{
  "_id": ObjectId("68da56fc0561b958f6694e19"),
  "name": "Product 34",
  "status": "live"
}
```

**If no results** → Products don't exist OR collection name is different (check `db.collection.find()`)

---

### 5. Test API Endpoint Directly on Server

```bash
# From production server, test localhost
curl -X POST http://localhost:8000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGRhZTNmZDQ3MDU0ZmU3NWM2NTE0OTMiLCJlbWFpbCI6InJpdGhpa21haGFqYW4yN0BnbWFpbC5jb20iLCJpYXQiOjE3NjA0MTU4OTgsImV4cCI6MTc2MDQxOTQ5OH0.yNiprxEo8kUcZi7ZRz6K2xHsHucMkfjPqmmuGH21gjo" \
  -d '{
    "amount": 1752,
    "cart": [{
      "id": "68da56fc0561b958f6694e1d",
      "name": "Product 36",
      "quantity": 1,
      "price": 1752,
      "size": "small",
      "sku": "SKU036"
    }],
    "staticAddress": {
      "firstName": "Test",
      "city": "Test",
      "pinCode": "180001"
    },
    "userId": "68dae3fd47054fe75c651493",
    "paymentMethod": "razorpay"
  }'
```

**PASS**: Returns `{"success": true, "data": {"orderId": "order_..."}}`  
**FAIL**: Returns `{"error": "Invalid item IDs"}`

---

### 6. Check Backend Logs

```bash
# View real-time logs
tail -f logs/app.log

# OR if using PM2
pm2 logs backend

# OR if using systemd
journalctl -u backend -f

# Look for these messages (if fix is applied):
# 🔍 Product IDs to validate: [ '68da56fc0561b958f6694e1d', '68da56fc0561b958f6694e19' ]
# ✅ Converted 2 IDs to ObjectId
# ✅ Found 2 valid products in database
# ✅ All products validated successfully
# ✅ Razorpay order created: order_...
```

**If you see**:
- ❌ No ObjectId conversion messages → Fix NOT applied
- ❌ "Found 0 valid products" → ObjectId query failing OR products don't exist
- ✅ "All products validated successfully" → Fix IS working!

---

### 7. Restart Backend Server

```bash
# If using PM2
pm2 restart backend
pm2 logs backend --lines 50

# If using systemd
sudo systemctl restart backend
sudo journalctl -u backend -f

# If running directly
pkill -f "node.*app.js"
npm start
# OR
node app.js
```

---

### 8. Verify Server is Running

```bash
# Check if process is running
ps aux | grep node

# Check if port is listening
netstat -tulpn | grep 8000
# OR
lsof -i :8000

# Test health endpoint
curl http://localhost:8000/health
# OR
curl http://localhost:8000/
```

---

## Quick Deployment Checklist

Run these in order:

```bash
# 1. Pull latest code
git pull origin main

# 2. Check if ObjectId conversion is in the code
grep "mongoose.Types.ObjectId" src/controllers/paymentController/paymentController.js

# 3. Restart backend
pm2 restart backend

# 4. Check logs
pm2 logs backend --lines 20

# 5. Test endpoint
curl -X POST http://localhost:8000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 1752, "cart": [{"id": "68da56fc0561b958f6694e1d", "quantity": 1, "price": 1752, "size": "small"}], "staticAddress": {"firstName": "Test", "city": "Test", "pinCode": "180001"}, "userId": "68dae3fd47054fe75c651493", "paymentMethod": "razorpay"}'

# 6. Verify response
# Should show: {"success": true, "data": {"orderId": "order_..."}}
```

---

## Expected Console Output After Fix

```
🛒 Creating Razorpay order...
📦 Cart items: 1
🔍 Product IDs to validate: [ '68da56fc0561b958f6694e1d' ]
✅ Converted 1 IDs to ObjectId
✅ Found 1 valid products in database
✅ All products validated successfully
✅ Razorpay order created: order_NabcdefghijkL
```

---

## Troubleshooting

### Issue: "mongoose.Types.ObjectId is not a function"

**Solution**: Add `const mongoose = require('mongoose');` at top of file

### Issue: "Item is not defined"

**Solution**: Import Item model: `const Item = require('../models/Item');`

### Issue: "Found 0 valid products"

**Check**:
1. Collection name (is it `items` or `products`?)
2. Product status (is it `live`, `active`, or `published`?)
3. Products actually exist in database (run MongoDB query)

### Issue: Still getting "Invalid item IDs"

**Possible causes**:
1. Code not deployed (old version still running)
2. Server not restarted after code change
3. Wrong endpoint being called
4. Fix applied to wrong file/function

---

## Proof of Fix

Once fixed, share this with frontend team:

```bash
# Run this command and share the output
curl -X POST http://185.193.19.244:8000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '[REQUEST_BODY]' \
  | jq .

# Also share backend logs showing:
pm2 logs backend --lines 30 | grep "Product\|ObjectId\|validated"
```

---

## Summary

✅ **Code has ObjectId conversion** → `grep` shows the fix  
✅ **Server restarted** → Recent process start time  
✅ **Products exist in DB** → MongoDB query returns them  
✅ **Endpoint works** → curl returns success response  
✅ **Logs show validation** → Console shows product found messages

If ALL checkmarks pass → Fix is deployed and working!

If ANY fail → Fix is NOT properly deployed.
