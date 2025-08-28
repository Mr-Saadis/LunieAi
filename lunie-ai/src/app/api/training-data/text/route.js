
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getTextProcessor } from '@/lib/utils/text-processing'
import { getGeminiEmbeddings } from '@/lib/ai/embeddings/gemini-embeddings'
import { getQdrantManager } from '@/lib/vector/qdrant-client'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, title, content } = await request.json()

    // Validate input
    if (!chatbotId || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatbotId, title, and content' 
      }, { status: 400 })
    }

    // Verify chatbot ownership
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, name')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    console.log(`Processing text for chatbot: ${chatbot.name}`)

    // Calculate word count and prepare metadata
    const wordCount = content.trim().split(/\s+/).length
    const byteSize = new TextEncoder().encode(content).length
    
    // Step 1: Process and chunk text
    const textProcessor = getTextProcessor()
    const processed = textProcessor.processDocument({
      content: content.trim(),
      title: title.trim(),
      source: 'manual',
      type: 'text',
      chatbotId,
      userId: user.id
    })

    console.log(`Created ${processed.chunks.length} chunks from ${wordCount} words`)

   const metadata = {
      wordCount,
      byteSize,
      chunks: processed.chunks.length,
      // vectors: embeddingResults.filter(e => !e.error).length,
      addedManually: true,
      processingTimeMs: Date.now() - new Date().getTime(),
      // vectorStorage: vectorStorageResult ? 'success' : 'failed'
    }
    

        const { data: trainingData, error: insertError } = await supabase
      .from('training_data')
      .insert({
        chatbot_id: chatbotId,
        type: 'text',
        title: title.trim() || 'Untitled',
        content: content.trim(),
        processing_status: 'completed',
        metadata,
        processed_at: new Date().toISOString(),
        file_size: byteSize
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to save text content',
        details: insertError.message 
      }, { status: 500 })
    }


    // Step 2: Generate embeddings for chunks
    let embeddingResults = []
    let vectorStorageResult = null

    try {
      const embeddings = getGeminiEmbeddings()
      embeddingResults = await embeddings.embedDocumentChunks(processed.chunks)
      
      // Filter successful embeddings
      const successfulEmbeddings = embeddingResults.filter(e => !e.error)
      
      console.log(`Generated ${successfulEmbeddings.length} embeddings`)


      // Step 3: Store in Qdrant if embeddings were generated
      if (successfulEmbeddings.length > 0) {
        const qdrant = getQdrantManager()
        const namespace = qdrant.createNamespace(user.id, chatbotId)
        
        await qdrant.initialize()
        await qdrant.createCollection()
        
        // Add trainingDataId to metadata for each embedding
        const embeddingsWithTrainingId = successfulEmbeddings.map(emb => ({
          ...emb,
          metadata: {
            ...emb.metadata,
            trainingDataId: trainingData.id // Add the database record ID
          }
        }))
        
        vectorStorageResult = await qdrant.upsertVectors(
          embeddingsWithTrainingId,
          namespace
        )
        
        console.log(`Stored ${successfulEmbeddings.length} vectors in Qdrant`)
      }
    } catch (vectorError) {
      console.error('Vector processing error:', vectorError)
      // Continue even if vector processing fails - still save to database
    }

    // Step 4: Create training data record with enhanced metadata
 



    return NextResponse.json({
      success: true,
      data: {
        ...trainingData,
        wordCount,
        byteSize,
        chunks: processed.chunks.length,
        vectors: embeddingResults.filter(e => !e.error).length
      },
      message: 'Text content added and processed successfully'
    })

  } catch (error) {
    console.error('Text API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * GET /api/training-data/text
 * Get text training data for a chatbot
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

    // Verify ownership and get training data
    const { data: trainingData, error } = await supabase
      .from('training_data')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .eq('type', 'text')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Enhance with calculated fields
    const enhancedData = trainingData.map(item => ({
      ...item,
      wordCount: item.metadata?.wordCount || item.content?.split(/\s+/).length || 0,
      byteSize: item.file_size || new TextEncoder().encode(item.content || '').length
    }))

    return NextResponse.json({
      success: true,
      data: enhancedData
    })

  } catch (error) {
    console.error('GET training data error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}