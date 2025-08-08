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

    const { urls, chatbotId, crawlDepth, crawlFrequency, includeSubdomains } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 })
    }

    if (!chatbotId) {
      return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 })
    }

    // Check if user owns the chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, name')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    const results = []
    const errors = []

    // Process each URL
    for (const url of urls.slice(0, 50)) { // Limit to 50 URLs
      try {
        const trimmedUrl = url.trim()
        if (!trimmedUrl) continue

        // Validate URL format
        let parsedUrl
        try {
          parsedUrl = new URL(trimmedUrl)
        } catch (error) {
          errors.push({ url: trimmedUrl, error: 'Invalid URL format' })
          continue
        }

        const domain = parsedUrl.hostname

        // Check if this domain/URL already exists for this chatbot
        const { data: existingData } = await supabase
          .from('training_data')
          .select('id, source_url')
          .eq('chatbot_id', chatbotId)
          .eq('type', 'website')
          .or(`source_url.eq.${trimmedUrl},domain.eq.${domain}`)

        if (existingData && existingData.length > 0) {
          errors.push({ url: trimmedUrl, error: 'URL or domain already added' })
          continue
        }

        // Create training_data entry
        const trainingDataEntry = {
          chatbot_id: chatbotId,
          type: 'website',
          title: `Website: ${domain}`,
          source_url: trimmedUrl,
          domain: domain,
          crawl_frequency: crawlFrequency || 'weekly',
          crawl_status: 'pending',
          processing_status: 'pending',
          metadata: {
            crawlDepth: crawlDepth || 2,
            includeSubdomains: includeSubdomains || false,
            addedAt: new Date().toISOString()
          }
        }

        const { data: trainingData, error: insertError } = await supabase
          .from('training_data')
          .insert(trainingDataEntry)
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting training data:', insertError)
          errors.push({ url: trimmedUrl, error: 'Failed to save to database' })
          continue
        }

        // Create initial crawl log entry
        const { error: crawlLogError } = await supabase
          .from('website_crawl_logs')
          .insert({
            training_data_id: trainingData.id,
            status: 'in_progress',
            crawl_depth: crawlDepth || 2,
            metadata: {
              initialUrl: trimmedUrl,
              includeSubdomains: includeSubdomains || false
            }
          })

        if (crawlLogError) {
          console.error('Error creating crawl log:', crawlLogError)
        }

        results.push({
          id: trainingData.id,
          url: trimmedUrl,
          domain: domain,
          status: 'added'
        })

        // Here you would typically trigger the background crawling job
        // For now, we'll just mark it as pending
        console.log(`Website added for crawling: ${trimmedUrl}`)

      } catch (error) {
        console.error(`Error processing URL ${url}:`, error)
        errors.push({ url, error: error.message })
      }
    }

    // Return results
    return NextResponse.json({
      success: results.length > 0,
      message: `${results.length} website(s) added successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      results,
      errors,
      total: urls.length,
      successful: results.length,
      failed: errors.length
    })

  } catch (error) {
    console.error('Add website error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}