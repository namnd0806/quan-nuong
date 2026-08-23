import React, { useState, useEffect } from 'react'
import { Plus, Loader2, X as XIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ImageUpload from '@/components/ui/image-upload'
import { useToast } from '@/components/ui/toast'
import { CATEGORIES } from '@/lib/suppliers'

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-gray-400">
      {children}{required && <span className="text-red-400"> *</span>}
    </label>
  )
}

const emptyForm = { name: '', code: '', email: '', address: '', tag: '', status: 'active', note: '', logo_url: '' }

// mode: 'add' | 'edit'
export default function SupplierFormPanel({ open, mode = 'add', initial, saving, onClose, onSave }) {
  const toast = useToast()
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
    const values = { ...form, logo_url: /^https?:\/\//.test(form.logo_url) ? form.logo_url : null }
    onSave({ values, productNames: products, id: initial?.id })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent maxWidth="3xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Logo nhà cung cấp</h3>
              <ImageUpload
                value={form.logo_url}
                onChange={(v) => set('logo_url', v)}
                folder="suppliers"
                fallbackEmoji="🏪"
                shape="circle"
                onError={(m) => toast.error(m)}
              />
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Thông tin cơ bản</h3>
              <div className="space-y-4">
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
                <Button type="button" onClick={addProduct} className="shrink-0 gap-2 rounded-xl">
                  <Plus className="h-4 w-4" /> Thêm
                </Button>
              </div>
              <div className="mt-2 flex min-h-[80px] flex-wrap gap-2 rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {products.length === 0 && <span className="text-sm text-gray-400">Chưa có sản phẩm nào</span>}
                {products.map((p) => (
                  <span key={p} className="inline-flex h-fit items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                    {p}
                    <button onClick={() => removeProduct(p)} className="hover:text-white transition-colors"><XIcon className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-1.5 text-xs text-gray-400">Đã có: {products.length} sản phẩm</div>
            </div>

            <div>
              <Label>Ghi chú</Label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú (nếu có)"
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                className="flex w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-foreground transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">Hủy</Button>
          <Button onClick={submit} disabled={!valid || saving} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Lưu thay đổi' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function pick(s) {
  return { name: s.name || '', code: s.code || '', email: s.email || '', address: s.address || '', tag: s.tag || '', status: s.status || 'active', note: s.note || '', logo_url: s.logo_url || '' }
}
