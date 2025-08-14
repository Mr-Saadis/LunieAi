
// app/api/qa-pairs/[id]/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { question, answer, category, is_active } = await request.json()

    // Validate input
    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ 
        error: 'Question and answer are required' 
      }, { status: 400 })
    }

    // Verify ownership through chatbot
    const { data: qaPair, error: verifyError } = await supabase
      .from('qa_pairs')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', id)
      .eq('chatbots.user_id', user.id)
      .single()

    if (verifyError || !qaPair) {
      return NextResponse.json({ error: 'Q&A pair not found' }, { status: 404 })
    }

    // Update Q&A pair
    const { data: updatedPair, error: updateError } = await supabase
      .from('qa_pairs')
      .update({
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to update Q&A pair' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedPair,
      message: 'Q&A pair updated successfully'
    })

  } catch (error) {
    console.error('Q&A UPDATE API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership through chatbot
    const { data: qaPair, error: verifyError } = await supabase
      .from('qa_pairs')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', id)
      .eq('chatbots.user_id', user.id)
      .single()

    if (verifyError || !qaPair) {
      return NextResponse.json({ error: 'Q&A pair not found' }, { status: 404 })
    }

    // Delete Q&A pair
    const { error: deleteError } = await supabase
      .from('qa_pairs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete Q&A pair' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Q&A pair deleted successfully'
    })

  } catch (error) {
    console.error('Q&A DELETE API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
