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

  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
    process.env.GEMINI_API_KEY.trim().length > 5
  );

  res.status(200).json({
    status: 'ok',
    service: 'eStudy Course Builder AI Backend',
    platform: 'Vercel Serverless Function',
    version: '9.0',
    hasGeminiKey,
    nodeEnv: process.env.NODE_ENV || 'production',
    message: hasGeminiKey 
      ? 'Gemini Live API is configured and operational.' 
      : 'Running in fallback engine mode. Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables for live LLM capabilities.'
  });
}
