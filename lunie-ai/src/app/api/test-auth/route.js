// src/app/api/test-auth/route.js
/**
 * Simple auth test route to get token for Postman testing
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET route - No auth required, just test connection
export async function GET() {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}

// POST route - Login and get token
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Return user data and token
    return NextResponse.json({
      user: data.user,
      session: data.session,
      token: data.session?.access_token,
      instructions: 'Use this token in Authorization header as: Bearer YOUR_TOKEN'
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}