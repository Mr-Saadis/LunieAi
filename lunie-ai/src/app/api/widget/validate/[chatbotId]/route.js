
// src/app/api/widget/validate/[chatbotId]/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { validateOrigin } from '@/utils/helpers'

/**
 * Validate widget access for specific origin
 */
export async function POST(request, { params }) {
  try {
    const { chatbotId } = await params
    const { origin } = await request.json()

    const supabase = createClient()

    // Check if chatbot exists and is active
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('allowed_domains, is_active')
      .eq('id', chatbotId)
      .eq('is_active', true)
      .single()

    if (error || !chatbot) {
      return NextResponse.json({ valid: false, reason: 'Chatbot not found' })
    }



    // Validate origin
    const isValidOrigin = validateOrigin(origin, chatbot.allowed_domains)

        // Development bypass add करें
if (origin.includes('localhost')) {
  return NextResponse.json({ valid: true })
}

    return NextResponse.json({ 
      valid: isValidOrigin,
      reason: isValidOrigin ? 'Valid' : 'Origin not allowed'
    })
  } catch (error) {
    console.error('Widget validation error:', error)
    return NextResponse.json({ valid: false, reason: 'Server error' })
  }
}
