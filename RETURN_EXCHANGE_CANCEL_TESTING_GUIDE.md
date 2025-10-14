# 🧪 Return/Exchange/Cancel Flow - Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. ✅ App is running on device/simulator
2. ✅ User is logged in
3. ✅ User has at least one delivered order

---

## 📱 Test Scenarios

### 1. Return Order Flow (5 minutes)

#### Steps:
```
1. Navigate to Orders screen
2. Find a delivered order
3. Tap "Return/Exchange" button
4. Select reason: "Product not as expected"
5. Tap "Gallery" button
6. Select 1-3 images from photo library
7. Verify images appear in preview
8. Tap "Submit Return Request" button
9. Wait for success message
10. Verify navigation back to Orders screen
```

#### Expected Results:
- ✅ Order info displayed at top
- ✅ All 6 reasons visible
- ✅ Image picker opens on tap
- ✅ Images preview correctly
- ✅ Submit button disabled until valid
- ✅ Loading indicator during submission
- ✅ Success alert appears
- ✅ Returns to Orders screen

#### API Call Check:
```javascript
// Console should show:
📦 Submitting return request for order: <order_id>

// Network tab should show:
POST /api/orders/return
Content-Type: multipart/form-data
Body: {
  orderId: "...",
  reason: "Product not as expected",
  images: [File, File, ...]
}
```

---

### 2. Exchange Order Flow (3 minutes)

#### Steps:
```
1. Navigate to Orders screen
2. Find a delivered order
3. Tap "Return/Exchange" button
4. Select reason: "Size/fit issue"
5. Screen should navigate to size chart
6. Select size "L"
7. Toggle unit to "in" (verify chart updates)
8. Toggle back to "cm"
9. Tap "Exchange" button
10. Wait for thank you modal
11. Tap "Done" button
```

#### Expected Results:
- ✅ Auto-navigates to size chart
- ✅ Size "S" is grayed out (unavailable)
- ✅ Unit toggle works
- ✅ Selected size is highlighted
- ✅ Exchange button shows loading
- ✅ Thank you modal appears
- ✅ Returns to Orders screen

#### API Call Check:
```javascript
// Console should show:
🔄 Submitting exchange request for order: <order_id>

// Network tab should show:
POST /api/orders/exchange
Body: {
  orderId: "...",
  reason: "Size/fit issue",
  desiredSize: "L"
}
```

---

### 3. Cancel Order Flow (2 minutes)

#### Steps:
```
1. Navigate to Orders screen
2. Find a pending/confirmed order (not delivered)
3. Tap "Cancel Order" button (if available)
4. Bottom sheet modal appears
5. Read the cancellation message
6. Tap "Go Back" button
7. Modal should close
8. Tap "Cancel Order" again
9. Tap "Cancel Order" button in modal
10. Wait for confirmation modal
11. Tap "Got It" button
```

#### Expected Results:
- ✅ First modal explains cancellation
- ✅ "Go Back" closes modal without action
- ✅ "Cancel Order" button shows loading
- ✅ Confirmation modal appears
- ✅ Orders list refreshes
- ✅ Order status updated to "Cancelled"

#### API Call Check:
```javascript
// Console should show:
🚫 Cancelling order: <order_id>

// Network tab should show:
PUT /api/orders/<order_id>/cancel
Body: {
  reason: "Customer requested cancellation"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Images Not Uploading
**Symptoms:** Submit button works but images don't appear in request

**Solution:**
```javascript
// Check permissions in Info.plist (iOS) or AndroidManifest.xml (Android)
// For iOS:
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library</string>

// For Android:
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

### Issue 2: Cancel Button Not Showing
**Symptoms:** "Cancel Order" button doesn't appear

**Solution:**
- Only certain order statuses allow cancellation
- Check order status is 'pending', 'confirmed', or 'processing'
- Delivered and shipped orders cannot be cancelled

