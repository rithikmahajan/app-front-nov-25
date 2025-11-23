# How to Add FAQs to Backend

Since the FAQ endpoint is working but returning empty data, here's how to populate it with FAQs.

## Option 1: Using Backend Admin API (Recommended)

If your backend has an admin FAQ creation endpoint:

```bash
curl -X POST http://localhost:8001/api/admin/faqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "question": "How do I track my order?",
    "answer": "You can track your order by going to the Orders section in your profile and clicking on the specific order. You will see real-time tracking information.",
    "category": "orders",
    "order": 1,
    "isActive": true
  }'
```

## Option 2: Direct Database Insert

If you have access to MongoDB:

```javascript
// Connect to MongoDB
use yoraa_db

// Insert sample FAQs
db.faqs.insertMany([
  {
    question: "How do I create an account?",
    answer: "Tap on 'Sign Up' on the home screen and follow the prompts to create your account using email or social login.",
    category: "account",
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "How do I track my order?",
    answer: "You can track your order by going to the Orders section in your profile and clicking on the specific order. You will see real-time tracking information.",
    category: "orders",
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit cards, debit cards, UPI, net banking, and various mobile wallets through our secure payment gateway.",
    category: "payments",
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery in select areas.",
    category: "shipping",
    order: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for most items. Products must be unused and in original packaging. Please contact support to initiate a return.",
    category: "returns",
    order: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Option 3: Using a Script

Create a file `seed-faqs.js` in your backend project:

```javascript
const mongoose = require('mongoose');
const FAQ = require('./models/FAQ'); // Adjust path to your FAQ model

const sampleFAQs = [
  {
    question: "How do I create an account?",
    answer: "Tap on 'Sign Up' on the home screen and follow the prompts to create your account using email or social login.",
    category: "account",
    order: 1,
    isActive: true
  },
  {
    question: "How do I track my order?",
    answer: "You can track your order by going to the Orders section in your profile and clicking on the specific order.",
    category: "orders",
    order: 2,
    isActive: true
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit cards, debit cards, UPI, net banking, and various mobile wallets.",
    category: "payments",
    order: 3,
    isActive: true
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/yoraa_db');
    
    // Clear existing FAQs (optional)
    await FAQ.deleteMany({});
    
    // Insert new FAQs
    await FAQ.insertMany(sampleFAQs);
    
    console.log('✅ FAQs seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
```

Run it:
```bash
node seed-faqs.js
```

## Verify FAQs Were Added

```bash
curl http://localhost:8001/api/faqs
```

Should now return:
```json
{
  "success": true,
  "message": "FAQs retrieved successfully",
  "data": {
    "faqs": [
      {
        "id": 1,
        "question": "How do I create an account?",
        "answer": "Tap on 'Sign Up' on the home screen...",
        "category": "account",
        "order": 1,
        "isActive": true
      },
      // ... more FAQs
    ]
  }
}
```

## FAQ Categories (Suggested)

- `account` - Account and profile related questions
- `orders` - Order placement and tracking
- `payments` - Payment methods and issues
- `shipping` - Shipping and delivery
- `returns` - Returns and refunds
- `products` - Product information
- `general` - General app usage

## After Adding FAQs

1. Pull to refresh in the FAQ screen
2. FAQs should now appear
3. Test the expand/collapse functionality
4. Verify all categories work if implemented

---

**Note**: Make sure your backend FAQ model schema matches the data structure being inserted. Check your backend's `models/FAQ.js` or equivalent file for the exact schema requirements.
