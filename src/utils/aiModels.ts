import { AIProvider, AIModelMeta } from '../types';

export const CLIENT_MODEL_REGISTRY: AIModelMeta[] = [
  // --- Google Gemini Models ---
  {
    id: 'gemini-3.8-flash',
    provider: 'gemini',
    displayName: 'Gemini 3.8 Flash',
    description: 'High-throughput multimodal model optimized for speed, structured JSON generation, and complex instructional design.',
    contextWindow: 1048576,
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
    displayName: 'Gemini 3.1 Flash Lite',
    description: 'Ultra-low latency model ideal for rapid inline Copilot feedback and micro-lesson regeneration.',
    contextWindow: 1048576,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: false,
      fastInference: true
    },
    enabledForCourseGeneration: true,
    enabledForCopilot: true,
    enabledForRegeneration: true
  },
  {
    id: 'gemini-3.1-pro-preview',
    provider: 'gemini',
    displayName: 'Gemini 3.1 Pro Preview',
    description: 'Advanced reasoning model for complex statutory compliance analysis and advanced technical curricula.',
    contextWindow: 2097152,
    capabilities: {
      structuredOutput: true,
      jsonMode: true,
      longContext: true,
      reasoning: true,
      fastInference: false
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

export function getClientModels(
  provider?: AIProvider,
  task?: 'course_generation' | 'copilot' | 'regeneration'
): AIModelMeta[] {
  return CLIENT_MODEL_REGISTRY.filter(m => {
    if (provider && m.provider !== provider) return false;
    if (task === 'course_generation' && !m.enabledForCourseGeneration) return false;
    if (task === 'copilot' && !m.enabledForCopilot) return false;
    if (task === 'regeneration' && !m.enabledForRegeneration) return false;
    return true;
  });
}

export function getDefaultModel(
  provider: AIProvider,
  task: 'course_generation' | 'copilot' | 'regeneration' = 'course_generation'
): string {
  const models = getClientModels(provider, task);
  const def = models.find(m => m.isDefault);
  if (def) return def.id;
  return models[0]?.id || (provider === 'groq' ? 'openai/gpt-oss-120b' : 'gemini-3.8-flash');
}
