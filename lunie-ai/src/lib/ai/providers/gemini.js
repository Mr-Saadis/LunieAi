// lunie-ai/src/lib/ai/providers/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base.js';

export class GeminiProvider extends BaseAIProvider {
  constructor(model) {
    super(model);
    
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not found in environment variables');
    }

    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.generativeModel = this.client.getGenerativeModel({ model: this.model });
  }

  async generateResponse(messages, options = {}) {
    const startTime = Date.now();
    
    try {
      // Convert messages to Gemini format
      const formattedMessages = this.formatMessages(messages);
      
      // Build conversation history
      const history = formattedMessages.slice(0, -1);
      const currentMessage = formattedMessages[formattedMessages.length - 1];

      // Start chat session with history
      const chat = this.generativeModel.startChat({
        history,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1000,
          topP: 0.95,
          topK: 40,
        },
      });

      // Send current message
      const result = await chat.sendMessage(currentMessage.parts[0].text);
      const response = await result.response;
      
      const duration = Date.now() - startTime;

      return {
        content: response.text(),
        usage: {
          promptTokens: await this.estimateTokens(formattedMessages),
          completionTokens: await this.estimateTokens([{ parts: [{ text: response.text() }] }]),
          totalTokens: 0 // Gemini doesn't provide exact token counts
        },
        model: this.model,
        duration,
        provider: 'gemini'
      };

    } catch (error) {
      this.handleError(error);
    }
  }

  async generateEmbedding(text, options = {}) {
    try {
      // For now, we'll use a simple approach
      // Later we can integrate with OpenAI embeddings or Google's embedding models
      throw new Error('Embedding generation will be implemented with vector database setup');
    } catch (error) {
      this.handleError(error);
    }
  }

  // Gemini-specific message formatting
  formatMessages(messages) {
    return messages.map(msg => {
      // Gemini uses 'model' instead of 'assistant'
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });
  }

  // Simple token estimation (rough calculation)
  async estimateTokens(messages) {
    const text = messages.map(m => m.parts[0].text).join(' ');
    return Math.ceil(text.length / 4); // Rough estimation: 1 token ≈ 4 characters
  }

  handleError(error) {
    console.error('Gemini Provider Error:', error);
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    }
    
    if (error.message?.includes('SAFETY')) {
      throw new Error('Content blocked by Gemini safety filters. Please rephrase your message.');
    }
    
    throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
  }
}

export default GeminiProvider;