import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { id } = params
  
  try {
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch file content with ownership check
    const { data, error } = await supabase
      .from('training_data')
      .select(`
        id, 
        content, 
        title, 
        processing_status,
        chatbots!inner(user_id)
      `)
      .eq('id', id)
      .eq('chatbots.user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      content: data.content || 'No content available',
      status: data.processing_status 
    })
  } catch (error) {
    console.error('Error fetching file content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}