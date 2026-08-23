import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ImageUpload from '@/components/ui/image-upload'
import { useToast } from '@/components/ui/toast'

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-gray-400">
      {children}{required && <span className="text-red-400"> *</span>}
    </label>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  )
}

const CATEGORIES = ['Thịt nướng', 'Hải sản', 'Lẩu', 'Món phụ', 'Đồ uống', 'Salad', 'Tráng miệng']
const emptyItem = { code: '', name: '', img: '🍽️', cat: '', sell: '', cost: '', target: 30 }

export default function MenuItemFormPanel({ open, item, saving, onClose, onSave }) {
  const toast = useToast()
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent maxWidth="3xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{item ? 'Chỉnh sửa món' : 'Thêm món mới'}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <Section title="Hình ảnh món ăn">
              <ImageUpload
                value={form.img}
                onChange={(v) => set('img', v)}
                folder="menu"
                fallbackEmoji="🍽️"
                onError={(m) => toast.error(m)}
              />
            </Section>

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
                <div className="sm:col-span-2">
                  <Label>Mã món</Label>
                  <Input placeholder="VD: MN-033" value={form.code} onChange={(e) => set('code', e.target.value)} />
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
                  <Input value={`${fc}%`} readOnly className="bg-white/5 text-gray-400" />
                </div>
                <div>
                  <Label>Mục tiêu (%)</Label>
                  <Input inputMode="numeric" value={form.target} onChange={(e) => set('target', e.target.value.replace(/[^\d]/g, ''))} />
                </div>
              </div>
            </Section>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Hủy</Button>
          <Button onClick={submit} disabled={!valid || saving} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {item ? 'Lưu thay đổi' : 'Lưu món'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
