import React, { useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Utensils, DollarSign, Target, AlertTriangle, Star,
  BarChart3, List, LayoutGrid, ArrowUpRight, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { BadgeSelect } from '@/components/ui/badge-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { ImageFrame } from '@/components/ui/image-upload'
import { useToast } from '@/components/ui/toast'
import MenuItemFormPanel from '@/components/MenuItemFormPanel'
import FoodCostReportPanel from '@/components/FoodCostReportPanel'
import { useCollection } from '@/hooks/useCollection'
import { formatVND, cn } from '@/lib/utils'

const CAT = {
  'Thịt nướng': { icon: '🥩', color: 'hsl(0 72% 58%)' },
  'Hải sản': { icon: '🐟', color: 'hsl(221 83% 53%)' },
  'Lẩu': { icon: '🍲', color: 'hsl(38 92% 50%)' },
  'Món phụ': { icon: '🥗', color: 'hsl(160 84% 39%)' },
  'Đồ uống': { icon: '🥤', color: 'hsl(262 83% 66%)' },
  'Salad': { icon: '🥬', color: 'hsl(140 70% 45%)' },
  'Tráng miệng': { icon: '🍮', color: 'hsl(330 81% 60%)' },
}

const STATUS = {
  over: { label: 'Vượt mục tiêu', variant: 'destructive' },
  ok: { label: 'Đạt mục tiêu', variant: 'success' },
}
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, m]) => ({ value, ...m }))

const cardTone = {
  primary: { grad: 'from-primary/20 via-primary/5', ring: 'border-primary/30', tile: 'from-primary to-info', text: 'text-primary', bar: 'bg-primary' },
  success: { grad: 'from-success/20 via-success/5', ring: 'border-success/30', tile: 'from-success to-emerald-400', text: 'text-success', bar: 'bg-success' },
  warning: { grad: 'from-warning/20 via-warning/5', ring: 'border-warning/30', tile: 'from-warning to-amber-400', text: 'text-warning', bar: 'bg-warning' },
  destructive: { grad: 'from-destructive/20 via-destructive/5', ring: 'border-destructive/30', tile: 'from-destructive to-rose-400', text: 'text-destructive', bar: 'bg-destructive' },
  info: { grad: 'from-info/20 via-info/5', ring: 'border-info/30', tile: 'from-info to-purple-400', text: 'text-info', bar: 'bg-info' },
}

function foodCostColor(fc) { if (fc > 33) return 'bg-destructive'; if (fc > 30) return 'bg-warning'; return 'bg-success' }
function foodCostText(fc) { if (fc > 33) return 'text-destructive'; if (fc > 30) return 'text-warning'; return 'text-success' }

