// lib/rag/spreadsheet-rag-enhancer.js
/**
 * Enhanced RAG processing specifically optimized for spreadsheet data
 * Improves query understanding and context retrieval for tabular information
 */

export class SpreadsheetRAGEnhancer {
  constructor() {
    this.spreadsheetKeywords = {
      aggregation: ['total', 'sum', 'average', 'mean', 'count', 'maximum', 'minimum', 'calculate'],
      comparison: ['compare', 'difference', 'versus', 'vs', 'between', 'higher', 'lower', 'more', 'less'],
      temporal: ['trend', 'over time', 'monthly', 'yearly', 'quarterly', 'growth', 'change'],
      lookup: ['find', 'show', 'list', 'what is', 'where is', 'who has', 'which'],
      relationship: ['relationship', 'correlation', 'related', 'connected', 'associated'],
      structure: ['columns', 'rows', 'fields', 'headers', 'table', 'sheet', 'data']
    }
  }

  /**
   * Enhance query processing for spreadsheet-specific needs
   */
  enhanceQuery(originalQuery, chatbotId) {
    const analysis = this.analyzeQuery(originalQuery)
    const enhancedQuery = this.buildEnhancedQuery(originalQuery, analysis)
    const searchStrategy = this.determineSearchStrategy(analysis)
    
    return {
      original: originalQuery,
      enhanced: enhancedQuery,
      analysis,
      searchStrategy,
      filters: this.buildSearchFilters(analysis)
    }
  }

  /**
   * Analyze query to understand spreadsheet-specific intent
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase()
    const analysis = {
      intent: 'general',
      entityType: 'unknown',
      operation: 'retrieve',
      scope: 'single_value',
      requiresCalculation: false,
      requiresComparison: false,
      requiresAggregation: false,
      mentionsColumns: [],
      mentionsSheets: [],
      temporalAspect: false,
      confidence: 0.5
    }

    // Detect intent patterns
    if (this.matchesKeywords(lowerQuery, this.spreadsheetKeywords.aggregation)) {
      analysis.intent = 'aggregation'
      analysis.requiresAggregation = true
      analysis.scope = 'multiple_values'
      analysis.confidence += 0.3
    }

    if (this.matchesKeywords(lowerQuery, this.spreadsheetKeywords.comparison)) {
      analysis.intent = 'comparison'
      analysis.requiresComparison = true
      analysis.scope = 'multiple_values'
      analysis.confidence += 0.2
    }

    if (this.matchesKeywords(lowerQuery, this.spreadsheetKeywords.lookup)) {
      analysis.intent = 'lookup'
      analysis.operation = 'find'
      analysis.confidence += 0.2
    }

    if (this.matchesKeywords(lowerQuery, this.spreadsheetKeywords.temporal)) {
      analysis.temporalAspect = true
      analysis.confidence += 0.2
    }

    // Detect calculation needs
    const calculationWords = ['calculate', 'compute', 'total', 'sum', 'average', 'percentage', '%']
    if (calculationWords.some(word => lowerQuery.includes(word))) {
      analysis.requiresCalculation = true
      analysis.confidence += 0.2
    }

    // Extract potential column/field references
    analysis.mentionsColumns = this.extractColumnReferences(query)
    analysis.mentionsSheets = this.extractSheetReferences(query)

    return analysis
  }

  /**
   * Build enhanced query with spreadsheet context
   */
  buildEnhancedQuery(originalQuery, analysis) {
    let enhanced = originalQuery

    // Add context based on intent
    switch (analysis.intent) {
      case 'aggregation':
        enhanced += ' (looking for summary statistics, totals, or calculated values from spreadsheet data)'
        break
      case 'comparison':
        enhanced += ' (comparing values or categories from different rows or columns in spreadsheet)'
        break
      case 'lookup':
        enhanced += ' (finding specific data records or values from spreadsheet tables)'
        break
    }

    // Add operation hints
    if (analysis.requiresCalculation) {
      enhanced += ' (requires numerical calculation or aggregation)'
    }

    if (analysis.temporalAspect) {
      enhanced += ' (involves time-based data or trends)'
    }

    // Add column/sheet context if detected
    if (analysis.mentionsColumns.length > 0) {
      enhanced += ` (specifically about columns: ${analysis.mentionsColumns.join(', ')})`
    }

    if (analysis.mentionsSheets.length > 0) {
      enhanced += ` (specifically about sheets: ${analysis.mentionsSheets.join(', ')})`
    }

    return enhanced
  }

