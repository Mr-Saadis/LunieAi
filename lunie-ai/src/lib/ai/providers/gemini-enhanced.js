// src/lib/ai/providers/gemini-enhanced.js
/**
 * Enhanced Gemini AI Provider
 * With better error handling, retry logic, and performance tracking
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base.js';
import { getUsageTracker } from '../usage-tracker';
import { getModelConfig } from '../models-config';
import pRetry from 'p-retry';

export class EnhancedGeminiProvider extends BaseAIProvider {
  constructor(model = 'gemini-1.5-flash') {
    super(model);
    
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not found in environment variables');
    }

    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.modelConfig = getModelConfig(model);
    this.usageTracker = getUsageTracker();
    
    // Initialize model with config
    this.generativeModel = this.client.getGenerativeModel({ 
      model: this.model,
      generationConfig: this.modelConfig.defaultParams
    });

    // Rate limiting state
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.requestWindow = 60000; // 1 minute window
  }

  /**
   * Generate response with retry logic and tracking
   */
  async generateResponse(messages, options = {}) {
    const startTime = Date.now();
    const userId = options.userId;
    const chatbotId = options.chatbotId;

    try {
      // Check rate limits
      await this.checkRateLimit(userId);

      // Format messages for Gemini
      const formattedMessages = this.formatMessages(messages);
      
      // Build conversation history
      const history = formattedMessages.slice(0, -1);
      const currentMessage = formattedMessages[formattedMessages.length - 1];

      // Merge options with model defaults
      const generationConfig = {
        ...this.modelConfig.defaultParams,
        temperature: options.temperature ?? this.modelConfig.defaultParams.temperature,
        maxOutputTokens: options.maxTokens ?? this.modelConfig.defaultParams.maxOutputTokens,
        topP: options.topP ?? this.modelConfig.defaultParams.topP,
        topK: options.topK ?? this.modelConfig.defaultParams.topK,
      };

      // Generate with retry logic
      const response = await pRetry(
        async () => {
          const chat = this.generativeModel.startChat({
            history,
            generationConfig,
            safetySettings: this.getSafetySettings(options.safetyLevel)
          });

          const result = await chat.sendMessage(currentMessage.parts[0].text);
          return result.response;
        },
        {
          retries: 3,
          onFailedAttempt: error => {
            console.log(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
          },
          minTimeout: 1000,
          maxTimeout: 5000
        }
      );

      const responseText = response.text();
      const duration = Date.now() - startTime;

      // Estimate tokens (Gemini doesn't provide exact counts)
      const usage = {
        promptTokens: await this.estimateTokens(formattedMessages),
        completionTokens: await this.estimateTokens([{ parts: [{ text: responseText }] }]),
        totalTokens: 0
      };
      usage.totalTokens = usage.promptTokens + usage.completionTokens;

      // Track usage
      if (userId) {
        await this.usageTracker.trackUsage({
          userId,
          chatbotId,
          model: this.model,
          provider: 'gemini',
          inputTokens: usage.promptTokens,
          outputTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: duration,
          success: true,
          metadata: {
            temperature: generationConfig.temperature,
            maxTokens: generationConfig.maxOutputTokens
          }
        });
      }

      return {
        content: responseText,
        usage,
        model: this.model,
        duration,
        provider: 'gemini',
        finishReason: response.candidates?.[0]?.finishReason || 'STOP'
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Track failed usage
      if (userId) {
        await this.usageTracker.trackUsage({
          userId,
          chatbotId,
          model: this.model,
          provider: 'gemini',
          responseTime: duration,
          success: false,
          error: error.message
        });
      }

      return this.handleError(error);
    }
  }

  /**
   * Generate embeddings (using text-embedding-004)
   */
  async generateEmbedding(text, options = {}) {
    try {
      const embeddingModel = this.client.getGenerativeModel({ 
        model: 'models/text-embedding-004'
      });

      const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: options.taskType || 'RETRIEVAL_DOCUMENT',
        title: options.title
      });

      return {
        embedding: result.embedding.values,
        dimensions: result.embedding.values.length,
        model: 'text-embedding-004',
        provider: 'gemini'
      };

    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Format messages for Gemini
   */
  formatMessages(messages) {
    return messages.map(msg => {
      // Handle system messages
      if (msg.role === 'system') {
        return {
          role: 'user',
          parts: [{ text: `Instructions: ${msg.content}` }]
        };
      }
      
      // Convert assistant to model
      const role = msg.role === 'assistant' ? 'model' : 'user';
      
      // Handle multimodal content if present
      if (msg.images && msg.images.length > 0) {
        return {
          role,
          parts: [
            { text: msg.content },
            ...msg.images.map(img => ({ 
              inlineData: { 
                mimeType: img.mimeType || 'image/jpeg', 
                data: img.data 
              } 
            }))
          ]
        };
      }

      return {
        role,
        parts: [{ text: msg.content }]
      };
    });
  }

  /**
   * Enhanced token estimation
   */
  async estimateTokens(messages) {
    let totalChars = 0;
    
    messages.forEach(msg => {
      if (msg.parts) {
        msg.parts.forEach(part => {
          if (part.text) {
            totalChars += part.text.length;
          }
        });
      }
    });

    // Better estimation: ~3.5 characters per token for English
    return Math.ceil(totalChars / 3.5);
  }

  /**
   * Safety settings configuration
   */
  getSafetySettings(level = 'medium') {
    const settings = {
      low: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ],
      medium: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ],
      high: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
      ]
    };

    return settings[level] || settings.medium;
  }

  /**
   * Enhanced error handling
   */
  handleError(error) {
    console.error('Gemini Provider Error:', error);
    
    const errorMessage = error.message || '';
    
    // Rate limit errors
    if (errorMessage.includes('RATE_LIMIT_EXCEEDED') || errorMessage.includes('429')) {
      throw {
        type: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again in a minute.',
        retryAfter: 60
      };
    }
    
    // Quota errors
    if (errorMessage.includes('QUOTA_EXCEEDED')) {
      throw {
        type: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded. Please try again later or upgrade your plan.'
      };
    }
    
    // Invalid API key
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401')) {
      throw {
        type: 'AUTH_ERROR',
        message: 'Invalid API key. Please check your configuration.'
      };
    }
    
    // Safety filter triggered
    if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
      throw {
        type: 'SAFETY_BLOCK',
        message: 'Content blocked by safety filters. Please rephrase your message.'
      };
    }
    
    // Model overload
    if (errorMessage.includes('503') || errorMessage.includes('OVERLOADED')) {
      throw {
        type: 'SERVICE_ERROR',
        message: 'Service temporarily unavailable. Please try again.',
        retryAfter: 30
      };
    }

    // Generic error
    throw {
      type: 'UNKNOWN_ERROR',
      message: `An error occurred: ${errorMessage}`
    };
  }

  /**
   * Stream response (for future implementation)
   */
  async *streamResponse(messages, options = {}) {
    try {
      const formattedMessages = this.formatMessages(messages);
      const history = formattedMessages.slice(0, -1);
      const currentMessage = formattedMessages[formattedMessages.length - 1];

      const chat = this.generativeModel.startChat({
        history,
        generationConfig: {
          ...this.modelConfig.defaultParams,
          ...options
        }
      });

      const result = await chat.sendMessageStream(currentMessage.parts[0].text);

      for await (const chunk of result.stream) {
        yield {
          content: chunk.text(),
          type: 'content'
        };
      }

      yield { type: 'done' };

    } catch (error) {
      yield {
        type: 'error',
        error: this.handleError(error)
      };
    }
  }
}

export default EnhancedGeminiProvider;