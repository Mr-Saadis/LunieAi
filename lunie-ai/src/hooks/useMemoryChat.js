// src/hooks/useMemoryChat.js - NEW HOOK
/**
 * 🪝 Memory Chat Hook - NEW
 * Hook to easily add memory to your existing chat components
 */

import { useState, useEffect, useCallback } from 'react'

export function useMemoryChat(chatbotId, options = {}) {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [memoryInfo, setMemoryInfo] = useState({
    hasMemory: false,
    memoryLength: 0,
    messageCount: 0
  })

  const {
    persistConversation = true,
    sessionId = null,
    apiEndpoint = '/api/chat-with-memory'
  } = options

  // Load conversation ID from localStorage
  useEffect(() => {
    if (persistConversation && chatbotId) {
      const savedConversationId = localStorage.getItem(`memory_conversation_${chatbotId}`)
      if (savedConversationId) {
        setConversationId(savedConversationId)
        loadConversationHistory(savedConversationId)
      }
    }
  }, [chatbotId, persistConversation])

  // Save conversation ID to localStorage
  useEffect(() => {
    if (persistConversation && conversationId && chatbotId) {
      localStorage.setItem(`memory_conversation_${chatbotId}`, conversationId)
    }
  }, [conversationId, chatbotId, persistConversation])

  // Load conversation history
  const loadConversationHistory = async (convId) => {
    try {
      const response = await fetch(`${apiEndpoint}?conversationId=${convId}&limit=20`)
      const result = await response.json()

      if (result.success && result.data.messages) {
        setMessages(result.data.messages)
        setMemoryInfo({
          hasMemory: true,
          memoryLength: result.data.summary?.messageCount || 0,
          messageCount: result.data.totalMessages || 0
        })
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err)
    }
  }

  // Send message with memory
  const sendMessage = useCallback(async (messageText, context = {}) => {
    if (!messageText.trim() || loading) return

    const userMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const requestBody = {
        message: messageText.trim(),
        chatbotId,
        conversationId,
        context: {
          sessionId: sessionId || `sess_${Date.now()}`,
          userId: context.userId || 'anonymous',
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...context.metadata
          }
        }
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (result.success) {
        // Update conversation ID if we got a new one
        if (result.conversationId && result.conversationId !== conversationId) {
          setConversationId(result.conversationId)
        }

        // Update memory info
        setMemoryInfo({
          hasMemory: result.metadata?.memory_enhanced || false,
          memoryLength: result.metadata?.memory_context_length || 0,
          messageCount: messages.length + 2 // +2 for current user and assistant messages
        })

        // Remove temp message and add both user and assistant messages
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
          return [
            ...withoutTemp,
            {
              ...userMessage,
              id: `user_${Date.now()}`
            },
            {
              id: `assistant_${Date.now()}`,
              role: 'assistant',
              content: result.message,
              timestamp: new Date().toISOString(),
              sources: result.sources || [],
              confidence: result.metadata?.confidence,
              memoryContext: result.metadata?.memory_context_length || 0,
              processingTime: result.metadata?.processing_time
            }
          ]
        })

        return result

      } else {
        setError(result.error || 'Failed to send message')
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('Memory chat error:', err)
      setError('Network error. Please try again.')
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [chatbotId, conversationId, loading, messages.length, sessionId, apiEndpoint])

  // Clear conversation
  const clearConversation = useCallback(async () => {
    try {
      if (conversationId) {
        const response = await fetch(`${apiEndpoint}?conversationId=${conversationId}`, {
          method: 'DELETE'
        })

        const result = await response.json()
        if (!result.success) {
          console.error('Failed to clear conversation:', result.error)
        }
      }

      setMessages([])
      setConversationId(null)
      setMemoryInfo({
        hasMemory: false,
        memoryLength: 0,
        messageCount: 0
      })

      if (persistConversation && chatbotId) {
        localStorage.removeItem(`memory_conversation_${chatbotId}`)
      }

      return true
    } catch (err) {
      console.error('Failed to clear conversation:', err)
      return false
    }
  }, [conversationId, chatbotId, persistConversation, apiEndpoint])

  // Get conversation history
  const getConversationHistory = useCallback(async (limit = 50) => {
    if (!conversationId) return null

    try {
      const response = await fetch(`${apiEndpoint}?conversationId=${conversationId}&limit=${limit}`)
      const result = await response.json()

      if (result.success) {
        return result.data
      }
      return null
    } catch (err) {
      console.error('Failed to get conversation history:', err)
      return null
    }
  }, [conversationId, apiEndpoint])

  return {
    // State
    messages,
    conversationId,
    loading,
    error,
    memoryInfo,

    // Actions
    sendMessage,
    clearConversation,
    getConversationHistory,

    // Utils
    hasActiveConversation: !!conversationId,
    messageCount: messages.length
  }
}

export default useMemoryChat