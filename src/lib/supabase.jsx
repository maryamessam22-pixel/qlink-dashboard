import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://vveftffbvwptlsqgeygp.supabase.co'
const supabaseKey = 'sb_publishable_bsCGwopSC-xFZyt_wiBPNA_4wcGHVgQ'
export const supabase = createClient(supabaseUrl, supabaseKey)
