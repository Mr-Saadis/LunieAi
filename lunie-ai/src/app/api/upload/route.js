// app/api/upload/route.js - COMPLETE FIXED VERSION
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = process.env.NEXT_MAX_FILE_SIZE

const ALLOWED_TYPES = [
  // 'application/pdf',
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // 'image/png',
  // 'image/jpeg',
  // 'image/webp'
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff'
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
    
    // Add this after the XLSX processing section in your upload route
// Replace your image processing section with this improved version:

// Find and REPLACE your image processing section with this:

// } else if (file.type.startsWith('image/')) {
//   console.log('=== FASTAPI OCR PROCESSING START ===')
//   console.log('This is an image file, attempting FastAPI OCR processing...')
  
//   try {
//     // Update status to processing
//     await supabase
//       .from('training_data')
//       .update({ processing_status: 'processing' })
//       .eq('id', trainingData.id)

//     console.log('Status updated to processing')

//     let imageResult;
    
//     // Try FastAPI OCR
//     try {
//       const { processFastApiOCR } = await import('@/lib/processors/fastApiOcrProcessor')
//       console.log('✅ FastAPI OCR processor imported successfully')

//       const language = formData.get('language') || 'eng';
//       const enhance = formData.get('enhance') !== 'false';
//       const enhancement_level = formData.get('enhancement_level') || 'medium';

//       imageResult = await processFastApiOCR(buffer, { 
//         language, 
//         enhance, 
//         enhancement_level,
//         chunk_text: true,
//         chunk_size: 800
//       })
//       console.log('FastAPI OCR processing completed:', imageResult.success)
      
//     } catch (ocrError) {
//       console.log('⚠️ FastAPI OCR failed, using fallback:', ocrError.message)
      
//       // Fallback to placeholder
//       imageResult = {
//         success: true,
//         text: `[IMAGE UPLOADED - FastAPI OCR Service Not Available]

// This image has been uploaded successfully but the FastAPI OCR service is not running.

// File: ${file.name}
// Size: ${(file.size / 1024).toFixed(1)} KB
// Type: ${file.type}
// Upload Time: ${new Date().toLocaleString()}

// To enable OCR text extraction:
// 1. Start the Python FastAPI OCR service on port 8002
// 2. Ensure all Python dependencies are installed
// 3. Verify Tesseract OCR is properly configured

// Service Status: ${ocrError.message}`,
//         chunks: [],
//         confidence: 0,
//         metadata: {
//           processingMethod: 'fallback_service_unavailable',
//           ocrAttempted: true,
//           error: ocrError.message,
//           serviceUrl: 'http://localhost:8002'
//         }
//       };
//     }

//     if (imageResult.success) {
//       console.log('✅ Image OCR processing successful!')
//       console.log('- Processing method:', imageResult.metadata?.processingMethod || 'fastapi_ocr')
//       console.log('- Text length:', imageResult.text?.length || 0)
//       console.log('- Confidence:', imageResult.confidence || 'N/A')
//       console.log('- Chunks created:', imageResult.chunks?.length || 0)
//       console.log('- Word count:', imageResult.metadata?.wordCount || 0)

//       // Update training data with processed content
//       await supabase
//         .from('training_data')
//         .update({
//           content: imageResult.text,
//           processing_status: 'completed',
//           processed_at: new Date().toISOString(),
//           chunk_count: imageResult.chunks?.length || 0,
//           metadata: imageResult.metadata || {}
//         })
//         .eq('id', trainingData.id)

//       // Store chunks
//       if (imageResult.chunks && imageResult.chunks.length > 0) {
//         const chunkInserts = imageResult.chunks.map((chunk, index) => ({
//           training_data_id: trainingData.id,
//           content: chunk,
//           chunk_index: index,
//           metadata: { 
//             confidence: imageResult.confidence || 0,
//             source_type: 'fastapi_ocr',
//             processingMethod: imageResult.metadata?.processingMethod || 'fastapi_ocr',
//             language: imageResult.metadata?.language || 'eng',
//             wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
//           }
//         }));

//         const { error: chunkError } = await supabase
//           .from('content_chunks')
//           .insert(chunkInserts);

//         if (chunkError) {
//           console.error('Warning: Failed to save chunks:', chunkError);
//         } else {
//           console.log('✅ Chunks saved to database');
//         }
//       }

//       processingResult = {
//         processed: true,
//         chunks_created: imageResult.chunks?.length || 0,
//         confidence: imageResult.confidence || 0,
//         processing_method: imageResult.metadata?.processingMethod || 'fastapi_ocr',
//         word_count: imageResult.metadata?.wordCount || 0,
//         text_length: imageResult.text?.length || 0,
//         language: imageResult.metadata?.language || 'eng',
//         enhanced: imageResult.metadata?.enhanced || false,
//         processing_time_ms: imageResult.metadata?.processingTimeMs || 0,
//         message: imageResult.confidence > 0 
//           ? `FastAPI OCR completed successfully! Confidence: ${imageResult.confidence.toFixed(1)}% (${imageResult.metadata?.wordCount || 0} words extracted)`
//           : 'Image processed (FastAPI OCR service configuration needed)'
//       }
//     } else {
//       // Handle processing failure
//       await supabase
//         .from('training_data')
//         .update({ 
//           processing_status: 'failed',
//           processing_error: imageResult.error
//         })
//         .eq('id', trainingData.id)

//       processingResult = {
//         processed: false,
//         error: imageResult.error,
//         processing_method: 'fastapi_ocr_failed',
//         message: 'FastAPI OCR processing failed.'
//       }
//     }
//   } catch (error) {
//     console.error('❌ Image processing error:', error)
//     await supabase
//       .from('training_data')
//       .update({ 
//         processing_status: 'failed',
//         processing_error: error.message
//       })
//       .eq('id', trainingData.id)

//     processingResult = {
//       processed: false,
//       error: error.message,
//       message: 'Image upload failed.'
//     }
//   }
//   console.log('=== FASTAPI OCR PROCESSING END ===')
// }



// Replace the image processing section in your app/api/upload/route.js
// Find this part and replace it:

} else if (file.type.startsWith('image/')) {
  console.log('=== DIRECT FASTAPI OCR PROCESSING START ===')
  console.log('This is an image file, attempting FastAPI OCR processing...')
  
  try {
    // Update status to processing
    await supabase
      .from('training_data')
      .update({ processing_status: 'processing' })
      .eq('id', trainingData.id)

    console.log('Status updated to processing')

    let imageResult;
    
    // 🆕 DIRECT FastAPI OCR - No separate processor needed
    try {
      console.log('🔍 Calling FastAPI OCR service directly...')
      
      // Get form parameters
      const method = formData.get('method') || 'auto';
      const language = formData.get('language') || 'auto';
      const enhance = formData.get('enhance') !== 'false';
      const postProcess = formData.get('post_process') !== 'false';
      
      console.log('📤 OCR Parameters:', { method, language, enhance, postProcess });

      // Create form data for Python service
      const ocrFormData = new FormData();
      const imageBlob = new Blob([buffer], { type: file.type });
      ocrFormData.append('file', imageBlob, file.name);
      ocrFormData.append('method', method === 'auto' ? 'easyocr' : method); // Force EasyOCR
      ocrFormData.append('language', language === 'auto' ? 'en' : language);
      ocrFormData.append('enhance', enhance.toString());
      ocrFormData.append('post_process', postProcess.toString());

      console.log('🚀 Sending request to FastAPI OCR...');

      // Call FastAPI OCR service
      const ocrResponse = await fetch('http://localhost:8002/ocr', {
        method: 'POST',
        body: ocrFormData,
      });

      console.log('📥 FastAPI OCR response status:', ocrResponse.status);

      if (!ocrResponse.ok) {
        throw new Error(`FastAPI OCR service error: ${ocrResponse.status} ${ocrResponse.statusText}`);
      }

      const ocrResult = await ocrResponse.json();
      console.log('✅ FastAPI OCR result received:', {
        success: ocrResult.success,
        method: ocrResult.method_used,
        confidence: ocrResult.confidence,
        textLength: ocrResult.text?.length || 0,
        wordCount: ocrResult.word_count
      });

      if (ocrResult.success) {
        // Create chunks from the text
        const chunks = [];
        if (ocrResult.text && ocrResult.text.trim()) {
          const chunkSize = 800;
          const words = ocrResult.text.split(/\s+/);
          let currentChunk = '';
          
          for (const word of words) {
            if ((currentChunk + ' ' + word).length > chunkSize && currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              currentChunk = currentChunk ? currentChunk + ' ' + word : word;
            }
          }
          
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
        }

        // Prepare enhanced metadata
        const enhancedMetadata = {
          enhanced: enhance,
          fileType: "image_fastapi_ocr",
          language: ocrResult.language || language,
          wordCount: ocrResult.word_count || 0,
          chunkCount: chunks.length,
          avgConfidence: ocrResult.confidence || 0,
          serviceMetadata: {
            file_size: buffer.length,
            original_filename: file.name,
            image_dimensions: [0, 0], // You can get this from the image if needed
            processed_dimensions: [0, 0],
            raw_text_length: ocrResult.text?.length || 0,
            processed_text_length: ocrResult.text?.length || 0,
            ocr_method: ocrResult.method_used || method,
            enhancement_applied: enhance,
            processing_time_ms: (ocrResult.processing_time || 0) * 1000
          },
          processingMethod: ocrResult.method_used || "fastapi_ocr",
          processingTimeMs: (ocrResult.processing_time || 0) * 1000,
          qualityReport: ocrResult.quality_report || null,
          pythonProcessingTime: ocrResult.processing_time || 0
        };

        imageResult = {
          success: true,
          text: ocrResult.text || '',
          chunks: chunks,
          confidence: ocrResult.confidence || 0,
          metadata: enhancedMetadata
        };

        console.log('✅ Image processing successful with FastAPI OCR!');
        
      } else {
        throw new Error(ocrResult.error || 'FastAPI OCR processing failed');
      }
      
    } catch (ocrError) {
      console.log('⚠️ FastAPI OCR failed, creating fallback response:', ocrError.message);
      
      // Fallback response when OCR service is not available
      imageResult = {
        success: true,
        text: `[IMAGE UPLOADED - OCR Service Error]

This image has been uploaded successfully but OCR processing failed.

File: ${file.name}
Size: ${formatFileSize(buffer.length)}
Type: ${file.type}
Upload Time: ${new Date().toLocaleString()}

Error: ${ocrError.message}

To fix OCR processing:
1. Ensure Python FastAPI service is running on port 8002
2. Check EasyOCR installation: pip install easyocr
3. Verify service health at: http://localhost:8002/health`,
        chunks: [],
        confidence: 0,
        metadata: {
          processingMethod: 'service_unavailable',
          ocrAttempted: true,
          error: ocrError.message,
          serviceUrl: 'http://localhost:8002/ocr',
          fileType: 'image_upload_fallback',
          wordCount: 0,
          enhanced: false
        }
      };
    }

    if (imageResult.success) {
      console.log('✅ Image OCR processing completed!');
      console.log('- Processing method:', imageResult.metadata?.processingMethod || 'unknown');
      console.log('- Text length:', imageResult.text?.length || 0);
      console.log('- Confidence:', imageResult.confidence || 'N/A');
      console.log('- Chunks created:', imageResult.chunks?.length || 0);
      console.log('- Word count:', imageResult.metadata?.wordCount || 0);

      // Update training data with processed content
      await supabase
        .from('training_data')
        .update({
          content: imageResult.text,
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
          chunk_count: imageResult.chunks?.length || 0,
          metadata: imageResult.metadata || {}
        })
        .eq('id', trainingData.id)

      // Store chunks if available
      if (imageResult.chunks && imageResult.chunks.length > 0) {
        const chunkInserts = imageResult.chunks.map((chunk, index) => ({
          training_data_id: trainingData.id,
          content: chunk,
          chunk_index: index,
          metadata: { 
            confidence: imageResult.confidence || 0,
            source_type: 'fastapi_ocr',
            processingMethod: imageResult.metadata?.processingMethod || 'fastapi_ocr',
            language: imageResult.metadata?.language || 'en',
            wordCount: chunk.split(/\s+/).filter(word => word.trim().length > 0).length
          }
        }));

        const { error: chunkError } = await supabase
          .from('content_chunks')
          .insert(chunkInserts);

        if (chunkError) {
          console.error('Warning: Failed to save chunks:', chunkError);
        } else {
          console.log('✅ Chunks saved to database');
        }
      }

      const isServiceAvailable = imageResult.metadata?.processingMethod !== 'service_unavailable';
      const confidence = imageResult.confidence || 0;

      processingResult = {
        processed: true,
        chunks_created: imageResult.chunks?.length || 0,
        confidence: confidence,
        processing_method: imageResult.metadata?.processingMethod || 'fastapi_ocr',
        word_count: imageResult.metadata?.wordCount || 0,
        text_length: imageResult.text?.length || 0,
        language: imageResult.metadata?.language || 'en',
        enhanced: imageResult.metadata?.enhanced || false,
        processing_time_ms: imageResult.metadata?.processingTimeMs || 0,
        service_available: isServiceAvailable,
        message: isServiceAvailable && confidence > 0 
          ? `FastAPI OCR completed successfully! Confidence: ${confidence.toFixed(1)}% (${imageResult.metadata?.wordCount || 0} words extracted)`
          : isServiceAvailable 
          ? 'Image processed with FastAPI OCR (low confidence - try a clearer image)'
          : 'Image uploaded (FastAPI OCR service needs configuration)'
      }
    } else {
      // Handle processing failure
      await supabase
        .from('training_data')
        .update({ 
          processing_status: 'failed',
          processing_error: imageResult.error || 'Unknown OCR error'
        })
        .eq('id', trainingData.id)

      processingResult = {
        processed: false,
        error: imageResult.error || 'OCR processing failed',
        processing_method: 'fastapi_ocr_failed',
        message: 'Image OCR processing failed.'
      }
    }
  } catch (error) {
    console.error('❌ Image processing error:', error)
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
      message: 'Image upload failed.'
    }
  }
  console.log('=== DIRECT FASTAPI OCR PROCESSING END ===')
}

// Helper function (add this at the top of your file)
function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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