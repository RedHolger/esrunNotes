import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Export the loaded variables for easy access and type safety (optional but good practice)
export const config = {
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  mistralApiKey: process.env.MISTRAL_API_KEY,
};

// Log to verify loading (can be removed later)
console.log("Config loaded:");
console.log("  ASSEMBLYAI_API_KEY:", config.assemblyAiApiKey ? "***" + config.assemblyAiApiKey.slice(-4) : "undefined");
console.log("  GEMINI_API_KEY:", config.geminiApiKey ? "***" + config.geminiApiKey.slice(-4) : "undefined");
console.log("  MISTRAL_API_KEY:", config.mistralApiKey ? "***" + config.mistralApiKey.slice(-4) : "undefined");
