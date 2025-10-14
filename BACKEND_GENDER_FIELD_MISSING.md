# Backend Gender Field Missing - Action Required

## Issue Summary

**Problem:** Gender field is not being returned by the backend API, even after successful profile updates.

**Evidence from Logs:**
```javascript
editprofile.js:163 📊 Populating form with backend profile data: {
  id: '68dae3fd47054fe75c651493',
  firstName: 'Rithik',
  lastName: 'Mahajan',
  email: 'rithikmahajan27@gmail.com',
  phone: '8717000084',
  profileImage: '',
  membershipTier: 'basic',
  pointsBalance: 0,
  isEmailVerified: true,
  isPhoneVerified: false,
  // ... other fields
}
editprofile.js:164 🎯 Gender from backend: undefined  ← MISSING!
editprofile.js:185 ✅ Form populated with gender: (empty)
```

**API Endpoint:** `GET http://185.193.19.244:8080/api/profile`

**Status:** 200 OK (Request succeeds but gender field is missing from response)

---

## Frontend Status ✅

The frontend has been **correctly updated** to:

1. ✅ **Always send gender** in profile update requests
2. ✅ **Include gender in payload** even if empty
3. ✅ **Log gender value** at every step
4. ✅ **Handle gender in UI** with dropdown selector

**Frontend Changes Made:**
- `src/screens/editprofile.js` - Lines 263-268: Gender always included in save payload
- Gender options: "Male", "Female", "Other"
- Comprehensive logging added to track gender flow

---

## Backend Issue Analysis

### Symptom 1: Gender Not Returned in GET Response

**Current Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "68dae3fd47054fe75c651493",
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "email": "rithikmahajan27@gmail.com",
    "phone": "8717000084",
    "profileImage": "",
    "membershipTier": "basic",
    "pointsBalance": 0,
    "isEmailVerified": true,
    "isPhoneVerified": false
    // ❌ NO GENDER FIELD!
  },
  "message": "Profile retrieved successfully"
}
```

**Expected Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "68dae3fd47054fe75c651493",
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "email": "rithikmahajan27@gmail.com",
    "phone": "8717000084",
    "profileImage": "",
    "membershipTier": "basic",
    "pointsBalance": 0,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "gender": "Male"  // ✅ SHOULD BE HERE!
  },
  "message": "Profile retrieved successfully"
}
```

### Symptom 2: Unknown if Gender is Being Saved

We need to verify:
1. ❓ Is frontend sending gender in PUT requests? (Should be YES after our fix)
2. ❓ Is backend receiving the gender field?
3. ❓ Is backend saving gender to database?
4. ❓ Is backend retrieving gender from database?
5. ❓ Is backend including gender in response?

---

## Required Backend Fixes

### Fix 1: Add Gender to Database Schema

**Check User/Profile Model:**
```javascript
// Example with MongoDB/Mongoose
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  profileImage: String,
  membershipTier: String,
  pointsBalance: Number,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  gender: String,  // ← ADD THIS FIELD!
  // ... other fields
});
```

**If using a different ORM/database:**
- Add `gender` column/field to users/profiles table
- Type: String/VARCHAR
- Nullable: true (optional field)
- Default: null or empty string

### Fix 2: Accept Gender in PUT/POST Requests

**Update Profile Endpoint Handler:**
```javascript
// Example: PUT /api/profile
router.put('/api/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, gender } = req.body;  // ← Extract gender
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        gender  // ← Save gender to database
      },
      { new: true }  // Return updated document
    );
    
    res.json({
      success: true,
      data: updatedUser,  // Should include gender
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Fix 3: Return Gender in GET Requests

**Update Profile Retrieval Handler:**
```javascript
// Example: GET /api/profile
router.get('/api/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user profile from database
    const user = await User.findById(userId);
    
    res.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        membershipTier: user.membershipTier,
        pointsBalance: user.pointsBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        gender: user.gender,  // ← INCLUDE GENDER IN RESPONSE!
        // ... other fields
      },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## Testing Checklist for Backend Team

