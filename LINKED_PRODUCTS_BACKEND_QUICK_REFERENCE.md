# 🔗 Linked Products - Backend Quick Reference

## TL;DR for Backend Team

**What we need:** API endpoint to get linked products (color variants) for a given product ID.

**Endpoint:** `GET /api/item-groups/item/:itemId`

**Current Status:** Endpoint returns "No item group found" for all products we tested.

**Request:** Please create 1-2 test item groups so we can verify the frontend implementation works.

---

## 📝 Quick Test Checklist

Backend team, please verify:

- [ ] Endpoint exists and is deployed: `GET /api/item-groups/item/:itemId`
- [ ] At least one item group exists in the database
- [ ] Provide us with a product ID that has linked products: `_______________`
- [ ] Response structure matches below format

---

## 🔌 API Endpoint Specification

### Request
```http
GET /api/item-groups/item/690a3f41eb2dfd498bb4db9b
Authorization: Bearer {token}  # If required
```

### Response (Product HAS linked variants)
```json
{
  "success": true,
  "data": {
    "_id": "673b1234567890abcdef1234",
    "name": "Shirt - Color Variants",  // Internal name, not shown to users
    "items": [
      {
        "itemId": "690a3f41eb2dfd498bb4db9b",
        "productName": "Relaxed Fit Shirt - Purple",
        "image": "https://s3.amazonaws.com/bucket/purple.jpg",
        "color": "Purple",
        "displayOrder": 0
      },
      {
        "itemId": "690a3f41eb2dfd498bb4db9c",
        "productName": "Relaxed Fit Shirt - Blue",
        "image": "https://s3.amazonaws.com/bucket/blue.jpg",
        "color": "Blue",
        "displayOrder": 1
      },
      {
        "itemId": "690a3f41eb2dfd498bb4db9d",
        "productName": "Relaxed Fit Shirt - Black",
        "image": "https://s3.amazonaws.com/bucket/black.jpg",
        "color": "Black",
        "displayOrder": 2
      }
    ],
    "isActive": true
  },
  "message": "Item group retrieved successfully"
}
```

### Response (Product has NO linked variants)
```json
{
  "success": false,
  "data": null,
  "message": "No item group found for this item"
}
```

**HTTP Status:** 200 OK (in both cases, or 404 for not found - please confirm)

---

## 📦 Database Schema Reference

```javascript
ItemGroup {
  _id: ObjectId,
  name: String,                    // e.g., "Relaxed Fit Shirt - Colors"
  items: [
    {
      itemId: ObjectId,             // Reference to Item collection
      productName: String,          // Display name
      image: String,                // URL to thumbnail/primary image
      color: String,                // Variant identifier (e.g., "Blue", "Red")
      displayOrder: Number          // Order of display (0, 1, 2...)
    }
  ],
  isActive: Boolean,                // Is this group active?
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 How to Create a Test Group

### Option 1: Admin Panel (if available)
1. Go to `http://localhost:3001/item-linking` (from Chrome screenshot)
2. Create a new item group
3. Add 2-3 products with different colors
4. Set display order (0, 1, 2...)
5. Save and activate

### Option 2: Direct Database Insert (MongoDB)
```javascript
db.itemgroups.insertOne({
  name: "Test Relaxed Fit Shirt - Color Variants",
  items: [
    {
      itemId: ObjectId("690a3f41eb2dfd498bb4db9b"),
      productName: "Relaxed Fit Shirt - Purple",
      image: "https://s3.amazonaws.com/your-bucket/purple-shirt.jpg",
      color: "Purple",
      displayOrder: 0
    },
    {
      itemId: ObjectId("690a3f41eb2dfd498bb4db9c"),
      productName: "Relaxed Fit Shirt - Blue", 
      image: "https://s3.amazonaws.com/your-bucket/blue-shirt.jpg",
      color: "Blue",
      displayOrder: 1
    }
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option 3: API Endpoint (if available)
```bash
curl -X POST http://localhost:8080/api/item-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Test Shirt - Colors",
    "items": [
      {
        "itemId": "690a3f41eb2dfd498bb4db9b",
        "productName": "Relaxed Fit Shirt - Purple",
        "image": "https://s3.amazonaws.com/bucket/purple.jpg",
        "color": "Purple",
        "displayOrder": 0
      },
      {
        "itemId": "690a3f41eb2dfd498bb4db9c",
        "productName": "Relaxed Fit Shirt - Blue",
        "image": "https://s3.amazonaws.com/bucket/blue.jpg",
        "color": "Blue",
        "displayOrder": 1
      }
    ],
    "isActive": true
  }'
```

---

## ✅ Testing Steps

After creating a test group:

1. **Verify endpoint returns data:**
   ```bash
   curl http://localhost:8080/api/item-groups/item/690a3f41eb2dfd498bb4db9b
   ```

2. **Check response structure:**
   - `success: true`
   - `data.items` is an array with 2+ items
   - Each item has: `itemId`, `productName`, `image`, `color`, `displayOrder`

3. **Notify frontend team:**
   - Share the test product ID: `_______________`
   - Confirm the endpoint is working
   - We'll test the UI immediately

---

## 🐛 Common Issues

### Issue: "No item group found" for all products
**Cause:** No item groups exist in the database  
**Fix:** Create at least one test item group

### Issue: Endpoint returns 404
**Cause:** Route not configured or not deployed  
**Fix:** Verify route exists in backend code and is deployed

### Issue: Authentication errors
**Cause:** Endpoint requires auth but frontend not sending token  
**Fix:** Confirm if endpoint requires authentication

### Issue: Items array is empty
**Cause:** Item group exists but has no items  
**Fix:** Add items to the group via admin panel

---

## 📞 Quick Questions?

**Q: Does the endpoint need authentication?**  
A: Please confirm ⏳

**Q: What product IDs have linked products?**  
A: Please provide test IDs ⏳

**Q: Is there an admin panel to manage groups?**  
A: Appears to be at `localhost:3001/item-linking` - please confirm ⏳

**Q: When will test groups be available?**  
A: Waiting for response ⏳

---

## 🚀 Once Ready

Please update this section when ready:

**✅ Status:** [ ] Not Ready  [ ] Ready for Testing

**Test Product IDs with Linked Products:**
- Product 1: `_______________________________`
- Product 2: `_______________________________`

**API Base URL:** `http://185.193.19.244:8080/api`

**Authentication Required:** [ ] Yes  [ ] No

**Notes from Backend Team:**
```
(Add any special instructions or notes here)
```

---

## 📎 Related Documents

- **Full Issue Report:** `LINKED_PRODUCTS_IMPLEMENTATION_ISSUE.md`
- **User Implementation Guide:** `LINKED_PRODUCTS_IMPLEMENTATION_GUIDE.md` (provided by user)
- **Frontend Code:** `src/screens/productdetailsmain.js`
- **API Service:** `src/services/apiService.js`

---

**Last Updated:** November 6, 2025  
**Status:** Awaiting backend team setup  
**Frontend Status:** ✅ Implementation complete and ready to test

