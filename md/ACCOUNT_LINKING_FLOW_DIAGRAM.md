# Account Linking Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER TRIES TO SIGN IN                         │
│                   (Apple, Google, or Email)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Firebase Auth │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Backend Check  │
                    │ (yoraaAPI)     │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
         ┌──────────┐            ┌──────────────┐
         │ SUCCESS  │            │  409 CONFLICT│
         │ (200)    │            │  DETECTED    │
         └────┬─────┘            └──────┬───────┘
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌────────────────────┐
    │  Normal Login    │      │ AccountLinkModal   │
    │  Flow            │      │ Appears            │
    └──────────────────┘      └─────────┬──────────┘
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                        ┌──────────┐        ┌──────────┐
                        │  LINK    │        │  CANCEL  │
                        └────┬─────┘        └────┬─────┘
                             │                   │
                             ▼                   ▼
                   ┌──────────────────┐    ┌──────────┐
                   │  ReAuthModal     │    │  Return  │
                   │  Appears         │    │  to      │
                   └────────┬─────────┘    │  Login   │
                            │              └──────────┘
                   ┌────────┴────────┐
                   ▼                 ▼
            ┌──────────┐       ┌──────────┐
            │ RE-AUTH  │       │  CANCEL  │
            │ SUCCESS  │       └────┬─────┘
            └────┬─────┘            │
                 │                  ▼
                 │            ┌──────────┐
                 │            │  Return  │
                 │            │  to      │
                 │            │  Login   │
                 │            └──────────┘
                 ▼
        ┌─────────────────┐
        │ Link Provider   │
        │ (Backend)       │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   ┌─────────┐      ┌──────────┐
   │ SUCCESS │      │  ERROR   │
   └────┬────┘      └────┬─────┘
        │                │
        ▼                ▼
   ┌─────────┐      ┌──────────┐
   │Navigate │      │Show Error│
   │to Home  │      │Alert     │
   │or T&C   │      └──────────┘
   └─────────┘
```

---

## Detailed Step-by-Step

### Step 1: Initial Sign In Attempt
```
User clicks "Sign in with Apple"
         ↓
appleAuthService.signInWithApple()
         ↓
Firebase Auth → Success
         ↓
Get Firebase ID Token
         ↓
yoraaAPI.firebaseLogin(idToken)
         ↓
Backend checks if user exists
```

### Step 2: Conflict Detection
```
Backend finds existing account with different provider
         ↓
Returns HTTP 409 with data:
{
  email: "user@example.com",
  existing_methods: ["email"],
  message: "Account exists..."
}
         ↓
yoraaAPI catches 409
         ↓
Creates conflictError with isAccountConflict: true
         ↓
Throws back to appleAuthService
         ↓
appleAuthService signs out from Firebase
         ↓
Throws back to loginaccountemail.js
         ↓
catch block detects isAccountConflict
         ↓
handleAccountConflict(error, 'apple')
```

### Step 3: AccountLinkModal Flow
```
setLinkingData({
  email: "user@example.com",
  existingMethod: "email",
  newProvider: "apple",
  conflictData: {...}
})
         ↓
setShowLinkModal(true)
         ↓
AccountLinkModal appears
         ↓
User sees:
  "Account with user@example.com exists using Email/Password"
  [Link Apple to existing account]  [Cancel]
```

#### User Clicks "Link"
```
handleLinkAccounts()
         ↓
setShowLinkModal(false)
setShowReAuthModal(true)
         ↓
ReAuthModal appears
```

#### User Clicks "Cancel"
```
handleCancelLinking()
         ↓
setShowLinkModal(false)
setLinkingData(null)
         ↓
User back at login screen
```

### Step 4: ReAuthModal Flow
```
ReAuthModal shows based on existingMethod:

If Email:
  [Password Input Field]
  [Verify & Link Account Button]

If Google:
  [Sign in with Google Button]

If Apple:
  [Sign in with Apple Button]
```

#### User Authenticates
```
handleReAuthenticate(password)
         ↓
accountLinkingService.completeAccountLinking(
  existingMethod: "email",
  newProvider: "apple",
  email: "user@example.com",
  password: "user-password"
)
```

### Step 5: Account Linking Service Flow
```
Step 1: Re-authenticate with existing method
         ↓
reAuthenticateUser("email", "user@example.com", "password")
         ↓
auth().signInWithEmailAndPassword(email, password)
         ↓
Get Firebase ID Token
         ↓
yoraaAPI.firebaseLogin(idToken)
         ↓
Receives JWT token
         ↓
Returns token

Step 2: Link new provider
         ↓
linkNewProvider("apple")
         ↓
appleAuthService.signInWithApple()
         ↓
