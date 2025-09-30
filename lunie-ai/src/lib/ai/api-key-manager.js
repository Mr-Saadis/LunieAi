// src/lib/ai/api-key-manager.js
/**
 * API Key Management System
 * Handles validation, encryption, and rotation of API keys
 */

import crypto from 'crypto';

class APIKeyManager {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-exactly!';
    this.algorithm = 'aes-256-gcm';
  }

  /**
   * Validate API key format and structure
   */
  validateKeyFormat(key, provider) {
    const patterns = {
      gemini: /^[A-Za-z0-9_-]{39}$/, // Gemini API key pattern
      openai: /^sk-[A-Za-z0-9]{48}$/, // OpenAI pattern (for future)
      anthropic: /^sk-ant-[A-Za-z0-9]{95}$/ // Anthropic pattern (for future)
    };

    const pattern = patterns[provider];
    if (!pattern) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return pattern.test(key);
  }

  /**
   * Test API key by making a simple request
   */
  async testAPIKey(key, provider) {
    try {
      switch (provider) {
        case 'gemini':
          return await this.testGeminiKey(key);
        case 'openai':
          return await this.testOpenAIKey(key);
        default:
          throw new Error(`Provider ${provider} not supported`);
      }
    } catch (error) {
      console.error(`API key test failed for ${provider}:`, error);
      return {
        valid: false,
        error: error.message,
        provider
      };
    }
  }

  /**
   * Test Gemini API key
   */
  async testGeminiKey(apiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Simple test prompt
      const result = await model.generateContent('Hello');
      
      return {
        valid: true,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        tested_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        provider: 'gemini',
        error: error.message.includes('API_KEY_INVALID') 
          ? 'Invalid API key' 
          : error.message
      };
    }
  }

  /**
   * Test OpenAI API key (for future implementation)
   */
  async testOpenAIKey(apiKey) {
    // Placeholder for OpenAI implementation
    return {
      valid: false,
      provider: 'openai',
      error: 'OpenAI support not yet implemented'
    };
  }

  /**
   * Encrypt API key for storage
   */
  encryptKey(apiKey) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey, 'utf8'),
        iv
      );
      
      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypt API key
   */
  decryptKey(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey, 'utf8'),
        Buffer.from(encryptedData.iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Generate a masked version of the key for display
   */
  maskKey(apiKey) {
    if (!apiKey || apiKey.length < 8) {
      return '****';
    }
    
    const firstChars = apiKey.substring(0, 4);
    const lastChars = apiKey.substring(apiKey.length - 4);
    const maskedMiddle = '*'.repeat(Math.min(20, apiKey.length - 8));
    
    return `${firstChars}${maskedMiddle}${lastChars}`;
  }

  /**
   * Check if API key is about to expire (for providers that have expiry)
   */
  checkKeyExpiry(keyMetadata) {
    if (!keyMetadata.expires_at) {
      return { expired: false, days_remaining: null };
    }

    const now = new Date();
    const expiryDate = new Date(keyMetadata.expires_at);
    const daysRemaining = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

    return {
      expired: daysRemaining <= 0,
      expiring_soon: daysRemaining > 0 && daysRemaining <= 7,
      days_remaining: daysRemaining
    };
  }

  /**
   * Get provider from environment or database
   */
  async getProviderKey(provider) {
    const envKeys = {
      gemini: process.env.GOOGLE_AI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY
    };

    return envKeys[provider];
  }

  /**
   * Validate all configured API keys
   */
  async validateAllKeys() {
    const results = {};
    
    // Check Gemini key
    const geminiKey = await this.getProviderKey('gemini');
    if (geminiKey) {
      results.gemini = await this.testAPIKey(geminiKey, 'gemini');
    }

    // Add other providers as needed
    
    return results;
  }
}

// Singleton instance
let instance = null;

export const getAPIKeyManager = () => {
  if (!instance) {
    instance = new APIKeyManager();
  }
  return instance;
};

export default APIKeyManager;