#!/bin/bash

echo "Testing Free SMS Feature (TextBelt)..."
echo "======================================"

# Test free SMS without credentials (should work with textbelt)
echo "1. Testing free SMS with TextBelt..."
curl -s -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{
    "actions": ["sms"], 
    "sms": "+1234567890",
    "analysis": {
      "summary": "Test summary for free SMS feature",
      "clinicalConcepts": [{"name": "Test Concept", "definition": "Test definition"}],
      "studyGuide": {"questions": [{"question": "Test Q", "answer": "Test A"}], "keyTerms": [{"term": "Test Term", "definition": "Test def"}]}
    }
  }' | jq '.'

echo ""
echo "2. Testing direct TextBelt API (for comparison)..."
curl -s -X POST "https://textbelt.com/text" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Direct test from NurseNotes", "key": "textbelt"}' | jq '.'

echo ""
echo "======================================"
echo "Free SMS Features:"
echo "- Uses TextBelt service (1 free SMS per day)"
echo "- No registration required"
echo "- No API key needed for free tier"
echo "- Works immediately after deployment"
echo ""
echo "To enable SMS in production:"
echo "1. Add to Render environment:"
echo "   SMS_PROVIDER=textbelt"
echo "   SMS_API_KEY=textbelt"
echo "2. Redeploy the application"
echo ""
echo "Limitations:"
echo "- 1 SMS per day per IP address"
echo "- Only works with certain countries"
echo "- For production, consider paid alternatives"
