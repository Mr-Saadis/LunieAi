// src/lib/memory/memory-integration.js - NEW FILE
/**
 * 🔗 Memory Integration Service - NEW
 * Integrates memory with your existing RAG system WITHOUT changing existing code
 */

import { ConversationManager } from './conversation-manager.js'
import { MemoryService } from './memory-service.js'

export class MemoryIntegration {
  constructor() {
    this.conversationManager = new ConversationManager()
    this.memoryService = new MemoryService()
  }

  /**
   * Enhance your existing RAG process with memory
   * Call this BEFORE your existing RAG processing
   */
  async enhanceWithMemory({
    query,
    chatbotId,
    conversationId = null,
    sessionId,
    context = {}
  }) {
    try {
      console.log('🧠 Starting memory enhancement...')
      
      // Step 1: Get or create conversation
      const conversation = await this.conversationManager.getOrCreateConversation({
        conversationId,
        chatbotId,
        sessionId: sessionId || this.generateSessionId(),
        visitorInfo: context.metadata || {}
      })

      if (!conversation) {
        console.log('⚠️ No conversation available, proceeding without memory')
        return {
          conversation: null,
          memoryContext: null,
          enhancedQuery: query,
          hasMemory: false
        }
      }

      // Step 2: Get conversation history
      const conversationHistory = await this.conversationManager.getConversationHistory(
        conversation.id,
        15 // Get last 15 messages
      )

      // Step 3: Process memory
      const memoryResult = this.memoryService.processConversationMemory(
        conversationHistory,
        query
      )

      console.log('✅ Memory enhancement complete:', {
        conversationId: conversation.id,
        hasMemory: memoryResult.hasMemory,
        memoryLength: memoryResult.memoryLength,
        processedMessages: memoryResult.processedMessages
      })

      return {
        conversation,
        memoryContext: memoryResult,
        enhancedQuery: memoryResult.enhancedQuery,
        hasMemory: memoryResult.hasMemory,
        conversationHistory
      }

    } catch (error) {
      console.error('❌ Memory enhancement failed:', error)
      // Return without memory if it fails
      return {
        conversation: null,
        memoryContext: null,
        enhancedQuery: query,
        hasMemory: false
      }
    }
  }

  /**
   * Store message after RAG processing
   * Call this AFTER your existing RAG processing
   */
  async storeMessageWithMemory({
    conversation,
    userMessage,
    aiResponse,
    metadata = {}
  }) {
    if (!conversation) {
      console.log('⚠️ No conversation to store messages in')
      return { success: false }
    }

    try {
      // Store user message
      const storedUserMessage = await this.conversationManager.storeMessage({
        conversationId: conversation.id,
        type: 'user',
        content: userMessage,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata.user
        }
      })

      // Store AI response
      const storedAIMessage = await this.conversationManager.storeMessage({
        conversationId: conversation.id,
        type: 'assistant',
        content: aiResponse,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata.ai
        }
      })

      console.log('✅ Messages stored with memory context')

      return {
        success: true,
        userMessage: storedUserMessage,
        aiMessage: storedAIMessage
      }

    } catch (error) {
      console.error('❌ Failed to store messages:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Enhance your existing prompt with memory context
   */
  enhancePromptWithMemory(originalPrompt, memoryContext) {
    if (!memoryContext || !memoryContext.hasMemory) {
      return originalPrompt
    }

    const memoryPrompt = `${memoryContext.memoryContext}

Current request: ${originalPrompt}

Instructions: Consider the conversation history above when responding. If the user refers to previous parts of our conversation, acknowledge and reference the relevant context.`

    return memoryPrompt
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get conversation for API responses
   */
  async getConversationHistory(conversationId, limit = 50) {
    try {
      const messages = await this.conversationManager.getConversationHistory(conversationId, limit)
      const summary = this.memoryService.summarizeConversation(messages)

      return {
        success: true,
        conversation: { id: conversationId },
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.type,
          content: msg.content,
          timestamp: msg.created_at,
          sources: msg.metadata?.sources || [],
          confidence: msg.metadata?.confidence,
          memoryContext: msg.metadata?.memoryContext || 0
        })),
        summary,
        totalMessages: messages.length
      }

    } catch (error) {
      console.error('❌ Failed to get conversation history:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Clear conversation
   */
  async clearConversation(conversationId) {
    try {
      const success = await this.conversationManager.clearConversation(conversationId)
      return { success }
    } catch (error) {
      console.error('❌ Failed to clear conversation:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton
let memoryIntegrationInstance = null

export const getMemoryIntegration = () => {
  if (!memoryIntegrationInstance) {
    memoryIntegrationInstance = new MemoryIntegration()
  }
  return memoryIntegrationInstance
}

export default MemoryIntegration