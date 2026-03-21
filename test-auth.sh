#!/bin/bash

echo "Testing NurseNotes Authentication..."
echo "=================================="

# Test the auth status endpoint
echo "1. Testing auth status endpoint..."
curl -s "https://esrunnotes.onrender.com/api/auth/me" | jq '.' || echo "❌ Auth endpoint failed"

echo ""
echo "2. Testing login endpoint..."
curl -s -I "https://esrunnotes.onrender.com/api/auth/login" | head -1

echo ""
echo "3. Testing logout endpoint..."
curl -s -I "https://esrunnotes.onrender.com/api/auth/logout" | head -1

echo ""
echo "4. Testing main page..."
curl -s -I "https://esrunnotes.onrender.com/" | head -1

echo ""
echo "5. Checking Auth0 configuration..."
echo "If login redirects to Auth0 with localhost URLs, the issue is in AUTH0_BASE_URL"
echo "Current AUTH0_BASE_URL should be: https://esrunnotes.onrender.com"

echo ""
echo "=================================="
echo "If tests fail, check:"
echo "1. Render environment variables"
echo "2. Auth0 application settings"
echo "3. CORS configuration in Auth0"
echo "4. Callback URLs in Auth0"
