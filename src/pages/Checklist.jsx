import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, SlidersHorizontal, ClipboardList, Clock, Hourglass,
  CheckCircle2, XCircle, Calendar, HardHat, Wrench, Sofa, Megaphone, Users,
  X, Settings2, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { BadgeSelect } from '@/components/ui/badge-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { useCollection } from '@/hooks/useCollection'
import { cn } from '@/lib/utils'

const DEPT = {
  'Xây dựng': { icon: HardHat, color: 'hsl(38 92% 50%)' },
  'Thiết bị': { icon: Wrench, color: 'hsl(221 83% 53%)' },
  'Nội thất': { icon: Sofa, color: 'hsl(262 83% 66%)' },
  'Marketing': { icon: Megaphone, color: 'hsl(330 81% 60%)' },
  'Nhân sự': { icon: Users, color: 'hsl(160 84% 39%)' },
}

const PRIORITY = {
  high: { label: 'Cao', variant: 'destructive' },
  medium: { label: 'Trung bình', variant: 'warning' },
  low: { label: 'Thấp', variant: 'success' },
}

const STATUS = {
  done: { label: 'Hoàn thành', variant: 'success' },
  doing: { label: 'Đang làm', variant: 'info' },
  todo: { label: 'Chưa làm', variant: 'muted' },
  overdue: { label: 'Quá hạn', variant: 'destructive' },
}

const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([value, m]) => ({ value, ...m }))
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, m]) => ({ value, ...m }))

const cardTone = {
  primary: { grad: 'from-primary/20 via-primary/5', ring: 'border-primary/30', tile: 'from-primary to-info', text: 'text-primary', active: 'ring-2 ring-primary' },
  warning: { grad: 'from-warning/20 via-warning/5', ring: 'border-warning/30', tile: 'from-warning to-amber-400', text: 'text-warning', active: 'ring-2 ring-warning' },
  info: { grad: 'from-info/20 via-info/5', ring: 'border-info/30', tile: 'from-info to-purple-400', text: 'text-info', active: 'ring-2 ring-info' },
  success: { grad: 'from-success/20 via-success/5', ring: 'border-success/30', tile: 'from-success to-emerald-400', text: 'text-success', active: 'ring-2 ring-success' },
  destructive: { grad: 'from-destructive/20 via-destructive/5', ring: 'border-destructive/30', tile: 'from-destructive to-rose-400', text: 'text-destructive', active: 'ring-2 ring-destructive' },
}

const DEPARTMENTS = Object.keys(DEPT)

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '—' }
}

