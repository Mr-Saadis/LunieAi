import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })


    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100) // Cap at 100
        const offset = parseInt(searchParams.get('offset')) || 0
        const search = searchParams.get('search') || ''

        let query = supabase
            .from('chatbots')
            .select(`
        id,
        name,
        description,
        is_active,
        theme_color,
        total_conversations,
        created_at,
        updated_at
      `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Chatbots fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 })
        }

        return NextResponse.json({
            chatbots: data || [],
            totalCount: count || 0,
            hasMore: count > offset + limit
        })
    } catch (error) {
        console.error('Chatbots API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}