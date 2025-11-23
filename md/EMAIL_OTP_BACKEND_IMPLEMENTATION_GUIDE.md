# Email OTP Backend Implementation Guide

## 📋 Overview

This guide provides complete backend implementation requirements for the Email OTP authentication feature in the Yoraa app. The frontend is now ready and will call these endpoints in production.

---

## 🎯 Required API Endpoints

### 1. Send Email OTP
**Endpoint:** `POST /api/auth/send-email-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to send OTP. Please try again."
}
```

**Status Codes:**
- `200` - OTP sent successfully
- `400` - Invalid email format
- `429` - Too many requests (rate limiting)
- `500` - Server error

---

### 2. Verify Email OTP
**Endpoint:** `POST /api/auth/verify-email-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "jwt_access_token_here",
  "refreshToken": "jwt_refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+1234567890",
    "profilePicture": "url_to_image"
  }
}
```

**Response (Error - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP. Please check and try again."
}
```

**Response (Error - Expired OTP):**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

**Response (Error - Too Many Attempts):**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new OTP."
}
```

**Status Codes:**
- `200` - OTP verified successfully (returns JWT tokens)
- `400` - Invalid request (missing email/otp)
- `401` - Invalid or expired OTP
- `429` - Too many failed attempts
- `500` - Server error

---

## 🔐 Security Requirements

### 1. **OTP Generation**
- Generate a **6-digit numeric OTP** (100000 to 999999)
- Use cryptographically secure random number generator
- Example (Node.js):
  ```javascript
  const crypto = require('crypto');
  const otp = crypto.randomInt(100000, 999999).toString();
  ```

### 2. **OTP Storage**
- Store OTP in database with these fields:
  ```javascript
  {
    email: String,
    otp: String,  // Hashed (recommended) or encrypted
    createdAt: Date,
    expiresAt: Date,  // 5 minutes from creation
    attempts: Number,  // Track failed verification attempts
    verified: Boolean  // Mark as used after successful verification
  }
  ```

### 3. **OTP Expiry**
- **5 minutes** validity period
- Delete or mark as expired after 5 minutes
- Don't allow verification of expired OTPs

### 4. **Rate Limiting**
- **Send OTP:** Maximum 3 requests per email per hour
- **Verify OTP:** Maximum 5 failed attempts per OTP
- Lock account temporarily after excessive failed attempts

### 5. **OTP Security**
- Hash OTP before storing (using bcrypt or similar)
- Don't log OTP in production
- Don't return OTP in API responses
- Invalidate OTP after successful verification

### 6. **Email Validation**
- Validate email format before sending OTP
- Check if email exists in your user database
- Consider email verification status

---

## 📧 Email Service Implementation

### Email Template

**Subject:** `Your Yoraa Verification Code`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yoraa OTP</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Yoraa</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
    
    <p>Hello,</p>
    
    <p>Your verification code for Yoraa is:</p>
    
    <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
      <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">{{OTP}}</h1>
    </div>
    
    <p>This code will expire in <strong>5 minutes</strong>.</p>
    
    <p>If you didn't request this code, please ignore this email or contact our support team.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px;">
      <p>© 2025 Yoraa. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

**Plain Text Body:**
```
Hello,

Your verification code for Yoraa is: {{OTP}}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

© 2025 Yoraa. All rights reserved.
```

### Email Service Options

**Option 1: SendGrid**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOTPEmail(email, otp) {
  const msg = {
    to: email,
    from: 'noreply@yoraa.com', // Your verified sender
    subject: 'Your Yoraa Verification Code',
    text: `Your verification code is: ${otp}. Valid for 5 minutes.`,
    html: /* HTML template from above */
  };
  
  await sgMail.send(msg);
}
```

**Option 2: AWS SES**
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

async function sendOTPEmail(email, otp) {
  const params = {
    Source: 'noreply@yoraa.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Your Yoraa Verification Code' },
      Body: {
        Html: { Data: /* HTML template */ },
        Text: { Data: `Your verification code is: ${otp}` }
      }
    }
  };
  
  await ses.sendEmail(params).promise();
}
```

**Option 3: Nodemailer (SMTP)**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: '"Yoraa" <noreply@yoraa.com>',
    to: email,
    subject: 'Your Yoraa Verification Code',
    text: `Your verification code is: ${otp}`,
    html: /* HTML template */
  });
}
```

---

## 💻 Sample Backend Implementation (Node.js/Express)

### Database Schema (MongoDB)
```javascript
const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete expired documents
  }
}, {
  timestamps: true
});

// Hash OTP before saving
emailOTPSchema.pre('save', async function(next) {
  if (this.isModified('otp')) {
    const bcrypt = require('bcrypt');
    this.otp = await bcrypt.hash(this.otp, 10);
  }
  next();
});

// Method to verify OTP
emailOTPSchema.methods.verifyOTP = async function(inputOTP) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(inputOTP, this.otp);
};

const EmailOTP = mongoose.model('EmailOTP', emailOTPSchema);
module.exports = EmailOTP;
```

### Route Handler: Send OTP
```javascript
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const EmailOTP = require('../models/EmailOTP');
const { sendOTPEmail } = require('../services/emailService');

