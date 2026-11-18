import { getRegisteredModels, checkKeysConfigured } from '../../src/server/ai';

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
  const models = getRegisteredModels('groq', task);

  res.status(200).json({
    providers: [
      { id: 'groq', name: 'Groq Cloud', isConfigured: keys.groq, keyCount: keys.groqKeyCount }
    ],
    models,
    keysConfigured: keys,
    defaultProvider: 'groq'
  });
}
