// src/app/api/embeddings/test/route.js
/**
 * Test Embedding Generation API
 */

import { NextResponse } from 'next/server';
import { getGeminiEmbeddings } from '@/lib/ai/embeddings/gemini-embeddings';
import { getTextProcessor } from '@/lib/utils/text-processing';
import { getQdrantManager } from '@/lib/vector/qdrant-client';

/**
 * POST /api/embeddings/test
 * Test embedding generation and vector storage
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      text = "This is a test document for embedding generation.",
      operation = 'generate', // 'generate', 'store', 'search'
      storeInQdrant = false
    } = body;

    const embeddings = getGeminiEmbeddings();
    const results = {};

    // Step 1: Generate embedding
    if (operation === 'generate' || operation === 'store' || operation === 'search') {
      console.log('Generating embedding for text:', text.substring(0, 50) + '...');
      
      const embedding = await embeddings.generateEmbedding(text);
      
      results.embedding = {
        dimensions: embedding.dimensions,
        model: embedding.model,
        preview: embedding.embedding.slice(0, 10), // Show first 10 values
        full_length: embedding.embedding.length
      };
    }

    // Step 2: Store in Qdrant
    if (operation === 'store' || storeInQdrant) {
      console.log('Storing in Qdrant...');
      
      const qdrant = getQdrantManager();
      
      // Initialize and create collection
      await qdrant.initialize();
      await qdrant.createCollection();
      
      // Prepare vector with numeric ID
      const embedding = await embeddings.generateEmbedding(text);
      const vectorId = Date.now() + Math.floor(Math.random() * 1000);
      const vectorData = [{
        id: vectorId,
        embedding: embedding.embedding,
        metadata: {
          text: text.substring(0, 500),
          timestamp: new Date().toISOString(),
          test: true
        }
      }];
      
      // Store vector
      const storeResult = await qdrant.upsertVectors(vectorData);
      
      results.storage = {
        success: storeResult.success,
        vectorId: vectorId,
        collection: process.env.QDRANT_COLLECTION_NAME
      };
    }

    // Step 3: Search similar vectors
    if (operation === 'search') {
      console.log('Searching similar vectors...');
      
      const qdrant = getQdrantManager();
      const queryEmbedding = await embeddings.generateQueryEmbedding(text);
      
      const searchResults = await qdrant.searchVectors(queryEmbedding, {
        limit: 5,
        scoreThreshold: 0.5
      });
      
      results.search = {
        found: searchResults.length,
        results: searchResults.map(r => ({
          score: r.score,
          text: r.metadata?.text?.substring(0, 100) + '...'
        }))
      };
    }

    return NextResponse.json({
      success: true,
      operation,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Embedding test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}