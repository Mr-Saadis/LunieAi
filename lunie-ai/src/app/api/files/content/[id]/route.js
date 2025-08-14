// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request, { params }) {
//   const supabase = createRouteHandlerClient({ cookies })
//   const { id } = params
  
//   try {
//     // Get user
//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     // Fetch file content with ownership check
//     const { data, error } = await supabase
//       .from('training_data')
//       .select(`
//         id, 
//         content, 
//         title, 
//         processing_status,
//         chatbots!inner(user_id)
//       `)
//       .eq('id', id)
//       .eq('chatbots.user_id', user.id)
//       .single()

//     if (error || !data) {
//       return NextResponse.json({ error: 'File not found' }, { status: 404 })
//     }

//     return NextResponse.json({ 
//       content: data.content || 'No content available',
//       status: data.processing_status 
//     })
//   } catch (error) {
//     console.error('Error fetching file content:', error)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }




// app/api/files/content/[id]/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership and get content
    const { data: trainingData, error: selectError } = await supabase
      .from('training_data')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', id)
      .eq('chatbots.user_id', user.id)
      .single()

    if (selectError || !trainingData) {
      return NextResponse.json({ error: 'Training data not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      content: trainingData.content || 'No content available',
      metadata: trainingData.metadata || {},
      processing_status: trainingData.processing_status
    })

  } catch (error) {
    console.error('File content API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}