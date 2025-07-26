
// src/lib/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR')
    this.field = field
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export class PermissionError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'PERMISSION_ERROR')
    this.name = 'PermissionError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export const handleError = (error) => {
  console.error('Application Error:', error)
  
  // Return user-friendly error messages
  if (error instanceof ValidationError) {
    return {
      type: 'validation',
      message: error.message,
      field: error.field
    }
  }
  
  if (error instanceof AuthError) {
    return {
      type: 'auth',
      message: error.message
    }
  }
  
  if (error instanceof PermissionError) {
    return {
      type: 'permission', 
      message: error.message
    }
  }
  
  if (error instanceof NotFoundError) {
    return {
      type: 'not_found',
      message: error.message
    }
  }
  
  if (error instanceof RateLimitError) {
    return {
      type: 'rate_limit',
      message: error.message
    }
  }
  
  // Default error
  return {
    type: 'internal',
    message: 'An unexpected error occurred. Please try again.'
  }
}
