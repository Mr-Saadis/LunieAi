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
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
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
      this.aiProvider = new EnhancedGeminiProvider('gemini-2.5-flash')

      this.initialized = true
      console.log('RAG Service initialized successfully')
    } catch (error) {
      console.error('RAG Service initialization failed:', error)
      throw error
    }
  }


// NEW: Simple caching
getCachedResult(query) {
  const key = query.toLowerCase().replace(/\s+/g, '_')
  const cached = this.performanceCache.get(key)
  
  if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
    console.log('Cache hit for query:', query.substring(0, 50))
    return cached.result
  }
  
  return null
}

// NEW: Cache results
cacheResult(query, result) {
  const key = query.toLowerCase().replace(/\s+/g, '_')
  this.performanceCache.set(key, {
    result,
    timestamp: Date.now()
  })
  
  // Prevent memory leak - keep only last 100 entries
  if (this.performanceCache.size > 100) {
    const firstKey = this.performanceCache.keys().next().value
    this.performanceCache.delete(firstKey)
  }
}


  async processQuery(query, chatbotId, options = {}) {

    const cached = this.getCachedResult(query)
  if (cached) return cached


    const startTime = Date.now()

    try {
      
      await this.initialize()

      console.log(`Processing RAG query for chatbot: ${chatbotId}`)
      console.log(`Query: "${query}"`)

      // Step 1: Clean query
      // const cleanQuery = query.trim().toLowerCase()
      const queryAnalysis = this.preprocessQuery(query)
      const embeddingResult = await this.embeddings.generateEmbedding(queryAnalysis.enhanced)


      // Step 2: Generate embedding
      // const embeddingResult = await this.embeddings.generateEmbedding(cleanQuery)
      console.log(`Generated embedding with ${embeddingResult.dimensions} dimensions`)

      // Step 3: Search vectors - SIMPLIFIED VERSION
      const searchResults = await this.searchVectors(embeddingResult.embedding, chatbotId,{
    queryText: query  // ← Yeh add karo
  })
      console.log(`Found ${searchResults.length} relevant chunks`)

      // Step 4: Create context
      // const context = this.createContext(searchResults)
      const context = await this.createEnhancedContext(searchResults)
      console.log(`Assembled context: ${context.content.length} chars`)

      // Step 5: Generate AI response
      const response = await this.generateResponse(queryAnalysis.enhanced, context, chatbotId)

      const duration = Date.now() - startTime

      if (response.success) {
    this.cacheResult(query, response)
  }

      return {
        success: true,
        response: response.content,
        sources: context.sources,
        metadata: {
          query: queryAnalysis.enhanced,
          duration,
          chunks_used: searchResults.length,
          confidence: this.calculateConfidence(searchResults),
          model: 'gemini-2.5-flash',
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
  // async searchVectors(queryEmbedding, chatbotId) {
  //   try {
  //     console.log('Searching vectors in Qdrant...')

  //     // Basic search without complex filters
  //     const searchPayload = {
  //       vector: queryEmbedding,
  //       limit: 10,
  //       score_threshold: 0.3,
  //       with_payload: true,
  //       with_vector: false
  //     }

  //     console.log('Search payload:', {
  //       collection: this.qdrant.collectionName,
  //       vectorLength: queryEmbedding.length,
  //       limit: searchPayload.limit
  //     })

  //     const results = await this.qdrant.client.search(
  //       this.qdrant.collectionName,
  //       searchPayload
  //     )

  //     console.log(`Qdrant returned ${results.length} raw results`)

  //     // Process results
  //     const processedResults = results
  //       .filter(result => result.payload && result.payload.content)
  //       .filter(result => result.payload.chatbotId === chatbotId) // Filter after search
  //       .map(result => ({
  //         id: result.id,
  //         content: result.payload.content,
  //         score: result.score,
  //         source: result.payload.fileName || result.payload.source || 'unknown',
  //         title: result.payload.fileName || 'Document',
  //         metadata: result.payload
  //       }))
  //       .filter(result => result.score >= 0.5)
  //       .slice(0, 5)

  //     console.log(`Filtered to ${processedResults.length} relevant results`)
  //     return processedResults

  //   } catch (error) {
  //     console.error('Vector search failed:', error)
  //     console.error('Error details:', error.message)

  //     // Return empty array instead of crashing
  //     return []
  //   }
  // }


async searchVectors(queryEmbedding, chatbotId, options = {}) {
  const {
    limit = 30,
    scoreThreshold = 0.2,      // Lower initial threshold
    finalThreshold = 0.3,       // Lower final threshold
    maxResults = 8,
    useHybridScoring = false,
    diversityBoost = false,
    queryText = ''
  } = options;

  const startTime = Date.now();

  try {
    // Validate inputs
    if (!this.validateSearchInputs(queryEmbedding, chatbotId)) {
      console.error('[Search] Invalid inputs');
      return [];
    }

    // Warn if queryText is empty
    if (!queryText?.trim()) {
      console.warn('[Search] queryText empty - entity matching disabled');
    }

    console.log('[Search] Starting', {
      chatbotId: chatbotId.substring(0, 8) + '...',
      vectorDim: queryEmbedding.length,
      query: queryText.substring(0, 60),
      limit
    });

    // Search Qdrant
    const searchPayload = {
      vector: queryEmbedding,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true,
      with_vector: false
    };

    const rawResults = await this.qdrant.client.search(
      this.qdrant.collectionName,
      searchPayload
    );

    console.log(`[Search] Qdrant: ${rawResults.length} results`);

    if (!rawResults?.length) {
      console.warn('[Search] No results from Qdrant');
      return [];
    }

    // Normalize
    const validResults = rawResults
      .filter(r => this.isValidResult(r, chatbotId))
      .map(r => this.normalizeResult(r));

    console.log(`[Search] Valid: ${validResults.length}`);

    if (!validResults.length) return [];

    // Analyze query
    const queryAnalysis = this.analyzeQuery(queryText);
    console.log('[Search] Analysis:', {
      entities: queryAnalysis.entities.slice(0, 3),
      keywords: queryAnalysis.keywords.slice(0, 3),
      type: queryAnalysis.queryType
    });

    // Scoring
    let scoredResults = validResults;

    if (useHybridScoring) {
      scoredResults = this.applyUniversalHybridScoring(validResults, queryAnalysis);
    }

    // Diversity
    if (diversityBoost && scoredResults.length > 1) {
      scoredResults = this.applyDiversityFilter(scoredResults);
    }

    // Sort by score
    scoredResults.sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score));

    // Debug: Log score distribution
    if (scoredResults.length > 0) {
      console.log('[Search] Score range:', {
        highest: scoredResults[0].finalScore?.toFixed(3) || scoredResults[0].score.toFixed(3),
        lowest: scoredResults[scoredResults.length - 1].finalScore?.toFixed(3) || 
                scoredResults[scoredResults.length - 1].score.toFixed(3),
        threshold: finalThreshold
      });
    }

    // Apply threshold
    let finalResults = scoredResults
      .filter(r => (r.finalScore || r.score) >= finalThreshold)
      .slice(0, maxResults)
      .map(r => this.formatFinalResult(r));

    // Adaptive threshold: If no results, use lower threshold
    if (finalResults.length === 0 && scoredResults.length > 0) {
      const adaptiveThreshold = 0.15;
      console.warn(`[Search] No results with threshold ${finalThreshold}, using ${adaptiveThreshold}`);

      finalResults = scoredResults
        .filter(r => (r.finalScore || r.score) >= adaptiveThreshold)
        .slice(0, Math.min(5, maxResults))
        .map(r => this.formatFinalResult(r));

      console.log(`[Search] Adaptive: ${finalResults.length} results`);
    }

    const duration = Date.now() - startTime;

    console.log('[Search] Complete', {
      duration: `${duration}ms`,
      results: finalResults.length,
      avgScore: this.calculateAvgScore(finalResults),
      topScore: finalResults[0]?.score?.toFixed(3) || '0'
    });

    return finalResults;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Search] Error:', {
      message: error.message,
      duration: `${duration}ms`
    });
    return [];
  }
}

