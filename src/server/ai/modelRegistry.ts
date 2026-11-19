import type { AIProvider, AIModelMeta } from '../../types.js';
import { getGroqApiKeys } from './groqProvider.js';
import { getGeminiApiKeys } from './geminiProvider.js';

export const STATIC_MODEL_REGISTRY: AIModelMeta[] = [
  // --- Google Gemini Models (@google/genai) ---
  {
    id: 'gemini-4-hydrogen',
    provider: 'gemini',
    displayName: 'Gemini 4 Hydrogen (Google)',
    description: 'High-reasoning flagship Google Gemini model with 1M context window, native JSON output, and strong curriculum synthesis.',
    contextWindow: 1000000,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true,
    isDefault: true,
    recommendedBadge: 'Recommended (Gemini Default)'
  },
  {
    id: 'gemini-3.1-flash-lite',
    provider: 'gemini',
    displayName: 'Gemini 3.1 Flash Lite (Google)',
    description: 'Ultra-fast, cost-efficient Gemini model ideal for Copilot conversations, template extraction, and rapid granular edits.',
    contextWindow: 1000000,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true
  },
  // --- Groq Models (OpenAI-compatible low-latency inference on Groq LPUs) ---
  {
    id: 'openai/gpt-oss-120b',
    provider: 'groq',
    displayName: 'GPT OSS 120B (Groq)',
    description: 'High-capability open-weights 120B reasoning model with 128k context, fast inference on Groq LPUs, and native JSON mode.',
    contextWindow: 131072,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true,
    isDefault: true,
    recommendedBadge: 'Recommended (Groq Default)'
  },
  {
    id: 'openai/gpt-oss-20b',
    provider: 'groq',
    displayName: 'GPT OSS 20B (Groq)',
    description: 'Ultra-fast 20B model with 128k context window, sub-second responses, ideal for interactive Copilot dialogues and rapid lesson edits.',
    contextWindow: 131072,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true
  },
  {
    id: 'qwen/qwen3.8-27b',
    provider: 'groq',
    displayName: 'Qwen 3.8 27B (Groq)',
    description: 'Balanced 27B multimodal and text reasoning model with 128k context window, strong procedural design, and JSON mode.',
    contextWindow: 131072,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true
  },
  {
    id: 'llama-3.3-70b-versatile',
    provider: 'groq',
    displayName: 'Llama 3.3 70B Versatile',
    description: 'Flagship open-weights model on Groq LPU with 128k context, exceptional instruction following, and robust JSON schema output.',
    contextWindow: 131072,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true
  },
  {
    id: 'llama-3.1-8b-instant',
    provider: 'groq',
    displayName: 'Llama 3.1 8B Instant',
    description: 'Sub-second inference speed, perfect for rapid Copilot dialogues and single scenario regenerations.',
    contextWindow: 131072,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: false,
      fastInference: true
    },
    enabledForCourseGeneration: false,
    enabledForCopilot: true,
    enabledForRegeneration: true
  }
];

export function getRegisteredModels(
  provider?: AIProvider,
  task?: 'course_generation' | 'copilot' | 'regeneration'
): AIModelMeta[] {
  return STATIC_MODEL_REGISTRY.filter(m => {
    if (provider && m.provider !== provider) return false;
    if (task === 'course_generation' && !m.enabledForCourseGeneration) return false;
    if (task === 'copilot' && !m.enabledForCopilot) return false;
    if (task === 'regeneration' && !m.enabledForRegeneration) return false;
    return true;
  });
}

export function getDefaultModelForProvider(
  provider: AIProvider,
  task: 'course_generation' | 'copilot' | 'regeneration' = 'course_generation'
): string {
  const models = getRegisteredModels(provider, task);
  const def = models.find(m => m.isDefault);
  if (def) return def.id;
  if (models[0]?.id) return models[0].id;
  return provider === 'gemini' ? 'gemini-4-hydrogen' : 'openai/gpt-oss-120b';
}

export function getModelMeta(provider: AIProvider, modelId: string): AIModelMeta | undefined {
  return STATIC_MODEL_REGISTRY.find(m => m.provider === provider && m.id === modelId);
}

export function checkKeysConfigured(): {
  groq: boolean;
  groqKeyCount: number;
  gemini: boolean;
  geminiKeyCount: number;
} {
  const groqKeys = getGroqApiKeys();
  const geminiKeys = getGeminiApiKeys();

  return {
    groq: groqKeys.length > 0,
    groqKeyCount: groqKeys.length,
    gemini: geminiKeys.length > 0,
    geminiKeyCount: geminiKeys.length
  };
}

/**
 * Optionally query Groq API dynamically to verify available models on the account.
 */
export async function queryLiveGroqModels(): Promise<string[]> {
  const groqKeys = getGroqApiKeys();
  if (groqKeys.length === 0) return [];

  for (const apiKey of groqKeys) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id);
      }
    } catch (err) {
      console.warn('Could not query live Groq models:', err);
    }
  }
  return [];
}
