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
  'Xây dựng': { icon: HardHat, color: '#FB923C' },
  'Thiết bị': { icon: Wrench, color: '#3B82F6' },
  'Nội thất': { icon: Sofa, color: '#A78BFA' },
  'Marketing': { icon: Megaphone, color: '#EC4899' },
  'Nhân sự': { icon: Users, color: '#34D399' },
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

  const assignees = useMemo(() => (members.length ? members.map((m) => m.name) : ['Nam', 'Bảo']), [members])

  const patch = (id, p) => update(id, p).catch((e) => toast.error('Cập nhật thất bại: ' + e.message))

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
  }), [tasks])

  const STAT_CARDS = [
    { key: 'all', label: 'TẤT CẢ', value: counts.all, icon: ClipboardList, bg: 'rgba(59, 130, 246, 0.1)', iconBg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)', text: 'text-blue-400' },
    { key: 'todo', label: 'CHƯA LÀM', value: counts.todo, icon: Clock, bg: 'rgba(251, 146, 60, 0.1)', iconBg: 'rgba(251, 146, 60, 0.2)', border: 'rgba(251, 146, 60, 0.3)', text: 'text-orange-400' },
    { key: 'doing', label: 'ĐANG LÀM', value: counts.doing, icon: Hourglass, bg: 'rgba(168, 85, 247, 0.1)', iconBg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.3)', text: 'text-purple-400' },
    { key: 'done', label: 'HOÀN THÀNH', value: counts.done, icon: CheckCircle2, bg: 'rgba(52, 211, 153, 0.1)', iconBg: 'rgba(52, 211, 153, 0.2)', border: 'rgba(52, 211, 153, 0.3)', text: 'text-emerald-400' },
    { key: 'overdue', label: 'QUÁ HẠN', value: counts.overdue, icon: XCircle, bg: 'rgba(248, 113, 113, 0.1)', iconBg: 'rgba(248, 113, 113, 0.2)', border: 'rgba(248, 113, 113, 0.3)', text: 'text-red-400' },
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checklist</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Theo dõi các công việc chuẩn bị mở quán</p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
          <Plus className="h-4 w-4" /> Thêm công việc
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((s, i) => {
          const Icon = s.icon
          const isActive = tab === s.key
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => setTab(s.key)}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-5 text-left transition-all hover:scale-105',
                isActive ? 'ring-2' : 'hover:border-white/20'
              )}
              style={{
                background: isActive ? s.bg : 'linear-gradient(145deg, rgba(15,30,50,0.5), rgba(10,22,40,0.7))',
                borderColor: isActive ? s.border : 'rgba(255,255,255,0.1)',
                ringColor: s.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: s.iconBg }}
                >
                  <Icon className={cn('h-6 w-6', s.text)} />
                </div>
                <div>
                  <div className={cn('text-[10px] font-semibold uppercase tracking-wider', s.text)}>{s.label}</div>
                  <div className="mt-1 text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-gray-500">công việc</div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="rounded-xl border-white/10 bg-white/5 pl-10 backdrop-blur-sm focus:border-blue-500/50 focus:bg-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hạng mục</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[150px] rounded-xl border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ưu tiên</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={() => { setTab('all'); setDept('all'); setPriority('all'); setQuery('') }}
            className="gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          >
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-400" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th className="w-12 p-4"></th>
                <th className="p-4 font-semibold">CÔNG VIỆC</th>
                <th className="p-4 font-semibold">HẠNG MỤC</th>
                <th className="p-4 font-semibold">NGƯỜI PHỤ TRÁCH</th>
                <th className="p-4 font-semibold">DEADLINE</th>
                <th className="p-4 font-semibold">ƯU TIÊN</th>
                <th className="p-4 font-semibold">TRẠNG THÁI</th>
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
                  <tr key={t.id} className="border-b border-white/5 transition-all last:border-0 hover:bg-white/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={t.status === 'done'}
                        onChange={(e) => patch(t.id, { status: e.target.checked ? 'done' : 'todo' })}
                        className="h-4 w-4 cursor-pointer rounded accent-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <span className={cn('font-medium text-foreground', t.status === 'done' && 'text-gray-500 line-through')}>{t.title}</span>
                    </td>
                    <td className="p-4">
                      {t.dept ? (
                        <span className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold" style={{ background: `${d.color}20`, color: d.color }}>
                          {DeptIcon && <DeptIcon className="h-3.5 w-3.5" />}
                          {t.dept}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {t.assignee ? (
                        <span className="inline-flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-[11px] font-semibold text-white">
                              {t.assignee.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground">{t.assignee}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Chưa giao</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-gray-400">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-white/10"
                          title="Chỉnh sửa"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                          title="Xóa"
                          onClick={() => setConfirmDel(t)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {!loading && !error && <div className="text-sm text-gray-400">Hiển thị {filtered.length} / {counts.all} công việc</div>}

      <TaskPanel open={panelOpen} task={editing} assignees={assignees} saving={saving} onClose={() => !saving && (setPanelOpen(false), setEditing(null))} onSave={handleSave} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa công việc?"
        message={confirmDel ? `Bạn có chắc muốn xóa "${confirmDel.title}"?` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function PanelLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-gray-400">
      {children}{required && <span className="text-red-400"> *</span>}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[500px] flex-col overflow-hidden rounded-l-3xl border-l border-white/10 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.98), rgba(10,22,40,0.98))' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-foreground">{draft.id ? 'Chỉnh sửa công việc' : 'Thêm công việc'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="rounded-xl hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <div>
                <PanelLabel required>Tên công việc</PanelLabel>
                <Input
                  placeholder="Nhập tên công việc"
                  value={draft.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10"
                />
              </div>
              <div>
                <PanelLabel>Mô tả công việc</PanelLabel>
                <textarea
                  rows={3}
                  placeholder="Nhập mô tả chi tiết công việc..."
                  value={draft.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground transition-all placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <PanelLabel>Hạng mục</PanelLabel>
                <Select value={draft.dept || undefined} onValueChange={(v) => set('dept', v)}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                    <SelectValue placeholder="Chọn hạng mục" />
                  </SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <PanelLabel>Người phụ trách</PanelLabel>
                <Select value={draft.assignee || undefined} onValueChange={(v) => set('assignee', v)}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                    <SelectValue placeholder="Chọn người phụ trách" />
                  </SelectTrigger>
                  <SelectContent>{assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Deadline</PanelLabel>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      className="rounded-xl border-white/10 bg-white/5 pl-10"
                      value={draft.deadline || ''}
                      onChange={(e) => set('deadline', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <PanelLabel required>Ưu tiên</PanelLabel>
                  <Select value={draft.priority} onValueChange={(v) => set('priority', v)}>
                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
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
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Chưa làm</SelectItem>
                    <SelectItem value="doing">Đang làm</SelectItem>
                    <SelectItem value="done">Hoàn thành</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
              >
                Hủy
              </Button>
              <Button
                onClick={() => valid && onSave(draft)}
                disabled={!valid || saving}
                className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30"
              >
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
