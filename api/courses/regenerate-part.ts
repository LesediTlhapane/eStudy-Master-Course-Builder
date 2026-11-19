import { executeGranularRegeneration } from '../../src/server/ai/index.js';

function resolveErrorStatus(err: any): number {
  const msg = String(err?.message || '').toLowerCase();
  if (msg.includes('missing') || msg.includes('unsupported')) return 400;
  if (msg.includes('401') || msg.includes('403') || msg.includes('authentication') || msg.includes('api key')) return 401;
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('tpm')) return 429;
  if (msg.includes('timed out') || msg.includes('timeout')) return 504;
  return 502;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  let requestedProvider: string | undefined;
  let requestedModel: string | undefined;

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const { course, partType, targetId, currentGeneratedCourse, provider, model } = body || {};
    requestedProvider = provider;
    requestedModel = model;

    if (!course || !partType) {
      return res.status(400).json({ success: false, error: 'Missing course or partType in request body.' });
    }

    const result = await executeGranularRegeneration(
      course,
      partType,
      targetId,
      currentGeneratedCourse,
      provider,
      model
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error regenerating part in serverless function:', error);
    const status = resolveErrorStatus(error);
    return res.status(status).json({
      success: false,
      error: error?.message || 'Failed to regenerate course component.',
      failedProvider: requestedProvider === 'gemini' ? 'gemini' : 'groq',
      failedModel: requestedModel || '',
      fallbackUsed: false
    });
  }
}
