import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, X, Pin, StickyNote, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useCollection } from '@/hooks/useCollection'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const TAGS = {
  general: { label: 'Chung', variant: 'muted' },
  idea: { label: 'Ý tưởng', variant: 'info' },
  todo: { label: 'Cần làm', variant: 'warning' },
  important: { label: 'Quan trọng', variant: 'destructive' },
}
const TAG_OPTIONS = Object.entries(TAGS).map(([value, m]) => ({ value, ...m }))

const emptyDraft = { title: '', body: '', tag: 'general' }

function fmtDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return '' }
}

export default function Notes() {
  const toast = useToast()
  const { profile } = useAuth()
  const { rows: notes, loading, error, create, update, remove } = useCollection('notes', { notify: { label: 'ghi chú', type: 'update' } })
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('all')
  const [editing, setEditing] = useState(null) // note object or draft
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const list = notes.filter((n) => {
      if (tag !== 'all' && n.tag !== tag) return false
      if (query && !`${n.title} ${n.body || ''}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned))
  }, [notes, query, tag])

  const save = async (draft) => {
    setSaving(true)
    try {
      if (draft.id) {
        await update(draft.id, { title: draft.title, body: draft.body, tag: draft.tag })
      } else {
        await create({ title: draft.title, body: draft.body, tag: draft.tag, author: profile?.name || 'Bạn', pinned: false })
      }
      toast.success('Đã lưu ghi chú.')
      setEditing(null)
    } catch (e) {
      toast.error('Lưu ghi chú thất bại: ' + e.message)
    } finally {
      setSaving(false)
    }
  }
  const togglePin = (n) => update(n.id, { pinned: !n.pinned }).catch((e) => toast.error('Không thể ghim: ' + e.message))
  const confirmRemove = async (id) => { try { await remove(id); toast.success('Đã xóa ghi chú.') } catch (e) { toast.error('Xóa thất bại: ' + e.message) } setConfirmDel(null) }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">Ghi chú</h1>
          <p className="mt-1 text-sm text-gray-400">Ghi chú và trao đổi nhanh giữa các chủ quán</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyDraft })} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
          <Plus className="h-4 w-4" /> Thêm ghi chú
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm ghi chú..." className="rounded-xl border-white/10 bg-white/5 pl-9 focus:border-blue-500/50 focus:bg-white/10" />
        </div>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-[170px] rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhãn</SelectItem>
            {TAG_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center gap-3 rounded-2xl border-white/10 bg-white/5 p-16 text-sm text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải ghi chú...
        </Card>
      ) : error ? (
        <Card className="rounded-2xl border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">Không tải được dữ liệu: {error.message}. Kiểm tra đã chạy schema.sql chưa.</Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border-white/10 bg-white/5 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-400"><StickyNote className="h-7 w-7" /></div>
          <div className="text-sm text-gray-400">Chưa có ghi chú nào khớp bộ lọc.</div>
          <Button variant="secondary" size="sm" onClick={() => setEditing({ ...emptyDraft })} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
            <Plus className="h-4 w-4" /> Tạo ghi chú đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => {
            const t = TAGS[n.tag] || TAGS.general
            return (
              <Card key={n.id} className={cn('group flex flex-col rounded-2xl border-white/10 p-5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10', n.pinned && 'ring-1 ring-blue-400/40')} style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={t.variant}>{t.label}</Badge>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => togglePin(n)} className={cn('rounded p-1 hover:text-foreground', n.pinned ? 'text-blue-400' : 'text-gray-400')} title="Ghim"><Pin className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(n)} className="rounded p-1 text-gray-400 hover:text-foreground" title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDel(n)} className="rounded p-1 text-gray-400 hover:text-red-400" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{n.title}</h3>
                <p className="mt-1 flex-1 whitespace-pre-wrap text-sm text-gray-400">{n.body}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-500">
                  <span>{n.author}</span>
                  <span>{fmtDate(n.created_at)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <NoteModal note={editing} saving={saving} onClose={() => !saving && setEditing(null)} onSave={save} />
      <ConfirmDelete note={confirmDel} onClose={() => setConfirmDel(null)} onConfirm={confirmRemove} />
    </div>
  )
}

function NoteModal({ note, saving, onClose, onSave }) {
  const [draft, setDraft] = useState(emptyDraft)
  React.useEffect(() => { if (note) setDraft({ ...emptyDraft, ...note }) }, [note])
  const valid = draft.title.trim().length > 0

  return (
    <AnimatePresence>
      {note && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.98), rgba(10,22,40,0.98))' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-foreground">{draft.id ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú'}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="rounded-xl hover:bg-white/10"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Tiêu đề <span className="text-red-400">*</span></label>
                <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Nhập tiêu đề ghi chú" className="rounded-xl border-white/10 bg-white/5 focus:border-blue-500/50 focus:bg-white/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Nhãn</label>
                <Select value={draft.tag} onValueChange={(v) => setDraft((d) => ({ ...d, tag: v }))}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent>{TAG_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Nội dung</label>
                <textarea
                  rows={4} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                  placeholder="Nhập nội dung ghi chú..."
                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Hủy</Button>
              <Button disabled={!valid || saving} onClick={() => onSave(draft)} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {draft.id ? 'Lưu thay đổi' : 'Lưu'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ConfirmDelete({ note, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {note && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.98), rgba(10,22,40,0.98))' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400"><Trash2 className="h-6 w-6" /></div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Xóa ghi chú?</h2>
            <p className="mt-1 text-sm text-gray-400">Bạn có chắc muốn xóa &quot;{note.title}&quot;? Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Hủy</Button>
              <Button variant="destructive" onClick={() => onConfirm(note.id)} className="rounded-xl bg-red-600 hover:bg-red-700">Xóa</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
