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

// Configure your email transporter
// IMPORTANT: Replace with your actual email service provider's details
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.ETHEREAL_USER || 'YOUR_ETHEREAL_USER', // generated ethereal user
    pass: process.env.ETHEREAL_PASSWORD || 'YOUR_ETHEREAL_PASSWORD', // generated ethereal password
  },
});

// Configure your Twilio client
// IMPORTANT: Replace with your actual Twilio credentials
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

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

  await transporter.sendMail({
    from: '"NurseNotes" <noreply@nursenotes.com>',
    to,
    subject: 'Your Lecture Analysis',
    html,
  });
}

async function sendWhatsApp(to: string, analysis: any) {
  if (!twilioClient) {
    console.error('Twilio client not configured');
    return;
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
}

export async function POST(req: NextRequest) {
  const { transcript, actions, email, whatsapp, analysis, provider = 'gemini', title, subject } = await req.json();

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

  if (actions.includes('email') && email) {
    await sendEmail(email, results);
  }

  if (actions.includes('whatsapp') && whatsapp) {
    await sendWhatsApp(whatsapp, results);
  }

  return NextResponse.json(results);
}