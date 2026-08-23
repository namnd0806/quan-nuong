import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error('Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env')
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'qn-auth',
  },
})

// Chuyển username ngắn ("nam") thành email đăng nhập.
export const EMAIL_DOMAIN = 'quannuong.app'
export function toEmail(username) {
  const u = (username || '').trim().toLowerCase()
  return u.includes('@') ? u : `${u}@${EMAIL_DOMAIN}`
}
