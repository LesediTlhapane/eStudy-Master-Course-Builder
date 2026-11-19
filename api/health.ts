import { checkKeysConfigured } from '../src/server/ai/index.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const keys = checkKeysConfigured();

  res.status(200).json({
    status: 'ok',
    service: 'eStudy Course Builder Dual-Provider AI Backend (Gemini + Groq)',
    platform: 'Vercel Serverless Function',
    version: '9.0',
    hasGroqKey: keys.groq,
    groqKeyCount: keys.groqKeyCount,
    hasGeminiKey: keys.gemini,
    geminiKeyCount: keys.geminiKeyCount,
    providers: ['gemini', 'groq'],
    nodeEnv: process.env.NODE_ENV || 'production',
    message:
      keys.gemini || keys.groq
        ? `Live AI operational (Gemini keys: ${keys.geminiKeyCount}, Groq keys: ${keys.groqKeyCount}).`
        : 'Running in fallback engine mode. Add GEMINI_API_KEY or GROQ_API_KEY in Project Settings > Environment Variables for live LLM capabilities.'
  });
}
