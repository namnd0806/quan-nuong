import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks, Wallet, Users, LayoutGrid, Info, SlidersHorizontal, Sun, Moon,
  Package, Plus, Pencil, Trash2, X, Loader2, Store, Scale, Flag, Star,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useTheme } from '@/components/theme-provider'
import { useCollection } from '@/hooks/useCollection'
import { supabase } from '@/lib/supabase'
import { formatVND, cn } from '@/lib/utils'

const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: ListChecks },
  { key: 'categories', label: 'Hạng mục', icon: LayoutGrid },
  { key: 'budget', label: 'Ngân sách', icon: Wallet },
  { key: 'people', label: 'Người phụ trách', icon: Users },
  { key: 'shared', label: 'Danh mục', icon: Package },
  { key: 'project', label: 'Thông tin dự án', icon: Info },
  { key: 'other', label: 'Tùy chọn khác', icon: SlidersHorizontal },
]

const BADGES = ['Chủ quản', 'Quản lý', 'Thành viên']
const badgeVariant = { 'Chủ quản': 'default', 'Quản lý': 'success', 'Thành viên': 'muted' }
const CAT_COLORS = ['hsl(221 83% 53%)', 'hsl(160 84% 39%)', 'hsl(38 92% 50%)', 'hsl(262 83% 66%)', 'hsl(330 81% 60%)', 'hsl(0 72% 58%)']
const CAT_ICONS = ['🏗️', '🎨', '🪑', '🍽️', '📣', '⚙️', '📦', '🏪']

const LOOKUP_TYPES = [
  { type: 'supplier_category', name: 'Danh mục nhà cung cấp', icon: Store, tone: 'destructive' },
  { type: 'equipment_category', name: 'Danh mục thiết bị', icon: Package, tone: 'info' },
  { type: 'unit', name: 'Đơn vị tính', icon: Scale, tone: 'warning' },
  { type: 'task_status', name: 'Trạng thái công việc', icon: Flag, tone: 'success' },
  { type: 'priority', name: 'Mức độ ưu tiên', icon: Star, tone: 'purple' },
]

const tone = {
  primary: { grad: 'from-primary/20 via-primary/5', ring: 'border-primary/30', tile: 'from-primary to-info', text: 'text-primary' },
  success: { grad: 'from-success/20 via-success/5', ring: 'border-success/30', tile: 'from-success to-emerald-400', text: 'text-success' },
  warning: { grad: 'from-warning/20 via-warning/5', ring: 'border-warning/30', tile: 'from-warning to-amber-400', text: 'text-warning' },
  info: { grad: 'from-info/20 via-info/5', ring: 'border-info/30', tile: 'from-info to-purple-400', text: 'text-info' },
  destructive: { grad: 'from-destructive/20 via-destructive/5', ring: 'border-destructive/30', tile: 'from-destructive to-rose-400', text: 'text-destructive' },
  purple: { grad: 'from-purple-500/20 via-purple-500/5', ring: 'border-purple-500/30', tile: 'from-purple-500 to-fuchsia-400', text: 'text-purple-400' },
}

async function saveSettings(patch) {
  const { error } = await supabase.from('settings').upsert({ id: 1, ...patch })
  if (error) throw error
}

export default function Settings() {
  const [tab, setTab] = useState('overview')
  const settings = useCollection('settings', { orderBy: 'id', ascending: true, realtime: false })
  const members = useCollection('members', { orderBy: 'sort', ascending: true })
  const categories = useCollection('main_categories', { orderBy: 'sort', ascending: true })
  const lookups = useCollection('lookups', { orderBy: 'sort', ascending: true })

  const s = settings.rows[0] || {}
  const ctx = { settings, members, categories, lookups, s }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display text-foreground md:text-3xl">Cài đặt</h1>
        <p className="mt-1 text-sm text-muted-foreground">Thiết lập các thông tin và tham số dùng chung cho toàn bộ hệ thống</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <OverviewTab ctx={ctx} />}
      {tab === 'categories' && <CategoriesCard ctx={ctx} />}
      {tab === 'budget' && <div className="max-w-xl"><BudgetCard ctx={ctx} /></div>}
      {tab === 'people' && <PeopleCard ctx={ctx} />}
      {tab === 'shared' && <SharedCatsSection ctx={ctx} />}
      {tab === 'project' && <ProjectInfoTab ctx={ctx} />}
      {tab === 'other' && <PreferencesTab ctx={ctx} />}
    </div>
  )
}

