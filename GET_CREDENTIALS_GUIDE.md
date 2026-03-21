# Step-by-Step Guide to Get Communication Credentials

## 📧 Gmail Email Setup

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com
2. Click "Security" in left menu
3. Click "2-Step Verification" 
4. Click "Get Started" and follow setup
5. **Required**: You must have 2FA enabled to generate app passwords

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Under "Select app", choose "Other (Custom name)"
3. Enter "NurseNotes" as the name
4. Click "Generate"
5. **Important**: Copy the 16-character password immediately
6. This password is your `EMAIL_PASS`

### Step 3: Configure Email Variables
```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=the-16-char-password-you-copied
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM="NurseNotes <your-gmail@gmail.com>"
```

## 📱 Twilio WhatsApp Setup

### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Click "Sign up with Google" or email
3. Verify your email address
4. Verify your phone number (required for WhatsApp)

### Step 2: Get Account Credentials
1. After login, you'll see your Dashboard
2. **TWILIO_ACCOUNT_SID**: Copy from "Account SID" field
3. **TWILIO_AUTH_TOKEN**: Click "Show" to reveal and copy

### Step 3: Get a Phone Number
1. In Twilio Console, go to "Phone Numbers" → "Manage" → "Buy a number"
2. Search for numbers with "SMS" and "Voice" capabilities
3. Select a number and click "Buy" (~$1/month)
4. This is your `TWILIO_PHONE_NUMBER`

### Step 4: Setup WhatsApp Sandbox
1. In Twilio Console, go to "Messaging" → "Try it out" → "WhatsApp"
2. Click "Send a message" or follow the on-screen instructions
3. You'll see a WhatsApp number (usually +14155238886)
4. Send the provided code via WhatsApp to this number
5. This activates your WhatsApp sandbox
6. This WhatsApp number is your `TWILIO_WHATSAPP_NUMBER`

### Step 5: Configure WhatsApp Variables
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678901
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## 🔧 Complete Environment Variables

Add all these to your Render Dashboard → Environment:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM="NurseNotes <your-gmail@gmail.com>"

# Twilio Configuration  
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678901
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## ⚠️ Important Notes

### Gmail
- **Must use App Password**, not your regular Gmail password
- App passwords only work if 2FA is enabled
- Each app password is unique to the application name

### Twilio
- WhatsApp sandbox is free for testing
- Your personal phone number must be verified in Twilio
- The sandbox WhatsApp number works for 30 days
- For production, you'll need to apply for WhatsApp Business API

### Security
- Never share these credentials
- Don't commit them to git
- Use different credentials for production vs development

## 🧪 Testing After Setup

1. Add all environment variables to Render
2. Redeploy your application
3. Test with: `./test-communication.sh`
4. Check status should change from "failed" to "sent"

## 💰 Costs

- **Gmail**: Free
- **Twilio Phone Number**: ~$1/month
- **Twilio WhatsApp Messages**: ~$0.005 per message (sandbox is free)
- **Total**: ~$1-2/month for basic usage

## 🆘 Troubleshooting

### Gmail Issues
- "Authentication failed" → Check app password
- "Connection refused" → Check EMAIL_HOST and EMAIL_PORT

### Twilio Issues  
- "From number not enabled" → Check TWILIO_PHONE_NUMBER
- "WhatsApp number not found" → Check TWILIO_WHATSAPP_NUMBER
- "Sandbox not joined" → Send the join code via WhatsApp

### Common Errors
- Always include country codes in phone numbers (+1234567890)
- Make sure environment variables are exactly as shown
- Redeploy after adding environment variables
