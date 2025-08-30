// src/lib/rag/context-manager.js
/**
 * 📄 Context Manager - Intelligent Content Assembly
 * Handles smart context assembly, deduplication, and optimization
 */

export class ContextManager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || parseInt(process.env.CONTEXT_MAX_TOKENS || '4000')
    this.maxChunks = options.maxChunks || parseInt(process.env.MAX_CONTEXT_CHUNKS || '10')
    this.similarityThreshold = options.similarityThreshold || 0.85
    this.diversityFactor = options.diversityFactor || 0.3
  }

  /**
   * 🧠 Main context assembly method
   */
  assembleContext(searchResults, options = {}) {
    if (!searchResults || searchResults.length === 0) {
      return {
        content: '',
        sources: [],
        chunks_used: 0,
        confidence: 0
      }
    }

    console.log(`🔧 Assembling context from ${searchResults.length} search results`)

    // Step 1: Filter by minimum confidence
    const filteredResults = this.filterByConfidence(searchResults)
    
    // Step 2: Remove duplicates and similar content
    const deduplicatedResults = this.deduplicateContent(filteredResults)
    
    // Step 3: Diversify sources for better coverage
    const diversifiedResults = this.diversifySources(deduplicatedResults)
    
    // Step 4: Rank by relevance and recency
    const rankedResults = this.rankResults(diversifiedResults)
    
    // Step 5: Build final context within token limits
    const finalContext = this.buildFinalContext(rankedResults, options)

    console.log(`✅ Context assembled: ${finalContext.chunks_used} chunks, ${finalContext.content.length} chars`)

    return finalContext
  }

  /**
   * 🎯 Filter results by minimum confidence threshold
   */
  filterByConfidence(results) {
    const minConfidence = 0.5 // Minimum relevance score
    
    return results.filter(result => {
      const confidence = result.score || 0
      return confidence >= minConfidence
    })
  }

  /**
   * 🔄 Remove duplicate and highly similar content
   */
  deduplicateContent(results) {
    const uniqueResults = []
    const seenFingerprints = new Set()

    for (const result of results) {
      // Create content fingerprint
      const fingerprint = this.createContentFingerprint(result.content)
      
      // Check for exact duplicates
      if (seenFingerprints.has(fingerprint)) {
        continue
      }

      // Check for similar content
      const isSimilar = uniqueResults.some(existing => 
        this.calculateSimilarity(result.content, existing.content) > this.similarityThreshold
      )

      if (!isSimilar) {
        uniqueResults.push(result)
        seenFingerprints.add(fingerprint)
      }
    }

    console.log(`🔄 Deduplication: ${results.length} → ${uniqueResults.length} chunks`)
    return uniqueResults
  }

  /**
   * 🌈 Diversify sources for better context coverage
   */
  diversifySources(results) {
    // Group by source
    const sourceGroups = new Map()
    
    results.forEach(result => {
      const source = result.source || 'unknown'
      if (!sourceGroups.has(source)) {
        sourceGroups.set(source, [])
      }
      sourceGroups.get(source).push(result)
    })

    // Ensure diversity by taking best from each source
    const diversified = []
    const maxPerSource = Math.max(1, Math.floor(this.maxChunks / sourceGroups.size))

    for (const [source, sourceResults] of sourceGroups) {
      // Sort by relevance within source
      const sortedSource = sourceResults.sort((a, b) => (b.score || 0) - (a.score || 0))
      
      // Take top results from this source
      diversified.push(...sortedSource.slice(0, maxPerSource))
    }

    console.log(`🌈 Source diversification: ${sourceGroups.size} sources, max ${maxPerSource} per source`)
    return diversified
  }

  /**
   * 📊 Rank results by multiple factors
   */
  rankResults(results) {
    return results.sort((a, b) => {
      // Primary: Relevance score
      const scoreA = (a.score || 0) * 0.7
      const scoreB = (b.score || 0) * 0.7
      
      // Secondary: Recency (if available)
      const recencyA = this.getRecencyScore(a) * 0.2
      const recencyB = this.getRecencyScore(b) * 0.2
      
      // Tertiary: Content quality
      const qualityA = this.getContentQualityScore(a.content) * 0.1
      const qualityB = this.getContentQualityScore(b.content) * 0.1

      const totalA = scoreA + recencyA + qualityA
      const totalB = scoreB + recencyB + qualityB

      return totalB - totalA
    })
  }

  /**
   * 📝 Build final context string within token limits
   */
  buildFinalContext(rankedResults, options = {}) {
    const maxLength = this.maxTokens * 4 // Rough char to token conversion
    let contextParts = []
    let totalLength = 0
    let sources = []

    // Context template
    const contextHeader = options.includeHeader !== false ? 
      "Based on the following information:\n\n" : ""
    
    totalLength += contextHeader.length

    for (let i = 0; i < Math.min(rankedResults.length, this.maxChunks); i++) {
      const result = rankedResults[i]
      
      // Format content with source attribution
      const sourceLabel = `[Source: ${result.title || result.source}]`
      const contentBlock = `${sourceLabel}\n${result.content.trim()}\n\n`
      
      // Check if adding this would exceed limits
      if (totalLength + contentBlock.length > maxLength) {
        console.log(`📏 Context length limit reached at chunk ${i}`)
        break
      }

      contextParts.push(contentBlock)
      totalLength += contentBlock.length

      // Add to sources list
      sources.push({
        id: result.id,
        title: result.title || result.source,
        source: result.source,
        score: result.score,
        excerpt: this.createExcerpt(result.content),
        used_chars: result.content.length
      })
    }

    // Assemble final content
    const finalContent = contextHeader + contextParts.join('')
    
    // Calculate overall confidence
    const avgConfidence = sources.length > 0 
      ? sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length
      : 0

    return {
      content: finalContent.trim(),
      sources,
      chunks_used: sources.length,
      confidence: Math.round(avgConfidence * 100) / 100,
      total_chars: totalLength,
      estimated_tokens: Math.ceil(totalLength / 4)
    }
  }

  /**
   * 🔑 Create content fingerprint for deduplication
   */
  createContentFingerprint(content) {
    // Normalize and create hash-like fingerprint
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Take first and last 50 chars + length as fingerprint
    const start = normalized.substring(0, 50)
    const end = normalized.substring(Math.max(0, normalized.length - 50))
    
    return `${start}|${end}|${normalized.length}`
  }

  /**
   * 📐 Calculate content similarity (simple Jaccard similarity)
   */
  calculateSimilarity(content1, content2) {
    const words1 = new Set(content1.toLowerCase().split(/\s+/))
    const words2 = new Set(content2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  /**
   * ⏰ Get recency score (if metadata has timestamps)
   */
  getRecencyScore(result) {
    if (!result.metadata?.created_at && !result.metadata?.updated_at) {
      return 0.5 // Neutral score for unknown dates
    }

    const date = new Date(result.metadata.updated_at || result.metadata.created_at)
    const now = new Date()
    const ageInDays = (now - date) / (1000 * 60 * 60 * 24)
    
    // More recent = higher score (exponential decay)
    return Math.max(0, Math.exp(-ageInDays / 365)) // Decay over 1 year
  }

  /**
   * 💎 Calculate content quality score
   */
  getContentQualityScore(content) {
    let score = 0

    // Length factor (not too short, not too long)
    const idealLength = 500
    const lengthScore = 1 - Math.abs(content.length - idealLength) / idealLength
    score += Math.max(0, lengthScore) * 0.3

    // Sentence structure (has proper punctuation)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const sentenceScore = Math.min(sentences.length / 5, 1) // Ideal: 5+ sentences
    score += sentenceScore * 0.3

    // Information density (not too repetitive)
    const words = content.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const diversityScore = uniqueWords.size / words.length
    score += diversityScore * 0.4

    return Math.min(1, score)
  }

  /**
   * ✂️ Create content excerpt
   */
  createExcerpt(content, maxLength = 150) {
    if (content.length <= maxLength) return content

    // Try to break at sentence boundary
    const truncated = content.substring(0, maxLength)
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )

    if (lastSentenceEnd > maxLength * 0.6) {
      return truncated.substring(0, lastSentenceEnd + 1)
    }

    // Break at word boundary
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }
}

// Factory function
export const createContextManager = (options = {}) => {
  return new ContextManager(options)
}

export default ContextManager