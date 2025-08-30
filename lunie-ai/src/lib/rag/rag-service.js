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
    this.performanceCache = new Map()
    this.metricsCache = new Map()
    this.maxCacheEntries = 100;
    this.cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes


    this.analytics = {
      queries: new Map(), // query -> count
      performance: new Map(), // date -> metrics
      costs: new Map(), // date -> token costs
      errors: new Map() // error type -> count
    }

  }

  _makeCacheKey(query) {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, '')   // remove punctuation
      .replace(/\s+/g, '_');
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



  getCachedResult(query) {
    const key = this._makeCacheKey(query);
    console.log('🔍 Checking cache for key:', key);
    const entry = this.performanceCache.get(key);
    if (entry && Date.now() - entry.timestamp < this.cacheExpiryMs) {
      console.log('✅ Cache HIT for query:', query.substring(0, 50));
      // Reinsert key to mark as recently used (LRU behavior)
      this.performanceCache.delete(key);
      this.performanceCache.set(key, entry);
      return entry.result;
    }
    console.log('❌ Cache MISS for query:', query.substring(0, 50));
    return null;
  }




  cacheResult(query, result) {
    const key = this._makeCacheKey(query);
    this.performanceCache.set(key, {
      result,  // full RAG object
      timestamp: Date.now(),
    });
    console.log(`💾 Caching result for key: ${key} at ${new Date().toISOString()}`);
    // Evict oldest entry if cache is full (simple LRU using Map ordering)
    if (this.performanceCache.size > this.maxCacheEntries) {
      const oldestKey = this.performanceCache.keys().next().value;
      console.log('🗑️ Evicting LRU cache key:', oldestKey);
      this.performanceCache.delete(oldestKey);
    }
  }













  async processQuery(query, chatbotId, options = {}) {

    //   const cached = this.getCachedResult(query)
    // if (cached) return cached
    const cacheKey = this._makeCacheKey(query);

    // 1. Check cache
    const cached = this.performanceCache.get(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for key:", cacheKey);
      return this.performanceCache.get(cacheKey).result; // return full object
    }
    console.log("❌ Cache MISS for query:", query);


    const startTime = Date.now()
    const overallStart = Date.now();

    try {
      await this.initialize()

      console.log(`Processing RAG query for chatbot: ${chatbotId}`)
      console.log(`Query: "${query}"`)

      // Step 1: Clean query
      const t0 = Date.now();
      // const cleanQuery = query.trim().toLowerCase()
      const queryAnalysis = this.preprocessQuery(query)
      const embeddingResult = await this.embeddings.generateEmbedding(queryAnalysis.enhanced)
      console.log(`⏱ Embedding took ${Date.now() - t0} ms`);


      // Step 2: Generate embedding
      // const embeddingResult = await this.embeddings.generateEmbedding(cleanQuery)
      console.log(`Generated embedding with ${embeddingResult.dimensions} dimensions`)

      // Step 3: Search vectors - SIMPLIFIED VERSION
      const t1 = Date.now();
      const searchResults = await this.searchVectors(embeddingResult.embedding, chatbotId)
      console.log(`Found ${searchResults.length} relevant chunks`)
      console.log(`⏱ Qdrant search took ${Date.now() - t1} ms`);


      // Step 4: Create context
      const t2 = Date.now();

      // const context = this.createContext(searchResults)
      const context = await this.createEnhancedContext(searchResults)
      console.log(`Assembled context: ${context.content.length} chars`)
      console.log(`⏱ Context building took ${Date.now() - t2} ms`);

      // Step 5: Generate AI response
      const t3 = Date.now();
      const response = await this.generateResponse(queryAnalysis.enhanced, context, chatbotId)
      console.log(`⏱ AI response generation took ${Date.now() - t3} ms`);


      const duration = Date.now() - startTime
      const overAllDuration = Date.now() - overallStart;

      // this.trackQuery(query, duration, response.sources?.length)
      this.trackQuery(query, duration, true, searchResults.length, this.calculateConfidence(searchResults))

      const finalResult = {
        success: true,
        response: response.content,
        sources: context.sources,
        metadata: {
          query: queryAnalysis.enhanced,
          duration: overAllDuration,
          chunks_used: searchResults.length,
          confidence: this.calculateConfidence(searchResults),
          model: 'gemini-1.5-flash',
          tokens_used: response.usage?.totalTokens || 0
        }
      };

      // store the FULL final result
      this.cacheResult(query, finalResult);

      return finalResult;


    } catch (error) {
      console.error('RAG Pipeline Error:', error)
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }
    }
  }


  // trackQuery(query, duration, success, sourceCount) {
  //   const today = new Date().toDateString()

  //   // Query frequency
  //   const queryKey = query.toLowerCase().substring(0, 50)
  //   this.analytics.queries.set(queryKey, (this.analytics.queries.get(queryKey) || 0) + 1)

  //   // Performance metrics
  //   if (!this.analytics.performance.has(today)) {
  //     this.analytics.performance.set(today, {
  //       totalQueries: 0,
  //       successfulQueries: 0,
  //       avgDuration: 0,
  //       avgSources: 0
  //     })
  //   }

  //   const dayMetrics = this.analytics.performance.get(today)
  //   dayMetrics.totalQueries++
  //   if (success) {
  //     dayMetrics.successfulQueries++
  //     dayMetrics.avgSources = (dayMetrics.avgSources + sourceCount) / dayMetrics.successfulQueries
  //   }
  //   dayMetrics.avgDuration = (dayMetrics.avgDuration + duration) / dayMetrics.totalQueries
  // }
  // Add to your RAGService class
  trackQuery(query, duration, success, sourceCount, confidence = 0) {
    const today = new Date().toDateString()

    // Query frequency tracking
    const queryKey = query.toLowerCase().substring(0, 50)
    if (!this.analytics) {
      this.analytics = {
        queries: new Map(),
        performance: new Map(),
        costs: new Map()
      }
    }

    this.analytics.queries.set(queryKey, (this.analytics.queries.get(queryKey) || 0) + 1)

    // Daily performance metrics
    if (!this.analytics.performance.has(today)) {
      this.analytics.performance.set(today, {
        totalQueries: 0,
        successfulQueries: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgConfidence: 0,
        avgSources: 0
      })
    }

    const dayMetrics = this.analytics.performance.get(today)
    dayMetrics.totalQueries++
    dayMetrics.totalDuration += duration
    dayMetrics.avgDuration = dayMetrics.totalDuration / dayMetrics.totalQueries

    if (success) {
      dayMetrics.successfulQueries++
      dayMetrics.avgConfidence = (dayMetrics.avgConfidence + confidence) / dayMetrics.successfulQueries
      dayMetrics.avgSources = (dayMetrics.avgSources + sourceCount) / dayMetrics.successfulQueries
    }
  }

  getAnalytics() {
    if (!this.analytics) return { queries: [], performance: {}, cache: { size: 0 } }

    return {
      popularQueries: Array.from(this.analytics.queries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),

      performance: Object.fromEntries(this.analytics.performance),

      cache: {
        size: this.performanceCache.size,
        maxSize: 100
      }
    }
  }



  assessResponseQuality(query, response, sources) {
    const quality = {
      completeness: 0,
      sourceRelevance: 0,
      answerLength: response.length,
      hasDirectAnswer: false
    }

    // Check if response directly addresses query
    const queryWords = query.toLowerCase().split(' ')
    const responseWords = response.toLowerCase().split(' ')
    const overlap = queryWords.filter(word => responseWords.includes(word))
    quality.completeness = overlap.length / queryWords.length

    // Check for direct answers
    quality.hasDirectAnswer = /^(yes|no|the answer is|according to)/i.test(response)

    // Source relevance
    if (sources.length > 0) {
      quality.sourceRelevance = sources.reduce((sum, s) => sum + s.score, 0) / sources.length
    }

    return quality
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

  // Add to your RAG service class - NEW METHOD
  async createEnhancedContext(searchResults) {
    if (!searchResults.length) {
      return this.createContext(searchResults) // Fallback to existing
    }

    try {
      // Step 1: Rank by multiple factors
      const rankedResults = this.rankResultsByRelevance(searchResults)

      // Step 2: Apply diversity filter
      const diversifiedResults = this.applyDiversityFilter(rankedResults)

      // Step 3: Build enhanced context
      return this.buildSmartContext(diversifiedResults)

    } catch (error) {
      console.error('Enhanced context failed, using fallback:', error)
      return this.createContext(searchResults) // Safe fallback
    }
  }

  // NEW: Multi-factor ranking
  rankResultsByRelevance(results) {
    return results.map(result => {
      let enhancedScore = result.score * 0.8 // Base similarity

      // Boost recent content
      if (result.metadata?.page) enhancedScore += 0.1

      // Boost structured content (has colons, bullets)
      if (result.content.includes(':') || result.content.includes('-')) {
        enhancedScore += 0.05
      }

      // Boost longer, detailed content
      if (result.content.length > 300) enhancedScore += 0.05

      return { ...result, enhancedScore }
    }).sort((a, b) => b.enhancedScore - a.enhancedScore)
  }

  // NEW: Diversity filtering
  applyDiversityFilter(rankedResults) {
    const diverse = []
    const usedTopics = new Set()

    for (const result of rankedResults) {
      const topics = this.extractTopics(result.content)
      const hasNewInfo = topics.some(topic => !usedTopics.has(topic))

      if (hasNewInfo || result.enhancedScore > 0.9) {
        diverse.push(result)
        topics.forEach(topic => usedTopics.add(topic))
        if (diverse.length >= 5) break
      }
    }

    return diverse.length > 0 ? diverse : rankedResults.slice(0, 3)
  }

  // NEW: Topic extraction
  extractTopics(content) {
    const topics = []
    const lower = content.toLowerCase()

    if (lower.includes('skill') || lower.includes('technology')) topics.push('skills')
    if (lower.includes('project') || lower.includes('work')) topics.push('projects')
    if (lower.includes('experience') || lower.includes('job')) topics.push('experience')
    if (lower.includes('education') || lower.includes('degree')) topics.push('education')

    return topics.length ? topics : ['general']
  }

  // NEW: Smart context building
  buildSmartContext(results) {
    let content = 'Based on the following information:\n\n'
    const sources = []

    // Group by source for better flow
    const grouped = new Map()
    results.forEach(r => {
      const key = r.source || 'unknown'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key).push(r)
    })

    let index = 1
    for (const [source, chunks] of grouped) {
      chunks.forEach(chunk => {
        content += `[Source ${index}: ${source}${chunk.metadata?.page ? ` (Page ${chunk.metadata.page})` : ''}]\n`
        content += `${chunk.content}\n\n`

        sources.push({
          id: chunk.id,
          title: chunk.title,
          source: chunk.source,
          score: chunk.score,
          enhancedScore: chunk.enhancedScore,
          excerpt: chunk.content.substring(0, 150) + '...'
        })
        index++
      })
    }

    return { content: content.trim(), sources, chunks_used: sources.length }
  }

  // Update your processQuery method - SAFE CHANGE
  // Replace this line:
  // const context = this.createContext(searchResults)
  // With:
  // const context = await this.createEnhancedContext(searchResults)





  // Add to RAG service - NEW METHOD
  preprocessQuery(query) {
    const original = query.trim()
    let enhanced = original.toLowerCase()

    // Query expansion with synonyms
    const expansions = new Map([
      ['skill', 'expertise proficiency capability'],
      ['experience', 'background work career history'],
      ['project', 'work development application'],
      ['education', 'degree qualification study']
    ])

    for (const [word, synonyms] of expansions) {
      if (enhanced.includes(word)) {
        enhanced += ` ${synonyms}`
      }
    }

    return { original, enhanced, expandedTerms: enhanced !== original }
  }

  // Update your processQuery method:
  // Replace: const cleanQuery = query.trim().toLowerCase()
  // // With:
  // const queryAnalysis = this.preprocessQuery(query)
  // const embeddingResult = await this.embeddings.generateEmbedding(queryAnalysis.enhanced)







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