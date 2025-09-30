export class AIProviderFactory {
  static providers = {
    google: () => import('./providers/gemini.js'),
    // Future providers
    // openai: () => import('./providers/openai.js'),
    // anthropic: () => import('./providers/anthropic.js'),
  };

  static async createProvider(model) {
    const providerKey = this.getProviderKey(model);
    
    if (!this.providers[providerKey]) {
      throw new Error(`Unsupported AI provider for model: ${model}`);
    }

    try {
      const ProviderModule = await this.providers[providerKey]();
      return new ProviderModule.default(model);
    } catch (error) {
      throw new Error(`Failed to load AI provider: ${error.message}`);
    }
  }

  static getProviderKey(model) {
    if (model.startsWith('gemini-')) return 'google';
    if (model.startsWith('gpt-')) return 'openai';
    if (model.startsWith('claude-')) return 'anthropic';
    
    throw new Error(`Unknown model format: ${model}`);
  }

  static getSupportedModels() {
    return [
      'gemini-2.5-flash-8b',
      'gemini-2.5-flash',
      'gemini-1.5-pro'
    ];
  }
}