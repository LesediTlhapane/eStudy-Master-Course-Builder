import Groq from 'groq-sdk';
import type { AIProviderAdapter, AIRequest, AIResponse } from './types.js';

// Default primary key supplied by the user as baseline fallback if env is reset
const DEFAULT_USER_GROQ_KEY = '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';

const PLACEHOLDER_KEYS = new Set([
  'MY_GROQ_API_KEY',
  'MY_SECOND_GROQ_API_KEY',
  'MY_BACKUP_GROQ_API_KEY',
  'YOUR_GROQ_API_KEY'
]);

/**
 * Retrieves all configured Groq API keys (primary + backup keys).
 * Supports:
 * - GROQ_API_KEY (single key or comma/semicolon-separated list of keys)
 * - GROQ_API_KEY_2
 * - GROQ_BACKUP_API_KEY
 * - GROQ_API_KEY_BACKUP
 * - GROQ_API_KEYS
 */
export function getGroqApiKeys(): string[] {
  const rawSources = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_BACKUP_API_KEY,
    process.env.GROQ_API_KEY_BACKUP,
    process.env.GROQ_API_KEYS,
    DEFAULT_USER_GROQ_KEY
  ];

  const keys: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawSources) {
    if (!raw || typeof raw !== 'string') continue;
    // Allow comma, semicolon, or whitespace-delimited multiple keys in a single env var
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

// Secondary Groq models with independent TPM (Tokens Per Minute) buckets for rate-limit failover
const GROQ_FAILOVER_MODELS = [
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant'
];

export class GroqProvider implements AIProviderAdapter {
  provider: 'groq' = 'groq';
  name = 'Groq Cloud';
  private preferredKeyIndex = 0;

  isConfigured(): boolean {
    return getGroqApiKeys().length > 0;
  }

  getKeyCount(): number {
    return getGroqApiKeys().length;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const apiKeys = getGroqApiKeys();
    if (apiKeys.length === 0) {
      throw new Error(
        'Groq API key is not configured. Please add GROQ_API_KEY (and optional GROQ_API_KEY_2 / GROQ_BACKUP_API_KEY) to your environment.'
      );
    }

    const startTime = Date.now();
    const timeoutMs = request.timeoutMs || 55000;

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

    const primaryModel = request.model || 'openai/gpt-oss-120b';
    // Build ordered model list: requested model first, followed by independent TPM bucket models
    const candidateModels = [
      primaryModel,
      ...GROQ_FAILOVER_MODELS.filter(m => m !== primaryModel)
    ];

    // Order keys starting from the most recently healthy key index
    const orderedKeyIndices: number[] = [];
    for (let offset = 0; offset < apiKeys.length; offset++) {
      orderedKeyIndices.push((this.preferredKeyIndex + offset) % apiKeys.length);
    }

    // Cap max_tokens for Groq to avoid triggering immediate Free-Tier TPM (6,000–8,000 TPM) pre-check rejections
    const safeMaxTokens = request.maxTokens ? Math.min(request.maxTokens, 4096) : undefined;

    let lastError: any = null;

    // Strategy:
    // 1. Try Primary Model across all configured API keys (Primary Key -> Backup Key #2 -> ...)
    // 2. If all keys hit rate limits (429 / 413 TPM) on the Primary Model, try Backup Models across all API keys
    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];

      for (const keyIdx of orderedKeyIndices) {
        const apiKey = apiKeys[keyIdx];
        const groq = new Groq({ apiKey });

        const options: any = {
          model: currentModel,
          messages,
          temperature: typeof request.temperature === 'number' ? request.temperature : 0.3
        };

        if (request.responseFormat === 'json') {
          options.response_format = { type: 'json_object' };
        }

        if (safeMaxTokens) {
          options.max_tokens = mIdx === 0 ? safeMaxTokens : Math.min(safeMaxTokens, 3200);
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

          // Remember this working key index for subsequent requests
          this.preferredKeyIndex = keyIdx;

          if (keyIdx > 0 || mIdx > 0) {
            console.log(
              `[GroqProvider] Request succeeded via failover (Key #${keyIdx + 1}/${apiKeys.length}, Model: ${currentModel})`
            );
          }

          return {
            text,
            provider: 'groq',
            model: completion.model || currentModel,
            durationMs,
            usage: completion.usage
              ? {
                  inputTokens: completion.usage.prompt_tokens,
                  outputTokens: completion.usage.completion_tokens
                }
              : undefined
          };
        } catch (err: any) {
          lastError = err;
          const msg = (err?.message || '').toLowerCase();
          const status = err?.status || err?.statusCode;

          const isRateLimitOrQuota =
            status === 429 ||
            status === 413 ||
            msg.includes('429') ||
            msg.includes('413') ||
            msg.includes('rate_limit') ||
            msg.includes('rate limit') ||
            msg.includes('tokens per minute') ||
            msg.includes('tpm') ||
            msg.includes('quota') ||
            msg.includes('too many requests') ||
            msg.includes('request too large');

          const isAuthError =
            status === 401 || msg.includes('401') || msg.includes('authentication') || msg.includes('invalid api key');

          const isModelError =
            status === 400 ||
            status === 404 ||
            msg.includes('model_not_found') ||
            msg.includes('does not exist') ||
            msg.includes('decommissioned') ||
            msg.includes('json_validate_failed');

          if (isRateLimitOrQuota) {
            console.warn(
              `[GroqProvider] Rate/TPM limit hit on Key #${keyIdx + 1}/${apiKeys.length} with model "${currentModel}". Trying backup key/model...`
            );
            continue;
          }

          if (isAuthError && apiKeys.length > 1) {
            console.warn(
              `[GroqProvider] Auth error on Key #${keyIdx + 1}/${apiKeys.length}. Failing over to next configured Groq key...`
            );
            continue;
          }

          if (isModelError) {
            console.warn(
              `[GroqProvider] Model error on "${currentModel}" (${err?.message}). Trying next model...`
            );
            break; // Break inner key loop and move to next model
          }

          // For transient network errors, try next key if available
          if (apiKeys.length > 1) {
            continue;
          }
        }
      }
    }

    // If all keys and models failed, format a clear message
    const msg = lastError?.message || 'Unknown error communicating with Groq API';
    if (msg.includes('401') || msg.includes('authentication')) {
      throw new Error(
        'Groq authentication failed across configured keys. Please verify GROQ_API_KEY and GROQ_API_KEY_2 in your environment.'
      );
    }
    if (msg.includes('429') || msg.includes('rate_limit') || msg.toLowerCase().includes('rate limit')) {
      throw new Error(
        `Groq rate limit reached across ${apiKeys.length} configured key(s). Please add your second key to GROQ_API_KEY_2 (or comma-separated in GROQ_API_KEY) or wait 30 seconds and retry.`
      );
    }
    throw new Error(`Groq generation error: ${msg}`);
  }
}

export const groqProvider = new GroqProvider();
