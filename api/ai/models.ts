import { getRegisteredModels, checkKeysConfigured } from '../../src/server/ai/index.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const keys = checkKeysConfigured();
  const task = (req.query?.task as any) || undefined;
  const providerFilter =
    req.query?.provider === 'gemini' || req.query?.provider === 'groq'
      ? (req.query.provider as 'gemini' | 'groq')
      : undefined;
  const models = getRegisteredModels(providerFilter, task);

  res.status(200).json({
    providers: [
      { id: 'gemini', name: 'Google Gemini', isConfigured: keys.gemini, keyCount: keys.geminiKeyCount },
      { id: 'groq', name: 'Groq Cloud', isConfigured: keys.groq, keyCount: keys.groqKeyCount }
    ],
    models,
    keysConfigured: keys,
    defaultProvider: keys.gemini && !keys.groq ? 'gemini' : 'groq'
  });
}
