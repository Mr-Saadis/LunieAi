// src/lib/memory/memory-service.js - NEW FILE
/**
 * 🧠 Memory Service - NEW MEMORY PROCESSING
 * Processes conversation memory for better context
 */

export class MemoryService {
  constructor() {
    this.maxContextLength = 4000
    this.maxMessages = 20
  }

  /**
   * Process conversation history for memory context
   */
  processConversationMemory(conversationHistory, currentQuery) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return {
        memoryContext: '',
        hasMemory: false,
        memoryLength: 0,
        processedMessages: 0
      }
    }

    // Sort messages by timestamp
    const sortedHistory = conversationHistory
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    // Build memory context
    const memoryContext = this.buildMemoryContext(sortedHistory)
    
    // Enhance query with memory if needed
    const enhancedQuery = this.enhanceQueryWithMemory(currentQuery, sortedHistory)

    return {
      memoryContext: memoryContext.context,
      hasMemory: memoryContext.hasMemory,
      memoryLength: memoryContext.contextLength,
      processedMessages: sortedHistory.length,
      enhancedQuery,
      recentTopics: this.extractRecentTopics(sortedHistory)
    }
  }

  /**
   * Build memory context from conversation history
   */
  buildMemoryContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return {
        context: '',
        hasMemory: false,
        contextLength: 0
      }
    }

    let context = 'Previous conversation context:\n'
    let currentLength = 0

    // Take recent messages (last 10)
    const recentMessages = conversationHistory.slice(-10)

    recentMessages.forEach(message => {
      const role = message.type === 'user' ? 'User' : 'Assistant'
      const timestamp = this.formatTimestamp(message.created_at)
      const messageText = `${role} (${timestamp}): ${message.content}\n`

      if (currentLength + messageText.length <= this.maxContextLength) {
        context += messageText
        currentLength += messageText.length
      }
    })

    return {
      context: context.trim(),
      hasMemory: true,
      contextLength: context.length
    }
  }

  /**
   * Enhance query with memory context
   */
  enhanceQueryWithMemory(query, conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return query
    }

    // Check if query refers to previous conversation
    const hasReference = this.detectContextualReference(query)
    
    if (hasReference) {
      const recentContext = this.buildLightContext(conversationHistory.slice(-3))
      return `Context: ${recentContext}\n\nCurrent question: ${query}`
    }

    return query
  }

  /**
   * Detect if query references previous conversation
   */
  detectContextualReference(query) {
    const referenceIndicators = [
      'what did i', 'what was', 'you mentioned', 'you said', 'earlier',
      'before', 'previously', 'continue', 'more about', 'that', 'this',
      'follow up', 'expand on'
    ]

    const lowerQuery = query.toLowerCase()
    return referenceIndicators.some(indicator => lowerQuery.includes(indicator))
  }

  /**
   * Build light context for non-referential queries
   */
  buildLightContext(recentMessages) {
    if (!recentMessages || recentMessages.length === 0) return ''
    
    return recentMessages
      .map(msg => `${msg.type}: ${msg.content.substring(0, 100)}`)
      .join('; ')
  }

  /**
   * Extract recent topics from conversation
   */
  extractRecentTopics(conversationHistory, maxTopics = 5) {
    if (!conversationHistory || conversationHistory.length === 0) return []

    const topicCounts = new Map()
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can'])

    conversationHistory
      .filter(msg => msg.type === 'user')
      .slice(-5) // Last 5 user messages
      .forEach(msg => {
        const words = msg.content.toLowerCase().split(/\s+/)
        words.forEach(word => {
          word = word.replace(/[^\w]/g, '')
          if (word.length > 3 && !stopWords.has(word)) {
            topicCounts.set(word, (topicCounts.get(word) || 0) + 1)
          }
        })
      })

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTopics)
      .map(([topic]) => topic)
  }

  /**
   * Format timestamp for context
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  /**
   * Summarize conversation for very long histories
   */
  summarizeConversation(conversationHistory) {
    if (!conversationHistory || conversationHistory.length < 5) return null

    const userMessages = conversationHistory.filter(msg => msg.type === 'user')
    const topics = this.extractRecentTopics(conversationHistory, 3)

    return {
      messageCount: conversationHistory.length,
      userMessageCount: userMessages.length,
      mainTopics: topics,
      timespan: this.calculateTimespan(conversationHistory),
      summary: `Conversation with ${conversationHistory.length} messages about: ${topics.join(', ')}`
    }
  }

  /**
   * Calculate conversation timespan
   */
  calculateTimespan(messages) {
    if (messages.length < 2) return '0 minutes'
    
    const first = new Date(messages[0].created_at)
    const last = new Date(messages[messages.length - 1].created_at)
    const diffMinutes = Math.round((last - first) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }
}

export default MemoryService