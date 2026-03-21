import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Mistral } from '@mistralai/mistralai';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { config } from '../../../lib/config'; // Import the centralized config

// Log API keys to verify they are loaded (from config)
console.log("GEMINI_API_KEY (from config):", config.geminiApiKey ? "***" + config.geminiApiKey.slice(-4) : "undefined");
console.log("OPENAI_API_KEY (from config):", config.openaiApiKey ? "***" + config.openaiApiKey.slice(-4) : "undefined");
console.log("MISTRAL_API_KEY (from config):", config.mistralApiKey ? "***" + config.mistralApiKey.slice(-4) : "undefined");

const openai = new OpenAI({
  apiKey: config.openaiApiKey || 'YOUR_OPENAI_API_KEY',
});

const gemini = new GoogleGenAI({
  apiKey: config.geminiApiKey || 'YOUR_GEMINI_API_KEY',
});

// Remove hardcoded instance here. We will instantiate it inside getCompletion
// to ensure it picks up the latest env var correctly if the server just restarted.

function createEmailTransporter() {
  // Gmail app passwords are often pasted with spaces; normalize to avoid auth failures.
  const rawPass = process.env.EMAIL_PASS || '';
  const normalizedPass = rawPass.replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: normalizedPass,
    },
  });
}

async function sendMailWithFallback(mailOptions: nodemailer.SendMailOptions) {
  const primaryTransporter = createEmailTransporter();
  try {
    await primaryTransporter.sendMail(mailOptions);
    return;
  } catch (error: any) {
    const isGmail = (process.env.EMAIL_HOST || '').includes('gmail');
    const configuredPort = parseInt(process.env.EMAIL_PORT || '587');
    const shouldRetryWith465 =
      isGmail &&
      configuredPort !== 465 &&
      (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNECTION' || error?.command === 'CONN');

    if (!shouldRetryWith465) {
      throw error;
    }

    // Some environments have trouble reaching smtp.gmail.com:587; retry direct SSL on 465.
    const rawPass = process.env.EMAIL_PASS || '';
    const normalizedPass = rawPass.replace(/\s+/g, '');
    const fallbackTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
      auth: {
        user: process.env.EMAIL_USER,
        pass: normalizedPass,
      },
    });

    await fallbackTransporter.sendMail(mailOptions);
  }
}

// Configure your Twilio client
// IMPORTANT: Replace with your actual Twilio credentials
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Configure free SMS provider (TextBelt)
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'twilio'; // 'twilio', 'textbelt', 'vonage'

// Configure WhatsApp provider
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'twilio'; // 'twilio', 'maytapi'

async function getCompletion(prompt: string, provider: 'gemini' | 'openai' | 'mistral' = 'gemini') {
  try {
    if (provider === 'gemini') {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } else if (provider === 'mistral') {
      const apiKey = config.mistralApiKey;
      console.log("Read Mistral API Key (from config):", apiKey ? "***" + apiKey.slice(-4) : "undefined");
      
      if (!apiKey || apiKey === 'YOUR_MISTRAL_API_KEY') {
        throw new Error("Mistral API key is missing. Please add MISTRAL_API_KEY to .env.local");
      }
      
      // The official Mistral SDK sometimes has issues in Next.js edge/node runtimes with fetch headers.
      // We will use standard fetch to be completely reliable and avoid the 411 Content-Length error.
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content;
    }
  } catch (error: any) {
    console.error(`\n=== Error with AI Provider: ${provider.toUpperCase()} ===`);
    console.error("Error Message:", error?.message || error);
    console.error("Status:", error?.status || error?.statusCode);
    if (error?.body) console.error("Response Body:", error.body);
    console.error("=========================================\n");
    throw error;
  }
}

async function generateSummary(transcript: string, provider: 'gemini' | 'openai' | 'mistral' = 'gemini', title?: string, subject?: string) {
  let prompt = `Summarize the following lecture transcript for a nursing student.`;
  if (title) prompt += ` The lecture is titled "${title}".`;
  if (subject) prompt += ` The subject is "${subject}".`;
  prompt += `\n\nTranscript: ${transcript}`;
  return await getCompletion(prompt, provider);
}

async function identifyClinicalConcepts(transcript: string, provider: 'gemini' | 'openai' | 'mistral' = 'gemini', title?: string, subject?: string) {
  let prompt = `Identify the clinical concepts in the following lecture transcript for a nursing student.`;
  if (title) prompt += ` The lecture is titled "${title}".`;
  if (subject) prompt += ` The subject is "${subject}".`;
  prompt += ` Return ONLY a valid JSON object with the following exact structure, with no markdown formatting and no other text: { "clinicalConcepts": [ { "name": "...", "definition": "..." } ] }:\n\nTranscript: ${transcript}`;
  const result = await getCompletion(prompt, provider);
  
  try {
    const textResult = typeof result === 'string' ? result : JSON.stringify(result);
    // Strip markdown code blocks if present
    let cleaned = textResult?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
    // Ensure it starts with { and ends with } in case there's leading/trailing text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse clinical concepts JSON:", e, "Raw output:", result);
    return { clinicalConcepts: [] };
  }
}

