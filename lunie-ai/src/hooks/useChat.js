
// src/hooks/useChat.js
import { useState, useCallback, useRef } from 'react'
import { chatService } from '@/services/chatService'
import { generateSessionId } from '@/utils/helpers'

/**
 * Enhanced chat hook with better state management
 */
export function useChat(chatbotId) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState(null)
  const sessionId = useRef(generateSessionId()).current

  const sendMessage = useCallback(async (messageContent) => {
    if (!messageContent.trim() || isLoading) return false

    setIsLoading(true)
    setError(null)

    // Create temporary user message
    const tempUserMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }

    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await chatService.sendMessage({
        message: messageContent,
        chatbotId,
        conversationId,
        sessionId,
        context: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          origin: window.location.origin
        }
      })

      // Update conversation ID if new
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId)
      }

      // Update messages with successful response
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === tempUserMessage.id 
            ? { ...msg, status: 'delivered', id: `user_${Date.now()}` }
            : msg
        )

        // Add AI response
        updated.push({
          id: response.messageId,
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          sources: response.sources || [],
          metadata: response.metadata || {},
          status: 'delivered'
        })

        return updated
      })

      return true
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.message)

      // Update user message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ))

      // Add error message
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `I apologize for the inconvenience. ${err.message}`,
        timestamp: new Date().toISOString(),
        status: 'error'
      }])

      return false
    } finally {
      setIsLoading(false)
    }
  }, [chatbotId, conversationId, isLoading, sessionId])

  const retryMessage = useCallback(async (messageId) => {
    const message = messages.find(m => m.id === messageId)
    if (message && message.role === 'user') {
      // Remove failed message and resend
      setMessages(prev => prev.filter(m => m.id !== messageId))
      return await sendMessage(message.content)
    }
    return false
  }, [messages, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    conversationId,
    sessionId,
    error,
    sendMessage,
    retryMessage,
    clearMessages
  }
}
