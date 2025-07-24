// src/lib/supabase/server.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For server components
export const createServerClient = () => createServerComponentClient({ cookies })

// For API routes
export const createRouteClient = () => createRouteHandlerClient({ cookies })