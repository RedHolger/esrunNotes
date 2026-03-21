# WhatsApp and Email Features Setup Guide

## Current Issues
Both WhatsApp and email features are failing because:
1. Email is configured with Ethereal (testing) instead of real email service
2. Twilio credentials are missing for WhatsApp
3. Environment variables are not properly configured

## Required Environment Variables

Add these to your Render dashboard → Environment:

### Email Configuration (Gmail Example)
```bash
# Gmail SMTP (Recommended for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password
EMAIL_FROM=NurseNotes <noreply@nursenotes.com>

# Alternative: SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=YOUR_SENDGRID_API_KEY
EMAIL_FROM=NurseNotes <noreply@nursenotes.com>
```

### WhatsApp Configuration (Twilio)
```bash
# Twilio Required
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
TWILIO_WHATSAPP_NUMBER=your-twilio-whatsapp-number  # Format: +14155238886
```

## Setup Steps

### 1. Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "NurseNotes"
4. Use the app password as EMAIL_PASS

### 2. Twilio Setup for WhatsApp
1. Sign up for Twilio account: https://www.twilio.com
2. Get your Account SID and Auth Token from Dashboard
3. Purchase a Twilio phone number
4. Enable WhatsApp Sandbox:
   - Go to Messaging → Try it out → WhatsApp
   - Follow the setup instructions
   - Get your WhatsApp-enabled number

### 3. Update Render Environment
1. Go to: https://dashboard.render.com/web/srv-esrunnotes-xxxx/env
2. Add all the EMAIL_* and TWILIO_* variables
3. Redeploy the application

## Code Fixes Needed

The current code has these issues:

### 1. Email Transporter (lines 27-35 in route.ts)
```typescript
// CURRENT (BROKEN):
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER || 'YOUR_ETHEREAL_USER',
    pass: process.env.ETHEREAL_PASSWORD || 'YOUR_ETHEREAL_PASSWORD',
  },
});

// SHOULD BE:
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### 2. Missing WhatsApp Number
```typescript
// CURRENT (line 215):
from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
```

### 3. Config File Missing Email/Twilio
Add to lib/config.ts:
```typescript
export const config = {
  // ... existing AI keys
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
};
```

## Testing

After setup, test with:
```bash
# Test email
curl -X POST https://esrunnotes.onrender.com/api/actions \
  -H "Content-Type: application/json" \
  -d '{"actions": ["email"], "email": "your@email.com", "analysis": {"summary": "Test summary"}}'

# Test WhatsApp
curl -X POST https://esrunnotes.onrender.com/api/actions \
  -H "Content-Type: application/json" \
  -d '{"actions": ["whatsapp"], "whatsapp": "+1234567890", "analysis": {"summary": "Test summary"}}'
```

## Common Issues

1. **Gmail App Password**: Must use App Password, not regular password
2. **Twilio WhatsApp**: Must complete WhatsApp sandbox setup
3. **Environment Variables**: Must be set in Render dashboard, not .env.local
4. **Phone Number Format**: Must include country code (+1234567890)

## Security Notes

- Never commit real credentials to git
- Use separate credentials for production
- Regularly rotate API keys and passwords
- Monitor Twilio usage and costs