function OverviewTab({ ctx }) {
  const { categories, members, lookups, s } = ctx
  const OVERVIEW = [
    { label: 'Hạng mục', value: String(categories.rows.length), sub: 'đã thiết lập', icon: ListChecks, tone: 'info' },
    { label: 'Ngân sách tổng', value: formatVND(s.budget_total || 0), sub: 'đã thiết lập', icon: Wallet, tone: 'success' },
    { label: 'Người phụ trách', value: String(members.rows.length), sub: 'đã thiết lập', icon: Users, tone: 'warning' },
    { label: 'Danh mục khác', value: String(lookups.rows.length), sub: 'đã thiết lập', icon: LayoutGrid, tone: 'purple' },
  ]
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-lg font-display text-foreground">Tổng quan cài đặt</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Các thông tin dưới đây sẽ được sử dụng xuyên suốt trong toàn bộ hệ thống.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {OVERVIEW.map((o) => {
            const Icon = o.icon
            const t = tone[o.tone]
            return (
              <div key={o.label} className={cn('relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-5 card-glow', t.grad, t.ring)}>
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', t.tile)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn('text-xs font-semibold uppercase tracking-wider', t.text)}>{o.label}</div>
                    <div className="mt-1 truncate text-2xl font-bold text-foreground">{o.value}</div>
                    <div className="text-xs text-muted-foreground">{o.sub}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CategoriesCard ctx={ctx} />
        <BudgetCard ctx={ctx} />
        <PeopleCard ctx={ctx} />
      </div>

      <SharedCatsSection ctx={ctx} />
    </div>
  )
}

