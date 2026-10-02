import { generateCourseWithAIEngine } from '../../src/server/ai';
import { generateLocalFallbackCourse } from '../../src/utils/localCourseEngine';

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

    const { course, provider, model } = body || {};
    if (!course) {
      return res.status(400).json({ error: 'Missing course data in request body.' });
    }

    const result = await generateCourseWithAIEngine(course, provider, model);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error generating course in serverless function:', error);
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      if (body?.course) {
        const fallback = generateLocalFallbackCourse(body.course);
        fallback.generationMetadata = {
          provider: 'local_fallback',
          providerDisplayName: 'Local Fallback Engine',
          model: 'local-framework-v9',
          generatedAt: new Date().toISOString(),
          fallbackUsed: true,
          fallbackReason: error?.message || 'Server error generating course'
        };
        return res.status(200).json({ success: true, course: fallback, fallbackUsed: true });
      }
    } catch {}
    return res.status(500).json({
      error: error?.message || 'Failed to generate course'
    });
  }
}
