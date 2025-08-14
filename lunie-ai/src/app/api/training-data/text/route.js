// app/api/training-data/text/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Calculate word count and prepare metadata
    const wordCount = content.trim().split(/\s+/).length
    const metadata = {
      wordCount,
      addedManually: true,
      processingTimeMs: 0 // Instant for manual text
    }

    // Create training data record
    const { data: trainingData, error: insertError } = await supabase
      .from('training_data')
      .insert({
        chatbot_id: chatbotId,
        type: 'text',
        title: title.trim(),
        content: content.trim(),
        processing_status: 'completed',
        metadata,
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save text content' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: trainingData,
      message: 'Text content added successfully'
    })

  } catch (error) {
    console.error('Text API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
