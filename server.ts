import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateCourseWithGemini, generateLocalFallbackCourse, regenerateCoursePart, processCopilotChat } from './src/server/geminiService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'eStudy Course Builder AI Backend',
      version: '9.0',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
    });
  });

  // POST /api/copilot/chat
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const { messages, currentCourse, activeSection, qaResult } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing messages array in request body.' });
      }

      const response = await processCopilotChat({
        messages,
        currentCourse: currentCourse || {},
        activeSection: activeSection || '01',
        qaResult: qaResult || null
      });

      return res.json({ success: true, ...response });
    } catch (error: any) {
      console.error('Error in copilot chat:', error);
      return res.status(500).json({ error: error?.message || 'Failed to process chat message.' });
    }
  });

  // POST /api/courses/generate
  app.post('/api/courses/generate', async (req, res) => {
    try {
      const { course } = req.body;
      if (!course) {
        return res.status(400).json({ error: 'Missing course data in request body.' });
      }

      const generatedCourse = await generateCourseWithGemini(course);
      return res.json({ success: true, course: generatedCourse });
    } catch (error: any) {
      console.error('Error generating course:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to generate course',
        fallback: req.body?.course ? generateLocalFallbackCourse(req.body.course) : null
      });
    }
  });

  // POST /api/courses/regenerate-part
  app.post('/api/courses/regenerate-part', async (req, res) => {
    try {
      const { course, partType, targetId, currentGeneratedCourse } = req.body;
      if (!course || !partType) {
        return res.status(400).json({ error: 'Missing course or partType in request body.' });
      }

      const result = await regenerateCoursePart(course, partType, targetId, currentGeneratedCourse);
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