function CategoriesCard({ ctx }) {
  const { categories } = ctx
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const save = async (form) => {
    setSaving(true)
    try {
      const values = { name: form.name, icon: form.icon, color: form.color, sort: form.sort ?? categories.rows.length }
      if (form.id) await categories.update(form.id, values)
      else await categories.create(values)
      setOpen(false); setEditing(null)
    } catch (e) { alert('Lưu hạng mục thất bại: ' + e.message) }
    finally { setSaving(false) }
  }
  const del = async () => {
    setDeleting(true)
    try { await categories.remove(confirmDel.id); setConfirmDel(null) }
    catch (e) { alert('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">Hạng mục chính</h3>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-4 w-4" /> Thêm hạng mục</Button>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">Quản lý các hạng mục công việc trong quá trình xây quán.</p>
      <div className="mt-4 space-y-2">
        {categories.loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : categories.rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Chưa có hạng mục nào.</p>
        ) : categories.rows.map((c) => (
          <div key={c.id} className="group flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl" style={{ backgroundColor: c.color || 'hsl(215 20% 40%)' }}>
              <span>{c.icon || '📦'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-foreground">{c.name}</div>
            </div>
            <button onClick={() => { setEditing(c); setOpen(true) }} className="text-muted-foreground transition-colors hover:text-foreground" title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => setConfirmDel(c)} className="text-muted-foreground transition-colors hover:text-destructive" title="Xóa"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <CategoryFormModal open={open} item={editing} saving={saving} onClose={() => !saving && (setOpen(false), setEditing(null))} onSave={save} />
      <ConfirmDialog open={!!confirmDel} title="Xóa hạng mục?" message={confirmDel ? `Xóa “${confirmDel.name}”?` : ''} loading={deleting} onClose={() => setConfirmDel(null)} onConfirm={del} />
    </Card>
  )
}

function CategoryFormModal({ open, item, saving, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', icon: '📦', color: CAT_COLORS[0] })
  useEffect(() => {
    if (open) setForm(item ? { id: item.id, name: item.name || '', icon: item.icon || '📦', color: item.color || CAT_COLORS[0], sort: item.sort } : { name: '', icon: '📦', color: CAT_COLORS[0] })
  }, [open, item])
  const valid = form.name.trim()
  return (
    <ModalShell open={open} title={item ? 'Chỉnh sửa hạng mục' : 'Thêm hạng mục'} onClose={onClose}>
      <div className="space-y-4 px-5 py-5">
        <div>
          <FieldLabel required>Tên hạng mục</FieldLabel>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="VD: Thiết kế & thi công" autoFocus />
        </div>
        <div>
          <FieldLabel>Biểu tượng</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CAT_ICONS.map((ic) => (
              <button key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))} className={cn('flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors', form.icon === ic ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary')}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Màu sắc</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CAT_COLORS.map((col) => (
              <button key={col} onClick={() => setForm((f) => ({ ...f, color: col }))} className={cn('h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all', form.color === col ? 'ring-foreground' : 'ring-transparent')} style={{ background: col }} />
            ))}
          </div>
        </div>
      </div>
      <ModalFooter saving={saving} valid={valid} onClose={onClose} onSubmit={() => valid && onSave(form)} label={item ? 'Lưu thay đổi' : 'Thêm hạng mục'} />
    </ModalShell>
  )
}

function BudgetCard({ ctx }) {
  const { s } = ctx
  const [open, setOpen] = useState(false)
  const [total, setTotal] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (open) { setTotal(String(s.budget_total || '')); setNote(s.description || '') } }, [open, s])

  const save = async () => {
    setSaving(true)
    try { await saveSettings({ budget_total: Number(total) || 0 }); setOpen(false) }
    catch (e) { alert('Lưu thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">Thiết lập ngân sách</h3>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Chỉnh sửa</Button>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">Thiết lập ngân sách tổng cho dự án.</p>

      <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-5">
        <div className="text-xs font-medium text-muted-foreground">Ngân sách tổng dự kiến</div>
        <div className="mt-1 text-3xl font-bold text-success">{formatVND(s.budget_total || 0)}</div>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <dt className="text-muted-foreground">Tiền tệ</dt>
          <dd className="font-medium text-foreground">{s.currency || 'VND'} (đồng)</dd>
        </div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <dt className="text-muted-foreground">Ngày bắt đầu theo dõi</dt>
          <dd className="font-medium text-foreground">{s.start_date ? new Date(s.start_date).toLocaleDateString('vi-VN') : '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Mục tiêu Food Cost</dt>
          <dd className="font-medium text-foreground">{s.food_cost_target || 30}%</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-info/10 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        Ngân sách sẽ được sử dụng làm mặc định khi tạo các khoản chi trong phần Quản lý ngân sách.
      </div>

      <ModalShell open={open} title="Thiết lập ngân sách" onClose={() => !saving && setOpen(false)}>
        <div className="space-y-4 px-5 py-5">
          <div>
            <FieldLabel required>Ngân sách tổng (VND)</FieldLabel>
            <Input inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value.replace(/[^\d]/g, ''))} autoFocus />
            {total && <p className="mt-1 text-xs text-muted-foreground">{formatVND(Number(total))}</p>}
          </div>
        </div>
        <ModalFooter saving={saving} valid={Number(total) > 0} onClose={() => setOpen(false)} onSubmit={save} label="Lưu thay đổi" />
      </ModalShell>
    </Card>
  )
}

function PeopleCard({ ctx }) {
  const { members } = ctx
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const save = async (form) => {
    setSaving(true)
    try {
      const values = { name: form.name, role: form.role || null, badge: form.badge, sort: form.sort ?? members.rows.length }
      if (form.id) await members.update(form.id, values)
      else await members.create(values)
      setOpen(false); setEditing(null)
    } catch (e) { alert('Lưu thất bại: ' + e.message) }
    finally { setSaving(false) }
  }
  const del = async () => {
    setDeleting(true)
    try { await members.remove(confirmDel.id); setConfirmDel(null) }
    catch (e) { alert('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">Người phụ trách</h3>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-4 w-4" /> Thêm người</Button>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">Quản lý danh sách người phụ trách công việc.</p>
      <div className="mt-4 space-y-2">
        {members.loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : members.rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Chưa có người phụ trách nào.</p>
        ) : members.rows.map((p) => (
          <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <Avatar className="h-10 w-10"><AvatarFallback>{(p.name || '?').charAt(0)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-foreground">{p.name}</div>
              <div className="truncate text-xs text-muted-foreground">{p.role || '—'}</div>
            </div>
            <Badge variant={badgeVariant[p.badge] || 'muted'}>{p.badge || 'Thành viên'}</Badge>
            <button onClick={() => { setEditing(p); setOpen(true) }} className="text-muted-foreground transition-colors hover:text-foreground" title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => setConfirmDel(p)} className="text-muted-foreground transition-colors hover:text-destructive" title="Xóa"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-info/10 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        Người phụ trách sẽ được gán cho các công việc, hạng mục, nhà cung cấp và chi phí trong hệ thống.
      </div>

      <MemberFormModal open={open} item={editing} saving={saving} onClose={() => !saving && (setOpen(false), setEditing(null))} onSave={save} />
      <ConfirmDialog open={!!confirmDel} title="Xóa người phụ trách?" message={confirmDel ? `Xóa “${confirmDel.name}”?` : ''} loading={deleting} onClose={() => setConfirmDel(null)} onConfirm={del} />
    </Card>
  )
}

function MemberFormModal({ open, item, saving, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', role: '', badge: 'Thành viên' })
  useEffect(() => {
    if (open) setForm(item ? { id: item.id, name: item.name || '', role: item.role || '', badge: item.badge || 'Thành viên', sort: item.sort } : { name: '', role: '', badge: 'Thành viên' })
  }, [open, item])
  const valid = form.name.trim()
  return (
    <ModalShell open={open} title={item ? 'Chỉnh sửa người phụ trách' : 'Thêm người phụ trách'} onClose={onClose}>
      <div className="space-y-4 px-5 py-5">
        <div>
          <FieldLabel required>Tên</FieldLabel>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="VD: Nam" autoFocus />
        </div>
        <div>
          <FieldLabel>Vai trò</FieldLabel>
          <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="VD: Chủ đầu tư" />
        </div>
        <div>
          <FieldLabel>Cấp bậc</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <button key={b} onClick={() => setForm((f) => ({ ...f, badge: b }))} className={cn('rounded-lg border px-3 py-1.5 text-sm transition-colors', form.badge === b ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-secondary')}>{b}</button>
            ))}
          </div>
        </div>
      </div>
      <ModalFooter saving={saving} valid={valid} onClose={onClose} onSubmit={() => valid && onSave(form)} label={item ? 'Lưu thay đổi' : 'Thêm người'} />
    </ModalShell>
  )
}

function SharedCatsSection({ ctx }) {
  const { lookups } = ctx
  const [manage, setManage] = useState(null)
  const byType = useMemo(() => {
    const map = {}
    for (const l of lookups.rows) (map[l.type] ||= []).push(l)
    return map
  }, [lookups.rows])

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg text-foreground">Danh mục dùng chung</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Thiết lập các danh mục chung được sử dụng trong hệ thống.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {LOOKUP_TYPES.map((c) => {
          const Icon = c.icon
          const t = tone[c.tone]
          const list = byType[c.type] || []
          return (
            <div key={c.type} className={cn('flex flex-col rounded-2xl border bg-gradient-to-br to-transparent p-4 card-glow', t.grad, t.ring)}>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', t.tile)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className={cn('mt-3 text-sm font-semibold', t.text)}>{c.name}</div>
              <div className="mt-0.5 text-lg font-bold text-foreground">{list.length} mục</div>
              <div className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">{list.map((l) => l.label).join(', ') || 'Chưa có mục nào'}</div>
              <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => setManage(c)}>Quản lý</Button>
            </div>
          )
        })}
      </div>
      <LookupManagerModal cfg={manage} lookups={lookups} onClose={() => setManage(null)} />
    </Card>
  )
}

function LookupManagerModal({ cfg, lookups, onClose }) {
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { setLabel('') }, [cfg])
  const list = useMemo(() => (cfg ? lookups.rows.filter((l) => l.type === cfg.type) : []), [cfg, lookups.rows])

  const add = async () => {
    if (!label.trim() || busy) return
    setBusy(true)
    try { await lookups.create({ type: cfg.type, label: label.trim(), sort: list.length }); setLabel('') }
    catch (e) { alert('Thêm thất bại: ' + e.message) }
    finally { setBusy(false) }
  }
  const del = async (id) => {
    try { await lookups.remove(id) } catch (e) { alert('Xóa thất bại: ' + e.message) }
  }

  return (
    <ModalShell open={!!cfg} title={cfg?.name || 'Danh mục'} onClose={onClose}>
      <div className="space-y-3 px-5 py-5">
        <div className="flex items-center gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Nhập mục mới rồi Enter" autoFocus />
          <Button onClick={add} disabled={!label.trim() || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}</Button>
        </div>
        <div className="max-h-[320px] space-y-2 overflow-y-auto">
          {list.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Chưa có mục nào.</p>
          ) : list.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
              <span className="text-foreground">{l.label}</span>
              <button onClick={() => del(l.id)} className="text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end border-t border-border px-5 py-4">
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      </div>
    </ModalShell>
  )
}

