// src/lib/ai/embeddings/gemini-embeddings.js
/**
 * Gemini Embedding Generator
 * Creates embeddings using Google's text-embedding-004 model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiEmbeddings {
  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }
    
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = 'text-embedding-001';
    this.dimensions = 1536; // Dimensions for text-embedding-001
    this.batchSize = 100;
  }

  /**
   * Generate embedding for single text
   */
  async generateEmbedding(text, options = {}) {
    try {
      const embeddingModel = this.client.getGenerativeModel({ 
        model: 'models/' + this.model 
      });

      const result = await embeddingModel.embedContent({
        content: { 
          parts: [{ text: this.truncateText(text) }] 
        },
        taskType: options.taskType || 'RETRIEVAL_DOCUMENT',
        title: options.title
      });

      return {
        embedding: result.embedding.values,
        dimensions: result.embedding.values.length,
        model: this.model,
        text: text.substring(0, 100) // Store preview
      };

    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateBatchEmbeddings(texts, options = {}) {
    const embeddings = [];
    const errors = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(texts.length / this.batchSize)}`);
      
      // Process batch in parallel with rate limiting
      const batchPromises = batch.map(async (text, index) => {
        // Add small delay to avoid rate limits
        await this.delay(index * 100);
        
        try {
          const result = await this.generateEmbedding(text, options);
          return { success: true, result, index: i + index };
        } catch (error) {
          return { success: false, error: error.message, index: i + index };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          embeddings.push(result.result);
        } else {
          errors.push(result);
        }
      });

      // Rate limit between batches
      if (i + this.batchSize < texts.length) {
        await this.delay(1000);
      }
    }

    return {
      embeddings,
      errors,
      successRate: (embeddings.length / texts.length) * 100
    };
  }

  /**
   * Generate embeddings for document chunks
   */
  async embedDocumentChunks(chunks) {
    const embeddingsData = [];
    
    for (const chunk of chunks) {
      try {
        const embedding = await this.generateEmbedding(chunk.content, {
          title: chunk.metadata?.title
        });
        
        embeddingsData.push({
          id: chunk.id,
          embedding: embedding.embedding,
          metadata: {
            ...chunk.metadata,
            content: chunk.content,
            embeddingModel: this.model,
            embeddingDimensions: embedding.dimensions
          }
        });
        
        // Rate limiting
        await this.delay(100);
        
      } catch (error) {
        console.error(`Failed to embed chunk ${chunk.id}:`, error);
        embeddingsData.push({
          id: chunk.id,
          error: error.message,
          metadata: chunk.metadata
        });
      }
    }

    return embeddingsData;
  }

  /**
   * Generate query embedding (optimized for search)
   */
  async generateQueryEmbedding(query) {
    try {
      const embeddingModel = this.client.getGenerativeModel({ 
        model: 'models/' + this.model 
      });

      const result = await embeddingModel.embedContent({
        content: { 
          parts: [{ text: this.truncateText(query) }] 
        },
        taskType: 'RETRIEVAL_QUERY' // Optimized for search
      });

      return result.embedding.values;
      
    } catch (error) {
      console.error('Query embedding failed:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Truncate text to model limits
   */
  truncateText(text) {
    const maxLength = 2048; // Gemini embedding limit
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    return text;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      dimensions: this.dimensions,
      maxInputLength: 2048,
      batchSize: this.batchSize
    };
  }
}

// Singleton instance
let instance = null;

export const getGeminiEmbeddings = () => {
  if (!instance) {
    instance = new GeminiEmbeddings();
  }
  return instance;
};

export default GeminiEmbeddings;