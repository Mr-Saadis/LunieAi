// src/lib/supabase/client.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// For client components only
export const createClient = () => createClientComponentClient()

// For browser-based usage
export const supabase = createClientComponentClient()