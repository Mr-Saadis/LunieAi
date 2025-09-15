// // src/app/api/widget/config/[chatbotId]/route.js
// import { NextResponse } from 'next/server'
// // import { createClient } from '@/lib/supabase/client'
// import { validateOrigin } from '@/utils/helpers'


import { createClient } from '@supabase/supabase-js'

// And initialize manually:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for API routes
)


// /**
//  * Get widget configuration for embedding
//  * Validates origin and returns public chatbot config
//  */
// export async function GET(request, { params }) {
//   try {
//     const { chatbotId } = await params
//     const origin = request.headers.get('origin')
//     const authorization = request.headers.get('authorization')

//     // Initialize Supabase client
//     // const supabase = createClient()

//     // Fetch chatbot configuration
//     const { data: chatbot, error } = await supabase
//       .from('chatbots')
//       .select(`
//         id,
//         name,
//         description,
//         is_active,
//         widget_config,
//         allowed_domains,
//         api_key,
//         user_id
//       `)
//       .eq('id', chatbotId)
//       .eq('is_active', true)
//       .single()

//     if (error || !chatbot) {
//       return NextResponse.json(
//         { error: 'Chatbot not found or inactive' },
//         { status: 404 }
//       )
//     }

//     // Validate API key if provided
//     if (authorization) {
//       const apiKey = authorization.replace('Bearer ', '')
//       if (apiKey !== chatbot.api_key) {
//         return NextResponse.json(
//           { error: 'Invalid API key' },
//           { status: 401 }
//         )
//       }
//     }

//     // Validate origin against allowed domains
//     // if (origin && !validateOrigin(origin, chatbot.allowed_domains)) {
//     //   return NextResponse.json(
//     //     { error: 'Origin not allowed' },
//     //     { status: 403 }
//     //   )
//     // }


//     // Line 45 ke baad add karें:
// // Development bypass for localhost
// if (origin && origin.includes('localhost')) {
//   console.log('Development mode: Allowing localhost origin')
// } else if (origin && !validateOrigin(origin, chatbot.allowed_domains)) {
//   return NextResponse.json(
//     { error: 'Origin not allowed' },
//     { status: 403 }
//   )
// }


//     // Return public widget configuration
//     const widgetConfig = {
//       chatbotId: chatbot.id,
//       name: chatbot.name,
//       description: chatbot.description,
//       ...chatbot.widget_config,
//       // Default settings if not configured
//       position: chatbot.widget_config?.position || 'bottom-right',
//       theme: chatbot.widget_config?.theme || 'default',
//       primaryColor: chatbot.widget_config?.primaryColor || '#3B82F6',
//       welcomeMessage: chatbot.widget_config?.welcomeMessage || 'Hi! How can I help you today?',
//       placeholder: chatbot.widget_config?.placeholder || 'Type your message...',
//       showPoweredBy: chatbot.widget_config?.showPoweredBy ?? true,
//       maxHeight: chatbot.widget_config?.maxHeight || '500px',
//       maxWidth: chatbot.widget_config?.maxWidth || '400px'
//     }

//     return NextResponse.json(widgetConfig)
//   } catch (error) {
//     console.error('Widget config error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }



