
// src/services/chatService.js
/**
 * Chat service for API communication
 * Handles all chat-related API calls with proper error handling
 */
class ChatService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  /**
   * Send message to chat API
   */
  async sendMessage({ message, chatbotId, conversationId, sessionId, context = {} }) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          chatbotId,
          conversationId,
          context: {
            sessionId,
            ...context
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        messageId: data.data?.messageId || `msg_${Date.now()}`,
        message: data.data?.message || data.message,
        conversationId: data.data?.conversationId || conversationId,
        sources: data.data?.sources || [],
        metadata: data.data?.metadata || {}
      }
    } catch (error) {
      console.error('ChatService.sendMessage error:', error)
      throw new Error(error.message || 'Failed to send message')
    }
  }

  /**
   * Get widget configuration
   */
  async getWidgetConfig(chatbotId, apiKey) {
    try {
      const response = await fetch(`/api/widget/config/${chatbotId}`, {
        headers: {
          'Authorization': apiKey ? `Bearer ${apiKey}` : '',
          'Origin': window.location.origin
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch widget configuration')
      }

      return await response.json()
    } catch (error) {
      console.error('ChatService.getWidgetConfig error:', error)
      throw new Error('Widget configuration unavailable')
    }
  }

  /**
   * Validate chatbot access
   */
  async validateAccess(chatbotId, origin) {
    try {
      const response = await fetch(`/api/widget/validate/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin })
      })

      return response.ok
    } catch (error) {
      console.error('ChatService.validateAccess error:', error)
      return false
    }
  }
}

export const chatService = new ChatService()
