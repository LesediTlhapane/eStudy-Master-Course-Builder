import { executeGranularRegeneration } from '../../src/server/ai';

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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const { course, partType, targetId, currentGeneratedCourse, provider, model } = body || {};
    if (!course || !partType) {
      return res.status(400).json({ error: 'Missing course or partType in request body.' });
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
    return res.status(500).json({ error: error?.message || 'Failed to regenerate course component.' });
  }
}