  /**
   * Determine optimal search strategy based on query analysis
   */
  determineSearchStrategy(analysis) {
    const strategy = {
      priorityChunkTypes: [],
      searchRadius: 5, // number of chunks to retrieve
      boostFactors: {},
      requiresMultipleSheets: false
    }

    // Prioritize chunk types based on intent
    switch (analysis.intent) {
      case 'aggregation':
        strategy.priorityChunkTypes = ['summary_statistics', 'data_records', 'sheet_overview']
        strategy.boostFactors.isNumericData = 2.0
        strategy.boostFactors.isSummary = 1.5
        break

      case 'comparison':
        strategy.priorityChunkTypes = ['data_records', 'cross_sheet_relationships', 'summary_statistics']
        strategy.requiresMultipleSheets = true
        strategy.searchRadius = 8
        break

      case 'lookup':
        strategy.priorityChunkTypes = ['data_records', 'header_definition', 'sheet_overview']
        strategy.boostFactors.isDataRecords = 1.5
        break

      default:
        strategy.priorityChunkTypes = ['workbook_overview', 'sheet_overview', 'data_records']
    }

    // Adjust for scope
    if (analysis.scope === 'multiple_values') {
      strategy.searchRadius += 3
    }

    return strategy
  }

  /**
   * Build search filters for vector database
   */
  buildSearchFilters(analysis) {
    const filters = {
      must: [],
      should: [],
      boost: {}
    }

    // Filter by chunk type priorities
    if (analysis.intent === 'aggregation') {
      filters.should.push({ 
        key: 'queryHints.isSummary', 
        value: true,
        boost: 2.0 
      })
      filters.should.push({ 
        key: 'isNumericData', 
        value: true,
        boost: 1.5 
      })
    }

    if (analysis.intent === 'comparison') {
      filters.should.push({ 
        key: 'queryHints.isCrossSheet', 
        value: true,
        boost: 1.8 
      })
    }

    if (analysis.mentionsSheets.length > 0) {
      filters.must.push({
        key: 'sheetName',
        value: analysis.mentionsSheets,
        operator: 'in'
      })
    }

    // Boost overview chunks for general queries
    if (analysis.intent === 'general') {
      filters.should.push({ 
        key: 'queryHints.isOverview', 
        value: true,
        boost: 1.3 
      })
    }

    return filters
  }

  /**
   * Enhanced context creation for spreadsheet data
   */
  createSpreadsheetContext(searchResults, analysis) {
    // Sort results by relevance and chunk type priority
    const sortedResults = this.sortBySpreadsheetRelevance(searchResults, analysis)
    
    // Group by chunk types for better organization
    const groupedResults = this.groupResultsByType(sortedResults)
    
    // Build hierarchical context
    const context = {
      content: '',
      sources: [],
      structure: {
        hasOverview: false,
        hasDataRecords: false,
        hasSummaries: false,
        hasRelationships: false
      },
      metadata: {
        sheets: new Set(),
        columnTypes: new Set(),
        totalChunks: searchResults.length
      }
    }

    // Add overview context first (if available)
    if (groupedResults.overview && groupedResults.overview.length > 0) {
      context.content += "SPREADSHEET OVERVIEW:\n"
      context.content += groupedResults.overview[0].content + "\n\n"
      context.structure.hasOverview = true
      this.extractMetadataFromResult(groupedResults.overview[0], context.metadata)
    }

    // Add data records with intelligent selection
    if (groupedResults.data && groupedResults.data.length > 0) {
      context.content += "RELEVANT DATA:\n"
      const selectedDataChunks = this.selectBestDataChunks(
        groupedResults.data, 
        analysis, 
        3 // max data chunks
      )
      
      selectedDataChunks.forEach(result => {
        context.content += result.content + "\n\n"
        this.extractMetadataFromResult(result, context.metadata)
      })
      context.structure.hasDataRecords = true
    }

    // Add summaries if needed for aggregation queries
    if (analysis.requiresAggregation && groupedResults.summary && groupedResults.summary.length > 0) {
      context.content += "SUMMARY STATISTICS:\n"
      context.content += groupedResults.summary[0].content + "\n\n"
      context.structure.hasSummaries = true
    }

    // Add relationships for comparison queries
    if (analysis.requiresComparison && groupedResults.relationships && groupedResults.relationships.length > 0) {
      context.content += "DATA RELATIONSHIPS:\n"
      context.content += groupedResults.relationships[0].content + "\n\n"
      context.structure.hasRelationships = true
    }

    // Collect sources
    context.sources = sortedResults.map(result => ({
      title: result.title,
      source: result.source,
      sheet: result.metadata?.sheetName || 'unknown',
      type: result.metadata?.chunkType || 'unknown',
      score: result.score
    }))

    return context
  }