function ProjectInfoTab({ ctx }) {
  const { s } = ctx
  const [form, setForm] = useState({ project_name: '', address: '', opening_date: '', start_date: '', description: '' })
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setForm({
      project_name: s.project_name || '', address: s.address || '',
      opening_date: s.opening_date || '', start_date: s.start_date || '', description: s.description || '',
    })
  }, [s.id, s.project_name, s.address, s.opening_date, s.start_date, s.description])

  const save = async () => {
    setSaving(true)
    try {
      await saveSettings({
        project_name: form.project_name, address: form.address || null,
        opening_date: form.opening_date || null, start_date: form.start_date || null, description: form.description || null,
      })
      await ctx.settings.refetch()
    } catch (e) { alert('Lưu thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <Card className="max-w-2xl p-6">
      <h3 className="font-display text-lg text-foreground">Thông tin dự án</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Thông tin chung của dự án mở quán.</p>
      <div className="mt-5 space-y-4">
        <Field label="Tên dự án"><Input value={form.project_name} onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))} /></Field>
        <Field label="Địa chỉ"><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ngày dự kiến khai trương"><Input type="date" value={form.opening_date || ''} onChange={(e) => setForm((f) => ({ ...f, opening_date: e.target.value }))} /></Field>
          <Field label="Ngày bắt đầu theo dõi"><Input type="date" value={form.start_date || ''} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /></Field>
        </div>
        <Field label="Mô tả">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={save} disabled={saving || !form.project_name.trim()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Lưu thay đổi
        </Button>
      </div>
    </Card>
  )
}

