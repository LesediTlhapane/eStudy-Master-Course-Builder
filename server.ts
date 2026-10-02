import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  generateCourseWithAIEngine,
  executeGranularRegeneration,
  processAIAssistedCopilotChat,
  getRegisteredModels,
  checkKeysConfigured,
  queryLiveGroqModels
} from './src/server/ai';
import { generateLocalFallbackCourse } from './src/utils/localCourseEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    const keys = checkKeysConfigured();
    res.json({
      status: 'ok',
      service: 'eStudy Course Builder Provider-Agnostic AI Backend',
      version: '9.0',
      hasGeminiKey: keys.gemini,
      hasGroqKey: keys.groq,
      providers: ['gemini', 'groq']
    });
  });

  // GET /api/ai/models - Returns registry of supported AI models per provider and key status
  app.get('/api/ai/models', async (req, res) => {
    const keys = checkKeysConfigured();
    const task = (req.query.task as any) || undefined;
    const provider = (req.query.provider as any) || undefined;
    const models = getRegisteredModels(provider, task);

    res.json({
      providers: [
        { id: 'gemini', name: 'Google Gemini', isConfigured: keys.gemini },
        { id: 'groq', name: 'Groq Cloud', isConfigured: keys.groq }
      ],
      models,
      keysConfigured: keys,
      defaultProvider: keys.gemini ? 'gemini' : (keys.groq ? 'groq' : 'gemini')
    });
  });

  // POST /api/copilot/chat
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const { messages, currentCourse, activeSection, qaResult, provider, model } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing messages array in request body.' });
      }

      const response = await processAIAssistedCopilotChat({
        messages,
        currentCourse: currentCourse || {},
        activeSection: activeSection || '01',
        qaResult: qaResult || null,
        provider,
        model
      });

      return res.json({ success: true, ...response });
    } catch (error: any) {
      console.error('Error in copilot chat:', error);
      return res.status(500).json({ error: error?.message || 'Failed to process chat message.' });
    }
  });

  // POST /api/courses/generate - Provider-agnostic course generation
  app.post('/api/courses/generate', async (req, res) => {
    try {
      const { course, provider, model } = req.body;
      if (!course) {
        return res.status(400).json({ error: 'Missing course data in request body.' });
      }

      const result = await generateCourseWithAIEngine(course, provider, model);
      return res.json(result);
    } catch (error: any) {
      console.error('Error generating course:', error);
      const fallback = req.body?.course ? generateLocalFallbackCourse(req.body.course) : null;
      if (fallback) {
        fallback.generationMetadata = {
          provider: 'local_fallback',
          providerDisplayName: 'Local Fallback Engine',
          model: 'local-framework-v9',
          generatedAt: new Date().toISOString(),
          fallbackUsed: true,
          fallbackReason: error?.message || 'Server error generating course'
        };
      }
      return res.status(500).json({
        error: error?.message || 'Failed to generate course',
        fallback
      });
    }
  });

  // POST /api/courses/regenerate-part - Granular component regeneration
  app.post('/api/courses/regenerate-part', async (req, res) => {
    try {
      const { course, partType, targetId, currentGeneratedCourse, provider, model } = req.body;
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
      return res.json(result);
    } catch (error: any) {
      console.error('Error regenerating part:', error);
      return res.status(500).json({ error: error?.message || 'Failed to regenerate course component.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`eStudy Master Course Builder server running on http://localhost:${PORT}`);
  });
}

startServer();
