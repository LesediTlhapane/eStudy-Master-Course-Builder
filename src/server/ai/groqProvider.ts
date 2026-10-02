import Groq from 'groq-sdk';
import { AIProviderAdapter, AIRequest, AIResponse } from './types';

export class GroqProvider implements AIProviderAdapter {
  provider: 'groq' = 'groq';
  name = 'Groq Cloud';

  isConfigured(): boolean {
    const key = process.env.GROQ_API_KEY;
    return Boolean(key && key !== 'MY_GROQ_API_KEY' && key.trim().length > 0);
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
      throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your environment.');
    }

    const groq = new Groq({ apiKey });

    const startTime = Date.now();
    const timeoutMs = request.timeoutMs || 50000;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (request.systemInstruction) {
      messages.push({
        role: 'system',
        content: request.systemInstruction
      });
    }

    messages.push({
      role: 'user',
      content: request.prompt
    });

    const options: any = {
      model: request.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: typeof request.temperature === 'number' ? request.temperature : 0.3
    };

    if (request.responseFormat === 'json') {
      options.response_format = { type: 'json_object' };
    }

    if (request.maxTokens) {
      options.max_tokens = request.maxTokens;
    }

    const callPromise = groq.chat.completions.create(options);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Groq request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );

    try {
      const completion = await Promise.race([callPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      const choice = completion.choices?.[0];
      const text = choice?.message?.content || '';

      if (!text.trim()) {
        throw new Error('Groq returned an empty response.');
      }

      return {
        text,
        provider: 'groq',
        model: completion.model || request.model,
        durationMs,
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens
            }
          : undefined
      };
    } catch (err: any) {
      // Clean error messaging without exposing internal tokens/keys
      const msg = err?.message || 'Unknown error communicating with Groq API';
      if (msg.includes('401') || msg.includes('authentication')) {
        throw new Error('Groq authentication failed. Please verify that GROQ_API_KEY is valid.');
      }
      if (msg.includes('429') || msg.includes('rate_limit')) {
        throw new Error('Groq rate limit exceeded. Please wait a moment and try again.');
      }
      if (msg.includes('model_not_found') || msg.includes('does not exist')) {
        throw new Error(`The requested model "${request.model}" is not available on Groq.`);
      }
      throw new Error(`Groq generation error: ${msg}`);
    }
  }
}

export const groqProvider = new GroqProvider();
