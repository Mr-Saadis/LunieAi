// app/api/process/pdf/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { processPDF } from '@/lib/processors/pdfProcessor';
import { createChunksWithMetadata } from '@/lib/utils/textChunking';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trainingDataId } = await request.json();

    if (!trainingDataId) {
      return NextResponse.json({ error: 'Training data ID required' }, { status: 400 });
    }

    // Get training data record
    const { data: trainingData, error: fetchError } = await supabase
      .from('training_data')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', trainingDataId)
      .eq('chatbots.user_id', user.id)
      .single();

    if (fetchError || !trainingData) {
      return NextResponse.json({ error: 'Training data not found' }, { status: 404 });
    }

    // Update status to processing
    await supabase
      .from('training_data')
      .update({ processing_status: 'processing' })
      .eq('id', trainingDataId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('training-files')
      .download(trainingData.source_url);

    if (downloadError) {
      await supabase
        .from('training_data')
        .update({ 
          processing_status: 'failed',
          processing_error: 'Failed to download file'
        })
        .eq('id', trainingDataId);
      
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Convert to buffer
    const buffer = await fileData.arrayBuffer();

    // Process PDF
    const result = await processPDF(Buffer.from(buffer));

    if (!result.success) {
      await supabase
        .from('training_data')
        .update({ 
          processing_status: 'failed',
          processing_error: result.error
        })
        .eq('id', trainingDataId);
      
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Create chunks with metadata
    const chunksWithMetadata = createChunksWithMetadata(
      result.text, 
      {
        source_type: 'pdf',
        total_pages: result.metadata.pages,
        word_count: result.wordCount
      }
    );

    // Update training data with processed content
    await supabase
      .from('training_data')
      .update({
        content: result.text,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        chunk_count: chunksWithMetadata.length,
        metadata: result.metadata
      })
      .eq('id', trainingDataId);

    // Store chunks in content_chunks table
    if (chunksWithMetadata.length > 0) {
      const chunkInserts = chunksWithMetadata.map(chunk => ({
        training_data_id: trainingDataId,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        metadata: chunk.metadata
      }));

      await supabase
        .from('content_chunks')
        .insert(chunkInserts);
    }

    return NextResponse.json({
      success: true,
      message: 'PDF processed successfully',
      chunks_created: chunksWithMetadata.length,
      word_count: result.wordCount,
      pages: result.metadata.pages
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Update status to failed
    if (trainingDataId) {
      await supabase
        .from('training_data')
        .update({ 
          processing_status: 'failed',
          processing_error: error.message
        })
        .eq('id', trainingDataId);
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}