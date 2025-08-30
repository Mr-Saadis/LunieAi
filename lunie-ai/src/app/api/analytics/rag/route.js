import { NextResponse } from 'next/server'
import { getRAGService } from '@/lib/rag/rag-service'
import { createRouteClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbotId')
    
    if (!chatbotId) {
      return NextResponse.json({
        error: 'chatbotId is required'
      }, { status: 400 })
    }
    
    const ragService = getRAGService()
    const analytics = ragService.getAnalytics()
    
    // Get database stats
    const cookieStore = await cookies()
    const supabase = createRouteClient(() => cookieStore)
    
    const { data: conversationStats } = await supabase
      .from('conversations')
      .select('created_at, message_count')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })
      .limit(30)
    
    const { data: messageStats } = await supabase
      .from('messages')
      .select('created_at, response_time_ms, metadata')
      .eq('conversations.chatbot_id', chatbotId)
      .not('response_time_ms', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100)
    
    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        database: {
          totalConversations: conversationStats?.length || 0,
          avgResponseTime: messageStats?.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / (messageStats?.length || 1),
          recentActivity: conversationStats?.slice(0, 7) || []
        }
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error.message
    }, { status: 500 })
  }
}