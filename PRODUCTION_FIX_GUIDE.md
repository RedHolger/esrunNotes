# Production Fix Guide

## 🚨 Issues to Fix

1. **Email not working on production** - Missing email environment variables
2. **Auth0 not working on production** - Wrong Auth0 URLs and missing secrets
3. **GitHub Actions failing** - ESLint configuration issues (FIXED)

---

## 🔧 Step 1: Fix Auth0 for Production

### Current Issue:
Your Auth0 is configured for `localhost:3000` but your production site is `https://esrunnotes.onrender.com`

### Fix Auth0 Dashboard:
1. Go to: https://manage.auth0.com
2. Select your application: `dev-cfns55eqkszncm62.us.auth0.com`
3. Go to **Settings → Applications → Applications**
4. Click on your application
5. Update these fields:

**Application URIs:**
- **Allowed Callback URLs**: `https://esrunnotes.onrender.com/api/auth/callback/auth0`
- **Allowed Logout URLs**: `https://esrunnotes.onrender.com`
- **Allowed Web Origins**: `https://esrunnotes.onrender.com`
- **Allowed Origins (CORS)**: `https://esrunnotes.onrender.com`

### Add to Render Environment:
```bash
# Auth0 Production URLs
AUTH0_BASE_URL=https://esrunnotes.onrender.com
AUTH0_ISSUER_BASE_URL=https://dev-cfns55eqkszncm62.us.auth0.com
AUTH0_CLIENT_ID=hXW3gRRvNSstCigBDfIdcpLBzQJfUo80
AUTH0_CLIENT_SECRET=4FvtcTL76fE5TNxzieC_Ogf9rYhkB7mltdW9dtm-GQ_dQ94gwd401MmBAsATyRhR
AUTH0_SECRET=8c9dd212b74edd9d37ebda6f6d50cf463af864ec59b38d99106d39a394993a1d
```

---

## 🔧 Step 2: Fix Email for Production

### Add to Render Environment:
```bash
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=signorvashistha007@gmail.com
EMAIL_PASS=rmuf ynij fvab estd
EMAIL_FROM=NurseNotes <signorvashistha007@gmail.com>
```

---

## 🔧 Step 3: Fix WhatsApp for Production

### Add to Render Environment:
```bash
# WhatsApp Configuration (Maytapi)
WHATSAPP_PROVIDER=maytapi
MAYTAPI_TOKEN=74abf0b2-506f-47a1-8833-d43f9a992689
MAYTAPI_PHONE_ID=764b84ed-57bb-4a00-af2d-e2e5ada2d603
MAYTAPI_PHONE_NUM=137378
```

---

## 🔧 Step 4: Add AI API Keys to Production

### Add to Render Environment:
```bash
# AI API Keys
MISTRAL_API_KEY=aR7HC0CduqK4h2ovJauXgBuxoBnBxlgv
GEMINI_API_KEY=AIzaSyCwLHg7WoiRpfn7PSZaJzmAcdmA03RU9Mw
ASSEMBLYAI_API_KEY=d2640aa1d3cf4ac498a9206357670fdf
```

---

## 🔧 Step 5: Add Database Configuration

### Add to Render Environment:
```bash
# Database (Replace with your Render PostgreSQL URL)
DATABASE_URL=your-render-postgres-url-here
```

---

## 🚀 Step 6: Deploy to Render

1. Go to: https://dashboard.render.com
2. Select your `esrunnotes` service
3. Go to **Environment** tab
4. Add ALL the environment variables above
5. Click **Save Changes**
6. Wait for automatic redeployment (2-3 minutes)

---

## 🧪 Step 7: Test Production

After deployment, test these URLs:

### Test Authentication:
1. Go to: https://esrunnotes.onrender.com
2. Click **Login**
3. Should redirect to Auth0 successfully
4. Login and return to your app

### Test Email:
```bash
curl -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"actions": ["email"], "email": "your-email@gmail.com", "analysis": {"summary": "Production test"}}'
```

### Test WhatsApp:
```bash
curl -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"actions": ["whatsapp"], "whatsapp": "1234567890", "analysis": {"summary": "Production WhatsApp test"}}'
```

---

## ✅ Expected Results

- ✅ **Auth0**: Login/Signup works on production
- ✅ **Email**: Emails send successfully from production
- ✅ **WhatsApp**: WhatsApp messages send from production
- ✅ **AI Features**: All AI processing works
- ✅ **GitHub Actions**: Build and deploy successfully

---

## 🆘 Troubleshooting

### Auth0 Issues:
- "Callback URL mismatch" → Check Allowed Callback URLs in Auth0 dashboard
- "Origin not allowed" → Check Allowed Web Origins in Auth0 dashboard

### Email Issues:
- "Authentication failed" → Check Gmail app password
- "Connection refused" → Check EMAIL_HOST and EMAIL_PORT

### WhatsApp Issues:
- "404 Not Found" → Check MAYTAPI_PHONE_ID and MAYTAPI_PHONE_NUM
- "Token invalid" → Check MAYTAPI_TOKEN

### General Issues:
- Clear browser cache after deployment
- Check Render logs for detailed error messages
- Ensure all environment variables are exactly as shown

---

## 📋 Complete Environment Variables List

Copy this entire block and add to Render Environment:

```bash
# Auth0 Production
AUTH0_BASE_URL=https://esrunnotes.onrender.com
AUTH0_ISSUER_BASE_URL=https://dev-cfns55eqkszncm62.us.auth0.com
AUTH0_CLIENT_ID=hXW3gRRvNSstCigBDfIdcpLBzQJfUo80
AUTH0_CLIENT_SECRET=4FvtcTL76fE5TNxzieC_Ogf9rYhkB7mltdW9dtm-GQ_dQ94gwd401MmBAsATyRhR
AUTH0_SECRET=8c9dd212b74edd9d37ebda6f6d50cf463af864ec59b38d99106d39a394993a1d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=signorvashistha007@gmail.com
EMAIL_PASS=rmuf ynij fvab estd
EMAIL_FROM=NurseNotes <signorvashistha007@gmail.com>

# WhatsApp
WHATSAPP_PROVIDER=maytapi
MAYTAPI_TOKEN=74abf0b2-506f-47a1-8833-d43f9a992689
MAYTAPI_PHONE_ID=764b84ed-57bb-4a00-af2d-e2e5ada2d603
MAYTAPI_PHONE_NUM=137378

# AI APIs
MISTRAL_API_KEY=aR7HC0CduqK4h2ovJauXgBuxoBnBxlgv
GEMINI_API_KEY=AIzaSyCwLHg7WoiRpfn7PSZaJzmAcdmA03RU9Mw
ASSEMBLYAI_API_KEY=d2640aa1d3cf4ac498a9206357670fdf

# Database
DATABASE_URL=your-render-postgres-url-here
```

---

**🎯 After adding these variables and redeploying, all features will work in production!**
