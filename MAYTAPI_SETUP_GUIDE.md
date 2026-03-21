# Maytapi WhatsApp Setup Guide

## 🎯 What You Get
- **100 free WhatsApp messages per month**
- **No credit card required**
- **Easy setup in 10 minutes**
- **Works worldwide**

## 📋 Step-by-Step Setup

### Step 1: Create Maytapi Account
1. Go to: https://maytapi.com
2. Click "Sign Up" 
3. Enter your email and create password
4. Verify your email address
5. Login to your dashboard

### Step 2: Create WhatsApp Instance
1. In your dashboard, click "Create Instance"
2. Fill in the details:
   - **Instance Name**: `NurseNotes`
   - **Country**: Select your country
   - **Phone Number**: Your personal number (for verification)
3. Click "Create Instance"

### Step 3: Get Your Credentials
1. After creating instance, you'll see:
   - **API Key**: Copy this (looks like "12345...")
   - **Phone ID**: Copy this (looks like "7890...")
   - **WhatsApp Number**: The number assigned to your instance

### Step 4: Connect WhatsApp
1. Install WhatsApp on your smartphone
2. In Maytapi dashboard, click "Connect WhatsApp"
3. Scan the QR code with your phone
4. Wait for "Connected" status

### Step 5: Add to Render Environment
Go to your Render dashboard → Environment and add:
```bash
WHATSAPP_PROVIDER=maytapi
MAYTAPI_API_KEY=your-api-key-here
MAYTAPI_PHONE_ID=your-phone-id-here
```

## 🧪 Test Your Setup

After adding environment variables and redeploying:

```bash
curl -X POST https://esrunnotes.onrender.com/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actions": ["whatsapp"], 
    "whatsapp": "+1234567890",
    "analysis": {"summary": "Test message from NurseNotes"}
  }'
```

## 📱 How It Works

1. **Your app** sends request to Maytapi API
2. **Maytapi** forwards message through WhatsApp
3. **Recipient** gets message from your linked WhatsApp
4. **Free tier**: 100 messages/month

## 💰 Pricing

- **Free**: 100 messages/month
- **Paid**: $15/month for unlimited messages
- **No hidden fees**
- **Cancel anytime**

## ⚠️ Important Notes

### Phone Number Format
- Always include country code: `+1234567890`
- No spaces or dashes: `+1234567890`

### Message Limits
- Free tier: 100 messages/month
- Counter resets on 1st of each month
- You'll get email notification when reaching limit

### Content Rules
- No spam or promotional content
- No illegal or harmful content
- Respect WhatsApp terms of service

## 🛠️ Troubleshooting

### "API Key not found"
- Check MAYTAPI_API_KEY environment variable
- Make sure you copied the full API key

### "Phone ID not found"
- Check MAYTAPI_PHONE_ID environment variable
- Make sure the instance is active in Maytapi dashboard

### "WhatsApp not connected"
- Scan QR code again in Maytapi dashboard
- Make sure WhatsApp is installed on your phone
- Check internet connection on phone

### "Message not delivered"
- Verify recipient phone number format
- Check if recipient has WhatsApp
- Ensure you haven't exceeded monthly limit

## 🔄 Switching from Twilio

If you were using Twilio before:

1. Remove Twilio environment variables (optional)
2. Add Maytapi environment variables
3. Redeploy your application
4. The same API endpoint will work with Maytapi

## 📊 Monitoring

In your Maytapi dashboard you can see:
- Messages sent
- Remaining free messages
- Delivery status
- Error logs

## 🎉 Success!

Once setup is complete:
- Your NurseNotes app can send WhatsApp messages
- 100 free messages every month
- Professional messaging for your users
- No coding changes needed

## 🆘 Support

If you need help:
- Maytapi documentation: https://docs.maytapi.com
- Email: support@maytapi.com
- Or check their FAQ section

---

**Ready to start?** Go to https://maytapi.com and create your account now!