export default function Checklist() {
  const toast = useToast()
  const { rows: tasks, loading, error, create, update, remove } = useCollection('checklist_tasks', { notify: { label: 'công việc', type: 'update' } })
  const { rows: members } = useCollection('members', { orderBy: 'sort', ascending: true })
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('all')
  const [priority, setPriority] = useState('all')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const assignees = useMemo(() => (members.length ? members.map((m) => m.name) : ['Nam', 'Phương']), [members])

  const patch = (id, p) => update(id, p).catch((e) => toast.error('Cập nhật thất bại: ' + e.message))

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
  }), [tasks])

  const STAT_CARDS = [
    { key: 'all', label: 'Tất cả', value: counts.all, icon: ClipboardList, tone: 'primary' },
    { key: 'todo', label: 'Chưa làm', value: counts.todo, icon: Clock, tone: 'warning' },
    { key: 'doing', label: 'Đang làm', value: counts.doing, icon: Hourglass, tone: 'info' },
    { key: 'done', label: 'Hoàn thành', value: counts.done, icon: CheckCircle2, tone: 'success' },
    { key: 'overdue', label: 'Quá hạn', value: counts.overdue, icon: XCircle, tone: 'destructive' },
  ]

  const filtered = useMemo(() => tasks.filter((t) => {
    if (tab !== 'all' && t.status !== tab) return false
    if (dept !== 'all' && t.dept !== dept) return false
    if (priority !== 'all' && t.priority !== priority) return false
    if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [tasks, tab, dept, priority, query])

  const handleSave = async (draft) => {
    setSaving(true)
    try {
      const values = {
        title: draft.title, description: draft.description || null, dept: draft.dept || null,
        assignee: draft.assignee || null, deadline: draft.deadline || null,
        priority: draft.priority, status: draft.status,
      }
      if (draft.id) await update(draft.id, values)
      else await create(values)
      toast.success(draft.id ? 'Đã cập nhật công việc.' : 'Đã thêm công việc.')
      setPanelOpen(false); setEditing(null)
    } catch (e) { toast.error('Lưu công việc thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await remove(confirmDel.id); toast.success('Đã xóa công việc.'); setConfirmDel(null) }
    catch (e) { toast.error('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  const openAdd = () => { setEditing(null); setPanelOpen(true) }
  const openEdit = (t) => { setEditing(t); setPanelOpen(true) }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground md:text-3xl">Checklist Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi các công việc chuẩn bị mở quán</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Thêm công việc</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          const t = cardTone[s.tone]
          const isActive = tab === s.key
          return (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-5 text-left card-glow transition-all hover:-translate-y-0.5',
                t.grad, t.ring, isActive && t.active
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', t.tile)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className={cn('text-xs font-semibold uppercase tracking-wider', t.text)}>{s.label}</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">công việc</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm công việc..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hạng mục</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ưu tiên</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => { setTab('all'); setDept('all'); setPriority('all'); setQuery('') }}>
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="w-12 p-4"></th>
                <th className="p-4 font-semibold">Công việc</th>
                <th className="p-4 font-semibold">Hạng mục</th>
                <th className="p-4 font-semibold">Người phụ trách</th>
                <th className="p-4 font-semibold">Deadline</th>
                <th className="p-4 font-semibold">Ưu tiên</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="w-20 p-4 text-right"><Settings2 className="ml-auto h-4 w-4" /></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="p-10 text-center text-sm text-destructive">Không tải được dữ liệu: {error.message}</td></tr>
              ) : filtered.map((t) => {
                const d = DEPT[t.dept] || {}
                const DeptIcon = d.icon
                return (
                  <tr key={t.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={t.status === 'done'}
                        onChange={(e) => patch(t.id, { status: e.target.checked ? 'done' : 'todo' })}
                        className="h-4 w-4 cursor-pointer accent-[hsl(221_83%_53%)]"
                      />
                    </td>
                    <td className="p-4">
                      <span className={cn('font-medium text-foreground', t.status === 'done' && 'text-muted-foreground line-through')}>{t.title}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-foreground">
                        {DeptIcon && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${d.color.replace(')', ' / 0.15)')}`, color: d.color }}>
                            <DeptIcon className="h-4 w-4" />
                          </span>
                        )}
                        {t.dept || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-foreground">
                        {t.assignee ? (<><Avatar className="h-7 w-7"><AvatarFallback className="text-[11px]">{t.assignee.charAt(0)}</AvatarFallback></Avatar>{t.assignee}</>) : <span className="text-muted-foreground">Chưa giao</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> {fmtDate(t.deadline)}
                      </span>
                    </td>
                    <td className="p-4">
                      <BadgeSelect value={t.priority} options={PRIORITY_OPTIONS} onChange={(v) => patch(t.id, { priority: v })} />
                    </td>
                    <td className="p-4">
                      <BadgeSelect value={t.status} options={STATUS_OPTIONS} onChange={(v) => patch(t.id, { status: v })} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Xóa" onClick={() => setConfirmDel(t)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-sm text-muted-foreground">Không có công việc nào khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && !error && <div className="text-sm text-muted-foreground">Hiển thị {filtered.length} / {counts.all} công việc</div>}

      <TaskPanel open={panelOpen} task={editing} assignees={assignees} saving={saving} onClose={() => !saving && (setPanelOpen(false), setEditing(null))} onSave={handleSave} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa công việc?"
        message={confirmDel ? `Bạn có chắc muốn xóa “${confirmDel.title}”?` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function PanelLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}{required && <span className="text-destructive"> *</span>}
    </label>
  )
}

const emptyTask = { title: '', description: '', dept: '', assignee: '', deadline: '', priority: 'medium', status: 'todo' }

function TaskPanel({ open, task, assignees, saving, onClose, onSave }) {
  const [draft, setDraft] = useState(emptyTask)
  useEffect(() => { if (open) setDraft(task ? { ...emptyTask, ...task, deadline: task.deadline || '' } : emptyTask) }, [open, task])
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const valid = draft.title.trim()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl text-foreground">{draft.id ? 'Chỉnh sửa công việc' : 'Thêm công việc'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <PanelLabel required>Tên công việc</PanelLabel>
                <Input placeholder="Nhập tên công việc" value={draft.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div>
                <PanelLabel>Mô tả công việc</PanelLabel>
                <textarea
                  rows={3} placeholder="Nhập mô tả chi tiết công việc..." value={draft.description || ''} onChange={(e) => set('description', e.target.value)}
                  className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <PanelLabel>Hạng mục</PanelLabel>
                <Select value={draft.dept || undefined} onValueChange={(v) => set('dept', v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn hạng mục" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <PanelLabel>Người phụ trách</PanelLabel>
                <Select value={draft.assignee || undefined} onValueChange={(v) => set('assignee', v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn người phụ trách" /></SelectTrigger>
                  <SelectContent>{assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Deadline</PanelLabel>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="date" className="pl-9" value={draft.deadline || ''} onChange={(e) => set('deadline', e.target.value)} />
                  </div>
                </div>
                <div>
                  <PanelLabel required>Ưu tiên</PanelLabel>
                  <Select value={draft.priority} onValueChange={(v) => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <PanelLabel required>Trạng thái</PanelLabel>
                <Select value={draft.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Chưa làm</SelectItem>
                    <SelectItem value="doing">Đang làm</SelectItem>
                    <SelectItem value="done">Hoàn thành</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border p-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={() => valid && onSave(draft)} disabled={!valid || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {draft.id ? 'Lưu thay đổi' : 'Lưu công việc'}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
