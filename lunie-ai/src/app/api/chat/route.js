// src/app/api/chat/route.js - FIXED VERSION
/**
 * 💬 Chat API Route - RAG Implementation (FIXED)
 * Handles chatbot conversations with RAG pipeline
 */

import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getRAGService } from '@/lib/rag/rag-service'
import { z } from 'zod'
import { getMemoryIntegration } from '@/lib/memory/memory-integration'

// FIXED Request validation schema - handle null values properly
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  chatbotId: z.string().min(1, "Chatbot ID is required"),
  // Allow null, undefined, or valid UUID string
  conversationId: z.string().uuid().nullable().optional(),
  context: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    metadata: z.object({}).optional()
  }).optional()
})

// Rate limiting (simple in-memory store - in production use Redis)
const rateLimitStore = new Map()

/**
 * POST /api/chat
 * Process chat message with RAG pipeline
 */
export async function POST(request) {
  const startTime = Date.now()
  
  try {
    // Get request body
    const body = await request.json()
    console.log('💬 Chat request received:', { 
      message: body.message?.substring(0, 100) + '...', 
      chatbotId: body.chatbotId || 'MISSING',
      hasConversationId: !!body.conversationId
    })
    
    // BETTER ERROR HANDLING - Check required fields first
    if (!body.chatbotId) {
      return NextResponse.json({
        error: 'chatbotId is required',
        details: 'Please provide a valid chatbotId in the request body'
      }, { status: 400 })
    }

    if (!body.message || body.message.trim() === '') {
      return NextResponse.json({
        error: 'message is required',
        details: 'Please provide a non-empty message'
      }, { status: 400 })
    }
    
    // Validate request with better error handling
    let validatedData
    try {
      validatedData = chatRequestSchema.parse(body)
    } catch (validationError) {
      console.error('❌ Validation Error:', validationError)
      
      // Handle Zod validation errors properly
      if (validationError.errors && Array.isArray(validationError.errors)) {
        return NextResponse.json({
          error: 'Invalid request data',
          details: validationError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        }, { status: 400 })
      }
      
      // Fallback for other validation errors
      return NextResponse.json({
        error: 'Invalid request data',
        details: validationError.message || 'Request validation failed'
      }, { status: 400 })
    }
    
    const { message, chatbotId, conversationId, context } = validatedData
    
const memoryIntegration = getMemoryIntegration()
  
  // ADD THIS: Enhance with memory BEFORE your existing RAG processing
  const memoryResult = await memoryIntegration.enhanceWithMemory({
    query: message,
    chatbotId,
    conversationId,
    sessionId: context?.sessionId,
    context
  })
  

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = createRouteClient(() => cookieStore)
    
    // Check if chatbot exists and is active
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, name, is_active, user_id')
      .eq('id', chatbotId)
      .eq('is_active', true)
      .single()
    
    if (chatbotError || !chatbot) {
      console.error('❌ Chatbot not found:', chatbotError)
      return NextResponse.json({
        error: 'Chatbot not found or inactive',
        details: `No active chatbot found with ID: ${chatbotId}`
      }, { status: 404 })
    }
    
    console.log('✅ Chatbot found:', chatbot.name)
    
    // Rate limiting check
    const rateLimitKey = `${chatbot.user_id}:${chatbotId}`
    const now = Date.now()
    const windowSize = 60000 // 1 minute
    const maxRequests = parseInt(process.env.CHAT_RATE_LIMIT || '60')
    
    if (!rateLimitStore.has(rateLimitKey)) {
      rateLimitStore.set(rateLimitKey, { count: 0, windowStart: now })
    }
    
    const rateLimitData = rateLimitStore.get(rateLimitKey)
    
    // Reset window if needed
    if (now - rateLimitData.windowStart > windowSize) {
      rateLimitData.count = 0
      rateLimitData.windowStart = now
    }
    
    if (rateLimitData.count >= maxRequests) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        details: `Maximum ${maxRequests} requests per minute exceeded. Please try again later.`
      }, { status: 429 })
    }
    
    rateLimitData.count++
    
    // Get or create conversation
    // 
    

    let conversation = memoryResult.conversation

