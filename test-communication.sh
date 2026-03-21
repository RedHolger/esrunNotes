#!/bin/bash

echo "Testing NurseNotes Communication Features..."
echo "=========================================="

# Test email without credentials (should fail gracefully)
echo "1. Testing email without credentials..."
curl -s -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"actions": ["email"], "email": "test@example.com", "analysis": {"summary": "Test summary"}}' | jq '.'

echo ""
echo "2. Testing WhatsApp without credentials..."
curl -s -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"actions": ["whatsapp"], "whatsapp": "+1234567890", "analysis": {"summary": "Test summary"}}' | jq '.'

echo ""
echo "3. Testing both features without credentials..."
curl -s -X POST "https://esrunnotes.onrender.com/api/actions" \
  -H "Content-Type: application/json" \
  -d '{
    "actions": ["email", "whatsapp"], 
    "email": "test@example.com", 
    "whatsapp": "+1234567890",
    "analysis": {
      "summary": "Test summary",
      "clinicalConcepts": [{"name": "Test Concept", "definition": "Test definition"}],
      "studyGuide": {"questions": [{"question": "Test Q", "answer": "Test A"}], "keyTerms": [{"term": "Test Term", "definition": "Test def"}]}
    }
  }' | jq '.'

echo ""
echo "=========================================="
echo "Expected Results:"
echo "- emailStatus: 'failed' with error about missing credentials"
echo "- whatsappStatus: 'failed' with error about missing credentials"
echo "- Other analysis features should work normally"
echo ""
echo "To fix these issues:"
echo "1. Add EMAIL_* variables to Render environment"
echo "2. Add TWILIO_* variables to Render environment"
echo "3. Redeploy the application"
