
// // app/api/qa-pairs/route.js
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function POST(request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies })
    
//     // Get current user
//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { chatbotId, question, answer, category, is_active = true } = await request.json()

//     // Validate input
//     if (!chatbotId || !question?.trim() || !answer?.trim()) {
//       return NextResponse.json({ 
//         error: 'Missing required fields: chatbotId, question, and answer' 
//       }, { status: 400 })
//     }

//     // Verify chatbot ownership
//     const { data: chatbot, error: chatbotError } = await supabase
//       .from('chatbots')
//       .select('id')
//       .eq('id', chatbotId)
//       .eq('user_id', user.id)
//       .single()

//     if (chatbotError || !chatbot) {
//       return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
//     }

//     // Create Q&A pair
//     const { data: qaPair, error: insertError } = await supabase
//       .from('qa_pairs')
//       .insert({
//         chatbot_id: chatbotId,
//         question: question.trim(),
//         answer: answer.trim(),
//         category: category?.trim() || null,
//         is_active
//       })
//       .select()
//       .single()

//     if (insertError) {
//       console.error('Database insert error:', insertError)
//       return NextResponse.json({ error: 'Failed to save Q&A pair' }, { status: 500 })
//     }

//     return NextResponse.json({
//       success: true,
//       data: qaPair,
//       message: 'Q&A pair added successfully'
//     })

//   } catch (error) {
//     console.error('Q&A API error:', error)
//     return NextResponse.json({ 
//       error: 'Internal server error' 
//     }, { status: 500 })
//   }
// }

// export async function GET(request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies })
    
//     // Get current user
//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const chatbotId = searchParams.get('chatbotId')

//     if (!chatbotId) {
//       return NextResponse.json({ error: 'chatbotId parameter is required' }, { status: 400 })
//     }

//     // Verify chatbot ownership
//     const { data: chatbot, error: chatbotError } = await supabase
//       .from('chatbots')
//       .select('id')
//       .eq('id', chatbotId)
//       .eq('user_id', user.id)
//       .single()

//     if (chatbotError || !chatbot) {
//       return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
//     }

//     // Get Q&A pairs
//     const { data: qaPairs, error: selectError } = await supabase
//       .from('qa_pairs')
//       .select('*')
//       .eq('chatbot_id', chatbotId)
//       .order('created_at', { ascending: false })

//     if (selectError) {
//       console.error('Database select error:', selectError)
//       return NextResponse.json({ error: 'Failed to fetch Q&A pairs' }, { status: 500 })
//     }

//     return NextResponse.json({
//       success: true,
//       data: qaPairs || [],
//       count: qaPairs?.length || 0
//     })

//   } catch (error) {
//     console.error('Q&A GET API error:', error)
//     return NextResponse.json({ 
//       error: 'Internal server error' 
//     }, { status: 500 })
//   }
// }


// src/app/api/qa-pairs/route.js
/**
 * Q&A Pairs API with vector processing
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getTextProcessor } from '@/lib/utils/text-processing'
import { getGeminiEmbeddings } from '@/lib/ai/embeddings/gemini-embeddings'
import { getQdrantManager } from '@/lib/vector/qdrant-client'

/**
 * GET /api/qa-pairs - Get Q&A pairs for a chatbot
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbotId')

    if (!chatbotId) {
      return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('qa_pairs')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch Q&A pairs' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('GET Q&A pairs error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * POST /api/qa-pairs - Create Q&A pair with vectors
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, question, answer, category, is_active = true } = await request.json()

    if (!chatbotId || !question?.trim() || !answer?.trim()) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Verify chatbot ownership
    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Combine Q&A for vector processing
    const combinedContent = `Question: ${question}\nAnswer: ${answer}`
    
    // Process and create vectors
    const textProcessor = getTextProcessor()
    const chunks = textProcessor.chunkText(combinedContent, {
      title: question,
      source: 'qa_pair',
      type: 'qa',
      chatbotId,
      userId: user.id
    })

    // Generate embeddings
    let vectorCount = 0
    try {
      const embeddings = getGeminiEmbeddings()
      const embeddingResults = await embeddings.embedDocumentChunks(chunks)
      const successfulEmbeddings = embeddingResults.filter(e => !e.error)
      
      if (successfulEmbeddings.length > 0) {
        const qdrant = getQdrantManager()
        const namespace = qdrant.createNamespace(user.id, chatbotId)
        
        await qdrant.initialize()
        await qdrant.createCollection()
        await qdrant.upsertVectors(successfulEmbeddings, namespace)
        
        vectorCount = successfulEmbeddings.length
      }
    } catch (vectorError) {
      console.error('Vector processing error:', vectorError)
      // Continue even if vector processing fails
    }

    // Create Q&A pair in database
    const { data: qaPair, error: insertError } = await supabase
      .from('qa_pairs')
      .insert({
        chatbot_id: chatbotId,
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        is_active,
        metadata: {
          vectors: vectorCount,
          processedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to create Q&A pair' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      data: qaPair,
      vectors: vectorCount,
      message: 'Q&A pair created successfully' 
    })

  } catch (error) {
    console.error('POST Q&A pair error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}