### Issue 3: API Errors
**Symptoms:** Error message "Failed to submit request"

**Check:**
1. User is authenticated (token exists)
2. Order ID is valid
3. Backend endpoints are implemented
4. Network connection is active

---

## 📊 Test Data Setup

### Create Test Orders
```javascript
// Use these order statuses:
✅ DELIVERED - For return/exchange testing
✅ PENDING - For cancel testing
✅ CONFIRMED - For cancel testing
❌ SHIPPED - Cannot cancel (but can return after delivery)
```

### Test Images
- Prepare 3-5 test images in photo library
- Mix of different sizes (small, medium, large)
- Different formats (JPG, PNG)

---

## ✅ Quick Verification Checklist

### Return Flow ✓
- [ ] Navigation works
- [ ] All reasons selectable
- [ ] Gallery picker opens
- [ ] Camera opens (device only)
- [ ] Images preview correctly
- [ ] Remove image works
- [ ] Validation works (reason + images)
- [ ] API call successful
- [ ] Success message shows
- [ ] Navigation back works

### Exchange Flow ✓
- [ ] Auto-navigation from "Size/fit issue"
- [ ] Size chart displays
- [ ] Sizes selectable (except unavailable)
- [ ] Unit toggle works
- [ ] How to measure tab works
- [ ] API call successful
- [ ] Thank you modal shows
- [ ] Navigation back works

### Cancel Flow ✓
- [ ] Button appears on cancelable orders
- [ ] First modal shows correctly
- [ ] Go Back closes modal
- [ ] Cancel Order processes request
- [ ] Loading state shows
- [ ] Confirmation modal appears
- [ ] Orders list refreshes
- [ ] Order status updates

---

## 🔍 Debug Commands

### Enable Verbose Logging
```javascript
// In app, enable debug mode:
// Settings > Developer Options > Enable Debug Logs

// Or in code:
console.log('🔧 Debug mode enabled');
```

### Check API Responses
```javascript
// In Chrome DevTools > Network tab:
// Filter by: /api/orders

// Look for:
- Status codes (200 = success, 400 = validation error, 500 = server error)
- Response body (should contain success: true)
- Request headers (should include Authorization: Bearer <token>)
```

---

## 📱 Device-Specific Testing

### iOS Testing
```bash
# Run on simulator
npx react-native run-ios

# Run on device
npx react-native run-ios --device "iPhone Name"

# Check permissions
Settings > Your App > Photos > Allow Access
Settings > Your App > Camera > Allow Access
```

### Android Testing
```bash
# Run on emulator
npx react-native run-android

# Run on device
adb devices
npx react-native run-android

# Check permissions
Settings > Apps > Your App > Permissions
- Camera: Allowed
- Storage: Allowed
```

---

## 🎯 Performance Testing

### Load Testing
```javascript
// Test with large images (5MB+)
// Expected: Should handle without crash
// Current: No compression implemented (future improvement)

// Test with slow network
// Expected: Loading indicators should show
// Expected: Proper error handling

// Test offline
// Expected: "No internet connection" error
```

---

## 📞 Support Contact

**Issues Found?**
- Log the error with console output
- Include order ID and user ID
- Note the exact steps to reproduce
- Check network logs

**Report Format:**
```
Issue: [Brief description]
Steps: [1, 2, 3...]
Expected: [What should happen]
Actual: [What actually happened]
Logs: [Console/network logs]
Device: [iOS/Android version]
```

---

## ✅ Sign-Off Checklist

Before marking testing complete:

- [ ] All 3 flows tested end-to-end
- [ ] All API calls verified in network tab
- [ ] All validations tested
- [ ] All error scenarios tested
- [ ] Permissions configured correctly
- [ ] UI/UX matches design
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Documentation reviewed

---

**Testing Duration:** ~15 minutes for full test suite  
**Last Updated:** October 14, 2025  
**Version:** 1.0.0
