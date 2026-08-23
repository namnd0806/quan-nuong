import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Plus, Wallet, ArrowDownCircle, PieChart as PieIcon, TrendingUp,
  Search, SlidersHorizontal, Pencil, Trash2, X, Loader2, Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ExpenseDetailPanel from '@/components/ExpenseDetailPanel'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { logNotification } from '@/lib/notify'
import { useCollection } from '@/hooks/useCollection'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { formatVND, cn } from '@/lib/utils'

const CAT = {
  'Xây dựng': { icon: '🏗️', color: '#FB923C' },
  'Thiết bị': { icon: '🍳', color: '#34D399' },
  'Bàn ghế': { icon: '🪑', color: '#FBBF24' },
  'Biển hiệu': { icon: '🪧', color: '#A78BFA' },
  'Marketing': { icon: '📣', color: '#EC4899' },
  'Khác': { icon: '📦', color: '#6B7280' },
}
const CATEGORIES = Object.keys(CAT)
const catMeta = (c) => CAT[c] || { icon: '📦', color: 'hsl(215 20% 45%)' }

const STATUS = {
  paid: { label: 'Đã thanh toán', variant: 'success' },
  partial: { label: 'Một phần', variant: 'info' },
  over: { label: 'Vượt dự toán', variant: 'destructive' },
  pending: { label: 'Chờ thanh toán', variant: 'warning' },
}

const toneMap = {
  primary: { text: 'text-primary', bg: 'bg-primary/15' },
  success: { text: 'text-success', bg: 'bg-success/15' },
  warning: { text: 'text-warning', bg: 'bg-warning/15' },
  destructive: { text: 'text-destructive', bg: 'bg-destructive/15' },
}

const chartTooltip = {
  contentStyle: {
    background: 'rgba(10, 22, 40, 0.95)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    color: '#f8fafc',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
  },
  itemStyle: { color: '#f8fafc' },
  labelStyle: { color: 'rgba(148, 163, 184, 1)', fontWeight: 600, marginBottom: 4 },
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '—' }
}

