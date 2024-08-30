import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)