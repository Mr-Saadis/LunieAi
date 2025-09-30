// src/lib/ai/models-config.js
/**
 * Comprehensive AI Model Configuration
 * Defines all available models with their capabilities and limits
 */

export const AI_MODELS = {
  // Gemini Models (FREE)
  'gemini-2.5-flash': {
    provider: 'gemini',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast, versatile performance for diverse tasks',
    capabilities: {
      chat: true,
      embeddings: false, // Will use text-embedding-004 separately
      vision: true,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 8192,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 15, // requests per minute (free tier)
        rpd: 1500, // requests per day (free tier)
        tpm: 1000000 // tokens per minute
      }
    },
    cost: {
      input: 0, // Free tier
      output: 0
    },
    defaultParams: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048
    },
    contextWindow: 1048576, // 1M tokens
    recommended: true,
    badge: 'FREE'
  },

  'gemini-2.5-flash-8b': {
    provider: 'gemini',
    displayName: 'Gemini 1.5 Flash 8B',
    description: 'Lightweight, fast model for simple tasks',
    capabilities: {
      chat: true,
      embeddings: false,
      vision: false,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 8192,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 15,
        rpd: 1500,
        tpm: 1000000
      }
    },
    cost: {
      input: 0,
      output: 0
    },
    defaultParams: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048
    },
    contextWindow: 1048576,
    recommended: false,
    badge: 'FREE'
  },

  'gemini-1.5-pro': {
    provider: 'gemini',
    displayName: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning and complex tasks',
    capabilities: {
      chat: true,
      embeddings: false,
      vision: true,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 8192,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 2, // Free tier is very limited
        rpd: 50,
        tpm: 32000
      }
    },
    cost: {
      input: 0,
      output: 0
    },
    defaultParams: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048
    },
    contextWindow: 2097152, // 2M tokens
    recommended: false,
    badge: 'LIMITED FREE'
  },

  'gemini-pro': {
    provider: 'gemini',
    displayName: 'Gemini Pro (Legacy)',
    description: 'Previous generation model',
    capabilities: {
      chat: true,
      embeddings: false,
      vision: false,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 2048,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 60,
        rpd: 1500,
        tpm: 1000000
      }
    },
    cost: {
      input: 0,
      output: 0
    },
    defaultParams: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048
    },
    contextWindow: 32768,
    recommended: false,
    badge: 'LEGACY'
  }
};

// Embedding Models Configuration
export const EMBEDDING_MODELS = {
  'text-embedding-004': {
    provider: 'gemini',
    displayName: 'Gemini Text Embedding',
    dimensions: 768,
    maxInputTokens: 2048,
    batchSize: 100,
    cost: 0, // Free tier
    rateLimit: {
      rpm: 1500,
      rpd: 50000
    }
  }
};

// Model Selection Helpers
export const getModelConfig = (modelId) => {
  return AI_MODELS[modelId] || AI_MODELS['gemini-2.5-flash'];
};

export const getAvailableModels = () => {
  return Object.entries(AI_MODELS).map(([id, config]) => ({
    id,
    ...config
  }));
};

export const getFreeModels = () => {
  return Object.entries(AI_MODELS)
    .filter(([_, config]) => config.cost.input === 0)
    .map(([id, config]) => ({ id, ...config }));
};

export const getRecommendedModel = () => {
  const recommended = Object.entries(AI_MODELS)
    .find(([_, config]) => config.recommended);
  return recommended ? { id: recommended[0], ...recommended[1] } : null;
};

// Validate model parameters
export const validateModelParams = (modelId, params) => {
  const model = AI_MODELS[modelId];
  if (!model) return false;

  const validated = {};
  
  // Temperature
  if (params.temperature !== undefined) {
    validated.temperature = Math.max(0, Math.min(2, params.temperature));
  }
  
  // Max tokens
  if (params.maxTokens !== undefined) {
    validated.maxTokens = Math.min(params.maxTokens, model.limits.maxTokens);
  }
  
  // Top P
  if (params.topP !== undefined) {
    validated.topP = Math.max(0, Math.min(1, params.topP));
  }
  
  // Top K
  if (params.topK !== undefined) {
    validated.topK = Math.max(1, Math.min(100, params.topK));
  }

  return validated;
};

// Check if model supports specific capability
export const modelSupports = (modelId, capability) => {
  const model = AI_MODELS[modelId];
  return model?.capabilities[capability] || false;
};

// Get model usage stats (for analytics)
export const getModelUsageStats = (modelId) => {
  const model = AI_MODELS[modelId];
  if (!model) return null;

  return {
    dailyLimit: model.limits.rateLimit.rpd,
    minuteLimit: model.limits.rateLimit.rpm,
    tokenLimit: model.limits.rateLimit.tpm,
    contextWindow: model.contextWindow,
    maxOutput: model.limits.maxTokens
  };
};

// Export default configuration
export default {
  defaultModel: 'gemini-2.5-flash',
  defaultEmbeddingModel: 'text-embedding-004',
  models: AI_MODELS,
  embeddingModels: EMBEDDING_MODELS
};