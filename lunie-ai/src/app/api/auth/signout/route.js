// src/app/api/auth/signout/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })


  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Signed out successfully' })
  } catch (error) {
    console.error('Sign out API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}