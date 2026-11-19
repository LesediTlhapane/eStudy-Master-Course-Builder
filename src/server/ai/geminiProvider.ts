import { GoogleGenAI } from '@google/genai';
import type { AIProviderAdapter, AIRequest, AIResponse } from './types.js';

const PLACEHOLDER_KEYS = new Set([
  'MY_GEMINI_API_KEY',
  'YOUR_GEMINI_API_KEY',
  'GEMINI_API_KEY'
]);

const GEMINI_FAILOVER_MODELS = [
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite'
];

export function getGeminiApiKeys(): string[] {
  const rawSources = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GOOGLE_API_KEY
  ];

  const keys: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawSources) {
    if (!raw || typeof raw !== 'string') continue;
    const parts = raw
      .split(/[,;\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.length > 10 && !PLACEHOLDER_KEYS.has(part) && !seen.has(part)) {
        seen.add(part);
        keys.push(part);
      }
    }
  }

  return keys;
}

function isRetryableStatusOrError(err: any): boolean {
  const status = err?.status || err?.statusCode;
  const msg = (err?.message || '').toLowerCase();
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('timed out')
  );
}

export class GeminiProvider implements AIProviderAdapter {
  provider: 'gemini' = 'gemini';
  name = 'Google Gemini';

  isConfigured(): boolean {
    return getGeminiApiKeys().length > 0;
  }

  getKeyCount(): number {
    return getGeminiApiKeys().length;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      throw new Error(
        'Gemini API key is not configured. Please add GEMINI_API_KEY in your environment.'
      );
    }

    const startTime = Date.now();
    const timeoutMs = request.timeoutMs || 60000;
    const primaryModel =
      request.model?.trim() && request.model.toLowerCase().includes('gemini')
        ? request.model.trim()
        : 'gemini-4-hydrogen';

    const candidateModels = [
      primaryModel,
      ...GEMINI_FAILOVER_MODELS.filter(m => m !== primaryModel)
    ];

    let lastError: any = null;

    for (const currentModel of candidateModels) {
      for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
        const apiKey = apiKeys[keyIdx];
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const config: Record<string, any> = {};
        if (request.systemInstruction) {
          config.systemInstruction = request.systemInstruction;
        }
        if (request.responseFormat === 'json') {
          config.responseMimeType = 'application/json';
        }
        if (request.maxTokens) {
          config.maxOutputTokens = request.maxTokens;
        }
        // Per @google/genai guidelines, gemini-4-hydrogen rejects/degrades with legacy temperature/topP/topK
        if (!currentModel.includes('gemini-4-hydrogen') && typeof request.temperature === 'number') {
          config.temperature = request.temperature;
        }

        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const callPromise = ai.models.generateContent({
              model: currentModel,
              contents: request.prompt,
              config
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Gemini request timed out after ${timeoutMs / 1000}s`)),
                timeoutMs
              )
            );

            const response = await Promise.race([callPromise, timeoutPromise]);
            const text = response.text || '';
            if (!text.trim()) {
              throw new Error('Gemini returned an empty response.');
            }

            const usageMetadata = (response as any).usageMetadata;
            return {
              text,
              provider: 'gemini',
              model: currentModel,
              durationMs: Date.now() - startTime,
              usage: usageMetadata
                ? {
                    inputTokens: usageMetadata.promptTokenCount,
                    outputTokens: usageMetadata.candidatesTokenCount
                  }
                : undefined
            };
          } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.statusCode;
            const msg = (err?.message || '').toLowerCase();

            if (status === 403 || status === 401 || msg.includes('403') || msg.includes('api key not valid')) {
              break; // Try next key
            }

            if (status === 404 || msg.includes('not found') || msg.includes('not supported')) {
              break; // Try next model
            }

            if (isRetryableStatusOrError(err) && attempt < maxAttempts) {
              const backoffMs = Math.min(2500, 400 * Math.pow(2, attempt - 1));
              await new Promise(resolve => setTimeout(resolve, backoffMs));
              continue;
            }
            break;
          }
        }
      }
    }

    const finalMsg = lastError?.message || 'Unknown error communicating with Google Gemini API';
    if (/403|permission|api key/i.test(finalMsg)) {
      throw new Error('Gemini API authentication failed. Please verify GEMINI_API_KEY.');
    }
    if (/429|quota|rate limit/i.test(finalMsg)) {
      throw new Error('Gemini API rate limit or quota reached. Please wait briefly or switch to Groq Cloud.');
    }
    throw new Error(`Gemini generation error: ${finalMsg}`);
  }
}

export const geminiProvider = new GeminiProvider();