function PreferencesTab({ ctx }) {
  const { s } = ctx
  const { theme, toggle } = useTheme()
  const [target, setTarget] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setTarget(String(s.food_cost_target ?? 30)) }, [s.food_cost_target])

  const saveTarget = async () => {
    setSaving(true)
    try { await saveSettings({ food_cost_target: Number(target) || 30 }); await ctx.settings.refetch() }
    catch (e) { alert('Lưu thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <Card className="max-w-2xl p-6">
      <h3 className="font-display text-lg text-foreground">Tùy chọn khác</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Cấu hình hiển thị và tham số mặc định.</p>
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
          <div>
            <div className="font-medium text-foreground">Giao diện</div>
            <div className="text-xs text-muted-foreground">Chuyển đổi giữa chế độ sáng và tối.</div>
          </div>
          <Button variant="secondary" size="sm" onClick={toggle}>
            {theme === 'dark' ? <><Moon className="h-4 w-4" /> Tối</> : <><Sun className="h-4 w-4" /> Sáng</>}
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
          <div>
            <div className="font-medium text-foreground">Mục tiêu Food Cost mặc định</div>
            <div className="text-xs text-muted-foreground">Ngưỡng cảnh báo khi giá vốn vượt mục tiêu.</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20"><Input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ''))} className="text-center" /></div>
            <Button size="sm" onClick={saveTarget} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}</Button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
          <div>
            <div className="font-medium text-foreground">Đơn vị tiền tệ</div>
            <div className="text-xs text-muted-foreground">Dùng để hiển thị số tiền trong hệ thống.</div>
          </div>
          <Badge variant="muted">{s.currency || 'VND'} (đồng)</Badge>
        </div>
      </div>
    </Card>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}{required && <span className="text-destructive"> *</span>}
    </label>
  )
}

function ModalShell({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl text-foreground">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ModalFooter({ saving, valid, onClose, onSubmit, label }) {
  return (
    <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
      <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
      <Button onClick={onSubmit} disabled={!valid || saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </div>
  )
}
