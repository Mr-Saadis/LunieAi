// app/api/chatbots/route.js - REFACTORED VERSION
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withErrorHandling, validateRequest } from '@/lib/utils/api-helpers'
import { createChatbotSchema } from '@/lib/validations/api'
import { PLAN_LIMITS } from '@/lib/utils/constants'
import { getUserProfile, getUserChatbots } from '@/lib/supabase/queries'
import { createChatbot } from '@/lib/supabase/mutations'
import { sanitizeText } from '@/lib/utils/sanitize'

// Validation schemas
const getChatbotsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  search: z.string().max(100).default(''),
  sort: z.enum(['name', 'created_at', 'updated_at']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  filter: z.enum(['all', 'active', 'inactive']).default('all')
})

// Helper function to safely parse query parameters
function parseQueryParams(searchParams) {
  return {
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || undefined,
    order: searchParams.get('order') || undefined,
    filter: searchParams.get('filter') || undefined
  }
}

// GET /api/chatbots - Fetch user's chatbots with filtering and pagination
export const GET = withAuth(withErrorHandling(async (request, context, { user, supabase }) => {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate and sanitize query parameters
    const rawParams = parseQueryParams(searchParams)
    const validatedParams = getChatbotsSchema.parse(rawParams)
    
    // Sanitize search input
    const sanitizedSearch = validatedParams.search 
      ? sanitizeText(validatedParams.search) 
      : ''

    // Build query
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
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order(validatedParams.sort, { ascending: validatedParams.order === 'asc' })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1)

    // Apply search filter
    if (sanitizedSearch) {
      query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
    }

    // Apply status filter
    if (validatedParams.filter === 'active') {
      query = query.eq('is_active', true)
    } else if (validatedParams.filter === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Chatbots fetch error:', error)
      throw new Error('Failed to fetch chatbots')
    }

    // Calculate pagination info
    const totalCount = count || 0
    const hasMore = totalCount > validatedParams.offset + validatedParams.limit
    const totalPages = Math.ceil(totalCount / validatedParams.limit)
    const currentPage = Math.floor(validatedParams.offset / validatedParams.limit) + 1

    return NextResponse.json({
      success: true,
      data: {
        chatbots: data || [],
        pagination: {
          total: totalCount,
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          hasMore,
          totalPages,
          currentPage
        },
        filters: {
          search: sanitizedSearch,
          sort: validatedParams.sort,
          order: validatedParams.order,
          filter: validatedParams.filter
        }
      }
    })

  } catch (error) {
    console.error('Chatbots GET API error:', error)
    throw error
  }
}))

// POST /api/chatbots - Create new chatbot
export const POST = withAuth(withErrorHandling(async (request, context, { user, supabase }) => {
  try {
    const body = await request.json()
    
    // Validate input data
    const validatedData = await validateRequest(createChatbotSchema, body)
    
    // Sanitize text inputs
    const sanitizedData = {
      ...validatedData,
      name: sanitizeText(validatedData.name),
      description: validatedData.description ? sanitizeText(validatedData.description) : null,
      instructions: validatedData.instructions ? sanitizeText(validatedData.instructions) : null
    }

    // Check user's plan limits
    const profile = await getUserProfile(user.id)
    const { chatbots: existingChatbots } = await getUserChatbots(user.id, { limit: 1000 })
    
    const planLimits = PLAN_LIMITS[profile.subscription_plan] || PLAN_LIMITS.free
    
    if (planLimits.chatbots !== -1 && existingChatbots.length >= planLimits.chatbots) {
      return NextResponse.json({
        success: false,
        error: `Plan limit reached. Your ${profile.subscription_plan} plan allows ${planLimits.chatbots} chatbot${planLimits.chatbots !== 1 ? 's' : ''}. Upgrade to create more.`,
        code: 'PLAN_LIMIT_EXCEEDED'
      }, { status: 403 })
    }

    // Check for duplicate names (case-insensitive)
    const { data: existingChatbot } = await supabase
      .from('chatbots')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', sanitizedData.name)
      .single()

    if (existingChatbot) {
      return NextResponse.json({
        success: false,
        error: 'A chatbot with this name already exists',
        code: 'DUPLICATE_NAME'
      }, { status: 409 })
    }

    // Create the chatbot
    const newChatbot = await createChatbot(user.id, sanitizedData)

    return NextResponse.json({
      success: true,
      data: newChatbot,
      message: 'Chatbot created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Chatbots POST API error:', error)
    throw error
  }
}))

// PUT /api/chatbots - Bulk operations (optional)
export const PUT = withAuth(withErrorHandling(async (request, context, { user, supabase }) => {
  try {
    const body = await request.json()
    
    const bulkUpdateSchema = z.object({
      action: z.enum(['activate', 'deactivate', 'delete']),
      chatbotIds: z.array(z.string().uuid()).min(1).max(50)
    })

    const { action, chatbotIds } = bulkUpdateSchema.parse(body)

    // Verify ownership of all chatbots
    const { data: ownedChatbots, error: verifyError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('user_id', user.id)
      .in('id', chatbotIds)

    if (verifyError) {
      throw new Error('Failed to verify chatbot ownership')
    }

    if (ownedChatbots.length !== chatbotIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Some chatbots not found or access denied',
        code: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    let result
    switch (action) {
      case 'activate':
        result = await supabase
          .from('chatbots')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .in('id', chatbotIds)
          .select()
        break
        
      case 'deactivate':
        result = await supabase
          .from('chatbots')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .in('id', chatbotIds)
          .select()
        break
        
      case 'delete':
        // Note: This will cascade delete related data due to foreign key constraints
        result = await supabase
          .from('chatbots')
          .delete()
          .in('id', chatbotIds)
        break
        
      default:
        throw new Error('Invalid action')
    }

    if (result.error) {
      throw new Error(`Failed to ${action} chatbots: ${result.error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        affectedCount: action === 'delete' ? chatbotIds.length : result.data?.length || 0,
        chatbotIds
      },
      message: `Successfully ${action}d ${chatbotIds.length} chatbot${chatbotIds.length !== 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('Chatbots PUT API error:', error)
    throw error
  }
}))

// DELETE /api/chatbots - Bulk delete (alternative endpoint)
export const DELETE = withAuth(withErrorHandling(async (request, context, { user, supabase }) => {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotIds = searchParams.get('ids')?.split(',') || []

    if (chatbotIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No chatbot IDs provided',
        code: 'MISSING_IDS'
      }, { status: 400 })
    }

    // Validate UUID format
    const uuidSchema = z.array(z.string().uuid())
    const validatedIds = uuidSchema.parse(chatbotIds)

    // Verify ownership
    const { data: ownedChatbots, error: verifyError } = await supabase
      .from('chatbots')
      .select('id, name')
      .eq('user_id', user.id)
      .in('id', validatedIds)

    if (verifyError) {
      throw new Error('Failed to verify chatbot ownership')
    }

    if (ownedChatbots.length !== validatedIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Some chatbots not found or access denied',
        code: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    // Delete chatbots (cascades to related data)
    const { error: deleteError } = await supabase
      .from('chatbots')
      .delete()
      .in('id', validatedIds)

    if (deleteError) {
      throw new Error(`Failed to delete chatbots: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: validatedIds.length,
        deletedChatbots: ownedChatbots.map(cb => ({ id: cb.id, name: cb.name }))
      },
      message: `Successfully deleted ${validatedIds.length} chatbot${validatedIds.length !== 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('Chatbots DELETE API error:', error)
    throw error
  }
}))

// Rate limiting configuration for this endpoint
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}