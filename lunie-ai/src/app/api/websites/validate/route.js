import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, chatbotId } = await request.json()

    if (!url || !chatbotId) {
      return NextResponse.json({ 
        isValid: false, 
        error: 'URL and chatbot ID are required' 
      }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch (error) {
      return NextResponse.json({
        isValid: false,
        error: 'Invalid URL format'
      })
    }

    // Check if user owns the chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Perform URL validation
    const validation = await validateUrl(url)
    
    return NextResponse.json(validation)

  } catch (error) {
    console.error('URL validation error:', error)
    return NextResponse.json({
      isValid: false,
      error: 'Validation failed',
      details: error.message
    }, { status: 500 })
  }
}

async function validateUrl(url) {
  const result = {
    isValid: false,
    url: url,
    title: null,
    description: null,
    robotsAllowed: null,
    sitemapFound: false,
    sitemapUrl: null,
    estimatedPages: null,
    error: null
  }

  try {
    const parsedUrl = new URL(url)
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`

    // Check if URL is accessible with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'RagBot/1.0 (+https://yourapp.com/bot)'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`
      return result
    }

    // Check content type
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) {
      result.error = 'URL does not point to an HTML page'
      return result
    }

    // Get page content
    const html = await response.text()
    
    // Extract title using regex (simple approach)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    result.title = titleMatch ? titleMatch[1].trim() : null

    // Extract description using regex
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    result.description = descMatch ? descMatch[1].trim() : null

    // Check robots.txt
    try {
      const robotsController = new AbortController()
      const robotsTimeoutId = setTimeout(() => robotsController.abort(), 5000)

      const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
        headers: {
          'User-Agent': 'RagBot/1.0 (+https://yourapp.com/bot)'
        },
        signal: robotsController.signal
      })

      clearTimeout(robotsTimeoutId)

      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text()
        result.robotsAllowed = checkRobotsAllowed(robotsText, parsedUrl.pathname)
      } else {
        result.robotsAllowed = true // No robots.txt means allowed
      }
    } catch (error) {
      result.robotsAllowed = true // Assume allowed if can't check
    }

    // Check for sitemap
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap.txt`
    ]

    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapController = new AbortController()
        const sitemapTimeoutId = setTimeout(() => sitemapController.abort(), 5000)

        const sitemapResponse = await fetch(sitemapUrl, {
          method: 'HEAD',
          signal: sitemapController.signal
        })
        
        clearTimeout(sitemapTimeoutId)

        if (sitemapResponse.ok) {
          result.sitemapFound = true
          result.sitemapUrl = sitemapUrl
          
          // Try to estimate pages from sitemap
          try {
            const sitemapGetResponse = await fetch(sitemapUrl)
            const sitemapContent = await sitemapGetResponse.text()
            result.estimatedPages = estimatePagesFromSitemap(sitemapContent)
          } catch (error) {
            // Ignore sitemap parsing errors
          }
          break
        }
      } catch (error) {
        // Continue to next sitemap URL
      }
    }

    // Basic content analysis
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = textContent.split(/\s+/).length

    if (wordCount < 50) {
      result.error = 'Page contains very little content'
      return result
    }

    result.isValid = true
    return result

  } catch (error) {
    if (error.name === 'AbortError') {
      result.error = 'Request timeout - website took too long to respond'
    } else {
      result.error = `Network error: ${error.message}`
    }
    return result
  }
}

function checkRobotsAllowed(robotsText, pathname) {
  const lines = robotsText.split('\n')
  let userAgentMatch = false
  let isAllowed = true

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase()
    
    if (trimmedLine.startsWith('user-agent:')) {
      const agent = trimmedLine.split(':')[1].trim()
      userAgentMatch = agent === '*' || agent.includes('ragbot')
    }
    
    if (userAgentMatch && trimmedLine.startsWith('disallow:')) {
      const disallowPath = trimmedLine.split(':')[1].trim()
      if (disallowPath === '/' || pathname.startsWith(disallowPath)) {
        isAllowed = false
      }
    }
    
    if (userAgentMatch && trimmedLine.startsWith('allow:')) {
      const allowPath = trimmedLine.split(':')[1].trim()
      if (pathname.startsWith(allowPath)) {
        isAllowed = true
      }
    }
  }

  return isAllowed
}

function estimatePagesFromSitemap(sitemapContent) {
  // Simple estimation - count <url> tags in XML sitemap
  const urlMatches = sitemapContent.match(/<url>/g)
  if (urlMatches) {
    return urlMatches.length
  }
  
  // For text sitemaps, count lines
  const lines = sitemapContent.split('\n').filter(line => 
    line.trim() && line.trim().startsWith('http')
  )
  return lines.length || null
}