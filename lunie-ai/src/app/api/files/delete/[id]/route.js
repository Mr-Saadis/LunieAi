// app/api/files/delete/[id]/route.js
import { createRouteClient } from '@/lib/supabase/server'; // ✅ Keep your existing server.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    //  Await cookies and params, then pass to your existing function
    const cookieStore = await cookies();
    const { id: fileId } = await params;
    
    //  Use your existing createRouteClient function
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