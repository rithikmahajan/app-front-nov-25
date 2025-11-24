# 🎯 QUICK START: Run E-Commerce Tests

## ⚡ TL;DR - Run Tests Now

```bash
cd /Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10
./run-ecommerce-tests.sh
```

---

## 📋 Before You Run (5 Minutes Setup)

### 1. Update Test Configuration

Open `COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js` and update line 59-81:

```javascript
testUsers: {
  phone: {
    phoneNumber: '+919999999999', // ← PUT YOUR TEST PHONE HERE
  },
  email: {
    email: 'test@yoraa.com',      // ← PUT YOUR TEST EMAIL HERE
    password: 'Test@123456',       // ← PUT PASSWORD HERE
  },
},

testProducts: {
  basic: '507f1f77bcf86cd799439011',    // ← PUT REAL PRODUCT ID
  withSizes: '507f1f77bcf86cd799439012', // ← PUT REAL PRODUCT ID
  bundle: '507f1f77bcf86cd799439013',    // ← PUT REAL PRODUCT ID
},
```

### 2. Get Real Product IDs

Run this to get product IDs from your backend:

```bash
curl https://api.yoraa.in.net/api/products | grep '"_id"' | head -3
```

Copy the IDs and paste into the config above.

---

## 🚀 Three Ways to Run Tests

### Option 1: Quick Run (Recommended)

```bash
./run-ecommerce-tests.sh
```

This script will:
- ✅ Check Node.js is installed
- ✅ Verify backend is accessible
- ✅ Run all tests
- ✅ Generate a comprehensive report

### Option 2: Direct Run

```bash
node COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js
```

### Option 3: Run from Your App

Add this to your app (e.g., in a debug screen):

```javascript
import ComprehensiveTestRunner from './COMPREHENSIVE_ECOMMERCE_TEST_SUITE';

// Add button
<Button 
  title="Run E-Commerce Tests" 
  onPress={async () => {
    const runner = new ComprehensiveTestRunner();
    await runner.runAllTests();
  }} 
/>
```

---

## 📊 What Gets Tested

The test suite validates **45+ test cases** across:

### 🔐 Authentication (6 tests)
- Email Login/Signup
- Phone OTP (requires manual verification)
- Apple Sign In (requires manual verification)
- Google Sign In (requires manual verification)
- Session Persistence

### 🛍️ Product Browsing (5 tests)
- Home page load
- Product listing
- Product details
- Search functionality
- Category navigation

### 🛒 Shopping Cart (5 tests)
- Add to cart
- View cart
- Update quantity
- Remove items
- Cart persistence

### 💳 Checkout (4 tests)
- Checkout initiation
- Address selection
- Payment gateway
- Promo codes

### 📦 Orders (3 tests)
- Order history
- Order details
- Order tracking

### 👤 Profile (2 tests)
- View profile
- Update profile

### 🚪 Logout (2 tests)
- User logout
- Data cleanup

---

## 📈 Reading Test Results

### Success Output
```
✅ PASS (1234ms): Email/Password Login
⚡ PERFORMANCE OK: Email Login completed in 1234ms (threshold: 5000ms)
```

### Failure Output
```
❌ FAIL (5678ms): Product Search
   Error: Failed to load search results
   Stack: TypeError: Cannot read property 'products' of undefined
```

### Warning Output
```
⚠️  WARNING: SLOW: Add to Cart took 750ms (threshold: 500ms)
```

### Skip Output
```
⏭️  SKIP: Apple Sign In - Requires user interaction
```

---

## 🎯 Final Report Example