export default function Budget() {
  const toast = useToast()
  const { profile, user } = useAuth()
  const actor = profile?.name || user?.email?.split('@')[0] || 'Ai đó'
  const { rows: items, loading, error, create, update, remove } = useCollection('budget_items', { notify: { label: 'khoản ngân sách', type: 'budget' } })
  const { rows: txs, refetch: refetchTx } = useCollection('budget_transactions', { orderBy: 'spent_at', ascending: false })
  const { rows: members } = useCollection('members', { orderBy: 'sort', ascending: true })
  const { rows: settingsRows } = useCollection('settings', { orderBy: 'id', ascending: true, realtime: false })

  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [recordFor, setRecordFor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const owners = useMemo(() => (members.length ? members.map((m) => m.name) : ['Nam', 'Phương']), [members])
  const budgetTotal = settingsRows[0]?.budget_total || 500000000

  // actual per item = tổng transaction
  const actualByItem = useMemo(() => {
    const map = {}
    for (const t of txs) map[t.item_id] = (map[t.item_id] || 0) + (t.amount || 0)
    return map
  }, [txs])
  const txByItem = useMemo(() => {
    const map = {}
    for (const t of txs) (map[t.item_id] ||= []).push(t)
    return map
  }, [txs])

  const enriched = useMemo(() => items.map((it) => {
    const actual = actualByItem[it.id] || 0
    let displayStatus = it.status
    if (actual > it.planned && it.planned > 0) displayStatus = 'over'
    return { ...it, actual, displayStatus, icon: catMeta(it.category).icon, transactions: txByItem[it.id] || [] }
  }), [items, actualByItem, txByItem])

  const totals = useMemo(() => {
    const planned = enriched.reduce((s, e) => s + (e.planned || 0), 0)
    const spent = enriched.reduce((s, e) => s + e.actual, 0)
    return { planned, spent, remaining: budgetTotal - spent, diff: spent - planned }
  }, [enriched, budgetTotal])

  const summary = [
    { label: 'Tổng ngân sách', value: formatVND(budgetTotal), sub: 'Ngân sách dự kiến', icon: Wallet, tone: 'primary' },
    { label: 'Đã chi', value: formatVND(totals.spent), sub: budgetTotal ? `${((totals.spent / budgetTotal) * 100).toFixed(1)}% đã dùng` : '', icon: ArrowDownCircle, tone: 'success' },
    { label: 'Còn lại', value: formatVND(totals.remaining), sub: budgetTotal ? `${((totals.remaining / budgetTotal) * 100).toFixed(1)}% còn lại` : '', icon: PieIcon, tone: 'warning' },
    { label: 'Chênh lệch (chi-dự toán)', value: `${totals.diff > 0 ? '+' : ''}${formatVND(totals.diff)}`, sub: totals.diff > 0 ? 'Vượt dự toán' : 'Trong dự toán', icon: TrendingUp, tone: totals.diff > 0 ? 'destructive' : 'success' },
  ]

  const byCat = useMemo(() => {
    const map = {}
    for (const e of enriched) {
      const c = e.category || 'Khác'
      map[c] ||= { name: c, planned: 0, actual: 0 }
      map[c].planned += e.planned || 0
      map[c].actual += e.actual
    }
    return Object.values(map)
  }, [enriched])

  const chartData = byCat.map((c) => ({ name: c.name, 'Dự toán': Math.round(c.planned / 1e6), 'Thực chi': Math.round(c.actual / 1e6) }))
  const allocation = byCat.filter((c) => c.planned > 0).map((c) => ({ name: c.name, value: c.planned, color: catMeta(c.name).color, pct: totals.planned ? (c.planned / totals.planned) * 100 : 0 }))

  const CAT_TABS = useMemo(() => {
    const base = [{ key: 'all', label: 'Tất cả', count: enriched.length }]
    for (const c of CATEGORIES) {
      const count = enriched.filter((e) => e.category === c).length
      if (count) base.push({ key: c, label: c, count })
    }
    return base
  }, [enriched])

  const filtered = useMemo(() => enriched.filter((e) => {
    if (tab !== 'all' && e.category !== tab) return false
    if (status !== 'all' && e.displayStatus !== status) return false
    if (query && !(`${e.name} ${e.category || ''}`.toLowerCase().includes(query.toLowerCase()))) return false
    return true
  }), [enriched, tab, status, query])

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (e) => { setSelected(null); setEditing(e); setFormOpen(true) }

  const handleSave = async (draft) => {
    setSaving(true)
    try {
      const values = { name: draft.name, category: draft.category || null, planned: Number(draft.planned) || 0, status: draft.status, owner: draft.owner || null, note: draft.note || null }
      if (draft.id) await update(draft.id, values)
      else await create(values)
      setFormOpen(false); setEditing(null)
      toast.success(draft.id ? `Đã cập nhật "${values.name}".` : `Đã thêm khoản "${values.name}".`)
    } catch (e) { toast.error('Lưu khoản chi thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleRecord = async ({ itemId, amount, spent_at, note }) => {
    setSaving(true)
    try {
      const { error } = await supabase.from('budget_transactions').insert({ item_id: itemId, amount: Number(amount) || 0, spent_at, note: note || null })
      if (error) throw error
      await refetchTx()
      const item = items.find((x) => x.id === itemId)
      logNotification({ actor, action: 'đã ghi nhận chi', target: item?.name || 'khoản ngân sách', type: 'budget' })
      setRecordFor(null)
      toast.success(`Đã ghi nhận chi ${formatVND(Number(amount) || 0)}.`)
    } catch (e) { toast.error('Ghi nhận chi thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const name = confirmDel?.name
      await remove(confirmDel.id); setConfirmDel(null); setSelected(null)
      toast.success(`Đã xóa "${name}".`)
    }
    catch (e) { toast.error('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ngân sách</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Quản lý ngân sách dự kiến và chi phí mở quán</p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
          <Plus className="h-4 w-4" /> Thêm khoản chi
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s, i) => {
          const Icon = s.icon
          const colors = {
            primary: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: 'text-blue-400' },
            success: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', text: 'text-emerald-400' },
            warning: { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)', text: 'text-orange-400' },
            destructive: { bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)', text: 'text-red-400' },
          }
          const color = colors[s.tone]
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="rounded-2xl border border-white/10 transition-all hover:border-white/20 hover:shadow-xl" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color.bg, border: `1px solid ${color.border}` }}>
                      <Icon className={cn('h-5 w-5', color.text)} />
                    </div>
                  </div>
                  <div className={cn('mt-3 text-2xl font-bold', s.tone === 'destructive' ? 'text-red-400' : 'text-foreground')}>{s.value}</div>
                  <div className="mt-1 text-xs text-gray-400">{s.sub}</div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="rounded-2xl border border-white/10 lg:col-span-2" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-300">DỰ TOÁN VS THỰC CHI (TRIỆU Đ)</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltip} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                  <Bar dataKey="Dự toán" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Thực chi" fill="#34D399" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-300">PHÂN BỔ NGÂN SÁCH</CardTitle></CardHeader>
          <CardContent>
            {allocation.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value" stroke="none">
                      {allocation.map((a, i) => <Cell key={i} fill={a.color} />)}
                    </Pie>
                    <Tooltip {...chartTooltip} formatter={(v) => formatVND(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2">
                  {allocation.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                      <span className="flex-1 text-gray-300">{a.name}</span>
                      <span className="font-semibold text-foreground">{a.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm khoản chi..." className="rounded-xl border-white/10 bg-white/5 pl-10 backdrop-blur-sm focus:border-blue-500/50 focus:bg-white/10" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hạng mục</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
        {CAT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              tab === t.key ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            )}
          >
            {t.label}
            <Badge variant={tab === t.key ? 'default' : 'muted'} className={cn('h-5 min-w-5 justify-center px-2', tab === t.key ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400')}>
              {t.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-400" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th className="p-4 font-semibold">KHOẢN CHI</th>
                <th className="p-4 font-semibold">HẠNG MỤC</th>
                <th className="p-4 font-semibold">Dự TOÁN</th>
                <th className="p-4 font-semibold">THỰC CHI</th>
                <th className="p-4 font-semibold">PHỤ TRÁCH</th>
                <th className="p-4 font-semibold">TRẠNG THÁI</th>
                <th className="w-28 p-4 font-semibold">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="p-10 text-center text-sm text-destructive">Không tải được dữ liệu: {error.message}</td></tr>
              ) : filtered.map((e) => {
                const st = STATUS[e.displayStatus] || STATUS.pending
                return (
                  <tr key={e.id} onClick={() => setSelected(e)} className="cursor-pointer border-b border-white/5 transition-all last:border-0 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">{e.icon}</div>
                        <div className="font-medium text-foreground">{e.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {e.category ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold" style={{ background: `${catMeta(e.category).color}20`, color: catMeta(e.category).color }}>
                          {e.category}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{formatVND(e.planned)}</td>
                    <td className="p-4 text-gray-300">{formatVND(e.actual)}</td>
                    <td className="p-4">
                      {e.owner ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-semibold text-white">
                              {e.owner.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-gray-300">{e.owner}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="p-4" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" title="Ghi nhận chi" onClick={() => setRecordFor(e)}><Plus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" title="Chỉnh sửa" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400" title="Xóa" onClick={() => setConfirmDel(e)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-sm text-muted-foreground">Không tìm thấy khoản chi nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && !error && <div className="text-sm text-gray-400">Hiển thị {filtered.length} / {enriched.length} khoản chi</div>}

      <ExpenseDetailPanel
        expense={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={(e) => setConfirmDel(e)}
        onRecord={(e) => setRecordFor(e)}
      />
      <BudgetItemFormPanel
        open={formOpen}
        item={editing}
        owners={owners}
        saving={saving}
        onClose={() => !saving && (setFormOpen(false), setEditing(null))}
        onSave={handleSave}
      />
      <RecordSpendingModal
        item={recordFor}
        saving={saving}
        onClose={() => !saving && setRecordFor(null)}
        onSave={handleRecord}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa khoản chi?"
        message={confirmDel ? `Bạn có chắc muốn xóa "${confirmDel.name}"? Toàn bộ giao dịch chi liên quan cũng sẽ bị xóa.` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

const emptyItem = { name: '', category: '', planned: '', owner: '', status: 'pending', note: '' }

function BudgetItemFormPanel({ open, item, owners, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyItem)
  useEffect(() => {
    if (open) setForm(item ? { ...emptyItem, ...item, planned: String(item.planned ?? '') } : emptyItem)
  }, [open, item])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.category
  const submit = () => {
    if (!valid || saving) return
    onSave({ id: item?.id, name: form.name, category: form.category, planned: form.planned, owner: form.owner, status: form.status, note: form.note })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClose={onClose} />
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[500px] flex-col overflow-hidden rounded-l-3xl border-l border-white/10 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.98), rgba(10,22,40,0.98))' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-foreground">{item ? 'Chỉnh sửa khoản chi' : 'Thêm khoản chi'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="rounded-xl hover:bg-white/10"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              <div>
                <FieldLabel required>Tên khoản chi</FieldLabel>
                <Input placeholder="VD: Thi công quầy bar" value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10" />
              </div>
              <div>
                <FieldLabel required>Hạng mục</FieldLabel>
                <Select value={form.category || undefined} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5"><SelectValue placeholder="Chọn hạng mục" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Dự toán (VND)</FieldLabel>
                <Input inputMode="numeric" placeholder="Nhập số tiền dự toán" value={form.planned} onChange={(e) => set('planned', e.target.value.replace(/[^\d]/g, ''))} className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10" />
              </div>
              <div>
                <FieldLabel>Người phụ trách</FieldLabel>
                <Select value={form.owner || undefined} onValueChange={(v) => set('owner', v)}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5"><SelectValue placeholder="Chọn người phụ trách" /></SelectTrigger>
                  <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Trạng thái</FieldLabel>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="partial">Một phần</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Ghi chú</FieldLabel>
                <textarea
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm..."
                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {item ? 'Lưu thay đổi' : 'Thêm khoản chi'}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function RecordSpendingModal({ item, saving, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount] = useState('')
  const [spentAt, setSpentAt] = useState(today)
  const [note, setNote] = useState('')
  useEffect(() => {
    if (item) { setAmount(''); setSpentAt(new Date().toISOString().slice(0, 10)); setNote('') }
  }, [item])

  const valid = Number(amount) > 0 && spentAt
  const submit = () => {
    if (!valid || saving) return
    onSave({ itemId: item.id, amount, spent_at: spentAt, note })
  }

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.98), rgba(10,22,40,0.98))' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-foreground">Ghi nhận chi</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="rounded-xl hover:bg-white/10"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <p className="text-sm text-gray-400">Khoản chi: <span className="font-semibold text-foreground">{item.name}</span></p>
              <div>
                <FieldLabel required>Số tiền (VND)</FieldLabel>
                <Input inputMode="numeric" placeholder="Nhập số tiền đã chi" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} autoFocus className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10" />
              </div>
              <div>
                <FieldLabel required>Ngày chi</FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} className="rounded-xl border-white/10 bg-white/5 pl-10 focus:border-blue-500/50 focus:bg-white/10" />
                </div>
              </div>
              <div>
                <FieldLabel>Ghi chú</FieldLabel>
                <Input placeholder="VD: Đặt cọc đợt 1" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10" />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Ghi nhận
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-gray-400">
      {children}{required && <span className="text-red-400"> *</span>}
    </label>
  )
}

function Backdrop({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    />
  )
}
