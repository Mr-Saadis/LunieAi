// src/lib/utils/constants.js
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter', 
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    chatbots: 1,
    messagesPerMonth: 100,
    trainingDataMB: 10,
    integrations: 1
  },
  [SUBSCRIPTION_PLANS.STARTER]: {
    chatbots: 3,
    messagesPerMonth: 1000,
    trainingDataMB: 100,
    integrations: 3
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    chatbots: 10,
    messagesPerMonth: 10000,
    trainingDataMB: 1000,
    integrations: 10
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    chatbots: -1, // unlimited
    messagesPerMonth: -1, // unlimited
    trainingDataMB: -1, // unlimited
    integrations: -1 // unlimited
  }
}

export const AI_MODELS = {
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'openai', fast: true },
  'gpt-4': { name: 'GPT-4', provider: 'openai', fast: false },
  'gpt-4o': { name: 'GPT-4o', provider: 'openai', fast: true },
  'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'openai', fast: true },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'openai', fast: true },
  'gemini-pro': { name: 'Gemini Pro', provider: 'google', fast: true }
}

export const TRAINING_DATA_TYPES = {
  FILE: 'file',
  WEBSITE: 'website', 
  TEXT: 'text',
  QA: 'qa',
  TABLE: 'table'
}

export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

export const CHATBOT_CHANNELS = {
  WEBSITE: 'website',
  WHATSAPP: 'whatsapp',
  INSTAGRAM: 'instagram',
  MESSENGER: 'messenger',
  API: 'api'
}
