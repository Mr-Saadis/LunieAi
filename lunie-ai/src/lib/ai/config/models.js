export const AI_MODELS = {
  'gemini-1.5-flash-8b': {
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    contextLength: 1000000,
    costPer1K: 0, // FREE!
    tier: 'free',
    rateLimit: 15, // per minute
    description: 'Fast and free model for testing',
    recommended: true
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'google', 
    contextLength: 1000000,
    costPer1K: 0.0002,
    tier: 'paid',
    rateLimit: 1000,
    description: 'Balanced speed and performance'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    contextLength: 2000000,
    costPer1K: 0.0035,
    tier: 'paid',
    rateLimit: 360,
    description: 'Most capable model for complex tasks'
  }
};

export const getModelConfig = (modelName) => {
  return AI_MODELS[modelName] || null;
};

export const getAvailableModels = (tier = 'all') => {
  if (tier === 'all') return Object.keys(AI_MODELS);
  return Object.keys(AI_MODELS).filter(key => AI_MODELS[key].tier === tier);
};