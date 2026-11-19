import type { AIProvider } from '../../types.js';
import type { AIProviderAdapter, AIRequest, AIResponse } from './types.js';
import { groqProvider } from './groqProvider.js';
import { getDefaultModelForProvider } from './modelRegistry.js';

class AIRouter {
  private adapters: Map<AIProvider, AIProviderAdapter> = new Map();

  constructor() {
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

  public async execute(request: AIRequest): Promise<AIResponse> {
    const provider: AIProvider = 'groq';
    const adapter = this.getAdapter(provider);

    // Resolve model if not provided or empty
    const model = request.model?.trim() || getDefaultModelForProvider(provider);

    const validatedRequest: AIRequest = {
      ...request,
      provider,
      model
    };

    return await adapter.execute(validatedRequest);
  }
}

export const aiRouter = new AIRouter();