### Test 1: Verify Gender Field Exists in Database
```sql
-- For SQL databases
ALTER TABLE users ADD COLUMN gender VARCHAR(20);

-- Verify column exists
DESCRIBE users;

-- For MongoDB
// Check if gender field exists in documents
db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493") })
```

**Expected Result:** Gender field should exist in database schema

### Test 2: Test PUT Request with Gender
```bash
# Test profile update with gender
curl -X PUT http://185.193.19.244:8080/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "phone": "8717000084",
    "gender": "Male"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "68dae3fd47054fe75c651493",
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "phone": "8717000084",
    "gender": "Male",  // ✅ Should be here!
    // ... other fields
  },
  "message": "Profile updated successfully"
}
```

### Test 3: Test GET Request Returns Gender
```bash
# Test profile retrieval
curl -X GET http://185.193.19.244:8080/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "68dae3fd47054fe75c651493",
    "firstName": "Rithik",
    "lastName": "Mahajan",
    "gender": "Male",  // ✅ Should be here!
    // ... other fields
  },
  "message": "Profile retrieved successfully"
}
```

### Test 4: Check Database Directly
```javascript
// For MongoDB
db.users.findOne({ _id: ObjectId("68dae3fd47054fe75c651493") })

// Should show:
{
  _id: ObjectId("68dae3fd47054fe75c651493"),
  firstName: "Rithik",
  lastName: "Mahajan",
  gender: "Male",  // ✅ Should be saved in database!
  // ... other fields
}
```

---

## Frontend Request Format (What We're Sending)

### PUT Request Body
```json
{
  "firstName": "Rithik",
  "lastName": "Mahajan",
  "phone": "8717000084",
  "gender": "Male"
}
```

**Endpoint:** `PUT http://185.193.19.244:8080/api/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

## Backend Validation (Recommended)

### Validate Gender Values
```javascript
const VALID_GENDERS = ['Male', 'Female', 'Other', ''];

router.put('/api/profile', authenticate, async (req, res) => {
  const { gender } = req.body;
  
  // Validate gender value
  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid gender value. Must be: Male, Female, Other, or empty'
    });
  }
  
  // Continue with update...
});
```

---

## Backend Logging (Recommended)

Add logging to track gender field:

```javascript
router.put('/api/profile', authenticate, async (req, res) => {
  console.log('📥 Profile update request received:', req.body);
  console.log('🎯 Gender field:', req.body.gender);
  
  // Update logic...
  
  console.log('💾 Saving to database with gender:', req.body.gender);
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
  console.log('✅ Updated user gender in DB:', updatedUser.gender);
  console.log('📤 Sending response with gender:', updatedUser.gender);
  
  res.json({
    success: true,
    data: updatedUser
  });
});

router.get('/api/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  
  console.log('📊 Retrieved user from DB:', {
    id: user._id,
    firstName: user.firstName,
    gender: user.gender  // ← Log gender value
  });
  
  res.json({ success: true, data: user });
});
```

---

## Common Backend Issues to Check

### Issue 1: Field Not in Schema
**Symptom:** Gender not saving to database
**Fix:** Add `gender: String` to user/profile schema

### Issue 2: Field Not Extracted from Request
**Symptom:** Gender in request body but not being saved
**Fix:** Add `gender` to destructured fields: `const { firstName, lastName, gender } = req.body;`

### Issue 3: Field Not Returned in Response
**Symptom:** Gender in database but not in API response
**Fix:** Include gender in response object or use `.select()` to include all fields

### Issue 4: Mongoose `.select()` Excluding Field
**Symptom:** Field exists but not returned
**Fix:** Check if query uses `.select()` and excludes gender: `User.findById(id).select('-password')` should be `User.findById(id).select('-password +gender')`

### Issue 5: Field Name Mismatch
**Symptom:** Frontend sends "gender" but backend expects different name
**Fix:** Ensure field name is exactly "gender" (lowercase) in both frontend and backend

### Issue 6: Serializer/Transformer Excluding Field
**Symptom:** Field in model but excluded by serializer
**Fix:** Update user serializer/transformer to include gender field

---

## Environment Information

**Backend Server:** `http://185.193.19.244:8080`
**User ID:** `68dae3fd47054fe75c651493`
**Endpoint:** `/api/profile`
**Method:** GET (for retrieval), PUT (for update)

