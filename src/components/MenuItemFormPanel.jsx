import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}{required && <span className="text-destructive"> *</span>}
    </label>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

const CATEGORIES = ['Thịt nướng', 'Hải sản', 'Lẩu', 'Món phụ', 'Đồ uống', 'Salad', 'Tráng miệng']
const emptyItem = { code: '', name: '', img: '🍽️', cat: '', sell: '', cost: '', target: 30 }

export default function MenuItemFormPanel({ open, item, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyItem)
  useEffect(() => {
    if (open) setForm(item ? { ...emptyItem, ...item, sell: String(item.sell ?? ''), cost: String(item.cost ?? '') } : emptyItem)
  }, [open, item])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const sell = Number(form.sell) || 0
  const cost = Number(form.cost) || 0
  const fc = sell > 0 ? ((cost / sell) * 100).toFixed(2) : '0'
  const valid = form.name.trim() && form.cat && sell > 0

  const submit = () => {
    if (!valid || saving) return
    const target = Number(form.target) || 30
    const status = sell > 0 && (cost / sell) * 100 > target ? 'over' : 'ok'
    onSave({
      id: item?.id,
      values: { code: form.code || null, name: form.name, img: form.img || '🍽️', cat: form.cat, sell, cost, target, status },
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-2xl text-foreground">{item ? 'Chỉnh sửa món' : 'Thêm món mới'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <Section title="Thông tin món ăn">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Tên món</Label>
                    <Input placeholder="Nhập tên món ăn" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  </div>
                  <div>
                    <Label required>Danh mục</Label>
                    <Select value={form.cat || undefined} onValueChange={(v) => set('cat', v)}>
                      <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mã món</Label>
                    <Input placeholder="VD: MN-033" value={form.code} onChange={(e) => set('code', e.target.value)} />
                  </div>
                  <div>
                    <Label>Icon (emoji)</Label>
                    <Input placeholder="🍽️" value={form.img} onChange={(e) => set('img', e.target.value)} maxLength={4} />
                  </div>
                </div>
              </Section>

              <Section title="Giá bán & Giá vốn">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Giá bán (VND)</Label>
                    <Input placeholder="Nhập giá bán" inputMode="numeric" value={form.sell} onChange={(e) => set('sell', e.target.value.replace(/[^\d]/g, ''))} />
                  </div>
                  <div>
                    <Label required>Giá vốn (VND)</Label>
                    <Input placeholder="Nhập giá vốn" inputMode="numeric" value={form.cost} onChange={(e) => set('cost', e.target.value.replace(/[^\d]/g, ''))} />
                  </div>
                  <div>
                    <Label>Food Cost (%)</Label>
                    <Input value={`${fc}%`} readOnly className="text-muted-foreground" />
                  </div>
                  <div>
                    <Label>Mục tiêu (%)</Label>
                    <Input inputMode="numeric" value={form.target} onChange={(e) => set('target', e.target.value.replace(/[^\d]/g, ''))} />
                  </div>
                </div>
              </Section>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {item ? 'Lưu thay đổi' : 'Lưu món'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