async function generateStudyGuide(transcript: string, provider: 'gemini' | 'openai' | 'mistral' = 'gemini', title?: string, subject?: string) {
  let prompt = `Generate a study guide with NCLEX-style questions and key terms from the following lecture transcript for a nursing student.`;
  if (title) prompt += ` The lecture is titled "${title}".`;
  if (subject) prompt += ` The subject is "${subject}".`;
  prompt += ` Return ONLY a valid JSON object with the following exact structure, with no markdown formatting and no other text: { "studyGuide": { "questions": [ { "question": "...", "answer": "..." } ], "keyTerms": [ { "term": "...", "definition": "..." } ] } }:\n\nTranscript: ${transcript}`;
  const result = await getCompletion(prompt, provider);
  
  try {
    const textResult = typeof result === 'string' ? result : JSON.stringify(result);
    // Strip markdown code blocks if present
    let cleaned = textResult?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
    // Ensure it starts with { and ends with } in case there's leading/trailing text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse study guide JSON:", e, "Raw output:", result);
    return { studyGuide: { questions: [], keyTerms: [] } };
  }
}

async function sendEmail(to: string, analysis: any) {
  try {
    // Debug: Log environment variables (without sensitive data)
    console.log('Email configuration check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'undefined');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'undefined');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'undefined');
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      throw new Error('Email service not configured');
    }

    let html = '<h1>Your Lecture Analysis is Ready!</h1>';
    if (analysis.summary) {
      html += `<h2>Summary</h2><p>${analysis.summary}</p>`;
    }
    if (analysis.clinicalConcepts) {
      html += '<h2>Clinical Concepts</h2>';
      analysis.clinicalConcepts.forEach((concept: any) => {
        html += `<h3>${concept.name}</h3><p>${concept.definition}</p>`;
      });
    }
    if (analysis.studyGuide) {
      html += '<h2>Study Guide</h2>';
      html += '<h3>Questions</h3>';
      analysis.studyGuide.questions.forEach((q: any) => {
        html += `<p><b>Q:</b> ${q.question}</p><p><b>A:</b> ${q.answer}</p>`;
      });
      html += '<h3>Key Terms</h3>';
      analysis.studyGuide.keyTerms.forEach((term: any) => {
        html += `<p><b>${term.term}:</b> ${term.definition}</p>`;
      });
    }

    await sendMailWithFallback({
      from: process.env.EMAIL_FROM || '"NurseNotes" <noreply@nursenotes.com>',
      to,
      subject: 'Your Lecture Analysis',
      html,
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

async function sendFreeSMS(to: string, message: string) {
  try {
    if (SMS_PROVIDER === 'textbelt') {
      // TextBelt - 1 free SMS per day
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: to,
          message: message,
          key: process.env.SMS_API_KEY || 'textbelt',
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'TextBelt SMS failed');
      }
      console.log('Free SMS sent successfully via TextBelt to:', to);
      return result;
    } else {
      throw new Error('Free SMS provider not configured');
    }
  } catch (error) {
    console.error('Failed to send free SMS:', error);
    throw error;
  }
}

async function sendWhatsAppMaytapi(to: string, analysis: any) {
  try {
    // Debug: Log environment variables (without sensitive data)
    console.log('Maytapi configuration check:');
    console.log('MAYTAPI_TOKEN:', process.env.MAYTAPI_TOKEN ? '***' + process.env.MAYTAPI_TOKEN.slice(-8) : 'undefined');
    console.log('MAYTAPI_PHONE_ID:', process.env.MAYTAPI_PHONE_ID ? '***' + process.env.MAYTAPI_PHONE_ID.slice(-8) : 'undefined');
    
    if (!process.env.MAYTAPI_TOKEN || !process.env.MAYTAPI_PHONE_ID) {
      console.error('Maytapi credentials not configured');
      throw new Error('Maytapi WhatsApp service not configured');
    }

    let message = 'Your Lecture Analysis is Ready!\n\n';
    if (analysis.summary) {
      message += `*Summary*\n${analysis.summary}\n\n`;
    }
    if (analysis.clinicalConcepts) {
      message += '*Clinical Concepts*\n';
      analysis.clinicalConcepts.forEach((concept: any) => {
        message += `*${concept.name}*: ${concept.definition}\n`;
      });
      message += '\n';
    }
    if (analysis.studyGuide) {
      message += '*Study Guide*\n';
      message += '*Questions*\n';
      analysis.studyGuide.questions.forEach((q: any) => {
        message += `*Q:* ${q.question}\n*A:* ${q.answer}\n`;
      });
      message += '*Key Terms*\n';
      analysis.studyGuide.keyTerms.forEach((term: any) => {
        message += `*${term.term}*: ${term.definition}\n`;
      });
    }

    const response = await fetch(`https://api.maytapi.com/api/${process.env.MAYTAPI_PHONE_ID}/${process.env.MAYTAPI_PHONE_NUM}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-maytapi-key': process.env.MAYTAPI_TOKEN,
      },
      body: JSON.stringify({
        to_number: to,
        type: 'text',
        message: message,
      }),
    });

    const result = await response.json();
    console.log('Maytapi API response:', result);
    
    if (!response.ok) {
      console.error('Maytapi API error:', response.status, result);
      throw new Error(result.error || result.message || `Maytapi WhatsApp failed (${response.status})`);
    }
    
    console.log('WhatsApp message sent successfully via Maytapi to:', to);
    return result;
  } catch (error) {
    console.error('Failed to send Maytapi WhatsApp message:', error);
    throw error;
  }
}

async function sendWhatsApp(to: string, analysis: any) {
  try {
    if (WHATSAPP_PROVIDER === 'maytapi') {
      return await sendWhatsAppMaytapi(to, analysis);
    }

    if (!twilioClient) {
      console.error('Twilio client not configured');
      throw new Error('WhatsApp service not configured');
    }

    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.error('Twilio WhatsApp number not configured');
      throw new Error('WhatsApp number not configured');
    }

    let body = 'Your Lecture Analysis is Ready!\n\n';
    if (analysis.summary) {
      body += `*Summary*\n${analysis.summary}\n\n`;
    }
    if (analysis.clinicalConcepts) {
      body += '*Clinical Concepts*\n';
      analysis.clinicalConcepts.forEach((concept: any) => {
        body += `*${concept.name}*: ${concept.definition}\n`;
      });
      body += '\n';
    }
    if (analysis.studyGuide) {
      body += '*Study Guide*\n';
      body += '*Questions*\n';
      analysis.studyGuide.questions.forEach((q: any) => {
        body += `*Q:* ${q.question}\n*A:* ${q.answer}\n`;
      });
      body += '*Key Terms*\n';
      analysis.studyGuide.keyTerms.forEach((term: any) => {
        body += `*${term.term}*: ${term.definition}\n`;
      });
    }

    await twilioClient.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    console.log('WhatsApp message sent successfully to:', to);
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Debug: Log environment variables (without sensitive data)
    console.log('=== Production Environment Check ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'undefined');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'undefined');
    console.log('WHATSAPP_PROVIDER:', process.env.WHATSAPP_PROVIDER || 'undefined');
    console.log('MAYTAPI_TOKEN:', process.env.MAYTAPI_TOKEN ? '***' + process.env.MAYTAPI_TOKEN.slice(-8) : 'undefined');
    console.log('=====================================');

    const { transcript, actions, email, whatsapp, sms, analysis, provider = 'gemini', title, subject } = await req.json();

    const results: { [key: string]: any } = analysis || {};

    if (!analysis && transcript) {
      for (const action of actions) {
        if (action === 'summary') {
          results.summary = await generateSummary(transcript, provider, title, subject);
        } else if (action === 'clinicalConcepts') {
          const concepts = await identifyClinicalConcepts(transcript, provider, title, subject);
          results.clinicalConcepts = concepts.clinicalConcepts;
        } else if (action === 'studyGuide') {
          const guide = await generateStudyGuide(transcript, provider, title, subject);
          results.studyGuide = guide.studyGuide;
        }
      }
    }

    // Handle email sending
    if (actions.includes('email') && email) {
      try {
        await sendEmail(email, results);
        results.emailStatus = 'sent';
      } catch (error: any) {
        console.error('Email sending failed:', error);
        results.emailStatus = 'failed';
        results.emailError = error.message;
      }
    }

    // Handle WhatsApp sending
    if (actions.includes('whatsapp') && whatsapp) {
      try {
        await sendWhatsApp(whatsapp, results);
        results.whatsappStatus = 'sent';
      } catch (error: any) {
        console.error('WhatsApp sending failed:', error);
        results.whatsappStatus = 'failed';
        results.whatsappError = error.message;
      }
    }

    // Handle SMS sending (Free alternative)
    if (actions.includes('sms') && sms) {
      try {
        let smsMessage = 'Your Lecture Analysis is Ready!\n\n';
        if (results.summary) {
          smsMessage += `Summary: ${results.summary.substring(0, 100)}...\n\n`;
        }
        if (results.clinicalConcepts && results.clinicalConcepts.length > 0) {
          smsMessage += `Clinical Concepts: ${results.clinicalConcepts.length} found\n\n`;
        }
        if (results.studyGuide) {
          smsMessage += 'Study guide generated. Check email for details.';
        }
        
        await sendFreeSMS(sms, smsMessage);
        results.smsStatus = 'sent';
      } catch (error: any) {
        console.error('SMS sending failed:', error);
        results.smsStatus = 'failed';
        results.smsError = error.message;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Actions API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}