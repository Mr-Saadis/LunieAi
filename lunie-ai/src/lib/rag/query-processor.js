// src/lib/rag/query-processor.js
/**
 * 🔍 Query Processor - Smart Query Enhancement
 * Preprocesses, expands, and optimizes user queries for better RAG results
 */

export class QueryProcessor {
  constructor(options = {}) {
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
      'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if'
    ])
    
    this.questionWords = new Set([
      'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could',
      'should', 'would', 'do', 'does', 'did', 'is', 'are', 'was', 'were'
    ])

    this.synonyms = new Map([
      // Common business terms
      ['price', ['cost', 'pricing', 'fee', 'rate', 'charge']],
      ['help', ['assist', 'support', 'aid', 'guidance']],
      ['buy', ['purchase', 'order', 'acquire', 'get']],
      ['contact', ['reach', 'connect', 'communicate', 'call']],
      ['info', ['information', 'details', 'data']],
      ['company', ['business', 'organization', 'firm', 'enterprise']],
      ['product', ['service', 'offering', 'solution', 'item']],
      ['features', ['capabilities', 'functions', 'options', 'benefits']],
    ])
  }

  /**
   * 🎯 Main query processing pipeline
   */
  processQuery(query, options = {}) {
    console.log(`🔍 Processing query: "${query}"`)
    
    const processed = {
      original: query,
      cleaned: '',
      expanded: '',
      keywords: [],
      intent: '',
      confidence: 0,
      metadata: {}
    }

    try {
      // Step 1: Clean and normalize
      processed.cleaned = this.cleanQuery(query)
      
      // Step 2: Extract keywords
      processed.keywords = this.extractKeywords(processed.cleaned)
      
      // Step 3: Detect intent
      const intent = this.detectIntent(processed.cleaned)
      processed.intent = intent.type
      processed.confidence = intent.confidence
      
      // Step 4: Expand with synonyms
      processed.expanded = this.expandQuery(processed.cleaned)
      
      // Step 5: Add metadata
      processed.metadata = {
        wordCount: processed.cleaned.split(' ').length,
        hasQuestion: this.hasQuestionWords(processed.cleaned),
        complexity: this.calculateComplexity(processed.cleaned),
        processedAt: new Date().toISOString()
      }

      console.log(`✅ Query processed - Intent: ${processed.intent}, Keywords: ${processed.keywords.length}`)
      
      return processed

    } catch (error) {
      console.error('Query processing error:', error)
      return {
        ...processed,
        error: error.message
      }
    }
  }

  /**
   * 🧹 Clean and normalize query
   */
  cleanQuery(query) {
    return query
      .trim()
      .toLowerCase()
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Normalize punctuation
      .replace(/[^\w\s\?\!\.\,\-]/g, '')
      // Handle common abbreviations
      .replace(/\bu\b/g, 'you')
      .replace(/\br\b/g, 'are')
      .replace(/\bur\b/g, 'your')
      .replace(/\bw\/\b/g, 'with')
      .replace(/\b&\b/g, 'and')
  }

  /**
   * 🎯 Extract meaningful keywords
   */
  extractKeywords(query) {
    const words = query.split(' ')
    const keywords = []

    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '')
      
      // Skip if empty, too short, or stop word
      if (!cleanWord || cleanWord.length < 2 || this.stopWords.has(cleanWord)) {
        continue
      }

      // Add if not already present
      if (!keywords.includes(cleanWord)) {
        keywords.push(cleanWord)
      }
    }

    // Sort by importance (longer words first, question words last)
    return keywords.sort((a, b) => {
      if (this.questionWords.has(a) && !this.questionWords.has(b)) return 1
      if (!this.questionWords.has(a) && this.questionWords.has(b)) return -1
      return b.length - a.length
    })
  }

  /**
   * 🧠 Detect query intent
   */
  detectIntent(query) {
    const intents = [
      {
        type: 'information',
        patterns: /\b(what|how|why|when|where|who|which|explain|tell me|describe)\b/,
        confidence: 0.9
      },
      {
        type: 'comparison',
        patterns: /\b(vs|versus|compare|difference|better|best|worst|between)\b/,
        confidence: 0.85
      },
      {
        type: 'pricing',
        patterns: /\b(price|cost|pricing|fee|rate|charge|expensive|cheap|free)\b/,
        confidence: 0.9
      },
      {
        type: 'support',
        patterns: /\b(help|support|problem|issue|error|fix|resolve|assist)\b/,
        confidence: 0.8
      },
      {
        type: 'contact',
        patterns: /\b(contact|call|email|phone|reach|connect|talk|speak)\b/,
        confidence: 0.85
      },
      {
        type: 'purchase',
        patterns: /\b(buy|purchase|order|get|acquire|payment|checkout|cart)\b/,
        confidence: 0.9
      },
      {
        type: 'features',
        patterns: /\b(feature|capability|function|can it|does it|include|offer)\b/,
        confidence: 0.8
      }
    ]

    // Find best matching intent
    let bestMatch = { type: 'general', confidence: 0.5 }

    for (const intent of intents) {
      if (intent.patterns.test(query)) {
        if (intent.confidence > bestMatch.confidence) {
          bestMatch = intent
        }
      }
    }

    return bestMatch
  }

  /**
   * 🔄 Expand query with synonyms and variations
   */
  expandQuery(query) {
    const words = query.split(' ')
    const expandedWords = []

    for (const word of words) {
      expandedWords.push(word)
      
      // Add synonyms if available
      if (this.synonyms.has(word)) {
        const synonymList = this.synonyms.get(word)
        // Add first synonym to avoid over-expansion
        expandedWords.push(synonymList[0])
      }
    }

    // Remove duplicates and join
    const uniqueWords = [...new Set(expandedWords)]
    return uniqueWords.join(' ')
  }

  /**
   * ❓ Check if query has question words
   */
  hasQuestionWords(query) {
    const words = query.split(' ')
    return words.some(word => this.questionWords.has(word))
  }

  /**
   * 📊 Calculate query complexity
   */
  calculateComplexity(query) {
    const factors = {
      wordCount: query.split(' ').length,
      avgWordLength: query.replace(/\s+/g, '').length / query.split(' ').length,
      questionMarks: (query.match(/\?/g) || []).length,
      compoundSentences: (query.match(/\b(and|or|but|because|however)\b/g) || []).length
    }

    // Simple complexity score (0-1)
    let complexity = 0
    
    // Word count factor (sweet spot around 5-10 words)
    if (factors.wordCount >= 5 && factors.wordCount <= 10) {
      complexity += 0.3
    } else if (factors.wordCount > 10) {
      complexity += 0.2
    } else {
      complexity += 0.1
    }

    // Average word length
    if (factors.avgWordLength > 4) complexity += 0.2
    
    // Questions are more complex
    if (factors.questionMarks > 0) complexity += 0.3
    
    // Compound sentences
    complexity += Math.min(factors.compoundSentences * 0.2, 0.2)

    return Math.min(complexity, 1)
  }

  /**
   * 🎨 Generate query variations for better search
   */
  generateVariations(query, maxVariations = 3) {
    const variations = [query]
    
    try {
      // Variation 1: Question to statement
      if (this.hasQuestionWords(query)) {
        const statement = query
          .replace(/^(what|how|why|when|where|who|which)\s+/i, '')
          .replace(/\?/g, '')
          .trim()
        
        if (statement && statement !== query) {
          variations.push(statement)
        }
      }

      // Variation 2: Add context words based on intent
      const processed = this.processQuery(query)
      if (processed.intent && processed.intent !== 'general') {
        const contextWords = this.getContextWords(processed.intent)
        const contextQuery = `${query} ${contextWords}`.trim()
        variations.push(contextQuery)
      }

      // Variation 3: Simplified version (remove stop words)
      const keywords = this.extractKeywords(query)
      if (keywords.length >= 2) {
        const simplified = keywords.slice(0, 5).join(' ')
        variations.push(simplified)
      }

      // Remove duplicates and limit
      return [...new Set(variations)].slice(0, maxVariations)
      
    } catch (error) {
      console.error('Error generating variations:', error)
      return [query]
    }
  }

  /**
   * 🏷️ Get context words for different intents
   */
  getContextWords(intent) {
    const contextMap = {
      'pricing': 'cost price fee rate',
      'support': 'help assistance support',
      'features': 'capabilities functions features',
      'contact': 'contact information details',
      'purchase': 'buy order purchase',
      'comparison': 'compare difference vs',
      'information': 'information details about'
    }

    return contextMap[intent] || ''
  }

  /**
   * 🔍 Advanced query analysis
   */
  analyzeQuery(query) {
    const processed = this.processQuery(query)
    
    return {
      ...processed,
      analysis: {
        isQuestion: this.hasQuestionWords(processed.cleaned),
        complexity: processed.metadata.complexity,
        searchTerms: this.extractSearchTerms(processed.cleaned),
        suggestedImprovements: this.suggestImprovements(processed),
        variations: this.generateVariations(query)
      }
    }
  }

  /**
   * 🎯 Extract optimal search terms
   */
  extractSearchTerms(query) {
    const keywords = this.extractKeywords(query)
    
    // Prioritize important terms
    const searchTerms = keywords.map(keyword => ({
      term: keyword,
      importance: this.calculateTermImportance(keyword, query),
      type: this.classifyTerm(keyword)
    }))

    // Sort by importance
    return searchTerms
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10) // Top 10 terms
  }

  /**
   * ⭐ Calculate term importance
   */
  calculateTermImportance(term, query) {
    let importance = 0

    // Length factor
    importance += Math.min(term.length / 10, 1) * 0.3

    // Position factor (earlier terms often more important)
    const position = query.indexOf(term)
    importance += (1 - position / query.length) * 0.2

    // Frequency factor
    const frequency = (query.match(new RegExp(term, 'g')) || []).length
    importance += Math.min(frequency / 3, 1) * 0.2

    // Business relevance
    if (this.synonyms.has(term)) {
      importance += 0.3
    }

    return Math.min(importance, 1)
  }

  /**
   * 🏷️ Classify term type
   */
  classifyTerm(term) {
    if (this.questionWords.has(term)) return 'question'
    if (this.synonyms.has(term)) return 'business'
    if (/\d/.test(term)) return 'numeric'
    if (term.length > 6) return 'specific'
    return 'general'
  }

  /**
   * 💡 Suggest query improvements
   */
  suggestImprovements(processed) {
    const suggestions = []

    // Too short
    if (processed.metadata.wordCount < 3) {
      suggestions.push({
        type: 'length',
        message: 'Try adding more details to your question for better results',
        priority: 'high'
      })
    }

    // Too long
    if (processed.metadata.wordCount > 20) {
      suggestions.push({
        type: 'length',
        message: 'Consider breaking this into smaller, more specific questions',
        priority: 'medium'
      })
    }

    // No clear intent
    if (processed.confidence < 0.6) {
      suggestions.push({
        type: 'clarity',
        message: 'Try using more specific keywords or rephrasing your question',
        priority: 'medium'
      })
    }

    // Missing question words for information queries
    if (!processed.metadata.hasQuestion && processed.intent === 'information') {
      suggestions.push({
        type: 'structure',
        message: 'Try starting with "What", "How", or "Why" for better results',
        priority: 'low'
      })
    }

    return suggestions
  }

  /**
   * 🔄 Rewrite query for better search
   */
  rewriteForSearch(query, intent = null) {
    const processed = this.processQuery(query)
    const detectedIntent = intent || processed.intent

    // Intent-specific rewriting
    switch (detectedIntent) {
      case 'pricing':
        return this.rewritePricingQuery(processed.cleaned)
      case 'features':
        return this.rewriteFeaturesQuery(processed.cleaned)
      case 'support':
        return this.rewriteSupportQuery(processed.cleaned)
      case 'comparison':
        return this.rewriteComparisonQuery(processed.cleaned)
      default:
        return processed.expanded
    }
  }

  /**
   * 💰 Rewrite pricing queries
   */
  rewritePricingQuery(query) {
    return query + ' price cost pricing fee rate plan subscription'
  }

  /**
   * ⚙️ Rewrite features queries
   */
  rewriteFeaturesQuery(query) {
    return query + ' features capabilities functions what does include'
  }

  /**
   * 🆘 Rewrite support queries
   */
  rewriteSupportQuery(query) {
    return query + ' help support assistance how to guide tutorial'
  }

  /**
   * ⚖️ Rewrite comparison queries
   */
  rewriteComparisonQuery(query) {
    return query + ' compare comparison difference versus vs between'
  }
}

// Factory function
export const createQueryProcessor = (options = {}) => {
  return new QueryProcessor(options)
}

// Singleton instance
let queryProcessorInstance = null

export const getQueryProcessor = () => {
  if (!queryProcessorInstance) {
    queryProcessorInstance = new QueryProcessor()
  }
  return queryProcessorInstance
}

export default QueryProcessor