export default function MenuCost() {
  const toast = useToast()
  const { rows: menu, loading, error, create, update, remove } = useCollection('menu_items', { notify: { label: 'món', type: 'update' } })
  const settingsHook = useCollection('settings', { realtime: false })
  const foodCostTarget = settingsHook.rows[0]?.food_cost_target || 30

  // Debug log
  React.useEffect(() => {
    console.log('🔍 Debug MenuCost:', {
      settingsRows: settingsHook.rows,
      firstSetting: settingsHook.rows[0],
      foodCostTarget,
    })
  }, [settingsHook.rows, foodCostTarget])

  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fcOf = (m) => (m.sell > 0 ? (m.cost / m.sell) * 100 : 0)

  const stats = useMemo(() => {
    const total = menu.length
    const avgFc = total ? menu.reduce((s, m) => s + fcOf(m), 0) / total : 0
    const ok = menu.filter((m) => fcOf(m) <= m.target).length
    const over = total - ok
    return { total, avgFc, ok, over }
  }, [menu])

  const STAT_CARDS = [
    { label: 'Tổng số món', value: String(stats.total), sub: 'Món trong menu', icon: Utensils, tone: 'primary' },
    { label: 'Food cost TB', value: `${stats.avgFc.toFixed(2)}%`, sub: `Mức mục tiêu: ≤ ${foodCostTarget}%`, icon: DollarSign, tone: stats.avgFc <= foodCostTarget ? 'success' : 'warning', arrow: stats.avgFc <= foodCostTarget },
    { label: 'Món đạt mục tiêu', value: String(stats.ok), sub: stats.total ? `${Math.round(stats.ok / stats.total * 100)}% menu` : '0% menu', icon: Target, tone: 'warning' },
    { label: 'Món vượt mục tiêu', value: String(stats.over), sub: stats.total ? `${Math.round(stats.over / stats.total * 100)}% menu` : '0% menu', icon: AlertTriangle, tone: 'destructive' },
    { label: 'Danh mục', value: String(new Set(menu.map((m) => m.cat).filter(Boolean)).size), sub: 'Nhóm món', icon: Star, tone: 'info' },
  ]

  const TABS = useMemo(() => {
    const base = [{ key: 'all', label: 'Tất cả', count: menu.length }]
    for (const c of Object.keys(CAT)) {
      const count = menu.filter((m) => m.cat === c).length
      if (count) base.push({ key: c, label: c, count })
    }
    return base
  }, [menu])

  const filtered = useMemo(() => menu.filter((m) => {
    if (tab !== 'all' && m.cat !== tab) return false
    if (statusFilter !== 'all') {
      const isOver = fcOf(m) > m.target
      if (statusFilter === 'over' && !isOver) return false
      if (statusFilter === 'ok' && isOver) return false
    }
    if (query && !(`${m.name} ${m.code || ''}`.toLowerCase().includes(query.toLowerCase()))) return false
    return true
  }), [menu, tab, statusFilter, query])

  const reportData = useMemo(() => {
    const totalCost = menu.reduce((s, m) => s + m.cost, 0)
    const totalSell = menu.reduce((s, m) => s + m.sell, 0)
    const catCost = {}
    for (const m of menu) if (m.cat) catCost[m.cat] = (catCost[m.cat] || 0) + m.cost
    const distribution = Object.entries(catCost).map(([name, v]) => ({
      name, value: totalCost ? +((v / totalCost) * 100).toFixed(1) : 0, color: (CAT[name] || {}).color || 'hsl(215 20% 50%)',
    }))
    const kpis = [
      { label: 'Food cost TB', value: `${stats.avgFc.toFixed(2)}%`, sub: `Mục tiêu: ≤ ${foodCostTarget}%`, tone: stats.avgFc <= foodCostTarget ? 'text-success' : 'text-warning' },
      { label: 'Tổng giá bán', value: formatVND(totalSell), sub: 'Toàn menu' },
      { label: 'Tổng giá vốn', value: formatVND(totalCost), sub: 'Toàn menu' },
      { label: 'Lợi nhuận gộp', value: formatVND(totalSell - totalCost), sub: totalSell ? `${(((totalSell - totalCost) / totalSell) * 100).toFixed(1)}% biên LN` : '', tone: 'text-success' },
    ]
    const overview = [
      { label: 'Tổng số món', value: String(stats.total) },
      { label: 'Món đạt mục tiêu', value: `${stats.ok}${stats.total ? ` (${Math.round(stats.ok / stats.total * 100)}%)` : ''}` },
      { label: 'Món vượt mục tiêu', value: `${stats.over}${stats.total ? ` (${Math.round(stats.over / stats.total * 100)}%)` : ''}` },
      { label: 'Số danh mục', value: String(distribution.length) },
    ]
    const topOver = menu.filter((m) => fcOf(m) > m.target)
      .map((m) => ({ name: m.name, cat: m.cat, target: m.target, fc: `${fcOf(m).toFixed(2)}%`, diff: `+${(fcOf(m) - m.target).toFixed(2)}%`, _d: fcOf(m) - m.target }))
      .sort((a, b) => b._d - a._d).slice(0, 8)
    return { kpis, distribution, overview, topOver, foodCostTarget }
  }, [menu, stats, foodCostTarget])

  const handleSave = async ({ id, values }) => {
    setSaving(true)
    try {
      if (id) await update(id, values)
      else await create(values)
      setAddOpen(false); setEditing(null)
      toast.success(id ? `Đã cập nhật "${values.name}".` : `Đã thêm món "${values.name}".`)
    } catch (e) { toast.error('Lưu món thất bại: ' + e.message) }
    finally { setSaving(false) }
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
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">Menu &amp; Cost</h1>
          <p className="mt-1 text-sm text-gray-400">Quản lý menu và tính giá vốn món ăn</p>
        </div>
        <Button onClick={() => { setEditing(null); setAddOpen(true) }} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
          <Plus className="h-4 w-4" /> Thêm món
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          const t = cardTone[s.tone]
          return (
            <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', t.tile)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className={cn('text-xs font-semibold uppercase tracking-wider', t.text)}>{s.label}</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{s.value}</div>
                </div>
              </div>
              <div className={cn('mt-3 h-0.5 w-10 rounded-full', t.bar)} />
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                {s.arrow && <ArrowUpRight className="h-3.5 w-3.5 text-success" />}
                {s.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm món ăn, mã món..." className="rounded-xl border-white/10 bg-white/5 pl-9 focus:border-blue-500/50 focus:bg-white/10" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {Object.keys(CAT).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ok">Đạt mục tiêu</SelectItem>
              <SelectItem value="over">Vượt mục tiêu</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => setReportOpen(true)} className="gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
            <BarChart3 className="h-4 w-4" /> Báo cáo Food Cost
          </Button>
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button className="px-2.5 py-2 text-gray-400 transition-colors hover:bg-white/5"><List className="h-4 w-4" /></button>
            <button className="bg-blue-600 px-2.5 py-2 text-white"><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              tab === t.key ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-foreground hover:bg-white/5'
            )}
          >
            {t.label}
            <Badge variant={tab === t.key ? 'default' : 'muted'} className={cn('h-5 min-w-5 justify-center px-1.5', tab === t.key ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400')}>
              {t.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold">Món ăn</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giá bán</th>
                <th className="p-4 font-semibold">Giá vốn</th>
                <th className="p-4 font-semibold">Food cost</th>
                <th className="p-4 font-semibold">Mục tiêu</th>
                <th className="p-4 font-semibold">Lợi nhuận</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="w-24 p-4 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="p-10 text-center text-sm text-red-400">Không tải được dữ liệu: {error.message}</td></tr>
              ) : filtered.map((m) => {
                const fc = fcOf(m)
                const profit = m.sell - m.cost
                const cat = CAT[m.cat] || { icon: '🍽️', color: 'hsl(215 20% 50%)' }
                const status = fc > m.target ? 'over' : 'ok'
                return (
                  <tr key={m.id} className="border-b border-white/10 transition-colors last:border-0 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ImageFrame src={m.img} emoji="🍽️" size="h-11 w-11" rounded="rounded-lg" />
                        <div>
                          <div className="font-medium text-foreground">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span style={{ color: cat.color }}>{cat.icon}</span> {m.cat || '—'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{formatVND(m.sell)}</td>
                    <td className="p-4 text-muted-foreground">{formatVND(m.cost)}</td>
                    <td className="p-4">
                      <div className={cn('mb-1 text-sm font-semibold', foodCostText(fc))}>{fc.toFixed(2)}%</div>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                        <div className={cn('h-full rounded-full', foodCostColor(fc))} style={{ width: `${Math.min(fc / 40 * 100, 100)}%` }} />
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">≤ {m.target}%</td>
                    <td className="p-4 font-semibold text-success">{formatVND(profit)}</td>
                    <td className="p-4"><Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa món" onClick={() => { setEditing(m); setAddOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Xóa món" onClick={() => setConfirmDel(m)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={9} className="p-10 text-center text-sm text-muted-foreground">Không tìm thấy món nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && !error && <div className="text-sm text-muted-foreground">Hiển thị {filtered.length} / {menu.length} món</div>}

      <MenuItemFormPanel open={addOpen} item={editing} saving={saving} onClose={() => !saving && (setAddOpen(false), setEditing(null))} onSave={handleSave} />
      <FoodCostReportPanel open={reportOpen} onClose={() => setReportOpen(false)} data={reportData} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa món?"
        message={confirmDel ? `Bạn có chắc muốn xóa "${confirmDel.name}"?` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
