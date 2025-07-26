// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request) {
//   const requestUrl = new URL(request.url)
//   const code = requestUrl.searchParams.get('code')

//   if (code) {
//     const supabase = createRouteHandlerClient({ cookies })
//     await supabase.auth.exchangeCodeForSession(code)
//   }

//   return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
// }


// src/app/auth/callback/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_callback_error`)
      }

      // Check if this is a new user (first time OAuth)
      if (data.user && data.user.created_at === data.user.updated_at) {
        // This might be a new OAuth user, ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'OAuth User',
              avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture
            })

          if (insertError) {
            console.error('Profile creation error:', insertError)
          }
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard?welcome=true`)
    } catch (error) {
      console.error('Unexpected auth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}

// src/components/ui/Separator.jsx
export function Separator({ className = '', orientation = 'horizontal' }) {
  return (
    <div
      className={`shrink-0 bg-border ${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
    />
  )
}

// src/lib/utils.js (if it doesn't exist)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}