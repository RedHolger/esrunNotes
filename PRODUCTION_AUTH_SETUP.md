# Production Authentication Setup Guide

## Issue
The login/signup is not working on https://esrunnotes.onrender.com/ because the Auth0 configuration is still pointing to localhost.

## Required Changes

### 1. Update Render Environment Variables

Go to your Render dashboard → esrunnotes service → Environment and add/update these variables:

```bash
# Auth0 Configuration (REQUIRED)
AUTH0_BASE_URL=https://esrunnotes.onrender.com
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-production-client-id
AUTH0_CLIENT_SECRET=your-production-client-secret
AUTH0_SECRET=your-production-secret-32-chars-min

# Application URLs (REQUIRED)
NEXT_PUBLIC_APP_URL=https://esrunnotes.onrender.com
NEXT_PUBLIC_API_URL=https://esrunnotes.onrender.com/api

# Database (REQUIRED)
DATABASE_URL=your-production-postgresql-url

# Other API Keys (if using AI features)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
MISTRAL_API_KEY=your-mistral-key
OPENAI_API_KEY=your-openai-key
ASSEMBLYAI_API_KEY=your-assemblyai-key
```

### 2. Update Auth0 Application Settings

1. Go to your Auth0 Dashboard → Applications → Your Application
2. Update these settings:
   - **Application Login URI**: `https://esrunnotes.onrender.com`
   - **Allowed Callback URLs**: `https://esrunnotes.onrender.com/api/auth/callback`
   - **Allowed Logout URLs**: `https://esrunnotes.onrender.com`
   - **Allowed Web Origins**: `https://esrunnotes.onrender.com`
   - **Allowed Origins (CORS)**: `https://esrunnotes.onrender.com`

### 3. Remove Hardcoded Values

The file `lib/auth0.ts` has hardcoded development values. While this works for development, in production these should come from environment variables.

## Quick Fix Steps

1. **Update Render Environment Variables:**
   - Go to: https://dashboard.render.com/web/srv-esrunnotes-xxxx/env
   - Add the AUTH0_* variables with your production values
   - Add the NEXT_PUBLIC_* variables with https://esrunnotes.onrender.com

2. **Update Auth0 Application:**
   - Go to your Auth0 dashboard
   - Update all URLs from localhost to https://esrunnotes.onrender.com

3. **Redeploy:**
   - After updating environment variables, trigger a new deploy on Render

## Testing

After making these changes:
1. Clear your browser cache
2. Visit https://esrunnotes.onrender.com
3. Click "Login / Sign up"
4. It should redirect to Auth0 properly

## Common Issues

- **CORS errors**: Make sure https://esrunnotes.onrender.com is in Auth0's allowed origins
- **Callback errors**: Verify the callback URL is exactly `https://esrunnotes.onrender.com/api/auth/callback`
- **Environment variables**: Ensure all AUTH0_* variables are set in Render dashboard

## Security Notes

- Never commit real secrets to git
- Use strong, unique secrets for production
- Regularly rotate your Auth0 client secret
- Enable Auth0 logs for monitoring
