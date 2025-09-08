// src/lib/memory/conversation-manager.js - NEW FILE
/**
 * 📚 Conversation Manager - NEW MEMORY SERVICE
 * Handles conversation memory and persistence WITHOUT changing existing code
 */

import { createRouteClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export class ConversationManager {
  constructor() {
    this.memoryCache = new Map()
    this.maxCacheSize = 100
    this.cacheExpiry = 15 * 60 * 1000 // 15 minutes
  }

  /**
   * Get Supabase client
   */
  async getSupabaseClient() {
    const cookieStore = await cookies()
    return createRouteClient(() => cookieStore)
  }

  /**
   * Get or create conversation
   */
  async getOrCreateConversation({
    conversationId = null,
    chatbotId,
    sessionId,
    visitorInfo = {}
  }) {
    try {
      const supabase = await this.getSupabaseClient()
      
      // Try to get existing conversation
      if (conversationId) {
        const { data: existingConversation, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('chatbot_id', chatbotId)
          .single()
        
        if (!error && existingConversation) {
          console.log('✅ Retrieved existing conversation:', conversationId)
          return existingConversation
        }
      }
      
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          chatbot_id: chatbotId,
          session_id: sessionId,
          visitor_info: visitorInfo,
          channel: 'website',
          is_active: true,
          message_count: 0,
          first_message_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create conversation:', createError)
        return null
      }
      
      console.log('✅ Created new conversation:', newConversation.id)
      return newConversation
      
    } catch (error) {
      console.error('❌ ConversationManager error:', error)
      return null
    }
  }

  /**
   * Store message in conversation
   */
  async storeMessage({
    conversationId,
    type,
    content,
    metadata = {}
  }) {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          type,
          content,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()
      
      if (messageError) {
        console.error('❌ Failed to store message:', messageError)
        return null
      }
      
      // Update conversation stats
      await this.updateConversationStats(conversationId)
      
      return message
      
    } catch (error) {
      console.error('❌ Failed to store message:', error)
      return null
    }
  }

  /**
   * Get conversation history for memory
   */
  async getConversationHistory(conversationId, limit = 20) {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit)
      
      if (error) {
        console.error('❌ Failed to get conversation history:', error)
        return []
      }
      
      return messages || []
      
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error)
      return []
    }
  }

  /**
   * Build memory context from history
   */
  buildMemoryContext(conversationHistory, maxLength = 2000) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return {
        context: '',
        hasMemory: false,
        messageCount: 0
      }
    }

    let context = 'Previous conversation:\n'
    let currentLength = 0

    // Start from most recent and work backwards
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const message = conversationHistory[i]
      const role = message.type === 'user' ? 'User' : 'Assistant'
      const messageText = `${role}: ${message.content}\n`

      if (currentLength + messageText.length > maxLength) {
        if (context !== 'Previous conversation:\n') {
          context = 'Previous conversation:\n[Earlier messages truncated]\n' + context.replace('Previous conversation:\n', '')
        }
        break
      }

      context = context.replace('Previous conversation:\n', `Previous conversation:\n${messageText}`)
      currentLength += messageText.length
    }

    return {
      context: context.trim(),
      hasMemory: true,
      messageCount: conversationHistory.length,
      contextLength: context.length
    }
  }

  /**
   * Update conversation statistics
   */
  async updateConversationStats(conversationId) {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
      
      await supabase
        .from('conversations')
        .update({
          message_count: count || 0,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
      
    } catch (error) {
      console.error('❌ Failed to update conversation stats:', error)
    }
  }

  /**
   * Clear conversation
   */
  async clearConversation(conversationId) {
    try {
      const supabase = await this.getSupabaseClient()
      
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
      
      if (messagesError) {
        console.error('❌ Failed to delete messages:', messagesError)
        return false
      }
      
      // Delete conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (conversationError) {
        console.error('❌ Failed to delete conversation:', conversationError)
        return false
      }
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to clear conversation:', error)
      return false
    }
  }
}

export default ConversationManager