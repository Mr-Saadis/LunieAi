
// lib/utils/api-helpers.js - API HELPER FUNCTIONS
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Custom error classes
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class PermissionError extends Error {
  constructor(message = 'Permission denied') {
    super(message)
    this.name = 'PermissionError'
  }
}

// Validation helper
export async function validateRequest(schema, body) {
  try {
    return schema.parse(body)
  } catch (error) {
    throw new ValidationError('Invalid request data', error.errors)
  }
}

// Authentication wrapper
export function withAuth(handler) {
  return async (request, context) => {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      }

      return handler(request, context, { user, supabase })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      }, { status: 500 })
    }
  }
}

// Error handling wrapper
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ValidationError) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR',
          details: error.details
        }, { status: 400 })
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'NOT_FOUND'
        }, { status: 404 })
      }

      if (error instanceof PermissionError) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'PERMISSION_DENIED'
        }, { status: 403 })
      }

      // Database errors
      if (error.code?.startsWith('PGRST')) {
        return NextResponse.json({
          success: false,
          error: 'Database operation failed',
          code: 'DATABASE_ERROR'
        }, { status: 500 })
      }

      // Generic error
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }, { status: 500 })
    }
  }
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map()

export function withRateLimit(options = {}) {
  const { limit = 100, windowMs = 15 * 60 * 1000 } = options // 100 requests per 15 minutes

  return function(handler) {
    return async (request, ...args) => {
      const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'anonymous'
      
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Clean up old entries
      for (const [key, data] of rateLimitMap.entries()) {
        if (data.resetTime < now) {
          rateLimitMap.delete(key)
        }
      }

      const userLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

      if (userLimit.resetTime < now) {
        userLimit.count = 1
        userLimit.resetTime = now + windowMs
      } else {
        userLimit.count++
      }

      rateLimitMap.set(ip, userLimit)

      if (userLimit.count > limit) {
        const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000)
        return NextResponse.json({
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          retryAfter
        }, { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, limit - userLimit.count).toString(),
            'X-RateLimit-Reset': Math.ceil(userLimit.resetTime / 1000).toString()
          }
        })
      }

      return handler(request, ...args)
    }
  }
}