/**
 * Analyze query to extract entities and keywords
 */
analyzeQuery(queryText) {
  if (!queryText?.trim()) {
    return {
      entities: [],
      keywords: [],
      hasQuestion: false,
      queryType: 'general'
    };
  }

  const text = queryText.toLowerCase().trim();
  const entities = [];
  const keywords = [];

  // Detect questions
  const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'tell'];
  const hasQuestion = questionWords.some(q => text.startsWith(q));

  // Extract capitalized words (likely proper nouns)
  const words = queryText.split(/\s+/);
  for (const word of words) {
    if (word.length > 2 && 
        word[0] === word[0].toUpperCase() && 
        word !== word.toUpperCase()) {
      entities.push(word.toLowerCase());
    }
  }

  // Extract quoted text
  const quoted = queryText.match(/"([^"]+)"|'([^']+)'/g);
  if (quoted) {
    quoted.forEach(q => {
      entities.push(q.replace(/["']/g, '').toLowerCase());
    });
  }

  // Extract years
  const years = text.match(/\b(19|20)\d{2}\b/g);
  if (years) entities.push(...years);

  // Extract numbers
  const numbers = text.match(/\b\d+(?:\.\d+)?\b/g);
  if (numbers) entities.push(...numbers);

  // Extract keywords (skip stop words)
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'of', 'in', 'on',
    'at', 'to', 'for', 'with', 'about', 'by', 'from', 'what',
    'who', 'where', 'when', 'why', 'how', 'tell', 'me'
  ]);

  text.split(/\s+/).forEach(word => {
    const clean = word.replace(/[^\w]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      keywords.push(clean);
    }
  });

  // Detect query type
  let queryType = 'general';
  if (text.includes('rank') || text.includes('position')) {
    queryType = 'ranking';
  } else if (text.includes('compare') || text.includes('vs')) {
    queryType = 'comparison';
  } else if (text.includes('list') || text.includes('all')) {
    queryType = 'list';
  }

  return {
    entities: [...new Set(entities)],
    keywords: [...new Set(keywords)],
    hasQuestion,
    queryType
  };
}