Get Apple Firebase ID Token
         ↓
yoraaAPI.linkAuthProvider(appleIdToken)
         ↓
Backend links Apple to account
         ↓
Returns updated user with linkedProviders: ["email", "apple"]
```

### Step 6: Success Flow
```
setShowReAuthModal(false)
setLinkingData(null)
         ↓
Show Alert:
  "Your apple account has been linked successfully!
   You can now sign in using either method."
         ↓
User clicks OK
         ↓
Navigate based on context:
  - fromCheckout: TermsAndConditions
  - normal: Home
```

---

## State Management

### Modal States
```javascript
[showLinkModal, setShowLinkModal]       // true when conflict detected
[showReAuthModal, setShowReAuthModal]   // true after user clicks "Link"
[linkingData, setLinkingData]           // Contains email, methods, etc.
[isLoading, setIsLoading]               // true during operations
```

### Linking Data Structure
```javascript
{
  email: "user@example.com",
  existingMethod: "email",      // What they have
  newProvider: "apple",          // What they tried
  conflictData: {                // Full 409 response data
    status: "account_exists",
    email: "user@example.com",
    existing_methods: ["email"],
    message: "..."
  }
}
```

---

## Error Handling Points

### Point 1: Initial Sign In
```
Apple/Google Auth fails
    ↓
Show error alert
Return to login
```

### Point 2: Backend Conflict Detection
```
409 received but malformed data
    ↓
Log error
Show generic error
Return to login
```

### Point 3: Re-Authentication
```
Wrong password entered
    ↓
Show error alert
Keep modal open
Allow retry
```

### Point 4: Provider Linking
```
Backend returns error
    ↓
Show error alert
Close modals
Return to login
```

### Point 5: Network Issues
```
Network timeout
    ↓
Show error alert
Allow retry or cancel
```

---

## Navigation Paths

### Success Path (from Checkout)
```
Login Screen
    → Conflict Detected
    → AccountLinkModal
    → ReAuthModal
    → Link Success
    → TermsAndConditions Screen
    → (Continue checkout)
```

### Success Path (normal)
```
Login Screen
    → Conflict Detected
    → AccountLinkModal
    → ReAuthModal
    → Link Success
    → Home Screen
```

### Cancel Path
```
Login Screen
    → Conflict Detected
    → AccountLinkModal
    → Cancel Clicked
    → Login Screen
```

### Error Path
```
Login Screen
    → Conflict Detected
    → AccountLinkModal
    → ReAuthModal
    → Error Occurred
    → Error Alert
    → Login Screen
```

---

## Backend Communication

### Request Flow
```
Frontend                          Backend
   |                                 |
   |-- POST /api/auth/login/firebase |
   |   {idToken: "..."}              |
   |                                 |
   |         409 Conflict <----------|
   |   {existing_methods: [...]}     |
   |                                 |
   |-- POST /api/auth/link-provider  |
   |   {idToken: "..."}              |
   |   Authorization: Bearer <JWT>   |
   |                                 |
   |         200 Success <-----------|
   |   {linkedProviders: [...]}      |
   |                                 |
```

### Token Flow
```
1. Initial Sign In (fails with 409)
   Firebase Token → Backend → 409 + conflict data

2. Re-Authentication
   Firebase Token → Backend → JWT Token

3. Link Provider
   New Firebase Token + Old JWT Token → Backend → Success
```

---

## Component Hierarchy

```
LoginAccountEmail
├── AccountLinkModal (conditional)
│   ├── Shows when showLinkModal = true
│   ├── Triggers handleLinkAccounts() or handleCancelLinking()
│   └── Closes when user makes choice
│
└── ReAuthModal (conditional)
    ├── Shows when showReAuthModal = true
    ├── Renders based on linkingData.existingMethod
    ├── Triggers handleReAuthenticate(password)
    └── Closes on success or cancel
```

---

## Data Flow

```
User Action
    ↓
Component State Update
    ↓
Service Layer (accountLinkingService)
    ↓
Auth Service (appleAuthService/googleAuthService)
    ↓
Firebase
    ↓
API Service (yoraaAPI)
    ↓
Backend
    ↓
Response
    ↓
State Update
    ↓
UI Update
```

---

## Security Checkpoints

```
1. ✅ Firebase Authentication
   User must authenticate with provider

2. ✅ Backend Validation
   Backend verifies Firebase token

3. ✅ Re-Authentication Required
   User must prove ownership before linking

4. ✅ JWT Token Required
   Link endpoint requires valid JWT

5. ✅ Sign Out on Conflict
   Prevents partial authentication states
```

---

This diagram provides a complete visual reference for understanding how the account linking feature works from start to finish.
