// src/lib/rag/rag-service.js - SIMPLE WORKING VERSION
import { getQdrantManager } from '@/lib/vector/qdrant-client'
import { getGeminiEmbeddings } from '@/lib/ai/embeddings/gemini-embeddings'
import { EnhancedGeminiProvider } from '@/lib/ai/providers/gemini-enhanced'
import { createRouteClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

class RAGService {
  constructor() {
    this.qdrant = null
    this.embeddings = null
    this.aiProvider = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      console.log('Initializing RAG Service...')
      
      // Initialize vector database
      this.qdrant = getQdrantManager()
      await this.qdrant.initialize()
      
      // Initialize embedding service
      this.embeddings = getGeminiEmbeddings()
      
      // Initialize AI provider
      this.aiProvider = new EnhancedGeminiProvider('gemini-1.5-flash')
      
      this.initialized = true
      console.log('RAG Service initialized successfully')
    } catch (error) {
      console.error('RAG Service initialization failed:', error)
      throw error
    }
  }

  async processQuery(query, chatbotId, options = {}) {
    const startTime = Date.now()
    
    try {
      await this.initialize()
      
      console.log(`Processing RAG query for chatbot: ${chatbotId}`)
      console.log(`Query: "${query}"`)
      
      // Step 1: Clean query
      const cleanQuery = query.trim().toLowerCase()
      
      // Step 2: Generate embedding
      const embeddingResult = await this.embeddings.generateEmbedding(cleanQuery)
      console.log(`Generated embedding with ${embeddingResult.dimensions} dimensions`)
      
      // Step 3: Search vectors - SIMPLIFIED VERSION
      const searchResults = await this.searchVectors(embeddingResult.embedding, chatbotId)
      console.log(`Found ${searchResults.length} relevant chunks`)
      
      // Step 4: Create context
      const context = this.createContext(searchResults)
      console.log(`Assembled context: ${context.content.length} chars`)
      
      // Step 5: Generate AI response
      const response = await this.generateResponse(cleanQuery, context, chatbotId)
      
      const duration = Date.now() - startTime
      
      return {
        success: true,
        response: response.content,
        sources: context.sources,
        metadata: {
          query: cleanQuery,
          duration,
          chunks_used: searchResults.length,
          confidence: this.calculateConfidence(searchResults),
          model: 'gemini-1.5-flash',
          tokens_used: response.usage?.totalTokens || 0
        }
      }
      
    } catch (error) {
      console.error('RAG Pipeline Error:', error)
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }
    }
  }

  // SIMPLIFIED VECTOR SEARCH
  async searchVectors(queryEmbedding, chatbotId) {
    try {
      console.log('Searching vectors in Qdrant...')
      
      // Basic search without complex filters
      const searchPayload = {
        vector: queryEmbedding,
        limit: 5,
        score_threshold: 0.5,
        with_payload: true,
        with_vector: false
      }
      
      console.log('Search payload:', {
        collection: this.qdrant.collectionName,
        vectorLength: queryEmbedding.length,
        limit: searchPayload.limit
      })
      
      const results = await this.qdrant.client.search(
        this.qdrant.collectionName, 
        searchPayload
      )
      
      console.log(`Qdrant returned ${results.length} raw results`)
      
      // Process results
      const processedResults = results
        .filter(result => result.payload && result.payload.content)
        .filter(result => result.payload.chatbotId === chatbotId) // Filter after search
        .map(result => ({
          id: result.id,
          content: result.payload.content,
          score: result.score,
          source: result.payload.fileName || result.payload.source || 'unknown',
          title: result.payload.fileName || 'Document',
          metadata: result.payload
        }))
        .filter(result => result.score >= 0.5)
        .slice(0, 5)
      
      console.log(`Filtered to ${processedResults.length} relevant results`)
      return processedResults
      
    } catch (error) {
      console.error('Vector search failed:', error)
      console.error('Error details:', error.message)
      
      // Return empty array instead of crashing
      return []
    }
  }

  // CREATE CONTEXT FROM SEARCH RESULTS
  createContext(searchResults) {
    if (!searchResults.length) {
      return {
        content: 'No relevant information found.',
        sources: [],
        chunks_used: 0
      }
    }

    let contextContent = 'Based on the following information:\n\n'
    const sources = []
    
    searchResults.forEach((result, index) => {
      contextContent += `[Source ${index + 1}: ${result.source}]\n${result.content}\n\n`
      
      sources.push({
        id: result.id,
        title: result.title,
        source: result.source,
        score: result.score,
        excerpt: result.content.substring(0, 150) + '...'
      })
    })

    return {
      content: contextContent.trim(),
      sources,
      chunks_used: sources.length
    }
  }

  // GENERATE AI RESPONSE
  async generateResponse(query, context, chatbotId) {
    try {
      // Get chatbot info
      const chatbotConfig = await this.getChatbotConfig(chatbotId)
      
      // Build prompt
      const systemPrompt = `You are ${chatbotConfig.name}. ${chatbotConfig.instructions || 'Be helpful and professional.'}\n\nIMPORTANT: Use the provided context to answer questions. If the context doesn't contain relevant information, say so politely.`
      
      const userPrompt = `Context:\n${context.content}\n\nQuestion: ${query}\n\nPlease answer based on the context provided above.`
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
      
      // Generate response
      const response = await this.aiProvider.generateResponse(messages, {
        temperature: 0.7,
        maxTokens: 1000
      })
      
      return response
      
    } catch (error) {
      console.error('AI response generation failed:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  // GET CHATBOT CONFIG
  async getChatbotConfig(chatbotId) {
    try {
      const cookieStore = await cookies()
      const supabase = createRouteClient(() => cookieStore)
      
      const { data, error } = await supabase
        .from('chatbots')
        .select('name, instructions, ai_model')
        .eq('id', chatbotId)
        .single()
      
      if (error) throw error
      
      return {
        name: data.name || 'Assistant',
        instructions: data.instructions || 'Be helpful and professional.',
        model: data.ai_model || 'gemini-1.5-flash'
      }
    } catch (error) {
      console.error('Failed to get chatbot config:', error)
      return {
        name: 'Assistant',
        instructions: 'Be helpful and professional.',
        model: 'gemini-1.5-flash'
      }
    }
  }

  // CALCULATE CONFIDENCE
  calculateConfidence(searchResults) {
    if (!searchResults.length) return 0
    
    const avgScore = searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
    return Math.round(avgScore * 100) / 100
  }
}

// Export singleton
let ragInstance = null

export const getRAGService = () => {
  if (!ragInstance) {
    ragInstance = new RAGService()
  }
  return ragInstance
}

export default RAGService