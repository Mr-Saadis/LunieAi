// app/api/upload/route.js - COMPLETE FIXED VERSION
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = process.env.NEXT_MAX_FILE_SIZE

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp'
]

export async function POST(request) {
  console.log('=== UPLOAD ROUTE START ===');
  
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
    console.log('Buffer created, size:', buffer.length)
    
    // Generate unique filename
    const timestamp = Date.now()
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
        source_url: fileName,
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

    // === PDF PROCESSING SECTION ===
    let processingResult = {
      processed: false,
      message: 'File uploaded successfully.'
    }

    // if (file.type === 'application/pdf') {
    //   console.log('=== PDF PROCESSING START ===')
    //   console.log('This is a PDF, attempting to process...')
      
    //   try {
    //     // Update status to processing
    //     await supabase
    //       .from('training_data')
    //       .update({ processing_status: 'processing' })
    //       .eq('id', trainingData.id)

    //     console.log('Status updated to processing')

    //     // Test if we can import the processor
    //     console.log('Attempting to import PDF processor...')
    //     const { processPDF } = await import('@/lib/processors/pdfProcessor')
    //     console.log('✅ PDF processor imported successfully')

    //     // Process PDF
    //     console.log('Starting PDF processing...')
    //     const pdfResult = await processPDF(buffer)
    //     console.log('PDF processing completed:', pdfResult.success)

    //     if (pdfResult.success) {
    //       console.log('✅ PDF processing successful!')
    //       console.log('- Text length:', pdfResult.text?.length || 0)
    //       // 🔧 FIX: Read wordCount from metadata, not directly from pdfResult
    //       console.log('- Word count:', pdfResult.metadata?.wordCount || 0)
    //       console.log('- Chunks created:', pdfResult.chunks?.length || 0)
    //       console.log('- Pages:', pdfResult.metadata?.pages || 0)

    //       // Update training data with processed content
    //       await supabase
    //         .from('training_data')
    //         .update({
    //           content: pdfResult.text,
    //           processing_status: 'completed',
    //           processed_at: new Date().toISOString(),
    //           chunk_count: pdfResult.chunks?.length || 0,
    //           metadata: pdfResult.metadata || {} // This includes wordCount
    //         })
    //         .eq('id', trainingData.id)

    //       // 🔧 OPTIONAL: Store chunks in content_chunks table
    //       if (pdfResult.chunks && pdfResult.chunks.length > 0) {
    //         const chunkInserts = pdfResult.chunks.map((chunk, index) => ({
    //           training_data_id: trainingData.id,
    //           content: chunk,
    //           chunk_index: index,
    //           metadata: { 
    //             page: Math.floor(index / 3) + 1,
    //             wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
    //           }
    //         }));

    //         const { error: chunkError } = await supabase
    //           .from('content_chunks')
    //           .insert(chunkInserts);
            
    //         if (chunkError) {
    //           console.error('⚠️ Warning: Failed to save chunks:', chunkError);
    //           // Don't fail the whole process for chunk errors
    //         } else {
    //           console.log('✅ Chunks saved to database');
    //         }
    //       }

    //       console.log('✅ Database updated with processed content')
          
    //       processingResult = {
    //         processed: true,
    //         chunks_created: pdfResult.chunks?.length || 0,
    //         // 🔧 FIX: Read wordCount from metadata
    //         word_count: pdfResult.metadata?.wordCount || 0,
    //         pages: pdfResult.metadata?.pages || 0,
    //         text_length: pdfResult.text?.length || 0,
    //         message: 'PDF uploaded and processed successfully!'
    //       }

    //     } else {
    //       console.error('❌ PDF processing failed:', pdfResult.error)
          
    //       // Update status to failed
    //       await supabase
    //         .from('training_data')
    //         .update({ 
    //           processing_status: 'failed',
    //           processing_error: pdfResult.error
    //         })
    //         .eq('id', trainingData.id)

    //       processingResult = {
    //         processed: false,
    //         error: pdfResult.error,
    //         message: 'File uploaded but PDF processing failed.'
    //       }
    //     }

    //   } catch (importError) {
    //     console.error('❌ Failed to import or use PDF processor:', importError)
    //     console.error('Full error:', importError)
        
    //     // Update status to failed
    //     await supabase
    //       .from('training_data')
    //       .update({ 
    //         processing_status: 'failed',
    //         processing_error: `Module error: ${importError.message}`
    //       })
    //       .eq('id', trainingData.id)

    //     processingResult = {
    //       processed: false,
    //       error: importError.message,
    //       message: 'File uploaded but PDF processing module failed.'
    //     }
    //   }
      
    //   console.log('=== PDF PROCESSING END ===')
    // } else {
    //   // Non-PDF files
    //   await supabase
    //     .from('training_data')
    //     .update({ processing_status: 'completed' })
    //     .eq('id', trainingData.id)
        
    //   processingResult = {
    //     processed: true,
    //     message: 'File uploaded successfully. Processing available for PDFs.'
    //   }
    // }


    // Add this to your upload route (app/api/upload/route.js)
// Update the PDF processing section to handle DOCX files too

    if (file.type === 'application/pdf') {
      console.log('=== PDF PROCESSING START ===')
      console.log('This is a PDF, attempting to process...')
      
      try {
        // Update status to processing
        await supabase
          .from('training_data')
          .update({ processing_status: 'processing' })
          .eq('id', trainingData.id)

        console.log('Status updated to processing')

        // Import and process PDF
        const { processPDF } = await import('@/lib/processors/pdfProcessor')
        console.log('✅ PDF processor imported successfully')

        const pdfResult = await processPDF(buffer)
        console.log('PDF processing completed:', pdfResult.success)

        if (pdfResult.success) {
          console.log('✅ PDF processing successful!')
          console.log('- Text length:', pdfResult.text?.length || 0)
          console.log('- Word count:', pdfResult.metadata?.wordCount || 0)
          console.log('- Chunks created:', pdfResult.chunks?.length || 0)
          console.log('- Pages:', pdfResult.metadata?.pages || 0)

          // Update training data with processed content
          await supabase
            .from('training_data')
            .update({
              content: pdfResult.text,
              processing_status: 'completed',
              processed_at: new Date().toISOString(),
              chunk_count: pdfResult.chunks?.length || 0,
              metadata: pdfResult.metadata || {}
            })
            .eq('id', trainingData.id)

          // Store chunks
          if (pdfResult.chunks && pdfResult.chunks.length > 0) {
            const chunkInserts = pdfResult.chunks.map((chunk, index) => ({
              training_data_id: trainingData.id,
              content: chunk,
              chunk_index: index,
              metadata: { 
                page: Math.floor(index / 3) + 1,
                wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
              }
            }));

            await supabase.from('content_chunks').insert(chunkInserts);
          }

          processingResult = {
            processed: true,
            chunks_created: pdfResult.chunks?.length || 0,
            word_count: pdfResult.metadata?.wordCount || 0,
            pages: pdfResult.metadata?.pages || 0,
            text_length: pdfResult.text?.length || 0,
            message: 'PDF uploaded and processed successfully!'
          }
        } else {
          // Handle PDF processing failure
          await supabase
            .from('training_data')
            .update({ 
              processing_status: 'failed',
              processing_error: pdfResult.error
            })
            .eq('id', trainingData.id)

          processingResult = {
            processed: false,
            error: pdfResult.error,
            message: 'File uploaded but PDF processing failed.'
          }
        }
      } catch (error) {
        console.error('❌ PDF processing error:', error)
        await supabase
          .from('training_data')
          .update({ 
            processing_status: 'failed',
            processing_error: error.message
          })
          .eq('id', trainingData.id)

        processingResult = {
          processed: false,
          error: error.message,
          message: 'File uploaded but PDF processing failed.'
        }
      }
      console.log('=== PDF PROCESSING END ===')
    } 
    // 🆕 ADD DOCX PROCESSING HERE
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('=== DOCX PROCESSING START ===')
      console.log('This is a DOCX file, attempting to process...')
      
      try {
        // Update status to processing
        await supabase
          .from('training_data')
          .update({ processing_status: 'processing' })
          .eq('id', trainingData.id)

        console.log('Status updated to processing')

        // Import and process DOCX
        const { processDocx } = await import('@/lib/processors/docxProcessor')
        console.log('✅ DOCX processor imported successfully')

        const docxResult = await processDocx(buffer)
        console.log('DOCX processing completed:', docxResult.success)

        if (docxResult.success) {
          console.log('✅ DOCX processing successful!')
          console.log('- Text length:', docxResult.text?.length || 0)
          console.log('- Word count:', docxResult.metadata?.wordCount || 0)
          console.log('- Chunks created:', docxResult.chunks?.length || 0)

          // Update training data with processed content
          await supabase
            .from('training_data')
            .update({
              content: docxResult.text,
              processing_status: 'completed',
              processed_at: new Date().toISOString(),
              chunk_count: docxResult.chunks?.length || 0,
              metadata: docxResult.metadata || {}
            })
            .eq('id', trainingData.id)

          // Store chunks
          if (docxResult.chunks && docxResult.chunks.length > 0) {
            const chunkInserts = docxResult.chunks.map((chunk, index) => ({
              training_data_id: trainingData.id,
              content: chunk,
              chunk_index: index,
              metadata: { 
                section: Math.floor(index / 3) + 1,
                wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
              }
            }));

            await supabase.from('content_chunks').insert(chunkInserts);
          }

          processingResult = {
            processed: true,
            chunks_created: docxResult.chunks?.length || 0,
            word_count: docxResult.metadata?.wordCount || 0,
            text_length: docxResult.text?.length || 0,
            message: 'DOCX uploaded and processed successfully!'
          }
        } else {
          // Handle DOCX processing failure
          await supabase
            .from('training_data')
            .update({ 
              processing_status: 'failed',
              processing_error: docxResult.error
            })
            .eq('id', trainingData.id)

          processingResult = {
            processed: false,
            error: docxResult.error,
            message: 'File uploaded but DOCX processing failed.'
          }
        }
      } catch (error) {
        console.error('❌ DOCX processing error:', error)
        await supabase
          .from('training_data')
          .update({ 
            processing_status: 'failed',
            processing_error: error.message
          })
          .eq('id', trainingData.id)

        processingResult = {
          processed: false,
          error: error.message,
          message: 'File uploaded but DOCX processing failed.'
        }
      }
      console.log('=== DOCX PROCESSING END ===')
    // Add this to your upload route after the DOCX processing section

    } 
    // 🆕 ADD XLSX PROCESSING HERE
    else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      console.log('=== XLSX PROCESSING START ===')
      console.log('This is an XLSX file, attempting to process...')
      
      try {
        // Update status to processing
        await supabase
          .from('training_data')
          .update({ processing_status: 'processing' })
          .eq('id', trainingData.id)

        console.log('Status updated to processing')

        // Import and process XLSX
        const { processXlsx } = await import('@/lib/processors/xlsxProcessor')
        console.log('✅ XLSX processor imported successfully')

        const xlsxResult = await processXlsx(buffer)
        console.log('XLSX processing completed:', xlsxResult.success)

        if (xlsxResult.success) {
          console.log('✅ XLSX processing successful!')
          console.log('- Text length:', xlsxResult.text?.length || 0)
          console.log('- Word count:', xlsxResult.metadata?.wordCount || 0)
          console.log('- Chunks created:', xlsxResult.chunks?.length || 0)
          console.log('- Sheets processed:', xlsxResult.metadata?.totalSheets || 0)

          // Update training data with processed content
          await supabase
            .from('training_data')
            .update({
              content: xlsxResult.text,
              processing_status: 'completed',
              processed_at: new Date().toISOString(),
              chunk_count: xlsxResult.chunks?.length || 0,
              metadata: xlsxResult.metadata || {}
            })
            .eq('id', trainingData.id)

          // Store chunks
          if (xlsxResult.chunks && xlsxResult.chunks.length > 0) {
            const chunkInserts = xlsxResult.chunks.map((chunk, index) => ({
              training_data_id: trainingData.id,
              content: chunk,
              chunk_index: index,
              metadata: { 
                sheet: Math.floor(index / 3) + 1,
                wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
              }
            }));

            await supabase.from('content_chunks').insert(chunkInserts);
          }

          processingResult = {
            processed: true,
            chunks_created: xlsxResult.chunks?.length || 0,
            word_count: xlsxResult.metadata?.wordCount || 0,
            sheets_processed: xlsxResult.metadata?.totalSheets || 0,
            text_length: xlsxResult.text?.length || 0,
            message: 'XLSX uploaded and processed successfully!'
          }
        } else {
          // Handle XLSX processing failure
          await supabase
            .from('training_data')
            .update({ 
              processing_status: 'failed',
              processing_error: xlsxResult.error
            })
            .eq('id', trainingData.id)

          processingResult = {
            processed: false,
            error: xlsxResult.error,
            message: 'File uploaded but XLSX processing failed.'
          }
        }
      } catch (error) {
        console.error('❌ XLSX processing error:', error)
        await supabase
          .from('training_data')
          .update({ 
            processing_status: 'failed',
            processing_error: error.message
          })
          .eq('id', trainingData.id)

        processingResult = {
          processed: false,
          error: error.message,
          message: 'File uploaded but XLSX processing failed.'
        }
      }
      console.log('=== XLSX PROCESSING END ===')
    }
    







    console.log('=== UPLOAD ROUTE END ===')

    // Return comprehensive response
    return NextResponse.json({
      id: trainingData.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      status: processingResult.processed ? 'completed' : 'failed',
      message: processingResult.message,
      processing: {
        ...processingResult
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ UPLOAD ERROR:', error)
    console.error('Full error stack:', error.stack)
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