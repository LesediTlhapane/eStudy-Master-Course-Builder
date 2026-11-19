import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  generateCourseWithAIEngine,
  CourseGenerationPartialError,
  executeGranularRegeneration,
  processAIAssistedCopilotChat,
  getRegisteredModels,
  checkKeysConfigured,
  extractCourseFieldsFromDocument,
  refineProblemStatementWithAI
} from './src/server/ai';

function resolveAIErrorStatus(err: any): number {
  const msg = String(err?.message || '').toLowerCase();
  if (err?.failedStage === 'validation' || msg.includes('compulsory fields')) return 400;
  if (msg.includes('401') || msg.includes('403') || msg.includes('authentication') || msg.includes('api key')) return 401;
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('tpm')) return 429;
  if (msg.includes('timed out') || msg.includes('timeout')) return 504;
  return 502;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    const keys = checkKeysConfigured();
    res.json({
      status: 'ok',
      service: 'eStudy Course Builder Dual-Provider AI Backend (Gemini + Groq)',
      version: '9.0',
      hasGroqKey: keys.groq,
      groqKeyCount: keys.groqKeyCount,
      hasGeminiKey: keys.gemini,
      geminiKeyCount: keys.geminiKeyCount,
      providers: ['gemini', 'groq']
    });
  });

  // GET /api/ai/models - Returns registry of supported Google Gemini and Groq AI models and key status
  app.get('/api/ai/models', async (req, res) => {
    const keys = checkKeysConfigured();
    const task = (req.query.task as any) || undefined;
    const providerFilter =
      req.query.provider === 'gemini' || req.query.provider === 'groq'
        ? (req.query.provider as 'gemini' | 'groq')
        : undefined;
    const models = getRegisteredModels(providerFilter, task);

    res.json({
      providers: [
        { id: 'gemini', name: 'Google Gemini', isConfigured: keys.gemini, keyCount: keys.geminiKeyCount },
        { id: 'groq', name: 'Groq Cloud', isConfigured: keys.groq, keyCount: keys.groqKeyCount }
      ],
      models,
      keysConfigured: keys,
      defaultProvider: keys.gemini && !keys.groq ? 'gemini' : 'groq'
    });
  });

  // POST /api/courses/extract-template - Analyse uploaded PDF/DOCX/TXT and map to eStudy Master Template
  app.post('/api/courses/extract-template', async (req, res) => {
    try {
      const { fileName, mimeType, base64Data, rawText, provider, model } = req.body;
      if (!fileName || (!base64Data && !rawText)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid document file (PDF, DOCX, or TXT) to analyse.'
        });
      }

      const result = await extractCourseFieldsFromDocument({
        fileName,
        mimeType: mimeType || 'application/octet-stream',
        base64Data,
        rawText,
        provider,
        model
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error extracting template from uploaded document:', error);
      return res.status(500).json({
        success: false,
        error: error?.message || 'Failed to analyse uploaded document with AI.'
      });
    }
  });

  // POST /api/courses/refine-problem - AI assistance to refine Section 1 wording without inventing facts
  app.post('/api/courses/refine-problem', async (req, res) => {
    try {
      const refined = await refineProblemStatementWithAI(req.body || {});
      return res.json({ success: true, refined });
    } catch (error: any) {
      console.error('Error refining problem statement:', error);
      return res.status(500).json({
        success: false,
        error: error?.message || 'Could not refine wording at this time.'
      });
    }
  });

  // POST /api/copilot/chat
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const {
        messages,
        currentCourse,
        activeSection,
        qaResult,
        provider,
        model,
        agreedRequirements,
        conversationId
      } = req.body;
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

      return res.json({ success: true, ...response });
    } catch (error: any) {
      console.error('Error in copilot chat:', error);
      return res.status(500).json({ error: error?.message || 'Failed to process chat message.' });
    }
  });

  // POST /api/courses/generate - Provider-agnostic course generation (strict error reporting, no silent fallback)
  app.post('/api/courses/generate', async (req, res) => {
    const { course, provider, model } = req.body || {};
    try {
      if (!course) {
        return res.status(400).json({ success: false, error: 'Missing course data in request body.' });
      }

      const result = await generateCourseWithAIEngine(course, provider, model);
      return res.json(result);
    } catch (error: any) {
      console.error('Error generating course with AI:', error);
      const status = resolveAIErrorStatus(error);
      const partial = error instanceof CourseGenerationPartialError ? error : null;
      return res.status(status).json({
        success: false,
        error: error?.message || 'AI course generation failed. Please check your connection or selected AI model and try again.',
        failedProvider: partial?.failedProvider || (provider === 'gemini' ? 'gemini' : 'groq'),
        failedModel: partial?.failedModel || model || '',
        failedStage: partial?.failedStage || 'unknown',
        failedModuleNumber: partial?.failedModuleNumber,
        failedModuleTitle: partial?.failedModuleTitle,
        completedModulesCount: partial?.completedModulesCount,
        totalModulesCount: partial?.totalModulesCount,
        partialCourse: partial?.partialCourse,
        fallbackUsed: false
      });
    }
  });

  // POST /api/courses/regenerate-part - Granular component regeneration (strict error reporting, no silent fallback)
  app.post('/api/courses/regenerate-part', async (req, res) => {
    const { course, partType, targetId, currentGeneratedCourse, provider, model } = req.body || {};
    try {
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
      return res.json(result);
    } catch (error: any) {
      console.error('Error regenerating part:', error);
      const status = resolveAIErrorStatus(error);
      return res.status(status).json({
        success: false,
        error: error?.message || 'Failed to regenerate course component with AI.',
        failedProvider: provider === 'gemini' ? 'gemini' : 'groq',
        failedModel: model || '',
        fallbackUsed: false
      });
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
