
// app/api/qa-pairs/route.js
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

    const { chatbotId, question, answer, category, is_active = true } = await request.json()

    // Validate input
    if (!chatbotId || !question?.trim() || !answer?.trim()) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatbotId, question, and answer' 
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

    // Create Q&A pair
    const { data: qaPair, error: insertError } = await supabase
      .from('qa_pairs')
      .insert({
        chatbot_id: chatbotId,
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        is_active
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save Q&A pair' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: qaPair,
      message: 'Q&A pair added successfully'
    })

  } catch (error) {
    console.error('Q&A API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbotId')

    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId parameter is required' }, { status: 400 })
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

    // Get Q&A pairs
    const { data: qaPairs, error: selectError } = await supabase
      .from('qa_pairs')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    if (selectError) {
      console.error('Database select error:', selectError)
      return NextResponse.json({ error: 'Failed to fetch Q&A pairs' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: qaPairs || [],
      count: qaPairs?.length || 0
    })

  } catch (error) {
    console.error('Q&A GET API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
