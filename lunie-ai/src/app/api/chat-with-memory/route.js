// src/app/api/chat-with-memory/route.js - NEW API ENDPOINT
/**
 * 💬 NEW Chat API with Memory - Works alongside your existing /api/chat
 * This is a NEW endpoint that adds memory to your existing RAG system
 */

import { NextResponse } from 'next/server'
import { getMemoryIntegration } from '@/lib/memory/memory-integration'
import { getRAGService } from '@/lib/rag/rag-service'
import { z } from 'zod'

// Validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  chatbotId: z.string().min(1),
  conversationId: z.string().uuid().nullable().optional(),
  context: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    metadata: z.object({}).optional()
  }).optional()
})

/**
 * POST /api/chat-with-memory
 * Enhanced chat endpoint with memory support
 */
export async function POST(request) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    console.log('💬 Chat with memory request:', { 
      message: body.message?.substring(0, 100) + '...', 
      chatbotId: body.chatbotId,
      hasConversationId: !!body.conversationId
    })
    
    // Validate request
    const validatedData = chatRequestSchema.parse(body)
    const { message, chatbotId, conversationId, context } = validatedData
    
    // Get memory integration service
    const memoryIntegration = getMemoryIntegration()
    
    // STEP 1: Enhance with memory (NEW)
    const memoryResult = await memoryIntegration.enhanceWithMemory({
      query: message,
      chatbotId,
      conversationId,
      sessionId: context?.sessionId,
      context
    })
    
    console.log('🧠 Memory enhancement result:', {
      hasMemory: memoryResult.hasMemory,
      conversationId: memoryResult.conversation?.id,
      memoryLength: memoryResult.memoryContext?.memoryLength || 0
    })
    
    // STEP 2: Process with your existing RAG service
    const ragService = getRAGService()
    
    // Use enhanced query if available, otherwise original
    const queryToProcess = memoryResult.enhancedQuery || message
    
    const ragResult = await ragService.processQuery(queryToProcess, chatbotId, {
      userId: context?.userId || 'anonymous',
      temperature: 0.7,
      maxTokens: 1000,
      // Pass memory context to RAG if available
      memoryContext: memoryResult.memoryContext
    })
    
    console.log('🎯 RAG processing result:', {
      success: ragResult.success,
      responseLength: ragResult.response?.length || 0,
      sourcesFound: ragResult.sources?.length || 0
    })
    
    // STEP 3: Store messages with memory (NEW)
    if (ragResult.success && memoryResult.conversation) {
      await memoryIntegration.storeMessageWithMemory({
        conversation: memoryResult.conversation,
        userMessage: message,
        aiResponse: ragResult.response,
        metadata: {
          user: {
            processed: true,
            timestamp: new Date().toISOString()
          },
          ai: {
            sources: ragResult.sources || [],
            confidence: ragResult.metadata?.confidence || 0,
            model: ragResult.metadata?.model || 'unknown',
            memoryContext: memoryResult.memoryContext?.memoryLength || 0,
            responseTime: ragResult.metadata?.duration || 0
          }
        }
      })
    }
    
    const totalDuration = Date.now() - startTime
    
    // Return enhanced response
    return NextResponse.json({
      success: true,
      message: ragResult.response,
      conversationId: memoryResult.conversation?.id || null,
      sources: ragResult.sources || [],
      metadata: {
        confidence: ragResult.metadata?.confidence || 0,
        processing_time: totalDuration,
        chunks_used: ragResult.sources?.length || 0,
        memory_enhanced: memoryResult.hasMemory,
        memory_context_length: memoryResult.memoryContext?.memoryLength || 0,
        model: ragResult.metadata?.model || 'unknown',
        has_conversation_history: memoryResult.hasMemory
      }
    })
    
  } catch (error) {
    console.error('❌ Chat with memory API error:', error)
    const totalDuration = Date.now() - startTime
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      processing_time: totalDuration
    }, { status: 500 })
  }
}

/**
 * GET /api/chat-with-memory?conversationId=xxx
 * Get conversation history
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit')) || 50
    
    if (!conversationId) {
      return NextResponse.json({
        error: 'conversationId is required'
      }, { status: 400 })
    }
    
    const memoryIntegration = getMemoryIntegration()
    const result = await memoryIntegration.getConversationHistory(conversationId, limit)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result
      })
    } else {
      return NextResponse.json({
        error: result.error || 'Failed to get conversation history'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ GET Chat with memory API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/chat-with-memory?conversationId=xxx
 * Clear conversation
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json({
        error: 'conversationId is required'
      }, { status: 400 })
    }
    
    const memoryIntegration = getMemoryIntegration()
    const result = await memoryIntegration.clearConversation(conversationId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Conversation cleared'
      })
    } else {
      return NextResponse.json({
        error: result.error || 'Failed to clear conversation'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ DELETE Chat with memory API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}