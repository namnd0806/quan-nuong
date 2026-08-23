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
import { useCollection } from '@/hooks/useCollection'
import { supabase } from '@/lib/supabase'
import { formatVND, cn } from '@/lib/utils'

const CAT = {
  'Xây dựng': { icon: '🏗️', color: 'hsl(221 83% 53%)' },
  'Thiết bị': { icon: '🍳', color: 'hsl(160 84% 39%)' },
  'Bàn ghế': { icon: '🪑', color: 'hsl(38 92% 50%)' },
  'Biển hiệu': { icon: '🪧', color: 'hsl(262 83% 66%)' },
  'Marketing': { icon: '📣', color: 'hsl(330 81% 60%)' },
  'Khác': { icon: '📦', color: 'hsl(215 20% 45%)' },
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
  contentStyle: { background: 'hsl(222 40% 8%)', border: '1px solid hsl(217 33% 15%)', borderRadius: 12, color: '#fff' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '—' }
}

export default function Budget() {
  const { rows: items, loading, error, create, update, remove } = useCollection('budget_items')
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
    } catch (e) { alert('Lưu khoản chi thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleRecord = async ({ itemId, amount, spent_at, note }) => {
    setSaving(true)
    try {
      const { error } = await supabase.from('budget_transactions').insert({ item_id: itemId, amount: Number(amount) || 0, spent_at, note: note || null })
      if (error) throw error
      await refetchTx()
      setRecordFor(null)
    } catch (e) { alert('Ghi nhận chi thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await remove(confirmDel.id); setConfirmDel(null); setSelected(null) }
    catch (e) { alert('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground md:text-3xl">Ngân sách</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý ngân sách dự kiến và chi phí mở quán</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Thêm khoản chi</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => {
          const Icon = s.icon
          const t = toneMap[s.tone]
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', t.bg)}>
                    <Icon className={cn('h-4 w-4', t.text)} />
                  </div>
                </div>
                <div className={cn('mt-3 text-2xl font-bold', s.tone === 'destructive' ? 'text-destructive' : 'text-foreground')}>{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Dự toán vs Thực chi (triệu đ)</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 15%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltip} cursor={{ fill: 'hsl(217 33% 15% / 0.4)' }} />
                  <Bar dataKey="Dự toán" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Thực chi" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Phân bổ ngân sách</CardTitle></CardHeader>
          <CardContent>
            {allocation.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                      {allocation.map((a, i) => <Cell key={i} fill={a.color} />)}
                    </Pie>
                    <Tooltip {...chartTooltip} formatter={(v) => formatVND(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5">
                  {allocation.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                      <span className="flex-1 text-muted-foreground">{a.name}</span>
                      <span className="font-medium text-foreground">{a.pct.toFixed(0)}%</span>
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
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm khoản chi..." className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hạng mục</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-secondary/60 p-1">
        {CAT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
            <Badge variant={tab === t.key ? 'default' : 'muted'} className={cn('h-5 min-w-5 justify-center px-1.5', tab === t.key && 'bg-primary-foreground/20 text-primary-foreground')}>
              {t.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4 font-semibold">Khoản chi</th>
                <th className="p-4 font-semibold">Hạng mục</th>
                <th className="p-4 font-semibold">Dự toán</th>
                <th className="p-4 font-semibold">Thực chi</th>
                <th className="p-4 font-semibold">Phụ trách</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="w-28 p-4 font-semibold">Thao tác</th>
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
                  <tr key={e.id} onClick={() => setSelected(e)} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">{e.icon}</div>
                        <div className="font-medium text-foreground">{e.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{e.category || '—'}</td>
                    <td className="p-4 font-semibold text-foreground">{formatVND(e.planned)}</td>
                    <td className="p-4 text-muted-foreground">{formatVND(e.actual)}</td>
                    <td className="p-4">
                      {e.owner ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{e.owner.charAt(0)}</AvatarFallback></Avatar>
                          {e.owner}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="p-4" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ghi nhận chi" onClick={() => setRecordFor(e)}><Plus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Xóa" onClick={() => setConfirmDel(e)}><Trash2 className="h-4 w-4" /></Button>
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

      {!loading && !error && <div className="text-sm text-muted-foreground">Hiển thị {filtered.length} / {enriched.length} khoản chi</div>}

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
        message={confirmDel ? `Bạn có chắc muốn xóa “${confirmDel.name}”? Toàn bộ giao dịch chi liên quan cũng sẽ bị xóa.` : ''}
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
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl text-foreground">{item ? 'Chỉnh sửa khoản chi' : 'Thêm khoản chi'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div>
                <FieldLabel required>Tên khoản chi</FieldLabel>
                <Input placeholder="VD: Thi công quầy bar" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <FieldLabel required>Hạng mục</FieldLabel>
                <Select value={form.category || undefined} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn hạng mục" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Dự toán (VND)</FieldLabel>
                <Input inputMode="numeric" placeholder="Nhập số tiền dự toán" value={form.planned} onChange={(e) => set('planned', e.target.value.replace(/[^\d]/g, ''))} />
              </div>
              <div>
                <FieldLabel>Người phụ trách</FieldLabel>
                <Select value={form.owner || undefined} onValueChange={(v) => set('owner', v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn người phụ trách" /></SelectTrigger>
                  <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Trạng thái</FieldLabel>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl text-foreground">Ghi nhận chi</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="text-sm text-muted-foreground">Khoản chi: <span className="font-medium text-foreground">{item.name}</span></p>
              <div>
                <FieldLabel required>Số tiền (VND)</FieldLabel>
                <Input inputMode="numeric" placeholder="Nhập số tiền đã chi" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} autoFocus />
              </div>
              <div>
                <FieldLabel required>Ngày chi</FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <FieldLabel>Ghi chú</FieldLabel>
                <Input placeholder="VD: Đặt cọc đợt 1" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving}>
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
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}{required && <span className="text-destructive"> *</span>}
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
