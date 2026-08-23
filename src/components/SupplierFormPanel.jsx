import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { CATEGORIES } from '@/lib/suppliers'

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}{required && <span className="text-destructive"> *</span>}
    </label>
  )
}

const emptyForm = { name: '', code: '', email: '', address: '', tag: '', status: 'active', note: '' }

// mode: 'add' | 'edit'
export default function SupplierFormPanel({ open, mode = 'add', initial, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyForm, ...pick(initial) } : emptyForm)
      setProducts(initial?.productList || [])
      setNewProduct('')
    }
  }, [open, initial])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const addProduct = () => {
    const p = newProduct.trim()
    if (p && !products.includes(p)) setProducts((prev) => [...prev, p])
    setNewProduct('')
  }
  const removeProduct = (p) => setProducts((prev) => prev.filter((x) => x !== p))

  const isEdit = mode === 'edit'
  const title = isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'
  const valid = form.name.trim() && form.tag

  const submit = () => {
    if (!valid || saving) return
    onSave({ values: form, productNames: products, id: initial?.id })
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
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-2xl text-foreground">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
              <div>
                <Label required>Tên nhà cung cấp</Label>
                <Input placeholder="Nhập tên nhà cung cấp" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Số điện thoại</Label>
                  <Input placeholder="Nhập số điện thoại" value={form.code} onChange={(e) => set('code', e.target.value)} inputMode="tel" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="Nhập email (nếu có)" value={form.email} onChange={(e) => set('email', e.target.value)} type="email" />
                </div>
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input placeholder="Nhập địa chỉ" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Danh mục</Label>
                  <Select value={form.tag} onValueChange={(v) => set('tag', v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label required>Trạng thái</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang hợp tác</SelectItem>
                      <SelectItem value="considering">Đang xem xét</SelectItem>
                      <SelectItem value="inactive">Ngừng hợp tác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Sản phẩm cung cấp</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tên sản phẩm rồi Enter"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProduct() } }}
                  />
                  <Button type="button" onClick={addProduct} className="shrink-0"><Plus className="h-4 w-4" /> Thêm</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-border bg-secondary/30 p-3">
                  {products.length === 0 && <span className="text-sm text-muted-foreground">Chưa có sản phẩm nào</span>}
                  {products.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                      {p}
                      <button onClick={() => removeProduct(p)} className="hover:text-foreground"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">Đã có: {products.length} sản phẩm</div>
              </div>

              <div>
                <Label>Ghi chú</Label>
                <textarea
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)"
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Lưu thay đổi' : 'Lưu'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function pick(s) {
  return { name: s.name || '', code: s.code || '', email: s.email || '', address: s.address || '', tag: s.tag || '', status: s.status || 'active', note: s.note || '' }
}