if (!conversation) {
  console.error('❌ No conversation available from memory integration')
  return NextResponse.json({
    error: 'Failed to initialize conversation',
    details: 'Memory integration failed to create conversation'
  }, { status: 500 })
}
    
    // Store user message - Use existing schema
    const { data: userMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        type: 'user',  // ← Use 'type' instead of 'role'
        content: message,
        metadata: {
          timestamp: new Date().toISOString(),
          processed: false
        }
      })
      .select()
      .single()
    
    if (messageError) {
      console.error('❌ Failed to store user message:', messageError)
      return NextResponse.json({
        error: 'Failed to store message',
        details: messageError.message
      }, { status: 500 })
    }
    
    console.log('✅ User message stored')
    
    // 🚀 Process with RAG Pipeline
    console.log('🧠 Starting RAG processing...')
    
    let ragResult
    try {
      const ragService = getRAGService()
      
      ragResult = await ragService.processQuery(memoryResult.enhancedQuery || message, chatbotId, {
        userId: context?.userId || 'anonymous',
        conversationId: conversation.id,
        temperature: 0.7,
        maxTokens: 1000
      })
      
      console.log('🎯 RAG processing result:', {
        success: ragResult.success,
        responseLength: ragResult.response?.length || 0,
        sourcesFound: ragResult.sources?.length || 0,
        error: ragResult.error
      })
      
    } catch (ragError) {
      console.error('❌ RAG Processing failed:', ragError)
      ragResult = {
        success: false,
        error: ragError.message,
        response: "I'm sorry, I encountered an error while processing your request. Please try again.",
        sources: [],
        metadata: { error: true }
      }
    }

   
    
    if (!ragResult.success) {
      // Still provide a helpful response even if RAG fails
      ragResult.response = `I'm having trouble finding relevant information right now. However, I'm here to help! Could you try rephrasing your question or ask something more specific about ${chatbot.name}?`
      ragResult.sources = []
      ragResult.metadata = { fallback: true, error: ragResult.error }
    }
    
    // Store AI response - Use existing schema
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        type: 'assistant',  // ← Use 'type' instead of 'role'
        content: ragResult.response,
        ai_model: ragResult.metadata?.model || 'gemini-2.5-flash',  // ← Use existing ai_model column
        prompt_tokens: ragResult.metadata?.tokens_used || 0,        // ← Use existing prompt_tokens
        completion_tokens: ragResult.metadata?.tokens_used || 0,    // ← Use existing completion_tokens  
        response_time_ms: ragResult.metadata?.duration || 0,        // ← Use existing response_time_ms
        metadata: {
          timestamp: new Date().toISOString(),
          sources: ragResult.sources || [],
          confidence: ragResult.metadata?.confidence || 0,
          processing_time: ragResult.metadata?.duration || 0,
          chunks_used: ragResult.metadata?.chunks_used || 0,
          rag_success: ragResult.success,
          error_details: ragResult.error || null
        }
      })
      .select()
      .single()
    
    if (aiMessageError) {
      console.error('❌ Failed to store AI message:', aiMessageError)
      return NextResponse.json({
        error: 'Failed to store AI response',
        details: aiMessageError.message
      }, { status: 500 })
    }
    
    // Update conversation stats (optional - create this function if needed)
    try {
      await supabase.rpc('increment_conversation_messages', {
        conversation_id: conversation.id,
        message_count: 2 // user + assistant
      })
    } catch (rpcError) {
      // Non-critical error, just log it
      console.log('⚠️ Could not update conversation stats:', rpcError.message)
    }
    
    const totalDuration = Date.now() - startTime
    
    console.log('✅ Chat processed successfully:', {
      conversationId: conversation.id,
      responseLength: ragResult.response.length,
      sources: ragResult.sources?.length || 0,
      confidence: ragResult.metadata?.confidence || 0,
      totalDuration,
      ragSuccess: ragResult.success
    })
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        message: ragResult.response,
        conversationId: conversation.id,
        messageId: aiMessage.id,
        sources: ragResult.sources || [],
        metadata: {
          memory_enhanced: memoryResult.hasMemory,
        memory_context_length: memoryResult.memoryContext?.memoryLength || 0,
          confidence: ragResult.metadata?.confidence || 0,
          processing_time: totalDuration,
          chunks_used: ragResult.metadata?.chunks_used || 0,
          model: ragResult.metadata?.model || 'unknown',
          rag_success: ragResult.success
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Chat API Error:', error)
    
    const totalDuration = Date.now() - startTime
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      }, { status: 400 })
    }
    
    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      processing_time: totalDuration
    }, { status: 500 })
  }
}

/**
 * GET /api/chat?conversationId=xxx
 * Get conversation history
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json({
        error: 'conversationId is required'
      }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    const supabase = createRouteClient(() => cookieStore)
    
    // Get conversation with messages - Use existing schema
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        type,
        content,
        created_at,
        metadata,
        conversations!inner(id, chatbot_id, chatbots!inner(name))
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Failed to fetch conversation:', error)
      return NextResponse.json({
        error: 'Failed to fetch conversation',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.type,  // ← Map 'type' to 'role' for frontend compatibility
          content: msg.content,
          timestamp: msg.created_at,
          sources: msg.metadata?.sources || [],
          confidence: msg.metadata?.confidence
        })),
        chatbot: messages[0]?.conversations?.chatbots?.name || 'Unknown'
      }
    })
    
  } catch (error) {
    console.error('❌ GET Chat API Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Helper: Generate session ID
 */
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}