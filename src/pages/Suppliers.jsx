import React, { useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Eye, MoreVertical, Store, CheckCircle2, Clock, PauseCircle,
  List, LayoutGrid, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { BadgeSelect } from '@/components/ui/badge-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { ImageFrame } from '@/components/ui/image-upload'
import { useToast } from '@/components/ui/toast'
import SupplierFormPanel from '@/components/SupplierFormPanel'
import SupplierDetailPanel from '@/components/SupplierDetailPanel'
import { useCollection } from '@/hooks/useCollection'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, TAG_COLORS } from '@/lib/suppliers'
import { cn } from '@/lib/utils'

const STATUS = {
  active: { label: 'Đang hợp tác', variant: 'success' },
  considering: { label: 'Đang xem xét', variant: 'warning' },
  inactive: { label: 'Ngừng hợp tác', variant: 'muted' },
}
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, m]) => ({ value, ...m }))


const cardTone = {
  primary: { grad: 'from-primary/20 via-primary/5', ring: 'border-primary/30', tile: 'from-primary to-info', text: 'text-primary', active: 'ring-2 ring-primary' },
  success: { grad: 'from-success/20 via-success/5', ring: 'border-success/30', tile: 'from-success to-emerald-400', text: 'text-success', active: 'ring-2 ring-success' },
  warning: { grad: 'from-warning/20 via-warning/5', ring: 'border-warning/30', tile: 'from-warning to-amber-400', text: 'text-warning', active: 'ring-2 ring-warning' },
  info: { grad: 'from-info/20 via-info/5', ring: 'border-info/30', tile: 'from-info to-purple-400', text: 'text-info', active: 'ring-2 ring-info' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '—' }
}

