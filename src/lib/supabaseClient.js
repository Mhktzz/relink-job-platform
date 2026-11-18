import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn(
    '[Relink Supabase] Kredensial VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi di file .env. Pastikan mengisi nilai API key Anda.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
