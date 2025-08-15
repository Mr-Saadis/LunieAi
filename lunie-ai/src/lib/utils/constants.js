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


// src/lib/constants.js

// export const PLAN_LIMITS = {
//   free: {
//     chatbots: 2,
//     fileUploads: 10,
//     messagesPerMonth: 100,
//     embeddings: 1000,
//     apiCallsPerMinute: 10
//   },
//   starter: {
//     chatbots: 5,
//     fileUploads: 50,
//     messagesPerMonth: 1000,
//     embeddings: 10000,
//     apiCallsPerMinute: 30
//   },
//   pro: {
//     chatbots: 20,
//     fileUploads: 200,
//     messagesPerMonth: 10000,
//     embeddings: 100000,
//     apiCallsPerMinute: 100
//   },
//   enterprise: {
//     chatbots: -1, // unlimited
//     fileUploads: -1,
//     messagesPerMonth: -1,
//     embeddings: -1,
//     apiCallsPerMinute: -1
//   }
// }

// export const AI_MODELS = {
//   'gpt-3.5-turbo': {
//     name: 'GPT-3.5 Turbo',
//     provider: 'openai',
//     contextLength: 4096,
//     costPer1K: 0.001
//   },
//   'gpt-4': {
//     name: 'GPT-4',
//     provider: 'openai',
//     contextLength: 8192,
//     costPer1K: 0.03
//   },
//   'gpt-4-turbo': {
//     name: 'GPT-4 Turbo',
//     provider: 'openai',
//     contextLength: 128000,
//     costPer1K: 0.01
//   },
//   'gemini-pro': {
//     name: 'Gemini Pro',
//     provider: 'google',
//     contextLength: 32768,
//     costPer1K: 0.0005
//   }
// }

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
    description: 'Overview & analytics'
  },
  {
    name: 'Chatbots',
    href: '/dashboard/chatbots',
    icon: 'Bot',
    description: 'Manage AI assistants'
  },
  {
    name: 'Training Data',
    href: '/dashboard/training',
    icon: 'BookOpen',
    description: 'Manage knowledge base'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
    description: 'Usage insights'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    description: 'Account & preferences'
  }
]

export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: null
  },
  starter: {
    name: 'Starter',
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]',
    icon: 'Sparkles'
  },
  pro: {
    name: 'Pro',
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/20',
    icon: 'Crown'
  },
  enterprise: {
    name: 'Enterprise',
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/20',
    icon: 'Crown'
  }
}