router.post('/auth/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }
    
    // Check rate limiting (3 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await EmailOTP.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: oneHourAgo }
    });
    
    if (recentOTPs >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.'
      });
    }
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in database (will be hashed by pre-save hook)
    await EmailOTP.create({
      email: email.toLowerCase(),
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
    
    // Send email
    await sendOTPEmail(email, otp);
    
    console.log(`✅ OTP sent to ${email}`);
    // DO NOT log OTP in production!
    // console.log(`OTP: ${otp}`); // Only for development
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

module.exports = router;
```

### Route Handler: Verify OTP
```javascript
router.post('/auth/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Find the most recent non-verified OTP for this email
    const otpRecord = await EmailOTP.findOne({
      email: email.toLowerCase(),
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }
    
    // Check failed attempts
    if (otpRecord.attempts >= 5) {
      await otpRecord.deleteOne();
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }
    
    // Verify OTP
    const isValid = await otpRecord.verifyOTP(otp);
    
    if (!isValid) {
      // Increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }
    
    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    
    // Find or create user
    const User = require('../models/User');
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email: email.toLowerCase(),
        emailVerified: true,
        authMethod: 'email-otp'
      });
    } else {
      // Update existing user
      user.emailVerified = true;
      await user.save();
    }
    
    // Generate JWT tokens
    const jwt = require('jsonwebtoken');
    
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log(`✅ OTP verified for ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profilePicture: user.profilePicture
      }
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

module.exports = router;
```

---

## 🧪 Testing

### Manual Testing with Postman/curl

**1. Send OTP:**
```bash
curl -X POST https://api.yoraa.com/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**2. Verify OTP:**
```bash
curl -X POST https://api.yoraa.com/api/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### Unit Tests (Jest)
```javascript
describe('Email OTP API', () => {
  describe('POST /api/auth/send-email-otp', () => {
    it('should send OTP successfully', async () => {
      const res = await request(app)
        .post('/api/auth/send-email-otp')
        .send({ email: 'test@example.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
    
    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/send-email-otp')
        .send({ email: 'invalid-email' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should rate limit excessive requests', async () => {
      // Send 3 OTPs
      await Promise.all([
        request(app).post('/api/auth/send-email-otp').send({ email: 'test@example.com' }),
        request(app).post('/api/auth/send-email-otp').send({ email: 'test@example.com' }),
        request(app).post('/api/auth/send-email-otp').send({ email: 'test@example.com' })
      ]);
      
      // 4th should be rate limited
      const res = await request(app)
        .post('/api/auth/send-email-otp')
        .send({ email: 'test@example.com' });
      
      expect(res.status).toBe(429);
    });
  });
  
  describe('POST /api/auth/verify-email-otp', () => {
    it('should verify valid OTP', async () => {
      // First send OTP
      await request(app)
        .post('/api/auth/send-email-otp')
        .send({ email: 'test@example.com' });
      
      // Get OTP from database (for testing)
      const otpRecord = await EmailOTP.findOne({ email: 'test@example.com' });
      
      // Verify
      const res = await request(app)
        .post('/api/auth/verify-email-otp')
        .send({ email: 'test@example.com', otp: '123456' }); // Use real OTP in test
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
    
    it('should reject invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email-otp')
        .send({ email: 'test@example.com', otp: '000000' });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

---

## 📝 Environment Variables

Add these to your `.env` file:

```bash
# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email Configuration
EMAIL_FROM=noreply@yoraa.com
EMAIL_FROM_NAME=Yoraa

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_PER_HOUR=3
```

---

## 🚀 Deployment Checklist

- [ ] Email service configured (SendGrid/SES/SMTP)
- [ ] Email templates tested
- [ ] Database schema created
- [ ] API endpoints implemented
- [ ] Rate limiting configured
- [ ] OTP hashing implemented
- [ ] JWT token generation working
- [ ] Environment variables set
- [ ] Email sender domain verified
- [ ] API endpoints tested with Postman
- [ ] Unit tests passing
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] Production email tested

---

## 🔍 Troubleshooting

### Email Not Sending
1. Check email service API key/credentials
2. Verify sender email is verified with provider
3. Check spam/junk folder
4. Review email service logs
5. Check rate limits on email provider

### OTP Verification Failing
1. Verify OTP hasn't expired (5 minutes)
2. Check if OTP is being hashed correctly
3. Ensure case-sensitivity is handled
4. Check failed attempt limits
5. Verify database queries

### Rate Limiting Issues
1. Adjust rate limits if too restrictive
2. Clear old OTP records from database
3. Check time zone settings
4. Verify MongoDB TTL index is working

---

## 📚 Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ✅ Frontend Integration Status

✅ **Frontend is READY** - The following has been implemented:
- `emailOTPService.js` updated to call backend APIs in production
- Development mode fallback for testing (returns `devOTP`)
- Production mode calls `/api/auth/send-email-otp` and `/api/auth/verify-email-otp`
- Error handling and user feedback implemented
- No dev alerts shown in production builds

**Backend needs to implement the 2 endpoints above for production to work!**

---

## 📞 Support

If you have questions about this implementation, contact:
- Frontend Team: [Your contact]
- Backend Team: [Backend team contact]
- DevOps: [DevOps contact]

---

**Generated:** November 20, 2025  
**Version:** 1.0  
**Author:** Yoraa Development Team
