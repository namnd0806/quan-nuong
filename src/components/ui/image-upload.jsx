import React, { useRef, useState } from 'react'
import { Loader2, ImagePlus, X, Camera } from 'lucide-react'
import { uploadImage } from '@/lib/storage'
import { cn } from '@/lib/utils'

// Khung tải ảnh chuyên nghiệp: xem trước, tải lên Storage, hoặc hiển thị emoji dự phòng.
// value: URL ảnh hiện tại | emoji. onChange(url). fallbackEmoji hiển thị khi chưa có ảnh URL.
export default function ImageUpload({ value, onChange, folder = 'misc', fallbackEmoji = '🍽️', shape = 'square', onError }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const isUrl = typeof value === 'string' && /^https?:\/\//.test(value)
  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  const pick = () => inputRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      onError?.(err.message || 'Tải ảnh thất bại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className={cn('relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary/40', rounded)}>
        {isUrl ? (
          <img src={value} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl leading-none">{value && !isUrl ? value : fallbackEmoji}</span>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        {isUrl && !busy && (
          <button
            type="button"
            onClick={() => onChange(fallbackEmoji)}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
            title="Bỏ ảnh"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isUrl ? <Camera className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
          {isUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
        </button>
        <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG tối đa 5MB. Nếu không tải ảnh, biểu tượng sẽ được dùng.</p>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  )
}

// Khung hiển thị ảnh/emoji dùng lại ở danh sách (list/card).
export function ImageFrame({ src, emoji = '🍽️', className, size = 'h-12 w-12', rounded = 'rounded-xl' }) {
  const isUrl = typeof src === 'string' && /^https?:\/\//.test(src)
  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary/50', size, rounded, className)}>
      {isUrl ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none" style={{ fontSize: '1.4em' }}>{src && !isUrl ? src : emoji}</span>
      )}
    </div>
  )
}