// src/app/api/widget/config/[chatbotId]/route.js
import { NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase/client'

/**
 * GET /api/widget/config/[chatbotId]
 * Returns chatbot configuration for widget initialization
 * Public endpoint - no authentication required for widget functionality
 */
export async function GET(request, { params }) {
  try {
    // Extract chatbot ID from params (Next.js 15+ requires await)
    const { chatbotId } = await params
    
    // Get origin for security logging (optional)
    const origin = request.headers.get('origin') || 'unknown'
    
    console.log(`Widget config request: ${chatbotId} from ${origin}`)

    // Initialize Supabase client
    // const supabase = createClient()

    // Query chatbot configuration
    // Note: This is a public endpoint, only fetch safe public data
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select(`
        id,
        name,
        description,
        theme_color,
        welcome_message,
        chat_icon_url,
        is_active
      `)
      .eq('id', chatbotId)
      .eq('is_active', true)
      .single()

    // Handle database errors
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: 'Chatbot not found or inactive',
          code: 'CHATBOT_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Handle case where chatbot doesn't exist
    if (!chatbot) {
      console.warn(`Chatbot not found: ${chatbotId}`)
      return NextResponse.json(
        { 
          error: 'Chatbot not found or inactive',
          code: 'CHATBOT_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Build widget configuration response
    const widgetConfig = {
      // Basic identification
      chatbotId: chatbot.id,
      name: chatbot.name,
      description: chatbot.description,
      
      // Visual customization
      primaryColor: chatbot.theme_color || '#3B82F6',
      theme_color: chatbot.theme_color || '#3B82F6', // Backward compatibility
      
      // Messaging
      welcomeMessage: chatbot.welcome_message || 'Hi! How can I help you today?',
      welcome_message: chatbot.welcome_message || 'Hi! How can I help you today?', // Backward compatibility
      
      // Custom branding
      chat_icon_url: chatbot.chat_icon_url,
      customIconUrl: chatbot.chat_icon_url, // Widget expects this property name
      
      // Default widget settings (can be overridden by embed config)
      position: 'bottom-right',
      placeholder: 'Type your message...',
      showPoweredBy: true,
      maxHeight: '500px',
      maxWidth: '400px',
      
      // Metadata
      isActive: chatbot.is_active,
      fetchedAt: new Date().toISOString()
    }

    console.log(`Widget config served for: ${chatbot.name} (${chatbotId})`)
    
    // Return successful response with CORS headers
    const response = NextResponse.json(widgetConfig)
    
    // Add CORS headers for widget embedding
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Origin')
    
    return response

  } catch (error) {
    console.error('Widget config API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch widget configuration'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/widget/config/[chatbotId]
 * Handle CORS preflight requests for cross-origin widget embedding
 */
// export async function OPTIONS(request) {
//   return new Response(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Origin',
//       'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
//     },
//   })
// }

/**
 * Alternative implementation with enhanced security
 * Uncomment this section if you want domain-based access control
 */

/*
// src/app/api/widget/config/[chatbotId]/route.js - SECURE VERSION
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { validateOrigin } from '@/utils/helpers'

export async function GET(request, { params }) {
  try {
    const { chatbotId } = await params
    const origin = request.headers.get('origin')
    const supabase = createClient()

    // First, get chatbot with allowed domains
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select(`
        id,
        name,
        description,
        theme_color,
        welcome_message,
        chat_icon_url,
        allowed_domains,
        is_active
      `)
      .eq('id', chatbotId)
      .eq('is_active', true)
      .single()

    if (error || !chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found or inactive' },
        { status: 404 }
      )
    }

    // Validate origin against allowed domains
    if (origin && !validateOrigin(origin, chatbot.allowed_domains)) {
      console.warn(`Access denied for origin: ${origin}`)
      return NextResponse.json(
        { error: 'Access denied for this domain' },
        { status: 403 }
      )
    }

    // Remove sensitive data before sending response
    const { allowed_domains, ...publicConfig } = chatbot

    const widgetConfig = {
      ...publicConfig,
      primaryColor: chatbot.theme_color || '#3B82F6',
      welcomeMessage: chatbot.welcome_message || 'Hi! How can I help you today?',
      customIconUrl: chatbot.chat_icon_url,
      position: 'bottom-right',
      placeholder: 'Type your message...',
      showPoweredBy: true,
      maxHeight: '500px',
      maxWidth: '400px'
    }

    const response = NextResponse.json(widgetConfig)
    
    // Set CORS headers for allowed origins only
    if (origin && validateOrigin(origin, chatbot.allowed_domains)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Origin')
    
    return response

  } catch (error) {
    console.error('Widget config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
*/