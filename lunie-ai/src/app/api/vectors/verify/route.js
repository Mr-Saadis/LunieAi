// src/app/api/vectors/verify/route.js
/**
 * Verify vectors in Qdrant for a specific chatbot
 */

import { NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get('chatbotId');
    
    // Get user if available
    let userId = null;
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (e) {
      console.log('Auth not available');
    }

    // Connect to Qdrant
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const collectionName = process.env.QDRANT_COLLECTION_NAME || 'lunieai_vectors';

    // Get collection stats
    const collectionInfo = await client.getCollection(collectionName);
    
    // Build filter for specific chatbot/user if provided
    let filter = null;
    if (chatbotId && userId) {
      const namespace = `user_${userId}_bot_${chatbotId}`;
      filter = {
        must: [
          {
            key: 'namespace',
            match: { value: namespace }
          }
        ]
      };
    }

    // Count vectors with filter
    let filteredCount = 0;
    if (filter) {
      // Scroll through vectors to count (Qdrant doesn't have direct count with filter)
      const scrollResult = await client.scroll(collectionName, {
        filter,
        limit: 1000,
        with_payload: false,
        with_vector: false
      });
      filteredCount = scrollResult.points.length;
    }

    // Get sample vectors
    const sampleVectors = await client.scroll(collectionName, {
      filter,
      limit: 5,
      with_payload: true,
      with_vector: false
    });

    // Get data from Supabase for comparison
    let supabaseData = null;
    if (chatbotId) {
      try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        const { data, error } = await supabase
          .from('training_data')
          .select('id, title, type, metadata')
          .eq('chatbot_id', chatbotId)
          .limit(10);
        
        supabaseData = {
          count: data?.length || 0,
          items: data?.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            vectors: item.metadata?.vectors || 0
          }))
        };
      } catch (e) {
        console.error('Supabase query failed:', e);
      }
    }

    return NextResponse.json({
      qdrant: {
        connected: true,
        collection: collectionName,
        totalVectors: collectionInfo.points_count,
        vectorSize: collectionInfo.config?.params?.vectors?.size,
        filteredVectors: chatbotId ? filteredCount : collectionInfo.points_count
      },
      samples: sampleVectors.points.map(p => ({
        id: p.id,
        metadata: {
          title: p.payload?.title,
          type: p.payload?.type,
          namespace: p.payload?.namespace,
          created_at: p.payload?.created_at
        }
      })),
      supabase: supabaseData,
      verification: {
        hasVectors: collectionInfo.points_count > 0,
        chatbotNamespace: chatbotId && userId ? `user_${userId}_bot_${chatbotId}` : null,
        message: collectionInfo.points_count > 0 
          ? `✅ Found ${collectionInfo.points_count} vectors in Qdrant`
          : '❌ No vectors found in Qdrant'
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      qdrant: {
        connected: false,
        error: error.message
      },
      verification: {
        hasVectors: false,
        message: '❌ Could not connect to Qdrant'
      }
    }, { status: 500 });
  }
}