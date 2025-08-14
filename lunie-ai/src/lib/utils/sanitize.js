
// lib/utils/sanitize.js - INPUT SANITIZATION
export function sanitizeText(input) {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* event handlers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export function sanitizeHtml(dirty) {
  // For when you need to allow some HTML tags
  // You'll need to install DOMPurify: npm install isomorphic-dompurify
  // import DOMPurify from 'isomorphic-dompurify'
  // return DOMPurify.sanitize(dirty, {
  //   ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  //   ALLOWED_ATTR: []
  // })
  
  // For now, just strip all HTML
  return sanitizeText(dirty)
}

// lib/utils/constants.js - PLAN LIMITS AND CONSTANTS
export const PLAN_LIMITS = {
  free: {
    chatbots: 2,
    fileUploads: 10,
    messagesPerMonth: 100,
    embeddings: 1000,
    apiCallsPerMinute: 10
  },
  starter: {
    chatbots: 5,
    fileUploads: 50,
    messagesPerMonth: 1000,
    embeddings: 10000,
    apiCallsPerMinute: 30
  },
  pro: {
    chatbots: 20,
    fileUploads: 200,
    messagesPerMonth: 10000,
    embeddings: 100000,
    apiCallsPerMinute: 100
  },
  enterprise: {
    chatbots: -1, // unlimited
    fileUploads: -1,
    messagesPerMonth: -1,
    embeddings: -1,
    apiCallsPerMinute: -1
  }
}

export const AI_MODELS = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextLength: 4096,
    costPer1K: 0.001
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'openai',
    contextLength: 8192,
    costPer1K: 0.03
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextLength: 128000,
    costPer1K: 0.01
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    provider: 'google',
    contextLength: 32768,
    costPer1K: 0.0005
  }
}

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': { extension: '.pdf', maxSize: 10 * 1024 * 1024 }, // 10MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: '.docx', 
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    extension: '.xlsx', 
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  'text/plain': { extension: '.txt', maxSize: 1 * 1024 * 1024 }, // 1MB
  'image/jpeg': { extension: '.jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/png': { extension: '.png', maxSize: 5 * 1024 * 1024 } // 5MB
}