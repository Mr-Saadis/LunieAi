// src/scripts/test-rag-pipeline.js
/**
 * 🧪 RAG Pipeline Test Script
 * Comprehensive testing for Day 24 implementation
 */

import { getRAGService } from '@/lib/rag/rag-service'
import { getQdrantManager } from '@/lib/vector/qdrant-client'
import { getGeminiEmbeddings } from '@/lib/ai/embeddings/gemini-embeddings'
import { getQueryProcessor } from '@/lib/rag/query-processor'

class RAGPipelineTester {
  constructor() {
    this.ragService = null
    this.results = []
    this.errors = []
  }

  /**
   * 🚀 Run comprehensive RAG pipeline tests
   */
  async runAllTests() {
    console.log('🧪 Starting RAG Pipeline Tests...\n')
    
    try {
      // Test 1: Component Initialization
      await this.testComponentInitialization()
      
      // Test 2: Query Processing
      await this.testQueryProcessing()
      
      // Test 3: Embedding Generation
      await this.testEmbeddingGeneration()
      
      // Test 4: Vector Search
      await this.testVectorSearch()
      
      // Test 5: Context Assembly
      await this.testContextAssembly()
      
      // Test 6: Full RAG Pipeline
      await this.testFullRAGPipeline()
      
      // Test 7: Performance Tests
      await this.testPerformance()
      
      // Test 8: Edge Cases
      await this.testEdgeCases()
      
      // Print Results
      this.printResults()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error)
      this.errors.push({ test: 'Test Suite', error: error.message })
    }
  }

  /**
   * Test 1: Component Initialization
   */
  async testComponentInitialization() {
    console.log('🔧 Testing Component Initialization...')
    
    try {
      // Test RAG Service initialization
      this.ragService = getRAGService()
      await this.ragService.initialize()
      this.logSuccess('RAG Service initialized successfully')
      
      // Test Qdrant initialization
      const qdrant = getQdrantManager()
      await qdrant.initialize()
      const stats = await qdrant.getStats()
      this.logSuccess(`Qdrant connected: ${stats.connected}`)
      
      // Test embedding service
      const embeddings = getGeminiEmbeddings()
      const testEmbedding = await embeddings.generateEmbedding('test')
      this.logSuccess(`Embeddings working: ${testEmbedding.dimensions} dimensions`)
      
      // Test query processor
      const queryProcessor = getQueryProcessor()
      const processed = queryProcessor.processQuery('What is the pricing?')
      this.logSuccess(`Query processor working: Intent=${processed.intent}`)
      
    } catch (error) {
      this.logError('Component Initialization', error)
    }
  }

  /**
   * Test 2: Query Processing
   */
  async testQueryProcessing() {
    console.log('\n🔍 Testing Query Processing...')
    
    const testQueries = [
      'What is your pricing?',
      'How does your product work?',
      'Can you help me with setup?',
      'Compare your features vs competitors',
      'I want to buy your service',
      'Contact information please',
      'very short query',
      'This is a very long query that contains many words and should test the complexity calculation and processing capabilities of our query processor',
    ]

    try {
      const queryProcessor = getQueryProcessor()
      
      for (const query of testQueries) {
        const result = queryProcessor.analyzeQuery(query)
        
        this.logSuccess(`Query: "${query}" -> Intent: ${result.intent} (${result.confidence})`)
        
        // Test query variations
        const variations = queryProcessor.generateVariations(query)
        console.log(`  📋 Variations: ${variations.join(' | ')}`)
      }
      
    } catch (error) {
      this.logError('Query Processing', error)
    }
  }

  /**
   * Test 3: Embedding Generation
   */
  async testEmbeddingGeneration() {
    console.log('\n🎯 Testing Embedding Generation...')
    
    const testTexts = [
      'Our pricing starts at $29 per month for the basic plan.',
      'We offer 24/7 customer support via email and chat.',
      'The software includes advanced analytics and reporting features.',
      'Contact us at support@company.com for technical assistance.'
    ]

    try {
      const embeddings = getGeminiEmbeddings()
      
      for (const text of testTexts) {
        const result = await embeddings.generateEmbedding(text)
        this.logSuccess(`Generated embedding: ${result.dimensions}D for "${text.substring(0, 50)}..."`)
      }
      
      // Test batch embedding
      const batchResults = await embeddings.generateBatchEmbeddings(testTexts.slice(0, 2))
      this.logSuccess(`Batch embeddings: ${batchResults.length} generated`)
      
    } catch (error) {
      this.logError('Embedding Generation', error)
    }
  }

  /**
   * Test 4: Vector Search (requires existing data)
   */
  async testVectorSearch() {
    console.log('\n🔎 Testing Vector Search...')
    
    try {
      const qdrant = getQdrantManager()
      
      // First, check if collection exists and has data
      const collectionInfo = await qdrant.getCollectionInfo()
      console.log(`📊 Collection stats: ${JSON.stringify(collectionInfo)}`)
      
      if (collectionInfo.points_count > 0) {
        // Test search with sample query embedding
        const embeddings = getGeminiEmbeddings()
        const queryEmbedding = await embeddings.generateEmbedding('pricing information')
        
        const searchResults = await qdrant.searchSimilar(queryEmbedding.embedding, {
          limit: 3,
          threshold: 0.5
        })
        
        this.logSuccess(`Vector search returned ${searchResults.length} results`)
        
        searchResults.forEach((result, idx) => {
          console.log(`  ${idx + 1}. Score: ${result.score.toFixed(3)} | Content: "${result.payload?.content?.substring(0, 100)}..."`)
        })
      } else {
        console.log('⚠️ No vectors in collection - add some training data first')
      }
      
    } catch (error) {
      this.logError('Vector Search', error)
    }
  }

  /**
   * Test 5: Context Assembly
   */
  async testContextAssembly() {
    console.log('\n📄 Testing Context Assembly...')
    
    try {
      // Mock search results for testing
      const mockResults = [
        {
          id: '1',
          content: 'Our basic plan costs $29 per month and includes up to 1000 API calls.',
          score: 0.95,
          source: 'pricing-page',
          title: 'Pricing Information'
        },
        {
          id: '2', 
          content: 'The premium plan is $79 monthly with unlimited API calls and priority support.',
          score: 0.88,
          source: 'pricing-page',
          title: 'Premium Plans'
        },
        {
          id: '3',
          content: 'We also offer enterprise solutions with custom pricing for large organizations.',
          score: 0.82,
          source: 'enterprise-info',
          title: 'Enterprise Solutions'
        }
      ]

      const context = this.ragService.assembleContext(mockResults)
      
      this.logSuccess(`Context assembled: ${context.chunks_used} chunks, ${context.content.length} chars`)
      console.log(`📝 Context preview: "${context.content.substring(0, 200)}..."`)
      console.log(`🎯 Confidence: ${context.confidence}`)
      
    } catch (error) {
      this.logError('Context Assembly', error)
    }
  }

  /**
   * Test 6: Full RAG Pipeline
   */
  async testFullRAGPipeline() {
    console.log('\n🚀 Testing Full RAG Pipeline...')
    
    const testQueries = [
      'What is your pricing?',
      'How can I contact support?',
      'Tell me about your features'
    ]

    // You'll need a real chatbot ID for this test
    const testChatbotId = process.env.TEST_CHATBOT_ID || 'test-chatbot-id'
    
    try {
      for (const query of testQueries) {
        console.log(`\n💬 Testing query: "${query}"`)
        
        const result = await this.ragService.processQuery(query, testChatbotId, {
          userId: 'test-user',
          temperature: 0.7
        })
        
        if (result.success) {
          this.logSuccess(`RAG Pipeline successful`)
          console.log(`📝 Response: "${result.response.substring(0, 200)}..."`)
          console.log(`📊 Sources: ${result.sources.length}`)
          console.log(`⏱️ Duration: ${result.metadata.duration}ms`)
          console.log(`🎯 Confidence: ${result.metadata.confidence}`)
        } else {
          this.logError(`RAG Pipeline for "${query}"`, new Error(result.error))
        }
      }
      
    } catch (error) {
      this.logError('Full RAG Pipeline', error)
    }
  }

  /**
   * Test 7: Performance Tests
   */
  async testPerformance() {
    console.log('\n⚡ Testing Performance...')
    
    const testChatbotId = process.env.TEST_CHATBOT_ID || 'test-chatbot-id'
    
    try {
      const startTime = Date.now()
      const promises = []
      
      // Test concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          this.ragService.processQuery(`Test query ${i}`, testChatbotId)
        )
      }
      
      const results = await Promise.all(promises)
      const endTime = Date.now()
      
      const successfulRequests = results.filter(r => r.success).length
      const avgDuration = results.reduce((sum, r) => sum + (r.metadata?.duration || 0), 0) / results.length
      
      this.logSuccess(`Concurrent Performance Test:`)
      console.log(`  📊 ${successfulRequests}/5 requests successful`)
      console.log(`  ⏱️ Total time: ${endTime - startTime}ms`)
      console.log(`  📈 Average response time: ${avgDuration.toFixed(2)}ms`)
      
    } catch (error) {
      this.logError('Performance Test', error)
    }
  }

  /**
   * Test 8: Edge Cases
   */
  async testEdgeCases() {
    console.log('\n🏗️ Testing Edge Cases...')
    
    const edgeCases = [
      '',                    // Empty query
      'a',                   // Single character
      'x'.repeat(1000),      // Very long query
      '!@#$%^&*()',         // Special characters only
      '123456789',          // Numbers only
      'هذا نص باللغة العربية', // Non-English text (if supported)
    ]

    const testChatbotId = process.env.TEST_CHATBOT_ID || 'test-chatbot-id'
    
    for (const testCase of edgeCases) {
      try {
        console.log(`\n🔍 Testing: "${testCase.substring(0, 50)}${testCase.length > 50 ? '...' : ''}"`)
        
        const result = await this.ragService.processQuery(testCase, testChatbotId)
        
        if (result.success) {
          this.logSuccess('Edge case handled successfully')
        } else {
          console.log(`⚠️ Expected failure: ${result.error}`)
        }
        
      } catch (error) {
        console.log(`⚠️ Edge case error (expected): ${error.message}`)
      }
    }
  }

  /**
   * Helper: Log success
   */
  logSuccess(message) {
    console.log(`✅ ${message}`)
    this.results.push({ status: 'success', message })
  }

  /**
   * Helper: Log error
   */
  logError(test, error) {
    console.log(`❌ ${test}: ${error.message}`)
    this.errors.push({ test, error: error.message })
  }

  /**
   * Print final results
   */
  printResults() {
    console.log('\n' + '='.repeat(50))
    console.log('🧪 RAG PIPELINE TEST RESULTS')
    console.log('='.repeat(50))
    
    console.log(`✅ Successful tests: ${this.results.filter(r => r.status === 'success').length}`)
    console.log(`❌ Failed tests: ${this.errors.length}`)
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS:')
      this.errors.forEach((error, idx) => {
        console.log(`  ${idx + 1}. ${error.test}: ${error.error}`)
      })
    }
    
    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Ensure all environment variables are set')
    console.log('2. Add some training data to your chatbot')
    console.log('3. Test the chat interface in your application')
    console.log('4. Monitor performance and adjust settings as needed')
    
    console.log('\n✨ RAG Pipeline testing complete!')
  }
}

// CLI execution
if (typeof window === 'undefined') {
  const tester = new RAGPipelineTester()
  tester.runAllTests().catch(console.error)
}

export { RAGPipelineTester }