/**
 * Universal hybrid scoring
 */
applyUniversalHybridScoring(results, queryAnalysis) {
  return results.map(result => {
    const { score, content, metadata } = result;
    const contentLower = content.toLowerCase();

    // Base score (40%)
    let finalScore = score * 0.4;

    // Entity matching (0-0.35)
    let entityBoost = 0;
    let matchedEntities = 0;

    for (const entity of queryAnalysis.entities) {
      if (contentLower.includes(entity.toLowerCase())) {
        matchedEntities++;
        entityBoost += 0.15;
      }
    }

    if (matchedEntities > 1) entityBoost += 0.1;
    finalScore += Math.min(entityBoost, 0.35);

    // Keyword matching (0-0.15)
    let keywordMatches = 0;
    for (const keyword of queryAnalysis.keywords.slice(0, 5)) {
      if (contentLower.includes(keyword)) keywordMatches++;
    }
    const keywordScore = Math.min((keywordMatches / 5) * 0.15, 0.15);
    finalScore += keywordScore;

    // Content type (0-0.1)
    const isStructured = /[:\-•\d+\.]/.test(content) && 
                        (content.match(/\n/g) || []).length > 3;
    const isMetadata = /overview|summary|column|definition/i.test(content);

    if (queryAnalysis.queryType === 'ranking' && isStructured) {
      finalScore += 0.1;
    }

    if (isMetadata && queryAnalysis.entities.length > 0) {
      finalScore -= 0.12;
    }

    // Content quality (0-0.1)
    const wordCount = metadata.wordCount || 0;
    if (wordCount >= 80 && wordCount <= 800) {
      finalScore += 0.1;
    } else if (wordCount > 30) {
      finalScore += 0.05;
    }

    finalScore = Math.min(Math.max(finalScore, 0), 1.0);

    return {
      ...result,
      originalScore: score,
      entityBoost,
      keywordScore,
      finalScore,
      matchedEntities
    };
  });
}

/**
 * Diversity filter
 */
applyDiversityFilter(results) {
  if (results.length <= 2) return results;

  const diverse = [];
  const seenFingerprints = new Set();

  for (const result of results) {
    const words = result.content
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 20);

    const fingerprint = words.join('|');

    let isDuplicate = false;
    for (const seen of seenFingerprints) {
      const seenWords = seen.split('|');
      const overlap = words.filter(w => seenWords.includes(w)).length;
      const similarity = overlap / Math.min(words.length, 15);

      if (similarity > 0.7) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate || result.finalScore > 0.85) {
      diverse.push(result);
      seenFingerprints.add(fingerprint);
      if (diverse.length >= 6) break;
    }
  }

  return diverse.length > 0 ? diverse : results.slice(0, 3);
}

// Helper methods
validateSearchInputs(queryEmbedding, chatbotId) {
  return Array.isArray(queryEmbedding) &&
         queryEmbedding.length > 0 &&
         typeof chatbotId === 'string' &&
         chatbotId.length > 0;
}

isValidResult(result, chatbotId) {
  return result?.payload?.content &&
         typeof result.payload.content === 'string' &&
         result.payload.content.trim().length >= 20 &&
         result.payload.chatbotId === chatbotId &&
         result.score > 0;
}

normalizeResult(result) {
  const content = result.payload.content.trim();
  return {
    id: result.id,
    content,
    score: result.score,
    source: result.payload.fileName || result.payload.source || 'Unknown',
    title: result.payload.title || result.payload.fileName || 'Document',
    metadata: {
      chatbotId: result.payload.chatbotId,
      fileName: result.payload.fileName,
      fileType: result.payload.fileType,
      page: result.payload.page,
      chunkIndex: result.payload.chunkIndex,
      createdAt: result.payload.createdAt || result.payload.processedAt,
      wordCount: this.countWords(content)
    }
  };
}

countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

formatFinalResult(result) {
  return {
    id: result.id,
    content: result.content,
    score: result.finalScore || result.score,
    source: result.source,
    title: result.title,
    metadata: {
      fileName: result.metadata.fileName,
      fileType: result.metadata.fileType,
      page: result.metadata.page
    }
  };
}

calculateAvgScore(results) {
  if (!results?.length) return 0;
  const sum = results.reduce((acc, r) => acc + (r.score || 0), 0);
  return (sum / results.length).toFixed(3);
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


    console.log('Preprocessed query:', { original, enhanced })
    return { original, enhanced, expandedTerms: enhanced !== original }
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
      console.log('System Prompt:', systemPrompt)

      const userPrompt = `Context:\n${context.content}\n\nQuestion: ${query}\n\nPlease answer based on the context provided above.`
console.log('User Prompt:', userPrompt)

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
        model: data.ai_model || 'gemini-2.5-flash'
      }
    } catch (error) {
      console.error('Failed to get chatbot config:', error)
      return {
        name: 'Assistant',
        instructions: 'Be helpful and professional.',
        model: 'gemini-2.5-flash'
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