// src/lib/supabase/server.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// For server components - cookies will be passed as parameter
export const createServerClient = (cookies) => createServerComponentClient({ cookies })

// For API routes - cookies will be passed as parameter  
export const createRouteClient = (cookies) => createRouteHandlerClient({ cookies })



