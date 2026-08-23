import { supabase } from '@/lib/supabase'

// Ghi một thông báo vào bảng notifications (hiển thị ở chuông thông báo).
// type: 'done' | 'update' | 'budget' | 'supplier'
export async function logNotification({ actor, action, target, type = 'update' }) {
  try {
    await supabase.from('notifications').insert({ actor, action, target, type, is_read: false })
  } catch (e) {
    // Không chặn luồng chính nếu ghi thông báo lỗi.
    // eslint-disable-next-line no-console
    console.warn('logNotification failed', e)
  }
}
