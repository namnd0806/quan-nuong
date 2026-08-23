import { supabase } from '@/lib/supabase'

// Tên bucket Storage (công khai) để lưu ảnh món ăn / logo nhà cung cấp.
export const IMAGE_BUCKET = 'images'

// Tải ảnh lên Supabase Storage, trả về public URL.
export async function uploadImage(file, folder = 'misc') {
  if (!file) throw new Error('Không có tệp ảnh.')
  if (!file.type?.startsWith('image/')) throw new Error('Tệp phải là hình ảnh.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ảnh tối đa 5MB.')

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
