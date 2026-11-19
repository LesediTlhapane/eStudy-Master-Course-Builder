import { processAIAssistedCopilotChat } from '../../src/server/ai/index.js';
import { processLocalCopilotChat } from '../../src/utils/localCourseEngine.js';

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

    const {
      messages,
      currentCourse,
      activeSection,
      qaResult,
      provider,
      model,
      agreedRequirements,
      conversationId
    } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array in request body.' });
    }

    const response = await processAIAssistedCopilotChat({
      messages,
      currentCourse: currentCourse || {},
      activeSection: activeSection || '01',
      qaResult: qaResult || null,
      provider,
      model,
      agreedRequirements: agreedRequirements || null,
      conversationId
    });

    return res.status(200).json({ success: true, ...response });
  } catch (error: any) {
    console.error('Error in serverless api/copilot/chat:', error);
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      const fallbackResponse = processLocalCopilotChat({
        messages: body?.messages || [],
        currentCourse: body?.currentCourse || {},
        activeSection: body?.activeSection || '01',
        qaResult: body?.qaResult || null,
        agreedRequirements: body?.agreedRequirements || null,
        conversationId: body?.conversationId
      });
      return res.status(200).json({ success: true, ...fallbackResponse, fallbackUsed: true });
    } catch (fallbackErr) {
      return res.status(500).json({ error: error?.message || 'Failed to process chat message.' });
    }
  }
}
