// app/api/files/download/[id]/route.js

export async function GET(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get file info with ownership check
    const { data: fileData, error: fetchError } = await supabase
      .from('training_data')
      .select(`
        source_url, 
        title, 
        file_type,
        chatbots!inner(user_id)
      `)
      .eq('id', params.id)
      .eq('chatbots.user_id', user.id)
      .single();

    if (fetchError || !fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Download from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('training-files')
      .download(fileData.source_url);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }

    return new Response(fileBlob, {
      headers: {
        'Content-Type': fileData.file_type,
        'Content-Disposition': `attachment; filename="${fileData.title}"`
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
