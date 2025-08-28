// src/lib/utils/text-processing.js
/**
 * Text Processing Utilities
 * For chunking and preparing text for embeddings
 */

import { v4 as uuidv4 } from 'uuid';

class TextProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 800;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.minChunkSize = options.minChunkSize || 100;
    this.maxChunkSize = options.maxChunkSize || 1500;
  }

  /**
   * Split text into chunks with overlap
   */
  chunkText(text, metadata = {}) {
    if (!text || text.length < this.minChunkSize) {
      return [{
        id: uuidv4(),
        content: text,
        metadata: {
          ...metadata,
          chunkIndex: 0,
          totalChunks: 1,
          startChar: 0,
          endChar: text.length
        }
      }];
    }

    const chunks = [];
    const sentences = this.splitIntoSentences(text);
    let currentChunk = '';
    let currentStart = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + sentence;

      if (potentialChunk.length > this.chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: uuidv4(),
          content: currentChunk.trim(),
          metadata: {
            ...metadata,
            chunkIndex,
            startChar: currentStart,
            endChar: currentStart + currentChunk.length
          }
        });

        // Start new chunk with overlap
        const overlapSentences = this.getOverlapSentences(sentences, i);
        currentChunk = overlapSentences + sentence;
        currentStart = text.indexOf(overlapSentences);
        chunkIndex++;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: uuidv4(),
        content: currentChunk.trim(),
        metadata: {
          ...metadata,
          chunkIndex,
          startChar: currentStart,
          endChar: currentStart + currentChunk.length
        }
      });
    }

    // Add total chunks count
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    // Improved sentence splitting
    const sentenceEnders = /([.!?])\s+/g;
    const sentences = text.split(sentenceEnders);
    
    const result = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '');
      if (sentence.trim()) {
        result.push(sentence);
      }
    }
    
    return result.length > 0 ? result : [text];
  }

  /**
   * Get overlap sentences for context
   */
  getOverlapSentences(sentences, currentIndex) {
    const overlapChars = this.chunkOverlap;
    let overlap = '';
    let charCount = 0;
    
    for (let i = currentIndex - 1; i >= 0 && charCount < overlapChars; i--) {
      overlap = sentences[i] + overlap;
      charCount += sentences[i].length;
    }
    
    return overlap;
  }

  /**
   * Process document with metadata
   */
  processDocument(document) {
    const {
      content,
      title = 'Untitled',
      source = 'unknown',
      type = 'text',
      chatbotId,
      userId,
      ...additionalMetadata
    } = document;

    // Clean text
    const cleanedText = this.cleanText(content);

    // Create chunks
    const chunks = this.chunkText(cleanedText, {
      title,
      source,
      type,
      chatbotId,
      userId,
      ...additionalMetadata,
      processedAt: new Date().toISOString()
    });

    return {
      originalLength: content.length,
      cleanedLength: cleanedText.length,
      chunks: chunks,
      chunkCount: chunks.length
    };
  }

  /**
   * Clean text for processing
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters but keep punctuation
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text, limit = 10) {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);

    return sorted;
  }

  /**
   * Prepare text for embedding
   */
  prepareForEmbedding(text) {
    // Truncate if too long (Gemini has limits)
    const maxLength = 2048;
    const cleaned = this.cleanText(text);
    
    if (cleaned.length > maxLength) {
      return cleaned.substring(0, maxLength - 3) + '...';
    }
    
    return cleaned;
  }

  /**
   * Calculate text statistics
   */
  getTextStats(text) {
    const cleaned = this.cleanText(text);
    const words = cleaned.split(/\s+/);
    const sentences = this.splitIntoSentences(cleaned);
    
    return {
      characters: cleaned.length,
      words: words.length,
      sentences: sentences.length,
      avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      avgSentenceLength: sentences.reduce((sum, sent) => sum + sent.split(/\s+/).length, 0) / sentences.length
    };
  }

  /**
   * Merge overlapping chunks
   */
  mergeChunks(chunks, maxLength = 2000) {
    if (chunks.length <= 1) return chunks;
    
    const merged = [];
    let currentMerged = chunks[0];
    
    for (let i = 1; i < chunks.length; i++) {
      const combined = currentMerged.content + ' ' + chunks[i].content;
      
      if (combined.length <= maxLength) {
        currentMerged = {
          ...currentMerged,
          content: combined,
          metadata: {
            ...currentMerged.metadata,
            merged: true,
            originalChunks: [
              ...(currentMerged.metadata.originalChunks || [currentMerged.metadata.chunkIndex]),
              chunks[i].metadata.chunkIndex
            ]
          }
        };
      } else {
        merged.push(currentMerged);
        currentMerged = chunks[i];
      }
    }
    
    merged.push(currentMerged);
    return merged;
  }
}

// Export singleton instance
let instance = null;

export const getTextProcessor = (options) => {
  if (!instance) {
    instance = new TextProcessor(options);
  }
  return instance;
};

export default TextProcessor;