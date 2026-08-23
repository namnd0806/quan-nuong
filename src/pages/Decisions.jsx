import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, HelpCircle, CheckCircle2, Trash2, X, Loader2, Vote, Check, Pencil,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useCollection } from '@/hooks/useCollection'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function Decisions() {
  const { rows: decisions, loading, error, create, update, remove } = useCollection('decisions')
  const { rows: options, refetch: refetchOptions } = useCollection('decision_options', { orderBy: 'created_at', ascending: true })
  const { profile, user } = useAuth()
  const me = profile?.name || user?.email?.split('@')[0] || 'Tôi'

  const [tab, setTab] = useState('pending')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const optionsByDecision = useMemo(() => {
    const map = {}
    for (const o of options) (map[o.decision_id] ||= []).push(o)
    return map
  }, [options])

  const enriched = useMemo(() => decisions.map((d) => ({ ...d, options: optionsByDecision[d.id] || [] })), [decisions, optionsByDecision])
  const filtered = useMemo(() => enriched.filter((d) => (tab === 'all' ? true : d.status === tab)), [enriched, tab])

  const counts = useMemo(() => ({
    all: enriched.length,
    pending: enriched.filter((d) => d.status === 'pending').length,
    decided: enriched.filter((d) => d.status === 'decided').length,
  }), [enriched])

  const handleCreate = async ({ title, description, optionLabels }) => {
    setSaving(true)
    try {
      const dec = await create({ title, description: description || null, status: 'pending' })
      const rows = optionLabels.filter(Boolean).map((label) => ({ decision_id: dec.id, label, votes: [] }))
      if (rows.length) {
        const { error } = await supabase.from('decision_options').insert(rows)
        if (error) throw error
        await refetchOptions()
      }
      setFormOpen(false)
    } catch (e) { alert('Tạo quyết định thất bại: ' + e.message) }
    finally { setSaving(false) }
  }

  const toggleVote = async (option) => {
    const votes = Array.isArray(option.votes) ? option.votes : []
    const next = votes.includes(me) ? votes.filter((v) => v !== me) : [...votes, me]
    const { error } = await supabase.from('decision_options').update({ votes: next }).eq('id', option.id)
    if (error) { alert('Bình chọn thất bại: ' + error.message); return }
    await refetchOptions()
  }

  const decide = async (decision, option) => {
    try { await update(decision.id, { status: 'decided', final_option: option.label }) }
    catch (e) { alert('Cập nhật thất bại: ' + e.message) }
  }
  const reopen = async (decision) => {
    try { await update(decision.id, { status: 'pending', final_option: null }) }
    catch (e) { alert('Cập nhật thất bại: ' + e.message) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await remove(confirmDel.id); setConfirmDel(null) }
    catch (e) { alert('Xóa thất bại: ' + e.message) }
    finally { setDeleting(false) }
  }

  const TABS = [
    { key: 'pending', label: 'Đang chờ', count: counts.pending },
    { key: 'decided', label: 'Đã quyết', count: counts.decided },
    { key: 'all', label: 'Tất cả', count: counts.all },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground md:text-3xl">Chờ quyết định</h1>
          <p className="mt-1 text-sm text-muted-foreground">Các vấn đề cần 2 chủ quán cùng thống nhất</p>
        </div>
        <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Tạo quyết định</Button>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-secondary/60 p-1">
        {TABS.map((t) => (
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

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : error ? (
        <div className="py-10 text-center text-sm text-destructive">Không tải được dữ liệu: {error.message}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Chưa có quyết định nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((d) => (
            <DecisionCard key={d.id} d={d} me={me} onVote={toggleVote} onDecide={decide} onReopen={reopen} onDelete={() => setConfirmDel(d)} />
          ))}
        </div>
      )}

      <DecisionFormModal open={formOpen} saving={saving} onClose={() => !saving && setFormOpen(false)} onSave={handleCreate} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Xóa quyết định?"
        message={confirmDel ? `Bạn có chắc muốn xóa “${confirmDel.title}”?` : ''}
        loading={deleting}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function DecisionCard({ d, me, onVote, onDecide, onReopen, onDelete }) {
  const decided = d.status === 'decided'
  const totalVotes = d.options.reduce((s, o) => s + (Array.isArray(o.votes) ? o.votes.length : 0), 0)
  return (
    <Card className={cn(decided && 'border-success/40')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', decided ? 'bg-success/15 text-success' : 'bg-info/15 text-info')}>
              {decided ? <CheckCircle2 className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-semibold text-foreground">{d.title}</div>
              {d.description && <p className="mt-0.5 text-sm text-muted-foreground">{d.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={decided ? 'success' : 'warning'}>{decided ? 'Đã quyết' : 'Đang chờ'}</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} title="Xóa"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {d.options.length === 0 && <p className="text-sm text-muted-foreground">Chưa có phương án.</p>}
          {d.options.map((o) => {
            const votes = Array.isArray(o.votes) ? o.votes : []
            const voted = votes.includes(me)
            const isFinal = decided && d.final_option === o.label
            const pct = totalVotes ? Math.round((votes.length / totalVotes) * 100) : 0
            return (
              <div key={o.id} className={cn('rounded-lg border p-3 transition-colors', isFinal ? 'border-success/50 bg-success/5' : 'border-border bg-secondary/30')}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {isFinal && <Check className="h-4 w-4 text-success" />}
                    {o.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{votes.length} phiếu</span>
                    {!decided && (
                      <>
                        <Button variant={voted ? 'default' : 'secondary'} size="sm" className="h-7" onClick={() => onVote(o)}>
                          <Vote className="h-3.5 w-3.5" /> {voted ? 'Đã chọn' : 'Chọn'}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-success hover:text-success" onClick={() => onDecide(d, o)} title="Chốt phương án này">Chốt</Button>
                      </>
                    )}
                  </div>
                </div>
                {votes.length > 0 && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={cn('h-full rounded-full', isFinal ? 'bg-success' : 'bg-primary')} style={{ width: `${pct}%` }} />
                  </div>
                )}
                {votes.length > 0 && <div className="mt-1.5 text-xs text-muted-foreground">{votes.join(', ')}</div>}
              </div>
            )
          })}
        </div>

        {decided && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-success">Đã chốt: <span className="font-semibold">{d.final_option}</span></span>
            <Button variant="ghost" size="sm" onClick={() => onReopen(d)}>Mở lại</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DecisionFormModal({ open, saving, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [opts, setOpts] = useState(['', ''])
  useEffect(() => {
    if (open) { setTitle(''); setDescription(''); setOpts(['', '']) }
  }, [open])

  const valid = title.trim() && opts.filter((o) => o.trim()).length >= 2
  const setOpt = (i, v) => setOpts((prev) => prev.map((o, idx) => (idx === i ? v : o)))
  const submit = () => {
    if (!valid || saving) return
    onSave({ title: title.trim(), description: description.trim(), optionLabels: opts.map((o) => o.trim()).filter(Boolean) })
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl text-foreground">Tạo quyết định</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Vấn đề cần quyết <span className="text-destructive">*</span></label>
                <Input placeholder="VD: Chọn nhà cung cấp thịt" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mô tả</label>
                <Input placeholder="Mô tả thêm (không bắt buộc)" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Các phương án <span className="text-destructive">*</span> (ít nhất 2)</label>
                <div className="space-y-2">
                  {opts.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input placeholder={`Phương án ${i + 1}`} value={o} onChange={(e) => setOpt(i, e.target.value)} />
                      {opts.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setOpts((prev) => prev.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" className="mt-2" onClick={() => setOpts((prev) => [...prev, ''])}><Plus className="h-3.5 w-3.5" /> Thêm phương án</Button>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
              <Button onClick={submit} disabled={!valid || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Tạo quyết định
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
