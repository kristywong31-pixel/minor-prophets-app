import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ⚠️ 注意這裡：要用 export const，不能只寫 export default
export const supabase = createClient(supabaseUrl, supabaseAnonKey)