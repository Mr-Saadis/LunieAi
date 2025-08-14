import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Run queries in parallel for better performance
    const [
      { count: chatbotsCount },
      { count: trainingDataCount },
      { data: chatbots }
    ] = await Promise.all([
      // Get chatbots count
      supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Get training data count
      supabase
        .from('training_data')
        .select(`
          *,
          chatbots!inner(user_id)
        `, { count: 'exact', head: true })
        .eq('chatbots.user_id', user.id),
      
      // Get chatbots with conversation counts
      supabase
        .from('chatbots')
        .select('total_conversations')
        .eq('user_id', user.id)
    ])

    const totalConversations = chatbots?.reduce(
      (sum, chatbot) => sum + (chatbot.total_conversations || 0), 
      0
    ) || 0

    const stats = {
      chatbots: chatbotsCount || 0,
      conversations: totalConversations,
      trainingData: trainingDataCount || 0,
      messages: 0 // Will be calculated from conversations if needed
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}