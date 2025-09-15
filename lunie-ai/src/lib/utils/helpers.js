
// src/utils/helpers.js
/**
 * Utility functions for chat functionality
 */

/**
 * Generate unique session ID
 */
export function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce function for search/input
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(content) {
  const div = document.createElement('div')
  div.textContent = content
  return div.innerHTML
}

/**
 * Validate origin against allowed domains
 */
export function validateOrigin(origin, allowedDomains = []) {
  if (!allowedDomains.length) return true
  
  try {
    const url = new URL(origin)
    return allowedDomains.some(domain => {
      return url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    })
  } catch {
    return false
  }
}
