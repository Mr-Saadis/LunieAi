// lunie-ai/src/app/api/cleanup-temp-uploads/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * POST /api/cleanup-temp-uploads
 * Cleans up temporary uploaded files when user abandons chatbot creation
 */
export async function POST(request) {
  console.log('=== CLEANUP TEMP UPLOADS API START ===')
  
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error in cleanup:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { paths } = await request.json()
    
    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Invalid paths array' }, { status: 400 })
    }

    console.log('Cleaning up temporary files:', { userId: user.id, paths })

    // Validate that all paths belong to the authenticated user
    const validPaths = paths.filter(path => {
      if (typeof path !== 'string') return false
      
      // Check if path follows pattern: temp/{user_id}/{session_id}/{filename}
      const pathParts = path.split('/')
      return pathParts.length >= 3 && 
             pathParts[0] === 'temp' && 
             pathParts[1] === user.id
    })

    if (validPaths.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No valid paths to clean up',
        cleaned: 0 
      })
    }

    // Delete files from storage
    const { data: deleteResults, error: deleteError } = await supabase.storage
      .from('chatbot-icons')
      .remove(validPaths)

    if (deleteError) {
      console.error('Error deleting temporary files:', deleteError)
      // Don't throw error - cleanup is best effort
    }

    console.log('Cleanup completed:', {
      requested: paths.length,
      validated: validPaths.length,
      deleted: deleteResults?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'Temporary files cleaned up successfully',
      cleaned: validPaths.length
    })

  } catch (error) {
    console.error('Unexpected error in cleanup:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during cleanup'
    }, { status: 500 })
  }
}

/**
 * GET /api/cleanup-temp-uploads
 * Scheduled cleanup for old temporary files (can be called by cron job)
 */
export async function GET(request) {
  console.log('=== SCHEDULED CLEANUP START ===')
  
  try {
    // Create Supabase client with service role for admin access
    const supabase = createRouteHandlerClient({ 
      cookies: async () => new Map() 
    })

    // Get current timestamp
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago

    // List all files in temp folder
    const { data: tempFiles, error: listError } = await supabase.storage
      .from('chatbot-icons')
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing temp files:', listError)
      return NextResponse.json({ error: 'Failed to list temp files' }, { status: 500 })
    }

    if (!tempFiles || tempFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No temporary files to clean up',
        cleaned: 0
      })
    }

    // Filter files older than 1 hour
    const oldFiles = tempFiles.filter(file => {
      const fileDate = new Date(file.created_at)
      return fileDate < oneHourAgo
    })

    if (oldFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No old temporary files found',
        cleaned: 0
      })
    }

    // Prepare file paths for deletion
    const filePaths = oldFiles.map(file => `temp/${file.name}`)

    // Delete old temporary files
    const { data: deleteResults, error: deleteError } = await supabase.storage
      .from('chatbot-icons')
      .remove(filePaths)

    if (deleteError) {
      console.error('Error deleting old temp files:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete old temp files' 
      }, { status: 500 })
    }

    console.log('Scheduled cleanup completed:', {
      totalTempFiles: tempFiles.length,
      oldFiles: oldFiles.length,
      deleted: deleteResults?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'Old temporary files cleaned up successfully',
      cleaned: oldFiles.length,
      totalTempFiles: tempFiles.length
    })

  } catch (error) {
    console.error('Unexpected error in scheduled cleanup:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during scheduled cleanup'
    }, { status: 500 })
  }
}