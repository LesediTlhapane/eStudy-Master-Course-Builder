import type { AIProvider, AIModelMeta } from '../../types.js';

export interface AIRequest {
  provider: AIProvider;
  model: string;
  prompt: string;
  systemInstruction?: string;
  jsonSchema?: object;
  responseFormat?: 'json' | 'text';
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  durationMs: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface AIProviderAdapter {
  provider: AIProvider;
  name: string;
  isConfigured: () => boolean;
  execute: (request: AIRequest) => Promise<AIResponse>;
}