  /**
   * Sort results by spreadsheet-specific relevance
   */
  sortBySpreadsheetRelevance(results, analysis) {
    return results.sort((a, b) => {
      let scoreA = a.score
      let scoreB = b.score

      // Apply intent-based boosting
      if (analysis.intent === 'aggregation') {
        if (a.metadata?.queryHints?.isSummary) scoreA += 0.2
        if (b.metadata?.queryHints?.isSummary) scoreB += 0.2
        if (a.metadata?.isNumericData) scoreA += 0.15
        if (b.metadata?.isNumericData) scoreB += 0.15
      }

      if (analysis.intent === 'comparison') {
        if (a.metadata?.queryHints?.isCrossSheet) scoreA += 0.25
        if (b.metadata?.queryHints?.isCrossSheet) scoreB += 0.25
      }

      // Boost overview chunks for general queries
      if (analysis.intent === 'general') {
        if (a.metadata?.queryHints?.isOverview) scoreA += 0.1
        if (b.metadata?.queryHints?.isOverview) scoreB += 0.1
      }

      return scoreB - scoreA
    })
  }

  /**
   * Group results by chunk type
   */
  groupResultsByType(results) {
    const groups = {
      overview: [],
      data: [],
      summary: [],
      relationships: [],
      headers: [],
      other: []
    }

    results.forEach(result => {
      const chunkType = result.metadata?.chunkType
      
      if (chunkType?.includes('overview')) {
        groups.overview.push(result)
      } else if (chunkType === 'data_records') {
        groups.data.push(result)
      } else if (chunkType === 'summary_statistics') {
        groups.summary.push(result)
      } else if (chunkType === 'cross_sheet_relationships') {
        groups.relationships.push(result)
      } else if (chunkType === 'header_definition') {
        groups.headers.push(result)
      } else {
        groups.other.push(result)
      }
    })

    return groups
  }

  /**
   * Select best data chunks based on query analysis
   */
  selectBestDataChunks(dataChunks, analysis, maxChunks) {
    let selected = []

    // For aggregation queries, prefer chunks with numeric data
    if (analysis.requiresAggregation) {
      const numericChunks = dataChunks.filter(chunk => chunk.metadata?.isNumericData)
      selected = numericChunks.slice(0, maxChunks)
    }

    // Fill remaining slots with highest scoring chunks
    if (selected.length < maxChunks) {
      const remaining = dataChunks
        .filter(chunk => !selected.includes(chunk))
        .slice(0, maxChunks - selected.length)
      selected.push(...remaining)
    }

    return selected
  }

  /**
   * Utility methods
   */
  matchesKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword))
  }

  extractColumnReferences(query) {
    // Simple pattern matching for column references
    const patterns = [
      /column\s+["']([^"']+)["']/gi,
      /field\s+["']([^"']+)["']/gi,
      /["']([^"']+)["']\s+column/gi
    ]
    
    const matches = []
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(query)) !== null) {
        matches.push(match[1])
      }
    })
    
    return matches
  }

  extractSheetReferences(query) {
    // Pattern matching for sheet references
    const patterns = [
      /sheet\s+["']([^"']+)["']/gi,
      /tab\s+["']([^"']+)["']/gi,
      /["']([^"']+)["']\s+sheet/gi
    ]
    
    const matches = []
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(query)) !== null) {
        matches.push(match[1])
      }
    })
    
    return matches
  }

  extractMetadataFromResult(result, metadata) {
    if (result.metadata?.sheetName) {
      metadata.sheets.add(result.metadata.sheetName)
    }
    if (result.metadata?.chunkType) {
      metadata.columnTypes.add(result.metadata.chunkType)
    }
  }
}

/**
 * Factory function
 */
export function createSpreadsheetRAGEnhancer() {
  return new SpreadsheetRAGEnhancer()
}