export default function Suppliers() {
  const toast = useToast()
  const { rows: suppliers, loading, error, create, update, remove } = useCollection('suppliers', { notify: { label: 'nhà cung cấp', type: 'supplier' } })
  const { rows: products, refetch: refetchProducts } = useCollection('supplier_products', { orderBy: 'created_at', ascending: true })
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Gộp sản phẩm theo nhà cung cấp
  const productsBySupplier = useMemo(() => {
    const map = {}
    for (const p of products) (map[p.supplier_id] ||= []).push(p)
    return map
  }, [products])

  const withProducts = useMemo(() => suppliers.map((s) => {
    const list = productsBySupplier[s.id] || []
    return { ...s, productList: list.map((p) => p.name), products: list.length, tagColor: s.tag_color || TAG_COLORS[s.tag] || 'hsl(215 20% 45%)' }
  }), [suppliers, productsBySupplier])

  const counts = useMemo(() => ({
    all: withProducts.length,
    active: withProducts.filter((s) => s.status === 'active').length,
    considering: withProducts.filter((s) => s.status === 'considering').length,
    inactive: withProducts.filter((s) => s.status === 'inactive').length,
  }), [withProducts])

  const pct = (n) => (counts.all ? ((n / counts.all) * 100).toFixed(1) : '0') + '% tổng số'
  const STAT_CARDS = [
    { key: 'all', label: 'Tất cả', value: counts.all, sub: 'Nhà cung cấp', icon: Store, tone: 'primary' },
    { key: 'active', label: 'Đang hợp tác', value: counts.active, sub: pct(counts.active), icon: CheckCircle2, tone: 'success' },
    { key: 'considering', label: 'Đang xem xét', value: counts.considering, sub: pct(counts.considering), icon: Clock, tone: 'warning' },
    { key: 'inactive', label: 'Ngừng hợp tác', value: counts.inactive, sub: pct(counts.inactive), icon: PauseCircle, tone: 'info' },
  ]

  const filtered = useMemo(() => withProducts.filter((s) => {
    if (tab !== 'all' && s.status !== tab) return false
    if (cat !== 'all' && s.tag !== cat) return false
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [withProducts, tab, cat, query])

  // Lưu supplier + đồng bộ danh sách sản phẩm
  const handleSave = async ({ values, productNames, id }) => {
    setSaving(true)
    try {
      const payload = { ...values, tag_color: TAG_COLORS[values.tag] || null }
      let supplierId = id
      if (id) {
        await update(id, payload)
      } else {
        const created = await create(payload)
        supplierId = created.id
      }
      // đồng bộ sản phẩm: xóa cũ, chèn mới
      await supabase.from('supplier_products').delete().eq('supplier_id', supplierId)
      if (productNames.length) {
        await supabase.from('supplier_products').insert(productNames.map((name) => ({ supplier_id: supplierId, name })))
      }
      await refetchProducts()
      setAddOpen(false); setEditItem(null)
      toast.success(id ? `Đã cập nhật "${values.name}".` : `Đã thêm nhà cung cấp "${values.name}".`)
    } catch (e) {
      toast.error('Lưu nhà cung cấp thất bại: ' + e.message)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const name = confirmDel?.name
      await remove(confirmDel.id); setConfirmDel(null)
      toast.success(`Đã xóa "${name}".`)
    }
    catch (e) { toast.error('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">Nhà cung cấp</h1>
          <p className="mt-1 text-sm text-gray-400">Quản lý danh sách nhà cung cấp</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
          <Plus className="h-4 w-4" /> Thêm nhà cung cấp
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          const t = cardTone[s.tone]
          const isActive = tab === s.key
          return (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-white/10 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10',
                isActive && 'ring-2 ring-blue-400/40'
              )}
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', t.tile)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className={cn('text-xs font-semibold uppercase tracking-wider', t.text)}>{s.label}</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm nhà cung cấp..." className="rounded-xl border-white/10 bg-white/5 pl-9 focus:border-blue-500/50 focus:bg-white/10" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger className="w-[160px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hợp tác</SelectItem>
              <SelectItem value="considering">Đang xem xét</SelectItem>
              <SelectItem value="inactive">Ngừng hợp tác</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button className="bg-blue-600 px-2.5 py-2 text-white"><List className="h-4 w-4" /></button>
            <button className="px-2.5 py-2 text-gray-400 transition-colors hover:bg-white/5"><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold">Nhà cung cấp</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Sản phẩm cung cấp</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">Ghi chú</th>
                <th className="w-28 p-4 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-16 text-center text-sm text-gray-400"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-10 text-center text-sm text-red-400">Không tải được dữ liệu: {error.message}</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/10 transition-colors last:border-0 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.logo_url ? (
                        <ImageFrame src={s.logo_url} size="h-10 w-10" rounded="rounded-xl" />
                      ) : (
                        <Avatar className="h-10 w-10 rounded-xl"><AvatarFallback className="rounded-xl">{s.name.charAt(0)}</AvatarFallback></Avatar>
                      )}
                      <div>
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {s.tag && (
                      <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: `${s.tagColor.replace(')', ' / 0.15)')}`, color: s.tagColor }}>
                        {s.tag}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      {s.products} sản phẩm
                      <button onClick={() => setDetail(s)} className="text-muted-foreground hover:text-foreground" title="Xem sản phẩm"><Eye className="h-4 w-4" /></button>
                    </span>
                  </td>
                  <td className="p-4">
                    <BadgeSelect value={s.status} options={STATUS_OPTIONS} onChange={(v) => update(s.id, { status: v }).catch((e) => toast.error(e.message))} />
                  </td>
                  <td className="max-w-[240px] p-4">
                    <span className="block truncate text-muted-foreground" title={s.note}>{s.note}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Xem chi tiết" onClick={() => setDetail(s)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa" onClick={() => setEditItem(s)}><Pencil className="h-4 w-4" /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setDetail(s)}>Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditItem(s)}>Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmDel(s)} className="text-destructive">Xóa</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">Không tìm thấy nhà cung cấp nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && !error && (
        <div className="text-sm text-muted-foreground">Hiển thị {filtered.length} / {counts.all} nhà cung cấp</div>
      )}

      <SupplierFormPanel open={addOpen} mode="add" saving={saving} onClose={() => !saving && setAddOpen(false)} onSave={handleSave} />
      <SupplierFormPanel open={!!editItem} mode="edit" initial={editItem} saving={saving} onClose={() => !saving && setEditItem(null)} onSave={handleSave} />
      <SupplierDetailPanel supplier={detail} onClose={() => setDetail(null)} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa nhà cung cấp?"
        message={confirmDel ? `Bạn có chắc muốn xóa "${confirmDel.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
