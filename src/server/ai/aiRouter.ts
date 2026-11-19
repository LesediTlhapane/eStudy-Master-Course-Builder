import type { AIProvider } from '../../types.js';
import type { AIProviderAdapter, AIRequest, AIResponse } from './types.js';
import { groqProvider } from './groqProvider.js';
import { geminiProvider } from './geminiProvider.js';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry.js';

class AIRouter {
  private adapters: Map<AIProvider, AIProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter(geminiProvider);
    this.registerAdapter(groqProvider);
  }

  public registerAdapter(adapter: AIProviderAdapter) {
    this.adapters.set(adapter.provider, adapter);
  }

  public getAdapter(provider: AIProvider): AIProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`AI Provider "${provider}" is not supported or not registered.`);
    }
    return adapter;
  }

  public isProviderConfigured(provider: AIProvider): boolean {
    const adapter = this.adapters.get(provider);
    return adapter ? adapter.isConfigured() : false;
  }

  public getRegisteredProviders(): AIProvider[] {
    return Array.from(this.adapters.keys());
  }

  public async execute(request: AIRequest): Promise<AIResponse> {
    let provider: AIProvider =
      request.provider === 'gemini' || request.provider === 'groq'
        ? request.provider
        : this.isProviderConfigured('gemini') && !this.isProviderConfigured('groq')
          ? 'gemini'
          : 'groq';

    // If requested provider has no key configured but the other provider does, allow explicit caller error OR clean configured resolution only when provider wasn't forced
    const adapter = this.getAdapter(provider);

    const requestedModel = request.model?.trim() || '';
    const modelMatchesProvider =
      requestedModel &&
      (Boolean(getModelMeta(provider, requestedModel)) ||
        (provider === 'gemini' ? requestedModel.toLowerCase().includes('gemini') : !requestedModel.toLowerCase().includes('gemini')));

    const model = modelMatchesProvider
      ? requestedModel
      : getDefaultModelForProvider(provider);

    const validatedRequest: AIRequest = {
      ...request,
      provider,
      model
    };

    return await adapter.execute(validatedRequest);
  }
}

export const aiRouter = new AIRouter();