---

## Verification Steps

Once backend is fixed, verify with these steps:

### Step 1: Check Logs After Save
Open iOS Simulator and select gender "Male", then click Save. Check console logs for:

```
💾 === SAVE STARTED ===
🎯 formData.gender value: Male
💾 === PROFILE UPDATE PAYLOAD ===
💾 Saving profile data to backend: {
  "firstName": "Rithik",
  "lastName": "Mahajan",
  "phone": "8717000084",
  "gender": "Male"  ✅ Should be here
}
🎯 Gender in payload: Male
```

### Step 2: Check Backend Request Logs
Backend should log:
```
📥 Profile update request received: {gender: "Male", ...}
🎯 Gender field: Male
💾 Saving to database with gender: Male
```

### Step 3: Check Backend Response
Frontend should log:
```
✅ Profile updated successfully: {gender: "Male", ...}
🎯 Gender in backend response: Male
```

### Step 4: Check Subsequent Profile Load
```
📊 Profile from backend: {success: true, data: {...}}
🎯 Gender from backend: Male  ✅ Should NOT be undefined!
✅ Form populated with gender: Male
```

### Step 5: Check UI
- Gender dropdown should show "Male" (selected value)
- Not "Select Gender" placeholder

---

## Expected Timeline

1. **Backend team adds gender field to schema** - 5 minutes
2. **Backend team updates GET/PUT handlers** - 10 minutes
3. **Backend team deploys changes** - 5 minutes
4. **Frontend team tests** - 5 minutes
5. **Verify gender saves and displays** - Complete! ✅

**Total estimated time:** ~25 minutes

---

## Contact Points

**Frontend Status:** ✅ Ready (all changes deployed)
**Backend Status:** ⚠️ Needs update (gender field missing)

**Action Required:** Backend team needs to:
1. Add `gender` field to user/profile schema
2. Accept `gender` in PUT /api/profile
3. Return `gender` in GET /api/profile
4. Deploy changes to production server

---

## Success Criteria

### Before Fix
- ❌ Gender from backend: `undefined`
- ❌ UI shows "Select Gender" even after saving
- ❌ User selections not persisted

### After Fix
- ✅ Gender from backend: `"Male"` (or selected value)
- ✅ UI shows selected gender
- ✅ User selections persisted across sessions

---

## Additional Notes

### Database Migration (if needed)

If users already exist in database without gender field:

```javascript
// For MongoDB - Add gender field to existing users
db.users.updateMany(
  { gender: { $exists: false } },  // Find users without gender field
  { $set: { gender: "" } }          // Set default empty string
)
```

### API Documentation Update

Update API documentation to include gender field:

**User Profile Object:**
```javascript
{
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  gender: String,  // Values: "Male", "Female", "Other", ""
  profileImage: String,
  membershipTier: String,
  pointsBalance: Number,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean
}
```

---

**Document Created:** January 2025  
**Issue:** Backend gender field missing from API responses  
**Frontend Status:** ✅ Fixed and ready  
**Backend Status:** ⚠️ Requires update  
**Priority:** Medium (feature not working but not blocking)  
**User Impact:** Users cannot save gender preference

---

## Quick Reference

**User ID:** `68dae3fd47054fe75c651493`  
**API Base:** `http://185.193.19.244:8080`  
**Missing Field:** `gender`  
**Expected Values:** `"Male"`, `"Female"`, `"Other"`, `""`  
**Current Value:** `undefined` (not in response)  

**Next Step:** Backend team to add gender field support
