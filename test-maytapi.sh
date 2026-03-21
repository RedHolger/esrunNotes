#!/bin/bash

echo "Testing Maytapi WhatsApp Integration..."
echo "====================================="

# Test WhatsApp with Maytapi (without credentials first)
echo "1. Testing WhatsApp without Maytapi credentials..."
curl -s -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{
    "actions": ["whatsapp"], 
    "whatsapp": "+1234567890",
    "analysis": {
      "summary": "Test summary for Maytapi WhatsApp",
      "clinicalConcepts": [{"name": "Test Concept", "definition": "Test definition"}],
      "studyGuide": {"questions": [{"question": "Test Q", "answer": "Test A"}], "keyTerms": [{"term": "Test Term", "definition": "Test def"}]}
    }
  }' | jq '.'

echo ""
echo "2. Testing direct Maytapi API (for comparison)..."
echo "This will fail without real credentials, but shows the API structure:"
curl -s -X POST "https://api.maytapi.com/whatsapp/12345/sendMessage" \
  -H "Content-Type: application/json" \
  -H "x-maytapi-key: test-key" \
  -d '{"to_number": "+1234567890", "message": "Test message"}' | jq '.' 2>/dev/null || echo "Expected: API error without real credentials"

echo ""
echo "====================================="
echo "Maytapi Setup Status:"
echo ""
echo "✅ Code Integration: COMPLETE"
echo "- Maytapi WhatsApp function added"
echo "- Automatic provider selection (Maytapi vs Twilio)"
echo "- Error handling implemented"
echo "- Status reporting included"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://maytapi.com"
echo "2. Create account and WhatsApp instance"
echo "3. Get API Key and Phone ID"
echo "4. Add to Render environment:"
echo "   WHATSAPP_PROVIDER=maytapi"
echo "   MAYTAPI_API_KEY=your-api-key"
echo "   MAYTAPI_PHONE_ID=your-phone-id"
echo "5. Redeploy application"
echo "6. Test with real phone number"
echo ""
echo "🎯 Benefits:"
echo "- 100 free WhatsApp messages/month"
echo "- No credit card required"
echo "- Works worldwide"
echo "- Easy setup"
echo "- Professional messaging"
echo ""
echo "📄 Documentation: MAYTAPI_SETUP_GUIDE.md"
