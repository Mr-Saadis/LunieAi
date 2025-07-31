
// ===========================================
// app/api/files/[id]/route.js
// ===========================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = params.id;

    // Get file information with ownership check
    const { data: file, error } = await supabase
      .from('training_data')
      .select(`
        *,
        chatbots!inner(user_id)
      `)
      .eq('id', fileId)
      .eq('chatbots.user_id', user.id)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}