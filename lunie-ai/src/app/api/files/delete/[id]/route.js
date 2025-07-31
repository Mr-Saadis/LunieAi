// // app/api/files/delete/[id]/route.js
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { NextResponse } from 'next/server';

// export async function DELETE(request, { params }) {
//   const supabase = createRouteHandlerClient({ cookies });
  
//   try {
//     // Get user authentication
//     const { data: { user }, error: authError } = await supabase.auth.getUser();
//     if (authError || !user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const fileId = params.id;

//     // Step 1: Get file information before deletion
//     const { data: fileData, error: fetchError } = await supabase
//       .from('training_data')
//       .select('source_url, chatbot_id, title')
//       .eq('id', fileId)
//       .single();

//     if (fetchError || !fileData) {
//       return NextResponse.json({ error: 'File not found' }, { status: 404 });
//     }

//     // Step 2: Delete from Supabase Storage
//     const { error: storageError } = await supabase.storage
//       .from('training-files')
//       .remove([fileData.source_url]);

//     if (storageError) {
//       console.error('Storage deletion error:', storageError);
//       // Continue with database deletion even if storage fails
//     }

//     // Step 3: Delete related content chunks (if you have this table)
//     const { error: chunksError } = await supabase
//       .from('content_chunks')
//       .delete()
//       .eq('training_data_id', fileId);

//     if (chunksError) {
//       console.error('Chunks deletion error:', chunksError);
//       // Continue even if chunks deletion fails
//     }

//     // Step 4: Delete from training_data table
//     const { error: dbError } = await supabase
//       .from('training_data')
//       .delete()
//       .eq('id', fileId);

//     if (dbError) {
//       return NextResponse.json({ error: 'Database deletion failed' }, { status: 500 });
//     }

//     // Step 5: Update chatbot's training status (optional)
//     try {
//       await updateChatbotTrainingStatus(fileData.chatbot_id, supabase);
//     } catch (updateError) {
//       console.error('Failed to update chatbot status:', updateError);
//       // Don't fail the whole operation for this
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `File "${fileData.title}" deleted successfully`,
//       deleted_from: ['storage', 'database', 'chunks']
//     });

//   } catch (error) {
//     console.error('Delete operation failed:', error);
//     return NextResponse.json({ 
//       error: 'Internal server error',
//       details: error.message 
//     }, { status: 500 });
//   }
// }

// // Helper function to update chatbot training status
// async function updateChatbotTrainingStatus(chatbotId, supabase) {
//   try {
//     // Check if chatbot still has training data
//     const { data: remainingData } = await supabase
//       .from('training_data')
//       .select('id')
//       .eq('chatbot_id', chatbotId);
    
//     // Update chatbot status based on remaining training data
//     await supabase
//       .from('chatbots')
//       .update({
//         updated_at: new Date().toISOString()
//         // Add other fields if needed, like:
//         // has_training_data: remainingData && remainingData.length > 0,
//       })
//       .eq('id', chatbotId);
//   } catch (error) {
//     console.error('Error updating chatbot status:', error);
//     // Don't throw error, just log it
//   }
// }


// app/api/files/delete/[id]/route.js
import { createRouteClient } from '@/lib/supabase/server'; // ✅ Keep your existing server.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    // ✅ Await cookies and params, then pass to your existing function
    const cookieStore = await cookies();
    const { id: fileId } = await params;
    
    // ✅ Use your existing createRouteClient function
    const supabase = createRouteClient(() => cookieStore);

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rest of your delete logic...
    const { data: fileData, error: fetchError } = await supabase
      .from('training_data')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', fileId)
      .eq('chatbots.user_id', user.id)
      .single();

    if (fetchError || !fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage
    if (fileData.file_path) {
      await supabase.storage
        .from('training-files')
        .remove([fileData.file_path]);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('training_data')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      return NextResponse.json({ error: 'Database deletion failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}