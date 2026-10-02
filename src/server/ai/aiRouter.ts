import { AIProvider, AIModelMeta } from '../../types';
import { AIProviderAdapter, AIRequest, AIResponse } from './types';
import { geminiProvider } from './geminiProvider';
import { groqProvider } from './groqProvider';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry';

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

  public async execute(request: AIRequest): Promise<AIResponse> {
    const provider = request.provider || 'gemini';
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
