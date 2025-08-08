// URL Processing Utilities for Day 15

export const normalizeUrl = (url) => {
  try {
    const parsed = new URL(url)
    // Remove trailing slash
    parsed.pathname = parsed.pathname.replace(/\/$/, '') || '/'
    // Sort query parameters for consistency
    parsed.search = new URLSearchParams([...parsed.searchParams.entries()].sort()).toString()
    // Remove fragment
    parsed.hash = ''
    return parsed.toString()
  } catch (error) {
    return url
  }
}

export const extractDomain = (url) => {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch (error) {
    return null
  }
}

export const isSubdomain = (url, baseDomain) => {
  try {
    const parsed = new URL(url)
    return parsed.hostname.endsWith(baseDomain) && parsed.hostname !== baseDomain
  } catch (error) {
    return false
  }
}

export const isSameDomain = (url1, url2) => {
  try {
    const domain1 = new URL(url1).hostname
    const domain2 = new URL(url2).hostname
    return domain1 === domain2
  } catch (error) {
    return false
  }
}

export const shouldExcludeUrl = (url, excludePatterns = []) => {
  const lowercaseUrl = url.toLowerCase()
  
  // Common patterns to exclude
  const defaultExcludes = [
    '/admin/',
    '/wp-admin/',
    '/login',
    '/register',
    '/cart',
    '/checkout',
    '/account',
    '/dashboard',
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.css',
    '.js',
    '.xml',
    '.json',
    '/search',
    '/filter',
    '?page=',
    '&page=',
    '#'
  ]

  const allExcludes = [...defaultExcludes, ...excludePatterns]
  
  return allExcludes.some(pattern => lowercaseUrl.includes(pattern))
}

export const getRobotsTxtUrl = (baseUrl) => {
  try {
    const parsed = new URL(baseUrl)
    return `${parsed.protocol}//${parsed.hostname}/robots.txt`
  } catch (error) {
    return null
  }
}

export const getSitemapUrls = (baseUrl) => {
  try {
    const parsed = new URL(baseUrl)
    const base = `${parsed.protocol}//${parsed.hostname}`
    return [
      `${base}/sitemap.xml`,
      `${base}/sitemap_index.xml`,
      `${base}/sitemap.txt`,
      `${base}/wp-sitemap.xml` // WordPress
    ]
  } catch (error) {
    return []
  }
}

export const validateUrlFormat = (url) => {
  try {
    const parsed = new URL(url)
    
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' }
    }
    
    // Must have a hostname
    if (!parsed.hostname) {
      return { valid: false, error: 'URL must have a valid domain' }
    }
    
    // Check for localhost or private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase()
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          (hostname.startsWith('172.') && hostname.split('.')[1] >= 16 && hostname.split('.')[1] <= 31)) {
        return { valid: false, error: 'Private and localhost URLs are not allowed' }
      }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

export const categorizeUrl = (url, content = '') => {
  const lowercaseUrl = url.toLowerCase()
  const lowercaseContent = content.toLowerCase()
  
  // Homepage
  if (url.match(/^https?:\/\/[^\/]+\/?$/)) {
    return 'homepage'
  }
  
  // Blog/News
  if (lowercaseUrl.includes('/blog/') || 
      lowercaseUrl.includes('/news/') || 
      lowercaseUrl.includes('/article/') ||
      lowercaseContent.includes('published') ||
      lowercaseContent.includes('author')) {
    return 'blog'
  }
  
  // Product pages
  if (lowercaseUrl.includes('/product/') || 
      lowercaseUrl.includes('/item/') ||
      lowercaseContent.includes('price') ||
      lowercaseContent.includes('add to cart')) {
    return 'product'
  }
  
  // About/Company pages
  if (lowercaseUrl.includes('/about') || 
      lowercaseUrl.includes('/company') ||
      lowercaseUrl.includes('/team')) {
    return 'about'
  }
  
  // Contact pages
  if (lowercaseUrl.includes('/contact') || 
      lowercaseUrl.includes('/support')) {
    return 'contact'
  }
  
  // Documentation
  if (lowercaseUrl.includes('/docs/') || 
      lowercaseUrl.includes('/documentation/') ||
      lowercaseUrl.includes('/help/') ||
      lowercaseUrl.includes('/guide/')) {
    return 'documentation'
  }
  
  // FAQ
  if (lowercaseUrl.includes('/faq') || 
      lowercaseContent.includes('frequently asked')) {
    return 'faq'
  }
  
  return 'general'
}

export const estimateContentValue = (url, content, title = '') => {
  let score = 1 // Base score
  
  const wordCount = content.trim().split(/\s+/).length
  
  // Word count scoring
  if (wordCount > 500) score += 2
  else if (wordCount > 200) score += 1
  else if (wordCount < 50) score -= 2
  
  // URL patterns that typically have valuable content
  const valuablePatterns = ['/about', '/services', '/products', '/blog/', '/help/', '/docs/']
  if (valuablePatterns.some(pattern => url.toLowerCase().includes(pattern))) {
    score += 2
  }
  
  // Low-value patterns
  const lowValuePatterns = ['/tag/', '/category/', '/archive/', '/search']
  if (lowValuePatterns.some(pattern => url.toLowerCase().includes(pattern))) {
    score -= 1
  }
  
  // Title quality
  if (title && title.length > 10 && title.length < 100) {
    score += 1
  }
  
  // Content quality indicators
  if (content.includes('contact us') || 
      content.includes('learn more') || 
      content.includes('our services')) {
    score += 1
  }
  
  return Math.max(1, Math.min(10, score)) // Clamp between 1-10
}