import React, { useState, useEffect } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ImageUpload from '@/components/ui/image-upload'
import { useToast } from '@/components/ui/toast'
import { formatVND } from '@/lib/utils'

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

const CATEGORIES = ['Thịt nướng', 'Hải sản', 'Lẩu', 'Món phụ', 'Đồ uống', 'Tráng miệng']
const emptyItem = { name: '', cat: '', code: '', sell: '', cost: '', target: '30', img: '', variable_costs: [] }

export default function MenuItemFormPanel({ open, item, saving, onClose, onSave }) {
  const toast = useToast()
  const [form, setForm] = useState(emptyItem)

  useEffect(() => {
    if (open) {
      setForm(item ? {
        ...emptyItem,
        ...item,
        sell: String(item.sell ?? ''),
        cost: String(item.cost ?? ''),
        target: String(item.target ?? 30),
        variable_costs: item.variable_costs || []
      } : emptyItem)
    }
  }, [open, item])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addVariableCost = () => {
    setForm((prev) => ({
      ...prev,
      variable_costs: [...prev.variable_costs, { name: '', cost: '' }]
    }))
  }

  const removeVariableCost = (index) => {
    setForm((prev) => ({
      ...prev,
      variable_costs: prev.variable_costs.filter((_, i) => i !== index)
    }))
  }

  const updateVariableCost = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variable_costs: prev.variable_costs.map((vc, i) =>
        i === index ? { ...vc, [field]: value } : vc
      )
    }))
  }

  const sell = Number(form.sell) || 0
  const cost = Number(form.cost) || 0
  const totalVariableCost = form.variable_costs.reduce((sum, vc) => sum + (Number(vc.cost) || 0), 0)
  const totalCost = cost + totalVariableCost
  const fc = sell > 0 ? ((totalCost / sell) * 100).toFixed(2) : '0'
  const profit = sell - totalCost
  const valid = form.name.trim() && form.cat && sell > 0

  const submit = () => {
    if (!valid || saving) return
    const target = Number(form.target) || 30
    const status = sell > 0 && (totalCost / sell) * 100 > target ? 'over' : 'ok'
    onSave({
      id: item?.id,
      values: {
        code: form.code || null,
        name: form.name,
        img: form.img || '🍽️',
        cat: form.cat,
        sell,
        cost,
        target,
        status,
        variable_costs: form.variable_costs
          .filter((vc) => vc.name.trim() && Number(vc.cost) > 0)
          .map((vc) => ({ name: vc.name.trim(), cost: Number(vc.cost) })),
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent maxWidth="3xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{item ? 'Chỉnh sửa món' : 'Thêm món mới'}</DialogTitle>
          <p className="mt-1 text-xs text-gray-400">Thêm thông tin món và chi phí</p>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <Section title="1. Hình ảnh món ăn">
              <ImageUpload
                value={form.img}
                onChange={(v) => set('img', v)}
                folder="menu"
                fallbackEmoji="🍽️"
                onError={(m) => toast.error(m)}
              />
              <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
            </Section>

            <Section title="2. Thông tin món ăn">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Tên món</Label>
                  <Input placeholder="Nhập tên món ăn" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <Label required>Danh mục</Label>
                  <Select value={form.cat || undefined} onValueChange={(v) => set('cat', v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
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

            <Section title="3. Chi phí biến đổi">
              <div className="space-y-3">
                {form.variable_costs.map((vc, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label>Chi phí</Label>
                        <Input
                          placeholder="VD: Nước chấm"
                          value={vc.name}
                          onChange={(e) => updateVariableCost(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Giá</Label>
                        <Input
                          placeholder="0"
                          inputMode="numeric"
                          value={vc.cost}
                          onChange={(e) => updateVariableCost(index, 'cost', e.target.value.replace(/[^\d]/g, ''))}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariableCost(index)}
                      className="mt-6 h-9 w-9 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariableCost}
                  className="w-full gap-2 rounded-xl border-dashed border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10"
                >
                  <Plus className="h-4 w-4" /> Thêm chi phí
                </Button>

                {/* Summary */}
                <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tổng chi phí biến đổi</span>
                    <span className="font-semibold text-blue-400">{formatVND(totalVariableCost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Lãi ròng</span>
                    <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatVND(profit)}
                    </span>
                  </div>
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
