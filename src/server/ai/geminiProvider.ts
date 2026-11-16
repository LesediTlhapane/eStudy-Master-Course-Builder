import { GoogleGenAI } from '@google/genai';
import { AIProviderAdapter, AIRequest, AIResponse } from './types';

export class GeminiProvider implements AIProviderAdapter {
  provider: 'gemini' = 'gemini';
  name = 'Google Gemini';

  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 0);
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your environment.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const startTime = Date.now();
    const timeoutMs = request.timeoutMs || 90000;

    const contents: any[] = [];
    contents.push({ role: 'user', parts: [{ text: request.prompt }] });

    const config: any = {};
    if (request.systemInstruction) {
      config.systemInstruction = request.systemInstruction;
    }
    if (request.responseFormat === 'json') {
      config.responseMimeType = 'application/json';
    }
    if (typeof request.temperature === 'number') {
      config.temperature = request.temperature;
    }
    if (typeof request.maxTokens === 'number' && request.maxTokens > 0) {
      config.maxOutputTokens = request.maxTokens;
    }

    // Call Gemini API with timeout protection
    const callPromise = ai.models.generateContent({
      model: request.model || 'gemini-3.8-flash',
      contents,
      config
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    const text = response.text || '';
    if (!text.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    const usageMetadata = (response as any).usageMetadata;

    return {
      text,
      provider: 'gemini',
      model: request.model,
      durationMs,
      usage: usageMetadata
        ? {
            inputTokens: usageMetadata.promptTokenCount,
            outputTokens: usageMetadata.candidatesTokenCount
          }
        : undefined
    };
  }
}

export const geminiProvider = new GeminiProvider();