```
================================================================================
📊 TEST EXECUTION REPORT
================================================================================
Total Tests: 45
✅ Passed: 38 (84.4%)
❌ Failed: 5 (11.1%)
⏭️  Skipped: 2 (4.4%)
⚠️  Warnings: 8
⏱️  Total Duration: 67.45s
================================================================================

📊 INDUSTRY BENCHMARK COMPARISON (H&M, Zara)
================================================================================
✓ Success Rate: 84.4%
  Industry Standard: >95%
  Status: ⚠️  NEEDS IMPROVEMENT

✓ Average Response Time: 1.50s
  Industry Standard: <2s per operation
  Status: ✅ PASS

✓ Failed Tests: 5
  Industry Standard: 0 critical failures
  Status: ⚠️  NEEDS ATTENTION
================================================================================
```

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Network Error"
**Symptom:** Tests fail with network/connection errors

**Fix:**
```bash
# Check backend is running
curl https://api.yoraa.in.net/api/health

# Should return: {"status":"ok"}
```

### Issue 2: "Product Not Found"
**Symptom:** Product tests fail with 404 errors

**Fix:**
```bash
# Get real product IDs from backend
curl https://api.yoraa.in.net/api/products | grep "_id"

# Update TEST_CONFIG.testProducts in test file
```

### Issue 3: "Authentication Failed"
**Symptom:** Login tests fail

**Fix:**
1. Check test credentials are correct
2. Verify Firebase is configured
3. Ensure user exists in backend:
```bash
# Try logging in manually in the app first
```

### Issue 4: "Node.js not found"
**Symptom:** Script can't run

**Fix:**
```bash
# Install Node.js
brew install node

# Verify installation
node --version
```

---

## ✅ Success Checklist

Your app passes industry standards when:

- [ ] **>95% tests pass** (Target: H&M/Zara level)
- [ ] **No critical failures** in authentication
- [ ] **Cart operations < 500ms** (Performance target)
- [ ] **Checkout flow works** end-to-end
- [ ] **Data cleanup works** on logout
- [ ] **All performance thresholds met**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js` | The actual test suite code |
| `ECOMMERCE_TEST_SUITE_README.md` | Detailed documentation |
| `INDUSTRY_COMPARISON_HM_ZARA.md` | How YORAA compares to H&M/Zara |
| `run-ecommerce-tests.sh` | Quick run script |
| This file | Quick start guide |

---

## 🎯 Next Steps After Running Tests

### If All Tests Pass ✅
1. ✨ Celebrate! Your app meets industry standards
2. 📱 Test on real devices (iOS + Android)
3. 🧪 Run manual tests for skipped items
4. 📊 Monitor performance in production
5. 🔄 Set up automated testing in CI/CD

### If Some Tests Fail ❌
1. 📝 Review failed test details
2. 🔍 Check backend logs for errors
3. 🔧 Fix issues one category at a time
4. ♻️  Re-run tests after fixes
5. 📞 Contact support if stuck

### Priority Order for Fixes
1. **Critical**: Authentication, Payment, Checkout
2. **High**: Cart, Product Browsing, Orders
3. **Medium**: Profile, Search, Filters
4. **Low**: Performance optimizations

---

## 💡 Pro Tips

1. **Run tests in production mode** for accurate performance metrics
2. **Keep test user separate** from real users
3. **Monitor backend logs** while testing
4. **Test on both platforms** (iOS & Android)
5. **Use real devices** not just simulators
6. **Run tests regularly** before each release

---

## 🆘 Need Help?

### Debug Mode
Add this to see detailed logs:
```javascript
// In test file, line 1
console.log = (...args) => { /* your custom logger */ };
```

### Check Backend Status
```bash
# Health check
curl https://api.yoraa.in.net/api/health

# Test authentication
curl -X POST https://api.yoraa.in.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phNo":"9999999999","password":"test123"}'
```

### Common Commands
```bash
# View test file
cat COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js | less

# Search for specific test
grep -n "testEmailPasswordLogin" COMPREHENSIVE_ECOMMERCE_TEST_SUITE.js

# Check script permissions
ls -la run-ecommerce-tests.sh
```

---

**Ready to test?** Run: `./run-ecommerce-tests.sh`

**Last Updated:** November 24, 2024
