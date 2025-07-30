import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp'
]

export async function POST(request) {
  try {
    // Properly await cookies and create supabase client
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file')
    const chatbotId = formData.get('chatbotId')

    console.log('File upload request:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type, 
      chatbotId 
    })

    // Validate inputs
    if (!file || !chatbotId) {
      return NextResponse.json({ 
        error: 'Missing required fields: file and chatbotId' 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Verify chatbot ownership
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, name')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      console.error('Chatbot verification error:', chatbotError)
      return NextResponse.json({ 
        error: 'Chatbot not found or access denied' 
      }, { status: 403 })
    }

    console.log('Chatbot verified:', chatbot.name)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${user.id}/${chatbotId}/${timestamp}-${sanitizedName}`

    console.log('Uploading to storage:', fileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('training-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: `Failed to upload file to storage: ${uploadError.message}` 
      }, { status: 500 })
    }

    console.log('File uploaded to storage successfully')

    // Save file metadata to database
    const { data: trainingData, error: dbError } = await supabase
      .from('training_data')
      .insert({
        chatbot_id: chatbotId,
        type: 'file',
        title: file.name,
        source_url: fileName, // Store the storage path
        file_size: file.size,
        file_type: file.type,
        processing_status: 'pending',
        created_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Cleanup: delete uploaded file from storage
      await supabase.storage
        .from('training-files')
        .remove([fileName])
      
      return NextResponse.json({ 
        error: `Failed to save file metadata: ${dbError.message}` 
      }, { status: 500 })
    }

    console.log('File metadata saved to database:', trainingData.id)

    // Return success response
    return NextResponse.json({
      id: trainingData.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      status: 'pending',
      message: 'File uploaded successfully. Processing will begin shortly.'
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: `Internal server error: ${error.message}` 
    }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}