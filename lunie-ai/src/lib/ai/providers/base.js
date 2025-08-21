// Base AI Provider - Abstract class for all AI providers
export class BaseAIProvider {
  constructor(model) {
    this.model = model;
    this.rateLimiter = new Map();
  }

  // Abstract methods - must be implemented by child classes
  async generateResponse(messages, options = {}) {
    throw new Error('generateResponse must be implemented by provider');
  }

  async generateEmbedding(text, options = {}) {
    throw new Error('generateEmbedding must be implemented by provider');
  }

  // Common utilities
  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);
  }

  async checkRateLimit(userId) {
    const key = `${userId}-${this.model}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 15; // Gemini free tier limit

    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, { count: 0, resetTime: now + windowMs });
    }

    const rateLimitData = this.rateLimiter.get(key);
    
    if (now > rateLimitData.resetTime) {
      rateLimitData.count = 0;
      rateLimitData.resetTime = now + windowMs;
    }

    if (rateLimitData.count >= limit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    rateLimitData.count++;
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }
}